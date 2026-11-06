import { describe, it, expect } from 'vitest';
import { registerSchema } from '@/lib/validation/schemas';
import { sanitizeCallbackPath } from '@/lib/auth/callback-url';
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

  it('2. sanitizeCallbackPath never returns legacy /dashboard', () => {
    expect(sanitizeCallbackPath(undefined)).toBe('/buyer/dashboard');
    expect(sanitizeCallbackPath(null)).toBe('/buyer/dashboard');
    expect(sanitizeCallbackPath('')).toBe('/buyer/dashboard');
    expect(sanitizeCallbackPath('invalid-protocol://evil.com')).toBe('/buyer/dashboard');
    expect(sanitizeCallbackPath('/onboarding/business')).toBe('/onboarding/business');
    expect(sanitizeCallbackPath('/rfq/new')).toBe('/rfq/new');
    expect(sanitizeCallbackPath('/supplier/dashboard')).toBe('/supplier/dashboard');
  });

  it('3. BRAND_CONFIG urls.onboarding points to /onboarding/business', () => {
    expect(BRAND_CONFIG.urls.onboarding).toBe('/onboarding/business');
  });

  it('4. BRAND_CONFIG name and category are correct', () => {
    expect(BRAND_CONFIG.name).toBe('PROVENTA');
    expect(BRAND_CONFIG.category).toBe('Industrial Procurement Platform');
  });
});
