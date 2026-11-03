/**
 * PROVENTA — Deterministic Financial Calculation Engine
 * 
 * High-precision, zero-floating-point-drift calculation engine.
 * All monetary amounts are handled as integer paise (1 INR = 100 Paise).
 * Eliminates IEEE 754 precision errors.
 */

import {
  AssetDTO,
  LiabilityDTO,
  NetWorthSummary,
  WorkspaceType,
  CategoryAllocation,
  MemberOwnershipShare,
  HistoricalNetWorthPoint,
  ScenarioSimulationInput,
  ScenarioSimulationResult,
} from './types';

/**
 * Formats integer paise into standard Indian Rupee representation (e.g. ₹1,25,00,000)
 */
export function formatInr(paise?: number | bigint | null): string {
  if (paise === undefined || paise === null || isNaN(Number(paise))) return '₹0';
  const isNegative = paise < 0;
  const absPaise = isNegative ? -BigInt(paise) : BigInt(paise);
  const rupees = absPaise / BigInt(100);
  const remainderPaise = absPaise % BigInt(100);

  // Format with Indian Numbering System (e.g., Lakhs and Crores)
  const rupeesStr = rupees.toString();
  let formattedRupees = '';

  if (rupeesStr.length <= 3) {
    formattedRupees = rupeesStr;
  } else {
    const lastThree = rupeesStr.substring(rupeesStr.length - 3);
    const rest = rupeesStr.substring(0, rupeesStr.length - 3);
    const chunks: string[] = [];
    for (let i = rest.length; i > 0; i -= 2) {
      const start = Math.max(0, i - 2);
      chunks.unshift(rest.substring(start, i));
    }
    formattedRupees = chunks.join(',') + ',' + lastThree;
  }

  const sign = isNegative ? '-' : '';
  // If there are cents/paise and it's less than 1000 rupees, show decimals, otherwise round to clean integer for wealth display
  if (rupees < BigInt(1000) && remainderPaise > BigInt(0)) {
    const decimal = remainderPaise.toString().padStart(2, '0');
    return `${sign}₹${formattedRupees}.${decimal}`;
  }

  return `${sign}₹${formattedRupees}`;
}

/**
 * Converts user input rupees (number or string) into exact integer paise
 */
export function rupeesToPaise(rupees: number | string): number {
  if (typeof rupees === 'string') {
    const cleanStr = rupees.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleanStr);
    if (isNaN(parsed)) return 0;
    return Math.round(parsed * 100);
  }
  return Math.round(rupees * 100);
}

/**
 * Converts paise back to floating rupees for charts or exports
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Calculates ownership-adjusted asset value for a given user or family scope.
 * Prevents double-counting: if user owns 40% of a ₹1 Cr apartment, only ₹40 Lakh is counted in their personal net worth.
 */
export function calculateOwnershipAdjustedAssetValue(
  asset: AssetDTO,
  targetUserId?: string,
): number {
  // If no target user specified (consolidated family view), return 100% of the asset value
  if (!targetUserId) {
    return asset.currentValuePaise;
  }

  // If target user is primary legal owner
  if (asset.legalOwnerId === targetUserId) {
    const pct = Math.max(0, Math.min(100, asset.ownershipPercentage));
    return Math.round((asset.currentValuePaise * pct) / 100);
  }

  // Check if target user is listed as co-owner
  const coOwner = asset.coOwners?.find((co) => co.userId === targetUserId);
  if (coOwner) {
    const pct = Math.max(0, Math.min(100, coOwner.ownershipPercentage));
    return Math.round((asset.currentValuePaise * pct) / 100);
  }

  // Not an owner of this asset
  return 0;
}

/**
 * Calculates ownership-adjusted liability balance for a given user or family scope.
 */
export function calculateOwnershipAdjustedLiabilityValue(
  liability: LiabilityDTO,
  targetUserId?: string,
): number {
  if (!targetUserId) {
    return liability.outstandingBalancePaise;
  }

  if (liability.primaryBorrowerId === targetUserId) {
    const pct = Math.max(0, Math.min(100, liability.borrowerOwnershipPercentage));
    return Math.round((liability.outstandingBalancePaise * pct) / 100);
  }

  const coBorrower = liability.coBorrowers?.find((cb) => cb.userId === targetUserId);
  if (coBorrower) {
    const pct = Math.max(0, Math.min(100, coBorrower.ownershipPercentage));
    return Math.round((liability.outstandingBalancePaise * pct) / 100);
  }

  return 0;
}

