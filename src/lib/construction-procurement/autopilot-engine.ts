/**
 * PROVENTA — FEATURE 7: PROCUREMENT AUTOPILOT ENGINE
 * Human-controlled operational workflow assistant for RFQ drafting, explainable supplier matching,
 * quotation follow-ups, deterministic quotation analysis, and delivery exception monitoring.
 * STRICT RULE: No automated workflow may approve, award, amend, or commit a purchase without
 * explicit human authorisation. Works 100% deterministically even when AI API key is unconfigured.
 */

import { evaluateSpecificationEquivalence } from './taxonomy';
import { computeTrueLandedCost, type TrueLandedCostInput } from './landed-cost-engine';

export interface SupplierMatchCandidate {
  supplierBusinessId: string;
  supplierName: string;
  categoriesServed: string[];
  citiesServed: string[];
  verificationStatus: 'VERIFIED' | 'VERIFICATION_PENDING' | 'REGISTERED' | 'SUSPENDED' | 'REJECTED';
  minOrderQuantity?: number | null;
  reliabilityScore: number | null;
  completedTransactions: number;
  responseRatePercent: number | null;
}

export interface ExplainedSupplierRecommendation {
  supplierBusinessId: string;
  supplierName: string;
  eligible: boolean;
  matchReasons: string[];
  cautions: string[];
}

export function matchSuppliersForRfq(params: {
  categorySlug: string;
  deliveryCity: string;
  requestedQuantity: number;
  candidates: readonly SupplierMatchCandidate[];
}): ExplainedSupplierRecommendation[] {
  const normCity = params.deliveryCity.trim().toLowerCase();

  return params.candidates
    .filter((c) => c.verificationStatus !== 'SUSPENDED' && c.verificationStatus !== 'REJECTED')
    .map((c) => {
      const matchReasons: string[] = [];
      const cautions: string[] = [];

      const categoryMatch = c.categoriesServed.includes(params.categorySlug);
      if (categoryMatch) matchReasons.push(`Serves category ${params.categorySlug}`);
      else cautions.push(`Category ${params.categorySlug} not listed on supplier catalogue`);

      const cityMatch = c.citiesServed.some((city) => city.trim().toLowerCase() === normCity);
      if (cityMatch) matchReasons.push(`Active delivery coverage in ${params.deliveryCity}`);
      else cautions.push(`No confirmed service corridor in ${params.deliveryCity}`);

      if (c.verificationStatus === 'VERIFIED') {
        matchReasons.push('GSTIN & business verification confirmed');
      } else {
        cautions.push(`Verification status is ${c.verificationStatus} (unverified supplier)`);
      }

      if (c.minOrderQuantity && params.requestedQuantity < c.minOrderQuantity) {
        cautions.push(`Requested qty (${params.requestedQuantity}) is below supplier MOQ (${c.minOrderQuantity})`);
      }

      if (c.reliabilityScore !== null) {
        matchReasons.push(`Documented reliability score: ${c.reliabilityScore}/100 (${c.completedTransactions} transactions)`);
      } else {
        cautions.push('Insufficient transaction history for reliability score');
      }

      return {
        supplierBusinessId: c.supplierBusinessId,
        supplierName: c.supplierName,
        eligible: categoryMatch && cityMatch,
        matchReasons,
        cautions,
      };
    })
    .sort((a, b) => Number(b.eligible) - Number(a.eligible));
}

export interface QuotationAnalysisInput {
  quotationId: string;
  supplierName: string;
  categorySlug: string;
  requestedSpecs: Record<string, string | undefined>;
  quotedSpecs: Record<string, string | undefined>;
  costInput: TrueLandedCostInput;
  paymentTerms?: string;
  validUntilIso?: string;
  baselineUnitPaise?: bigint | null;
}

export interface QuotationAnalysisReport {
  quotationId: string;
  supplierName: string;
  missingFields: string[];
  specEquivalence: ReturnType<typeof evaluateSpecificationEquivalence>;
  landedCostFormatted: string;
  unitLandedCostFormatted: string;
  priceDeviationPercent: number | null;
  followUpQuestions: string[];
  approvalSummaryNote: string;
  humanAuthorisationRequired: true;
  aiAssisted: boolean;
}

