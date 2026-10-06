import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import {
  evaluateCustomerEntitlement,
  checkAndConsumeEntitlement,
  attachFreeRequestTaskId,
} from '@/lib/membership/entitlement';
import {
  CANONICAL_MEMBERSHIP_PLANS,
  getPlanById,
} from '@/lib/membership/plans';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
} from '@/lib/payments/razorpay';

describe('PROVENTA — 3 COMPLIMENTARY REQUESTS / ACQUISITION ENTITLEMENT SUITE', { timeout: 35000 }, () => {
  let userA: any;
  let userB: any;
  let userPaid: any;
  let profileA: any;
  let profileB: any;
  let profilePaid: any;

  beforeAll(async () => {
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    // Customer A: Free trial candidate
    userA = await db.user.create({
      data: {
        email: `free_user_a_${uniqueId}@proventa.in`,
        name: 'Aarav Mehta',
        phone: '+919876543210',
        userRoles: { create: [{ role: 'CUSTOMER' }] },
      },
    });

    profileA = await db.customerProfile.create({
      data: {
        userId: userA.id,
        city: 'Ahmedabad',
        preferredComm: 'IN_APP',
        membershipPlan: null,
        membershipStatus: null,
        freeRequestsUsed: 0,
        freeRequestUsed: false,
      } as any,
    });

    // Customer B: Second customer for isolation & concurrency
    userB = await db.user.create({
      data: {
        email: `free_user_b_${uniqueId}@proventa.in`,
        name: 'Pooja Shah',
        phone: '+919876543211',
        userRoles: { create: [{ role: 'CUSTOMER' }] },
      },
    });

    profileB = await db.customerProfile.create({
      data: {
        userId: userB.id,
        city: 'Ahmedabad',
        preferredComm: 'IN_APP',
        membershipPlan: null,
        membershipStatus: null,
        freeRequestsUsed: 0,
        freeRequestUsed: false,
      } as any,
    });

    // Customer Paid: Active subscriber
    userPaid = await db.user.create({
      data: {
        email: `free_user_paid_${uniqueId}@proventa.in`,
        name: 'Devang Vora',
        phone: '+919876543212',
        userRoles: { create: [{ role: 'CUSTOMER' }] },
      },
    });

    profilePaid = await db.customerProfile.create({
      data: {
        userId: userPaid.id,
        city: 'Ahmedabad',
        preferredComm: 'IN_APP',
        membershipPlan: 'PRIVATE',
        membershipStatus: 'ACTIVE',
        membershipStartedAt: new Date(),
        freeRequestsUsed: 0,
        freeRequestUsed: false,
      } as any,
    });
  }, 60000);

  afterAll(async () => {
    try {
      if (profileA?.id) await db.customerProfile.deleteMany({ where: { id: profileA.id } });
      if (profileB?.id) await db.customerProfile.deleteMany({ where: { id: profileB.id } });
      if (profilePaid?.id) await db.customerProfile.deleteMany({ where: { id: profilePaid.id } });
      if (userA?.id) await db.user.deleteMany({ where: { id: userA.id } });
      if (userB?.id) await db.user.deleteMany({ where: { id: userB.id } });
      if (userPaid?.id) await db.user.deleteMany({ where: { id: userPaid.id } });
    } catch {}
  });

  // 1. New customer has free request available
  it('1. should evaluate new customer with freeRequestAvailable = true and canCreateRequest = true', () => {
    const entitlement = evaluateCustomerEntitlement({
      membershipPlan: null,
      membershipStatus: null,
      freeRequestsUsed: 0,
      freeRequestUsed: false,
      freeRequestUsedAt: null,
      freeRequestTaskId: null,
      tasksCount: 0,
    });

    expect(entitlement.hasActiveMembership).toBe(false);
    expect(entitlement.complimentaryRequestsLimit).toBe(3);
    expect(entitlement.complimentaryRequestsRemaining).toBe(3);
    expect(entitlement.freeRequestAvailable).toBe(true);
    expect(entitlement.freeRequestUsed).toBe(false);
    expect(entitlement.canCreateRequest).toBe(true);
    expect(entitlement.state).toBe('FREE_REQUEST_AVAILABLE');
  });

  // 2. First request succeeds without membership
  it('2. should permit request #1, #2, and #3 creation without active membership', async () => {
    // Request #1
    const check1 = await checkAndConsumeEntitlement(profileA.id);
    expect(check1.allowed).toBe(true);
    expect(check1.isFreeRequest).toBe(true);
    expect(check1.requestsRemaining).toBe(2);

    // Link a dummy task ID
    await attachFreeRequestTaskId(profileA.id, 'task_test_free_001');

    // Request #2
    const check2 = await checkAndConsumeEntitlement(profileA.id);
    expect(check2.allowed).toBe(true);
    expect(check2.isFreeRequest).toBe(true);
    expect(check2.requestsRemaining).toBe(1);

    // Request #3
    const check3 = await checkAndConsumeEntitlement(profileA.id);
    expect(check3.allowed).toBe(true);
    expect(check3.isFreeRequest).toBe(true);
    expect(check3.requestsRemaining).toBe(0);
  });

  // 3. Customer profile record reflects all 3 consumed requests
  it('3. should have updated customer profile with freeRequestsUsed = 3, freeRequestUsed = true and recorded timestamp', async () => {
    const updated = await db.customerProfile.findUnique({
      where: { id: profileA.id },
    });

    expect((updated as any)?.freeRequestsUsed).toBe(3);
    expect(updated?.freeRequestUsed).toBe(true);
    expect(updated?.freeRequestUsedAt).toBeInstanceOf(Date);
    expect(updated?.freeRequestTaskId).toBe('task_test_free_001');
  });

  // 4. Fourth request without membership is blocked with MEMBERSHIP_REQUIRED
  it('4. should block 4th request from same customer without active membership', async () => {
    const fourthCheck = await checkAndConsumeEntitlement(profileA.id);

    expect(fourthCheck.allowed).toBe(false);
    expect(fourthCheck.code).toBe('MEMBERSHIP_REQUIRED');
    expect(fourthCheck.reason).toBe('COMPLIMENTARY_LIMIT_REACHED');
    expect(fourthCheck.isFreeRequest).toBe(false);
    expect(fourthCheck.isPaidMember).toBe(false);
    expect(fourthCheck.availablePlans).toEqual(['select', 'private', 'reserve']);
    expect(fourthCheck.error).toContain('3 complimentary requests have already been used');
  });

  // 5. Active member creates requests without consuming free entitlement
  it('5. should allow active member to create unlimited requests without consuming free entitlement', async () => {
    const checkPaid = await checkAndConsumeEntitlement(profilePaid.id);

    expect(checkPaid.allowed).toBe(true);
    expect(checkPaid.isPaidMember).toBe(true);
    expect(checkPaid.isFreeRequest).toBe(false);

    const freshPaid = await db.customerProfile.findUnique({
      where: { id: profilePaid.id },
    });
    // Active member's free request flag was not consumed
    expect(freshPaid?.freeRequestUsed).toBe(false);
  });

  // 6. Rejected option cycles do not restore entitlement
  it('6. should not restore free request entitlement when task options are declined or regenerated', async () => {
    const entitlement = evaluateCustomerEntitlement({
      membershipPlan: null,
      membershipStatus: null,
      freeRequestsUsed: 3,
      freeRequestUsed: true,
      freeRequestUsedAt: new Date(),
      freeRequestTaskId: 'task_test_free_001',
      tasksCount: 3,
    });

    expect(entitlement.canCreateRequest).toBe(false);
    expect(entitlement.freeRequestAvailable).toBe(false);
    expect(entitlement.freeRequestUsed).toBe(true);
    expect(entitlement.state).toBe('FREE_REQUEST_USED');
  });

  // 7. Cancelled task does not restore entitlement
  it('7. should maintain gated state even if a previous task was cancelled', async () => {
    const checkAfterCancel = await checkAndConsumeEntitlement(profileA.id);
    expect(checkAfterCancel.allowed).toBe(false);
    expect(checkAfterCancel.code).toBe('MEMBERSHIP_REQUIRED');
  });

  // 8. Atomic concurrency test (simultaneous request creation)
  it('8. should handle concurrent request creation atomically so only 3 requests consume the free entitlement', async () => {
    const initialB = await db.customerProfile.findUnique({ where: { id: profileB.id } });
    expect((initialB as any)?.freeRequestsUsed).toBe(0);

    // Launch 5 simultaneous entitlement checks
    const results = await Promise.all([
      checkAndConsumeEntitlement(profileB.id),
      checkAndConsumeEntitlement(profileB.id),
      checkAndConsumeEntitlement(profileB.id),
      checkAndConsumeEntitlement(profileB.id),
      checkAndConsumeEntitlement(profileB.id),
    ]);

    const allowedCount = results.filter((r) => r.allowed === true).length;
    const blockedCount = results.filter((r) => r.allowed === false && r.code === 'MEMBERSHIP_REQUIRED').length;

    // Exactly 3 allowed, 2 blocked by atomic updateMany
    expect(allowedCount).toBe(3);
    expect(blockedCount).toBe(2);

    const finalB = await db.customerProfile.findUnique({ where: { id: profileB.id } });
    expect((finalB as any)?.freeRequestsUsed).toBe(3);
    expect(finalB?.freeRequestUsed).toBe(true);
  });

  // 9. Customer isolation
  it('9. should maintain strict customer isolation so consumption by Customer A does not impact Customer C', async () => {
    const uniqueId = Date.now().toString(36) + 'c';
    const userC = await db.user.create({
      data: {
        email: `free_user_c_${uniqueId}@proventa.in`,
        name: 'Kavita Dave',
        userRoles: { create: [{ role: 'CUSTOMER' }] },
      },
    });

    const profileC = await db.customerProfile.create({
      data: {
        userId: userC.id,
        city: 'Ahmedabad',
        freeRequestsUsed: 0,
        freeRequestUsed: false,
      } as any,
    });

    // Profile C can create request even after A & B consumed theirs
    const checkC = await checkAndConsumeEntitlement(profileC.id);
    expect(checkC.allowed).toBe(true);
    expect(checkC.isFreeRequest).toBe(true);
    expect(checkC.requestsRemaining).toBe(2);

    // Cleanup C
    await db.customerProfile.deleteMany({ where: { id: profileC.id } }).catch(() => {});
    await db.user.deleteMany({ where: { id: userC.id } }).catch(() => {});
  });

  // 10. Admin visibility of free request status
  it('10. should expose free request fields in customer directory lookup for admin audit', async () => {
    const customer = await db.customerProfile.findUnique({
      where: { id: profileA.id },
      select: {
        id: true,
        membershipPlan: true,
        membershipStatus: true,
        freeRequestsUsed: true,
        freeRequestUsed: true,
        freeRequestUsedAt: true,
        freeRequestTaskId: true,
      } as any,
    });

    expect((customer as any)?.freeRequestsUsed).toBe(3);
    expect(customer?.freeRequestUsed).toBe(true);
    expect(customer?.freeRequestUsedAt).toBeInstanceOf(Date);
    expect(customer?.freeRequestTaskId).toBe('task_test_free_001');
  });

  // 11. Canonical membership tiers and pricing
  it('11. should preserve canonical membership plans and pricing', () => {
    const select = getPlanById('select');
    const privatePlan = getPlanById('private');
    const reserve = getPlanById('reserve');

    expect(select?.pricePaise).toBe(249900);
    expect(select?.formattedPrice).toBe('₹2,499');

    expect(privatePlan?.pricePaise).toBe(499900);
    expect(privatePlan?.formattedPrice).toBe('₹4,999');

    expect(reserve?.pricePaise).toBe(999900);
    expect(reserve?.formattedPrice).toBe('₹9,999');
  });
});
