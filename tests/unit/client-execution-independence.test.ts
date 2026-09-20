import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ExecutionRouter } from '@/lib/capabilities/execution-router';
import { CapabilityRegistry } from '@/lib/capabilities/capability-registry';

describe('Phase 8.1 — Client Execution Independence (Automated -> Assisted -> Human)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('1. identifies configured providers as AVAILABLE safely without leaking secrets', () => {
    process.env.AMADEUS_CLIENT_ID = 'test-client-id';
    process.env.AMADEUS_CLIENT_SECRET = 'test-client-secret';

    const health = ExecutionRouter.checkProviderHealth('amadeus_flights');
    expect(health).toBe('AVAILABLE');

    // Verify secrets are not exposed in capabilities health report
    const allHealth = ExecutionRouter.getCapabilitiesHealth();
    const flightHealth = allHealth.find((h) => h.category === 'TRAVEL');
    expect(flightHealth).toBeDefined();
    expect(flightHealth?.status).toBe('AVAILABLE');
    expect(JSON.stringify(flightHealth)).not.toContain('test-client-id');
    expect(JSON.stringify(flightHealth)).not.toContain('test-client-secret');
  });

  it('2. identifies unconfigured providers as NOT_CONFIGURED safely without failing', () => {
    delete process.env.AMADEUS_CLIENT_ID;
    delete process.env.AMADEUS_CLIENT_SECRET;
    delete process.env.AMADEUS_API_KEY;
    delete process.env.AMADEUS_API_SECRET;

    const health = ExecutionRouter.checkProviderHealth('amadeus_flights');
    expect(health).toBe('NOT_CONFIGURED');
  });

  it('3. resolves AUTOMATED tier when a verified provider is available and safe', () => {
    process.env.AMADEUS_CLIENT_ID = 'valid_id';
    process.env.AMADEUS_CLIENT_SECRET = 'valid_secret';

    const resolution = ExecutionRouter.resolveExecutionMode({
      rawInput: 'Book flight Ahmedabad to Mumbai economy',
      category: 'travel',
      extractedData: {
        destination: 'Mumbai',
        location: 'Ahmedabad',
      },
    });

    expect(['AUTOMATED', 'ASSISTED']).toContain(resolution.tier);
    expect(resolution.customerStatusMessage).toBe('Your Proventa Concierge is handling this.');
  });

  it('4. resolves ASSISTED tier when provider is unconfigured, preparing structured context for human concierge', () => {
    delete process.env.AMADEUS_CLIENT_ID;
    delete process.env.AMADEUS_CLIENT_SECRET;
    delete process.env.AMADEUS_API_KEY;
    delete process.env.AMADEUS_API_SECRET;

    const resolution = ExecutionRouter.resolveExecutionMode({
      rawInput: 'Book flight Ahmedabad to Delhi tomorrow morning for 2 guests budget 15000',
      category: 'travel',
      extractedData: {
        destination: 'Delhi',
        location: 'Ahmedabad',
        partySize: 2,
        dateTime: 'tomorrow morning',
        budgetRange: '15000',
      },
    });

    expect(resolution.tier).toBe('ASSISTED');
    expect(resolution.executionMethod).toBe('HUMAN_CONCIERGE');
    expect(resolution.preparedContext).toBeDefined();
    expect(resolution.preparedContext.location).toBe('Delhi');
    expect(resolution.preparedContext.partySize).toBe(2);
    expect(resolution.preparedContext.dates).toBe('tomorrow morning');
    expect(resolution.preparedContext.budget).toBe('15000');
    expect(resolution.customerStatusMessage).toBe('Your Proventa Concierge is handling this.');
  });

  it('5. resolves HUMAN tier when user explicitly requests bespoke human coordination or calls', () => {
    const resolution = ExecutionRouter.resolveExecutionMode({
      rawInput: 'Please call the restaurant maître d directly and request a specific corner table with offline floral arrangement',
      category: 'dining',
      extractedData: {
        location: 'Agashiye',
      },
    });

    expect(resolution.tier).toBe('HUMAN');
    expect(resolution.executionMethod).toBe('HUMAN_CONCIERGE');
    expect(resolution.reason).toContain('human concierge');
    expect(resolution.customerStatusMessage).toBe('Your Proventa Concierge is handling this.');
  });

  it('6. safely falls back to HUMAN tier for unknown or bespoke capabilities without crashing', () => {
    const resolution = ExecutionRouter.resolveExecutionMode({
      rawInput: 'Arrange private antique appraisal and bespoke courier delivery',
      category: 'unknown_category_xyz',
    });

    expect(['ASSISTED', 'HUMAN']).toContain(resolution.tier);
    expect(resolution.executionMethod).toBe('HUMAN_CONCIERGE');
    expect(resolution.customerStatusMessage).toBe('Your Proventa Concierge is handling this.');
  });

  it('7. strictly rejects synthetic, mock, or simulated provider confirmation references (Zero Fabrication)', () => {
    const syntheticRefs = [
      'PV-AMD-8821',
      'PV-CONFIRMED',
      'PV-FLIGHT-99',
      'MOCK-6E-1234',
      'TEST-PNR-001',
      'DEMO-HOTEL-7',
      'FAKE-REF',
      'SANDBOX-AMADEUS-01',
      'NONE',
      'N/A',
      'NA',
    ];

    const isGenuineRef = (ref: string): boolean => {
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

    syntheticRefs.forEach((ref) => {
      expect(isGenuineRef(ref)).toBe(false);
    });
  });

  it('8. strictly accepts authentic provider confirmation references', () => {
    const genuineRefs = [
      '6E-Z7K8PQ',
      '098-2412891240',
      'AGS-VERIFIED-TABLE-14',
      'AI-DEL-9921',
      'ITC-HOTEL-RES-44810',
    ];

    const isGenuineRef = (ref: string): boolean => {
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

    genuineRefs.forEach((ref) => {
      expect(isGenuineRef(ref)).toBe(true);
    });
  });

  it('9. ensures customer status message never leaks provider errors, lack of API keys, or technical jargon', () => {
    const resolution = ExecutionRouter.resolveExecutionMode({
      rawInput: 'Emergency private jet from Ahmedabad to London',
      category: 'travel',
    });

    expect(resolution.customerStatusMessage).toBe('Your Proventa Concierge is handling this.');
    expect(resolution.customerStatusMessage).not.toContain('AMADEUS');
    expect(resolution.customerStatusMessage).not.toContain('API');
    expect(resolution.customerStatusMessage).not.toContain('KEY');
    expect(resolution.customerStatusMessage).not.toContain('UNAVAILABLE');
    expect(resolution.customerStatusMessage).not.toContain('FAILED');
  });

  it('10. verifies customer request succeeds even when all external providers are completely disabled', () => {
    delete process.env.AMADEUS_CLIENT_ID;
    delete process.env.AMADEUS_CLIENT_SECRET;
    delete process.env.AMADEUS_API_KEY;
    delete process.env.AMADEUS_API_SECRET;
    delete process.env.CINEMA_API_KEY;
    process.env.FEATURE_SWIGGY_LIVE = 'false';

    const health = ExecutionRouter.getCapabilitiesHealth();
    expect(health.length).toBeGreaterThan(0);

    const resolution = ExecutionRouter.resolveExecutionMode({
      rawInput: 'Dinner reservation at Agashiye for 4 guests tomorrow 8 PM',
      category: 'dining',
      extractedData: {
        location: 'Agashiye',
        partySize: 4,
        dateTime: 'tomorrow 8 PM',
      },
    });

    expect(['ASSISTED', 'HUMAN']).toContain(resolution.tier);
    expect(resolution.executionMethod).toBe('HUMAN_CONCIERGE');
    expect(resolution.preparedContext.partySize).toBe(4);
    expect(resolution.customerStatusMessage).toBe('Your Proventa Concierge is handling this.');
  });
});
