import type { IntegrationStatus, ProviderResult, ProviderServiceCategory } from './types';
import { ProventaProviderGateway } from './gateway';
import type { FlightProvider, FlightOption, FlightSearchQuery, FlightBookingRequest, FlightBooking } from './flights/interface';
import type { HotelProvider, HotelOption, HotelSearchQuery, HotelBookingRequest, HotelBooking } from './hotels/interface';
import type { RestaurantProvider, RestaurantSearchQuery, RestaurantDetails, DiningTimeSlot, ReservationRequest, RestaurantReservation } from './restaurants/interface';
import type { CabProvider, LocationCoord, RideOption, RideBooking } from './cabs/interface';

// 1. FLIGHTS: Amadeus Sandbox
export class SandboxFlightProvider implements FlightProvider {
  readonly providerKey = 'amadeus_flights';
  readonly name = 'Amadeus Global Flight Gateway';
  readonly category = 'FLIGHTS' as const;
  readonly isSandbox = true;

  async getStatus(): Promise<IntegrationStatus> {
    if (process.env.AMADEUS_API_KEY || process.env.NODE_ENV === 'test' || process.env.VITEST) {
      return 'SANDBOX';
    }
    return 'NOT_CONNECTED';
  }

  async checkHealth() {
    return { healthy: true, latencyMs: 120, message: 'Amadeus flight sandbox online' };
  }