/**
 * Deduplicates assets when aggregating across workspaces.
 * If the same asset ID appears multiple times, it is only included once.
 */
export function deduplicateAssets(assets: AssetDTO[]): AssetDTO[] {
  const seen = new Set<string>();
  const deduped: AssetDTO[] = [];
  for (const asset of assets) {
    if (!seen.has(asset.id)) {
      seen.add(asset.id);
      deduped.push(asset);
    }
  }
  return deduped;
}

/**
 * Deduplicates liabilities when aggregating across workspaces.
 */
export function deduplicateLiabilities(liabilities: LiabilityDTO[]): LiabilityDTO[] {
  const seen = new Set<string>();
  const deduped: LiabilityDTO[] = [];
  for (const liability of liabilities) {
    if (!seen.has(liability.id)) {
      seen.add(liability.id);
      deduped.push(liability);
    }
  }
  return deduped;
}

/**
 * Core Deterministic Calculation Engine
 * Computes consolidated Gross, Ownership-Adjusted, and Category Allocations.
 */
export function calculateNetWorth(params: {
  workspaceId: string;
  workspaceType: WorkspaceType;
  assets: AssetDTO[];
  liabilities: LiabilityDTO[];
  targetUserId?: string; // If filtering to a specific family member or individual
  historicalPoints?: HistoricalNetWorthPoint[];
}): NetWorthSummary {
  const { workspaceId, workspaceType, targetUserId } = params;

  // Deduplicate records to strictly prevent double counting
  const assets = deduplicateAssets(params.assets);
  const liabilities = deduplicateLiabilities(params.liabilities);

  // 1. Gross Calculations (100% full values of all assets & liabilities in scope)
  let grossAssetsPaise = 0;
  let unverifiedAssetsCount = 0;
  let missingInfoCount = 0;

  for (const a of assets) {
    grossAssetsPaise += a.currentValuePaise;
    if (a.valuationStatus === 'ESTIMATED' || a.valuationStatus === 'USER_REPORTED') {
      unverifiedAssetsCount++;
    }
    if (!a.acquisitionDate || !a.lastValuationDate || (a.supportingDocumentIds || []).length === 0) {
      missingInfoCount++;
    }
  }

  let grossLiabilitiesPaise = 0;
  for (const l of liabilities) {
    grossLiabilitiesPaise += l.outstandingBalancePaise;
    if (!l.maturityDate || l.interestRateAnnual === 0) {
      missingInfoCount++;
    }
  }

  const grossNetWorthPaise = grossAssetsPaise - grossLiabilitiesPaise;

  // 2. Ownership-Adjusted Calculations
  let adjustedAssetsPaise = 0;
  for (const a of assets) {
    adjustedAssetsPaise += calculateOwnershipAdjustedAssetValue(a, targetUserId);
  }

  let adjustedLiabilitiesPaise = 0;
  for (const l of liabilities) {
    adjustedLiabilitiesPaise += calculateOwnershipAdjustedLiabilityValue(l, targetUserId);
  }

  const adjustedNetWorthPaise = adjustedAssetsPaise - adjustedLiabilitiesPaise;

  // 3. Category Allocation Breakdown
  const categoryTotals: Record<string, { totalPaise: number; count: number }> = {
    FINANCIAL: { totalPaise: 0, count: 0 },
    PHYSICAL: { totalPaise: 0, count: 0 },
    BUSINESS: { totalPaise: 0, count: 0 },
  };

  for (const a of assets) {
    const val = targetUserId ? calculateOwnershipAdjustedAssetValue(a, targetUserId) : a.currentValuePaise;
    if (categoryTotals[a.category]) {
      categoryTotals[a.category].totalPaise += val;
      categoryTotals[a.category].count += 1;
    }
  }

  const totalAssetBase = targetUserId ? adjustedAssetsPaise : grossAssetsPaise;
  const assetAllocation: CategoryAllocation[] = [
    {
      category: 'FINANCIAL',
      label: 'Financial Assets',
      totalPaise: categoryTotals.FINANCIAL.totalPaise,
      formattedTotal: formatInr(categoryTotals.FINANCIAL.totalPaise),
      percentage: totalAssetBase > 0 ? Number(((categoryTotals.FINANCIAL.totalPaise / totalAssetBase) * 100).toFixed(1)) : 0,
      count: categoryTotals.FINANCIAL.count,
    },
    {
      category: 'PHYSICAL',
      label: 'Physical Assets',
      totalPaise: categoryTotals.PHYSICAL.totalPaise,
      formattedTotal: formatInr(categoryTotals.PHYSICAL.totalPaise),
      percentage: totalAssetBase > 0 ? Number(((categoryTotals.PHYSICAL.totalPaise / totalAssetBase) * 100).toFixed(1)) : 0,
      count: categoryTotals.PHYSICAL.count,
    },
    {
      category: 'BUSINESS',
      label: 'Business Interests',
      totalPaise: categoryTotals.BUSINESS.totalPaise,
      formattedTotal: formatInr(categoryTotals.BUSINESS.totalPaise),
      percentage: totalAssetBase > 0 ? Number(((categoryTotals.BUSINESS.totalPaise / totalAssetBase) * 100).toFixed(1)) : 0,
      count: categoryTotals.BUSINESS.count,
    },
  ];

  // 4. Member-wise distribution
  const memberMap = new Map<string, { name: string; assets: number; liabilities: number }>();
  for (const a of assets) {
    // Primary owner
    const existing = memberMap.get(a.legalOwnerId) || { name: a.legalOwnerName, assets: 0, liabilities: 0 };
    existing.assets += Math.round((a.currentValuePaise * a.ownershipPercentage) / 100);
    memberMap.set(a.legalOwnerId, existing);

    // Co-owners
    for (const co of a.coOwners || []) {
      const coId = co.userId || co.name;
      const coExisting = memberMap.get(coId) || { name: co.name, assets: 0, liabilities: 0 };
      coExisting.assets += Math.round((a.currentValuePaise * co.ownershipPercentage) / 100);
      memberMap.set(coId, coExisting);
    }
  }

  for (const l of liabilities) {
    const existing = memberMap.get(l.primaryBorrowerId) || { name: l.primaryBorrowerName, assets: 0, liabilities: 0 };
    existing.liabilities += Math.round((l.outstandingBalancePaise * l.borrowerOwnershipPercentage) / 100);
    memberMap.set(l.primaryBorrowerId, existing);

    for (const cb of l.coBorrowers || []) {
      const cbId = cb.userId || cb.name;
      const cbExisting = memberMap.get(cbId) || { name: cb.name, assets: 0, liabilities: 0 };
      cbExisting.liabilities += Math.round((l.outstandingBalancePaise * cb.ownershipPercentage) / 100);
      memberMap.set(cbId, cbExisting);
    }
  }

  const memberShares: MemberOwnershipShare[] = Array.from(memberMap.entries()).map(([memberId, data]) => {
    const net = data.assets - data.liabilities;
    const pct = grossNetWorthPaise > 0 ? Number(((net / grossNetWorthPaise) * 100).toFixed(1)) : 0;
    return {
      memberId,
      memberName: data.name,
      relationship: 'OTHER',
      assetsTotalPaise: data.assets,
      formattedAssetsTotal: formatInr(data.assets),
      liabilitiesTotalPaise: data.liabilities,
      formattedLiabilitiesTotal: formatInr(data.liabilities),
      netWorthPaise: net,
      formattedNetWorth: formatInr(net),
      percentageOfFamilyNetWorth: pct,
    };
  });

  // 5. Growth calculation (from history or baseline)
  const historical = params.historicalPoints || [];
  let monthlyChangePaise = 0;
  let monthlyGrowthPct = 0;
  let yearlyChangePaise = 0;
  let yearlyGrowthPct = 0;

  if (historical.length >= 2) {
    const currentPoint = historical[historical.length - 1];
    const prevMonthPoint = historical[historical.length - 2];
    monthlyChangePaise = currentPoint.netWorthPaise - prevMonthPoint.netWorthPaise;
    if (prevMonthPoint.netWorthPaise !== 0) {
      monthlyGrowthPct = Number(((monthlyChangePaise / Math.abs(prevMonthPoint.netWorthPaise)) * 100).toFixed(2));
    }
  }

  if (historical.length >= 12) {
    const currentPoint = historical[historical.length - 1];
    const yearAgoPoint = historical[historical.length - 12];
    yearlyChangePaise = currentPoint.netWorthPaise - yearAgoPoint.netWorthPaise;
    if (yearAgoPoint.netWorthPaise !== 0) {
      yearlyGrowthPct = Number(((yearlyChangePaise / Math.abs(yearAgoPoint.netWorthPaise)) * 100).toFixed(2));
    }
  }

  return {
    workspaceId,
    workspaceType,
    calculatedAt: new Date().toISOString(),
    currency: 'INR',
    grossAssetsPaise,
    formattedGrossAssets: formatInr(grossAssetsPaise),
    grossLiabilitiesPaise,
    formattedGrossLiabilities: formatInr(grossLiabilitiesPaise),
    grossNetWorthPaise,
    formattedGrossNetWorth: formatInr(grossNetWorthPaise),
    ownershipAdjustedAssetsPaise: adjustedAssetsPaise,
    formattedAdjustedAssets: formatInr(adjustedAssetsPaise),
    ownershipAdjustedLiabilitiesPaise: adjustedLiabilitiesPaise,
    formattedAdjustedLiabilities: formatInr(adjustedLiabilitiesPaise),
    ownershipAdjustedNetWorthPaise: adjustedNetWorthPaise,
    formattedAdjustedNetWorth: formatInr(adjustedNetWorthPaise),
    monthlyChangePaise,
    formattedMonthlyChange: formatInr(monthlyChangePaise),
    monthlyGrowthPercentage: monthlyGrowthPct,
    yearlyChangePaise,
    formattedYearlyChange: formatInr(yearlyChangePaise),
    yearlyGrowthPercentage: yearlyGrowthPct,
    assetAllocation,
    memberShares,
    historicalPoints: historical,
    totalAssetsCount: assets.length,
    totalLiabilitiesCount: liabilities.length,
    missingInformationCount: missingInfoCount,
    unverifiedAssetsCount,
  };
}

