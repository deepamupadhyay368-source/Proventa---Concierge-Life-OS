/**
 * PROVENTA — Construction & Infrastructure Procurement Platform
 * Unit & Material Specification Normalizer
 * Enforces fair landed-cost evaluation and prevents silent comparison of incompatible units/specs.
 */

import type { ConstructionUnit } from '@/lib/brand';

export type UnitDimensionFamily = 'WEIGHT' | 'VOLUME' | 'AREA' | 'LENGTH' | 'PACKAGING' | 'COUNT' | 'UNKNOWN';

export interface UnitNormalizationResult {
  isCompatible: boolean;
  requiresConversion: boolean;
  conversionFactor: number; // multiply supplier unit price by this to get equivalent price in buyer's unit
  buyerUnit: string;
  supplierUnit: string;
  notes?: string;
}

const UNIT_FAMILY_MAP: Record<string, UnitDimensionFamily> = {
  // Weight
  'metric tonnes (mt)': 'WEIGHT',
  'metric tonnes': 'WEIGHT',
  'mt': 'WEIGHT',
  'kilograms (kg)': 'WEIGHT',
  'kilograms': 'WEIGHT',
  'kg': 'WEIGHT',

  // Volume
  'cubic metres (cu.m)': 'VOLUME',
  'cubic metres': 'VOLUME',
  'cu.m': 'VOLUME',
  'cubic feet (cu.ft)': 'VOLUME',
  'cubic feet': 'VOLUME',
  'cu.ft': 'VOLUME',
  'litres (l)': 'VOLUME',
  'litres': 'VOLUME',
  'l': 'VOLUME',

  // Area
  'square feet (sq.ft)': 'AREA',
  'square feet': 'AREA',
  'sq.ft': 'AREA',
  'square metres (sq.m)': 'AREA',
  'square metres': 'AREA',
  'sq.m': 'AREA',

  // Length
  'running metres (r.m)': 'LENGTH',
  'running metres': 'LENGTH',
  'r.m': 'LENGTH',
  'metres': 'LENGTH',
  'm': 'LENGTH',

  // Packaging / Count
  'bags': 'PACKAGING',
  'boxes': 'PACKAGING',
  'pieces (nos)': 'COUNT',
  'pieces': 'COUNT',
  'nos': 'COUNT',
  'units': 'COUNT',
  'sets': 'COUNT',
};

export function getUnitFamily(rawUnit: string): UnitDimensionFamily {
  if (!rawUnit) return 'UNKNOWN';
  const clean = rawUnit.trim().toLowerCase();
  return UNIT_FAMILY_MAP[clean] || 'UNKNOWN';
}

/**
 * Evaluates whether two units are compatible and calculates conversion factor.
 */
