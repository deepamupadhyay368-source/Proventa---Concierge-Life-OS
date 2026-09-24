import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { AuthenticationError, AuthorizationError } from '@/lib/errors';
import { UserRole } from '@prisma/client';

export const CONCIERGE_COOKIE_NAME = 'proventa_concierge_session';
export const CONCIERGE_SESSION_DURATION = 8 * 60 * 60; // 8 hours in seconds

export interface ConciergeSessionPayload {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  primaryRole: string;
  issuedAt: number;
  expiresAt: number;
}

function getSecret(): string {
  return process.env.AUTH_SECRET || process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'proventa-concierge-secure-secret-key-2026';
}

/**
 * Creates a cryptographically signed HMAC token for the employee Concierge session.
 */
export function createConciergeToken(user: {
  id: string;
  email: string;
  name?: string | null;
  roles: UserRole[];
}): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + CONCIERGE_SESSION_DURATION;
  const primaryRole = user.roles[0] || 'CONCIERGE';

  const payload: ConciergeSessionPayload = {
    id: user.id,
    email: user.email.toLowerCase(),
    name: user.name || user.email.split('@')[0],
    roles: user.roles,
    primaryRole,
    issuedAt,
    expiresAt,
  };

  const serialized = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', getSecret()).update(serialized).digest('base64url');

  return `${serialized}.${signature}`;
}

/**
 * Verifies a signed Concierge session token and returns the payload if valid and non-expired.
 */
export function verifyConciergeToken(token: string): ConciergeSessionPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [serialized, signature] = parts;
    const expectedSig = createHmac('sha256', getSecret()).update(serialized).digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const payload: ConciergeSessionPayload = JSON.parse(Buffer.from(serialized, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);

    if (payload.expiresAt && payload.expiresAt < now) {
      return null; // Expired session
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Retrieves the active Concierge session from cookies or request.
 */
export async function getConciergeSession(req?: NextRequest): Promise<ConciergeSessionPayload | null> {
  try {
    if (req) {
      const token = req.cookies.get(CONCIERGE_COOKIE_NAME)?.value;
      if (token) {
        const verified = verifyConciergeToken(token);
        if (verified) return verified;
      }
    }
    const cookieStore = await cookies();
    const token = cookieStore.get(CONCIERGE_COOKIE_NAME)?.value;
    if (token) {
      const verified = verifyConciergeToken(token);
      if (verified) return verified;
    }
  } catch {}

  return null;
}

/**
 * Guard that enforces an active Concierge employee session.
 */
export async function requireConciergeSession(): Promise<ConciergeSessionPayload> {
  const session = await getConciergeSession();
  if (!session) {
    throw new AuthorizationError('Concierge access denied. Active employee login required.');
  }
  const isAuthorized = session.roles.some((r) =>
    ['CONCIERGE', 'SENIOR_CONCIERGE', 'CONCIERGE_MANAGER', 'ADMIN', 'FOUNDER', 'SUPER_ADMIN'].includes(r)
  );
  if (!isAuthorized) {
    throw new AuthorizationError('Access denied. Concierge permissions required.');
  }
  return session;
}

/**
 * Guard that enforces Senior Concierge or Manager privilege.
 */
export async function requireSeniorConciergeSession(): Promise<ConciergeSessionPayload> {
  const session = await requireConciergeSession();
  const isSenior = session.roles.some((r) =>
    ['SENIOR_CONCIERGE', 'CONCIERGE_MANAGER', 'ADMIN', 'FOUNDER', 'SUPER_ADMIN'].includes(r)
  );
  if (!isSenior) {
    throw new AuthorizationError('Access denied. Senior Concierge or Manager role required.');
  }
  return session;
}

/**
 * Guard that enforces Concierge Manager privilege.
 */
export async function requireConciergeManagerSession(): Promise<ConciergeSessionPayload> {
  const session = await requireConciergeSession();
  const isManager = session.roles.some((r) =>
    ['CONCIERGE_MANAGER', 'ADMIN', 'FOUNDER', 'SUPER_ADMIN'].includes(r)
  );
  if (!isManager) {
    throw new AuthorizationError('Access denied. Concierge Manager role required.');
  }
  return session;
}