/**
 * Deterministic Scenario Simulation Engine
 * Computes forward-looking scenarios using compound interest formulas with inflation adjustments.
 * Clearly labels all assumptions; does not provide securities investment recommendations.
 */
export function runScenarioSimulation(input: ScenarioSimulationInput): ScenarioSimulationResult {
  const {
    baseNetWorthPaise,
    monthlyAdditionalSavingsPaise = 0,
    expectedAnnualReturnRate = 8.0,
    inflationRate = 6.0,
    propertyValueAdjustmentPercentage = 0,
    loanPrepaymentLumpSumPaise = 0,
    projectionYears,
  } = input;

  const assumptions: string[] = [
    `Baseline starting wealth: ${formatInr(baseNetWorthPaise)}`,
    `Hypothetical annual investment return rate: ${expectedAnnualReturnRate}%`,
    `Annual assumed inflation rate: ${inflationRate}%`,
    `Monthly recurring family savings: ${formatInr(monthlyAdditionalSavingsPaise)}`,
  ];

  if (loanPrepaymentLumpSumPaise > 0) {
    assumptions.push(`Immediate loan principal prepayment: ${formatInr(loanPrepaymentLumpSumPaise)}`);
  }
  if (propertyValueAdjustmentPercentage !== 0) {
    assumptions.push(`Immediate property valuation shift: ${propertyValueAdjustmentPercentage > 0 ? '+' : ''}${propertyValueAdjustmentPercentage}%`);
  }

  // Adjusted starting base
  let currentPaise = baseNetWorthPaise + loanPrepaymentLumpSumPaise;
  if (propertyValueAdjustmentPercentage !== 0) {
    currentPaise += Math.round((currentPaise * propertyValueAdjustmentPercentage) / 100);
  }

  const annualRate = expectedAnnualReturnRate / 100;
  const annualInflation = inflationRate / 100;
  const yearlyMilestones: Array<{ year: number; projectedAmountPaise: number; formattedAmount: string }> = [];

  let runningPaise = currentPaise;
  for (let year = 1; year <= projectionYears; year++) {
    // Compounding with monthly savings added
    const interestGained = Math.round(runningPaise * annualRate);
    const yearlySavings = monthlyAdditionalSavingsPaise * 12;
    runningPaise += interestGained + yearlySavings;

    yearlyMilestones.push({
      year,
      projectedAmountPaise: runningPaise,
      formattedAmount: formatInr(runningPaise),
    });
  }

  const netGainPaise = runningPaise - baseNetWorthPaise;
  // Inflation adjustment: Future value / (1 + inflation)^years
  const inflationDivisor = Math.pow(1 + annualInflation, projectionYears);
  const inflationAdjustedNetWorthPaise = Math.round(runningPaise / inflationDivisor);

  return {
    projectionYears,
    startingNetWorthPaise: baseNetWorthPaise,
    projectedNetWorthPaise: runningPaise,
    formattedProjectedNetWorth: formatInr(runningPaise),
    netGainPaise,
    formattedNetGain: formatInr(netGainPaise),
    inflationAdjustedNetWorthPaise,
    formattedInflationAdjusted: formatInr(inflationAdjustedNetWorthPaise),
    yearlyMilestones,
    assumptionsStated: assumptions,
  };
}

