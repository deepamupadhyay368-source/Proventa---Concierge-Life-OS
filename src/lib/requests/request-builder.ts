import { ExtractedRequestData, understandRequest } from '@/lib/ai/agents/understanding';

export type ServiceType =
  | 'FLIGHTS'
  | 'HOTELS'
  | 'EVENTS'
  | 'MOVIES'
  | 'DINING'
  | 'HEALTHCARE'
  | 'TRANSPORT'
  | 'GIFTING'
  | 'TRIPS'
  | 'OTHER';

export interface StructuredRequestForm {
  service: ServiceType;
  
  // Locations
  city?: string;
  origin?: string;
  destination?: string;
  pickupLocation?: string;
  deliveryLocation?: string;
  isSurpriseDestination?: boolean;
  
  // Specific targets
  targetName?: string; // Event name, movie title, doctor specialty/name, cuisine/restaurant, vehicle preference, gift occasion/item
  recipient?: string;
  occasion?: string;
  cabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  tripType?: 'ONE_WAY' | 'ROUND_TRIP';
  
  // Timing
  date?: string;
  returnDate?: string;
  time?: string;
  timeSlot?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'ANY';
  
  // Quantities
  partySize: number;
  rooms?: number;
  
  // Budget
  budgetMode: 'FLEXIBLE' | 'MAX' | 'EXACT';
  budgetAmount?: number;
  
  // Preferences & instructions
  preferences: string[];
  notes?: string;
  urgency: 'NORMAL' | 'URGENT' | 'ASAP';
}

export const INITIAL_REQUEST_FORM: StructuredRequestForm = {
  service: 'DINING',
  city: 'Ahmedabad',
  partySize: 2,
  budgetMode: 'FLEXIBLE',
  preferences: [],
  urgency: 'NORMAL',
};

/**
 * Synthesizes a structured request form into a natural language description with all constraints preserved.
 */
