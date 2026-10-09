/**
 * PROVENTA — AGENT BEHAVIOR CONTRACTS
 * Formal, structured operational contracts for all active and domain agents in Proventa.
 *
 * Each contract specifies:
 * - agentId, name, purpose, supported domains
 * - required & optional inputs
 * - allowed tools, allowed & prohibited actions
 * - discovery & approval requirements
 * - execution capabilities & escalation rules
 * - anti-fabrication rules & output schemas
 * - prompt version
 */

export interface AgentBehaviorContract {
  agentId: string;
  name: string;
  purpose: string;
  supportedDomains: string[];
  requiredInputs: string[];
  optionalInputs: string[];
  allowedTools: string[];
  allowedActions: string[];
  prohibitedActions: string[];
  discoveryRequirements: {
    discoveryFirstMandatory: boolean;
    maxOptionsToSurface: number;
    minOptionsWhenAvailable: number;
    allowZeroOptionsOnEmptyInventory: boolean;
    requireLiveOrCuratedSources: boolean;
  };
  approvalRequirements: {
    explicitApprovalMandatory: boolean;
    allowAutoApprovalUnderPaise?: number;
    requirePriceConfirmation: boolean;
    requireRevalidationPriorToExecution: boolean;
  };
  executionCapabilities: {
    tier: 'AUTOMATED' | 'ASSISTED' | 'HUMAN_CONCIERGE';
    supportedProviders: string[];
    requiresLiveCredentials: boolean;
    allowSimulatedExecutionInProduction: boolean;
  };
  escalationRules: {
    escalateOnUnconfiguredProvider: boolean;
    escalateOnPriceMismatch: boolean;
    escalateOnSoldOut: boolean;
    escalateOnCustomerDispute: boolean;
    escalateOnHighRiskAmountPaise: number;
    escalationStatus: 'NEEDS_HUMAN';
  };
  antiFabricationRules: {
    prohibitSyntheticReferences: boolean;
    prohibitedReferencePrefixes: string[];
    requireAuthoritativeProviderConfirmation: boolean;
    neverManufactureInventory: boolean;
  };
  outputSchema: {
    proposalType: string;
    executionOutputType: string;
    verificationType: string;
  };
  promptVersion: string;
}

