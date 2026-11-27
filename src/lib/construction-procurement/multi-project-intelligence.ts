/**
 * PROVENTA — FEATURE 5: MULTI-PROJECT PURCHASING INTELLIGENCE ENGINE
 * Aggregates organisation-wide spending, attributes cross-project rate differences
 * (base, freight, quantity, location, GST, credit terms), identifies supplier concentration,
 * and validates compatibility before consolidating requirements across projects.
 */

import { formatInrFromPaise } from './money';

export interface ProjectPurchaseRecord {
  projectId: string;
  projectName: string;
  city: string;
  materialCategorySlug: string;
  materialName: string;
  specificationSignature: string;
  unit: string;
  quantity: number;
  baseUnitPaise: bigint;
  freightUnitPaise: bigint;
  gstRatePercent: number;
  landedUnitPaise: bigint;
  totalLandedPaise: bigint;
  paymentCreditDays: number;
  supplierBusinessId: string;
  supplierName: string;
}

export interface CrossProjectRateComparison {
  materialName: string;
  specificationSignature: string;
  projectA: { projectId: string; projectName: string; landedUnitFormatted: string; quantity: number };
  projectB: { projectId: string; projectName: string; landedUnitFormatted: string; quantity: number };
  unitDifferencePaise: bigint;
  formattedUnitDifference: string;
  attributedFactors: string[];
}

export interface ConsolidationCandidateInput {
  projectId: string;
  projectName: string;
  city: string;
  materialCategorySlug: string;
  materialName: string;
  specificationSignature: string;
  unit: string;
  quantity: number;
  requiredByDateIso: string;
  eligibleSupplierIds: string[];
}

export interface ConsolidationEvaluation {
  canConsolidate: boolean;
  incompatibilityReasons: string[];
  combinedQuantity: number;
  unit: string;
  projectIds: string[];
  overlappingSupplierIds: string[];
  summary: string;
}

export function evaluateCrossProjectRateVariance(
  purchases: readonly ProjectPurchaseRecord[]
): CrossProjectRateComparison[] {
  const bySpec = new Map<string, ProjectPurchaseRecord[]>();
  for (const p of purchases) {
    const key = `${p.materialCategorySlug}::${p.specificationSignature}::${p.unit}`;
    const list = bySpec.get(key) || [];
    list.push(p);
    bySpec.set(key, list);
  }

  const comparisons: CrossProjectRateComparison[] = [];

  for (const group of bySpec.values()) {
    // Distinct projects only
    const distinctProjects = Array.from(new Map(group.map((g) => [g.projectId, g])).values());
    if (distinctProjects.length < 2) continue;

    distinctProjects.sort((a, b) => (a.landedUnitPaise < b.landedUnitPaise ? -1 : 1));
    const lowest = distinctProjects[0];
    const highest = distinctProjects[distinctProjects.length - 1];
    const diff = highest.landedUnitPaise - lowest.landedUnitPaise;
    if (diff <= BigInt(0)) continue;

    const factors: string[] = [];
    if (highest.baseUnitPaise !== lowest.baseUnitPaise) {
      factors.push(
        `Base price variance (${formatInrFromPaise(lowest.baseUnitPaise)} vs ${formatInrFromPaise(highest.baseUnitPaise)})`
      );
    }
    if (highest.freightUnitPaise !== lowest.freightUnitPaise) {
      factors.push(
        `Freight/distance variance (${formatInrFromPaise(lowest.freightUnitPaise)} vs ${formatInrFromPaise(highest.freightUnitPaise)})`
      );
    }
    if (highest.city.toLowerCase() !== lowest.city.toLowerCase()) {
      factors.push(`Geographic difference (${lowest.city} vs ${highest.city})`);
    }
    if (Math.abs(highest.quantity - lowest.quantity) / Math.max(1, lowest.quantity) > 0.2) {
      factors.push(`Order volume difference (${lowest.quantity} vs ${highest.quantity} ${lowest.unit})`);
    }
    if (highest.paymentCreditDays !== lowest.paymentCreditDays) {
      factors.push(`Credit terms difference (${lowest.paymentCreditDays}d vs ${highest.paymentCreditDays}d)`);
    }
    if (highest.gstRatePercent !== lowest.gstRatePercent) {
      factors.push(`GST treatment difference (${lowest.gstRatePercent}% vs ${highest.gstRatePercent}%)`);
    }
    if (factors.length === 0) {
      factors.push('Commercial terms appear equivalent — review supplier rate negotiation across sites.');
    }

    comparisons.push({
      materialName: lowest.materialName,
      specificationSignature: lowest.specificationSignature,
      projectA: {
        projectId: lowest.projectId,
        projectName: lowest.projectName,
        landedUnitFormatted: formatInrFromPaise(lowest.landedUnitPaise),
        quantity: lowest.quantity,
      },
      projectB: {
        projectId: highest.projectId,
        projectName: highest.projectName,
        landedUnitFormatted: formatInrFromPaise(highest.landedUnitPaise),
        quantity: highest.quantity,
      },
      unitDifferencePaise: diff,
      formattedUnitDifference: formatInrFromPaise(diff),
      attributedFactors: factors,
    });
  }

  return comparisons;
}

