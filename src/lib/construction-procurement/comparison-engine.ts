/**
 * PROVENTA — Intelligent Comparison Centre Engine
 * Like-for-like landed-cost comparison in integer paise.
 * Never auto-recommends lowest price; keeps technical compliance independent;
 * flags specification mismatches explicitly; zero fabricated rankings or scores.
 */

import { calculateLandedCostPaise, formatInrFromPaise } from './money';
import { evaluateSpecificationEquivalence, type SpecEquivalenceResult } from './taxonomy';

export interface ComparisonQuotationInput {
  quotationId: string;
  supplierId: string;
  supplierName: string;
  verificationStatus: 'REGISTERED' | 'DOCUMENTS_SUBMITTED' | 'VERIFICATION_PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';
  brandQuoted: string;
  quotedSpecs: Record<string, string | undefined>;
  quantity: number;
  unit: string;
  baseMaterialPaise: bigint;
  gstPaise: bigint;
  freightPaise: bigint;
  loadingPaise: bigint;
  unloadingPaise: bigint;
  insurancePaise: bigint;
  otherChargesPaise: bigint;
  discountPaise: bigint;
  deliveryDays: number;
  paymentTerms: string;
  paymentCreditDays: number;
  validUntilIso: string;
  warrantyTerms?: string;
  historicalOnTimeRatePercent?: number | null; // Null when no documented history exists
  documentedOrderCount?: number;
}

export interface EvaluatedQuotationRow {
  quotationId: string;
  supplierId: string;
  supplierName: string;
  verificationStatus: ComparisonQuotationInput['verificationStatus'];
  brandQuoted: string;
  quantity: number;
  unit: string;
  baseMaterialPaise: bigint;
  gstPaise: bigint;
  freightPaise: bigint;
  loadingPaise: bigint;
  unloadingPaise: bigint;
  insurancePaise: bigint;
  otherChargesPaise: bigint;
  discountPaise: bigint;
  totalLandedCostPaise: bigint;
  unitLandedCostPaise: bigint;
  formattedTotalLandedCost: string;
  formattedUnitLandedCost: string;
  deliveryDays: number;
  paymentTerms: string;
  paymentCreditDays: number;
  validUntilIso: string;
  isExpired: boolean;
  technicalCompliance: SpecEquivalenceResult;
  historicalOnTimeRatePercent: number | null;
  documentedOrderCount: number;
  badges: string[];
}

export interface ComparisonMatrixResult {
  rfqId: string;
  categorySlug: string;
  requestedSpecs: Record<string, string | undefined>;
  evaluatedAtIso: string;
  rows: EvaluatedQuotationRow[];
  highlights: {
    lowestBasePriceQuotationId: string | null;
    lowestLandedCostQuotationId: string | null;
    lowestCompliantLandedCostQuotationId: string | null;
    fastestDeliveryQuotationId: string | null;
    bestPaymentTermsQuotationId: string | null;
    bestTechnicalMatchQuotationIds: string[];
  };
  nonEquivalentWarningCount: number;
  governanceNote: string;
}

