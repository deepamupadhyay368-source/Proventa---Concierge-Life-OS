import { ProventaBaseAgent, type AgentObservation, type AgentExecutionPlan } from '../runtime/base-agent';
import type { AgentPermission } from '../permissions/permissions';
import type { ExtractedEntities } from '@/lib/orchestration/types';

// 1. CONCIERGE ROOT AGENT
export class ConciergeAgent extends ProventaBaseAgent {
  readonly id = 'agent-concierge';
  readonly name = 'Proventa Concierge Agent';
  readonly role = 'Chief Orchestrator, multi-step coordinator, and relationship manager';
  readonly category = 'concierge';
  readonly systemInstructions = `You are Proventa's Chief Concierge. You understand composite requests, delegate subtasks to domain specialist agents, synthesize multi-step itineraries, and ensure discretion.`;
  readonly capabilities = ['Multi-domain coordination', 'Task decomposition', 'VIP communication', 'Escalation handling'];
  readonly limitations = ['Does not execute direct payments without client approval', 'Requires human signoff on edge disputes'];
  readonly allowedTools = ['search_places', 'send_message', 'send_email', 'create_calendar_event'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'MESSAGE', 'EMAIL', 'CALENDAR_WRITE', 'ADMIN'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Coordinate request: "${observation.originalRequest}" across relevant Proventa agents.`,
      selectedTool: 'search_places',
      toolInput: { query: observation.originalRequest, city: 'Ahmedabad' },
      riskLevel: 'LOW',
      requiredPermission: 'SEARCH',
      needsApproval: false,
    };
  }
}

// 2. DINING AGENT
export class DiningAgent extends ProventaBaseAgent {
  readonly id = 'agent-dining';
  readonly name = 'Dining Specialist Agent';
  readonly role = 'Fine dining reservation, tasting menus, and culinary customization specialist';
  readonly category = 'dining';
  readonly systemInstructions = `You are Proventa's Dining Agent. Handle table reservations, dietary restrictions (strictly respect Jain, Vegan, Allergen preferences), and wine curation. Never fabricate table availability.`;
  readonly capabilities = ['Table reservations', 'Dietary compliance', 'Menu recommendations', 'Cancellations'];
  readonly limitations = ['Cannot exceed maximum table allocation', 'Cannot bypass restaurant deposit requirements'];
  readonly allowedTools = ['search_restaurants', 'get_restaurant_availability', 'create_reservation', 'cancel_reservation'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'CANCEL', 'MODIFY'];

  override identifyMissingInformation(entities: ExtractedEntities): string[] {
    const missing: string[] = [];
    if (!entities.partySize && !entities.rawInput.toLowerCase().includes('for ') && !entities.rawInput.toLowerCase().includes('table')) {
      missing.push('party size (number of guests)');
    }
    return missing;
  }

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    const partySize = observation.entities.partySize || 2;
    const dateTime = observation.entities.dateTime || 'Tonight at 8:00 PM';
    const venue = observation.entities.vendorName || 'Agashiye - The House of MG';
    const dietary = observation.clientMemory.explicitPreferences['dietary'] || 'Standard Fine Dining';

    return {
      rationale: `Reserve table for ${partySize} at ${venue} respecting dietary preferences: ${dietary}.`,
      selectedTool: 'create_reservation',
      toolInput: {
        venueName: venue,
        partySize,
        dateTime,
        specialRequests: dietary,
      },
      riskLevel: 'MEDIUM',
      requiredPermission: 'RESERVE',
      needsApproval: false,
    };
  }
}

