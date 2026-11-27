/**
 * PROVENTA — MODULE 4: INSTITUTIONAL INVESTMENT INTELLIGENCE ENGINE
 * Deterministic real-estate investment modeling: Gross/Net Rental Yield,
 * Total Acquisition Cost, Annual Cash Flow, Exact IRR (Newton-Raphson),
 * ROI, Equity Multiple, Break-even Period, Scenarios, Sensitivity Matrix,
 * and 6-Factor Transparent Scorecard.
 */

export interface InvestmentAnalysisInput {
  purchasePriceRupees: number;
  stampDutyPercent: number;        // e.g. 4.9% Gujarat male / 0-3.9% female
  registrationPercent: number;     // e.g. 1.0%
  brokeragePercent: number;        // e.g. 1.0%
  renovationCostRupees: number;
  monthlyRentRupees: number;
  annualMaintenanceRupees: number;
  vacancyRatePercent: number;      // e.g. 8%
  loanToValuePercent: number;      // e.g. 70% (0 for all-cash)
  interestRatePercent: number;     // e.g. 8.75%
  loanTenureYears: number;         // e.g. 20
  holdingPeriodYears: number;      // e.g. 7
  annualAppreciationPercent: number;
  annualRentEscalationPercent?: number;
  scorecardInputs?: {
    locationScore: number;         // 0-100
    liquidityScore: number;        // 0-100
    rentalPotentialScore: number;  // 0-100
    priceCompetitivenessScore: number; // 0-100
    developerRiskScore: number;    // 0-100 (higher = lower risk)
    dataConfidenceScore: number;   // 0-100
  };
}

export interface InvestmentMetrics {
  totalAcquisitionCostRupees: number;
  equityInvestedRupees: number;
  loanAmountRupees: number;
  annualDebtServiceRupees: number;
  grossRentalYieldPercent: number;
  netRentalYieldPercent: number;
  year1NetOperatingIncomeRupees: number;
  year1PreTaxCashFlowRupees: number;
  projectedExitValueRupees: number;
  totalOwnershipCostRupees: number;
  netProfitRupees: number;
  roiPercent: number;
  irrPercent: number;
  equityMultiple: number;
  breakEvenYears: number | null;
  annualisedAppreciationPercent: number;
}

export interface InvestmentAnalysisResult {
  base: InvestmentMetrics;
  scenarios: {
    conservative: InvestmentMetrics;
    base: InvestmentMetrics;
    optimistic: InvestmentMetrics;
  };
  sensitivity: Array<{
    parameter: string;
    deltaLabel: string;
    irrPercent: number;
    netYieldPercent: number;
  }>;
  scorecard: {
    location: number;
    marketLiquidity: number;
    rentalPotential: number;
    priceCompetitiveness: number;
    developerProjectRisk: number;
    dataConfidence: number;
    compositeIndicativeScore: number;
  };
  disclaimer: string;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function calculateAnnualEmi(principal: number, annualRatePct: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  if (annualRatePct <= 0) return principal / years;
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return emi * 12;
}

function remainingLoanBalance(principal: number, annualRatePct: number, totalYears: number, elapsedYears: number): number {
  if (principal <= 0 || elapsedYears >= totalYears) return 0;
  if (annualRatePct <= 0) return principal * (1 - elapsedYears / totalYears);
  const r = annualRatePct / 100 / 12;
  const n = totalYears * 12;
  const p = elapsedYears * 12;
  return principal * ((Math.pow(1 + r, n) - Math.pow(1 + r, p)) / (Math.pow(1 + r, n) - 1));
}

/**
 * Computes exact Internal Rate of Return (IRR) via Newton-Raphson + bisection fallback.
 */
export function computeExactIrrPercent(cashFlows: readonly number[]): number {
  let rate = 0.1;
  for (let i = 0; i < 60; i++) {
    let npv = 0;
    let dNpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const denom = Math.pow(1 + rate, t);
      npv += cashFlows[t] / denom;
      if (t > 0) dNpv -= (t * cashFlows[t]) / (denom * (1 + rate));
    }
    if (Math.abs(npv) < 1e-5) return round2(rate * 100);
    if (Math.abs(dNpv) < 1e-10) break;
    const next = rate - npv / dNpv;
    if (!Number.isFinite(next) || next <= -0.95 || next > 5) break;
    rate = next;
  }