// ==========================================
// DEBT FREEDOM ENGINE: EMI & AMORTISATION
// ==========================================

export interface AmortisationMonth {
  month: number;
  dateStr?: string;
  openingBalancePaise: number;
  emiPaise: number;
  principalPaidPaise: number;
  interestPaidPaise: number;
  closingBalancePaise: number;
  cumulativeInterestPaise: number;
}

export interface LoanPrepaymentResult {
  originalTotalInterestPaise: number;
  newTotalInterestPaise: number;
  interestSavedPaise: number;
  formattedInterestSaved: string;
  originalTenureMonths: number;
  newTenureMonths: number;
  monthsSaved: number;
  schedule: AmortisationMonth[];
}

/**
 * Calculates deterministic monthly EMI using standard reducing-balance formula:
 * EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
 * All calculations preserve integer paise precision.
 */
export function calculateEMI(
  principalPaise: number,
  annualInterestRate: number,
  tenureMonths: number,
): number {
  if (principalPaise <= 0 || tenureMonths <= 0) return 0;
  if (annualInterestRate <= 0) {
    return Math.round(principalPaise / tenureMonths);
  }

  const monthlyRate = annualInterestRate / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principalPaise * monthlyRate * factor) / (factor - 1);

  return Math.round(emi);
}

/**
 * Generates month-by-month loan amortisation schedule.
 * Reconciles closing balance strictly to 0 at final maturity.
 */
