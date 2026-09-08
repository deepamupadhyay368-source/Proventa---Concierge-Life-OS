import { db } from '@/lib/db';
import { TransactionEngine } from '@/lib/transactions/transaction-engine';
import { appendTaskEvent } from '@/lib/orchestration/timeline';
import { sendEmail } from '@/lib/email/sender';
import { logger } from '@/lib/logger';

export interface WebhookPayload {
  providerKey: string;
  eventType: string;
  transactionReference?: string;
  payload: Record<string, any>;
}

export class UniversalWebhookDispatcher {
  /**
   * Dispatches and processes incoming external provider webhook events.
   */
  static async handleEvent(data: WebhookPayload) {
    const { providerKey, eventType, transactionReference, payload } = data;

    // 1. Log incoming event immutably
    const log = await db.webhookEventLog.create({
      data: {
        providerKey,
        eventType,
        payload,
        processed: false,
      },
    });

    try {
      // 2. Lookup related transaction if reference given
      let transaction = null;
      if (transactionReference) {
        transaction = await db.externalTransaction.findFirst({
          where: {
            OR: [
              { providerReference: transactionReference },
              { transactionId: transactionReference },
              { idempotencyKey: transactionReference },
            ],
          },
        });
      }

      if (transaction) {
        await db.webhookEventLog.update({
          where: { id: log.id },
          data: { transactionId: transaction.id },
        });

        // 3. Process according to event type
        switch (eventType) {
          case 'booking_confirmed':
          case 'payment_success':
          case 'order_accepted':
          case 'driver_assigned':
            await db.externalTransaction.update({
              where: { id: transaction.id },
              data: { status: 'CONFIRMED' },
            });
            if (transaction.taskId) {
              await appendTaskEvent({
                taskId: transaction.taskId,
                eventType: 'WEBHOOK_RECEIVED',
                actorRole: 'SYSTEM',
                message: `External update from ${providerKey}: ${eventType} [Ref: ${transactionReference}]`,
                data: payload,
              });
            }
            break;

          case 'payment_failed':
          case 'order_rejected':
          case 'booking_cancelled':
            await db.externalTransaction.update({
              where: { id: transaction.id },
              data: { status: 'FAILED', error: payload.reason || 'Cancelled by provider' },
            });
            if (transaction.taskId) {
              await appendTaskEvent({
                taskId: transaction.taskId,
                eventType: 'WEBHOOK_FAILED',
                actorRole: 'SYSTEM',
                message: `Provider notification: ${eventType} failed. Reason: ${payload.reason || 'Provider error'}`,
                data: payload,
              });
            }
            break;

          case 'refund_processed':
            await db.externalTransaction.update({
              where: { id: transaction.id },
              data: {
                status: 'REFUNDED',
                refundStatus: 'COMPLETED',
                refundAmount: payload.amount || transaction.amount,
                refundReference: payload.refundId || `REF-${Date.now()}`,
              },
            });
            break;
        }
      }

      // Mark log as successfully processed
      await db.webhookEventLog.update({
        where: { id: log.id },
        data: { processed: true, processedAt: new Date() },
      });

      return { success: true, logId: log.id };
    } catch (err: any) {
      logger.error({ err, providerKey, eventType }, 'Webhook processing failed');
      await db.webhookEventLog.update({
        where: { id: log.id },
        data: { error: err.message },
      });
      return { success: false, error: err.message };
    }
  }
}
