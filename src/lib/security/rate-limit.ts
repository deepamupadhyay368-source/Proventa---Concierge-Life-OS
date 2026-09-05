import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// In-memory rate limiter for development
// In production, use Redis-backed rate limiting
const requestCounts = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  windowMs?: number;
  max?: number;
  keyPrefix?: string;
}

export function getRateLimitKey(req: NextRequest, prefix = 'rl'): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `${prefix}:${ip}`;
}

export function checkRateLimit(
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
