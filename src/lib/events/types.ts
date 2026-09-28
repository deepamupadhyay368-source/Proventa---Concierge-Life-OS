/**
 * PROVENTA — UNIVERSAL EVENT DISCOVERY TYPES & MODELS
 * Canonical domain types for event discovery, normalization, and constraints.
 */

export type EventCategory =
  | 'MUSIC'
  | 'COMEDY'
  | 'THEATRE'
  | 'CULTURE'
  | 'ART_EXHIBITION'
  | 'WORKSHOP'
  | 'CONFERENCE'
  | 'SPORTS'
  | 'FAMILY'
  | 'FOOD_DRINK'
  | 'NIGHTLIFE'
  | 'LUXURY_EXPERIENCE'
  | 'WELLNESS'
  | 'COMMUNITY'
  | 'GENERAL';

export type EventAvailabilityStatus =
  | 'AVAILABLE'
  | 'SUBJECT_TO_CONFIRMATION'
  | 'WAITLIST'
  | 'SOLD_OUT'
  | 'UNVERIFIED';

export interface NormalizedEvent {
  providerId: string;
  eventId: string;
  title: string;
  description: string;
  category: EventCategory;
  subcategory?: string;
  venue: string;
  venueAddress?: string;
  city: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // For multi-day festivals / exhibitions
  startTime?: string; // e.g. "19:30" or "7:30 PM"
  endTime?: string;
  timeDisplay?: string; // e.g. "7:30 PM - 10:00 PM"
  priceAmount?: number; // In INR
  priceDisplay?: string; // e.g. "₹1,499 onwards", "Complimentary / RSVP", "₹2,500 - ₹6,000"
  currency: string;
  bookingUrl?: string;
  providerUrl?: string;
  imageUrl?: string;
  organizer?: string;
  availabilityStatus: EventAvailabilityStatus;
  source: string; // e.g. "NMACC Verified", "NCPA Mumbai", "Natarani Amphitheatre", "BIC Bangalore"
  verifiedAt: string;
  tags?: string[];
  isExclusive?: boolean;
}

export interface EventSearchConstraints {
  city?: string;
  cities?: string[]; // For multi-city search e.g. "Ahmedabad or Mumbai"
  date?: string; // YYYY-MM-DD
  startDate?: string;
  endDate?: string;
  isDateRange?: boolean;
  timeWindow?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'ALL_DAY';
  startTime?: string;
  endTime?: string;
  category?: EventCategory | 'ALL';
  subcategory?: string;
  partySize?: number;
  budgetAmount?: number;
  budgetRange?: string;
  preferences?: string[];
  keywords?: string[];
  rawInput?: string;
}

export interface ResolvedDateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isSpecificDate: boolean;
  isDateRange: boolean;
  isUpcomingWindow: boolean;
  displayText: string;
  resolvedFrom: string;
}
