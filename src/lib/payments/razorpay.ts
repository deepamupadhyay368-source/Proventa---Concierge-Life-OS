import crypto from 'crypto';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface CreatePaymentIntentParams {
  bookingId: string;
  customerId: string;
  amountPaise: number;
  currency?: string;
  idempotencyKey: string;
}

export async function createPaymentIntent(params: CreatePaymentIntentParams) {
  const isEnabled = process.env.FEATURE_PAYMENTS_ENABLED === 'true';

  if (!isEnabled) {
    logger.info('Payments are currently disabled for Wave 1 (handled via concierge directly)');
    return {
      status: 'WAVE1_CONCIERGE_HANDLED',
      message: 'Direct payment processing is disabled in Wave 1. Your concierge will coordinate billing.',
    };
  }

  // Check idempotency
  const existing = await db.payment.findUnique({
    where: { idempotencyKey: params.idempotencyKey },
  });

  if (existing) {
    return {
      paymentId: existing.id,
      status: existing.status,
      amount: existing.amount,
      currency: existing.currency,
    };
  }

  // Create payment record in database
  const payment = await db.payment.create({
    data: {
      bookingId: params.bookingId,
      customerId: params.customerId,
      amount: params.amountPaise,
      currency: params.currency || 'INR',
      status: 'PENDING',
      idempotencyKey: params.idempotencyKey,
    },
  });

  return {
    paymentId: payment.id,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
  };
}

export function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
