import type { ProviderAdapterInterface, OptionProposal, ExecutionOutput, VerificationResult } from '../types';

export function isMockModeEnabled(): boolean {
  // Defaults to true in non-production, false in production unless explicitly set
  if (process.env.MOCK_MODE !== undefined) {
    return process.env.MOCK_MODE === 'true';
  }
  return process.env.NODE_ENV !== 'production';
}

export class MockDiningAdapter implements ProviderAdapterInterface {
  readonly providerId = 'mock_dining';
  name = 'OpenTable / Resy Mock Dining Provider';
  supportedCategories = ['dining'];
  readonly environment = 'SANDBOX' as const;

  async search(query: {
    category: string;
    intent?: string;
    rawInput: string;
    constraints?: Record<string, any>;
  }): Promise<OptionProposal[]> {
    return [
      {
        id: `mock-dine-1-${Date.now()}`,
        providerId: this.providerId,
        providerName: 'Agashiye - The House of MG',
        title: 'Heritage Rooftop Dining - Table for 2',
        description: 'Authentic Gujarati Thali dining on the heritage rooftop terrace. Prime 8:00 PM seating.',
        priceAmount: 3900,
        priceCurrency: 'INR',
        priceFormatted: '₹3,900',
        availability: 'Instant Confirmation Available (Sandbox)',
        bookingMethod: 'API',
        cancellationPolicy: 'Complimentary cancellation up to 4 hours prior.',
        environment: 'SANDBOX',
        isMock: true,
      },
      {
        id: `mock-dine-2-${Date.now()}`,
        providerId: this.providerId,
        providerName: 'The Royal Vega - ITC Narmada',
        title: 'Luxury Vegetarian Fine Dining [Sandbox]',
        description: 'Regal dining experience celebrating ancestral Indian cuisine.',
        priceAmount: 5500,
        priceCurrency: 'INR',
        priceFormatted: '₹5,500',
        availability: 'Immediate Reservation Available (Sandbox)',
        bookingMethod: 'API',
        cancellationPolicy: 'Cancellation up to 2 hours prior.',
        environment: 'SANDBOX',
        isMock: true,
      },
    ];
  }

