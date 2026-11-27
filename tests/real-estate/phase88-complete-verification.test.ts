import { describe, expect, it } from 'vitest';
import {
  buildRateLimitHeaders,
  checkRateLimitAsync,
  type RedisEvalLike,
} from '@/lib/real-estate-intelligence/rate-limit';

/**
 * Simulated shared Redis store verifying atomic multi-instance Lua sliding window
 * behavior across independent application instances sharing one Redis backend.
 */
function createSharedRedisSimulator(): RedisEvalLike {
  const zsets = new Map<string, Array<{ score: number; member: string }>>();
  return {
    async eval(_script, _numkeys, keyRaw, nowRaw, windowRaw, limitRaw, memberRaw) {
      const key = String(keyRaw);
      const now = Number(nowRaw);
      const windowMs = Number(windowRaw);
      const limit = Number(limitRaw);
      const member = String(memberRaw);

      const list = (zsets.get(key) ?? []).filter((e) => e.score > now - windowMs);
      if (list.length >= limit) {
        const oldest = list[0]?.score ?? now;
        const resetMs = Math.max(1000, oldest + windowMs - now);
        zsets.set(key, list);
        return [0, 0, resetMs];
      }
      list.push({ score: now, member });
      zsets.set(key, list);
      return [1, limit - list.length, windowMs];
    },
  };
}

describe('PROVENTA Phase 8.8 — Distributed Rate Limiting, Outage Fallback & Security Controls', () => {
  it('P87-MED-02: enforces atomic shared sliding window across multiple app instances using Redis', async () => {
    const sharedRedis = createSharedRedisSimulator();
    const key = `dist-user-${Date.now()}`;
    const t0 = 1_700_000_000_000;

    // Instance A consumes 2 requests, Instance B consumes 1 => 3/3 allowed
    const r1 = await checkRateLimitAsync(key, 3, 60_000, sharedRedis, t0);
    const r2 = await checkRateLimitAsync(key, 3, 60_000, sharedRedis, t0 + 100);
    const r3 = await checkRateLimitAsync(key, 3, 60_000, sharedRedis, t0 + 200);
    expect(r1.allowed && r2.allowed && r3.allowed).toBe(true);
    expect(r1.backend).toBe('redis');
    expect(r3.remaining).toBe(0);

    // Instance C hits 4th request within same window => BLOCKED with Retry-After
    const r4 = await checkRateLimitAsync(key, 3, 60_000, sharedRedis, t0 + 300);
    expect(r4.allowed).toBe(false);
    expect(r4.backend).toBe('redis');
    expect(r4.retryAfterSeconds).toBeGreaterThanOrEqual(59);
    const headers = buildRateLimitHeaders(r4);
    expect(headers['Retry-After']).toBe(String(r4.retryAfterSeconds));
    expect(headers['X-RateLimit-Backend']).toBe('redis');

    // Different key is completely isolated
    const otherUser = await checkRateLimitAsync(`other-${key}`, 3, 60_000, sharedRedis, t0 + 300);
    expect(otherUser.allowed).toBe(true);
    expect(otherUser.remaining).toBe(2);

    // After window expiration (t0 + 61s), requests are allowed again
    const afterWindow = await checkRateLimitAsync(key, 3, 60_000, sharedRedis, t0 + 61_000);
    expect(afterWindow.allowed).toBe(true);
    expect(afterWindow.remaining).toBe(2);
  });

  it('P87-MED-02: degrades safely to documented memory-fallback on Redis outage without crashing', async () => {
    const failingRedis: RedisEvalLike = {
      async eval() {
        throw new Error('ECONNREFUSED');
      },
    };
    const key = `outage-${Date.now()}`;
    const r1 = await checkRateLimitAsync(key, 2, 60_000, failingRedis);
    const r2 = await checkRateLimitAsync(key, 2, 60_000, failingRedis);
    const r3 = await checkRateLimitAsync(key, 2, 60_000, failingRedis);

    expect(r1.backend).toBe('memory-fallback');
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(false);
    expect(buildRateLimitHeaders(r3)['Retry-After']).toBeDefined();
    expect(buildRateLimitHeaders(r3)['X-RateLimit-Backend']).toBe('memory-fallback');
  });
});
