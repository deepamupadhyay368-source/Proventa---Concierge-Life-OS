/**
 * PROVENTA — Integer Paise Monetary Arithmetic Engine
 * All financial ledger, quotation, landed-cost, 3-way match, and savings calculations
 * use integer paise (BigInt / safe integer) to eliminate floating-point rounding drift.
 */

export function rupeesToPaise(rupees: number | string): bigint {
  if (typeof rupees === 'string') {
    const cleaned = rupees.replace(/,/g, '').trim();
    if (!/^-?\d+(\.\d{1,2})?$/.test(cleaned)) {
      throw new Error(`INVALID_INR_AMOUNT: "${rupees}" is not a valid INR decimal value`);
    }
    const negative = cleaned.startsWith('-');
    const unsigned = negative ? cleaned.slice(1) : cleaned;
    const [wholeStr, fracStr = ''] = unsigned.split('.');
    const paddedFrac = (fracStr + '00').slice(0, 2);
    const total = BigInt(wholeStr) * BigInt(100) + BigInt(paddedFrac);
    return negative ? -total : total;
  }

  if (!Number.isFinite(rupees)) {
    throw new Error(`INVALID_INR_AMOUNT: non-finite number ${rupees}`);
  }
  return BigInt(Math.round(rupees * 100));
}

export function paiseToRupeesNumber(paise: bigint): number {
  return Number(paise) / 100;
}

export function formatInrFromPaise(paise: bigint): string {
  const negative = paise < BigInt(0);
  const abs = negative ? -paise : paise;
  const whole = abs / BigInt(100);
  const frac = abs % BigInt(100);
  const formattedWhole = Number(whole).toLocaleString('en-IN');
  const fracStr = frac.toString().padStart(2, '0');
  return `${negative ? '-' : ''}₹${formattedWhole}.${fracStr}`;
}

export function calculateLineSubtotalPaise(unitRatePaise: bigint, quantity: number): bigint {
  if (unitRatePaise < BigInt(0)) {
    throw new Error('Unit rate in paise cannot be negative');
  }
  if (!Number.isFinite(quantity) || quantity < 0) {
    throw new Error('Quantity must be a non-negative finite number');
  }
  // Scale quantity by 1000 to support up to 3 decimal places (e.g. 12.500 MT) in integer math
  const scaledQty = BigInt(Math.round(quantity * 1000));
  return (unitRatePaise * scaledQty + BigInt(500)) / BigInt(1000);
}

export function calculateGstPaise(taxableAmountPaise: bigint, gstRatePercent: number): bigint {
  if (!Number.isFinite(gstRatePercent) || gstRatePercent < 0 || gstRatePercent > 100) {
    throw new Error(`Invalid GST rate percent: ${gstRatePercent}`);
  }
  const basisPoints = BigInt(Math.round(gstRatePercent * 100));
  return (taxableAmountPaise * basisPoints + BigInt(5000)) / BigInt(10000);
}

export interface LandedCostInput {
  baseMaterialPaise: bigint;
  gstPaise: bigint;
  freightPaise: bigint;
  loadingPaise: bigint;
  unloadingPaise: bigint;
  insurancePaise: bigint;
  otherChargesPaise: bigint;
  discountPaise: bigint;
  quantity: number;
}

export interface LandedCostBreakdown {
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
}

export function calculateLandedCostPaise(input: LandedCostInput): LandedCostBreakdown {
  const fields: Array<[string, bigint]> = [
    ['baseMaterialPaise', input.baseMaterialPaise],
    ['gstPaise', input.gstPaise],
    ['freightPaise', input.freightPaise],
    ['loadingPaise', input.loadingPaise],
    ['unloadingPaise', input.unloadingPaise],
    ['insurancePaise', input.insurancePaise],
    ['otherChargesPaise', input.otherChargesPaise],
    ['discountPaise', input.discountPaise],
  ];

  for (const [name, value] of fields) {
    if (value < BigInt(0)) {
      throw new Error(`INVALID_COST_COMPONENT: ${name} cannot be negative`);
    }
  }

  const grossPaise =
    input.baseMaterialPaise +
    input.gstPaise +
    input.freightPaise +
    input.loadingPaise +
    input.unloadingPaise +
    input.insurancePaise +
    input.otherChargesPaise;

  const totalLandedCostPaise = grossPaise > input.discountPaise ? grossPaise - input.discountPaise : BigInt(0);

  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new Error('Quantity must be greater than zero to compute unit landed cost');
  }

  const scaledQty = BigInt(Math.round(input.quantity * 1000));
  const unitLandedCostPaise = (totalLandedCostPaise * BigInt(1000) + scaledQty / BigInt(2)) / scaledQty;

  return {
    ...input,
    totalLandedCostPaise,
    unitLandedCostPaise,
  };
}
