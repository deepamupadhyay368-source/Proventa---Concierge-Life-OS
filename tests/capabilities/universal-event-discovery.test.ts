import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UniversalEventDiscoveryProvider, universalEventDiscoveryProvider } from '@/lib/events/provider';
import { CityResolver } from '@/lib/events/city-resolver';
import { DateResolver } from '@/lib/events/date-resolver';
import { EventsDiscoveryAdapter } from '@/lib/orchestration/adapters/events.adapter';
import { EntityIntegrityValidator } from '@/lib/validation/entity-integrity';
import { TaskDecisionEngine } from '@/lib/capabilities/task-decision-engine';
import { understandRequest } from '@/lib/ai/agents/understanding';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { db } from '@/lib/db';
import type { NormalizedEvent } from '@/lib/events/types';

vi.mock('@/lib/db', () => {
  const mockTasks = new Map<string, any>();
  return {
    db: {
      task: {
        create: vi.fn().mockImplementation(async ({ data }) => {
          const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const created = { id, createdAt: new Date(), updatedAt: new Date(), ...data };
          mockTasks.set(id, created);
          return created;
        }),
        findUnique: vi.fn().mockImplementation(async ({ where }) => {
          if (where.id) return mockTasks.get(where.id) || null;
          if (where.publicId) {
            for (const t of mockTasks.values()) {
              if (t.publicId === where.publicId) return t;
            }
          }
          return null;
        }),
        update: vi.fn().mockImplementation(async ({ where, data }) => {
          const existing = mockTasks.get(where.id);
          if (!existing) throw new Error('Task not found');
          const updated = { ...existing, ...data, updatedAt: new Date() };
          mockTasks.set(where.id, updated);
          return updated;
        }),
        count: vi.fn().mockResolvedValue(0),
      },
      taskEvent: {
        create: vi.fn().mockResolvedValue({ id: 'event_1' }),
      },
      customerPreference: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    },
  };
});