/**
 * Evaluates whether multiple project requirements can be safely consolidated into one RFQ.
 * Never combines incompatible specifications, units, distant cities, or divergent delivery windows (> 21 days apart).
 */
export function evaluateConsolidationCompatibility(
  candidates: readonly ConsolidationCandidateInput[]
): ConsolidationEvaluation {
  if (candidates.length < 2) {
    return {
      canConsolidate: false,
      incompatibilityReasons: ['At least two project requirements are required for multi-project consolidation.'],
      combinedQuantity: candidates[0]?.quantity || 0,
      unit: candidates[0]?.unit || '',
      projectIds: candidates.map((c) => c.projectId),
      overlappingSupplierIds: candidates[0]?.eligibleSupplierIds || [],
      summary: 'Select at least 2 projects to evaluate consolidation.',
    };
  }

  const reasons: string[] = [];
  const first = candidates[0];

  const distinctSpecs = new Set(candidates.map((c) => c.specificationSignature.trim().toLowerCase()));
  if (distinctSpecs.size > 1) {
    reasons.push('INCOMPATIBLE_SPECIFICATIONS: Selected requirements have different technical specifications and cannot be merged into one line item.');
  }

  const distinctUnits = new Set(candidates.map((c) => c.unit.trim().toUpperCase()));
  if (distinctUnits.size > 1) {
    reasons.push('INCOMPATIBLE_UNITS: Units of measurement do not match across selected projects.');
  }

  const distinctCities = new Set(candidates.map((c) => c.city.trim().toLowerCase()));
  if (distinctCities.size > 1) {
    reasons.push(`DIVERGENT_LOCATIONS: Delivery cities differ (${Array.from(distinctCities).join(', ')}); verify regional freight feasibility before consolidating.`);
  }

  const timestamps = candidates.map((c) => new Date(c.requiredByDateIso).getTime());
  const scheduleSpreadDays = (Math.max(...timestamps) - Math.min(...timestamps)) / (24 * 3600 * 1000);
  if (scheduleSpreadDays > 21) {
    reasons.push(`SCHEDULE_MISMATCH: Required delivery dates are ${Math.round(scheduleSpreadDays)} days apart (exceeds 21-day consolidation window).`);
  }

  // Supplier intersection across all candidates
  let overlap = new Set(first.eligibleSupplierIds);
  for (const c of candidates.slice(1)) {
    const next = new Set(c.eligibleSupplierIds);
    overlap = new Set([...overlap].filter((id) => next.has(id)));
  }

  const combinedQuantity = candidates.reduce((acc, c) => acc + c.quantity, 0);
  const canConsolidate = reasons.length === 0;

  return {
    canConsolidate,
    incompatibilityReasons: reasons,
    combinedQuantity,
    unit: first.unit,
    projectIds: candidates.map((c) => c.projectId),
    overlappingSupplierIds: Array.from(overlap),
    summary: canConsolidate
      ? `Compatible for consolidation: ${combinedQuantity} ${first.unit} across ${candidates.length} projects with ${overlap.size} overlapping eligible supplier(s).`
      : `Consolidation blocked due to ${reasons.length} compatibility constraint(s).`,
  };
}

export interface SupplierConcentrationMetric {
  supplierBusinessId: string;
  supplierName: string;
  totalSpendPaise: bigint;
  formattedSpend: string;
  sharePercent: number;
  dependencyRisk: 'HIGH' | 'MODERATE' | 'BALANCED';
}

export function computeSupplierConcentration(
  purchases: readonly ProjectPurchaseRecord[]
): SupplierConcentrationMetric[] {
  const totalSpend = purchases.reduce((acc, p) => acc + p.totalLandedPaise, BigInt(0));
  if (totalSpend <= BigInt(0)) return [];

  const bySupplier = new Map<string, { name: string; spend: bigint }>();
  for (const p of purchases) {
    const curr = bySupplier.get(p.supplierBusinessId) || { name: p.supplierName, spend: BigInt(0) };
    curr.spend += p.totalLandedPaise;
    bySupplier.set(p.supplierBusinessId, curr);
  }

  return Array.from(bySupplier.entries())
    .map(([id, info]) => {
      const sharePercent = Math.round((Number(info.spend) / Number(totalSpend)) * 10000) / 100;
      return {
        supplierBusinessId: id,
        supplierName: info.name,
        totalSpendPaise: info.spend,
        formattedSpend: formatInrFromPaise(info.spend),
        sharePercent,
        dependencyRisk: (sharePercent >= 50 ? 'HIGH' : sharePercent >= 30 ? 'MODERATE' : 'BALANCED') as 'HIGH' | 'MODERATE' | 'BALANCED',
      };
    })
    .sort((a, b) => b.sharePercent - a.sharePercent);
}