  async searchFlights(params: FlightSearchQuery): Promise<ProviderResult<FlightOption[]>> {
    const isConnected = (await this.getStatus()) !== 'NOT_CONNECTED';
    if (!isConnected) {
      return {
        success: false,
        providerKey: this.providerKey,
        providerName: this.name,
        isSandbox: true,
        status: 'FAILED',
        error: {
          code: 'PROVIDER_NOT_CONNECTED',
          message: 'Amadeus flight credentials not configured. Real GDS connectivity requires API keys.',
          retryable: false,
        },
        timestamp: new Date(),
      };
    }

    const options: FlightOption[] = [
      {
        flightId: 'AI-011',
        airline: 'Air India',
        flightNumber: 'AI-011',
        origin: params.origin.toUpperCase(),
        destination: params.destination.toUpperCase(),
        departureTime: `${params.departureDate}T06:30:00Z`,
        arrivalTime: `${params.departureDate}T08:15:00Z`,
        durationMinutes: 105,
        stops: 0,
        cabinClass: params.cabinClass || 'BUSINESS',
        seatsAvailable: 6,
        baseFarePaise: 1850000,
        taxesPaise: 320000,
        totalFarePaise: 2170000,
        currency: 'INR',
        fareKey: `FARE-AI-${Date.now()}`,
      },
    ];

    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS',
      data: options,
      timestamp: new Date(),
    };
  }

  async getFlightDetails(flightId: string): Promise<ProviderResult<FlightOption>> {
    const res = await this.searchFlights({ origin: 'AMD', destination: 'BOM', departureDate: '2026-10-15', passengers: 1 });
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS',
      data: res.data![0],
      timestamp: new Date(),
    };
  }

  async revalidateFare(flightId: string, fareKey: string) {
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      data: { valid: true, fareKey: `REVALIDATED-${fareKey}`, newFarePaise: 2170000 },
      timestamp: new Date(),
    };
  }

  async createBooking(params: FlightBookingRequest): Promise<ProviderResult<FlightBooking>> {
    const pnr = `PNR${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS',
      referenceId: pnr,
      data: {
        bookingId: `BK-FLT-${Date.now()}`,
        pnr,
        status: 'CONFIRMED',
        flightDetails: {
          flightId: params.flightId,
          airline: 'Air India',
          flightNumber: 'AI-011',
          origin: 'AMD',
          destination: 'BOM',
          departureTime: '2026-10-15T06:30:00Z',
          arrivalTime: '2026-10-15T08:15:00Z',
          durationMinutes: 105,
          stops: 0,
          cabinClass: 'BUSINESS',
          seatsAvailable: 4,
          baseFarePaise: 1850000,
          taxesPaise: 320000,
          totalFarePaise: 2170000,
          currency: 'INR',
          fareKey: params.fareKey,
        },
        passengers: params.passengers.map((p) => ({ firstName: p.firstName, lastName: p.lastName })),
        ticketNumbers: ['098-2947192841'],
        totalFarePaise: 2170000,
        currency: 'INR',
        cancellationPolicy: 'Refundable with cancellation fee up to 24h prior.',
      },
      timestamp: new Date(),
    };
  }

  async getBooking(bookingId: string) {
    return this.createBooking({
      flightId: 'AI-011',
      fareKey: 'SAMPLE-FARE',
      passengers: [{ title: 'MR', firstName: 'Client', lastName: 'Executive' }],
      contactEmail: 'client@proventa.in',
      contactPhone: '+919876543210',
    });
  }

  async cancelBooking(bookingId: string) {
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      data: { cancelled: true, refundAmountPaise: 1870000, penaltyPaise: 300000 },
      timestamp: new Date(),
    };
  }

  async getCancellationPolicy(bookingId: string) {
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      data: { refundable: true, deadline: '2026-10-14T06:30:00Z', penaltyPaise: 300000 },
      timestamp: new Date(),
    };
  }
}

// 2. HOTELS: Luxury Hotel Provider
export class SandboxHotelProvider implements HotelProvider {
  readonly providerKey = 'amadeus_hotels';
  readonly name = 'Luxury Hotel Distribution Network';
  readonly category = 'HOTELS' as const;
  readonly isSandbox = true;

  async getStatus(): Promise<IntegrationStatus> {
    return 'SANDBOX';
  }

  async checkHealth() {
    return { healthy: true, latencyMs: 95, message: 'Hotel provider sandbox online' };
  }

  async searchHotels(params: HotelSearchQuery): Promise<ProviderResult<HotelOption[]>> {
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS',
      data: [
        {
          hotelId: 'htl-itc-narmada',
          name: 'ITC Narmada - A Luxury Collection Hotel',
          address: 'Judges Bungalow Road, Bodakdev, Ahmedabad',
          starRating: 5,
          reviewScore: 4.8,
          rooms: [
            {
              roomId: 'room-exec-suite',
              roomName: 'Executive Club Luxury Suite with Butler Service',
              bedType: '1 King Bed',
              maxGuests: 2,
              rateKey: 'RATE-ITC-EXEC-01',
              pricePerNightPaise: 2400000,
              taxesPaise: 432000,
              totalPricePaise: 2832000,
              currency: 'INR',
              freeCancellationUntil: `${params.checkIn}T12:00:00Z`,
              amenities: ['Butler Service', 'Lounge Access', 'Breakfast Included'],
            },
          ],
        },
      ],
      timestamp: new Date(),
    };
  }

  async getHotelDetails(hotelId: string) {
    const res = await this.searchHotels({ city: 'Ahmedabad', checkIn: '2026-10-15', checkOut: '2026-10-16', guests: 2 });
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      data: res.data![0],
      timestamp: new Date(),
    };
  }

  async checkAvailability(hotelId: string, dates: { checkIn: string; checkOut: string }) {
    const details = await this.getHotelDetails(hotelId);
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      data: { available: true, rooms: details.data!.rooms },
      timestamp: new Date(),
    };
  }

  async revalidatePrice(hotelId: string, roomId: string, dates: { checkIn: string; checkOut: string }) {
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      data: { valid: true, rateKey: 'RATE-REVALIDATED-01', currentPricePaise: 2832000 },
      timestamp: new Date(),
    };
  }

  async createBooking(params: HotelBookingRequest): Promise<ProviderResult<HotelBooking>> {
    const code = `HTL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS',
      referenceId: code,
      data: {
        bookingId: `BK-HTL-${Date.now()}`,
        confirmationCode: code,
        status: 'CONFIRMED',
        hotelName: 'ITC Narmada - A Luxury Collection Hotel',
        roomName: 'Executive Club Luxury Suite',
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        totalPricePaise: 2832000,
        currency: 'INR',
        cancellationPolicy: 'Complimentary cancellation up to 24 hours prior.',
      },
      timestamp: new Date(),
    };
  }

  async getBooking(bookingId: string) {
    return this.createBooking({
      hotelId: 'htl-itc-narmada',
      roomId: 'room-exec-suite',
      rateKey: 'RATE-01',
      checkIn: '2026-10-15',
      checkOut: '2026-10-17',
      guestName: 'Client Executive',
      guestEmail: 'client@proventa.in',
      guestPhone: '+919876543210',
    });
  }

  async cancelBooking(bookingId: string) {
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      data: { cancelled: true, refundAmountPaise: 2832000, penaltyPaise: 0 },
      timestamp: new Date(),
    };
  }
}

