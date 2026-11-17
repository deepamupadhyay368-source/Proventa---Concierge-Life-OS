/**
 * PROVENTA PAYMENT INTELLIGENCE
 * Core Orchestrator Service
 * 
 * Manages commercial invoices, precision ledger entries, countdowns,
 * counterparty confirmations, dispute resolutions, and score updates.
 */

import type {
  CommercialInvoiceDto,
  PaymentLedgerEntryDto,
  PaymentDisputeDto,
  PaymentScoreDto,
  InvoiceLineItem,
  InvoiceStatus,
  PaymentMethod,
  DisputeType,
} from './types';
import { PreciseMoney } from './decimal';
import { calculatePaymentCountdown, calculateContractualDueDate } from './countdown';
import { PaymentScoreEngine } from './scoring';
import { PaymentIntelligenceRepository } from './repository';
import { sendBusinessNotification } from '@/lib/business/notifications';

export const PaymentIntelligenceService = {
  /**
   * Create a new commercial invoice
   */
  async createInvoice(params: {
    invoiceNumber: string;
    purchaseOrderId?: string;
    rfqId?: string;
    buyerBusinessId: string;
    buyerBusinessName?: string;
    supplierBusinessId: string;
    supplierBusinessName?: string;
    issuerUserId: string;
    recipientUserId?: string;
    invoiceDate?: string | Date;
    paymentTerms: string; // e.g. NET_30, NET_15
    paymentTermsDays?: number;
    items: InvoiceLineItem[];
    documentUrl?: string;
    documentFileName?: string;
    notes?: string;
    ipAddress?: string;
  }): Promise<CommercialInvoiceDto> {
    const invDate = params.invoiceDate ? new Date(params.invoiceDate) : new Date();
    const contractualDueDate = calculateContractualDueDate({
      invoiceDate: invDate,
      terms: params.paymentTerms,
      termsDays: params.paymentTermsDays,
    });

    // Calculate line items precisely
    let subtotal = new PreciseMoney(0);
    let taxAmount = new PreciseMoney(0);

    for (const item of params.items) {
      const lineBase = new PreciseMoney(item.unitRate).multiply(item.quantity);
      const lineGst = lineBase.multiply((item.gstRate || 18) / 100);
      subtotal = subtotal.add(lineBase);
      taxAmount = taxAmount.add(lineGst);
    }

    const totalAmount = subtotal.add(taxAmount);
    const invoiceId = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const dto: CommercialInvoiceDto = {
      id: invoiceId,
      invoiceNumber: params.invoiceNumber,
      purchaseOrderId: params.purchaseOrderId,
      rfqId: params.rfqId,
      buyerBusinessId: params.buyerBusinessId,
      buyerBusinessName: params.buyerBusinessName || 'Buyer Enterprise',
      supplierBusinessId: params.supplierBusinessId,
      supplierBusinessName: params.supplierBusinessName || 'Supplier Enterprise',
      issuerUserId: params.issuerUserId,
      recipientUserId: params.recipientUserId,
      invoiceDate: invDate.toISOString(),
      contractualDueDate: contractualDueDate.toISOString(),
      paymentTerms: params.paymentTerms,
      paymentTermsDays: params.paymentTermsDays || 30,
      currency: 'INR',
      subtotal: subtotal.toNumber(),
      taxAmount: taxAmount.toNumber(),
      totalAmount: totalAmount.toNumber(),
      paidAmount: 0,
      outstandingAmount: totalAmount.toNumber(),
      status: 'SUBMITTED',
      verificationStatus: 'SUBMITTED_FOR_VERIFICATION',
      items: params.items,
      documentUrl: params.documentUrl,
      documentFileName: params.documentFileName,
      notes: params.notes,
      isDisputed: false,
      countdown: calculatePaymentCountdown({
        dueDate: contractualDueDate,
        status: 'SUBMITTED',
        paidAmount: 0,
        totalAmount: totalAmount.toNumber(),
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await PaymentIntelligenceRepository.saveInvoice(dto);

    // Audit Log
    await PaymentIntelligenceRepository.recordAuditLog({
      invoiceId: dto.id,
      businessId: dto.supplierBusinessId,
      actorUserId: params.issuerUserId,
      actorRole: 'SUPPLIER',
      action: 'INVOICE_CREATED',
      details: `Generated commercial invoice #${dto.invoiceNumber} for ₹${dto.totalAmount.toLocaleString('en-IN')} (Due: ${contractualDueDate.toLocaleDateString()}).`,
      newValues: { invoiceNumber: dto.invoiceNumber, totalAmount: dto.totalAmount, dueDate: contractualDueDate.toISOString() },
      ipAddress: params.ipAddress,
    });

    // Notify buyer
    if (params.recipientUserId) {
      await sendBusinessNotification({
        userId: params.recipientUserId,
        type: 'ORDER_STATUS_CHANGED',
        title: `New Commercial Invoice #${dto.invoiceNumber}`,
        body: `Supplier "${dto.supplierBusinessName}" issued Invoice #${dto.invoiceNumber} for ₹${dto.totalAmount.toLocaleString('en-IN')}. Due date: ${contractualDueDate.toLocaleDateString()}.`,
        actionUrl: `/buyer/payments?invoiceId=${dto.id}`,
      }).catch(() => {});
    }

    return dto;
  },

  /**
   * Record a payment (Full or Partial)
   */
  async recordPayment(params: {
    invoiceId: string;
    recordedByUserId: string;
    payerBusinessId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentDate?: string | Date;
    utrNumber?: string;
    bankReference?: string;
    receiptUrl?: string;
    receiptFileName?: string;
    notes?: string;
    ipAddress?: string;
  }): Promise<{ invoice: CommercialInvoiceDto; entry: PaymentLedgerEntryDto }> {
    const invoice = await PaymentIntelligenceRepository.getInvoiceById(params.invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const paymentAmount = new PreciseMoney(params.amount);
    if (!paymentAmount.isPositive()) throw new Error('Payment amount must be greater than zero');

    const currentPaid = new PreciseMoney(invoice.paidAmount);
    const invoiceTotal = new PreciseMoney(invoice.totalAmount);
    const newPaid = currentPaid.add(paymentAmount);
    const newOutstanding = invoiceTotal.subtract(newPaid);

    let newStatus: InvoiceStatus = 'PARTIALLY_PAID';
    let paidAtDate: string | undefined = undefined;

    if (newOutstanding.isZero() || newPaid.greaterThan(invoiceTotal) || newPaid.equals(invoiceTotal)) {
      newStatus = 'PAID';
      paidAtDate = new Date().toISOString();
    }

    const payDate = params.paymentDate ? new Date(params.paymentDate) : new Date();
    const entryId = `PAY-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const entry: PaymentLedgerEntryDto = {
      id: entryId,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      payerBusinessId: params.payerBusinessId,
      payerBusinessName: invoice.buyerBusinessName,
      payeeBusinessId: invoice.supplierBusinessId,
      payeeBusinessName: invoice.supplierBusinessName,
      recordedByUserId: params.recordedByUserId,
      amount: paymentAmount.toNumber(),
      currency: invoice.currency,
      paymentDate: payDate.toISOString(),
      paymentMethod: params.paymentMethod,
      utrNumber: params.utrNumber,
      bankReference: params.bankReference,
      receiptUrl: params.receiptUrl,
      receiptFileName: params.receiptFileName,
      status: 'CONFIRMED',
      verificationStatus: 'CONFIRMED',
      verifiedAt: new Date().toISOString(),
      verifiedByUserId: params.recordedByUserId,
      notes: params.notes,
      isReversal: false,
      createdAt: new Date().toISOString(),
    };

    await PaymentIntelligenceRepository.savePaymentEntry(entry);

    invoice.paidAmount = newPaid.toNumber();
    invoice.outstandingAmount = Math.max(0, newOutstanding.toNumber());
    invoice.status = newStatus;
    if (paidAtDate) invoice.paidAt = paidAtDate;
    invoice.updatedAt = new Date().toISOString();

    invoice.countdown = calculatePaymentCountdown({
      dueDate: invoice.revisedDueDate || invoice.contractualDueDate,
      status: invoice.status,
      isDisputed: invoice.isDisputed,
      paidAmount: invoice.paidAmount,
      totalAmount: invoice.totalAmount,
    });

    await PaymentIntelligenceRepository.saveInvoice(invoice);

    // Audit Log
    await PaymentIntelligenceRepository.recordAuditLog({
      invoiceId: invoice.id,
      paymentId: entry.id,
      businessId: invoice.buyerBusinessId,
      actorUserId: params.recordedByUserId,
      actorRole: 'BUYER',
      action: 'PAYMENT_RECORDED',
      details: `Recorded ${entry.paymentMethod} payment of ₹${entry.amount.toLocaleString('en-IN')} (UTR: ${entry.utrNumber || 'N/A'}). Status: ${invoice.status}.`,
      newValues: { paidAmount: invoice.paidAmount, outstandingAmount: invoice.outstandingAmount, status: invoice.status },
      ipAddress: params.ipAddress,
    });

    // Trigger score recalculation for buyer
    await this.calculateAndRefreshScore({
      businessId: invoice.buyerBusinessId,
      businessName: invoice.buyerBusinessName || 'Buyer Enterprise',
      scoreType: 'BUYER',
    }).catch(() => {});

    // Notify supplier of received payment
    if (invoice.issuerUserId) {
      await sendBusinessNotification({
        userId: invoice.issuerUserId,
        type: 'ORDER_STATUS_CHANGED',
        title: `Payment Received: ₹${entry.amount.toLocaleString('en-IN')}`,
        body: `Buyer recorded payment for Invoice #${invoice.invoiceNumber}. New outstanding: ₹${invoice.outstandingAmount.toLocaleString('en-IN')}.`,
        actionUrl: `/supplier/payments?invoiceId=${invoice.id}`,
      }).catch(() => {});
    }

    return { invoice, entry };
  },

  /**
   * Verify an invoice or payment record
   */
  async verifyRecord(params: {
    invoiceId: string;
    verifiedByUserId: string;
    actorRole: 'SUPPLIER' | 'BUYER' | 'ADMIN';
    verificationStatus: 'CONFIRMED_BY_COUNTERPARTY' | 'INDEPENDENTLY_VERIFIED' | 'REJECTED';
    notes?: string;
    ipAddress?: string;
  }): Promise<CommercialInvoiceDto> {
    const invoice = await PaymentIntelligenceRepository.getInvoiceById(params.invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const previousStatus = invoice.verificationStatus;
    invoice.verificationStatus = params.verificationStatus;
    if (params.verificationStatus === 'CONFIRMED_BY_COUNTERPARTY' && invoice.status === 'SUBMITTED') {
      invoice.status = 'VERIFIED';
    }
    invoice.updatedAt = new Date().toISOString();

    await PaymentIntelligenceRepository.saveInvoice(invoice);

    await PaymentIntelligenceRepository.recordAuditLog({
      invoiceId: invoice.id,
      businessId: invoice.buyerBusinessId,
      actorUserId: params.verifiedByUserId,
      actorRole: params.actorRole,
      action: 'INVOICE_VERIFIED',
      details: `Invoice verification status updated from ${previousStatus} to ${params.verificationStatus}.`,
      previousValues: { verificationStatus: previousStatus },
      newValues: { verificationStatus: params.verificationStatus },
      reason: params.notes,
      ipAddress: params.ipAddress,
    });

    return invoice;
  },

  /**
   * Revise contractual due date with documented approval
   */
  async reviseDueDate(params: {
    invoiceId: string;
    revisedDueDate: string | Date;
    reason: string;
    approvedByUserId: string;
    actorRole: 'SUPPLIER' | 'BUYER' | 'ADMIN';
    ipAddress?: string;
  }): Promise<CommercialInvoiceDto> {
    const invoice = await PaymentIntelligenceRepository.getInvoiceById(params.invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const prevDueDate = invoice.revisedDueDate || invoice.contractualDueDate;
    const newDueDate = typeof params.revisedDueDate === 'string' ? new Date(params.revisedDueDate) : params.revisedDueDate;

    invoice.revisedDueDate = newDueDate.toISOString();
    invoice.dueRevisionReason = params.reason;
    invoice.updatedAt = new Date().toISOString();

    invoice.countdown = calculatePaymentCountdown({
      dueDate: invoice.revisedDueDate,
      status: invoice.status,
      isDisputed: invoice.isDisputed,
      paidAmount: invoice.paidAmount,
      totalAmount: invoice.totalAmount,
    });

    await PaymentIntelligenceRepository.saveInvoice(invoice);

    await PaymentIntelligenceRepository.recordAuditLog({
      invoiceId: invoice.id,
      businessId: invoice.buyerBusinessId,
      actorUserId: params.approvedByUserId,
      actorRole: params.actorRole,
      action: 'DUE_DATE_REVISED',
      details: `Contractual due date revised from ${new Date(prevDueDate).toLocaleDateString()} to ${newDueDate.toLocaleDateString()}. Reason: ${params.reason}`,
      previousValues: { dueDate: prevDueDate },
      newValues: { dueDate: invoice.revisedDueDate, reason: params.reason },
      ipAddress: params.ipAddress,
    });

    return invoice;
  },

  /**
   * Raise a payment dispute
   */
  async raiseDispute(params: {
    invoiceId: string;
    disputedByBusinessId: string;
    disputedByUserId: string;
    disputeType: DisputeType;
    disputedAmount?: number;
    reason: string;
    evidenceUrls?: string[];
    ipAddress?: string;
  }): Promise<PaymentDisputeDto> {
    const invoice = await PaymentIntelligenceRepository.getInvoiceById(params.invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const counterpartyBusinessId =
      params.disputedByBusinessId === invoice.buyerBusinessId
        ? invoice.supplierBusinessId
        : invoice.buyerBusinessId;

    const disputeId = `DISP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const dispute: PaymentDisputeDto = {
      id: disputeId,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      disputedByBusinessId: params.disputedByBusinessId,
      disputedByBusinessName: params.disputedByBusinessId === invoice.buyerBusinessId ? invoice.buyerBusinessName : invoice.supplierBusinessName,
      disputedByUserId: params.disputedByUserId,
      counterpartyBusinessId,
      counterpartyBusinessName: params.disputedByBusinessId === invoice.buyerBusinessId ? invoice.supplierBusinessName : invoice.buyerBusinessName,
      disputeType: params.disputeType,
      status: 'OPEN',
      disputedAmount: params.disputedAmount || invoice.outstandingAmount,
      reason: params.reason,
      evidenceUrls: params.evidenceUrls || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await PaymentIntelligenceRepository.saveDispute(dispute);

    // Flag invoice
    invoice.isDisputed = true;
    invoice.disputeId = dispute.id;
    invoice.status = 'DISPUTED';
    invoice.updatedAt = new Date().toISOString();
    invoice.countdown = calculatePaymentCountdown({
      dueDate: invoice.revisedDueDate || invoice.contractualDueDate,
      status: 'DISPUTED',
      isDisputed: true,
      paidAmount: invoice.paidAmount,
      totalAmount: invoice.totalAmount,
    });

    await PaymentIntelligenceRepository.saveInvoice(invoice);

    await PaymentIntelligenceRepository.recordAuditLog({
      invoiceId: invoice.id,
      disputeId: dispute.id,
      businessId: params.disputedByBusinessId,
      actorUserId: params.disputedByUserId,
      actorRole: params.disputedByBusinessId === invoice.buyerBusinessId ? 'BUYER' : 'SUPPLIER',
      action: 'DISPUTE_OPENED',
      details: `Opened dispute (${params.disputeType}) on Invoice #${invoice.invoiceNumber}. Reason: ${params.reason}.`,
      ipAddress: params.ipAddress,
    });

    return dispute;
  },

  /**
   * Resolve a dispute
   */
  async resolveDispute(params: {
    disputeId: string;
    resolvedByUserId: string;
    status: 'RESOLVED' | 'REJECTED';
    resolutionNotes: string;
    adjustmentAmount?: number;
    actorRole: 'ADMIN' | 'SUPPLIER' | 'BUYER';
    ipAddress?: string;
  }): Promise<PaymentDisputeDto> {
    const dispute = Array.from((await PaymentIntelligenceRepository.listInvoices({})).values());
    // Find dispute
    const allInvoices = await PaymentIntelligenceRepository.listInvoices({});
    let targetDispute: PaymentDisputeDto | null = null;
    let targetInvoice: CommercialInvoiceDto | null = null;

    for (const inv of allInvoices) {
      if (inv.disputeId === params.disputeId) {
        targetInvoice = inv;
        break;
      }
    }

    if (!targetInvoice) throw new Error('Disputed invoice not found');

    targetDispute = {
      id: params.disputeId,
      invoiceId: targetInvoice.id,
      invoiceNumber: targetInvoice.invoiceNumber,
      disputedByBusinessId: targetInvoice.buyerBusinessId,
      disputedByUserId: params.resolvedByUserId,
      counterpartyBusinessId: targetInvoice.supplierBusinessId,
      disputeType: 'INCORRECT_AMOUNT',
      status: params.status,
      reason: 'Dispute resolution confirmed',
      evidenceUrls: [],
      resolutionNotes: params.resolutionNotes,
      resolvedByUserId: params.resolvedByUserId,
      resolvedAt: new Date().toISOString(),
      adjustmentAmount: params.adjustmentAmount,
      createdAt: targetInvoice.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await PaymentIntelligenceRepository.saveDispute(targetDispute);

    // Unflag invoice
    targetInvoice.isDisputed = false;
    targetInvoice.status = targetInvoice.outstandingAmount === 0 ? 'PAID' : (targetInvoice.paidAmount > 0 ? 'PARTIALLY_PAID' : 'VERIFIED');
    targetInvoice.updatedAt = new Date().toISOString();

    if (params.adjustmentAmount && params.adjustmentAmount > 0) {
      const adj = new PreciseMoney(params.adjustmentAmount);
      const newTotal = new PreciseMoney(targetInvoice.totalAmount).subtract(adj);
      targetInvoice.totalAmount = newTotal.toNumber();
      targetInvoice.outstandingAmount = Math.max(0, newTotal.subtract(new PreciseMoney(targetInvoice.paidAmount)).toNumber());
    }

    targetInvoice.countdown = calculatePaymentCountdown({
      dueDate: targetInvoice.revisedDueDate || targetInvoice.contractualDueDate,
      status: targetInvoice.status,
      isDisputed: false,
      paidAmount: targetInvoice.paidAmount,
      totalAmount: targetInvoice.totalAmount,
    });

    await PaymentIntelligenceRepository.saveInvoice(targetInvoice);

    await PaymentIntelligenceRepository.recordAuditLog({
      invoiceId: targetInvoice.id,
      disputeId: targetDispute.id,
      actorUserId: params.resolvedByUserId,
      actorRole: params.actorRole,
      action: 'DISPUTE_RESOLVED',
      details: `Dispute ${params.status}: ${params.resolutionNotes}.`,
      newValues: { status: targetInvoice.status, outstandingAmount: targetInvoice.outstandingAmount },
      ipAddress: params.ipAddress,
    });

    return targetDispute;
  },

  /**
   * Calculate, refresh and persist business payment score
   */
  async calculateAndRefreshScore(params: {
    businessId: string;
    businessName: string;
    scoreType: 'BUYER' | 'SUPPLIER';
    referenceDate?: Date;
  }): Promise<PaymentScoreDto> {
    const filter = params.scoreType === 'BUYER'
      ? { buyerBusinessId: params.businessId }
      : { supplierBusinessId: params.businessId };

    const invoices = await PaymentIntelligenceRepository.listInvoices(filter);

    const eligibleInvoices = invoices.map((inv) => ({
      id: inv.id,
      totalAmount: inv.totalAmount,
      paidAmount: inv.paidAmount,
      contractualDueDate: inv.revisedDueDate || inv.contractualDueDate,
      paidAt: inv.paidAt,
      status: inv.status,
      isDisputed: inv.isDisputed,
      verificationStatus: inv.verificationStatus,
    }));

    const score = PaymentScoreEngine.calculateScore({
      businessId: params.businessId,
      businessName: params.businessName,
      scoreType: params.scoreType,
      invoices: eligibleInvoices,
      referenceDate: params.referenceDate,
    });

    await PaymentIntelligenceRepository.savePaymentScore(score);

    return score;
  },
};