  // Bisection fallback on [-0.5, 2.0]
  let low = -0.5;
  let high = 2.0;
  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    const npv = cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + mid, t), 0);
    if (Math.abs(npv) < 1e-4) return round2(mid * 100);
    if (npv > 0) low = mid;
    else high = mid;
  }
  return round2(((low + high) / 2) * 100);
}

export function computeSingleScenarioMetrics(input: InvestmentAnalysisInput): InvestmentMetrics {
  if (input.purchasePriceRupees <= 0) throw new Error('Purchase price must be greater than zero');
  if (input.holdingPeriodYears < 1) throw new Error('Holding period must be at least 1 year');

  const stampDuty = input.purchasePriceRupees * (input.stampDutyPercent / 100);
  const registration = input.purchasePriceRupees * (input.registrationPercent / 100);
  const brokerage = input.purchasePriceRupees * (input.brokeragePercent / 100);
  const totalAcquisitionCostRupees = Math.round(
    input.purchasePriceRupees + stampDuty + registration + brokerage + input.renovationCostRupees
  );

  const loanAmountRupees = Math.round(input.purchasePriceRupees * (input.loanToValuePercent / 100));
  const equityInvestedRupees = Math.max(1, totalAcquisitionCostRupees - loanAmountRupees);
  const annualDebtServiceRupees = Math.round(
    calculateAnnualEmi(loanAmountRupees, input.interestRatePercent, input.loanTenureYears)
  );

  const grossAnnualRent = input.monthlyRentRupees * 12;
  const effectiveYear1Rent = grossAnnualRent * (1 - input.vacancyRatePercent / 100);
  const year1NetOperatingIncomeRupees = Math.round(effectiveYear1Rent - input.annualMaintenanceRupees);
  const year1PreTaxCashFlowRupees = Math.round(year1NetOperatingIncomeRupees - annualDebtServiceRupees);

  const grossRentalYieldPercent = round2((grossAnnualRent / input.purchasePriceRupees) * 100);
  const netRentalYieldPercent = round2((year1NetOperatingIncomeRupees / totalAcquisitionCostRupees) * 100);

  const rentEscalation = (input.annualRentEscalationPercent ?? 4) / 100;
  const cashFlows: number[] = [-equityInvestedRupees];
  let cumulativeCashIn = 0;
  let totalMaintenance = 0;
  let totalDebtPaid = 0;
  let breakEvenYears: number | null = null;

  for (let yr = 1; yr <= input.holdingPeriodYears; yr++) {
    const yrRent = effectiveYear1Rent * Math.pow(1 + rentEscalation, yr - 1);
    const yrMaint = input.annualMaintenanceRupees * Math.pow(1.04, yr - 1);
    totalMaintenance += yrMaint;
    totalDebtPaid += annualDebtServiceRupees;
    const yrCashFlow = yrRent - yrMaint - annualDebtServiceRupees;

    if (yr < input.holdingPeriodYears) {
      cashFlows.push(yrCashFlow);
      cumulativeCashIn += yrCashFlow;
      if (breakEvenYears === null && cumulativeCashIn >= equityInvestedRupees) {
        breakEvenYears = yr;
      }
    } else {
      const exitValue = input.purchasePriceRupees * Math.pow(1 + input.annualAppreciationPercent / 100, yr);
      const loanPayoff = remainingLoanBalance(loanAmountRupees, input.interestRatePercent, input.loanTenureYears, yr);
      const terminalCash = yrCashFlow + (exitValue - loanPayoff);
      cashFlows.push(terminalCash);
      cumulativeCashIn += terminalCash;
      if (breakEvenYears === null && cumulativeCashIn >= equityInvestedRupees) {
        breakEvenYears = yr;
      }
    }
  }

  const projectedExitValueRupees = Math.round(
    input.purchasePriceRupees * Math.pow(1 + input.annualAppreciationPercent / 100, input.holdingPeriodYears)
  );
  const totalOwnershipCostRupees = Math.round(totalAcquisitionCostRupees + totalMaintenance + totalDebtPaid);
  const netProfitRupees = Math.round(cumulativeCashIn - equityInvestedRupees);
  const roiPercent = round2((netProfitRupees / equityInvestedRupees) * 100);
  const equityMultiple = round2(cumulativeCashIn / equityInvestedRupees);
  const irrPercent = computeExactIrrPercent(cashFlows);

  return {
    totalAcquisitionCostRupees,
    equityInvestedRupees,
    loanAmountRupees,
    annualDebtServiceRupees,
    grossRentalYieldPercent,
    netRentalYieldPercent,
    year1NetOperatingIncomeRupees,
    year1PreTaxCashFlowRupees,
    projectedExitValueRupees,
    totalOwnershipCostRupees,
    netProfitRupees,
    roiPercent,
    irrPercent,
    equityMultiple,
    breakEvenYears,
    annualisedAppreciationPercent: round2(input.annualAppreciationPercent),
  };
}

