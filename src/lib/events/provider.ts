/**
 * PROVENTA — UNIVERSAL EVENT DISCOVERY PROVIDER
 * Core AI research coordinator querying multiple legitimate sources, normalizing, deduplicating,
 * validating entity integrity, ranking for relevance & diversity, and returning up to 5 genuine options.
 * Enforces strict zero-fabrication standards across all queries.
 */

import {
  NormalizedEvent,
  EventSearchConstraints,
  EventCategory,
  EventResearchDiagnostics,
} from './types';
import {
  EventResearchSource,
  ProventaVerifiedInventorySource,
  OfficialVenuesCalendarSource,
  PublicEventAgendasSource,
  TicketingIntegrationsSource,
  EnterprisePartnerAPIsSource,
} from './sources';
import { CityResolver } from './city-resolver';
import { DateResolver } from './date-resolver';
import { logger } from '@/lib/logger';

export interface EventProviderInterface {
  providerId: string;
  name: string;
  searchEvents(constraints: EventSearchConstraints): Promise<NormalizedEvent[]>;
  getEventById(eventId: string): Promise<NormalizedEvent | null>;
  getLastDiagnostics?(): EventResearchDiagnostics | null;
}

export class UniversalEventDiscoveryProvider implements EventProviderInterface {
  readonly providerId = 'universal_event_discovery';
  readonly name = 'Universal AI Event Discovery Engine';

  private sources: EventResearchSource[] = [];
  private verifiedInventorySource: ProventaVerifiedInventorySource;
  private lastDiagnostics: EventResearchDiagnostics | null = null;

  constructor(customEvents: NormalizedEvent[] = []) {
    this.verifiedInventorySource = new ProventaVerifiedInventorySource(customEvents);
    this.sources = [
      this.verifiedInventorySource,
      new OfficialVenuesCalendarSource(),
      new PublicEventAgendasSource(),
      new TicketingIntegrationsSource(),
      new EnterprisePartnerAPIsSource(),
    ];
  }

  /**
   * Adds verified inventory dynamically.
   */
  addVerifiedInventory(events: NormalizedEvent[]): void {
    this.verifiedInventorySource.addEvents(events);
  }

  getLastDiagnostics(): EventResearchDiagnostics | null {
    return this.lastDiagnostics;
  }

