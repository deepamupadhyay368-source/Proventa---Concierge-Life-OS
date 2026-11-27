/**
 * PROVENTA — MODULE 4: INSTITUTIONAL INVESTMENT INTELLIGENCE ENGINE (Phase 8.6 Hardened)
 * Deterministic real-estate financial model:
 * - Exact IRR with sign-change detection, full (-99.9%, +1000%) bracket search,
 *   convergence validation, and MIRR fallback for multiple-IRR cash flows.
 * - Exact monthly loan amortisation (zero debt service after loan maturity).
 * - Zero principal double-counting in economic ownership cost breakdown.
 * - Zero hardcoded scorecard defaults: missing qualitative inputs return INSUFFICIENT_DATA.
 */

export interface InvestmentAnalysisInput {
  purchasePriceRupees: number;
  stampDutyPercent: number;
  registrationPercent: number;
  brokeragePercent: number;
  renovationCostRupees: number;
  monthlyRentRupees: number;
  annualMaintenanceRupees: number;
  annualPropertyTaxRupees?: number;
  vacancyRatePercent: number;
  loanToValuePercent: number;
  interestRatePercent: number;
  loanTenureYears: number;
  holdingPeriodYears: number;
  annualAppreciationPercent: number;
  annualRentEscalationPercent?: number;
  scorecardInputs?: {
    locationScore: number;
    liquidityScore: number;
    rentalPotentialScore: number;
    priceCompetitivenessScore: number;
    developerRiskScore: number;
    dataConfidenceScore: number;
  };
}

export type IrrCalculationStatus =
  | 'CONVERGED'
  | 'MULTIPLE_IRRS_DETECTED'
  | 'UNDEFINED_NO_SIGN_CHANGE'
  | 'CONVERGENCE_FAILED';

export interface IrrCalculationResult {
  irrPercent: number | null;
  mirrPercent: number | null;
  status: IrrCalculationStatus;
  signChanges: number;
  warning: string | null;
}

export interface InvestmentMetrics {
  acquisitionPriceRupees: number;
  transactionCostsRupees: number;
  totalAcquisitionCostRupees: number;
  equityInvestedRupees: number;
  totalEquityContributedRupees: number;
  loanAmountRupees: number;
  annualDebtServiceRupees: number;
  financingInterestPaidRupees: number;
  principalRepaidDuringHoldRupees: number;
  remainingLoanBalanceAtExitRupees: number;
  operatingCostsDuringHoldRupees: number;
  grossRentalIncomeDuringHoldRupees: number;
  grossRentalYieldPercent: number;
  netRentalYieldPercent: number;
  year1NetOperatingIncomeRupees: number;
  year1PreTaxCashFlowRupees: number;
  projectedExitValueRupees: number;
  netExitProceedsRupees: number;
  /** True economic outlay: totalAcquisitionCost + operatingCosts + financingInterestPaid (NO principal double-counting). */
  totalOwnershipCostRupees: number;
  netProfitRupees: number;
  roiPercent: number;
  irrPercent: number | null;
  mirrPercent: number | null;
  irrStatus: IrrCalculationStatus;
  irrWarning: string | null;
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
    irrPercent: number | null;
    irrStatus: IrrCalculationStatus;
    netYieldPercent: number;
  }>;
  scorecard: {
    status: 'COMPUTED' | 'INSUFFICIENT_DATA';
    location: number | null;
    marketLiquidity: number | null;
    rentalPotential: number;
    priceCompetitiveness: number | null;
    developerProjectRisk: number | null;
    dataConfidence: number | null;
    compositeIndicativeScore: number | null;
    note: string;
  };
  disclaimer: string;
}

function round2(n: number): number {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
}

function countSignChanges(cashFlows: readonly number[]): number {
  let prevSign = 0;
  let changes = 0;
  for (const cf of cashFlows) {
    const sign = cf > 1e-9 ? 1 : cf < -1e-9 ? -1 : 0;
    if (sign === 0) continue;
    if (prevSign !== 0 && sign !== prevSign) changes++;
    prevSign = sign;
  }
  return changes;
}

function npvAtRate(cashFlows: readonly number[], rate: number): number {
  let sum = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    sum += cashFlows[t] / Math.pow(1 + rate, t);
  }
  return sum;
}

/**
 * Computes Modified IRR (MIRR) for cash flows with multiple sign changes.
 */
