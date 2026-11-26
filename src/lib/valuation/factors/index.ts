export * from './types';
export * from './factor-01-property-characteristics';
export * from './factor-02-project-developer-quality';
export * from './factor-03-location-micro-market';
export * from './factor-04-existing-infrastructure';
export * from './factor-05-upcoming-infrastructure';
export * from './factor-06-registered-transactions';
export * from './factor-07-market-supply-demand';
export * from './factor-08-legal-statutory';
export * from './factor-09-building-condition';
export * from './factor-10-environmental-risks';
export * from './factor-11-financial-ownership-costs';
export * from './factor-12-economic-market-trends';

import {
  FactorAnalysisResult,
  ValuationPropertyInput,
  ValuationContextInput,
} from './types';
import { evaluatePropertyCharacteristics } from './factor-01-property-characteristics';
import { evaluateProjectDeveloperQuality, ProjectIntelligenceData } from './factor-02-project-developer-quality';
import { evaluateLocationMicroMarket } from './factor-03-location-micro-market';
import { evaluateExistingInfrastructure } from './factor-04-existing-infrastructure';
import { evaluateUpcomingInfrastructure } from './factor-05-upcoming-infrastructure';
import { evaluateRegisteredTransactions, VerifiedDeedComparable } from './factor-06-registered-transactions';
import { evaluateMarketSupplyDemand } from './factor-07-market-supply-demand';
import { evaluateLegalStatutory } from './factor-08-legal-statutory';
import { evaluateBuildingCondition } from './factor-09-building-condition';
import { evaluateEnvironmentalRisks } from './factor-10-environmental-risks';
import { evaluateFinancialOwnershipCosts, OwnershipCostSummary } from './factor-11-financial-ownership-costs';
import { evaluateEconomicMarketTrends } from './factor-12-economic-market-trends';

export interface TwelveFactorEvaluationSummary {
  factors: FactorAnalysisResult[];
  netDirectAdjustmentPercent: number;
  riskGateTriggered: boolean;
  blockingReasons: string[];
  registeredBaselineRateSqFt?: number;
  comparables: VerifiedDeedComparable[];
  costSummary: OwnershipCostSummary;
  overallCompleteness: number; // 0.0 - 1.0
  factorEvidenceTotal: number;
  factorEvidenceVerified: number;
}

/**
 * Master orchestrator for the PROVENTA PRICE 12-Factor Valuation Intelligence Architecture.
 * Evaluates all 12 independent analytical modules, reconciles risk gates,
 * computes net direct attribute adjustments, and compiles complete institutional audit trails.
 */
export function evaluateAll12Factors(
  property: ValuationPropertyInput,
  context: ValuationContextInput,
  projectData?: ProjectIntelligenceData | null,
  provisionalMarketValueLakhs: number = 75.0
): TwelveFactorEvaluationSummary {
  const f1 = evaluatePropertyCharacteristics(property, context);
  const f2 = evaluateProjectDeveloperQuality(context, projectData);
  const f3 = evaluateLocationMicroMarket(context);
  const f4 = evaluateExistingInfrastructure(context);
  const f5 = evaluateUpcomingInfrastructure(context);
  const f6 = evaluateRegisteredTransactions(property, context);
  const f7 = evaluateMarketSupplyDemand(context);
  const f8 = evaluateLegalStatutory(context, projectData?.reraNumber);
  const f9 = evaluateBuildingCondition(property, context);
  const f10 = evaluateEnvironmentalRisks(context);
  const f11 = evaluateFinancialOwnershipCosts(property, context, provisionalMarketValueLakhs);
  const f12 = evaluateEconomicMarketTrends(context);

  const factors: FactorAnalysisResult[] = [
    f1,
    f2,
    f3,
    f4,
    f5,
    f6,
    f7,
    f8,
    f9,
    f10,
    f11,
    f12,
  ];

  // Aggregate Direct Adjustments only from factors designated as DIRECT_ADJUSTMENT
  let netDirectAdjustmentPercent = 0.0;
  for (const factor of factors) {
    if (factor.valuationImpactType === 'DIRECT_ADJUSTMENT' && factor.valuationImpact.adjustmentPercent) {
      netDirectAdjustmentPercent += factor.valuationImpact.adjustmentPercent;
    }
  }
  netDirectAdjustmentPercent = Math.round(netDirectAdjustmentPercent * 10) / 10;

  // Check Risk Gates
  const blockingReasons: string[] = [];
  let riskGateTriggered = false;

  for (const factor of factors) {
    if (factor.valuationImpact.gateAction === 'BLOCK') {
      riskGateTriggered = true;
      blockingReasons.push(`${factor.factorName}: ${factor.valuationImpact.rationale}`);
    }
  }

  // Completeness & Evidence Totals
  const overallCompleteness =
    Math.round((factors.reduce((sum, f) => sum + f.inputCompleteness, 0) / factors.length) * 100) / 100;
  const factorEvidenceTotal = factors.reduce((sum, f) => sum + f.evidenceCount, 0);
  const factorEvidenceVerified = factors.reduce((sum, f) => sum + f.verifiedEvidenceCount, 0);

  return {
    factors,
    netDirectAdjustmentPercent,
    riskGateTriggered,
    blockingReasons,
    registeredBaselineRateSqFt: f6.baselineRateSqFt,
    comparables: f6.comparables,
    costSummary: f11.costSummary,
    overallCompleteness,
    factorEvidenceTotal,
    factorEvidenceVerified,
  };
}
