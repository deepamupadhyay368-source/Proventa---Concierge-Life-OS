import { db } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';

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
