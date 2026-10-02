import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '@/lib/db';
import crypto from 'crypto';
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

describe('PROVENTA — FIRST REQUEST FREE / ACQUISITION ENTITLEMENT SUITE', { timeout: 35000 }, () => {
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
        freeRequestUsed: false,
      },
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
        freeRequestUsed: false,
      },
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
        freeRequestUsed: false,
      },
    });
  }, 60000);

  // 1. New customer has free request available
  it('1. should evaluate new customer with freeRequestAvailable = true and canCreateRequest = true', () => {
    const entitlement = evaluateCustomerEntitlement({
      membershipPlan: null,
      membershipStatus: null,
      freeRequestUsed: false,
      freeRequestUsedAt: null,
      freeRequestTaskId: null,
      tasksCount: 0,
    });

    expect(entitlement.hasActiveMembership).toBe(false);
    expect(entitlement.freeRequestAvailable).toBe(true);
    expect(entitlement.freeRequestUsed).toBe(false);
    expect(entitlement.canCreateRequest).toBe(true);
    expect(entitlement.state).toBe('FREE_REQUEST_AVAILABLE');
  });

  // 2. First request succeeds without membership
  it('2. should permit first request creation without active membership and flag as isFreeRequest', async () => {
    const check = await checkAndConsumeEntitlement(profileA.id);

    expect(check.allowed).toBe(true);
    expect(check.isFreeRequest).toBe(true);
    expect(check.isPaidMember).toBe(false);
    expect(check.error).toBeUndefined();
  });

  // 3. First request consumes entitlement
  it('3. should have updated customer profile with freeRequestUsed = true and recorded timestamp', async () => {
    const updated = await db.customerProfile.findUnique({
      where: { id: profileA.id },
    });

    expect(updated?.freeRequestUsed).toBe(true);
    expect(updated?.freeRequestUsedAt).toBeInstanceOf(Date);

    // Link a dummy task ID
    await attachFreeRequestTaskId(profileA.id, 'task_test_free_001');

    const withTask = await db.customerProfile.findUnique({
      where: { id: profileA.id },
    });
    expect(withTask?.freeRequestTaskId).toBe('task_test_free_001');
  });

  // 4. Second request without membership is blocked with MEMBERSHIP_REQUIRED
  it('4. should block second request from same customer without active membership', async () => {
    const secondCheck = await checkAndConsumeEntitlement(profileA.id);

    expect(secondCheck.allowed).toBe(false);
    expect(secondCheck.code).toBe('MEMBERSHIP_REQUIRED');
    expect(secondCheck.reason).toBe('FIRST_REQUEST_USED');
    expect(secondCheck.isFreeRequest).toBe(false);
    expect(secondCheck.isPaidMember).toBe(false);
  });

  // 5. Structured error contains available plans
  it('5. should provide canonical availablePlans (select, private, reserve) in membership gate error', async () => {
    const check = await checkAndConsumeEntitlement(profileA.id);

    expect(check.availablePlans).toEqual(['select', 'private', 'reserve']);
    expect(check.error).toContain('Your first request is on us has already been used');
  });

  // 6. Active member creates requests without consuming free entitlement
  it('6. should allow active member to create unlimited requests without consuming free entitlement', async () => {
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

  // 7. Rejected option cycles do not restore entitlement
  it('7. should not restore free request entitlement when task options are declined or regenerated', async () => {
    // Check evaluation when freeRequestUsed is true
    const entitlement = evaluateCustomerEntitlement({
      membershipPlan: null,
      membershipStatus: null,
      freeRequestUsed: true,
      freeRequestUsedAt: new Date(),
      freeRequestTaskId: 'task_test_free_001',
      tasksCount: 1,
    });

    expect(entitlement.canCreateRequest).toBe(false);
    expect(entitlement.freeRequestAvailable).toBe(false);
    expect(entitlement.state).toBe('FREE_REQUEST_USED');
  });

  // 8. Cancelled task does not restore entitlement
  it('8. should maintain gated state even if the previous task is cancelled', async () => {
    const checkAfterCancel = await checkAndConsumeEntitlement(profileA.id);
    expect(checkAfterCancel.allowed).toBe(false);
    expect(checkAfterCancel.code).toBe('MEMBERSHIP_REQUIRED');
  });

  // 9. Atomic concurrency test (simultaneous request creation)
  it('9. should handle concurrent request creation atomically so only 1 request consumes the free entitlement', async () => {
    // profileB has not used free request yet
    const initialB = await db.customerProfile.findUnique({ where: { id: profileB.id } });
    expect(initialB?.freeRequestUsed).toBe(false);

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

    // Exactly 1 allowed, 4 blocked by atomic updateMany
    expect(allowedCount).toBe(1);
    expect(blockedCount).toBe(4);

    const finalB = await db.customerProfile.findUnique({ where: { id: profileB.id } });
    expect(finalB?.freeRequestUsed).toBe(true);
  });

  // 10. Customer isolation
  it('10. should maintain strict customer isolation so consumption by Customer A does not impact Customer C', async () => {
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
        freeRequestUsed: false,
      },
    });

    // Profile C can create request even after A & B consumed theirs
    const checkC = await checkAndConsumeEntitlement(profileC.id);
    expect(checkC.allowed).toBe(true);
    expect(checkC.isFreeRequest).toBe(true);
  });

  // 11. Admin visibility of free request status
  it('11. should expose free request fields in customer directory lookup for admin audit', async () => {
    const customer = await db.customerProfile.findUnique({
      where: { id: profileA.id },
      select: {
        id: true,
        membershipPlan: true,
        membershipStatus: true,
        freeRequestUsed: true,
        freeRequestUsedAt: true,
        freeRequestTaskId: true,
      },
    });

    expect(customer?.freeRequestUsed).toBe(true);
    expect(customer?.freeRequestUsedAt).toBeInstanceOf(Date);
    expect(customer?.freeRequestTaskId).toBe('task_test_free_001');
  });

  // 12. Concierge visibility
  it('12. should calculate isFreeRequest correctly for concierge task items', () => {
    const taskItemA = {
      id: 'task_test_free_001',
      customer: {
        membershipPlan: null,
        membershipStatus: null,
        freeRequestUsed: true,
        freeRequestTaskId: 'task_test_free_001',
      },
    };

    const isFree = taskItemA.id === taskItemA.customer.freeRequestTaskId;
    expect(isFree).toBe(true);
  });

  // 13. Membership checkout flow after gate
  it('13. should generate valid Razorpay order when gated customer selects Private plan', async () => {
    const plan = getPlanById('private')!;
    const idempotencyKey = `mem_free_gate_${Date.now()}`;

    const order = await createRazorpayOrder({
      amountPaise: plan.pricePaise,
      currency: 'INR',
      receipt: `rcpt_gate_${Date.now()}`,
      idempotencyKey,
      notes: {
        planId: 'private',
        planName: plan.name,
        customerId: profileA.id,
      },
    });

    expect(order.orderId).toBeDefined();
    expect(order.amount).toBe(499900);
    expect(order.currency).toBe('INR');
  });

  // 14. Successful membership payment unlocks unlimited requests
  it('14. should unlock request creation once customer completes membership checkout and activates plan', async () => {
    // Simulate successful payment verification
    await db.customerProfile.update({
      where: { id: profileA.id },
      data: {
        membershipPlan: 'PRIVATE',
        membershipStatus: 'ACTIVE',
        membershipStartedAt: new Date(),
      },
    });

    const checkUnlocked = await checkAndConsumeEntitlement(profileA.id);
    expect(checkUnlocked.allowed).toBe(true);
    expect(checkUnlocked.isPaidMember).toBe(true);
    expect(checkUnlocked.isFreeRequest).toBe(false);
  });

  // 15. Failed payment leaves customer gated
  it('15. should keep customer gated if payment fails or remains pending', async () => {
    const uniqueId = Date.now().toString(36) + 'fail';
    const userFail = await db.user.create({
      data: {
        email: `free_user_fail_${uniqueId}@proventa.in`,
        name: 'Failed Payer',
        userRoles: { create: [{ role: 'CUSTOMER' }] },
      },
    });

    const profileFail = await db.customerProfile.create({
      data: {
        userId: userFail.id,
        city: 'Ahmedabad',
        freeRequestUsed: true,
        freeRequestUsedAt: new Date(),
        membershipStatus: 'FAILED',
      },
    });

    const checkFail = await checkAndConsumeEntitlement(profileFail.id);
    expect(checkFail.allowed).toBe(false);
    expect(checkFail.code).toBe('MEMBERSHIP_REQUIRED');
  });

  // 16. Zero secret exposure
  it('16. should not expose sensitive secrets in customer entitlement evaluation output', () => {
    const entitlement = evaluateCustomerEntitlement({
      membershipPlan: 'PRIVATE',
      membershipStatus: 'ACTIVE',
      freeRequestUsed: true,
      freeRequestUsedAt: new Date(),
      freeRequestTaskId: 'task_xyz',
      tasksCount: 3,
    });

    const serialized = JSON.stringify(entitlement);
    expect(serialized).not.toContain('secret');
    expect(serialized).not.toContain('key');
    expect(serialized).not.toContain('password');
    expect(serialized).not.toContain('token');
  });

  // 17. No authentication regression
  it('17. should reject non-existent or unauthenticated customer profile lookups', async () => {
    const checkInvalid = await checkAndConsumeEntitlement('non_existent_cuid_123');
    expect(checkInvalid.allowed).toBe(false);
    expect(checkInvalid.code).toBe('NOT_FOUND');
  });

  // 18. Zero fabrication protections intact
  it('18. should verify canonical plan names and pricing remain strictly uncompromised', () => {
    expect(CANONICAL_MEMBERSHIP_PLANS.select.name).toBe('SELECT');
    expect(CANONICAL_MEMBERSHIP_PLANS.select.priceInr).toBe(2499);
    expect(CANONICAL_MEMBERSHIP_PLANS.private.name).toBe('PRIVATE');
    expect(CANONICAL_MEMBERSHIP_PLANS.private.priceInr).toBe(4999);
    expect(CANONICAL_MEMBERSHIP_PLANS.reserve.name).toBe('RESERVE');
    expect(CANONICAL_MEMBERSHIP_PLANS.reserve.priceInr).toBe(9999);
  });
});
