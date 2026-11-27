import { describe, expect, it } from 'vitest';
import {
  computeExactIrrDetailed,
  computeSingleScenarioMetrics,
  runFullInvestmentAnalysis,
} from '@/lib/real-estate-intelligence/investment-engine';
import { computeLocalityMarketBenchmark } from '@/lib/real-estate-intelligence/market-engine';
import {
  buildRealEstateReport,
  type RealEstateReportType,
} from '@/lib/real-estate-intelligence/report-generator';
import { renderIntelligenceReportPdf } from '@/lib/real-estate-intelligence/pdf-builder';
import { checkRateLimit } from '@/lib/real-estate-intelligence/rate-limit';
import { REAL_ESTATE_PLAN_LIMITS } from '@/lib/real-estate-intelligence/entitlements';

describe('PROVENTA Phase 8.6 — Independent Reference Mathematics, PDF, Provenance & Rate-Limit Verification', () => {
  it('CRIT-03A: exact IRR reference cases (positive, negative, severe loss -90%, zero, undefined, multiple IRRs)', () => {
    // 1. Positive IRR: -1000 -> +1100 => exactly 10%
    const pos1 = computeExactIrrDetailed([-1000, 1100]);
    expect(pos1.status).toBe('CONVERGED');
    expect(pos1.irrPercent).toBe(10);

    // 2. Multi-period positive IRR: -1000, 0, +1210 => exactly 10%
    const pos2 = computeExactIrrDetailed([-1000, 0, 1210]);
    expect(pos2.status).toBe('CONVERGED');
    expect(pos2.irrPercent).toBe(10);

    // 3. Moderate negative IRR: -1000 -> +900 => exactly -10%
    const neg1 = computeExactIrrDetailed([-1000, 900]);
    expect(neg1.status).toBe('CONVERGED');
    expect(neg1.irrPercent).toBe(-10);

    // 4. Severe loss: -1000 -> +100 => exactly -90% (MUST NOT clamp to -50%!)
    const severe = computeExactIrrDetailed([-1000, 100]);
    expect(severe.status).toBe('CONVERGED');
    expect(severe.irrPercent).toBe(-90);

    // 5. Zero return: -1000 -> +1000 => exactly +0 (not -0)
    const zero = computeExactIrrDetailed([-1000, 1000]);
    expect(zero.status).toBe('CONVERGED');
    expect(Object.is(zero.irrPercent, 0)).toBe(true);

    // 6. All-negative cash flows => UNDEFINED (null, never fabricated -50%)
    const allNeg = computeExactIrrDetailed([-1000, -100, -100, -100]);
    expect(allNeg.status).toBe('UNDEFINED_NO_SIGN_CHANGE');
    expect(allNeg.irrPercent).toBeNull();

    // 7. All-positive cash flows => UNDEFINED (null, never fabricated +200%)
    const allPos = computeExactIrrDetailed([1000, 100, 100]);
    expect(allPos.status).toBe('UNDEFINED_NO_SIGN_CHANGE');
    expect(allPos.irrPercent).toBeNull();

    // 8. Multiple IRRs: [-100, +230, -132] has exact roots at 10% and 20%
    const multi = computeExactIrrDetailed([-100, 230, -132]);
    expect(multi.status).toBe('MULTIPLE_IRRS_DETECTED');
    expect(multi.signChanges).toBe(2);
    expect(multi.warning).toMatch(/multiple IRR/i);
    expect(multi.mirrPercent).not.toBeNull();
  });

  it('CRIT-03B & C: loan tenure < holding period stops debt payments at maturity & eliminates principal double-counting', () => {
    const m = computeSingleScenarioMetrics({
      purchasePriceRupees: 10_000_000,
      stampDutyPercent: 4.9,
      registrationPercent: 1.0,
      brokeragePercent: 1.0,
      renovationCostRupees: 0,
      monthlyRentRupees: 40_000,
      annualMaintenanceRupees: 30_000,
      vacancyRatePercent: 5,
      loanToValuePercent: 70, // 70L loan
      interestRatePercent: 9,
      loanTenureYears: 5, // Paid off completely by Year 5
      holdingPeriodYears: 10, // Held for 10 years
      annualAppreciationPercent: 7,
    });

    // Loan MUST be fully repaid at exit (Year 10 > 5Y tenure)
    expect(m.remainingLoanBalanceAtExitRupees).toBe(0);
    expect(m.principalRepaidDuringHoldRupees).toBeCloseTo(7_000_000, -2);
    // Economic ownership cost MUST equal totalAcquisition + operatingCosts + interestPaid (NO principal double-count!)
    expect(m.totalOwnershipCostRupees).toBeCloseTo(
      m.totalAcquisitionCostRupees + m.operatingCostsDuringHoldRupees + m.financingInterestPaidRupees,
      -1
    );

    // Zero-debt scenario: zero interest and zero principal
    const allCash = computeSingleScenarioMetrics({
      purchasePriceRupees: 10_000_000,
      stampDutyPercent: 4.9,
      registrationPercent: 1.0,
      brokeragePercent: 1.0,
      renovationCostRupees: 0,
      monthlyRentRupees: 40_000,
      annualMaintenanceRupees: 30_000,
      vacancyRatePercent: 5,
      loanToValuePercent: 0,
      interestRatePercent: 0,
      loanTenureYears: 1,
      holdingPeriodYears: 5,
      annualAppreciationPercent: 6,
    });
    expect(allCash.loanAmountRupees).toBe(0);
    expect(allCash.financingInterestPaidRupees).toBe(0);
    expect(allCash.principalRepaidDuringHoldRupees).toBe(0);

    // Invalid inputs throw
    expect(() =>
      computeSingleScenarioMetrics({
        purchasePriceRupees: 0,
        stampDutyPercent: 5,
        registrationPercent: 1,
        brokeragePercent: 1,
        renovationCostRupees: 0,
        monthlyRentRupees: 10_000,
        annualMaintenanceRupees: 0,
        vacancyRatePercent: 5,
        loanToValuePercent: 0,
        interestRatePercent: 0,
        loanTenureYears: 1,
        holdingPeriodYears: 5,
        annualAppreciationPercent: 5,
      })
    ).toThrow();
  });

  it('CRIT-03D: omits hardcoded scorecard defaults when qualitative inputs are not supplied', () => {
    const res = runFullInvestmentAnalysis({
      purchasePriceRupees: 10_000_000,
      stampDutyPercent: 4.9,
      registrationPercent: 1.0,
      brokeragePercent: 1.0,
      renovationCostRupees: 0,
      monthlyRentRupees: 0,
      annualMaintenanceRupees: 50_000,
      vacancyRatePercent: 100,
      loanToValuePercent: 0,
      interestRatePercent: 0,
      loanTenureYears: 1,
      holdingPeriodYears: 5,
      annualAppreciationPercent: 0,
    });
    expect(res.scorecard.status).toBe('INSUFFICIENT_DATA');
    expect(res.scorecard.location).toBeNull();
    expect(res.scorecard.marketLiquidity).toBeNull();
    expect(res.scorecard.priceCompetitiveness).toBeNull();
    expect(res.scorecard.developerProjectRisk).toBeNull();
    expect(res.scorecard.dataConfidence).toBeNull();
    expect(res.scorecard.compositeIndicativeScore).toBeNull();
  });

  it('CRIT-04: renders genuine %PDF-1.4 binaries with SHA-256 and disclaimers for all 7 report types', () => {
    const types: RealEstateReportType[] = [
      'PROPERTY_INTELLIGENCE',
      'PROJECT_INTELLIGENCE',
      'LOCALITY_INTELLIGENCE',
      'INVESTMENT_FEASIBILITY',
      'PROPERTY_VALUATION',
      'PORTFOLIO_PERFORMANCE',
      'MARKET_COMPARISON',
    ];

    for (const reportType of types) {
      const structured = buildRealEstateReport({
        reportType,
        subjectTitle: `Audit Test ${reportType}`,
        metrics: { medianRateInrSqFt: 6500, observations: 5 },
        methodology: 'Server-side PostgreSQL deterministic calculation',
        dataSources: ['PROVENTA Market Observations Database'],
        confidenceLevel: 'MODERATE',
      });
      const { pdfBuffer, sha256, pageCount } = renderIntelligenceReportPdf(structured);
      const pdfText = pdfBuffer.toString('latin1');
      expect(pdfText.startsWith('%PDF-1.4')).toBe(true);
      expect(pdfText.trimEnd().endsWith('%%EOF')).toBe(true);
      expect(sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(pageCount).toBeGreaterThanOrEqual(1);
      expect(pdfText).toContain(structured.reportReference);
      expect(pdfText).toContain('statutory certified valuation');
    }
  });

  it('CRIT-02: excludes SYNTHETIC_TEST_DATA and USER_SUBMITTED from market benchmarks while honoring ADMIN_SUBMITTED', () => {
    const benchmarkExcluded = computeLocalityMarketBenchmark('Bopal', 'RESIDENTIAL', [
      {
        locality: 'Bopal',
        segment: 'RESIDENTIAL',
        propertyType: 'APARTMENT',
        pricePerSqFtPaise: BigInt(999900),
        transactionCount: 10,
        reportingPeriod: '2026-Q4',
        observationDate: new Date(),
        dataSource: 'Synthetic',
        methodology: 'Test',
        verificationStatus: 'SYNTHETIC_TEST_DATA',
      },
      {
        locality: 'Bopal',
        segment: 'RESIDENTIAL',
        propertyType: 'APARTMENT',
        pricePerSqFtPaise: BigInt(999900),
        transactionCount: 10,
        reportingPeriod: '2026-Q4',
        observationDate: new Date(),
        dataSource: 'User',
        methodology: 'Test',
        verificationStatus: 'USER_SUBMITTED',
      },
      {
        locality: 'Bopal',
        segment: 'RESIDENTIAL',
        propertyType: 'APARTMENT',
        pricePerSqFtPaise: BigInt(999900),
        transactionCount: 10,
        reportingPeriod: '2026-Q4',
        observationDate: new Date(),
        dataSource: 'Unverified',
        methodology: 'Test',
        verificationStatus: 'UNVERIFIED',
      },
    ]);
    expect(benchmarkExcluded.status).toBe('INSUFFICIENT_DATA');
    expect(benchmarkExcluded.observationCount).toBe(0);
  });

  it('Rate limiter and centralised entitlement plan definitions enforce strict limits', () => {
    const key = `test-rl-${Date.now()}`;
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(false);

    expect(REAL_ESTATE_PLAN_LIMITS.FREE.maxPropertyPassports).toBe(3);
    expect(REAL_ESTATE_PLAN_LIMITS.FREE.maxMonthlyPdfReports).toBe(2);
    expect(REAL_ESTATE_PLAN_LIMITS.PROFESSIONAL.apiAccessEnabled).toBe(true);
  });
});
