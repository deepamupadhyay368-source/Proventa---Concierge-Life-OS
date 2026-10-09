import type { TaskAgentInterface, ExtractedEntities, OptionProposal, ExecutionOutput, VerificationResult } from '../types';
import { AdapterRegistry } from '../adapters';
import { EntityIntegrityValidator } from '@/lib/validation/entity-integrity';
import { AutonomousDiscoveryEngine } from '../discovery/engine';

class BaseDomainAgent implements TaskAgentInterface {
  name: string;
  category: string;

  constructor(name: string, category: string) {
    this.name = name;
    this.category = category;
  }

  canHandle(category: string, intent: string): boolean {
    return category.toLowerCase() === this.category.toLowerCase();
  }

  identifyMissingInformation(entities: ExtractedEntities): string[] {
    // Default base agent does not block on missing info if intent is clear
    return [];
  }

  async search(entities: ExtractedEntities, preferences?: Record<string, any>): Promise<OptionProposal[]> {
    const rawLower = (entities.rawInput || '').toLowerCase();
    let searchCategory = this.category;

    if (
      entities.category === 'hotels' ||
      entities.category === 'hotel' ||
      entities.category === 'hotels_accommodation' ||
      rawLower.includes('hotel') ||
      rawLower.includes('stay') ||
      rawLower.includes('resort') ||
      rawLower.includes('villa') ||
      rawLower.includes('suite')
    ) {
      if (!rawLower.includes('flight') && !rawLower.includes('fly') && !rawLower.includes('airline')) {
        searchCategory = 'hotels';
      }
    } else if (
      entities.category === 'flights' ||
      entities.category === 'flight' ||
      rawLower.includes('flight') ||
      rawLower.includes('fly') ||
      rawLower.includes('airline') ||
      rawLower.includes('airport')
    ) {
      if (!rawLower.includes('hotel') && !rawLower.includes('resort') && !rawLower.includes('stay')) {
        searchCategory = 'flights';
      }
    }

    const discoveryResult = await AutonomousDiscoveryEngine.discover({
      customerId: (entities as any).customerId || '',
      category: searchCategory || entities.category || 'bespoke_requests',
      originalRequest: entities.rawInput || entities.intent || '',
      origin: entities.origin,
      destination: entities.destination,
      location: entities.location || entities.destination,
      dates: entities.dateTime ? { exact: entities.dateTime } : undefined,
      partySize: entities.partySize,
      budget: entities.budgetRange || (entities.budgetAmount ? String(entities.budgetAmount) : undefined),
      preferences,
      customerNotes: (preferences as any)?.customerNotes,
      returnAll: true,
    } as any);

    return discoveryResult.options;
  }

  rankOptions(options: OptionProposal[], preferences?: Record<string, any>): OptionProposal[] {
    return options.sort((a, b) => {
      if (a.isMock === false && b.isMock === true) return -1;
      if (a.isMock === true && b.isMock === false) return 1;
      return 0;
    });
  }

  async execute(task: any, proposal: OptionProposal): Promise<ExecutionOutput> {
    if (!proposal.providerId) {
      return {
        success: false,
        providerName: proposal.providerName,
        status: 'FAILED',
        environment: proposal.environment,
        isMock: proposal.isMock,
        confirmedDetails: {},
        errorMessage: `Execution aborted: Proposal '${proposal.title}' does not specify a valid providerId.`,
      };
    }

    const adapter = AdapterRegistry.getAdapterById(proposal.providerId);
    if (!adapter) {
      return {
        success: false,
        providerId: proposal.providerId,
        providerName: proposal.providerName,
        status: 'FAILED',
        environment: proposal.environment,
        isMock: proposal.isMock,
        confirmedDetails: {},
        errorMessage: `Execution aborted: Provider adapter '${proposal.providerId}' not found in registry.`,
      };
    }

    // Ensure adapter supports this category or general 'all'
    const supportsDomain =
      adapter.supportedCategories.includes(this.category.toLowerCase()) ||
      adapter.supportedCategories.includes('all');

    if (!supportsDomain) {
      return {
        success: false,
        providerId: proposal.providerId,
        providerName: proposal.providerName,
        status: 'FAILED',
        environment: proposal.environment,
        isMock: proposal.isMock,
        confirmedDetails: {},
        errorMessage: `Execution aborted: Provider adapter '${proposal.providerId}' does not support domain category '${this.category}'.`,
      };
    }

    const executionResult = await adapter.execute(proposal, {
      guests: task.partySize || 2,
      scheduledTime: task.targetDate ? new Date(task.targetDate).toISOString() : 'Scheduled',
      specialRequests: task.clientPreferences ? JSON.stringify(task.clientPreferences) : '',
    });

    // Guarantee providerId is attached to execution output
    if (!executionResult.providerId) {
      executionResult.providerId = adapter.providerId;
    }

    return executionResult;
  }