export function runDeterministicQuotationAnalysis(input: QuotationAnalysisInput): QuotationAnalysisReport {
  const missingFields: string[] = [];
  const followUpQuestions: string[] = [];

  if (!input.paymentTerms?.trim()) {
    missingFields.push('paymentTerms');
    followUpQuestions.push('Confirm exact payment terms and credit period against GRN.');
  }
  if (!input.validUntilIso?.trim()) {
    missingFields.push('validUntilIso');
    followUpQuestions.push('Provide quotation validity expiry date.');
  }

  const specEquivalence = evaluateSpecificationEquivalence(
    input.categorySlug,
    input.requestedSpecs,
    input.quotedSpecs
  );
  if (specEquivalence.hasMaterialMismatch) {
    followUpQuestions.push(
      `Clarify technical deviation: ${specEquivalence.deviations.map((d) => `${d.label} (${d.quotedValue} vs required ${d.requiredValue})`).join('; ')}.`
    );
  }

  const landed = computeTrueLandedCost(input.costInput);

  let priceDeviationPercent: number | null = null;
  if (input.baselineUnitPaise && input.baselineUnitPaise > BigInt(0)) {
    priceDeviationPercent =
      Math.round(
        (Number(landed.unitLandedCostPaise - input.baselineUnitPaise) / Number(input.baselineUnitPaise)) * 10000
      ) / 100;
    if (priceDeviationPercent > 8) {
      followUpQuestions.push(
        `Unit landed rate (${landed.formattedUnitLandedCost}) is ${priceDeviationPercent}% above historical baseline. Request itemized breakdown or volume discount.`
      );
    }
  }

  return {
    quotationId: input.quotationId,
    supplierName: input.supplierName,
    missingFields,
    specEquivalence,
    landedCostFormatted: landed.formattedTotalLandedCost,
    unitLandedCostFormatted: landed.formattedUnitLandedCost,
    priceDeviationPercent,
    followUpQuestions,
    approvalSummaryNote: `${input.supplierName}: ${landed.formattedTotalLandedCost} (${landed.formattedUnitLandedCost}/${landed.unit}). Spec status: ${specEquivalence.hasMaterialMismatch ? 'NON-EQUIVALENT — REVIEW REQUIRED' : 'Compliant'}. Human approval required prior to award.`,
    humanAuthorisationRequired: true,
    aiAssisted: Boolean(process.env.GEMINI_API_KEY),
  };
}

export interface DeliveryMonitorInput {
  purchaseOrderId: string;
  deliveryCode: string;
  expectedDeliveryDateIso: string;
  orderedQuantity: number;
  receivedQuantity: number;
  status: string;
  now?: Date;
}

export function detectDeliveryExceptions(deliveries: readonly DeliveryMonitorInput[]) {
  const exceptions: Array<{
    purchaseOrderId: string;
    deliveryCode: string;
    exceptionType: 'DELIVERY_OVERDUE' | 'QUANTITY_SHORTAGE';
    severity: 'WARNING' | 'CRITICAL';
    message: string;
  }> = [];

  for (const d of deliveries) {
    const now = d.now ?? new Date();
    const expected = new Date(d.expectedDeliveryDateIso);
    if (!['DELIVERED', 'CANCELLED'].includes(d.status) && expected.getTime() < now.getTime()) {
      const overdueDays = Math.ceil((now.getTime() - expected.getTime()) / (24 * 3600 * 1000));
      exceptions.push({
        purchaseOrderId: d.purchaseOrderId,
        deliveryCode: d.deliveryCode,
        exceptionType: 'DELIVERY_OVERDUE',
        severity: overdueDays >= 3 ? 'CRITICAL' : 'WARNING',
        message: `Delivery ${d.deliveryCode} for PO ${d.purchaseOrderId} is ${overdueDays} day(s) past expected date (${d.expectedDeliveryDateIso}).`,
      });
    }
    if (d.status === 'DELIVERED' && d.receivedQuantity < d.orderedQuantity - 0.001) {
      exceptions.push({
        purchaseOrderId: d.purchaseOrderId,
        deliveryCode: d.deliveryCode,
        exceptionType: 'QUANTITY_SHORTAGE',
        severity: 'CRITICAL',
        message: `Delivery ${d.deliveryCode} marked DELIVERED with shortage (${d.receivedQuantity} received vs ${d.orderedQuantity} ordered).`,
      });
    }
  }

  return exceptions;
}