// 3. RESTAURANTS: Table Reservation Network
export class SandboxRestaurantProvider implements RestaurantProvider {
  readonly providerKey = 'opentable_dining';
  readonly name = 'Proventa Fine Dining Direct Table Network';
  readonly category = 'RESTAURANTS' as const;
  readonly isSandbox = true;

  async getStatus(): Promise<IntegrationStatus> {
    return 'SANDBOX';
  }

  async checkHealth() {
    return { healthy: true, latencyMs: 65, message: 'Restaurant booking gateway active' };
  }

  async searchRestaurants(params: RestaurantSearchQuery): Promise<ProviderResult<RestaurantDetails[]>> {
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS',
      data: [
        {
          restaurantId: 'rest-agashiye',
          name: 'Agashiye - The House of MG',
          cuisine: ['Heritage Gujarati Fine Dining', 'Vegetarian'],
          address: 'Opp. Sidi Saiyyed Mosque, Old City, Ahmedabad',
          phone: '+91 79 2550 6941',
          priceCategory: '₹₹₹',
          rating: 4.8,
          cancellationPolicy: 'Cancellation without fee up to 4 hours prior.',
        },
      ],
      timestamp: new Date(),
    };
  }

  async getRestaurantDetails(restaurantId: string) {
    const res = await this.searchRestaurants({ city: 'Ahmedabad', partySize: 2, date: '2026-10-15' });
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      data: res.data![0],
      timestamp: new Date(),
    };
  }

  async getAvailability(restaurantId: string, partySize: number, date: string, time?: string): Promise<ProviderResult<DiningTimeSlot[]>> {
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS',
      data: [
        { time: '20:00', slotKey: 'SLOT-2000-ROOF', tableType: 'ROOFTOP', available: true, depositRequiredPaise: 0 },
      ],
      timestamp: new Date(),
    };
  }

  async createReservation(params: ReservationRequest): Promise<ProviderResult<RestaurantReservation>> {
    const code = `DINE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS',
      referenceId: code,
      data: {
        reservationId: `RES-DINE-${Date.now()}`,
        confirmationCode: code,
        restaurantName: 'Agashiye - The House of MG',
        status: 'CONFIRMED',
        date: params.date,
        time: params.time,
        partySize: params.partySize,
        tableAllocated: 'Heritage Terrace - Table 4',
        depositPaidPaise: 0,
        cancellationPolicy: 'Complimentary cancellation up to 4 hours prior.',
      },
      timestamp: new Date(),
    };
  }

  async getReservation(reservationId: string) {
    return this.createReservation({
      restaurantId: 'rest-agashiye',
      slotKey: 'SLOT-2000',
      date: '2026-10-15',
      time: '20:00',
      partySize: 4,
      guestName: 'Client Executive',
      guestEmail: 'client@proventa.in',
      guestPhone: '+919876543210',
    });
  }

  async cancelReservation(reservationId: string) {
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      data: { cancelled: true, refundAmountPaise: 0 },
      timestamp: new Date(),
    };
  }
}

// 4. CABS: Mobility & Chauffeur Network
export class SandboxCabProvider implements CabProvider {
  readonly providerKey = 'uber_cabs';
  readonly name = 'Executive Mobility & Chauffeur Gateway';
  readonly category = 'CABS' as const;
  readonly isSandbox = true;

  async getStatus(): Promise<IntegrationStatus> {
    return 'SANDBOX';
  }

  async checkHealth() {
    return { healthy: true, latencyMs: 50, message: 'Mobility fleet provider active' };
  }

  async getRideOptions(pickup: LocationCoord, dropoff: LocationCoord): Promise<ProviderResult<RideOption[]>> {
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS',
      data: [
        {
          rideTypeId: 'ride-exec-sedan',
          categoryName: 'Executive Mercedes E-Class',
          estimatedFarePaise: 350000,
          currency: 'INR',
          etaMinutes: 12,
          capacity: 3,
          carModelExample: 'Mercedes-Benz E220d',
        },
      ],
      timestamp: new Date(),
    };
  }

  async getFareEstimate(pickup: LocationCoord, dropoff: LocationCoord, rideTypeId: string) {
    const opts = await this.getRideOptions(pickup, dropoff);
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      data: opts.data![0],
      timestamp: new Date(),
    };
  }

  async createRide(params: any): Promise<ProviderResult<RideBooking>> {
    const rideRef = `RIDE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS',
      referenceId: rideRef,
      data: {
        rideId: `BK-RIDE-${Date.now()}`,
        externalReference: rideRef,
        status: 'DRIVER_ASSIGNED',
        pickup: params.pickup,
        dropoff: params.dropoff,
        rideType: 'Executive Mercedes E-Class',
        driverName: 'Vikram Rajput',
        driverPhone: '+91 98250 12345',
        vehicleNumber: 'GJ 01 XX 7788',
        vehicleModel: 'Mercedes-Benz E-Class',
        otp: '4921',
        farePaise: 350000,
        currency: 'INR',
      },
      timestamp: new Date(),
    };
  }

  async getRide(rideId: string) {
    return this.createRide({
      pickup: { address: 'SVPIA Terminal 2' },
      dropoff: { address: 'ITC Narmada' },
      rideTypeId: 'ride-exec-sedan',
      passengerName: 'Client Executive',
      passengerPhone: '+919876543210',
    });
  }

  async cancelRide(rideId: string) {
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      data: { cancelled: true, cancellationFeePaise: 0 },
      timestamp: new Date(),
    };
  }

  async trackRide(rideId: string) {
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      data: { status: 'ARRIVING', etaMinutes: 4 },
      timestamp: new Date(),
    };
  }
}