export function generateAmortisationSchedule(
  principalPaise: number,
  annualInterestRate: number,
  tenureMonths: number,
  startDate?: string,
): AmortisationMonth[] {
  if (principalPaise <= 0 || tenureMonths <= 0) return [];

  const emiPaise = calculateEMI(principalPaise, annualInterestRate, tenureMonths);
  const monthlyRate = annualInterestRate / (12 * 100);
  const schedule: AmortisationMonth[] = [];

  let balance = principalPaise;
  let cumulativeInterest = 0;
  const start = startDate ? new Date(startDate) : new Date();

  for (let m = 1; m <= tenureMonths; m++) {
    const opening = balance;
    let interest = Math.round(balance * monthlyRate);
    let principal = emiPaise - interest;

    if (balance <= principal || m === tenureMonths) {
      principal = balance;
      balance = 0;
    } else {
      balance -= principal;
    }

    cumulativeInterest += interest;

    const monthDate = new Date(start.getFullYear(), start.getMonth() + m - 1, 1);
    const dateStr = monthDate.toISOString().substring(0, 7);

    schedule.push({
      month: m,
      dateStr,
      openingBalancePaise: opening,
      emiPaise: principal + interest,
      principalPaidPaise: principal,
      interestPaidPaise: interest,
      closingBalancePaise: balance,
      cumulativeInterestPaise: cumulativeInterest,
    });

    if (balance <= 0) break;
  }

  return schedule;
}

/**
 * Simulates the financial benefit of regular or lump-sum loan prepayment.
 * Computes exact interest saved and tenure reduction.
 */
export function simulateLoanPrepayment(
  principalPaise: number,
  annualInterestRate: number,
  tenureMonths: number,
  extraMonthlyPaise: number = 0,
  lumpSumPaise: number = 0,
  lumpSumMonth: number = 1,
): LoanPrepaymentResult {
  const baseSchedule = generateAmortisationSchedule(principalPaise, annualInterestRate, tenureMonths);
  const originalTotalInterestPaise = baseSchedule.reduce((acc, row) => acc + row.interestPaidPaise, 0);

  const sanitizedExtraPaise = Math.max(0, extraMonthlyPaise);
  const sanitizedLumpSumPaise = Math.max(0, lumpSumPaise);
  const sanitizedLumpSumMonth = Math.max(1, lumpSumMonth);

  if (sanitizedExtraPaise <= 0 && sanitizedLumpSumPaise <= 0) {
    return {
      originalTotalInterestPaise,
      newTotalInterestPaise: originalTotalInterestPaise,
      interestSavedPaise: 0,
      formattedInterestSaved: formatInr(0),
      originalTenureMonths: tenureMonths,
      newTenureMonths: baseSchedule.length,
      monthsSaved: 0,
      schedule: baseSchedule,
    };
  }

  const standardEmiPaise = calculateEMI(principalPaise, annualInterestRate, tenureMonths);
  const monthlyRate = annualInterestRate / (12 * 100);
  const newSchedule: AmortisationMonth[] = [];

  let balance = principalPaise;
  let cumulativeInterest = 0;
  let month = 0;

  while (balance > 0 && month < tenureMonths * 2) {
    month++;
    const opening = balance;
    const interest = Math.round(balance * monthlyRate);
    let totalPayment = standardEmiPaise + sanitizedExtraPaise;

    if (month === sanitizedLumpSumMonth) {
      totalPayment += sanitizedLumpSumPaise;
    }

    let principal = totalPayment - interest;
    if (principal > balance) {
      principal = balance;
      balance = 0;
    } else {
      balance -= principal;
    }

    cumulativeInterest += interest;

    newSchedule.push({
      month,
      openingBalancePaise: opening,
      emiPaise: principal + interest,
      principalPaidPaise: principal,
      interestPaidPaise: interest,
      closingBalancePaise: balance,
      cumulativeInterestPaise: cumulativeInterest,
    });
  }

  const newTotalInterestPaise = cumulativeInterest;
  const interestSavedPaise = Math.max(0, originalTotalInterestPaise - newTotalInterestPaise);
  const monthsSaved = Math.max(0, baseSchedule.length - newSchedule.length);

  return {
    originalTotalInterestPaise,
    newTotalInterestPaise,
    interestSavedPaise,
    formattedInterestSaved: formatInr(interestSavedPaise),
    originalTenureMonths: baseSchedule.length,
    newTenureMonths: newSchedule.length,
    monthsSaved,
    schedule: newSchedule,
  };
}

