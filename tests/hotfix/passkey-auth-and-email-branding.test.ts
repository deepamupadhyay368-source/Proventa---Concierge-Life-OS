import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@/lib/validation/schemas';
import { generateProventaAuthKey } from '@/lib/auth/tokens';
import {
  format12DigitPassKey,
  normalizePassKey,
  verifyAccessKey,
  checkPassKeyRateLimit,
  resetPassKeyRateLimit,
  generateRandom12Digits,
} from '@/lib/auth/access-key';

describe('PROVENTA Production Hotfix — Passkey Authentication & Email Branding Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. loginSchema Validation with passKey Field', () => {
    it('successfully parses { email, passKey }', () => {
      const parsed = loginSchema.safeParse({
        email: 'test@proventa.in',
        passKey: '8492-3810-5729',
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.passKey).toBe('8492-3810-5729');
        expect(parsed.data.email).toBe('test@proventa.in');
      }
    });

    it('successfully parses raw digits { email, passKey }', () => {
      const parsed = loginSchema.safeParse({
        email: 'test@proventa.in',
        passKey: '849238105729',
      });
      expect(parsed.success).toBe(true);
    });

    it('successfully parses legacy fields { email, accessKey } or { email, securityKey }', () => {
      const parsedAccess = loginSchema.safeParse({
        email: 'test@proventa.in',
        accessKey: '8492-3810-5729',
      });
      expect(parsedAccess.success).toBe(true);

      const parsedSec = loginSchema.safeParse({
        email: 'test@proventa.in',
        securityKey: '8492-3810-5729',
      });
      expect(parsedSec.success).toBe(true);
    });

    it('rejects payload when no password, passKey, or accessKey is provided', () => {
      const parsed = loginSchema.safeParse({
        email: 'test@proventa.in',
      });
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0].message).toContain('Password or PROVENTA Access Key is required');
      }
    });
  });

  describe('2. 12-Digit Numeric Pass Key Generation & Hashing', () => {
    it('generates a 12-digit numeric passkey formatted as XXXX-XXXX-XXXX', () => {
      const digits = generateRandom12Digits();
      const key = format12DigitPassKey(digits);
      expect(key).toMatch(/^\d{4}-\d{4}-\d{4}$/);
      expect(digits).toHaveLength(12);
      expect(/^\d{12}$/.test(digits)).toBe(true);
    });

    it('generates legacy authentication key in PV-XXXXXXXX-XXXXXXXX format', () => {
      const legacyKey = generateProventaAuthKey();
      expect(legacyKey).toMatch(/^PV-[A-F0-9]{8}-[A-F0-9]{8}$/);
    });

    it('verifies passkey against salted bcrypt hash with various user inputs', async () => {
      const rawDigits = '849238105729';
      const formatted = format12DigitPassKey(rawDigits);
      const saltRounds = 12;
      const hash = await bcrypt.hash(rawDigits, saltRounds);

      // Verify formatted input XXXX-XXXX-XXXX
      const validFormatted = await verifyAccessKey(formatted, hash);
      expect(validFormatted).toBe(true);

      // Verify raw digits
      const validRaw = await verifyAccessKey(rawDigits, hash);
      expect(validRaw).toBe(true);

      // Verify with whitespace
      const validSpaced = await verifyAccessKey(' 8492 3810 5729 ', hash);
      expect(validSpaced).toBe(true);

      // Reject incorrect passkey
      const invalid = await verifyAccessKey('849238105720', hash);
      expect(invalid).toBe(false);
    });

    it('enforces rate limiting on passkey authentication', () => {
      const email = 'rate-limit-test@proventa.in';
      resetPassKeyRateLimit(`passkey:${email}`);

      for (let i = 1; i <= 5; i++) {
        const attempt = checkPassKeyRateLimit(`passkey:${email}`);
        expect(attempt.allowed).toBe(true);
      }

      // 6th attempt must be blocked
      const blockedAttempt = checkPassKeyRateLimit(`passkey:${email}`);
      expect(blockedAttempt.allowed).toBe(false);

      // After reset, allowed again
      resetPassKeyRateLimit(`passkey:${email}`);
      const freshAttempt = checkPassKeyRateLimit(`passkey:${email}`);
      expect(freshAttempt.allowed).toBe(true);
    });
  });

  describe('3. Email Template Branding & Security Posture', () => {
    it('verifies that no transactional email contains legacy Financial Intelligence branding', async () => {
      const fs = await import('fs');
      const senderCode = fs.readFileSync('src/lib/email/sender.ts', 'utf8');
      const completeRegCode = fs.readFileSync('src/app/api/auth/complete-registration/route.ts', 'utf8');

      expect(senderCode).not.toContain('Financial Intelligence');
      expect(completeRegCode).not.toContain('Financial Intelligence');
      expect(senderCode).toContain('Industrial Procurement Platform');
      expect(completeRegCode).toContain('Industrial Procurement Platform');
    });

    it('confirms the pass key is NEVER emailed to the user in complete-registration', async () => {
      const fs = await import('fs');
      const completeRegCode = fs.readFileSync('src/app/api/auth/complete-registration/route.ts', 'utf8');

      // Check comment and implementation
      expect(completeRegCode).toContain('NEVER email the pass key');
      expect(completeRegCode).toContain('never transmitted over email or accessible to PROVENTA staff');
      expect(completeRegCode).not.toMatch(/html:[\s\S]*?\${passKey}/);
      expect(completeRegCode).not.toMatch(/html:[\s\S]*?\${authKey}/);
    });
  });
});
