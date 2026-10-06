import { db } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';
import { AuthenticationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export const COMPLIMENTARY_REQUESTS_LIMIT = 3;

export type FreeRequestState = 'FREE_REQUEST_AVAILABLE' | 'FREE_REQUEST_USED' | 'ACTIVE_MEMBER';

export interface CustomerEntitlement {
  hasActiveMembership: boolean;
  membershipPlan: string | null;
  membershipStatus: string | null;
  complimentaryRequestsLimit: number;
  complimentaryRequestsUsed: number;
  complimentaryRequestsRemaining: number;
  freeRequestAvailable: boolean;
  freeRequestUsed: boolean;
  freeRequestsUsed: number;
  freeRequestUsedAt: Date | null;
  freeRequestTaskId: string | null;
  canCreateRequest: boolean;
  state: FreeRequestState;
}

/**
 * Pure evaluation of customer entitlement.
 * Computes exact remaining complimentary requests out of 3.
 */
export function evaluateCustomerEntitlement(profile: {
  membershipPlan?: string | null;
  membershipStatus?: string | null;
  freeRequestsUsed?: number | null;
  freeRequestUsed?: boolean | null;
  freeRequestUsedAt?: Date | null;
  freeRequestTaskId?: string | null;
  tasksCount?: number;
}): CustomerEntitlement {
  const hasActiveMembership = profile.membershipStatus === 'ACTIVE';

  // Determine actual used count from database fields or tasks count
  let usedCount = typeof profile.freeRequestsUsed === 'number' ? profile.freeRequestsUsed : 0;
  if (typeof profile.tasksCount === 'number' && profile.tasksCount > usedCount) {
    usedCount = profile.tasksCount;
  } else if (usedCount === 0 && profile.freeRequestUsed) {
    usedCount = 1;
  }

  const complimentaryRequestsLimit = COMPLIMENTARY_REQUESTS_LIMIT;
  const complimentaryRequestsUsed = Math.min(usedCount, complimentaryRequestsLimit);
  const complimentaryRequestsRemaining = hasActiveMembership
    ? complimentaryRequestsLimit
    : Math.max(0, complimentaryRequestsLimit - complimentaryRequestsUsed);

  const freeRequestAvailable = !hasActiveMembership && complimentaryRequestsRemaining > 0;
  const freeRequestUsed = !hasActiveMembership && complimentaryRequestsRemaining === 0;
  const canCreateRequest = hasActiveMembership || freeRequestAvailable;

  let state: FreeRequestState = 'FREE_REQUEST_AVAILABLE';
  if (hasActiveMembership) {
    state = 'ACTIVE_MEMBER';
  } else if (freeRequestUsed) {
    state = 'FREE_REQUEST_USED';
  }

  return {
    hasActiveMembership,
    membershipPlan: profile.membershipPlan || null,
    membershipStatus: profile.membershipStatus || null,
    complimentaryRequestsLimit,
    complimentaryRequestsUsed,
    complimentaryRequestsRemaining,
    freeRequestAvailable,
    freeRequestUsed,
    freeRequestsUsed: complimentaryRequestsUsed,
    freeRequestUsedAt: profile.freeRequestUsedAt || null,
    freeRequestTaskId: profile.freeRequestTaskId || null,
    canCreateRequest,
    state,
  };
}

/**
 * Atomically checks and consumes 1 complimentary request entitlement for a customer (up to 3 total).
 * Returns { allowed: true, isFreeRequest: boolean, requestsRemaining: number } or { allowed: false, reason: string }.
 *
 * Race-condition safe: Uses atomic SQL update so concurrent requests cannot exceed the 3 complimentary limit.
 */
export async function checkAndConsumeEntitlement(customerId: string): Promise<{
  allowed: boolean;
  isFreeRequest: boolean;
  isPaidMember: boolean;
  requestsRemaining?: number;
  requestsUsed?: number;
  error?: string;
  code?: string;
  reason?: string;
  availablePlans?: string[];
}> {
  const customerProfile = await db.customerProfile.findUnique({
    where: { id: customerId },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });

  if (!customerProfile) {
    return {
      allowed: false,
      isFreeRequest: false,
      isPaidMember: false,
      error: 'Customer profile not found',
      code: 'NOT_FOUND',
    };
  }

  // 1. Active paid member -> always permitted with unlimited requests
  if (customerProfile.membershipStatus === 'ACTIVE') {
    return {
      allowed: true,
      isFreeRequest: false,
      isPaidMember: true,
      requestsRemaining: COMPLIMENTARY_REQUESTS_LIMIT,
      requestsUsed: 0,
    };
  }

  // 2. Non-active member: verify current complimentary usage count
  const tasksCount = customerProfile._count?.tasks ?? 0;
  let currentUsed = (customerProfile as any).freeRequestsUsed ?? 0;
  if (tasksCount > currentUsed) {
    currentUsed = tasksCount;
  } else if (currentUsed === 0 && customerProfile.freeRequestUsed) {
    currentUsed = 1;
  }

  if (currentUsed >= COMPLIMENTARY_REQUESTS_LIMIT) {
    // Backfill state in DB if not already recorded
    if (!customerProfile.freeRequestUsed || (customerProfile as any).freeRequestsUsed < COMPLIMENTARY_REQUESTS_LIMIT) {
      await db.customerProfile.update({
        where: { id: customerId },
        data: {
          freeRequestsUsed: COMPLIMENTARY_REQUESTS_LIMIT,
          freeRequestUsed: true,
          freeRequestUsedAt: customerProfile.freeRequestUsedAt || new Date(),
        } as any,
      }).catch(() => {});
    }

    return {
      allowed: false,
      isFreeRequest: false,
      isPaidMember: false,
      requestsRemaining: 0,
      requestsUsed: COMPLIMENTARY_REQUESTS_LIMIT,
      error: 'Membership required to submit further requests. Your 3 complimentary requests have already been used.',
      code: 'MEMBERSHIP_REQUIRED',
      reason: 'COMPLIMENTARY_LIMIT_REACHED',
      availablePlans: ['select', 'private', 'reserve'],
    };
  }

  // 3. Atomically consume 1 complimentary request
  const now = new Date();
  const nextUsed = currentUsed + 1;
  const isNowExhausted = nextUsed >= COMPLIMENTARY_REQUESTS_LIMIT;

  const updateResult = await db.customerProfile.updateMany({
    where: {
      id: customerId,
      freeRequestsUsed: { lt: COMPLIMENTARY_REQUESTS_LIMIT },
      OR: [
        { membershipStatus: null },
        { membershipStatus: { not: 'ACTIVE' } },
      ],
    },
    data: {
      freeRequestsUsed: { increment: 1 },
      freeRequestUsed: isNowExhausted,
      freeRequestUsedAt: now,
    } as any,
  });

  if (updateResult.count === 0) {
    // Another concurrent request consumed the final complimentary allowance simultaneously
    return {
      allowed: false,
      isFreeRequest: false,
      isPaidMember: false,
      requestsRemaining: 0,
      requestsUsed: COMPLIMENTARY_REQUESTS_LIMIT,
      error: 'Membership required to submit further requests. Your 3 complimentary requests have already been used.',
      code: 'MEMBERSHIP_REQUIRED',
      reason: 'COMPLIMENTARY_LIMIT_REACHED',
      availablePlans: ['select', 'private', 'reserve'],
    };
  }

  const requestsRemaining = Math.max(0, COMPLIMENTARY_REQUESTS_LIMIT - nextUsed);

  // Sync exhausted boolean flag if limit reached
  const updatedProfile = await db.customerProfile.findUnique({
    where: { id: customerId },
    select: { freeRequestsUsed: true },
  });
  if ((updatedProfile?.freeRequestsUsed ?? nextUsed) >= COMPLIMENTARY_REQUESTS_LIMIT) {
    await db.customerProfile.updateMany({
      where: { id: customerId, freeRequestUsed: false },
      data: { freeRequestUsed: true },
    }).catch(() => {});
  }

  return {
    allowed: true,
    isFreeRequest: true,
    isPaidMember: false,
    requestsRemaining,
    requestsUsed: nextUsed,
  };
}

/**
 * Link task ID to the consumed free request record.
 */
export async function attachFreeRequestTaskId(customerId: string, taskId: string) {
  try {
    await db.customerProfile.update({
      where: { id: customerId },
      data: { freeRequestTaskId: taskId },
    });
  } catch (error) {
    console.warn('[attachFreeRequestTaskId] Non-blocking update error:', error);
  }
}

/**
 * Centralized, idempotent resolver that guarantees CustomerProfile exists
 * for a valid, active, canonical User in the database.
 * 
 * Invariants enforced:
 * 1. User MUST exist in the same database before CustomerProfile creation.
 * 2. If session contains a stale/deleted User ID, logs STALE_SESSION_DETECTED and throws controlled AuthenticationError (401).
 * 3. Never generates random/untrusted user IDs or fake users.
 * 4. Client cannot provide an arbitrary userId.
 * 5. Reuses existing CustomerProfile if present (idempotent).
 * 6. Thread-safe / race-condition safe via atomic upsert & fallback.
 */
export async function ensureCustomerProfileForAuthenticatedUser(sessionUser: {
  id: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  image?: string | null;
}): Promise<any> {
  if (!sessionUser || !sessionUser.id) {
    logger.warn({ event: 'STALE_SESSION_DETECTED' }, 'Session user missing or has no ID');
    throw new AuthenticationError('Authentication required. Please sign in.');
  }

  // 1. Resolve canonical User from database by sessionUser.id
  let canonicalUser = await db.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      userRoles: true,
      customerProfile: true,
    },
  });

  // 2. If not found by ID, attempt lookup by lowercase email (for cases where session ID desynced)
  if (!canonicalUser && sessionUser.email) {
    canonicalUser = await db.user.findUnique({
      where: { email: sessionUser.email.toLowerCase(), deletedAt: null },
      include: {
        userRoles: true,
        customerProfile: true,
      },
    });
  }

  // 3. HARD PRE-CREATE INVARIANT: Verify canonical user exists, is not deleted, and is not suspended
  if (!canonicalUser || canonicalUser.deletedAt !== null) {
    logger.warn(
      {
        sessionUserId: sessionUser.id,
        sessionEmail: sessionUser.email,
        event: 'STALE_SESSION_DETECTED',
      },
      'Stale or nonexistent authenticated session user detected. Rejecting profile creation.'
    );
    throw new AuthenticationError('Your session is invalid or has expired. Please sign in again.');
  }

  if (canonicalUser.status === 'SUSPENDED') {
    logger.warn(
      {
        userId: canonicalUser.id,
        event: 'AUTH_USER_BLOCKED',
      },
      'Suspended user attempted request. Rejecting.'
    );
    throw new AuthenticationError('Account is suspended. Please contact concierge support.');
  }

  logger.info(
    {
      userId: canonicalUser.id,
      email: canonicalUser.email,
      roles: canonicalUser.userRoles.map((r) => r.role),
      event: 'AUTH_IDENTITY_RESOLVED',
    },
    'Authenticated identity resolved to canonical database user'
  );

  // 4. If canonical user already has a CustomerProfile attached, reuse it
  if (canonicalUser.customerProfile) {
    logger.info(
      {
        userId: canonicalUser.id,
        profileId: canonicalUser.customerProfile.id,
        event: 'CUSTOMER_PROFILE_REUSED',
      },
      'Existing customer profile reused'
    );
    return canonicalUser.customerProfile;
  }

  // 5. Look up CustomerProfile directly by canonicalUser.id in case relation was not loaded
  const existingByUserId = await db.customerProfile.findUnique({
    where: { userId: canonicalUser.id },
  });

  if (existingByUserId) {
    logger.info(
      {
        userId: canonicalUser.id,
        profileId: existingByUserId.id,
        event: 'CUSTOMER_PROFILE_REUSED',
      },
      'Existing customer profile found by userId and reused'
    );
    return existingByUserId;
  }

  // 6. Hard Foreign Key Guard: canonicalUser.id is 100% verified to exist in the database
  logger.info(
    {
      userId: canonicalUser.id,
      event: 'PROFILE_FOREIGN_KEY_GUARD',
    },
    'Foreign key guard passed: Creating new CustomerProfile for committed canonical user'
  );

  try {
    const newProfile = await db.customerProfile.create({
      data: {
        userId: canonicalUser.id,
        city: 'Ahmedabad',
        membershipPlan: 'SELECT',
        membershipStatus: 'PENDING',
        freeRequestsUsed: 0,
        freeRequestUsed: false,
      } as any,
    });

    void trackEvent({
      event: 'onboarding_completed',
      userId: canonicalUser.id,
      properties: { autoProvisioned: true },
    });

    return newProfile;
  } catch (createError: any) {
    // Handle concurrent creation race condition gracefully
    if (createError.code === 'P2002') {
      const raceWinner = await db.customerProfile.findUnique({
        where: { userId: canonicalUser.id },
      });
      if (raceWinner) return raceWinner;
    }

    logger.error(
      {
        userId: canonicalUser.id,
        error: createError.message,
        event: 'PROFILE_CREATION_FAILED',
      },
      'Failed to create customer profile for verified user'
    );
    throw createError;
  }
}

/**
 * Alias for backward compatibility across endpoints and tests.
 */
export const getOrCreateCustomerProfile = ensureCustomerProfileForAuthenticatedUser;