// 5. MOVIES: Cinema Box Office Provider
export class SandboxMovieProvider {
  readonly providerKey = 'bookmyshow_movies';
  readonly name = 'Cinema Box Office Gateway';
  readonly category = 'MOVIES' as const;
  readonly isSandbox = true;

  async getStatus(): Promise<IntegrationStatus> {
    return 'SANDBOX';
  }

  async checkHealth() {
    return { healthy: true, latencyMs: 70, message: 'Cinema box office active' };
  }

  async searchMovies(query: string, city: string) {
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      data: [
        { movieId: 'mov-dune2', title: 'Dune: Part Two (IMAX)', rating: 9.1, durationMins: 166 },
      ],
      timestamp: new Date(),
    };
  }

  async getShowtimes(theatreId: string, movieId: string, date: string) {
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      data: [
        { showtimeId: 'show-imax-2100', movieId, theatreId, theatreName: 'PVR IMAX Palladium', screenName: 'IMAX Laser', format: 'IMAX', dateTime: `${date}T21:00:00Z`, priceStartingPaise: 90000 },
      ],
      timestamp: new Date(),
    };
  }

  async holdSeats(showtimeId: string, seats: string[]) {
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      data: { holdId: `HOLD-${Date.now()}`, expiresAt: new Date(Date.now() + 600000).toISOString(), totalAmountPaise: 180000 },
      timestamp: new Date(),
    };
  }

  async confirmBooking(holdId: string, paymentDetails: any) {
    const tRef = `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      referenceId: tRef,
      data: {
        ticketId: `BK-TKT-${Date.now()}`,
        bookingRef: tRef,
        movieTitle: 'Dune: Part Two (IMAX)',
        theatreName: 'PVR IMAX Palladium Ahmedabad',
        screenName: 'IMAX Screen 1',
        showtime: 'Tonight 9:00 PM',
        seats: ['F11', 'F12'],
        totalFarePaise: 180000,
        status: 'CONFIRMED',
      },
      timestamp: new Date(),
    };
  }
}

// 6. GIFTS & LUXURY SOURCING
export class SandboxGiftProvider {
  readonly providerKey = 'ferns_gifts';
  readonly name = 'Luxury Sourcing & Artisan Gifting Network';
  readonly category = 'GIFTS' as const;
  readonly isSandbox = true;

  async getStatus(): Promise<IntegrationStatus> {
    return 'SANDBOX';
  }

  async checkHealth() {
    return { healthy: true, latencyMs: 60, message: 'Gifting courier gateway active' };
  }

  async searchProducts(query: string) {
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      data: [
        {
          productId: 'prod-ashavali-silk',
          title: 'Handcrafted Heritage Ashavali Silk Stole',
          brand: 'Asopalav Heritage Guild',
          category: 'Handloom Luxury',
          pricePaise: 1250000,
          currency: 'INR',
          description: 'Intricately woven pure silk stole with antique gold zari border.',
          inStock: true,
        },
      ],
      timestamp: new Date(),
    };
  }

  async createOrder(params: any) {
    const trk = `GFT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      referenceId: trk,
      data: {
        orderId: `BK-GFT-${Date.now()}`,
        trackingNumber: trk,
        status: 'PROCESSING',
        productTitle: 'Handcrafted Heritage Ashavali Silk Stole',
        recipientName: params.recipientName,
        deliveryAddress: params.deliveryAddress,
        totalPricePaise: 1250000,
        estimatedDeliveryDate: 'Tomorrow by 5:00 PM',
      },
      timestamp: new Date(),
    };
  }
}

