import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getRedisClient } from '@/lib/redis';

// In-memory fallback map for development or when Redis is unreachable
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
  windowMs?: number;
  max?: number;
  keyPrefix?: string;
}

export function getRateLimitKey(req: NextRequest, prefix = 'rl'): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `${prefix}:${ip}`;
}

// In-memory rate limiter logic
function checkInMemoryRateLimit(
  key: string,
  config: RateLimitConfig = {},
): { allowed: boolean; remaining: number; resetAt: number } {
  const windowMs = config.windowMs ?? parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
  const max = config.max ?? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
  const now = Date.now();

  const existing = requestCounts.get(key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + windowMs;
    requestCounts.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: max - 1, resetAt };
  }

  if (existing.count >= max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count++;
  return { allowed: true, remaining: max - existing.count, resetAt: existing.resetAt };
}

/**
 * Synchronous rate limit check (preserves exact backward compatibility with synchronous callers)
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = {},
): { allowed: boolean; remaining: number; resetAt: number } {
  return checkInMemoryRateLimit(key, config);
}

/**
 * Distributed Redis rate limiter with atomic sliding window counter.
 * Falls back safely to in-memory check if Redis is unavailable or unconfigured.
 */
export async function checkRateLimitAsync(
  key: string,
  config: RateLimitConfig = {},
): Promise<{ allowed: boolean; remaining: number; resetAt: number; isDistributed: boolean }> {
  const windowMs = config.windowMs ?? parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
  const max = config.max ?? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
  const client = getRedisClient();

  if (!client) {
    return { ...checkInMemoryRateLimit(key, config), isDistributed: false };
  }

  const now = Date.now();
  const redisKey = `ratelimit:${key}`;

  // Atomic Redis pipeline: INCR and conditional PEXPIRE
  try {
    const multi = client.multi();
    multi.incr(redisKey);
    multi.pttl(redisKey);
    const results = await multi.exec();

    if (!results || results.length < 2) {
      return { ...checkInMemoryRateLimit(key, config), isDistributed: false };
    }

    const [errIncr, currentCount] = results[0] as [Error | null, number];
    const [errTtl, pttl] = results[1] as [Error | null, number];

    if (errIncr) {
      throw errIncr;
    }

    let resetAt = now + windowMs;
    if (pttl === -1 || pttl === -2) {
      // Key has no TTL or was just created, set expiration
      await client.pexpire(redisKey, windowMs).catch(() => {});
    } else if (pttl > 0) {
      resetAt = now + pttl;
    }

    const allowed = currentCount <= max;
    const remaining = Math.max(0, max - currentCount);

    return {
      allowed,
      remaining,
      resetAt,
      isDistributed: true,
    };
  } catch (err: any) {
    logger.warn({ err: err.message, key }, '[RateLimit] Redis check failed, falling back to in-memory');
    return { ...checkInMemoryRateLimit(key, config), isDistributed: false };
  }
}

export function rateLimitMiddleware(
  req: NextRequest,
  config?: RateLimitConfig,
): NextResponse | null {
  const key = getRateLimitKey(req, config?.keyPrefix);
  const { allowed, remaining, resetAt } = checkRateLimit(key, config);

  if (!allowed) {
    logger.warn({ key, path: req.nextUrl.pathname }, 'Rate limit exceeded');
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(config?.max ?? 100),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  return null;
}

export async function rateLimitMiddlewareAsync(
  req: NextRequest,
  config?: RateLimitConfig,
): Promise<NextResponse | null> {
  const key = getRateLimitKey(req, config?.keyPrefix);
  const { allowed, remaining, resetAt } = await checkRateLimitAsync(key, config);

  if (!allowed) {
    logger.warn({ key, path: req.nextUrl.pathname }, 'Rate limit exceeded');
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(config?.max ?? 100),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  return null;
}

