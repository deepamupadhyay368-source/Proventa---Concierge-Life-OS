/**
 * PROVENTA PAYMENT INTELLIGENCE
 * Repository & Persistence Layer
 * 
 * Supports Prisma PostgreSQL persistence with resilient in-memory caching
 * ensuring robust offline development, unit tests, and instant responsiveness.
 */

import { db } from '@/lib/db';
import type {
  CommercialInvoiceDto,
  PaymentLedgerEntryDto,
  PaymentScheduleInstalmentDto,
  PaymentDisputeDto,
  PaymentScoreDto,
  LedgerFinancialSummary,
} from './types';
import { calculatePaymentCountdown } from './countdown';
import { PaymentScoreEngine } from './scoring';
import { PreciseMoney } from './decimal';

// In-memory data store for fallback & unit tests
interface MemoryStore {
  invoices: Map<string, CommercialInvoiceDto>;
  ledgerEntries: Map<string, PaymentLedgerEntryDto>;
  schedules: Map<string, PaymentScheduleInstalmentDto[]>;
  disputes: Map<string, PaymentDisputeDto>;
  scores: Map<string, PaymentScoreDto>;
  auditLogs: any[];
}

const memoryStore: MemoryStore = {
  invoices: new Map(),
  ledgerEntries: new Map(),
  schedules: new Map(),
  disputes: new Map(),
  scores: new Map(),
  auditLogs: [],
};

