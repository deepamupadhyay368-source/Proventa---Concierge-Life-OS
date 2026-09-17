import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ALL_13_SPECIALISTS } from '@/lib/agents/specialists/all-specialists';
import { ModularToolRegistry } from '@/lib/agents/registry/real-tools';
import { pingRedis } from '@/lib/redis';

export async function GET() {
  const startTime = Date.now();

  // 1. Check PostgreSQL Database connection
  let dbHealthy = false;
  let dbLatencyMs = 0;
  let dbError: string | null = null;
  try {
    const dbStart = Date.now();
    await db.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbHealthy = true;
  } catch (e: any) {
    console.error('[Health Probe] DB Error:', e.message);
    dbError = 'DATABASE_CONNECTION_ERROR';
  }

  // 2. Check Redis connection where configured
  const redisResult = await pingRedis();
  const redisConfigured = Boolean(process.env.REDIS_URL);

  // 3. Check AI Agent Platform Registration
  ModularToolRegistry.init();
  const toolsCount = ModularToolRegistry.getAllTools().length;
  const agentsCount = Object.keys(ALL_13_SPECIALISTS).length;

  const isHealthy = dbHealthy && toolsCount >= 14 && agentsCount >= 13;

  return NextResponse.json(
    {
      status: isHealthy ? 'HEALTHY' : 'DEGRADED',
      environment: process.env.NODE_ENV || 'production',
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
      checks: {
        database: {
          status: dbHealthy ? 'CONNECTED' : 'UNREACHABLE',
          latencyMs: dbLatencyMs,
          error: dbError ? 'DATABASE_CONNECTION_ERROR' : null,
          configured: Boolean(process.env.DATABASE_URL),
        },
        redis: {
          status: !redisConfigured
            ? 'NOT_CONFIGURED'
            : redisResult.healthy
            ? 'CONNECTED'
            : 'UNREACHABLE',
          latencyMs: redisResult.latencyMs,
          error: redisResult.error ? 'REDIS_CONNECTION_ERROR' : null,
        },
        agentPlatform: {
          status: agentsCount >= 13 ? 'ACTIVE' : 'INCOMPLETE',
          registeredSpecialists: agentsCount,
          authoritativeTools: toolsCount,
        },
        cohort: {
          activeCity: 'Ahmedabad',
          cohortId: 'Cohort 1',
          zeroFabricationPolicy: 'STRICT_ENFORCED',
        },
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}

