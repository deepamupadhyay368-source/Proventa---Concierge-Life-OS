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
export function formatInr(paise: number | bigint): string {
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
