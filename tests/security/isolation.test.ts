import { describe, it, expect } from 'vitest';
import { hashToken, generateSecureToken, timingSafeEqual } from '@/lib/security/crypto';
import { evaluateSafetyAndHandoff } from '@/lib/ai/agents/safety';

describe('Proventa Security & Safety Suite', () => {
  it('hashes tokens deterministically with sha256', () => {
    const raw = 'test-token-12345';
    const h1 = hashToken(raw);
    const h2 = hashToken(raw);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(64); // SHA-256 hex
  });

  it('verifies timing-safe string comparison correctly', () => {
    expect(timingSafeEqual('secret123', 'secret123')).toBe(true);
    expect(timingSafeEqual('secret123', 'secret456')).toBe(false);
  });

  it('triggers immediate human handoff if customer mentions human or person', () => {
    const res = evaluateSafetyAndHandoff({
      rawInput: 'I want to talk to a human concierge about my flight.',
    });
    expect(res.requiresImmediateHumanHandoff).toBe(true);
    expect(res.safeForAIResearch).toBe(false);
  });

  it('triggers immediate human handoff if transaction exceeds ₹10,000 threshold', () => {
    const res = evaluateSafetyAndHandoff({
      rawInput: 'Book luxury villa in Udaipur for 5 nights',
      estimatedAmountINR: 85000,
    });
    expect(res.requiresImmediateHumanHandoff).toBe(true);
  });

  it('triggers immediate human handoff for cancellations and disputes', () => {
    const res = evaluateSafetyAndHandoff({
      rawInput: 'I need to cancel my reservation and get a refund immediately',
    });
    expect(res.requiresImmediateHumanHandoff).toBe(true);
  });
});