  async execute(proposal: OptionProposal, details: Record<string, any>): Promise<ExecutionOutput> {
    if (!isMockModeEnabled()) {
      return {
        success: false,
        providerId: this.providerId,
        providerName: proposal.providerName,
        status: 'FAILED',
        environment: 'SANDBOX',
        errorMessage: 'Mock automated execution is disabled in live production mode. Escalating to Proventa Concierge Desk.',
        confirmedDetails: {},
      };
    }

    const ref = `[SANDBOX]-DIN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    return {
      success: true,
      providerId: this.providerId,
      externalReferenceId: ref,
      providerName: proposal.providerName,
      status: 'CONFIRMED',
      environment: 'SANDBOX',
      isMock: true,
      rawResponse: {
        provider: 'OpenTable Partner Sandbox',
        status: 'CONFIRMED',
        code: 200,
        pnr: ref,
        timestamp: new Date().toISOString(),
      },
      confirmedDetails: {
        table: 'Priority Seating',
        reference: ref,
        partySize: details.guests || 2,
        notes: details.specialRequests || 'Quiet corner, Proventa VIP guest',
      },
    };
  }

  async verify(referenceId: string): Promise<VerificationResult> {
    return {
      verified: true,
      status: 'CONFIRMED',
      confirmationReference: referenceId,
      environment: 'SANDBOX',
      isMock: true,
      verifiedAt: new Date(),
      auditTrail: `Verified with OpenTable partner API mock endpoint. Reference: ${referenceId}`,
    };
  }
}

export class MockHotelAdapter implements ProviderAdapterInterface {
  readonly providerId = 'mock_hotel';
  name = 'Amadeus / Sabre Global GDS Mock Adapter';
  supportedCategories = ['travel', 'hotel', 'flights'];
  readonly environment = 'SANDBOX' as const;

  async search(query: {
    category?: string;
    intent?: string;
    rawInput?: string;
    constraints?: Record<string, any>;
    location?: string;
    destination?: string;
  }): Promise<OptionProposal[]> {
    const anyQuery = query as any;
    const raw = (anyQuery.rawInput || '').toLowerCase();
    let targetCity = anyQuery.constraints?.destination || anyQuery.constraints?.location || anyQuery.destination || anyQuery.location;
    if (!targetCity) {
      if (raw.includes('delhi')) targetCity = 'Delhi';
      else if (raw.includes('mumbai') || raw.includes('bombay')) targetCity = 'Mumbai';
      else if (raw.includes('bengaluru') || raw.includes('bangalore')) targetCity = 'Bengaluru';
      else if (raw.includes('goa')) targetCity = 'Goa';
      else if (raw.includes('udaipur')) targetCity = 'Udaipur';
      else if (raw.includes('jaipur')) targetCity = 'Jaipur';
      else if (raw.includes('hyderabad')) targetCity = 'Hyderabad';
      else if (raw.includes('kolkata')) targetCity = 'Kolkata';
      else targetCity = 'Ahmedabad';
    }

    const cityUpper = (targetCity || 'AHMEDABAD').toUpperCase();

    if (cityUpper.includes('DELHI')) {
      return [
        {
          id: `htl-delhi-imperial-${Date.now()}`,
          providerId: this.providerId,
          providerName: 'The Imperial, New Delhi',
          title: 'Heritage Deco Suite — The Imperial, New Delhi',
          description: 'Historic luxury 5-star property on Janpath, Connaught Place. Italian marble bath, butler service, breakfast included.',
          priceAmount: 26000,
          priceCurrency: 'INR',
          priceFormatted: '₹26,000 / night',
          availability: 'Guaranteed Room Availability via GDS Partner Desk',
          bookingMethod: 'API',
          cancellationPolicy: 'Complimentary cancellation up to 24 hours prior to check-in.',
          environment: 'SANDBOX',
          isMock: true,
          location: 'Delhi',
          metadata: {
            city: 'Delhi',
            arrivalCity: 'Delhi',
            address: 'Janpath, Connaught Place, New Delhi 110001',
            checkIn: '14:00',
            checkOut: '12:00',
          },
        } as any,
        {
          id: `htl-delhi-leela-${Date.now()}`,
          providerId: this.providerId,
          providerName: 'The Leela Palace New Delhi',
          title: 'Grand Deluxe Room — The Leela Palace, Chanakyapuri, New Delhi',
          description: 'Palatial luxury in Diplomatic Enclave with rooftop infinity pool, 24-hr personal butler, airport transfer privileges.',
          priceAmount: 32000,
          priceCurrency: 'INR',
          priceFormatted: '₹32,000 / night',
          availability: '3 Rooms Remaining',
          bookingMethod: 'API',
          cancellationPolicy: 'Refundable up to 48 hours prior.',
          environment: 'SANDBOX',
          isMock: true,
          location: 'Delhi',
          metadata: {
            city: 'Delhi',
            arrivalCity: 'Delhi',
            address: 'Diplomatic Enclave, Chanakyapuri, New Delhi 110023',
            checkIn: '14:00',
            checkOut: '12:00',
          },
        } as any,
      ];
    }

    if (cityUpper.includes('MUMBAI')) {
      return [
        {
          id: `htl-mumbai-tajpalace-${Date.now()}`,
          providerId: this.providerId,
          providerName: 'The Taj Mahal Palace, Mumbai',
          title: 'Sea View Luxury Room — The Taj Mahal Palace, Colaba, Mumbai',
          description: 'Iconic heritage landmark facing the Gateway of India. Sea-facing view, Palace lounge access, butler service.',
          priceAmount: 35000,
          priceCurrency: 'INR',
          priceFormatted: '₹35,000 / night',
          availability: 'Guaranteed Heritage Wing Allocation',
          bookingMethod: 'API',
          cancellationPolicy: 'Full refund 24 hours prior.',
          environment: 'SANDBOX',
          isMock: true,
          location: 'Mumbai',
          metadata: {
            city: 'Mumbai',
            arrivalCity: 'Mumbai',
            address: 'Apollo Bunder, Colaba, Mumbai 400001',
            checkIn: '14:00',
            checkOut: '12:00',
          },
        } as any,
        {
          id: `htl-mumbai-oberoi-${Date.now()}`,
          providerId: this.providerId,
          providerName: 'The Oberoi, Mumbai',
          title: 'Premier Ocean View — The Oberoi, Marine Drive, Nariman Point, Mumbai',
          description: 'Panoramic views of the Arabian Sea and Marine Drive. Floor-to-ceiling glass, 24-hr butler, luxury bath.',
          priceAmount: 28000,
          priceCurrency: 'INR',
          priceFormatted: '₹28,000 / night',
          availability: '2 Rooms Remaining',
          bookingMethod: 'API',
          cancellationPolicy: 'Complimentary cancellation up to 24 hours prior.',
          environment: 'SANDBOX',
          isMock: true,
          location: 'Mumbai',
          metadata: {
            city: 'Mumbai',
            arrivalCity: 'Mumbai',
            address: 'Nariman Point, Marine Drive, Mumbai 400021',
            checkIn: '14:00',
            checkOut: '12:00',
          },
        } as any,
      ];
    }

    if (cityUpper.includes('BENGALURU') || cityUpper.includes('BANGALORE')) {
      return [
        {
          id: `htl-blr-leela-${Date.now()}`,
          providerId: this.providerId,
          providerName: 'The Leela Palace Bengaluru',
          title: 'Royal Premier Room — The Leela Palace, Old Airport Road, Bengaluru',
          description: 'Architecture inspired by the Mysore Royal Palace, set in 7 acres of lush gardens. Balcony with waterfall view.',
          priceAmount: 24000,
          priceCurrency: 'INR',
          priceFormatted: '₹24,000 / night',
          availability: 'Confirmed Available',
          bookingMethod: 'API',
          cancellationPolicy: 'Full refund 24 hours prior.',
          environment: 'SANDBOX',
          isMock: true,
          metadata: {
            city: 'Bengaluru',
            arrivalCity: 'Bengaluru',
            address: '23 HAL Old Airport Rd, Bengaluru 560008',
            checkIn: '14:00',
            checkOut: '12:00',
          },
        },
      ];
    }

    if (cityUpper.includes('GOA')) {
      return [
        {
          id: `htl-goa-tajexotica-${Date.now()}`,
          providerId: this.providerId,
          providerName: 'Taj Exotica Resort & Spa, Goa',
          title: 'Mediterranean Sea-Facing Villa — Taj Exotica, Benaulim, Goa',
          description: 'Spread across 56 acres along the pristine Benaulim beach. Private plunge pool, Jiva Spa access, breakfast included.',
          priceAmount: 32000,
          priceCurrency: 'INR',
          priceFormatted: '₹32,000 / night',
          availability: 'Confirmed Villa Availability',
          bookingMethod: 'API',
          cancellationPolicy: 'Complimentary cancellation up to 72 hours prior.',
          environment: 'SANDBOX',
          isMock: true,
          metadata: {
            city: 'Goa',
            arrivalCity: 'Goa',
            address: 'Calwaddo, Benaulim, Goa 403716',
            checkIn: '15:00',
            checkOut: '11:00',
          },
        },
      ];
    }

    // Default: Ahmedabad Luxury Inventory
    return [
      {
        id: `mock-hotel-1-${Date.now()}`,
        providerId: this.providerId,
        providerName: 'ITC Narmada, a Luxury Collection Hotel',
        title: `Executive Suite — ITC Narmada, Bodakdev, ${targetCity}`,
        description: 'King bed suite with skyline views, club lounge access, breakfast included.',
        priceAmount: 24000,
        priceCurrency: 'INR',
        priceFormatted: '₹24,000 / night',
        availability: 'Guaranteed Room Availability',
        bookingMethod: 'API',
        cancellationPolicy: 'Full refund 24 hours prior to check-in.',
        environment: 'SANDBOX',
        isMock: true,
        metadata: {
          city: targetCity,
          arrivalCity: targetCity,
          address: `Bodakdev, ${targetCity}`,
        },
      },
      {
        id: `mock-hotel-2-${Date.now()}`,
        providerId: this.providerId,
        providerName: 'Taj Skyline',
        title: `Luxury King Room — Taj Skyline, ${targetCity}`,
        description: 'Contemporary luxury room with city view, complimentary airport transfer.',
        priceAmount: 18500,
        priceCurrency: 'INR',
        priceFormatted: '₹18,500 / night',
        availability: '2 rooms remaining',
        bookingMethod: 'API',
        cancellationPolicy: 'Non-refundable rate.',
        environment: 'SANDBOX',
        isMock: true,
        metadata: {
          city: targetCity,
          arrivalCity: targetCity,
          address: `Sindhu Bhavan Road, ${targetCity}`,
        },
      },
    ];
  }

  async execute(proposal: OptionProposal, details: Record<string, any>): Promise<ExecutionOutput> {
    const ref = `[MOCK]-HTL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    return {
      success: true,
      providerId: this.providerId,
      externalReferenceId: ref,
      providerName: proposal.providerName,
      status: 'CONFIRMED',
      environment: 'SANDBOX',
      isMock: true,
      rawResponse: {
        gds: 'Amadeus Mock Sandbox',
        status: 'HK' /* Holds Confirmed */,
        pnr: ref,
        provider: proposal.providerName,
      },
      confirmedDetails: {
        bookingRef: ref,
        nights: details.nights || 1,
        checkIn: details.checkIn || '14:00',
        checkOut: '12:00',
        breakfastIncluded: true,
      },
    };
  }

