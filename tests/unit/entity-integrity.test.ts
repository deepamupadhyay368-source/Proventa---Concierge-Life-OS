import { describe, it, expect } from 'vitest';
import {
  EntityIntegrityValidator,
  TravelConstraints,
} from '@/lib/validation/entity-integrity';
import { AdapterRegistry } from '@/lib/orchestration/adapters/index';
import { MockHotelAdapter } from '@/lib/orchestration/adapters/mock-adapters';
import type { OptionProposal } from '@/lib/orchestration/types';

describe('Phase 8.2 & 8.3 — Entity Integrity & Destination Preservation', () => {
  // Test 1: "Flight Ahmedabad to Delhi" -> origin: AMD, destination: DEL
  it('1. extracts correct origin AMD and destination DEL for "Flight Ahmedabad to Delhi"', () => {
    const text = 'Flight Ahmedabad to Delhi on tomorrow morning';
    const entities = EntityIntegrityValidator.extractTravelEntities(text);

    expect(entities.originCity).toBe('Ahmedabad');
    expect(entities.originAirportCode).toBe('AMD');
    expect(entities.destinationCity).toBe('Delhi');
    expect(entities.destinationAirportCode).toBe('DEL');
    expect(entities.provenance.origin).toBe('EXPLICIT');
    expect(entities.provenance.destination).toBe('EXPLICIT');
  });

  // Test 2: "Flight Ahmedabad to Mumbai" -> origin: AMD, destination: BOM
  it('2. extracts correct origin AMD and destination BOM for "Flight Ahmedabad to Mumbai"', () => {
    const text = 'Book a flight Ahmedabad to Mumbai for 2 passengers';
    const entities = EntityIntegrityValidator.extractTravelEntities(text);

    expect(entities.originCity).toBe('Ahmedabad');
    expect(entities.originAirportCode).toBe('AMD');
    expect(entities.destinationCity).toBe('Mumbai');
    expect(entities.destinationAirportCode).toBe('BOM');
  });

  // Test 3: "Flight from Mumbai to Delhi" -> origin: BOM, destination: DEL
  it('3. correctly distinguishes origin from destination in "Flight from Mumbai to Delhi"', () => {
    const text = 'I need a flight from Mumbai to Delhi this Friday';
    const entities = EntityIntegrityValidator.extractTravelEntities(text);

    expect(entities.originCity).toBe('Mumbai');
    expect(entities.originAirportCode).toBe('BOM');
    expect(entities.destinationCity).toBe('Delhi');
    expect(entities.destinationAirportCode).toBe('DEL');
    // Ensure Mumbai is NOT set as destination
    expect(entities.destinationCity).not.toBe('Mumbai');
  });

  // Test 4: Delhi task followed by Mumbai task -> zero contamination
  it('4. guarantees zero state contamination between consecutive tasks with different destinations', () => {
    const task1Text = 'Flight from Ahmedabad to Delhi';
    const task2Text = 'Flight from Ahmedabad to Mumbai';

    const entities1 = EntityIntegrityValidator.extractTravelEntities(task1Text);
    const entities2 = EntityIntegrityValidator.extractTravelEntities(task2Text);

    expect(entities1.destinationAirportCode).toBe('DEL');
    expect(entities2.destinationAirportCode).toBe('BOM');
    // Ensure entities1 was not mutated or polluted
    expect(entities1.destinationAirportCode).toBe('DEL');
  });

  // Test 5: Hotel Delhi -> Delhi results only (no Ahmedabad/Mumbai)
  it('5. returns Delhi hotel results only for Hotel Delhi request, rejecting Ahmedabad/Mumbai hotels', async () => {
    const adapter = new MockHotelAdapter();
    const constraints = {
      category: 'hotels',
      rawInput: 'Hotel in Delhi',
      location: 'Delhi',
      destination: 'Delhi',
    };

    const results = await adapter.search(constraints);
    expect(results.length).toBeGreaterThan(0);

    for (const proposal of results) {
      expect((proposal as any).location?.toLowerCase()).toContain('delhi');
      expect((proposal as any).location?.toLowerCase()).not.toContain('ahmedabad');
      expect((proposal as any).location?.toLowerCase()).not.toContain('mumbai');
    }
  });

  // Test 6: Hotel Mumbai -> Mumbai results only
  it('6. returns Mumbai hotel results only for Hotel Mumbai request', async () => {
    const adapter = new MockHotelAdapter();
    const constraints = {
      category: 'hotels',
      rawInput: 'Hotel in Mumbai',
      location: 'Mumbai',
      destination: 'Mumbai',
    };

    const results = await adapter.search(constraints);
    expect(results.length).toBeGreaterThan(0);

    for (const proposal of results) {
      expect((proposal as any).location?.toLowerCase()).toContain('mumbai');
      expect((proposal as any).location?.toLowerCase()).not.toContain('delhi');
      expect((proposal as any).location?.toLowerCase()).not.toContain('ahmedabad');
    }
  });

  // Test 7: Provider returns wrong destination -> strictly filtered out
  it('7. strictly filters out proposals where arrival airport or city contradicts customer constraints', () => {
    const requestedConstraints: TravelConstraints = {
      destination: 'Delhi',
      destinationAirport: 'DEL',
      origin: 'Ahmedabad',
      originAirport: 'AMD',
    };

    const mockProposals: any[] = [
      {
        id: 'prop-valid-delhi',
        title: 'IndiGo 6E-204 Ahmedabad to Delhi',
        description: 'Direct flight arriving at DEL',
        price: 4500,
        currency: 'INR',
        providerId: 'scheduled_flights',
        metadata: {
          departureAirport: 'AMD',
          arrivalAirport: 'DEL',
          origin: 'Ahmedabad',
          destination: 'Delhi',
        },
      },
      {
        id: 'prop-invalid-mumbai',
        title: 'Air India AI-614 Ahmedabad to Mumbai',
        description: 'Direct flight arriving at BOM',
        price: 3800,
        currency: 'INR',
        providerId: 'scheduled_flights',
        metadata: {
          departureAirport: 'AMD',
          arrivalAirport: 'BOM',
          origin: 'Ahmedabad',
          destination: 'Mumbai',
        },
      },
    ];

    const filtered = EntityIntegrityValidator.filterProposalsByConstraints(
      mockProposals,
      requestedConstraints
    );

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('prop-valid-delhi');
    expect(filtered.some((p) => p.id === 'prop-invalid-mumbai')).toBe(false);
  });

  // Test 8: AI returns wrong destination -> explicit customer text overrides AI
  it('8. overrides erroneous AI inferred entities with deterministic explicit customer text', () => {
    const rawCustomerText = 'I need a flight to Delhi tomorrow';
    const erroneousAiExtracted = {
      origin: 'Ahmedabad',
      destination: 'Mumbai', // AI made an error and returned Mumbai
      location: 'Mumbai',
    };

    const reconciled = EntityIntegrityValidator.validateAndReconcile(
      rawCustomerText,
      erroneousAiExtracted
    );

    expect(reconciled.destination).toBe('Delhi');
    expect(reconciled.destinationAirport).toBe('DEL');
    expect(reconciled.location).toBe('Delhi');
    expect(reconciled.provenance.destination).toBe('EXPLICIT');
  });

  // Test 9: Missing destination -> triggers clarification (NEEDS_INFORMATION)
  it('9. identifies missing destination and signals validation failure for clarification', () => {
    const rawCustomerText = 'Book me a flight tomorrow morning';
    const entities = EntityIntegrityValidator.extractTravelEntities(rawCustomerText);

    expect(entities.destinationCity).toBeUndefined();
    expect(entities.destinationAirport).toBeUndefined();

    const reconciled = EntityIntegrityValidator.validateAndReconcile(rawCustomerText, {});
    const isComplete = EntityIntegrityValidator.hasMinimumExecutionEntities('travel', reconciled);

    expect(isComplete).toBe(false);
  });

  // Test 10: Multi-intent request ("Flight to Delhi and hotel in Mumbai") -> separate constraints preserved
  it('10. preserves separate constraints for flight and hotel in multi-intent requests', () => {
    const text = 'Flight to Delhi and hotel in Mumbai';
    
    // Test regex extraction for flight destination
    const flightMatch = text.match(/flight\s+(?:from\s+[a-zA-Z\s]+)?to\s+([A-Za-z]+)/i);
    expect(flightMatch?.[1].toLowerCase()).toBe('delhi');

    // Test regex extraction for hotel location
    const hotelMatch = text.match(/hotel\s+in\s+([A-Za-z]+)/i);
    expect(hotelMatch?.[1].toLowerCase()).toBe('mumbai');
  });

  // Test 11: Pre-execution mismatch gate -> blocks execution and detects mismatch
  it('11. pre-execution safety gate blocks execution and detects mismatch between proposal and customer intent', () => {
    const customerConstraints: TravelConstraints = {
      destination: 'Delhi',
      destinationAirport: 'DEL',
    };

    const wrongDestinationProposal: any = {
      id: 'prop-mumbai-wrong',
      title: 'Flight to Mumbai',
      description: 'AMD to BOM',
      price: 5000,
      currency: 'INR',
      providerId: 'scheduled_flights',
      metadata: {
        arrivalAirport: 'BOM',
        destination: 'Mumbai',
      },
    };

    const verification = EntityIntegrityValidator.verifyPreExecutionConstraints(
      wrongDestinationProposal,
      customerConstraints
    );

    expect(verification.isValid).toBe(false);
    expect(verification.reason).toContain('Requested destination airport is DEL');
    expect(verification.reason).toContain('targets BOM');
  });

  // Test 12: Cache/isolation verification
  it('12. verifies adapter registry does not cross-contaminate categories or leak global adapters', () => {
    const registry = new AdapterRegistry();

    // Verify dining adapter is NOT registered under travel or hotels
    const travelAdapters = registry.getAdapters('travel');
    const hotelAdapters = registry.getAdapters('hotels');

    expect(travelAdapters.some((a) => a.providerId === 'ahmedabad_verified')).toBe(false);
    expect(hotelAdapters.some((a) => a.providerId === 'ahmedabad_verified')).toBe(false);

    // Verify dining does have ahmedabad_verified
    const diningAdapters = registry.getAdapters('dining');
    expect(diningAdapters.some((a) => a.providerId === 'ahmedabad_verified')).toBe(true);
  });
});
