import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  let finalUrl = url;
  if (!finalUrl.includes('connection_limit=')) {
    finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'connection_limit=25';
  }
  if (!finalUrl.includes('pool_timeout=')) {
    finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'pool_timeout=60';
  }
  return finalUrl;
}

const resolvedDbUrl = getDatabaseUrl();

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(resolvedDbUrl ? { datasourceUrl: resolvedDbUrl } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Cache on globalThis across all environments to prevent connection exhaustion in serverless/warm environments
globalForPrisma.prisma = db;

