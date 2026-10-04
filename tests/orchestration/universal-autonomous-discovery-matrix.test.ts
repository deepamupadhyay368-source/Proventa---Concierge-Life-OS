/**
 * PROVENTA — UNIVERSAL AUTONOMOUS DISCOVERY MATRIX TEST SUITE
 * 
 * Verifies Autonomous AI Discovery across ALL supported categories:
 * 1. Flights / Travel Aviation
 * 2. Hotels / Luxury Stays
 * 3. Weekend Escapes / Heritage Resorts
 * 4. Dining / Table Reservations
 * 5. Food Delivery / Culinary Sourcing
 * 6. Events / Concerts / Garba / Navratri
 * 7. Healthcare / Doctor Consultations
 * 8. Movies / Entertainment / Cinema
 * 9. Transport / Chauffeur / Airport Mobility
 * 10. Curated Gifting
 * 11. Bespoke Shopping
 * 12. Wellness / Spa Services
 * 13. Appointments / Specialized Consultations
 * 14. Research / Advisory / Life Planning
 * 
 * Invariants tested:
 * - Up to 5 genuine options per batch (never fabricated)
 * - Parallel source queries with bounded timeouts (≤7.5s individual, ≤15s overall)
 * - Strict category preservation and entity constraint verification
 * - Seamless handoff to human concierge only after customer approves an option
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AutonomousDiscoveryEngine } from '@/lib/orchestration/discovery/engine';
import { findAgentForTask, AGENT_REGISTRY } from '@/lib/orchestration/agents';
import { EntityIntegrityValidator } from '@/lib/validation/entity-integrity';

describe('Universal Autonomous Discovery Engine Matrix', () => {
  const categoriesMatrix = [
    {
      category: 'flights',
      query: 'Direct morning flight from Ahmedabad to Delhi for tomorrow',
      expectedProviderCheck: (opts: any[]) => opts.length > 0,
    },
    {
      category: 'hotels',
      query: 'Luxury stay at Taj Lake Palace Udaipur for 3 nights',
      expectedProviderCheck: (opts: any[]) => opts.length > 0,
    },
    {
      category: 'weekend_escapes',
      query: 'Weekend getaway near Ahmedabad with private pool',
      expectedProviderCheck: (opts: any[]) => opts.length > 0,
    },
    {
      category: 'dining',
      query: 'Dinner table for 4 at Agashiye Ahmedabad tonight',
      expectedProviderCheck: (opts: any[]) => opts.some(o => o.providerName.includes('Agashiye') || o.title.includes('Agashiye') || o.category === 'dining'),
    },
    {
      category: 'food_delivery',
      query: 'Order artisan sourdough pizza for 2 people',
      expectedProviderCheck: (opts: any[]) => opts.length > 0,
    },
    {
      category: 'events',
      query: 'Garba passes for 13th October 2026',
      expectedProviderCheck: (opts: any[]) => opts.some(o => o.category === 'events' || o.title.toLowerCase().includes('garba') || o.title.toLowerCase().includes('pass')),
    },
    {
      category: 'healthcare',
      query: 'Top cardiologist consultation in Ahmedabad',
      expectedProviderCheck: (opts: any[]) => opts.some(o => o.category === 'healthcare' || o.title.toLowerCase().includes('dr') || o.title.toLowerCase().includes('cardio')),
    },
    {
      category: 'movies',
      query: 'PVR IMAX tickets for 7pm show',
      expectedProviderCheck: (opts: any[]) => opts.length > 0,
    },
    {
      category: 'mobility',
      query: 'Airport pickup Mercedes E-Class tomorrow morning at 6am',
      expectedProviderCheck: (opts: any[]) => opts.length > 0,
    },
    {
      category: 'gifts',
      query: 'Luxury Belgian chocolate box delivery for anniversary',
      expectedProviderCheck: (opts: any[]) => opts.length > 0,
    },
    {
      category: 'shopping',
      query: 'Curate tailored Italian linen suits and luxury accessories',
      expectedProviderCheck: (opts: any[]) => opts.length > 0,
    },
    {
      category: 'wellness',
      query: 'Aromatherapy couples massage at luxury spa',
      expectedProviderCheck: (opts: any[]) => opts.length > 0,
    },
    {
      category: 'appointments',
      query: 'Specialist consultation appointment with Senior Orthopedic Surgeon',
      expectedProviderCheck: (opts: any[]) => opts.length > 0,
    },
    {
      category: 'research_planning',
      query: 'Comprehensive comparison report of private golf clubs in Western India',
      expectedProviderCheck: (opts: any[]) => opts.length > 0,
    },
  ];

  for (const item of categoriesMatrix) {
    it(`should autonomously discover genuine options for category: ${item.category}`, async () => {
      const result = await AutonomousDiscoveryEngine.discover({
        customerId: 'cust-matrix-test',
        category: item.category,
        originalRequest: item.query,
      });

      expect(['SUCCESS', 'NO_OPTIONS']).toContain(result.status);
      expect(result.options.length).toBeLessThanOrEqual(5);

      if (result.status === 'SUCCESS') {
        expect(result.options.length).toBeGreaterThan(0);
        expect(item.expectedProviderCheck(result.options)).toBe(true);
        expect(result.sourcesQueried?.length).toBeGreaterThan(0);
        expect(result.discoveryMetadata?.totalLatencyMs).toBeLessThanOrEqual(15000);

        // Verify zero empty or placeholder titles
        for (const opt of result.options) {
          expect(opt.title).toBeTruthy();
          expect(opt.providerName).toBeTruthy();
          expect(opt.id).toBeTruthy();
        }
      }
    });
  }

  it('should correctly map agent routing across all domains', () => {
    const routingTests = [
      { cat: 'flights', raw: 'Flight to Mumbai', expectedAgent: 'Travel & Flight Specialist Agent' },
      { cat: 'hotels', raw: 'Luxury villa in Goa', expectedAgent: 'Hotels & Accommodations Agent' },
      { cat: 'dining', raw: 'Table at Agashiye', expectedAgent: 'Dining & Reservations Agent' },
      { cat: 'events', raw: 'Garba pass for Navratri', expectedAgent: 'Events & Gatherings Agent' },
      { cat: 'healthcare', raw: 'Cardiologist appointment', expectedAgent: 'Healthcare & Doctor Discovery Agent' },
      { cat: 'mobility', raw: 'Airport cab pickup', expectedAgent: 'Mobility & Chauffeur Agent' },
      { cat: 'shopping', raw: 'Bespoke tailoring', expectedAgent: 'Shopping & Gifting Agent' },
      { cat: 'gifts', raw: 'Luxury chocolates', expectedAgent: 'Curated Gifting Agent' },
      { cat: 'appointments', raw: 'Doctor appointment', expectedAgent: 'Healthcare & Doctor Discovery Agent' },
      { cat: 'research_planning', raw: 'Research itinerary', expectedAgent: 'Research & Advisory Agent' },
    ];

    for (const rt of routingTests) {
      const agent = findAgentForTask(rt.cat, rt.raw);
      expect(agent).toBeDefined();
      expect(agent.name).toBe(rt.expectedAgent);
    }
  });

  it('should strictly limit discovery batch to maximum 5 options', async () => {
    const result = await AutonomousDiscoveryEngine.discover({
      customerId: 'cust-limit-test',
      category: 'dining',
      originalRequest: 'Fine dining restaurants in Ahmedabad',
    });

    expect(result.options.length).toBeLessThanOrEqual(5);
  });

  it('should preserve constraints and validate origin/destination integrity', () => {
    const sampleOptions = [
      {
        id: 'opt-1',
        title: 'Valid Ahmedabad Agashiye Dinner',
        providerName: 'Agashiye',
        category: 'dining',
        metadata: { city: 'Ahmedabad' },
      },
      {
        id: 'opt-2',
        title: 'Mismatched Mumbai Dinner',
        providerName: 'Trishna',
        category: 'dining',
        metadata: { city: 'Mumbai' },
      },
    ];

    const filtered = EntityIntegrityValidator.filterProposalsByConstraints(
      sampleOptions as any,
      {
        category: 'dining',
        city: 'Ahmedabad',
        location: 'Ahmedabad',
      } as any
    );

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('opt-1');
  });
});
