/**
 * PROVENTA — FEATURE 3: PROCUREMENT TIMING INTELLIGENCE ENGINE
 * Connects project milestones, BOQ quantities, site inventory, open POs, and receipts
 * to forecast shortages, compute RFQ initiation dates, and generate explainable
 * timing alerts with explicit confidence classifications.
 */

export type TimingAlertType =
  | 'PROCUREMENT_BEGIN_SOON'
  | 'REQUIREMENT_APPROACHING'
  | 'INSUFFICIENT_STOCK'
  | 'DELIVERY_MAY_MISS_DATE'
  | 'PO_DELIVERY_OVERDUE'
  | 'MILESTONE_AT_RISK'
  | 'PRICE_DATA_STALE';

export type ConfidenceClassification = 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT_DATA';

export interface MaterialForecastInput {
  projectId: string;
  projectName: string;
  milestoneName: string;
  materialName: string;
  unit: string;
  boqRequiredQuantity: number;
  availableStockQuantity: number;
  openPoOrderedQuantity: number;
  alreadyReceivedQuantity: number;
  safetyStockQuantity: number;
  requiredByDateIso: string;
  leadTimeDays: number;
  recentMedianUnitPaise?: bigint | null;
  currentQuoteUnitPaise?: bigint | null;
  verifiedPriceObservationCount?: number;
  priceDataAgeDays?: number | null;
  now?: Date;
}

export interface MaterialForecastResult {
  projectId: string;
  projectName: string;
  milestoneName: string;
  materialName: string;
  unit: string;
  requiredQuantity: number;
  availableQuantity: number;
  alreadyOrderedQuantity: number;
  expectedShortage: number;
  recommendedProcurementQuantity: number;
  requiredByDateIso: string;
  suggestedRfqInitiationDateIso: string;
  daysUntilRequired: number;
  daysUntilRfqStart: number;
  alerts: Array<{ type: TimingAlertType; severity: 'INFO' | 'WARNING' | 'CRITICAL'; message: string }>;
  priceTimingExplanation: string;
  confidence: ConfidenceClassification;
  confidenceEvidence: string;
}

export function computeProcurementTimingForecast(input: MaterialForecastInput): MaterialForecastResult {
  const now = input.now ?? new Date();
  const remainingRequirement = Math.max(0, input.boqRequiredQuantity - input.alreadyReceivedQuantity);
  const netPipeline = input.availableStockQuantity + input.openPoOrderedQuantity;
  const expectedShortage = Math.max(0, remainingRequirement - netPipeline);
  const recommendedProcurementQuantity =
    expectedShortage > 0 ? Math.ceil((expectedShortage + input.safetyStockQuantity) * 100) / 100 : 0;

  const requiredDate = new Date(input.requiredByDateIso);
  // Allow leadTimeDays + 7 days for RFQ bidding & approval buffer
  const rfqLeadBufferDays = Math.max(1, input.leadTimeDays) + 7;
  const suggestedRfqDate = new Date(requiredDate.getTime() - rfqLeadBufferDays * 24 * 3600 * 1000);

  const daysUntilRequired = Math.ceil((requiredDate.getTime() - now.getTime()) / (24 * 3600 * 1000));
  const daysUntilRfqStart = Math.ceil((suggestedRfqDate.getTime() - now.getTime()) / (24 * 3600 * 1000));

  const alerts: MaterialForecastResult['alerts'] = [];

  if (expectedShortage > 0 && daysUntilRfqStart <= 0) {
    alerts.push({
      type: 'MILESTONE_AT_RISK',
      severity: 'CRITICAL',
      message: `Milestone "${input.milestoneName}" at risk: ${expectedShortage} ${input.unit} shortage of ${input.materialName} with only ${daysUntilRequired} day(s) remaining (lead + RFQ buffer: ${rfqLeadBufferDays} days).`,
    });
  } else if (expectedShortage > 0 && daysUntilRfqStart <= 10) {
    alerts.push({
      type: 'PROCUREMENT_BEGIN_SOON',
      severity: 'WARNING',
      message: `Initiate RFQ for ${recommendedProcurementQuantity} ${input.unit} of ${input.materialName} within ${daysUntilRfqStart} day(s) to meet ${input.requiredByDateIso}.`,
    });
  }

  if (input.availableStockQuantity < input.safetyStockQuantity) {
    alerts.push({
      type: 'INSUFFICIENT_STOCK',
      severity: 'WARNING',
      message: `Site stock (${input.availableStockQuantity} ${input.unit}) is below configured safety stock (${input.safetyStockQuantity} ${input.unit}).`,
    });
  }

  if (input.priceDataAgeDays !== null && input.priceDataAgeDays !== undefined && input.priceDataAgeDays > 30) {
    alerts.push({
      type: 'PRICE_DATA_STALE',
      severity: 'INFO',
      message: `Latest verified price benchmark for ${input.materialName} is ${input.priceDataAgeDays} days old. Refresh supplier quotations prior to budget approval.`,
    });
  }

  // Price & timing decision-support explanation (never claims certainty about future prices)
  const obsCount = input.verifiedPriceObservationCount ?? 0;
  let confidence: ConfidenceClassification = 'INSUFFICIENT_DATA';
  let confidenceEvidence = 'Fewer than 3 verified price observations available; timing advice is based strictly on project schedule and lead time.';
  let priceTimingExplanation = `${input.materialName} procurement is required in ${daysUntilRequired} day(s). Insufficient verified historical price data to assess current market spread; collect fresh competitive quotations.`;

  if (obsCount >= 3 && input.recentMedianUnitPaise && input.currentQuoteUnitPaise && input.recentMedianUnitPaise > BigInt(0)) {
    const spreadPct =
      Math.round(
        (Number(input.currentQuoteUnitPaise - input.recentMedianUnitPaise) / Number(input.recentMedianUnitPaise)) *
          10000
      ) / 100;

    confidence = obsCount >= 8 ? 'HIGH' : obsCount >= 5 ? 'MODERATE' : 'LOW';
    confidenceEvidence = `Supported by ${obsCount} verified like-for-like price observations and configured ${input.leadTimeDays}-day supplier lead time.`;

    const direction = spreadPct > 0 ? `${spreadPct}% higher than` : spreadPct < 0 ? `${Math.abs(spreadPct)}% lower than` : 'aligned with';
    priceTimingExplanation = `${input.materialName} procurement is expected within ${daysUntilRequired} day(s). Current available quotation is ${direction} the recent verified median (${obsCount} observations). Note: future commodity prices remain uncertain; validate live quotes before approval.`;
  }

  return {
    projectId: input.projectId,
    projectName: input.projectName,
    milestoneName: input.milestoneName,
    materialName: input.materialName,
    unit: input.unit,
    requiredQuantity: remainingRequirement,
    availableQuantity: input.availableStockQuantity,
    alreadyOrderedQuantity: input.openPoOrderedQuantity,
    expectedShortage,
    recommendedProcurementQuantity,
    requiredByDateIso: input.requiredByDateIso,
    suggestedRfqInitiationDateIso: suggestedRfqDate.toISOString().split('T')[0],
    daysUntilRequired,
    daysUntilRfqStart,
    alerts,
    priceTimingExplanation,
    confidence,
    confidenceEvidence,
  };
}