export function buildSynthesizedPrompt(form: StructuredRequestForm): string {
  const parts: string[] = [];

  const formatBudgetStr = () => {
    if (form.budgetMode === 'FLEXIBLE' || !form.budgetAmount) {
      return '';
    }
    const amountStr = `₹${form.budgetAmount.toLocaleString('en-IN')}`;
    if (form.budgetMode === 'MAX') {
      return `under ${amountStr}`;
    }
    return `with budget around ${amountStr}`;
  };

  const budgetStr = formatBudgetStr();

  switch (form.service) {
    case 'FLIGHTS': {
      const from = form.origin || form.city || 'Ahmedabad';
      const to = form.destination || 'Mumbai';
      const isRoundTrip = form.tripType === 'ROUND_TRIP' && Boolean(form.returnDate);
      const cabin = form.cabinClass ? `${form.cabinClass.replace(/_/g, ' ').toLowerCase()} class` : 'flights';
      
      let flightStr = `Book ${form.partySize} ${cabin} from ${from} to ${to}`;
      if (form.date) flightStr += ` on ${form.date}`;
      if (isRoundTrip && form.returnDate) flightStr += ` returning on ${form.returnDate}`;
      if (budgetStr) flightStr += ` ${budgetStr}`;
      parts.push(flightStr);
      break;
    }

    case 'HOTELS': {
      const dest = form.destination || form.city || 'Ahmedabad';
      const roomsStr = form.rooms && form.rooms > 1 ? ` (${form.rooms} rooms)` : '';
      let hotelStr = `Book luxury hotel in ${dest} for ${form.partySize} guests${roomsStr}`;
      if (form.date) hotelStr += ` from ${form.date}`;
      if (form.returnDate) hotelStr += ` to ${form.returnDate}`;
      if (budgetStr) hotelStr += ` ${budgetStr}`;
      parts.push(hotelStr);
      break;
    }

    case 'EVENTS': {
      const eventName = form.targetName || 'passes';
      const city = form.city || 'Ahmedabad';
      let eventStr = `Book ${form.partySize} ${eventName} in ${city}`;
      if (form.date) eventStr += ` on ${form.date}`;
      if (budgetStr) eventStr += ` ${budgetStr}`;
      parts.push(eventStr);
      break;
    }

    case 'MOVIES': {
      const movieName = form.targetName || 'acclaimed movie';
      const city = form.city || 'Ahmedabad';
      let movieStr = `Book ${form.partySize} tickets for ${movieName} in ${city}`;
      if (form.date) movieStr += ` on ${form.date}`;
      if (form.time) movieStr += ` around ${form.time}`;
      else if (form.timeSlot && form.timeSlot !== 'ANY') movieStr += ` (${form.timeSlot.toLowerCase()} show)`;
      if (budgetStr) movieStr += ` ${budgetStr}`;
      parts.push(movieStr);
      break;
    }

    case 'DINING': {
      const cuisine = form.targetName || 'fine dining';
      const city = form.city || 'Ahmedabad';
      let dineStr = `Reserve a table for ${form.partySize} at a top ${cuisine} restaurant in ${city}`;
      if (form.date) dineStr += ` on ${form.date}`;
      if (form.time) dineStr += ` at ${form.time}`;
      if (budgetStr) dineStr += ` ${budgetStr}`;
      parts.push(dineStr);
      break;
    }

    case 'HEALTHCARE': {
      const doctorOrSpecialty = form.targetName || 'specialist doctor';
      const city = form.city || 'Ahmedabad';
      let healthStr = `Schedule consultation with top ${doctorOrSpecialty} in ${city} for ${form.partySize} person${form.partySize > 1 ? 's' : ''}`;
      if (form.date) healthStr += ` on ${form.date}`;
      if (budgetStr) healthStr += ` ${budgetStr}`;
      parts.push(healthStr);
      break;
    }

    case 'TRANSPORT': {
      const pickup = form.pickupLocation || 'SVPIA Airport';
      const dest = form.destination || 'City Centre';
      const vehicle = form.targetName || 'executive sedan';
      const city = form.city || 'Ahmedabad';
      let transStr = `Arrange ${vehicle} chauffeur pickup from ${pickup} to ${dest} in ${city} for ${form.partySize} passengers`;
      if (form.date) transStr += ` on ${form.date}`;
      if (form.time) transStr += ` at ${form.time}`;
      if (budgetStr) transStr += ` ${budgetStr}`;
      parts.push(transStr);
      break;
    }

    case 'GIFTING': {
      const giftType = form.targetName || 'curated gift hamper';
      const recipient = form.recipient ? ` for ${form.recipient}` : '';
      const occasion = form.occasion ? ` on the occasion of ${form.occasion}` : '';
      const city = form.deliveryLocation || form.city || 'Ahmedabad';
      let giftStr = `Arrange bespoke ${giftType}${recipient}${occasion} delivered in ${city}`;
      if (form.date) giftStr += ` on ${form.date}`;
      if (budgetStr) giftStr += ` ${budgetStr}`;
      parts.push(giftStr);
      break;
    }

    case 'TRIPS': {
      const dest = form.isSurpriseDestination ? 'curated surprise getaway destination' : (form.destination || 'Goa');
      const origin = form.origin || form.city || 'Ahmedabad';
      let tripStr = `Curate and plan a getaway to ${dest} from ${origin} for ${form.partySize} people`;
      if (form.date) tripStr += ` starting ${form.date}`;
      if (form.returnDate) tripStr += ` until ${form.returnDate}`;
      if (budgetStr) tripStr += ` ${budgetStr}`;
      parts.push(tripStr);
      break;
    }

    case 'OTHER':
    default: {
      const desc = form.notes || form.targetName || 'Bespoke concierge delegation';
      let otherStr = `${desc} in ${form.city || 'Ahmedabad'} for ${form.partySize} person${form.partySize > 1 ? 's' : ''}`;
      if (form.date) otherStr += ` on ${form.date}`;
      if (budgetStr) otherStr += ` ${budgetStr}`;
      parts.push(otherStr);
      break;
    }
  }

  // Append selected preferences
  if (form.preferences && form.preferences.length > 0) {
    parts.push(`Preferences: ${form.preferences.join(', ')}.`);
  }

  // Append custom notes if not already used in 'OTHER'
  if (form.notes && form.service !== 'OTHER' && form.notes.trim()) {
    parts.push(`Special notes: ${form.notes.trim()}.`);
  }

  return parts.join('. ').replace(/\.\./g, '.').trim();
}

