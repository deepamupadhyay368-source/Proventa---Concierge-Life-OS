/**
 * Comprehensive Few-Shot Exemplars for Training Autonomous Proventa Agents.
 * Each exemplar demonstrates:
 * 1. Intent extraction & constraint resolution
 * 2. Client preference integration (dietary, seating, budget)
 * 3. Exact tool selection and structured arguments
 * 4. Risk tier & approval evaluation
 * 5. Safe escalation boundaries
 */

export interface AgentTrainingExemplar {
  category: string;
  userPrompt: string;
  clientContext: {
    explicitPreferences: Record<string, any>;
    pastBookings?: string[];
  };
  reasoning: string;
  selectedTool: string;
  toolArguments: Record<string, any>;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  needsApproval: boolean;
}

export const AGENT_TRAINING_EXEMPLARS: AgentTrainingExemplar[] = [
  // 1. DINING
  {
    category: 'dining',
    userPrompt: 'Reserve a table for four tomorrow at 8 PM, somewhere quiet with great vegetarian options.',
    clientContext: {
      explicitPreferences: { dietary: 'Strict Vegetarian', ambience: 'Quiet Corner' },
      pastBookings: ['Agashiye — The House of MG'],
    },
    reasoning: 'Client requires quiet vegetarian fine dining for 4 guests in Ahmedabad tomorrow at 8 PM. Agashiye rooftop terrace is their preferred venue with verified authentic Gujarati cuisine.',
    selectedTool: 'reserveDining',
    toolArguments: {
      proposal: {
        providerName: 'Agashiye - The House of MG',
        title: 'Heritage Rooftop Dining — Priority Table',
      },
      partySize: 4,
      dateTime: 'Tomorrow 8:00 PM',
      specialRequests: 'Quiet corner table, 4 pure vegetarian Gujarati thali covers.',
    },
    riskLevel: 'MEDIUM',
    needsApproval: false, // Under ₹5,000 auto-approval threshold
  },
  {
    category: 'dining',
    userPrompt: 'Book an Italian dinner for two at Tinello Hyatt Regency tonight at 8:30 PM.',
    clientContext: {
      explicitPreferences: { cuisine: 'Italian', wine: 'Non-alcoholic' },
    },
    reasoning: 'Client specified Tinello at Hyatt Regency for 2 guests at 8:30 PM tonight. Needs prime riverfront table.',
    selectedTool: 'reserveDining',
    toolArguments: {
      proposal: {
        providerName: 'Tinello — Hyatt Regency',
        title: 'Artisanal Italian Fine Dining Table',
      },
      partySize: 2,
      dateTime: 'Tonight 8:30 PM',
      specialRequests: 'Mezzanine riverfront view table requested.',
    },
    riskLevel: 'MEDIUM',
    needsApproval: false,
  },

  // 2. TRAVEL & STAYS
  {
    category: 'travel',
    userPrompt: 'Book a luxury club suite at ITC Narmada for this coming weekend for 2 nights.',
    clientContext: {
      explicitPreferences: { hotelTier: '5-Star Luxury', roomType: 'High Floor Suite' },
    },
    reasoning: 'High-value accommodation request at ITC Narmada. All hotel bookings mandate explicit client review and pre-authorization before payment commitment.',
    selectedTool: 'reserveHotel',
    toolArguments: {
      proposal: {
        providerName: 'ITC Narmada, a Luxury Collection Hotel',
        title: 'Executive Club Suite — Bodakdev',
      },
      guestName: 'Proventa VIP Member',
      dates: 'Upcoming Weekend (2 Nights)',
      specialRequests: 'High floor, quiet wing, breakfast and club lounge access included.',
    },
    riskLevel: 'HIGH',
    needsApproval: true, // Hotel bookings always require approval
  },

  // 3. MOBILITY & TRANSIT
  {
    category: 'mobility',
    userPrompt: 'Arrange an executive Mercedes pickup from SVPIA Terminal 2 tomorrow arriving at 9:15 PM to Bodakdev.',
    clientContext: {
      explicitPreferences: { vehicleClass: 'Mercedes-Benz E-Class or equivalent', baggageAssist: true },
    },
    reasoning: 'Airport transfer from Ahmedabad SVPIA to Bodakdev. Standard executive chauffeur cost falls under ₹2,500 auto-approval limit.',
    selectedTool: 'dispatchChauffeur',
    toolArguments: {
      proposal: {
        providerName: 'SVPIA Luxury Chauffeur Fleet',
        title: 'Executive Mercedes-Benz Transfer',
      },
      pickupLocation: 'SVPIA Terminal 2 Arrival Gate (Flight tracking enabled)',
      dropoffLocation: 'Bodakdev, Ahmedabad',
      pickupTime: 'Tomorrow 9:15 PM',
    },
    riskLevel: 'MEDIUM',
    needsApproval: false,
  },

  // 4. SHOPPING & BESPOKE GIFTING
  {
    category: 'shopping',
    userPrompt: 'Source a handwoven heritage Ashavali silk dupatta from Asopalav under ₹8,000 delivered to my office.',
    clientContext: {
      explicitPreferences: { deliveryLocation: 'Sindhu Bhavan Road Office' },
    },
    reasoning: 'Acquisition of authentic handwoven luxury silk within stated ₹8,000 budget. Sourcing requires client preview and approval.',
    selectedTool: 'purchaseProduct',
    toolArguments: {
      proposal: {
        providerName: 'Asopalav Heritage Couture',
        title: 'Handcrafted Heritage Ashavali Silk Dupatta',
      },
      deliveryAddress: 'Sindhu Bhavan Road Office, Ahmedabad',
      recipientName: 'Proventa Client',
    },
    riskLevel: 'HIGH',
    needsApproval: true,
  },

  // 5. HOME & ESTATE SERVICES
  {
    category: 'home',
    userPrompt: 'Urgent: The central air conditioning unit in the master bedroom has stopped cooling. Need a certified technician today.',
    clientContext: {
      explicitPreferences: { estateAddress: 'Ambli Road Villa' },
    },
    reasoning: 'HVAC repair for private residence. Fast dispatch through vetted estate technician network.',
    selectedTool: 'dispatchHomeService',
    toolArguments: {
      serviceType: 'Emergency HVAC Maintenance & Diagnostic',
      address: 'Ambli Road Villa, Ahmedabad',
      scheduledSlot: 'Today ASAP (Within 2 hours)',
    },
    riskLevel: 'MEDIUM',
    needsApproval: false, // Under ₹2,000 standard dispatch threshold
  },

  // 6. ENTERTAINMENT & VIP EXPERIENCES
  {
    category: 'experiences',
    userPrompt: 'Reserve two VIP tickets for the Heritage Twilight Walk in Old Ahmedabad this Sunday.',
    clientContext: {
      explicitPreferences: { language: 'English', guideType: 'Curator-Led' },
    },
    reasoning: 'Curated heritage walk for 2 guests. Requires verification of certified UNESCO heritage walk schedule.',
    selectedTool: 'searchExperiences',
    toolArguments: {
      experienceType: 'Old City Heritage Twilight Walk (UNESCO Zone)',
      date: 'This Sunday 5:30 PM',
      attendees: 2,
    },
    riskLevel: 'LOW',
    needsApproval: false,
  },

  // 7. CALENDAR & APPOINTMENTS
  {
    category: 'appointments',
    userPrompt: 'Schedule a 90-minute restorative massage session at Kaya Kalp ITC Narmada for Friday at 4 PM.',
    clientContext: {
      explicitPreferences: { therapistPreference: 'Senior Spa Specialist' },
    },
    reasoning: 'Wellness appointment coordination at Kaya Kalp Spa for Friday 4:00 PM.',
    selectedTool: 'scheduleAppointment',
    toolArguments: {
      title: 'Kaya Kalp Spa — 90min Restorative Massage',
      preferredSlot: 'Friday 4:00 PM',
      notes: 'Senior specialist, quiet suite requested.',
    },
    riskLevel: 'LOW',
    needsApproval: false,
  },

  // 8. RESEARCH & ADVISORY
  {
    category: 'personal',
    userPrompt: 'Prepare an executive briefing on the top 3 international IB schools in western Ahmedabad with fee structures.',
    clientContext: {
      explicitPreferences: { curriculum: 'IB / Cambridge' },
    },
    reasoning: 'Advisory research inquiry. Synthesize verified data into a concise concierge advisory brief.',
    selectedTool: 'composeConciergeMessage',
    toolArguments: {
      recipientType: 'CUSTOMER',
      subject: 'Concierge Brief: Top International IB Schools (West Ahmedabad)',
      body: 'Synthesized comparative analysis of Ahmedabad International School, The Riverside School, and JG International School.',
    },
    riskLevel: 'LOW',
    needsApproval: false,
  },
];

export function getExemplarsForCategory(category: string): AgentTrainingExemplar[] {
  const catLower = category.toLowerCase();
  const matched = AGENT_TRAINING_EXEMPLARS.filter((e) => e.category.toLowerCase() === catLower);
  return matched.length > 0 ? matched : AGENT_TRAINING_EXEMPLARS.slice(0, 3);
}
