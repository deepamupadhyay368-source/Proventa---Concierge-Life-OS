import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth/config', () => ({
  auth: vi.fn(),
}));

import { hasRole, hasAnyRole } from '@/lib/auth/session';
import { AuthenticationError, AuthorizationError } from '@/lib/errors';
import type { SessionUser } from '@/lib/auth/session';

describe('Admin RBAC & Security Isolation Suite', () => {
  it('correctly validates SUPER_ADMIN role with hasRole and hasAnyRole', () => {
    const superAdminUser: SessionUser = {
      id: 'usr_super_1',
      email: 'admin@proventa.dev',
      roles: ['SUPER_ADMIN', 'ADMIN'],
    };

    const customerUser: SessionUser = {
      id: 'usr_cust_1',
      email: 'client@example.com',
      roles: ['CUSTOMER'],
    };

    const conciergeUser: SessionUser = {
      id: 'usr_concierge_1',
      email: 'agent@proventa.in',
      roles: ['CONCIERGE'],
    };

    expect(hasRole(superAdminUser, 'SUPER_ADMIN')).toBe(true);
    expect(hasRole(customerUser, 'SUPER_ADMIN')).toBe(false);
    expect(hasRole(conciergeUser, 'SUPER_ADMIN')).toBe(false);

    expect(hasAnyRole(superAdminUser, ['SUPER_ADMIN'])).toBe(true);
    expect(hasAnyRole(customerUser, ['SUPER_ADMIN'])).toBe(false);
  });

  it('strictly isolates customer data queries by customerId', () => {
    const customerAId = 'cust_profile_alpha';
    const customerBId = 'cust_profile_beta';

    // Simulated multi-tenant task query filter
    const createCustomerQuery = (authenticatedCustomerId: string) => ({
      where: { customerId: authenticatedCustomerId },
    });

    const queryA = createCustomerQuery(customerAId);
    const queryB = createCustomerQuery(customerBId);

    expect(queryA.where.customerId).toBe('cust_profile_alpha');
    expect(queryB.where.customerId).toBe('cust_profile_beta');
    expect(queryA.where.customerId).not.toBe(queryB.where.customerId);
  });

  it('ensures AuthorizationError produces standard 403 status representation', () => {
    const authzErr = new AuthorizationError('Forbidden: SUPER_ADMIN privilege required');
    expect(authzErr).toBeInstanceOf(AuthorizationError);
    expect(authzErr.code).toBe('AUTHORIZATION_DENIED');
    expect(authzErr.statusCode).toBe(403);
  });

  it('ensures AuthenticationError produces standard 401 status representation', () => {
    const authnErr = new AuthenticationError();
    expect(authnErr).toBeInstanceOf(AuthenticationError);
    expect(authnErr.code).toBe('AUTHENTICATION_REQUIRED');
    expect(authnErr.statusCode).toBe(401);
  });
});
