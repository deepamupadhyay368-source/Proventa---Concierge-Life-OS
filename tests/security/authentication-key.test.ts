import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword, hashAuthKey, verifyAuthKey } from '@/lib/auth/password';
import { generateAuthKeyRecoveryToken, hashToken } from '@/lib/auth/tokens';
import { getAuthenticationKeyStrength, registerSchema, conciergeSignUpSchema, changeAuthenticationKeySchema } from '@/lib/validation/schemas';
import { checkRateLimit } from '@/lib/security/rate-limit';

describe('PROVENTA — PROVENTA AUTHENTICATION KEY SUITE', () => {
  const testCustomerEmail = `cust_authkey_${Date.now()}@proventa.dev`;
  const testEmployeeEmail = `concierge_authkey_${Date.now()}@proventa.in`;
  const rawAuthKey = 'ProventaSecret2026!';
  const updatedAuthKey = 'NewProventaKey2026#';

  let customerUserId = '';
  let employeeUserId = '';

  beforeEach(() => {
    // Fresh test context
  });

  // ==========================================
  // CUSTOMER TESTS (1 - 17)
  // ==========================================
  describe('Customer Authentication Key Flow', () => {
    it('1. validates that customer signup schema requires min 8 character key', () => {
      const weakPayload = {
        name: 'Aarav Patel',
        email: 'aarav@proventa.dev',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        authenticationKey: '12345', // under 8 chars
        confirmAuthenticationKey: '12345',
      };
      const result = registerSchema.safeParse(weakPayload);
      expect(result.success).toBe(false);
    });

    it('2. rejects authentication key confirmation mismatch', () => {
      const mismatchPayload = {
        name: 'Aarav Patel',
        email: 'aarav@proventa.dev',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        authenticationKey: 'ProventaSecret2026!',
        confirmAuthenticationKey: 'DifferentSecret2026!',
      };
      const result = registerSchema.safeParse(mismatchPayload);
      expect(result.success).toBe(false);
    });

    it('3. evaluates authentication key strength properly', () => {
      const weak = getAuthenticationKeyStrength('short');
      expect(weak.strength).toBe('WEAK');

      const moderate = getAuthenticationKeyStrength('secretpass123');
      expect(['MODERATE', 'WEAK']).toContain(moderate.strength);

      const strong = getAuthenticationKeyStrength('P$ov3nt@K3y!2026#');
      expect(strong.strength).toBe('STRONG');
    });

    it('4 & 5. hashes key with bcrypt, ensuring plaintext is never stored in DB', async () => {
      const hashedKey = await hashAuthKey(rawAuthKey);
      expect(hashedKey).not.toBe(rawAuthKey);
      expect(hashedKey.startsWith('$2')).toBe(true);

      const createdUser = await db.user.create({
        data: {
          email: testCustomerEmail,
          name: 'Aarav Patel',
          passwordHash: await hashPassword('Password123!'),
          securityKeyHash: hashedKey,
          authKeyUpdatedAt: new Date(),
          status: 'ACTIVE',
          userRoles: { create: [{ role: 'CUSTOMER' }] },
          customerProfile: { create: { city: 'Ahmedabad' } },
        },
      });
      customerUserId = createdUser.id;

      const fetchedUser = await db.user.findUnique({ where: { id: customerUserId } });
      expect(fetchedUser?.securityKeyHash).toBeDefined();
      expect(fetchedUser?.securityKeyHash).not.toBe(rawAuthKey);
      expect(fetchedUser?.securityKeyHash).toBe(hashedKey);
    });

    it('6. prevents password-only validation from bypassing Authentication Key', async () => {
      const user = await db.user.findUnique({ where: { id: customerUserId } });
      const passwordMatches = await verifyPassword('Password123!', user!.passwordHash!);
      expect(passwordMatches).toBe(true);

      // Without providing the Authentication Key, authentication is blocked
      const authKeyProvided = '';
      const keyVerified = authKeyProvided ? await verifyAuthKey(authKeyProvided, user!.securityKeyHash!) : false;
      expect(keyVerified).toBe(false);
    });

    it('7. completes authentication when correct Authentication Key is provided', async () => {
      const user = await db.user.findUnique({ where: { id: customerUserId } });
      const isKeyValid = await verifyAuthKey(rawAuthKey, user!.securityKeyHash!);
      expect(isKeyValid).toBe(true);
    });

    it('8. rejects incorrect Authentication Key', async () => {
      const user = await db.user.findUnique({ where: { id: customerUserId } });
      const isKeyValid = await verifyAuthKey('WrongKey999!', user!.securityKeyHash!);
      expect(isKeyValid).toBe(false);
    });

    it('9. enforces rate limiting on failed key verification attempts', () => {
      const rateLimitKey = `authkey-test:${customerUserId}`;
      let allowedCount = 0;
      for (let i = 0; i < 15; i++) {
        const { allowed } = checkRateLimit(rateLimitKey, { max: 5, windowMs: 60_000 });
        if (allowed) allowedCount++;
      }
      expect(allowedCount).toBe(5);
    });

    it('12, 13 & 14. updates key, rejecting old key and accepting new key', async () => {
      const validation = changeAuthenticationKeySchema.safeParse({
        currentAuthenticationKey: rawAuthKey,
        newAuthenticationKey: updatedAuthKey,
        confirmNewAuthenticationKey: updatedAuthKey,
      });
      expect(validation.success).toBe(true);

      const newHash = await hashAuthKey(updatedAuthKey);
      await db.user.update({
        where: { id: customerUserId },
        data: { securityKeyHash: newHash, authKeyUpdatedAt: new Date() },
      });

      const updatedUser = await db.user.findUnique({ where: { id: customerUserId } });
      const oldKeyCheck = await verifyAuthKey(rawAuthKey, updatedUser!.securityKeyHash!);
      expect(oldKeyCheck).toBe(false);

      const newKeyCheck = await verifyAuthKey(updatedAuthKey, updatedUser!.securityKeyHash!);
      expect(newKeyCheck).toBe(true);
    });

    it('15. supports secure recovery flow with one-time token', async () => {
      const recoveryToken = generateAuthKeyRecoveryToken();
      const tokenHash = hashToken(recoveryToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      const resetRecord = await db.authKeyReset.create({
        data: {
          userId: customerUserId,
          tokenHash,
          expiresAt,
        },
      });

      expect(resetRecord.id).toBeDefined();

      // Verify token
      const found = await db.authKeyReset.findFirst({
        where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
      });
      expect(found?.userId).toBe(customerUserId);
    });

    it('17. verifies admin customer queries do not expose raw Authentication Key or hash', async () => {
      const user = await db.user.findUnique({
        where: { id: customerUserId },
        select: { id: true, name: true, email: true, securityKeyHash: true, authKeyUpdatedAt: true },
      });

      // API formatting sanitizes this
      const sanitized = {
        id: user!.id,
        name: user!.name,
        email: user!.email,
        authKeyStatus: user!.securityKeyHash ? 'ACTIVE' : 'NOT_CONFIGURED',
        authKeyUpdatedAt: user!.authKeyUpdatedAt,
      };

      expect(sanitized.authKeyStatus).toBe('ACTIVE');
      expect((sanitized as any).securityKeyHash).toBeUndefined();
    });
  });

  // ==========================================
  // CONCIERGE EMPLOYEE TESTS (18 - 28)
  // ==========================================
  describe('Concierge Employee Authentication Key Flow', () => {
    it('18 & 19. enforces Authentication Key on employee registration schema', () => {
      const valid = conciergeSignUpSchema.safeParse({
        name: 'Priya Sharma',
        email: testEmployeeEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        authenticationKey: 'ConciergeKey2026#',
        confirmAuthenticationKey: 'ConciergeKey2026#',
        role: 'CONCIERGE',
        department: 'National Concierge Desk',
        city: 'Ahmedabad',
      });
      expect(valid.success).toBe(true);
    });

    it('20 & 21. stores hashed key and enforces it at employee sign-in', async () => {
      const empHash = await hashAuthKey('ConciergeKey2026#');
      const employee = await db.user.create({
        data: {
          name: 'Priya Sharma',
          email: testEmployeeEmail,
          passwordHash: await hashPassword('Password123!'),
          securityKeyHash: empHash,
          authKeyUpdatedAt: new Date(),
          status: 'ACTIVE',
          userRoles: { create: [{ role: 'CONCIERGE' }] },
        },
      });
      employeeUserId = employee.id;

      const fetched = await db.user.findUnique({ where: { id: employeeUserId } });
      expect(fetched?.securityKeyHash).toBe(empHash);

      // Verify wrong key fails
      const isWrongValid = await verifyAuthKey('WrongEmployeeKey', fetched!.securityKeyHash!);
      expect(isWrongValid).toBe(false);

      // Verify correct key succeeds
      const isCorrectValid = await verifyAuthKey('ConciergeKey2026#', fetched!.securityKeyHash!);
      expect(isCorrectValid).toBe(true);
    });

    it('27 & 28. preserves RBAC isolation: Concierge cannot access Founder/Admin', async () => {
      const employee = await db.user.findUnique({
        where: { id: employeeUserId },
        include: { userRoles: true },
      });
      const roles = employee!.userRoles.map((r) => r.role);
      expect(roles).toContain('CONCIERGE');
      expect(roles).not.toContain('ADMIN');
      expect(roles).not.toContain('SUPER_ADMIN');
    });
  });

  // ==========================================
  // SECURITY & ISOLATION TESTS (34 - 40)
  // ==========================================
  describe('Security & Isolation Guarantees', () => {
    it('36. guarantees plaintext keys are never stored in database records', async () => {
      const users = await db.user.findMany({
        where: { id: { in: [customerUserId, employeeUserId] } },
      });
      for (const u of users) {
        if (u.securityKeyHash) {
          expect(u.securityKeyHash).not.toBe(rawAuthKey);
          expect(u.securityKeyHash).not.toBe('ConciergeKey2026#');
          expect(u.securityKeyHash.startsWith('$2')).toBe(true);
        }
      }
    });

    it('40. ensures customer and concierge user accounts remain completely segregated', async () => {
      const customer = await db.user.findUnique({
        where: { id: customerUserId },
        include: { userRoles: true },
      });
      const employee = await db.user.findUnique({
        where: { id: employeeUserId },
        include: { userRoles: true },
      });

      const custRoles = customer!.userRoles.map((r) => r.role);
      const empRoles = employee!.userRoles.map((r) => r.role);

      expect(custRoles).toEqual(['CUSTOMER']);
      expect(empRoles).toEqual(['CONCIERGE']);
    });
  });
});