export function computeMirrPercent(
  cashFlows: readonly number[],
  financeRate = 0.085,
  reinvestRate = 0.07
): number | null {
  const n = cashFlows.length - 1;
  if (n < 1) return null;
  let pvNeg = 0;
  let fvPos = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    if (cashFlows[t] < 0) {
      pvNeg += -cashFlows[t] / Math.pow(1 + financeRate, t);
    } else if (cashFlows[t] > 0) {
      fvPos += cashFlows[t] * Math.pow(1 + reinvestRate, n - t);
    }
  }
  if (pvNeg <= 0 || fvPos <= 0) return null;
  const mirr = Math.pow(fvPos / pvNeg, 1 / n) - 1;
  return Number.isFinite(mirr) ? round2(mirr * 100) : null;
}

/**
 * Computes exact IRR with strict mathematical safeguards:
 * - Rejects all-negative or all-positive cash flows (returns null + UNDEFINED_NO_SIGN_CHANGE).
 * - Detects multiple sign changes (>1) and reports MULTIPLE_IRRS_DETECTED + MIRR.
 * - Searches full valid domain (-0.999, +10.0) without arbitrary -50% clamping.
 * - Validates convergence (|NPV| relative tolerance) before returning any number.
 */
export function computeExactIrrDetailed(cashFlows: readonly number[]): IrrCalculationResult {
  if (cashFlows.length < 2 || cashFlows.some((c) => !Number.isFinite(c))) {
    return {
      irrPercent: null,
      mirrPercent: null,
      status: 'CONVERGENCE_FAILED',
      signChanges: 0,
      warning: 'Invalid or insufficient cash-flow series.',
    };
  }

  const signChanges = countSignChanges(cashFlows);
  if (signChanges === 0) {
    return {
      irrPercent: null,
      mirrPercent: null,
      status: 'UNDEFINED_NO_SIGN_CHANGE',
      signChanges: 0,
      warning: 'IRR is mathematically undefined because cash flows never change sign.',
    };
  }

  const scale = Math.max(1, ...cashFlows.map((c) => Math.abs(c)));
  const tol = scale * 1e-7;
  const mirrPercent = computeMirrPercent(cashFlows);

  // 1. Try Newton-Raphson from multiple starting points
  let convergedRate: number | null = null;
  for (const start of [0.1, 0.0, -0.2, 0.3, -0.7]) {
    let rate = start;
    for (let i = 0; i < 80; i++) {
      let npv = 0;
      let dNpv = 0;
      for (let t = 0; t < cashFlows.length; t++) {
        const denom = Math.pow(1 + rate, t);
        npv += cashFlows[t] / denom;
        if (t > 0) dNpv -= (t * cashFlows[t]) / (denom * (1 + rate));
      }
      if (Math.abs(npv) <= tol) {
        convergedRate = rate;
        break;
      }
      if (Math.abs(dNpv) < 1e-12) break;
      const next = rate - npv / dNpv;
      if (!Number.isFinite(next) || next <= -0.9995 || next > 10) break;
      rate = next;
    }
    if (convergedRate !== null) break;
  }

  // 2. Bracketed bisection fallback across (-0.999, 10.0)
  if (convergedRate === null) {
    const grid = [-0.999, -0.95, -0.8, -0.5, -0.2, 0, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0];
    let bracket: [number, number] | null = null;
    for (let i = 0; i < grid.length - 1; i++) {
      const a = grid[i];
      const b = grid[i + 1];
      const fa = npvAtRate(cashFlows, a);
      const fb = npvAtRate(cashFlows, b);
      if (Math.abs(fa) <= tol) {
        convergedRate = a;
        break;
      }
      if (Number.isFinite(fa) && Number.isFinite(fb) && fa * fb <= 0) {
        bracket = [a, b];
        break;
      }
    }

    if (convergedRate === null && bracket) {
      let [low, high] = bracket;
      let fLow = npvAtRate(cashFlows, low);
      for (let i = 0; i < 100; i++) {
        const mid = (low + high) / 2;
        const fMid = npvAtRate(cashFlows, mid);
        if (Math.abs(fMid) <= tol || Math.abs(high - low) < 1e-10) {
          if (Math.abs(fMid) <= scale * 1e-4) {
            convergedRate = mid;
          }
          break;
        }
        if (fLow * fMid <= 0) {
          high = mid;
        } else {
          low = mid;
          fLow = fMid;
        }
      }
    }
  }

  if (convergedRate === null) {
    return {
      irrPercent: null,
      mirrPercent,
      status: 'CONVERGENCE_FAILED',
      signChanges,
      warning: 'No real IRR root converged within (-99.9%, +1000%).',
    };
  }

  if (signChanges > 1) {
    return {
      irrPercent: round2(convergedRate * 100),
      mirrPercent,
      status: 'MULTIPLE_IRRS_DETECTED',
      signChanges,
      warning: `Cash-flow series has ${signChanges} sign changes (multiple IRR solutions possible). Use MIRR (${mirrPercent ?? 'N/A'}%) for capital allocation decisions.`,
    };
  }

  return {
    irrPercent: round2(convergedRate * 100),
    mirrPercent,
    status: 'CONVERGED',
    signChanges,
    warning: null,
  };
}