export function evaluateUnitCompatibility(
  buyerUnit: string,
  supplierUnit: string
): UnitNormalizationResult {
  const cleanBuyer = (buyerUnit || '').trim().toLowerCase();
  const cleanSupplier = (supplierUnit || '').trim().toLowerCase();

  // 1. Exact or canonical identity match
  if (cleanBuyer === cleanSupplier) {
    return {
      isCompatible: true,
      requiresConversion: false,
      conversionFactor: 1.0,
      buyerUnit,
      supplierUnit,
    };
  }

  // Common identity variations
  const isBuyerMt = cleanBuyer.includes('metric tonnes') || cleanBuyer === 'mt';
  const isSupplierMt = cleanSupplier.includes('metric tonnes') || cleanSupplier === 'mt';
  const isBuyerKg = cleanBuyer.includes('kilograms') || cleanBuyer === 'kg';
  const isSupplierKg = cleanSupplier.includes('kilograms') || cleanSupplier === 'kg';

  if (isBuyerMt && isSupplierMt) {
    return { isCompatible: true, requiresConversion: false, conversionFactor: 1.0, buyerUnit, supplierUnit };
  }
  if (isBuyerKg && isSupplierKg) {
    return { isCompatible: true, requiresConversion: false, conversionFactor: 1.0, buyerUnit, supplierUnit };
  }

  // Weight conversion: MT <-> KG (1 MT = 1000 KG)
  if (isBuyerMt && isSupplierKg) {
    // Supplier price is in ₹/KG. Buyer wants ₹/MT. (₹/MT = ₹/KG * 1000)
    return {
      isCompatible: true,
      requiresConversion: true,
      conversionFactor: 1000.0,
      buyerUnit,
      supplierUnit,
      notes: 'Supplier quoted in Kilograms (KG). Normalized to Metric tonnes (MT) for fair comparison (1 MT = 1,000 KG).',
    };
  }

  if (isBuyerKg && isSupplierMt) {
    // Supplier price is in ₹/MT. Buyer wants ₹/KG. (₹/KG = ₹/MT / 1000)
    return {
      isCompatible: true,
      requiresConversion: true,
      conversionFactor: 0.001,
      buyerUnit,
      supplierUnit,
      notes: 'Supplier quoted in Metric tonnes (MT). Normalized to Kilograms (KG) for fair comparison (1 KG = 0.001 MT).',
    };
  }

  // Volume conversion: Cu.m <-> Cu.ft (1 Cu.m = 35.3147 Cu.ft)
  const isBuyerCum = cleanBuyer.includes('cubic metres') || cleanBuyer === 'cu.m';
  const isSupplierCum = cleanSupplier.includes('cubic metres') || cleanSupplier === 'cu.m';
  const isBuyerCuft = cleanBuyer.includes('cubic feet') || cleanBuyer === 'cu.ft';
  const isSupplierCuft = cleanSupplier.includes('cubic feet') || cleanSupplier === 'cu.ft';

  if (isBuyerCum && isSupplierCum) {
    return { isCompatible: true, requiresConversion: false, conversionFactor: 1.0, buyerUnit, supplierUnit };
  }
  if (isBuyerCuft && isSupplierCuft) {
    return { isCompatible: true, requiresConversion: false, conversionFactor: 1.0, buyerUnit, supplierUnit };
  }
  if (isBuyerCum && isSupplierCuft) {
    return {
      isCompatible: true,
      requiresConversion: true,
      conversionFactor: 35.3147,
      buyerUnit,
      supplierUnit,
      notes: 'Supplier quoted in Cubic feet (Cu.ft). Normalized to Cubic metres (Cu.m) (1 Cu.m ≈ 35.31 Cu.ft).',
    };
  }
  if (isBuyerCuft && isSupplierCum) {
    return {
      isCompatible: true,
      requiresConversion: true,
      conversionFactor: 1 / 35.3147,
      buyerUnit,
      supplierUnit,
      notes: 'Supplier quoted in Cubic metres (Cu.m). Normalized to Cubic feet (Cu.ft).',
    };
  }

  // Length identity: Running metres vs Running metres (R.m) vs Metres
  const isBuyerRm = cleanBuyer.includes('running metres') || cleanBuyer.includes('r.m') || cleanBuyer === 'metres';
  const isSupplierRm = cleanSupplier.includes('running metres') || cleanSupplier.includes('r.m') || cleanSupplier === 'metres';
  if (isBuyerRm && isSupplierRm) {
    return {
      isCompatible: true,
      requiresConversion: false,
      conversionFactor: 1.0,
      buyerUnit,
      supplierUnit,
    };
  }

  // Pieces / Nos identity
  const isBuyerPieces = cleanBuyer.includes('pieces') || cleanBuyer.includes('nos') || cleanBuyer === 'units';
  const isSupplierPieces = cleanSupplier.includes('pieces') || cleanSupplier.includes('nos') || cleanSupplier === 'units';
  if (isBuyerPieces && isSupplierPieces) {
    return {
      isCompatible: true,
      requiresConversion: false,
      conversionFactor: 1.0,
      buyerUnit,
      supplierUnit,
    };
  }

  // Different or incompatible families (e.g. Bags vs Running metres, MT vs Pieces)
  const familyBuyer = getUnitFamily(buyerUnit);
  const familySupplier = getUnitFamily(supplierUnit);

  if (familyBuyer !== familySupplier || familyBuyer === 'UNKNOWN') {
    return {
      isCompatible: false,
      requiresConversion: false,
      conversionFactor: 1.0,
      buyerUnit,
      supplierUnit,
      notes: `Incompatible procurement units: Buyer requested '${buyerUnit}' (${familyBuyer}) while supplier quoted '${supplierUnit}' (${familySupplier}). Silent rate comparison is blocked.`,
    };
  }

  return {
    isCompatible: true,
    requiresConversion: false,
    conversionFactor: 1.0,
    buyerUnit,
    supplierUnit,
  };
}
