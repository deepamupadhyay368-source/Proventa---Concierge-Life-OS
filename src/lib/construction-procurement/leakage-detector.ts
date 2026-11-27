/**
 * PROVENTA — FEATURE 1: PROCUREMENT LEAKAGE DETECTOR ENGINE
 * Transparent, explainable anomaly detection across procurement transactions.
 * Never labels anomalies as fraud; classifies accurately and separates
 * Potential Leakage, Confirmed Leakage, and Recovered Savings.
 */

import { formatInrFromPaise } from './money';

export type LeakageCategory =
  | 'POTENTIAL_COST_LEAKAGE'
  | 'DUPLICATE_TRANSACTION_RISK'
  | 'QUANTITY_DISCREPANCY'
  | 'PRICE_ANOMALY'
  | 'APPROVAL_POLICY_VIOLATION'
  | 'MISSING_DOCUMENTATION'
  | 'REQUIRES_HUMAN_REVIEW';

export type LeakageSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DetectedLeakageFinding {
  category: LeakageCategory;
  severity: LeakageSeverity;
  projectId?: string;
  materialName: string;
  supplierBusinessId?: string;
  supplierName?: string;
  transactionType: 'RFQ' | 'QUOTATION' | 'PO' | 'GRN' | 'INVOICE';
  transactionRef: string;
  detectedAmountPaise: bigint;
  baselineAmountPaise: bigint | null;
  potentialExposurePaise: bigint;
  percentageDeviation: number | null;
  explanation: string;
  supportingEvidence: Record<string, unknown>;
}

export interface LeakageScanInput {
  organisationId: string;
  priceDeviationThresholdPct?: number; // default 8%
  freightShareThresholdPct?: number;   // default 12%
  approvalThresholdPaise?: bigint;     // default ₹5,00,000
  purchaseOrders: Array<{
    poId: string;
    projectId?: string;
    materialName: string;
    specificationSignature: string;
    supplierBusinessId: string;
    supplierName: string;
    quantity: number;
    approvedRequirementQuantity?: number;
    unitLandedPaise: bigint;
    totalAmountPaise: bigint;
    freightPaise?: bigint;
    baselineUnitPaise?: bigint | null;
    approvedByUserId?: string | null;
    quotationCountOnRfq?: number;
    createdAtIso: string;
  }>;
  invoices: Array<{
    invoiceNumber: string;
    purchaseOrderId: string;
    supplierBusinessId: string;
    supplierName: string;
    materialName: string;
    projectId?: string;
    billedQuantity: number;
    grnAcceptedQuantity: number | null;
    invoiceTotalPaise: bigint;
    poTotalPaise: bigint;
  }>;
}

