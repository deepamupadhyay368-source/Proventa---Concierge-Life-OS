import type {
  BusinessType,
  BusinessStatus,
  BusinessOperatingStatus,
  VerificationLevel,
  BusinessMemberRole,
  ListingType,
  ListingStatus,
  PriceDisplayType,
  EnquiryStatus,
  MatchStatus,
  QuotationStatus,
  QuotationPriceType,
  SubscriptionPlanTier,
  SubscriptionStatus,
  ReportTargetType,
  ReportStatus,
} from '@prisma/client';

export type {
  BusinessType,
  BusinessStatus,
  BusinessOperatingStatus,
  VerificationLevel,
  BusinessMemberRole,
  ListingType,
  ListingStatus,
  PriceDisplayType,
  EnquiryStatus,
  MatchStatus,
  QuotationStatus,
  QuotationPriceType,
  SubscriptionPlanTier,
  SubscriptionStatus,
  ReportTargetType,
  ReportStatus,
};

export interface CategoryAttributeField {
  key: string;
  label: string;
  type: 'text' | 'select';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface MarketplaceCategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parentId: string | null;
  sortOrder: number;
  active: boolean;
  attributeSchema: CategoryAttributeField[] | null;
  subcategories?: MarketplaceCategoryDTO[];
  businessCount?: number;
  listingCount?: number;
}

export interface BusinessMediaDTO {
  id: string;
  businessId: string;
  title: string | null;
  caption: string | null;
  url: string;
  mediaType: string;
  sortOrder: number;
}

