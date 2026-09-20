import type {
  ServiceCategory,
  TaskCapability,
  CapabilityMatrixRow,
} from './types';

export class CapabilityRegistry {
  private static capabilities: Map<ServiceCategory, TaskCapability> = new Map();
  private static initialized = false;

  private static init() {
    if (this.initialized) return;

    const definitions: TaskCapability[] = [
      {
        capabilityId: 'cap-dining',
        category: 'DINING',
        name: 'Fine Dining & Verified Reservations',
        description: 'Heritage dining, fine dining tables, tasting menus, and verified restaurant reservations.',
        specialistAgent: 'Dining & Reservations Agent',
        researchSupported: true,
        executionMode: 'PROVIDER_API',
        liveProviderAvailable: true,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine provider confirmation',
        productionStatus: 'PRODUCTION_LIVE',
        supportedProviders: ['ahmedabad_verified', 'swiggy'],
      },
      {
        capabilityId: 'cap-travel',
        category: 'TRAVEL',
        name: 'Commercial & Charter Aviation',
        description: 'Flight research, route optimization, schedule tracking, and ticketing assistance.',
        specialistAgent: 'Travel & Accommodations Agent',
        researchSupported: true,
        executionMode: 'HUMAN_CONCIERGE',
        liveProviderAvailable: false, // Live automated booking requires production GDS credentials
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine airline/GDS booking reference',
        productionStatus: 'HUMAN_CONCIERGE',
        supportedProviders: ['scheduled_flights', 'charter_aviation'],
      },
      {
        capabilityId: 'cap-hotels',
        category: 'HOTELS',
        name: 'Luxury Stays, Suites & Villas',
        description: 'Curated hotels, heritage estates, luxury resorts, and bespoke accommodation research.',
        specialistAgent: 'Travel & Accommodations Agent',
        researchSupported: true,
        executionMode: 'HUMAN_CONCIERGE',
        liveProviderAvailable: false,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine hotel/property confirmation',
        productionStatus: 'HUMAN_CONCIERGE',
        supportedProviders: ['curated_properties', 'heritage_villas'],
      },
      {
        capabilityId: 'cap-transport',
        category: 'TRANSPORT',
        name: 'Chauffeur Fleet & Ground Mobility',
        description: 'Executive sedan transfers, airport pickups, intercity luxury cabs, and day chauffeurs.',
        specialistAgent: 'Mobility & Chauffeur Agent',
        researchSupported: true,
        executionMode: 'HUMAN_CONCIERGE',
        liveProviderAvailable: false,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine trip/booking identifier',
        productionStatus: 'HUMAN_CONCIERGE',
        supportedProviders: ['chauffeur_fleet'],
      },
      {
        capabilityId: 'cap-food-delivery',
        category: 'FOOD_DELIVERY',
        name: 'Gourmet Food Delivery & Private Dining',
        description: 'Curated dining delivery from premier restaurants and gourmet kitchens.',
        specialistAgent: 'Dining & Reservations Agent',
        researchSupported: true,
        executionMode: 'PROVIDER_API',
        liveProviderAvailable: true,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine order identifier',
        productionStatus: 'PRODUCTION_LIVE',
        supportedProviders: ['swiggy'],
      },
      {
        capabilityId: 'cap-movies',
        category: 'MOVIES_ENTERTAINMENT',
        name: 'Cinema & Luxury Auditoriums',
        description: 'IMAX Laser, Insignia recliners, premiere screenings, and auditorium seating.',
        specialistAgent: 'Entertainment & Experiences Agent',
        researchSupported: true,
        executionMode: 'PROVIDER_API',
        liveProviderAvailable: true,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine ticket/booking reference',
        productionStatus: 'PRODUCTION_LIVE',
        supportedProviders: ['pvr_inox_ahmedabad'],
      },
      {
        capabilityId: 'cap-gifts',
        category: 'GIFTS',
        name: 'Curated Gifting & Bespoke Presentation',
        description: 'Luxury gift sourcing, floral arrangements, artisan packaging, and doorstep delivery.',
        specialistAgent: 'Curated Gifting Agent',
        researchSupported: true,
        executionMode: 'HUMAN_CONCIERGE',
        liveProviderAvailable: false,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine merchant order/tracking reference',
        productionStatus: 'HUMAN_CONCIERGE',
        supportedProviders: ['bespoke_gifting'],
      },
      {
        capabilityId: 'cap-shopping',
        category: 'SHOPPING',
        name: 'Luxury Procurement & Personal Shopping',
        description: 'Rare item sourcing, fashion atelier visits, lifestyle acquisition, and heritage textiles.',
        specialistAgent: 'Shopping & Gifting Agent',
        researchSupported: true,
        executionMode: 'HUMAN_CONCIERGE',
        liveProviderAvailable: false,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine merchant invoice/reference',
        productionStatus: 'HUMAN_CONCIERGE',
        supportedProviders: ['luxury_procurement'],
      },
      {
        capabilityId: 'cap-salon-wellness',
        category: 'SALON_WELLNESS',
        name: 'Spa, Salon & Wellness Appointments',
        description: 'Premium grooming, wellness treatments, private spa bookings, and bespoke health appointments.',
        specialistAgent: 'Calendar & Appointments Agent',
        researchSupported: true,
        executionMode: 'HUMAN_CONCIERGE',
        liveProviderAvailable: false,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine salon/spa appointment reference',
        productionStatus: 'HUMAN_CONCIERGE',
        supportedProviders: ['verified_wellness'],
      },
      {
        capabilityId: 'cap-appointments',
        category: 'APPOINTMENTS',
        name: 'Calendar & Appointment Scheduling',
        description: 'Private medical, professional advisory, consulate, and executive scheduling coordination.',
        specialistAgent: 'Calendar & Appointments Agent',
        researchSupported: true,
        executionMode: 'HUMAN_CONCIERGE',
        liveProviderAvailable: false,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: false,
        verificationMethod: 'genuine appointment reference',
        productionStatus: 'HUMAN_CONCIERGE',
        supportedProviders: ['concierge_calendar'],
      },
      {
        capabilityId: 'cap-events',
        category: 'EVENTS',
        name: 'Cultural Access & Private Events',
        description: 'Concert access, exhibition previews, cultural galas, and VIP venue reservations.',
        specialistAgent: 'Events & Gatherings Agent',
        researchSupported: true,
        executionMode: 'HUMAN_CONCIERGE',
        liveProviderAvailable: false,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'genuine event booking / ticket confirmation',
        productionStatus: 'HUMAN_CONCIERGE',
        supportedProviders: ['vip_access'],
      },
      {
        capabilityId: 'cap-weekend-escapes',
        category: 'WEEKEND_ESCAPES',
        name: 'Weekend Getaways & Curated Escapes',
        description: 'Complete weekend itineraries, road trips, regional retreats, and multi-component coordination.',
        specialistAgent: 'Travel & Accommodations Agent',
        researchSupported: true,
        executionMode: 'HUMAN_CONCIERGE',
        liveProviderAvailable: true, // Multi-part synthesis via verified properties
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: true,
        verificationMethod: 'constituent genuine reservation references',
        productionStatus: 'PRODUCTION_LIVE',
        supportedProviders: ['ahmedabad_verified', 'curated_properties'],
      },
      {
        capabilityId: 'cap-research-planning',
        category: 'RESEARCH_PLANNING',
        name: 'Deep Research & Advisory Intelligence',
        description: 'Comprehensive market surveys, hotel comparisons, neighborhood guides, and feasibility assessments.',
        specialistAgent: 'Research & Advisory Agent',
        researchSupported: true,
        executionMode: 'AI_RESEARCH',
        liveProviderAvailable: true,
        humanConciergeAvailable: true,
        customerApprovalRequired: false,
        paymentRequired: false,
        verificationMethod: 'source-backed result',
        productionStatus: 'PRODUCTION_LIVE',
        supportedProviders: ['proventa_intelligence'],
      },
      {
        capabilityId: 'cap-other-concierge',
        category: 'OTHER_CONCIERGE',
        name: 'General Concierge & Bespoke Mandates',
        description: 'Custom personal errands, home assistance, discreet logistics, and unique family office tasks.',
        specialistAgent: 'Human Concierge Triage Agent',
        researchSupported: true,
        executionMode: 'HUMAN_CONCIERGE',
        liveProviderAvailable: false,
        humanConciergeAvailable: true,
        customerApprovalRequired: true,
        paymentRequired: false,
        verificationMethod: 'operator-entered genuine confirmation',
        productionStatus: 'HUMAN_CONCIERGE',
        supportedProviders: ['concierge_operations'],
      },
    ];

    definitions.forEach((def) => {
      this.capabilities.set(def.category, def);
    });

    this.initialized = true;
  }

