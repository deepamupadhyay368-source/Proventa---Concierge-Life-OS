import { ProventaBaseAgent, type AgentObservation, type AgentExecutionPlan } from '../runtime/base-agent';
import type { AgentPermission } from '../permissions/permissions';
import type { ExtractedEntities } from '@/lib/orchestration/types';

export { ProventaBaseAgent };

// 1. DINING SPECIALIST AGENT
export class DiningSpecialistAgent extends ProventaBaseAgent {
  readonly id = 'agent-dining';
  readonly name = 'Dining & Epicurean Specialist';
  readonly role = 'Fine dining reservation, private chef sourcing, and gastronomic curation specialist';
  readonly category = 'dining';
  readonly systemInstructions = `You are Proventa's Dining & Epicurean Specialist. You handle table bookings, private dining rooms, dietary constraints, and tasting menu reservations. Strictly verify table capacity and client preferences. Never fabricate a reservation.`;
  readonly capabilities = ['Restaurant search', 'Table reservation', 'Dietary customization', 'Sommelier coordination'];
  readonly limitations = ['Cannot modify guest counts beyond venue limits', 'Cannot guarantee seating without provider confirmation'];
  readonly allowedTools = ['searchRestaurants', 'reserveDining'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'CANCEL', 'MODIFY'];

  override identifyMissingInformation(entities: ExtractedEntities): string[] {
    const missing: string[] = [];
    if (!entities.partySize && !entities.rawInput.toLowerCase().includes('for ')) {
      missing.push('number of guests');
    }
    return missing;
  }

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    const partySize = observation.entities.partySize || 2;
    const dateTime = observation.entities.dateTime || 'Tomorrow 8:00 PM';
    const cuisine = observation.clientMemory.explicitPreferences['cuisine'] || observation.entities.category;

    return {
      rationale: `Locate and reserve premier dining for ${partySize} guests matching ${cuisine || 'fine dining'} preferences.`,
      selectedTool: 'reserveDining',
      toolInput: {
        proposal: {
          providerName: 'Agashiye - The House of MG',
          title: 'Heritage Rooftop Dining',
        },
        partySize,
        dateTime,
        specialRequests: observation.clientMemory.explicitPreferences['dietary'] || 'Quiet table requested',
      },
      riskLevel: 'MEDIUM',
      requiredPermission: 'RESERVE',
      needsApproval: false, // Under threshold
    };
  }
}

// 2. TRAVEL SPECIALIST AGENT
export class TravelSpecialistAgent extends ProventaBaseAgent {
  readonly id = 'agent-travel';
  readonly name = 'Travel & Luxury Stays Specialist';
  readonly role = 'Luxury hotel booking, bespoke itinerary creation, and flight coordination specialist';
  readonly category = 'travel';
  readonly systemInstructions = `You are Proventa's Travel & Luxury Stays Specialist. You book 5-star suites, villas, and private aviation. All hotel and flight expenditures require explicit client approval.`;
  readonly capabilities = ['Hotel suite reservations', 'Flight search', 'Bespoke itineraries'];
  readonly limitations = ['Cannot book non-refundable suites without client approval', 'Subject to airline schedule changes'];
  readonly allowedTools = ['searchHotels', 'reserveHotel'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'CANCEL', 'MODIFY'];

  override identifyMissingInformation(entities: ExtractedEntities): string[] {
    const missing: string[] = [];
    if (!entities.destination && !entities.location && !entities.rawInput.toLowerCase().includes('hotel')) {
      missing.push('destination or hotel property');
    }
    return missing;
  }

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    const destination = observation.entities.destination || observation.entities.location || 'Ahmedabad';
    return {
      rationale: `Search and coordinate luxury accommodation in ${destination}.`,
      selectedTool: 'reserveHotel',
      toolInput: {
        proposal: {
          providerName: 'ITC Narmada Luxury Collection',
          title: 'Club Suite Seclusion',
        },
        dates: observation.entities.dateTime || 'Upcoming weekend',
        guestName: 'Proventa VIP Client',
      },
      riskLevel: 'HIGH',
      requiredPermission: 'RESERVE',
      needsApproval: true, // Hotel bookings always require approval
    };
  }
}

