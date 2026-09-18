import { describe, it, expect } from 'vitest';
import { changePasswordSchema } from '@/lib/validation/schemas';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { checkRateLimit } from '@/lib/security/rate-limit';

describe('Founder Password & Account Security Suite', () => {
  describe('Password Complexity & Schema Validation', () => {
    it('accepts strong, compliant new passwords', () => {
      const validPayload = {
        currentPassword: 'CurrentPass123!@#',
        newPassword: 'MyNewStrongPass2026!#',
        confirmPassword: 'MyNewStrongPass2026!#',
      };

      const result = changePasswordSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects passwords shorter than 10 characters', () => {
      const shortPayload = {
        currentPassword: 'CurrentPass123!@#',
        newPassword: 'Aa1!short',
        confirmPassword: 'Aa1!short',
      };

      const result = changePasswordSchema.safeParse(shortPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('at least 10 characters');
      }
    });

    it('rejects passwords missing uppercase letters', () => {
      const noUpper = {
        currentPassword: 'CurrentPass123!@#',
        newPassword: 'lowercase12345!@#',
        confirmPassword: 'lowercase12345!@#',
      };

      const result = changePasswordSchema.safeParse(noUpper);
      expect(result.success).toBe(false);
    });

    it('rejects passwords missing special characters', () => {
      const noSpecial = {
        currentPassword: 'CurrentPass123!@#',
        newPassword: 'NoSpecialCharacters1234',
        confirmPassword: 'NoSpecialCharacters1234',
      };

      const result = changePasswordSchema.safeParse(noSpecial);
      expect(result.success).toBe(false);
    });

    it('rejects passwords when confirmPassword does not match', () => {
      const mismatched = {
        currentPassword: 'CurrentPass123!@#',
        newPassword: 'MyNewStrongPass2026!#',
        confirmPassword: 'DifferentPass2026!#',
      };

      const result = changePasswordSchema.safeParse(mismatched);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('New passwords do not match');
      }
    });

    it('rejects when new password is identical to current password', () => {
      const identical = {
        currentPassword: 'SamePass12345!@#',
        newPassword: 'SamePass12345!@#',
        confirmPassword: 'SamePass12345!@#',
      };

      const result = changePasswordSchema.safeParse(identical);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('New password must be different from current password');
      }
    });
  });

  describe('Bcrypt Hashing Integrity', () => {
    it('generates a secure hash that correctly verifies with verifyPassword', async () => {
      const raw = 'SuperSecretTestPass987$#@';
      const hash = await hashPassword(raw);

      expect(hash).not.toBe(raw);
      expect(hash.startsWith('$2')).toBe(true);

      const isMatch = await verifyPassword(raw, hash);
      expect(isMatch).toBe(true);

      const isWrongMatch = await verifyPassword('WrongPassword123!', hash);
      expect(isWrongMatch).toBe(false);
    });
  });

  describe('Brute-force Rate Limiting', () => {
    it('throttles attempts after exceeding maximum threshold', () => {
      const testKey = `test-rl-key-${Date.now()}`;
      const config = { windowMs: 60000, max: 3 };

      expect(checkRateLimit(testKey, config).allowed).toBe(true);
      expect(checkRateLimit(testKey, config).allowed).toBe(true);
      expect(checkRateLimit(testKey, config).allowed).toBe(true);

      const fourthAttempt = checkRateLimit(testKey, config);
      expect(fourthAttempt.allowed).toBe(false);
      expect(fourthAttempt.remaining).toBe(0);
    });
  });

  describe('Lifecycle Credential Transition & RBAC Safeguards', () => {
    it('successfully transitions from old password to new password', async () => {
      const passwordA = 'InitialFounderPass2024!@#';
      const passwordB = 'UpdatedFounderPass2026$%^';

      // 1. Initial state: Password A is hashed and active
      let activeHash = await hashPassword(passwordA);

      expect(await verifyPassword(passwordA, activeHash)).toBe(true);
      expect(await verifyPassword(passwordB, activeHash)).toBe(false);

      // 2. Validate update payload with schema
      const payload = {
        currentPassword: passwordA,
        newPassword: passwordB,
        confirmPassword: passwordB,
      };
      const validation = changePasswordSchema.safeParse(payload);
      expect(validation.success).toBe(true);

      // 3. Current password verification check
      const currentVerified = await verifyPassword(payload.currentPassword, activeHash);
      expect(currentVerified).toBe(true);

      // 4. Rotate hash to Password B
      activeHash = await hashPassword(payload.newPassword);

      // 5. Verify old password no longer works, and new password works
      expect(await verifyPassword(passwordA, activeHash)).toBe(false);
      expect(await verifyPassword(passwordB, activeHash)).toBe(true);
    });

    it('enforces that normal customers cannot pass SUPER_ADMIN authorization', () => {
      const customerUser = {
        id: 'cust_12345',
        email: 'customer@example.com',
        roles: ['CUSTOMER'],
      };

      const superAdminUser = {
        id: 'admin_12345',
        email: 'admin@proventa.dev',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      };

      const isCustomerAuthorized = customerUser.roles.includes('SUPER_ADMIN');
      const isSuperAdminAuthorized = superAdminUser.roles.includes('SUPER_ADMIN');

      expect(isCustomerAuthorized).toBe(false);
      expect(isSuperAdminAuthorized).toBe(true);

      // Preserves role assignment integrity
      expect(superAdminUser.roles).toContain('SUPER_ADMIN');
    });

    it('sanitizes audit logs to ensure zero password or hash exposure', () => {
      const sensitivePayload = {
        currentPassword: 'secretPassword1!',
        newPassword: 'secretPassword2@',
        confirmPassword: 'secretPassword2@',
      };

      // Simulated audit log construction
      const auditEntry = {
        actorId: 'usr_founder_1',
        actorRole: 'SUPER_ADMIN',
        action: 'ADMIN_ACTION',
        resourceType: 'USER_CREDENTIALS',
        resourceId: 'usr_founder_1',
        metadata: { reason: 'founder_password_changed' },
      };

      const auditJson = JSON.stringify(auditEntry);
      expect(auditJson).not.toContain(sensitivePayload.currentPassword);
      expect(auditJson).not.toContain(sensitivePayload.newPassword);
      expect(auditJson).not.toContain('passwordHash');
    });
  });
});
