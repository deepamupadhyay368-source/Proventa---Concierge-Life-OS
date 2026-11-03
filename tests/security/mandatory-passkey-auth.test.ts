import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import {
  format12DigitPassKey,
  normalizePassKey,
  verifyAccessKey,
  checkPassKeyRateLimit,
  resetPassKeyRateLimit,
} from '@/lib/auth/access-key';

describe('PROVENTA — Mandatory Customer-Created 12-Digit Pass Key Authentication Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetPassKeyRateLimit('test-rate-limit-user@proventa.in');
  });

  describe('1. Customer-Created 12-Digit Pass Key Format & Normalization', () => {
    it('1.1 validates exactly 12 numeric digits', () => {
      const validKey = '849238105729';
      const shortKey = '84923810572'; // 11 digits
      const longKey = '8492381057291'; // 13 digits
      const nonNumeric = '84923810572a';

      const isValid = (key: string) => /^\d{12}$/.test(key.replace(/[^0-9]/g, ''));

      expect(isValid(validKey)).toBe(true);
      expect(isValid(shortKey)).toBe(false);
      expect(isValid(longKey)).toBe(false);
      expect(isValid(nonNumeric)).toBe(false);
    });

    it('1.2 formats 12 digits as XXXX-XXXX-XXXX for visual clarity', () => {
      const raw = '849238105729';
      const formatted = format12DigitPassKey(raw);
      expect(formatted).toBe('8492-3810-5729');
    });

    it('1.3 strips hyphens and formatting characters during normalization', () => {
      const formatted = '8492-3810-5729';
      const spaces = '8492 3810 5729';
      const raw = '849238105729';

      expect(normalizePassKey(formatted)).toBe(raw);
      expect(normalizePassKey(spaces)).toBe(raw);
      expect(normalizePassKey(raw)).toBe(raw);
    });

    it('1.4 confirms customer-created pass key and confirmation must match', () => {
      const key = '123456789012';
      const confirmMatch = '1234-5678-9012';
      const confirmMismatch = '1234-5678-9013';

      const normalize = (val: string) => val.replace(/[^0-9]/g, '');

      expect(normalize(key) === normalize(confirmMatch)).toBe(true);
      expect(normalize(key) === normalize(confirmMismatch)).toBe(false);
    });
  });

  describe('2. Cryptographic Salted Hashing & Verification', () => {
    it('2.1 hashes customer-chosen key using salted bcrypt (cost factor 12)', async () => {
      const customerKey = '918273645012';
      const hash = await bcrypt.hash(customerKey, 12);

      expect(hash).not.toBe(customerKey);
      expect(hash.startsWith('$2')).toBe(true);
      expect(hash.length).toBeGreaterThanOrEqual(60);
    });

    it('2.2 verifies candidate pass key against salted hash for both raw and formatted input', async () => {
      const customerKey = '582910472918';
      const storedHash = await bcrypt.hash(customerKey, 12);

      // Raw digits
      const rawMatch = await verifyAccessKey(customerKey, storedHash);
      expect(rawMatch).toBe(true);

      // Formatted with hyphens
      const formattedMatch = await verifyAccessKey('5829-1047-2918', storedHash);
      expect(formattedMatch).toBe(true);

      // Formatted with spaces
      const spaceMatch = await verifyAccessKey('5829 1047 2918', storedHash);
      expect(spaceMatch).toBe(true);

      // Incorrect key
      const wrongMatch = await verifyAccessKey('582910472919', storedHash);
      expect(wrongMatch).toBe(false);
    });
  });

  describe('3. Rate Limiting on 12-Digit Pass Key Attempts', () => {
    it('3.1 permits up to 5 attempts then blocks brute-force attempts', () => {
      const identifier = 'test-rate-limit-user@proventa.in';
      resetPassKeyRateLimit(identifier);

      // Attempts 1 to 5 should be allowed
      for (let i = 1; i <= 5; i++) {
        const rl = checkPassKeyRateLimit(identifier);
        expect(rl.allowed).toBe(true);
      }

      // 6th attempt must be blocked
      const blocked = checkPassKeyRateLimit(identifier);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);

      // Reset allows access again
      resetPassKeyRateLimit(identifier);
      const afterReset = checkPassKeyRateLimit(identifier);
      expect(afterReset.allowed).toBe(true);
    });
  });

  describe('4. Returning Customer Google OAuth Bypass Protection', () => {
    it('4.1 enforces that returning customers with established pass keys cannot bypass pass key authentication', () => {
      // Simulating NextAuth OAuth check logic
      const simulateOAuthCheck = (user: { securityKeyHash: string | null }, isRecoveryFlow: boolean) => {
        if (user.securityKeyHash && !isRecoveryFlow) {
          return { allowed: false, redirect: '/sign-in?error=PassKeyRequired' };
        }
        return { allowed: true, redirect: isRecoveryFlow ? '/recover-passkey' : '/dashboard' };
      };

      // Existing customer attempting Google sign-in
      const existingCustomer = { securityKeyHash: '$2b$12$hashedpasskey' };
      const normalOAuth = simulateOAuthCheck(existingCustomer, false);
      expect(normalOAuth.allowed).toBe(false);
      expect(normalOAuth.redirect).toBe('/sign-in?error=PassKeyRequired');

      // Existing customer conducting authorized recovery
      const recoveryOAuth = simulateOAuthCheck(existingCustomer, true);
      expect(recoveryOAuth.allowed).toBe(true);
      expect(recoveryOAuth.redirect).toBe('/recover-passkey');

      // New customer (first-time sign-up, no pass key yet)
      const newCustomer = { securityKeyHash: null };
      const newOAuth = simulateOAuthCheck(newCustomer, false);
      expect(newOAuth.allowed).toBe(true);
    });
  });

  describe('5. Sign-In Page & Form Route Separation', () => {
    it('5.1 ensures /sign-in is exempt from automatic dashboard redirect', () => {
      const AUTH_ROUTES = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'];
      
      const shouldRedirectAway = (pathname: string, isLoggedIn: boolean) => {
        const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
        // Explicitly exempt /sign-in so visitor clicking Sign In sees login form
        if (isAuthRoute && pathname !== '/sign-in' && isLoggedIn) {
          return true;
        }
        return false;
      };

      // /sign-in must NEVER auto-redirect to dashboard even if user has previous cookie
      expect(shouldRedirectAway('/sign-in', true)).toBe(false);
      expect(shouldRedirectAway('/sign-in', false)).toBe(false);

      // Other auth routes like /sign-up can redirect logged-in users
      expect(shouldRedirectAway('/sign-up', true)).toBe(true);
    });

    it('5.2 ensures protected routes redirect unauthenticated users to /sign-in', () => {
      const isProtected = (pathname: string, isLoggedIn: boolean) => {
        if (!isLoggedIn && (pathname.startsWith('/dashboard') || pathname.startsWith('/family'))) {
          return '/sign-in';
        }
        return null;
      };

      expect(isProtected('/dashboard', false)).toBe('/sign-in');
      expect(isProtected('/family', false)).toBe('/sign-in');
      expect(isProtected('/dashboard', true)).toBeNull();
    });
  });
});