// ==========================================
// CASHFLOW INTELLIGENCE & RUNWAY
// ==========================================

export function calculateSavingsRate(incomePaise: number, expensePaise: number): number {
  if (incomePaise <= 0) return 0;
  const net = incomePaise - expensePaise;
  return Number(((net / incomePaise) * 100).toFixed(1));
}

export function calculateEmergencyRunway(
  liquidCashPaise: number,
  monthlyExpensesPaise: number,
): { runwayMonths: number; status: 'CRITICAL' | 'ADEQUATE' | 'HEALTHY' } {
  if (monthlyExpensesPaise <= 0) {
    return { runwayMonths: 99, status: 'HEALTHY' };
  }
  const runwayMonths = Number((liquidCashPaise / monthlyExpensesPaise).toFixed(1));
  let status: 'CRITICAL' | 'ADEQUATE' | 'HEALTHY' = 'HEALTHY';
  if (runwayMonths < 3) status = 'CRITICAL';
  else if (runwayMonths < 6) status = 'ADEQUATE';

  return { runwayMonths, status };
}

// ==========================================
// INVESTMENT HEALTH ENGINE
// ==========================================

export interface InvestmentHealthSummary {
  equityPaise: number;
  debtPaise: number;
  goldPaise: number;
  realEstatePaise: number;
  cashPaise: number;
  percentages: {
    equity: number;
    debt: number;
    gold: number;
    realEstate: number;
    cash: number;
  };
  concentrationRiskScore: number; // 0 - 100 (higher = more concentrated)
  topHoldingPercentage: number;
  topHoldingName: string;
  alerts: string[];
}

export function calculateInvestmentHealth(assets: AssetDTO[]): InvestmentHealthSummary {
  let equityPaise = 0;
  let debtPaise = 0;
  let goldPaise = 0;
  let realEstatePaise = 0;
  let cashPaise = 0;
  let totalPaise = 0;

  let topHoldingPaise = 0;
  let topHoldingName = 'None';

  for (const a of assets) {
    const val = a.currentValuePaise;
    totalPaise += val;

    if (val > topHoldingPaise) {
      topHoldingPaise = val;
      topHoldingName = a.name;
    }

    switch (a.subcategory) {
      case 'STOCK':
      case 'MUTUAL_FUND':
      case 'PRIVATE_COMPANY':
      case 'PARTNERSHIP_INTEREST':
      case 'FAMILY_BUSINESS':
        equityPaise += val;
        break;
      case 'BOND':
      case 'GOV_SECURITY':
      case 'FIXED_DEPOSIT':
      case 'RECURRING_DEPOSIT':
      case 'PROVIDENT_FUND':
      case 'PPF':
      case 'EPF':
      case 'NPS':
        debtPaise += val;
        break;
      case 'GOLD':
      case 'JEWELLERY':
        goldPaise += val;
        break;
      case 'RESIDENTIAL_PROPERTY':
      case 'COMMERCIAL_PROPERTY':
      case 'AGRICULTURAL_LAND':
        realEstatePaise += val;
        break;
      case 'BANK_DEPOSIT':
      case 'SAVINGS_ACCOUNT':
        cashPaise += val;
        break;
      default:
        if (a.category === 'PHYSICAL') realEstatePaise += val;
        else if (a.category === 'BUSINESS') equityPaise += val;
        else cashPaise += val;
        break;
    }
  }

  const toPct = (val: number) => (totalPaise > 0 ? Number(((val / totalPaise) * 100).toFixed(1)) : 0);

  const topHoldingPercentage = toPct(topHoldingPaise);
  // Concentration score: HHI proxy or top holding weight
  const concentrationRiskScore = Math.min(100, Math.round(topHoldingPercentage * 1.2));

  const alerts: string[] = [];
  if (topHoldingPercentage > 40 && totalPaise > 0) {
    alerts.push(`High concentration risk: "${topHoldingName}" represents ${topHoldingPercentage}% of total asset base.`);
  }
  const equityPct = toPct(equityPaise);
  const debtPct = toPct(debtPaise);
  if (debtPct < 15 && totalPaise > 0) {
    alerts.push('Low fixed-income allocation: Debt assets represent less than 15% of your portfolio.');
  }

  return {
    equityPaise,
    debtPaise,
    goldPaise,
    realEstatePaise,
    cashPaise,
    percentages: {
      equity: equityPct,
      debt: debtPct,
      gold: toPct(goldPaise),
      realEstate: toPct(realEstatePaise),
      cash: toPct(cashPaise),
    },
    concentrationRiskScore,
    topHoldingPercentage,
    topHoldingName,
    alerts,
  };
}