  async verify(execution: ExecutionOutput): Promise<VerificationResult> {
    if (!execution.providerId) {
      return {
        verified: false,
        status: 'FAILED',
        isMock: execution.isMock,
        verifiedAt: new Date(),
        auditTrail: 'Verification failed: Execution output is missing providerId.',
      };
    }

    const adapter = AdapterRegistry.getAdapterById(execution.providerId);
    if (!adapter) {
      return {
        verified: false,
        status: 'FAILED',
        isMock: execution.isMock,
        verifiedAt: new Date(),
        auditTrail: `Verification failed: Provider adapter '${execution.providerId}' not found in registry.`,
      };
    }

    if (!execution.externalReferenceId) {
      return {
        verified: false,
        status: 'FAILED',
        environment: adapter.environment,
        isMock: execution.isMock,
        verifiedAt: new Date(),
        auditTrail: 'Verification failed: No external reference available for verification.',
      };
    }

    return adapter.verify(execution.externalReferenceId);
  }
}

export class DiningAgent extends BaseDomainAgent {
  constructor() {
    super('Dining & Reservations Agent', 'dining');
  }

  override identifyMissingInformation(entities: ExtractedEntities): string[] {
    const missing: string[] = [];
    if (!entities.partySize && !entities.rawInput.toLowerCase().includes('for ')) {
      missing.push('number of guests');
    }
    return missing;
  }
}

export class TravelAgent extends BaseDomainAgent {
  constructor() {
    super('Travel & Flight Specialist Agent', 'flights');
  }

  override identifyMissingInformation(entities: ExtractedEntities): string[] {
    const missing: string[] = [];
    if (!entities.destination && !entities.destinationAirport && !entities.location && !entities.rawInput.toLowerCase().includes('flight')) {
      missing.push('destination city or airport');
    }
    return missing;
  }
}

export class HotelAgent extends BaseDomainAgent {
  constructor() {
    super('Hotels & Accommodations Agent', 'hotels');
  }

  override identifyMissingInformation(entities: ExtractedEntities): string[] {
    const missing: string[] = [];
    if (!entities.destination && !entities.location && !entities.rawInput.toLowerCase().includes('hotel')) {
      missing.push('destination city or location');
    }
    return missing;
  }
}

export class MobilityAgent extends BaseDomainAgent {
  constructor() {
    super('Mobility & Chauffeur Agent', 'mobility');
  }

  override identifyMissingInformation(entities: ExtractedEntities): string[] {
    const missing: string[] = [];
    if (!entities.location && !entities.rawInput.toLowerCase().includes('airport')) {
      missing.push('pickup or drop-off location');
    }
    return missing;
  }
}

export class ShoppingAgent extends BaseDomainAgent {
  constructor() {
    super('Shopping & Gifting Agent', 'shopping');
  }

  override identifyMissingInformation(): string[] {
    return [];
  }
}

export class EntertainmentAgent extends BaseDomainAgent {
  constructor() {
    super('Entertainment & Experiences Agent', 'experiences');
  }
}

