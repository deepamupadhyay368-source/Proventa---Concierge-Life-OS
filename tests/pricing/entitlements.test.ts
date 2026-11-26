import { describe, test, expect } from 'vitest';
import { OFFICIAL_PLANS } from '@/lib/pricing';

describe('Entitlement Rules & Boundaries', () => {
  test('Essential allocation cadence is quarterly with 1 visit', () => {
    const plan = OFFICIAL_PLANS.essential;
    expect(plan.allocationIntervalMonths).toBe(3);
    expect(plan.visitsPerAllocation).toBe(1);
    expect(plan.visitEntitlement).toBe(4);
  });

  test('Family allocation cadence is monthly with 1 visit', () => {
    const plan = OFFICIAL_PLANS.family;
    expect(plan.allocationIntervalMonths).toBe(1);
    expect(plan.visitsPerAllocation).toBe(1);
    expect(plan.visitEntitlement).toBe(12);
  });

  test('Premium allocation cadence is monthly with 2 visits', () => {
    const plan = OFFICIAL_PLANS.premium;
    expect(plan.allocationIntervalMonths).toBe(1);
    expect(plan.visitsPerAllocation).toBe(2);
    expect(plan.visitEntitlement).toBe(24);
  });

  test('Visit duration is capped at 45 minutes across all tiers', () => {
    Object.values(OFFICIAL_PLANS).forEach((plan) => {
      expect(plan.visitDurationMinutes).toBe(45);
    });
  });
});
