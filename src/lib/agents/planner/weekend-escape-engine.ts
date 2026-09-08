import { DAGTaskPlanner, type TaskGraph, type TaskNode } from './task-graph';
import type { ExtractedEntities } from '@/lib/orchestration/types';

export interface WeekendEscapeParams {
  destination: string;
  origin?: string;
  startDate: string;
  endDate: string;
  travelers: number;
  hotelPreference?: string;
  diningPreference?: string;
  budgetPaise?: number;
}

export class WeekendEscapeEngine {
  /**
   * Generates a fully orchestrated, dependency-aware multi-step TaskGraph
   * for a composite weekend escape itinerary.
   *
   * Topological Structure:
   * Stage 1 (Parallel): Flight Selection + Hotel Search + Activity Research
   * Stage 2 (Sequential): Airport Chauffeur (Depends on Flight arrival time)
   * Stage 3 (Sequential): Dinner Reservation (Depends on Hotel check-in time)
   * Stage 4 (Parallel): Curated Experience Booking (Scheduled during daytime gap)
   * Stage 5 (Conditional): Calendar Synchronization (Depends on all confirmed bookings)
   */
  static buildEscapeGraph(taskId: string, params: WeekendEscapeParams): TaskGraph {
    const nodes = new Map<string, TaskNode>();
    const origin = params.origin || 'AMD';
    const destination = params.destination;

    // Node 1: Flight Booking (Stage 1)
    const flightNodeId = 'node-escape-flights';
    nodes.set(flightNodeId, {
      id: flightNodeId,
      category: 'flights',
      assignedAgent: 'Flight Specialist Agent',
      objective: `Book round-trip flights from ${origin} to ${destination} for ${params.travelers} travelers`,
      dependencies: [],
      executionType: 'PARALLEL',
      requiredTools: ['search_flights', 'create_flight_booking'],
      requiredPermissions: ['SEARCH', 'RESERVE', 'PURCHASE'],
      riskLevel: 'HIGH',
      status: 'PENDING',
      entities: {
        intent: 'Book weekend flights',
        category: 'flights',
        origin,
        destination,
        dateTime: params.startDate,
        partySize: params.travelers,
        rawInput: `Flights from ${origin} to ${destination} on ${params.startDate}`,
        urgency: 'NORMAL',
        requiresClarification: false,
      },
    });

    // Node 2: Hotel Suite Booking (Stage 1 - Parallel with Flights)
    const hotelNodeId = 'node-escape-hotel';
    nodes.set(hotelNodeId, {
      id: hotelNodeId,
      category: 'hotel',
      assignedAgent: 'Hotel & Stay Specialist Agent',
      objective: `Secure luxury club suite at premium boutique resort in ${destination} (${params.startDate} to ${params.endDate})`,
      dependencies: [],
      executionType: 'PARALLEL',
      requiredTools: ['search_hotels', 'create_hotel_booking'],
      requiredPermissions: ['SEARCH', 'RESERVE', 'PURCHASE'],
      riskLevel: 'HIGH',
      status: 'PENDING',
      entities: {
        intent: 'Reserve luxury stay',
        category: 'hotel',
        destination,
        dateTime: params.startDate,
        partySize: params.travelers,
        rawInput: `Luxury suite in ${destination} for ${params.startDate} to ${params.endDate}`,
        urgency: 'NORMAL',
        requiresClarification: false,
      },
    });

    // Node 3: Airport Chauffeur Transfer (Stage 2 - Depends on Flight Arrival)
    const transferNodeId = 'node-escape-transfer';
    nodes.set(transferNodeId, {
      id: transferNodeId,
      category: 'cabs',
      assignedAgent: 'Cab & Mobility Specialist Agent',
      objective: `Coordinate airport chauffeur transfer from ${destination} airport to hotel`,
      dependencies: [flightNodeId],
      executionType: 'SEQUENTIAL',
      requiredTools: ['get_ride_options', 'create_ride'],
      requiredPermissions: ['SEARCH', 'RESERVE'],
      riskLevel: 'MEDIUM',
      status: 'PENDING',
      entities: {
        intent: 'Airport pickup transfer',
        category: 'cabs',
        rawInput: `Airport transfer in ${destination}`,
        partySize: params.travelers,
        urgency: 'NORMAL',
        requiresClarification: false,
      },
    });

    // Node 4: Fine Dining Evening Reservation (Stage 3 - Depends on Hotel Check-in)
    const diningNodeId = 'node-escape-dining';
    nodes.set(diningNodeId, {
      id: diningNodeId,
      category: 'dining',
      assignedAgent: 'Restaurant Specialist Agent',
      objective: `Reserve prime table for ${params.travelers} at top culinary venue in ${destination}`,
      dependencies: [hotelNodeId],
      executionType: 'SEQUENTIAL',
      requiredTools: ['search_restaurants', 'create_reservation'],
      requiredPermissions: ['SEARCH', 'RESERVE'],
      riskLevel: 'MEDIUM',
      status: 'PENDING',
      entities: {
        intent: 'Reserve dinner table',
        category: 'dining',
        destination,
        partySize: params.travelers,
        rawInput: `Dinner for ${params.travelers} in ${destination} on ${params.startDate}`,
        urgency: 'NORMAL',
        requiresClarification: false,
      },
    });

    // Node 5: VIP Experience / Retreat Activity (Stage 4 - Scheduled daytime)
    const expNodeId = 'node-escape-experience';
    nodes.set(expNodeId, {
      id: expNodeId,
      category: 'experiences',
      assignedAgent: 'Experience Specialist Agent',
      objective: `Private bespoke heritage tour / safari / culinary masterclass in ${destination}`,
      dependencies: [hotelNodeId],
      executionType: 'PARALLEL',
      requiredTools: ['search_experiences', 'create_experience_booking'],
      requiredPermissions: ['SEARCH', 'RESERVE', 'PURCHASE'],
      riskLevel: 'MEDIUM',
      status: 'PENDING',
      entities: {
        intent: 'Curate VIP experience',
        category: 'experiences',
        destination,
        partySize: params.travelers,
        rawInput: `Private experience in ${destination}`,
        urgency: 'NORMAL',
        requiresClarification: false,
      },
    });

    // Node 6: Calendar Synchronization (Stage 5 - Conditional on all confirmed bookings)
    const calNodeId = 'node-escape-calendar';
    nodes.set(calNodeId, {
      id: calNodeId,
      category: 'appointments',
      assignedAgent: 'Calendar Agent',
      objective: `Compile and synchronize comprehensive executive itinerary into client calendar`,
      dependencies: [flightNodeId, hotelNodeId, transferNodeId, diningNodeId, expNodeId],
      executionType: 'CONDITIONAL',
      condition: (results) => Object.values(results).some((r: any) => r && r.status === 'CONFIRMED'),
      requiredTools: ['create_calendar_event'],
      requiredPermissions: ['CALENDAR_WRITE'],
      riskLevel: 'LOW',
      status: 'PENDING',
      entities: {
        intent: 'Sync itinerary to calendar',
        category: 'appointments',
        rawInput: `Sync weekend escape to calendar`,
        urgency: 'NORMAL',
        requiresClarification: false,
      },
    });

    // Compute topological batches
    const executionOrder: string[][] = [
      [flightNodeId, hotelNodeId], // Stage 1: Flight & Hotel in parallel
      [transferNodeId, expNodeId], // Stage 2: Transfer and Daytime Experience
      [diningNodeId],              // Stage 3: Dinner reservation
      [calNodeId],                 // Stage 4: Calendar compilation
    ];

    return {
      taskId,
      rootObjective: `Weekend Escape: ${destination} (${params.startDate} - ${params.endDate}) for ${params.travelers} guests`,
      nodes,
      executionOrder,
    };
  }
}
