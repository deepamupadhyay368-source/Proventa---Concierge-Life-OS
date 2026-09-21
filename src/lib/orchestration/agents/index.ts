import type { TaskAgentInterface, ExtractedEntities, OptionProposal, ExecutionOutput, VerificationResult } from '../types';
import { AdapterRegistry } from '../adapters';
import { EntityIntegrityValidator } from '@/lib/validation/entity-integrity';

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
    const adapters = AdapterRegistry.getAdaptersForCategory(this.category);
    const proposals: OptionProposal[] = [];

    const constraints = {
      origin: entities.origin,
      originAirport: entities.originAirport,
      destination: entities.destination,
      destinationAirport: entities.destinationAirport,
      location: entities.location || entities.destination,
      dateTime: entities.dateTime,
      partySize: entities.partySize,
      budget: entities.budgetRange || entities.budgetAmount,
      preferences,
    };

    for (const adapter of adapters) {
      const results = await adapter.search({
        category: this.category,
        intent: entities.intent,
        rawInput: entities.rawInput,
        constraints,
      });
      proposals.push(...results);
    }

    // Deterministic validation: Filter out any proposals violating critical constraints
    const validProposals = EntityIntegrityValidator.filterProposalsByConstraints(
      proposals,
      {
        category: this.category,
        destination: entities.destination,
        destinationAirport: entities.destinationAirport,
        origin: entities.origin,
        originAirport: entities.originAirport,
        location: entities.location,
      }
    );

    return this.rankOptions(validProposals, preferences);
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
    super('Travel & Accommodations Agent', 'travel');
  }

  override identifyMissingInformation(entities: ExtractedEntities): string[] {
    const missing: string[] = [];
    if (!entities.destination && !entities.location && !entities.rawInput.toLowerCase().includes('hotel')) {
      missing.push('destination or property');
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

export class HomeServicesAgent extends BaseDomainAgent {
  constructor() {
    super('Home & Estate Services Agent', 'home');
  }
}

export class EventsAgent extends BaseDomainAgent {
  constructor() {
    super('Events & Gatherings Agent', 'business');
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
  hotel: new TravelAgent(),
  hotels: new TravelAgent(),
  flight: new TravelAgent(),
  flights: new TravelAgent(),
  airline: new TravelAgent(),
  transport: new MobilityAgent(),
  mobility: new MobilityAgent(),
  transit: new MobilityAgent(),
  food_delivery: new DiningAgent(),
  food: new DiningAgent(),
  delivery: new DiningAgent(),
  movies_entertainment: new EntertainmentAgent(),
  experiences: new EntertainmentAgent(),
  movies: new EntertainmentAgent(),
  movie: new EntertainmentAgent(),
  cinema: new EntertainmentAgent(),
  entertainment: new EntertainmentAgent(),
  gifts: new GiftAgent(),
  gift: new GiftAgent(),
  shopping: new ShoppingAgent(),
  salon_wellness: new CalendarAgent(),
  wellness: new CalendarAgent(),
  salon: new CalendarAgent(),
  spa: new CalendarAgent(),
  appointments: new CalendarAgent(),
  appointment: new CalendarAgent(),
  events: new EventsAgent(),
  event: new EventsAgent(),
  business: new EventsAgent(),
  weekend_escapes: new TravelAgent(),
  weekend_escape: new TravelAgent(),
  research_planning: new ResearchAgent(),
  research: new ResearchAgent(),
  planning: new ResearchAgent(),
  personal: new ResearchAgent(),
  home: new HomeServicesAgent(),
  other_concierge: new HumanConciergeAgent(),
  other: new HumanConciergeAgent(),
  concierge: new HumanConciergeAgent(),
};

export function findAgentForTask(category: string, intent?: string): TaskAgentInterface {
  const cat = (category || 'other').toLowerCase().replace(/[\s-]/g, '_');
  return AGENT_REGISTRY[cat] || AGENT_REGISTRY['other'];
}
