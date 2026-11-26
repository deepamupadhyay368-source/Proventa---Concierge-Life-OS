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
import { POST as createOrderHandler } from '../../src/app/api/price/pay/create-order/route';
import { db } from '../../src/lib/db';

vi.mock('../../src/lib/auth/session', () => ({
  getSession: vi.fn(),
}));

describe('PROVENTA Phase 6.8.3: Financial Ledger, Payment State Machine & Concurrency Remediation', () => {
  const origEnv = process.env;
  const mockRequestId = 'req-phase683-ledger-01';
  const mockUserId = 'usr-phase683-owner-01';
  const mockOrderId = 'order_phase683_111';
  const mockPaymentId = 'pay_phase683_222';
  const webhookSecret = 'proventa_test_webhook_secret_683';
  const testKeySecret = 'test_secret_for_sha256_mock_683';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...origEnv };
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;
    process.env.RAZORPAY_KEY_SECRET = testKeySecret;
    process.env.REPORT_TOKEN_SECRET = 'super_secret_test_token_key_683_proventa';
  });

  afterEach(() => {
    process.env = origEnv;
  });

  /* -------------------------------------------------------------------------- */
  /* FINDING 01: Prevent REFUNDED/CAPTURED Payment Downgrades                   */
  /* -------------------------------------------------------------------------- */
  describe('FINDING 01: Payment State Transitions in pay/verify/route.ts', () => {
    it('restricts invalid signature failure transitions to PENDING and INITIATED states only', async () => {
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

      // Verify the predicate strictly limits to PENDING and INITIATED
      expect(updateManySpy).toHaveBeenCalledWith({
        where: { id: 'valpay-01', status: { in: ['PENDING', 'INITIATED'] } },
        data: { status: 'FAILED' },
      });
    });

    it('NEVER changes REFUNDED payment to FAILED upon invalid signature retry', async () => {
      (process.env as any).NODE_ENV = 'production';
      vi.mocked(getSession).mockResolvedValueOnce(null as any);

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockUserId,
        status: 'COMPLETED',
        payment: { id: 'valpay-01', orderId: mockOrderId, status: 'REFUNDED' },
        report: { status: 'ARCHIVED' },
      } as any);

      // In database, status: REFUNDED does not match { in: ['PENDING', 'INITIATED'] }, so count is 0
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
        where: { id: 'valpay-01', status: { in: ['PENDING', 'INITIATED'] } },
        data: { status: 'FAILED' },
      });
    });

    it('categorically rejects re-capturing a previously REFUNDED payment even with valid signature (HTTP 403)', async () => {
      (process.env as any).NODE_ENV = 'production';
      vi.mocked(getSession).mockResolvedValueOnce(null as any);

      const validSignature = crypto
        .createHmac('sha256', testKeySecret)
        .update(`${mockOrderId}|${mockPaymentId}`)
        .digest('hex');

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockUserId,
        status: 'COMPLETED',
        payment: { id: 'valpay-01', orderId: mockOrderId, status: 'REFUNDED' },
        report: { status: 'ARCHIVED' },
      } as any);

      // updateMany with status in PENDING, INITIATED, FAILED returns count: 0 because status is REFUNDED
      vi.spyOn(db.valuationPayment, 'updateMany').mockResolvedValueOnce({ count: 0 } as any);
      vi.spyOn(db.valuationPayment, 'findUnique').mockResolvedValueOnce({
        id: 'valpay-01',
        status: 'REFUNDED',
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
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toContain('ACCESS_REVOKED: This valuation payment was previously refunded and cannot be recaptured');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* FINDING 02: Prevent Replayed Webhook Resurrecting Refunded Payments        */
  /* -------------------------------------------------------------------------- */
  describe('FINDING 02: Replayed Capture Webhook Safety in webhooks/razorpay', () => {
    it('safely preserves REFUNDED payment state when delayed payment.captured webhook arrives', async () => {
      (process.env as any).NODE_ENV = 'production';

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockUserId,
        status: 'COMPLETED',
        payment: { id: 'valpay-01', orderId: mockOrderId, amountPaise: 99900, status: 'REFUNDED' },
        report: { status: 'ARCHIVED' },
      } as any);

      // updateMany with status: { not: 'REFUNDED' } returns count: 0
      const captureSpy = vi.spyOn(db.valuationPayment, 'updateMany').mockResolvedValueOnce({ count: 0 } as any);
      vi.spyOn(db.valuationPayment, 'findUnique').mockResolvedValueOnce({
        id: 'valpay-01',
        status: 'REFUNDED',
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
      expect(json.refundPreserved).toBe(true);

      expect(captureSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { requestId: mockRequestId, status: { not: 'REFUNDED' } },
        })
      );
      // Valuation engine MUST NOT be invoked
      expect(calculateValuationForRequest).not.toHaveBeenCalled();
    });
  });

  /* -------------------------------------------------------------------------- */
  /* FINDINGS 03–05: Refund Ledger, Idempotency & Transactional Integrity       */
  /* -------------------------------------------------------------------------- */
  describe('FINDINGS 03–05: Refund Accounting & Transactional Integrity', () => {
    it('detects duplicate refund.processed webhooks idempotently (Finding 04)', async () => {
      (process.env as any).NODE_ENV = 'production';

      vi.spyOn(db.valuationPayment, 'findFirst').mockResolvedValueOnce({
        id: 'valpay-01',
        requestId: mockRequestId,
        amountPaise: 99900,
        status: 'CAPTURED',
      } as any);

      // Simulate pre-existing refund with the same refundReference
      vi.spyOn(db.valuationRefund, 'findFirst').mockResolvedValueOnce({
        id: 'ref-existing',
        refundReference: 'rfnd_dup_001',
        amountPaise: 99900,
        status: 'PROCESSED',
      } as any);

      const refundCreateSpy = vi.spyOn(db.valuationRefund, 'create');

      const refundPayload = {
        event: 'refund.processed',
        payload: {
          refund: {
            entity: {
              id: 'rfnd_dup_001',
              payment_id: mockPaymentId,
              amount: 99900,
              notes: { requestId: mockRequestId },
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
      expect(json.alreadyProcessed).toBe(true);

      // Verify no new refund record was inserted
      expect(refundCreateSpy).not.toHaveBeenCalled();
    });

    it('accumulates multiple partial refunds in integer paise and archives report when cumulative total reaches payment (Findings 03 & 05)', async () => {
      (process.env as any).NODE_ENV = 'production';

      vi.spyOn(db.valuationPayment, 'findFirst').mockResolvedValueOnce({
        id: 'valpay-01',
        requestId: mockRequestId,
        amountPaise: 99900,
        status: 'CAPTURED',
      } as any);

      vi.spyOn(db.valuationRefund, 'findFirst').mockResolvedValueOnce(null);

      // Mock transaction execution
      const mockTx = {
        valuationRefund: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: 'ref-part-2', amountPaise: 49900 }),
          aggregate: vi.fn().mockResolvedValue({
            _sum: { amountPaise: 99900 }, // 50000 + 49900 = 99900
          }),
        },
        valuationPayment: {
          update: vi.fn().mockResolvedValue({ id: 'valpay-01', status: 'REFUNDED' }),
        },
        valuationReport: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
      };

      vi.spyOn(db, '$transaction').mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      const refundPayload = {
        event: 'refund.processed',
        payload: {
          refund: {
            entity: {
              id: 'rfnd_part_002',
              payment_id: mockPaymentId,
              amount: 49900,
              notes: { requestId: mockRequestId },
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
      expect(json.fullRefund).toBe(true);
      expect(json.cumulativeRefundedPaise).toBe(99900);

      // Verify transaction executed all atomic mutations
      expect(mockTx.valuationPayment.update).toHaveBeenCalledWith({
        where: { id: 'valpay-01' },
        data: { status: 'REFUNDED' },
      });
      expect(mockTx.valuationReport.updateMany).toHaveBeenCalledWith({
        where: { requestId: mockRequestId },
        data: { status: 'ARCHIVED' },
      });
    });

    it('preserves report access on partial refund that does NOT reach total payment amount', async () => {
      (process.env as any).NODE_ENV = 'production';

      vi.spyOn(db.valuationPayment, 'findFirst').mockResolvedValueOnce({
        id: 'valpay-01',
        requestId: mockRequestId,
        amountPaise: 99900,
        status: 'CAPTURED',
      } as any);

      vi.spyOn(db.valuationRefund, 'findFirst').mockResolvedValueOnce(null);

      const mockTx = {
        valuationRefund: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: 'ref-part-1', amountPaise: 30000 }),
          aggregate: vi.fn().mockResolvedValue({
            _sum: { amountPaise: 30000 }, // 30,000 < 99,900
          }),
        },
        valuationPayment: {
          update: vi.fn(),
        },
        valuationReport: {
          updateMany: vi.fn(),
        },
      };

      vi.spyOn(db, '$transaction').mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      const refundPayload = {
        event: 'refund.processed',
        payload: {
          refund: {
            entity: {
              id: 'rfnd_part_001',
              payment_id: mockPaymentId,
              amount: 30000,
              notes: { requestId: mockRequestId },
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
      expect(json.fullRefund).toBe(false);
      expect(json.cumulativeRefundedPaise).toBe(30000);

      // Payment must NOT be transitioned to REFUNDED, Report must NOT be ARCHIVED
      expect(mockTx.valuationPayment.update).not.toHaveBeenCalled();
      expect(mockTx.valuationReport.updateMany).not.toHaveBeenCalled();
    });
  });

  /* -------------------------------------------------------------------------- */
  /* FINDING 06: Distributed Lease Fencing Token Mechanics                      */
  /* -------------------------------------------------------------------------- */
  describe('FINDING 06: Distributed Lease Fencing Token Validation', () => {
    it('generates a unique lockToken and binds it to calculateValuationForRequest', async () => {
      (process.env as any).NODE_ENV = 'production';

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockUserId,
        status: 'PENDING_PAYMENT',
        payment: { id: 'valpay-01', orderId: mockOrderId, amountPaise: 99900 },
        report: null,
      } as any);

      vi.spyOn(db.valuationPayment, 'updateMany').mockResolvedValueOnce({ count: 1 } as any);

      const claimSpy = vi.spyOn(db.valuationRequest, 'updateMany').mockResolvedValueOnce({ count: 1 } as any);
      vi.mocked(calculateValuationForRequest).mockResolvedValueOnce({
        reportReference: 'PRV-FENCE-TEST',
        valuation: { estimatedMidpointLakhs: 92.0 },
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

      // Verify claim updated with processingLockToken
      expect(claimSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PROCESSING',
            processingLockToken: expect.any(String),
          }),
        })
      );

      // Verify lockToken was passed to valuation calculation
      expect(calculateValuationForRequest).toHaveBeenCalledWith(
        mockRequestId,
        expect.objectContaining({
          lockToken: expect.any(String),
        })
      );
    });

    it('prevents an expired or stale worker from reverting a newer worker lease on error', async () => {
      (process.env as any).NODE_ENV = 'production';

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockUserId,
        status: 'PENDING_PAYMENT',
        payment: { id: 'valpay-01', orderId: mockOrderId, amountPaise: 99900 },
        report: null,
      } as any);

      vi.spyOn(db.valuationPayment, 'updateMany').mockResolvedValue({ count: 1 } as any);
      const claimSpy = vi.spyOn(db.valuationRequest, 'updateMany').mockResolvedValueOnce({ count: 1 } as any);

      // Simulate calculation failure (e.g. timeout after lease expired)
      vi.mocked(calculateValuationForRequest).mockRejectedValueOnce(
        new Error('Worker timed out after lease expiry')
      );

      // The revert query in catch: where clause requires processingLockToken to match
      const revertSpy = vi.spyOn(db.valuationRequest, 'updateMany').mockResolvedValueOnce({ count: 0 } as any);

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

      // Verify revert query was conditional on the specific worker's lockToken
      expect(revertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: mockRequestId,
            status: 'PROCESSING',
            processingLockToken: expect.any(String),
          }),
          data: {
            status: 'PAID',
            processingLockToken: null,
          },
        })
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /* FINDING 07: Real Estate Payment Failed Webhook Handling                    */
  /* -------------------------------------------------------------------------- */
  describe('FINDING 07: Real Estate payment.failed Webhook Handling', () => {
    it('updates INITIATED valuation payment to FAILED with error diagnostic upon gateway failure', async () => {
      vi.spyOn(db.valuationPayment, 'findFirst').mockResolvedValueOnce({
        id: 'valpay-01',
        requestId: mockRequestId,
        status: 'INITIATED',
      } as any);

      const failUpdateSpy = vi.spyOn(db.valuationPayment, 'update').mockResolvedValueOnce({
        id: 'valpay-01',
        status: 'FAILED',
      } as any);

      const payload = {
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: mockPaymentId,
              order_id: mockOrderId,
              notes: { requestId: mockRequestId },
              error_description: 'Card declined due to insufficient funds',
            },
          },
        },
      };

      const rawBody = JSON.stringify(payload);
      const signature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

      const req = new NextRequest('https://proventa.in/api/webhooks/razorpay', {
        method: 'POST',
        headers: { 'x-razorpay-signature': signature },
        body: rawBody,
      });

      const res = await webhookHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.processed).toBe('REAL_ESTATE_PAYMENT_FAILED');
      expect(json.failureReason).toBe('Card declined due to insufficient funds');

      expect(failUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'valpay-01' },
          data: expect.objectContaining({
            status: 'FAILED',
            rawResponseJson: expect.objectContaining({
              gatewayError: 'Card declined due to insufficient funds',
            }),
          }),
        })
      );
    });

    it('NEVER downgrades a CAPTURED or REFUNDED payment upon subsequent payment.failed event', async () => {
      vi.spyOn(db.valuationPayment, 'findFirst').mockResolvedValueOnce({
        id: 'valpay-01',
        requestId: mockRequestId,
        status: 'CAPTURED',
      } as any);

      const failUpdateSpy = vi.spyOn(db.valuationPayment, 'update');

      const payload = {
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: mockPaymentId,
              order_id: mockOrderId,
              notes: { requestId: mockRequestId },
              error_description: 'Late decline notification',
            },
          },
        },
      };

      const rawBody = JSON.stringify(payload);
      const signature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

      const req = new NextRequest('https://proventa.in/api/webhooks/razorpay', {
        method: 'POST',
        headers: { 'x-razorpay-signature': signature },
        body: rawBody,
      });

      const res = await webhookHandler(req);
      expect(res.status).toBe(200);

      // Verify update was NOT called because status was CAPTURED
      expect(failUpdateSpy).not.toHaveBeenCalled();
    });
  });

  /* -------------------------------------------------------------------------- */
  /* FINDING 08: Re-Order After Refund Workflow                                  */
  /* -------------------------------------------------------------------------- */
  describe('FINDING 08: Re-Order After Refund in create-order/route.ts', () => {
    it('returns 409 Conflict with clear guidance to create a new valuation request when payment was REFUNDED', async () => {
      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockUserId,
        status: 'COMPLETED',
        payment: { id: 'valpay-01', status: 'REFUNDED' },
        locality: { id: 'loc-01', name: 'Bodakdev' },
        user: { id: mockUserId },
      } as any);

      const req = new NextRequest('https://proventa.in/api/price/pay/create-order', {
        method: 'POST',
        body: JSON.stringify({ requestId: mockRequestId }),
      });

      const res = await createOrderHandler(req);
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.code).toBe('PAYMENT_REFUNDED_REQUEST_CLOSED');
      expect(json.canReorderWithNewRequest).toBe(true);
      expect(json.error).toContain('This valuation request was previously refunded and closed');
    });

    it('returns alreadyPaid: true ONLY when payment status is strictly CAPTURED', async () => {
      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: mockUserId,
        status: 'COMPLETED',
        payment: { id: 'valpay-01', status: 'CAPTURED' },
        locality: { id: 'loc-01', name: 'Bodakdev' },
        user: { id: mockUserId },
      } as any);

      const req = new NextRequest('https://proventa.in/api/price/pay/create-order', {
        method: 'POST',
        body: JSON.stringify({ requestId: mockRequestId }),
      });

      const res = await createOrderHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.alreadyPaid).toBe(true);
      expect(json.reportUrl).toBe(`/price/report/${mockRequestId}`);
    });
  });
});
