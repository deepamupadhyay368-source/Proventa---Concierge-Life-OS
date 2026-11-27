/**
 * PROVENTA — Order Fulfilment, Goods Receipt (GRN) & Three-Way Matching Engine
 * Reconciles PURCHASE ORDER + GOODS RECEIVED + SUPPLIER INVOICE in integer paise.
 * Flags quantity, rate, or tax discrepancies automatically.
 */

import { calculateLineSubtotalPaise, calculateGstPaise, formatInrFromPaise } from './money';

export interface ThreeWayMatchInput {
  purchaseOrderId: string;
  invoiceNumber: string;
  poOrderedQuantity: number;
  poUnitRatePaise: bigint;
  poGstRatePercent: number;
  grnAcceptedQuantity: number | null; // Null when GRN not yet recorded
  invoiceBilledQuantity: number;
  invoiceUnitRatePaise: bigint;
  invoiceTaxAmountPaise: bigint;
  invoiceTotalAmountPaise: bigint;
}

export interface ThreeWayMatchEvaluation {
  status: 'MATCHED' | 'QUANTITY_DISCREPANCY' | 'RATE_DISCREPANCY' | 'TAX_DISCREPANCY' | 'MISSING_GRN';
  poTotalPaise: bigint;
  grnValuePaise: bigint;
  invoiceTotalPaise: bigint;
  variancePaise: bigint;
  formattedPoTotal: string;
  formattedGrnValue: string;
  formattedInvoiceTotal: string;
  formattedVariance: string;
  discrepancyReasons: string[];
  eligibleForPaymentApproval: boolean;
}

export function evaluateThreeWayMatch(input: ThreeWayMatchInput): ThreeWayMatchEvaluation {
  const poSubtotal = calculateLineSubtotalPaise(input.poUnitRatePaise, input.poOrderedQuantity);
  const poTax = calculateGstPaise(poSubtotal, input.poGstRatePercent);
  const poTotalPaise = poSubtotal + poTax;

  const discrepancyReasons: string[] = [];

  if (input.grnAcceptedQuantity === null || input.grnAcceptedQuantity === undefined) {
    return {
      status: 'MISSING_GRN',
      poTotalPaise,
      grnValuePaise: BigInt(0),
      invoiceTotalPaise: input.invoiceTotalAmountPaise,
      variancePaise: input.invoiceTotalAmountPaise,
      formattedPoTotal: formatInrFromPaise(poTotalPaise),
      formattedGrnValue: formatInrFromPaise(BigInt(0)),
      formattedInvoiceTotal: formatInrFromPaise(input.invoiceTotalAmountPaise),
      formattedVariance: formatInrFromPaise(input.invoiceTotalAmountPaise),
      discrepancyReasons: [
        'MISSING_GRN: Goods Receipt Note (GRN) has not been recorded for this delivery. Payment cannot be approved before site receipt verification.',
      ],
      eligibleForPaymentApproval: false,
    };
  }

  const grnSubtotal = calculateLineSubtotalPaise(input.poUnitRatePaise, input.grnAcceptedQuantity);
  const grnTax = calculateGstPaise(grnSubtotal, input.poGstRatePercent);
  const grnValuePaise = grnSubtotal + grnTax;

  let status: ThreeWayMatchEvaluation['status'] = 'MATCHED';

  // 1. Check quantity billed vs accepted at site (GRN) and ordered on PO
  if (input.invoiceBilledQuantity > input.grnAcceptedQuantity + 0.001) {
    status = 'QUANTITY_DISCREPANCY';
    discrepancyReasons.push(
      `QUANTITY_OVERBILL: Invoice bills ${input.invoiceBilledQuantity} units, but Goods Receipt verified only ${input.grnAcceptedQuantity} accepted units (PO ordered: ${input.poOrderedQuantity}).`
    );
  }
  if (input.invoiceBilledQuantity > input.poOrderedQuantity + 0.001) {
    status = 'QUANTITY_DISCREPANCY';
    discrepancyReasons.push(
      `EXCEEDS_PO_QUANTITY: Invoice quantity (${input.invoiceBilledQuantity}) exceeds Purchase Order quantity (${input.poOrderedQuantity}).`
    );
  }

  // 2. Check unit rate against approved PO unit rate (strict integer paise comparison)
  if (input.invoiceUnitRatePaise !== input.poUnitRatePaise) {
    if (status === 'MATCHED') status = 'RATE_DISCREPANCY';
    discrepancyReasons.push(
      `RATE_MISMATCH: Invoice unit rate (${formatInrFromPaise(input.invoiceUnitRatePaise)}) does not match approved PO unit rate (${formatInrFromPaise(input.poUnitRatePaise)}).`
    );
  }

  // 3. Check tax calculation against expected GST on billed accepted quantity (tolerance <= 100 paise / ₹1 rounding)
  const expectedInvoiceSubtotal = calculateLineSubtotalPaise(input.poUnitRatePaise, input.invoiceBilledQuantity);
  const expectedInvoiceTax = calculateGstPaise(expectedInvoiceSubtotal, input.poGstRatePercent);
  const taxDiff =
    input.invoiceTaxAmountPaise >= expectedInvoiceTax
      ? input.invoiceTaxAmountPaise - expectedInvoiceTax
      : expectedInvoiceTax - input.invoiceTaxAmountPaise;

  if (taxDiff > BigInt(100)) {
    if (status === 'MATCHED') status = 'TAX_DISCREPANCY';
    discrepancyReasons.push(
      `TAX_MISMATCH: Invoice tax (${formatInrFromPaise(input.invoiceTaxAmountPaise)}) deviates from expected ${input.poGstRatePercent}% GST (${formatInrFromPaise(expectedInvoiceTax)}).`
    );
  }

  const variancePaise = input.invoiceTotalAmountPaise - grnValuePaise;

  return {
    status,
    poTotalPaise,
    grnValuePaise,
    invoiceTotalPaise: input.invoiceTotalAmountPaise,
    variancePaise,
    formattedPoTotal: formatInrFromPaise(poTotalPaise),
    formattedGrnValue: formatInrFromPaise(grnValuePaise),
    formattedInvoiceTotal: formatInrFromPaise(input.invoiceTotalAmountPaise),
    formattedVariance: formatInrFromPaise(variancePaise),
    discrepancyReasons,
    eligibleForPaymentApproval: status === 'MATCHED' && discrepancyReasons.length === 0,
  };
}

export interface DisputeAuditEntry {
  timestampIso: string;
  actorUserId: string;
  action: 'CREATED' | 'ASSIGNED' | 'EVIDENCE_ADDED' | 'STATUS_CHANGED' | 'RESOLVED' | 'CLOSED';
  note: string;
  previousStatus?: string;
  newStatus?: string;
}

/**
 * Append-only dispute history helper. Existing entries are never mutated or deleted.
 */
export function appendDisputeAuditEntry(
  existingHistory: readonly DisputeAuditEntry[],
  nextEntry: DisputeAuditEntry
): DisputeAuditEntry[] {
  return [...existingHistory, { ...nextEntry }];
}
