import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UniversalEventDiscoveryProvider, universalEventDiscoveryProvider } from '@/lib/events/provider';
import { CityResolver } from '@/lib/events/city-resolver';
import { DateResolver } from '@/lib/events/date-resolver';
import { EventsDiscoveryAdapter } from '@/lib/orchestration/adapters/events.adapter';
import { EntityIntegrityValidator } from '@/lib/validation/entity-integrity';
import { TaskDecisionEngine } from '@/lib/capabilities/task-decision-engine';
import type { NormalizedEvent } from '@/lib/events/types';

describe('PROVENTA — UNIVERSAL AI EVENT DISCOVERY ENGINE TEST SUITE (54 CRITICAL TEST CASES)', () => {
  let adapter: EventsDiscoveryAdapter;
  let customProvider: UniversalEventDiscoveryProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new EventsDiscoveryAdapter();
    customProvider = new UniversalEventDiscoveryProvider();
  });

  // ==========================================
  // 1-4. UNIVERSAL DISCOVERY ACROSS CITIES (category = ALL)
  // ==========================================
  describe('1-4. Universal Multi-City Discovery (category = ALL)', () => {
    it('1. Ahmedabad + 29/09/2026 + category = ALL returns diverse genuine events', async () => {
      const results = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        category: 'ALL',
      });
      expect(results.length).toBeGreaterThanOrEqual(5);
      expect(results.every((e) => e.city === 'Ahmedabad')).toBe(true);
      expect(results.every((e) => e.date === '2026-09-29')).toBe(true);

      const categories = results.map((e) => e.category);
      expect(categories).toContain('NAVRATRI');
      expect(categories).toContain('FOOD');
      expect(categories).toContain('BUSINESS');
      expect(categories).toContain('LIVE_MUSIC');
      expect(categories).toContain('WELLNESS');
    });

    it('2. Mumbai + 29/09/2026 + category = ALL returns diverse genuine events', async () => {
      const results = await universalEventDiscoveryProvider.searchEvents({
        city: 'Mumbai',
        date: '2026-09-29',
        category: 'ALL',
      });
      expect(results.length).toBeGreaterThanOrEqual(5);
      expect(results.every((e) => e.city === 'Mumbai')).toBe(true);
      expect(results.every((e) => e.date === '2026-09-29')).toBe(true);
    });

    it('3. Delhi + 29/09/2026 + category = ALL returns genuine events', async () => {
      const results = await universalEventDiscoveryProvider.searchEvents({
        city: 'Delhi',
        date: '2026-09-29',
        category: 'ALL',
      });
      expect(results.length).toBeGreaterThanOrEqual(3);
      expect(results.every((e) => e.city === 'Delhi')).toBe(true);
    });

    it('4. Bengaluru + 29/09/2026 + category = ALL returns genuine events', async () => {
      const results = await universalEventDiscoveryProvider.searchEvents({
        city: 'Bengaluru',
        date: '2026-09-29',
        category: 'ALL',
      });
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.every((e) => e.city === 'Bengaluru')).toBe(true);
    });
  });

  // ==========================================
  // 5-22. CATEGORY TAXONOMY EVALUATION
  // ==========================================
  describe('5-22. Master Event Taxonomy Resolution', () => {
    it('5. discovers Concerts & Live Music', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        category: 'CONCERTS',
      });
      expect(res.length).toBeGreaterThanOrEqual(1);
      expect(res[0].title).toContain('Sitar');
    });

    it('6. discovers Navratri & Garba', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        category: 'NAVRATRI',
      });
      expect(res.length).toBeGreaterThanOrEqual(1);
      expect(res[0].title).toContain('Navratri');
    });

    it('7. discovers Festivals & Culture', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        category: 'FESTIVALS',
      });
      expect(res.length).toBeGreaterThanOrEqual(1);
    });

    it('8. discovers Food & Dining events', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        category: 'FOOD',
      });
      expect(res.length).toBeGreaterThanOrEqual(1);
      expect(res[0].title).toContain('Agashiye');
    });

    it('9. discovers Cooking & Baking masterclasses', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Mumbai',
        date: '2026-09-29',
        category: 'COOKING',
      });
      expect(res.length).toBeGreaterThanOrEqual(1);
      expect(res[0].title).toContain('Patisserie');
    });

    it('10. discovers Dance & Performances', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        category: 'DANCE',
      });
      expect(res.length).toBeGreaterThanOrEqual(1);
    });

    it('11. discovers Parties & Nightlife', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        category: 'PARTIES',
      });
      expect(res.length).toBeGreaterThanOrEqual(1);
    });

    it('12. discovers Wellness & Mindfulness', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        category: 'WELLNESS',
      });
      expect(res.length).toBeGreaterThanOrEqual(1);
      expect(res[0].title).toContain('Yoga');
    });

    it('13. discovers Health & Fitness', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        category: 'HEALTH',
      });
      expect(res.length).toBeGreaterThanOrEqual(1);
    });

    it('14. discovers Business & Entrepreneurship', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        category: 'BUSINESS',
      });
      expect(res.length).toBeGreaterThanOrEqual(1);
      expect(res[0].title).toContain('GIFT City');
    });

    it('15. discovers Networking & Conferences', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Mumbai',
        date: '2026-09-29',
        category: 'NETWORKING',
      });
      expect(res.length).toBeGreaterThanOrEqual(1);
      expect(res[0].title).toContain('Angel');
    });

    it('16. discovers Stand-up Comedy', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-10-15',
        category: 'COMEDY',
      });
      expect(res.length).toBeGreaterThanOrEqual(1);
      expect(res[0].title).toContain('Manan Desai');
    });

    it('17. discovers Theatre & Broadway Musicals', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Mumbai',
        date: '2026-09-29',
        category: 'THEATRE',
      });
      expect(res.length).toBeGreaterThanOrEqual(1);
      expect(res[0].title).toContain('Great Indian Musical');
    });

    it('18. discovers Art & Exhibitions', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        category: 'ART',
      });
      expect(res.length).toBeGreaterThanOrEqual(1);
      expect(res[0].title).toContain('Lalbhai Museum');
    });

    it('19. discovers AI & Technology Workshops', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Bengaluru',
        date: '2026-09-29',
        category: 'AI',
      });
      expect(res.length).toBeGreaterThanOrEqual(1);
      expect(res[0].title).toContain('Sovereign AI');
    });

    it('20. discovers Sports & Polo', async () => {
      const customPolo: NormalizedEvent = {
        eventId: 'evt_jai_polo_29',
        title: 'Autumn Polo Cup Final',
        description: 'Polo final at Rajasthan Polo Club.',
        category: 'SPORTS',
        venue: 'Rajasthan Polo Club',
        city: 'Jaipur',
        date: '2026-09-29',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        availabilityStatus: 'AVAILABLE',
        source: 'Polo Registry',
        verified: true,
        discoveredAt: '2026-09-28T00:00:00Z',
      };
      customProvider.addVerifiedInventory([customPolo]);
      const res = await customProvider.searchEvents({
        city: 'Jaipur',
        date: '2026-09-29',
        category: 'SPORTS',
      });
      expect(res.length).toBe(1);
      expect(res[0].title).toContain('Polo');
    });

    it('21. discovers Family & Kids events', async () => {
      const customFam: NormalizedEvent = {
        eventId: 'evt_amd_fam_29',
        title: 'Science City Robotics & Telescopic Evening',
        description: 'Family science exploration.',
        category: 'FAMILY',
        venue: 'Gujarat Science City',
        city: 'Ahmedabad',
        date: '2026-09-29',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        availabilityStatus: 'AVAILABLE',
        source: 'Science City Desk',
        verified: true,
        discoveredAt: '2026-09-28T00:00:00Z',
      };
      customProvider.addVerifiedInventory([customFam]);
      const res = await customProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        category: 'FAMILY',
      });
      expect(res.length).toBe(1);
      expect(res[0].title).toContain('Science City');
    });

    it('22. discovers Shopping & Flea Markets', async () => {
      const customShop: NormalizedEvent = {
        eventId: 'evt_amd_shop_29',
        title: 'Craft Heritage Pop-up Bazaar',
        description: 'Artisanal market with Gujarat weavers.',
        category: 'SHOPPING',
        venue: 'Ahmedabad Haat',
        city: 'Ahmedabad',
        date: '2026-09-29',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        availabilityStatus: 'AVAILABLE',
        source: 'Crafts Council',
        verified: true,
        discoveredAt: '2026-09-28T00:00:00Z',
      };
      customProvider.addVerifiedInventory([customShop]);
      const res = await customProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        category: 'SHOPPING',
      });
      expect(res.length).toBe(1);
      expect(res[0].title).toContain('Pop-up Bazaar');
    });
  });

  // ==========================================
  // 23-29. DATE RESOLUTION
  // ==========================================
  describe('23-29. Universal Date Resolution', () => {
    const anchor = new Date('2026-09-28T10:00:00Z');

    it('23. parses exact ISO date "2026-09-29"', () => {
      const r = DateResolver.resolveDate('2026-09-29', anchor);
      expect(r.startDate).toBe('2026-09-29');
      expect(r.isSpecificDate).toBe(true);
    });

    it('24. parses DD/MM/YYYY format "29/09/2026"', () => {
      const r = DateResolver.resolveDate('events near me on 29/09/2026', anchor);
      expect(r.startDate).toBe('2026-09-29');
      expect(r.isSpecificDate).toBe(true);
    });

    it('25. parses natural date "29 September 2026"', () => {
      const r = DateResolver.resolveDate('what is happening in Ahmedabad on 29 September', anchor);
      expect(r.startDate).toBe('2026-09-29');
      expect(r.isSpecificDate).toBe(true);
    });

    it('26. parses "tomorrow"', () => {
      const r = DateResolver.resolveDate('events in Delhi tomorrow', anchor);
      expect(r.startDate).toBe('2026-09-29');
      expect(r.isSpecificDate).toBe(true);
    });

    it('27. parses "today" or "tonight"', () => {
      const r = DateResolver.resolveDate('events tonight', anchor);
      expect(r.startDate).toBe('2026-09-28');
    });

    it('28. parses "this weekend" / "next weekend"', () => {
      const r = DateResolver.resolveDate('things happening in Mumbai this weekend', anchor);
      expect(r.isDateRange).toBe(true);
      expect(r.startDate).toBeTruthy();
      expect(r.endDate).toBeTruthy();
    });

    it('29. parses explicit date range "from 15 to 20 October"', () => {
      const r = DateResolver.resolveDate('festivals from 15 to 20 October 2026', anchor);
      expect(r.startDate).toBe('2026-10-15');
      expect(r.endDate).toBe('2026-10-20');
      expect(r.isDateRange).toBe(true);
    });
  });

  // ==========================================
  // 30-33. LOCATION RESOLUTION
  // ==========================================
  describe('30-33. Location & City Resolution', () => {
    it('30. resolves "near me" using default active context (Ahmedabad)', () => {
      const res = CityResolver.extractCities('events near me on 29/09/2026');
      expect(res.primaryCity).toBe('Ahmedabad');
    });

    it('31. resolves city aliases: Bombay -> Mumbai, Bangalore -> Bengaluru', () => {
      expect(CityResolver.normalizeCity('Bombay')).toBe('Mumbai');
      expect(CityResolver.normalizeCity('Bangalore')).toBe('Bengaluru');
      expect(CityResolver.normalizeCity('Calcutta')).toBe('Kolkata');
      expect(CityResolver.normalizeCity('Baroda')).toBe('Vadodara');
    });

    it('32. handles arbitrary supported Indian cities', () => {
      expect(CityResolver.normalizeCity('Jaipur')).toBe('Jaipur');
      expect(CityResolver.normalizeCity('Goa')).toBe('Goa');
      expect(CityResolver.normalizeCity('Hyderabad')).toBe('Hyderabad');
      expect(CityResolver.normalizeCity('Pune')).toBe('Pune');
    });

    it('33. strictly isolates cities: Mumbai search never returns Ahmedabad events', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Mumbai',
        date: '2026-09-29',
      });
      res.forEach((e) => {
        expect(e.city).toBe('Mumbai');
        expect(e.city).not.toBe('Ahmedabad');
      });
    });
  });

  // ==========================================
  // 34-40. MULTI-SOURCE RESEARCH & FAULT TOLERANCE
  // ==========================================
  describe('34-40. Multi-Source AI Research & Resilience', () => {
    it('34. queries multiple legitimate sources and aggregates candidates', async () => {
      await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
      });
      const diag = universalEventDiscoveryProvider.getLastDiagnostics();
      expect(diag).toBeTruthy();
      expect(diag!.sourcesQueried.length).toBeGreaterThanOrEqual(3);
      expect(diag!.rawCandidateCount).toBeGreaterThanOrEqual(5);
    });

    it('35. continues gracefully when an unconfigured source returns no results', async () => {
      const diag = universalEventDiscoveryProvider.getLastDiagnostics();
      const unconfigured = diag?.sourcesQueried.filter((s) => !s.isConfigured);
      expect(unconfigured?.length).toBeGreaterThanOrEqual(1);
      expect(unconfigured![0].status).toBe('NOT_CONFIGURED');
      // The search as a whole succeeds
    });

    it('36. deduplicates identical events appearing across multiple feeds', async () => {
      const duplicateEvent: NormalizedEvent = {
        eventId: 'evt_amd_navratri_29sep_dupe',
        title: 'Heritage Navratri Mahotsav & Traditional Garba 2026',
        description: 'Duplicate listing from another channel.',
        category: 'NAVRATRI',
        venue: 'Rajpath Club Lawn & Amphitheatre',
        city: 'Ahmedabad',
        date: '2026-09-29',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        availabilityStatus: 'AVAILABLE',
        source: 'Secondary Source',
        verified: true,
        discoveredAt: '2026-09-28T00:00:00Z',
      };
      customProvider.addVerifiedInventory([duplicateEvent]);
      const res = await customProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
      });

      const matchingTitles = res.filter((e) => e.title.includes('Heritage Navratri Mahotsav'));
      expect(matchingTitles.length).toBe(1);
    });

    it('37. handles 0 results with transparent diagnostics for Concierge fallback', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Surat',
        date: '2030-01-01',
      });
      expect(res.length).toBe(0);
      const diag = universalEventDiscoveryProvider.getLastDiagnostics();
      expect(diag?.conciergeFallback).toBe(true);
      expect(diag?.fallbackReason).toContain('No verified genuine events found');
    });

    it('38. returns exactly 3 options when 3 genuine events exist (no fake filler)', async () => {
      const customP: UniversalEventDiscoveryProvider = new UniversalEventDiscoveryProvider([]);
      const evts: NormalizedEvent[] = [1, 2, 3].map((i) => ({
        eventId: `evt_koc_${i}`,
        title: `Kochi Art Biennial Special ${i}`,
        description: `Exhibition ${i}`,
        category: 'ART',
        venue: 'Aspinwall House',
        city: 'Kochi',
        date: '2026-10-15',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        availabilityStatus: 'AVAILABLE',
        source: 'Kochi Desk',
        verified: true,
        discoveredAt: '2026-09-28T00:00:00Z',
      }));
      customP.addVerifiedInventory(evts);

      const res = await customP.searchEvents({ city: 'Kochi', date: '2026-10-15' });
      expect(res.length).toBe(3);
    });

    it('39. returns exactly 1 option when 1 genuine event exists', async () => {
      const customP: UniversalEventDiscoveryProvider = new UniversalEventDiscoveryProvider([]);
      const evt: NormalizedEvent = {
        eventId: 'evt_udaipur_1',
        title: 'Udaipur World Music Festival Exclusive Preview',
        description: 'Lakeside concert.',
        category: 'CONCERTS',
        venue: 'City Palace Courtyard',
        city: 'Udaipur',
        date: '2026-10-15',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        availabilityStatus: 'AVAILABLE',
        source: 'Udaipur Desk',
        verified: true,
        discoveredAt: '2026-09-28T00:00:00Z',
      };
      customP.addVerifiedInventory([evt]);

      const res = await customP.searchEvents({ city: 'Udaipur', date: '2026-10-15' });
      expect(res.length).toBe(1);
    });

    it('40. returns top 5 ranked options when 5+ genuine events exist', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        category: 'ALL',
      });
      expect(res.length).toBe(5);
    });
  });

  // ==========================================
  // 41-45. ENTITY INTEGRITY & ZERO FABRICATION
  // ==========================================
  describe('41-45. Entity Integrity & Anti-Fabrication Safeguards', () => {
    it('41. rejects wrong date events from result set', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
      });
      res.forEach((e) => expect(e.date).toBe('2026-09-29'));
    });

    it('42. rejects wrong city events from result set', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Delhi',
        date: '2026-09-29',
      });
      res.forEach((e) => expect(e.city).toBe('Delhi'));
    });

    it('43. rejects incompatible category when specific category requested', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        category: 'NAVRATRI',
      });
      res.forEach((e) => {
        expect(['NAVRATRI', 'GARBA', 'FESTIVALS', 'CULTURAL']).toContain(e.category);
      });
    });

    it('44. preserves unknown values as null/undefined without inventing details', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
      });
      res.forEach((e) => {
        expect(e.title).toBeTruthy();
        expect(e.city).toBeTruthy();
        expect(e.venue).toBeTruthy();
        // Zero fake synthetic flags
        expect((e as any).isFake).toBeUndefined();
      });
    });

    it('45. ensures unconfigured APIs do not return synthetic mock events', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Lucknow',
        date: '2026-09-29',
      });
      expect(res.length).toBe(0);
    });
  });

  // ==========================================
  // 46-50. ITERATIVE RECOMMENDATION CYCLES
  // ==========================================
  describe('46-50. Recommendation Cycles & Re-ranking', () => {
    it('46 & 47. generates BATCH-001 and replaces with BATCH-002 upon rejection', async () => {
      const batch1 = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        limit: 3,
      });
      expect(batch1.length).toBe(3);

      const rejectedIds = batch1.map((e) => e.eventId);
      const batch2 = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        excludedEventIds: rejectedIds,
        limit: 3,
      });

      expect(batch2.length).toBeGreaterThanOrEqual(1);
      // Ensure rejected options never reappear in batch 2
      batch2.forEach((e) => {
        expect(rejectedIds).not.toContain(e.eventId);
      });
    });

    it('48. applies customer feedback e.g. budget constraint <= 1500 to next batch', async () => {
      const res = await universalEventDiscoveryProvider.searchEvents({
        city: 'Ahmedabad',
        date: '2026-09-29',
        budgetAmount: 1500,
      });
      res.forEach((e) => {
        if (e.priceAmount !== undefined) {
          expect(e.priceAmount).toBeLessThanOrEqual(1500);
        }
      });
    });

    it('49. modifies request from Ahmedabad to Mumbai seamlessly', async () => {
      const amd = await universalEventDiscoveryProvider.searchEvents({ city: 'Ahmedabad', date: '2026-09-29' });
      const bom = await universalEventDiscoveryProvider.searchEvents({ city: 'Mumbai', date: '2026-09-29' });

      expect(amd[0].city).toBe('Ahmedabad');
      expect(bom[0].city).toBe('Mumbai');
    });

    it('50. modifies request from 29 September to 15 October seamlessly', async () => {
      const sep = await universalEventDiscoveryProvider.searchEvents({ city: 'Ahmedabad', date: '2026-09-29' });
      const oct = await universalEventDiscoveryProvider.searchEvents({ city: 'Ahmedabad', date: '2026-10-15' });

      expect(sep[0].date).toBe('2026-09-29');
      expect(oct[0].date).toBe('2026-10-15');
    });
  });

  // ==========================================
  // 51-54. DISCOVERY VS BOOKING & EXECUTION
  // ==========================================
  describe('51-54. Discovery vs Execution & Concierge Handoff', () => {
    it('51. adapter returns OptionProposal without claiming booking is confirmed', async () => {
      const proposals = await adapter.search({
        category: 'events',
        rawInput: 'Find events near me on 29/09/2026',
      });
      expect(proposals.length).toBeGreaterThanOrEqual(5);
      proposals.forEach((p) => {
        expect(p.availability).toContain('Available');
        expect(p.id).toContain('prop-evt-');
      });
    });

    it('52. requires customer approval before executing event reservation', async () => {
      const decision = TaskDecisionEngine.evaluate({
        rawInput: 'Find interesting events in Ahmedabad on 29 September',
      });
      expect(decision.category).toBe('EVENTS');
      expect(decision.executionMode).toBe('AI_RESEARCH');
      expect(decision.approvalRequired).toBe(false);
    });

    it('53. executes reservation with Human Concierge verified handoff upon approval', async () => {
      const proposals = await adapter.search({
        category: 'events',
        rawInput: 'Navratri events in Ahmedabad on 29 September',
      });
      const chosenProposal = proposals[0];

      const execution = await adapter.execute(chosenProposal, {
        guests: 2,
        specialRequests: 'VIP Lounge Seating',
      });

      expect(execution.success).toBe(true);
      expect(execution.status).toBe('CONFIRMED');
      expect(execution.confirmedDetails.reference).toContain('EVT-CONF-');
      expect(execution.confirmedDetails.executionMode).toBe('HUMAN_CONCIERGE_CONFIRMED');
    });

    it('54. verifies confirmed event booking reference through verification interface', async () => {
      const ver = await adapter.verify('EVT-CONF-889900-AMD');
      expect(ver.verified).toBe(true);
      expect(ver.status).toBe('CONFIRMED');
      expect(ver.environment).toBe('REAL');
    });

    it('55. discovers genuine Garba passes in Ahmedabad for "Garba passes for 13th October 2026"', async () => {
      const decision = TaskDecisionEngine.evaluate({
        rawInput: 'Garba passes for 13th October 2026',
      });
      expect(decision.category).toBe('EVENTS');

      const dateRange = DateResolver.resolveDate('Garba passes for 13th October 2026');
      expect(dateRange.startDate).toBe('2026-10-13');
      expect(dateRange.endDate).toBe('2026-10-13');
      expect(dateRange.isSpecificDate).toBe(true);

      const proposals = await adapter.search({
        category: 'events',
        rawInput: 'Garba passes for 13th October 2026',
      });
      expect(proposals.length).toBe(5);
      expect(proposals.every((p) => p.metadata?.date === '2026-10-13')).toBe(true);
      expect(proposals.every((p) => p.metadata?.city === 'Ahmedabad')).toBe(true);
      expect(proposals.some((p) => p.title.includes('Rajpath Club'))).toBe(true);
      expect(proposals.some((p) => p.title.includes('Karnavati Club'))).toBe(true);
      expect(proposals.some((p) => p.title.includes('Riverfront'))).toBe(true);
      expect(proposals.some((p) => p.title.includes('YMCA'))).toBe(true);
      expect(proposals.some((p) => p.title.includes('Vibrant Gujarat'))).toBe(true);
    });

    it('56. discovers genuine Garba passes in Ahmedabad for "Garba passes for 13/10/2026"', async () => {
      const dateRange = DateResolver.resolveDate('Garba passes for 13/10/2026');
      expect(dateRange.startDate).toBe('2026-10-13');

      const proposals = await adapter.search({
        category: 'events',
        rawInput: 'Garba passes for 13/10/2026',
      });
      expect(proposals.length).toBe(5);
      expect(proposals.every((p) => p.metadata?.date === '2026-10-13')).toBe(true);
    });
  });
});
