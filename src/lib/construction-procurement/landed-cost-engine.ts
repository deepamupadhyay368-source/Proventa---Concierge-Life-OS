/**
 * PROVENTA — FEATURE 6: TRUE LANDED COST ENGINE
 * Centralised, auditable integer-paise calculation service used across quotations,
 * comparisons, approvals, purchase orders, analytics, savings, and invoice reconciliation.
 * Prevents double-counting GST/freight, enforces like-for-like comparability,
 * deduplicates quotation versions, and generates explainable buyer decision support.
 */

import { calculateGstPaise, formatInrFromPaise } from './money';
import { evaluateSpecificationEquivalence, type SpecEquivalenceResult } from './taxonomy';

export interface TrueLandedCostInput {
  currency: 'INR';
  quantity: number;
  unit: string;
  baseMaterialPaise: bigint;
  gstRatePercent: number;
  gstIncludedInBase?: boolean;
  freightPaise: bigint;
  freightIncludedInBase?: boolean;
  loadingPaise: bigint;
  unloadingPaise: bigint;
  insurancePaise: bigint;
  packagingPaise: bigint;
  otherChargesPaise: bigint;
  discountPaise: bigint;
  deductionsPaise?: bigint;
  creditTermAdjustmentPaise?: bigint;
}

export interface TrueLandedCostResult {
  currency: 'INR';
  quantity: number;
  unit: string;
  baseMaterialPaise: bigint;
  calculatedGstPaise: bigint;
  effectiveFreightPaise: bigint;
  handlingAndLogisticsPaise: bigint;
  discountAndDeductionsPaise: bigint;
  totalLandedCostPaise: bigint;
  unitLandedCostPaise: bigint;
  formattedTotalLandedCost: string;
  formattedUnitLandedCost: string;
  doubleCountPreventionNotes: string[];
  roundingRule: string;
}

export function computeTrueLandedCost(input: TrueLandedCostInput): TrueLandedCostResult {
  if (input.currency !== 'INR') {
    throw new Error(`UNSUPPORTED_CURRENCY: Only INR is supported (received ${input.currency})`);
  }
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new Error('INVALID_QUANTITY: Quantity must be greater than zero');
  }

  const nonNegativeFields: Array<[string, bigint]> = [
    ['baseMaterialPaise', input.baseMaterialPaise],
    ['freightPaise', input.freightPaise],
    ['loadingPaise', input.loadingPaise],
    ['unloadingPaise', input.unloadingPaise],
    ['insurancePaise', input.insurancePaise],
    ['packagingPaise', input.packagingPaise],
    ['otherChargesPaise', input.otherChargesPaise],
    ['discountPaise', input.discountPaise],
    ['deductionsPaise', input.deductionsPaise ?? BigInt(0)],
  ];
  for (const [field, val] of nonNegativeFields) {
    if (val < BigInt(0)) {
      throw new Error(`NEGATIVE_COST_COMPONENT: ${field} cannot be negative`);
    }
  }

  const notes: string[] = [];
  const deductions = input.deductionsPaise ?? BigInt(0);
  const creditAdj = input.creditTermAdjustmentPaise ?? BigInt(0);

  // Prevent double-counting freight if already included in base price
  let effectiveFreightPaise = input.freightPaise;
  if (input.freightIncludedInBase && input.freightPaise > BigInt(0)) {
    effectiveFreightPaise = BigInt(0);
    notes.push('Freight already included in base quotation; separate freight charge zeroed to prevent double-counting.');
  }

  const taxableBaseAfterDiscount =
    input.baseMaterialPaise > input.discountPaise
      ? input.baseMaterialPaise - input.discountPaise
      : BigInt(0);

  // Prevent double-counting GST if already included in base price
  let calculatedGstPaise: bigint;
  if (input.gstIncludedInBase) {
    calculatedGstPaise = BigInt(0);
    notes.push('GST already included in base quotation; separate GST addition suppressed to prevent double-counting.');
  } else {
    calculatedGstPaise = calculateGstPaise(taxableBaseAfterDiscount, input.gstRatePercent);
  }

  const handlingAndLogisticsPaise =
    effectiveFreightPaise +
    input.loadingPaise +
    input.unloadingPaise +
    input.insurancePaise +
    input.packagingPaise +
    input.otherChargesPaise;

  const grossPaise = taxableBaseAfterDiscount + calculatedGstPaise + handlingAndLogisticsPaise + creditAdj;
  const totalLandedCostPaise = grossPaise > deductions ? grossPaise - deductions : BigInt(0);

  // Half-up integer rounding scaled by 1000 for 3-decimal quantities
  const scaledQty = BigInt(Math.round(input.quantity * 1000));
  const unitLandedCostPaise = (totalLandedCostPaise * BigInt(1000) + scaledQty / BigInt(2)) / scaledQty;

  return {
    currency: 'INR',
    quantity: input.quantity,
    unit: input.unit,
    baseMaterialPaise: input.baseMaterialPaise,
    calculatedGstPaise,
    effectiveFreightPaise,
    handlingAndLogisticsPaise,
    discountAndDeductionsPaise: input.discountPaise + deductions,
    totalLandedCostPaise,
    unitLandedCostPaise,
    formattedTotalLandedCost: formatInrFromPaise(totalLandedCostPaise),
    formattedUnitLandedCost: formatInrFromPaise(unitLandedCostPaise),
    doubleCountPreventionNotes: notes,
    roundingRule: 'Integer INR paise (BigInt); half-up rounding to nearest 1 paise (₹0.01).',
  };
}

