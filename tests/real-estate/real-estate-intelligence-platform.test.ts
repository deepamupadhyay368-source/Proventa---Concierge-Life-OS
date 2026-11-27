import { describe, expect, it } from 'vitest';
import {
  detectDuplicateRegistryProperty,
  formatHierarchyBreadcrumbs,
  generateProventaPropertyId,
  normalizePropertyAddressKey,
} from '@/lib/real-estate-intelligence/registry-service';
import {
  AHMEDABAD_GANDHINAGAR_LOCALITIES,
  compareProjectsSideBySide,
  computeLocalityMarketBenchmark,
} from '@/lib/real-estate-intelligence/market-engine';
import {
  computeExactIrrPercent,
  runFullInvestmentAnalysis,
} from '@/lib/real-estate-intelligence/investment-engine';
import { computeOwnerPortfolioSummary } from '@/lib/real-estate-intelligence/property-os-service';
import {
  buildRealEstateReport,
  type RealEstateReportType,
} from '@/lib/real-estate-intelligence/report-generator';

describe('PROVENTA Real Estate Intelligence Platform — Core Engines', () => {
  it('Module 1: generates unique permanent PV-PROP IDs, detects duplicates, and formats 5-level hierarchy', () => {
    const id1 = generateProventaPropertyId('Ahmedabad');
    const id2 = generateProventaPropertyId('Ahmedabad');
    expect(id1).toMatch(/^PV-PROP-AHM-\d{4}-[A-F0-9]{6}$/);
    expect(id1).not.toBe(id2);

    const key = normalizePropertyAddressKey({
      city: 'Ahmedabad',
      locality: 'South Bopal',
      buildingName: 'Tower B',
      unitNumber: '904',
      address: 'FP 42, South Bopal Main Road',
    });

    const dupExact = detectDuplicateRegistryProperty(
      { normalizedAddressKey: key, reraNumber: 'PR/GJ/AHM/001', unitNumber: '904' },
      [
        {
          id: 'p1',
          proventaPropertyId: id1,
          title: 'Existing Apt',
          normalizedAddressKey: key,
          reraNumber: 'PR/GJ/AHM/001',
        },
      ]
    );
    expect(dupExact.isDuplicate).toBe(true);
    expect(dupExact.matchedPropertyId).toBe(id1);

    const breadcrumbs = formatHierarchyBreadcrumbs({
      landParcelCode: 'TP-02/FP-42',
      projectSlug: 'sun-skyview',
      buildingName: 'Tower B',
      unitNumber: '904',
      proventaPropertyId: id1,
    });
    expect(breadcrumbs).toEqual([
      'Land: TP-02/FP-42',
      'Project: sun-skyview',
      'Building: Tower B',
      'Unit: 904',
      `Property: ${id1}`,
    ]);
  });

  it('Modules 2, 3 & 5: covers all 13 Ahmedabad/Gandhinagar corridors, enforces >=3 observation threshold, and compares projects', () => {
    expect(AHMEDABAD_GANDHINAGAR_LOCALITIES).toHaveLength(13);
    const names = AHMEDABAD_GANDHINAGAR_LOCALITIES.map((l) => l.name);
    expect(names).toContain('Bopal');
    expect(names).toContain('Sanand');
    expect(names).toContain('Changodar');
    expect(names).toContain('GIFT City');

    // Fewer than 3 verified/sourced observations MUST return INSUFFICIENT_DATA
    const insufficient = computeLocalityMarketBenchmark('Bopal', 'RESIDENTIAL', [
      {
        locality: 'Bopal',
        segment: 'RESIDENTIAL',
        propertyType: 'APARTMENT',
        pricePerSqFtPaise: BigInt(620000),
        rentalYieldPct: 3.1,
        transactionCount: 5,
        reportingPeriod: '2026-Q4',
        observationDate: new Date('2026-10-01'),
        dataSource: 'Gujarat Sub-Registrar',
        methodology: 'Median registered carpet rate',
        verificationStatus: 'VERIFIED',
      },
      {
        locality: 'Bopal',
        segment: 'RESIDENTIAL',
        propertyType: 'APARTMENT',
        pricePerSqFtPaise: BigInt(640000),
        rentalYieldPct: 3.3,
        transactionCount: 4,
        reportingPeriod: '2026-Q4',
        observationDate: new Date('2026-10-15'),
        dataSource: 'User Submission',
        methodology: 'Unverified',
        verificationStatus: 'USER_SUBMITTED', // Should be excluded!
      },
    ]);
    expect(insufficient.status).toBe('INSUFFICIENT_DATA');
    expect(insufficient.medianPriceSqFtPaise).toBeNull();

    // 3 qualifying observations produce RELIABLE median benchmark
    const reliable = computeLocalityMarketBenchmark('Bopal', 'RESIDENTIAL', [
      {
        locality: 'Bopal',
        segment: 'RESIDENTIAL',
        propertyType: 'APARTMENT',
        pricePerSqFtPaise: BigInt(600000),
        rentalYieldPct: 3.0,
        transactionCount: 3,
        reportingPeriod: '2026-Q3',
        observationDate: new Date('2026-09-01'),
        dataSource: 'Gujarat Sub-Registrar',
        methodology: 'Median registered carpet rate',
        verificationStatus: 'VERIFIED',
      },
      {
        locality: 'Bopal',
        segment: 'RESIDENTIAL',
        propertyType: 'APARTMENT',
        pricePerSqFtPaise: BigInt(640000),
        rentalYieldPct: 3.4,
        transactionCount: 4,
        reportingPeriod: '2026-Q4',
        observationDate: new Date('2026-10-15'),
        dataSource: 'Gujarat RERA Filing',
        methodology: 'Verified carpet rate',
        verificationStatus: 'EXTERNALLY_SOURCED',
      },
      {
        locality: 'Bopal',
        segment: 'RESIDENTIAL',
        propertyType: 'APARTMENT',
        pricePerSqFtPaise: BigInt(680000),
        rentalYieldPct: 3.2,
        transactionCount: 2,
        reportingPeriod: '2026-Q4',
        observationDate: new Date('2026-11-01'),
        dataSource: 'Gujarat Sub-Registrar',
        methodology: 'Median registered carpet rate',
        verificationStatus: 'VERIFIED',
      },
    ]);
    expect(reliable.status).toBe('RELIABLE');
    expect(reliable.medianPriceSqFtPaise).toBe(BigInt(640000));
    expect(reliable.averageRentalYieldPct).toBe(3.2);

    const comparison = compareProjectsSideBySide([
      {
        slug: 'project-a',
        name: 'Project Alpha',
        developerName: 'Dev A',
        locality: 'Thaltej',
        reraNumber: 'PR/GJ/AHM/101',
        constructionStatus: 'READY_TO_MOVE',
        pricePerSqFtRupees: 7800,
        amenitiesCount: 12,
        verificationStatus: 'VERIFIED',
      },
      {
        slug: 'project-b',
        name: 'Project Beta',
        developerName: 'Dev B',
        locality: 'Bopal',
        reraNumber: null,
        constructionStatus: 'UNDER_CONSTRUCTION',
        pricePerSqFtRupees: 6400,
        amenitiesCount: 8,
        verificationStatus: 'UNVERIFIED',
      },
    ]);
    expect(comparison.lowestPricePerSqFtSlug).toBe('project-b');
    expect(comparison.projects[1].riskIndicators.length).toBeGreaterThanOrEqual(2);
  });

  it('Module 4: computes exact IRR, ordered scenarios, 6-parameter sensitivity, scorecard, and disclaimer', () => {
    // Classic 10% IRR test: -1000 at t=0, +1100 at t=1 => 10%
    expect(computeExactIrrPercent([-1000, 1100])).toBeCloseTo(10, 1);

    const res = runFullInvestmentAnalysis({
      purchasePriceRupees: 10_000_000,
      stampDutyPercent: 4.9,
      registrationPercent: 1.0,
      brokeragePercent: 1.0,
      renovationCostRupees: 300_000,
      monthlyRentRupees: 38_000,
      annualMaintenanceRupees: 40_000,
      vacancyRatePercent: 8,
      loanToValuePercent: 70,
      interestRatePercent: 8.75,
      loanTenureYears: 20,
      holdingPeriodYears: 7,
      annualAppreciationPercent: 8,
    });

    expect(res.base.totalAcquisitionCostRupees).toBe(10_990_000);
    expect(res.scenarios.conservative.irrPercent).toBeLessThan(res.scenarios.base.irrPercent);
    expect(res.scenarios.base.irrPercent).toBeLessThan(res.scenarios.optimistic.irrPercent);
    expect(res.sensitivity.length).toBe(6);
    expect(res.scorecard.compositeIndicativeScore).toBeGreaterThan(0);
    expect(res.disclaimer).toMatch(/NOT constitute/i);
  });

  it('Module 6: computes private owner portfolio KPIs and 60-day lease expiry / maintenance alerts', () => {
    const now = new Date('2026-11-27T00:00:00Z');
    const summary = computeOwnerPortfolioSummary(
      [
        {
          id: 'pass-1',
          ownerUserId: 'user-a',
          purchasePricePaise: BigInt(100_000_0000), // 1 Cr
          currentEstimatedPaise: BigInt(120_000_0000), // 1.2 Cr (+20%)
          occupancyStatus: 'RENTED',
          expenses: [{ amountPaise: BigInt(60_000_00), expenseDate: new Date('2026-08-01') }],
          leases: [
            {
              monthlyRentPaise: BigInt(40_000_00),
              leaseEndDate: new Date('2026-12-20T00:00:00Z'), // Within 60 days!
              status: 'ACTIVE',
              tenantName: 'Aarav Patel',
            },
          ],
          maintenanceRecords: [
            {
              costPaise: BigInt(15_000_00),
              status: 'OPEN',
              title: 'Terrace waterproofing inspection',
              scheduledDate: new Date('2026-12-10T00:00:00Z'),
            },
          ],
        },
      ],
      now
    );

    expect(summary.totalProperties).toBe(1);
    expect(summary.appreciationPercent).toBe(20);
    expect(summary.upcomingAlerts.map((a) => a.type)).toEqual(['LEASE_EXPIRY', 'MAINTENANCE_DUE']);
    expect(summary.privacyNotice).toMatch(/strictly owner-isolated/i);
  });

  it('Module 7: builds all 7 institutional report types with mandatory non-certified disclaimer', () => {
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
      const report = buildRealEstateReport({
        reportType,
        subjectTitle: `Test ${reportType}`,
        metrics: { sample: 1 },
        methodology: 'Deterministic PROVENTA methodology',
        dataSources: ['Gujarat RERA'],
        confidenceLevel: 'MODERATE',
      });
      expect(report.reportReference).toMatch(/^PV-RPT-\d{4}-[A-Z0-9]+$/);
      expect(report.nonCertifiedDisclaimer).toMatch(/do NOT constitute a statutory certified valuation/i);
    }
  });
});