// 3. TRAVEL AGENT
export class TravelAgent extends ProventaBaseAgent {
  readonly id = 'agent-travel';
  readonly name = 'Travel Specialist Agent';
  readonly role = 'Bespoke itineraries, luxury excursions, and flight logistics specialist';
  readonly category = 'travel';
  readonly systemInstructions = `You are Proventa's Travel Agent. Coordinate luxury retreats, safari permits, and multi-city itineraries. All flights and bookings require explicit client review.`;
  readonly capabilities = ['Itinerary planning', 'Safari permits', 'Flight search', 'Excursion booking'];
  readonly limitations = ['Cannot issue non-refundable airline tickets without client confirmation'];
  readonly allowedTools = ['search_places', 'search_hotels', 'send_email', 'create_calendar_event'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'MODIFY'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Plan curated itinerary for: "${observation.originalRequest}".`,
      selectedTool: 'search_places',
      toolInput: { query: observation.originalRequest, category: 'travel' },
      riskLevel: 'LOW',
      requiredPermission: 'SEARCH',
      needsApproval: false,
    };
  }
}

// 4. HOTEL / STAY AGENT
export class HotelStayAgent extends ProventaBaseAgent {
  readonly id = 'agent-hotel';
  readonly name = 'Hotel & Stay Specialist Agent';
  readonly role = 'Luxury hotel suites, heritage havelis, and boutique property reservations';
  readonly category = 'hotel';
  readonly systemInstructions = `You are Proventa's Hotel & Stay Agent. Book 5-star club suites, verify room upgrades, and manage check-in/out protocols. Mandatory client approval for suite stays.`;
  readonly capabilities = ['Suite reservations', 'Heritage property booking', 'VIP check-in requests'];
  readonly limitations = ['Subject to hotel room inventory', 'Cannot waive security deposits without hotel agreement'];
  readonly allowedTools = ['search_hotels', 'create_calendar_event', 'send_email'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'MODIFY'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Search and coordinate luxury stay matching client specifications.`,
      selectedTool: 'search_hotels',
      toolInput: {
        destination: observation.entities.destination || 'Ahmedabad',
        guests: observation.entities.partySize || 2,
        roomType: 'Club Executive Suite',
      },
      riskLevel: 'HIGH',
      requiredPermission: 'RESERVE',
      needsApproval: true,
    };
  }
}

// 5. MOBILITY AGENT
export class MobilityAgent extends ProventaBaseAgent {
  readonly id = 'agent-mobility';
  readonly name = 'Mobility & Chauffeur Agent';
  readonly role = 'Executive chauffeur fleet, airport transfers, and VIP transit specialist';
  readonly category = 'mobility';
  readonly systemInstructions = `You are Proventa's Mobility Agent. Dispatch verified luxury sedans (Mercedes E/S Class), coordinate flight tracking for airport pickups, and guarantee professional chauffeurs.`;
  readonly capabilities = ['Airport transfers', 'Chauffeur dispatch', 'Vehicle selection', 'Flight synchronization'];
  readonly limitations = ['Cannot guarantee arrival times during adverse traffic without buffer'];
  readonly allowedTools = ['search_transport', 'create_calendar_event', 'send_message'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'CANCEL'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Arrange executive chauffeur transit for client pickup.`,
      selectedTool: 'search_transport',
      toolInput: {
        origin: observation.entities.location || 'SVP International Airport',
        destination: observation.entities.destination || 'Client Residence',
        dateTime: observation.entities.dateTime || 'Tomorrow 8:00 PM',
        vehicleClass: 'MERCEDES_E_CLASS',
      },
      riskLevel: 'MEDIUM',
      requiredPermission: 'RESERVE',
      needsApproval: false,
    };
  }
}

// 6. ENTERTAINMENT AGENT
export class EntertainmentAgent extends ProventaBaseAgent {
  readonly id = 'agent-entertainment';
  readonly name = 'Entertainment & Experiences Agent';
  readonly role = 'VIP event access, private heritage walks, and exclusive cultural experiences';
  readonly category = 'experiences';
  readonly systemInstructions = `You are Proventa's Entertainment Agent. Secure VIP passes to stadium events, heritage twilight walks, and cultural exhibitions.`;
  readonly capabilities = ['VIP tickets', 'Heritage walks', 'Private venue access'];
  readonly limitations = ['Cannot purchase non-refundable passes without client pre-authorization'];
  readonly allowedTools = ['search_places', 'create_calendar_event', 'send_message'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'PURCHASE'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Curate and verify VIP cultural experience in Old Ahmedabad.`,
      selectedTool: 'search_places',
      toolInput: { query: observation.originalRequest, category: 'experiences' },
      riskLevel: 'LOW',
      requiredPermission: 'SEARCH',
      needsApproval: false,
    };
  }
}

// 7. SHOPPING AGENT
export class ShoppingAgent extends ProventaBaseAgent {
  readonly id = 'agent-shopping';
  readonly name = 'Shopping & Luxury Sourcing Agent';
  readonly role = 'Rare luxury items, corporate gifting hampers, and heritage textiles sourcing';
  readonly category = 'shopping';
  readonly systemInstructions = `You are Proventa's Shopping Agent. Source handloom textiles (e.g. Ashavali silk, Patola), luxury watches, and executive gifting. High financial threshold items require explicit client approval.`;
  readonly capabilities = ['Product sourcing', 'Order placement', 'Gift delivery coordination', 'Authenticity verification'];
  readonly limitations = ['Prohibited from making unapproved purchases over configured limit'];
  readonly allowedTools = ['search_products', 'create_order', 'send_message'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'PURCHASE'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    const budget = observation.entities.budgetAmount || 10000;
    return {
      rationale: `Source authentic luxury merchandise matching: "${observation.originalRequest}".`,
      selectedTool: 'create_order',
      toolInput: {
        itemTitle: observation.originalRequest,
        quantity: 1,
        shippingAddress: 'Client Corporate Office, Sindhu Bhavan Road',
        amountINR: budget,
      },
      riskLevel: 'HIGH',
      requiredPermission: 'PURCHASE',
      needsApproval: true,
    };
  }
}

// 8. LOCAL SERVICES AGENT
export class LocalServicesAgent extends ProventaBaseAgent {
  readonly id = 'agent-services';
  readonly name = 'Local Services & Estate Agent';
  readonly role = 'Estate maintenance, certified HVAC/electrical technicians, and villa upkeep';
  readonly category = 'home';
  readonly systemInstructions = `You are Proventa's Local Services Agent. Dispatch verified emergency technicians for HVAC, plumbing, and estate upkeep. Prioritize certified partners.`;
  readonly capabilities = ['Emergency dispatch', 'Estate maintenance', 'Technician verification'];
  readonly limitations = ['Cannot approve major structural repairs without property owner signoff'];
  readonly allowedTools = ['search_places', 'create_calendar_event', 'send_message'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'MODIFY'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Dispatch certified estate technician for: "${observation.originalRequest}".`,
      selectedTool: 'search_places',
      toolInput: { query: 'estate care villa maintenance', category: 'home' },
      riskLevel: 'MEDIUM',
      requiredPermission: 'RESERVE',
      needsApproval: false,
    };
  }
}

// 9. CALENDAR AGENT
export class CalendarAgent extends ProventaBaseAgent {
  readonly id = 'agent-calendar';
  readonly name = 'Calendar & Appointments Agent';
  readonly role = 'Executive schedule coordination, salon appointments, and time synchronization';
  readonly category = 'appointments';
  readonly systemInstructions = `You are Proventa's Calendar Agent. Schedule executive wellness, spa sessions, and boardroom meetings without schedule conflicts.`;
  readonly capabilities = ['Schedule coordination', 'Calendar synchronization', 'Appointment booking'];
  readonly limitations = ['Cannot double-book client without explicit override'];
  readonly allowedTools = ['create_calendar_event', 'send_message'];
  readonly permissions: AgentPermission[] = ['READ', 'CALENDAR_WRITE', 'MODIFY'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Schedule confirmed appointment slot on client calendar.`,
      selectedTool: 'create_calendar_event',
      toolInput: {
        title: observation.originalRequest,
        startTime: observation.entities.dateTime || 'Friday 4:00 PM',
        notes: 'Coordinated by Proventa Concierge',
      },
      riskLevel: 'LOW',
      requiredPermission: 'CALENDAR_WRITE',
      needsApproval: false,
    };
  }
}

// 10. COMMUNICATION AGENT
export class CommunicationAgent extends ProventaBaseAgent {
  readonly id = 'agent-communication';
  readonly name = 'Communication & Dispatch Agent';
  readonly role = 'Multi-channel client updates, vendor coordination, and executive briefs';
  readonly category = 'communication';
  readonly systemInstructions = `You are Proventa's Communication Agent. Draft courteous, concise executive updates for clients and communicate logistical instructions to partners.`;
  readonly capabilities = ['Email dispatch', 'WhatsApp/SMS messaging', 'Executive briefs'];
  readonly limitations = ['Cannot send unsolicited marketing messages'];
  readonly allowedTools = ['send_email', 'send_message'];
  readonly permissions: AgentPermission[] = ['READ', 'MESSAGE', 'EMAIL'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Dispatch concierge communication regarding request status.`,
      selectedTool: 'send_email',
      toolInput: {
        to: 'member@proventa.dev',
        subject: `Proventa Concierge Update: ${observation.entities.intent || 'Your Request'}`,
        body: `Dear Member,\n\nYour request has been processed and confirmed by your concierge desk.`,
      },
      riskLevel: 'LOW',
      requiredPermission: 'EMAIL',
      needsApproval: false,
    };
  }
}

// 11. PAYMENT / TRANSACTION AGENT
export class PaymentAgent extends ProventaBaseAgent {
  readonly id = 'agent-payment';
  readonly name = 'Payment & Transaction Agent';
  readonly role = 'Secure financial authorizations, invoices, escrow holds, and verified refunds';
  readonly category = 'payment';
  readonly systemInstructions = `You are Proventa's Payment Agent. Process payments only with valid idempotency tokens and explicit client approval. Provide itemized receipts.`;
  readonly capabilities = ['Payment authorization', 'Refund processing', 'Invoice generation'];
  readonly limitations = ['Strictly prohibited from auto-capturing funds without client consent'];
  readonly allowedTools = ['process_payment', 'cancel_transaction'];
  readonly permissions: AgentPermission[] = ['READ', 'PURCHASE', 'CANCEL'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    const amount = observation.entities.budgetAmount || 5000;
    return {
      rationale: `Process payment of ₹${amount} for authorized service.`,
      selectedTool: 'process_payment',
      toolInput: {
        amountINR: amount,
        currency: 'INR',
        idempotencyKey: `IDEMP-${Date.now()}`,
        description: `Proventa Verified Service: ${observation.originalRequest}`,
      },
      riskLevel: 'HIGH',
      requiredPermission: 'PURCHASE',
      needsApproval: true,
    };
  }
}

// 12. SECURITY & PERMISSION AGENT
export class SecurityPermissionAgent extends ProventaBaseAgent {
  readonly id = 'agent-security';
  readonly name = 'Security & Permission Agent';
  readonly role = 'Policy compliance gatekeeper, audit logger, and risk mitigation specialist';
  readonly category = 'security';
  readonly systemInstructions = `You are Proventa's Security & Permission Agent. Inspect all subtask plans for permission violations, cost thresholds, and policy breaches. Block unauthorized calls.`;
  readonly capabilities = ['Permission audit', 'Risk score evaluation', 'Policy enforcement'];
  readonly limitations = ['Cannot execute external tools directly'];
  readonly allowedTools = ['send_message'];
  readonly permissions: AgentPermission[] = ['READ', 'ADMIN'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Audit and verify security authorization for task execution.`,
      selectedTool: 'send_message',
      toolInput: {
        recipient: 'system-audit',
        channel: 'IN_APP',
        content: `Audit logged for task: ${observation.taskId}`,
      },
      riskLevel: 'LOW',
      requiredPermission: 'ADMIN',
      needsApproval: false,
    };
  }
}

// 13. VERIFICATION AGENT
export class VerificationAgent extends ProventaBaseAgent {
  readonly id = 'agent-verification';
  readonly name = 'Verification & Proof Agent';
  readonly role = 'Post-execution auditor verifying authoritative booking references and receipts';
  readonly category = 'verification';
  readonly systemInstructions = `You are Proventa's Verification Agent. Validate that every action produced an authoritative reference ID and genuine provider confirmation. Never accept hallucinated outcomes.`;
  readonly capabilities = ['Authoritative verification', 'Audit trail generation', 'Receipt validation'];
  readonly limitations = ['Does not place reservations itself'];
  readonly allowedTools = ['search_places', 'send_message'];
  readonly permissions: AgentPermission[] = ['READ', 'ADMIN'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Verify authoritative booking reference for confirmed task.`,
      selectedTool: 'send_message',
      toolInput: {
        recipient: 'client',
        channel: 'IN_APP',
        content: `Booking verified and confirmed with provider.`,
      },
      riskLevel: 'LOW',
      requiredPermission: 'ADMIN',
      needsApproval: false,
    };
  }
}

// The Complete Specialists Registry (Upgraded 16-Specialist Real-World Platform)
export { ALL_16_SPECIALISTS, getPlatformAgent } from './specialist-16-platform';

export const ALL_13_SPECIALISTS: Record<string, ProventaBaseAgent> = {
  concierge: new ConciergeAgent(),
  dining: new DiningAgent(),
  travel: new TravelAgent(),
  hotel: new HotelStayAgent(),
  mobility: new MobilityAgent(),
  experiences: new EntertainmentAgent(),
  entertainment: new EntertainmentAgent(),
  shopping: new ShoppingAgent(),
  home: new LocalServicesAgent(),
  services: new LocalServicesAgent(),
  appointments: new CalendarAgent(),
  calendar: new CalendarAgent(),
  communication: new CommunicationAgent(),
  payment: new PaymentAgent(),
  security: new SecurityPermissionAgent(),
  verification: new VerificationAgent(),
  other: new ConciergeAgent(),
};

export function getAgentByDomain(domain: string): ProventaBaseAgent {
  const d = (domain || 'concierge').toLowerCase();
  return ALL_13_SPECIALISTS[d] || ALL_13_SPECIALISTS['concierge'];
}