// ==========================================
// GOALS & FUTURE PLANNING ENGINE (SIP)
// ==========================================

export function calculateGoalRequiredSIP(
  targetCorpusPaise: number,
  currentCorpusPaise: number,
  expectedCAGR: number,
  tenureMonths: number,
  inflationRate: number = 0,
): {
  requiredMonthlySipPaise: number;
  requiredLumpSumPaise: number;
  inflationAdjustedTargetPaise: number;
} {
  if (targetCorpusPaise <= 0 || tenureMonths <= 0) {
    return {
      requiredMonthlySipPaise: 0,
      requiredLumpSumPaise: 0,
      inflationAdjustedTargetPaise: 0,
    };
  }

  const years = tenureMonths / 12;
  const inflationAdjustedTargetPaise = Math.round(
    targetCorpusPaise * Math.pow(1 + inflationRate / 100, years),
  );

  const monthlyRate = expectedCAGR / (12 * 100);
  const growthFactor = Math.pow(1 + monthlyRate, tenureMonths);

  const futureValueOfCurrent = Math.round(currentCorpusPaise * growthFactor);
  const netDeficitPaise = Math.max(0, inflationAdjustedTargetPaise - futureValueOfCurrent);

  if (netDeficitPaise === 0) {
    return {
      requiredMonthlySipPaise: 0,
      requiredLumpSumPaise: 0,
      inflationAdjustedTargetPaise,
    };
  }

  // Required Monthly SIP formula: FV * r / [(1 + r) * ((1 + r)^n - 1)]
  let requiredMonthlySipPaise = 0;
  if (monthlyRate > 0 && growthFactor > 1) {
    requiredMonthlySipPaise = Math.round(
      (netDeficitPaise * monthlyRate) / ((1 + monthlyRate) * (growthFactor - 1)),
    );
  } else {
    requiredMonthlySipPaise = Math.round(netDeficitPaise / tenureMonths);
  }

  const requiredLumpSumPaise = Math.round(netDeficitPaise / growthFactor);

  return {
    requiredMonthlySipPaise,
    requiredLumpSumPaise,
    inflationAdjustedTargetPaise,
  };
}

// ==========================================
// FINANCIAL DECISION LAB: FIRE & BUY VS RENT
// ==========================================

