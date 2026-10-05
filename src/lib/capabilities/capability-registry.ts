import type {
  ServiceCategory,
  TaskCapability,
  CapabilityMatrixRow,
  AuthoritativeCapabilityRow,
} from './types';

export class CapabilityRegistry {
  private static capabilities: Map<ServiceCategory, TaskCapability> = new Map();
  private static initialized = false;

  private static init() {
    if (this.initialized) return;

    const core14Definitions: TaskCapability[] = [
      // 1. DINING
      {
        capabilityId: 'cap-dining',
        category: 'DINING',
        name: 'Fine Dining & Verified Reservations',
        description: 'Heritage dining, fine dining tables, tasting menus, and verified restaurant reservations.',
        specialistAgent: 'Dining & Reservations Agent',
        discoveryStatus: 'AVAILABLE',
        researchSupported: true,
        executionCategory: 'ASSISTED',
        executionMode: 'PROVIDER_API',
        providerName: 'Ahmedabad Verified / Dineout Network',
        bookingSupported: true,
        paymentSupport: 'supported',
        confirmationRequirement: 'required',
        liveProviderAvailable: true,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine provider confirmation',
        productionStatus: 'PRODUCTION_LIVE',
        supportedProviders: ['ahmedabad_verified', 'swiggy'],
      },
      // 2. TRAVEL (FLIGHTS & AVIATION)
      {
        capabilityId: 'cap-travel',
        category: 'TRAVEL',
        name: 'Commercial & Charter Aviation',
        description: 'Flight research, route optimization, schedule tracking, and ticketing assistance.',
        specialistAgent: 'Travel & Accommodations Agent',
        discoveryStatus: 'AVAILABLE',
        researchSupported: true,
        executionCategory: 'HUMAN',
        executionMode: 'HUMAN_CONCIERGE',
        providerName: 'Aviation & Airline Desk',
        bookingSupported: true,
        paymentSupport: 'supported',
        confirmationRequirement: 'required',
        liveProviderAvailable: false, // In sandbox/wave 1 routes to Human Concierge
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine airline/GDS booking reference',
        productionStatus: 'HUMAN_CONCIERGE',
        supportedProviders: ['scheduled_flights', 'charter_aviation', 'duffel_flights'],
      },
      // 3. HOTELS
      {
        capabilityId: 'cap-hotels',
        category: 'HOTELS',
        name: 'Luxury Stays, Suites & Villas',
        description: 'Curated hotels, heritage estates, luxury resorts, and bespoke accommodation research.',
        specialistAgent: 'Travel & Accommodations Agent',
        discoveryStatus: 'AVAILABLE',
        researchSupported: true,
        executionCategory: 'HUMAN',
        executionMode: 'HUMAN_CONCIERGE',
        providerName: 'Curated Properties & Stays Desk',
        bookingSupported: true,
        paymentSupport: 'supported',
        confirmationRequirement: 'required',
        liveProviderAvailable: false,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine hotel/property confirmation',
        productionStatus: 'HUMAN_CONCIERGE',
        supportedProviders: ['curated_properties', 'heritage_villas', 'duffel_stays'],
      },
      // 4. TRANSPORT
      {
        capabilityId: 'cap-transport',
        category: 'TRANSPORT',
        name: 'Chauffeur Fleet & Ground Mobility',
        description: 'Executive sedan transfers, airport pickups, intercity luxury cabs, and day chauffeurs.',
        specialistAgent: 'Mobility & Chauffeur Agent',
        discoveryStatus: 'AVAILABLE',
        researchSupported: true,
        executionCategory: 'HUMAN',
        executionMode: 'HUMAN_CONCIERGE',
        providerName: 'Chauffeur Fleet Desk',
        bookingSupported: true,
        paymentSupport: 'supported',
        confirmationRequirement: 'required',
        liveProviderAvailable: false,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine trip/booking identifier',
        productionStatus: 'HUMAN_CONCIERGE',
        supportedProviders: ['chauffeur_fleet'],
      },
      // 5. FOOD DELIVERY
      {
        capabilityId: 'cap-food-delivery',
        category: 'FOOD_DELIVERY',
        name: 'Gourmet Food Delivery & Private Dining',
        description: 'Curated dining delivery from premier restaurants and gourmet kitchens.',
        specialistAgent: 'Dining & Reservations Agent',
        discoveryStatus: 'AVAILABLE',
        researchSupported: true,
        executionCategory: 'AUTONOMOUS',
        executionMode: 'PROVIDER_API',
        providerName: 'Swiggy Enterprise Partner Gateway',
        bookingSupported: true,
        paymentSupport: 'supported',
        confirmationRequirement: 'required',
        liveProviderAvailable: true,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine order identifier',
        productionStatus: 'PRODUCTION_LIVE',
        supportedProviders: ['swiggy'],
      },
      // 6. MOVIES & ENTERTAINMENT
      {
        capabilityId: 'cap-movies',
        category: 'MOVIES_ENTERTAINMENT',
        name: 'Cinema & Luxury Auditoriums',
        description: 'IMAX Laser, Insignia recliners, premiere screenings, and auditorium seating.',
        specialistAgent: 'Entertainment & Experiences Agent',
        discoveryStatus: 'AVAILABLE',
        researchSupported: true,
        executionCategory: 'AUTONOMOUS',
        executionMode: 'PROVIDER_API',
        providerName: 'PVR INOX / Cinema Gateway',
        bookingSupported: true,
        paymentSupport: 'supported',
        confirmationRequirement: 'required',
        liveProviderAvailable: true,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine ticket/booking reference',
        productionStatus: 'PRODUCTION_LIVE',
        supportedProviders: ['pvr_inox_ahmedabad', 'cinema_pvr_inox'],
      },
      // 7. GIFTS
      {
        capabilityId: 'cap-gifts',
        category: 'GIFTS',
        name: 'Curated Gifting & Bespoke Presentation',
        description: 'Luxury gift sourcing, floral arrangements, artisan packaging, and doorstep delivery.',
        specialistAgent: 'Curated Gifting Agent',
        discoveryStatus: 'AVAILABLE',
        researchSupported: true,
        executionCategory: 'HUMAN',
        executionMode: 'HUMAN_CONCIERGE',
        providerName: 'Bespoke Gifting Atelier',
        bookingSupported: true,
        paymentSupport: 'supported',
        confirmationRequirement: 'required',
        liveProviderAvailable: false,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine merchant order/tracking reference',
        productionStatus: 'HUMAN_CONCIERGE',
        supportedProviders: ['bespoke_gifting'],
      },
      // 8. SHOPPING
      {
        capabilityId: 'cap-shopping',
        category: 'SHOPPING',
        name: 'Luxury Procurement & Personal Shopping',
        description: 'Rare item sourcing, fashion atelier visits, lifestyle acquisition, and heritage textiles.',
        specialistAgent: 'Shopping & Gifting Agent',
        discoveryStatus: 'AVAILABLE',
        researchSupported: true,
        executionCategory: 'HUMAN',
        executionMode: 'HUMAN_CONCIERGE',
        providerName: 'Luxury Procurement Desk',
        bookingSupported: true,
        paymentSupport: 'supported',
        confirmationRequirement: 'required',
        liveProviderAvailable: false,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine merchant invoice/reference',
        productionStatus: 'HUMAN_CONCIERGE',
        supportedProviders: ['luxury_procurement'],
      },
      // 9. SALON & WELLNESS
      {
        capabilityId: 'cap-salon-wellness',
        category: 'SALON_WELLNESS',
        name: 'Spa, Salon & Wellness Appointments',
        description: 'Premium grooming, wellness treatments, private spa bookings, and bespoke health appointments.',
        specialistAgent: 'Calendar & Appointments Agent',
        discoveryStatus: 'AVAILABLE',
        researchSupported: true,
        executionCategory: 'HUMAN',
        executionMode: 'HUMAN_CONCIERGE',
        providerName: 'Verified Wellness Network',
        bookingSupported: true,
        paymentSupport: 'supported',
        confirmationRequirement: 'required',
        liveProviderAvailable: false,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine salon/spa appointment reference',
        productionStatus: 'HUMAN_CONCIERGE',
        supportedProviders: ['verified_wellness'],
      },
      // 10. APPOINTMENTS & HEALTHCARE
      {
        capabilityId: 'cap-appointments',
        category: 'APPOINTMENTS',
        name: 'Healthcare & Doctor Discovery Desk',
        description: 'Private medical appointments, specialist doctor consultations, and clinic scheduling coordination.',
        specialistAgent: 'Healthcare & Doctor Discovery Agent',
        discoveryStatus: 'AVAILABLE',
        researchSupported: true,
        executionCategory: 'ASSISTED',
        executionMode: 'PROVIDER_API',
        providerName: 'Healthcare Discovery & OPD Liaison Desk',
        bookingSupported: true,
        paymentSupport: 'supported',
        confirmationRequirement: 'required',
        liveProviderAvailable: true,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: false,
        verificationMethod: 'genuine appointment reference',
        productionStatus: 'PRODUCTION_LIVE',
        supportedProviders: ['healthcare_discovery', 'concierge_calendar'],
      },
      // 11. EVENTS
      {
        capabilityId: 'cap-events',
        category: 'EVENTS',
        name: 'Universal Event Discovery & Cultural Access',
        description: 'Concerts, comedy specials, theatre productions, art retrospectives, Garba & Navratri passes, and VIP event access across India.',
        specialistAgent: 'Events & Gatherings Agent',
        discoveryStatus: 'AVAILABLE',
        researchSupported: true,
        executionCategory: 'ASSISTED',
        executionMode: 'PROVIDER_API',
        providerName: 'Universal Events & Cultural Desk',
        bookingSupported: true,
        paymentSupport: 'supported',
        confirmationRequirement: 'required',
        liveProviderAvailable: true,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine event booking / ticket confirmation',
        productionStatus: 'PRODUCTION_LIVE',
        supportedProviders: ['events_discovery', 'vip_access'],
      },
      // 12. WEEKEND ESCAPES
      {
        capabilityId: 'cap-weekend-escapes',
        category: 'WEEKEND_ESCAPES',
        name: 'Weekend Getaways & Curated Escapes',
        description: 'Complete weekend itineraries, road trips, regional retreats, and multi-component coordination.',
        specialistAgent: 'Travel & Accommodations Agent',
        discoveryStatus: 'AVAILABLE',
        researchSupported: true,
        executionCategory: 'ASSISTED',
        executionMode: 'HUMAN_CONCIERGE',
        providerName: 'Curated Properties & Escapes Desk',
        bookingSupported: true,
        paymentSupport: 'supported',
        confirmationRequirement: 'required',
        liveProviderAvailable: true,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'constituent genuine reservation references',
        productionStatus: 'PRODUCTION_LIVE',
        supportedProviders: ['ahmedabad_verified', 'curated_properties'],
      },
      // 13. RESEARCH & PLANNING
      {
        capabilityId: 'cap-research-planning',
        category: 'RESEARCH_PLANNING',
        name: 'Deep Research & Advisory Intelligence',
        description: 'Comprehensive market surveys, hotel comparisons, neighborhood guides, and feasibility assessments.',
        specialistAgent: 'Research & Advisory Agent',
        discoveryStatus: 'AVAILABLE',
        researchSupported: true,
        executionCategory: 'AUTONOMOUS',
        executionMode: 'AI_RESEARCH',
        providerName: 'Proventa Intelligence Engine',
        bookingSupported: false,
        paymentSupport: 'unsupported',
        confirmationRequirement: 'optional',
        liveProviderAvailable: true,
        humanConciergeAvailable: true,
        customerApprovalRequired: false,
        paymentRequired: false,
        verificationMethod: 'source-backed result',
        productionStatus: 'PRODUCTION_LIVE',
        supportedProviders: ['proventa_intelligence'],
      },
      // 14. OTHER CONCIERGE / BESPOKE
      {
        capabilityId: 'cap-other-concierge',
        category: 'OTHER_CONCIERGE',
        name: 'General Concierge & Bespoke Mandates',
        description: 'Custom personal errands, home assistance, discreet logistics, and unique family office tasks.',
        specialistAgent: 'Human Concierge Triage Agent',
        discoveryStatus: 'AVAILABLE',
        researchSupported: true,
        executionCategory: 'HUMAN',
        executionMode: 'HUMAN_CONCIERGE',
        providerName: 'Proventa Concierge Operations Desk',
        bookingSupported: true,
        paymentSupport: 'supported',
        confirmationRequirement: 'required',
        liveProviderAvailable: false,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: false,
        verificationMethod: 'operator-entered genuine confirmation',
        productionStatus: 'HUMAN_CONCIERGE',
        supportedProviders: ['concierge_operations'],
      },
    ];

    // Populate core 14
    core14Definitions.forEach((def) => {
      this.capabilities.set(def.category, def);
    });

    // Populate extended canonical aliases
    const extendedAliases: [ServiceCategory, ServiceCategory][] = [
      ['HOTELS_ACCOMMODATION', 'HOTELS'],
      ['MOBILITY_TRANSPORT', 'TRANSPORT'],
      ['EVENTS_EXPERIENCES', 'EVENTS'],
      ['GIFTS_SHOPPING', 'GIFTS'],
      ['HEALTH_WELLNESS', 'APPOINTMENTS'],
      ['HOME_LIFESTYLE', 'OTHER_CONCIERGE'],
      ['BUSINESS_COURIER', 'OTHER_CONCIERGE'],
      ['FINANCIAL_CONCIERGE', 'OTHER_CONCIERGE'],
      ['LEGAL_DOCUMENTATION', 'OTHER_CONCIERGE'],
      ['BESPOKE_REQUESTS', 'OTHER_CONCIERGE'],
    ];

    extendedAliases.forEach(([extKey, baseKey]) => {
      const baseCap = this.capabilities.get(baseKey);
      if (baseCap) {
        this.capabilities.set(extKey, {
          ...baseCap,
          category: extKey,
        });
      }
    });

    this.initialized = true;
  }

