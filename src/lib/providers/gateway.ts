import type { BaseProviderInterface, IntegrationStatus, ProviderResult, ProviderServiceCategory } from './types';
import type { FlightProvider } from './flights/interface';
import type { HotelProvider } from './hotels/interface';
import type { RestaurantProvider } from './restaurants/interface';
import type { FoodProvider } from './food/interface';
import type { CabProvider } from './cabs/interface';
import type { MovieProvider } from './movies/interface';
import type { GiftProvider } from './gifts/interface';
import type { ExperienceProvider } from './experiences/interface';
import type { PaymentProvider } from './payments/interface';

export interface ProviderRouteOption {
  providerKey: string;
  name: string;
  priority: number; // 1 = Primary, 2 = Secondary, 3 = Fallback
  status: IntegrationStatus;
  isSandbox: boolean;
  instance: BaseProviderInterface;
}

export class ProventaProviderGateway {
  private static providers: Map<string, BaseProviderInterface> = new Map();
  private static routesByCategory: Map<ProviderServiceCategory, ProviderRouteOption[]> = new Map();
  private static initialized = false;

  static init() {
    if (this.initialized) return;
    this.initialized = true;
  }

  static registerProvider(option: ProviderRouteOption) {
    this.providers.set(option.providerKey, option.instance);

    const category = option.instance.category;
    const existing = this.routesByCategory.get(category) || [];
    existing.push(option);
    // Sort by priority (1 = highest)
    existing.sort((a, b) => a.priority - b.priority);
    this.routesByCategory.set(category, existing);
  }

  static getProvider<T extends BaseProviderInterface>(providerKey: string): T | null {
    return (this.providers.get(providerKey) as T) || null;
  }

  static getActiveProviderForCategory<T extends BaseProviderInterface>(category: ProviderServiceCategory): { provider: T; status: IntegrationStatus; isFallback: boolean } | null {
    const routes = this.routesByCategory.get(category) || [];
    
    // Find highest priority provider that is PRODUCTION_ACTIVE or SANDBOX
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      if (route.status === 'PRODUCTION_ACTIVE' || route.status === 'SANDBOX' || route.status === 'TESTING') {
        return {
          provider: route.instance as T,
          status: route.status,
          isFallback: i > 0,
        };
      }
    }

    // If all are NOT_CONNECTED or DISABLED, return the first one with its true status
    if (routes.length > 0) {
      return {
        provider: routes[0].instance as T,
        status: routes[0].status,
        isFallback: false,
      };
    }

    return null;
  }

  static getAllCategoryRoutes(category: ProviderServiceCategory): ProviderRouteOption[] {
    return this.routesByCategory.get(category) || [];
  }

  static getAllProviders(): ProviderRouteOption[] {
    const all: ProviderRouteOption[] = [];
    this.routesByCategory.forEach((routes) => {
      all.push(...routes);
    });
    return all;
  }
}
