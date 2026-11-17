/**
 * PROVENTA PAYMENT INTELLIGENCE
 * Scoring Calculation Engine
 * 
 * Proprietary, transparent, deterministic Payment Behaviour Scoring.
 * Maximum score: 1,000 points.
 * 
 * Distinct from credit bureau ratings. Measures verified on-platform commercial fulfillment.
 */

import type {
  ScoreClassification,
  ScoreConfidence,
  PaymentScoreDto,
  PaymentScoreFactorBreakdown,
  InvoiceStatus,
} from './types';
import { PreciseMoney } from './decimal';

export interface EligibleInvoiceRecord {
  id: string;
  totalAmount: number;
  paidAmount: number;
  contractualDueDate: string | Date;
  paidAt?: string | Date | null;
  status: InvoiceStatus;
  isDisputed: boolean;
  verificationStatus: string;
}

export interface ScoreCalculationInput {
  businessId: string;
  businessName: string;
  scoreType: 'BUYER' | 'SUPPLIER';
  invoices: EligibleInvoiceRecord[];
  observationPeriodDays?: number;
  referenceDate?: Date;
}

export class PaymentScoreEngine {
  /**
   * Minimum thresholds required for score publication
   */
  public static readonly MIN_VERIFIED_INVOICES_TO_RATE = 2;
  public static readonly MIN_VERIFIED_VALUE_TO_RATE = 50000; // ₹50,000