export class CinemaAgent extends BaseDomainAgent {
  constructor() {
    super('Cinema & Entertainment Specialist Agent', 'movies');
  }
}

export class HomeServicesAgent extends BaseDomainAgent {
  constructor() {
    super('Home & Estate Services Agent', 'home');
  }
}

export class EventsAgent extends BaseDomainAgent {
  constructor() {
    super('Events & Gatherings Agent', 'events');
  }
}

export class ResearchAgent extends BaseDomainAgent {
  constructor() {
    super('Research & Advisory Agent', 'personal');
  }
}

export class CalendarAgent extends BaseDomainAgent {
  constructor() {
    super('Calendar & Appointments Agent', 'appointments');
  }
}

export class HealthcareAgent extends BaseDomainAgent {
  constructor() {
    super('Healthcare & Doctor Discovery Agent', 'healthcare');
  }
}

export class CommunicationAgent extends BaseDomainAgent {
  constructor() {
    super('Communication & Outbound Agent', 'personal');
  }
}

export class GiftAgent extends BaseDomainAgent {
  constructor() {
    super('Curated Gifting Agent', 'gift');
  }
}

export class HumanConciergeAgent extends BaseDomainAgent {
  constructor() {
    super('Human Concierge Triage Agent', 'other');
  }

  override async search(): Promise<OptionProposal[]> {
    return [];
  }
}

// Agent Directory Mapping
export const AGENT_REGISTRY: Record<string, TaskAgentInterface> = {
  dining: new DiningAgent(),
  travel: new TravelAgent(),
  flight: new TravelAgent(),
  flights: new TravelAgent(),
  airline: new TravelAgent(),
  hotel: new HotelAgent(),
  hotels: new HotelAgent(),
  hotels_accommodation: new HotelAgent(),
  accommodation: new HotelAgent(),
  stay: new HotelAgent(),
  resort: new HotelAgent(),
  transport: new MobilityAgent(),
  mobility: new MobilityAgent(),
  transit: new MobilityAgent(),
  food_delivery: new DiningAgent(),
  food: new DiningAgent(),
  delivery: new DiningAgent(),
  movies_entertainment: new CinemaAgent(),
  experiences: new EventsAgent(),
  movies: new CinemaAgent(),
  movie: new CinemaAgent(),
  cinema: new CinemaAgent(),
  entertainment: new EventsAgent(),
  gifts: new GiftAgent(),
  gift: new GiftAgent(),
  shopping: new ShoppingAgent(),
  salon_wellness: new CalendarAgent(),
  wellness: new CalendarAgent(),
  salon: new CalendarAgent(),
  spa: new CalendarAgent(),
  appointments: new HealthcareAgent(),
  appointment: new HealthcareAgent(),
  healthcare: new HealthcareAgent(),
  doctor: new HealthcareAgent(),
  doctors: new HealthcareAgent(),
  medical: new HealthcareAgent(),
  clinic: new HealthcareAgent(),
  hospital: new HealthcareAgent(),
  dermatologist: new HealthcareAgent(),
  cardiologist: new HealthcareAgent(),
  pediatrician: new HealthcareAgent(),
  events: new EventsAgent(),
  events_experiences: new EventsAgent(),
  event: new EventsAgent(),
  navratri: new EventsAgent(),
  garba: new EventsAgent(),
  festivals: new EventsAgent(),
  festival: new EventsAgent(),
  passes: new EventsAgent(),
  pass: new EventsAgent(),
  concert: new EventsAgent(),
  concerts: new EventsAgent(),
  comedy: new EventsAgent(),
  theatre: new EventsAgent(),
  theater: new EventsAgent(),
  culture: new EventsAgent(),
  cultural: new EventsAgent(),
  art: new EventsAgent(),
  exhibition: new EventsAgent(),
  business: new EventsAgent(),
  weekend_escapes: new HotelAgent(),
  weekend_escape: new HotelAgent(),
  trips: new HotelAgent(),
  trip: new HotelAgent(),
  gifting: new GiftAgent(),
  gifts_shopping: new GiftAgent(),
  health_wellness: new HealthcareAgent(),
  mobility_transport: new MobilityAgent(),
  research_planning: new ResearchAgent(),
  research: new ResearchAgent(),
  planning: new ResearchAgent(),
  personal: new ResearchAgent(),
  home: new HomeServicesAgent(),
  bespoke_requests: new ResearchAgent(),
  other_concierge: new HumanConciergeAgent(),
  other: new HumanConciergeAgent(),
  concierge: new HumanConciergeAgent(),
};