// 7. EXPERIENCES & RETREATS
export class SandboxExperienceProvider {
  readonly providerKey = 'viator_experiences';
  readonly name = 'Curated VIP Experiences & Haveli Retreats';
  readonly category = 'EXPERIENCES' as const;
  readonly isSandbox = true;

  async getStatus(): Promise<IntegrationStatus> {
    return 'SANDBOX';
  }

  async checkHealth() {
    return { healthy: true, latencyMs: 55, message: 'Experience curator active' };
  }

  async searchExperiences(query: any) {
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      data: [
        {
          experienceId: 'exp-heritage-walk',
          title: 'Private Twilight Heritage Walk & Pol Haveli Tea',
          category: 'HERITAGE_WALK',
          city: 'Ahmedabad',
          location: 'Old City Pols & Mangaldas Haveli',
          durationHours: 2.5,
          pricePerPersonPaise: 450000,
          currency: 'INR',
          inclusions: ['Private Historian Guide', 'High Tea at Mangaldas Haveli'],
        },
      ],
      timestamp: new Date(),
    };
  }

  async createBooking(params: any) {
    const vch = `VCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      providerKey: this.providerKey,
      providerName: this.name,
      isSandbox: true,
      status: 'SUCCESS' as const,
      referenceId: vch,
      data: {
        bookingId: `BK-EXP-${Date.now()}`,
        voucherCode: vch,
        status: 'CONFIRMED',
        experienceTitle: 'Private Twilight Heritage Walk & Pol Haveli Tea',
        date: params.date,
        time: params.time,
        partySize: params.partySize,
        meetingPoint: 'Mangaldas Ni Haveli II, Old City',
        totalPricePaise: 450000 * (params.partySize || 2),
      },
      timestamp: new Date(),
    };
  }
}

// Global Gateway Registration
let providersInitialized = false;

export function initializeStandardProviders() {
  if (providersInitialized) return;
  providersInitialized = true;

  ProventaProviderGateway.registerProvider({
    providerKey: 'amadeus_flights',
    name: 'Amadeus Global Flight Gateway',
    priority: 1,
    status: 'SANDBOX',
    isSandbox: true,
    instance: new SandboxFlightProvider(),
  });

  ProventaProviderGateway.registerProvider({
    providerKey: 'amadeus_hotels',
    name: 'Luxury Hotel Distribution Network',
    priority: 1,
    status: 'SANDBOX',
    isSandbox: true,
    instance: new SandboxHotelProvider(),
  });

  ProventaProviderGateway.registerProvider({
    providerKey: 'opentable_dining',
    name: 'Proventa Fine Dining Direct Table Network',
    priority: 1,
    status: 'SANDBOX',
    isSandbox: true,
    instance: new SandboxRestaurantProvider(),
  });

  ProventaProviderGateway.registerProvider({
    providerKey: 'uber_cabs',
    name: 'Executive Mobility & Chauffeur Gateway',
    priority: 1,
    status: 'SANDBOX',
    isSandbox: true,
    instance: new SandboxCabProvider(),
  });

  ProventaProviderGateway.registerProvider({
    providerKey: 'bookmyshow_movies',
    name: 'Cinema Box Office Gateway',
    priority: 1,
    status: 'SANDBOX',
    isSandbox: true,
    instance: new SandboxMovieProvider() as any,
  });

  ProventaProviderGateway.registerProvider({
    providerKey: 'ferns_gifts',
    name: 'Luxury Sourcing & Artisan Gifting Network',
    priority: 1,
    status: 'SANDBOX',
    isSandbox: true,
    instance: new SandboxGiftProvider() as any,
  });

  ProventaProviderGateway.registerProvider({
    providerKey: 'viator_experiences',
    name: 'Curated VIP Experiences & Haveli Retreats',
    priority: 1,
    status: 'SANDBOX',
    isSandbox: true,
    instance: new SandboxExperienceProvider() as any,
  });
}
