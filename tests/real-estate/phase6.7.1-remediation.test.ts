import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock auth session module to avoid next-auth / next/server loading issues in Vitest
vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
  requireAuth: vi.fn(),
}));
vi.mock('../../src/lib/auth/session', () => ({
  getSession: vi.fn(),
  requireAuth: vi.fn(),
}));

// Mock razorpayClient
vi.mock('@/lib/payments/razorpay', () => ({
  razorpayClient: {
    payments: {
      fetch: vi.fn(),
    },
    orders: {
      create: vi.fn(),
    },
  },
}));
vi.mock('../../src/lib/payments/razorpay', () => ({
  razorpayClient: {
    payments: {
      fetch: vi.fn(),
    },
    orders: {
      create: vi.fn(),
    },
  },
}));

// Mock valuation engine calculation for webhook tests
vi.mock('@/lib/valuation/engine', () => ({
  calculateValuationForRequest: vi.fn(),
}));
vi.mock('../../src/lib/valuation/engine', () => ({
  calculateValuationForRequest: vi.fn(),
}));

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getSession } from '../../src/lib/auth/session';
import { razorpayClient } from '../../src/lib/payments/razorpay';
import { calculateValuationForRequest } from '../../src/lib/valuation/engine';
import { POST as verifyPaymentHandler } from '../../src/app/api/price/pay/verify/route';
import { POST as webhookHandler } from '../../src/app/api/webhooks/razorpay/route';
import { db } from '../../src/lib/db';

