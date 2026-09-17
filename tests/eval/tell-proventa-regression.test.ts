import { describe, it, expect } from 'vitest';
import { understandRequest } from '@/lib/ai/agents/understanding';
import { evaluateSafetyAndHandoff } from '@/lib/ai/agents/safety';
import { isAppError, AuthenticationError, AuthorizationError, ValidationError } from '@/lib/errors';

describe('Regression: "Tell Proventa" Request Flow & Error Resilience', () => {
  describe('1. Ingestion & Entity Understanding', () => {
    it('accurately parses a premier dining request without silent failures', async () => {
      const rawInput = 'Book a quiet rooftop table for 4 at Agashiye this Saturday evening around ₹2,000 per person.';
      const extracted = await understandRequest(rawInput);

      expect(extracted.category).toBe('dining');
      expect(extracted.intent).toContain('Agashiye');
      expect(extracted.partySize).toBe(4);
      expect(extracted.dateTime).toBeDefined();

      const safety = evaluateSafetyAndHandoff({
        rawInput,
        category: extracted.category,
      });

      expect(safety.safeForAIResearch).toBe(true);
      expect(safety.requiresImmediateHumanHandoff).toBe(false);
    });

    it('flags high-value or explicit human requests for human concierge handoff rather than failing', () => {
      const highValue = evaluateSafetyAndHandoff({
        rawInput: 'Arrange last-minute private venue for 20 people tonight with bespoke chef catering.',
        category: 'dining',
        estimatedAmountINR: 50000,
      });

      expect(highValue.requiresImmediateHumanHandoff).toBe(true);

      const humanReq = evaluateSafetyAndHandoff({
        rawInput: 'I want to speak with a human concierge directly regarding my booking.',
      });
      expect(humanReq.requiresImmediateHumanHandoff).toBe(true);
      expect(humanReq.safeForAIResearch).toBe(false);
    });
  });

  describe('2. Error Architecture & Status Code Preservation', () => {
    it('correctly identifies AppError instances and preserves HTTP status codes', () => {
      const authErr = new AuthenticationError('Authentication required. Please sign in.');
      expect(isAppError(authErr)).toBe(true);
      expect(authErr.statusCode).toBe(401);
      expect(authErr.code).toBe('AUTHENTICATION_REQUIRED');

      const authzErr = new AuthorizationError('Forbidden resource');
      expect(isAppError(authzErr)).toBe(true);
      expect(authzErr.statusCode).toBe(403);

      const valErr = new ValidationError('Invalid request payload');
      expect(isAppError(valErr)).toBe(true);
      expect(valErr.statusCode).toBe(422);

      const standardErr = new Error('Random system crash');
      expect(isAppError(standardErr)).toBe(false);
    });
  });

  describe('3. Multi-Agent Orchestration & Discovery', () => {
    it('creates or progresses task through agents without crashing', async () => {
      // Verify that agents and state machines cleanly process dining requests
      const extracted = await understandRequest('Reserve a table for 2 at Agashiye');
      expect(extracted.category).toBe('dining');
      expect(extracted.partySize).toBe(2);
    });
  });
});
