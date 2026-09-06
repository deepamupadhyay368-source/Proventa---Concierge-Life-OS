import type { TaskAgentInterface, ExtractedEntities, OptionProposal, ExecutionOutput, VerificationResult } from '../types';
import { AdapterRegistry } from '../adapters';

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

    for (const adapter of adapters) {
      const results = await adapter.search({
        category: this.category,
        intent: entities.intent,
        rawInput: entities.rawInput,
        constraints: {
          partySize: entities.partySize,
          budget: entities.budgetRange || entities.budgetAmount,
          preferences,
        },
      });
      proposals.push(...results);
    }

    return this.rankOptions(proposals, preferences);
  }

  rankOptions(options: OptionProposal[], preferences?: Record<string, any>): OptionProposal[] {
    return options.sort((a, b) => {
      if (a.isMock === false && b.isMock === true) return -1;
      if (a.isMock === true && b.isMock === false) return 1;
      return 0;
    });
  }

  async execute(task: any, proposal: OptionProposal): Promise<ExecutionOutput> {
    const adapters = AdapterRegistry.getAdaptersForCategory(this.category);
    const adapter = adapters[0];

    if (!adapter) {
      return {
        success: false,
        providerName: proposal.providerName,
        status: 'FAILED',
        confirmedDetails: {},
        errorMessage: `No provider adapter registered for ${this.category}`,
      };
    }

    return adapter.execute(proposal, {
      guests: task.partySize || 2,
      scheduledTime: task.targetDate ? new Date(task.targetDate).toISOString() : 'Scheduled',
      specialRequests: task.clientPreferences ? JSON.stringify(task.clientPreferences) : '',
    });
  }

  async verify(execution: ExecutionOutput): Promise<VerificationResult> {
    const adapters = AdapterRegistry.getAdaptersForCategory(this.category);
    const adapter = adapters[0];

    if (!adapter || !execution.externalReferenceId) {
      return {
        verified: false,
        status: 'FAILED',
        isMock: false,
        verifiedAt: new Date(),
        auditTrail: 'No adapter or reference available for verification',
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
  flights: new TravelAgent(),
  mobility: new MobilityAgent(),
  transit: new MobilityAgent(),
  shopping: new ShoppingAgent(),
  gift: new GiftAgent(),
  experiences: new EntertainmentAgent(),
  home: new HomeServicesAgent(),
  business: new EventsAgent(),
  personal: new ResearchAgent(),
  appointments: new CalendarAgent(),
  other: new HumanConciergeAgent(),
};

export function findAgentForTask(category: string, intent?: string): TaskAgentInterface {
  const cat = category.toLowerCase();
  return AGENT_REGISTRY[cat] || AGENT_REGISTRY['other'];
}