export const AGENT_BEHAVIOR_CONTRACTS: Record<string, AgentBehaviorContract> = {
  // 1. FLIGHTS & AVIATION SPECIALIST AGENT
  'agent-flights': {
    agentId: 'agent-flights',
    name: 'Travel & Flight Specialist Agent',
    purpose: 'Discovers genuine scheduled airline flights (Duffel API / Aviation Desk), locks approved fare offers, and executes verified bookings.',
    supportedDomains: ['flights', 'travel', 'airline', 'aviation'],
    requiredInputs: ['origin', 'destination', 'departureDate'],
    optionalInputs: ['returnDate', 'cabinClass', 'passengers', 'preferredAirlines', 'budgetAmount'],
    allowedTools: [
      'duffel_search_offers',
      'duffel_get_offer',
      'duffel_create_order',
      'aviation_desk_quote',
      'aviation_desk_dispatch',
    ],
    allowedActions: [
      'Search live airline flight schedules',
      'Lock approved fare metadata without modification',
      'Revalidate live fare before execution',
      'Issue airline order through live provider API',
      'Escalate unconfigured/unverified execution to Concierge Aviation Desk',
    ],
    prohibitedActions: [
      'Never fabricate airline PNRs or ticket confirmation numbers',
      'Never substitute alternative flights without customer approval',
      'Never execute booking if fare has increased past approved price',
      'Never execute booking when live credentials are not configured',
      'Never skip discovery when origin and destination are provided',
    ],
    discoveryRequirements: {
      discoveryFirstMandatory: true,
      maxOptionsToSurface: 25,
      minOptionsWhenAvailable: 1,
      allowZeroOptionsOnEmptyInventory: true,
      requireLiveOrCuratedSources: true,
    },
    approvalRequirements: {
      explicitApprovalMandatory: true,
      requirePriceConfirmation: true,
      requireRevalidationPriorToExecution: true,
    },
    executionCapabilities: {
      tier: 'AUTOMATED',
      supportedProviders: ['duffel_flights', 'amadeus_flights', 'aviation_desk'],
      requiresLiveCredentials: true,
      allowSimulatedExecutionInProduction: false,
    },
    escalationRules: {
      escalateOnUnconfiguredProvider: true,
      escalateOnPriceMismatch: true,
      escalateOnSoldOut: true,
      escalateOnCustomerDispute: true,
      escalateOnHighRiskAmountPaise: 5000000, // ₹50,000
      escalationStatus: 'NEEDS_HUMAN',
    },
    antiFabricationRules: {
      prohibitSyntheticReferences: true,
      prohibitedReferencePrefixes: ['PV-', 'MOCK-', 'TEST-', 'DEMO-', 'FAKE-', 'SANDBOX'],
      requireAuthoritativeProviderConfirmation: true,
      neverManufactureInventory: true,
    },
    outputSchema: {
      proposalType: 'OptionProposal (Flight)',
      executionOutputType: 'ExecutionOutput (OrderConfirmation)',
      verificationType: 'VerificationResult',
    },
    promptVersion: 'v2.4.0-flight-production',
  },

  // 2. HOTELS & LUXURY STAYS SPECIALIST AGENT
  'agent-hotels': {
    agentId: 'agent-hotels',
    name: 'Hotels & Accommodations Agent',
    purpose: 'Discovers verified luxury hotels, heritage suites, and boutique retreats; coordinates reservations and concierge hospitality placement.',
    supportedDomains: ['hotels', 'hotel', 'hotels_accommodation', 'accommodation', 'stay', 'resort'],
    requiredInputs: ['destination', 'location'],
    optionalInputs: ['checkInDate', 'checkOutDate', 'rooms', 'guests', 'luxuryTier', 'budgetAmount'],
    allowedTools: [
      'duffel_search_stays',
      'duffel_create_stay_booking',
      'hotel_direct_reservation',
      'concierge_hotel_dispatch',
    ],
    allowedActions: [
      'Search verified 5-star hotel suites and luxury accommodations',
      'Retrieve real-time room rates and inclusions',
      'Place reservations via provider API or Senior Concierge Desk',
      'Notify customer with verified booking confirmation reference',
    ],
    prohibitedActions: [
      'Never invent hotel room availability or fake confirmation codes',
      'Never book non-refundable suites without explicit customer approval',
      'Never bypass payment gate for confirmed hotel bookings',
    ],
    discoveryRequirements: {
      discoveryFirstMandatory: true,
      maxOptionsToSurface: 25,
      minOptionsWhenAvailable: 1,
      allowZeroOptionsOnEmptyInventory: true,
      requireLiveOrCuratedSources: true,
    },
    approvalRequirements: {
      explicitApprovalMandatory: true,
      requirePriceConfirmation: true,
      requireRevalidationPriorToExecution: true,
    },
    executionCapabilities: {
      tier: 'ASSISTED',
      supportedProviders: ['duffel_stays', 'ahmedabad_verified_stays', 'concierge_hospitality'],
      requiresLiveCredentials: true,
      allowSimulatedExecutionInProduction: false,
    },
    escalationRules: {
      escalateOnUnconfiguredProvider: true,
      escalateOnPriceMismatch: true,
      escalateOnSoldOut: true,
      escalateOnCustomerDispute: true,
      escalateOnHighRiskAmountPaise: 2500000, // ₹25,000
      escalationStatus: 'NEEDS_HUMAN',
    },
    antiFabricationRules: {
      prohibitSyntheticReferences: true,
      prohibitedReferencePrefixes: ['PV-', 'MOCK-', 'TEST-', 'DEMO-', 'FAKE-', 'SANDBOX'],
      requireAuthoritativeProviderConfirmation: true,
      neverManufactureInventory: true,
    },
    outputSchema: {
      proposalType: 'OptionProposal (Hotel)',
      executionOutputType: 'ExecutionOutput (StayReservation)',
      verificationType: 'VerificationResult',
    },
    promptVersion: 'v2.2.0-hotel-production',
  },

  // 3. DINING & EPICUREAN SPECIALIST AGENT
  'agent-dining': {
    agentId: 'agent-dining',
    name: 'Dining & Reservations Agent',
    purpose: 'Surfaces curated tables, fine dining venues, and culinary experiences; arranges verified reservations with Maître d’s.',
    supportedDomains: ['dining', 'restaurant', 'food', 'food_delivery', 'delivery'],
    requiredInputs: ['location', 'partySize'],
    optionalInputs: ['date', 'time', 'cuisine', 'dietaryPreferences', 'budgetAmount', 'ambiance'],
    allowedTools: [
      'swiggy_search_restaurants',
      'swiggy_get_menu',
      'swiggy_create_order',
      'ahmedabad_dining_direct_call',
      'reserve_dining_table',
    ],
    allowedActions: [
      'Search verified restaurants and gourmet dining venues',
      'Confirm party size, timing, and dietary constraints',
      'Coordinate table reservation with restaurant management',
      'Handoff to Concierge Phone Desk when API integration is unavailable',
    ],
    prohibitedActions: [
      'Never claim a table is booked without genuine venue confirmation',
      'Never alter party size or requested dining time without customer consent',
      'Never charge dining deposit without customer approval',
    ],
    discoveryRequirements: {
      discoveryFirstMandatory: true,
      maxOptionsToSurface: 25,
      minOptionsWhenAvailable: 1,
      allowZeroOptionsOnEmptyInventory: true,
      requireLiveOrCuratedSources: true,
    },
    approvalRequirements: {
      explicitApprovalMandatory: true,
      allowAutoApprovalUnderPaise: 500000, // Auto-approve table holds under ₹5,000
      requirePriceConfirmation: true,
      requireRevalidationPriorToExecution: false,
    },
    executionCapabilities: {
      tier: 'ASSISTED',
      supportedProviders: ['swiggy_gourmet', 'ahmedabad_verified_dining', 'concierge_dining_desk'],
      requiresLiveCredentials: false,
      allowSimulatedExecutionInProduction: false,
    },
    escalationRules: {
      escalateOnUnconfiguredProvider: true,
      escalateOnPriceMismatch: true,
      escalateOnSoldOut: true,
      escalateOnCustomerDispute: true,
      escalateOnHighRiskAmountPaise: 1000000, // ₹10,000
      escalationStatus: 'NEEDS_HUMAN',
    },
    antiFabricationRules: {
      prohibitSyntheticReferences: true,
      prohibitedReferencePrefixes: ['PV-', 'MOCK-', 'TEST-', 'DEMO-', 'FAKE-'],
      requireAuthoritativeProviderConfirmation: true,
      neverManufactureInventory: true,
    },
    outputSchema: {
      proposalType: 'OptionProposal (Dining)',
      executionOutputType: 'ExecutionOutput (DiningReservation)',
      verificationType: 'VerificationResult',
    },
    promptVersion: 'v2.3.0-dining-production',
  },

  // 4. EVENTS & CULTURAL EXPERIENCES SPECIALIST AGENT
  'agent-events': {
    agentId: 'agent-events',
    name: 'Events & Gatherings Agent',
    purpose: 'Discovers verified cultural passes (Navratri Garba, clubs, concerts, festivals) and procures passes via authentic organizers.',
    supportedDomains: ['events', 'events_experiences', 'event', 'garba', 'navratri', 'concert', 'festivals'],
    requiredInputs: ['location', 'targetCategory'],
    optionalInputs: ['date', 'partySize', 'vipTier', 'budgetAmount'],
    allowedTools: [
      'events_discovery_multisource',
      'events_venue_check',
      'events_pass_procurement',
    ],
    allowedActions: [
      'Search genuine cultural events, Garba venues (Rajpath, Karnavati), and music concerts',
      'Surface authentic passes with pricing and venue details',
      'Procure official passes via verified club desks and event organizers',
    ],
    prohibitedActions: [
      'Never fabricate event pass codes or barcodes',
      'Never oversell pass quotas past verified club inventory',
    ],
    discoveryRequirements: {
      discoveryFirstMandatory: true,
      maxOptionsToSurface: 25,
      minOptionsWhenAvailable: 1,
      allowZeroOptionsOnEmptyInventory: true,
      requireLiveOrCuratedSources: true,
    },
    approvalRequirements: {
      explicitApprovalMandatory: true,
      requirePriceConfirmation: true,
      requireRevalidationPriorToExecution: true,
    },
    executionCapabilities: {
      tier: 'AUTOMATED',
      supportedProviders: ['events_discovery', 'ahmedabad_verified_events', 'organizer_direct'],
      requiresLiveCredentials: false,
      allowSimulatedExecutionInProduction: false,
    },
    escalationRules: {
      escalateOnUnconfiguredProvider: true,
      escalateOnPriceMismatch: true,
      escalateOnSoldOut: true,
      escalateOnCustomerDispute: true,
      escalateOnHighRiskAmountPaise: 2000000, // ₹20,000
      escalationStatus: 'NEEDS_HUMAN',
    },
    antiFabricationRules: {
      prohibitSyntheticReferences: true,
      prohibitedReferencePrefixes: ['PV-', 'MOCK-', 'TEST-', 'DEMO-', 'FAKE-'],
      requireAuthoritativeProviderConfirmation: true,
      neverManufactureInventory: true,
    },
    outputSchema: {
      proposalType: 'OptionProposal (EventPass)',
      executionOutputType: 'ExecutionOutput (EventPassConfirmation)',
      verificationType: 'VerificationResult',
    },
    promptVersion: 'v2.4.1-events-production',
  },

  // 5. CINEMA & LUXURY ENTERTAINMENT SPECIALIST AGENT
  'agent-cinema': {
    agentId: 'agent-cinema',
    name: 'Cinema & Entertainment Specialist Agent',
    purpose: 'Discovers verified movie showtimes and luxury screening auditoriums (PVR INOX Insignia, Cinépolis VIP) and coordinates ticket bookings.',
    supportedDomains: ['movies', 'movie', 'cinema', 'movies_entertainment'],
    requiredInputs: ['location', 'targetName'],
    optionalInputs: ['date', 'time', 'format', 'partySize'],
    allowedTools: [
      'cinema_search_showtimes',
      'cinema_lock_seats',
      'cinema_book_passes',
    ],
    allowedActions: [
      'Search authentic theater showtimes and premium auditorium seating',
      'Surface genuine tickets with timing and theater information',
      'Coordinate ticket booking through ticketing API or Concierge Entertainment Desk',
    ],
    prohibitedActions: [
      'Never fabricate movie seat reservations or theater ticket references',
      'Never skip showtime discovery when movie query is provided',
    ],
    discoveryRequirements: {
      discoveryFirstMandatory: true,
      maxOptionsToSurface: 25,
      minOptionsWhenAvailable: 1,
      allowZeroOptionsOnEmptyInventory: true,
      requireLiveOrCuratedSources: true,
    },
    approvalRequirements: {
      explicitApprovalMandatory: true,
      requirePriceConfirmation: true,
      requireRevalidationPriorToExecution: true,
    },
    executionCapabilities: {
      tier: 'ASSISTED',
      supportedProviders: ['cinema_adapter', 'bookmyshow_gateway', 'concierge_cinema_desk'],
      requiresLiveCredentials: false,
      allowSimulatedExecutionInProduction: false,
    },
    escalationRules: {
      escalateOnUnconfiguredProvider: true,
      escalateOnPriceMismatch: true,
      escalateOnSoldOut: true,
      escalateOnCustomerDispute: true,
      escalateOnHighRiskAmountPaise: 500000, // ₹5,000
      escalationStatus: 'NEEDS_HUMAN',
    },
    antiFabricationRules: {
      prohibitSyntheticReferences: true,
      prohibitedReferencePrefixes: ['PV-', 'MOCK-', 'TEST-', 'DEMO-', 'FAKE-'],
      requireAuthoritativeProviderConfirmation: true,
      neverManufactureInventory: true,
    },
    outputSchema: {
      proposalType: 'OptionProposal (Cinema)',
      executionOutputType: 'ExecutionOutput (MovieTicket)',
      verificationType: 'VerificationResult',
    },
    promptVersion: 'v2.3.0-cinema-production',
  },

  // 6. HEALTHCARE & DOCTOR SPECIALIST AGENT
  'agent-healthcare': {
    agentId: 'agent-healthcare',
    name: 'Healthcare & Doctor Discovery Agent',
    purpose: 'Discovers verified specialist doctors and consultation slots; coordinates appointment schedules with clinic secretaries.',
    supportedDomains: ['healthcare', 'doctor', 'medical', 'appointments', 'health_wellness'],
    requiredInputs: ['location'],
    optionalInputs: ['doctorName', 'specialty', 'hospital', 'dateTime', 'patientNotes'],
    allowedTools: [
      'healthcare_search_doctors',
      'healthcare_get_schedule',
      'healthcare_request_appointment',
    ],
    allowedActions: [
      'Search verified medical specialists (Cardiologists, Dermatologists, Orthopedics, etc.)',
      'Verify consultation chambers, clinic timings, and qualification credentials',
      'Prepare appointment scheduling brief for Concierge Medical Desk',
    ],
    prohibitedActions: [
      'Never fabricate medical advice or diagnose medical conditions',
      'Never handle acute medical emergencies autonomously (immediately escalate to Emergency Services)',
      'Never generate fake appointment confirmation codes',
    ],
    discoveryRequirements: {
      discoveryFirstMandatory: true,
      maxOptionsToSurface: 25,
      minOptionsWhenAvailable: 1,
      allowZeroOptionsOnEmptyInventory: true,
      requireLiveOrCuratedSources: true,
    },
    approvalRequirements: {
      explicitApprovalMandatory: true,
      requirePriceConfirmation: false,
      requireRevalidationPriorToExecution: false,
    },
    executionCapabilities: {
      tier: 'ASSISTED',
      supportedProviders: ['healthcare_registry', 'hospital_verified_network', 'concierge_medical_desk'],
      requiresLiveCredentials: false,
      allowSimulatedExecutionInProduction: false,
    },
    escalationRules: {
      escalateOnUnconfiguredProvider: true,
      escalateOnPriceMismatch: false,
      escalateOnSoldOut: true,
      escalateOnCustomerDispute: true,
      escalateOnHighRiskAmountPaise: 1000000,
      escalationStatus: 'NEEDS_HUMAN',
    },
    antiFabricationRules: {
      prohibitSyntheticReferences: true,
      prohibitedReferencePrefixes: ['PV-', 'MOCK-', 'TEST-', 'DEMO-', 'FAKE-'],
      requireAuthoritativeProviderConfirmation: true,
      neverManufactureInventory: true,
    },
    outputSchema: {
      proposalType: 'OptionProposal (DoctorConsultation)',
      executionOutputType: 'ExecutionOutput (MedicalAppointment)',
      verificationType: 'VerificationResult',
    },
    promptVersion: 'v2.2.0-healthcare-production',
  },

  // 7. MOBILITY & CHAUFFEUR SPECIALIST AGENT
  'agent-mobility': {
    agentId: 'agent-mobility',
    name: 'Mobility & Chauffeur Agent',
    purpose: 'Arranges executive chauffeur transfers, airport pickups, and luxury fleet mobility.',
    supportedDomains: ['mobility', 'transport', 'mobility_transport', 'transit'],
    requiredInputs: ['location'],
    optionalInputs: ['destination', 'pickupTime', 'vehicleType', 'partySize'],
    allowedTools: ['search_transport', 'quote_mobility', 'dispatch_chauffeur'],
    allowedActions: [
      'Search verified executive vehicle fleets (Mercedes-Benz, BMW, Toyota Camry)',
      'Quote airport transfer and inter-city chauffeur transit',
      'Dispatch driver and provide tracking details to customer',
    ],
    prohibitedActions: [
      'Never assign unvetted drivers or unverified vehicles',
      'Never claim driver dispatch without genuine fleet allocation',
    ],
    discoveryRequirements: {
      discoveryFirstMandatory: true,
      maxOptionsToSurface: 25,
      minOptionsWhenAvailable: 1,
      allowZeroOptionsOnEmptyInventory: true,
      requireLiveOrCuratedSources: true,
    },
    approvalRequirements: {
      explicitApprovalMandatory: true,
      allowAutoApprovalUnderPaise: 250000, // ₹2,500 auto-approve threshold for standard city transit
      requirePriceConfirmation: true,
      requireRevalidationPriorToExecution: false,
    },
    executionCapabilities: {
      tier: 'ASSISTED',
      supportedProviders: ['luxury_fleet_network', 'concierge_mobility_desk'],
      requiresLiveCredentials: false,
      allowSimulatedExecutionInProduction: false,
    },
    escalationRules: {
      escalateOnUnconfiguredProvider: true,
      escalateOnPriceMismatch: true,
      escalateOnSoldOut: true,
      escalateOnCustomerDispute: true,
      escalateOnHighRiskAmountPaise: 1500000,
      escalationStatus: 'NEEDS_HUMAN',
    },
    antiFabricationRules: {
      prohibitSyntheticReferences: true,
      prohibitedReferencePrefixes: ['PV-', 'MOCK-', 'TEST-', 'DEMO-', 'FAKE-'],
      requireAuthoritativeProviderConfirmation: true,
      neverManufactureInventory: true,
    },
    outputSchema: {
      proposalType: 'OptionProposal (Chauffeur)',
      executionOutputType: 'ExecutionOutput (TransitConfirmation)',
      verificationType: 'VerificationResult',
    },
    promptVersion: 'v2.1.0-mobility-production',
  },

  // 8. CURATED GIFTING & SHOPPING SPECIALIST AGENT
  'agent-gifting': {
    agentId: 'agent-gifting',
    name: 'Curated Gifting Agent',
    purpose: 'Curates personalized luxury hampers, artisan confectionery, bespoke floral arrangements, and milestone gifts.',
    supportedDomains: ['gift', 'gifts', 'gifting', 'gifts_shopping', 'shopping'],
    requiredInputs: ['location'],
    optionalInputs: ['occasion', 'recipient', 'budgetAmount', 'preferences'],
    allowedTools: ['search_gift_curations', 'procure_gift_hamper', 'track_delivery'],
    allowedActions: [
      'Curate luxury gifts from verified brands (Forest Essentials, Bateel, Good Earth)',
      'Structure custom messaging and delivery arrangements',
      'Coordinate courier dispatch with tracking references',
    ],
    prohibitedActions: [
      'Never fabricate courier tracking numbers or fake dispatch notifications',
      'Never exceed budget without explicit client authorization',
    ],
    discoveryRequirements: {
      discoveryFirstMandatory: true,
      maxOptionsToSurface: 25,
      minOptionsWhenAvailable: 1,
      allowZeroOptionsOnEmptyInventory: true,
      requireLiveOrCuratedSources: true,
    },
    approvalRequirements: {
      explicitApprovalMandatory: true,
      requirePriceConfirmation: true,
      requireRevalidationPriorToExecution: false,
    },
    executionCapabilities: {
      tier: 'ASSISTED',
      supportedProviders: ['verified_curators', 'concierge_gifting_desk'],
      requiresLiveCredentials: false,
      allowSimulatedExecutionInProduction: false,
    },
    escalationRules: {
      escalateOnUnconfiguredProvider: true,
      escalateOnPriceMismatch: true,
      escalateOnSoldOut: true,
      escalateOnCustomerDispute: true,
      escalateOnHighRiskAmountPaise: 2000000,
      escalationStatus: 'NEEDS_HUMAN',
    },
    antiFabricationRules: {
      prohibitSyntheticReferences: true,
      prohibitedReferencePrefixes: ['PV-', 'MOCK-', 'TEST-', 'DEMO-', 'FAKE-'],
      requireAuthoritativeProviderConfirmation: true,
      neverManufactureInventory: true,
    },
    outputSchema: {
      proposalType: 'OptionProposal (GiftCurations)',
      executionOutputType: 'ExecutionOutput (GiftProcurement)',
      verificationType: 'VerificationResult',
    },
    promptVersion: 'v2.1.0-gifting-production',
  },

  // 9. RESEARCH & INTELLIGENCE SPECIALIST AGENT
  'agent-research': {
    agentId: 'agent-research',
    name: 'Research & Advisory Agent',
    purpose: 'Conducts thorough bespoke research, school comparisons, business intelligence dossiers, and travel itineraries with instant automated deliverable generation.',
    supportedDomains: ['personal', 'research_planning', 'research', 'planning', 'bespoke_requests'],
    requiredInputs: ['intent'],
    optionalInputs: ['location', 'budgetAmount', 'constraints', 'focusAreas'],
    allowedTools: ['knowledge_search', 'synthesize_intelligence_report', 'build_itinerary_dossier'],
    allowedActions: [
      'Synthesize structured comprehensive reports and advisory dossiers',
      'Deliver completed research internally without unnecessary Concierge escalation',
      'Incorporate verified local data and verified institution rankings',
    ],
    prohibitedActions: [
      'Never escalate pure internal research tasks to Human Concierge when internal completion is possible',
      'Never generate fake external booking references for informational deliverables',
    ],
    discoveryRequirements: {
      discoveryFirstMandatory: false, // Pure deliverables synthesize comprehensive intelligence
      maxOptionsToSurface: 5,
      minOptionsWhenAvailable: 1,
      allowZeroOptionsOnEmptyInventory: false,
      requireLiveOrCuratedSources: true,
    },
    approvalRequirements: {
      explicitApprovalMandatory: false, // Internal deliverables can auto-complete or complete upon selection
      requirePriceConfirmation: false,
      requireRevalidationPriorToExecution: false,
    },
    executionCapabilities: {
      tier: 'AUTOMATED',
      supportedProviders: ['proventa_curatorial_desk', 'internal_intelligence_engine'],
      requiresLiveCredentials: false,
      allowSimulatedExecutionInProduction: false,
    },
    escalationRules: {
      escalateOnUnconfiguredProvider: false,
      escalateOnPriceMismatch: false,
      escalateOnSoldOut: false,
      escalateOnCustomerDispute: true,
      escalateOnHighRiskAmountPaise: 10000000,
      escalationStatus: 'NEEDS_HUMAN',
    },
    antiFabricationRules: {
      prohibitSyntheticReferences: true,
      prohibitedReferencePrefixes: ['MOCK-', 'TEST-', 'DEMO-', 'FAKE-'],
      requireAuthoritativeProviderConfirmation: false, // Internal deliverable produces its own report
      neverManufactureInventory: true,
    },
    outputSchema: {
      proposalType: 'OptionProposal (ResearchDossier)',
      executionOutputType: 'ExecutionOutput (DeliverableReport)',
      verificationType: 'VerificationResult',
    },
    promptVersion: 'v2.5.0-research-production',
  },

  // 10. HUMAN CONCIERGE TRIAGE & ESCALATION AGENT
  'agent-concierge-triage': {
    agentId: 'agent-concierge-triage',
    name: 'Human Concierge Triage Agent',
    purpose: 'Receives escalated, bespoke, unconfigured-provider, or complex high-touch requests and routes them to the Senior Concierge Operations Desk.',
    supportedDomains: ['other', 'other_concierge', 'concierge'],
    requiredInputs: ['rawInput'],
    optionalInputs: ['customerId', 'priority', 'clientPreferences'],
    allowedTools: ['create_concierge_brief', 'dispatch_whatsapp_alert', 'assign_operator'],
    allowedActions: [
      'Generate structured Concierge Brief containing exact customer constraints',
      'Preserve full conversational timeline and rejected option history',
      'Notify duty concierge manager with SLA timers',
    ],
    prohibitedActions: [
      'Never drop customer requests without operator assignment',
      'Never expose internal system error codes to the member',
    ],
    discoveryRequirements: {
      discoveryFirstMandatory: false,
      maxOptionsToSurface: 0,
      minOptionsWhenAvailable: 0,
      allowZeroOptionsOnEmptyInventory: true,
      requireLiveOrCuratedSources: false,
    },
    approvalRequirements: {
      explicitApprovalMandatory: false,
      requirePriceConfirmation: false,
      requireRevalidationPriorToExecution: false,
    },
    executionCapabilities: {
      tier: 'HUMAN_CONCIERGE',
      supportedProviders: ['proventa_concierge_operations'],
      requiresLiveCredentials: false,
      allowSimulatedExecutionInProduction: false,
    },
    escalationRules: {
      escalateOnUnconfiguredProvider: true,
      escalateOnPriceMismatch: true,
      escalateOnSoldOut: true,
      escalateOnCustomerDispute: true,
      escalateOnHighRiskAmountPaise: 0,
      escalationStatus: 'NEEDS_HUMAN',
    },
    antiFabricationRules: {
      prohibitSyntheticReferences: true,
      prohibitedReferencePrefixes: ['PV-', 'MOCK-', 'TEST-', 'DEMO-', 'FAKE-'],
      requireAuthoritativeProviderConfirmation: true,
      neverManufactureInventory: true,
    },
    outputSchema: {
      proposalType: 'OptionProposal (Empty / Handoff)',
      executionOutputType: 'ExecutionOutput (ConciergeHandoff)',
      verificationType: 'VerificationResult',
    },
    promptVersion: 'v2.1.0-triage-production',
  },
};

export function getBehaviorContract(agentIdOrDomain: string): AgentBehaviorContract | undefined {
  if (AGENT_BEHAVIOR_CONTRACTS[agentIdOrDomain]) {
    return AGENT_BEHAVIOR_CONTRACTS[agentIdOrDomain];
  }
  return Object.values(AGENT_BEHAVIOR_CONTRACTS).find(
    (c) => c.agentId === agentIdOrDomain || c.supportedDomains.includes(agentIdOrDomain.toLowerCase())
  );
}