  static getCapability(category: ServiceCategory | string): TaskCapability {
    this.init();
    const raw = (category || 'OTHER_CONCIERGE').toUpperCase().replace(/[\s-]/g, '_');
    
    // Comprehensive alias mapping
    const aliasMap: Record<string, ServiceCategory> = {
      HOTELS_ACCOMMODATION: 'HOTELS',
      HOTEL: 'HOTELS',
      STAYS: 'HOTELS',
      STAY: 'HOTELS',
      ACCOMMODATION: 'HOTELS',
      MOBILITY_TRANSPORT: 'TRANSPORT',
      MOBILITY: 'TRANSPORT',
      CAB: 'TRANSPORT',
      CABS: 'TRANSPORT',
      CHAUFFEUR: 'TRANSPORT',
      TAXI: 'TRANSPORT',
      FLIGHT: 'TRAVEL',
      FLIGHTS: 'TRAVEL',
      AVIATION: 'TRAVEL',
      EVENTS_EXPERIENCES: 'EVENTS',
      EVENT: 'EVENTS',
      EXPERIENCES: 'EVENTS',
      EXPERIENCE: 'EVENTS',
      NAVRATRI: 'EVENTS',
      GARBA: 'EVENTS',
      FESTIVAL: 'EVENTS',
      FESTIVALS: 'EVENTS',
      CONCERT: 'EVENTS',
      CONCERTS: 'EVENTS',
      GIFTS_SHOPPING: 'GIFTS',
      GIFT: 'GIFTS',
      HEALTH_WELLNESS: 'APPOINTMENTS',
      HEALTH: 'APPOINTMENTS',
      HEALTHCARE: 'APPOINTMENTS',
      DOCTOR: 'APPOINTMENTS',
      DOCTORS: 'APPOINTMENTS',
      APPOINTMENT: 'APPOINTMENTS',
      SALON: 'SALON_WELLNESS',
      WELLNESS: 'SALON_WELLNESS',
      HOME_LIFESTYLE: 'OTHER_CONCIERGE',
      HOME: 'OTHER_CONCIERGE',
      LIFESTYLE: 'OTHER_CONCIERGE',
      BUSINESS_COURIER: 'OTHER_CONCIERGE',
      BUSINESS: 'OTHER_CONCIERGE',
      COURIER: 'OTHER_CONCIERGE',
      FINANCIAL_CONCIERGE: 'OTHER_CONCIERGE',
      FINANCIAL: 'OTHER_CONCIERGE',
      FINANCE: 'OTHER_CONCIERGE',
      LEGAL_DOCUMENTATION: 'OTHER_CONCIERGE',
      LEGAL: 'OTHER_CONCIERGE',
      BESPOKE_REQUESTS: 'OTHER_CONCIERGE',
      BESPOKE: 'OTHER_CONCIERGE',
      RESEARCH: 'RESEARCH_PLANNING',
      PLANNING: 'RESEARCH_PLANNING',
      OTHER: 'OTHER_CONCIERGE',
    };

    const targetCategory = (aliasMap[raw] || raw) as ServiceCategory;
    return this.capabilities.get(targetCategory) || this.capabilities.get('OTHER_CONCIERGE')!;
  }