  /**
   * Calculate Payment Score for Buyer or Supplier
   */
  public static calculateScore(input: ScoreCalculationInput): PaymentScoreDto {
    const now = input.referenceDate || new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Filter out disputed invoices from penalty calculations (disputes do not establish defaults)
    const validInvoices = input.invoices.filter((inv) => !inv.isDisputed && inv.status !== 'CANCELLED');
    const verifiedInvoices = validInvoices.filter(
      (inv) => inv.verificationStatus === 'CONFIRMED_BY_COUNTERPARTY' || inv.verificationStatus === 'INDEPENDENTLY_VERIFIED'
    );

    const verifiedInvoiceCount = verifiedInvoices.length;
    const verifiedTransactionValue = verifiedInvoices.reduce((acc, inv) => acc + inv.paidAmount, 0);

    // Data sufficiency gate: Must meet verified volume & invoice count
    const hasSufficientData =
      verifiedInvoiceCount >= this.MIN_VERIFIED_INVOICES_TO_RATE &&
      verifiedTransactionValue >= this.MIN_VERIFIED_VALUE_TO_RATE;

    if (!hasSufficientData) {
      return {
        businessId: input.businessId,
        businessName: input.businessName,
        scoreType: input.scoreType,
        buyerScore: null,
        supplierScore: null,
        buyerClassification: 'NOT_YET_RATED',
        supplierClassification: 'NOT_YET_RATED',
        buyerConfidence: 'LOW',
        supplierConfidence: 'LOW',
        onTimePaymentRate: 0,
        averageDelayDays: 0,
        overdueFrequencyRate: 0,
        outstandingRatio: 0,
        verifiedInvoiceCount,
        verifiedTransactionCount: verifiedInvoiceCount,
        verifiedTransactionValue,
        observationPeriodDays: input.observationPeriodDays || 0,
        isRated: false,
        unratedReason: 'NOT YET RATED — INSUFFICIENT VERIFIED PAYMENT HISTORY',
        factorBreakdown: {
          onTimePaymentScore: 0,
          delayPenaltyScore: 0,
          overdueFrequencyScore: 0,
          outstandingExposureScore: 0,
          consistencyScore: 0,
          transactionDepthScore: 0,
          totalScore: 0,
        },
        positiveFactors: [
          'Enterprise business registered on PROVENTA platform',
          'Awaiting completion of minimum verified commercial transaction cycles',
        ],
        negativeFactors: [
          `Requires minimum ${this.MIN_VERIFIED_INVOICES_TO_RATE} verified transactions and ₹${this.MIN_VERIFIED_VALUE_TO_RATE.toLocaleString('en-IN')} volume to establish initial baseline`,
        ],
        lastCalculatedAt: now.toISOString(),
      };
    }

    // 2. Component Calculations:
    let totalDueValue = new PreciseMoney(0);
    let onTimePaidValue = new PreciseMoney(0);
    let totalDelayDaysSum = 0;
    let lateInvoicesCount = 0;
    let overdueInvoicesCount = 0;
    let overdueOutstandingValue = new PreciseMoney(0);
    let totalOutstandingValue = new PreciseMoney(0);
    let totalInvoicedValue = new PreciseMoney(0);

    for (const inv of verifiedInvoices) {
      const invTotal = new PreciseMoney(inv.totalAmount);
      const invPaid = new PreciseMoney(inv.paidAmount);
      const invDue = typeof inv.contractualDueDate === 'string' ? new Date(inv.contractualDueDate) : inv.contractualDueDate;
      const dueDate = new Date(invDue.getFullYear(), invDue.getMonth(), invDue.getDate());

      totalInvoicedValue = totalInvoicedValue.add(invTotal);
      const outstanding = invTotal.subtract(invPaid);
      if (outstanding.isPositive()) {
        totalOutstandingValue = totalOutstandingValue.add(outstanding);
        if (today.getTime() > dueDate.getTime()) {
          overdueOutstandingValue = overdueOutstandingValue.add(outstanding);
        }
      }

      if (inv.paidAt) {
        const paidRaw = typeof inv.paidAt === 'string' ? new Date(inv.paidAt) : inv.paidAt;
        const paidDate = new Date(paidRaw.getFullYear(), paidRaw.getMonth(), paidRaw.getDate());
        totalDueValue = totalDueValue.add(invPaid);

        if (paidDate.getTime() <= dueDate.getTime()) {
          onTimePaidValue = onTimePaidValue.add(invPaid);
        } else {
          // Late payment
          const delayDays = Math.max(1, Math.round((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
          totalDelayDaysSum += delayDays;
          lateInvoicesCount++;
        }
      } else if (today.getTime() > dueDate.getTime()) {
        // Unpaid and already overdue
        overdueInvoicesCount++;
        const delayDays = Math.max(1, Math.round((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
        totalDelayDaysSum += delayDays;
        lateInvoicesCount++;
      }
    }

    // A. On-Time Payment History (Weight: 350)
    let onTimeRatio = 1.0;
    if (totalDueValue.isPositive()) {
      onTimeRatio = Number(onTimePaidValue.toPaise()) / Number(totalDueValue.toPaise());
      onTimeRatio = Math.min(1.0, Math.max(0.0, onTimeRatio));
    }
    const onTimePaymentScore = Math.round(onTimeRatio * 350);

    // B. Average Payment Delay (Weight: 200)
    const averageDelayDays = lateInvoicesCount > 0 ? totalDelayDaysSum / lateInvoicesCount : 0;
    // Scale: 0 days delay = 200 pts; 30+ days delay = 0 pts
    const delayPenaltyFactor = Math.max(0.0, 1.0 - (averageDelayDays / 30));
    const delayPenaltyScore = Math.round(delayPenaltyFactor * 200);

    // C. Overdue Invoice Frequency (Weight: 150)
    const overdueRatio = verifiedInvoices.length > 0 ? (lateInvoicesCount + overdueInvoicesCount) / verifiedInvoices.length : 0;
    const overdueFrequencyFactor = Math.max(0.0, 1.0 - overdueRatio);
    const overdueFrequencyScore = Math.round(overdueFrequencyFactor * 150);

    // D. Outstanding Exposure Relative to Obligations (Weight: 100)
    let outstandingRatio = 0.0;
    if (totalInvoicedValue.isPositive()) {
      outstandingRatio = Number(overdueOutstandingValue.toPaise()) / Number(totalInvoicedValue.toPaise());
      outstandingRatio = Math.min(1.0, Math.max(0.0, outstandingRatio));
    }
    const outstandingExposureScore = Math.round((1.0 - outstandingRatio) * 100);

    // E. Payment Consistency (Weight: 100)
    // Consistency is high when payments have minimal variance in delay
    const consistencyScore = averageDelayDays <= 3 ? 100 : averageDelayDays <= 7 ? 85 : averageDelayDays <= 15 ? 65 : 40;

    // F. Verified Transaction History Depth (Weight: 100)
    let transactionDepthScore = 40;
    if (verifiedInvoiceCount >= 10) transactionDepthScore = 100;
    else if (verifiedInvoiceCount >= 6) transactionDepthScore = 85;
    else if (verifiedInvoiceCount >= 3) transactionDepthScore = 70;

    // Total Score
    const totalRawScore =
      onTimePaymentScore +
      delayPenaltyScore +
      overdueFrequencyScore +
      outstandingExposureScore +
      consistencyScore +
      transactionDepthScore;

    const totalScore = Math.min(1000, Math.max(0, totalRawScore));
    const classification = this.classifyScore(totalScore);

    // Confidence Assessment
    const observationPeriod = input.observationPeriodDays || 60;
    let confidence: ScoreConfidence = 'LOW';
    if (verifiedInvoiceCount >= 10 && observationPeriod >= 90 && verifiedTransactionValue >= 500000) {
      confidence = 'HIGH';
    } else if (verifiedInvoiceCount >= 3 && observationPeriod >= 30 && verifiedTransactionValue >= 100000) {
      confidence = 'MEDIUM';
    }

    // Explanations
    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];

    if (onTimeRatio >= 0.95) positiveFactors.push(`Excellent on-time settlement record (${(onTimeRatio * 100).toFixed(1)}% paid within terms)`);
    else if (onTimeRatio >= 0.85) positiveFactors.push(`Good on-time settlement record (${(onTimeRatio * 100).toFixed(1)}%)`);
    else negativeFactors.push(`On-time payment rate of ${(onTimeRatio * 100).toFixed(1)}% has degraded score baseline`);

    if (averageDelayDays === 0) positiveFactors.push('Zero recorded average payment delay across verified invoices');
    else if (averageDelayDays <= 3) positiveFactors.push(`Low average delay window of ${averageDelayDays.toFixed(1)} days`);
    else negativeFactors.push(`Average delay of ${averageDelayDays.toFixed(1)} days on delayed settlements`);

    if (overdueOutstandingValue.isZero()) positiveFactors.push('Zero active overdue balance outstanding across verified invoices');
    else negativeFactors.push(`Active overdue balance of ₹${overdueOutstandingValue.toNumber().toLocaleString('en-IN')} pending settlement`);

    if (verifiedInvoiceCount >= 6) positiveFactors.push(`Established multi-transaction depth (${verifiedInvoiceCount} verified cycles)`);

    return {
      businessId: input.businessId,
      businessName: input.businessName,
      scoreType: input.scoreType,
      buyerScore: input.scoreType === 'BUYER' ? totalScore : null,
      supplierScore: input.scoreType === 'SUPPLIER' ? totalScore : null,
      buyerClassification: input.scoreType === 'BUYER' ? classification : 'NOT_YET_RATED',
      supplierClassification: input.scoreType === 'SUPPLIER' ? classification : 'NOT_YET_RATED',
      buyerConfidence: input.scoreType === 'BUYER' ? confidence : 'LOW',
      supplierConfidence: input.scoreType === 'SUPPLIER' ? confidence : 'LOW',
      onTimePaymentRate: Math.round(onTimeRatio * 10000) / 100,
      averageDelayDays: Math.round(averageDelayDays * 10) / 10,
      overdueFrequencyRate: Math.round(overdueRatio * 10000) / 100,
      outstandingRatio: Math.round(outstandingRatio * 10000) / 100,
      verifiedInvoiceCount,
      verifiedTransactionCount: verifiedInvoiceCount,
      verifiedTransactionValue,
      observationPeriodDays: observationPeriod,
      isRated: true,
      factorBreakdown: {
        onTimePaymentScore,
        delayPenaltyScore,
        overdueFrequencyScore,
        outstandingExposureScore,
        consistencyScore,
        transactionDepthScore,
        totalScore,
      },
      positiveFactors,
      negativeFactors,
      lastCalculatedAt: now.toISOString(),
    };
  }

  public static classifyScore(score: number): ScoreClassification {
    if (score >= 900) return 'EXCEPTIONAL';
    if (score >= 800) return 'STRONG';
    if (score >= 700) return 'GOOD';
    if (score >= 600) return 'MODERATE';
    if (score >= 400) return 'WEAK';
    return 'POOR';
  }
}