export function findAgentForTask(category: string, intent?: string): TaskAgentInterface {
  const cat = (category || 'other').toLowerCase().replace(/[\s-]/g, '_');
  const raw = (intent || '').toLowerCase();

  // Explicit disambiguation when category is generic or ambiguously classified
  if (cat === 'travel' || cat === 'other' || cat === 'other_concierge' || cat === 'bespoke_requests' || !AGENT_REGISTRY[cat]) {
    if (raw.includes('movie') || raw.includes('cinema') || raw.includes('imax') || raw.includes('pvr') || raw.includes('inox') || raw.includes('showtime') || raw.includes('film') || raw.includes('movie ticket')) {
      return AGENT_REGISTRY['movies'];
    }
    if (raw.includes('hotel') || raw.includes('stay') || raw.includes('resort') || raw.includes('villa') || raw.includes('suite') || raw.includes('accommodation')) {
      return AGENT_REGISTRY['hotels'];
    }
    if (
      raw.includes('flight') ||
      raw.includes('flights') ||
      raw.includes('fly') ||
      raw.includes('airline') ||
      raw.includes('airport') ||
      raw.includes('airfare') ||
      raw.includes('air ticket') ||
      raw.includes('economy class') ||
      raw.includes('business class') ||
      raw.includes('first class') ||
      /(?:amd|bom|del|blr|goi|hyd|ccu|maa|jai|udr|pnq|cok|dxb|lhr|sin)\s+to\s+(?:amd|bom|del|blr|goi|hyd|ccu|maa|jai|udr|pnq|cok|dxb|lhr|sin)/i.test(raw)
    ) {
      return AGENT_REGISTRY['flights'];
    }
    if (raw.includes('gift') || raw.includes('flower') || raw.includes('hampers') || raw.includes('present')) {
      return AGENT_REGISTRY['gifts'];
    }
    if (raw.includes('cab') || raw.includes('sedan') || raw.includes('chauffeur') || raw.includes('pickup') || raw.includes('transfer') || raw.includes('taxi')) {
      return AGENT_REGISTRY['transport'];
    }
    if (raw.includes('weekend') || raw.includes('escape') || raw.includes('getaway') || raw.includes('trip')) {
      return AGENT_REGISTRY['weekend_escapes'];
    }
    if (
      raw.includes('event') ||
      raw.includes('concert') ||
      raw.includes('comedy') ||
      raw.includes('theatre') ||
      raw.includes('theater') ||
      raw.includes('show') ||
      raw.includes('happening') ||
      raw.includes('garba') ||
      raw.includes('navratri') ||
      raw.includes('dandiya') ||
      raw.includes('pass') ||
      raw.includes('passes') ||
      raw.includes('festival')
    ) {
      return AGENT_REGISTRY['events'];
    }
    if (raw.includes('doctor') || raw.includes('doctors') || raw.includes('clinic') || raw.includes('hospital') || raw.includes('appointment') || raw.includes('specialist') || raw.includes('dermatolog') || raw.includes('cardiolog')) {
      return AGENT_REGISTRY['healthcare'];
    }
    if (raw.includes('dine') || raw.includes('dinner') || raw.includes('restaurant') || raw.includes('table') || raw.includes('food') || raw.includes('pizza') || raw.includes('meal')) {
      return AGENT_REGISTRY['dining'];
    }
  }

  return AGENT_REGISTRY[cat] || AGENT_REGISTRY['other'];
}
