import { describe, it, expect } from 'vitest';
import { registerSchema } from '@/lib/validation/schemas';
import { sanitizeCallbackPath, sanitizeNextAuthRedirect } from '@/lib/auth/callback-url';
import { BRAND_CONFIG } from '@/lib/brand';

describe('PROVENTA — Signup Navigation & Hotfix Verification', () => {
  it('1. registerSchema validates BUYER, SUPPLIER, and BOTH roles', () => {
    const buyerData = {
      name: 'Ramesh Patel',
      email: 'ramesh@patelsteel.in',
      phone: '+919876543210',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      accountType: 'BUYER' as const,
    };
    const buyerResult = registerSchema.safeParse(buyerData);
    expect(buyerResult.success).toBe(true);

    const supplierData = {
      ...buyerData,
      accountType: 'SUPPLIER' as const,
    };
    const supplierResult = registerSchema.safeParse(supplierData);
    expect(supplierResult.success).toBe(true);

    const bothData = {
      ...buyerData,
      accountType: 'BOTH' as const,
    };
    const bothResult = registerSchema.safeParse(bothData);
    expect(bothResult.success).toBe(true);
  });

  it('2. sanitizeCallbackPath enforces /dashboard default and preserves legitimate internal callback URLs', () => {
    expect(sanitizeCallbackPath(undefined)).toBe('/dashboard');
    expect(sanitizeCallbackPath(null)).toBe('/dashboard');
    expect(sanitizeCallbackPath('')).toBe('/dashboard');
    expect(sanitizeCallbackPath('/dashboard')).toBe('/dashboard');
    expect(sanitizeCallbackPath('/property-os')).toBe('/property-os');
    expect(sanitizeCallbackPath('/onboarding/business')).toBe('/onboarding/business');
    expect(sanitizeCallbackPath('/rfq/new')).toBe('/rfq/new');
    expect(sanitizeCallbackPath('/supplier/dashboard')).toBe('/supplier/dashboard');
    expect(sanitizeCallbackPath('/reports?type=valuation#summary')).toBe('/reports?type=valuation#summary');
    expect(
      sanitizeCallbackPath('https://proventa.in/property-os?tab=vault#top', 'https://proventa.in'),
    ).toBe('/property-os?tab=vault#top');
  });

  it('3. sanitizeCallbackPath rejects open redirects, backslashes, encoded slashes, control chars, and auth loops', () => {
    const base = 'https://proventa.in';
    const malicious = [
      'https://evil.com/steal',
      'http://evil.com/dashboard',
      'invalid-protocol://evil.com',
      'javascript:alert(1)',
      '//evil.com',
      '//evil.com/path',
      '/\\evil.com',
      '/%5cevil.com',
      '/%5Cevil.com',
      '/%255cevil.com',
      '/%2f%2fevil.com',
      '/%2F%2Fevil.com',
      '/%252f%252fevil.com',
      'https://proventa.in//evil.com',
      'https://proventa.in/%5cevil.com',
      'https://proventa.in/%2f%2fevil.com',
      '/dashboard\r\nSet-Cookie: pwn=1',
      '/dashboard\x00evil',
      '/%0d%0aSet-Cookie:pwn=1',
      '/%E0%A4%A', // malformed URI encoding
      '/login',
      '/login?callbackUrl=/dashboard',
      '/login#loop',
      '/LOGIN',
      '/SIGN-IN',
      '/sign-in',
      '/sign-up',
      '/signup',
      '/register',
      '/register-details',
      '/%6cogin',
      'https://proventa.in/LOGIN',
      'https://proventa.in/login',
    ];

    for (const payload of malicious) {
      expect(sanitizeCallbackPath(payload), `noBase failed for ${payload}`).toBe('/dashboard');
      expect(sanitizeCallbackPath(payload, base), `withBase failed for ${payload}`).toBe('/dashboard');
    }
  });

  it('4. sanitizeNextAuthRedirect preserves explicit sign-out to /login and / while blocking external & loop attacks', () => {
    const base = 'https://proventa.in';
    // Explicit sign-out targets preserved
    expect(sanitizeNextAuthRedirect('/login', base)).toBe('/login');
    expect(sanitizeNextAuthRedirect('https://proventa.in/login', base)).toBe('/login');
    expect(sanitizeNextAuthRedirect('/login?loggedOut=true', base)).toBe('/login?loggedOut=true');
    expect(sanitizeNextAuthRedirect('/', base)).toBe('/');
    expect(sanitizeNextAuthRedirect('https://proventa.in/', base)).toBe('/');

    // Legitimate internal routes preserved
    expect(sanitizeNextAuthRedirect('/property-os?tab=docs', base)).toBe('/property-os?tab=docs');

    // External, backslash, double-slash, uppercase /LOGIN, and non-login auth routes rejected
    expect(sanitizeNextAuthRedirect('https://evil.com', base)).toBe('/dashboard');
    expect(sanitizeNextAuthRedirect('//evil.com', base)).toBe('/dashboard');
    expect(sanitizeNextAuthRedirect('/\\evil.com', base)).toBe('/dashboard');
    expect(sanitizeNextAuthRedirect('/%5cevil.com', base)).toBe('/dashboard');
    expect(sanitizeNextAuthRedirect('https://proventa.in//evil.com', base)).toBe('/dashboard');
    expect(sanitizeNextAuthRedirect('/LOGIN', base)).toBe('/dashboard');
    expect(sanitizeNextAuthRedirect('/sign-in', base)).toBe('/dashboard');
    expect(sanitizeNextAuthRedirect('/register-details', base)).toBe('/dashboard');
  });

  it('5. BRAND_CONFIG urls.onboarding points to /onboarding/business', () => {
    expect(BRAND_CONFIG.urls.onboarding).toBe('/onboarding/business');
  });

  it('6. BRAND_CONFIG name and category are correct', () => {
    expect(BRAND_CONFIG.name).toBe('PROVENTA');
    expect(BRAND_CONFIG.category).toMatch(/(Industrial|Construction & Infrastructure) Procurement Platform/);
  });
});