export function runProcurementLeakageScan(input: LeakageScanInput): DetectedLeakageFinding[] {
  const findings: DetectedLeakageFinding[] = [];
  const priceThreshold = input.priceDeviationThresholdPct ?? 8;
  const freightThreshold = input.freightShareThresholdPct ?? 12;
  const approvalThreshold = input.approvalThresholdPaise ?? BigInt(500_000_00);

  // 1. Duplicate Invoice Detection (same supplier + invoiceNumber within org)
  const seenInvoices = new Map<string, string>();
  for (const inv of input.invoices) {
    const key = `${inv.supplierBusinessId}::${inv.invoiceNumber.trim().toUpperCase()}`;
    if (seenInvoices.has(key)) {
      findings.push({
        category: 'DUPLICATE_TRANSACTION_RISK',
        severity: 'CRITICAL',
        projectId: inv.projectId,
        materialName: inv.materialName,
        supplierBusinessId: inv.supplierBusinessId,
        supplierName: inv.supplierName,
        transactionType: 'INVOICE',
        transactionRef: inv.invoiceNumber,
        detectedAmountPaise: inv.invoiceTotalPaise,
        baselineAmountPaise: BigInt(0),
        potentialExposurePaise: inv.invoiceTotalPaise,
        percentageDeviation: 100,
        explanation: `Duplicate invoice reference ${inv.invoiceNumber} detected for ${inv.supplierName} (previously linked to PO ${seenInvoices.get(key)}). Requires immediate human finance review before payment.`,
        supportingEvidence: {
          firstPurchaseOrderId: seenInvoices.get(key),
          duplicatePurchaseOrderId: inv.purchaseOrderId,
          invoiceNumber: inv.invoiceNumber,
        },
      });
    } else {
      seenInvoices.set(key, inv.purchaseOrderId);
    }

    // 2. Invoice vs GRN Quantity Discrepancy
    if (inv.grnAcceptedQuantity !== null && inv.billedQuantity > inv.grnAcceptedQuantity + 0.001) {
      const overbilledRatio = (inv.billedQuantity - inv.grnAcceptedQuantity) / Math.max(1, inv.billedQuantity);
      const exposure = BigInt(Math.round(Number(inv.invoiceTotalPaise) * overbilledRatio));
      findings.push({
        category: 'QUANTITY_DISCREPANCY',
        severity: 'HIGH',
        projectId: inv.projectId,
        materialName: inv.materialName,
        supplierBusinessId: inv.supplierBusinessId,
        supplierName: inv.supplierName,
        transactionType: 'INVOICE',
        transactionRef: inv.invoiceNumber,
        detectedAmountPaise: inv.invoiceTotalPaise,
        baselineAmountPaise: inv.poTotalPaise,
        potentialExposurePaise: exposure,
        percentageDeviation: Math.round(overbilledRatio * 10000) / 100,
        explanation: `Invoice ${inv.invoiceNumber} bills ${inv.billedQuantity} units against ${inv.grnAcceptedQuantity} GRN-accepted units on PO ${inv.purchaseOrderId}.`,
        supportingEvidence: {
          billedQuantity: inv.billedQuantity,
          grnAcceptedQuantity: inv.grnAcceptedQuantity,
          purchaseOrderId: inv.purchaseOrderId,
        },
      });
    }
  }

  // 3. Purchase Order Audits (Price Anomalies, Over-Requirement, Approval Violations, Freight, Missing Quotes, Duplicate POs)
  const poSignatureMap = new Map<string, string>();

  for (const po of input.purchaseOrders) {
    // A. Duplicate/overlapping PO risk (same project + spec + supplier + quantity within short window)
    const poKey = `${po.projectId || 'NO_PROJ'}::${po.supplierBusinessId}::${po.specificationSignature}::${po.quantity}`;
    if (poSignatureMap.has(poKey)) {
      findings.push({
        category: 'DUPLICATE_TRANSACTION_RISK',
        severity: 'HIGH',
        projectId: po.projectId,
        materialName: po.materialName,
        supplierBusinessId: po.supplierBusinessId,
        supplierName: po.supplierName,
        transactionType: 'PO',
        transactionRef: po.poId,
        detectedAmountPaise: po.totalAmountPaise,
        baselineAmountPaise: BigInt(0),
        potentialExposurePaise: po.totalAmountPaise,
        percentageDeviation: null,
        explanation: `Potential overlapping Purchase Order ${po.poId} matches supplier, specification, and quantity of ${poSignatureMap.get(poKey)}.`,
        supportingEvidence: { priorPoId: poSignatureMap.get(poKey), currentPoId: po.poId },
      });
    } else {
      poSignatureMap.set(poKey, po.poId);
    }

    // B. Price anomaly vs historical like-for-like baseline
    if (po.baselineUnitPaise && po.baselineUnitPaise > BigInt(0) && po.unitLandedPaise > po.baselineUnitPaise) {
      const diffPct =
        Math.round((Number(po.unitLandedPaise - po.baselineUnitPaise) / Number(po.baselineUnitPaise)) * 10000) / 100;
      if (diffPct >= priceThreshold) {
        const exposure = BigInt(Math.round(Number(po.unitLandedPaise - po.baselineUnitPaise) * po.quantity));
        findings.push({
          category: 'PRICE_ANOMALY',
          severity: diffPct >= 15 ? 'HIGH' : 'MEDIUM',
          projectId: po.projectId,
          materialName: po.materialName,
          supplierBusinessId: po.supplierBusinessId,
          supplierName: po.supplierName,
          transactionType: 'PO',
          transactionRef: po.poId,
          detectedAmountPaise: po.unitLandedPaise,
          baselineAmountPaise: po.baselineUnitPaise,
          potentialExposurePaise: exposure,
          percentageDeviation: diffPct,
          explanation: `Unit landed rate ${formatInrFromPaise(po.unitLandedPaise)} on PO ${po.poId} is ${diffPct}% above the equivalent historical reference (${formatInrFromPaise(po.baselineUnitPaise)}).`,
          supportingEvidence: {
            specificationSignature: po.specificationSignature,
            quantity: po.quantity,
            thresholdPct: priceThreshold,
          },
        });
      }
    }

    // C. Purchase exceeds approved project requirement
    if (po.approvedRequirementQuantity !== undefined && po.quantity > po.approvedRequirementQuantity + 0.001) {
      const excessQty = po.quantity - po.approvedRequirementQuantity;
      const exposure = BigInt(Math.round(Number(po.unitLandedPaise) * excessQty));
      findings.push({
        category: 'QUANTITY_DISCREPANCY',
        severity: 'HIGH',
        projectId: po.projectId,
        materialName: po.materialName,
        supplierBusinessId: po.supplierBusinessId,
        supplierName: po.supplierName,
        transactionType: 'PO',
        transactionRef: po.poId,
        detectedAmountPaise: po.totalAmountPaise,
        baselineAmountPaise: BigInt(Math.round(Number(po.unitLandedPaise) * po.approvedRequirementQuantity)),
        potentialExposurePaise: exposure,
        percentageDeviation: Math.round((excessQty / Math.max(1, po.approvedRequirementQuantity)) * 10000) / 100,
        explanation: `PO ${po.poId} orders ${po.quantity} units, exceeding approved project requirement of ${po.approvedRequirementQuantity} units by ${excessQty}.`,
        supportingEvidence: { ordered: po.quantity, approvedRequirement: po.approvedRequirementQuantity },
      });
    }

    // D. Approval policy violation (high-value PO without documented approver)
    if (po.totalAmountPaise > approvalThreshold && !po.approvedByUserId) {
      findings.push({
        category: 'APPROVAL_POLICY_VIOLATION',
        severity: 'CRITICAL',
        projectId: po.projectId,
        materialName: po.materialName,
        supplierBusinessId: po.supplierBusinessId,
        supplierName: po.supplierName,
        transactionType: 'PO',
        transactionRef: po.poId,
        detectedAmountPaise: po.totalAmountPaise,
        baselineAmountPaise: approvalThreshold,
        potentialExposurePaise: po.totalAmountPaise,
        percentageDeviation: null,
        explanation: `PO ${po.poId} (${formatInrFromPaise(po.totalAmountPaise)}) exceeds the configured approval threshold (${formatInrFromPaise(approvalThreshold)}) without a recorded independent approver.`,
        supportingEvidence: { approvalThresholdPaise: approvalThreshold.toString() },
      });
    }

    // E. Unusually high freight share
    if (po.freightPaise && po.totalAmountPaise > BigInt(0)) {
      const freightPct = Math.round((Number(po.freightPaise) / Number(po.totalAmountPaise)) * 10000) / 100;
      if (freightPct > freightThreshold) {
        findings.push({
          category: 'POTENTIAL_COST_LEAKAGE',
          severity: 'MEDIUM',
          projectId: po.projectId,
          materialName: po.materialName,
          supplierBusinessId: po.supplierBusinessId,
          supplierName: po.supplierName,
          transactionType: 'PO',
          transactionRef: po.poId,
          detectedAmountPaise: po.freightPaise,
          baselineAmountPaise: BigInt(Math.round(Number(po.totalAmountPaise) * (freightThreshold / 100))),
          potentialExposurePaise: po.freightPaise - BigInt(Math.round(Number(po.totalAmountPaise) * (freightThreshold / 100))),
          percentageDeviation: freightPct,
          explanation: `Freight charge (${formatInrFromPaise(po.freightPaise)}) represents ${freightPct}% of PO ${po.poId} total value (above ${freightThreshold}% review threshold).`,
          supportingEvidence: { freightPct, freightThreshold },
        });
      }
    }

    // F. Missing competitive quotations
    if (po.quotationCountOnRfq !== undefined && po.quotationCountOnRfq < 2 && po.totalAmountPaise > approvalThreshold) {
      findings.push({
        category: 'MISSING_DOCUMENTATION',
        severity: 'MEDIUM',
        projectId: po.projectId,
        materialName: po.materialName,
        supplierBusinessId: po.supplierBusinessId,
        supplierName: po.supplierName,
        transactionType: 'PO',
        transactionRef: po.poId,
        detectedAmountPaise: po.totalAmountPaise,
        baselineAmountPaise: null,
        potentialExposurePaise: BigInt(0),
        percentageDeviation: null,
        explanation: `Single-source PO ${po.poId} issued with only ${po.quotationCountOnRfq} quotation(s) on file. Requires competitive bid waiver documentation.`,
        supportingEvidence: { quotationCountOnRfq: po.quotationCountOnRfq },
      });
    }
  }

  return findings;
}
