import Redis from 'ioredis';
import { logger } from '@/lib/logger';

const globalForRedis = globalThis as unknown as {
  redisClient: Redis | undefined;
  isRedisAvailable?: boolean;
};

export function getRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  if (globalForRedis.redisClient) {
    return globalForRedis.redisClient;
  }

  try {
    const isTls = redisUrl.startsWith('rediss://');
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      enableOfflineQueue: false,
      lazyConnect: true,
      tls: isTls
        ? {
            rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false',
          }
        : undefined,
      retryStrategy: (times: number) => {
        if (times > 3) return null; // stop retrying after 3 attempts
        return Math.min(times * 200, 1000);
      },
    });

    client.on('connect', () => {
      globalForRedis.isRedisAvailable = true;
      logger.info('Connected to Redis server');
    });

    client.on('error', (err) => {
      globalForRedis.isRedisAvailable = false;
      logger.warn({ err: err.message }, '[Redis] Connection degraded, falling back gracefully');
    });

    client.on('close', () => {
      globalForRedis.isRedisAvailable = false;
    });

    // Attempt non-blocking connection
    client.connect().catch((err) => {
      logger.warn({ err: err.message }, '[Redis] Initial connection attempt failed');
    });

    globalForRedis.redisClient = client;
    return globalForRedis.redisClient;
  } catch (err: any) {
    logger.warn({ err: err.message }, '[Redis] Failed to initialize Redis client');
    return null;
  }
}

export function isRedisHealthy(): boolean {
  return globalForRedis.isRedisAvailable ?? false;
}

export async function pingRedis(): Promise<{ healthy: boolean; latencyMs?: number; error?: string }> {
  const client = getRedisClient();
  if (!client) {
    return { healthy: false, error: 'REDIS_URL not configured' };
  }

  const start = Date.now();
  try {
    const res = await client.ping();
    const latencyMs = Date.now() - start;
    return { healthy: res === 'PONG', latencyMs };
  } catch (err: any) {
    return { healthy: false, error: err.message || 'Redis ping failed' };
  }
}