/**
 * Maps extracted intent entities from understandRequest into a structured form state.
 */
export function mapExtractedDataToForm(extracted: ExtractedRequestData, rawInput: string): Partial<StructuredRequestForm> {
  const result: Partial<StructuredRequestForm> = {};
  const lower = rawInput.toLowerCase();

  // Category mapping
  const cat = extracted.category?.toLowerCase() || '';
  if (cat.includes('flight') || cat.includes('travel') || lower.includes('flight') || lower.includes('fly') || lower.includes('airport')) {
    result.service = 'FLIGHTS';
  } else if (cat.includes('hotel') || cat.includes('accommodation') || lower.includes('hotel') || lower.includes('stay') || lower.includes('resort')) {
    result.service = 'HOTELS';
  } else if (cat.includes('event') || lower.includes('garba') || lower.includes('concert') || lower.includes('ticket') || lower.includes('pass')) {
    result.service = 'EVENTS';
  } else if (cat.includes('movie') || cat.includes('entertainment') || cat.includes('cinema') || lower.includes('movie') || lower.includes('cinema') || lower.includes('pvr') || lower.includes('inox')) {
    result.service = 'MOVIES';
  } else if (cat.includes('dine') || cat.includes('dining') || cat.includes('food') || lower.includes('dinner') || lower.includes('lunch') || lower.includes('restaurant') || lower.includes('table')) {
    result.service = 'DINING';
  } else if (cat.includes('health') || cat.includes('appointment') || cat.includes('doctor') || lower.includes('doctor') || lower.includes('clinic') || lower.includes('hospital') || lower.includes('cardiolog') || lower.includes('dermatolog')) {
    result.service = 'HEALTHCARE';
  } else if (cat.includes('transport') || cat.includes('mobility') || lower.includes('cab') || lower.includes('chauffeur') || lower.includes('pickup') || lower.includes('sedan')) {
    result.service = 'TRANSPORT';
  } else if (cat.includes('gift') || lower.includes('gift') || lower.includes('flower') || lower.includes('hamper')) {
    result.service = 'GIFTING';
  } else if (cat.includes('weekend') || cat.includes('trip') || cat.includes('escape') || lower.includes('getaway') || lower.includes('trip') || lower.includes('vacation')) {
    result.service = 'TRIPS';
  } else {
    result.service = 'OTHER';
  }

  // Location mapping
  if (extracted.location) result.city = extracted.location;
  if (extracted.origin) result.origin = extracted.origin;
  if (extracted.destination) result.destination = extracted.destination;

  // Party size
  if (extracted.partySize) result.partySize = extracted.partySize;

  // Budget
  if (extracted.budgetAmount) {
    result.budgetAmount = extracted.budgetAmount;
    result.budgetMode = lower.includes('under') || lower.includes('max') || lower.includes('less than') ? 'MAX' : 'EXACT';
  } else {
    result.budgetMode = 'FLEXIBLE';
  }

  // Dates
  if (extracted.date) result.date = extracted.date;
  if (extracted.time) result.time = extracted.time;

  // Urgency
  if (extracted.urgency) result.urgency = extracted.urgency;

  // Preferences
  if (extracted.preferences && extracted.preferences.length > 0) {
    result.preferences = [...extracted.preferences];
  }

  // Specific targets
  if (result.service === 'EVENTS' && (lower.includes('garba') || lower.includes('passes'))) {
    result.targetName = 'Garba passes';
  } else if (result.service === 'HEALTHCARE') {
    if (lower.includes('cardiolog')) result.targetName = 'Cardiologist';
    else if (lower.includes('dermatolog')) result.targetName = 'Dermatologist';
    else if (lower.includes('dentist')) result.targetName = 'Dentist';
  } else if (result.service === 'FLIGHTS') {
    if (lower.includes('business class')) result.cabinClass = 'BUSINESS';
    else if (lower.includes('first class')) result.cabinClass = 'FIRST';
    else if (lower.includes('premium economy')) result.cabinClass = 'PREMIUM_ECONOMY';
    else result.cabinClass = 'ECONOMY';
    result.tripType = lower.includes('round trip') || lower.includes('return') ? 'ROUND_TRIP' : 'ONE_WAY';
  }

  return result;
}
