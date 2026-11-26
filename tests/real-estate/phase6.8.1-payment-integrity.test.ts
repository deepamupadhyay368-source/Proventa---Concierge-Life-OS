import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Razorpay SDK to prevent unmocked outbound network requests in sandboxed tests
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

// Mock valuation engine calculation for webhook and payment verify tests
vi.mock('@/lib/valuation/engine', () => ({
  calculateValuationForRequest: vi.fn(),
}));
vi.mock('../../src/lib/valuation/engine', () => ({
  calculateValuationForRequest: vi.fn(),
}));

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getSession } from '../../src/lib/auth/session';
import { calculateValuationForRequest } from '../../src/lib/valuation/engine';
import { generateReportAccessToken } from '../../src/lib/valuation/report-token';
import { POST as verifyPaymentHandler } from '../../src/app/api/price/pay/verify/route';
import { POST as webhookHandler } from '../../src/app/api/webhooks/razorpay/route';
import { GET as reportHandler } from '../../src/app/api/price/report/[id]/route';
import { db } from '../../src/lib/db';

vi.mock('../../src/lib/auth/session', () => ({
  getSession: vi.fn(),
}));

describe('PROVENTA Phase 6.8.1: Payment Atomicity, Webhook Concurrency & Refund Integrity', () => {
  const origEnv = process.env;
  const mockRequestId = 'req-phase681-atomicity-01';
  const mockUserId = 'usr-phase681-owner-01';
  const mockOrderId = 'order_phase681_111';
  const mockPaymentId = 'pay_phase681_222';
  const webhookSecret = 'proventa_test_webhook_secret_681';
  const testKeySecret = 'test_secret_for_sha256_mock';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...origEnv };
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;
    process.env.RAZORPAY_KEY_SECRET = testKeySecret;
    process.env.REPORT_TOKEN_SECRET = 'super_secret_test_token_key_681_proventa';
  });

  afterEach(() => {
    process.env = origEnv;
  });

  /* -------------------------------------------------------------------------- */
  /* AUDIT-DEFECT-01: Atomic Payment State Protection                           */
  /* -------------------------------------------------------------------------- */
  describe('AUDIT-DEFECT-01: Atomic Payment State Protection in verify/route.ts', () => {
    it('executes atomic conditional update (status: { not: "CAPTURED" }) upon invalid signature', async () => {
      (process.env as any).NODE_ENV = 'production';
      vi.mocked(getSession).mockResolvedValueOnce(null as any);

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockUserId,
        status: 'PENDING_PAYMENT',
        payment: { id: 'valpay-01', orderId: mockOrderId, status: 'INITIATED' },
        report: null,
      } as any);

      const updateManySpy = vi.spyOn(db.valuationPayment, 'updateMany').mockResolvedValueOnce({ count: 1 } as any);

      const req = new NextRequest('https://proventa.in/api/price/pay/verify', {
        method: 'POST',
        body: JSON.stringify({
          requestId: mockRequestId,
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: 'invalid_tampered_signature_hex',
        }),
      });

      const res = await verifyPaymentHandler(req);
      expect(res.status).toBe(400);

      // Verify the atomic conditional predicate
      expect(updateManySpy).toHaveBeenCalledWith({
        where: { id: 'valpay-01', status: { not: 'CAPTURED' } },
        data: { status: 'FAILED' },
      });
    });

    it('preserves CAPTURED payment status when atomic update filters out already captured payment', async () => {
      (process.env as any).NODE_ENV = 'production';
      vi.mocked(getSession).mockResolvedValueOnce(null as any);

      // Request read saw INITIATED, but concurrent webhook captured it in DB
      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockUserId,
        status: 'PAID',
        payment: { id: 'valpay-01', orderId: mockOrderId, status: 'INITIATED' },
        report: null,
      } as any);

      // In the database, status was already CAPTURED, so updateMany returns count: 0
      const updateManySpy = vi.spyOn(db.valuationPayment, 'updateMany').mockResolvedValueOnce({ count: 0 } as any);

      const req = new NextRequest('https://proventa.in/api/price/pay/verify', {
        method: 'POST',
        body: JSON.stringify({
          requestId: mockRequestId,
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: 'invalid_tampered_signature_hex',
        }),
      });

      const res = await verifyPaymentHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Invalid payment signature');

      // Assert count: 0 did not downgrade the record
      expect(updateManySpy).toHaveBeenCalledWith({
        where: { id: 'valpay-01', status: { not: 'CAPTURED' } },
        data: { status: 'FAILED' },
      });
    });
  });

  /* -------------------------------------------------------------------------- */
  /* AUDIT-DEFECT-02: Webhook Concurrency, Atomic Lease & Recovery               */
  /* -------------------------------------------------------------------------- */
  describe('AUDIT-DEFECT-02: Webhook Concurrency Lease & Error Recovery', () => {
    it('claims atomic execution lease and executes calculation on first webhook arrival', async () => {
      (process.env as any).NODE_ENV = 'production';

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockUserId,
        status: 'PENDING_PAYMENT',
        payment: { id: 'valpay-01', orderId: mockOrderId, amountPaise: 99900 },
        report: null,
      } as any);

      vi.spyOn(db.valuationPayment, 'updateMany').mockResolvedValueOnce({ count: 1 } as any);

      // Claim succeeds (count: 1)
      const claimSpy = vi.spyOn(db.valuationRequest, 'updateMany').mockResolvedValueOnce({ count: 1 } as any);
      vi.mocked(calculateValuationForRequest).mockResolvedValueOnce({
        reportReference: 'PRV-2026-TEST',
        valuation: { estimatedMidpointLakhs: 85.5 },
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

      // Verify claim predicate includes lease and status: PROCESSING
      expect(claimSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: mockRequestId,
            OR: expect.arrayContaining([
              { status: 'PAID' },
              { status: 'PENDING_PAYMENT' },
              expect.objectContaining({ status: 'PROCESSING' }),
            ]),
          }),
          data: { status: 'PROCESSING' },
        })
      );
      expect(calculateValuationForRequest).toHaveBeenCalledTimes(1);
    });

    it('safely yields when a concurrent duplicate webhook already holds the processing lease (count: 0)', async () => {
      (process.env as any).NODE_ENV = 'production';

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockUserId,
        status: 'PROCESSING',
        payment: { id: 'valpay-01', orderId: mockOrderId, amountPaise: 99900 },
        report: null,
      } as any);

      vi.spyOn(db.valuationPayment, 'updateMany').mockResolvedValueOnce({ count: 1 } as any);

      // Concurrent lease contention: another worker claimed it, so count is 0
      vi.spyOn(db.valuationRequest, 'updateMany').mockResolvedValueOnce({ count: 0 } as any);

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
      expect(json.processingClaimActive).toBe(true);

      // Valuation calculation MUST NOT be duplicated
      expect(calculateValuationForRequest).not.toHaveBeenCalled();
    });

    it('reverts request status to PAID and returns HTTP 500 when valuation calculation encounters error', async () => {
      (process.env as any).NODE_ENV = 'production';

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockUserId,
        status: 'PENDING_PAYMENT',
        payment: { id: 'valpay-01', orderId: mockOrderId, amountPaise: 99900 },
        report: null,
      } as any);

      vi.spyOn(db.valuationPayment, 'updateMany').mockResolvedValue({ count: 1 } as any);
      const reqUpdateSpy = vi.spyOn(db.valuationRequest, 'updateMany').mockResolvedValue({ count: 1 } as any);

      vi.mocked(calculateValuationForRequest).mockRejectedValueOnce(
        new Error('Deterministic factor computation timed out')
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

      // Verify request status was reverted from PROCESSING to PAID for webhook retry
      expect(reqUpdateSpy).toHaveBeenCalledWith({
        where: { id: mockRequestId, status: 'PROCESSING' },
        data: { status: 'PAID' },
      });
    });
  });

  /* -------------------------------------------------------------------------- */
  /* AUDIT-DEFECT-03: Real Estate Refund Lifecycle & Access Revocation           */
  /* -------------------------------------------------------------------------- */
  describe('AUDIT-DEFECT-03: Real Estate Refund Processing & Access Revocation', () => {
    it('processes refund.processed event, marks ValuationPayment REFUNDED and archives ValuationReport', async () => {
      (process.env as any).NODE_ENV = 'production';

      vi.spyOn(db.valuationPayment, 'findFirst').mockResolvedValueOnce({
        id: 'valpay-01',
        requestId: mockRequestId,
        userId: mockUserId,
        amountPaise: 99900,
        status: 'CAPTURED',
      } as any);

      const refundCreateSpy = vi.spyOn(db.valuationRefund, 'create').mockResolvedValueOnce({
        id: 'ref-01',
        paymentId: 'valpay-01',
        amountPaise: 99900,
        status: 'PROCESSED',
      } as any);

      const paymentUpdateSpy = vi.spyOn(db.valuationPayment, 'update').mockResolvedValueOnce({
        id: 'valpay-01',
        status: 'REFUNDED',
      } as any);

      const reportArchiveSpy = vi.spyOn(db.valuationReport, 'updateMany').mockResolvedValueOnce({
        count: 1,
      } as any);

      const refundPayload = {
        event: 'refund.processed',
        payload: {
          refund: {
            entity: {
              id: 'rfnd_phase681_001',
              payment_id: mockPaymentId,
              amount: 99900,
              notes: {
                requestId: mockRequestId,
                reason: 'Customer requested cancellation within statutory window',
              },
            },
          },
        },
      };

      const rawBody = JSON.stringify(refundPayload);
      const signature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

      const req = new NextRequest('https://proventa.in/api/webhooks/razorpay', {
        method: 'POST',
        headers: { 'x-razorpay-signature': signature },
        body: rawBody,
      });

      const res = await webhookHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.processed).toBe('REAL_ESTATE_REFUND');

      expect(refundCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            paymentId: 'valpay-01',
            amountPaise: 99900,
            status: 'PROCESSED',
            refundReference: 'rfnd_phase681_001',
          }),
        })
      );

      expect(paymentUpdateSpy).toHaveBeenCalledWith({
        where: { id: 'valpay-01' },
        data: { status: 'REFUNDED' },
      });

      expect(reportArchiveSpy).toHaveBeenCalledWith({
        where: { requestId: mockRequestId },
        data: { status: 'ARCHIVED' },
      });
    });

    it('denies report access with HTTP 403 ACCESS_REVOKED when payment is REFUNDED (even with valid bearer token)', async () => {
      const validToken = generateReportAccessToken(mockRequestId, mockUserId);

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockUserId,
        status: 'COMPLETED',
        payment: { id: 'valpay-01', status: 'REFUNDED' },
        report: { id: 'rep-01', status: 'ARCHIVED' },
        locality: null,
        project: null,
      } as any);

      const req = new NextRequest(`https://proventa.in/api/price/report/${mockRequestId}?token=${validToken}`);
      const res = await reportHandler(req, { params: Promise.resolve({ id: mockRequestId }) });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toContain('ACCESS_REVOKED');
    });

    it('denies report access with HTTP 403 ACCESS_REVOKED for authenticated report owner when report is ARCHIVED', async () => {
      vi.mocked(getSession).mockResolvedValueOnce({
        user: { id: mockUserId, roles: ['USER'] },
      } as any);

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockUserId,
        status: 'COMPLETED',
        payment: { id: 'valpay-01', status: 'REFUNDED' },
        report: { id: 'rep-01', status: 'ARCHIVED' },
        locality: null,
        project: null,
      } as any);

      const req = new NextRequest(`https://proventa.in/api/price/report/${mockRequestId}`);
      const res = await reportHandler(req, { params: Promise.resolve({ id: mockRequestId }) });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toContain('ACCESS_REVOKED');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* AUDIT-DEFECT-04: Sensitive Cache Control Headers                           */
  /* -------------------------------------------------------------------------- */
  describe('AUDIT-DEFECT-04: Report Response Private Cache Protection', () => {
    it('sets private, no-store, no-cache headers on successful report retrieval (HTTP 200)', async () => {
      const validToken = generateReportAccessToken(mockRequestId, mockUserId);

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockUserId,
        status: 'COMPLETED',
        payment: { id: 'valpay-01', status: 'CAPTURED' },
        report: {
          id: 'rep-01',
          reportReference: 'PRV-REP-01',
          status: 'READY',
          generatedAt: new Date().toISOString(),
          reportDataJson: { midpointLakhs: 85 },
        },
        locality: null,
        project: null,
      } as any);

      vi.spyOn(db.valuationReport, 'update').mockResolvedValueOnce({ id: 'rep-01' } as any);

      const req = new NextRequest(`https://proventa.in/api/price/report/${mockRequestId}?token=${validToken}`);
      const res = await reportHandler(req, { params: Promise.resolve({ id: mockRequestId }) });

      expect(res.status).toBe(200);
      expect(res.headers.get('cache-control')).toBe('private, no-store, no-cache, must-revalidate');
      expect(res.headers.get('pragma')).toBe('no-cache');
      expect(res.headers.get('expires')).toBe('0');
    });

    it('sets private, no-store, no-cache headers on error responses (HTTP 401, 403, 404)', async () => {
      // 401: Unauthenticated
      vi.mocked(getSession).mockResolvedValueOnce(null as any);
      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockUserId,
        payment: { status: 'CAPTURED' },
        report: { status: 'READY' },
      } as any);

      const unauthReq = new NextRequest(`https://proventa.in/api/price/report/${mockRequestId}`);
      const unauthRes = await reportHandler(unauthReq, { params: Promise.resolve({ id: mockRequestId }) });

      expect(unauthRes.status).toBe(401);
      expect(unauthRes.headers.get('cache-control')).toBe('private, no-store, no-cache, must-revalidate');
      expect(unauthRes.headers.get('pragma')).toBe('no-cache');

      // 404: Not Found
      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce(null);
      const notFoundReq = new NextRequest(`https://proventa.in/api/price/report/non-existent-id`);
      const notFoundRes = await reportHandler(notFoundReq, { params: Promise.resolve({ id: 'non-existent-id' }) });

      expect(notFoundRes.status).toBe(404);
      expect(notFoundRes.headers.get('cache-control')).toBe('private, no-store, no-cache, must-revalidate');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* AUDIT-DEFECT-05: Provider Verification Flag Configuration                   */
  /* -------------------------------------------------------------------------- */
  describe('AUDIT-DEFECT-05: Provider Fetch Configuration Verification', () => {
    it('confirms ENABLE_PROVIDER_PAYMENT_FETCH is disabled by default in production', () => {
      delete process.env.ENABLE_PROVIDER_PAYMENT_FETCH;
      expect(process.env.ENABLE_PROVIDER_PAYMENT_FETCH).toBeUndefined();
      expect(process.env.ENABLE_PROVIDER_PAYMENT_FETCH === 'true').toBe(false);
    });
  });
});
