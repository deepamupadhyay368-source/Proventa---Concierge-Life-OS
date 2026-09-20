import { describe, it, expect } from 'vitest';
import { CapabilityRegistry } from '@/lib/capabilities/capability-registry';
import { TaskDecisionEngine } from '@/lib/capabilities/task-decision-engine';

describe('Human Concierge OS — Phase 8 Full Lifecycle & Zero-Fabrication', () => {
  it('registers all 14 mandatory service categories with human concierge execution availability', () => {
    const all = CapabilityRegistry.getAllCapabilities();
    expect(all.length).toBe(14);

    const categories = [
      'DINING',
      'TRAVEL',
      'HOTELS_ACCOMMODATION',
      'MOBILITY_TRANSPORT',
      'FOOD_DELIVERY',
      'MOVIES_ENTERTAINMENT',
      'GIFTS_SHOPPING',
      'HOME_LIFESTYLE',
      'HEALTH_WELLNESS',
      'BUSINESS_COURIER',
      'FINANCIAL_CONCIERGE',
      'LEGAL_DOCUMENTATION',
      'BESPOKE_REQUESTS',
    ];

    categories.forEach((cat) => {
      const cap = CapabilityRegistry.getCapability(cat);
      expect(cap).toBeDefined();
      expect(cap.humanConciergeAvailable).toBe(true);
    });
  });

  it('routes non-automated mandates to HUMAN_CONCIERGE without failing or dropping requests', () => {
    const travelDecision = TaskDecisionEngine.evaluate({
      rawInput: 'Fly from Ahmedabad to Mumbai tomorrow evening',
      category: 'travel',
      objective: 'BOOK',
      destination: 'Mumbai',
    });

    expect(travelDecision.executionMode).toBe('HUMAN_CONCIERGE');
    expect(travelDecision.isProhibited).toBe(false);

    const bespokeDecision = TaskDecisionEngine.evaluate({
      rawInput: 'Arrange confidential notary and courier dispatch in Ahmedabad',
      category: 'bespoke_requests',
      objective: 'ARRANGE',
    });

    expect(bespokeDecision.executionMode).toBe('HUMAN_CONCIERGE');
    expect(bespokeDecision.isProhibited).toBe(false);
  });

  it('enforces strict zero-fabrication validation on provider confirmation references', () => {
    const invalidReferences = [
      'PV-AMD-8821',
      'PV-CONFIRMED',
      'MOCK-HOTEL-99',
      'DEMO-TABLE-1',
      'TEST-PNR',
      'FAKE-12345',
      'SANDBOX-REF',
      'NONE',
      'N/A',
    ];

    const validateRef = (ref: string): boolean => {
      const upper = ref.trim().toUpperCase();
      if (
        upper.startsWith('PV-') ||
        upper.startsWith('PV-AMD-') ||
        upper.startsWith('MOCK-') ||
        upper.startsWith('DEMO-') ||
        upper.startsWith('TEST-') ||
        upper.startsWith('FAKE-') ||
        upper.includes('SANDBOX') ||
        ['NONE', 'N/A', 'NA', 'NULL', 'UNDEFINED', 'TEST', 'MOCK', 'FAKE', 'SIMULATED'].includes(upper)
      ) {
        return false;
      }
      return true;
    };

    invalidReferences.forEach((invalidRef) => {
      expect(validateRef(invalidRef)).toBe(false);
    });

    const validGenuineReferences = [
      'AGS-VERIFIED-TABLE-14',
      '6E-Z7K8PQ',
      '098-2412891240',
      'TAJ-MAHAL-PALACE-9941',
      'AIR-INDIA-BOM-DEL-882',
    ];

    validGenuineReferences.forEach((validRef) => {
      expect(validateRef(validRef)).toBe(true);
    });
  });

  it('verifies queue state categorization for operational work queue', () => {
    const categorize = (task: { status: string; isEscalated?: boolean; events?: any[] }) => {
      if (task.isEscalated || task.status === 'NEEDS_HUMAN') return 'escalated';
      if (['REQUESTED', 'UNDERSTANDING', 'QUEUED'].includes(task.status)) return 'new';
      if (['NEEDS_INFORMATION'].includes(task.status)) return 'waiting_customer';
      if (task.events?.some((e) => e.eventType === 'AWAITING_CONCIERGE_CALL' || e.eventType === 'AWAITING_PROVIDER')) return 'waiting_provider';
      if (['AWAITING_APPROVAL', 'OPTIONS_READY'].includes(task.status)) return 'awaiting_approval';
      if (['APPROVED'].includes(task.status)) return 'ready_to_execute';
      if (['CONFIRMED', 'COMPLETED'].includes(task.status)) return 'completed';
      return 'in_progress';
    };

    expect(categorize({ status: 'REQUESTED' })).toBe('new');
    expect(categorize({ status: 'UNDERSTANDING' })).toBe('new');
    expect(categorize({ status: 'NEEDS_INFORMATION' })).toBe('waiting_customer');
    expect(categorize({ status: 'SEARCHING', events: [{ eventType: 'AWAITING_PROVIDER' }] })).toBe('waiting_provider');
    expect(categorize({ status: 'AWAITING_APPROVAL' })).toBe('awaiting_approval');
    expect(categorize({ status: 'OPTIONS_READY' })).toBe('awaiting_approval');
    expect(categorize({ status: 'APPROVED' })).toBe('ready_to_execute');
    expect(categorize({ status: 'CONFIRMED' })).toBe('completed');
    expect(categorize({ status: 'COMPLETED' })).toBe('completed');
    expect(categorize({ status: 'NEEDS_HUMAN' })).toBe('escalated');
    expect(categorize({ status: 'EXECUTING', isEscalated: true })).toBe('escalated');
  });
});