export function runFullInvestmentAnalysis(input: InvestmentAnalysisInput): InvestmentAnalysisResult {
  const base = computeSingleScenarioMetrics(input);
  const conservative = computeSingleScenarioMetrics({
    ...input,
    annualAppreciationPercent: Math.max(0, input.annualAppreciationPercent - 2.5),
    vacancyRatePercent: Math.min(30, input.vacancyRatePercent + 5),
    interestRatePercent: input.interestRatePercent + 0.75,
  });
  const optimistic = computeSingleScenarioMetrics({
    ...input,
    annualAppreciationPercent: input.annualAppreciationPercent + 2.0,
    vacancyRatePercent: Math.max(2, input.vacancyRatePercent - 3),
  });

  const sensitivityCases: Array<{ parameter: string; deltaLabel: string; mod: Partial<InvestmentAnalysisInput> }> = [
    { parameter: 'Purchase Price', deltaLabel: '+10% Price', mod: { purchasePriceRupees: input.purchasePriceRupees * 1.1 } },
    { parameter: 'Purchase Price', deltaLabel: '-10% Price', mod: { purchasePriceRupees: input.purchasePriceRupees * 0.9 } },
    { parameter: 'Rental Income', deltaLabel: '-15% Rent', mod: { monthlyRentRupees: input.monthlyRentRupees * 0.85 } },
    { parameter: 'Interest Rate', deltaLabel: '+1.5% Rate', mod: { interestRatePercent: input.interestRatePercent + 1.5 } },
    { parameter: 'Vacancy', deltaLabel: '+10% Vacancy', mod: { vacancyRatePercent: Math.min(40, input.vacancyRatePercent + 10) } },
    { parameter: 'Holding Period', deltaLabel: '+3 Years Hold', mod: { holdingPeriodYears: input.holdingPeriodYears + 3 } },
  ];

  const sensitivity = sensitivityCases.map((c) => {
    const m = computeSingleScenarioMetrics({ ...input, ...c.mod });
    return {
      parameter: c.parameter,
      deltaLabel: c.deltaLabel,
      irrPercent: m.irrPercent,
      netYieldPercent: m.netRentalYieldPercent,
    };
  });

  const sc = input.scorecardInputs ?? {
    locationScore: 72,
    liquidityScore: 68,
    rentalPotentialScore: Math.min(95, Math.round(base.grossRentalYieldPercent * 18)),
    priceCompetitivenessScore: 70,
    developerRiskScore: 75,
    dataConfidenceScore: 65,
  };

  const compositeIndicativeScore = round2(
    sc.locationScore * 0.25 +
      sc.liquidityScore * 0.15 +
      sc.rentalPotentialScore * 0.15 +
      sc.priceCompetitivenessScore * 0.2 +
      sc.developerRiskScore * 0.15 +
      sc.dataConfidenceScore * 0.1
  );

  return {
    base,
    scenarios: { conservative, base, optimistic },
    sensitivity,
    scorecard: {
      location: sc.locationScore,
      marketLiquidity: sc.liquidityScore,
      rentalPotential: sc.rentalPotentialScore,
      priceCompetitiveness: sc.priceCompetitivenessScore,
      developerProjectRisk: sc.developerRiskScore,
      dataConfidence: sc.dataConfidenceScore,
      compositeIndicativeScore,
    },
    disclaimer:
      'Indicative mathematical model only. Does not constitute personalised financial advice, tax advice, or guaranteed investment performance. Actual returns depend on market liquidity, statutory charges, and verified transaction execution.',
  };
}
