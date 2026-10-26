import { z } from 'zod';

export const RESERVED_BUSINESS_SLUGS = new Set([
  'admin',
  'api',
  'auth',
  'business',
  'businesses',
  'categories',
  'concierge',
  'contact',
  'dashboard',
  'enquiries',
  'explore',
  'faq',
  'for-businesses',
  'guidelines',
  'help',
  'how-it-works',
  'legal',
  'listings',
  'login',
  'moderation',
  'new',
  'onboarding',
  'pricing',
  'privacy',
  'proventa',
  'quotations',
  'register',
  'search',
  'settings',
  'sign-in',
  'sign-up',
  'support',
  'terms',
  'verify',
]);

export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(80, 'Slug must be at most 80 characters')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug may only contain lowercase letters, numbers, and single hyphens',
  )
  .refine((slug) => !RESERVED_BUSINESS_SLUGS.has(slug), {
    message: 'This URL slug is reserved by the platform',
  });

export const indianPhoneOptionalSchema = z
  .string()
  .trim()
  .regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number')
  .optional()
  .or(z.literal(''));

export const gstOptionalSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    'Please enter a valid 15-character Indian GSTIN (or leave blank)',
  )
  .optional()
  .or(z.literal(''));

export const createBusinessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(120, 'Business name is too long'),
  legalName: z.string().trim().max(150).optional().or(z.literal('')),
  slug: slugSchema.optional(),
  tagline: z
    .string()
    .trim()
    .max(140, 'Tagline must be 140 characters or fewer')
    .optional()
    .or(z.literal('')),
  shortDescription: z
    .string()
    .trim()
    .min(15, 'Please provide a short summary of at least 15 characters')
    .max(300, 'Short summary must be 300 characters or fewer'),
  description: z
    .string()
    .trim()
    .min(30, 'Please provide a fuller business description (at least 30 characters)')
    .max(5000, 'Description is too long'),
  businessType: z.enum(['PRODUCT', 'SERVICE', 'HYBRID']).default('HYBRID'),
  operatingStatus: z
    .enum(['OPEN', 'ACCEPTING_ENQUIRIES', 'TEMPORARILY_CLOSED', 'BY_APPOINTMENT'])
    .default('ACCEPTING_ENQUIRIES'),
  primaryCategoryId: z.string().min(1, 'Please select a primary category'),
  secondaryCategoryIds: z.array(z.string()).max(5).default([]),
  logoUrl: z.string().url().optional().or(z.literal('')),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  yearEstablished: z
    .number()
    .int()
    .min(1850)
    .max(new Date().getFullYear())
    .optional()
    .nullable(),
  gstNumber: gstOptionalSchema,
  registrationNumber: z.string().trim().max(80).optional().or(z.literal('')),
  contactEmail: z.string().trim().email('Please enter a valid business email').optional().or(z.literal('')),
  contactPhone: indianPhoneOptionalSchema,
  whatsappNumber: indianPhoneOptionalSchema,
  website: z.string().trim().url('Please enter a valid website URL (including https://)').optional().or(z.literal('')),
  socialLinks: z.record(z.string(), z.string()).optional(),
  addressLine1: z.string().trim().max(200).optional().or(z.literal('')),
  addressLine2: z.string().trim().max(200).optional().or(z.literal('')),
  area: z.string().trim().max(100).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'City is required').max(80),
  state: z.string().trim().min(2, 'State is required').max(80).default('Gujarat'),
  postalCode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit PIN code')
    .optional()
    .or(z.literal('')),
  country: z.string().trim().default('India'),
  serviceAreas: z.array(z.string().trim().min(1).max(80)).max(25).default([]),
  servesPanIndia: z.boolean().default(false),
  businessHours: z.record(z.string(), z.string()).optional(),
  highlights: z.array(z.string().trim().min(2).max(120)).max(10).default([]),
  tags: z.array(z.string().trim().min(2).max(50)).max(20).default([]),
  publishImmediately: z.boolean().default(true),
});

