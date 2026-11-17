/**
 * PROVENTA PAYMENT INTELLIGENCE
 * Core Types & Financial Domain Interfaces
 * Tagline: "PAYMENT BEHAVIOUR. MADE VISIBLE."
 */

export type InvoiceStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'DISPUTED'
  | 'CANCELLED'
  | 'WRITTEN_OFF';

export type PaymentVerificationStatus =
  | 'UNVERIFIED'
  | 'SUBMITTED_FOR_VERIFICATION'
  | 'CONFIRMED_BY_COUNTERPARTY'
  | 'INDEPENDENTLY_VERIFIED'
  | 'REJECTED'
  | 'DISPUTED';

export type PaymentMethod =
  | 'NEFT'
  | 'RTGS'
  | 'IMPS'
  | 'UPI'
  | 'CHEQUE'
  | 'BANK_TRANSFER'
  | 'LETTER_OF_CREDIT'
  | 'CASH';

export type PaymentTermsCode =
  | 'NET_7'
  | 'NET_15'
  | 'NET_30'
  | 'NET_45'
  | 'NET_60'
  | 'IMMEDIATE'
  | 'ADVANCE_100'
  | 'ADVANCE_20_BALANCE_DELIVERY'
  | 'CUSTOM';

export type DisputeType =
  | 'INCORRECT_AMOUNT'
  | 'INCORRECT_DUE_DATE'
  | 'INCORRECT_STATUS'
  | 'UNRECORDED_PAYMENT'
  | 'DUPLICATE_INVOICE'
  | 'INCORRECT_COUNTERPARTY'
  | 'QUALITY_SHORTAGE_HOLD'
  | 'SCORE_CALCULATION';

export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'REJECTED'
  | 'ESCALATED_TO_ADMIN';

export type ScoreClassification =
  | 'EXCEPTIONAL' // 900 - 1000
  | 'STRONG'      // 800 - 899
  | 'GOOD'        // 700 - 799
  | 'MODERATE'    // 600 - 699
  | 'WEAK'        // 400 - 599
  | 'POOR'        // 0 - 399
  | 'NOT_YET_RATED'; // Insufficient verified history

export type ScoreConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

export interface InvoiceLineItem {
  id: string;
  description: string;
  hsnCode?: string;
  quantity: number;
  unit: string; // e.g. "MT", "Bags", "Sq.m"
  unitRate: number;
  gstRate: number; // e.g. 18 for 18%
  gstAmount: number;
  total: number;
}

export interface PaymentCountdown {
  daysRemaining: number;
  daysOverdue: number;
  isOverdue: boolean;
  isDueToday: boolean;
  displayStatus:
    | 'PAYMENT DUE TODAY'
    | `PAYMENT DUE IN ${number} DAYS`
    | `OVERDUE BY ${number} DAYS`
    | 'PARTIALLY PAID'
    | 'FULLY PAID'
    | 'DISPUTED — NOT IN DEFAULT'
    | 'CANCELLED'
    | 'DRAFT';
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'SETTLED';
}

export interface CommercialInvoiceDto {
  id: string;
  invoiceNumber: string;
  purchaseOrderId?: string;
  rfqId?: string;
  buyerBusinessId: string;
  buyerBusinessName?: string;
  supplierBusinessId: string;
  supplierBusinessName?: string;
  issuerUserId: string;
  recipientUserId?: string;
  invoiceDate: string; // ISO
  contractualDueDate: string; // ISO
  revisedDueDate?: string;
  dueRevisionReason?: string;
  paymentTerms: string;
  paymentTermsDays: number;
  currency: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  verificationStatus: PaymentVerificationStatus;
  items: InvoiceLineItem[];
  documentUrl?: string;
  documentFileName?: string;
  notes?: string;
  isDisputed: boolean;
  disputeId?: string;
  paidAt?: string;
  countdown: PaymentCountdown;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentLedgerEntryDto {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  payerBusinessId: string;
  payerBusinessName?: string;
  payeeBusinessId: string;
  payeeBusinessName?: string;
  recordedByUserId: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  utrNumber?: string;
  bankReference?: string;
  receiptUrl?: string;
  receiptFileName?: string;
  status: 'RECORDED' | 'SUBMITTED_FOR_VERIFICATION' | 'CONFIRMED' | 'REJECTED' | 'DISPUTED' | 'REVERSED';
  verificationStatus: 'UNVERIFIED' | 'PENDING_COUNTERPARTY' | 'CONFIRMED' | 'INDEPENDENTLY_VERIFIED' | 'REJECTED';
  verifiedAt?: string;
  verifiedByUserId?: string;
  notes?: string;
  isReversal: boolean;
  reversedEntryId?: string;
  createdAt: string;
}

export interface PaymentScheduleInstalmentDto {
  id: string;
  invoiceId: string;
  instalmentNumber: number;
  description: string;
  percentage?: number;
  dueDate: string;
  revisedDueDate?: string;
  expectedAmount: number;
  paidAmount: number;
  status: 'PENDING' | 'DUE_SOON' | 'OVERDUE' | 'PARTIALLY_PAID' | 'PAID' | 'WAIVED';
}

export interface PaymentDisputeDto {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  disputedByBusinessId: string;
  disputedByBusinessName?: string;
  disputedByUserId: string;
  counterpartyBusinessId: string;
  counterpartyBusinessName?: string;
  disputeType: DisputeType;
  status: DisputeStatus;
  disputedAmount?: number;
  reason: string;
  evidenceUrls: string[];
  counterpartyResponse?: string;
  counterpartyRespondedAt?: string;
  resolutionNotes?: string;
  resolvedByUserId?: string;
  resolvedAt?: string;
  adjustmentAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentScoreFactorBreakdown {
  onTimePaymentScore: number;       // out of 350
  delayPenaltyScore: number;         // out of 200
  overdueFrequencyScore: number;     // out of 150
  outstandingExposureScore: number;  // out of 100
  consistencyScore: number;          // out of 100
  transactionDepthScore: number;     // out of 100
  totalScore: number;                // out of 1000
}

export interface PaymentScoreDto {
  businessId: string;
  businessName: string;
  scoreType: 'BUYER' | 'SUPPLIER' | 'DUAL';
  buyerScore: number | null;
  supplierScore: number | null;
  buyerClassification: ScoreClassification;
  supplierClassification: ScoreClassification;
  buyerConfidence: ScoreConfidence;
  supplierConfidence: ScoreConfidence;
  onTimePaymentRate: number; // e.g. 96.5%
  averageDelayDays: number; // e.g. 1.8 days
  overdueFrequencyRate: number; // e.g. 3.2%
  outstandingRatio: number;
  verifiedInvoiceCount: number;
  verifiedTransactionCount: number;
  verifiedTransactionValue: number;
  observationPeriodDays: number;
  isRated: boolean;
  unratedReason?: string;
  factorBreakdown: PaymentScoreFactorBreakdown;
  positiveFactors: string[];
  negativeFactors: string[];
  lastCalculatedAt: string;
}

export interface LedgerFinancialSummary {
  totalInvoicedAmount: number;
  totalPaidAmount: number;
  totalOutstandingAmount: number;
  dueWithin7DaysAmount: number;
  dueWithin15DaysAmount: number;
  dueWithin30DaysAmount: number;
  overdueAmount: number;
  totalInvoicesCount: number;
  paidInvoicesCount: number;
  overdueInvoicesCount: number;
  disputedInvoicesCount: number;
}