  /**
   * Universal AI Research across multiple legitimate event sources.
   */
  async searchEvents(constraints: EventSearchConstraints): Promise<NormalizedEvent[]> {
    const researchStartedAt = new Date().toISOString();
    const rawInput = constraints.rawInput || '';
    const rawLower = rawInput.toLowerCase();

    // 1. Resolve Target City / Cities
    let targetCities: string[] = [];
    if (constraints.cities && constraints.cities.length > 0) {
      targetCities = constraints.cities.map((c) => CityResolver.normalizeCity(c));
    } else if (constraints.city) {
      targetCities = [CityResolver.normalizeCity(constraints.city)];
    } else if (rawInput) {
      const extracted = CityResolver.extractCities(rawInput);
      targetCities = extracted.allCities;
    } else {
      targetCities = ['Ahmedabad'];
    }

    // 2. Resolve Target Date Range
    const dateRange = DateResolver.resolveDate(constraints.date || constraints.startDate || rawInput);

    // 3. Resolve Target Category (Defaults to ALL if unspecified)
    let targetCategory: EventCategory = constraints.category || 'ALL';
    if (!constraints.category) {
      if (rawLower.includes('navratri') || rawLower.includes('garba')) {
        targetCategory = 'NAVRATRI';
      } else if (rawLower.includes('concert') || rawLower.includes('live music') || rawLower.includes('sitar') || rawLower.includes('sufi')) {
        targetCategory = 'CONCERTS';
      } else if (rawLower.includes('comedy') || rawLower.includes('standup') || rawLower.includes('stand-up')) {
        targetCategory = 'COMEDY';
      } else if (rawLower.includes('theatre') || rawLower.includes('theater') || rawLower.includes('drama') || rawLower.includes('play')) {
        targetCategory = 'THEATRE';
      } else if (rawLower.includes('food') || rawLower.includes('dining') || rawLower.includes('culinary') || rawLower.includes('tasting')) {
        targetCategory = 'FOOD';
      } else if (rawLower.includes('cooking') || rawLower.includes('baking') || rawLower.includes('patisserie')) {
        targetCategory = 'COOKING';
      } else if (rawLower.includes('business') || rawLower.includes('startup') || rawLower.includes('investor') || rawLower.includes('conference') || rawLower.includes('networking')) {
        targetCategory = 'BUSINESS';
      } else if (rawLower.includes('wellness') || rawLower.includes('yoga') || rawLower.includes('meditation') || rawLower.includes('mindfulness')) {
        targetCategory = 'WELLNESS';
      } else if (rawLower.includes('art') || rawLower.includes('exhibition') || rawLower.includes('gallery')) {
        targetCategory = 'ART';
      } else if (rawLower.includes('family') || rawLower.includes('kids') || rawLower.includes('children') || rawLower.includes('stargazing')) {
        targetCategory = 'FAMILY';
      } else if (rawLower.includes('shopping') || rawLower.includes('flea market') || rawLower.includes('popup')) {
        targetCategory = 'SHOPPING';
      } else if (rawLower.includes('yacht') || rawLower.includes('polo') || rawLower.includes('luxury')) {
        targetCategory = 'LUXURY';
      } else {
        targetCategory = 'ALL';
      }
    }

    logger.info(
      { targetCities, dateRange: dateRange.displayText, targetCategory, rawInput },
      '[UniversalEventDiscovery] Starting multi-source AI research'
    );

    // 4. Query Sources in Parallel with Bounded Timeouts
    const sourceDiagnostics: EventResearchDiagnostics['sourcesQueried'] = [];
    const candidateBatches: NormalizedEvent[][] = [];

    const searchPromises = this.sources.map(async (source) => {
      const startMs = Date.now();
      if (!source.isConfigured) {
        sourceDiagnostics.push({
          sourceId: source.sourceId,
          sourceName: source.name,
          isConfigured: false,
          status: 'NOT_CONFIGURED',
          candidatesFound: 0,
          latencyMs: 0,
        });
        return [];
      }

      try {
        const timeoutPromise = new Promise<NormalizedEvent[]>((_, reject) =>
          setTimeout(() => reject(new Error('Source research timeout')), 3000)
        );
        const results = await Promise.race([source.search(constraints), timeoutPromise]);
        const latencyMs = Date.now() - startMs;

        sourceDiagnostics.push({
          sourceId: source.sourceId,
          sourceName: source.name,
          isConfigured: true,
          status: 'SUCCESS',
          candidatesFound: results.length,
          latencyMs,
        });

        return results;
      } catch (err: any) {
        const latencyMs = Date.now() - startMs;
        sourceDiagnostics.push({
          sourceId: source.sourceId,
          sourceName: source.name,
          isConfigured: true,
          status: 'FAILED',
          candidatesFound: 0,
          latencyMs,
          error: err.message,
        });
        logger.warn({ sourceId: source.sourceId, error: err.message }, '[UniversalEventDiscovery] Source search failed gracefully');
        return [];
      }
    });

    const settledResults = await Promise.allSettled(searchPromises);
    for (const res of settledResults) {
      if (res.status === 'fulfilled') {
        candidateBatches.push(res.value);
      }
    }

    const rawCandidates = candidateBatches.flat();

    // 5. Filter Candidates by Entity Integrity (City, Date, Category, Budget, Exclusions)
    const excludedIds = new Set(constraints.excludedEventIds || []);
    const validatedCandidates = rawCandidates.filter((event) => {
      // Excluded check (for iterative recommendation batches)
      if (excludedIds.has(event.eventId)) return false;

      // City Filter
      const isCityMatched = targetCities.some((c) => CityResolver.isCityMatch(event.city, c));
      if (!isCityMatched) return false;

      // Date Filter
      const isDateMatched = DateResolver.isDateMatch(event.date, dateRange);
      if (!isDateMatched) return false;

      // Category Filter (if not ALL)
      if (targetCategory && targetCategory !== 'ALL' && targetCategory !== 'OTHER_EVENT' && targetCategory !== 'GENERAL') {
        const isCatMatch = this.isCategoryMatch(event, targetCategory);
        if (!isCatMatch) return false;
      }

      // Budget Filter
      if (constraints.budgetAmount && event.priceAmount !== undefined) {
        if (event.priceAmount > constraints.budgetAmount) {
          return false;
        }
      }

      return true;
    });

    // 6. Deterministic Deduplication (Title + City + Date + Venue)
    const deduplicated = this.deduplicateEvents(validatedCandidates);

    // 7. Relevance & Diversity Ranking
    const ranked = this.rankEvents(deduplicated, {
      primaryCity: targetCities[0],
      isSpecificDate: dateRange.isSpecificDate,
      category: targetCategory,
      preferences: constraints.preferences,
      keywords: constraints.keywords,
      rawInput,
    });

    // Up to 5 genuine options
    const finalOptions = ranked.slice(0, constraints.limit || 5);

    // 8. Record Diagnostics
    const conciergeFallback = finalOptions.length === 0;
    const fallbackReason = conciergeFallback
      ? `No verified genuine events found across ${sourceDiagnostics.filter(s => s.status === 'SUCCESS').length} active sources for ${targetCities.join(', ')} on ${dateRange.displayText} (Category: ${targetCategory}).`
      : undefined;

    this.lastDiagnostics = {
      researchStartedAt,
      rawInput,
      resolvedCity: targetCities[0] || 'Ahmedabad',
      resolvedDateFrom: dateRange.startDate,
      resolvedDateTo: dateRange.endDate,
      resolvedCategory: targetCategory,
      sourcesQueried: sourceDiagnostics,
      rawCandidateCount: rawCandidates.length,
      deduplicatedCount: deduplicated.length,
      validatedCount: validatedCandidates.length,
      rankedCount: ranked.length,
      returnedOptionCount: finalOptions.length,
      conciergeFallback,
      fallbackReason,
    };

    return finalOptions;
  }

