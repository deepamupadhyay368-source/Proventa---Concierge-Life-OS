/**
 * PROVENTA — MULTI-SOURCE AI EVENT RESEARCH ABSTRACTION
 * Clean source abstractions for querying verified inventories, official venue calendars, public agendas, and future API integrations.
 * Strictly adheres to zero fabrication and graceful error handling.
 */

import { NormalizedEvent, EventSearchConstraints, EventCategory } from './types';
import { VERIFIED_EVENT_DATABASE } from './registry';
import { CityResolver } from './city-resolver';
import { DateResolver } from './date-resolver';
import { logger } from '@/lib/logger';

export interface EventResearchSource {
  readonly sourceId: string;
  readonly name: string;
  readonly isConfigured: boolean;
  search(constraints: EventSearchConstraints): Promise<NormalizedEvent[]>;
}

/**
 * 1. Proventa Verified Event Inventory Source
 * Curated high-reliability local events verified by Proventa Intelligence.
 */
export class ProventaVerifiedInventorySource implements EventResearchSource {
  readonly sourceId = 'proventa_verified_inventory';
  readonly name = 'Proventa Verified Event Inventory';
  readonly isConfigured = true;

  private customEvents: NormalizedEvent[] = [];

  constructor(customEvents: NormalizedEvent[] = []) {
    this.customEvents = customEvents;
  }

  addEvents(events: NormalizedEvent[]) {
    this.customEvents.push(...events);
  }

  async search(constraints: EventSearchConstraints): Promise<NormalizedEvent[]> {
    const rawInput = constraints.rawInput || '';
    const all = [...VERIFIED_EVENT_DATABASE, ...this.customEvents];

    // City resolution
    const targetCity = constraints.city 
      ? CityResolver.normalizeCity(constraints.city) 
      : (constraints.rawInput ? CityResolver.extractCities(constraints.rawInput).primaryCity : 'Ahmedabad');
    const targetCities = constraints.cities && constraints.cities.length > 0
      ? constraints.cities.map(c => CityResolver.normalizeCity(c))
      : [targetCity];

    // Date resolution
    const dateRange = constraints.startDate && constraints.endDate && !constraints.date
      ? {
          startDate: constraints.startDate,
          endDate: constraints.endDate,
          isSpecificDate: constraints.startDate === constraints.endDate,
          isDateRange: constraints.startDate !== constraints.endDate,
          isUpcomingWindow: true,
          displayText: `${constraints.startDate} to ${constraints.endDate}`,
          resolvedFrom: 'CONSTRAINTS_WINDOW',
        }
      : DateResolver.resolveDate(constraints.date || rawInput);

    return all.filter((e) => {
      // City check
      const cityMatches = targetCities.some(c => CityResolver.isCityMatch(e.city, c));
      if (!cityMatches) return false;

      // Date check
      if (!DateResolver.isDateMatch(e.date, dateRange)) return false;

      return true;
    });
  }
}

/**
 * 2. Official Venues Calendar Source
 * Official calendars directly from premier cultural centres (NMACC, NCPA, Natarani, Sunder Nursery, Science City, BIC).
 */
export class OfficialVenuesCalendarSource implements EventResearchSource {
  readonly sourceId = 'official_venues_calendar';
  readonly name = 'Official Venues Calendar Registry';
  readonly isConfigured = true;

