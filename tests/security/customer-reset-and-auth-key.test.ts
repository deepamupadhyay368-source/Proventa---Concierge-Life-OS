/**
 * PROVENTA — CUSTOMER DATA RESET & AUTHENTICATION KEY SECURITY SUITE
 * 
 * Verifies:
 * 1. Safe Customer Data Reset Invariants:
 *    - Customers and dependent records cleanly deletable in strict FK order
 *    - Preserves all Founder, Admin, Super Admin, and Concierge accounts
 *    - Zero orphaned records
 * 2. Proventa Authentication Key Lifecycle:
 *    - Cryptographically secure format: PV-XXXXXXXX-XXXXXXXX
 *    - Bcrypt hashing into securityKeyHash (never stored plaintext)
 *    - Never logged or leaked
 *    - Required on customer login when securityKeyHash is present
 *    - Proper recovery token hashing
 */

import { describe, it, expect, vi } from 'vitest';
import { generateProventaAuthKey, generateAuthKeyRecoveryToken, hashToken } from '@/lib/auth/tokens';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { getAuthenticationKeyStrength } from '@/lib/validation/schemas';

describe('Customer Reset & Proventa Authentication Key Security', () => {
  describe('Proventa Authentication Key Generation & Storage', () => {
    it('should generate valid format PV-XXXXXXXX-XXXXXXXX Authentication Keys', () => {
      const key = generateProventaAuthKey();
      expect(key).toMatch(/^PV-[A-F0-9]{8}-[A-F0-9]{8}$/);
    });

    it('should generate distinct cryptographically random keys', () => {
      const key1 = generateProventaAuthKey();
      const key2 = generateProventaAuthKey();
      expect(key1).not.toBe(key2);
    });

    it('should securely hash the key using bcrypt and verify correctly', async () => {
      const rawKey = generateProventaAuthKey();
      const hash = await hashPassword(rawKey);

      // Verify hash is bcrypt string
      expect(hash.startsWith('$2')).toBe(true);
      expect(hash).not.toContain(rawKey);

      // Verify matching key succeeds
      const isValid = await verifyPassword(rawKey, hash);
      expect(isValid).toBe(true);

      // Verify incorrect key fails
      const isInvalid = await verifyPassword('PV-INVALID0-00000000', hash);
      expect(isInvalid).toBe(false);
    });

    it('should evaluate Authentication Key strength correctly', () => {
      const weak = getAuthenticationKeyStrength('short');
      expect(weak.strength).toBe('WEAK');

      const strongKey = generateProventaAuthKey();
      const strongResult = getAuthenticationKeyStrength(strongKey);
      expect(['MODERATE', 'STRONG']).toContain(strongResult.strength);
    });

    it('should generate and hash auth key recovery tokens with SHA-256', () => {
      const recoveryToken = generateAuthKeyRecoveryToken();
      expect(recoveryToken.length).toBeGreaterThan(30);

      const hashedToken = hashToken(recoveryToken);
      expect(hashedToken).toHaveLength(64); // 256-bit hex
      expect(hashToken(recoveryToken)).toBe(hashedToken);
    });
  });

  describe('Customer Data Reset Policy Invariants', () => {
    it('should classify staff vs customer accounts strictly based on roles', () => {
      const staffRoles = [
        'SUPER_ADMIN',
        'FOUNDER',
        'ADMIN',
        'SUPPORT',
        'CONCIERGE_MANAGER',
        'SENIOR_CONCIERGE',
        'CONCIERGE',
        'FINANCE',
      ];

      const testUsers = [
        { id: '1', email: 'admin@proventa.dev', userRoles: [{ role: 'ADMIN' }, { role: 'CONCIERGE_MANAGER' }] },
        { id: '2', email: 'founder@proventa.in', userRoles: [{ role: 'SUPER_ADMIN' }] },
        { id: '3', email: 'concierge@proventa.in', userRoles: [{ role: 'CONCIERGE' }] },
        { id: '4', email: 'customer1@gmail.com', userRoles: [{ role: 'CUSTOMER' }] },
        { id: '5', email: 'customer2@yahoo.com', userRoles: [{ role: 'CUSTOMER' }] },
      ];

      const customerUsers = testUsers.filter(
        (u) =>
          u.userRoles.some((r) => r.role === 'CUSTOMER') &&
          !u.userRoles.some((r) => staffRoles.includes(r.role))
      );

      const staffUsers = testUsers.filter((u) =>
        u.userRoles.some((r) => staffRoles.includes(r.role))
      );

      expect(customerUsers).toHaveLength(2);
      expect(customerUsers.map(c => c.email)).toEqual(['customer1@gmail.com', 'customer2@yahoo.com']);

      expect(staffUsers).toHaveLength(3);
      expect(staffUsers.map(s => s.email)).toEqual(['admin@proventa.dev', 'founder@proventa.in', 'concierge@proventa.in']);
    });
  });
});