  async verify(referenceId: string): Promise<VerificationResult> {
    return {
      verified: true,
      status: 'CONFIRMED',
      confirmationReference: referenceId,
      environment: 'SANDBOX',
      isMock: referenceId.includes('MOCK') || true,
      verifiedAt: new Date(),
      auditTrail: `GDS PNR status confirmed via mock GDS verification. Reference: ${referenceId}`,
    };
  }
}

export class MockMobilityAdapter implements ProviderAdapterInterface {
  readonly providerId = 'mock_mobility';
  name = 'Blacklane / Luxury Chauffeur Fleet Adapter';
  supportedCategories = ['mobility', 'transit'];
  readonly environment = 'SANDBOX' as const;

  async search(query: {
    category: string;
    intent?: string;
    rawInput: string;
    constraints?: Record<string, any>;
  }): Promise<OptionProposal[]> {
    return [
      {
        id: `mock-mob-1-${Date.now()}`,
        providerId: this.providerId,
        providerName: 'Proventa Chauffeur Network - SVPIA Fleet',
        title: 'Mercedes-Benz E-Class Executive Airport Transfer',
        description: 'Chauffeur meet & greet at SVPIA arrival terminal, bottled water, Wi-Fi, flight tracking.',
        priceAmount: 1800,
        priceCurrency: 'INR',
        priceFormatted: '₹1,800',
        availability: 'Dedicated Driver Assigned on Approval',
        bookingMethod: 'API',
        cancellationPolicy: 'Complimentary cancellation up to 1 hour prior.',
        environment: 'SANDBOX',
        isMock: true,
      },
    ];
  }

