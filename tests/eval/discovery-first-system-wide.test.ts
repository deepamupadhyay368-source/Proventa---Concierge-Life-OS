import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AutonomousDiscoveryEngine } from '@/lib/orchestration/discovery/engine';
import { TaskDecisionEngine } from '@/lib/capabilities/task-decision-engine';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { AdapterRegistry } from '@/lib/orchestration/adapters';
import { CinemaAdapter } from '@/lib/orchestration/adapters/cinema.adapter';
import { FlightsAdapter } from '@/lib/orchestration/adapters/flights.adapter';
import { DuffelFlightsAdapter } from '@/lib/orchestration/adapters/duffel-flights.adapter';
import { buildSynthesizedPrompt, StructuredRequestForm } from '@/lib/requests/request-builder';
import { understandRequest } from '@/lib/ai/agents/understanding';

describe('PROVENTA — SYSTEM-WIDE DISCOVERY-FIRST ARCHITECTURAL REGRESSION AUDIT', () => {
  // ----------------------------------------------------------------
  // 1. FLIGHTS: Discovery-First without Duffel Live Credentials
  // ----------------------------------------------------------------
  it('1. FLIGHTS: should discover genuine flight options without live Duffel API keys', async () => {
    const rawInput = 'Book 1 economy class flight from Ahmedabad to Mumbai on 2026-10-15';
    
    // Evaluate Decision
    const decision = TaskDecisionEngine.evaluate({ rawInput });
    expect(decision.category).toBe('TRAVEL');
    expect(decision.isProhibited).toBe(false);

    // Autonomous Discovery Engine must query available flight sources (e.g. FlightsAdapter schedule intelligence)
    const discoveryResult = await AutonomousDiscoveryEngine.discover({
      originalRequest: rawInput,
      category: 'flights',
      origin: 'AMD',
      destination: 'BOM',
      dates: { exact: '2026-10-15' },
      partySize: 1,
    });

    expect(discoveryResult.status).toBe('SUCCESS');
    expect(discoveryResult.options.length).toBeGreaterThan(0);
    expect(discoveryResult.options.length).toBeLessThanOrEqual(25);
    
    // Verify first flight option has genuine schedule metadata
    const topFlight = discoveryResult.options[0];
    expect(topFlight.title).toBeDefined();
    expect(topFlight.priceAmount).toBeGreaterThan(0);
    expect(topFlight.metadata?.departureAirport).toBe('AMD');
  });

  // ----------------------------------------------------------------
  // 2. MOVIES: Discovery-First without Cinema Booking API Keys
  // ----------------------------------------------------------------
  it('2. MOVIES: should discover genuine cinema showtime & auditorium options before Concierge', async () => {
    const rawInput = 'Book 2 movie tickets for Inception in Ahmedabad on 2026-10-15';

    // Evaluate Decision
    const decision = TaskDecisionEngine.evaluate({ rawInput });
    expect(decision.category).toBe('MOVIES_ENTERTAINMENT');

    // Autonomous Discovery Engine must return genuine auditoriums
    const discoveryResult = await AutonomousDiscoveryEngine.discover({
      originalRequest: rawInput,
      category: 'movies',
      location: 'Ahmedabad',
      partySize: 2,
    });

    expect(discoveryResult.status).toBe('SUCCESS');
    expect(discoveryResult.options.length).toBeGreaterThan(0);
    expect(discoveryResult.options.length).toBeLessThanOrEqual(25);

    const topCinema = discoveryResult.options[0];
    expect(topCinema.providerName).toContain('PVR INOX');
    expect(topCinema.metadata?.multiplex).toBeDefined();
    expect(topCinema.metadata?.showtime).toBeDefined();
  });

  // ----------------------------------------------------------------
  // 3. DINING: Discovery-First for Fine Dining
  // ----------------------------------------------------------------
  it('3. DINING: should discover genuine fine dining reservations in Ahmedabad', async () => {
    const rawInput = 'Reserve a table for 2 at Agashiye Ahmedabad tonight at 8 PM';

    const decision = TaskDecisionEngine.evaluate({ rawInput });
    expect(decision.category).toBe('DINING');

    const discoveryResult = await AutonomousDiscoveryEngine.discover({
      originalRequest: rawInput,
      category: 'dining',
      location: 'Ahmedabad',
      partySize: 2,
    });

    expect(discoveryResult.status).toBe('SUCCESS');
    expect(discoveryResult.options.length).toBeGreaterThan(0);
    expect(discoveryResult.options.some((o) => o.title.toLowerCase().includes('agashiye') || o.providerName.toLowerCase().includes('agashiye'))).toBe(true);
  });

  // ----------------------------------------------------------------
  // 4. EVENTS: Discovery-First for Garba / Festivals
  // ----------------------------------------------------------------
  it('4. EVENTS: should discover genuine event & Garba passes in Ahmedabad', async () => {
    const rawInput = 'Book 3 Garba passes in Ahmedabad on October 15, 2026';

    const decision = TaskDecisionEngine.evaluate({ rawInput });
    expect(decision.category).toBe('EVENTS');

    const discoveryResult = await AutonomousDiscoveryEngine.discover({
      originalRequest: rawInput,
      category: 'events',
      location: 'Ahmedabad',
      partySize: 3,
    });

    expect(discoveryResult.status).toBe('SUCCESS');
    expect(discoveryResult.options.length).toBeGreaterThan(0);
    expect(discoveryResult.options.some((o) => o.title.toLowerCase().includes('garba') || o.title.toLowerCase().includes('navratri'))).toBe(true);
  });

  // ----------------------------------------------------------------
  // 5. HEALTHCARE: Discovery-First for Doctor Consultations
  // ----------------------------------------------------------------
  it('5. HEALTHCARE: should discover verified doctors in Ahmedabad', async () => {
    const rawInput = 'Book an appointment with Dr. Tejas Patel cardiologist in Ahmedabad';

    const decision = TaskDecisionEngine.evaluate({ rawInput });
    expect(decision.category).toBe('APPOINTMENTS');

    const discoveryResult = await AutonomousDiscoveryEngine.discover({
      originalRequest: rawInput,
      category: 'healthcare',
      location: 'Ahmedabad',
      partySize: 1,
    });

    expect(discoveryResult.status).toBe('SUCCESS');
    expect(discoveryResult.options.length).toBeGreaterThan(0);
    expect(discoveryResult.options.some((o) => o.title.toLowerCase().includes('tejas patel') || o.description.toLowerCase().includes('cardiolog'))).toBe(true);
  });

  // ----------------------------------------------------------------
  // 6. TRANSPORT: Discovery-First for Chauffeur Transfers
  // ----------------------------------------------------------------
  it('6. TRANSPORT: should discover executive sedan transfers in Ahmedabad', async () => {
    const rawInput = 'Book an executive sedan chauffeur pickup from SVPIA Airport to SG Highway in Ahmedabad';

    const decision = TaskDecisionEngine.evaluate({ rawInput });
    expect(decision.category).toBe('TRANSPORT');

    const discoveryResult = await AutonomousDiscoveryEngine.discover({
      originalRequest: rawInput,
      category: 'mobility',
      location: 'Ahmedabad',
      partySize: 2,
    });

    expect(discoveryResult.status).toBe('SUCCESS');
    expect(discoveryResult.options.length).toBeGreaterThan(0);
  });

  // ----------------------------------------------------------------
  // 7. GIFTING: Discovery-First for Curated Gift Hampers
  // ----------------------------------------------------------------
  it('7. GIFTING: should discover curated luxury gift hampers in Ahmedabad', async () => {
    const rawInput = 'Send a luxury chocolate gift hamper in Ahmedabad';

    const decision = TaskDecisionEngine.evaluate({ rawInput });
    expect(decision.category).toBe('GIFTS');

    const discoveryResult = await AutonomousDiscoveryEngine.discover({
      originalRequest: rawInput,
      category: 'gifts',
      location: 'Ahmedabad',
      partySize: 1,
    });

    expect(discoveryResult.status).toBe('SUCCESS');
    expect(discoveryResult.options.length).toBeGreaterThan(0);
  });

  // ----------------------------------------------------------------
  // 8. TRIPS & WEEKEND ESCAPES: Discovery-First for Luxury Getaways
  // ----------------------------------------------------------------
  it('8. TRIPS: should discover curated weekend escape itineraries and properties', async () => {
    const rawInput = 'Plan a 3-day luxury weekend escape to Udaipur from Ahmedabad';

    const decision = TaskDecisionEngine.evaluate({ rawInput });
    expect(decision.category).toBe('WEEKEND_ESCAPES');

    const discoveryResult = await AutonomousDiscoveryEngine.discover({
      originalRequest: rawInput,
      category: 'weekend_escapes',
      destination: 'Udaipur',
      origin: 'Ahmedabad',
      partySize: 2,
    });

    expect(discoveryResult.status).toBe('SUCCESS');
    expect(discoveryResult.options.length).toBeGreaterThan(0);
  });

  // ----------------------------------------------------------------
  // 9. Structured Request Composer Synthesized Form Discovery
  // ----------------------------------------------------------------
  it('9. STRUCTURED COMPOSER: synthesized prompts for FLIGHTS & MOVIES must trigger discovery seamlessly', async () => {
    // Structured Flight Form
    const flightForm: StructuredRequestForm = {
      service: 'FLIGHTS',
      origin: 'Ahmedabad',
      destination: 'Mumbai',
      cabinClass: 'BUSINESS',
      tripType: 'ONE_WAY',
      date: '2026-10-15',
      partySize: 2,
      budgetMode: 'FLEXIBLE',
      preferences: ['Morning Window'],
      urgency: 'NORMAL',
    };

    const flightPrompt = buildSynthesizedPrompt(flightForm);
    expect(flightPrompt).toContain('business class');
    const flightDecision = TaskDecisionEngine.evaluate({ rawInput: flightPrompt, category: flightForm.service });
    expect(flightDecision.category).toBe('TRAVEL');

    const flightDiscovery = await AutonomousDiscoveryEngine.discover({
      originalRequest: flightPrompt,
      category: flightForm.service,
      origin: flightForm.origin,
      destination: flightForm.destination,
      partySize: flightForm.partySize,
    });
    expect(flightDiscovery.status).toBe('SUCCESS');
    expect(flightDiscovery.options.length).toBeGreaterThan(0);

    // Structured Movie Form
    const movieForm: StructuredRequestForm = {
      service: 'MOVIES',
      city: 'Ahmedabad',
      targetName: 'Inception',
      partySize: 2,
      date: '2026-10-15',
      timeSlot: 'EVENING',
      budgetMode: 'FLEXIBLE',
      preferences: ['IMAX Laser / Recliner seating'],
      urgency: 'NORMAL',
    };

    const moviePrompt = buildSynthesizedPrompt(movieForm);
    expect(moviePrompt).toContain('movie');
    const movieDecision = TaskDecisionEngine.evaluate({ rawInput: moviePrompt, category: movieForm.service });
    expect(movieDecision.category).toBe('MOVIES_ENTERTAINMENT');

    const movieDiscovery = await AutonomousDiscoveryEngine.discover({
      originalRequest: moviePrompt,
      category: movieForm.service,
      location: movieForm.city,
      partySize: movieForm.partySize,
    });
    expect(movieDiscovery.status).toBe('SUCCESS');
    expect(movieDiscovery.options.length).toBeGreaterThan(0);
  });

  // ----------------------------------------------------------------
  // 10. Foundational Architectural Rule: Discovery Independent of Execution
  // ----------------------------------------------------------------
  it('10. INVARIANT: Discovery status is SUCCESS with genuine options even when execution provider is NOT configured', async () => {
    // Unconfigured environment simulation
    const originalDuffelKey = process.env.DUFFEL_API_KEY;
    const originalCinemaKey = process.env.CINEMA_API_KEY;
    delete process.env.DUFFEL_API_KEY;
    delete process.env.CINEMA_API_KEY;

    try {
      const flightDiscovery = await AutonomousDiscoveryEngine.discover({
        originalRequest: 'Book flight from Ahmedabad to Delhi',
        category: 'flights',
        origin: 'AMD',
        destination: 'DEL',
        partySize: 1,
      });

      expect(flightDiscovery.status).toBe('SUCCESS');
      expect(flightDiscovery.options.length).toBeGreaterThan(0);
      expect(flightDiscovery.executionCapability).toBe('HUMAN_CONCIERGE'); // Gated until approved

      const movieDiscovery = await AutonomousDiscoveryEngine.discover({
        originalRequest: 'Book 2 tickets for Interstellar at IMAX Ahmedabad',
        category: 'movies',
        location: 'Ahmedabad',
        partySize: 2,
      });

      expect(movieDiscovery.status).toBe('SUCCESS');
      expect(movieDiscovery.options.length).toBeGreaterThan(0);
      expect(movieDiscovery.executionCapability).toBe('HUMAN_CONCIERGE'); // Gated until approved
    } finally {
      if (originalDuffelKey) process.env.DUFFEL_API_KEY = originalDuffelKey;
      if (originalCinemaKey) process.env.CINEMA_API_KEY = originalCinemaKey;
    }
  });
});