export function buildComparisonMatrix(params: {
  rfqId: string;
  categorySlug: string;
  requestedSpecs: Record<string, string | undefined>;
  acceptableAlternativeBrands?: readonly string[];
  quotations: ComparisonQuotationInput[];
  now?: Date;
}): ComparisonMatrixResult {
  const now = params.now ?? new Date();

  const rows: EvaluatedQuotationRow[] = params.quotations.map((q) => {
    const landed = calculateLandedCostPaise({
      baseMaterialPaise: q.baseMaterialPaise,
      gstPaise: q.gstPaise,
      freightPaise: q.freightPaise,
      loadingPaise: q.loadingPaise,
      unloadingPaise: q.unloadingPaise,
      insurancePaise: q.insurancePaise,
      otherChargesPaise: q.otherChargesPaise,
      discountPaise: q.discountPaise,
      quantity: q.quantity,
    });

    const tech = evaluateSpecificationEquivalence(
      params.categorySlug,
      params.requestedSpecs,
      { ...q.quotedSpecs, brand: q.brandQuoted },
      params.acceptableAlternativeBrands || []
    );

    const isExpired = new Date(q.validUntilIso).getTime() < now.getTime();

    return {
      quotationId: q.quotationId,
      supplierId: q.supplierId,
      supplierName: q.supplierName,
      verificationStatus: q.verificationStatus,
      brandQuoted: q.brandQuoted,
      quantity: q.quantity,
      unit: q.unit,
      baseMaterialPaise: landed.baseMaterialPaise,
      gstPaise: landed.gstPaise,
      freightPaise: landed.freightPaise,
      loadingPaise: landed.loadingPaise,
      unloadingPaise: landed.unloadingPaise,
      insurancePaise: landed.insurancePaise,
      otherChargesPaise: landed.otherChargesPaise,
      discountPaise: landed.discountPaise,
      totalLandedCostPaise: landed.totalLandedCostPaise,
      unitLandedCostPaise: landed.unitLandedCostPaise,
      formattedTotalLandedCost: formatInrFromPaise(landed.totalLandedCostPaise),
      formattedUnitLandedCost: formatInrFromPaise(landed.unitLandedCostPaise),
      deliveryDays: q.deliveryDays,
      paymentTerms: q.paymentTerms,
      paymentCreditDays: q.paymentCreditDays,
      validUntilIso: q.validUntilIso,
      isExpired,
      technicalCompliance: tech,
      historicalOnTimeRatePercent: q.historicalOnTimeRatePercent ?? null,
      documentedOrderCount: q.documentedOrderCount ?? 0,
      badges: [],
    };
  });

  // Sort by total landed cost ascending for inspection clarity (not an automated award recommendation)
  rows.sort((a, b) =>
    a.totalLandedCostPaise < b.totalLandedCostPaise
      ? -1
      : a.totalLandedCostPaise > b.totalLandedCostPaise
      ? 1
      : 0
  );

  const activeRows = rows.filter((r) => !r.isExpired && r.verificationStatus !== 'SUSPENDED' && r.verificationStatus !== 'REJECTED');
  const compliantRows = activeRows.filter((r) => !r.technicalCompliance.hasMaterialMismatch);

  const lowestBase = activeRows.length
    ? [...activeRows].sort((a, b) => (a.baseMaterialPaise < b.baseMaterialPaise ? -1 : 1))[0]
    : null;
  const lowestLanded = activeRows.length ? activeRows[0] : null;
  const lowestCompliantLanded = compliantRows.length ? compliantRows[0] : null;
  const fastestDelivery = activeRows.length
    ? [...activeRows].sort((a, b) => a.deliveryDays - b.deliveryDays)[0]
    : null;
  const bestPayment = activeRows.length
    ? [...activeRows].sort((a, b) => b.paymentCreditDays - a.paymentCreditDays)[0]
    : null;
  const bestTechIds = compliantRows.map((r) => r.quotationId);

  for (const row of rows) {
    if (lowestBase && row.quotationId === lowestBase.quotationId) row.badges.push('LOWEST_BASE_PRICE');
    if (lowestLanded && row.quotationId === lowestLanded.quotationId) row.badges.push('LOWEST_LANDED_COST');
    if (lowestCompliantLanded && row.quotationId === lowestCompliantLanded.quotationId) {
      row.badges.push('LOWEST_SPEC_COMPLIANT_LANDED_COST');
    }
    if (fastestDelivery && row.quotationId === fastestDelivery.quotationId) row.badges.push('FASTEST_DELIVERY');
    if (bestPayment && row.quotationId === bestPayment.quotationId) row.badges.push('BEST_PAYMENT_TERMS');
    if (row.technicalCompliance.hasMaterialMismatch) row.badges.push('SPEC_MISMATCH_FLAGGED');
    if (row.isExpired) row.badges.push('EXPIRED_QUOTATION');
  }

  return {
    rfqId: params.rfqId,
    categorySlug: params.categorySlug,
    requestedSpecs: params.requestedSpecs,
    evaluatedAtIso: now.toISOString(),
    rows,
    highlights: {
      lowestBasePriceQuotationId: lowestBase?.quotationId ?? null,
      lowestLandedCostQuotationId: lowestLanded?.quotationId ?? null,
      lowestCompliantLandedCostQuotationId: lowestCompliantLanded?.quotationId ?? null,
      fastestDeliveryQuotationId: fastestDelivery?.quotationId ?? null,
      bestPaymentTermsQuotationId: bestPayment?.quotationId ?? null,
      bestTechnicalMatchQuotationIds: bestTechIds,
    },
    nonEquivalentWarningCount: rows.filter((r) => r.technicalCompliance.hasMaterialMismatch).length,
    governanceNote:
      'PROVENTA displays commercial and technical comparisons side-by-side without auto-recommending the lowest price. Technical compliance, supplier verification, and commercial terms must be independently approved prior to award.',
  };
}
