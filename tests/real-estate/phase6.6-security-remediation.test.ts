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

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getSession } from '../../src/lib/auth/session';
import { POST as verifyPaymentHandler } from '../../src/app/api/price/pay/verify/route';
import { GET as getReportHandler } from '../../src/app/api/price/report/[id]/route';
import { POST as webhookHandler } from '../../src/app/api/webhooks/razorpay/route';
import {
  generateReportAccessToken,
  verifyReportAccessToken,
} from '../../src/lib/valuation/report-token';
import { db } from '../../src/lib/db';

describe('PROVENTA Phase 6.6: Targeted Security Remediation Suite', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('1. SEC-01: Payment Verification Security & Simulation Containment', () => {
    const mockRequestId = 'req-sec-test-01';
    const mockOrderId = 'order_sec_test_123';
    const testSecret = 'test_razorpay_secret_key_12345';

    it('categorically rejects isSimulation: true when NODE_ENV === "production" (HTTP 403)', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RAZORPAY_KEY_SECRET = testSecret;

      // Mock DB lookup
      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: 'usr-test-owner',
        status: 'PENDING_PAYMENT',
        payment: { id: 'pay-01', orderId: mockOrderId, status: 'PENDING' },
        report: null,
      } as any);

      const req = new NextRequest('https://proventa.in/api/price/pay/verify', {
        method: 'POST',
        body: JSON.stringify({
          requestId: mockRequestId,
          isSimulation: true,
          razorpay_order_id: mockOrderId,
        }),
      });

      const res = await verifyPaymentHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('Payment simulation is strictly prohibited in production');
    });

    it('rejects live payment verification when required parameters are missing in production (HTTP 400)', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RAZORPAY_KEY_SECRET = testSecret;

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: 'usr-test-owner',
        status: 'PENDING_PAYMENT',
        payment: { id: 'pay-01', orderId: mockOrderId, status: 'PENDING' },
        report: null,
      } as any);

      const req = new NextRequest('https://proventa.in/api/price/pay/verify', {
        method: 'POST',
        body: JSON.stringify({
          requestId: mockRequestId,
          // Missing razorpay_payment_id and razorpay_signature
          razorpay_order_id: mockOrderId,
        }),
      });

      const res = await verifyPaymentHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Missing required payment verification parameters');
    });

    it('rejects payment verification when submitted order ID does not match stored request order (HTTP 400)', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RAZORPAY_KEY_SECRET = testSecret;

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: 'usr-test-owner',
        status: 'PENDING_PAYMENT',
        payment: { id: 'pay-01', orderId: mockOrderId, status: 'PENDING' },
        report: null,
      } as any);

      const req = new NextRequest('https://proventa.in/api/price/pay/verify', {
        method: 'POST',
        body: JSON.stringify({
          requestId: mockRequestId,
          razorpay_order_id: 'order_DIFFERENT_id_456',
          razorpay_payment_id: 'pay_123',
          razorpay_signature: 'sig_123',
        }),
      });

      const res = await verifyPaymentHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Order ID mismatch');
    });

    it('rejects payment verification when cryptographic HMAC signature is invalid (HTTP 400)', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RAZORPAY_KEY_SECRET = testSecret;

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: 'usr-test-owner',
        status: 'PENDING_PAYMENT',
        payment: { id: 'pay-01', orderId: mockOrderId, status: 'PENDING' },
        report: null,
      } as any);

      const updatePaymentSpy = vi.spyOn(db.valuationPayment, 'update').mockResolvedValueOnce({} as any);

      const req = new NextRequest('https://proventa.in/api/price/pay/verify', {
        method: 'POST',
        body: JSON.stringify({
          requestId: mockRequestId,
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: 'pay_valid_payment_01',
          razorpay_signature: 'tampered_invalid_hex_signature_abcdef1234567890abcdef1234567890',
        }),
      });

      const res = await verifyPaymentHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Invalid payment signature');
      expect(updatePaymentSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'FAILED' },
        })
      );
    });

    it('accepts valid cryptographic HMAC signature, marks payment CAPTURED, and returns signed access token', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RAZORPAY_KEY_SECRET = testSecret;
      process.env.AUTH_SECRET = 'proventa-test-auth-secret-32-chars-long!';

      const validPaymentId = 'pay_real_987654';
      const validSignature = crypto
        .createHmac('sha256', testSecret)
        .update(`${mockOrderId}|${validPaymentId}`)
        .digest('hex');

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: 'usr-test-owner',
        status: 'PENDING_PAYMENT',
        payment: { id: 'pay-01', orderId: mockOrderId, status: 'PENDING' },
        report: null,
      } as any);

      const paymentUpdateSpy = vi.spyOn(db.valuationPayment, 'update').mockResolvedValueOnce({} as any);
      const requestUpdateSpy = vi.spyOn(db.valuationRequest, 'update').mockResolvedValueOnce({} as any);

      // Mock calculation engine to prevent full DB compilation during unit test
      const engineModule = await import('../../src/lib/valuation/engine');
      vi.spyOn(engineModule, 'calculateValuationForRequest').mockResolvedValueOnce({
        requestId: mockRequestId,
        valuationId: 'val-01',
        reportReference: 'PVI-VAL-2026-TEST',
        valuation: { estimatedMidpointLakhs: 85.5, calculatedAt: new Date() },
      } as any);

      const req = new NextRequest('https://proventa.in/api/price/pay/verify', {
        method: 'POST',
        body: JSON.stringify({
          requestId: mockRequestId,
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: validPaymentId,
          razorpay_signature: validSignature,
        }),
      });

      const res = await verifyPaymentHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.accessToken).toBeDefined();
      expect(json.reportUrl).toContain(`?token=${json.accessToken}`);
      expect(paymentUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'CAPTURED', paymentId: validPaymentId }),
        })
      );
      expect(requestUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'PAID' },
        })
      );
    });

    it('rejects simulation in non-production when ALLOW_PAYMENT_SIMULATION is not explicitly enabled', async () => {
      process.env.NODE_ENV = 'development';
      process.env.RAZORPAY_KEY_SECRET = testSecret; // Live keys simulated in dev
      delete process.env.ALLOW_PAYMENT_SIMULATION;

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: mockRequestId,
        userId: 'usr-test-owner',
        status: 'PENDING_PAYMENT',
        payment: { id: 'pay-01', orderId: mockOrderId, status: 'PENDING' },
        report: null,
      } as any);

      const req = new NextRequest('https://proventa.in/api/price/pay/verify', {
        method: 'POST',
        body: JSON.stringify({
          requestId: mockRequestId,
          isSimulation: true,
          razorpay_order_id: mockOrderId,
        }),
      });

      const res = await verifyPaymentHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toContain('Payment simulation is not permitted on this environment');
    });

    it('verifies webhook HMAC-SHA256 signature verification rejects invalid signatures', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RAZORPAY_WEBHOOK_SECRET = 'webhook_secret_prod_12345';

      const webhookBody = JSON.stringify({ event: 'payment.captured', payload: {} });

      const req = new NextRequest('https://proventa.in/api/webhooks/razorpay', {
        method: 'POST',
        headers: {
          'x-razorpay-signature': 'invalid_tampered_signature_hex_1234567890abcdef',
        },
        body: webhookBody,
      });

      const res = await webhookHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Invalid webhook signature');
    });
  });

  describe('2. SEC-02: Cryptographic Report Access Authorization & IDOR Containment', () => {
    const reportRequestId = 'req-report-idor-01';
    const ownerUserId = 'usr-owner-123';
    const otherUserId = 'usr-attacker-456';
    const testSecret = 'proventa-test-auth-secret-32-chars-long!';

    beforeEach(() => {
      process.env.AUTH_SECRET = testSecret;
    });

    it('rejects anonymous access to paid report when no session and no token are provided (HTTP 401)', async () => {
      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: reportRequestId,
        userId: ownerUserId,
        status: 'COMPLETED',
        payment: { status: 'CAPTURED' },
        report: { status: 'READY', reportReference: 'PVI-VAL-2026-TEST', reportDataJson: {} },
      } as any);

      // No session
      vi.mocked(getSession).mockResolvedValueOnce(null as any);

      const req = new NextRequest(`https://proventa.in/api/price/report/${reportRequestId}`);
      const res = await getReportHandler(req, { params: Promise.resolve({ id: reportRequestId }) });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('AUTHENTICATION_REQUIRED');
    });

    it('rejects authenticated non-owner access to another customer report (HTTP 403 IDOR Protection)', async () => {
      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: reportRequestId,
        userId: ownerUserId, // Belongs to owner
        status: 'COMPLETED',
        payment: { status: 'CAPTURED' },
        report: { status: 'READY', reportReference: 'PVI-VAL-2026-TEST', reportDataJson: {} },
      } as any);

      // Authenticated as someone else
      vi.mocked(getSession).mockResolvedValueOnce({
        user: { id: otherUserId, email: 'attacker@evil.com', roles: ['CUSTOMER'] },
      } as any);

      const req = new NextRequest(`https://proventa.in/api/price/report/${reportRequestId}`);
      const res = await getReportHandler(req, { params: Promise.resolve({ id: reportRequestId }) });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('You do not have permission to view another customer’s private valuation report');
    });

    it('allows authenticated report owner to access their own report (HTTP 200)', async () => {
      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: reportRequestId,
        userId: ownerUserId,
        status: 'COMPLETED',
        payment: { status: 'CAPTURED' },
        report: { status: 'READY', reportReference: 'PVI-VAL-2026-TEST', reportDataJson: { test: true } },
      } as any);

      vi.spyOn(db.valuationReport, 'update').mockResolvedValueOnce({} as any);

      // Authenticated as owner
      vi.mocked(getSession).mockResolvedValueOnce({
        user: { id: ownerUserId, email: 'owner@proventa.in', roles: ['CUSTOMER'] },
      } as any);

      const req = new NextRequest(`https://proventa.in/api/price/report/${reportRequestId}`);
      const res = await getReportHandler(req, { params: Promise.resolve({ id: reportRequestId }) });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.authorizationType).toBe('SESSION');
      expect(json.reportReference).toBe('PVI-VAL-2026-TEST');
    });

    it('allows guest access when presented with a valid cryptographically signed email access token (HTTP 200)', async () => {
      const validToken = generateReportAccessToken(reportRequestId, ownerUserId, 3600);

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: reportRequestId,
        userId: ownerUserId,
        status: 'COMPLETED',
        payment: { status: 'CAPTURED' },
        report: { status: 'READY', reportReference: 'PVI-VAL-2026-TEST', reportDataJson: { guestAccess: true } },
      } as any);

      vi.spyOn(db.valuationReport, 'update').mockResolvedValueOnce({} as any);

      // No active session
      vi.mocked(getSession).mockResolvedValueOnce(null as any);

      const req = new NextRequest(
        `https://proventa.in/api/price/report/${reportRequestId}?token=${validToken}`
      );
      const res = await getReportHandler(req, { params: Promise.resolve({ id: reportRequestId }) });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.authorizationType).toBe('SIGNED_TOKEN');
      expect(json.reportData.guestAccess).toBe(true);
    });

    it('rejects access when token is expired (HTTP 401 EXPIRED_TOKEN)', async () => {
      // Generate token that expired 10 seconds ago
      const expiredToken = generateReportAccessToken(reportRequestId, ownerUserId, -10);

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: reportRequestId,
        userId: ownerUserId,
        status: 'COMPLETED',
        payment: { status: 'CAPTURED' },
        report: { status: 'READY' },
      } as any);

      vi.mocked(getSession).mockResolvedValueOnce(null as any);

      const req = new NextRequest(
        `https://proventa.in/api/price/report/${reportRequestId}?token=${expiredToken}`
      );
      const res = await getReportHandler(req, { params: Promise.resolve({ id: reportRequestId }) });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain('EXPIRED_TOKEN');
    });

    it('rejects access when token signature is tampered or invalid (HTTP 401 INVALID_TOKEN)', async () => {
      const validToken = generateReportAccessToken(reportRequestId, ownerUserId, 3600);
      const tamperedToken = `${validToken.split('.')[0]}.tampered_signature_payload_12345`;

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: reportRequestId,
        userId: ownerUserId,
        status: 'COMPLETED',
        payment: { status: 'CAPTURED' },
        report: { status: 'READY' },
      } as any);

      vi.mocked(getSession).mockResolvedValueOnce(null as any);

      const req = new NextRequest(
        `https://proventa.in/api/price/report/${reportRequestId}?token=${tamperedToken}`
      );
      const res = await getReportHandler(req, { params: Promise.resolve({ id: reportRequestId }) });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain('INVALID_TOKEN');
    });

    it('rejects access when valid token is bound to a DIFFERENT report ID (HTTP 401 TOKEN_REQUEST_MISMATCH)', async () => {
      // Token generated for report A
      const tokenForDifferentReport = generateReportAccessToken('req-DIFFERENT-999', ownerUserId, 3600);

      vi.spyOn(db.valuationRequest, 'findUnique').mockResolvedValueOnce({
        id: reportRequestId, // Attempting to access report B
        userId: ownerUserId,
        status: 'COMPLETED',
        payment: { status: 'CAPTURED' },
        report: { status: 'READY' },
      } as any);

      vi.mocked(getSession).mockResolvedValueOnce(null as any);

      const req = new NextRequest(
        `https://proventa.in/api/price/report/${reportRequestId}?token=${tokenForDifferentReport}`
      );
      const res = await getReportHandler(req, { params: Promise.resolve({ id: reportRequestId }) });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain('not authorized for this specific valuation dossier');
    });
  });

  describe('3. Token Utility Independent Unit Tests', () => {
    it('verifies report access token cryptographic roundtrip and expiration mechanics', () => {
      process.env.AUTH_SECRET = 'proventa-test-auth-secret-32-chars-long!';

      const token = generateReportAccessToken('req-test-101', 'usr-test-202', 60);
      expect(typeof token).toBe('string');
      expect(token.includes('.')).toBe(true);

      const validResult = verifyReportAccessToken(token, 'req-test-101');
      expect(validResult.valid).toBe(true);
      expect(validResult.payload?.requestId).toBe('req-test-101');
      expect(validResult.payload?.userId).toBe('usr-test-202');

      const mismatchedResult = verifyReportAccessToken(token, 'req-OTHER-999');
      expect(mismatchedResult.valid).toBe(false);
      expect(mismatchedResult.error).toBe('TOKEN_REQUEST_MISMATCH');
    });
  });
});