// Seed initial realistic commercial records if empty
function initializeSeedData() {
  if (memoryStore.invoices.size > 0) return;

  const now = new Date();
  const d30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const d15Ago = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  const d5Ago = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const d10Later = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  const d25Later = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000);

  // Sample Buyer: Adani Infra EPC (buyer-adani)
  // Sample Supplier: Asian Steel Corporation (asian-steel-corporation)
  const inv1: CommercialInvoiceDto = {
    id: 'INV-2026-001',
    invoiceNumber: 'ASC/2026-27/089',
    purchaseOrderId: 'PO-74912',
    rfqId: 'RFQ-89214',
    buyerBusinessId: 'business-adani-infra',
    buyerBusinessName: 'Adani Infrastructure & Developers Ltd',
    supplierBusinessId: 'asian-steel-corporation',
    supplierBusinessName: 'Asian Steel Corporation',
    issuerUserId: 'usr-supplier-asian',
    recipientUserId: 'usr-buyer-adani',
    invoiceDate: d30Ago.toISOString(),
    contractualDueDate: d5Ago.toISOString(),
    paymentTerms: 'NET_30',
    paymentTermsDays: 30,
    currency: 'INR',
    subtotal: 3120000,
    taxAmount: 561600,
    totalAmount: 3681600,
    paidAmount: 3681600,
    outstandingAmount: 0,
    status: 'PAID',
    verificationStatus: 'CONFIRMED_BY_COUNTERPARTY',
    items: [
      {
        id: 'item-1',
        description: 'Fe 550D TMT Rebars 12mm & 16mm (Primary Steel Mill)',
        hsnCode: '72142090',
        quantity: 60,
        unit: 'MT',
        unitRate: 52000,
        gstRate: 18,
        gstAmount: 561600,
        total: 3681600,
      },
    ],
    documentUrl: '/documents/invoices/asc-inv-089.pdf',
    documentFileName: 'asc-inv-089.pdf',
    notes: 'Dispatched to Sanand Logistics Park Site Depot',
    isDisputed: false,
    paidAt: d5Ago.toISOString(),
    countdown: calculatePaymentCountdown({
      dueDate: d5Ago,
      status: 'PAID',
      paidAmount: 3681600,
      totalAmount: 3681600,
    }),
    createdAt: d30Ago.toISOString(),
    updatedAt: d5Ago.toISOString(),
  };

  const inv2: CommercialInvoiceDto = {
    id: 'INV-2026-002',
    invoiceNumber: 'ASC/2026-27/114',
    purchaseOrderId: 'PO-74912',
    rfqId: 'RFQ-89214',
    buyerBusinessId: 'business-adani-infra',
    buyerBusinessName: 'Adani Infrastructure & Developers Ltd',
    supplierBusinessId: 'asian-steel-corporation',
    supplierBusinessName: 'Asian Steel Corporation',
    issuerUserId: 'usr-supplier-asian',
    recipientUserId: 'usr-buyer-adani',
    invoiceDate: d15Ago.toISOString(),
    contractualDueDate: d10Later.toISOString(),
    paymentTerms: 'NET_30',
    paymentTermsDays: 30,
    currency: 'INR',
    subtotal: 1560000,
    taxAmount: 280800,
    totalAmount: 1840800,
    paidAmount: 920400,
    outstandingAmount: 920400,
    status: 'PARTIALLY_PAID',
    verificationStatus: 'CONFIRMED_BY_COUNTERPARTY',
    items: [
      {
        id: 'item-2',
        description: 'Fe 550D TMT Rebars 20mm & 25mm Heavy Sections',
        hsnCode: '72142090',
        quantity: 30,
        unit: 'MT',
        unitRate: 52000,
        gstRate: 18,
        gstAmount: 280800,
        total: 1840800,
      },
    ],
    documentUrl: '/documents/invoices/asc-inv-114.pdf',
    documentFileName: 'asc-inv-114.pdf',
    notes: 'Advance 50% received via RTGS; balance payable upon test certificate compliance',
    isDisputed: false,
    countdown: calculatePaymentCountdown({
      dueDate: d10Later,
      status: 'PARTIALLY_PAID',
      paidAmount: 920400,
      totalAmount: 1840800,
    }),
    createdAt: d15Ago.toISOString(),
    updatedAt: now.toISOString(),
  };

  const inv3: CommercialInvoiceDto = {
    id: 'INV-2026-003',
    invoiceNumber: 'ASC/2026-27/142',
    purchaseOrderId: 'PO-81932',
    rfqId: 'RFQ-92015',
    buyerBusinessId: 'business-adani-infra',
    buyerBusinessName: 'Adani Infrastructure & Developers Ltd',
    supplierBusinessId: 'asian-steel-corporation',
    supplierBusinessName: 'Asian Steel Corporation',
    issuerUserId: 'usr-supplier-asian',
    recipientUserId: 'usr-buyer-adani',
    invoiceDate: now.toISOString(),
    contractualDueDate: d25Later.toISOString(),
    paymentTerms: 'NET_30',
    paymentTermsDays: 30,
    currency: 'INR',
    subtotal: 2450000,
    taxAmount: 441000,
    totalAmount: 2891000,
    paidAmount: 0,
    outstandingAmount: 2891000,
    status: 'VERIFIED',
    verificationStatus: 'CONFIRMED_BY_COUNTERPARTY',
    items: [
      {
        id: 'item-3',
        description: 'Structural MS Channels ISMB 250 & Equal Angles 75x75x6',
        hsnCode: '72162100',
        quantity: 35,
        unit: 'MT',
        unitRate: 70000,
        gstRate: 18,
        gstAmount: 441000,
        total: 2891000,
      },
    ],
    documentUrl: '/documents/invoices/asc-inv-142.pdf',
    documentFileName: 'asc-inv-142.pdf',
    isDisputed: false,
    countdown: calculatePaymentCountdown({
      dueDate: d25Later,
      status: 'VERIFIED',
      paidAmount: 0,
      totalAmount: 2891000,
    }),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  memoryStore.invoices.set(inv1.id, inv1);
  memoryStore.invoices.set(inv2.id, inv2);
  memoryStore.invoices.set(inv3.id, inv3);

  // Sample Payment Record for Inv 1 (Full)
  const pay1: PaymentLedgerEntryDto = {
    id: 'PAY-2026-001',
    invoiceId: inv1.id,
    invoiceNumber: inv1.invoiceNumber,
    payerBusinessId: inv1.buyerBusinessId,
    payerBusinessName: inv1.buyerBusinessName,
    payeeBusinessId: inv1.supplierBusinessId,
    payeeBusinessName: inv1.supplierBusinessName,
    recordedByUserId: 'usr-buyer-adani',
    amount: 3681600,
    currency: 'INR',
    paymentDate: d5Ago.toISOString(),
    paymentMethod: 'RTGS',
    utrNumber: 'HDFCR52026110500918234',
    bankReference: 'HDFC Bank - Corporate Treasury',
    status: 'CONFIRMED',
    verificationStatus: 'CONFIRMED',
    verifiedAt: d5Ago.toISOString(),
    verifiedByUserId: 'usr-supplier-asian',
    notes: 'Full invoice settlement received in Bank of Baroda account',
    isReversal: false,
    createdAt: d5Ago.toISOString(),
  };

  // Sample Payment Record for Inv 2 (Partial 50%)
  const pay2: PaymentLedgerEntryDto = {
    id: 'PAY-2026-002',
    invoiceId: inv2.id,
    invoiceNumber: inv2.invoiceNumber,
    payerBusinessId: inv2.buyerBusinessId,
    payerBusinessName: inv2.buyerBusinessName,
    payeeBusinessId: inv2.supplierBusinessId,
    payeeBusinessName: inv2.supplierBusinessName,
    recordedByUserId: 'usr-buyer-adani',
    amount: 920400,
    currency: 'INR',
    paymentDate: d15Ago.toISOString(),
    paymentMethod: 'NEFT',
    utrNumber: 'ICICN02026102800412891',
    bankReference: 'ICICI Bank Ahmedabad',
    status: 'CONFIRMED',
    verificationStatus: 'CONFIRMED',
    verifiedAt: d15Ago.toISOString(),
    verifiedByUserId: 'usr-supplier-asian',
    notes: 'Advance 50% mobilization installment',
    isReversal: false,
    createdAt: d15Ago.toISOString(),
  };

  memoryStore.ledgerEntries.set(pay1.id, pay1);
  memoryStore.ledgerEntries.set(pay2.id, pay2);
}

