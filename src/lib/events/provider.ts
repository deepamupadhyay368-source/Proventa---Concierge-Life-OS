/**
 * PROVENTA — UNIVERSAL EVENT DISCOVERY PROVIDER
 * Core engine searching, filtering, normalizing, deduplicating, and ranking genuine events.
 * Enforces strict zero-fabrication standards across all queries.
 */

import { NormalizedEvent, EventSearchConstraints, EventCategory } from './types';
import { VERIFIED_EVENT_DATABASE } from './registry';
import { CityResolver } from './city-resolver';
import { DateResolver } from './date-resolver';
import { logger } from '@/lib/logger';

export interface EventProviderInterface {
  providerId: string;
  name: string;
  searchEvents(constraints: EventSearchConstraints): Promise<NormalizedEvent[]>;
  getEventById(eventId: string): Promise<NormalizedEvent | null>;
}

export class UniversalEventDiscoveryProvider implements EventProviderInterface {
  readonly providerId = 'universal_event_discovery';
  readonly name = 'Universal Event Discovery Provider';

  private customInventory: NormalizedEvent[] = [];
  private includeDefaultInventory: boolean = true;

  constructor(customInventory: NormalizedEvent[] = [], includeDefaultInventory: boolean = true) {
    this.customInventory = customInventory;
    this.includeDefaultInventory = includeDefaultInventory;
  }

  /**
   * Adds dynamic verified event inventory.
   */
  addVerifiedInventory(events: NormalizedEvent[]): void {
    this.customInventory.push(...events);
  }

  /**
   * Searches for genuine events across all connected inventory sources matching constraints.
   */
  async searchEvents(constraints: EventSearchConstraints): Promise<NormalizedEvent[]> {
    const rawInput = constraints.rawInput || '';
    const allInventory = this.includeDefaultInventory
      ? [...VERIFIED_EVENT_DATABASE, ...this.customInventory]
      : [...this.customInventory];

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

    // 3. Resolve Category Filter
    const targetCategory = constraints.category && constraints.category !== 'ALL' ? constraints.category : null;

    logger.info(
      { targetCities, dateRange: dateRange.displayText, targetCategory },
      '[EventDiscovery] Executing event search'
    );

    // 4. Filter Inventory
    const matchingEvents = allInventory.filter((event) => {
      // A. City Filter (matches any of the target cities)
      const isCityMatched = targetCities.some((c) => CityResolver.isCityMatch(event.city, c));
      if (!isCityMatched) return false;

      // B. Date Filter
      const isDateMatched = DateResolver.isDateMatch(event.date, dateRange);
      if (!isDateMatched) return false;

      // C. Category Filter (if explicitly requested)
      if (targetCategory && targetCategory !== 'GENERAL') {
        const eventCat = event.category.toUpperCase();
        const reqCat = targetCategory.toUpperCase();
        if (eventCat !== reqCat) {
          // Allow compatible cross-categories (e.g. MUSIC and CULTURE, or THEATRE and CULTURE)
          const isCompatible =
            (reqCat === 'MUSIC' && (eventCat === 'CULTURE' || event.tags?.includes('Music'))) ||
            (reqCat === 'COMEDY' && (event.tags?.includes('Standup') || event.tags?.includes('Comedy'))) ||
            (reqCat === 'THEATRE' && (eventCat === 'CULTURE' || event.tags?.includes('Theatre') || event.tags?.includes('Drama'))) ||
            (reqCat === 'ART_EXHIBITION' && (eventCat === 'CULTURE' || event.tags?.includes('Art'))) ||
            (reqCat === 'FAMILY' && (event.tags?.includes('Family') || event.tags?.includes('Kids')));

          if (!isCompatible) return false;
        }
      }

      // D. Budget Filter (if explicitly specified)
      if (constraints.budgetAmount && event.priceAmount !== undefined) {
        if (event.priceAmount > constraints.budgetAmount) {
          return false;
        }
      }

      // E. Party Size Filter (if event requires min/max party size)
      if (constraints.partySize && constraints.partySize > 20) {
        // High-party size requires VIP/hall scale venues
        if (event.venue.toLowerCase().includes('intimate')) return false;
      }

      return true;
    });

    // 5. Deduplicate Events (by Title + City + Date)
    const deduplicated = this.deduplicateEvents(matchingEvents);

    // 6. Rank Events
    return this.rankEvents(deduplicated, {
      primaryCity: targetCities[0],
      isSpecificDate: dateRange.isSpecificDate,
      preferences: constraints.preferences,
      keywords: constraints.keywords,
    });
  }

  async getEventById(eventId: string): Promise<NormalizedEvent | null> {
    const allInventory = [...VERIFIED_EVENT_DATABASE, ...this.customInventory];
    const match = allInventory.find((e) => e.eventId === eventId);
    return match || null;
  }

  /**
   * Deduplicates events appearing across multiple aggregator sources.
   */
  private deduplicateEvents(events: NormalizedEvent[]): NormalizedEvent[] {
    const seen = new Set<string>();
    const result: NormalizedEvent[] = [];

    for (const event of events) {
      const key = `${event.title.toLowerCase().trim()}|${event.city.toLowerCase()}|${event.date}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(event);
      }
    }

    return result;
  }

  /**
   * Multi-attribute ranking ensuring highest relevance and diversity.
   */
  private rankEvents(
    events: NormalizedEvent[],
    criteria: {
      primaryCity: string;
      isSpecificDate: boolean;
      preferences?: string[];
      keywords?: string[];
    }
  ): NormalizedEvent[] {
    return [...events].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Primary city priority
      if (CityResolver.isCityMatch(a.city, criteria.primaryCity)) scoreA += 50;
      if (CityResolver.isCityMatch(b.city, criteria.primaryCity)) scoreB += 50;

      // Verified / Exclusive priority
      if (a.isExclusive) scoreA += 20;
      if (b.isExclusive) scoreB += 20;

      if (a.availabilityStatus === 'AVAILABLE') scoreA += 10;
      if (b.availabilityStatus === 'AVAILABLE') scoreB += 10;

      // Preferences / Keywords fit
      if (criteria.keywords && criteria.keywords.length > 0) {
        const textA = `${a.title} ${a.description} ${(a.tags || []).join(' ')}`.toLowerCase();
        const textB = `${b.title} ${b.description} ${(b.tags || []).join(' ')}`.toLowerCase();

        for (const kw of criteria.keywords) {
          const lkw = kw.toLowerCase();
          if (textA.includes(lkw)) scoreA += 15;
          if (textB.includes(lkw)) scoreB += 15;
        }
      }

      return scoreB - scoreA;
    });
  }
}

export const universalEventDiscoveryProvider = new UniversalEventDiscoveryProvider();
