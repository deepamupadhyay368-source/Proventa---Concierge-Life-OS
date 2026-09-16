import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { appendTaskEvent } from '@/lib/orchestration/timeline';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'proventa_webhook_secret_dev';
    const rawBody = await req.text();

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

    // Process payment captured
    if (event === 'payment.captured') {
      const paymentEntity = eventPayload.payment.entity;
      const paymentId = paymentEntity.id;
      const amountPaise = paymentEntity.amount;
      const notes = paymentEntity.notes || {};
      const taskId = notes.taskId;

      if (taskId) {
        const existingTask = await db.task.findUnique({
          where: { id: taskId },
          include: { events: { where: { eventType: 'PAYMENT_CAPTURED' } } },
        });

        if (existingTask && existingTask.paymentStatus !== 'CAPTURED') {
          await db.task.update({
            where: { id: taskId },
            data: {
              paymentStatus: 'CAPTURED',
              budgetAmount: Math.round(amountPaise / 100),
            },
          });

          await appendTaskEvent({
            taskId,
            eventType: 'PAYMENT_CAPTURED',
            actorRole: 'SYSTEM',
            message: `Payment authorized and captured [Ref: ${paymentId}] - ₹${Math.round(amountPaise / 100).toLocaleString('en-IN')}`,
            data: { paymentId, amountPaise },
          });
        }
      }
    }

    // Process refund processed
    if (event === 'refund.processed') {
      const refundEntity = eventPayload.refund.entity;
      const paymentId = refundEntity.payment_id;

      const payment = await db.payment.findFirst({
        where: { providerRef: paymentId },
        include: { booking: true },
      });

      if (payment) {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: 'REFUNDED' },
        });

        if (payment.bookingId) {
          await db.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'REFUNDED' },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Razorpay Webhook Error]', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}
