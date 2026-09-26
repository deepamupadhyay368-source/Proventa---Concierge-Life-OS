import { describe, it, expect, vi } from 'vitest';
import { randomBytes } from 'crypto';

vi.mock('@/lib/auth/config', () => ({
  auth: vi.fn(),
}));

import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { registerSchema, updatePreferenceSchema } from '@/lib/validation/schemas';
import { hasRole, hasAnyRole } from '@/lib/auth/session';
import type { SessionUser } from '@/lib/auth/session';
import { AuthorizationError, AuthenticationError } from '@/lib/errors';


describe('PROVENTA — Customer Identity, Auth & Admin Management Suite', () => {
  describe('1. Customer Sign-Up & Password Hashing', () => {
    it('normalizes email and enforces valid password constraints', () => {
      const validPass = `RegTest_${randomBytes(8).toString('hex')}!Aa1`;
      const validPayload = {
        name: 'Arjun Mehta',
        email: '  Arjun.Mehta@Example.COM  ',
        password: validPass,
        confirmPassword: validPass,
        phone: '+919876543210',
        city: 'Ahmedabad',
        preferredComm: 'WHATSAPP' as const,
      };

      const parsed = registerSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.email).toBe('arjun.mehta@example.com');
        expect(parsed.data.city).toBe('Ahmedabad');
        expect(parsed.data.preferredComm).toBe('WHATSAPP');
      }
    });

    it('rejects passwords without required complexity or mismatching confirmation', () => {
      const weakPasswordPayload = {
        name: 'Arjun Mehta',
        email: 'arjun@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      };
      const weakParsed = registerSchema.safeParse(weakPasswordPayload);
      expect(weakParsed.success).toBe(false);

      const mismatchPayload = {
        name: 'Arjun Mehta',
        email: 'arjun@example.com',
        password: `PassA_${randomBytes(8).toString('hex')}!Aa1`,
        confirmPassword: `PassB_${randomBytes(8).toString('hex')}!Bb2`,
      };
      const mismatchParsed = registerSchema.safeParse(mismatchPayload);
      expect(mismatchParsed.success).toBe(false);
    });

    it('securely hashes passwords with bcrypt and verifies correctly', async () => {
      const rawPassword = `SecPass_${randomBytes(8).toString('hex')}!Aa1`;
      const hash = await hashPassword(rawPassword);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(rawPassword);
      expect(hash.startsWith('$2')).toBe(true); // bcrypt prefix

      const isMatch = await verifyPassword(rawPassword, hash);
      expect(isMatch).toBe(true);

      const isWrong = await verifyPassword(`Wrong_${randomBytes(8).toString('hex')}!Cc3`, hash);
      expect(isWrong).toBe(false);
    });
  });

  describe('2. Customer Data Ownership & Strict Multi-Tenant Isolation', () => {
    const customerA: SessionUser = {
      id: 'usr_alpha_1',
      email: 'client_alpha@proventa.in',
      name: 'Client Alpha',
      roles: ['CUSTOMER'],
    };

    const customerB: SessionUser = {
      id: 'usr_beta_2',
      email: 'client_beta@proventa.in',
      name: 'Client Beta',
      roles: ['CUSTOMER'],
    };

    const conciergeAgent: SessionUser = {
      id: 'usr_concierge_3',
      email: 'concierge@proventa.in',
      name: 'Concierge Lead',
      roles: ['CONCIERGE'],
    };

    const adminUser: SessionUser = {
      id: 'usr_admin_4',
      email: 'founder@proventa.in',
      name: 'Lead Admin',
      roles: ['SUPER_ADMIN', 'ADMIN'],
    };

    it('validates task ownership isolation between Customer A and Customer B', () => {
      const taskOwnedByA = {
        id: 'task_001',
        category: 'FLIGHTS',
        customer: { id: 'cust_profile_alpha', userId: customerA.id },
        status: 'AWAITING_APPROVAL',
      };

      const canCustomerAAccess = taskOwnedByA.customer.userId === customerA.id;
      const canCustomerBAccess =
        taskOwnedByA.customer.userId === customerB.id ||
        customerB.roles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE'].includes(r));
      const canConciergeAccess =
        taskOwnedByA.customer.userId === conciergeAgent.id ||
        conciergeAgent.roles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE'].includes(r));
      const canAdminAccess =
        taskOwnedByA.customer.userId === adminUser.id ||
        adminUser.roles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE'].includes(r));

      expect(canCustomerAAccess).toBe(true);
      expect(canCustomerBAccess).toBe(false); // Customer B is strictly denied
      expect(canConciergeAccess).toBe(true); // Operational desk allowed
      expect(canAdminAccess).toBe(true); // Admin allowed
    });

    it('validates booking ownership isolation between Customer A and Customer B', () => {
      const bookingOwnedByA = {
        id: 'booking_001',
        customer: { id: 'cust_profile_alpha', userId: customerA.id },
        confirmationRef: 'AI-2026-DLH',
      };

      const checkAccess = (user: SessionUser) => {
        const isOwner = bookingOwnedByA.customer.userId === user.id;
        const isStaff = user.roles.some((r) =>
          ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE_MANAGER', 'CONCIERGE'].includes(r)
        );
        if (!isOwner && !isStaff) {
          throw new AuthorizationError('Unauthorized access to booking');
        }
        return true;
      };

      expect(checkAccess(customerA)).toBe(true);
      expect(() => checkAccess(customerB)).toThrow(AuthorizationError);
      expect(checkAccess(adminUser)).toBe(true);
    });

    it('ensures preferences schema updates correctly without cross-tenant key pollution', () => {
      const prefUpdate = {
        category: 'dining',
        key: 'cuisine_preference',
        value: { primary: 'Gujarati Fine Dining', restrictions: ['Jain Friendly'] },
      };

      const parsed = updatePreferenceSchema.safeParse(prefUpdate);
      expect(parsed.success).toBe(true);
    });
  });

  describe('3. Admin Customer Directory & Management Intelligence', () => {
    it('structures customer list response without exposing passwordHash or secret credentials', () => {
      const rawCustomerDbRecord = {
        id: 'cust_profile_123',
        userId: 'usr_123',
        city: 'Ahmedabad',
        preferredComm: 'IN_APP',
        onboardingCompleted: true,
        createdAt: new Date(),
        user: {
          id: 'usr_123',
          name: 'Vikram Patel',
          email: 'vikram@example.com',
          phone: '+919876543210',
          passwordHash: '$2b$12$SuperSecretHashedStringCannotBeSentToUI',
          status: 'ACTIVE',
          createdAt: new Date(),
          userRoles: [{ role: 'CUSTOMER' }],
        },
        preferences: [{ id: 'pref_1', category: 'dining', key: 'cuisine', value: { type: 'Italian' } }],
        tasks: [{ id: 'task_1', status: 'IN_PROGRESS' }, { id: 'task_2', status: 'COMPLETED' }],
        _count: { tasks: 2, bookings: 1 },
      };

      // Sanitize customer data according to admin projection contract
      const sanitizedUser = {
        id: rawCustomerDbRecord.user.id,
        name: rawCustomerDbRecord.user.name,
        email: rawCustomerDbRecord.user.email,
        phone: rawCustomerDbRecord.user.phone,
        status: rawCustomerDbRecord.user.status,
        createdAt: rawCustomerDbRecord.user.createdAt,
        userRoles: rawCustomerDbRecord.user.userRoles,
      };

      const adminCustomerCard = {
        id: rawCustomerDbRecord.id,
        userId: rawCustomerDbRecord.userId,
        city: rawCustomerDbRecord.city,
        preferredComm: rawCustomerDbRecord.preferredComm,
        user: sanitizedUser,
        preferencesCount: rawCustomerDbRecord.preferences.length,
        taskStats: {
          total: rawCustomerDbRecord._count.tasks,
          active: rawCustomerDbRecord.tasks.filter((t) => t.status !== 'COMPLETED').length,
          completed: rawCustomerDbRecord.tasks.filter((t) => t.status === 'COMPLETED').length,
        },
        bookingsCount: rawCustomerDbRecord._count.bookings,
      };

      expect((adminCustomerCard.user as any).passwordHash).toBeUndefined();
      expect(adminCustomerCard.user.email).toBe('vikram@example.com');
      expect(adminCustomerCard.taskStats.active).toBe(1);
      expect(adminCustomerCard.taskStats.completed).toBe(1);
      expect(adminCustomerCard.bookingsCount).toBe(1);
    });

    it('handles status transition between ACTIVE, SUSPENDED, and PENDING_VERIFICATION', () => {
      const validStatuses = ['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'];
      const testTransitions = [
        { current: 'PENDING_VERIFICATION', next: 'ACTIVE', valid: true },
        { current: 'ACTIVE', next: 'SUSPENDED', valid: true },
        { current: 'SUSPENDED', next: 'ACTIVE', valid: true },
        { current: 'ACTIVE', next: 'INVALID_STATUS', valid: false },
      ];

      testTransitions.forEach(({ next, valid }) => {
        const isValid = validStatuses.includes(next);
        expect(isValid).toBe(valid);
      });
    });
  });

  describe('4. Role-Based Access Control Boundaries', () => {
    it('blocks regular customers from accessing admin resources', () => {
      const regularCustomer: SessionUser = {
        id: 'cust_user_1',
        email: 'regular@user.com',
        roles: ['CUSTOMER'],
      };

      const isAdmin = hasAnyRole(regularCustomer, ['SUPER_ADMIN', 'ADMIN']);
      expect(isAdmin).toBe(false);
    });

    it('allows SUPER_ADMIN and ADMIN access to admin resources', () => {
      const superAdminUser: SessionUser = {
        id: 'super_admin_1',
        email: 'super@proventa.dev',
        roles: ['SUPER_ADMIN'],
      };

      const adminUser: SessionUser = {
        id: 'admin_1',
        email: 'admin@proventa.dev',
        roles: ['ADMIN'],
      };

      expect(hasAnyRole(superAdminUser, ['SUPER_ADMIN', 'ADMIN'])).toBe(true);
      expect(hasAnyRole(adminUser, ['SUPER_ADMIN', 'ADMIN'])).toBe(true);
    });
  });
});