export function calculateFIRE(
  currentNetWorthPaise: number,
  annualExpensePaise: number,
  annualSavingsPaise: number,
  expectedReturnRate: number = 10.0,
  inflationRate: number = 6.0,
  swrPercentage: number = 3.5,
): {
  targetFireCorpusPaise: number;
  yearsToFire: number;
  isAchieved: boolean;
  fireMilestones: Array<{ year: number; projectedPaise: number; targetPaise: number }>;
} {
  const targetFireCorpusPaise = Math.round((annualExpensePaise * 100) / swrPercentage);

  if (currentNetWorthPaise >= targetFireCorpusPaise) {
    return {
      targetFireCorpusPaise,
      yearsToFire: 0,
      isAchieved: true,
      fireMilestones: [{ year: 0, projectedPaise: currentNetWorthPaise, targetPaise: targetFireCorpusPaise }],
    };
  }

  const milestones: Array<{ year: number; projectedPaise: number; targetPaise: number }> = [];
  let projectedPaise = currentNetWorthPaise;
  let targetPaise = targetFireCorpusPaise;
  let yearsToFire = 50; // max cap

  for (let y = 1; y <= 40; y++) {
    projectedPaise = Math.round(projectedPaise * (1 + expectedReturnRate / 100)) + annualSavingsPaise;
    targetPaise = Math.round(targetPaise * (1 + inflationRate / 100));

    milestones.push({
      year: y,
      projectedPaise,
      targetPaise,
    });

    if (projectedPaise >= targetPaise && yearsToFire === 50) {
      yearsToFire = y;
      break;
    }
  }

  return {
    targetFireCorpusPaise,
    yearsToFire: yearsToFire === 50 ? 40 : yearsToFire,
    isAchieved: false,
    fireMilestones: milestones,
  };
}

export function calculateBuyVsRent(
  propertyCostPaise: number,
  downPaymentPercentage: number = 20,
  loanInterestRate: number = 8.5,
  loanTenureYears: number = 20,
  expectedPropertyAppreciation: number = 6.0,
  initialMonthlyRentPaise: number = 4000000, // ₹40,000 / month
  rentInflationRate: number = 5.0,
  investmentReturnRate: number = 11.0,
  projectionYears: number = 15,
): {
  buyingNetWorthPaise: number;
  rentingNetWorthPaise: number;
  recommendation: 'BUY' | 'RENT';
  financialAdvantagePaise: number;
  yearlyComparison: Array<{ year: number; buyWealthPaise: number; rentWealthPaise: number }>;
} {
  const downPaymentPaise = Math.round((propertyCostPaise * downPaymentPercentage) / 100);
  const loanPrincipalPaise = propertyCostPaise - downPaymentPaise;
  const loanTenureMonths = loanTenureYears * 12;
  const monthlyEmiPaise = calculateEMI(loanPrincipalPaise, loanInterestRate, loanTenureMonths);

  let propertyValuePaise = propertyCostPaise;
  let remainingLoanBalancePaise = loanPrincipalPaise;
  const monthlyLoanRate = loanInterestRate / (12 * 100);

  // Rent scenario: invest the downpayment in diversified index fund
  let rentInvestmentPortfolioPaise = downPaymentPaise;
  let currentMonthlyRentPaise = initialMonthlyRentPaise;

  const yearlyComparison: Array<{ year: number; buyWealthPaise: number; rentWealthPaise: number }> = [];

  for (let y = 1; y <= projectionYears; y++) {
    // 1. Buying side
    propertyValuePaise = Math.round(propertyValuePaise * (1 + expectedPropertyAppreciation / 100));
    // Amortise 12 months
    for (let m = 0; m < 12; m++) {
      if (remainingLoanBalancePaise > 0) {
        const interest = Math.round(remainingLoanBalancePaise * monthlyLoanRate);
        const principal = Math.min(remainingLoanBalancePaise, monthlyEmiPaise - interest);
        remainingLoanBalancePaise -= principal;
      }
    }
    const buyWealth = propertyValuePaise - remainingLoanBalancePaise;

    // 2. Renting side
    rentInvestmentPortfolioPaise = Math.round(
      rentInvestmentPortfolioPaise * (1 + investmentReturnRate / 100),
    );
    // If EMI is higher than Rent, the renter invests the monthly difference
    const monthlyDifference = Math.max(0, monthlyEmiPaise - currentMonthlyRentPaise);
    rentInvestmentPortfolioPaise += monthlyDifference * 12;

    currentMonthlyRentPaise = Math.round(currentMonthlyRentPaise * (1 + rentInflationRate / 100));

    yearlyComparison.push({
      year: y,
      buyWealthPaise: buyWealth,
      rentWealthPaise: rentInvestmentPortfolioPaise,
    });
  }

  const finalBuyWealth = yearlyComparison[yearlyComparison.length - 1].buyWealthPaise;
  const finalRentWealth = yearlyComparison[yearlyComparison.length - 1].rentWealthPaise;
  const recommendation = finalBuyWealth >= finalRentWealth ? 'BUY' : 'RENT';
  const scenarioAdvantage = recommendation;
  const financialAdvantagePaise = Math.abs(finalBuyWealth - finalRentWealth);

  return {
    buyingNetWorthPaise: finalBuyWealth,
    rentingNetWorthPaise: finalRentWealth,
    recommendation,
    financialAdvantagePaise,
    yearlyComparison,
  };
}
