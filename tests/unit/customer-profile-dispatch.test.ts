import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
      create: vi.fn(),
    },
    customerProfile: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
import {
  ensureCustomerProfileForAuthenticatedUser,
  getOrCreateCustomerProfile,
  evaluateCustomerEntitlement,
  checkAndConsumeEntitlement,
} from '@/lib/membership/entitlement';
import { AuthenticationError } from '@/lib/errors';

describe('PROVENTA — Customer Profile & Request Dispatch Integrity Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Invariant Tests: ensureCustomerProfileForAuthenticatedUser (Scenarios A through K)', () => {
    // Scenario A: Existing User + existing CustomerProfile -> profile reused
    it('A. Existing User + existing CustomerProfile -> profile reused without DB write', async () => {
      const mockUser = {
        id: 'user_a',
        email: 'user_a@proventa.in',
        status: 'ACTIVE',
        deletedAt: null,
        userRoles: [{ role: 'CUSTOMER' }],
        customerProfile: {
          id: 'profile_a',
          userId: 'user_a',
          membershipStatus: 'ACTIVE',
        },
      };

      (db.user.findUnique as any).mockResolvedValueOnce(mockUser);

      const result = await ensureCustomerProfileForAuthenticatedUser({
        id: 'user_a',
        email: 'user_a@proventa.in',
      });

      expect(result.id).toBe('profile_a');
      expect(result.userId).toBe('user_a');
      expect(db.customerProfile.create).not.toHaveBeenCalled();
    });

    // Scenario B: Existing User + missing CustomerProfile -> profile created
    it('B. Existing User + missing CustomerProfile -> profile created with verified User.id', async () => {
      const mockUser = {
        id: 'user_b',
        email: 'user_b@proventa.in',
        status: 'ACTIVE',
        deletedAt: null,
        userRoles: [{ role: 'CUSTOMER' }],
        customerProfile: null,
      };

      (db.user.findUnique as any).mockResolvedValueOnce(mockUser);
      (db.customerProfile.findUnique as any).mockResolvedValueOnce(null);
      (db.customerProfile.create as any).mockResolvedValueOnce({
        id: 'profile_b',
        userId: 'user_b',
        city: 'Ahmedabad',
        membershipPlan: 'SELECT',
        membershipStatus: 'PENDING',
        freeRequestUsed: false,
      });

      const result = await ensureCustomerProfileForAuthenticatedUser({
        id: 'user_b',
        email: 'user_b@proventa.in',
      });

      expect(result.id).toBe('profile_b');
      expect(result.userId).toBe('user_b');
      expect(db.customerProfile.create).toHaveBeenCalledWith({
        data: {
          userId: 'user_b',
          city: 'Ahmedabad',
          membershipPlan: 'SELECT',
          membershipStatus: 'PENDING',
          freeRequestsUsed: 0,
          freeRequestUsed: false,
        },
      });
    });

    // Scenario C: Nonexistent User ID -> controlled failure, NO CustomerProfile create
    it('C. Nonexistent User ID -> controlled AuthenticationError, NO CustomerProfile create', async () => {
      (db.user.findUnique as any).mockResolvedValue(null);

      await expect(
        ensureCustomerProfileForAuthenticatedUser({
          id: 'user_nonexistent_999',
          email: 'ghost@proventa.in',
        })
      ).rejects.toThrow(AuthenticationError);

      expect(db.customerProfile.create).not.toHaveBeenCalled();
    });

    // Scenario D: Stale session pointing to deleted User -> controlled 401/session-expired behavior
    it('D. Stale session pointing to deleted User -> throws AuthenticationError', async () => {
      (db.user.findUnique as any).mockResolvedValueOnce({
        id: 'user_deleted_1',
        email: 'deleted@proventa.in',
        status: 'ACTIVE',
        deletedAt: new Date(), // Soft deleted
        userRoles: [{ role: 'CUSTOMER' }],
      });

      await expect(
        ensureCustomerProfileForAuthenticatedUser({
          id: 'user_deleted_1',
          email: 'deleted@proventa.in',
        })
      ).rejects.toThrow(AuthenticationError);

      expect(db.customerProfile.create).not.toHaveBeenCalled();
    });

    // Scenario E: Suspended User -> controlled rejection
    it('E. Suspended User -> controlled rejection with AuthenticationError', async () => {
      (db.user.findUnique as any).mockResolvedValueOnce({
        id: 'user_suspended',
        email: 'suspended@proventa.in',
        status: 'SUSPENDED',
        deletedAt: null,
        userRoles: [{ role: 'CUSTOMER' }],
      });

      await expect(
        ensureCustomerProfileForAuthenticatedUser({
          id: 'user_suspended',
          email: 'suspended@proventa.in',
        })
      ).rejects.toThrow(AuthenticationError);

      expect(db.customerProfile.create).not.toHaveBeenCalled();
    });

    // Scenario F: Duplicate request/profile creation race -> no duplicate CustomerProfile
    it('F. Duplicate request race -> catches conflict and returns newly created profile', async () => {
      const mockUser = {
        id: 'user_race',
        email: 'race@proventa.in',
        status: 'ACTIVE',
        deletedAt: null,
        userRoles: [{ role: 'CUSTOMER' }],
        customerProfile: null,
      };

      (db.user.findUnique as any).mockResolvedValueOnce(mockUser);
      (db.customerProfile.findUnique as any)
        .mockResolvedValueOnce(null) // first check
        .mockResolvedValueOnce({
          id: 'profile_race_recovered',
          userId: 'user_race',
        }); // race recovery check

      const err: any = new Error('Unique constraint failed on the fields: (`userId`)');
      err.code = 'P2002';
      (db.customerProfile.create as any).mockRejectedValueOnce(err);

      const result = await ensureCustomerProfileForAuthenticatedUser({
        id: 'user_race',
        email: 'race@proventa.in',
      });

      expect(result.id).toBe('profile_race_recovered');
      expect(result.userId).toBe('user_race');
    });

    // Scenario G: User created during signup -> profile correctly references committed User
    it('G. User created during signup -> profile correctly references committed User.id', async () => {
      const committedUser = {
        id: 'user_committed_signup',
        email: 'signup@proventa.in',
        status: 'ACTIVE',
        deletedAt: null,
        userRoles: [{ role: 'CUSTOMER' }],
        customerProfile: null,
      };

      (db.user.findUnique as any).mockResolvedValueOnce(committedUser);
      (db.customerProfile.findUnique as any).mockResolvedValueOnce(null);
      (db.customerProfile.create as any).mockResolvedValueOnce({
        id: 'profile_signup_1',
        userId: 'user_committed_signup',
      });

      const profile = await ensureCustomerProfileForAuthenticatedUser({
        id: committedUser.id,
        email: committedUser.email,
      });

      expect(profile.userId).toBe(committedUser.id);
    });

    // Scenario H: Customer submits request immediately after login -> profile resolution succeeds
    it('H. Customer submits request immediately after login -> profile resolution succeeds', async () => {
      const loggedInUser = {
        id: 'user_login_immediate',
        email: 'immediate@proventa.in',
        status: 'ACTIVE',
        deletedAt: null,
        userRoles: [{ role: 'CUSTOMER' }],
        customerProfile: {
          id: 'profile_immediate',
          userId: 'user_login_immediate',
          membershipStatus: 'PENDING',
        },
      };

      (db.user.findUnique as any).mockResolvedValueOnce(loggedInUser);

      const profile = await getOrCreateCustomerProfile({
        id: 'user_login_immediate',
        email: 'immediate@proventa.in',
      });

      expect(profile.id).toBe('profile_immediate');
      expect(profile.userId).toBe('user_login_immediate');
    });

    // Scenario I: Customer submits request from existing production session -> succeeds
    it('I. Customer submits request from existing production session -> succeeds with existing profile', async () => {
      const prodUser = {
        id: 'user_prod_session_123',
        email: 'vip@proventa.in',
        status: 'ACTIVE',
        deletedAt: null,
        userRoles: [{ role: 'CUSTOMER' }],
        customerProfile: {
          id: 'profile_prod_123',
          userId: 'user_prod_session_123',
          membershipStatus: 'ACTIVE',
          membershipPlan: 'PRIVATE',
        },
      };

      (db.user.findUnique as any).mockResolvedValueOnce(prodUser);

      const profile = await ensureCustomerProfileForAuthenticatedUser({
        id: 'user_prod_session_123',
        email: 'vip@proventa.in',
      });

      expect(profile.id).toBe('profile_prod_123');
      expect(profile.membershipPlan).toBe('PRIVATE');
    });

    // Scenario J: Admin / Concierge identities requesting profile resolution -> cleanly handled
    it('J. Admin/Concierge identity -> resolves canonical profile attached to Admin User', async () => {
      const adminUser = {
        id: 'user_admin_1',
        email: 'admin@proventa.dev',
        status: 'ACTIVE',
        deletedAt: null,
        userRoles: [{ role: 'ADMIN' }, { role: 'CONCIERGE_MANAGER' }],
        customerProfile: null,
      };

      (db.user.findUnique as any).mockResolvedValueOnce(adminUser);
      (db.customerProfile.findUnique as any).mockResolvedValueOnce(null);
      (db.customerProfile.create as any).mockResolvedValueOnce({
        id: 'profile_admin_1',
        userId: 'user_admin_1',
        membershipPlan: 'SELECT',
      });

      const profile = await ensureCustomerProfileForAuthenticatedUser({
        id: 'user_admin_1',
        email: 'admin@proventa.dev',
      });

      expect(profile.userId).toBe('user_admin_1');
    });

    // Scenario K: Cross-tenant / customer isolation -> preserved
    it('K. Cross-tenant isolation -> resolving for User A never returns User B profile', async () => {
      const userA = {
        id: 'user_tenant_a',
        email: 'tenant_a@proventa.in',
        status: 'ACTIVE',
        deletedAt: null,
        userRoles: [{ role: 'CUSTOMER' }],
        customerProfile: {
          id: 'profile_tenant_a',
          userId: 'user_tenant_a',
        },
      };

      (db.user.findUnique as any).mockResolvedValueOnce(userA);

      const profileA = await ensureCustomerProfileForAuthenticatedUser({
        id: 'user_tenant_a',
        email: 'tenant_a@proventa.in',
      });

      expect(profileA.userId).toBe('user_tenant_a');
      expect(profileA.id).toBe('profile_tenant_a');
      expect(profileA.userId).not.toBe('user_tenant_b');
    });
  });

  describe('2. Entitlement Evaluation & Free Request Flow', () => {
    it('evaluates active member as allowed with ACTIVE_MEMBER state', () => {
      const entitlement = evaluateCustomerEntitlement({
        membershipStatus: 'ACTIVE',
        membershipPlan: 'RESERVE',
        freeRequestUsed: true,
      });

      expect(entitlement.hasActiveMembership).toBe(true);
      expect(entitlement.canCreateRequest).toBe(true);
      expect(entitlement.freeRequestAvailable).toBe(false);
      expect(entitlement.state).toBe('ACTIVE_MEMBER');
    });

    it('evaluates new user without active membership as having free request available', () => {
      const entitlement = evaluateCustomerEntitlement({
        membershipStatus: 'PENDING',
        freeRequestUsed: false,
        tasksCount: 0,
      });

      expect(entitlement.hasActiveMembership).toBe(false);
      expect(entitlement.freeRequestAvailable).toBe(true);
      expect(entitlement.freeRequestUsed).toBe(false);
      expect(entitlement.canCreateRequest).toBe(true);
      expect(entitlement.state).toBe('FREE_REQUEST_AVAILABLE');
    });

    it('evaluates user with consumed free request as gated', () => {
      const entitlement = evaluateCustomerEntitlement({
        membershipStatus: 'PENDING',
        freeRequestsUsed: 3,
        freeRequestUsed: true,
      });

      expect(entitlement.hasActiveMembership).toBe(false);
      expect(entitlement.freeRequestAvailable).toBe(false);
      expect(entitlement.freeRequestUsed).toBe(true);
      expect(entitlement.canCreateRequest).toBe(false);
      expect(entitlement.state).toBe('FREE_REQUEST_USED');
    });

    it('consumes free request atomically on first request', async () => {
      (db.customerProfile.findUnique as any).mockResolvedValueOnce({
        id: 'cust_profile_1',
        membershipStatus: 'PENDING',
        freeRequestsUsed: 0,
        freeRequestUsed: false,
        _count: { tasks: 0 },
      });

      (db.customerProfile.updateMany as any).mockResolvedValueOnce({ count: 1 });

      const check = await checkAndConsumeEntitlement('cust_profile_1');

      expect(check.allowed).toBe(true);
      expect(check.isFreeRequest).toBe(true);
      expect(check.isPaidMember).toBe(false);
      expect(check.requestsRemaining).toBe(2);
      expect(db.customerProfile.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'cust_profile_1',
            freeRequestsUsed: { lt: 3 },
            OR: [{ membershipStatus: null }, { membershipStatus: { not: 'ACTIVE' } }],
          },
        })
      );
    });

    it('rejects dispatch when all 3 complimentary requests have already been used', async () => {
      (db.customerProfile.findUnique as any).mockResolvedValueOnce({
        id: 'cust_profile_2',
        membershipStatus: 'PENDING',
        freeRequestsUsed: 3,
        freeRequestUsed: true,
        _count: { tasks: 3 },
      });

      const check = await checkAndConsumeEntitlement('cust_profile_2');

      expect(check.allowed).toBe(false);
      expect(check.code).toBe('MEMBERSHIP_REQUIRED');
      expect(check.reason).toBe('COMPLIMENTARY_LIMIT_REACHED');
      expect(check.error).toContain('3 complimentary requests have already been used');
    });
  });
});

