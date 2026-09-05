import { describe, it, expect } from 'vitest';
import { isValidTransition, assertValidTransition } from '@/lib/workflow/state-machine';

describe('Proventa State Machine Validator', () => {
  it('allows valid transitions from NEW to UNDERSTANDING', () => {
    expect(isValidTransition('NEW', 'UNDERSTANDING')).toBe(true);
  });

  it('allows valid transitions from OPTIONS_READY to AWAITING_CUSTOMER', () => {
    expect(isValidTransition('OPTIONS_READY', 'AWAITING_CUSTOMER')).toBe(true);
  });

  it('allows valid transitions from AWAITING_CUSTOMER to APPROVED', () => {
    expect(isValidTransition('AWAITING_CUSTOMER', 'APPROVED')).toBe(true);
  });

  it('forbids skipping approval directly from NEW to BOOKED', () => {
    expect(isValidTransition('NEW', 'BOOKED')).toBe(false);
    expect(() => assertValidTransition('NEW', 'BOOKED')).toThrow();
  });

  it('forbids arbitrary execution without approval', () => {
    expect(isValidTransition('AWAITING_CUSTOMER', 'EXECUTING')).toBe(false);
  });

  it('forbids transitioning out of COMPLETED', () => {
    expect(isValidTransition('COMPLETED', 'NEW')).toBe(false);
    expect(isValidTransition('COMPLETED', 'IN_PROGRESS')).toBe(false);
  });
});
