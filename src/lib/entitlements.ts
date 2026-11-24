import { db } from '@/lib/db';
import { getPlan } from '@/lib/pricing';
import type { EntitlementStatus } from '@prisma/client';

/**
 * Allocate initial or renewal entitlements for a given active subscription.
 *
 * Rules:
 * - Essential: 1 visit every 3 months (expiry = 3 months from allocation).
 * - Family: 1 visit every 1 month (expiry = 1 month from allocation).
 * - Premium: 2 visits every 1 month (expiry = 1 month from allocation).
 * - Unused visits strictly do NOT roll over.
 */
export async function allocateSubscriptionEntitlements(
  subscriptionId: string,
  userId: string,
  planId: string,
  periodStart = new Date()
) {
  const plan = await getPlan(planId);
  const expiryDate = new Date(periodStart);
  expiryDate.setMonth(expiryDate.getMonth() + plan.allocationIntervalMonths);

  return await db.$transaction(async (tx) => {
    // 1. Enforce No-Rollover: Expire any existing AVAILABLE entitlements for this subscription
    await tx.entitlementLedger.updateMany({
      where: {
        subscriptionId,
        status: 'AVAILABLE',
      },
      data: {
        status: 'EXPIRED',
        notes: 'Expired at period boundary (no-rollover enforcement)',
      },
    });

    // 2. Create the exact allocated number of visit entries for this interval
    const allocations = [];
    for (let i = 0; i < plan.visitsPerAllocation; i++) {
      allocations.push(
        tx.entitlementLedger.create({
          data: {
            subscriptionId,
            userId,
            status: 'AVAILABLE',
            allocatedAt: periodStart,
            expiresAt: expiryDate,
            notes: `Allocation for interval starting ${periodStart.toISOString().split('T')[0]} (Plan: ${plan.name})`,
          },
        })
      );
    }

    return await Promise.all(allocations);
  });
}

/**
 * Deduct a single visit entitlement atomically upon approved booking or execution stage.
 * Protects against duplicate deductions and race conditions.
 */
export async function deductVisitEntitlement(
  userId: string,
  bookingId: string
): Promise<{ success: boolean; entitlementId?: string; error?: string }> {
  return await db.$transaction(async (tx) => {
    // Check if this booking has already had an entitlement deducted
    const existingDeduction = await tx.entitlementLedger.findFirst({
      where: {
        bookingId,
        status: 'CONSUMED',
      },
    });

    if (existingDeduction) {
      return {
        success: true,
        entitlementId: existingDeduction.id,
        error: 'Entitlement already deducted for this booking (idempotent)',
      };
    }

    // Find the oldest available valid entitlement that has not expired
    const now = new Date();
    const availableEntitlement = await tx.entitlementLedger.findFirst({
      where: {
        userId,
        status: 'AVAILABLE',
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: 'asc' },
    });

    if (!availableEntitlement) {
      return {
        success: false,
        error: 'No active maintenance visit entitlement available',
      };
    }

    // Atomically mark as consumed
    const updated = await tx.entitlementLedger.update({
      where: { id: availableEntitlement.id },
      data: {
        status: 'CONSUMED',
        consumedAt: now,
        bookingId,
      },
    });

    return {
      success: true,
      entitlementId: updated.id,
    };
  });
}

/**
 * Restore an entitlement if a booking is cancelled with sufficient notice or PROVENTA fails to fulfil.
 */
export async function restoreEntitlement(
  bookingId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  return await db.$transaction(async (tx) => {
    const consumedEntitlement = await tx.entitlementLedger.findFirst({
      where: {
        bookingId,
        status: 'CONSUMED',
      },
    });

    if (!consumedEntitlement) {
      return {
        success: false,
        error: 'No consumed entitlement found for this booking',
      };
    }

    // Restore to AVAILABLE status if current time is still before expiresAt, or extend expiry if failed fulfilment
    const now = new Date();
    let newExpiresAt = consumedEntitlement.expiresAt;
    if (newExpiresAt < now) {
      newExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 day grace extension
    }

    await tx.entitlementLedger.update({
      where: { id: consumedEntitlement.id },
      data: {
        status: 'AVAILABLE',
        consumedAt: null,
        bookingId: null,
        restoredAt: now,
        expiresAt: newExpiresAt,
        notes: `Restored: ${reason}`,
      },
    });

    return { success: true };
  });
}

/**
 * Get available entitlement balance for a user.
 */
export async function getAvailableEntitlementsCount(userId: string): Promise<number> {
  const now = new Date();
  return await db.entitlementLedger.count({
    where: {
      userId,
      status: 'AVAILABLE',
      expiresAt: { gt: now },
    },
  });
}
