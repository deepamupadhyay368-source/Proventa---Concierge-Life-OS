import { describe, it, expect, beforeEach } from 'vitest';
import { understandRequest } from '@/lib/ai/agents/understanding';
import { canTransition, validateTransition } from '@/lib/orchestration/state-machine';
import { evaluateApproval } from '@/lib/orchestration/approval/approval-engine';
import { AdapterRegistry } from '@/lib/orchestration/adapters';
import { AhmedabadVerifiedAdapter } from '@/lib/orchestration/adapters/ahmedabad-verified.adapter';
import { MockDiningAdapter } from '@/lib/orchestration/adapters/mock-adapters';
import { findAgentForTask } from '@/lib/orchestration/agents';

describe('Task Engine: Real-World Execution Platform Suite', () => {
  describe('1. AI Intent Extraction Layer', () => {
    it('converts natural language restaurant request into structured parameters', async () => {
      const input = 'Book me a quiet restaurant for 4 people tonight at 8 PM in Ahmedabad under ₹5,000.';
      const extracted = await understandRequest(input);

      expect(extracted.category).toBe('dining');
      expect(extracted.partySize).toBe(4);
      expect(extracted.urgency).toBe('URGENT');
      expect(extracted.requiresClarification).toBe(false);
    });

    it('identifies missing critical information rather than hallucinating details', () => {
      const diningAgent = findAgentForTask('dining');
      const missing = diningAgent.identifyMissingInformation({
        intent: 'book a table',
        rawInput: 'Book a table at Agashiye',
        urgency: 'NORMAL',
        requiresClarification: false,
      });

      expect(missing).toContain('number of guests');
    });

    it('does not interrogate user when all critical details are present', () => {
      const diningAgent = findAgentForTask('dining');
      const missing = diningAgent.identifyMissingInformation({
        intent: 'book a table',
        rawInput: 'Book a table for 4 at Agashiye tonight at 8 PM',
        partySize: 4,
        dateTime: 'Tonight 8:00 PM',
        urgency: 'URGENT',
        requiresClarification: false,
      });

      expect(missing.length).toBe(0);
    });
  });

  describe('2. State Machine & Integrity Matrix', () => {
    it('allows valid sequential transitions from UNDERSTANDING to CONFIRMED', () => {
      expect(canTransition('UNDERSTANDING', 'SEARCHING')).toBe(true);
      expect(canTransition('SEARCHING', 'OPTIONS_READY')).toBe(true);
      expect(canTransition('OPTIONS_READY', 'AWAITING_APPROVAL')).toBe(true);
      expect(canTransition('AWAITING_APPROVAL', 'APPROVED')).toBe(true);
      expect(canTransition('APPROVED', 'EXECUTING')).toBe(true);
      expect(canTransition('EXECUTING', 'VERIFYING')).toBe(true);
      expect(canTransition('VERIFYING', 'CONFIRMED')).toBe(true);
      expect(canTransition('CONFIRMED', 'COMPLETED')).toBe(true);
    });

    it('rejects illegal jumps (e.g. SEARCHING directly to CONFIRMED without execution)', () => {
      expect(canTransition('SEARCHING', 'CONFIRMED')).toBe(false);
      expect(() => validateTransition('SEARCHING', 'CONFIRMED')).toThrow();
    });

    it('allows graceful escalation to NEEDS_HUMAN from any operational state', () => {
      expect(canTransition('SEARCHING', 'NEEDS_HUMAN')).toBe(true);
      expect(canTransition('EXECUTING', 'NEEDS_HUMAN')).toBe(true);
      expect(canTransition('FAILED', 'NEEDS_HUMAN')).toBe(true);
      expect(canTransition('NEEDS_HUMAN', 'EXECUTING')).toBe(true);
      expect(canTransition('NEEDS_HUMAN', 'CONFIRMED')).toBe(true);
    });
  });

  describe('3. Execution Tiers: REAL vs SANDBOX vs CONCIERGE FALLBACK', () => {
    it('Ahmedabad Verified Network adapter is explicitly tagged REAL', () => {
      const adapter = new AhmedabadVerifiedAdapter();
      expect(adapter.environment).toBe('REAL');
      expect(adapter.name).toContain('Ahmedabad Verified');
    });

    it('Mock dining adapter is explicitly tagged SANDBOX and flags isMock: true', async () => {
      const mockAdapter = new MockDiningAdapter();
      const proposals = await mockAdapter.search({
        category: 'dining',
        rawInput: 'dinner table',
      });

      expect(proposals.length).toBeGreaterThan(0);
      expect(proposals[0].environment).toBe('SANDBOX');
      expect(proposals[0].isMock).toBe(true);
    });

    it('Adapter Registry prioritizes REAL verified providers ahead of sandbox adapters', () => {
      const adapters = AdapterRegistry.getAdaptersForCategory('dining');
      expect(adapters.length).toBeGreaterThan(0);
      expect(adapters[0].environment).toBe('REAL');
    });
  });

  describe('4. Approval Gates & Price Thresholds', () => {
    it('requires explicit client authorization when total exceeds auto-approval threshold', async () => {
      const proposal = {
        id: 'prop-1',
        title: 'The Royal Vega Heritage Banquet',
        providerName: 'The Royal Vega',
        description: 'Imperial vegetarian tasting menu for 6',
        priceAmount: 8500,
        priceCurrency: 'INR',
        priceFormatted: '₹8,500',
      };

      const evalResult = await evaluateApproval({
        category: 'dining',
        proposal,
      });

      expect(evalResult.requiresApproval).toBe(true);
      expect(evalResult.totalAmount).toBe(8500);
      expect(evalResult.reason).toContain('exceeds your auto-approval threshold');
    });

    it('permits pre-authorization when dining amount is under ₹5,000 auto-approve limit', async () => {
      const proposal = {
        id: 'prop-2',
        title: 'Agashiye Heritage Dining',
        providerName: 'Agashiye',
        description: 'Authentic rooftop thali for 2',
        priceAmount: 3900,
        priceCurrency: 'INR',
        priceFormatted: '₹3,900',
      };

      const evalResult = await evaluateApproval({
        category: 'dining',
        proposal,
      });

      expect(evalResult.requiresApproval).toBe(false);
      expect(evalResult.autoApproveLimit).toBe(5000);
    });
  });

  describe('5. End-to-End Real-World Restaurant Reservation Journey', () => {
    it('completes discovery, proposal formulation, execution, and verification with authentic reference', async () => {
      const realAdapter = new AhmedabadVerifiedAdapter();

      // 1. Search options
      const options = await realAdapter.search({
        category: 'dining',
        rawInput: 'Book me a quiet restaurant for 4 people tonight at 8 PM in Ahmedabad',
        constraints: { partySize: 4 },
      });

      expect(options.length).toBeGreaterThan(0);
      const chosen = options[0];
      expect(chosen.environment).toBe('REAL');
      expect(chosen.providerName).toBeTruthy();

      // 2. Execute reservation
      const execution = await realAdapter.execute(chosen, {
        guests: 4,
        scheduledTime: 'Tonight 8:00 PM',
        specialRequests: 'Quiet corner table, 4 guests',
      });

      expect(execution.success).toBe(true);
      expect(execution.environment).toBe('REAL');
      expect(execution.externalReferenceId).toMatch(/^PV-AMD-[A-Z0-9]+$/);
      expect(execution.status).toBe('CONFIRMED');

      // 3. Verify external confirmation
      const verification = await realAdapter.verify(execution.externalReferenceId!);
      expect(verification.verified).toBe(true);
      expect(verification.environment).toBe('REAL');
      expect(verification.confirmationReference).toBe(execution.externalReferenceId);
      expect(verification.isMock).toBe(false);
    });
  });
});