/** Backwards-compatible helper returning exact IRR percent or null when undefined. */
export function computeExactIrrPercent(cashFlows: readonly number[]): number | null {
  return computeExactIrrDetailed(cashFlows).irrPercent;
}

interface YearlyAmortisation {
  annualPayment: number;
  interestPaid: number;
  principalPaid: number;
  endingBalance: number;
}

/**
 * Exact monthly loan amortisation schedule grouped by year.
 * Strictly stops charging payments once yr > loanTenureYears.
 */
function buildAmortisationByYear(
  principal: number,
  annualRatePct: number,
  loanTenureYears: number,
  holdingPeriodYears: number
): { annualScheduledEmi: number; schedule: YearlyAmortisation[] } {
  if (principal <= 0 || loanTenureYears <= 0) {
    return {
      annualScheduledEmi: 0,
      schedule: Array.from({ length: holdingPeriodYears }, () => ({
        annualPayment: 0,
        interestPaid: 0,
        principalPaid: 0,
        endingBalance: 0,
      })),
    };
  }

  const totalMonths = loanTenureYears * 12;
  const monthlyRate = annualRatePct / 100 / 12;
  const monthlyEmi =
    monthlyRate <= 0
      ? principal / totalMonths
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);

  let balance = principal;
  const schedule: YearlyAmortisation[] = [];

  for (let yr = 1; yr <= holdingPeriodYears; yr++) {
    let yrPayment = 0;
    let yrInterest = 0;
    let yrPrincipal = 0;

    if (yr <= loanTenureYears && balance > 1e-6) {
      for (let m = 0; m < 12; m++) {
        if (balance <= 1e-6) break;
        const interest = balance * monthlyRate;
        const princ = Math.min(balance, monthlyEmi - interest);
        const payment = interest + princ;
        balance = Math.max(0, balance - princ);
        yrPayment += payment;
        yrInterest += interest;
        yrPrincipal += princ;
      }
    }

    schedule.push({
      annualPayment: yrPayment,
      interestPaid: yrInterest,
      principalPaid: yrPrincipal,
      endingBalance: balance,
    });
  }

  return {
    annualScheduledEmi: monthlyEmi * 12,
    schedule,
  };
}