// 3. MOBILITY SPECIALIST AGENT
export class MobilitySpecialistAgent extends ProventaBaseAgent {
  readonly id = 'agent-mobility';
  readonly name = 'Mobility & Chauffeur Specialist';
  readonly role = 'Executive chauffeur dispatch, airport transfers, and luxury fleet management';
  readonly category = 'mobility';
  readonly systemInstructions = `You are Proventa's Mobility & Chauffeur Specialist. Coordinate luxury transfers, airport meet-and-assist, and executive fleets.`;
  readonly capabilities = ['Chauffeur dispatch', 'Airport transfer quoting', 'Fleet reservation'];
  readonly limitations = ['Vehicles subject to local traffic windows', 'Fleet must be booked at least 1 hr in advance'];
  readonly allowedTools = ['quoteMobility', 'dispatchChauffeur'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'CANCEL', 'MODIFY'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Quote and dispatch executive chauffeur service.`,
      selectedTool: 'dispatchChauffeur',
      toolInput: {
        proposal: {
          providerName: 'SVPIA Luxury Chauffeur Fleet',
          title: 'Mercedes-Benz E-Class Transfer',
        },
        pickupLocation: observation.entities.location || 'Client Residence / Airport',
        dropoffLocation: observation.entities.destination || 'City Center',
        pickupTime: observation.entities.dateTime || 'As scheduled',
      },
      riskLevel: 'MEDIUM',
      requiredPermission: 'RESERVE',
      needsApproval: false, // Standard chauffeur under ₹2,500 auto-approved
    };
  }
}

// 4. ENTERTAINMENT SPECIALIST AGENT
export class EntertainmentSpecialistAgent extends ProventaBaseAgent {
  readonly id = 'agent-experiences';
  readonly name = 'Entertainment & Experiences Specialist';
  readonly role = 'VIP event access, private heritage walks, and cultural experience curator';
  readonly category = 'experiences';
  readonly systemInstructions = `Curate exclusive cultural, artistic, and entertainment experiences.`;
  readonly capabilities = ['VIP tickets', 'Private tours', 'Curated cultural access'];
  readonly limitations = ['Event capacity strictly controlled by venue organisers'];
  readonly allowedTools = ['searchExperiences'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'PURCHASE'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Search and coordinate VIP experience access.`,
      selectedTool: 'searchExperiences',
      toolInput: {
        experienceType: observation.originalRequest,
        attendees: observation.entities.partySize || 2,
      },
      riskLevel: 'LOW',
      requiredPermission: 'SEARCH',
      needsApproval: false,
    };
  }
}

// 5. SHOPPING SPECIALIST AGENT
export class ShoppingSpecialistAgent extends ProventaBaseAgent {
  readonly id = 'agent-shopping';
  readonly name = 'Shopping & Luxury Sourcing Specialist';
  readonly role = 'Fine jewelry, rare watches, bespoke textiles, and luxury item acquisition';
  readonly category = 'shopping';
  readonly systemInstructions = `Source rare, artisanal, and luxury goods with verified authenticity.`;
  readonly capabilities = ['Luxury product sourcing', 'Artisan identification', 'Bespoke purchasing'];
  readonly limitations = ['Cannot complete purchases exceeding budget without client approval'];
  readonly allowedTools = ['searchProducts', 'purchaseProduct'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'PURCHASE'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Source and acquire verified luxury merchandise.`,
      selectedTool: 'purchaseProduct',
      toolInput: {
        proposal: {
          providerName: 'Asopalav Heritage Couture',
          title: 'Curated Textile Selection',
        },
        deliveryAddress: 'Client Residence',
      },
      riskLevel: 'HIGH',
      requiredPermission: 'PURCHASE',
      needsApproval: true,
    };
  }
}

// 6. HOME SERVICES SPECIALIST AGENT
export class HomeServicesSpecialistAgent extends ProventaBaseAgent {
  readonly id = 'agent-home';
  readonly name = 'Home & Estate Care Specialist';
  readonly role = 'Private estate maintenance, specialized electrical, HVAC, and emergency repairs';
  readonly category = 'home';
  readonly systemInstructions = `Dispatch vetted, verified estate technicians for high-end residences.`;
  readonly capabilities = ['Emergency estate dispatch', 'Maintenance coordination', 'Vetted technician network'];
  readonly limitations = ['Structural changes require certified engineering permits'];
  readonly allowedTools = ['dispatchHomeService'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'MODIFY'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Dispatch verified estate care technician for: ${observation.originalRequest}`,
      selectedTool: 'dispatchHomeService',
      toolInput: {
        serviceType: observation.originalRequest,
        address: 'Client Registered Residence',
      },
      riskLevel: 'MEDIUM',
      requiredPermission: 'RESERVE',
      needsApproval: false,
    };
  }
}

