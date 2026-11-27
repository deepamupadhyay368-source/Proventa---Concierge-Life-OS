/**
 * PROVENTA — Procurement Savings Intelligence Engine
 * Strictly separates POTENTIAL savings (quotation vs baseline) from REALISED savings
 * (strictly linked to approved PO + Goods Receipt / Supplier Invoice evidence).
 * Never fabricates historical prices or guarantees savings.
 */

import { calculateLineSubtotalPaise, formatInrFromPaise } from './money';

export interface BenchmarkDisclosure {
  dataSource: string;
  observationDateIso: string;
  productSpecification: string;
  geography: string;
  sampleSize: number;
  limitations: string;
}

export interface SavingsCalculationInput {
  classification: 'POTENTIAL' | 'REALISED';
  rfqId: string;
  purchaseOrderId?: string | null;
  goodsReceiptId?: string | null;
  invoiceNumber?: string | null;
  quantity: number;
  unit: string;
  baselineUnitLandedPaise: bigint;
  comparedUnitLandedPaise: bigint;
  disclosure: BenchmarkDisclosure;
}

export interface SavingsCalculationResult {
  classification: 'POTENTIAL' | 'REALISED';
  unitDifferencePaise: bigint;
  totalSavingsPaise: bigint;
  savingsPercent: number;
  formattedTotalSavings: string;
  formattedBaselineTotal: string;
  formattedComparedTotal: string;
  evidenceVerified: boolean;
  disclosure: BenchmarkDisclosure;
}

export function computeProcurementSavings(input: SavingsCalculationInput): SavingsCalculationResult {
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new Error('INVALID_QUANTITY: Quantity must be greater than zero');
  }

  if (input.baselineUnitLandedPaise <= BigInt(0) || input.comparedUnitLandedPaise <= BigInt(0)) {
    throw new Error('INVALID_PRICE: Baseline and compared unit prices must be positive integer paise');
  }

  // Mandatory integrity rule: Realised savings MUST be backed by an approved PO AND delivery/invoice evidence
  if (input.classification === 'REALISED') {
    if (!input.purchaseOrderId) {
      throw new Error(
        'SAVINGS_INTEGRITY_ERROR: Realised savings cannot be recorded without an approved Purchase Order ID. Classify unexecuted quotation differences as POTENTIAL.'
      );
    }
    if (!input.goodsReceiptId && !input.invoiceNumber) {
      throw new Error(
        'SAVINGS_INTEGRITY_ERROR: Realised savings must be linked to actual Goods Receipt (GRN) or Supplier Invoice evidence.'
      );
    }
  }

  if (!input.disclosure.dataSource || !input.disclosure.limitations || input.disclosure.sampleSize < 1) {
    throw new Error(
      'BENCHMARK_DISCLOSURE_INCOMPLETE: Every benchmark must disclose dataSource, sampleSize (>= 1), and limitations.'
    );
  }

  const baselineTotalPaise = calculateLineSubtotalPaise(input.baselineUnitLandedPaise, input.quantity);
  const comparedTotalPaise = calculateLineSubtotalPaise(input.comparedUnitLandedPaise, input.quantity);
  const unitDifferencePaise = input.baselineUnitLandedPaise - input.comparedUnitLandedPaise;
  const totalSavingsPaise = baselineTotalPaise - comparedTotalPaise;

  // Percentage computed to 2 decimal places
  const savingsPercent =
    Math.round((Number(totalSavingsPaise) / Number(baselineTotalPaise)) * 10000) / 100;

  return {
    classification: input.classification,
    unitDifferencePaise,
    totalSavingsPaise,
    savingsPercent,
    formattedTotalSavings: formatInrFromPaise(totalSavingsPaise),
    formattedBaselineTotal: formatInrFromPaise(baselineTotalPaise),
    formattedComparedTotal: formatInrFromPaise(comparedTotalPaise),
    evidenceVerified: input.classification === 'REALISED',
    disclosure: input.disclosure,
  };
}