  static getAllCapabilities(): TaskCapability[] {
    this.init();
    const core14Categories: ServiceCategory[] = [
      'DINING',
      'TRAVEL',
      'HOTELS',
      'TRANSPORT',
      'FOOD_DELIVERY',
      'MOVIES_ENTERTAINMENT',
      'GIFTS',
      'SHOPPING',
      'SALON_WELLNESS',
      'APPOINTMENTS',
      'EVENTS',
      'WEEKEND_ESCAPES',
      'RESEARCH_PLANNING',
      'OTHER_CONCIERGE',
    ];

    return core14Categories.map((cat) => this.capabilities.get(cat)!);
  }

  static getProductionMatrix(): CapabilityMatrixRow[] {
    this.init();
    return this.getAllCapabilities().map((c) => ({
      category: c.category,
      name: c.name,
      specialistAgent: c.specialistAgent,
      discovery: c.discoveryStatus || 'AVAILABLE',
      execution: c.executionCategory || 'AUTONOMOUS',
      provider: c.providerName || c.supportedProviders[0] || 'Proventa Network',
      booking: c.bookingSupported ?? true,
      payment: c.paymentSupport || 'supported',
      confirmation: c.confirmationRequirement || 'required',
      researchSupported: c.researchSupported,
      automaticExecution: c.executionMode === 'PROVIDER_API' && c.liveProviderAvailable,
      humanConcierge: c.humanConciergeAvailable,
      approvalRequired: c.customerApprovalRequired,
      verificationMethod: c.verificationMethod,
      productionStatus: c.productionStatus,
    }));
  }

  static getAuthoritativeMatrix(): AuthoritativeCapabilityRow[] {
    this.init();
    return this.getAllCapabilities().map((c) => ({
      category: c.category,
      name: c.name,
      discovery: c.discoveryStatus || 'AVAILABLE',
      execution: c.executionCategory || 'AUTONOMOUS',
      provider: c.providerName || c.supportedProviders[0] || 'Proventa Network',
      booking: c.bookingSupported ?? true,
      payment: c.paymentSupport || 'supported',
      confirmation: c.confirmationRequirement || 'required',
      specialistAgent: c.specialistAgent,
      verificationMethod: c.verificationMethod,
      notes: `${c.description} Verified via ${c.supportedProviders.join(', ')}.`,
    }));
  }

  static isExecutionSupported(category: ServiceCategory | string): boolean {
    const cap = this.getCapability(category);
    return cap.liveProviderAvailable || cap.humanConciergeAvailable;
  }
}