// 7. EVENTS SPECIALIST AGENT
export class EventsSpecialistAgent extends ProventaBaseAgent {
  readonly id = 'agent-business';
  readonly name = 'Events & Celebrations Specialist';
  readonly role = 'Curator for private celebrations, intimate soirees, and corporate roundtables';
  readonly category = 'business';
  readonly systemInstructions = `Design bespoke private gatherings and corporate events with zero margin for error.`;
  readonly capabilities = ['Venue buyout negotiation', 'Catering coordination', 'Private styling'];
  readonly limitations = ['Permits required for public venues'];
  readonly allowedTools = ['searchRestaurants', 'composeConciergeMessage'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Coordinate event logistics and venue reservations.`,
      selectedTool: 'searchRestaurants',
      toolInput: {
        query: observation.originalRequest,
        partySize: observation.entities.partySize || 10,
      },
      riskLevel: 'LOW',
      requiredPermission: 'SEARCH',
      needsApproval: false,
    };
  }
}

// 8. RESEARCH & ADVISORY SPECIALIST AGENT
export class ResearchSpecialistAgent extends ProventaBaseAgent {
  readonly id = 'agent-personal';
  readonly name = 'Research & Advisory Specialist';
  readonly role = 'In-depth due diligence, neighborhood guides, and private advisory briefs';
  readonly category = 'personal';
  readonly systemInstructions = `Produce rigorously verified advisory briefs and recommendations.`;
  readonly capabilities = ['Deep market research', 'School advisory', 'Neighborhood guides'];
  readonly limitations = ['Read and advisory only; does not execute bookings directly'];
  readonly allowedTools = ['composeConciergeMessage'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Compile verified concierge advisory brief.`,
      selectedTool: 'composeConciergeMessage',
      toolInput: {
        recipientType: 'CUSTOMER',
        subject: 'Concierge Advisory Brief',
        body: `Advisory analysis compiled for: ${observation.originalRequest}`,
      },
      riskLevel: 'LOW',
      requiredPermission: 'READ',
      needsApproval: false,
    };
  }
}

// 9. CALENDAR & APPOINTMENTS SPECIALIST AGENT
export class CalendarSpecialistAgent extends ProventaBaseAgent {
  readonly id = 'agent-appointments';
  readonly name = 'Calendar & Appointments Specialist';
  readonly role = 'VIP schedule coordination, wellness slots, and salon bookings';
  readonly category = 'appointments';
  readonly systemInstructions = `Coordinate appointments and maintain schedule synchronicity.`;
  readonly capabilities = ['Wellness bookings', 'Calendar scheduling', 'Collision prevention'];
  readonly limitations = ['Cannot overwrite existing client commitments without confirmation'];
  readonly allowedTools = ['scheduleAppointment'];
  readonly permissions: AgentPermission[] = ['READ', 'CALENDAR_WRITE', 'MODIFY'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Schedule confirmed appointment slot.`,
      selectedTool: 'scheduleAppointment',
      toolInput: {
        title: observation.originalRequest,
        preferredSlot: observation.entities.dateTime || 'Tomorrow 11:00 AM',
      },
      riskLevel: 'LOW',
      requiredPermission: 'CALENDAR_WRITE',
      needsApproval: false,
    };
  }
}

// 10. COMMUNICATION SPECIALIST AGENT
export class CommunicationSpecialistAgent extends ProventaBaseAgent {
  readonly id = 'agent-communication';
  readonly name = 'Concierge Communication Specialist';
  readonly role = 'Bespoke client correspondence, vendor negotiation letters, and protocol management';
  readonly category = 'communication';
  readonly systemInstructions = `Draft immaculate, polite, quiet-luxury correspondence.`;
  readonly capabilities = ['Concierge letter drafting', 'Vendor follow-ups', 'Status reports'];
  readonly limitations = ['Cannot make binding legal commitments'];
  readonly allowedTools = ['composeConciergeMessage'];
  readonly permissions: AgentPermission[] = ['READ', 'MESSAGE', 'EMAIL'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Draft concierge communication to relevant party.`,
      selectedTool: 'composeConciergeMessage',
      toolInput: {
        recipientType: 'CUSTOMER',
        subject: 'Update from Proventa Concierge',
        body: `Respectfully providing details regarding ${observation.originalRequest}`,
      },
      riskLevel: 'LOW',
      requiredPermission: 'MESSAGE',
      needsApproval: false,
    };
  }
}

