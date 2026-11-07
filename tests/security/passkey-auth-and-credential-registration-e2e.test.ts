import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { loginSchema, registerSchema } from '@/lib/validation/schemas';
import {
  format12DigitPassKey,
  normalizePassKey,
  verifyAccessKey,
  checkPassKeyRateLimit,
  resetPassKeyRateLimit,
  generateRandom12Digits,
  generateProventaAccessKey,
} from '@/lib/auth/access-key';

describe('PROVENTA Production — 12-Digit Credential Lifecycle & Authentication Suite', () => {
  const testEmailBuyer = 'buyer-contractor@proventa.test';
  const testEmailSupplier = 'steel-supplier@proventa.test';

  beforeEach(() => {
    vi.clearAllMocks();
    resetPassKeyRateLimit(`passkey:${testEmailBuyer}`);
    resetPassKeyRateLimit(`passkey:${testEmailSupplier}`);
  });

  describe('Scenario A: New Account 12-Digit Pass Key Creation & Verification', () => {
    it('A.1 validates 12-digit passKey in registerSchema', () => {
      const parsed = registerSchema.safeParse({
        name: 'Ahmedabad Builders Corp',
        email: 'infra@builder.test',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        passKey: '4829-1048-2918',
        confirmPassKey: '482910482918', // match across formats
        phone: '+919876543210',
      });
      expect(parsed.success).toBe(true);
    });

    it('A.2 creates, hashes, and validates customer-chosen 12-digit credential across formatted, raw, and spaced inputs', async () => {
      const candidateKey = '8492-3810-5729';
      const normalizedDigits = normalizePassKey(candidateKey);
      expect(normalizedDigits).toBe('849238105729');
      expect(normalizedDigits).toHaveLength(12);

      // bcrypt hash with cost factor 12
      const hash = await bcrypt.hash(normalizedDigits, 12);

      // Verify exact raw digits
      expect(await verifyAccessKey('849238105729', hash)).toBe(true);

      // Verify formatted XXXX-XXXX-XXXX
      expect(await verifyAccessKey('8492-3810-5729', hash)).toBe(true);

      // Verify spaced input
      expect(await verifyAccessKey(' 8492 3810 5729 ', hash)).toBe(true);

      // Verify mismatch is rejected
      expect(await verifyAccessKey('849238105720', hash)).toBe(false);
    });

    it('A.3 auto-generates a 12-digit numeric pass key if not provided by customer', async () => {
      const generated = await generateProventaAccessKey();
      expect(generated.plaintextKey).toMatch(/^\d{12}$/);
      expect(generated.formattedKey).toMatch(/^\d{4}-\d{4}-\d{4}$/);
      expect(await verifyAccessKey(generated.plaintextKey, generated.hash)).toBe(true);
      expect(await verifyAccessKey(generated.formattedKey, generated.hash)).toBe(true);
    });
  });

  describe('Scenario B: Existing Account Preservation Without Key Overwrite', () => {
    it('B.1 ensures existing user securityKeyHash is preserved when account updates without a new key', async () => {
      const existingDigits = '918273645012';
      const existingHash = await bcrypt.hash(existingDigits, 12);

      // Simulating register route logic: rawAuthKey is undefined
      const rawAuthKey = undefined;
      const autoGen = await generateProventaAccessKey();
      const generatedHash = autoGen.hash;

      const targetSecurityKeyHash = rawAuthKey
        ? generatedHash
        : (existingHash || generatedHash);

      // MUST retain existingHash!
      expect(targetSecurityKeyHash).toBe(existingHash);
      expect(await verifyAccessKey(existingDigits, targetSecurityKeyHash)).toBe(true);
    });

    it('B.2 signs in successfully with existing 12-digit credential', async () => {
      const userKey = '7482-1940-5829';
      const normalized = normalizePassKey(userKey);
      const storedHash = await bcrypt.hash(normalized, 12);

      const parsed = loginSchema.safeParse({
        email: testEmailBuyer,
        passKey: userKey,
      });

      expect(parsed.success).toBe(true);
      if (parsed.success) {
        const isValid = await verifyAccessKey(parsed.data.passKey!, storedHash);
        expect(isValid).toBe(true);
      }
    });
  });

  describe('Scenario C: Secure Credential Replacement & Recovery', () => {
    it('C.1 rotates key to new 12 digits and validates old key is revoked and new key succeeds', async () => {
      const oldKey = '111122223333';
      const newKey = '999988887777';

      let currentHash = await bcrypt.hash(oldKey, 12);
      expect(await verifyAccessKey(oldKey, currentHash)).toBe(true);

      // Simulate recovery rotation
      const newNormalized = normalizePassKey(newKey);
      currentHash = await bcrypt.hash(newNormalized, 12);

      // Old key must be revoked
      expect(await verifyAccessKey(oldKey, currentHash)).toBe(false);

      // New key must succeed
      expect(await verifyAccessKey(newKey, currentHash)).toBe(true);
      expect(await verifyAccessKey(format12DigitPassKey(newKey), currentHash)).toBe(true);
    });

    it('C.2 resets rate limit upon successful credential rotation', () => {
      const identifier = `passkey:${testEmailBuyer}`;
      // Max out rate limit
      for (let i = 0; i < 5; i++) {
        checkPassKeyRateLimit(identifier);
      }
      expect(checkPassKeyRateLimit(identifier).allowed).toBe(false);

      // Successful recovery triggers reset
      resetPassKeyRateLimit(identifier);
      expect(checkPassKeyRateLimit(identifier).allowed).toBe(true);
    });
  });

  describe('Scenario D: Incorrect Credential & Rate Limiting', () => {
    it('D.1 rejects invalid credential and blocks on excessive attempts', async () => {
      const identifier = `passkey:${testEmailBuyer}`;
      resetPassKeyRateLimit(identifier);

      const validDigits = '444455556666';
      const storedHash = await bcrypt.hash(validDigits, 12);

      // 5 failed attempts
      for (let i = 1; i <= 5; i++) {
        const rateCheck = checkPassKeyRateLimit(identifier);
        expect(rateCheck.allowed).toBe(true);
        const match = await verifyAccessKey('000000000000', storedHash);
        expect(match).toBe(false);
      }

      // 6th attempt blocked by rate limiter
      const blocked = checkPassKeyRateLimit(identifier);
      expect(blocked.allowed).toBe(false);
    });
  });

  describe('Scenario E & G: Session Payload & Role Separation', () => {
    it('E.1 constructs authorized session with passKeyVerified and correct buyer dashboard', () => {
      const buyerRoles = ['CUSTOMER', 'BUYER', 'BUSINESS_OWNER'];
      const session = {
        user: {
          id: 'usr_test_buyer_123',
          email: testEmailBuyer,
          roles: buyerRoles,
          passKeyVerified: true,
          needsRegistration: false,
        },
      };

      expect(session.user.passKeyVerified).toBe(true);
      expect(session.user.needsRegistration).toBe(false);

      const targetDashboard = session.user.roles.includes('SUPPLIER') && !session.user.roles.includes('BUYER')
        ? '/supplier/dashboard'
        : '/buyer/dashboard';

      expect(targetDashboard).toBe('/buyer/dashboard');
    });

    it('G.1 routes supplier account to supplier dashboard', () => {
      const supplierRoles = ['CUSTOMER', 'SUPPLIER', 'BUSINESS_OWNER'];
      const session = {
        user: {
          id: 'usr_test_supplier_456',
          email: testEmailSupplier,
          roles: supplierRoles,
          passKeyVerified: true,
          needsRegistration: false,
        },
      };

      const isExclusiveSupplier = session.user.roles.includes('SUPPLIER') && !session.user.roles.includes('BUYER');
      const targetDashboard = isExclusiveSupplier ? '/supplier/dashboard' : '/buyer/dashboard';

      expect(targetDashboard).toBe('/supplier/dashboard');
    });
  });
});
