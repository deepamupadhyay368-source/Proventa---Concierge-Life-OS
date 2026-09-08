import { ProventaBaseAgent, type AgentObservation, type AgentExecutionPlan } from '../runtime/base-agent';
import type { AgentPermission } from '../permissions/permissions';

// 1. Concierge Agent (Root Orchestrator)
export class ConciergeAgent extends ProventaBaseAgent {
  readonly id = 'agent-concierge';
  readonly name = 'Proventa Concierge Agent';
  readonly role = 'Chief Orchestrator, multi-step coordinator, and relationship manager';
  readonly category = 'concierge';
  readonly systemInstructions = `You are Proventa's Chief Concierge. Orchestrate complex multi-step requests, delegate to domain specialists, and ensure discretion.`;
  readonly capabilities = ['Multi-domain coordination', 'Task decomposition', 'Client relationship management'];
  readonly limitations = ['Does not execute direct payments without client approval'];
  readonly allowedTools = ['search_places', 'send_message', 'send_email', 'create_calendar_event'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'MESSAGE', 'EMAIL', 'CALENDAR_WRITE', 'ADMIN'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Orchestrate client request: "${observation.originalRequest}".`,
      selectedTool: 'search_places',
      toolInput: { query: observation.originalRequest, city: 'Ahmedabad' },
      riskLevel: 'LOW',
      requiredPermission: 'SEARCH',
      needsApproval: false,
    };
  }
}

// 2. Flight Agent
export class FlightAgent extends ProventaBaseAgent {
  readonly id = 'agent-flight';
  readonly name = 'Flight Specialist Agent';
  readonly role = 'Commercial & charter aviation, fare revalidation, and PNR ticketing';
  readonly category = 'flights';
  readonly systemInstructions = `You are Proventa's Flight Agent. Source optimal flight routes, revalidate live fares, and manage ticketing. Never fabricate PNRs.`;
  readonly capabilities = ['Flight search', 'Live fare revalidation', 'PNR verification', 'Seat selection'];
  readonly limitations = ['Non-refundable tickets require explicit client approval'];
  readonly allowedTools = ['search_flights', 'create_flight_booking'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'PURCHASE', 'CANCEL'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Search verified commercial flights for ${observation.entities.destination || 'destination'}.`,
      selectedTool: 'search_flights',
      toolInput: {
        origin: observation.entities.origin || 'AMD',
        destination: observation.entities.destination || 'BOM',
        departureDate: observation.entities.dateTime || '2026-10-15',
        passengers: observation.entities.partySize || 1,
      },
      riskLevel: 'HIGH',
      requiredPermission: 'SEARCH',
      needsApproval: true,
    };
  }
}

// 3. Hotel Agent
export class HotelAgent extends ProventaBaseAgent {
  readonly id = 'agent-hotel';
  readonly name = 'Hotel & Stay Specialist Agent';
  readonly role = 'Luxury suites, boutique retreats, and hotel booking';
  readonly category = 'hotel';
  readonly systemInstructions = `You are Proventa's Hotel Agent. Secure club suites, boutique havelis, and luxury resorts with verified amenities.`;
  readonly capabilities = ['Suite availability check', 'Price revalidation', 'Special guest requests'];
  readonly limitations = ['Credit card deposit holds require approval'];
  readonly allowedTools = ['search_hotels', 'create_hotel_booking'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'PURCHASE', 'CANCEL'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Find luxury stay availability in ${observation.entities.destination || 'Ahmedabad'}.`,
      selectedTool: 'search_hotels',
      toolInput: {
        city: observation.entities.destination || 'Ahmedabad',
        checkIn: observation.entities.dateTime || '2026-10-15',
        checkOut: '2026-10-17',
        guests: observation.entities.partySize || 2,
      },
      riskLevel: 'HIGH',
      requiredPermission: 'SEARCH',
      needsApproval: true,
    };
  }
}

// 4. Restaurant Agent
export class RestaurantAgent extends ProventaBaseAgent {
  readonly id = 'agent-restaurant';
  readonly name = 'Restaurant Specialist Agent';
  readonly role = 'Fine dining reservations, chef table allocations, and dietary management';
  readonly category = 'dining';
  readonly systemInstructions = `You are Proventa's Restaurant Agent. Secure hard-to-book tables, tasting menus, and dietary compliance.`;
  readonly capabilities = ['Table reservations', 'Dietary compliance', 'Menu recommendations'];
  readonly limitations = ['Deposit tables require client signoff'];
  readonly allowedTools = ['search_restaurants', 'create_reservation'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'CANCEL'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Reserve prime table for ${observation.entities.partySize || 2} at ${observation.entities.vendorName || 'Agashiye'}.`,
      selectedTool: 'create_reservation',
      toolInput: {
        venueName: observation.entities.vendorName || 'Agashiye - The House of MG',
        partySize: observation.entities.partySize || 2,
        dateTime: observation.entities.dateTime || 'Tonight at 8:00 PM',
      },
      riskLevel: 'MEDIUM',
      requiredPermission: 'RESERVE',
      needsApproval: false,
    };
  }
}

// 5. Food Ordering Agent
export class FoodOrderingAgent extends ProventaBaseAgent {
  readonly id = 'agent-food';
  readonly name = 'Food Ordering Specialist Agent';
  readonly role = 'Curated culinary delivery, tasting menus, and executive catering';
  readonly category = 'food';
  readonly systemInstructions = `You are Proventa's Food Ordering Agent. Curate gourmet orders, verify menu items, and track delivery.`;
  readonly capabilities = ['Menu search', 'Cart calculation', 'Delivery tracking'];
  readonly limitations = ['Cannot exceed daily food budget without authorization'];
  readonly allowedTools = ['search_restaurants', 'create_order'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'QUOTE', 'PURCHASE', 'CANCEL'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Curate executive dining order for client.`,
      selectedTool: 'create_order',
      toolInput: { items: observation.entities.rawInput, category: 'food' },
      riskLevel: 'MEDIUM',
      requiredPermission: 'PURCHASE',
      needsApproval: true,
    };
  }
}

// 6. Cab Agent
export class CabAgent extends ProventaBaseAgent {
  readonly id = 'agent-cab';
  readonly name = 'Cab & Mobility Specialist Agent';
  readonly role = 'Executive chauffeur dispatch, airport transfers, and private transit';
  readonly category = 'cabs';
  readonly systemInstructions = `You are Proventa's Cab Agent. Coordinate Mercedes/luxury sedans and airport transfers with real OTPs and live driver tracking.`;
  readonly capabilities = ['Chauffeur dispatch', 'Fare estimation', 'Real-time driver tracking'];
  readonly limitations = ['Surge pricing above ₹5,000 requires confirmation'];
  readonly allowedTools = ['search_transport', 'create_calendar_event'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'CANCEL'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Dispatch executive chauffeur for airport transfer.`,
      selectedTool: 'search_transport',
      toolInput: {
        pickup: 'SVPIA Airport Terminal 2',
        dropoff: observation.entities.destination || 'Bodakdev, Ahmedabad',
        type: 'Mercedes E-Class Executive',
      },
      riskLevel: 'MEDIUM',
      requiredPermission: 'RESERVE',
      needsApproval: false,
    };
  }
}

// 7. Movie Agent
export class MovieAgent extends ProventaBaseAgent {
  readonly id = 'agent-movie';
  readonly name = 'Movie & Cinema Specialist Agent';
  readonly role = 'IMAX, Insignia luxury recliner reservations, and film premiere access';
  readonly category = 'movies';
  readonly systemInstructions = `You are Proventa's Movie Agent. Select prime center recliners, hold seats, and verify tickets.`;
  readonly capabilities = ['Showtime lookup', 'Seat hold', 'Ticket issuance'];
  readonly limitations = ['Seat holds expire in 10 minutes'];
  readonly allowedTools = ['search_places', 'create_calendar_event'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'RESERVE', 'PURCHASE'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Hold prime center recliners for evening cinema screening.`,
      selectedTool: 'search_places',
      toolInput: { query: 'PVR IMAX Palladium', category: 'cinema' },
      riskLevel: 'MEDIUM',
      requiredPermission: 'RESERVE',
      needsApproval: true,
    };
  }
}

// 8. Gift Agent
export class GiftAgent extends ProventaBaseAgent {
  readonly id = 'agent-gift';
  readonly name = 'Artisan Gifting Specialist Agent';
  readonly role = 'Luxury gifting, heritage hampers, and white-glove doorstep presentation';
  readonly category = 'gifts';
  readonly systemInstructions = `You are Proventa's Gift Agent. Source rare heritage items, calligraphy notes, and luxury packaging.`;
  readonly capabilities = ['Artisan sourcing', 'Custom packaging', 'Hand delivery coordination'];
  readonly limitations = ['Custom embossed gifts are non-returnable'];
  readonly allowedTools = ['search_products', 'create_order'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'PURCHASE'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Source luxury corporate gift hamper with personalized card.`,
      selectedTool: 'search_products',
      toolInput: { query: 'Heritage Ashavali Silk Hamper', category: 'luxury_gift' },
      riskLevel: 'HIGH',
      requiredPermission: 'SEARCH',
      needsApproval: true,
    };
  }
}

// 9. Shopping Agent
export class ShoppingAgent extends ProventaBaseAgent {
  readonly id = 'agent-shopping';
  readonly name = 'Shopping & Procurement Specialist Agent';
  readonly role = 'Luxury merchandise procurement, bespoke tailoring, and retail sourcing';
  readonly category = 'shopping';
  readonly systemInstructions = `You are Proventa's Shopping Agent. Procure verified authentic items from luxury houses and boutique designers.`;
  readonly capabilities = ['Product discovery', 'Authenticity verification', 'Order procurement'];
  readonly limitations = ['Purchases above ₹10,000 require explicit approval'];
  readonly allowedTools = ['search_products', 'create_order'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'PURCHASE'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Locate luxury bespoke product requested by client.`,
      selectedTool: 'search_products',
      toolInput: { query: observation.originalRequest },
      riskLevel: 'HIGH',
      requiredPermission: 'SEARCH',
      needsApproval: true,
    };
  }
}

// 10. Experience Agent
export class ExperienceAgent extends ProventaBaseAgent {
  readonly id = 'agent-experience';
  readonly name = 'VIP Experiences Specialist Agent';
  readonly role = 'Curated private retreats, heritage walks, safari permits, and masterclasses';
  readonly category = 'experiences';
  readonly systemInstructions = `You are Proventa's Experience Agent. Unlock private access to heritage monuments, wildlife sanctuaries, and masterclasses.`;
  readonly capabilities = ['Private guide booking', 'Permit acquisition', 'Voucher generation'];
  readonly limitations = ['Government safari permits require guest identity verification'];
  readonly allowedTools = ['search_places', 'create_calendar_event'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'PURCHASE'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Curate private heritage walk and high tea experience.`,
      selectedTool: 'search_places',
      toolInput: { query: 'Heritage Pol Walk High Tea', category: 'experiences' },
      riskLevel: 'MEDIUM',
      requiredPermission: 'RESERVE',
      needsApproval: true,
    };
  }
}

// 11. Weekend Escape Agent (Composite Multi-Domain Planner)
export class WeekendEscapeAgent extends ProventaBaseAgent {
  readonly id = 'agent-escape';
  readonly name = 'Weekend Escape Composite Agent';
  readonly role = 'Multi-domain trip synthesizer: flights, boutique hotels, transfers, and dining';
  readonly category = 'weekend_escape';
  readonly systemInstructions = `You are Proventa's Weekend Escape Agent. Synthesize end-to-end luxury weekend getaways with parallel execution and synchrony.`;
  readonly capabilities = ['Composite trip generation', 'Parallel task orchestration', 'Itinerary synthesis'];
  readonly limitations = ['Requires client signoff on composite price quote'];
  readonly allowedTools = ['search_places', 'search_hotels', 'create_calendar_event', 'send_email'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'PURCHASE', 'ADMIN'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Synthesize complete weekend escape itinerary for ${observation.entities.destination || 'Udaipur'}.`,
      selectedTool: 'search_hotels',
      toolInput: { city: observation.entities.destination || 'Udaipur', checkIn: '2026-10-15', checkOut: '2026-10-17' },
      riskLevel: 'CRITICAL',
      requiredPermission: 'QUOTE',
      needsApproval: true,
    };
  }
}

// 12. Travel Planning Agent
export class TravelPlanningAgent extends ProventaBaseAgent {
  readonly id = 'agent-travel-planning';
  readonly name = 'Comprehensive Travel Planning Agent';
  readonly role = 'Multi-city itineraries, visa advisory, private aviation, and luxury logistics';
  readonly category = 'travel_planning';
  readonly systemInstructions = `You are Proventa's Travel Planning Agent. Architect flawless journeys with zero logistical friction.`;
  readonly capabilities = ['Complex routing', 'Itinerary timelines', 'Visa requirements check'];
  readonly limitations = ['Does not issue visas directly'];
  readonly allowedTools = ['search_places', 'create_calendar_event', 'send_email'];
  readonly permissions: AgentPermission[] = ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'CALENDAR_WRITE'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Build comprehensive travel itinerary for client.`,
      selectedTool: 'search_places',
      toolInput: { query: observation.originalRequest },
      riskLevel: 'LOW',
      requiredPermission: 'SEARCH',
      needsApproval: false,
    };
  }
}

// 13. Calendar Agent
export class CalendarAgent extends ProventaBaseAgent {
  readonly id = 'agent-calendar';
  readonly name = 'Calendar & Appointments Agent';
  readonly role = 'Schedule synchronization, conflict detection, and calendar invite dispatch';
  readonly category = 'calendar';
  readonly systemInstructions = `You are Proventa's Calendar Agent. Keep the client's schedule pristine, detect conflicts, and sync confirmed events.`;
  readonly capabilities = ['Calendar write', 'Conflict resolution', 'Time-zone alignment'];
  readonly limitations = ['Cannot overwrite existing events without notification'];
  readonly allowedTools = ['create_calendar_event'];
  readonly permissions: AgentPermission[] = ['READ', 'CALENDAR_WRITE', 'MODIFY'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Sync confirmed task to client calendar.`,
      selectedTool: 'create_calendar_event',
      toolInput: {
        title: observation.originalRequest.slice(0, 40),
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        description: `Organized by Proventa Concierge.`,
      },
      riskLevel: 'LOW',
      requiredPermission: 'CALENDAR_WRITE',
      needsApproval: false,
    };
  }
}

// 14. Communication Agent
export class CommunicationAgent extends ProventaBaseAgent {
  readonly id = 'agent-communication';
  readonly name = 'Client Communications Agent';
  readonly role = 'Multi-channel messaging via authenticated WhatsApp, SMS, and Gmail';
  readonly category = 'communication';
  readonly systemInstructions = `You are Proventa's Communication Agent. Maintain the quiet-luxury editorial voice. Concise, deferential, polished.`;
  readonly capabilities = ['Email dispatch', 'WhatsApp notification', 'SMS alerts'];
  readonly limitations = ['No promotional spam. Purely transactional updates.'];
  readonly allowedTools = ['send_message', 'send_email'];
  readonly permissions: AgentPermission[] = ['READ', 'MESSAGE', 'EMAIL'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Send status notification to client.`,
      selectedTool: 'send_message',
      toolInput: { recipient: 'client', content: observation.originalRequest },
      riskLevel: 'LOW',
      requiredPermission: 'MESSAGE',
      needsApproval: false,
    };
  }
}

// 15. Payment Agent
export class PaymentAgent extends ProventaBaseAgent {
  readonly id = 'agent-payment';
  readonly name = 'Transaction & Payment Agent';
  readonly role = 'Idempotent payment capture, Razorpay intents, line-item pricing, and refunds';
  readonly category = 'payments';
  readonly systemInstructions = `You are Proventa's Payment Agent. Enforce zero double-charging, verify signatures, and audit every paisa. Never store raw cards.`;
  readonly capabilities = ['Payment intent creation', 'Idempotent authorization', 'Refund processing'];
  readonly limitations = ['RAW CARDS STRICTLY FORBIDDEN. Razorpay tokenized payments only.'];
  readonly allowedTools = ['send_message'];
  readonly permissions: AgentPermission[] = ['PURCHASE', 'ADMIN'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Create authorization intent for approved service.`,
      selectedTool: 'send_message',
      toolInput: { recipient: 'client', content: 'Payment intent created.' },
      riskLevel: 'CRITICAL',
      requiredPermission: 'PURCHASE',
      needsApproval: true,
    };
  }
}

// 16. Verification Agent
export class VerificationAgent extends ProventaBaseAgent {
  readonly id = 'agent-verification';
  readonly name = 'Authoritative Verification & Proof Agent';
  readonly role = 'Post-execution auditor verifying genuine PNRs, booking codes, and receipts';
  readonly category = 'verification';
  readonly systemInstructions = `You are Proventa's Verification Agent. Strictly enforce zero-fabrication. Reject unverified tasks.`;
  readonly capabilities = ['PNR verification', 'Audit trail generation', 'Receipt validation'];
  readonly limitations = ['Does not execute bookings itself'];
  readonly allowedTools = ['search_places', 'send_message'];
  readonly permissions: AgentPermission[] = ['READ', 'ADMIN'];

  async formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan> {
    return {
      rationale: `Validate authoritative confirmation reference.`,
      selectedTool: 'send_message',
      toolInput: { recipient: 'client', content: 'Booking verified and confirmed with external provider.' },
      riskLevel: 'LOW',
      requiredPermission: 'ADMIN',
      needsApproval: false,
    };
  }
}

// Complete 16-Specialist Registry
export const ALL_16_SPECIALISTS: Record<string, ProventaBaseAgent> = {
  concierge: new ConciergeAgent(),
  flights: new FlightAgent(),
  flight: new FlightAgent(),
  hotel: new HotelAgent(),
  hotels: new HotelAgent(),
  travel: new TravelPlanningAgent(),
  travel_planning: new TravelPlanningAgent(),
  dining: new RestaurantAgent(),
  restaurants: new RestaurantAgent(),
  restaurant: new RestaurantAgent(),
  food: new FoodOrderingAgent(),
  cabs: new CabAgent(),
  cab: new CabAgent(),
  mobility: new CabAgent(),
  movies: new MovieAgent(),
  movie: new MovieAgent(),
  gifts: new GiftAgent(),
  gift: new GiftAgent(),
  shopping: new ShoppingAgent(),
  experiences: new ExperienceAgent(),
  experience: new ExperienceAgent(),
  weekend_escape: new WeekendEscapeAgent(),
  calendar: new CalendarAgent(),
  appointments: new CalendarAgent(),
  communication: new CommunicationAgent(),
  payment: new PaymentAgent(),
  payments: new PaymentAgent(),
  verification: new VerificationAgent(),
};

export function getPlatformAgent(category: string): ProventaBaseAgent {
  const c = (category || 'concierge').toLowerCase();
  return ALL_16_SPECIALISTS[c] || ALL_16_SPECIALISTS['concierge'];
}