export function computeSingleScenarioMetrics(input: InvestmentAnalysisInput): InvestmentMetrics {
  if (!Number.isFinite(input.purchasePriceRupees) || input.purchasePriceRupees <= 0) {
    throw new Error('Purchase price must be greater than zero.');
  }
  if (!Number.isInteger(input.holdingPeriodYears) || input.holdingPeriodYears < 1) {
    throw new Error('Holding period must be an integer >= 1 year.');
  }
  if (input.loanToValuePercent < 0 || input.loanToValuePercent > 95) {
    throw new Error('Loan-to-value must be between 0% and 95%.');
  }
  if (input.vacancyRatePercent < 0 || input.vacancyRatePercent > 100) {
    throw new Error('Vacancy rate must be between 0% and 100%.');
  }
  if (input.loanTenureYears < 1 && input.loanToValuePercent > 0) {
    throw new Error('Loan tenure must be at least 1 year when LTV > 0.');
  }

  const acquisitionPriceRupees = Math.round(input.purchasePriceRupees);
  const stampDuty = input.purchasePriceRupees * (input.stampDutyPercent / 100);
  const registration = input.purchasePriceRupees * (input.registrationPercent / 100);
  const brokerage = input.purchasePriceRupees * (input.brokeragePercent / 100);
  const transactionCostsRupees = Math.round(stampDuty + registration + brokerage + input.renovationCostRupees);
  const totalAcquisitionCostRupees = acquisitionPriceRupees + transactionCostsRupees;

  const loanAmountRupees = Math.round(input.purchasePriceRupees * (input.loanToValuePercent / 100));
  const equityInvestedRupees = Math.max(1, totalAcquisitionCostRupees - loanAmountRupees);

  const { annualScheduledEmi, schedule } = buildAmortisationByYear(
    loanAmountRupees,
    input.interestRatePercent,
    input.loanTenureYears,
    input.holdingPeriodYears
  );
  const annualDebtServiceRupees = Math.round(annualScheduledEmi);

  const annualPropertyTax = input.annualPropertyTaxRupees ?? 0;
  const grossAnnualRent = input.monthlyRentRupees * 12;
  const effectiveYear1Rent = grossAnnualRent * (1 - input.vacancyRatePercent / 100);
  const year1Opex = input.annualMaintenanceRupees + annualPropertyTax;
  const year1NetOperatingIncomeRupees = Math.round(effectiveYear1Rent - year1Opex);
  const year1Debt = schedule[0]?.annualPayment ?? 0;
  const year1PreTaxCashFlowRupees = Math.round(year1NetOperatingIncomeRupees - year1Debt);

  const grossRentalYieldPercent = round2((grossAnnualRent / input.purchasePriceRupees) * 100);
  const netRentalYieldPercent = round2((year1NetOperatingIncomeRupees / totalAcquisitionCostRupees) * 100);

  const rentEscalation = (input.annualRentEscalationPercent ?? 4) / 100;
  const cashFlows: number[] = [-equityInvestedRupees];

  let totalOperatingCosts = 0;
  let totalGrossRent = 0;
  let totalInterestPaid = 0;
  let totalPrincipalRepaid = 0;
  let totalPositiveDistributions = 0;
  let totalAdditionalEquityCalls = 0;
  let cumulativeNetCash = 0;
  let breakEvenYears: number | null = null;

  const projectedExitValueRupees = Math.round(
    input.purchasePriceRupees * Math.pow(1 + input.annualAppreciationPercent / 100, input.holdingPeriodYears)
  );
  const remainingLoanBalanceAtExitRupees = Math.round(
    schedule[input.holdingPeriodYears - 1]?.endingBalance ?? 0
  );
  const netExitProceedsRupees = Math.round(projectedExitValueRupees - remainingLoanBalanceAtExitRupees);

  for (let yr = 1; yr <= input.holdingPeriodYears; yr++) {
    const yrRent = effectiveYear1Rent * Math.pow(1 + rentEscalation, yr - 1);
    const yrOpex = year1Opex * Math.pow(1.04, yr - 1);
    const yrAmort = schedule[yr - 1];

    totalGrossRent += yrRent;
    totalOperatingCosts += yrOpex;
    totalInterestPaid += yrAmort.interestPaid;
    totalPrincipalRepaid += yrAmort.principalPaid;

    const yrOperatingCf = yrRent - yrOpex - yrAmort.annualPayment;
    const totalYrCf = yr < input.holdingPeriodYears ? yrOperatingCf : yrOperatingCf + netExitProceedsRupees;

    cashFlows.push(totalYrCf);
    cumulativeNetCash += totalYrCf;

    if (totalYrCf >= 0) {
      totalPositiveDistributions += totalYrCf;
    } else {
      totalAdditionalEquityCalls += -totalYrCf;
    }

    if (breakEvenYears === null && cumulativeNetCash >= equityInvestedRupees) {
      breakEvenYears = yr;
    }
  }

  const totalEquityContributedRupees = Math.round(equityInvestedRupees + totalAdditionalEquityCalls);
  // True economic ownership cost: NO principal double-counting!
  const totalOwnershipCostRupees = Math.round(
    totalAcquisitionCostRupees + totalOperatingCosts + totalInterestPaid
  );
  const netProfitRupees = Math.round(cumulativeNetCash - equityInvestedRupees);
  const roiPercent = round2((netProfitRupees / totalEquityContributedRupees) * 100);
  const equityMultiple = round2(totalPositiveDistributions / totalEquityContributedRupees);
  const irr = computeExactIrrDetailed(cashFlows);

  return {
    acquisitionPriceRupees,
    transactionCostsRupees,
    totalAcquisitionCostRupees,
    equityInvestedRupees,
    totalEquityContributedRupees,
    loanAmountRupees,
    annualDebtServiceRupees,
    financingInterestPaidRupees: Math.round(totalInterestPaid),
    principalRepaidDuringHoldRupees: Math.round(totalPrincipalRepaid),
    remainingLoanBalanceAtExitRupees,
    operatingCostsDuringHoldRupees: Math.round(totalOperatingCosts),
    grossRentalIncomeDuringHoldRupees: Math.round(totalGrossRent),
    grossRentalYieldPercent,
    netRentalYieldPercent,
    year1NetOperatingIncomeRupees,
    year1PreTaxCashFlowRupees,
    projectedExitValueRupees,
    netExitProceedsRupees,
    totalOwnershipCostRupees,
    netProfitRupees,
    roiPercent,
    irrPercent: irr.irrPercent,
    mirrPercent: irr.mirrPercent,
    irrStatus: irr.status,
    irrWarning: irr.warning,
    equityMultiple,
    breakEvenYears,
    annualisedAppreciationPercent: round2(input.annualAppreciationPercent),
  };
}

