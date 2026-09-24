import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { appendTaskEvent } from '@/lib/orchestration/timeline';
import { PaymentAutomationEngine } from '@/lib/payments/engine';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-razorpay-signature');
    const configuredSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (process.env.NODE_ENV === 'production' && !configuredSecret) {
      console.error('[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not configured in production');
      return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500 });
    }

    const secret = configuredSecret || 'proventa_webhook_secret_dev';
    const rawBody = await req.text();

    if (!signature && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const sigBuffer = signature ? Buffer.from(signature) : null;
    const expBuffer = Buffer.from(expectedSignature);

    const isValidSignature =
      process.env.NODE_ENV !== 'production' ||
      (sigBuffer &&
        sigBuffer.length === expBuffer.length &&
        crypto.timingSafeEqual(sigBuffer, expBuffer));

    if (!isValidSignature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const { event, payload: eventPayload } = payload;

    // 1. Process payment captured
    if (event === 'payment.captured') {
      const paymentEntity = eventPayload?.payment?.entity;
      if (paymentEntity) {
        const paymentId = paymentEntity.id;
        const orderId = paymentEntity.order_id;
        const amountPaise = paymentEntity.amount;
        const notes = paymentEntity.notes || {};
        const taskId = notes.taskId;
        const approvedOptionId = notes.approvedOptionId;

        // Update payment table record
        const payment = await db.payment.findFirst({
          where: {
            OR: [
              { providerOrderId: orderId },
              { providerRef: paymentId },
              ...(taskId ? [{ taskId }] : []),
            ],
          },
        });

        if (payment && payment.status !== 'CAPTURED') {
          await db.payment.update({
            where: { id: payment.id },
            data: {
              status: 'CAPTURED',
              providerRef: paymentId,
            },
          });
        }

        // Update task and trigger automated execution if not already completed
        if (taskId) {
          const existingTask = await db.task.findUnique({
            where: { id: taskId },
          });

          if (existingTask && existingTask.paymentStatus !== 'CAPTURED') {
            await PaymentAutomationEngine.confirmTaskPayment({
              taskId,
              paymentId: payment?.id || paymentId,
              providerRef: paymentId,
              amountPaise,
              method: paymentEntity.method || 'RAZORPAY_CHECKOUT',
            });

            // Automatically dispatch execution if task is in approval/holding state
            if (['AWAITING_APPROVAL', 'APPROVED', 'OPTIONS_READY'].includes(existingTask.status)) {
              try {
                await RequestOrchestrator.executeApprovedTask({
                  taskId,
                  optionId: approvedOptionId,
                });
              } catch (execErr: any) {
                console.error('[Razorpay Webhook] Auto-execution dispatch error:', execErr);
              }
            }
          }
        }
      }
    }

    // 2. Process payment failed
    if (event === 'payment.failed') {
      const paymentEntity = eventPayload?.payment?.entity;
      if (paymentEntity) {
        const paymentId = paymentEntity.id;
        const orderId = paymentEntity.order_id;
        const notes = paymentEntity.notes || {};
        const taskId = notes.taskId;
        const failureReason = paymentEntity.error_description || 'Payment gateway failed';

        const payment = await db.payment.findFirst({
          where: {
            OR: [
              { providerOrderId: orderId },
              { providerRef: paymentId },
            ],
          },
        });

        if (payment) {
          await db.payment.update({
            where: { id: payment.id },
            data: {
              status: 'FAILED',
              failureReason,
            },
          });
        }

        if (taskId) {
          await db.task.update({
            where: { id: taskId },
            data: { paymentStatus: 'FAILED' },
          });

          await appendTaskEvent({
            taskId,
            eventType: 'PAYMENT_FAILED',
            actorRole: 'SYSTEM',
            message: `Payment attempt failed: ${failureReason}`,
            data: { paymentId, failureReason },
          });
        }
      }
    }

    // 3. Process refund processed
    if (event === 'refund.processed') {
      const refundEntity = eventPayload?.refund?.entity;
      if (refundEntity) {
        const paymentId = refundEntity.payment_id;
        const refundAmount = refundEntity.amount;
        const refundRef = refundEntity.id;

        const payment = await db.payment.findFirst({
          where: {
            OR: [
              { providerRef: paymentId },
              { id: paymentId },
            ],
          },
        });

        if (payment) {
          await db.payment.update({
            where: { id: payment.id },
            data: {
              status: 'REFUNDED',
              refundStatus: 'COMPLETED',
              refundAmount,
              refundRef,
            },
          });

          if (payment.taskId) {
            await db.task.update({
              where: { id: payment.taskId },
              data: { paymentStatus: 'REFUNDED' },
            });

            await appendTaskEvent({
              taskId: payment.taskId,
              eventType: 'PAYMENT_REFUNDED',
              actorRole: 'SYSTEM',
              message: `Refund of ₹${Math.round(refundAmount / 100).toLocaleString('en-IN')} confirmed by gateway.`,
              data: { refundRef, refundAmount },
            });
          }
        }
      }
    }

    // 4. Process UPI Mandate / Subscription Activated
    if (event === 'subscription.authenticated' || event === 'mandate.active') {
      const entity = eventPayload?.subscription?.entity || eventPayload?.mandate?.entity || {};
      const customerId = entity.notes?.customerId || entity.customer_id;

      if (customerId) {
        await db.customerPaymentProfile.updateMany({
          where: {
            OR: [
              { customerId },
              { mandateReference: entity.id },
            ],
          },
          data: {
            mandateStatus: 'ACTIVE',
            mandateCreatedAt: new Date(),
          },
        });
      }
    }

    // 5. Process UPI Mandate / Subscription Cancelled / Revoked
    if (event === 'subscription.cancelled' || event === 'mandate.revoked') {
      const entity = eventPayload?.subscription?.entity || eventPayload?.mandate?.entity || {};
      const customerId = entity.notes?.customerId || entity.customer_id;

      if (customerId) {
        await db.customerPaymentProfile.updateMany({
          where: {
            OR: [
              { customerId },
              { mandateReference: entity.id },
            ],
          },
          data: {
            mandateStatus: 'REVOKED',
            mandateRevokedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Razorpay Webhook Error]', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}
