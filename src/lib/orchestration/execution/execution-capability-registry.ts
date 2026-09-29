/**
 * PROVENTA — AUTHORITATIVE EXECUTION CAPABILITY REGISTRY & AUDIT MATRIX
 * Authoritative capability definitions and environment classification for all providers, adapters, and tools.
 * Enforces: Only verified LIVE_PRODUCTION capabilities may perform automated execution.
 */

import { ExecutionCapability, CapabilityExecutionStatus } from './types';
import { logger } from '@/lib/logger';

export class ExecutionCapabilityRegistry {
  private static capabilities: Map<string, ExecutionCapability> = new Map();
  private static initialized = false;

  private static init() {
    if (this.initialized) return;

    // Check actual environment variables at runtime
    const hasDuffelApiKey = Boolean(
      process.env.DUFFEL_API_KEY && process.env.DUFFEL_API_KEY.trim().length > 0
    );
    const isDuffelLiveEnv = process.env.DUFFEL_ENV === 'live';
    const isDuffelLiveKey = Boolean(process.env.DUFFEL_API_KEY?.startsWith('duffel_live_'));
    const isDuffelLiveVerified = hasDuffelApiKey && isDuffelLiveEnv && isDuffelLiveKey;

    const duffelCapabilityStatus: CapabilityExecutionStatus = !hasDuffelApiKey
      ? 'NOT_CONFIGURED'
      : isDuffelLiveVerified
      ? 'LIVE_PRODUCTION'
      : isDuffelLiveEnv
      ? 'CONFIGURED_BUT_UNVERIFIED'
      : 'SANDBOX';

    const hasAmadeusLive = Boolean(
      (process.env.AMADEUS_CLIENT_ID || process.env.AMADEUS_API_KEY) &&
      (process.env.AMADEUS_CLIENT_SECRET || process.env.AMADEUS_API_SECRET) &&
      process.env.AMADEUS_ENV === 'production'
    );

    const hasSwiggyLive = Boolean(
      process.env.SWIGGY_API_KEY &&
      process.env.SWIGGY_PARTNER_ID
    );

    const hasCinemaLive = Boolean(
      process.env.BOOKMYSHOW_API_KEY ||
      process.env.PVR_INOX_API_KEY
    );

    const hasRazorpayLive = Boolean(
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET
    );

    const matrix: ExecutionCapability[] = [
      // 0A. DUFFEL FLIGHTS & AVIATION GATEWAY
      {
        capabilityId: 'exec_flights_duffel',
        service: 'Commercial Aviation & Global Airline Ticketing',
        provider: 'Duffel Aviation Gateway (300+ Global Airlines)',
        providerId: 'duffel_flights',
        toolName: 'DuffelFlightTool',
        executionMethod: 'API',
        environment: isDuffelLiveVerified ? 'REAL' : 'SANDBOX',
        capabilityStatus: duffelCapabilityStatus,
        credentialsConfigured: hasDuffelApiKey,
        credentialsVerified: isDuffelLiveVerified,
        actuallyExecutableInProduction: isDuffelLiveVerified,
        requiresPayment: true,
        requiresCustomerApproval: true,
        supportsAutomatedExecution: isDuffelLiveVerified,
        supportsAssistedExecution: true,
        supportsHumanExecution: true,
        verificationMethod: 'Authentic 6-character Airline PNR / 13-digit e-Ticket Number via Duffel API',
        fallbackMethod: 'Human Concierge Aviation Desk',
        risksOrBlockers: isDuffelLiveVerified
          ? undefined
          : 'Duffel live key (duffel_live_...) with DUFFEL_ENV=live required for automated production ticketing. Sandbox/unverified mode routes to Concierge.',
      },
      // 0B. DUFFEL LUXURY STAYS & HOTELS GATEWAY
      {
        capabilityId: 'exec_stays_duffel',
        service: 'Luxury Hotels, Resorts & Accommodations',
        provider: 'Duffel Stays Gateway (1M+ Global Properties)',
        providerId: 'duffel_stays',
        toolName: 'DuffelStaysTool',
        executionMethod: 'API',
        environment: isDuffelLiveVerified ? 'REAL' : 'SANDBOX',
        capabilityStatus: duffelCapabilityStatus,
        credentialsConfigured: hasDuffelApiKey,
        credentialsVerified: isDuffelLiveVerified,
        actuallyExecutableInProduction: isDuffelLiveVerified,
        requiresPayment: true,
        requiresCustomerApproval: true,
        supportsAutomatedExecution: isDuffelLiveVerified,
        supportsAssistedExecution: true,
        supportsHumanExecution: true,
        verificationMethod: 'Authentic Hotel CRS Confirmation Code & Duffel Stay Reference (`sta_...`)',
        fallbackMethod: 'Human Concierge Stays Desk',
        risksOrBlockers: isDuffelLiveVerified
          ? undefined
          : 'Duffel live key (duffel_live_...) with DUFFEL_ENV=live required for automated hotel room confirmation. Sandbox/unverified mode routes to Concierge.',
      },
      // 0C. CONCIERGE FLIGHT EXECUTION DESK (Private Beta Active)
      {
        capabilityId: 'exec_concierge_flights',
        service: 'Concierge Flight Execution & Aviation Desk',
        provider: 'Human Concierge Aviation Desk',
        providerId: 'concierge_flights',
        toolName: 'GenericConciergeTool',
        executionMethod: 'HUMAN_CONCIERGE',
        environment: 'REAL',
        capabilityStatus: 'LIVE_PRODUCTION',
        credentialsConfigured: true,
        credentialsVerified: true,
        actuallyExecutableInProduction: true,
        requiresPayment: true,
        requiresCustomerApproval: true,
        supportsAutomatedExecution: false,
        supportsAssistedExecution: true,
        supportsHumanExecution: true,
        verificationMethod: 'Authentic 6-character Airline PNR / 13-digit e-Ticket Number via Concierge Operator',
        fallbackMethod: 'Senior Concierge Desk',
      },
      // 0D. CONCIERGE HOTEL & LUXURY STAYS EXECUTION DESK (Private Beta Active)
      {
        capabilityId: 'exec_concierge_stays',
        service: 'Concierge Hotel & Luxury Stays Execution Desk',
        provider: 'Human Concierge Stays Desk',
        providerId: 'concierge_stays',
        toolName: 'GenericConciergeTool',
        executionMethod: 'HUMAN_CONCIERGE',
        environment: 'REAL',
        capabilityStatus: 'LIVE_PRODUCTION',
        credentialsConfigured: true,
        credentialsVerified: true,
        actuallyExecutableInProduction: true,
        requiresPayment: true,
        requiresCustomerApproval: true,
        supportsAutomatedExecution: false,
        supportsAssistedExecution: true,
        supportsHumanExecution: true,
        verificationMethod: 'Authentic Hotel CRS Confirmation Code / Property Voucher via Concierge Operator',
        fallbackMethod: 'Senior Concierge Desk',
      },
      // 1. DINING / HERITAGE RESTAURANTS
      {
        capabilityId: 'exec_dining_ahmedabad_verified',
        service: 'Dining & Heritage Reservations',
        provider: 'Ahmedabad Verified Provider Network (Agashiye, The House of MG, Vishalla, Mocha, etc.)',
        providerId: 'ahmedabad_verified',
        toolName: 'AhmedabadVerifiedLiaisonTool',
        executionMethod: 'ASSISTED_CONCIERGE',
        environment: 'REAL',
        capabilityStatus: 'LIVE_PRODUCTION',
        credentialsConfigured: true,
        credentialsVerified: true,
        actuallyExecutableInProduction: true,
        requiresPayment: true,
        requiresCustomerApproval: true,
        supportsAutomatedExecution: false, // Assisted phone coordination
        supportsAssistedExecution: true,
        supportsHumanExecution: true,
        verificationMethod: 'Verified venue reservation record & operator confirmation',
        fallbackMethod: 'Human Concierge Telephone Desk',
        risksOrBlockers: 'Requires venue phone liaison during operating hours; fallback to Concierge Desk is automated.',
      },
      // 2. SWIGGY / DINEOUT
      {
        capabilityId: 'exec_dining_swiggy_dineout',
        service: 'Gourmet Food Delivery & Dining Reservations',
        provider: 'Swiggy / Dineout Enterprise Partner Gateway',
        providerId: 'swiggy_dineout',
        toolName: 'SwiggyExecutionTool',
        executionMethod: 'API',
        environment: hasSwiggyLive ? 'REAL' : 'SANDBOX',
        capabilityStatus: hasSwiggyLive ? 'LIVE_PRODUCTION' : 'NOT_CONFIGURED',
        credentialsConfigured: hasSwiggyLive,
        credentialsVerified: hasSwiggyLive,
        actuallyExecutableInProduction: hasSwiggyLive,
        requiresPayment: true,
        requiresCustomerApproval: true,
        supportsAutomatedExecution: hasSwiggyLive,
        supportsAssistedExecution: true,
        supportsHumanExecution: true,
        verificationMethod: 'Swiggy Order ID / Reservation Confirmation API',
        fallbackMethod: 'Human Concierge Desk',
        risksOrBlockers: hasSwiggyLive ? undefined : 'Live Swiggy enterprise partner credentials not configured. Routes to Concierge.',
      },
      // 3. FLIGHTS & AVIATION
      {
        capabilityId: 'exec_flights_amadeus_gds',
        service: 'Commercial Flights & Aviation Ticketing',
        provider: 'Amadeus GDS / Airline Partner Gateway',
        providerId: 'amadeus_flights',
        toolName: 'AmadeusFlightTool',
        executionMethod: 'API',
        environment: hasAmadeusLive ? 'REAL' : 'SANDBOX',
        capabilityStatus: hasAmadeusLive ? 'LIVE_PRODUCTION' : 'SANDBOX',
        credentialsConfigured: hasAmadeusLive,
        credentialsVerified: hasAmadeusLive,
        actuallyExecutableInProduction: hasAmadeusLive,
        requiresPayment: true,
        requiresCustomerApproval: true,
        supportsAutomatedExecution: hasAmadeusLive,
        supportsAssistedExecution: true,
        supportsHumanExecution: true,
        verificationMethod: 'Authentic 6-character Airline PNR / e-Ticket Number via GDS',
        fallbackMethod: 'Human Concierge Aviation Desk',
        risksOrBlockers: hasAmadeusLive ? undefined : 'Live production IATA ticketing credentials required for automated ticketing. Sandbox mode routes to Concierge.',
      },
      // 4. EVENTS & CULTURAL VIP ACCESS
      {
        capabilityId: 'exec_events_universal_discovery',
        service: 'Universal Event Discovery & VIP Liaison Desk',
        provider: 'Proventa Events Liaison & Premier Venue Desks (NMACC, NCPA, Natarani, etc.)',
        providerId: 'events_discovery',
        toolName: 'UniversalEventsLiaisonTool',
        executionMethod: 'ASSISTED_CONCIERGE',
        environment: 'REAL',
        capabilityStatus: 'LIVE_PRODUCTION',
        credentialsConfigured: true,
        credentialsVerified: true,
        actuallyExecutableInProduction: true,
        requiresPayment: true,
        requiresCustomerApproval: true,
        supportsAutomatedExecution: false,
        supportsAssistedExecution: true,
        supportsHumanExecution: true,
        verificationMethod: 'Direct box office / venue organizer liaison reference',
        fallbackMethod: 'Human Concierge VIP Liaison',
        risksOrBlockers: 'Event ticket availability subject to venue box office release windows.',
      },
      // 5. HEALTHCARE & DOCTOR APPOINTMENTS
      {
        capabilityId: 'exec_healthcare_doctor_discovery',
        service: 'Healthcare & Specialist Doctor Consultation Scheduling',
        provider: 'Hospital OPD Desks & Verified Specialist Clinics (KD Hospital, Apollo, Marengo CIMS, Asian Heart, Fortis, Narayana Health)',
        providerId: 'healthcare_discovery',
        toolName: 'HealthcareCoordinationTool',
        executionMethod: 'ASSISTED_CONCIERGE',
        environment: 'REAL',
        capabilityStatus: 'LIVE_PRODUCTION',
        credentialsConfigured: true,
        credentialsVerified: true,
        actuallyExecutableInProduction: true,
        requiresPayment: false,
        requiresCustomerApproval: true,
        supportsAutomatedExecution: false,
        supportsAssistedExecution: true,
        supportsHumanExecution: true,
        verificationMethod: 'Hospital OPD confirmation / clinic consultation reference',
        fallbackMethod: 'Human Concierge Medical Liaison',
        risksOrBlockers: 'Strictly administrative scheduling. Clinical decisions or emergency symptoms strictly blocked from booking.',
      },
      // 6. CINEMA & LUXURY AUDITORIUMS
      {
        capabilityId: 'exec_cinema_pvr_inox',
        service: 'Cinema Tickets & Luxury Recliner Bookings',
        provider: 'PVR INOX / BookMyShow Cinema Gateway',
        providerId: 'cinema_pvr_inox',
        toolName: 'CinemaExecutionTool',
        executionMethod: 'API',
        environment: hasCinemaLive ? 'REAL' : 'SANDBOX',
        capabilityStatus: hasCinemaLive ? 'LIVE_PRODUCTION' : 'NOT_CONFIGURED',
        credentialsConfigured: hasCinemaLive,
        credentialsVerified: hasCinemaLive,
        actuallyExecutableInProduction: hasCinemaLive,
        requiresPayment: true,
        requiresCustomerApproval: true,
        supportsAutomatedExecution: hasCinemaLive,
        supportsAssistedExecution: true,
        supportsHumanExecution: true,
        verificationMethod: 'Cinema Box Office booking reference & QR pass',
        fallbackMethod: 'Human Concierge Desk',
        risksOrBlockers: hasCinemaLive ? undefined : 'Live BookMyShow/PVR API keys not configured in environment. Routes to Concierge.',
      },
      // 7. COMPOSITE WEEKEND ESCAPES
      {
        capabilityId: 'exec_weekend_escapes_composite',
        service: 'Composite Weekend Escapes (Multi-Component Itineraries)',
        provider: 'Composite Orchestrator (Property + Transport + Dining)',
        providerId: 'composite_weekend_escapes',
        toolName: 'CompositeEscapeTool',
        executionMethod: 'COMPOSITE_ORCHESTRATION',
        environment: 'REAL',
        capabilityStatus: 'LIVE_PRODUCTION',
        credentialsConfigured: true,
        credentialsVerified: true,
        actuallyExecutableInProduction: true,
        requiresPayment: true,
        requiresCustomerApproval: true,
        supportsAutomatedExecution: true,
        supportsAssistedExecution: true,
        supportsHumanExecution: true,
        verificationMethod: 'All constituent components confirmed with authentic references',
        fallbackMethod: 'Human Concierge Desk',
        risksOrBlockers: 'Any unfulfilled mandatory component triggers automated fallback to Concierge.',
      },
      // 8. RESEARCH, ADVISORY & PLANNING (DELIVERABLES)
      {
        capabilityId: 'exec_research_planning_deliverables',
        service: 'Deep Research, Advisory Intelligence & Curated Planning',
        provider: 'Proventa Intelligence & Advisory Engine',
        providerId: 'proventa_intelligence',
        toolName: 'DeliverableFulfillmentTool',
        executionMethod: 'DELIVERABLE_COMPLETION',
        environment: 'REAL',
        capabilityStatus: 'LIVE_PRODUCTION',
        credentialsConfigured: true,
        credentialsVerified: true,
        actuallyExecutableInProduction: true,
        requiresPayment: false,
        requiresCustomerApproval: true,
        supportsAutomatedExecution: true,
        supportsAssistedExecution: true,
        supportsHumanExecution: true,
        verificationMethod: 'Structured verified deliverable content recorded in task preferences',
        fallbackMethod: 'Human Concierge Research Specialist',
        risksOrBlockers: 'None. Deliverables are fully fulfilled by AI intelligence engine upon member approval.',
      },
      // 9. LUXURY HOTELS (MOCK ADAPTER)
      {
        capabilityId: 'exec_hotels_mock',
        service: 'Hotels & Accommodations',
        provider: 'Mock Hotel Adapter',
        providerId: 'mock_hotels',
        toolName: 'MockAdapterTool',
        executionMethod: 'HUMAN_CONCIERGE',
        environment: 'MOCK',
        capabilityStatus: 'MOCK',
        credentialsConfigured: false,
        credentialsVerified: false,
        actuallyExecutableInProduction: false,
        requiresPayment: true,
        requiresCustomerApproval: true,
        supportsAutomatedExecution: false,
        supportsAssistedExecution: false,
        supportsHumanExecution: true,
        verificationMethod: 'Direct property reservation confirmation (via Concierge)',
        fallbackMethod: 'Human Concierge Stays Desk',
        risksOrBlockers: 'Mock adapter. Automated execution strictly blocked; routed to Concierge.',
      },
      // 10. MOBILITY & CHAUFFEUR (MOCK ADAPTER)
      {
        capabilityId: 'exec_mobility_mock',
        service: 'Chauffeur Fleet & Ground Mobility',
        provider: 'Mock Mobility Adapter',
        providerId: 'mock_mobility',
        toolName: 'MockAdapterTool',
        executionMethod: 'HUMAN_CONCIERGE',
        environment: 'MOCK',
        capabilityStatus: 'MOCK',
        credentialsConfigured: false,
        credentialsVerified: false,
        actuallyExecutableInProduction: false,
        requiresPayment: true,
        requiresCustomerApproval: true,
        supportsAutomatedExecution: false,
        supportsAssistedExecution: false,
        supportsHumanExecution: true,
        verificationMethod: 'Direct fleet dispatcher confirmation (via Concierge)',
        fallbackMethod: 'Human Concierge Fleet Desk',
        risksOrBlockers: 'Mock adapter. Automated execution strictly blocked; routed to Concierge.',
      },
      // 11. SHOPPING & GIFTS (MOCK ADAPTER)
      {
        capabilityId: 'exec_shopping_mock',
        service: 'Shopping & Gifting Procurement',
        provider: 'Mock Shopping Adapter',
        providerId: 'mock_shopping',
        toolName: 'MockAdapterTool',
        executionMethod: 'HUMAN_CONCIERGE',
        environment: 'MOCK',
        capabilityStatus: 'MOCK',
        credentialsConfigured: false,
        credentialsVerified: false,
        actuallyExecutableInProduction: false,
        requiresPayment: true,
        requiresCustomerApproval: true,
        supportsAutomatedExecution: false,
        supportsAssistedExecution: false,
        supportsHumanExecution: true,
        verificationMethod: 'Direct merchant order receipt (via Concierge)',
        fallbackMethod: 'Human Concierge Shopping Desk',
        risksOrBlockers: 'Mock adapter. Automated execution strictly blocked; routed to Concierge.',
      },
      // 12. RAZORPAY PAYMENT GATEWAY
      {
        capabilityId: 'exec_payment_razorpay',
        service: 'Payment Processing & UPI Autopay Mandates',
        provider: 'Razorpay Payment Gateway',
        providerId: 'razorpay_gateway',
        toolName: 'RazorpayPaymentTool',
        executionMethod: 'API',
        environment: hasRazorpayLive ? 'REAL' : 'SANDBOX',
        capabilityStatus: hasRazorpayLive ? 'LIVE_PRODUCTION' : 'SANDBOX',
        credentialsConfigured: hasRazorpayLive,
        credentialsVerified: hasRazorpayLive,
        actuallyExecutableInProduction: hasRazorpayLive,
        requiresPayment: false,
        requiresCustomerApproval: false,
        supportsAutomatedExecution: true,
        supportsAssistedExecution: true,
        supportsHumanExecution: true,
        verificationMethod: 'Razorpay Payment ID (`pay_...`) & Order ID (`order_...`) verification',
        fallbackMethod: 'Payment Link / Bank Transfer',
        risksOrBlockers: undefined,
      },
    ];

    for (const cap of matrix) {
      this.capabilities.set(cap.providerId, cap);
      this.capabilities.set(cap.capabilityId, cap);
    }

    this.initialized = true;
  }