  async execute(proposal: OptionProposal, details: Record<string, any>): Promise<ExecutionOutput> {
    const ref = `[MOCK]-CHAUFF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      providerId: this.providerId,
      externalReferenceId: ref,
      providerName: proposal.providerName,
      status: 'CONFIRMED',
      environment: 'SANDBOX',
      isMock: true,
      rawResponse: {
        fleetStatus: 'DRIVER_DISPATCHED',
        driverName: 'Ramesh Patel',
        vehicle: 'Mercedes-Benz E-Class (GJ-01-XX-9988)',
        tripId: ref,
      },
      confirmedDetails: {
        tripId: ref,
        driver: 'Ramesh Patel',
        car: 'Mercedes-Benz E-Class',
        pickupTime: details.scheduledTime || 'Promptly as requested',
      },
    };
  }

  async verify(referenceId: string): Promise<VerificationResult> {
    return {
      verified: true,
      status: 'CONFIRMED',
      confirmationReference: referenceId,
      environment: 'SANDBOX',
      isMock: referenceId.includes('MOCK') || true,
      verifiedAt: new Date(),
      auditTrail: `Fleet dispatch telemetry confirmed via mobility partner mock API. Reference: ${referenceId}`,
    };
  }
}

export class MockShoppingAdapter implements ProviderAdapterInterface {
  readonly providerId = 'mock_shopping';
  name = 'Luxury Retail & Concierge Gifting Adapter';
  supportedCategories = ['shopping', 'gift'];
  readonly environment = 'SANDBOX' as const;

  async search(query: {
    category: string;
    intent?: string;
    rawInput: string;
    constraints?: Record<string, any>;
  }): Promise<OptionProposal[]> {
    return [
      {
        id: `mock-shop-1-${Date.now()}`,
        providerId: this.providerId,
        providerName: 'Bandhej & Raw Mango Curated Gifting',
        title: 'Bespoke Handwoven Silk Stole Gift Box',
        description: 'Handcrafted pure mulberry silk stole with custom handwritten calligraphy note and luxury gift box.',
        priceAmount: 14500,
        priceCurrency: 'INR',
        priceFormatted: '₹14,500',
        availability: 'Same-day courier packaging available',
        bookingMethod: 'API',
        cancellationPolicy: 'Customized luxury orders non-refundable once packed.',
        environment: 'SANDBOX',
        isMock: true,
      },
    ];
  }

  async execute(proposal: OptionProposal, details: Record<string, any>): Promise<ExecutionOutput> {
    const ref = `[MOCK]-GIFT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      providerId: this.providerId,
      externalReferenceId: ref,
      providerName: proposal.providerName,
      status: 'CONFIRMED',
      environment: 'SANDBOX',
      isMock: true,
      rawResponse: {
        boutiqueOrderRef: ref,
        status: 'ORDER_PLACED_PACKAGING',
      },
      confirmedDetails: {
        orderId: ref,
        giftNote: details.giftNote || 'With warm compliments',
        deliveryAddress: details.deliveryAddress || 'Client Residence',
      },
    };
  }

  async verify(referenceId: string): Promise<VerificationResult> {
    return {
      verified: true,
      status: 'CONFIRMED',
      confirmationReference: referenceId,
      environment: 'SANDBOX',
      isMock: referenceId.includes('MOCK') || true,
      verifiedAt: new Date(),
      auditTrail: `Boutique order verified via retail partner mock inventory system. Reference: ${referenceId}`,
    };
  }
}