  async search(constraints: EventSearchConstraints): Promise<NormalizedEvent[]> {
    const rawInput = constraints.rawInput || '';
    const targetCity = constraints.city 
      ? CityResolver.normalizeCity(constraints.city) 
      : (constraints.rawInput ? CityResolver.extractCities(constraints.rawInput).primaryCity : 'Ahmedabad');
    const targetCities = constraints.cities && constraints.cities.length > 0
      ? constraints.cities.map(c => CityResolver.normalizeCity(c))
      : [targetCity];

    const dateRange = constraints.startDate && constraints.endDate && !constraints.date
      ? {
          startDate: constraints.startDate,
          endDate: constraints.endDate,
          isSpecificDate: constraints.startDate === constraints.endDate,
          isDateRange: constraints.startDate !== constraints.endDate,
          isUpcomingWindow: true,
          displayText: `${constraints.startDate} to ${constraints.endDate}`,
          resolvedFrom: 'CONSTRAINTS_WINDOW',
        }
      : DateResolver.resolveDate(constraints.date || rawInput);

    // Official venue items from verified database tagged with venue desks
    const venueDeskEvents = VERIFIED_EVENT_DATABASE.filter(e => 
      e.source.toLowerCase().includes('desk') || 
      e.source.toLowerCase().includes('box office') ||
      e.source.toLowerCase().includes('registry')
    );

    return venueDeskEvents.filter((e) => {
      const cityMatches = targetCities.some(c => CityResolver.isCityMatch(e.city, c));
      if (!cityMatches) return false;
      return DateResolver.isDateMatch(e.date, dateRange);
    });
  }
}

/**
 * 3. Public Event Agendas Source
 * Permitted municipal, cultural festival, and civic event agendas.
 */
export class PublicEventAgendasSource implements EventResearchSource {
  readonly sourceId = 'public_event_agendas';
  readonly name = 'Public Event Agendas & Cultural Council';
  readonly isConfigured = true;

  async search(constraints: EventSearchConstraints): Promise<NormalizedEvent[]> {
    const rawInput = constraints.rawInput || '';
    const targetCity = constraints.city 
      ? CityResolver.normalizeCity(constraints.city) 
      : (constraints.rawInput ? CityResolver.extractCities(constraints.rawInput).primaryCity : 'Ahmedabad');
    const targetCities = constraints.cities && constraints.cities.length > 0
      ? constraints.cities.map(c => CityResolver.normalizeCity(c))
      : [targetCity];

    const dateRange = constraints.startDate && constraints.endDate && !constraints.date
      ? {
          startDate: constraints.startDate,
          endDate: constraints.endDate,
          isSpecificDate: constraints.startDate === constraints.endDate,
          isDateRange: constraints.startDate !== constraints.endDate,
          isUpcomingWindow: true,
          displayText: `${constraints.startDate} to ${constraints.endDate}`,
          resolvedFrom: 'CONSTRAINTS_WINDOW',
        }
      : DateResolver.resolveDate(constraints.date || rawInput);

    const publicAgendas = VERIFIED_EVENT_DATABASE.filter(e =>
      e.category === 'FESTIVALS' ||
      e.category === 'NAVRATRI' ||
      e.category === 'CULTURAL' ||
      e.category === 'HERITAGE' ||
      e.category === 'COMMUNITY'
    );

    return publicAgendas.filter((e) => {
      const cityMatches = targetCities.some(c => CityResolver.isCityMatch(e.city, c));
      if (!cityMatches) return false;
      return DateResolver.isDateMatch(e.date, dateRange);
    });
  }
}

/**
 * 4. Ticketing Integrations Source (Enterprise Aggregator)
 * Architecturally supported. Cleanly marked as NOT_CONFIGURED until production credentials are provided.
 */
export class TicketingIntegrationsSource implements EventResearchSource {
  readonly sourceId = 'ticketing_integrations';
  readonly name = 'Ticketing Platform Integration Gateway';
  readonly isConfigured = false; // Requires enterprise aggregator API keys

  async search(_constraints: EventSearchConstraints): Promise<NormalizedEvent[]> {
    // Graceful no-op when credentials are not configured — zero fabrication
    return [];
  }
}

/**
 * 5. Enterprise Partner APIs Source
 * Architecturally supported. Cleanly marked as NOT_CONFIGURED.
 */
export class EnterprisePartnerAPIsSource implements EventResearchSource {
  readonly sourceId = 'enterprise_partner_apis';
  readonly name = 'Enterprise Partner Discovery API';
  readonly isConfigured = false;

  async search(_constraints: EventSearchConstraints): Promise<NormalizedEvent[]> {
    return [];
  }
}
