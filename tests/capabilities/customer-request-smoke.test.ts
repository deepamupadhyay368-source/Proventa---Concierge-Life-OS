import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { ensureCustomerProfileForAuthenticatedUser, getOrCreateCustomerProfile } from '@/lib/membership/entitlement';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { AuthenticationError } from '@/lib/errors';
import { randomBytes } from 'crypto';

describe('PROVENTA — PRODUCTION CUSTOMER PROFILE & REQUEST DISPATCH SMOKE SUITE', { timeout: 60000 }, () => {
  const uniqueTag = randomBytes(4).toString('hex');
  const userEmail = `garba_member_${uniqueTag}@proventa.internal`;
  let testUser: any;
  let testProfile: any;
  let testTaskId: string;
  let secondTaskId: string;

  beforeAll(async () => {
    // 1. Create canonical User in Postgres
    testUser = await db.user.create({
      data: {
        email: userEmail,
        name: 'Garba Night VIP',
        phone: '+919988776655',
        status: 'ACTIVE',
        emailVerified: new Date(),
        userRoles: {
          create: [{ role: 'CUSTOMER' }],
        },
      },
      include: { userRoles: true },
    });
  }, 60000);

  afterAll(async () => {
    try {
      if (testTaskId) {
        await db.taskEvent.deleteMany({ where: { taskId: testTaskId } }).catch(() => {});
        await db.agentExecutionTrace.deleteMany({ where: { taskId: testTaskId } }).catch(() => {});
        await db.taskPlanStep.deleteMany({ where: { taskId: testTaskId } }).catch(() => {});
        await db.task.deleteMany({ where: { id: testTaskId } }).catch(() => {});
      }
      if (secondTaskId) {
        await db.taskEvent.deleteMany({ where: { taskId: secondTaskId } }).catch(() => {});
        await db.agentExecutionTrace.deleteMany({ where: { taskId: secondTaskId } }).catch(() => {});
        await db.taskPlanStep.deleteMany({ where: { taskId: secondTaskId } }).catch(() => {});
        await db.task.deleteMany({ where: { id: secondTaskId } }).catch(() => {});
      }
      if (testUser?.id) {
        await db.customerProfile.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
        await db.userRoleAssignment.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
        await db.user.deleteMany({ where: { id: testUser.id } }).catch(() => {});
      }
    } catch (e) {
      console.error('Cleanup error:', e);
    }
  }, 60000);

  it('1. Verifies initial invariant: User exists in DB and has committed ID', async () => {
    expect(testUser).toBeDefined();
    expect(testUser.id).toBeDefined();
    expect(testUser.email).toBe(userEmail);
    expect(testUser.status).toBe('ACTIVE');

    const queriedUser = await db.user.findUnique({
      where: { id: testUser.id },
    });
    expect(queriedUser).not.toBeNull();
    expect(queriedUser?.id).toBe(testUser.id);
  });

  it('2. ensureCustomerProfileForAuthenticatedUser creates CustomerProfile with verified User.id', async () => {
    testProfile = await ensureCustomerProfileForAuthenticatedUser({
      id: testUser.id,
      email: testUser.email,
      name: testUser.name,
    });

    expect(testProfile).toBeDefined();
    expect(testProfile.id).toBeDefined();
    expect(testProfile.userId).toBe(testUser.id); // INVARIANT: User.id === CustomerProfile.userId

    // Verify directly in DB
    const dbProfile = await db.customerProfile.findUnique({
      where: { id: testProfile.id },
      include: { user: true },
    });

    expect(dbProfile).not.toBeNull();
    expect(dbProfile!.userId).toBe(testUser.id);
    expect(dbProfile!.user.id).toBe(testUser.id);
    expect(dbProfile!.user.email).toBe(userEmail);
  });

  it('3. Submits "Garba passes for 13/10/2026" without foreign key violation and creates Task', async () => {
    const rawInput = 'Garba passes for 13/10/2026';

    const initialTask = await RequestOrchestrator.createInitialTask({
      rawInput,
      customerId: testProfile.id,
      urgency: 'NORMAL',
    });

    testTaskId = initialTask.id;
    expect(initialTask).toBeDefined();
    expect(initialTask.id).toBeDefined();
    expect(initialTask.customerId).toBe(testProfile.id);

    // Verify task in DB
    const dbTask = await db.task.findUnique({
      where: { id: initialTask.id },
      include: { customer: { include: { user: true } } },
    });

    expect(dbTask).not.toBeNull();
    expect(dbTask!.customerId).toBe(testProfile.id);
    expect(dbTask!.customer.userId).toBe(testUser.id);
    expect(dbTask!.customer.user.email).toBe(userEmail);
  });

  it('4. Submits second request for same customer: CustomerProfile is reused rather than recreated', async () => {
    const rawInput = 'Dinner table for 4 at Agashiye Ahmedabad';

    const reusedProfile = await getOrCreateCustomerProfile({
      id: testUser.id,
      email: testUser.email,
    });

    expect(reusedProfile.id).toBe(testProfile.id);
    expect(reusedProfile.userId).toBe(testUser.id);

    const secondTask = await RequestOrchestrator.createInitialTask({
      rawInput,
      customerId: reusedProfile.id,
      urgency: 'NORMAL',
    });

    secondTaskId = secondTask.id;
    expect(secondTask.id).toBeDefined();
    expect(secondTask.customerId).toBe(testProfile.id);

    // Verify total customer profiles for this user is exactly 1 (no duplicates)
    const profileCount = await db.customerProfile.count({
      where: { userId: testUser.id },
    });
    expect(profileCount).toBe(1);
  });

  it('5. Stale session pointing to nonexistent user is rejected with AuthenticationError (401)', async () => {
    const staleUserId = `stale_user_phantom_${randomBytes(6).toString('hex')}`;

    await expect(
      ensureCustomerProfileForAuthenticatedUser({
        id: staleUserId,
        email: `phantom_${staleUserId}@proventa.internal`,
      })
    ).rejects.toThrow(AuthenticationError);

    // Ensure zero profiles were created for the phantom user
    const phantomProfile = await db.customerProfile.findUnique({
      where: { userId: staleUserId },
    });
    expect(phantomProfile).toBeNull();
  });
});