  static getCapability(category: ServiceCategory | string): TaskCapability {
    this.init();
    const raw = (category || 'OTHER_CONCIERGE').toUpperCase().replace(/[\s-]/g, '_');
    
    // Seamless alias mapping for all human-first concierge categories
    const aliasMap: Record<string, ServiceCategory> = {
      HOTELS_ACCOMMODATION: 'HOTELS',
      MOBILITY_TRANSPORT: 'TRANSPORT',
      EVENTS_EXPERIENCES: 'EVENTS',
      GIFTS_SHOPPING: 'GIFTS',
      HEALTH_WELLNESS: 'SALON_WELLNESS',
      HOME_LIFESTYLE: 'OTHER_CONCIERGE',
      BUSINESS_COURIER: 'OTHER_CONCIERGE',
      FINANCIAL_CONCIERGE: 'OTHER_CONCIERGE',
      LEGAL_DOCUMENTATION: 'OTHER_CONCIERGE',
      BESPOKE_REQUESTS: 'OTHER_CONCIERGE',
      BESPOKE: 'OTHER_CONCIERGE',
    };

    const targetCategory = (aliasMap[raw] || raw) as ServiceCategory;
    return this.capabilities.get(targetCategory) || this.capabilities.get('OTHER_CONCIERGE')!;
  }

  static getAllCapabilities(): TaskCapability[] {
    this.init();
    return Array.from(this.capabilities.values());
  }

  static getProductionMatrix(): CapabilityMatrixRow[] {
    this.init();
    return this.getAllCapabilities().map((c) => ({
      category: c.category,
      name: c.name,
      specialistAgent: c.specialistAgent,
      researchSupported: c.researchSupported,
      automaticExecution: c.executionMode === 'PROVIDER_API' && c.liveProviderAvailable,
      humanConcierge: c.humanConciergeAvailable,
      approvalRequired: c.customerApprovalRequired,
      verificationMethod: c.verificationMethod,
      productionStatus: c.productionStatus,
    }));
  }

  static isExecutionSupported(category: ServiceCategory | string): boolean {
    const cap = this.getCapability(category);
    return cap.liveProviderAvailable || cap.humanConciergeAvailable;
  }
}
