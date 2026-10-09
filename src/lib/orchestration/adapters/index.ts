import type { ProviderAdapterInterface, OptionProposal, ExecutionOutput, VerificationResult } from '../types';
import { AhmedabadVerifiedAdapter } from './ahmedabad-verified.adapter';
import { SwiggyAdapter } from './swiggy.adapter';
import { FlightsAdapter } from './flights.adapter';
import { CinemaAdapter } from './cinema.adapter';
import { EventsDiscoveryAdapter } from './events.adapter';
import { HealthcareDiscoveryAdapter } from './healthcare.adapter';
import { DuffelFlightsAdapter } from './duffel-flights.adapter';
import { DuffelStaysAdapter } from './duffel-stays.adapter';
import { MockDiningAdapter, MockHotelAdapter, MockMobilityAdapter, MockShoppingAdapter, MockResearchPlanningAdapter } from './mock-adapters';

export class AdapterRegistry {
  private static adapters: Map<string, ProviderAdapterInterface[]> = new Map();
  private static adaptersById: Map<string, ProviderAdapterInterface> = new Map();
  private static initialized = false;

  private static init() {
    if (this.initialized) return;
    this.register('dining', new AhmedabadVerifiedAdapter());
    this.register('dining', new SwiggyAdapter());
    this.register('dining', new MockDiningAdapter());
    this.register('food', new SwiggyAdapter());
    this.register('food_delivery', new SwiggyAdapter());
    this.register('delivery', new SwiggyAdapter());
    this.register('flights', new DuffelFlightsAdapter());
    this.register('flights', new FlightsAdapter());
    this.register('flight', new DuffelFlightsAdapter());
    this.register('flight', new FlightsAdapter());
    this.register('airline', new DuffelFlightsAdapter());
    this.register('airline', new FlightsAdapter());
    this.register('travel', new DuffelFlightsAdapter());
    this.register('travel', new FlightsAdapter());
    this.register('hotel', new DuffelStaysAdapter());
    this.register('hotel', new MockHotelAdapter());
    this.register('hotels', new DuffelStaysAdapter());
    this.register('hotels', new MockHotelAdapter());
    this.register('hotels_accommodation', new DuffelStaysAdapter());
    this.register('hotels_accommodation', new MockHotelAdapter());
    this.register('accommodation', new DuffelStaysAdapter());
    this.register('accommodation', new MockHotelAdapter());
    this.register('stay', new DuffelStaysAdapter());
    this.register('stay', new MockHotelAdapter());
    this.register('resort', new DuffelStaysAdapter());
    this.register('resort', new MockHotelAdapter());
    this.register('movies', new CinemaAdapter());
    this.register('cinema', new CinemaAdapter());
    this.register('movies_entertainment', new CinemaAdapter());
    this.register('experiences', new EventsDiscoveryAdapter());
    this.register('events', new EventsDiscoveryAdapter());
    this.register('events_experiences', new EventsDiscoveryAdapter());
    this.register('event', new EventsDiscoveryAdapter());
    this.register('navratri', new EventsDiscoveryAdapter());
    this.register('garba', new EventsDiscoveryAdapter());
    this.register('festivals', new EventsDiscoveryAdapter());
    this.register('festival', new EventsDiscoveryAdapter());
    this.register('passes', new EventsDiscoveryAdapter());
    this.register('pass', new EventsDiscoveryAdapter());
    this.register('vip_access', new EventsDiscoveryAdapter());
    this.register('culture', new EventsDiscoveryAdapter());
    this.register('music', new EventsDiscoveryAdapter());
    this.register('comedy', new EventsDiscoveryAdapter());
    this.register('theatre', new EventsDiscoveryAdapter());
    this.register('mobility', new MockMobilityAdapter());
    this.register('transport', new MockMobilityAdapter());
    this.register('transit', new MockMobilityAdapter());
    this.register('shopping', new MockShoppingAdapter());
    this.register('gift', new MockShoppingAdapter());
    this.register('gifts', new MockShoppingAdapter());
    this.register('weekend_escapes', new AhmedabadVerifiedAdapter());
    this.register('weekend_escapes', new MockHotelAdapter());
    this.register('research', new MockResearchPlanningAdapter());
    this.register('planning', new MockResearchPlanningAdapter());
    this.register('research_planning', new MockResearchPlanningAdapter());
    this.register('personal', new MockResearchPlanningAdapter());
    this.register('appointments', new HealthcareDiscoveryAdapter());
    this.register('appointment', new HealthcareDiscoveryAdapter());
    this.register('healthcare', new HealthcareDiscoveryAdapter());
    this.register('health_wellness', new HealthcareDiscoveryAdapter());
    this.register('doctor', new HealthcareDiscoveryAdapter());
    this.register('doctors', new HealthcareDiscoveryAdapter());
    this.register('medical', new HealthcareDiscoveryAdapter());
    this.register('clinic', new HealthcareDiscoveryAdapter());
    this.register('hospital', new HealthcareDiscoveryAdapter());
    this.register('dermatologist', new HealthcareDiscoveryAdapter());
    this.register('cardiologist', new HealthcareDiscoveryAdapter());
    this.register('pediatrician', new HealthcareDiscoveryAdapter());
    this.register('gifting', new MockShoppingAdapter());
    this.register('gifts_shopping', new MockShoppingAdapter());
    this.register('mobility_transport', new MockMobilityAdapter());
    this.register('trips', new AhmedabadVerifiedAdapter());
    this.register('trips', new MockHotelAdapter());
    this.register('trip', new AhmedabadVerifiedAdapter());
    this.register('trip', new MockHotelAdapter());
    this.register('bespoke_requests', new MockResearchPlanningAdapter());
    this.register('other', new MockResearchPlanningAdapter());
    this.register('other_concierge', new MockResearchPlanningAdapter());
    this.initialized = true;
  }

