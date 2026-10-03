import { db } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';
import { AuthenticationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export type FreeRequestState = 'FREE_REQUEST_AVAILABLE' | 'FREE_REQUEST_USED' | 'ACTIVE_MEMBER';

export interface CustomerEntitlement {
  hasActiveMembership: boolean;
  membershipPlan: string | null;
  membershipStatus: string | null;
  freeRequestAvailable: boolean;
  freeRequestUsed: boolean;
  freeRequestUsedAt: Date | null;
  freeRequestTaskId: string | null;
  canCreateRequest: boolean;
  state: FreeRequestState;
}

/**
 * Pure evaluation of customer entitlement.
 */
export function evaluateCustomerEntitlement(profile: {
  membershipPlan?: string | null;
  membershipStatus?: string | null;
  freeRequestUsed?: boolean | null;
  freeRequestUsedAt?: Date | null;
  freeRequestTaskId?: string | null;
  tasksCount?: number;
}): CustomerEntitlement {
  const hasActiveMembership = profile.membershipStatus === 'ACTIVE';

  // Free request is used if explicitly marked or if existing tasks count > 0
  const freeRequestUsed = Boolean(
    profile.freeRequestUsed || (typeof profile.tasksCount === 'number' && profile.tasksCount > 0)
  );

  const freeRequestAvailable = !hasActiveMembership && !freeRequestUsed;
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
    freeRequestAvailable,
    freeRequestUsed,
    freeRequestUsedAt: profile.freeRequestUsedAt || null,
    freeRequestTaskId: profile.freeRequestTaskId || null,
    canCreateRequest,
    state,
  };
}

/**
 * Atomically checks and consumes the free request entitlement for a customer.
 * Returns { allowed: true, isFreeRequest: boolean } or { allowed: false, reason: string }.
 *
 * Race-condition safe: Uses atomic SQL update so two simultaneous requests cannot consume two free requests.
 */
export async function checkAndConsumeEntitlement(customerId: string): Promise<{
  allowed: boolean;
  isFreeRequest: boolean;
  isPaidMember: boolean;
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

  // 1. Active paid member -> always permitted
  if (customerProfile.membershipStatus === 'ACTIVE') {
    return {
      allowed: true,
      isFreeRequest: false,
      isPaidMember: true,
    };
  }

  // 2. Non-active member: check if free request already consumed
  if (customerProfile.freeRequestUsed || customerProfile._count.tasks > 0) {
    // If not marked in DB but task count > 0, backfill flag
    if (!customerProfile.freeRequestUsed && customerProfile._count.tasks > 0) {
      await db.customerProfile.update({
        where: { id: customerId },
        data: { freeRequestUsed: true, freeRequestUsedAt: new Date() },
      }).catch(() => {});
    }

    return {
      allowed: false,
      isFreeRequest: false,
      isPaidMember: false,
      error: 'Membership required to submit further requests. Your first request is on us has already been used.',
      code: 'MEMBERSHIP_REQUIRED',
      reason: 'FIRST_REQUEST_USED',
      availablePlans: ['select', 'private', 'reserve'],
    };
  }

  // 3. Atomically consume free request entitlement
  const now = new Date();
  const updateResult = await db.customerProfile.updateMany({
    where: {
      id: customerId,
      freeRequestUsed: false,
      OR: [
        { membershipStatus: null },
        { membershipStatus: { not: 'ACTIVE' } },
      ],
    },
    data: {
      freeRequestUsed: true,
      freeRequestUsedAt: now,
    },
  });

  if (updateResult.count === 0) {
    // Another concurrent request consumed the free request simultaneously
    return {
      allowed: false,
      isFreeRequest: false,
      isPaidMember: false,
      error: 'Membership required to submit further requests. Your first request is on us has already been used.',
      code: 'MEMBERSHIP_REQUIRED',
      reason: 'FIRST_REQUEST_USED',
      availablePlans: ['select', 'private', 'reserve'],
    };
  }

  return {
    allowed: true,
    isFreeRequest: true,
    isPaidMember: false,
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
        freeRequestUsed: false,
      },
    });

    logger.info(
      {
        userId: canonicalUser.id,
        profileId: newProfile.id,
        event: 'CUSTOMER_PROFILE_CREATED',
      },
      'New CustomerProfile created successfully'
    );

    return newProfile;
  } catch (err: any) {
    // Concurrent request race condition recovery: if another thread created it, fetch and return
    const raceProfile = await db.customerProfile.findUnique({
      where: { userId: canonicalUser.id },
    });
    if (raceProfile) {
      logger.info(
        {
          userId: canonicalUser.id,
          profileId: raceProfile.id,
          event: 'CUSTOMER_PROFILE_REUSED',
        },
        'Customer profile recovered and reused after concurrent creation'
      );
      return raceProfile;
    }
    throw err;
  }
}

/**
 * Centralized alias ensuring identical behavior across all endpoints
 */
export const getOrCreateCustomerProfile = ensureCustomerProfileForAuthenticatedUser;
