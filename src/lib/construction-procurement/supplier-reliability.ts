/**
 * PROVENTA — FEATURE 4: SUPPLIER RELIABILITY INTELLIGENCE ENGINE
 * Evidence-based supplier scoring with configurable administrator weights,
 * minimum sample-size enforcement, and strict separation of INSUFFICIENT_DATA
 * from poor performance. Suppliers can never directly edit their scores.
 */

export interface ReliabilityWeights {
  deliveryReliabilityPct: number; // default 25
  qualityPerformancePct: number;  // default 25
  quantityFulfilmentPct: number;  // default 15
  quotationResponsePct: number;   // default 10
  commercialAccuracyPct: number;  // default 10
  disputePerformancePct: number;  // default 10
  documentationPct: number;       // default 5
  minSampleTransactions: number;  // default 3
}

export const DEFAULT_RELIABILITY_WEIGHTS: ReliabilityWeights = {
  deliveryReliabilityPct: 25,
  qualityPerformancePct: 25,
  quantityFulfilmentPct: 15,
  quotationResponsePct: 10,
  commercialAccuracyPct: 10,
  disputePerformancePct: 10,
  documentationPct: 5,
  minSampleTransactions: 3,
};

export interface SupplierEvidenceInput {
  supplierBusinessId: string;
  supplierName: string;
  periodStartIso: string;
  periodEndIso: string;
  completedTransactions: number;
  onTimeDeliveries: number;
  totalDeliveries: number;
  acceptedUnits: number;
  receivedUnits: number;
  orderedUnits: number;
  rfqsResponded: number;
  rfqsInvited: number;
  matchedInvoices: number;
  totalInvoices: number;
  substantiatedDisputes: number;
  verifiedDocumentsCount: number;
  requiredDocumentsCount: number;
}

export interface SupplierReliabilityResult {
  supplierBusinessId: string;
  supplierName: string;
  status: 'SCORED' | 'INSUFFICIENT_DATA';
  completedTransactions: number;
  minSampleRequired: number;
  compositeScore: number | null; // Strictly null when status === INSUFFICIENT_DATA
  dimensionScores: {
    deliveryReliability: number | null;
    qualityPerformance: number | null;
    quantityFulfilment: number | null;
    quotationResponsiveness: number | null;
    commercialAccuracy: number | null;
    disputePerformance: number | null;
    documentation: number | null;
  };
  weightsApplied: ReliabilityWeights;
  periodStartIso: string;
  periodEndIso: string;
  methodologyExplanation: string;
}

function clamp100(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val * 100) / 100));
}

export function validateReliabilityWeights(weights: ReliabilityWeights): void {
  const sum =
    weights.deliveryReliabilityPct +
    weights.qualityPerformancePct +
    weights.quantityFulfilmentPct +
    weights.quotationResponsePct +
    weights.commercialAccuracyPct +
    weights.disputePerformancePct +
    weights.documentationPct;

  if (sum !== 100) {
    throw new Error(`INVALID_RELIABILITY_WEIGHTS: Dimension weights must sum to 100% (got ${sum}%)`);
  }
  if (weights.minSampleTransactions < 1) {
    throw new Error('INVALID_RELIABILITY_WEIGHTS: minSampleTransactions must be at least 1');
  }
}

export function computeSupplierReliabilityScore(
  evidence: SupplierEvidenceInput,
  weights: ReliabilityWeights = DEFAULT_RELIABILITY_WEIGHTS
): SupplierReliabilityResult {
  validateReliabilityWeights(weights);

  // Never give high scores simply because a supplier has zero deliveries or zero disputes
  if (evidence.completedTransactions < weights.minSampleTransactions) {
    return {
      supplierBusinessId: evidence.supplierBusinessId,
      supplierName: evidence.supplierName,
      status: 'INSUFFICIENT_DATA',
      completedTransactions: evidence.completedTransactions,
      minSampleRequired: weights.minSampleTransactions,
      compositeScore: null,
      dimensionScores: {
        deliveryReliability: null,
        qualityPerformance: null,
        quantityFulfilment: null,
        quotationResponsiveness: null,
        commercialAccuracy: null,
        disputePerformance: null,
        documentation:
          evidence.requiredDocumentsCount > 0
            ? clamp100((evidence.verifiedDocumentsCount / evidence.requiredDocumentsCount) * 100)
            : null,
      },
      weightsApplied: weights,
      periodStartIso: evidence.periodStartIso,
      periodEndIso: evidence.periodEndIso,
      methodologyExplanation: `Insufficient recorded transaction history (${evidence.completedTransactions}/${weights.minSampleTransactions} completed transactions required). PROVENTA never assigns high reliability scores solely due to absence of disputes.`,
    };
  }

  const deliveryReliability =
    evidence.totalDeliveries > 0
      ? clamp100((evidence.onTimeDeliveries / evidence.totalDeliveries) * 100)
      : 0;

  const qualityPerformance =
    evidence.receivedUnits > 0
      ? clamp100((evidence.acceptedUnits / evidence.receivedUnits) * 100)
      : 0;

  const quantityFulfilment =
    evidence.orderedUnits > 0
      ? clamp100((evidence.acceptedUnits / evidence.orderedUnits) * 100)
      : 0;

  const quotationResponsiveness =
    evidence.rfqsInvited > 0
      ? clamp100((evidence.rfqsResponded / evidence.rfqsInvited) * 100)
      : 0;

  const commercialAccuracy =
    evidence.totalInvoices > 0
      ? clamp100((evidence.matchedInvoices / evidence.totalInvoices) * 100)
      : 0;

  const disputeRate = evidence.substantiatedDisputes / Math.max(1, evidence.completedTransactions);
  const disputePerformance = clamp100((1 - disputeRate) * 100);

  const documentation =
    evidence.requiredDocumentsCount > 0
      ? clamp100((evidence.verifiedDocumentsCount / evidence.requiredDocumentsCount) * 100)
      : 0;

  const composite =
    (deliveryReliability * weights.deliveryReliabilityPct +
      qualityPerformance * weights.qualityPerformancePct +
      quantityFulfilment * weights.quantityFulfilmentPct +
      quotationResponsiveness * weights.quotationResponsePct +
      commercialAccuracy * weights.commercialAccuracyPct +
      disputePerformance * weights.disputePerformancePct +
      documentation * weights.documentationPct) /
    100;

  return {
    supplierBusinessId: evidence.supplierBusinessId,
    supplierName: evidence.supplierName,
    status: 'SCORED',
    completedTransactions: evidence.completedTransactions,
    minSampleRequired: weights.minSampleTransactions,
    compositeScore: clamp100(composite),
    dimensionScores: {
      deliveryReliability,
      qualityPerformance,
      quantityFulfilment,
      quotationResponsiveness,
      commercialAccuracy,
      disputePerformance,
      documentation,
    },
    weightsApplied: weights,
    periodStartIso: evidence.periodStartIso,
    periodEndIso: evidence.periodEndIso,
    methodologyExplanation: `Weighted composite across ${evidence.completedTransactions} verified transactions (${evidence.periodStartIso} to ${evidence.periodEndIso}): Delivery ${weights.deliveryReliabilityPct}%, Quality ${weights.qualityPerformancePct}%, Quantity ${weights.quantityFulfilmentPct}%, Responsiveness ${weights.quotationResponsePct}%, Invoice Accuracy ${weights.commercialAccuracyPct}%, Disputes ${weights.disputePerformancePct}%, Docs ${weights.documentationPct}%.`,
  };
}
