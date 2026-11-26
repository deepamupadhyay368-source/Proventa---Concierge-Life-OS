import { describe, test, expect } from 'vitest';
import { OFFICIAL_PLANS, getPlan, calculateTax, getCheckoutAmount } from '@/lib/pricing';

describe('Authoritative Pricing Service', () => {
  test('Essential plan must equal ₹349 (34900 paise) and 4 visits/yr', async () => {
    const plan = await getPlan('essential');
    expect(plan.pricePaise).toBe(34900);
    expect(plan.monthlyPrice).toBe(349);
    expect(plan.visitEntitlement).toBe(4);
    expect(plan.allocationIntervalMonths).toBe(3);
    expect(plan.visitsPerAllocation).toBe(1);
    expect(plan.visitDurationMinutes).toBe(45);
  });

  test('Family plan must equal ₹699 (69900 paise) and 12 visits/yr', async () => {
    const plan = await getPlan('family');
    expect(plan.pricePaise).toBe(69900);
    expect(plan.monthlyPrice).toBe(699);
    expect(plan.visitEntitlement).toBe(12);
    expect(plan.allocationIntervalMonths).toBe(1);
    expect(plan.visitsPerAllocation).toBe(1);
    expect(plan.visitDurationMinutes).toBe(45);
  });

  test('Premium plan must equal ₹1,199 (119900 paise) and 24 visits/yr', async () => {
    const plan = await getPlan('premium');
    expect(plan.pricePaise).toBe(119900);
    expect(plan.monthlyPrice).toBe(1199);
    expect(plan.visitEntitlement).toBe(24);
    expect(plan.allocationIntervalMonths).toBe(1);
    expect(plan.visitsPerAllocation).toBe(2);
    expect(plan.visitDurationMinutes).toBe(45);
  });

  test('Tax calculation must be integer paise based on 18% GST', () => {
    // 34900 * 18% = 6282 paise
    expect(calculateTax(34900)).toBe(6282);
    // 69900 * 18% = 12582 paise
    expect(calculateTax(69900)).toBe(12582);
    // 119900 * 18% = 21582 paise
    expect(calculateTax(119900)).toBe(21582);
  });

  test('Checkout calculation matches base + tax in integer paise', () => {
    const checkout = getCheckoutAmount('essential');
    expect(checkout.baseAmountPaise).toBe(34900);
    expect(checkout.taxPaise).toBe(6282);
    expect(checkout.totalAmountPaise).toBe(34900 + 6282);
  });
});
