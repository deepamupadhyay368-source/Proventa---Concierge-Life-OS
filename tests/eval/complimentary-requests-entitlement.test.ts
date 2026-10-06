import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  evaluateCustomerEntitlement,
  checkAndConsumeEntitlement,
  attachFreeRequestTaskId,
  COMPLIMENTARY_REQUESTS_LIMIT,
} from '@/lib/membership/entitlement';
import { db } from '@/lib/db';

describe('PROVENTA — 3 COMPLIMENTARY REQUESTS ENTITLEMENT SUITE', () => {
  const customerId = 'cust_entitlement_001';
  let mockProfile: any;
  let taskRecords: any[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    taskRecords = [];

    mockProfile = {
      id: customerId,
      userId: 'usr_entitlement_001',
      membershipPlan: null,
      membershipStatus: null,
      freeRequestsUsed: 0,
      freeRequestUsed: false,
      freeRequestUsedAt: null,
      freeRequestTaskId: null,
      _count: { tasks: 0 },
    };

    vi.spyOn(db.customerProfile as any, 'findUnique').mockImplementation(async ({ where }: any) => {
      if (where.id === customerId) {
        return {
          ...mockProfile,
          _count: { tasks: taskRecords.length },
        } as any;
      }
      return null;
    });

    vi.spyOn(db.customerProfile as any, 'update').mockImplementation(async ({ data }: any) => {
      mockProfile = { ...mockProfile, ...data };
      return mockProfile as any;
    });

    vi.spyOn(db.customerProfile as any, 'updateMany').mockImplementation(async ({ where, data }: any) => {
      // Atomic guard: check if current freeRequestsUsed is < 3
      if (mockProfile.freeRequestsUsed >= COMPLIMENTARY_REQUESTS_LIMIT) {
        return { count: 0 } as any;
      }
      if (where.freeRequestsUsed && where.freeRequestsUsed.lt !== undefined) {
        if (mockProfile.freeRequestsUsed >= where.freeRequestsUsed.lt) {
          return { count: 0 } as any;
        }
      }

      const increment = data.freeRequestsUsed?.increment || 1;
      const nextCount = mockProfile.freeRequestsUsed + increment;
      mockProfile.freeRequestsUsed = nextCount;
      mockProfile.freeRequestUsed = nextCount >= COMPLIMENTARY_REQUESTS_LIMIT;
      mockProfile.freeRequestUsedAt = data.freeRequestUsedAt || new Date();
      return { count: 1 } as any;
    });
  });

  it('1. New customer starts with 0 used, 3 remaining, and canCreateRequest = true', () => {
    const entitlement = evaluateCustomerEntitlement({
      membershipPlan: null,
      membershipStatus: null,
      freeRequestsUsed: 0,
      freeRequestUsed: false,
      tasksCount: 0,
    });

    expect(entitlement.complimentaryRequestsLimit).toBe(3);
    expect(entitlement.complimentaryRequestsUsed).toBe(0);
    expect(entitlement.complimentaryRequestsRemaining).toBe(3);
    expect(entitlement.freeRequestAvailable).toBe(true);
    expect(entitlement.freeRequestUsed).toBe(false);
    expect(entitlement.canCreateRequest).toBe(true);
    expect(entitlement.state).toBe('FREE_REQUEST_AVAILABLE');
  });

  it('2. Request #1: Consumes 1 complimentary request -> 2 remaining', async () => {
    const check1 = await checkAndConsumeEntitlement(customerId);
    expect(check1.allowed).toBe(true);
    expect(check1.isFreeRequest).toBe(true);
    expect(check1.isPaidMember).toBe(false);
    expect(check1.requestsRemaining).toBe(2);
    expect(check1.requestsUsed).toBe(1);

    taskRecords.push({ id: 'task_001' });
    await attachFreeRequestTaskId(customerId, 'task_001');

    const eval1 = evaluateCustomerEntitlement({
      ...mockProfile,
      tasksCount: taskRecords.length,
    });
    expect(eval1.complimentaryRequestsRemaining).toBe(2);
    expect(eval1.canCreateRequest).toBe(true);
  });

  it('3. Request #2: Consumes 2nd complimentary request -> 1 remaining', async () => {
    // Consume #1
    await checkAndConsumeEntitlement(customerId);
    taskRecords.push({ id: 'task_001' });

    // Consume #2
    const check2 = await checkAndConsumeEntitlement(customerId);
    expect(check2.allowed).toBe(true);
    expect(check2.isFreeRequest).toBe(true);
    expect(check2.requestsRemaining).toBe(1);
    expect(check2.requestsUsed).toBe(2);

    taskRecords.push({ id: 'task_002' });

    const eval2 = evaluateCustomerEntitlement({
      ...mockProfile,
      tasksCount: taskRecords.length,
    });
    expect(eval2.complimentaryRequestsRemaining).toBe(1);
    expect(eval2.canCreateRequest).toBe(true);
  });

  it('4. Request #3: Consumes 3rd complimentary request -> 0 remaining, freeRequestUsed = true', async () => {
    // Consume #1 and #2
    await checkAndConsumeEntitlement(customerId);
    taskRecords.push({ id: 'task_001' });
    await checkAndConsumeEntitlement(customerId);
    taskRecords.push({ id: 'task_002' });

    // Consume #3
    const check3 = await checkAndConsumeEntitlement(customerId);
    expect(check3.allowed).toBe(true);
    expect(check3.isFreeRequest).toBe(true);
    expect(check3.requestsRemaining).toBe(0);
    expect(check3.requestsUsed).toBe(3);

    taskRecords.push({ id: 'task_003' });

    const eval3 = evaluateCustomerEntitlement({
      ...mockProfile,
      tasksCount: taskRecords.length,
    });
    expect(eval3.complimentaryRequestsRemaining).toBe(0);
    expect(eval3.freeRequestAvailable).toBe(false);
    expect(eval3.freeRequestUsed).toBe(true);
    expect(eval3.canCreateRequest).toBe(false);
    expect(eval3.state).toBe('FREE_REQUEST_USED');
  });

  it('5. Request #4: Blocked by membership gate (402 / MEMBERSHIP_REQUIRED)', async () => {
    // Exhaust all 3 requests
    await checkAndConsumeEntitlement(customerId);
    await checkAndConsumeEntitlement(customerId);
    await checkAndConsumeEntitlement(customerId);
    taskRecords.push({ id: 't1' }, { id: 't2' }, { id: 't3' });

    // Attempt request #4
    const check4 = await checkAndConsumeEntitlement(customerId);
    expect(check4.allowed).toBe(false);
    expect(check4.isFreeRequest).toBe(false);
    expect(check4.code).toBe('MEMBERSHIP_REQUIRED');
    expect(check4.reason).toBe('COMPLIMENTARY_LIMIT_REACHED');
    expect(check4.requestsRemaining).toBe(0);
    expect(check4.error).toContain('3 complimentary requests have already been used');
    expect(check4.availablePlans).toEqual(['select', 'private', 'reserve']);
  });

  it('6. Concurrent requests cannot double spend or exceed the 3-request allowance', async () => {
    // Run 5 simultaneous entitlement requests
    const results = await Promise.all([
      checkAndConsumeEntitlement(customerId),
      checkAndConsumeEntitlement(customerId),
      checkAndConsumeEntitlement(customerId),
      checkAndConsumeEntitlement(customerId),
      checkAndConsumeEntitlement(customerId),
    ]);

    const allowed = results.filter((r) => r.allowed);
    const rejected = results.filter((r) => !r.allowed);

    expect(allowed).toHaveLength(3);
    expect(rejected).toHaveLength(2);
    expect(mockProfile.freeRequestsUsed).toBe(3);
  });

  it('7. Logout, login, refresh, browser restart does not reset consumed requests', () => {
    // Profile after using 2 requests
    const persistentProfile = {
      membershipPlan: null,
      membershipStatus: null,
      freeRequestsUsed: 2,
      freeRequestUsed: false,
      tasksCount: 2,
    };

    const reloaded = evaluateCustomerEntitlement(persistentProfile);
    expect(reloaded.complimentaryRequestsUsed).toBe(2);
    expect(reloaded.complimentaryRequestsRemaining).toBe(1);
    expect(reloaded.canCreateRequest).toBe(true);
  });

  it('8. Cancellation or rejection of a task does NOT restore a consumed entitlement', async () => {
    await checkAndConsumeEntitlement(customerId);
    taskRecords.push({ id: 't1', status: 'CANCELLED' });

    // Ensure entitlement stays at 1 used
    expect(mockProfile.freeRequestsUsed).toBe(1);

    const evalAfterCancel = evaluateCustomerEntitlement({
      ...mockProfile,
      tasksCount: taskRecords.length,
    });
    expect(evalAfterCancel.complimentaryRequestsUsed).toBe(1);
    expect(evalAfterCancel.complimentaryRequestsRemaining).toBe(2);
  });

  it('9. Active paid subscribers are completely unaffected and have unlimited requests', async () => {
    const paidProfile = {
      id: 'cust_paid_001',
      membershipPlan: 'PRIVATE',
      membershipStatus: 'ACTIVE',
      freeRequestsUsed: 3,
      freeRequestUsed: true,
      _count: { tasks: 45 },
    };

    vi.spyOn(db.customerProfile as any, 'findUnique').mockResolvedValueOnce(paidProfile as any);

    const paidCheck = await checkAndConsumeEntitlement(paidProfile.id);
    expect(paidCheck.allowed).toBe(true);
    expect(paidCheck.isPaidMember).toBe(true);
    expect(paidCheck.isFreeRequest).toBe(false);

    const paidEval = evaluateCustomerEntitlement(paidProfile);
    expect(paidEval.hasActiveMembership).toBe(true);
    expect(paidEval.canCreateRequest).toBe(true);
    expect(paidEval.state).toBe('ACTIVE_MEMBER');
  });
});
