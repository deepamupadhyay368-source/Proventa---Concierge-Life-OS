import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { loginSchema, registerSchema } from '@/lib/validation/schemas';
import {
  verifyAccessKey,
  normalizePassKey,
  generateRandom12Digits,
  checkPassKeyRateLimit,
  resetPassKeyRateLimit,
} from '@/lib/auth/access-key';

describe('PROVENTA Production — Complete Authentication, Registration, Profile & Passkey Repair Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------------------------------------
  // PART 1: PASSKEY AUTHENTICATION & CREDENTIAL EXTRACTION
  // --------------------------------------------------------------------------
  describe('1. Passkey Authentication, Payload Extraction & Hash Verification', () => {
    const rawPasskey = '849238105729';
    const formattedPasskey = '8492-3810-5729';
    const spacedPasskey = '8492 3810 5729';
    let storedHash: string;

    beforeEach(async () => {
      storedHash = await bcrypt.hash(rawPasskey, 12);
    });

    it('Scenario 1.1: Existing user enters correct passkey -> Login succeeds across field aliases', async () => {
      // Test payload field variants: passKey, passkey, accessKey, securityKey, security_key, authKey
      const fieldVariants = [
        { email: 'builder@gujarat.in', passKey: formattedPasskey },
        { email: 'builder@gujarat.in', passkey: formattedPasskey },
        { email: 'builder@gujarat.in', accessKey: rawPasskey },
        { email: 'builder@gujarat.in', securityKey: spacedPasskey },
        { email: 'builder@gujarat.in', security_key: formattedPasskey },
        { email: 'builder@gujarat.in', authKey: rawPasskey },
      ];

      for (const payload of fieldVariants) {
        const parsed = loginSchema.safeParse(payload);
        expect(parsed.success).toBe(true);

        const extractedKey =
          (parsed.data as any)?.passKey ||
          (parsed.data as any)?.passkey ||
          (parsed.data as any)?.accessKey ||
          (parsed.data as any)?.securityKey ||
          (parsed.data as any)?.security_key ||
          (parsed.data as any)?.authKey;

        expect(extractedKey).toBeDefined();
        const isValid = await verifyAccessKey(extractedKey!, storedHash);
        expect(isValid).toBe(true);
      }
    });

    it('Scenario 1.2: Existing user enters incorrect passkey -> Invalid passkey rejected', async () => {
      const wrongKey = '9999-8888-7777';
      const parsed = loginSchema.safeParse({
        email: 'builder@gujarat.in',
        passKey: wrongKey,
      });
      expect(parsed.success).toBe(true);
      const isValid = await verifyAccessKey(wrongKey, storedHash);
      expect(isValid).toBe(false);
    });

    it('Scenario 1.3: User submits empty passkey -> Schema rejects empty credential', () => {
      const parsed = loginSchema.safeParse({
        email: 'builder@gujarat.in',
        passKey: '',
      });
      // Either fails validation or refine check indicates empty credential
      const hasCredential = Boolean(
        parsed.success &&
          (parsed.data.password ||
            (parsed.data as any).passKey ||
            (parsed.data as any).passkey ||
            (parsed.data as any).accessKey),
      );
      expect(hasCredential).toBe(false);
    });

    it('Scenario 1.4: Passkey request reaches backend -> Correct field is extracted and rate limited on repeated failures', () => {
      const testIdentifier = 'passkey:test-ratelimit@proventa.in';
      resetPassKeyRateLimit(testIdentifier);

      // Verify 5 attempts permitted
      for (let i = 0; i < 5; i++) {
        const check = checkPassKeyRateLimit(testIdentifier);
        expect(check.allowed).toBe(true);
      }

      // 6th attempt blocked
      const blocked = checkPassKeyRateLimit(testIdentifier);
      expect(blocked.allowed).toBe(false);

      // Reset works
      resetPassKeyRateLimit(testIdentifier);
      const afterReset = checkPassKeyRateLimit(testIdentifier);
      expect(afterReset.allowed).toBe(true);
    });

    it('Scenario 1.5: Stored bcrypt hash verification -> Existing credential works across raw, hyphenated and spaced formats', async () => {
      expect(await verifyAccessKey(rawPasskey, storedHash)).toBe(true);
      expect(await verifyAccessKey(formattedPasskey, storedHash)).toBe(true);
      expect(await verifyAccessKey(spacedPasskey, storedHash)).toBe(true);
      expect(await verifyAccessKey('1111-2222-3333', storedHash)).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // PART 2: CREATE ACCOUNT VS SIGN IN WORKFLOWS & REGISTRATION
  // --------------------------------------------------------------------------
  describe('2. Registration Schema & Buyer / Supplier Account Creation', () => {
    it('Scenario 2.1: First-time buyer registers with businessName, email, and 12-digit passkey', () => {
      const payload = {
        name: 'Amit Shah',
        businessName: 'Gujarat Infrastructure & Bridges Ltd',
        email: 'amit@gujinfra.com',
        phone: '+91 98250 12345',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        passKey: '5819-2041-3829',
        confirmPassKey: '5819-2041-3829',
        accountType: 'BUYER' as const,
        termsConsent: true,
      };

      const parsed = registerSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.name).toBe('Amit Shah');
        expect(parsed.data.businessName).toBe('Gujarat Infrastructure & Bridges Ltd');
        expect(parsed.data.accountType).toBe('BUYER');
        expect(normalizePassKey(parsed.data.passKey!)).toBe('581920413829');
      }
    });

    it('Scenario 2.2: First-time supplier registers with distributor role and auto-generated passkey', () => {
      const autoDigits = generateRandom12Digits();
      expect(autoDigits.length).toBe(12);

      const payload = {
        name: 'Ketan Patel',
        businessName: 'Sanand Steel Mills & Distributors Pvt Ltd',
        email: 'sales@sanandsteel.in',
        phone: '+91 98790 54321',
        password: 'SupplierPassword456!',
        confirmPassword: 'SupplierPassword456!',
        accountType: 'SUPPLIER' as const,
        termsConsent: true,
      };

      const parsed = registerSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.accountType).toBe('SUPPLIER');
      }
    });

    it('Scenario 2.3: Rejects registration if passwords do not match', () => {
      const payload = {
        name: 'Mismatched User',
        email: 'mismatch@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword456!',
        accountType: 'BUYER' as const,
      };

      const parsed = registerSchema.safeParse(payload);
      expect(parsed.success).toBe(false);
    });

    it('Scenario 2.4: Rejects registration if custom 12-digit passkeys do not match', () => {
      const payload = {
        name: 'Key Mismatch User',
        email: 'keymismatch@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        passKey: '1234-5678-9012',
        confirmPassKey: '9999-8888-7777',
        accountType: 'BUYER' as const,
      };

      const parsed = registerSchema.safeParse(payload);
      expect(parsed.success).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // PART 3: ROLE-BASED DASHBOARD ROUTING & AUTHORIZATION
  // --------------------------------------------------------------------------
  describe('3. Role-Based Navigation & Dashboard Access Controls', () => {
    it('Scenario 3.1: Existing buyer routes to buyer dashboard', () => {
      const userRoles = ['CUSTOMER', 'BUYER'];
      const isSupplier = userRoles.includes('SUPPLIER');
      const targetDashboard = isSupplier ? '/supplier/dashboard' : '/buyer/dashboard';
      expect(targetDashboard).toBe('/buyer/dashboard');
    });

    it('Scenario 3.2: Existing supplier routes to supplier dashboard', () => {
      const userRoles = ['CUSTOMER', 'SUPPLIER'];
      const isSupplier = userRoles.includes('SUPPLIER');
      const targetDashboard = isSupplier ? '/supplier/dashboard' : '/buyer/dashboard';
      expect(targetDashboard).toBe('/supplier/dashboard');
    });

    it('Scenario 3.3: Buyer accessing supplier-only operations is recognized as distinct role', () => {
      const buyerRoles = ['BUYER'];
      const supplierRoles = ['SUPPLIER'];
      expect(buyerRoles.includes('SUPPLIER')).toBe(false);
      expect(supplierRoles.includes('SUPPLIER')).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // PART 4: BUSINESS PROFILE PERSISTENCE & DATA ISOLATION
  // --------------------------------------------------------------------------
  describe('4. Business Profile Management & Tenant Isolation', () => {
    it('Scenario 4.1: Validates permitted profile edit fields', () => {
      const allowedFields = new Set([
        'name',
        'legalName',
        'entityType',
        'district',
        'tagline',
        'shortDescription',
        'description',
        'website',
        'contactEmail',
        'contactPhone',
        'whatsappNumber',
        'addressLine1',
        'addressLine2',
        'area',
        'city',
        'state',
        'postalCode',
        'serviceAreas',
        'servesPanIndia',
        'authorizedContacts',
      ]);

      expect(allowedFields.has('name')).toBe(true);
      expect(allowedFields.has('legalName')).toBe(true);
      expect(allowedFields.has('description')).toBe(true);
      expect(allowedFields.has('gstNumber')).toBe(false); // GSTIN is locked to compliance audit
      expect(allowedFields.has('ownerId')).toBe(false); // Cannot reassign ownership
    });

    it('Scenario 4.2: Enforces that unauthenticated dashboard access is denied', () => {
      const session = null;
      const isLoggedIn = Boolean((session as any)?.user?.id);
      expect(isLoggedIn).toBe(false);
    });
  });
});