  async getEventById(eventId: string): Promise<NormalizedEvent | null> {
    const all = await this.searchEvents({ rawInput: '' });
    const match = all.find((e) => e.eventId === eventId);
    return match || null;
  }

  /**
   * Deterministic category match with cross-category compatibility.
   */
  private isCategoryMatch(event: NormalizedEvent, requestedCat: EventCategory): boolean {
    const evCat = event.category.toUpperCase();
    const reqCat = requestedCat.toUpperCase();
    if (evCat === reqCat) return true;

    const tags = (event.tags || []).map((t) => t.toUpperCase());
    if (tags.includes(reqCat)) return true;

    const regex = new RegExp(`\\b${reqCat}\\b`, 'i');
    if (regex.test(event.title) || (event.subcategory && regex.test(event.subcategory))) {
      return true;
    }

    // Cross-category semantic mappings
    if (reqCat === 'CONCERTS' || reqCat === 'LIVE_MUSIC' || reqCat === 'MUSIC') {
      return ['CONCERTS', 'LIVE_MUSIC', 'MUSIC', 'DJ', 'PERFORMANCES'].includes(evCat) || tags.includes('MUSIC') || tags.includes('CONCERTS') || tags.includes('SITAR');
    }
    if (reqCat === 'NAVRATRI' || reqCat === 'GARBA') {
      return ['NAVRATRI', 'GARBA', 'FESTIVALS', 'CULTURAL'].includes(evCat) || tags.includes('GARBA') || tags.includes('NAVRATRI');
    }
    if (reqCat === 'FESTIVALS' || reqCat === 'CULTURAL' || reqCat === 'CULTURE') {
      return ['FESTIVALS', 'NAVRATRI', 'GARBA', 'CULTURAL', 'CULTURE', 'HERITAGE'].includes(evCat);
    }
    if (reqCat === 'PARTIES' || reqCat === 'NIGHTLIFE' || reqCat === 'DJ' || reqCat === 'DANCE') {
      return ['PARTIES', 'NIGHTLIFE', 'DJ', 'DANCE', 'NAVRATRI', 'GARBA', 'LIVE_MUSIC'].includes(evCat) || tags.includes('PARTIES') || tags.includes('DANCE') || tags.includes('NIGHTLIFE');
    }
    if (reqCat === 'FOOD' || reqCat === 'FOOD_DRINK' || reqCat === 'DINING_EVENTS') {
      return ['FOOD', 'FOOD_DRINK', 'DINING_EVENTS', 'TASTINGS', 'CHEF_EXPERIENCES', 'COOKING'].includes(evCat) || tags.includes('FOOD') || tags.includes('DINING');
    }
    if (reqCat === 'COOKING' || reqCat === 'BAKING' || reqCat === 'CULINARY_WORKSHOPS') {
      return ['COOKING', 'BAKING', 'CULINARY_WORKSHOPS', 'FOOD'].includes(evCat) || tags.includes('COOKING') || tags.includes('BAKING');
    }
    if (reqCat === 'BUSINESS' || reqCat === 'NETWORKING' || reqCat === 'STARTUP' || reqCat === 'CONFERENCE') {
      return ['BUSINESS', 'NETWORKING', 'STARTUP', 'ENTREPRENEURSHIP', 'INVESTOR', 'CONFERENCE', 'SEMINAR'].includes(evCat) || tags.includes('BUSINESS') || tags.includes('STARTUP');
    }
    if (reqCat === 'WELLNESS' || reqCat === 'HEALTH' || reqCat === 'YOGA' || reqCat === 'MEDITATION') {
      return ['WELLNESS', 'HEALTH', 'YOGA', 'MEDITATION', 'FITNESS', 'MINDFULNESS'].includes(evCat) || tags.includes('WELLNESS') || tags.includes('YOGA');
    }
    if (reqCat === 'THEATRE' || reqCat === 'THEATER' || reqCat === 'MUSICALS') {
      return ['THEATRE', 'MUSICALS', 'PERFORMANCES'].includes(evCat) || tags.includes('THEATRE') || tags.includes('DRAMA');
    }
    if (reqCat === 'COMEDY' || reqCat === 'STANDUP') {
      return ['COMEDY', 'STANDUP'].includes(evCat) || tags.includes('COMEDY') || tags.includes('STANDUP');
    }
    if (reqCat === 'ART' || reqCat === 'EXHIBITIONS' || reqCat === 'ART_EXHIBITION') {
      return ['ART', 'EXHIBITIONS', 'ART_EXHIBITION', 'PHOTOGRAPHY', 'DESIGN'].includes(evCat) || tags.includes('ART');
    }
    if (reqCat === 'FAMILY' || reqCat === 'KIDS') {
      return ['FAMILY', 'KIDS', 'COMMUNITY'].includes(evCat) || tags.includes('FAMILY') || tags.includes('KIDS');
    }
    if (reqCat === 'LUXURY' || reqCat === 'LUXURY_EXPERIENCE') {
      return ['LUXURY', 'LUXURY_EXPERIENCE', 'PRIVATE_EXPERIENCE', 'ADVENTURE'].includes(evCat) || event.isExclusive === true;
    }

    return false;
  }

