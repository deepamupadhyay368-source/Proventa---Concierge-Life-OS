import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit, checkRateLimitAsync, getRateLimitKey } from '@/lib/security/rate-limit';
import { pingRedis, getRedisClient } from '@/lib/redis';
import { GET as healthHandler } from '@/app/api/health/route';
import { POST as razorpayWebhookHandler } from '@/app/api/webhooks/razorpay/route';
import { db } from '@/lib/db';
import crypto from 'crypto';

describe('Phase 3.1: Production Infrastructure Hardening Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Distributed Rate Limiting & Graceful Fallback', () => {
    it('provides synchronous in-memory rate limiting when Redis is not active', () => {
      const key = `test-sync-${Date.now()}`;
      const r1 = checkRateLimit(key, { max: 2, windowMs: 1000 });
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(1);

      const r2 = checkRateLimit(key, { max: 2, windowMs: 1000 });
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(0);

      const r3 = checkRateLimit(key, { max: 2, windowMs: 1000 });
      expect(r3.allowed).toBe(false);
      expect(r3.remaining).toBe(0);
    });

    it('falls back safely to in-memory mode in checkRateLimitAsync when REDIS_URL is unset', async () => {
      const key = `test-async-fallback-${Date.now()}`;
      const res = await checkRateLimitAsync(key, { max: 3, windowMs: 1000 });
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(2);
      expect(res.isDistributed).toBe(false);
    });

    it('reports healthy: false gracefully without throwing when REDIS_URL is not set', async () => {
      const originalRedisUrl = process.env.REDIS_URL;
      delete process.env.REDIS_URL;

      const health = await pingRedis();
      expect(health.healthy).toBe(false);
      expect(health.error).toBe('REDIS_URL not configured');

      if (originalRedisUrl) process.env.REDIS_URL = originalRedisUrl;
    });
  });

  describe('2. Health Check Probe Security & Observability', () => {
    it('returns system health without exposing connection strings, passwords, or customer data', async () => {
      vi.spyOn(db, '$queryRaw').mockResolvedValue([{ '1': 1 }] as any);

      const res = await healthHandler();
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.status).toBe('HEALTHY');
      expect(body.checks.database.status).toBe('CONNECTED');
      expect(body.checks.redis).toBeDefined();

      // Strict security checks: ensure no secrets or sensitive data leaked
      const stringified = JSON.stringify(body);
      expect(stringified).not.toContain('password');
      expect(stringified).not.toContain('secret');
      expect(stringified).not.toContain('postgresql://');
      expect(stringified).not.toContain('redis://');
      expect(stringified).not.toContain('Bearer');
    });

    it('returns 503 DEGRADED status when database query fails', async () => {
      vi.spyOn(db, '$queryRaw').mockRejectedValue(new Error('Connection terminated'));

      const res = await healthHandler();
      expect(res.status).toBe(503);

      const body = await res.json();
      expect(body.status).toBe('DEGRADED');
      expect(body.checks.database.status).toBe('UNREACHABLE');
      expect(body.checks.database.error).toBe('DATABASE_CONNECTION_ERROR');
      expect(JSON.stringify(body)).not.toContain('Connection terminated'); // Internal message obscured
    });
  });

  describe('3. Payment Webhook Idempotency & Safety', () => {
    it('handles duplicate payment.captured webhooks idempotently without duplicate updates or events', async () => {
      const taskId = 'task-webhook-idemp-01';
      const paymentId = 'pay_123456789';

      const mockTask = {
        id: taskId,
        paymentStatus: 'CAPTURED', // Already captured!
        budgetAmount: 2500,
        events: [{ id: 'evt-existing', eventType: 'PAYMENT_CAPTURED' }],
      };

      vi.spyOn(db.task, 'findUnique').mockResolvedValue(mockTask as any);
      const updateSpy = vi.spyOn(db.task, 'update');
      const eventSpy = vi.spyOn(db.taskEvent, 'create');

      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: paymentId,
              amount: 250000,
              notes: { taskId },
            },
          },
        },
      };

      const req = new Request('http://localhost:3000/api/webhooks/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'mock-sig',
        },
        body: JSON.stringify(payload),
      });

      const res = await razorpayWebhookHandler(req as any);
      expect(res.status).toBe(200);

      // Task update and event creation should NOT be called again
      expect(updateSpy).not.toHaveBeenCalled();
      expect(eventSpy).not.toHaveBeenCalled();
    });

    it('rejects invalid webhook signatures in production mode', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      process.env.RAZORPAY_WEBHOOK_SECRET = 'secret_key_123';

      try {
        const payload = JSON.stringify({ event: 'payment.captured' });
        const req = new Request('http://localhost:3000/api/webhooks/razorpay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-razorpay-signature': 'invalid_signature_hex',
          },
          body: payload,
        });

        const res = await razorpayWebhookHandler(req as any);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe('Invalid webhook signature');
      } finally {
        vi.unstubAllEnvs();
      }
    });
  });

  describe('4. Architecture Integrity: No Arbitrary adapters[0] Fallback', () => {
    it('confirms getPrimaryAdapter does not arbitrarily execute index 0 without category matching', async () => {
      const { AdapterRegistry } = await import('@/lib/orchestration/adapters');
      const homeAdapter = AdapterRegistry.getPrimaryAdapter('home');
      expect(homeAdapter).toBeDefined();
      expect(homeAdapter.providerId).toBe('ahmedabad_verified');
    });
  });
});