export const updateBusinessSchema = createBusinessSchema.partial().extend({
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const createListingSchema = z
  .object({
    businessId: z.string().min(1, 'Business ID is required'),
    categoryId: z.string().min(1, 'Category is required'),
    subcategoryId: z.string().optional().nullable(),
    title: z
      .string()
      .trim()
      .min(3, 'Listing title must be at least 3 characters')
      .max(140, 'Listing title must be 140 characters or fewer'),
    slug: slugSchema.optional(),
    shortSummary: z.string().trim().max(240).optional().or(z.literal('')),
    description: z
      .string()
      .trim()
      .min(20, 'Description must be at least 20 characters')
      .max(4000, 'Description is too long'),
    listingType: z.enum(['PRODUCT', 'SERVICE']).default('SERVICE'),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
    priceDisplayType: z
      .enum(['FIXED_PRICE', 'INDICATIVE_PRICE', 'PRICE_ON_REQUEST', 'QUOTE_REQUIRED'])
      .default('INDICATIVE_PRICE'),
    priceAmount: z.number().int().nonnegative().optional().nullable(),
    priceMaxAmount: z.number().int().nonnegative().optional().nullable(),
    currency: z.string().default('INR'),
    priceUnit: z.string().trim().max(50).optional().or(z.literal('')),
    images: z.array(z.string().url()).max(10).default([]),
    specifications: z.record(z.string(), z.string()).optional().nullable(),
    tags: z.array(z.string().trim().min(1).max(50)).max(15).default([]),
    availabilityStatus: z
      .enum(['AVAILABLE', 'MADE_TO_ORDER', 'BY_CONSULTATION', 'OUT_OF_STOCK'])
      .default('AVAILABLE'),
    deliveryTimeframe: z.string().trim().max(100).optional().or(z.literal('')),
    serviceAreaOverride: z.array(z.string().trim()).max(20).default([]),
    ctaLabel: z.string().trim().min(2).max(40).default('Send Enquiry'),
  })
  .refine(
    (data) => {
      if (data.priceDisplayType === 'FIXED_PRICE' || data.priceDisplayType === 'INDICATIVE_PRICE') {
        return typeof data.priceAmount === 'number' && data.priceAmount > 0;
      }
      return true;
    },
    {
      message: 'A valid positive price amount is required for Fixed Price or Indicative Price listings',
      path: ['priceAmount'],
    },
  )
  .refine(
    (data) => {
      if (
        typeof data.priceAmount === 'number' &&
        typeof data.priceMaxAmount === 'number' &&
        data.priceMaxAmount > 0
      ) {
        return data.priceMaxAmount >= data.priceAmount;
      }
      return true;
    },
    {
      message: 'Maximum price must be greater than or equal to minimum price',
      path: ['priceMaxAmount'],
    },
  );

export const updateListingSchema = z.object({
  title: z.string().trim().min(3).max(140).optional(),
  categoryId: z.string().min(1).optional(),
  subcategoryId: z.string().optional().nullable(),
  shortSummary: z.string().trim().max(240).optional().or(z.literal('')),
  description: z.string().trim().min(20).max(4000).optional(),
  listingType: z.enum(['PRODUCT', 'SERVICE']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  priceDisplayType: z
    .enum(['FIXED_PRICE', 'INDICATIVE_PRICE', 'PRICE_ON_REQUEST', 'QUOTE_REQUIRED'])
    .optional(),
  priceAmount: z.number().int().nonnegative().optional().nullable(),
  priceMaxAmount: z.number().int().nonnegative().optional().nullable(),
  priceUnit: z.string().trim().max(50).optional().or(z.literal('')),
  images: z.array(z.string().url()).max(10).optional(),
  specifications: z.record(z.string(), z.string()).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(50)).max(15).optional(),
  availabilityStatus: z
    .enum(['AVAILABLE', 'MADE_TO_ORDER', 'BY_CONSULTATION', 'OUT_OF_STOCK'])
    .optional(),
  deliveryTimeframe: z.string().trim().max(100).optional().or(z.literal('')),
  serviceAreaOverride: z.array(z.string().trim()).max(20).optional(),
  ctaLabel: z.string().trim().min(2).max(40).optional(),
});

export const createEnquirySchema = z
  .object({
    categoryId: z.string().min(1, 'Please select a category'),
    subcategoryId: z.string().optional().nullable(),
    targetBusinessId: z.string().optional().nullable(),
    targetListingId: z.string().optional().nullable(),
    title: z
      .string()
      .trim()
      .min(5, 'Please provide a clear title (at least 5 characters)')
      .max(160, 'Title must be 160 characters or fewer'),
    description: z
      .string()
      .trim()
      .min(20, 'Please describe your requirement in at least 20 characters so businesses can quote accurately')
      .max(5000, 'Description is too long'),
    requirementType: z.enum(['PRODUCT', 'SERVICE', 'HYBRID']).default('HYBRID'),
    city: z.string().trim().min(2, 'City is required').max(80),
    state: z.string().trim().min(2).max(80).default('Gujarat'),
    deliveryMode: z.enum(['ON_SITE', 'REMOTE', 'DELIVERY', 'EITHER']).default('EITHER'),
    quantity: z.string().trim().max(100).optional().or(z.literal('')),
    budgetMin: z.number().int().nonnegative().optional().nullable(),
    budgetMax: z.number().int().nonnegative().optional().nullable(),
    currency: z.string().default('INR'),
    timeline: z.string().trim().max(120).optional().or(z.literal('')),
    urgency: z.enum(['STANDARD', 'URGENT', 'FLEXIBLE']).default('STANDARD'),
    categoryAttributes: z.record(z.string(), z.string()).optional().nullable(),
    attachments: z.array(z.string().url()).max(5).default([]),
    preferredContactMethod: z
      .enum(['PLATFORM', 'EMAIL', 'PHONE', 'WHATSAPP'])
      .default('PLATFORM'),
    shareContactWithShortlistedOnly: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (
        typeof data.budgetMin === 'number' &&
        typeof data.budgetMax === 'number' &&
        data.budgetMax > 0
      ) {
        return data.budgetMax >= data.budgetMin;
      }
      return true;
    },
    {
      message: 'Maximum budget must be greater than or equal to minimum budget',
      path: ['budgetMax'],
    },
  );

export const createQuotationSchema = z
  .object({
    enquiryId: z.string().min(1, 'Enquiry ID is required'),
    businessId: z.string().min(1, 'Business ID is required'),
    summary: z
      .string()
      .trim()
      .min(5, 'Please provide a concise quotation summary')
      .max(200, 'Summary must be 200 characters or fewer'),
    detailedProposal: z
      .string()
      .trim()
      .min(20, 'Please provide a detailed proposal (at least 20 characters)')
      .max(5000, 'Proposal is too long'),
    priceType: z
      .enum(['FIXED_QUOTE', 'INDICATIVE_ESTIMATE', 'RANGE_ESTIMATE', 'INSPECTION_REQUIRED'])
      .default('FIXED_QUOTE'),
    priceAmount: z.number().int().nonnegative().optional().nullable(),
    priceMaxAmount: z.number().int().nonnegative().optional().nullable(),
    currency: z.string().default('INR'),
    priceUnit: z.string().trim().max(50).optional().or(z.literal('')),
    deliveryTimeline: z
      .string()
      .trim()
      .min(2, 'Please specify an estimated delivery or completion timeline')
      .max(120),
    validityDays: z.number().int().min(1).max(180).default(14),
    inclusions: z.array(z.string().trim().min(1).max(200)).max(15).default([]),
    exclusions: z.string().trim().max(1500).optional().or(z.literal('')),
    termsAndAssumptions: z.string().trim().max(1500).optional().or(z.literal('')),
    availabilityNote: z.string().trim().max(300).optional().or(z.literal('')),
    attachments: z.array(z.string().url()).max(5).default([]),
    followUpPreference: z
      .enum(['PLATFORM_ONLY', 'PLATFORM_AND_PHONE', 'PLATFORM_AND_EMAIL', 'WHATSAPP'])
      .default('PLATFORM_AND_PHONE'),
  })
  .refine(
    (data) => {
      if (
        data.priceType === 'FIXED_QUOTE' ||
        data.priceType === 'INDICATIVE_ESTIMATE' ||
        data.priceType === 'RANGE_ESTIMATE'
      ) {
        return typeof data.priceAmount === 'number' && data.priceAmount > 0;
      }
      return true;
    },
    {
      message: 'Please provide a valid positive price amount for this quote type',
      path: ['priceAmount'],
    },
  );

export const updateQuotationCustomerStatusSchema = z.object({
  action: z.enum(['SHORTLIST', 'ACCEPT', 'REJECT']),
  customerNote: z.string().trim().max(500).optional(),
});

export const updateEnquiryStatusSchema = z.object({
  action: z.enum(['CLOSE', 'CANCEL']),
  reason: z.string().trim().max(500).optional(),
});

export const createReviewSchema = z.object({
  businessId: z.string().min(1),
  enquiryId: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().or(z.literal('')),
  comment: z.string().trim().min(10, 'Review comment must be at least 10 characters').max(2000),
});

export const createModerationReportSchema = z.object({
  targetType: z.enum(['BUSINESS', 'LISTING', 'ENQUIRY', 'QUOTATION', 'REVIEW']),
  targetId: z.string().min(1),
  reason: z.string().trim().min(3).max(150),
  details: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const adminModerationActionSchema = z.object({
  resourceType: z.enum(['BUSINESS', 'LISTING', 'ENQUIRY', 'REPORT', 'CATEGORY']),
  resourceId: z.string().min(1),
  action: z.enum([
    'APPROVE_BUSINESS',
    'SUSPEND_BUSINESS',
    'RESTORE_BUSINESS',
    'ARCHIVE_BUSINESS',
    'SET_VERIFICATION_LEVEL',
    'TOGGLE_FEATURED_BUSINESS',
    'SUSPEND_LISTING',
    'RESTORE_LISTING',
    'FLAG_ENQUIRY',
    'CLOSE_ENQUIRY',
    'RESOLVE_REPORT',
    'DISMISS_REPORT',
  ]),
  verificationLevel: z
    .enum([
      'UNVERIFIED',
      'SELF_REPORTED',
      'CONTACT_VERIFIED',
      'DOCUMENT_REVIEWED',
      'VERIFIED_BUSINESS',
    ])
    .optional(),
  note: z.string().trim().max(1000).optional(),
});

export function generateUniqueSlug(name: string, suffix?: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

  const normalized = base.length >= 3 ? base : `biz-${base || 'storefront'}`;
  if (RESERVED_BUSINESS_SLUGS.has(normalized)) {
    return `${normalized}-${suffix || 'gujarat'}`;
  }
  return suffix ? `${normalized}-${suffix}` : normalized;
}
