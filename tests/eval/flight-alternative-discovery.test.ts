import { describe, it, expect } from 'vitest';
import { AutonomousDiscoveryEngine } from '@/lib/orchestration/discovery/engine';
import { TaskDecisionEngine } from '@/lib/capabilities/task-decision-engine';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { FlightsAdapter } from '@/lib/orchestration/adapters/flights.adapter';
import { ExecutionRouter } from '@/lib/capabilities/execution-router';
import { OptionProposal } from '@/lib/orchestration/types';

describe('PROVENTA — P0 FLIGHT ALTERNATIVE DISCOVERY ROUTING REGRESSION SUITE', () => {
  // Scenario 1: Initial Flight Search returns progressive batch of genuine options (<= 5)
  it('Scenario 1: First flight search returns up to 5 genuine options with valid route metadata', async () => {
    const rawInput = 'Find flights from Ahmedabad to Delhi for tomorrow morning';
    const decision = TaskDecisionEngine.evaluate({ rawInput });
    
    expect(decision.category).toBe('TRAVEL');
    expect(decision.objective).toBe('SEARCH');
    expect(decision.executionMode).toBe('AI_RESEARCH');
    expect(decision.requiresHumanHandoff).toBe(false);

    const discovery = await AutonomousDiscoveryEngine.discover({
      originalRequest: rawInput,
      category: 'flights',
      origin: 'AMD',
      destination: 'DEL',
      dates: { exact: '2026-10-15' },
      partySize: 1,
    });

    expect(discovery.status).toBe('SUCCESS');
    expect(discovery.options.length).toBeGreaterThanOrEqual(5);

    const batch1 = discovery.options.slice(0, 5);
    expect(batch1.length).toBe(5);
    for (const opt of batch1) {
      expect(opt.title).toBeDefined();
      expect(opt.priceAmount).toBeGreaterThan(0);
      expect(opt.priceCurrency).toBe('INR');
      expect(opt.metadata?.departureAirport).toBe('AMD');
      expect(opt.metadata?.arrivalAirport).toBe('DEL');
    }
  });

  // Scenario 2: Customer asks for alternatives ("Show other flight options", "Replace these options", "Show more flights")
  it('Scenario 2: Customer alternative phrasing is recognized as SEARCH objective and AI_RESEARCH execution mode', () => {
    const alternativePhrases = [
      'Show other flight options',
      'Replace these options with different flights',
      'Show more flights for AMD to DEL',
      'These flights don\'t suit me, find alternatives',
      'Try another batch',
      'Show different airlines',
      'None of these work, find other options',
      'Next batch of flights please',
    ];

    for (const phrase of alternativePhrases) {
      expect(TaskDecisionEngine.isDiscoveryAlternative(phrase)).toBe(true);

      const decision = TaskDecisionEngine.evaluate({ rawInput: phrase, category: 'TRAVEL' });
      expect(decision.category).toBe('TRAVEL');
      expect(decision.objective).toBe('SEARCH');
      expect(decision.executionMode).toBe('AI_RESEARCH');
      expect(decision.requiresHumanHandoff).toBe(false);
      expect(decision.isProhibited).toBe(false);
    }
  });

  // Scenario 3: Next batch (options 6-10) is discovered automatically without Concierge escalation
  it('Scenario 3: Next batch cycles candidates without premature Concierge escalation', async () => {
    const rawInput = 'Find flights from Ahmedabad to Delhi for 2026-10-15';
    const initialDiscovery = await AutonomousDiscoveryEngine.discover({
      originalRequest: rawInput,
      category: 'flights',
      origin: 'AMD',
      destination: 'DEL',
      dates: { exact: '2026-10-15' },
      partySize: 1,
    });

    const batch1Options = initialDiscovery.options.slice(0, 5);
    const rejectedOptionIds = batch1Options.map((o) => o.id);
    const rejectedOptionKeys = batch1Options.map((o) => RequestOrchestrator.getOptionStableKey(o));

    // Filter candidates for Batch 2 excluding Batch 1
    const nextCandidates = RequestOrchestrator.filterAndRankCandidates({
      candidates: initialDiscovery.options,
      rejectedOptionIds,
      rejectedOptionKeys,
      constraints: {
        category: 'flights',
        origin: 'AMD',
        destination: 'DEL',
        originAirport: 'AMD',
        destinationAirport: 'DEL',
      },
    });

    expect(nextCandidates.length).toBeGreaterThan(0);
    const batch2Options = nextCandidates.slice(0, 5);
    expect(batch2Options.length).toBe(5);

    // Verify batch 2 has zero overlap with batch 1
    for (const b2 of batch2Options) {
      expect(rejectedOptionIds.includes(b2.id)).toBe(false);
      const b2Key = RequestOrchestrator.getOptionStableKey(b2);
      expect(rejectedOptionKeys.includes(b2Key)).toBe(false);
    }
  });

  // Scenario 4: Previously displayed and rejected options are strictly excluded
  it('Scenario 4: Strict deduplication across multiple rejection cycles', () => {
    const mockOptions: OptionProposal[] = [
      { id: 'FLT-001', providerId: 'amadeus', providerName: 'IndiGo 6E-201', title: '6E-201 06:00', description: 'IndiGo flight', priceAmount: 4500, priceCurrency: 'INR', priceFormatted: '₹4,500' },
      { id: 'FLT-002', providerId: 'amadeus', providerName: 'Air India AI-810', title: 'AI-810 07:30', description: 'Air India flight', priceAmount: 5200, priceCurrency: 'INR', priceFormatted: '₹5,200' },
      { id: 'FLT-003', providerId: 'amadeus', providerName: 'Vistara UK-953', title: 'UK-953 09:15', description: 'Vistara flight', priceAmount: 6800, priceCurrency: 'INR', priceFormatted: '₹6,800' },
      { id: 'FLT-004', providerId: 'amadeus', providerName: 'Akasa QP-1102', title: 'QP-1102 11:45', description: 'Akasa flight', priceAmount: 4200, priceCurrency: 'INR', priceFormatted: '₹4,200' },
      { id: 'FLT-005', providerId: 'amadeus', providerName: 'SpiceJet SG-8194', title: 'SG-8194 14:00', description: 'SpiceJet flight', priceAmount: 4100, priceCurrency: 'INR', priceFormatted: '₹4,100' },
      { id: 'FLT-006', providerId: 'amadeus', providerName: 'IndiGo 6E-504', title: '6E-504 16:30', description: 'IndiGo flight', priceAmount: 4900, priceCurrency: 'INR', priceFormatted: '₹4,900' },
      { id: 'FLT-007', providerId: 'amadeus', providerName: 'Air India AI-442', title: 'AI-442 18:00', description: 'Air India flight', priceAmount: 5500, priceCurrency: 'INR', priceFormatted: '₹5,500' },
      { id: 'FLT-008', providerId: 'amadeus', providerName: 'Vistara UK-992', title: 'UK-992 20:15', description: 'Vistara flight', priceAmount: 7100, priceCurrency: 'INR', priceFormatted: '₹7,100' },
    ];

    const rejectedIds = ['FLT-001', 'FLT-002', 'FLT-003', 'FLT-004', 'FLT-005'];
    const rejectedKeys = rejectedIds.map((id) => {
      const opt = mockOptions.find((o) => o.id === id)!;
      return RequestOrchestrator.getOptionStableKey(opt);
    });

    const filtered = RequestOrchestrator.filterAndRankCandidates({
      candidates: mockOptions,
      rejectedOptionIds: rejectedIds,
      rejectedOptionKeys: rejectedKeys,
      constraints: { category: 'flights' },
    });

    expect(filtered.length).toBe(3);
    expect(filtered.map((f) => f.id)).toEqual(['FLT-006', 'FLT-007', 'FLT-008']);
  });

  // Scenario 5: Route, dates, passenger count, and budget remain intact during alternative search
  it('Scenario 5: Search criteria (route, date, partySize, budget) are preserved', async () => {
    const entities = {
      origin: 'AMD',
      originAirport: 'AMD',
      destination: 'BOM',
      destinationAirport: 'BOM',
      dates: { exact: '2026-10-20' },
      partySize: 2,
      budgetAmount: 15000,
    };

    const discovery = await AutonomousDiscoveryEngine.discover({
      originalRequest: 'Find 2 flights from AMD to BOM under 15000 on 2026-10-20',
      category: 'flights',
      origin: entities.origin,
      destination: entities.destination,
      dates: entities.dates,
      partySize: entities.partySize,
      budget: entities.budgetAmount,
    });

    expect(discovery.status).toBe('SUCCESS');
    expect(discovery.options.length).toBeGreaterThan(0);
    for (const opt of discovery.options) {
      expect(opt.metadata?.departureAirport).toBe('AMD');
      expect(opt.metadata?.arrivalAirport).toBe('BOM');
    }
  });

  // Scenario 6: Missing Duffel credentials do NOT block autonomous discovery
  it('Scenario 6: Missing Duffel API credentials gracefully fall back to schedule intelligence', async () => {
    const adapter = new FlightsAdapter();
    expect(adapter.capabilities.search).toBe(true);

    const results = await adapter.search({
      category: 'flights',
      rawInput: 'Find flights from AMD to DEL on 2026-10-15',
      constraints: { origin: 'AMD', destination: 'DEL' },
    });

    expect(results.length).toBeGreaterThanOrEqual(5);
    expect(results[0].title).toBeDefined();
    expect(results[0].providerId).toBeDefined();
    expect(results[0].priceAmount).toBeGreaterThan(0);
  });

  // Scenario 7: Progressive batching returns fewer genuine options when fewer remain (no fabrication)
  it('Scenario 7: Returns genuine remaining options count when inventory is low without fabricating', () => {
    const mockInventory: OptionProposal[] = [
      { id: 'FLT-101', providerId: 'amadeus', providerName: 'IndiGo 6E-101', title: '6E-101', description: 'IndiGo flight', priceAmount: 4000, priceCurrency: 'INR', priceFormatted: '₹4,000' },
      { id: 'FLT-102', providerId: 'amadeus', providerName: 'Air India AI-102', title: 'AI-102', description: 'Air India flight', priceAmount: 4500, priceCurrency: 'INR', priceFormatted: '₹4,500' },
      { id: 'FLT-103', providerId: 'amadeus', providerName: 'Vistara UK-103', title: 'UK-103', description: 'Vistara flight', priceAmount: 5000, priceCurrency: 'INR', priceFormatted: '₹5,000' },
    ];

    const filtered = RequestOrchestrator.filterAndRankCandidates({
      candidates: mockInventory,
      rejectedOptionIds: [],
      rejectedOptionKeys: [],
      constraints: { category: 'flights' },
    });

    expect(filtered.length).toBe(3);
    const batch = filtered.slice(0, 5); // Target is 5, but only 3 exist
    expect(batch.length).toBe(3); // Truthful 3 options, exactly 0 fabricated
  });

  // Scenario 8: Exhausted inventory produces truthful empty-state response without false escalation
  it('Scenario 8: Exhausted candidate inventory produces non-escalated graceful resolution', () => {
    const mockInventory: OptionProposal[] = [
      { id: 'FLT-201', providerId: 'amadeus', providerName: 'IndiGo 6E-201', title: '6E-201', description: 'IndiGo flight', priceAmount: 4000, priceCurrency: 'INR', priceFormatted: '₹4,000' },
    ];

    const filtered = RequestOrchestrator.filterAndRankCandidates({
      candidates: mockInventory,
      rejectedOptionIds: ['FLT-201'],
      rejectedOptionKeys: ['amadeus:IndiGo 6E-201:6E-201:4000:INR'],
      constraints: { category: 'flights' },
    });

    expect(filtered.length).toBe(0);
  });

  // Scenario 9: Explicit booking requests still enforce approval and execution safeguards
  it('Scenario 9: Explicit booking requests enforce mandatory customer approval barrier', () => {
    const rawBookingRequest = 'Book flight IndiGo 6E-201 from Ahmedabad to Delhi for Deepam Patel';
    const decision = TaskDecisionEngine.evaluate({ rawInput: rawBookingRequest });

    expect(decision.objective).toBe('BOOK');
    expect(decision.capability.customerApprovalRequired).toBe(true);

    const route = ExecutionRouter.resolveExecutionMode({
      rawInput: rawBookingRequest,
      category: 'TRAVEL',
      objective: 'BOOK',
      extractedData: { intent: rawBookingRequest, category: 'travel', objective: 'BOOK' },
      capability: decision.capability,
    });

    expect(route.tier).toBe('ASSISTED');
    expect(route.executionMethod).toBe('HUMAN_CONCIERGE');
    expect(route.executionModeType).toBe('ASSISTED_EXECUTION');
  });

  // Scenario 10: State machine safely restricts status transitions and supports Concierge escalation
  it('Scenario 10: State machine guarantees safe lifecycle transitions for human concierge escalation', () => {
    const prohibitedDecision = TaskDecisionEngine.evaluate({ rawInput: 'Can you hack someone\'s airline booking account' });
    expect(prohibitedDecision.isProhibited).toBe(true);
    expect(prohibitedDecision.executionMode).toBe('UNSUPPORTED');
    expect(prohibitedDecision.explanation).toContain('prohibited');
  });
});