  static reinitialize() {
    this.capabilities.clear();
    this.initialized = false;
    this.init();
  }

  static getCapability(providerId: string): ExecutionCapability | undefined {
    this.init();
    return this.capabilities.get(providerId);
  }

  static getCapabilityForService(serviceCategory: string, providerId?: string): ExecutionCapability | undefined {
    this.init();
    if (providerId && this.capabilities.has(providerId)) {
      return this.capabilities.get(providerId);
    }

    const cat = serviceCategory.toLowerCase();
    for (const cap of this.capabilities.values()) {
      if (cap.service.toLowerCase().includes(cat) || cap.providerId.includes(cat)) {
        return cap;
      }
    }
    return undefined;
  }

  static getAllCapabilities(): ExecutionCapability[] {
    this.init();
    const seen = new Set<string>();
    const result: ExecutionCapability[] = [];
    for (const cap of this.capabilities.values()) {
      if (!seen.has(cap.capabilityId)) {
        seen.add(cap.capabilityId);
        result.push(cap);
      }
    }
    return result;
  }

  static isLiveProduction(providerId: string): boolean {
    const cap = this.getCapability(providerId);
    return cap?.capabilityStatus === 'LIVE_PRODUCTION';
  }

  static isAutomatedExecutionAllowed(providerId: string): boolean {
    const cap = this.getCapability(providerId);
    if (!cap) return false;
    return cap.capabilityStatus === 'LIVE_PRODUCTION' && cap.supportsAutomatedExecution;
  }
}