  /**
   * Deduplicates events across multiple source feeds.
   */
  private deduplicateEvents(events: NormalizedEvent[]): NormalizedEvent[] {
    const seen = new Set<string>();
    const result: NormalizedEvent[] = [];

    for (const event of events) {
      const normTitle = event.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normCity = event.city.toLowerCase().trim();
      const normDate = event.date.trim();
      const key = `${normTitle}|${normCity}|${normDate}`;

      if (!seen.has(key)) {
        seen.add(key);
        result.push(event);
      }
    }

    return result;
  }

  /**
   * Multi-attribute ranking with diversity balancing for category = ALL.
   */
  private rankEvents(
    events: NormalizedEvent[],
    criteria: {
      primaryCity: string;
      isSpecificDate: boolean;
      category: EventCategory;
      preferences?: string[];
      keywords?: string[];
      rawInput?: string;
    }
  ): NormalizedEvent[] {
    const scored = events.map((event) => {
      let score = 0;

      // 1. City exactness
      if (CityResolver.isCityMatch(event.city, criteria.primaryCity)) score += 50;

      // 2. Exclusive / Verified
      if (event.isExclusive) score += 20;
      if (event.verified) score += 10;
      if (event.availabilityStatus === 'AVAILABLE') score += 15;

      // 3. Natural Language Match
      const text = `${event.title} ${event.description} ${(event.tags || []).join(' ')} ${event.category} ${event.subcategory || ''}`.toLowerCase();
      if (criteria.rawInput) {
        const words = criteria.rawInput.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        for (const word of words) {
          if (text.includes(word)) score += 8;
        }
      }

      // 4. Stored Preferences Fit
      if (criteria.preferences && criteria.preferences.length > 0) {
        for (const pref of criteria.preferences) {
          if (text.includes(pref.toLowerCase())) score += 12;
        }
      }

      return { event, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Diversity balancing for category = ALL: ensure varied category representation if available
    if (criteria.category === 'ALL') {
      const categoryBuckets = new Map<string, NormalizedEvent[]>();
      for (const item of scored) {
        const catGroup = this.getCategoryGroup(item.event.category);
        if (!categoryBuckets.has(catGroup)) {
          categoryBuckets.set(catGroup, []);
        }
        categoryBuckets.get(catGroup)!.push(item.event);
      }

      const balanced: NormalizedEvent[] = [];
      const groups = Array.from(categoryBuckets.keys());
      let round = 0;
      let hasMore = true;

      while (balanced.length < 5 && hasMore) {
        hasMore = false;
        for (const grp of groups) {
          const list = categoryBuckets.get(grp)!;
          if (list[round]) {
            balanced.push(list[round]);
            hasMore = true;
            if (balanced.length >= 5) break;
          }
        }
        round++;
      }

      return balanced;
    }

    return scored.map((s) => s.event);
  }

  private getCategoryGroup(cat: EventCategory): string {
    const c = cat.toUpperCase();
    if (['CONCERTS', 'LIVE_MUSIC', 'DJ', 'NIGHTLIFE', 'COMEDY', 'STANDUP', 'THEATRE', 'MUSICALS'].includes(c)) return 'ENTERTAINMENT';
    if (['FESTIVALS', 'NAVRATRI', 'GARBA', 'CULTURAL', 'FOLK', 'HERITAGE'].includes(c)) return 'CULTURE';
    if (['FOOD', 'FOOD_FESTIVALS', 'DINING_EVENTS', 'TASTINGS', 'CHEF_EXPERIENCES', 'COOKING'].includes(c)) return 'FOOD';
    if (['BUSINESS', 'NETWORKING', 'STARTUP', 'INVESTOR', 'CONFERENCE'].includes(c)) return 'BUSINESS';
    if (['HEALTH', 'WELLNESS', 'YOGA', 'MEDITATION', 'MINDFULNESS'].includes(c)) return 'WELLNESS';
    if (['ART', 'EXHIBITIONS', 'PHOTOGRAPHY', 'DESIGN'].includes(c)) return 'ART';
    if (['FAMILY', 'KIDS', 'COMMUNITY'].includes(c)) return 'FAMILY';
    if (['LUXURY', 'ADVENTURE', 'EXPERIENCES'].includes(c)) return 'LUXURY';
    return 'GENERAL';
  }
}

export const universalEventDiscoveryProvider = new UniversalEventDiscoveryProvider();
