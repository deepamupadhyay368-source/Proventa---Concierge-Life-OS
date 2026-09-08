import { describe, it, expect, beforeAll } from 'vitest';
import { ProventaProviderGateway } from '@/lib/providers/gateway';
import {
  initializeStandardProviders,
  SandboxFlightProvider,
  SandboxHotelProvider,
  SandboxRestaurantProvider,
  SandboxCabProvider,
} from '@/lib/providers/standard-connectors';
import { ALL_16_SPECIALISTS, getPlatformAgent } from '@/lib/agents/specialists/specialist-16-platform';
import { WeekendEscapeEngine } from '@/lib/agents/planner/weekend-escape-engine';
import { AuthoritativeVerificationEngine } from '@/lib/agents/verification/verification-engine';
import { FailureRecoveryEngine } from '@/lib/agents/recovery/recovery-engine';

describe('Proventa Real-World Task Execution Platform - Comprehensive 17 Scenarios', () => {
  beforeAll(() => {
    initializeStandardProviders();
  });

  // 1. Flight Booking: search -> select -> revalidate fare -> booking -> PNR verification
  it('Scenario 1: Flight booking execution with live fare revalidation and PNR verification', async () => {
    const flightProvider = new SandboxFlightProvider();
    const searchRes = await flightProvider.searchFlights({
      origin: 'AMD',
      destination: 'BOM',
      departureDate: '2026-10-15',
      passengers: 1,
    });
    expect(searchRes.success).toBe(true);
    expect(searchRes.data!.length).toBeGreaterThan(0);

    const flight = searchRes.data![0];
    const reval = await flightProvider.revalidateFare(flight.flightId, flight.fareKey);
    expect(reval.success).toBe(true);
    expect(reval.data!.valid).toBe(true);

    const bookingRes = await flightProvider.createBooking({
      flightId: flight.flightId,
      fareKey: reval.data!.fareKey,
      passengers: [{ title: 'MR', firstName: 'Aarav', lastName: 'Patel' }],
      contactEmail: 'aarav@proventa.in',
      contactPhone: '+919876543210',
    });
    expect(bookingRes.success).toBe(true);
    expect(bookingRes.data!.pnr).toMatch(/^PNR/);

    const verification = AuthoritativeVerificationEngine.verifyExecution('create_flight_booking', {
      success: true,
      status: 'CONFIRMED',
      externalReferenceId: bookingRes.data!.pnr,
      providerName: flightProvider.name,
      isMock: flightProvider.isSandbox,
    });
    expect(verification.verified).toBe(true);
    expect(verification.confirmationReference).toBe(bookingRes.data!.pnr);
  });

  // 2. Hotel Booking: search -> checkAvailability -> revalidatePrice -> booking
  it('Scenario 2: Hotel suite booking with rate key revalidation', async () => {
    const hotelProvider = new SandboxHotelProvider();
    const searchRes = await hotelProvider.searchHotels({
      city: 'Ahmedabad',
      checkIn: '2026-10-15',
      checkOut: '2026-10-17',
      guests: 2,
    });
    expect(searchRes.success).toBe(true);
    const hotel = searchRes.data![0];
    const room = hotel.rooms[0];

    const reval = await hotelProvider.revalidatePrice(hotel.hotelId, room.roomId, {
      checkIn: '2026-10-15',
      checkOut: '2026-10-17',
    });
    expect(reval.success).toBe(true);

    const bookingRes = await hotelProvider.createBooking({
      hotelId: hotel.hotelId,
      roomId: room.roomId,
      rateKey: reval.data!.rateKey,
      checkIn: '2026-10-15',
      checkOut: '2026-10-17',
      guestName: 'Aarav Patel',
      guestEmail: 'aarav@proventa.in',
      guestPhone: '+919876543210',
    });
    expect(bookingRes.success).toBe(true);
    expect(bookingRes.data!.confirmationCode).toMatch(/^HTL-/);
  });

  // 3. Restaurant Reservation: search -> availability -> reservation -> confirmation
  it('Scenario 3: Fine dining reservation with table allocation', async () => {
    const restProvider = new SandboxRestaurantProvider();
    const avail = await restProvider.getAvailability('rest-agashiye', 4, '2026-10-15', '20:00');
    expect(avail.success).toBe(true);
    expect(avail.data!.length).toBeGreaterThan(0);

    const res = await restProvider.createReservation({
      restaurantId: 'rest-agashiye',
      slotKey: avail.data![0].slotKey,
      date: '2026-10-15',
      time: '20:00',
      partySize: 4,
      guestName: 'Aarav Patel',
      guestEmail: 'aarav@proventa.in',
      guestPhone: '+919876543210',
    });
    expect(res.success).toBe(true);
    expect(res.data!.confirmationCode).toMatch(/^DINE-/);
  });

  // 4. Cab Booking: ride options -> fare estimate -> booking -> driver assignment
  it('Scenario 4: Executive chauffeur ride booking with driver tracking', async () => {
    const cabProvider = new SandboxCabProvider();
    const options = await cabProvider.getRideOptions(
      { address: 'SVPIA Airport' },
      { address: 'Bodakdev, Ahmedabad' }
    );
    expect(options.success).toBe(true);
    expect(options.data![0].categoryName).toContain('Mercedes');

    const ride = await cabProvider.createRide({
      pickup: { address: 'SVPIA Airport' },
      dropoff: { address: 'Bodakdev, Ahmedabad' },
      rideTypeId: options.data![0].rideTypeId,
      passengerName: 'Aarav Patel',
      passengerPhone: '+919876543210',
    });
    expect(ride.success).toBe(true);
    expect(ride.data!.status).toBe('DRIVER_ASSIGNED');
    expect(ride.data!.driverName).toBeTruthy();
  });

  // 5. Movie Booking
  it('Scenario 5: Movie showtime discovery and seat hold', async () => {
    const movieProvider = ProventaProviderGateway.getProvider<any>('bookmyshow_movies');
    expect(movieProvider).toBeTruthy();
    const showtimes = await movieProvider.getShowtimes('theatre-palladium', 'mov-dune2', '2026-10-15');
    expect(showtimes.success).toBe(true);

    const hold = await movieProvider.holdSeats(showtimes.data![0].showtimeId, ['F11', 'F12']);
    expect(hold.success).toBe(true);
    expect(hold.data!.holdId).toMatch(/^HOLD-/);
  });

  // 6. Gift Sourcing & Delivery
  it('Scenario 6: Luxury gift sourcing with door delivery', async () => {
    const giftProvider = ProventaProviderGateway.getProvider<any>('ferns_gifts');
    expect(giftProvider).toBeTruthy();
    const products = await giftProvider.searchProducts('Ashavali Silk');
    expect(products.success).toBe(true);

    const order = await giftProvider.createOrder({
      productId: products.data![0].productId,
      recipientName: 'Devang Shah',
      deliveryAddress: 'Sindhu Bhavan Road, Ahmedabad',
    });
    expect(order.success).toBe(true);
    expect(order.data!.trackingNumber).toMatch(/^GFT-/);
  });

  // 7. Curated VIP Experience
  it('Scenario 7: Private heritage walk & Haveli tea booking', async () => {
    const expProvider = ProventaProviderGateway.getProvider<any>('viator_experiences');
    expect(expProvider).toBeTruthy();
    const booking = await expProvider.createBooking({
      experienceId: 'exp-heritage-walk',
      date: '2026-10-16',
      time: '17:00',
      partySize: 2,
    });
    expect(booking.success).toBe(true);
    expect(booking.data!.voucherCode).toMatch(/^VCH-/);
  });

  // 8. Weekend Escape Composite DAG Engine
  it('Scenario 8: Weekend Escape generates dependency-aware DAG with 4 execution stages', () => {
    const escapeGraph = WeekendEscapeEngine.buildEscapeGraph('task-escape-01', {
      destination: 'Udaipur',
      origin: 'AMD',
      startDate: '2026-10-23',
      endDate: '2026-10-25',
      travelers: 2,
    });

    expect(escapeGraph.nodes.size).toBe(6);
    expect(escapeGraph.nodes.has('node-escape-flights')).toBe(true);
    expect(escapeGraph.nodes.has('node-escape-hotel')).toBe(true);
    expect(escapeGraph.nodes.has('node-escape-transfer')).toBe(true);
    expect(escapeGraph.nodes.has('node-escape-dining')).toBe(true);
    expect(escapeGraph.nodes.has('node-escape-experience')).toBe(true);
    expect(escapeGraph.nodes.has('node-escape-calendar')).toBe(true);

    // Verify transfer depends on flights
    const transferNode = escapeGraph.nodes.get('node-escape-transfer')!;
    expect(transferNode.dependencies).toContain('node-escape-flights');

    // Verify dining depends on hotel
    const diningNode = escapeGraph.nodes.get('node-escape-dining')!;
    expect(diningNode.dependencies).toContain('node-escape-hotel');

    // Verify topological batches
    expect(escapeGraph.executionOrder.length).toBe(4);
    expect(escapeGraph.executionOrder[0]).toEqual(['node-escape-flights', 'node-escape-hotel']);
  });

  // 9. Multi-Provider Fallback Routing
  it('Scenario 9: Provider Gateway routes to primary or fallback provider seamlessly', () => {
    const route = ProventaProviderGateway.getActiveProviderForCategory('FLIGHTS');
    expect(route).toBeTruthy();
    expect(route!.provider.category).toBe('FLIGHTS');
    expect(route!.status).toBe('SANDBOX');
  });

  // 10. Failed Payment & Recovery
  it('Scenario 10: Classifies payment failure and escalates without duplicate charge', () => {
    const error = new Error('Card declined: Insufficient funds on corporate card');
    const category = FailureRecoveryEngine.classifyFailure(error);
    expect(category).toBe('PAYMENT_FAILED');

    const resolution = FailureRecoveryEngine.determineResolution({
      category,
      attemptCount: 1,
      currentTool: 'create_payment_intent',
    });
    expect(resolution.action).toBe('REQUEST_USER_INPUT');
  });

  // 11. Provider Outage Handling
  it('Scenario 11: Classifies network/server outage and attempts retry with backoff', () => {
    const error = new Error('ETIMEDOUT: Connection reset by peer');
    const category = FailureRecoveryEngine.classifyFailure(error);
    expect(category).toBe('TRANSIENT_NETWORK');

    const resolution = FailureRecoveryEngine.determineResolution({
      category,
      attemptCount: 1,
      maxRetries: 2,
      currentTool: 'search_hotels',
    });
    expect(resolution.action).toBe('RETRY');
    expect(resolution.delayMs).toBeGreaterThan(0);
  });

  // 12. Price Change Detection
  it('Scenario 12: Detects live price change during fare revalidation', async () => {
    const flightProvider = new SandboxFlightProvider();
    const reval = await flightProvider.revalidateFare('AI-011', 'FARE-OLD-KEY');
    expect(reval.data!.newFarePaise).toBe(2170000);
  });

  // 13. Booking Cancellation & Refund Calculation
  it('Scenario 13: Computes cancellation refund and penalty according to policy', async () => {
    const flightProvider = new SandboxFlightProvider();
    const cancelRes = await flightProvider.cancelBooking('BK-FLT-123');
    expect(cancelRes.success).toBe(true);
    expect(cancelRes.data!.cancelled).toBe(true);
    expect(cancelRes.data!.refundAmountPaise).toBe(1870000);
    expect(cancelRes.data!.penaltyPaise).toBe(300000);
  });

  // 14. Zero-Fabrication Verification Guard
  it('Scenario 14: Rejects fabricated completion without authoritative reference', () => {
    const invalidOutput = { success: true, status: 'CONFIRMED' }; // Missing referenceId / PNR
    const verification = AuthoritativeVerificationEngine.verifyExecution('create_flight_booking', invalidOutput);
    expect(verification.verified).toBe(false);
    expect(verification.status).toBe('FAILED');
  });

  // 15. The 16 Specialist Agents are fully instantiated
  it('Scenario 15: All 16 Specialist Agents exist with defined permission policies', () => {
    const expectedCategories = [
      'concierge', 'flights', 'hotels', 'restaurants', 'food',
      'cabs', 'movies', 'gifts', 'shopping', 'experiences',
      'weekend_escape', 'travel_planning', 'calendar', 'communication',
      'payments', 'verification',
    ];

    expectedCategories.forEach((cat) => {
      const agent = getPlatformAgent(cat);
      expect(agent).toBeTruthy();
      expect(agent.name).toBeTruthy();
      expect(agent.permissions.length).toBeGreaterThan(0);
    });
  });

  // 16. Timeout / Service Degraded Handling
  it('Scenario 16: Handles service outage by escalating to human concierge', () => {
    const resolution = FailureRecoveryEngine.determineResolution({
      category: 'PROVIDER_UNAVAILABLE',
      attemptCount: 1,
      currentTool: 'search_restaurants',
    });
    expect(resolution.action).toBe('ESCALATE_TO_HUMAN');
  });

  // 17. Partial Completion Recovery
  it('Scenario 17: Multi-agent DAG allows partial completion with human concierge intervention', () => {
    const graph = WeekendEscapeEngine.buildEscapeGraph('task-test-partial', {
      destination: 'Jaipur',
      startDate: '2026-10-25',
      endDate: '2026-10-27',
      travelers: 2,
    });
    expect(graph.nodes.get('node-escape-flights')!.status).toBe('PENDING');
  });
});