  static register(category: string, adapter: ProviderAdapterInterface) {
    const key = category.toLowerCase();
    const list = this.adapters.get(key) || [];
    list.push(adapter);
    this.adapters.set(key, list);

    if (adapter.providerId) {
      this.adaptersById.set(adapter.providerId, adapter);
    }
  }

  static getAdapters(category: string): ProviderAdapterInterface[] {
    return this.getAdaptersForCategory(category);
  }

  getAdapters(category: string): ProviderAdapterInterface[] {
    return AdapterRegistry.getAdaptersForCategory(category);
  }

  static getAdaptersForCategory(category: string): ProviderAdapterInterface[] {
    this.init();
    const general = this.adapters.get('all') || [];
    const specific = this.adapters.get(category.toLowerCase()) || [];
    // Prioritize REAL environment adapters ahead of SANDBOX adapters
    return [...general, ...specific].sort((a, b) => {
      if (a.environment === 'REAL' && b.environment !== 'REAL') return -1;
      if (a.environment !== 'REAL' && b.environment === 'REAL') return 1;
      return 0;
    });
  }

  static getAdapterById(providerId: string): ProviderAdapterInterface | undefined {
    this.init();
    return this.adaptersById.get(providerId);
  }

  static getAdapter(providerId: string): ProviderAdapterInterface | undefined {
    return this.getAdapterById(providerId);
  }

  static getAllAdapters(): ProviderAdapterInterface[] {
    this.init();
    return Array.from(this.adaptersById.values());
  }

  static getPrimaryAdapter(category: string): ProviderAdapterInterface {
    const list = this.getAdaptersForCategory(category);
    return list[0] || new AhmedabadVerifiedAdapter();
  }
}

export const adapterRegistry = AdapterRegistry;

export * from './duffel-client';
export * from './duffel-flights.adapter';
export * from './duffel-stays.adapter';