describe('PROVENTA Phase 6.7.1: Targeted Security & Payment Workflow Remediation', () => {
  const originalEnv = { ...process.env };
  const mockRequestId = 'req-phase671-test-01';
  const mockOwnerId = 'usr-owner-phase671';
  const mockAttackerId = 'usr-attacker-phase671';
  const mockOrderId = 'order_phase671_999';
  const mockPaymentId = 'pay_phase671_888';
  const testSecret = 'test_razorpay_secret_key_12345';

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    process.env.AUTH_SECRET = 'proventa-test-auth-secret-32-chars-long!';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('1. SEC-FINDING-01: Eliminate Unauthenticated Access-Token Issuance in Idempotency Branch', () => {
    it('rejects anonymous POST with only a completed requestId and does NOT return access token (HTTP 400)', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.RAZORPAY_KEY_SECRET = testSecret;

      // Mock session as anonymous (null)
      vi.mocked(getSession).mockResolvedValueOnce(null as any);

      // Request is already COMPLETED and report is READY
      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockOwnerId,
        status: 'COMPLETED',
        payment: { id: 'pay-01', orderId: mockOrderId, status: 'CAPTURED', amountPaise: 99900 },
        report: { status: 'READY', reportReference: 'PVI-VAL-2026-COMPLETED' },
      } as any);

      // Attacker sends only requestId without payment signature or session
      const req = new NextRequest('https://proventa.in/api/price/pay/verify', {
        method: 'POST',
        body: JSON.stringify({
          requestId: mockRequestId,
        }),
      });

      const res = await verifyPaymentHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.accessToken).toBeUndefined();
      expect(json.error).toContain('Missing required payment verification parameters');
    });

    it('rejects authenticated non-owner attempting to retrieve another customer completed report (HTTP 403)', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.RAZORPAY_KEY_SECRET = testSecret;

      // Mock session as attacker (non-owner)
      vi.mocked(getSession).mockResolvedValueOnce({
        user: { id: mockAttackerId, email: 'attacker@evil.com', roles: ['CUSTOMER'] },
      } as any);

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockOwnerId, // Belongs to owner
        status: 'COMPLETED',
        payment: { id: 'pay-01', orderId: mockOrderId, status: 'CAPTURED' },
        report: { status: 'READY', reportReference: 'PVI-VAL-2026-COMPLETED' },
      } as any);

      const req = new NextRequest('https://proventa.in/api/price/pay/verify', {
        method: 'POST',
        body: JSON.stringify({
          requestId: mockRequestId,
        }),
      });

      const res = await verifyPaymentHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.accessToken).toBeUndefined();
      expect(json.error).toContain('You do not have permission to access another customer');
    });

    it('allows authenticated owner to safely retrieve already completed report without re-verifying payment (HTTP 200)', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.RAZORPAY_KEY_SECRET = testSecret;

      // Mock session as legitimate owner
      vi.mocked(getSession).mockResolvedValueOnce({
        user: { id: mockOwnerId, email: 'owner@proventa.in', roles: ['CUSTOMER'] },
      } as any);

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockOwnerId,
        status: 'COMPLETED',
        payment: { id: 'pay-01', orderId: mockOrderId, status: 'CAPTURED' },
        report: { status: 'READY', reportReference: 'PVI-VAL-2026-COMPLETED' },
      } as any);

      const req = new NextRequest('https://proventa.in/api/price/pay/verify', {
        method: 'POST',
        body: JSON.stringify({
          requestId: mockRequestId,
        }),
      });

      const res = await verifyPaymentHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.alreadyProcessed).toBe(true);
      expect(json.accessToken).toBeDefined();
      expect(json.reportUrl).toContain(`?token=${json.accessToken}`);
    });

    it('allows guest customer to handle completed request idempotently IF valid signature is provided (HTTP 200)', async () => {
      (process.env as any).NODE_ENV = 'development';
      process.env.RAZORPAY_KEY_SECRET = 'dev_secret_fallback';

      vi.mocked(getSession).mockResolvedValueOnce(null as any);

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockOwnerId,
        status: 'COMPLETED',
        payment: { id: 'pay-01', orderId: mockOrderId, status: 'CAPTURED' },
        report: { status: 'READY', reportReference: 'PVI-VAL-2026-COMPLETED' },
      } as any);

      const validSignature = crypto
        .createHmac('sha256', 'dev_secret_fallback')
        .update(`${mockOrderId}|${mockPaymentId}`)
        .digest('hex');

      const req = new NextRequest('https://proventa.in/api/price/pay/verify', {
        method: 'POST',
        body: JSON.stringify({
          requestId: mockRequestId,
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: validSignature,
        }),
      });

      const res = await verifyPaymentHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.alreadyProcessed).toBe(true);
      expect(json.accessToken).toBeDefined();
    });
  });

  describe('2. SEC-FINDING-02: Prevent Captured Payment Downgrade', () => {
    it('updates INITIATED payment to FAILED upon invalid signature (HTTP 400)', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.RAZORPAY_KEY_SECRET = testSecret;

      vi.mocked(getSession).mockResolvedValueOnce(null as any);

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockOwnerId,
        status: 'PENDING_PAYMENT',
        payment: { id: 'pay-01', orderId: mockOrderId, status: 'INITIATED' },
        report: null,
      } as any);

      const updateSpy = vi.spyOn(db.valuationPayment, 'updateMany').mockResolvedValueOnce({ count: 1 } as any);

      const req = new NextRequest('https://proventa.in/api/price/pay/verify', {
        method: 'POST',
        body: JSON.stringify({
          requestId: mockRequestId,
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: 'invalid_forged_signature_hex_1234567890abcdef',
        }),
      });

      const res = await verifyPaymentHandler(req);
      expect(res.status).toBe(400);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'pay-01', status: { in: ['PENDING', 'INITIATED'] } },
        data: { status: 'FAILED' },
      });
    });

    it('NEVER downgrades an already CAPTURED payment upon invalid signature retry (HTTP 400)', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.RAZORPAY_KEY_SECRET = testSecret;

      vi.mocked(getSession).mockResolvedValueOnce(null as any);

      // Payment is ALREADY CAPTURED, but report still generating (status is PAID)
      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockOwnerId,
        status: 'PAID',
        payment: { id: 'pay-01', orderId: mockOrderId, status: 'CAPTURED' },
        report: null,
      } as any);

      const updateSpy = vi.spyOn(db.valuationPayment, 'updateMany').mockResolvedValueOnce({ count: 0 } as any);

      const req = new NextRequest('https://proventa.in/api/price/pay/verify', {
        method: 'POST',
        body: JSON.stringify({
          requestId: mockRequestId,
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: 'invalid_forged_signature_hex_1234567890abcdef',
        }),
      });

      const res = await verifyPaymentHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Invalid payment signature');
      // Verify atomic update was attempted with status: { in: ['PENDING', 'INITIATED'] } which returns count 0
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'pay-01', status: { in: ['PENDING', 'INITIATED'] } },
        data: { status: 'FAILED' },
      });
    });
  });

  describe('3. SEC-FINDING-05: Server-Side Payment Provider Confirmation', () => {
    it('rejects payment verification when provider reports status is NOT captured (HTTP 400)', async () => {
      (process.env as any).NODE_ENV = 'development';
      process.env.RAZORPAY_KEY_SECRET = testSecret; // Live key simulation
      process.env.ENABLE_PROVIDER_PAYMENT_FETCH = 'true';

      vi.mocked(getSession).mockResolvedValueOnce(null as any);

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockOwnerId,
        status: 'PENDING_PAYMENT',
        payment: { id: 'pay-01', orderId: mockOrderId, status: 'INITIATED', amountPaise: 99900 },
        report: null,
      } as any);

      const validSignature = crypto
        .createHmac('sha256', testSecret)
        .update(`${mockOrderId}|${mockPaymentId}`)
        .digest('hex');

      // Provider fetch mock: payment is merely 'authorized', not yet 'captured'
      vi.mocked(razorpayClient.payments.fetch).mockResolvedValueOnce({
        id: mockPaymentId,
        status: 'authorized',
        order_id: mockOrderId,
        amount: 99900,
        currency: 'INR',
      } as any);

      const req = new NextRequest('https://proventa.in/api/price/pay/verify', {
        method: 'POST',
        body: JSON.stringify({
          requestId: mockRequestId,
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: validSignature,
        }),
      });

      const res = await verifyPaymentHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("Provider payment status is 'authorized', expected 'captured'");
    });

    it('rejects payment verification when provider amount does not match recorded order (HTTP 400)', async () => {
      (process.env as any).NODE_ENV = 'development';
      process.env.RAZORPAY_KEY_SECRET = testSecret;
      process.env.ENABLE_PROVIDER_PAYMENT_FETCH = 'true';

      vi.mocked(getSession).mockResolvedValueOnce(null as any);

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockOwnerId,
        status: 'PENDING_PAYMENT',
        payment: { id: 'pay-01', orderId: mockOrderId, status: 'INITIATED', amountPaise: 99900 },
        report: null,
      } as any);

      const validSignature = crypto
        .createHmac('sha256', testSecret)
        .update(`${mockOrderId}|${mockPaymentId}`)
        .digest('hex');

      // Provider fetch mock: amount mismatch (e.g. 50000 instead of 99900)
      vi.mocked(razorpayClient.payments.fetch).mockResolvedValueOnce({
        id: mockPaymentId,
        status: 'captured',
        order_id: mockOrderId,
        amount: 50000,
        currency: 'INR',
      } as any);

      const req = new NextRequest('https://proventa.in/api/price/pay/verify', {
        method: 'POST',
        body: JSON.stringify({
          requestId: mockRequestId,
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: validSignature,
        }),
      });

      const res = await verifyPaymentHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Provider amount does not match expected amount');
    });
  });

  describe('4. SEC-FINDING-03: Webhook-Driven Headless Valuation Generation', () => {
    const webhookSecret = 'test_webhook_secret_key_123';

    it('validates order ID and amount binding before processing real estate payment', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

      // Mock request findUnique with mismatched order ID
      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockOwnerId,
        status: 'PENDING_PAYMENT',
        payment: { id: 'pay-01', orderId: 'different_order_id_123', amountPaise: 99900 },
        report: null,
      } as any);

      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: mockPaymentId,
              order_id: mockOrderId,
              amount: 99900,
              notes: { requestId: mockRequestId },
            },
          },
        },
      };

      const rawBody = JSON.stringify(webhookPayload);
      const signature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

      const req = new NextRequest('https://proventa.in/api/webhooks/razorpay', {
        method: 'POST',
        headers: { 'x-razorpay-signature': signature },
        body: rawBody,
      });

      const res = await webhookHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Order ID mismatch');
    });

    it('triggers headless valuation calculation upon payment.captured webhook when user never returns to browser', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockOwnerId,
        status: 'PENDING_PAYMENT',
        payment: { id: 'pay-01', orderId: mockOrderId, amountPaise: 99900 },
        report: null, // Report not yet generated
      } as any);

      const paymentUpdateSpy = vi.spyOn(db.valuationPayment, 'updateMany').mockResolvedValueOnce({ count: 1 } as any);
      const requestUpdateSpy = vi.spyOn(db.valuationRequest, 'updateMany').mockResolvedValueOnce({ count: 1 } as any);
      vi.mocked(calculateValuationForRequest).mockResolvedValueOnce({
        reportReference: 'PVI-VAL-HEADLESS-2026',
      } as any);

      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: mockPaymentId,
              order_id: mockOrderId,
              amount: 99900,
              notes: { requestId: mockRequestId },
            },
          },
        },
      };

      const rawBody = JSON.stringify(webhookPayload);
      const signature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

      const req = new NextRequest('https://proventa.in/api/webhooks/razorpay', {
        method: 'POST',
        headers: { 'x-razorpay-signature': signature },
        body: rawBody,
      });

      const res = await webhookHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.reportGenerated).toBe(true);
      expect(paymentUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ requestId: mockRequestId }),
          data: expect.objectContaining({ status: 'CAPTURED', paymentId: mockPaymentId }),
        })
      );
      expect(calculateValuationForRequest).toHaveBeenCalledWith(
        mockRequestId,
        expect.objectContaining({
          bypassPaymentCheck: false,
        })
      );
    });

    it('idempotently skips valuation calculation if report is ALREADY generated and READY', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockOwnerId,
        status: 'COMPLETED',
        payment: { id: 'pay-01', orderId: mockOrderId, amountPaise: 99900, status: 'CAPTURED' },
        report: { status: 'READY', reportReference: 'PVI-VAL-EXISTING-READY' },
      } as any);

      vi.spyOn(db.valuationPayment, 'updateMany').mockResolvedValueOnce({ count: 1 } as any);
      const calcSpy = vi.mocked(calculateValuationForRequest);

      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: mockPaymentId,
              order_id: mockOrderId,
              amount: 99900,
              notes: { requestId: mockRequestId },
            },
          },
        },
      };

      const rawBody = JSON.stringify(webhookPayload);
      const signature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

      const req = new NextRequest('https://proventa.in/api/webhooks/razorpay', {
        method: 'POST',
        headers: { 'x-razorpay-signature': signature },
        body: rawBody,
      });

      const res = await webhookHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.alreadyGenerated).toBe(true);
      expect(calcSpy).not.toHaveBeenCalled();
    });

    it('returns HTTP 500 when valuation calculation fails, allowing Razorpay webhook to retry without re-charging', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockOwnerId,
        status: 'PENDING_PAYMENT',
        payment: { id: 'pay-01', orderId: mockOrderId, amountPaise: 99900 },
        report: null,
      } as any);

      vi.spyOn(db.valuationPayment, 'updateMany').mockResolvedValue({ count: 1 } as any);
      vi.spyOn(db.valuationRequest, 'updateMany').mockResolvedValue({ count: 1 } as any);

      // Simulate transient DB lock or engine failure
      vi.mocked(calculateValuationForRequest).mockRejectedValueOnce(
        new Error('Transient database connection error during factor calculation')
      );

      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: mockPaymentId,
              order_id: mockOrderId,
              amount: 99900,
              notes: { requestId: mockRequestId },
            },
          },
        },
      };

      const rawBody = JSON.stringify(webhookPayload);
      const signature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

      const req = new NextRequest('https://proventa.in/api/webhooks/razorpay', {
        method: 'POST',
        headers: { 'x-razorpay-signature': signature },
        body: rawBody,
      });

      const res = await webhookHandler(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.retryable).toBe(true);
    });
  });

  describe('5. SEC-FINDING-04: URL Token Scrubbing Mechanics', () => {
    it('properly strips token parameter from URL query string while preserving other query params and path', () => {
      const urlWithToken = new URL('https://proventa.in/price/report/req-123?token=eyJwYXlsb2FkIjoxfQ.sig123&utm_source=email&view=full');
      urlWithToken.searchParams.delete('token');
      const cleanQuery = urlWithToken.searchParams.toString();
      const cleanUrl = urlWithToken.pathname + (cleanQuery ? `?${cleanQuery}` : '');

      expect(cleanUrl).toBe('/price/report/req-123?utm_source=email&view=full');
      expect(cleanUrl).not.toContain('token=');
    });

    it('produces clean pathname with no trailing question mark when token was the only query parameter', () => {
      const urlOnlyToken = new URL('https://proventa.in/price/report/req-123?token=eyJwYXlsb2FkIjoxfQ.sig123');
      urlOnlyToken.searchParams.delete('token');
      const cleanQuery = urlOnlyToken.searchParams.toString();
      const cleanUrl = urlOnlyToken.pathname + (cleanQuery ? `?${cleanQuery}` : '');

      expect(cleanUrl).toBe('/price/report/req-123');
      expect(cleanUrl).not.toContain('?');
      expect(cleanUrl).not.toContain('token=');
    });
  });
});