export interface BusinessListingDTO {
  id: string;
  businessId: string;
  businessName?: string;
  businessSlug?: string;
  businessCity?: string;
  businessVerificationLevel?: VerificationLevel;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  subcategoryId: string | null;
  subcategoryName?: string | null;
  title: string;
  slug: string;
  shortSummary: string | null;
  description: string;
  listingType: ListingType;
  status: ListingStatus;
  priceDisplayType: PriceDisplayType;
  priceAmount: number | null;
  priceMaxAmount: number | null;
  currency: string;
  priceUnit: string | null;
  images: string[];
  specifications: Record<string, string> | null;
  tags: string[];
  availabilityStatus: string;
  deliveryTimeframe: string | null;
  serviceAreaOverride: string[];
  ctaLabel: string;
  featured: boolean;
  viewsCount: number;
  enquiryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessReviewDTO {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  enquiryId: string | null;
  rating: number;
  title: string | null;
  comment: string;
  verifiedInteraction: boolean;
  published: boolean;
  createdAt: string;
}

export interface BusinessSubscriptionDTO {
  id: string;
  businessId: string;
  planTier: SubscriptionPlanTier;
  status: SubscriptionStatus;
  billingCycle: string;
  amountInr: number;
  quotationsUsedMonth: number;
  quotationsLimitMonth: number;
  listingsLimit: number;
  teamMembersLimit: number;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
}

export interface BusinessProfileDTO {
  id: string;
  ownerId: string;
  name: string;
  legalName: string | null;
  slug: string;
  tagline: string | null;
  shortDescription: string | null;
  description: string | null;
  businessType: BusinessType;
  status: BusinessStatus;
  operatingStatus: BusinessOperatingStatus;
  verificationLevel: VerificationLevel;
  primaryCategoryId: string;
  primaryCategory?: MarketplaceCategoryDTO;
  secondaryCategories?: MarketplaceCategoryDTO[];
  logoUrl: string | null;
  coverImageUrl: string | null;
  yearEstablished: number | null;
  gstNumber: string | null;
  registrationNumber: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  whatsappNumber: string | null;
  website: string | null;
  socialLinks: Record<string, string> | null;
  addressLine1: string | null;
  addressLine2: string | null;
  area: string | null;
  city: string;
  state: string;
  postalCode: string | null;
  country: string;
  serviceAreas: string[];
  servesPanIndia: boolean;
  businessHours: Record<string, string> | null;
  highlights: string[];
  tags: string[];
  featured: boolean;
  profileViews: number;
  enquiryClicks: number;
  contactClicks: number;
  averageRating: number | null;
  reviewCount: number;
  moderationNote?: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  listings?: BusinessListingDTO[];
  media?: BusinessMediaDTO[];
  reviews?: BusinessReviewDTO[];
  subscription?: BusinessSubscriptionDTO;
}

export interface MatchScoreBreakdown {
  categoryScore: number;
  subcategoryScore: number;
  locationScore: number;
  listingRelevanceScore: number;
  keywordScore: number;
  operatingStatusScore: number;
  directTargetBonus: number;
  totalScore: number;
}

export interface EnquiryMatchDTO {
  id: string;
  enquiryId: string;
  businessId: string;
  businessName?: string;
  businessSlug?: string;
  businessCity?: string;
  businessVerificationLevel?: VerificationLevel;
  matchScore: number;
  matchReasons: string[];
  scoreBreakdown: MatchScoreBreakdown | null;
  status: MatchStatus;
  notifiedAt: string | null;
  viewedAt: string | null;
  respondedAt: string | null;
  declinedAt: string | null;
  declineReason: string | null;
  notificationDedupeKey: string;
  createdAt: string;
}

export interface BusinessQuotationDTO {
  id: string;
  referenceCode: string;
  enquiryId: string;
  businessId: string;
  businessName?: string;
  businessSlug?: string;
  businessCity?: string;
  businessVerificationLevel?: VerificationLevel;
  businessContactPhone?: string | null;
  businessContactEmail?: string | null;
  submittedById: string;
  summary: string;
  detailedProposal: string;
  priceType: QuotationPriceType;
  priceAmount: number | null;
  priceMaxAmount: number | null;
  currency: string;
  priceUnit: string | null;
  deliveryTimeline: string;
  validityDays: number;
  validUntil: string | null;
  inclusions: string[];
  exclusions: string | null;
  termsAndAssumptions: string | null;
  availabilityNote: string | null;
  attachments: string[];
  followUpPreference: string;
  status: QuotationStatus;
  customerNote: string | null;
  shortlistedAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerEnquiryDTO {
  id: string;
  referenceCode: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string | null; // Redacted unless business is authorized (shortlisted/accepted or customer allowed)
  customerPhone?: string | null; // Redacted unless business is authorized
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  subcategoryId: string | null;
  subcategoryName?: string | null;
  targetBusinessId: string | null;
  targetBusinessName?: string | null;
  targetListingId: string | null;
  targetListingTitle?: string | null;
  title: string;
  description: string;
  requirementType: BusinessType;
  city: string;
  state: string;
  deliveryMode: string;
  quantity: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  timeline: string | null;
  urgency: string;
  categoryAttributes: Record<string, string> | null;
  attachments: string[];
  preferredContactMethod: string;
  shareContactWithShortlistedOnly: boolean;
  status: EnquiryStatus;
  matchedCount: number;
  responsesCount: number;
  expiresAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  matches?: EnquiryMatchDTO[];
  quotations?: BusinessQuotationDTO[];
}

export interface DirectorySearchParams {
  query?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  city?: string;
  state?: string;
  businessType?: BusinessType;
  verificationLevel?: VerificationLevel;
  servesPanIndia?: boolean;
  sortBy?: 'relevance' | 'newest' | 'popular' | 'rating' | 'name';
  page?: number;
  limit?: number;
}

export interface ListingSearchParams {
  query?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  businessId?: string;
  listingType?: ListingType;
  priceDisplayType?: PriceDisplayType;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  limit?: number;
}

export const VERIFICATION_BADGE_META: Record<
  VerificationLevel,
  {
    label: string;
    shortLabel: string;
    description: string;
    tone: 'neutral' | 'info' | 'emerald' | 'amber';
    isVerified: boolean;
  }
> = {
  UNVERIFIED: {
    label: 'Unverified Profile',
    shortLabel: 'Unverified',
    description: 'This business profile has been created and is awaiting contact or document verification.',
    tone: 'neutral',
    isVerified: false,
  },
  SELF_REPORTED: {
    label: 'Self-Reported Profile',
    shortLabel: 'Self-Reported',
    description: 'Business details are provided directly by the business owner and have not yet undergone independent document review.',
    tone: 'neutral',
    isVerified: false,
  },
  CONTACT_VERIFIED: {
    label: 'Contact Verified',
    shortLabel: 'Contact Verified',
    description: 'The business email or phone contact has been verified on PROVENTA.',
    tone: 'info',
    isVerified: false,
  },
  DOCUMENT_REVIEWED: {
    label: 'Document Reviewed',
    shortLabel: 'Docs Reviewed',
    description: 'Business registration or tax documentation has been reviewed by PROVENTA moderation.',
    tone: 'emerald',
    isVerified: true,
  },
  VERIFIED_BUSINESS: {
    label: 'Verified Business',
    shortLabel: 'Verified Business',
    description: 'Business identity, contact details, and registration credentials have been verified by PROVENTA.',
    tone: 'emerald',
    isVerified: true,
  },
};

export const PRICE_DISPLAY_LABELS: Record<PriceDisplayType, string> = {
  FIXED_PRICE: 'Price available',
  INDICATIVE_PRICE: 'Indicative price',
  PRICE_ON_REQUEST: 'Price on request',
  QUOTE_REQUIRED: 'Quote required',
};