// 11. GIFT SPECIALIST AGENT
export class GiftSpecialistAgent extends ProventaBaseAgent {
  readonly id = 'agent-gift';
  readonly name = 'Curated Gifting Specialist';
  readonly role = 'Bespoke gifting, personalized hampers, and occasion milestones';
  readonly category = 'gift';
  readonly systemInstructions = `Curate distinguished, unforgettable gifts tailored to recipient tastes.`;
  readonly capabilities = ['Custom hamper curation', 'Floral arrangements', 'Milestone reminders'];
  readonly limitations = ['Delivery lead times subject to artisan availability'];
  readonly allowedTools = ['searchProducts', 'purchaseProduct'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'PURCHASE'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Curate and acquire bespoke luxury gift.`,
      selectedTool: 'purchaseProduct',
      toolInput: {
        proposal: {
          providerName: 'The House of MG Curated Hamper',
          title: 'Heritage Brass & Sweet Hamper',
        },
        deliveryAddress: 'Recipient Address',
      },
      riskLevel: 'HIGH',
      requiredPermission: 'PURCHASE',
      needsApproval: true,
    };
  }
}

// 12. CONCIERGE ESCALATION SPECIALIST AGENT
export class ConciergeEscalationAgent extends ProventaBaseAgent {
  readonly id = 'agent-concierge';
  readonly name = 'Senior Concierge Escalation Desk';
  readonly role = 'Human concierge copilot handling complex, high-touch, or impossible client requests';
  readonly category = 'other';
  readonly systemInstructions = `Manage escalations, high-stakes negotiations, and bespoke VIP requests with human white-glove precision.`;
  readonly capabilities = ['All platform capabilities', 'Human escalation review', 'Direct phone liaison'];
  readonly limitations = ['Requires concierge human verification'];
  readonly allowedTools = ['composeConciergeMessage', 'searchRestaurants'];
  readonly permissions: AgentPermission[] = [
    'SEARCH',
    'READ',
    'RECOMMEND',
    'QUOTE',
    'RESERVE',
    'PURCHASE',
    'CANCEL',
    'MODIFY',
    'MESSAGE',
    'EMAIL',
    'CALENDAR_WRITE',
    'ADMIN',
  ];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Escalate request to Senior Human Concierge Desk for manual handling.`,
      selectedTool: 'composeConciergeMessage',
      toolInput: {
        recipientType: 'INTERNAL',
        subject: 'Concierge Escalation Triage',
        body: `Escalated for immediate human concierge attention: "${observation.originalRequest}"`,
      },
      riskLevel: 'CRITICAL',
      requiredPermission: 'ADMIN',
      needsApproval: true,
    };
  }
}

// Specialized Agents Registry
export const SPECIALIST_AGENTS: Record<string, ProventaBaseAgent> = {
  dining: new DiningSpecialistAgent(),
  travel: new TravelSpecialistAgent(),
  hotel: new TravelSpecialistAgent(),
  flights: new TravelSpecialistAgent(),
  mobility: new MobilitySpecialistAgent(),
  transit: new MobilitySpecialistAgent(),
  experiences: new EntertainmentSpecialistAgent(),
  shopping: new ShoppingSpecialistAgent(),
  gift: new GiftSpecialistAgent(),
  home: new HomeServicesSpecialistAgent(),
  business: new EventsSpecialistAgent(),
  personal: new ResearchSpecialistAgent(),
  appointments: new CalendarSpecialistAgent(),
  communication: new CommunicationSpecialistAgent(),
  other: new ConciergeEscalationAgent(),
};

export function getSpecialistAgent(category: string): ProventaBaseAgent {
  const catLower = (category || 'other').toLowerCase();
  return SPECIALIST_AGENTS[catLower] || SPECIALIST_AGENTS['other'];
}
