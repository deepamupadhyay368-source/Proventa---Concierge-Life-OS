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
      const cleanupOps = [];
      if (testTaskId) {
        cleanupOps.push(
          db.taskEvent.deleteMany({ where: { taskId: testTaskId } }).catch(() => {}),
          db.agentExecutionTrace.deleteMany({ where: { taskId: testTaskId } }).catch(() => {}),
          db.taskPlanStep.deleteMany({ where: { taskId: testTaskId } }).catch(() => {}),
          db.task.deleteMany({ where: { id: testTaskId } }).catch(() => {})
        );
      }
      if (secondTaskId) {
        cleanupOps.push(
          db.taskEvent.deleteMany({ where: { taskId: secondTaskId } }).catch(() => {}),
          db.agentExecutionTrace.deleteMany({ where: { taskId: secondTaskId } }).catch(() => {}),
          db.taskPlanStep.deleteMany({ where: { taskId: secondTaskId } }).catch(() => {}),
          db.task.deleteMany({ where: { id: secondTaskId } }).catch(() => {})
        );
      }
      if (testUser?.id) {
        cleanupOps.push(
          db.customerProfile.deleteMany({ where: { userId: testUser.id } }).catch(() => {}),
          db.userRoleAssignment.deleteMany({ where: { userId: testUser.id } }).catch(() => {}),
          db.user.deleteMany({ where: { id: testUser.id } }).catch(() => {})
        );
      }
      await Promise.race([
        Promise.allSettled(cleanupOps),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
    } catch (e) {
      // Non-blocking cleanup
    }
  }, 10000);

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

  it('6. Full autonomous event discovery for "Garba passes for 13/10/2026" returns 5 curated options and sets status to AWAITING_APPROVAL', async () => {
    const processed = await RequestOrchestrator.processTask(testTaskId);

    expect(processed.success).toBe(true);
    expect(processed.task.status).toBe('AWAITING_APPROVAL');
    expect(processed.proposals.length).toBe(5);
    expect(processed.task.proposedOptions).toHaveLength(5);
    expect(processed.task.assignedAgent).toBe('Events & Gatherings Agent');

    const options = processed.task.proposedOptions as any[];
    expect(options.some((o: any) => o.title.includes('Rajpath Club'))).toBe(true);
    expect(options.some((o: any) => o.title.includes('Karnavati Club'))).toBe(true);
    expect(options.some((o: any) => o.title.includes('Riverfront'))).toBe(true);
    expect(options.every((o: any) => o.metadata?.date === '2026-10-13')).toBe(true);
  });
});
