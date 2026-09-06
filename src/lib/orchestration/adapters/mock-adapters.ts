import type { ProviderAdapterInterface, OptionProposal, ExecutionOutput, VerificationResult } from '../types';

export class MockDiningAdapter implements ProviderAdapterInterface {
  name = 'OpenTable / Resy Mock Dining Provider';
  supportedCategories = ['dining'];

  async search(query: {
    category: string;
    intent?: string;
    rawInput: string;
    constraints?: Record<string, any>;
  }): Promise<OptionProposal[]> {
    return [
      {
        id: `mock-dine-1-${Date.now()}`,
        providerName: 'Agashiye - The House of MG',
        title: 'Heritage Rooftop Dining - Table for 2',
        description: 'Authentic Gujarati Thali dining on the heritage rooftop terrace. Prime 8:00 PM seating.',
        priceAmount: 3900,
        priceCurrency: 'INR',
        priceFormatted: '₹3,900',
        availability: 'Instant Confirmation Available',
        bookingMethod: 'API',
        cancellationPolicy: 'Complimentary cancellation up to 4 hours prior.',
      },
      {
        id: `mock-dine-2-${Date.now()}`,
        providerName: 'The Royal Vega - ITC Narmada',
        title: 'Luxury Vegetarian Fine Dining',
        description: 'Regal dining experience celebrating ancestral Indian cuisine.',
        priceAmount: 5500,
        priceCurrency: 'INR',
        priceFormatted: '₹5,500',
        availability: 'Immediate Reservation Available',
        bookingMethod: 'API',
        cancellationPolicy: 'Cancellation up to 2 hours prior.',
      },
    ];
  }

  async execute(proposal: OptionProposal, details: Record<string, any>): Promise<ExecutionOutput> {
    const ref = `[MOCK]-DIN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    return {
      success: true,
      externalReferenceId: ref,
      providerName: proposal.providerName,
      status: 'CONFIRMED',
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
      isMock: referenceId.includes('MOCK'),
      verifiedAt: new Date(),
      auditTrail: `Verified with OpenTable partner API mock endpoint. Reference: ${referenceId}`,
    };
  }
}

export class MockHotelAdapter implements ProviderAdapterInterface {
  name = 'Amadeus / Sabre Global GDS Mock Adapter';
  supportedCategories = ['travel', 'hotel', 'flights'];

  async search(query: {
    category: string;
    intent?: string;
    rawInput: string;
    constraints?: Record<string, any>;
  }): Promise<OptionProposal[]> {
    return [
      {
        id: `mock-hotel-1-${Date.now()}`,
        providerName: 'ITC Narmada, a Luxury Collection Hotel',
        title: 'Executive Suite, Bodakdev Ahmedabad',
        description: 'King bed suite with skyline views, club lounge access, breakfast included.',
        priceAmount: 24000,
        priceCurrency: 'INR',
        priceFormatted: '₹24,000 / night',
        availability: 'Guaranteed Room Availability',
        bookingMethod: 'API',
        cancellationPolicy: 'Full refund 24 hours prior to check-in.',
      },
      {
        id: `mock-hotel-2-${Date.now()}`,
        providerName: 'Taj Skyline, Ahmedabad',
        title: 'Luxury King Room - Sindhu Bhavan Road',
        description: 'Contemporary luxury room with city view, complimentary airport transfer.',
        priceAmount: 18500,
        priceCurrency: 'INR',
        priceFormatted: '₹18,500 / night',
        availability: '2 rooms remaining',
        bookingMethod: 'API',
        cancellationPolicy: 'Non-refundable rate.',
      },
    ];
  }

  async execute(proposal: OptionProposal, details: Record<string, any>): Promise<ExecutionOutput> {
    const ref = `[MOCK]-HTL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    return {
      success: true,
      externalReferenceId: ref,
      providerName: proposal.providerName,
      status: 'CONFIRMED',
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
      isMock: referenceId.includes('MOCK'),
      verifiedAt: new Date(),
      auditTrail: `GDS PNR status confirmed via mock GDS verification. Reference: ${referenceId}`,
    };
  }
}

export class MockMobilityAdapter implements ProviderAdapterInterface {
  name = 'Blacklane / Luxury Chauffeur Fleet Adapter';
  supportedCategories = ['mobility', 'transit'];

  async search(query: {
    category: string;
    intent?: string;
    rawInput: string;
    constraints?: Record<string, any>;
  }): Promise<OptionProposal[]> {
    return [
      {
        id: `mock-mob-1-${Date.now()}`,
        providerName: 'Proventa Chauffeur Network - SVPIA Fleet',
        title: 'Mercedes-Benz E-Class Executive Airport Transfer',
        description: 'Chauffeur meet & greet at SVPIA arrival terminal, bottled water, Wi-Fi, flight tracking.',
        priceAmount: 1800,
        priceCurrency: 'INR',
        priceFormatted: '₹1,800',
        availability: 'Dedicated Driver Assigned on Approval',
        bookingMethod: 'API',
        cancellationPolicy: 'Complimentary cancellation up to 1 hour prior.',
      },
    ];
  }

  async execute(proposal: OptionProposal, details: Record<string, any>): Promise<ExecutionOutput> {
    const ref = `[MOCK]-CHAUFF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      externalReferenceId: ref,
      providerName: proposal.providerName,
      status: 'CONFIRMED',
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
      isMock: referenceId.includes('MOCK'),
      verifiedAt: new Date(),
      auditTrail: `Fleet dispatch telemetry confirmed via mobility partner mock API. Reference: ${referenceId}`,
    };
  }
}

export class MockShoppingAdapter implements ProviderAdapterInterface {
  name = 'Luxury Retail & Concierge Gifting Adapter';
  supportedCategories = ['shopping', 'gift'];

  async search(query: {
    category: string;
    intent?: string;
    rawInput: string;
    constraints?: Record<string, any>;
  }): Promise<OptionProposal[]> {
    return [
      {
        id: `mock-shop-1-${Date.now()}`,
        providerName: 'Bandhej & Raw Mango Curated Gifting',
        title: 'Bespoke Handwoven Silk Stole Gift Box',
        description: 'Handcrafted pure mulberry silk stole with custom handwritten calligraphy note and luxury gift box.',
        priceAmount: 14500,
        priceCurrency: 'INR',
        priceFormatted: '₹14,500',
        availability: 'Same-day courier packaging available',
        bookingMethod: 'API',
        cancellationPolicy: 'Customized luxury orders non-refundable once packed.',
      },
    ];
  }

  async execute(proposal: OptionProposal, details: Record<string, any>): Promise<ExecutionOutput> {
    const ref = `[MOCK]-GIFT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      externalReferenceId: ref,
      providerName: proposal.providerName,
      status: 'CONFIRMED',
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
      isMock: referenceId.includes('MOCK'),
      verifiedAt: new Date(),
      auditTrail: `Boutique order verified via retail partner mock inventory system. Reference: ${referenceId}`,
    };
  }
}