export interface VersionedQuotationOffer {
  quotationId: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  versionNumber: number;
  unit: string;
  categorySlug: string;
  requestedSpecs: Record<string, string | undefined>;
  quotedSpecs: Record<string, string | undefined>;
  acceptableAlternativeBrands?: string[];
  costInput: TrueLandedCostInput;
  deliveryDays: number;
  paymentTerms: string;
  validUntilIso: string;
  supplierReliabilityScore: number | null; // Null when insufficient evidence
}

/**
 * Ensures revised quotation versions from the same supplier on the same RFQ
 * are never treated as separate competing offers. Keeps only the highest versionNumber.
 */
export function deduplicateQuotationVersions<T extends { rfqId: string; supplierId: string; versionNumber: number }>(
  offers: readonly T[]
): T[] {
  const latestBySupplier = new Map<string, T>();
  for (const offer of offers) {
    const key = `${offer.rfqId}::${offer.supplierId}`;
    const existing = latestBySupplier.get(key);
    if (!existing || offer.versionNumber > existing.versionNumber) {
      latestBySupplier.set(key, offer);
    }
  }
  return Array.from(latestBySupplier.values());
}

export interface DecisionSupportComparison {
  comparableOffers: Array<{
    quotationId: string;
    supplierId: string;
    supplierName: string;
    versionNumber: number;
    landedCost: TrueLandedCostResult;
    technicalCompliance: SpecEquivalenceResult;
    deliveryDays: number;
    paymentTerms: string;
    supplierReliabilityScore: number | null;
    isExpired: boolean;
    costDiffFromLowestPaise: bigint;
    percentDiffFromLowest: number;
  }>;
  incomparableOffers: Array<{
    quotationId: string;
    supplierName: string;
    reasons: string[];
  }>;
  explainableSummary: string;
}

