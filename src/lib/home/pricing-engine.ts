import { SubscriptionPlanTier, UnitEconomicsSimulation } from './types';
import { HOME_SUBSCRIPTION_PLANS } from './constants';

export interface ScenarioResult {
  scenarioName: 'LOW_UTILISATION' | 'EXPECTED_UTILISATION' | 'HIGH_UTILISATION';
  label: string;
  simulations: Record<SubscriptionPlanTier, UnitEconomicsSimulation>;
  blendedMonthlyRevenue: number;
  blendedVariableCost: number;
  blendedContributionMarginAmount: number;
  blendedContributionMarginPercent: number;
  isViableOverall: boolean;
}

/**
 * PROVENTA Home Commercial Unit Economics & Subscription Financial Simulator
 * Models revenue, variable service fulfillment costs, GST, payment processing,
 * dispute warranty reserves, and contribution margin across multiple utilization profiles.
 */
export class HomePricingEngine {
  // Agreed network partner payout per subscription-bundled routine visit
  private static STANDARD_TECH_PAYOUT_PER_VISIT = 280; // INR
  private static GST_RATE = 0.18; // 18% GST
  private static PAYMENT_GATEWAY_FEE_RATE = 0.02; // 2%
  private static SUPPORT_COORDINATION_COST_PER_SUB = 35; // INR per active member/month
  private static WARRANTY_REWORK_RESERVE_PER_SUB = 20; // INR per member/month

  /**
   * Calculates detailed unit economics for a given plan tier and visit utilization assumption.
   */
  public static calculatePlanEconomics(
    tier: SubscriptionPlanTier,
    subscriberCohortSize: number,
    averageVisitsUtilisedPerMonth: number,
    customTechnicianPayout?: number
  ): UnitEconomicsSimulation {
    const plan = HOME_SUBSCRIPTION_PLANS.find(p => p.tier === tier);
    if (!plan) throw new Error(`Unknown plan tier: ${tier}`);

    const monthlyPrice = plan.monthlyPrice;
    const payoutPerVisit = customTechnicianPayout || this.STANDARD_TECH_PAYOUT_PER_VISIT;

    // Per subscriber monthly numbers:
    const grossRevenue = monthlyPrice * subscriberCohortSize;
    // GST portion inside billing
    const netBasePrice = monthlyPrice / (1 + this.GST_RATE);
    const gstTaxDeduction = (monthlyPrice - netBasePrice) * subscriberCohortSize;
    const paymentGatewayFee = monthlyPrice * this.PAYMENT_GATEWAY_FEE_RATE * subscriberCohortSize;

    // Direct fulfillment costs
    const directTechnicianCost = averageVisitsUtilisedPerMonth * payoutPerVisit * subscriberCohortSize;
    const customerSupportAndCoordinationCost = this.SUPPORT_COORDINATION_COST_PER_SUB * subscriberCohortSize;
    const disputeAndReworkCostReserve = this.WARRANTY_REWORK_RESERVE_PER_SUB * subscriberCohortSize;

    const totalVariableCost = 
      gstTaxDeduction +
      paymentGatewayFee +
      directTechnicianCost +
      customerSupportAndCoordinationCost +
      disputeAndReworkCostReserve;

    const contributionMarginAmount = grossRevenue - totalVariableCost;
    const contributionMarginPercent = Number(((contributionMarginAmount / grossRevenue) * 100).toFixed(1));
    const isProfitable = contributionMarginAmount > 0;

    // Break-even formula: net revenue after taxes and fixed support / technician payout
    const netRetainedPerSub = (monthlyPrice - (monthlyPrice - netBasePrice) - (monthlyPrice * this.PAYMENT_GATEWAY_FEE_RATE) - this.SUPPORT_COORDINATION_COST_PER_SUB - this.WARRANTY_REWORK_RESERVE_PER_SUB);
    const breakEvenVisitsPerMonth = Number(Math.max(0, netRetainedPerSub / payoutPerVisit).toFixed(2));

    return {
      planTier: tier,
      monthlySubscriptionPrice: monthlyPrice,
      projectedSubscribers: subscriberCohortSize,
      averageVisitsUsedPerMonth: averageVisitsUtilisedPerMonth,
      technicianPayoutPerVisit: payoutPerVisit,
      grossRevenue: Math.round(grossRevenue),
      gstTaxDeduction: Math.round(gstTaxDeduction),
      paymentGatewayFee: Math.round(paymentGatewayFee),
      directTechnicianCost: Math.round(directTechnicianCost),
      customerSupportAndCoordinationCost: Math.round(customerSupportAndCoordinationCost),
      disputeAndReworkCostReserve: Math.round(disputeAndReworkCostReserve),
      totalVariableCost: Math.round(totalVariableCost),
      contributionMarginAmount: Math.round(contributionMarginAmount),
      contributionMarginPercent,
      isProfitable,
      breakEvenVisitsPerMonth
    };
  }

  /**
   * Runs complete 3-tier sensitivity scenario analysis.
   */
  public static runScenario(
    scenario: 'LOW_UTILISATION' | 'EXPECTED_UTILISATION' | 'HIGH_UTILISATION',
    subscriberCounts = { ESSENTIAL: 1000, FAMILY: 1500, PREMIUM: 500 }
  ): ScenarioResult {
    // Empirically calibrated urban Indian household maintenance utilization regimes
    const utilizationRates = {
      LOW_UTILISATION: {
        label: 'Low Utilisation (Infrequent Maintenance Callouts)',
        rates: { ESSENTIAL: 0.3, FAMILY: 0.6, PREMIUM: 1.2 }
      },
      EXPECTED_UTILISATION: {
        label: 'Expected Baseline (Empirical Urban Indian Average)',
        rates: { ESSENTIAL: 0.5, FAMILY: 0.9, PREMIUM: 1.8 }
      },
      HIGH_UTILISATION: {
        label: 'High Stress (Peak Pre-Monsoon & Summer Surge)',
        rates: { ESSENTIAL: 0.9, FAMILY: 1.6, PREMIUM: 2.8 }
      }
    }[scenario];

    const simEssential = this.calculatePlanEconomics('ESSENTIAL', subscriberCounts.ESSENTIAL, utilizationRates.rates.ESSENTIAL);
    const simFamily = this.calculatePlanEconomics('FAMILY', subscriberCounts.FAMILY, utilizationRates.rates.FAMILY);
    const simPremium = this.calculatePlanEconomics('PREMIUM', subscriberCounts.PREMIUM, utilizationRates.rates.PREMIUM);

    const blendedMonthlyRevenue = simEssential.grossRevenue + simFamily.grossRevenue + simPremium.grossRevenue;
    const blendedVariableCost = simEssential.totalVariableCost + simFamily.totalVariableCost + simPremium.totalVariableCost;
    const blendedContributionMarginAmount = blendedMonthlyRevenue - blendedVariableCost;
    const blendedContributionMarginPercent = Number(((blendedContributionMarginAmount / blendedMonthlyRevenue) * 100).toFixed(1));

    return {
      scenarioName: scenario,
      label: utilizationRates.label,
      simulations: {
        ESSENTIAL: simEssential,
        FAMILY: simFamily,
        PREMIUM: simPremium
      },
      blendedMonthlyRevenue,
      blendedVariableCost,
      blendedContributionMarginAmount,
      blendedContributionMarginPercent,
      isViableOverall: blendedContributionMarginAmount > 0
    };
  }
}
