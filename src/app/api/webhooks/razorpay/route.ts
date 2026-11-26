import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { appendTaskEvent } from '@/lib/orchestration/timeline';
import { PaymentAutomationEngine } from '@/lib/payments/engine';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { calculateValuationForRequest } from '@/lib/valuation/engine';

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

    const isValidSignature = sigBuffer
      ? sigBuffer.length === expBuffer.length && crypto.timingSafeEqual(sigBuffer, expBuffer)
      : process.env.NODE_ENV !== 'production';

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

        // Handle Real Estate Valuation Payment Isolation & Headless Generation (SEC-FINDING-03)
        // Process Real Estate valuation payments first without touching the Concierge Payment table
        if (notes.requestId || notes.valuationRequestId) {
          const valRequestId = notes.requestId || notes.valuationRequestId;

          const valRequest = await db.valuationRequest.findUnique({
            where: { id: valRequestId },
            include: { payment: true, report: true },
          });

          if (!valRequest) {
            console.error('[Razorpay Webhook] Valuation request not found for ID:', valRequestId);
            return NextResponse.json({ error: 'Valuation request not found' }, { status: 404 });
          }

          // Confirm order ID binding if recorded
          if (valRequest.payment?.orderId && orderId && valRequest.payment.orderId !== orderId) {
            console.error('[Razorpay Webhook] Order ID mismatch:', {
              recorded: valRequest.payment.orderId,
              received: orderId,
            });
            return NextResponse.json({ error: 'Order ID mismatch' }, { status: 400 });
          }

          // Confirm payment amount & currency
          if (valRequest.payment?.amountPaise && amountPaise !== valRequest.payment.amountPaise) {
            console.error('[Razorpay Webhook] Amount mismatch:', {
              expected: valRequest.payment.amountPaise,
              received: amountPaise,
            });
            return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
          }

          // Update ValuationPayment to CAPTURED
          await db.valuationPayment.updateMany({
            where: { requestId: valRequestId },
            data: {
              status: 'CAPTURED',
              paymentId: paymentId,
              paidAt: new Date(),
            },
          });

          // Mark ValuationRequest as PAID (will be marked COMPLETED by calculateValuationForRequest upon report readiness)
          if (valRequest.status !== 'COMPLETED') {
            await db.valuationRequest.updateMany({
              where: { id: valRequestId },
              data: { status: 'PAID' },
            });
          }

          // Idempotency: if report is already generated and ready, do not duplicate calculation
          if (valRequest.report && valRequest.report.status === 'READY') {
            return NextResponse.json({
              success: true,
              processed: 'REAL_ESTATE_VALUATION',
              alreadyGenerated: true,
            });
          }

          // Trigger Headless Valuation Report Generation
          try {
            await calculateValuationForRequest(valRequestId, {
              bypassPaymentCheck: false,
            });

            return NextResponse.json({
              success: true,
              processed: 'REAL_ESTATE_VALUATION',
              reportGenerated: true,
            });
          } catch (calcErr: any) {
            console.error('[Razorpay Webhook] Headless valuation calculation failed:', calcErr);
            // Retain CAPTURED payment state, do NOT mark report READY.
            // Return HTTP 500 so Razorpay exponential-backoff retry safely re-executes generation without re-charging.
            return NextResponse.json(
              {
                success: false,
                error: 'Valuation report calculation failed, retry scheduled via webhook.',
                retryable: true,
              },
              { status: 500 }
            );
          }
        }

        // Otherwise, update Concierge payment table record
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

        // Handle Membership Subscription Payment
        if (notes.type === 'MEMBERSHIP_SUBSCRIPTION' || notes.planId) {
          const planName = notes.planName || (notes.planId ? notes.planId.toUpperCase() : 'SELECT');
          const customerId = notes.customerId;
          const userId = notes.userId;

          if (customerId || userId) {
            const now = new Date();
            const renewsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            await db.customerProfile.updateMany({
              where: {
                OR: [
                  ...(customerId ? [{ id: customerId }] : []),
                  ...(userId ? [{ userId }] : []),
                ],
              },
              data: {
                membershipPlan: planName,
                membershipStatus: 'ACTIVE',
                membershipStartedAt: now,
                membershipRenewsAt: renewsAt,
              },
            });
          }
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
