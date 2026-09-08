import { db } from '@/lib/db';
import type { TransactionStatus, RefundStatus, ProviderServiceCategory } from '@prisma/client';
import { appendTaskEvent } from '@/lib/orchestration/timeline';

export interface CreateTransactionParams {
  userId: string;
  taskId?: string;
  providerId?: string;
  providerName: string;
  service: ProviderServiceCategory;
  amount: number; // in paise
  currency?: string;
  idempotencyKey: string;
  metadata?: Record<string, any>;
}

export class TransactionEngine {
  /**
   * Creates or returns existing transaction by idempotency key.
   */
  static async createOrGetTransaction(params: CreateTransactionParams) {
    const existing = await db.externalTransaction.findUnique({
      where: { idempotencyKey: params.idempotencyKey },
    });

    if (existing) {
      return { transaction: existing, isDuplicate: true };
    }

    const txCount = await db.externalTransaction.count();
    const transactionId = `TXN-${new Date().getFullYear()}-${(txCount + 1).toString().padStart(6, '0')}`;

    const transaction = await db.externalTransaction.create({
      data: {
        transactionId,
        userId: params.userId,
        taskId: params.taskId,
        providerId: params.providerId,
        providerName: params.providerName,
        service: params.service,
        amount: params.amount,
        currency: params.currency || 'INR',
        status: 'PLANNED',
        idempotencyKey: params.idempotencyKey,
        metadata: params.metadata || {},
      },
    });

    if (params.taskId) {
      await appendTaskEvent({
        taskId: params.taskId,
        eventType: 'TRANSACTION_CREATED',
        actorRole: 'SYSTEM',
        message: `Transaction ${transactionId} planned for ${params.providerName} (₹${(params.amount / 100).toLocaleString('en-IN')})`,
        data: { transactionId, amount: params.amount },
      });
    }

    return { transaction, isDuplicate: false };
  }

  /**
   * Transitions transaction to AWAITING_APPROVAL.
   */
  static async requireApproval(transactionId: string, reason?: string) {
    const updated = await db.externalTransaction.update({
      where: { transactionId },
      data: { status: 'AWAITING_APPROVAL' },
    });

    if (updated.taskId) {
      await appendTaskEvent({
        taskId: updated.taskId,
        eventType: 'APPROVAL_REQUIRED',
        actorRole: 'SYSTEM',
        message: `Transaction ${transactionId} requires client approval: ${reason || 'Financial authorization'}`,
        data: { transactionId, amount: updated.amount },
      });
    }

    return updated;
  }

  /**
   * Client approves transaction.
   */
  static async approveTransaction(transactionId: string) {
    return db.externalTransaction.update({
      where: { transactionId },
      data: { status: 'APPROVED' },
    });
  }

  /**
   * Sets transaction to PROCESSING before dispatching to external provider.
   */
  static async markProcessing(transactionId: string) {
    return db.externalTransaction.update({
      where: { transactionId },
      data: { status: 'PROCESSING' },
    });
  }

  /**
   * Authoritatively confirms transaction with external provider reference / PNR.
   */
  static async confirmTransaction(params: {
    transactionId: string;
    providerReference: string;
    authorizationId?: string;
    metadata?: Record<string, any>;
  }) {
    const updated = await db.externalTransaction.update({
      where: { transactionId: params.transactionId },
      data: {
        status: 'CONFIRMED',
        providerReference: params.providerReference,
        authorizationId: params.authorizationId,
        metadata: params.metadata || undefined,
      },
    });

    if (updated.taskId) {
      await appendTaskEvent({
        taskId: updated.taskId,
        eventType: 'BOOKING_CONFIRMED',
        actorRole: 'SYSTEM',
        message: `Transaction ${params.transactionId} confirmed by ${updated.providerName} [Ref: ${params.providerReference}]`,
        data: { reference: params.providerReference },
      });
    }

    return updated;
  }

  /**
   * Records failure with audit reason.
   */
  static async failTransaction(transactionId: string, error: string) {
    const updated = await db.externalTransaction.update({
      where: { transactionId },
      data: {
        status: 'FAILED',
        error,
      },
    });

    if (updated.taskId) {
      await appendTaskEvent({
        taskId: updated.taskId,
        eventType: 'TRANSACTION_FAILED',
        actorRole: 'SYSTEM',
        message: `Transaction ${transactionId} failed: ${error}`,
        data: { error },
      });
    }

    return updated;
  }

  /**
   * Handles refund lifecycle.
   */
  static async processRefund(params: {
    transactionId: string;
    refundAmountPaise: number;
    refundReference: string;
  }) {
    return db.externalTransaction.update({
      where: { transactionId: params.transactionId },
      data: {
        status: 'REFUNDED',
        refundStatus: 'COMPLETED',
        refundAmount: params.refundAmountPaise,
        refundReference: params.refundReference,
      },
    });
  }
}