export function runFullInvestmentAnalysis(input: InvestmentAnalysisInput): InvestmentAnalysisResult {
  const base = computeSingleScenarioMetrics(input);
  const conservative = computeSingleScenarioMetrics({
    ...input,
    annualAppreciationPercent: Math.max(-5, input.annualAppreciationPercent - 2.5),
    vacancyRatePercent: Math.min(40, input.vacancyRatePercent + 5),
    interestRatePercent: input.interestRatePercent + 0.75,
  });
  const optimistic = computeSingleScenarioMetrics({
    ...input,
    annualAppreciationPercent: input.annualAppreciationPercent + 2.0,
    vacancyRatePercent: Math.max(0, input.vacancyRatePercent - 3),
  });

  const sensitivityCases: Array<{ parameter: string; deltaLabel: string; mod: Partial<InvestmentAnalysisInput> }> = [
    { parameter: 'Purchase Price', deltaLabel: '+10% Price', mod: { purchasePriceRupees: input.purchasePriceRupees * 1.1 } },
    { parameter: 'Purchase Price', deltaLabel: '-10% Price', mod: { purchasePriceRupees: input.purchasePriceRupees * 0.9 } },
    { parameter: 'Rental Income', deltaLabel: '-15% Rent', mod: { monthlyRentRupees: input.monthlyRentRupees * 0.85 } },
    { parameter: 'Interest Rate', deltaLabel: '+1.5% Rate', mod: { interestRatePercent: input.interestRatePercent + 1.5 } },
    { parameter: 'Vacancy', deltaLabel: '+10% Vacancy', mod: { vacancyRatePercent: Math.min(100, input.vacancyRatePercent + 10) } },
    { parameter: 'Holding Period', deltaLabel: '+3 Years Hold', mod: { holdingPeriodYears: input.holdingPeriodYears + 3 } },
  ];

  const sensitivity = sensitivityCases.map((c) => {
    const m = computeSingleScenarioMetrics({ ...input, ...c.mod });
    return {
      parameter: c.parameter,
      deltaLabel: c.deltaLabel,
      irrPercent: m.irrPercent,
      irrStatus: m.irrStatus,
      netYieldPercent: m.netRentalYieldPercent,
    };
  });

  // Zero fabricated fallback scorecard!
  const rentalPotential = Math.min(100, Math.max(0, Math.round(base.grossRentalYieldPercent * 18)));
  const scorecard = input.scorecardInputs
    ? {
        status: 'COMPUTED' as const,
        location: input.scorecardInputs.locationScore,
        marketLiquidity: input.scorecardInputs.liquidityScore,
        rentalPotential: input.scorecardInputs.rentalPotentialScore,
        priceCompetitiveness: input.scorecardInputs.priceCompetitivenessScore,
        developerProjectRisk: input.scorecardInputs.developerRiskScore,
        dataConfidence: input.scorecardInputs.dataConfidenceScore,
        compositeIndicativeScore: round2(
          input.scorecardInputs.locationScore * 0.25 +
            input.scorecardInputs.liquidityScore * 0.15 +
            input.scorecardInputs.rentalPotentialScore * 0.15 +
            input.scorecardInputs.priceCompetitivenessScore * 0.2 +
            input.scorecardInputs.developerRiskScore * 0.15 +
            input.scorecardInputs.dataConfidenceScore * 0.1
        ),
        note: 'Composite indicative score computed deterministically from supplied qualitative and quantitative inputs (weights: 25/15/15/20/15/10).',
      }
    : {
        status: 'INSUFFICIENT_DATA' as const,
        location: null,
        marketLiquidity: null,
        rentalPotential,
        priceCompetitiveness: null,
        developerProjectRisk: null,
        dataConfidence: null,
        compositeIndicativeScore: null,
        note: 'INSUFFICIENT_DATA: Qualitative location, liquidity, price competitiveness, developer risk, and data confidence inputs were not supplied. PROVENTA does not substitute hardcoded default scores.',
      };

  return {
    base,
    scenarios: { conservative, base, optimistic },
    sensitivity,
    scorecard,
    disclaimer:
      'Indicative mathematical model only. Does not constitute personalised financial advice, tax advice, or guaranteed investment performance. Actual returns depend on market liquidity, statutory charges, and verified transaction execution.',
  };
}
