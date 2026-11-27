/**
 * PROVENTA — Atomic Distributed Sliding-Window Rate Limiter (Phase 8.8)
 * - Uses atomic Redis Lua script (`ZREMRANGEBYSCORE` + `ZCARD` + `ZADD` + `PEXPIRE`)
 *   when `REDIS_URL` is configured and reachable via `src/lib/redis.ts`.
 * - Explicitly falls back to process-local sliding window (`backend: 'memory-fallback'`)
 *   when Redis is unconfigured or degraded, without claiming distributed guarantees in fallback mode.
 */

import crypto from 'node:crypto';
import { getRedisClient } from '@/lib/redis';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
  retryAfterSeconds: number;
  backend: 'redis' | 'memory-fallback';
}

export interface RedisEvalLike {
  eval(script: string, numkeys: number, ...args: (string | number)[]): Promise<unknown>;
}

const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]

redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)
local count = redis.call('ZCARD', key)
if count >= limit then
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local resetMs = window
  if oldest and #oldest >= 2 then
    resetMs = math.max(1000, tonumber(oldest[2]) + window - now)
  end
  return {0, 0, resetMs}
end

redis.call('ZADD', key, now, member)
redis.call('PEXPIRE', key, window)
return {1, limit - count - 1, window}
`;

interface BucketEntry {
  timestamps: number[];
}
const memoryBuckets = new Map<string, BucketEntry>();

export function checkRateLimit(
  key: string,
  limit = 60,
  windowMs = 60_000,
  now = Date.now()
): RateLimitResult {
  const cutoff = now - windowMs;
  const entry = memoryBuckets.get(key) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0] ?? now;
    const resetInMs = Math.max(1000, oldest + windowMs - now);
    return {
      allowed: false,
      remaining: 0,
      resetInMs,
      retryAfterSeconds: Math.ceil(resetInMs / 1000),
      backend: 'memory-fallback',
    };
  }

  entry.timestamps.push(now);
  memoryBuckets.set(key, entry);

  if (memoryBuckets.size > 5000) {
    const firstKey = memoryBuckets.keys().next().value;
    if (firstKey) memoryBuckets.delete(firstKey);
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - entry.timestamps.length),
    resetInMs: windowMs,
    retryAfterSeconds: 0,
    backend: 'memory-fallback',
  };
}

/**
 * Atomic distributed sliding-window rate limiter.
 * Accepts optional `redisOverride` for deterministic multi-instance testing.
 */
export async function checkRateLimitAsync(
  key: string,
  limit = 60,
  windowMs = 60_000,
  redisOverride?: RedisEvalLike | null,
  now = Date.now()
): Promise<RateLimitResult> {
  const client = redisOverride !== undefined ? redisOverride : getRedisClient();

  if (client) {
    try {
      const member = `${now}-${crypto.randomBytes(4).toString('hex')}`;
      const res = (await client.eval(
        SLIDING_WINDOW_LUA,
        1,
        `proventa:rl:${key}`,
        now,
        windowMs,
        limit,
        member
      )) as [number, number, number];

      if (Array.isArray(res) && res.length === 3) {
        const allowed = Number(res[0]) === 1;
        const remaining = Math.max(0, Number(res[1]));
        const resetInMs = Math.max(1000, Number(res[2]));
        return {
          allowed,
          remaining,
          resetInMs,
          retryAfterSeconds: allowed ? 0 : Math.ceil(resetInMs / 1000),
          backend: 'redis',
        };
      }
    } catch {
      // Redis degraded or unavailable: fall back explicitly to process-local window
    }
  }

  return checkRateLimit(key, limit, windowMs, now);
}

export function getClientIpFromHeaders(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return headers.get('x-real-ip')?.trim() || 'unknown';
}

export function buildRateLimitHeaders(rl: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': String(rl.remaining),
    'X-RateLimit-Backend': rl.backend,
  };
  if (!rl.allowed) {
    headers['Retry-After'] = String(Math.max(1, rl.retryAfterSeconds));
  }
  return headers;
}