initializeSeedData();

export const PaymentIntelligenceRepository = {
  /**
   * Save or update an invoice
   */
  async saveInvoice(invoice: CommercialInvoiceDto): Promise<CommercialInvoiceDto> {
    memoryStore.invoices.set(invoice.id, invoice);

    try {
      await db.commercialInvoice.upsert({
        where: { id: invoice.id },
        update: {
          invoiceNumber: invoice.invoiceNumber,
          purchaseOrderId: invoice.purchaseOrderId || null,
          rfqId: invoice.rfqId || null,
          buyerBusinessId: invoice.buyerBusinessId,
          supplierBusinessId: invoice.supplierBusinessId,
          issuerUserId: invoice.issuerUserId,
          recipientUserId: invoice.recipientUserId || null,
          invoiceDate: new Date(invoice.invoiceDate),
          contractualDueDate: new Date(invoice.contractualDueDate),
          revisedDueDate: invoice.revisedDueDate ? new Date(invoice.revisedDueDate) : null,
          dueRevisionReason: invoice.dueRevisionReason || null,
          paymentTerms: invoice.paymentTerms,
          paymentTermsDays: invoice.paymentTermsDays,
          currency: invoice.currency,
          subtotal: invoice.subtotal,
          taxAmount: invoice.taxAmount,
          totalAmount: invoice.totalAmount,
          paidAmount: invoice.paidAmount,
          outstandingAmount: invoice.outstandingAmount,
          status: invoice.status,
          verificationStatus: invoice.verificationStatus,
          items: invoice.items as any,
          documentUrl: invoice.documentUrl || null,
          documentFileName: invoice.documentFileName || null,
          notes: invoice.notes || null,
          isDisputed: invoice.isDisputed,
          disputeId: invoice.disputeId || null,
          paidAt: invoice.paidAt ? new Date(invoice.paidAt) : null,
        },
        create: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          purchaseOrderId: invoice.purchaseOrderId || null,
          rfqId: invoice.rfqId || null,
          buyerBusinessId: invoice.buyerBusinessId,
          supplierBusinessId: invoice.supplierBusinessId,
          issuerUserId: invoice.issuerUserId,
          recipientUserId: invoice.recipientUserId || null,
          invoiceDate: new Date(invoice.invoiceDate),
          contractualDueDate: new Date(invoice.contractualDueDate),
          revisedDueDate: invoice.revisedDueDate ? new Date(invoice.revisedDueDate) : null,
          dueRevisionReason: invoice.dueRevisionReason || null,
          paymentTerms: invoice.paymentTerms,
          paymentTermsDays: invoice.paymentTermsDays,
          currency: invoice.currency,
          subtotal: invoice.subtotal,
          taxAmount: invoice.taxAmount,
          totalAmount: invoice.totalAmount,
          paidAmount: invoice.paidAmount,
          outstandingAmount: invoice.outstandingAmount,
          status: invoice.status,
          verificationStatus: invoice.verificationStatus,
          items: invoice.items as any,
          documentUrl: invoice.documentUrl || null,
          documentFileName: invoice.documentFileName || null,
          notes: invoice.notes || null,
          isDisputed: invoice.isDisputed,
          disputeId: invoice.disputeId || null,
          paidAt: invoice.paidAt ? new Date(invoice.paidAt) : null,
        },
      });
    } catch (e) {
      // Prisma offline fallback
    }

    return invoice;
  },

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id: string): Promise<CommercialInvoiceDto | null> {
    const memory = memoryStore.invoices.get(id);
    if (memory) {
      // Refresh countdown with current wall clock
      memory.countdown = calculatePaymentCountdown({
        dueDate: memory.revisedDueDate || memory.contractualDueDate,
        status: memory.status,
        isDisputed: memory.isDisputed,
        paidAmount: memory.paidAmount,
        totalAmount: memory.totalAmount,
      });
      return memory;
    }

    try {
      const dbInv = await db.commercialInvoice.findUnique({
        where: { id },
        include: {
          buyerBusiness: true,
          supplierBusiness: true,
        },
      });

      if (!dbInv) return null;

      const dto: CommercialInvoiceDto = {
        id: dbInv.id,
        invoiceNumber: dbInv.invoiceNumber,
        purchaseOrderId: dbInv.purchaseOrderId || undefined,
        rfqId: dbInv.rfqId || undefined,
        buyerBusinessId: dbInv.buyerBusinessId,
        buyerBusinessName: dbInv.buyerBusiness?.name,
        supplierBusinessId: dbInv.supplierBusinessId,
        supplierBusinessName: dbInv.supplierBusiness?.name,
        issuerUserId: dbInv.issuerUserId,
        recipientUserId: dbInv.recipientUserId || undefined,
        invoiceDate: dbInv.invoiceDate.toISOString(),
        contractualDueDate: dbInv.contractualDueDate.toISOString(),
        revisedDueDate: dbInv.revisedDueDate?.toISOString(),
        dueRevisionReason: dbInv.dueRevisionReason || undefined,
        paymentTerms: dbInv.paymentTerms,
        paymentTermsDays: dbInv.paymentTermsDays,
        currency: dbInv.currency,
        subtotal: Number(dbInv.subtotal),
        taxAmount: Number(dbInv.taxAmount),
        totalAmount: Number(dbInv.totalAmount),
        paidAmount: Number(dbInv.paidAmount),
        outstandingAmount: Number(dbInv.outstandingAmount),
        status: dbInv.status as any,
        verificationStatus: dbInv.verificationStatus as any,
        items: dbInv.items as any,
        documentUrl: dbInv.documentUrl || undefined,
        documentFileName: dbInv.documentFileName || undefined,
        notes: dbInv.notes || undefined,
        isDisputed: dbInv.isDisputed,
        disputeId: dbInv.disputeId || undefined,
        paidAt: dbInv.paidAt?.toISOString(),
        countdown: calculatePaymentCountdown({
          dueDate: dbInv.revisedDueDate || dbInv.contractualDueDate,
          status: dbInv.status as any,
          isDisputed: dbInv.isDisputed,
          paidAmount: Number(dbInv.paidAmount),
          totalAmount: Number(dbInv.totalAmount),
        }),
        createdAt: dbInv.createdAt.toISOString(),
        updatedAt: dbInv.updatedAt.toISOString(),
      };

      memoryStore.invoices.set(dto.id, dto);
      return dto;
    } catch {
      return null;
    }
  },

  /**
   * List invoices filtered by business and/or role
   */
  async listInvoices(params: {
    buyerBusinessId?: string;
    supplierBusinessId?: string;
    status?: string;
    isDisputed?: boolean;
    limit?: number;
  }): Promise<CommercialInvoiceDto[]> {
    initializeSeedData();
    let results: CommercialInvoiceDto[] = Array.from(memoryStore.invoices.values());

    if (params.buyerBusinessId && params.buyerBusinessId !== 'all') {
      results = results.filter((inv) => inv.buyerBusinessId === params.buyerBusinessId);
    }

    if (params.supplierBusinessId && params.supplierBusinessId !== 'all') {
      results = results.filter((inv) => inv.supplierBusinessId === params.supplierBusinessId);
    }

    if (params.status && params.status !== 'ALL') {
      results = results.filter((inv) => inv.status === params.status);
    }

    if (params.isDisputed !== undefined) {
      results = results.filter((inv) => inv.isDisputed === params.isDisputed);
    }

    // Refresh live countdowns
    results = results.map((inv) => ({
      ...inv,
      countdown: calculatePaymentCountdown({
        dueDate: inv.revisedDueDate || inv.contractualDueDate,
        status: inv.status,
        isDisputed: inv.isDisputed,
        paidAmount: inv.paidAmount,
        totalAmount: inv.totalAmount,
      }),
    }));

    // Sort by due date (soonest / overdue first)
    results.sort((a, b) => new Date(a.contractualDueDate).getTime() - new Date(b.contractualDueDate).getTime());

    if (params.limit) {
      results = results.slice(0, params.limit);
    }

    return results;
  },

  /**
   * Calculate summary financials for a business
   */
  async getFinancialSummary(params: {
    buyerBusinessId?: string;
    supplierBusinessId?: string;
  }): Promise<LedgerFinancialSummary> {
    const invoices = await this.listInvoices(params);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let totalInvoiced = new PreciseMoney(0);
    let totalPaid = new PreciseMoney(0);
    let totalOutstanding = new PreciseMoney(0);
    let dueWithin7 = new PreciseMoney(0);
    let dueWithin15 = new PreciseMoney(0);
    let dueWithin30 = new PreciseMoney(0);
    let overdue = new PreciseMoney(0);

    let paidCount = 0;
    let overdueCount = 0;
    let disputedCount = 0;

    for (const inv of invoices) {
      const invTotal = new PreciseMoney(inv.totalAmount);
      const invPaid = new PreciseMoney(inv.paidAmount);
      const invOutstanding = new PreciseMoney(inv.outstandingAmount);

      totalInvoiced = totalInvoiced.add(invTotal);
      totalPaid = totalPaid.add(invPaid);
      totalOutstanding = totalOutstanding.add(invOutstanding);

      if (inv.isDisputed) disputedCount++;
      if (inv.status === 'PAID') paidCount++;

      if (invOutstanding.isPositive() && !inv.isDisputed && inv.status !== 'CANCELLED') {
        const dueRaw = new Date(inv.revisedDueDate || inv.contractualDueDate);
        const dueDate = new Date(dueRaw.getFullYear(), dueRaw.getMonth(), dueRaw.getDate());
        const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          overdue = overdue.add(invOutstanding);
          overdueCount++;
        } else {
          if (diffDays <= 7) dueWithin7 = dueWithin7.add(invOutstanding);
          if (diffDays <= 15) dueWithin15 = dueWithin15.add(invOutstanding);
          if (diffDays <= 30) dueWithin30 = dueWithin30.add(invOutstanding);
        }
      }
    }

    return {
      totalInvoicedAmount: totalInvoiced.toNumber(),
      totalPaidAmount: totalPaid.toNumber(),
      totalOutstandingAmount: totalOutstanding.toNumber(),
      dueWithin7DaysAmount: dueWithin7.toNumber(),
      dueWithin15DaysAmount: dueWithin15.toNumber(),
      dueWithin30DaysAmount: dueWithin30.toNumber(),
      overdueAmount: overdue.toNumber(),
      totalInvoicesCount: invoices.length,
      paidInvoicesCount: paidCount,
      overdueInvoicesCount: overdueCount,
      disputedInvoicesCount: disputedCount,
    };
  },

  /**
   * Save payment ledger entry
   */
  async savePaymentEntry(entry: PaymentLedgerEntryDto): Promise<PaymentLedgerEntryDto> {
    memoryStore.ledgerEntries.set(entry.id, entry);

    try {
      await db.paymentLedgerEntry.upsert({
        where: { id: entry.id },
        update: {
          invoiceId: entry.invoiceId,
          payerBusinessId: entry.payerBusinessId,
          payeeBusinessId: entry.payeeBusinessId,
          recordedByUserId: entry.recordedByUserId,
          amount: entry.amount,
          currency: entry.currency,
          paymentDate: new Date(entry.paymentDate),
          paymentMethod: entry.paymentMethod,
          utrNumber: entry.utrNumber || null,
          bankReference: entry.bankReference || null,
          receiptUrl: entry.receiptUrl || null,
          receiptFileName: entry.receiptFileName || null,
          status: entry.status,
          verificationStatus: entry.verificationStatus,
          verifiedAt: entry.verifiedAt ? new Date(entry.verifiedAt) : null,
          verifiedByUserId: entry.verifiedByUserId || null,
          notes: entry.notes || null,
          isReversal: entry.isReversal,
          reversedEntryId: entry.reversedEntryId || null,
        },
        create: {
          id: entry.id,
          invoiceId: entry.invoiceId,
          payerBusinessId: entry.payerBusinessId,
          payeeBusinessId: entry.payeeBusinessId,
          recordedByUserId: entry.recordedByUserId,
          amount: entry.amount,
          currency: entry.currency,
          paymentDate: new Date(entry.paymentDate),
          paymentMethod: entry.paymentMethod,
          utrNumber: entry.utrNumber || null,
          bankReference: entry.bankReference || null,
          receiptUrl: entry.receiptUrl || null,
          receiptFileName: entry.receiptFileName || null,
          status: entry.status,
          verificationStatus: entry.verificationStatus,
          verifiedAt: entry.verifiedAt ? new Date(entry.verifiedAt) : null,
          verifiedByUserId: entry.verifiedByUserId || null,
          notes: entry.notes || null,
          isReversal: entry.isReversal,
          reversedEntryId: entry.reversedEntryId || null,
        },
      });
    } catch {
      // Prisma offline fallback
    }

    return entry;
  },

  /**
   * List payments for an invoice
   */
  async listPaymentsForInvoice(invoiceId: string): Promise<PaymentLedgerEntryDto[]> {
    return Array.from(memoryStore.ledgerEntries.values()).filter((p) => p.invoiceId === invoiceId);
  },

  /**
   * Save or update Payment Score
   */
  async savePaymentScore(score: PaymentScoreDto): Promise<PaymentScoreDto> {
    memoryStore.scores.set(score.businessId, score);

    try {
      await db.paymentScore.upsert({
        where: { businessId: score.businessId },
        update: {
          scoreType: score.scoreType,
          buyerScore: score.buyerScore,
          supplierScore: score.supplierScore,
          buyerClassification: score.buyerClassification,
          supplierClassification: score.supplierClassification,
          buyerConfidence: score.buyerConfidence,
          supplierConfidence: score.supplierConfidence,
          onTimePaymentRate: score.onTimePaymentRate,
          averageDelayDays: score.averageDelayDays,
          overdueFrequencyRate: score.overdueFrequencyRate,
          outstandingRatio: score.outstandingRatio,
          verifiedInvoiceCount: score.verifiedInvoiceCount,
          verifiedTransactionCount: score.verifiedTransactionCount,
          verifiedTransactionValue: score.verifiedTransactionValue,
          observationPeriodDays: score.observationPeriodDays,
          positiveFactors: score.positiveFactors,
          negativeFactors: score.negativeFactors,
          lastCalculatedAt: new Date(score.lastCalculatedAt),
        },
        create: {
          businessId: score.businessId,
          scoreType: score.scoreType,
          buyerScore: score.buyerScore,
          supplierScore: score.supplierScore,
          buyerClassification: score.buyerClassification,
          supplierClassification: score.supplierClassification,
          buyerConfidence: score.buyerConfidence,
          supplierConfidence: score.supplierConfidence,
          onTimePaymentRate: score.onTimePaymentRate,
          averageDelayDays: score.averageDelayDays,
          overdueFrequencyRate: score.overdueFrequencyRate,
          outstandingRatio: score.outstandingRatio,
          verifiedInvoiceCount: score.verifiedInvoiceCount,
          verifiedTransactionCount: score.verifiedTransactionCount,
          verifiedTransactionValue: score.verifiedTransactionValue,
          observationPeriodDays: score.observationPeriodDays,
          positiveFactors: score.positiveFactors,
          negativeFactors: score.negativeFactors,
          lastCalculatedAt: new Date(score.lastCalculatedAt),
        },
      });
    } catch {
      // Prisma offline fallback
    }

    return score;
  },

  /**
   * Get payment score for business
   */
  async getPaymentScore(businessId: string): Promise<PaymentScoreDto | null> {
    const memory = memoryStore.scores.get(businessId);
    if (memory) return memory;

    try {
      const dbScore = await db.paymentScore.findUnique({
        where: { businessId },
        include: { business: true },
      });

      if (!dbScore) return null;

      const dto: PaymentScoreDto = {
        businessId: dbScore.businessId,
        businessName: dbScore.business?.name || 'Enterprise Business',
        scoreType: dbScore.scoreType as any,
        buyerScore: dbScore.buyerScore,
        supplierScore: dbScore.supplierScore,
        buyerClassification: dbScore.buyerClassification as any,
        supplierClassification: dbScore.supplierClassification as any,
        buyerConfidence: dbScore.buyerConfidence as any,
        supplierConfidence: dbScore.supplierConfidence as any,
        onTimePaymentRate: Number(dbScore.onTimePaymentRate),
        averageDelayDays: Number(dbScore.averageDelayDays),
        overdueFrequencyRate: Number(dbScore.overdueFrequencyRate),
        outstandingRatio: Number(dbScore.outstandingRatio),
        verifiedInvoiceCount: dbScore.verifiedInvoiceCount,
        verifiedTransactionCount: dbScore.verifiedTransactionCount,
        verifiedTransactionValue: Number(dbScore.verifiedTransactionValue),
        observationPeriodDays: dbScore.observationPeriodDays,
        isRated: dbScore.buyerClassification !== 'NOT_YET_RATED' && dbScore.supplierClassification !== 'NOT_YET_RATED',
        factorBreakdown: {
          onTimePaymentScore: 0,
          delayPenaltyScore: 0,
          overdueFrequencyScore: 0,
          outstandingExposureScore: 0,
          consistencyScore: 0,
          transactionDepthScore: 0,
          totalScore: dbScore.buyerScore || dbScore.supplierScore || 0,
        },
        positiveFactors: dbScore.positiveFactors,
        negativeFactors: dbScore.negativeFactors,
        lastCalculatedAt: dbScore.lastCalculatedAt.toISOString(),
      };

      memoryStore.scores.set(businessId, dto);
      return dto;
    } catch {
      return null;
    }
  },

  /**
   * Save a dispute
   */
  async saveDispute(dispute: PaymentDisputeDto): Promise<PaymentDisputeDto> {
    memoryStore.disputes.set(dispute.id, dispute);

    try {
      await db.paymentDispute.upsert({
        where: { id: dispute.id },
        update: {
          invoiceId: dispute.invoiceId,
          disputedByBusinessId: dispute.disputedByBusinessId,
          disputedByUserId: dispute.disputedByUserId,
          counterpartyBusinessId: dispute.counterpartyBusinessId,
          disputeType: dispute.disputeType,
          status: dispute.status,
          disputedAmount: dispute.disputedAmount || null,
          reason: dispute.reason,
          evidenceUrls: dispute.evidenceUrls,
          counterpartyResponse: dispute.counterpartyResponse || null,
          counterpartyRespondedAt: dispute.counterpartyRespondedAt ? new Date(dispute.counterpartyRespondedAt) : null,
          resolutionNotes: dispute.resolutionNotes || null,
          resolvedByUserId: dispute.resolvedByUserId || null,
          resolvedAt: dispute.resolvedAt ? new Date(dispute.resolvedAt) : null,
          adjustmentAmount: dispute.adjustmentAmount || null,
        },
        create: {
          id: dispute.id,
          invoiceId: dispute.invoiceId,
          disputedByBusinessId: dispute.disputedByBusinessId,
          disputedByUserId: dispute.disputedByUserId,
          counterpartyBusinessId: dispute.counterpartyBusinessId,
          disputeType: dispute.disputeType,
          status: dispute.status,
          disputedAmount: dispute.disputedAmount || null,
          reason: dispute.reason,
          evidenceUrls: dispute.evidenceUrls,
          counterpartyResponse: dispute.counterpartyResponse || null,
          counterpartyRespondedAt: dispute.counterpartyRespondedAt ? new Date(dispute.counterpartyRespondedAt) : null,
          resolutionNotes: dispute.resolutionNotes || null,
          resolvedByUserId: dispute.resolvedByUserId || null,
          resolvedAt: dispute.resolvedAt ? new Date(dispute.resolvedAt) : null,
          adjustmentAmount: dispute.adjustmentAmount || null,
        },
      });
    } catch {
      // Prisma offline fallback
    }

    return dispute;
  },

  /**
   * Record audit log
   */
  async recordAuditLog(log: {
    invoiceId?: string;
    paymentId?: string;
    disputeId?: string;
    businessId?: string;
    actorUserId: string;
    actorRole: string;
    action: string;
    details: string;
    previousValues?: any;
    newValues?: any;
    reason?: string;
    ipAddress?: string;
  }) {
    const entry = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...log,
      createdAt: new Date().toISOString(),
    };
    memoryStore.auditLogs.unshift(entry);

    try {
      await db.paymentAuditLog.create({
        data: {
          invoiceId: log.invoiceId || null,
          paymentId: log.paymentId || null,
          disputeId: log.disputeId || null,
          businessId: log.businessId || null,
          actorUserId: log.actorUserId,
          actorRole: log.actorRole,
          action: log.action,
          details: log.details,
          previousValues: log.previousValues ? log.previousValues : undefined,
          newValues: log.newValues ? log.newValues : undefined,
          reason: log.reason || null,
          ipAddress: log.ipAddress || null,
        },
      });
    } catch {
      // Prisma offline fallback
    }

    return entry;
  },

  /**
   * List audit logs
   */
  async listAuditLogs(params?: { invoiceId?: string; businessId?: string; limit?: number }) {
    let list = [...memoryStore.auditLogs];
    if (params?.invoiceId) list = list.filter((l) => l.invoiceId === params.invoiceId);
    if (params?.businessId) list = list.filter((l) => l.businessId === params.businessId);
    if (params?.limit) list = list.slice(0, params.limit);
    return list;
  },
};