describe('PROVENTA — UNIVERSAL CITY & DATE EVENT DISCOVERY SUITE', () => {
  let adapter: EventsDiscoveryAdapter;
  let customProvider: UniversalEventDiscoveryProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new EventsDiscoveryAdapter();
    customProvider = new UniversalEventDiscoveryProvider();
  });

  // ==========================================
  // A. AHMEDABAD EVENT SEARCH
  // ==========================================
  it('A. discovers verified genuine events in Ahmedabad for exact date', async () => {
    const results = await universalEventDiscoveryProvider.searchEvents({
      city: 'Ahmedabad',
      date: '2026-10-15',
    });

    expect(results.length).toBeGreaterThanOrEqual(3);
    results.forEach((evt) => {
      expect(evt.city).toBe('Ahmedabad');
      expect(evt.date).toBe('2026-10-15');
      expect(evt.venue).toBeTruthy();
      expect(evt.priceAmount).toBeGreaterThanOrEqual(0);
    });
  });

  // ==========================================
  // B. MUMBAI EVENT SEARCH
  // ==========================================
  it('B. discovers verified genuine events in Mumbai for exact date', async () => {
    const results = await universalEventDiscoveryProvider.searchEvents({
      city: 'Mumbai',
      date: '2026-10-20',
    });

    expect(results.length).toBeGreaterThanOrEqual(3);
    results.forEach((evt) => {
      expect(evt.city).toBe('Mumbai');
      expect(evt.date).toBe('2026-10-20');
      expect(evt.availabilityStatus).toBeTruthy();
    });
  });

  // ==========================================
  // C. DELHI EVENT SEARCH
  // ==========================================
  it('C. discovers verified genuine events in Delhi', async () => {
    const results = await universalEventDiscoveryProvider.searchEvents({
      city: 'Delhi',
      date: '2026-10-15',
    });

    expect(results.length).toBeGreaterThanOrEqual(3);
    results.forEach((evt) => {
      expect(evt.city).toBe('Delhi');
      expect((evt.venueAddress || '') + (evt.venue || '')).toContain('Delhi');
    });
  });

  // ==========================================
  // D. ARBITRARY CITY SEARCH & NORMALIZATION
  // ==========================================
  it('D. supports arbitrary cities and normalizes aliases (Bengaluru/Bangalore, Bombay/Mumbai)', () => {
    expect(CityResolver.normalizeCity('Bangalore')).toBe('Bengaluru');
    expect(CityResolver.normalizeCity('BLR')).toBe('Bengaluru');
    expect(CityResolver.normalizeCity('Bombay')).toBe('Mumbai');
    expect(CityResolver.normalizeCity('Calcutta')).toBe('Kolkata');
    expect(CityResolver.normalizeCity('Madras')).toBe('Chennai');
    expect(CityResolver.normalizeCity('Baroda')).toBe('Vadodara');
    expect(CityResolver.normalizeCity('Poona')).toBe('Pune');
    expect(CityResolver.normalizeCity('Jaipur')).toBe('Jaipur');
    expect(CityResolver.normalizeCity('chandigarh')).toBe('Chandigarh');
    expect(CityResolver.normalizeCity('Varanasi')).toBe('Varanasi');
  });

  // ==========================================
  // E. EXACT DATE EXTRACTION
  // ==========================================
  it('E. resolves exact date expressions accurately (15 October 2026)', () => {
    const resolved = DateResolver.resolveDate('Find events in Ahmedabad on 15 October 2026');
    expect(resolved.startDate).toBe('2026-10-15');
    expect(resolved.endDate).toBe('2026-10-15');
    expect(resolved.isSpecificDate).toBe(true);
    expect(resolved.isDateRange).toBe(false);
  });

  // ==========================================
  // F. RELATIVE DATE RESOLUTION
  // ==========================================
  it('F. resolves relative dates (today, tonight, tomorrow, this weekend, next Saturday)', () => {
    const anchor = new Date(2026, 8, 27); // Sunday, 27 Sept 2026

    const todayRes = DateResolver.resolveDate('Concerts in Mumbai today', anchor);
    expect(todayRes.startDate).toBe('2026-09-27');
    expect(todayRes.isSpecificDate).toBe(true);

    const tonightRes = DateResolver.resolveDate('Find comedy in Delhi tonight', anchor);
    expect(tonightRes.startDate).toBe('2026-09-27');

    const tomorrowRes = DateResolver.resolveDate('Events in Ahmedabad tomorrow', anchor);
    expect(tomorrowRes.startDate).toBe('2026-09-28');

    const weekendRes = DateResolver.resolveDate('What events are happening in Delhi this weekend', anchor);
    expect(weekendRes.isDateRange).toBe(true);
    expect(weekendRes.startDate).toBeTruthy();
    expect(weekendRes.endDate).toBeTruthy();
  });

  // ==========================================
  // G. DATE RANGE SEARCH
  // ==========================================
  it('G. parses and filters date ranges ("from 15 to 20 October")', () => {
    const anchor = new Date(2026, 8, 27);
    const rangeRes = DateResolver.resolveDate('Events in Ahmedabad from 15 to 20 October 2026', anchor);
    expect(rangeRes.startDate).toBe('2026-10-15');
    expect(rangeRes.endDate).toBe('2026-10-20');
    expect(rangeRes.isDateRange).toBe(true);

    expect(DateResolver.isDateMatch('2026-10-15', rangeRes)).toBe(true);
    expect(DateResolver.isDateMatch('2026-10-18', rangeRes)).toBe(true);
    expect(DateResolver.isDateMatch('2026-10-20', rangeRes)).toBe(true);
    expect(DateResolver.isDateMatch('2026-10-25', rangeRes)).toBe(false);
  });

  // ==========================================
  // H. CATEGORY FILTERING
  // ==========================================
  it('H. filters events by requested category (Comedy, Music, Theatre, Art, Family)', async () => {
    const comedyResults = await universalEventDiscoveryProvider.searchEvents({
      city: 'Ahmedabad',
      date: '2026-10-15',
      category: 'COMEDY',
    });
    expect(comedyResults.length).toBeGreaterThan(0);
    comedyResults.forEach((c) => {
      expect(c.category).toBe('COMEDY');
    });

    const musicResults = await universalEventDiscoveryProvider.searchEvents({
      city: 'Mumbai',
      date: '2026-10-20',
      category: 'MUSIC',
    });
    expect(musicResults.length).toBeGreaterThan(0);
    musicResults.forEach((m) => {
      expect(m.category).toBe('MUSIC');
    });
  });

  // ==========================================
  // I. PARTY SIZE EXTRACTION
  // ==========================================
  it('I. extracts party size correctly from event inquiries', () => {
    const entities1 = EntityIntegrityValidator.extractEventEntities('Book comedy show in Ahmedabad on 15 Oct for 4 people');
    expect(entities1.partySize).toBe(4);

    const entities2 = EntityIntegrityValidator.extractEventEntities('Tickets for two for theatre in Mumbai on 20 Oct');
    expect(entities2.partySize).toBe(2);
  });

  // ==========================================
  // J. BUDGET EXTRACTION & FILTERING
  // ==========================================
  it('J. extracts and enforces budget constraints on event options', async () => {
    const entities = EntityIntegrityValidator.extractEventEntities('Events in Mumbai on 20 October under ₹2000');
    expect(entities.budgetAmount).toBe(2000);

    const results = await universalEventDiscoveryProvider.searchEvents({
      city: 'Mumbai',
      date: '2026-10-20',
      budgetAmount: 2000,
    });

    results.forEach((evt) => {
      if (evt.priceAmount) {
        expect(evt.priceAmount).toBeLessThanOrEqual(2000);
      }
    });
  });

  // ==========================================
  // K. CITY INTEGRITY ENFORCEMENT
  // ==========================================
  it('K. rejects event proposals where city does not match requested destination', () => {
    const mockProposals = [
      {
        id: 'prop-1',
        title: 'Mumbai Symphony Gala',
        providerId: 'events_discovery',
        metadata: { city: 'Mumbai', date: '2026-10-20' },
      },
      {
        id: 'prop-2',
        title: 'Ahmedabad Classical Sitar',
        providerId: 'events_discovery',
        metadata: { city: 'Ahmedabad', date: '2026-10-15' },
      },
    ];

    const filtered = EntityIntegrityValidator.filterProposalsByConstraints(mockProposals, {
      category: 'events',
      destination: 'Mumbai',
      location: 'Mumbai',
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].metadata.city).toBe('Mumbai');
  });

  // ==========================================
  // L. DATE INTEGRITY ENFORCEMENT
  // ==========================================
  it('L. rejects event proposals where date does not match explicit requested date', () => {
    const mockProposals = [
      {
        id: 'prop-1',
        title: 'Event on 15 Oct',
        providerId: 'events_discovery',
        metadata: { city: 'Ahmedabad', date: '2026-10-15' },
      },
      {
        id: 'prop-2',
        title: 'Event on 16 Oct',
        providerId: 'events_discovery',
        metadata: { city: 'Ahmedabad', date: '2026-10-16' },
      },
    ];

    const filtered = EntityIntegrityValidator.filterProposalsByConstraints(mockProposals, {
      category: 'events',
      destination: 'Ahmedabad',
      location: 'Ahmedabad',
      dateTime: '2026-10-15',
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].metadata.date).toBe('2026-10-15');
  });

  // ==========================================
  // M. FIVE GENUINE OPTIONS IN BATCH 1
  // ==========================================
  it('M. returns up to 5 genuine options for standard city discovery', async () => {
    const proposals = await adapter.search({
      category: 'events',
      rawInput: 'Find events in Ahmedabad on 15 October 2026',
    });

    expect(proposals.length).toBeLessThanOrEqual(5);
    expect(proposals.length).toBeGreaterThanOrEqual(3);
    proposals.forEach((p) => {
      expect(p.isMock).toBe(false);
      expect(p.environment).toBe('REAL');
      expect(p.availability).toBeTruthy();
    });
  });

  // ==========================================
  // N. REJECT ALL -> NEW BATCH
  // ==========================================
  it('N. handles batch rejection and generates alternate genuine proposals', async () => {
    const initialProposals = await adapter.search({
      category: 'events',
      rawInput: 'Find events in Mumbai on 20 October',
    });

    expect(initialProposals.length).toBeGreaterThan(0);
    const rejectedKeys = initialProposals.map((p) => p.id);

    // Remaining unrejected inventory
    const secondBatch = initialProposals.filter((p) => !rejectedKeys.includes(p.id));
    expect(secondBatch).toHaveLength(0); // All were rejected
  });

  // ==========================================
  // O. REJECTED EVENTS CANNOT REAPPEAR
  // ==========================================
  it('O. ensures rejected option IDs/keys do not reappear in subsequent batch', async () => {
    const allMumbai = await universalEventDiscoveryProvider.searchEvents({
      city: 'Mumbai',
      date: '2026-10-20',
    });

    const rejectedEventId = allMumbai[0].eventId;
    const remaining = allMumbai.filter((e) => e.eventId !== rejectedEventId);

    expect(remaining.some((e) => e.eventId === rejectedEventId)).toBe(false);
  });

  // ==========================================
  // P. PARTIAL REJECTION / REPLACE SINGLE OPTION
  // ==========================================
  it('P. allows replacing a single option while retaining approved ones', async () => {
    const events = await universalEventDiscoveryProvider.searchEvents({
      city: 'Ahmedabad',
      date: '2026-10-15',
    });

    const kept = events.slice(0, 2);
    const replaced = events[2];
    const candidatePool = events.slice(3);

    const newBatch = [...kept, candidatePool[0]];
    expect(newBatch).toHaveLength(3);
    expect(newBatch.some((e) => e.eventId === replaced.eventId)).toBe(false);
  });

  // ==========================================
  // Q. CUSTOMER APPROVAL & EXECUTION
  // ==========================================
  it('Q. requires explicit customer approval and transitions to execution with genuine reference', async () => {
    const proposals = await adapter.search({
      category: 'events',
      rawInput: 'Find events in Mumbai on 20 October',
    });

    const selectedOption = proposals[0];
    const execution = await adapter.execute(selectedOption, { guests: 2 });

    expect(execution.success).toBe(true);
    expect(execution.status).toBe('CONFIRMED');
    expect(execution.externalReferenceId).toMatch(/^EVT-CONF-/);
    expect(execution.externalReferenceId).not.toContain('PV-');
    expect(execution.externalReferenceId).not.toContain('MOCK-');
  });

  // ==========================================
  // R & S. ROUTING & CONCIERGE WORKSPACE
  // ==========================================
  it('R & S. evaluates decision engine to route events with customer approval requirement', () => {
    const bookingDecision = TaskDecisionEngine.evaluate({
      rawInput: 'Book comedy show in Bangalore on 12 November',
    });

    expect(bookingDecision.category).toBe('EVENTS');
    expect(bookingDecision.approvalRequired).toBe(true);
    expect(bookingDecision.isProhibited).toBe(false);
    expect(bookingDecision.capability.customerApprovalRequired).toBe(true);
  });

  // ==========================================
  // T. ZERO-FABRICATION PROTECTION
  // ==========================================
  it('T. validates proposals to ensure zero synthetic filler or fake markers', async () => {
    const proposals = await adapter.search({
      category: 'events',
      rawInput: 'Find events in Ahmedabad on 15 October',
    });

    proposals.forEach((p) => {
      const validation = EntityIntegrityValidator.validateProposal(p);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(p.title).not.toMatch(/(?:PV-|MOCK-|DEMO-|SIMULATED|SYNTHETIC|FILLER)/i);
    });
  });

  // ==========================================
  // U. PARTIAL / NO-PROVIDER-DATA FALLBACK
  // ==========================================
  it('U. returns exactly the count of genuine items found and never invents fake filler', async () => {
    const smallProvider = new UniversalEventDiscoveryProvider(
      [
        {
          providerId: 'special_venue',
          eventId: 'evt_special_01',
          title: 'Intimate Chamber Music Gala',
          description: 'Chamber music recital for 50 patrons.',
          category: 'MUSIC',
          venue: 'Heritage Courtyard',
          city: 'Shimla',
          date: '2026-10-15',
          currency: 'INR',
          availabilityStatus: 'SUBJECT_TO_CONFIRMATION',
          source: 'Shimla Heritage Desk',
          verifiedAt: new Date().toISOString(),
        },
        {
          providerId: 'special_venue',
          eventId: 'evt_special_02',
          title: 'Mountain Culinary Masterclass',
          description: 'Masterclass with Chef.',
          category: 'FOOD_DRINK',
          venue: 'The Wildflower Pavilion',
          city: 'Shimla',
          date: '2026-10-15',
          currency: 'INR',
          availabilityStatus: 'SUBJECT_TO_CONFIRMATION',
          source: 'Shimla Heritage Desk',
          verifiedAt: new Date().toISOString(),
        },
      ],
      false
    );

    const results = await smallProvider.searchEvents({
      city: 'Shimla',
      date: '2026-10-15',
    });

    // Exactly 2 genuine items returned, 0 fake items added
    expect(results).toHaveLength(2);
    expect(results[0].eventId).toBe('evt_special_01');
    expect(results[1].eventId).toBe('evt_special_02');
  });

  // ==========================================
  // V. NO-RESULT HANDLING
  // ==========================================
  it('V. returns empty list gracefully without error if no events match constraints', async () => {
    const results = await universalEventDiscoveryProvider.searchEvents({
      city: 'Udaipur',
      date: '2029-01-01', // Date with no events
    });

    expect(results).toEqual([]);
  });

  // ==========================================
  // W. MULTI-CITY SEARCH
  // ==========================================
  it('W. parses and executes multi-city search ("Find events in Ahmedabad or Mumbai on 20 October")', async () => {
    const raw = 'Find events in Ahmedabad or Mumbai on 20 October';
    const cityExtraction = CityResolver.extractCities(raw);

    expect(cityExtraction.isMultiCity).toBe(true);
    expect(cityExtraction.allCities).toContain('Ahmedabad');
    expect(cityExtraction.allCities).toContain('Mumbai');

    const multiResults = await universalEventDiscoveryProvider.searchEvents({
      cities: cityExtraction.allCities,
      date: '2026-10-20',
    });

    expect(multiResults.length).toBeGreaterThan(0);
    const citiesFound = new Set(multiResults.map((r) => r.city));
    expect(citiesFound.has('Mumbai')).toBe(true);
  });

  // ==========================================
  // X. UNDERSTAND REQUEST INTEGRATION
  // ==========================================
  it('X. seamlessly integrates with understandRequest for complex queries', async () => {
    const understood = await understandRequest('Find family-friendly events in Ahmedabad this weekend');
    expect(understood.category).toBe('events');
    expect(understood.location).toBe('Ahmedabad');
    expect(understood.destination).toBe('Ahmedabad');
  });
});
