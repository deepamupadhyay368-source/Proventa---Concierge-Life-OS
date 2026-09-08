import type { BaseProviderInterface, ProviderResult } from '../types';

export interface PaymentIntent {
  intentId: string;
  amountPaise: number;
  currency: string;
  status: 'REQUIRES_PAYMENT_METHOD' | 'REQUIRES_CONFIRMATION' | 'REQUIRES_ACTION' | 'PROCESSING' | 'SUCCEEDED' | 'CANCELLED';
  clientSecret?: string;
  orderId?: string;
}

export interface PaymentCharge {
  chargeId: string;
  paymentMethod: 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';
  amountPaise: number;
  feePaise: number;
  taxPaise: number;
  status: 'CAPTURED' | 'FAILED' | 'AUTHORIZED';
  bankReference?: string;
}

export interface RefundRecord {
  refundId: string;
  chargeId: string;
  amountPaise: number;
  status: 'PROCESSED' | 'PENDING' | 'FAILED';
  reason?: string;
}

export interface PaymentProvider extends BaseProviderInterface {
  readonly category: 'PAYMENTS';
  createPaymentIntent(amountPaise: number, currency: string, idempotencyKey: string, metadata?: Record<string, any>): Promise<ProviderResult<PaymentIntent>>;
  authorizePayment(paymentId: string): Promise<ProviderResult<PaymentCharge>>;
  capturePayment(paymentId: string, amountPaise: number): Promise<ProviderResult<PaymentCharge>>;
  refundPayment(paymentId: string, amountPaise: number, reason?: string): Promise<ProviderResult<RefundRecord>>;
  verifyWebhookSignature(payload: string, signature: string): Promise<boolean>;
}
