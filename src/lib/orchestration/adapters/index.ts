import type { ProviderAdapterInterface, OptionProposal, ExecutionOutput, VerificationResult } from '../types';
import { AhmedabadVerifiedAdapter } from './ahmedabad-verified.adapter';
import { SwiggyAdapter } from './swiggy.adapter';
import { FlightsAdapter } from './flights.adapter';
import { CinemaAdapter } from './cinema.adapter';
import { MockDiningAdapter, MockHotelAdapter, MockMobilityAdapter, MockShoppingAdapter } from './mock-adapters';

export class AdapterRegistry {
  private static adapters: Map<string, ProviderAdapterInterface[]> = new Map();
  private static initialized = false;

  private static init() {
    if (this.initialized) return;
    this.register('all', new AhmedabadVerifiedAdapter());
    this.register('dining', new SwiggyAdapter());
    this.register('dining', new MockDiningAdapter());
    this.register('food', new SwiggyAdapter());
    this.register('delivery', new SwiggyAdapter());
    this.register('flights', new FlightsAdapter());
    this.register('travel', new FlightsAdapter());
    this.register('travel', new MockHotelAdapter());
    this.register('hotel', new MockHotelAdapter());
    this.register('movies', new CinemaAdapter());
    this.register('cinema', new CinemaAdapter());
    this.register('experiences', new CinemaAdapter());
    this.register('mobility', new MockMobilityAdapter());
    this.register('transit', new MockMobilityAdapter());
    this.register('shopping', new MockShoppingAdapter());
    this.register('gift', new MockShoppingAdapter());
    this.initialized = true;
  }

  static register(category: string, adapter: ProviderAdapterInterface) {
    const key = category.toLowerCase();
    const list = this.adapters.get(key) || [];
    list.push(adapter);
    this.adapters.set(key, list);
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

  static getPrimaryAdapter(category: string): ProviderAdapterInterface {
    const list = this.getAdaptersForCategory(category);
    return list[0] || new AhmedabadVerifiedAdapter();
  }
}

export const adapterRegistry = AdapterRegistry;
