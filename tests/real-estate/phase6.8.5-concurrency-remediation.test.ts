import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Razorpay SDK
vi.mock('@/lib/payments/razorpay', () => ({
  razorpayClient: {
    payments: { fetch: vi.fn() },
    orders: { create: vi.fn() },
  },
}));
vi.mock('../../src/lib/payments/razorpay', () => ({
  razorpayClient: {
    payments: { fetch: vi.fn() },
    orders: { create: vi.fn() },
  },
}));

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { POST as webhookHandler } from '../../src/app/api/webhooks/razorpay/route';
import { calculateValuationForRequest } from '../../src/lib/valuation/engine';
import { db } from '../../src/lib/db';

describe('PROVENTA Phase 6.8.5: Targeted Financial Integrity & Distributed Fencing Remediation', () => {
  const origEnv = process.env;
  const mockRequestId = 'req-phase685-ledger-01';
  const mockPaymentId = 'pay_phase685_999';
  const webhookSecret = 'proventa_test_webhook_secret_685';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...origEnv };
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;
    (process.env as any).NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env = origEnv;
    vi.restoreAllMocks();
  });

  describe('Critical Defect A: Serialized Refund Processing with PostgreSQL Row Locking', () => {
    function createWebhookRequest(payload: any) {
      const rawBody = JSON.stringify(payload);
      const signature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      return new NextRequest('https://proventa.in/api/webhooks/razorpay', {
        method: 'POST',
        headers: { 'x-razorpay-signature': signature },
        body: rawBody,
      });
    }

    it('1. Acquires exclusive row lock on ValuationPayment using SELECT ... FOR UPDATE', async () => {
      vi.spyOn(db.valuationPayment, 'findFirst').mockResolvedValue({
        id: 'valpay-685',
        requestId: mockRequestId,
        status: 'CAPTURED',
        amountPaise: 99900,
        currency: 'INR',
      } as any);

      vi.spyOn(db.valuationRefund, 'findFirst').mockResolvedValue(null);

      const queryRawSpy = vi.fn().mockResolvedValue([
        {
          id: 'valpay-685',
          requestId: mockRequestId,
          status: 'CAPTURED',
          amountPaise: 99900,
          currency: 'INR',
        },
      ]);

      const mockTx = {
        $queryRaw: queryRawSpy,
        valuationRefund: {
          findFirst: vi.fn().mockResolvedValue(null),
          aggregate: vi.fn().mockResolvedValue({ _sum: { amountPaise: 0 } }),
          create: vi.fn().mockResolvedValue({ id: 'ref-1', amountPaise: 50000 }),
        },
        valuationPayment: { update: vi.fn() },
        valuationReport: { updateMany: vi.fn() },
      };

      vi.spyOn(db, '$transaction').mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      const req = createWebhookRequest({
        event: 'refund.processed',
        payload: {
          refund: {
            entity: {
              id: 'rfnd_lock_01',
              payment_id: mockPaymentId,
              amount: 50000,
              currency: 'INR',
              notes: { requestId: mockRequestId },
            },
          },
        },
      });

      const res = await webhookHandler(req);
      expect(res.status).toBe(200);
      expect(queryRawSpy).toHaveBeenCalled();
    });

    it('2. Serializes concurrent partial refunds (50,000 + 49,900 = 99,900) to 100% full refund', async () => {
      vi.spyOn(db.valuationPayment, 'findFirst').mockResolvedValue({
        id: 'valpay-685',
        requestId: mockRequestId,
        status: 'CAPTURED',
        amountPaise: 99900,
        currency: 'INR',
      } as any);

      vi.spyOn(db.valuationRefund, 'findFirst').mockResolvedValue(null);

      // Simulating second transaction executing under lock where first refund (50000) is already committed
      const updatePaymentSpy = vi.fn().mockResolvedValue({ id: 'valpay-685', status: 'REFUNDED' });
      const archiveReportSpy = vi.fn().mockResolvedValue({ count: 1 });

      const mockTx = {
        $queryRaw: vi.fn().mockResolvedValue([
          {
            id: 'valpay-685',
            requestId: mockRequestId,
            status: 'CAPTURED',
            amountPaise: 99900,
            currency: 'INR',
          },
        ]),
        valuationRefund: {
          findFirst: vi.fn().mockResolvedValue(null),
          aggregate: vi.fn().mockResolvedValue({ _sum: { amountPaise: 99900 } }), // Cumulative sum after inserting second partial refund (50k + 49.9k)
          create: vi.fn().mockResolvedValue({ id: 'ref-2', amountPaise: 49900 }),
        },
        valuationPayment: { update: updatePaymentSpy },
        valuationReport: { updateMany: archiveReportSpy },
      };

      vi.spyOn(db, '$transaction').mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      const req = createWebhookRequest({
        event: 'refund.processed',
        payload: {
          refund: {
            entity: {
              id: 'rfnd_part_b',
              payment_id: mockPaymentId,
              amount: 49900,
              currency: 'INR',
              notes: { requestId: mockRequestId },
            },
          },
        },
      });

      const res = await webhookHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.fullRefund).toBe(true);
      expect(json.cumulativeRefundedPaise).toBe(99900);
      expect(updatePaymentSpy).toHaveBeenCalledWith({
        where: { id: 'valpay-685' },
        data: { status: 'REFUNDED' },
      });
      expect(archiveReportSpy).toHaveBeenCalledWith({
        where: { requestId: mockRequestId },
        data: { status: 'ARCHIVED' },
      });
    });

    it('3. Rejects refund attempted against non-captured payment (FAILED or PENDING)', async () => {
      vi.spyOn(db.valuationPayment, 'findFirst').mockResolvedValue({
        id: 'valpay-685',
        requestId: mockRequestId,
        status: 'FAILED',
        amountPaise: 99900,
        currency: 'INR',
      } as any);

      vi.spyOn(db.valuationRefund, 'findFirst').mockResolvedValue(null);

      const mockTx = {
        $queryRaw: vi.fn().mockResolvedValue([
          {
            id: 'valpay-685',
            requestId: mockRequestId,
            status: 'FAILED',
            amountPaise: 99900,
            currency: 'INR',
          },
        ]),
      };

      vi.spyOn(db, '$transaction').mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      const req = createWebhookRequest({
        event: 'refund.processed',
        payload: {
          refund: {
            entity: {
              id: 'rfnd_fail_test',
              payment_id: mockPaymentId,
              amount: 99900,
              currency: 'INR',
              notes: { requestId: mockRequestId },
            },
          },
        },
      });

      const res = await webhookHandler(req);
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.error).toContain('INVALID_PAYMENT_STATE');
    });

    it('4. Rejects invalid non-positive or non-integer refund amounts with HTTP 400', async () => {
      const reqZero = createWebhookRequest({
        event: 'refund.processed',
        payload: {
          refund: {
            entity: {
              id: 'rfnd_zero',
              payment_id: mockPaymentId,
              amount: 0,
              currency: 'INR',
            },
          },
        },
      });
      const resZero = await webhookHandler(reqZero);
      expect(resZero.status).toBe(400);

      const reqNeg = createWebhookRequest({
        event: 'refund.processed',
        payload: {
          refund: {
            entity: {
              id: 'rfnd_neg',
              payment_id: mockPaymentId,
              amount: -500,
              currency: 'INR',
            },
          },
        },
      });
      const resNeg = await webhookHandler(reqNeg);
      expect(resNeg.status).toBe(400);

      const reqFloat = createWebhookRequest({
        event: 'refund.processed',
        payload: {
          refund: {
            entity: {
              id: 'rfnd_float',
              payment_id: mockPaymentId,
              amount: 499.5,
              currency: 'INR',
            },
          },
        },
      });
      const resFloat = await webhookHandler(reqFloat);
      expect(resFloat.status).toBe(400);
    });

    it('5. Rejects currency mismatch with HTTP 400', async () => {
      const reqUsd = createWebhookRequest({
        event: 'refund.processed',
        payload: {
          refund: {
            entity: {
              id: 'rfnd_usd',
              payment_id: mockPaymentId,
              amount: 50000,
              currency: 'USD',
            },
          },
        },
      });
      const resUsd = await webhookHandler(reqUsd);
      expect(resUsd.status).toBe(400);
      const json = await resUsd.json();
      expect(json.error).toContain('Invalid refund currency');
    });

    it('6. Rejects and quarantines refund that would exceed original captured amount with HTTP 422', async () => {
      vi.spyOn(db.valuationPayment, 'findFirst').mockResolvedValue({
        id: 'valpay-685',
        requestId: mockRequestId,
        status: 'CAPTURED',
        amountPaise: 99900,
        currency: 'INR',
      } as any);

      vi.spyOn(db.valuationRefund, 'findFirst').mockResolvedValue(null);

      const mockTx = {
        $queryRaw: vi.fn().mockResolvedValue([
          {
            id: 'valpay-685',
            requestId: mockRequestId,
            status: 'CAPTURED',
            amountPaise: 99900,
            currency: 'INR',
          },
        ]),
        valuationRefund: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: 'ref-over', amountPaise: 30000 }),
          aggregate: vi.fn().mockResolvedValue({ _sum: { amountPaise: 110000 } }), // 80k existing + 30k = 110k > 99.9k
        },
      };

      vi.spyOn(db, '$transaction').mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Existing 80000 + 30000 = 110000 > 99900
      const req = createWebhookRequest({
        event: 'refund.processed',
        payload: {
          refund: {
            entity: {
              id: 'rfnd_over_alloc',
              payment_id: mockPaymentId,
              amount: 30000,
              currency: 'INR',
              notes: { requestId: mockRequestId },
            },
          },
        },
      });

      const res = await webhookHandler(req);
      expect(res.status).toBe(422);
      const json = await res.json();
      expect(json.quarantined).toBe(true);
      expect(json.error).toContain('EXCESSIVE_REFUND_AMOUNT');
    });

    it('7. Handles unique constraint conflict (P2002) gracefully without throwing HTTP 500', async () => {
      vi.spyOn(db.valuationPayment, 'findFirst').mockResolvedValue({
        id: 'valpay-685',
        requestId: mockRequestId,
        status: 'CAPTURED',
        amountPaise: 99900,
        currency: 'INR',
      } as any);

      vi.spyOn(db.valuationRefund, 'findFirst').mockResolvedValue(null);

      const p2002Error: any = new Error('Unique constraint failed on the fields: (refundReference)');
      p2002Error.code = 'P2002';

      const mockTx = {
        $queryRaw: vi.fn().mockResolvedValue([
          {
            id: 'valpay-685',
            requestId: mockRequestId,
            status: 'CAPTURED',
            amountPaise: 99900,
            currency: 'INR',
          },
        ]),
        valuationRefund: {
          findFirst: vi.fn().mockResolvedValue(null),
          aggregate: vi.fn().mockResolvedValue({ _sum: { amountPaise: 50000 } }),
          create: vi.fn().mockRejectedValue(p2002Error),
        },
      };

      vi.spyOn(db, '$transaction').mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      const req = createWebhookRequest({
        event: 'refund.processed',
        payload: {
          refund: {
            entity: {
              id: 'rfnd_dup_race',
              payment_id: mockPaymentId,
              amount: 50000,
              currency: 'INR',
              notes: { requestId: mockRequestId },
            },
          },
        },
      });

      const res = await webhookHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.alreadyProcessed).toBe(true);
    });
  });

  describe('Critical Defect B: Fully Fenced Valuation Persistence Boundary', () => {
    it('1. Rejects stale worker with STALE_PROCESSING_LEASE before modifying Valuation, Evidence, or Comps', async () => {
      // Mock request and active methodology
      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValue({
        id: 'req-fencing-test',
        carpetAreaSqFt: 1200,
        propertyType: 'APARTMENT',
        bhk: 3,
        parkingSpaces: 1,
        address: 'Sindhu Bhavan Road',
        localityId: 'loc-sg-highway',
        locality: { name: 'S.G. Highway', city: 'Ahmedabad', slug: 'sg-highway' },
        payment: { status: 'CAPTURED' },
      } as any);

      vi.spyOn(db.valuationMethodologyVersion, 'findFirst').mockResolvedValue({
        id: 'meth-1',
        version: 'v2.1',
        parametersJson: {
          carpetAreaTolerancePercent: 15,
          minEligibleCompsForValuation: 3,
          askingPriceNegotiationDiscountPercent: 6.5,
        },
      } as any);

      vi.spyOn(db.propertyTransaction, 'findMany').mockResolvedValue([
        {
          id: 'tx-1',
          carpetAreaSqFt: 1200,
          transactedPriceLakhs: 120,
          pricePerSqFtCarpet: 10000,
          registrationDate: new Date(),
          source: { name: 'Sub-Registrar' },
          locality: { name: 'S.G. Highway' },
          adjustments: {},
        },
        {
          id: 'tx-2',
          carpetAreaSqFt: 1220,
          transactedPriceLakhs: 122,
          pricePerSqFtCarpet: 10000,
          registrationDate: new Date(),
          source: { name: 'Sub-Registrar' },
          locality: { name: 'S.G. Highway' },
          adjustments: {},
        },
        {
          id: 'tx-3',
          carpetAreaSqFt: 1180,
          transactedPriceLakhs: 118,
          pricePerSqFtCarpet: 10000,
          registrationDate: new Date(),
          source: { name: 'Sub-Registrar' },
          locality: { name: 'S.G. Highway' },
          adjustments: {},
        },
      ] as any);

      vi.spyOn(db.propertyListing, 'findMany').mockResolvedValue([]);

      const mockTx = {
        $queryRaw: vi.fn().mockResolvedValue([
          {
            id: 'req-fencing-test',
            status: 'COMPLETED',
            processingLockToken: 'token_worker_B', // Stolen/taken over by Worker B
          },
        ]),
        valuationRequest: {
          updateMany: vi.fn().mockResolvedValue({ count: 0 }), // 0 rows updated because token doesn't match
        },
        valuation: { upsert: vi.fn() },
        valuationEvidence: { deleteMany: vi.fn(), create: vi.fn() },
        comparableMatch: { deleteMany: vi.fn(), create: vi.fn() },
        valuationReport: { upsert: vi.fn() },
      };

      vi.spyOn(db, '$transaction').mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Worker A attempts to commit with stale 'token_worker_A'
      await expect(
        calculateValuationForRequest('req-fencing-test', { lockToken: 'token_worker_A' })
      ).rejects.toThrow('STALE_PROCESSING_LEASE');

      // Verify ZERO database persistence occurred
      expect(mockTx.valuation.upsert).not.toHaveBeenCalled();
      expect(mockTx.valuationEvidence.deleteMany).not.toHaveBeenCalled();
      expect(mockTx.valuationEvidence.create).not.toHaveBeenCalled();
      expect(mockTx.comparableMatch.deleteMany).not.toHaveBeenCalled();
      expect(mockTx.comparableMatch.create).not.toHaveBeenCalled();
      expect(mockTx.valuationReport.upsert).not.toHaveBeenCalled();
    });

    it('2. Atomically commits valuation, evidence, comps and report when lockToken matches', async () => {
      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValue({
        id: 'req-fencing-success',
        carpetAreaSqFt: 1200,
        propertyType: 'APARTMENT',
        bhk: 3,
        parkingSpaces: 1,
        address: 'Bopal Cross',
        localityId: 'loc-bopal',
        locality: { name: 'South Bopal', city: 'Ahmedabad', slug: 'south-bopal' },
        payment: { status: 'CAPTURED' },
      } as any);

      vi.spyOn(db.valuationMethodologyVersion, 'findFirst').mockResolvedValue({
        id: 'meth-1',
        version: 'v2.1',
        parametersJson: {
          carpetAreaTolerancePercent: 15,
          minEligibleCompsForValuation: 3,
          askingPriceNegotiationDiscountPercent: 6.5,
        },
      } as any);

      vi.spyOn(db.propertyTransaction, 'findMany').mockResolvedValue([
        {
          id: 'tx-2a',
          carpetAreaSqFt: 1200,
          transactedPriceLakhs: 90,
          pricePerSqFtCarpet: 7500,
          registrationDate: new Date(),
          source: { name: 'Sub-Registrar' },
          locality: { name: 'South Bopal' },
        },
        {
          id: 'tx-2b',
          carpetAreaSqFt: 1210,
          transactedPriceLakhs: 91,
          pricePerSqFtCarpet: 7520,
          registrationDate: new Date(),
          source: { name: 'Sub-Registrar' },
          locality: { name: 'South Bopal' },
        },
        {
          id: 'tx-2c',
          carpetAreaSqFt: 1190,
          transactedPriceLakhs: 89,
          pricePerSqFtCarpet: 7480,
          registrationDate: new Date(),
          source: { name: 'Sub-Registrar' },
          locality: { name: 'South Bopal' },
        },
      ] as any);

      vi.spyOn(db.propertyListing, 'findMany').mockResolvedValue([]);

      const mockTx = {
        $queryRaw: vi.fn().mockResolvedValue([
          {
            id: 'req-fencing-success',
            status: 'PROCESSING',
            processingLockToken: 'valid_token_123',
          },
        ]),
        valuationRequest: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        valuation: {
          upsert: vi.fn().mockResolvedValue({
            id: 'val-success-01',
            calculatedAt: new Date(),
          }),
        },
        valuationEvidence: {
          deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
          create: vi.fn().mockResolvedValue({ id: 'ev-1' }),
        },
        comparableMatch: {
          deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
          create: vi.fn().mockResolvedValue({ id: 'comp-1' }),
        },
        valuationReport: {
          upsert: vi.fn().mockResolvedValue({ id: 'rep-1', status: 'READY' }),
        },
      };

      vi.spyOn(db, '$transaction').mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      const res = await calculateValuationForRequest('req-fencing-success', {
        lockToken: 'valid_token_123',
      });

      expect(res).toBeDefined();
      expect(mockTx.valuation.upsert).toHaveBeenCalled();
      expect(mockTx.valuationEvidence.create).toHaveBeenCalled();
      expect(mockTx.comparableMatch.create).toHaveBeenCalled();
      expect(mockTx.valuationReport.upsert).toHaveBeenCalled();
    });
  });
});
