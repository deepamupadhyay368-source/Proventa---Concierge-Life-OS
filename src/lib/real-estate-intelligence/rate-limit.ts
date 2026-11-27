/**
 * PROVENTA — Lightweight Sliding-Window Rate Limiter
 * Protects public Real Estate Intelligence compute and search APIs
 * from abusive burst traffic without external runtime dependencies.
 */

interface BucketEntry {
  timestamps: number[];
}

const buckets = new Map<string, BucketEntry>();

export function checkRateLimit(
  key: string,
  limit = 60,
  windowMs = 60_000,
  now = Date.now()
): { allowed: boolean; remaining: number; resetInMs: number } {
  const cutoff = now - windowMs;
  const entry = buckets.get(key) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0] ?? now;
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(1000, oldest + windowMs - now),
    };
  }

  entry.timestamps.push(now);
  buckets.set(key, entry);

  // Prevent unbounded memory growth
  if (buckets.size > 5000) {
    const firstKey = buckets.keys().next().value;
    if (firstKey) buckets.delete(firstKey);
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - entry.timestamps.length),
    resetInMs: windowMs,
  };
}

export function getClientIpFromHeaders(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return headers.get('x-real-ip')?.trim() || 'unknown';
}
