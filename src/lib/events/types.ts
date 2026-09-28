/**
 * PROVENTA — UNIVERSAL EVENT DISCOVERY TYPES & MODELS
 * Canonical domain types for event discovery, normalization, taxonomy, and constraints.
 * Any City • Any Date • Any Event Type • Multi-Source AI Research • Zero Fabrication
 */

// ============================================================
// 1. MASTER EVENT TAXONOMY
// ============================================================

export type EntertainmentCategory =
  | 'CONCERTS'
  | 'LIVE_MUSIC'
  | 'DJ'
  | 'NIGHTLIFE'
  | 'PARTIES'
  | 'DANCE'
  | 'COMEDY'
  | 'STANDUP'
  | 'THEATRE'
  | 'MUSICALS'
  | 'PERFORMANCES'
  | 'OPEN_MIC';

export type FestivalsCultureCategory =
  | 'FESTIVALS'
  | 'NAVRATRI'
  | 'DIWALI'
  | 'HOLI'
  | 'GARBA'
  | 'RELIGIOUS'
  | 'CULTURAL'
  | 'FOLK'
  | 'HERITAGE'
  | 'FAIRS'
  | 'CARNIVALS';

export type FoodLifestyleCategory =
  | 'FOOD'
  | 'FOOD_FESTIVALS'
  | 'DINING_EVENTS'
  | 'TASTINGS'
  | 'CHEF_EXPERIENCES'
  | 'COOKING'
  | 'BAKING'
  | 'BRUNCH'
  | 'CULINARY_WORKSHOPS';

export type ArtsCreativeCategory =
  | 'ART'
  | 'EXHIBITIONS'
  | 'PHOTOGRAPHY'
  | 'FASHION'
  | 'DESIGN'
  | 'CRAFT'
  | 'HANDMADE'
  | 'LITERATURE'
  | 'POETRY'
  | 'BOOK_EVENTS';

export type BusinessProfessionalCategory =
  | 'BUSINESS'
  | 'NETWORKING'
  | 'STARTUP'
  | 'ENTREPRENEURSHIP'
  | 'INVESTOR'
  | 'CONFERENCE'
  | 'SEMINAR'
  | 'TRADE_SHOW'
  | 'EXPO'
  | 'CORPORATE'
  | 'CAREER'
  | 'PROFESSIONAL';

export type HealthWellnessCategory =
  | 'HEALTH'
  | 'WELLNESS'
  | 'YOGA'
  | 'MEDITATION'
  | 'FITNESS'
  | 'RUNNING'
  | 'MINDFULNESS'
  | 'WELLNESS_WORKSHOPS';

export type SportsCategory =
  | 'SPORTS'
  | 'CRICKET'
  | 'FOOTBALL'
  | 'BADMINTON'
  | 'TENNIS'
  | 'MARATHON'
  | 'CYCLING'
  | 'GOLF'
  | 'ESPORTS';

export type LearningCategory =
  | 'WORKSHOPS'
  | 'MASTERCLASS'
  | 'EDUCATION'
  | 'TECHNOLOGY'
  | 'AI'
  | 'FINANCE'
  | 'SKILLS'
  | 'PERSONAL_DEVELOPMENT';

export type FamilyCommunityCategory =
  | 'FAMILY'
  | 'KIDS'
  | 'COMMUNITY'
  | 'PETS'
  | 'SOCIAL'
  | 'CHARITY';

export type ShoppingMarketsCategory =
  | 'FLEA_MARKET'
  | 'SHOPPING'
  | 'EXHIBITION_SALE'
  | 'POPUP'
  | 'LOCAL_MARKET';

export type ExperiencesCategory =
  | 'ADVENTURE'
  | 'OUTDOOR'
  | 'TRAVEL'
  | 'LUXURY'
  | 'PRIVATE_EXPERIENCE'
  | 'SOCIAL_EXPERIENCE';

export type OtherEventCategory = 'OTHER_EVENT';

export type UniversalCategory = 'ALL';

export type EventCategory =
  | EntertainmentCategory
  | FestivalsCultureCategory
  | FoodLifestyleCategory
  | ArtsCreativeCategory
  | BusinessProfessionalCategory
  | HealthWellnessCategory
  | SportsCategory
  | LearningCategory
  | FamilyCommunityCategory
  | ShoppingMarketsCategory
  | ExperiencesCategory
  | OtherEventCategory
  | UniversalCategory
  // Legacy aliases for backwards compatibility
  | 'MUSIC'
  | 'ART_EXHIBITION'
  | 'CULTURE'
  | 'FOOD_DRINK'
  | 'LUXURY_EXPERIENCE'
  | 'GENERAL';

export type EventAvailabilityStatus =
  | 'AVAILABLE'
  | 'SUBJECT_TO_CONFIRMATION'
  | 'WAITLIST'
  | 'SOLD_OUT'
  | 'UNVERIFIED';

// ============================================================
// 2. NORMALIZED EVENT MODEL
// ============================================================

export interface NormalizedEvent {
  eventId: string;
  provider?: string;
  providerId?: string;
  providerEventId?: string;
  title: string;
  description: string;
  category: EventCategory;
  subcategories?: string[];
  subcategory?: string;
  venue: string;
  city: string;
  address?: string;
  venueAddress?: string;
  latitude?: number;
  longitude?: number;
  date: string; // YYYY-MM-DD
  endDate?: string;
  startTime?: string;
  endTime?: string;
  timeDisplay?: string;
  timezone: string;
  priceAmount?: number;
  priceMin?: number;
  priceMax?: number;
  priceDisplay?: string;
  currency: string;
  availabilityStatus: EventAvailabilityStatus;
  bookingUrl?: string;
  sourceUrl?: string;
  organizer?: string;
  imageUrl?: string;
  verified: boolean;
  isExclusive?: boolean;
  source: string;
  sourceId?: string;
  tags?: string[];
  discoveredAt: string;
  verifiedAt?: string;
}

// ============================================================
// 3. SEARCH & CONSTRAINT TYPES
// ============================================================

export interface EventSearchConstraints {
  city?: string;
  cities?: string[];
  date?: string; // YYYY-MM-DD or raw date string
  startDate?: string;
  endDate?: string;
  isDateRange?: boolean;
  timeWindow?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'ALL_DAY';
  startTime?: string;
  endTime?: string;
  category?: EventCategory;
  categories?: EventCategory[];
  subcategory?: string;
  partySize?: number;
  budgetAmount?: number;
  budgetRange?: string;
  preferences?: string[];
  keywords?: string[];
  rawInput?: string;
  excludedEventIds?: string[];
  limit?: number;
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

// ============================================================
// 4. DIAGNOSTIC & OBSERVABILITY CONTEXT
// ============================================================

export interface EventResearchDiagnostics {
  researchStartedAt: string;
  rawInput: string;
  resolvedCity: string;
  resolvedDateFrom: string;
  resolvedDateTo: string;
  resolvedCategory: EventCategory;
  sourcesQueried: Array<{
    sourceId: string;
    sourceName: string;
    isConfigured: boolean;
    status: 'SUCCESS' | 'FAILED' | 'NOT_CONFIGURED';
    candidatesFound: number;
    latencyMs: number;
    error?: string;
  }>;
  rawCandidateCount: number;
  deduplicatedCount: number;
  validatedCount: number;
  rankedCount: number;
  returnedOptionCount: number;
  conciergeFallback: boolean;
  fallbackReason?: string;
}