export function evaluateComparableOffers(
  offers: readonly VersionedQuotationOffer[],
  expectedUnit: string,
  now: Date = new Date()
): DecisionSupportComparison {
  const deduped = deduplicateQuotationVersions(offers);
  const comparable: DecisionSupportComparison['comparableOffers'] = [];
  const incomparable: DecisionSupportComparison['incomparableOffers'] = [];

  for (const offer of deduped) {
    const reasons: string[] = [];
    if (offer.unit.trim().toUpperCase() !== expectedUnit.trim().toUpperCase()) {
      reasons.push(`UNIT_MISMATCH: Quoted in ${offer.unit} instead of required ${expectedUnit}`);
    }
    const tech = evaluateSpecificationEquivalence(
      offer.categorySlug,
      offer.requestedSpecs,
      offer.quotedSpecs,
      offer.acceptableAlternativeBrands || []
    );
    if (tech.hasMaterialMismatch) {
      reasons.push(tech.summary);
    }
    const isExpired = new Date(offer.validUntilIso).getTime() < now.getTime();
    if (isExpired) {
      reasons.push(`QUOTATION_EXPIRED: Valid until ${offer.validUntilIso}`);
    }

    if (reasons.length > 0) {
      incomparable.push({
        quotationId: offer.quotationId,
        supplierName: offer.supplierName,
        reasons,
      });
      continue;
    }

    const landedCost = computeTrueLandedCost(offer.costInput);
    comparable.push({
      quotationId: offer.quotationId,
      supplierId: offer.supplierId,
      supplierName: offer.supplierName,
      versionNumber: offer.versionNumber,
      landedCost,
      technicalCompliance: tech,
      deliveryDays: offer.deliveryDays,
      paymentTerms: offer.paymentTerms,
      supplierReliabilityScore: offer.supplierReliabilityScore,
      isExpired: false,
      costDiffFromLowestPaise: BigInt(0),
      percentDiffFromLowest: 0,
    });
  }

  comparable.sort((a, b) =>
    a.landedCost.totalLandedCostPaise < b.landedCost.totalLandedCostPaise ? -1 : 1
  );

  if (comparable.length > 0) {
    const lowest = comparable[0].landedCost.totalLandedCostPaise;
    for (const row of comparable) {
      row.costDiffFromLowestPaise = row.landedCost.totalLandedCostPaise - lowest;
      row.percentDiffFromLowest =
        lowest > BigInt(0)
          ? Math.round((Number(row.costDiffFromLowestPaise) / Number(lowest)) * 10000) / 100
          : 0;
    }
  }

  let explainableSummary =
    'No like-for-like compliant quotations are currently available for commercial ranking.';
  if (comparable.length === 1) {
    explainableSummary = `${comparable[0].supplierName} is the only spec-compliant offer at ${comparable[0].landedCost.formattedTotalLandedCost} (${comparable[0].deliveryDays} days delivery). Obtain additional quotes before award where policy requires competitive bidding.`;
  } else if (comparable.length >= 2) {
    const cheapest = comparable[0];
    const highestReliability = [...comparable]
      .filter((c) => c.supplierReliabilityScore !== null)
      .sort((a, b) => (b.supplierReliabilityScore ?? 0) - (a.supplierReliabilityScore ?? 0))[0];

    if (highestReliability && highestReliability.quotationId !== cheapest.quotationId) {
      const dayDiff = cheapest.deliveryDays - highestReliability.deliveryDays;
      const deliveryClause =
        dayDiff > 0
          ? `${cheapest.supplierName}'s delivery commitment is ${dayDiff} day(s) slower.`
          : dayDiff < 0
          ? `${cheapest.supplierName} also commits to ${Math.abs(dayDiff)} day(s) faster delivery.`
          : 'Both commit to the same delivery lead time.';
      explainableSummary = `${cheapest.supplierName} offers the lowest comparable landed cost (${cheapest.landedCost.formattedTotalLandedCost}), while ${highestReliability.supplierName} has a higher recorded reliability score (${highestReliability.supplierReliabilityScore}/100, +${highestReliability.percentDiffFromLowest}% cost). ${deliveryClause} Buyer retains final award authority.`;
    } else {
      explainableSummary = `${cheapest.supplierName} offers the lowest comparable landed cost at ${cheapest.landedCost.formattedTotalLandedCost} (${cheapest.deliveryDays} days delivery). Final approval and award require authorised buyer sign-off.`;
    }
  }

  return {
    comparableOffers: comparable,
    incomparableOffers: incomparable,
    explainableSummary,
  };
}
