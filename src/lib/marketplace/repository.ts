import { INITIAL_MARKETPLACE_CATEGORIES, BUSINESS_SUBSCRIPTION_PLANS } from '@/lib/brand';
import { generateId } from '@/lib/utils';
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors';
import type {
  BusinessListingDTO,
  BusinessMediaDTO,
  BusinessProfileDTO,
  BusinessQuotationDTO,
  BusinessReviewDTO,
  BusinessSubscriptionDTO,
  CategoryAttributeField,
  CustomerEnquiryDTO,
  DirectorySearchParams,
  EnquiryMatchDTO,
  ListingSearchParams,
  MarketplaceCategoryDTO,
  ReportStatus,
  ReportTargetType,
  SubscriptionPlanTier,
  VerificationLevel,
} from './types';
import {
  createBusinessSchema,
  createEnquirySchema,
  createListingSchema,
  createModerationReportSchema,
  createQuotationSchema,
  createReviewSchema,
  generateUniqueSlug,
  slugSchema,
  updateBusinessSchema,
  updateListingSchema,
} from './validation';
import {
  assertBusinessStatusTransition,
  assertEnquiryStatusTransition,
  assertQuotationStatusTransition,
  isEnquiryOpenForQuotations,
} from './state-machine';
import { matchBusinessesForEnquiry } from './matching-engine';
import {
  assertEntitlement,
  checkListingEntitlement,
  checkQuotationEntitlement,
  checkTeamMemberEntitlement,
  getPlanLimits,
} from './entitlements';
import {
  redactEnquiryForViewer,
  sendMarketplaceNotification,
} from './notifications';

export interface BusinessTeamMemberDTO {
  id: string;
  businessId: string;
  userId: string;
  email?: string;
  name?: string;
  role: 'OWNER' | 'MANAGER' | 'RESPONDER' | 'VIEWER';
  active: boolean;
  createdAt: string;
}

export interface ModerationReportDTO {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  resolutionNote: string | null;
  resolvedById: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MarketplaceStore {
  initialized: boolean;
  categories: Map<string, MarketplaceCategoryDTO>;
  businesses: Map<string, BusinessProfileDTO & { secondaryCategoryIds: string[] }>;
  teamMembers: Map<string, BusinessTeamMemberDTO[]>;
  listings: Map<string, BusinessListingDTO>;
  enquiries: Map<string, CustomerEnquiryDTO>;
  matches: Map<string, EnquiryMatchDTO>;
  quotations: Map<string, BusinessQuotationDTO>;
  savedBusinesses: Map<string, { id: string; userId: string; businessId: string; createdAt: string }>;
  savedListings: Map<string, { id: string; userId: string; listingId: string; createdAt: string }>;
  reviews: Map<string, BusinessReviewDTO>;
  subscriptions: Map<string, BusinessSubscriptionDTO>;
  reports: Map<string, ModerationReportDTO>;
}

const globalForMarketplace = globalThis as unknown as {
  __proventaMarketplaceStore?: MarketplaceStore;
};

function getStore(): MarketplaceStore {
  if (!globalForMarketplace.__proventaMarketplaceStore) {
    globalForMarketplace.__proventaMarketplaceStore = {
      initialized: false,
      categories: new Map(),
      businesses: new Map(),
      teamMembers: new Map(),
      listings: new Map(),
      enquiries: new Map(),
      matches: new Map(),
      quotations: new Map(),
      savedBusinesses: new Map(),
      savedListings: new Map(),
      reviews: new Map(),
      subscriptions: new Map(),
      reports: new Map(),
    };
  }
  const store = globalForMarketplace.__proventaMarketplaceStore;
  if (!store.initialized) {
    seedInitialTaxonomy(store);
    store.initialized = true;
  }
  return store;
}

const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  'manufacturing-industrial': 'manufacturing',
  'it-software-digital': 'technology-software',
  'construction-real-estate': 'construction-building-materials',
  'electronics-electrical-hardware': 'industrial-supplies',
  'food-beverage-hospitality': 'food-hospitality',
  'packaging-printing': 'manufacturing',
};

function seedInitialTaxonomy(store: MarketplaceStore): void {
  store.categories.clear();
  for (const cat of INITIAL_MARKETPLACE_CATEGORIES) {
    const parentId = cat.id || `cat_${cat.slug}`;
    const subcats: MarketplaceCategoryDTO[] = [];

    for (let i = 0; i < cat.subcategories.length; i++) {
      const subItem = cat.subcategories[i] as
        | string
        | { id: string; name: string; slug: string; description?: string };
      const subName = typeof subItem === 'string' ? subItem : subItem.name;
      const subSlug =
        typeof subItem === 'string'
          ? `${cat.slug}-${subItem
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')}`
          : subItem.slug;
      const subId =
        typeof subItem === 'string' ? `subcat_${subSlug}` : subItem.id;
      const subDesc =
        typeof subItem === 'string'
          ? `${subName} under ${cat.name}`
          : subItem.description || `${subName} under ${cat.name}`;

      const subDto: MarketplaceCategoryDTO = {
        id: subId,
        name: subName,
        slug: subSlug,
        description: subDesc,
        icon: cat.icon,
        parentId,
        sortOrder: i + 1,
        active: true,
        attributeSchema: null,
      };
      store.categories.set(subId, subDto);
      subcats.push(subDto);
    }

    const parentDto: MarketplaceCategoryDTO = {
      id: parentId,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      parentId: null,
      sortOrder: cat.sortOrder,
      active: true,
      attributeSchema: (cat.enquiryAttributes ?? null) as CategoryAttributeField[] | null,
      subcategories: subcats,
    };
    store.categories.set(parentId, parentDto);
  }
}

export function resetMarketplaceStoreForTests(): void {
  const store = getStore();
  store.businesses.clear();
  store.teamMembers.clear();
  store.listings.clear();
  store.enquiries.clear();
  store.matches.clear();
  store.quotations.clear();
  store.savedBusinesses.clear();
  store.savedListings.clear();
  store.reviews.clear();
  store.subscriptions.clear();
  store.reports.clear();
  seedInitialTaxonomy(store);
}

// ============================================================
// 1. CATEGORIES & TAXONOMY
// ============================================================

export function getCategories(options?: {
  includeInactive?: boolean;
  onlyTopLevel?: boolean;
}): MarketplaceCategoryDTO[] {
  const store = getStore();
  const publishedBusinesses = Array.from(store.businesses.values()).filter(
    (b) => b.status === 'PUBLISHED',
  );
  const publishedListings = Array.from(store.listings.values()).filter(
    (l) => l.status === 'PUBLISHED',
  );

  const all = Array.from(store.categories.values()).filter((c) =>
    options?.includeInactive ? true : c.active,
  );

  const topLevel = all
    .filter((c) => c.parentId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((parent) => {
      const children = all
        .filter((s) => s.parentId === parent.id)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const businessCount = publishedBusinesses.filter(
        (b) =>
          b.primaryCategoryId === parent.id ||
          b.secondaryCategoryIds.includes(parent.id),
      ).length;
      const listingCount = publishedListings.filter(
        (l) => l.categoryId === parent.id,
      ).length;
      return {
        ...parent,
        subcategories: children,
        businessCount,
        listingCount,
      };
    });

  if (options?.onlyTopLevel !== false) {
    return topLevel;
  }
  return all;
}

export function getCategoryBySlugOrId(identifier: string): MarketplaceCategoryDTO | null {
  const store = getStore();
  const normalized = CATEGORY_SLUG_ALIASES[identifier] || identifier;
  const byId = store.categories.get(normalized);
  if (byId) return byId;

  for (const cat of store.categories.values()) {
    if (cat.slug === normalized || cat.id === normalized) {
      return cat;
    }
  }
  return null;
}

export function createCategory(input: {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  parentId?: string | null;
  sortOrder?: number;
  attributeSchema?: CategoryAttributeField[];
}): MarketplaceCategoryDTO {
  const store = getStore();
  const name = input.name.trim();
  if (name.length < 2) {
    throw new ValidationError('Category name must be at least 2 characters');
  }

  const slug = input.slug ? slugSchema.parse(input.slug) : generateUniqueSlug(name);
  const existing = getCategoryBySlugOrId(slug);
  if (existing) {
    throw new ConflictError(`A category with slug "${slug}" already exists`);
  }

  if (input.parentId) {
    const parent = store.categories.get(input.parentId);
    if (!parent) {
      throw new NotFoundError('Parent category');
    }
  }

  const id = `cat_${slug}`;
  const created: MarketplaceCategoryDTO = {
    id,
    name,
    slug,
    description: input.description?.trim() || null,
    icon: input.icon?.trim() || 'Briefcase',
    parentId: input.parentId ?? null,
    sortOrder: input.sortOrder ?? store.categories.size + 1,
    active: true,
    attributeSchema: input.attributeSchema ?? null,
    subcategories: [],
  };

  store.categories.set(id, created);
  return created;
}

// ============================================================
// 2. BUSINESS PROFILES & DIGITAL STOREFRONTS
// ============================================================

function hydrateBusinessDTO(
  raw: BusinessProfileDTO & { secondaryCategoryIds: string[] },
  includePrivateDetails = false,
): BusinessProfileDTO {
  const store = getStore();
  const primaryCategory = getCategoryBySlugOrId(raw.primaryCategoryId) ?? undefined;
  const secondaryCategories = raw.secondaryCategoryIds
    .map((id) => getCategoryBySlugOrId(id))
    .filter((c): c is MarketplaceCategoryDTO => Boolean(c));

  const listings = Array.from(store.listings.values())
    .filter((l) =>
      includePrivateDetails
        ? l.businessId === raw.id
        : l.businessId === raw.id && l.status === 'PUBLISHED',
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const reviews = Array.from(store.reviews.values())
    .filter((r) => r.businessId === raw.id && r.published)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const subscription = store.subscriptions.get(raw.id);

  return {
    ...raw,
    primaryCategory,
    secondaryCategories,
    listings,
    reviews,
    subscription,
  };
}

export function canUserManageBusiness(
  userId: string,
  businessId: string,
  isAdmin = false,
): boolean {
  if (isAdmin) return true;
  const store = getStore();
  const business = store.businesses.get(businessId);
  if (!business) return false;
  if (business.ownerId === userId) return true;

  const members = store.teamMembers.get(businessId) ?? [];
  return members.some(
    (m) =>
      m.userId === userId &&
      m.active &&
      (m.role === 'OWNER' || m.role === 'MANAGER' || m.role === 'RESPONDER'),
  );
}

export function createBusinessProfile(
  ownerId: string,
  rawInput: unknown,
): BusinessProfileDTO {
  const parsed = createBusinessSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message || 'Invalid business profile data',
    );
  }

  const data = parsed.data;
  const store = getStore();

  // Resolve primaryCategoryId by ID or slug
  const category = getCategoryBySlugOrId(data.primaryCategoryId);
  if (!category) {
    throw new ValidationError('Selected primary category does not exist');
  }

  const secondaryCategoryIds: string[] = [];
  for (const secId of data.secondaryCategoryIds ?? []) {
    const secCat = getCategoryBySlugOrId(secId);
    if (secCat && secCat.id !== category.id) {
      secondaryCategoryIds.push(secCat.id);
    }
  }

  // Unique slug resolution
  let desiredSlug = data.slug
    ? slugSchema.parse(data.slug)
    : generateUniqueSlug(data.name, data.city.toLowerCase());

  const existingWithSlug = Array.from(store.businesses.values()).find(
    (b) => b.slug === desiredSlug,
  );
  if (existingWithSlug) {
    if (data.slug) {
      throw new ConflictError(`The storefront URL slug "${desiredSlug}" is already taken`);
    }
    desiredSlug = `${desiredSlug}-${generateId(4).toLowerCase()}`;
  }

  const now = new Date().toISOString();
  const businessId = `biz_${generateId(12)}`;

  // Honest verification rule (Section 5 & Section 21):
  // Never label a business as legally verified merely because it registered.
  // Newly registered businesses start as SELF_REPORTED.
  const verificationLevel: VerificationLevel = 'SELF_REPORTED';
  const status = data.publishImmediately ? 'PUBLISHED' : 'DRAFT';

  const serviceAreas = Array.from(
    new Set([data.city.trim(), ...(data.serviceAreas ?? []).map((s) => s.trim())]),
  );

  const record: BusinessProfileDTO & { secondaryCategoryIds: string[] } = {
    id: businessId,
    ownerId,
    name: data.name,
    legalName: data.legalName || null,
    slug: desiredSlug,
    tagline: data.tagline || null,
    shortDescription: data.shortDescription,
    description: data.description,
    businessType: data.businessType,
    status,
    operatingStatus: data.operatingStatus,
    verificationLevel,
    primaryCategoryId: category.id,
    secondaryCategoryIds,
    logoUrl: data.logoUrl || null,
    coverImageUrl: data.coverImageUrl || null,
    yearEstablished: data.yearEstablished ?? null,
    gstNumber: data.gstNumber || null,
    registrationNumber: data.registrationNumber || null,
    contactEmail: data.contactEmail || null,
    contactPhone: data.contactPhone || null,
    whatsappNumber: data.whatsappNumber || null,
    website: data.website || null,
    socialLinks: data.socialLinks ?? null,
    addressLine1: data.addressLine1 || null,
    addressLine2: data.addressLine2 || null,
    area: data.area || null,
    city: data.city.trim(),
    state: data.state.trim() || 'Gujarat',
    postalCode: data.postalCode || null,
    country: data.country.trim() || 'India',
    serviceAreas,
    servesPanIndia: data.servesPanIndia,
    businessHours: data.businessHours ?? {
      Monday: '09:30 - 18:30',
      Tuesday: '09:30 - 18:30',
      Wednesday: '09:30 - 18:30',
      Thursday: '09:30 - 18:30',
      Friday: '09:30 - 18:30',
      Saturday: '10:00 - 17:00',
      Sunday: 'Closed',
    },
    highlights: data.highlights ?? [],
    tags: data.tags ?? [],
    featured: false,
    profileViews: 0,
    enquiryClicks: 0,
    contactClicks: 0,
    averageRating: null,
    reviewCount: 0,
    moderationNote: null,
    publishedAt: status === 'PUBLISHED' ? now : null,
    createdAt: now,
    updatedAt: now,
    media: [],
  };

  store.businesses.set(businessId, record);

  // Create default FREE subscription
  const freeLimits = getPlanLimits('FREE');
  const subscription: BusinessSubscriptionDTO = {
    id: `sub_${generateId(10)}`,
    businessId,
    planTier: 'FREE',
    status: 'ACTIVE',
    billingCycle: 'MONTHLY',
    amountInr: 0,
    quotationsUsedMonth: 0,
    quotationsLimitMonth: freeLimits.maxQuotationsPerMonth,
    listingsLimit: freeLimits.maxListings,
    teamMembersLimit: freeLimits.maxTeamMembers,
    currentPeriodStart: now,
    currentPeriodEnd: null,
  };
  store.subscriptions.set(businessId, subscription);

  // Register owner in team memberships
  store.teamMembers.set(businessId, [
    {
      id: `mem_${generateId(10)}`,
      businessId,
      userId: ownerId,
      role: 'OWNER',
      active: true,
      createdAt: now,
    },
  ]);

  return hydrateBusinessDTO(record, true);
}

export function updateBusinessProfile(
  actorId: string,
  businessIdOrSlug: string,
  rawInput: unknown,
  isAdmin = false,
): BusinessProfileDTO {
  const store = getStore();
  const existing =
    store.businesses.get(businessIdOrSlug) ??
    Array.from(store.businesses.values()).find((b) => b.slug === businessIdOrSlug);

  if (!existing) {
    throw new NotFoundError('Business profile');
  }

  if (!canUserManageBusiness(actorId, existing.id, isAdmin)) {
    throw new AuthorizationError('You do not have permission to edit this business profile');
  }

  const parsed = updateBusinessSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message || 'Invalid business update payload',
    );
  }
  const updates = parsed.data;

  // Non-admins cannot self-unsuspend a suspended business
  if (existing.status === 'SUSPENDED' && !isAdmin) {
    throw new AuthorizationError('Suspended business profiles can only be restored by moderation');
  }

  if (updates.status && updates.status !== existing.status) {
    assertBusinessStatusTransition(existing.status, updates.status);
  }

  if (updates.slug && updates.slug !== existing.slug) {
    const validSlug = slugSchema.parse(updates.slug);
    const conflict = Array.from(store.businesses.values()).find(
      (b) => b.slug === validSlug && b.id !== existing.id,
    );
    if (conflict) {
      throw new ConflictError(`The storefront URL slug "${validSlug}" is already in use`);
    }
    existing.slug = validSlug;
  }

  if (updates.primaryCategoryId) {
    const cat = getCategoryBySlugOrId(updates.primaryCategoryId);
    if (!cat) {
      throw new ValidationError('Invalid primary category');
    }
    existing.primaryCategoryId = cat.id;
  }

  if (updates.secondaryCategoryIds) {
    existing.secondaryCategoryIds = updates.secondaryCategoryIds
      .map((id) => getCategoryBySlugOrId(id)?.id)
      .filter((id): id is string => Boolean(id) && id !== existing.primaryCategoryId);
  }

  if (updates.name !== undefined) existing.name = updates.name;
  if (updates.legalName !== undefined) existing.legalName = updates.legalName || null;
  if (updates.tagline !== undefined) existing.tagline = updates.tagline || null;
  if (updates.shortDescription !== undefined) existing.shortDescription = updates.shortDescription;
  if (updates.description !== undefined) existing.description = updates.description;
  if (updates.businessType !== undefined) existing.businessType = updates.businessType;
  if (updates.operatingStatus !== undefined) existing.operatingStatus = updates.operatingStatus;
  if (updates.logoUrl !== undefined) existing.logoUrl = updates.logoUrl || null;
  if (updates.coverImageUrl !== undefined) existing.coverImageUrl = updates.coverImageUrl || null;
  if (updates.yearEstablished !== undefined) existing.yearEstablished = updates.yearEstablished ?? null;
  if (updates.gstNumber !== undefined) existing.gstNumber = updates.gstNumber || null;
  if (updates.registrationNumber !== undefined)
    existing.registrationNumber = updates.registrationNumber || null;
  if (updates.contactEmail !== undefined) existing.contactEmail = updates.contactEmail || null;
  if (updates.contactPhone !== undefined) existing.contactPhone = updates.contactPhone || null;
  if (updates.whatsappNumber !== undefined) existing.whatsappNumber = updates.whatsappNumber || null;
  if (updates.website !== undefined) existing.website = updates.website || null;
  if (updates.socialLinks !== undefined) existing.socialLinks = updates.socialLinks ?? null;
  if (updates.addressLine1 !== undefined) existing.addressLine1 = updates.addressLine1 || null;
  if (updates.addressLine2 !== undefined) existing.addressLine2 = updates.addressLine2 || null;
  if (updates.area !== undefined) existing.area = updates.area || null;
  if (updates.city !== undefined) existing.city = updates.city;
  if (updates.state !== undefined) existing.state = updates.state;
  if (updates.postalCode !== undefined) existing.postalCode = updates.postalCode || null;
  if (updates.serviceAreas !== undefined) existing.serviceAreas = updates.serviceAreas;
  if (updates.servesPanIndia !== undefined) existing.servesPanIndia = updates.servesPanIndia;
  if (updates.businessHours !== undefined) existing.businessHours = updates.businessHours;
  if (updates.highlights !== undefined) existing.highlights = updates.highlights;
  if (updates.tags !== undefined) existing.tags = updates.tags;

  if (updates.status) {
    existing.status = updates.status;
    if (updates.status === 'PUBLISHED' && !existing.publishedAt) {
      existing.publishedAt = new Date().toISOString();
    }
  }

  existing.updatedAt = new Date().toISOString();
  store.businesses.set(existing.id, existing);

  return hydrateBusinessDTO(existing, true);
}

export function getBusinessBySlug(
  slug: string,
  options?: { viewerUserId?: string | null; isAdmin?: boolean; incrementView?: boolean },
): { business: BusinessProfileDTO; relatedBusinesses: BusinessProfileDTO[] } {
  const store = getStore();
  const record = Array.from(store.businesses.values()).find(
    (b) => b.slug === slug || b.id === slug,
  );

  if (!record) {
    throw new NotFoundError('Business storefront');
  }

  const isOwnerOrTeam = options?.viewerUserId
    ? canUserManageBusiness(options.viewerUserId, record.id, options?.isAdmin)
    : false;

  if (record.status !== 'PUBLISHED' && !isOwnerOrTeam && !options?.isAdmin) {
    throw new NotFoundError('Business storefront');
  }

  if (options?.incrementView && record.status === 'PUBLISHED' && !isOwnerOrTeam) {
    record.profileViews += 1;
    store.businesses.set(record.id, record);
  }

  const hydrated = hydrateBusinessDTO(record, isOwnerOrTeam || Boolean(options?.isAdmin));

  const relatedBusinesses = Array.from(store.businesses.values())
    .filter(
      (b) =>
        b.id !== record.id &&
        b.status === 'PUBLISHED' &&
        (b.primaryCategoryId === record.primaryCategoryId ||
          b.city.toLowerCase() === record.city.toLowerCase()),
    )
    .slice(0, 4)
    .map((b) => hydrateBusinessDTO(b, false));

  return { business: hydrated, relatedBusinesses };
}

export function getBusinessesByUser(userId: string): BusinessProfileDTO[] {
  const store = getStore();
  const results: BusinessProfileDTO[] = [];

  for (const biz of store.businesses.values()) {
    if (canUserManageBusiness(userId, biz.id, false)) {
      results.push(hydrateBusinessDTO(biz, true));
    }
  }

  return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function searchBusinesses(params: DirectorySearchParams = {}): {
  items: BusinessProfileDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const store = getStore();
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, Math.max(1, params.limit ?? 12));

  let candidates = Array.from(store.businesses.values()).filter(
    (b) => b.status === 'PUBLISHED',
  );

  // Category filter
  if (params.categorySlug) {
    const cat = getCategoryBySlugOrId(params.categorySlug);
    if (cat) {
      candidates = candidates.filter(
        (b) =>
          b.primaryCategoryId === cat.id ||
          b.secondaryCategoryIds.includes(cat.id),
      );
    } else {
      candidates = [];
    }
  }

  // Subcategory filter
  if (params.subcategorySlug) {
    const subcat = getCategoryBySlugOrId(params.subcategorySlug);
    if (subcat) {
      candidates = candidates.filter((b) => {
        if (b.secondaryCategoryIds.includes(subcat.id)) return true;
        const bizListings = Array.from(store.listings.values()).filter(
          (l) => l.businessId === b.id && l.status === 'PUBLISHED',
        );
        return bizListings.some((l) => l.subcategoryId === subcat.id);
      });
    } else {
      candidates = [];
    }
  }

  // City / Service area filter
  if (params.city && params.city.trim().toLowerCase() !== 'all') {
    const cityNorm = params.city.trim().toLowerCase();
    candidates = candidates.filter(
      (b) =>
        b.city.toLowerCase() === cityNorm ||
        b.serviceAreas.some((s) => s.toLowerCase() === cityNorm) ||
        b.servesPanIndia,
    );
  }

  // State filter
  if (params.state && params.state.trim().toLowerCase() !== 'all') {
    const stateNorm = params.state.trim().toLowerCase();
    candidates = candidates.filter(
      (b) => b.state.toLowerCase() === stateNorm || b.servesPanIndia,
    );
  }

  // Business type filter
  if (params.businessType) {
    candidates = candidates.filter(
      (b) => b.businessType === params.businessType || b.businessType === 'HYBRID',
    );
  }

  // Verification level filter
  if (params.verificationLevel) {
    candidates = candidates.filter(
      (b) => b.verificationLevel === params.verificationLevel,
    );
  }

  // Pan-India filter
  if (params.servesPanIndia) {
    candidates = candidates.filter((b) => b.servesPanIndia);
  }

  // Keyword query search across business name, tagline, description, tags, highlights, category, and listings
  const query = params.query?.trim().toLowerCase();
  if (query) {
    const tokens = query.split(/\s+/).filter(Boolean);
    candidates = candidates.filter((b) => {
      const cat = getCategoryBySlugOrId(b.primaryCategoryId);
      const bizListings = Array.from(store.listings.values()).filter(
        (l) => l.businessId === b.id && l.status === 'PUBLISHED',
      );
      const corpus = [
        b.name,
        b.legalName ?? '',
        b.tagline ?? '',
        b.shortDescription ?? '',
        b.description ?? '',
        b.city,
        b.state,
        cat?.name ?? '',
        ...b.tags,
        ...b.highlights,
        ...b.serviceAreas,
        ...bizListings.map((l) => `${l.title} ${l.shortSummary ?? ''} ${l.tags.join(' ')}`),
      ]
        .join(' ')
        .toLowerCase();

      return tokens.every((t) => corpus.includes(t));
    });
  }

  // Sorting
  const sortBy = params.sortBy ?? 'relevance';
  candidates.sort((a, b) => {
    if (sortBy === 'newest') {
      return b.createdAt.localeCompare(a.createdAt);
    }
    if (sortBy === 'popular') {
      return b.profileViews - a.profileViews;
    }
    if (sortBy === 'rating') {
      return (b.averageRating ?? 0) - (a.averageRating ?? 0);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    // Relevance default: featured first, then verified, then views
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.profileViews !== b.profileViews) return b.profileViews - a.profileViews;
    return a.name.localeCompare(b.name);
  });

  const total = candidates.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const items = candidates
    .slice(start, start + limit)
    .map((b) => hydrateBusinessDTO(b, false));

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

// ============================================================
// 3. PRODUCT & SERVICE LISTINGS
// ============================================================

function hydrateListingDTO(raw: BusinessListingDTO): BusinessListingDTO {
  const store = getStore();
  const biz = store.businesses.get(raw.businessId);
  const cat = getCategoryBySlugOrId(raw.categoryId);
  const subcat = raw.subcategoryId ? getCategoryBySlugOrId(raw.subcategoryId) : null;

  return {
    ...raw,
    businessName: biz?.name,
    businessSlug: biz?.slug,
    businessCity: biz?.city,
    businessVerificationLevel: biz?.verificationLevel,
    categoryName: cat?.name,
    categorySlug: cat?.slug,
    subcategoryName: subcat?.name ?? null,
  };
}

export function createBusinessListing(
  actorId: string,
  rawInput: unknown,
  isAdmin = false,
): BusinessListingDTO {
  const parsed = createListingSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message || 'Invalid product/service listing data',
    );
  }
  const data = parsed.data;
  const store = getStore();

  const business = store.businesses.get(data.businessId);
  if (!business) {
    throw new NotFoundError('Business');
  }

  if (!canUserManageBusiness(actorId, business.id, isAdmin)) {
    throw new AuthorizationError('You do not have permission to add listings to this business');
  }

  // Enforce subscription plan listing limit
  const sub = store.subscriptions.get(business.id);
  const existingListingsCount = Array.from(store.listings.values()).filter(
    (l) => l.businessId === business.id && l.status !== 'ARCHIVED',
  ).length;
  assertEntitlement(checkListingEntitlement(sub, existingListingsCount));

  const category = getCategoryBySlugOrId(data.categoryId);
  if (!category) {
    throw new ValidationError('Selected listing category does not exist');
  }

  const subcategory = data.subcategoryId
    ? getCategoryBySlugOrId(data.subcategoryId)
    : null;

  let desiredSlug = data.slug
    ? slugSchema.parse(data.slug)
    : generateUniqueSlug(data.title, generateId(5).toLowerCase());

  const conflict = Array.from(store.listings.values()).find(
    (l) => l.slug === desiredSlug,
  );
  if (conflict) {
    desiredSlug = `${desiredSlug}-${generateId(4).toLowerCase()}`;
  }

  const now = new Date().toISOString();
  const id = `lst_${generateId(12)}`;

  const listing: BusinessListingDTO = {
    id,
    businessId: business.id,
    categoryId: category.id,
    subcategoryId: subcategory?.id ?? null,
    title: data.title,
    slug: desiredSlug,
    shortSummary: data.shortSummary || null,
    description: data.description,
    listingType: data.listingType,
    status: data.status,
    priceDisplayType: data.priceDisplayType,
    priceAmount:
      data.priceDisplayType === 'PRICE_ON_REQUEST' ||
      data.priceDisplayType === 'QUOTE_REQUIRED'
        ? null
        : (data.priceAmount ?? null),
    priceMaxAmount: data.priceMaxAmount ?? null,
    currency: data.currency || 'INR',
    priceUnit: data.priceUnit || null,
    images: data.images ?? [],
    specifications: data.specifications ?? null,
    tags: data.tags ?? [],
    availabilityStatus: data.availabilityStatus,
    deliveryTimeframe: data.deliveryTimeframe || null,
    serviceAreaOverride: data.serviceAreaOverride ?? [],
    ctaLabel: data.ctaLabel || 'Send Enquiry',
    featured: false,
    viewsCount: 0,
    enquiryCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  store.listings.set(id, listing);
  return hydrateListingDTO(listing);
}

export function updateBusinessListing(
  actorId: string,
  listingId: string,
  rawInput: unknown,
  isAdmin = false,
): BusinessListingDTO {
  const store = getStore();
  const existing = store.listings.get(listingId);
  if (!existing) {
    throw new NotFoundError('Listing');
  }

  if (!canUserManageBusiness(actorId, existing.businessId, isAdmin)) {
    throw new AuthorizationError('You do not have permission to modify this listing');
  }

  const parsed = updateListingSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message || 'Invalid listing update data',
    );
  }
  const updates = parsed.data;

  if (updates.categoryId) {
    const cat = getCategoryBySlugOrId(updates.categoryId);
    if (!cat) throw new ValidationError('Invalid category');
    existing.categoryId = cat.id;
  }
  if (updates.subcategoryId !== undefined) {
    existing.subcategoryId = updates.subcategoryId
      ? (getCategoryBySlugOrId(updates.subcategoryId)?.id ?? null)
      : null;
  }
  if (updates.title !== undefined) existing.title = updates.title;
  if (updates.shortSummary !== undefined) existing.shortSummary = updates.shortSummary || null;
  if (updates.description !== undefined) existing.description = updates.description;
  if (updates.listingType !== undefined) existing.listingType = updates.listingType;
  if (updates.status !== undefined) existing.status = updates.status;
  if (updates.priceDisplayType !== undefined) existing.priceDisplayType = updates.priceDisplayType;
  if (updates.priceAmount !== undefined) existing.priceAmount = updates.priceAmount;
  if (updates.priceMaxAmount !== undefined) existing.priceMaxAmount = updates.priceMaxAmount;
  if (updates.priceUnit !== undefined) existing.priceUnit = updates.priceUnit || null;
  if (updates.images !== undefined) existing.images = updates.images;
  if (updates.specifications !== undefined) existing.specifications = updates.specifications;
  if (updates.tags !== undefined) existing.tags = updates.tags;
  if (updates.availabilityStatus !== undefined)
    existing.availabilityStatus = updates.availabilityStatus;
  if (updates.deliveryTimeframe !== undefined)
    existing.deliveryTimeframe = updates.deliveryTimeframe || null;
  if (updates.serviceAreaOverride !== undefined)
    existing.serviceAreaOverride = updates.serviceAreaOverride;
  if (updates.ctaLabel !== undefined) existing.ctaLabel = updates.ctaLabel;

  existing.updatedAt = new Date().toISOString();
  store.listings.set(existing.id, existing);

  return hydrateListingDTO(existing);
}

export function deleteBusinessListing(
  actorId: string,
  listingId: string,
  isAdmin = false,
): void {
  const store = getStore();
  const existing = store.listings.get(listingId);
  if (!existing) {
    throw new NotFoundError('Listing');
  }
  if (!canUserManageBusiness(actorId, existing.businessId, isAdmin)) {
    throw new AuthorizationError('You do not have permission to delete this listing');
  }
  store.listings.delete(listingId);
}

export function searchListings(params: ListingSearchParams = {}): {
  items: BusinessListingDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const store = getStore();
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, Math.max(1, params.limit ?? 12));

  // Only show PUBLISHED listings belonging to PUBLISHED businesses
  let candidates = Array.from(store.listings.values()).filter((l) => {
    if (l.status !== 'PUBLISHED') return false;
    const biz = store.businesses.get(l.businessId);
    return Boolean(biz && biz.status === 'PUBLISHED');
  });

  if (params.businessId) {
    candidates = candidates.filter((l) => l.businessId === params.businessId);
  }

  if (params.categorySlug) {
    const cat = getCategoryBySlugOrId(params.categorySlug);
    if (cat) {
      candidates = candidates.filter((l) => l.categoryId === cat.id);
    } else {
      candidates = [];
    }
  }

  if (params.subcategorySlug) {
    const subcat = getCategoryBySlugOrId(params.subcategorySlug);
    if (subcat) {
      candidates = candidates.filter((l) => l.subcategoryId === subcat.id);
    } else {
      candidates = [];
    }
  }

  if (params.listingType) {
    candidates = candidates.filter((l) => l.listingType === params.listingType);
  }

  if (params.priceDisplayType) {
    candidates = candidates.filter(
      (l) => l.priceDisplayType === params.priceDisplayType,
    );
  }

  if (params.city && params.city.trim().toLowerCase() !== 'all') {
    const cityNorm = params.city.trim().toLowerCase();
    candidates = candidates.filter((l) => {
      const biz = store.businesses.get(l.businessId);
      if (!biz) return false;
      return (
        biz.city.toLowerCase() === cityNorm ||
        biz.serviceAreas.some((s) => s.toLowerCase() === cityNorm) ||
        l.serviceAreaOverride.some((s) => s.toLowerCase() === cityNorm) ||
        biz.servesPanIndia
      );
    });
  }

  if (typeof params.minPrice === 'number') {
    candidates = candidates.filter(
      (l) => typeof l.priceAmount === 'number' && l.priceAmount >= params.minPrice!,
    );
  }
  if (typeof params.maxPrice === 'number') {
    candidates = candidates.filter(
      (l) => typeof l.priceAmount === 'number' && l.priceAmount <= params.maxPrice!,
    );
  }

  const query = params.query?.trim().toLowerCase();
  if (query) {
    const tokens = query.split(/\s+/).filter(Boolean);
    candidates = candidates.filter((l) => {
      const biz = store.businesses.get(l.businessId);
      const corpus = [
        l.title,
        l.shortSummary ?? '',
        l.description,
        ...l.tags,
        biz?.name ?? '',
        biz?.city ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return tokens.every((t) => corpus.includes(t));
    });
  }

  const sortBy = params.sortBy ?? 'relevance';
  candidates.sort((a, b) => {
    if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
    if (sortBy === 'price_asc') return (a.priceAmount ?? 999999999) - (b.priceAmount ?? 999999999);
    if (sortBy === 'price_desc') return (b.priceAmount ?? 0) - (a.priceAmount ?? 0);
    if (sortBy === 'popular') return b.viewsCount - a.viewsCount;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const total = candidates.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const items = candidates.slice(start, start + limit).map(hydrateListingDTO);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

// ============================================================
// 4. CUSTOMER ENQUIRY MARKETPLACE & MATCHING ENGINE
// ============================================================

function hydrateEnquiryDTO(raw: CustomerEnquiryDTO): CustomerEnquiryDTO {
  const store = getStore();
  const cat = getCategoryBySlugOrId(raw.categoryId);
  const subcat = raw.subcategoryId ? getCategoryBySlugOrId(raw.subcategoryId) : null;
  const targetBiz = raw.targetBusinessId ? store.businesses.get(raw.targetBusinessId) : null;
  const targetLst = raw.targetListingId ? store.listings.get(raw.targetListingId) : null;

  const matches = Array.from(store.matches.values())
    .filter((m) => m.enquiryId === raw.id)
    .sort((a, b) => b.matchScore - a.matchScore)
    .map((m) => {
      const biz = store.businesses.get(m.businessId);
      return {
        ...m,
        businessName: biz?.name,
        businessSlug: biz?.slug,
        businessCity: biz?.city,
        businessVerificationLevel: biz?.verificationLevel,
      };
    });

  const quotations = Array.from(store.quotations.values())
    .filter((q) => q.enquiryId === raw.id && q.status !== 'WITHDRAWN')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((q) => {
      const biz = store.businesses.get(q.businessId);
      return {
        ...q,
        businessName: biz?.name,
        businessSlug: biz?.slug,
        businessCity: biz?.city,
        businessVerificationLevel: biz?.verificationLevel,
        businessContactPhone: biz?.contactPhone ?? null,
        businessContactEmail: biz?.contactEmail ?? null,
      };
    });

  return {
    ...raw,
    categoryName: cat?.name,
    categorySlug: cat?.slug,
    subcategoryName: subcat?.name ?? null,
    targetBusinessName: targetBiz?.name ?? null,
    targetListingTitle: targetLst?.title ?? null,
    matchedCount: matches.length,
    responsesCount: quotations.length,
    matches,
    quotations,
  };
}

export async function createCustomerEnquiry(
  customer: { id: string; name?: string | null; email?: string | null; phone?: string | null },
  rawInput: unknown,
): Promise<{
  enquiry: CustomerEnquiryDTO;
  matchedBusinessesCount: number;
  notificationsDispatched: number;
}> {
  const parsed = createEnquirySchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message || 'Invalid customer enquiry data',
    );
  }
  const data = parsed.data;
  const store = getStore();

  const category = getCategoryBySlugOrId(data.categoryId);
  if (!category) {
    throw new ValidationError('Selected enquiry category does not exist');
  }
  const subcategory = data.subcategoryId
    ? getCategoryBySlugOrId(data.subcategoryId)
    : null;

  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const enquiryId = `enq_${generateId(12)}`;
  const referenceCode = `PRV-ENQ-${generateId(6).toUpperCase()}`;

  const enquiryRecord: CustomerEnquiryDTO = {
    id: enquiryId,
    referenceCode,
    customerId: customer.id,
    customerName: customer.name || 'PROVENTA Customer',
    customerEmail: customer.email || null,
    customerPhone: customer.phone || null,
    categoryId: category.id,
    subcategoryId: subcategory?.id ?? null,
    targetBusinessId: data.targetBusinessId || null,
    targetListingId: data.targetListingId || null,
    title: data.title,
    description: data.description,
    requirementType: data.requirementType,
    city: data.city.trim(),
    state: data.state.trim() || 'Gujarat',
    deliveryMode: data.deliveryMode,
    quantity: data.quantity || null,
    budgetMin: data.budgetMin ?? null,
    budgetMax: data.budgetMax ?? null,
    currency: data.currency || 'INR',
    timeline: data.timeline || null,
    urgency: data.urgency,
    categoryAttributes: data.categoryAttributes ?? null,
    attachments: data.attachments ?? [],
    preferredContactMethod: data.preferredContactMethod,
    shareContactWithShortlistedOnly: data.shareContactWithShortlistedOnly,
    status: 'OPEN',
    matchedCount: 0,
    responsesCount: 0,
    expiresAt,
    closedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  store.enquiries.set(enquiryId, enquiryRecord);

  // Increment target business/listing enquiry click counters if direct
  if (data.targetBusinessId) {
    const tb = store.businesses.get(data.targetBusinessId);
    if (tb) {
      tb.enquiryClicks += 1;
      store.businesses.set(tb.id, tb);
    }
  }
  if (data.targetListingId) {
    const tl = store.listings.get(data.targetListingId);
    if (tl) {
      tl.enquiryCount += 1;
      store.listings.set(tl.id, tl);
    }
  }

  // Run Matching Engine across all candidate businesses
  const candidateBusinesses = Array.from(store.businesses.values()).map((b) =>
    hydrateBusinessDTO(b, true),
  );
  const scoredMatches = matchBusinessesForEnquiry(
    enquiryRecord,
    candidateBusinesses,
  );

  let notificationsDispatched = 0;

  for (const match of scoredMatches) {
    const matchId = `mtc_${generateId(12)}`;
    const matchRecord: EnquiryMatchDTO = {
      id: matchId,
      enquiryId,
      businessId: match.businessId,
      matchScore: match.matchScore,
      matchReasons: match.matchReasons,
      scoreBreakdown: match.scoreBreakdown,
      status: 'NOTIFIED',
      notifiedAt: now,
      viewedAt: null,
      respondedAt: null,
      declinedAt: null,
      declineReason: null,
      notificationDedupeKey: match.notificationDedupeKey,
      createdAt: now,
    };
    store.matches.set(matchId, matchRecord);

    const biz = store.businesses.get(match.businessId);
    if (biz) {
      const notifResult = await sendMarketplaceNotification({
        userId: biz.ownerId,
        type: 'ENQUIRY_MATCHED',
        title: `New Matched Enquiry: ${enquiryRecord.title}`,
        body: `Your business "${biz.name}" matched a customer requirement in ${enquiryRecord.city} (${match.matchScore}% match). Submit a quotation from your Business Dashboard.`,
        actionUrl: `/business/dashboard?tab=enquiries&enquiryId=${enquiryId}`,
        dedupeKey: match.notificationDedupeKey,
        metadata: {
          enquiryId,
          businessId: biz.id,
          matchScore: match.matchScore,
        },
      });
      if (notifResult.delivered) {
        notificationsDispatched += 1;
      }
    }
  }

  enquiryRecord.matchedCount = scoredMatches.length;
  enquiryRecord.status = scoredMatches.length > 0 ? 'MATCHING' : 'OPEN';
  store.enquiries.set(enquiryId, enquiryRecord);

  return {
    enquiry: hydrateEnquiryDTO(enquiryRecord),
    matchedBusinessesCount: scoredMatches.length,
    notificationsDispatched,
  };
}

export function getEnquiryByIdForViewer(
  enquiryId: string,
  viewer: { userId: string; isAdmin?: boolean },
): CustomerEnquiryDTO {
  const store = getStore();
  const raw =
    store.enquiries.get(enquiryId) ??
    Array.from(store.enquiries.values()).find((e) => e.referenceCode === enquiryId);

  if (!raw) {
    throw new NotFoundError('Customer enquiry');
  }

  const hydrated = hydrateEnquiryDTO(raw);
  const viewerBusinesses = getBusinessesByUser(viewer.userId);
  const viewerBusinessIds = viewerBusinesses.map((b) => b.id);

  const isOwner = raw.customerId === viewer.userId;
  const isMatchedBusiness = (hydrated.matches ?? []).some((m) =>
    viewerBusinessIds.includes(m.businessId),
  );

  // Enforce strict authorization: only the customer who posted it, a matched business, or an admin can view the enquiry
  if (!isOwner && !isMatchedBusiness && !viewer.isAdmin) {
    throw new AuthorizationError('You do not have permission to view this enquiry');
  }

  return redactEnquiryForViewer(hydrated, {
    userId: viewer.userId,
    isAdmin: viewer.isAdmin,
    businessIdsOwned: viewerBusinessIds,
  });
}

export function listEnquiriesForCustomer(customerId: string): CustomerEnquiryDTO[] {
  const store = getStore();
  return Array.from(store.enquiries.values())
    .filter((e) => e.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(hydrateEnquiryDTO);
}

export function listMatchedEnquiriesForBusiness(
  actorId: string,
  businessId: string,
  isAdmin = false,
): Array<{ match: EnquiryMatchDTO; enquiry: CustomerEnquiryDTO; myQuotation: BusinessQuotationDTO | null }> {
  if (!canUserManageBusiness(actorId, businessId, isAdmin)) {
    throw new AuthorizationError('You do not have permission to view enquiries for this business');
  }

  const store = getStore();
  const matches = Array.from(store.matches.values())
    .filter((m) => m.businessId === businessId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return matches
    .map((m) => {
      const rawEnq = store.enquiries.get(m.enquiryId);
      if (!rawEnq) return null;
      const hydrated = hydrateEnquiryDTO(rawEnq);
      const redacted = redactEnquiryForViewer(hydrated, {
        userId: actorId,
        isAdmin,
        businessIdsOwned: [businessId],
      });
      const myQuotation =
        (hydrated.quotations ?? []).find((q) => q.businessId === businessId) ?? null;
      return {
        match: m,
        enquiry: redacted,
        myQuotation,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export function updateCustomerEnquiryLifecycle(
  customerId: string,
  enquiryId: string,
  action: 'CLOSE' | 'CANCEL',
  isAdmin = false,
): CustomerEnquiryDTO {
  const store = getStore();
  const raw = store.enquiries.get(enquiryId);
  if (!raw) {
    throw new NotFoundError('Enquiry');
  }
  if (raw.customerId !== customerId && !isAdmin) {
    throw new AuthorizationError('Only the customer who created this enquiry can close or cancel it');
  }

  const nextStatus = action === 'CLOSE' ? 'CLOSED' : 'CANCELLED';
  assertEnquiryStatusTransition(raw.status, nextStatus);

  raw.status = nextStatus;
  raw.closedAt = new Date().toISOString();
  raw.updatedAt = raw.closedAt;
  store.enquiries.set(raw.id, raw);

  return hydrateEnquiryDTO(raw);
}

// ============================================================
// 5. QUOTATIONS & BUSINESS RESPONSES
// ============================================================

export async function submitOrUpdateQuotation(
  actorId: string,
  rawInput: unknown,
  isAdmin = false,
): Promise<BusinessQuotationDTO> {
  const parsed = createQuotationSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message || 'Invalid quotation response data',
    );
  }
  const data = parsed.data;
  const store = getStore();

  const business = store.businesses.get(data.businessId);
  if (!business) {
    throw new NotFoundError('Business');
  }

  if (!canUserManageBusiness(actorId, business.id, isAdmin)) {
    throw new AuthorizationError('You do not have permission to submit quotations on behalf of this business');
  }

  if (business.status !== 'PUBLISHED') {
    throw new ValidationError('Only published businesses can submit quotations to customer enquiries');
  }

  const enquiry = store.enquiries.get(data.enquiryId);
  if (!enquiry) {
    throw new NotFoundError('Customer enquiry');
  }

  if (!isEnquiryOpenForQuotations(enquiry.status)) {
    throw new ValidationError(`This enquiry is currently ${enquiry.status} and is no longer accepting quotations`);
  }

  // Verify the business is matched to the enquiry (or is the direct target)
  const match = Array.from(store.matches.values()).find(
    (m) => m.enquiryId === enquiry.id && m.businessId === business.id,
  );
  if (!match && enquiry.targetBusinessId !== business.id && !isAdmin) {
    throw new AuthorizationError('Your business was not matched to this customer enquiry');
  }

  // Check if updating an existing quotation or creating a new one
  const existingQuote = Array.from(store.quotations.values()).find(
    (q) => q.enquiryId === enquiry.id && q.businessId === business.id,
  );

  const now = new Date().toISOString();
  const validUntil = new Date(
    Date.now() + (data.validityDays ?? 14) * 24 * 60 * 60 * 1000,
  ).toISOString();

  if (existingQuote) {
    assertQuotationStatusTransition(existingQuote.status, 'UPDATED');
    existingQuote.summary = data.summary;
    existingQuote.detailedProposal = data.detailedProposal;
    existingQuote.priceType = data.priceType;
    existingQuote.priceAmount = data.priceAmount ?? null;
    existingQuote.priceMaxAmount = data.priceMaxAmount ?? null;
    existingQuote.priceUnit = data.priceUnit || null;
    existingQuote.deliveryTimeline = data.deliveryTimeline;
    existingQuote.validityDays = data.validityDays;
    existingQuote.validUntil = validUntil;
    existingQuote.inclusions = data.inclusions ?? [];
    existingQuote.exclusions = data.exclusions || null;
    existingQuote.termsAndAssumptions = data.termsAndAssumptions || null;
    existingQuote.availabilityNote = data.availabilityNote || null;
    existingQuote.attachments = data.attachments ?? [];
    existingQuote.followUpPreference = data.followUpPreference;
    existingQuote.status = 'UPDATED';
    existingQuote.updatedAt = now;

    store.quotations.set(existingQuote.id, existingQuote);
    return existingQuote;
  }

  // New quotation: enforce monthly quotation limit for the business's subscription tier
  const sub = store.subscriptions.get(business.id);
  assertEntitlement(checkQuotationEntitlement(sub));

  const quoteId = `quo_${generateId(12)}`;
  const referenceCode = `PRV-QUO-${generateId(6).toUpperCase()}`;

  const quotation: BusinessQuotationDTO = {
    id: quoteId,
    referenceCode,
    enquiryId: enquiry.id,
    businessId: business.id,
    businessName: business.name,
    businessSlug: business.slug,
    businessCity: business.city,
    businessVerificationLevel: business.verificationLevel,
    businessContactPhone: business.contactPhone,
    businessContactEmail: business.contactEmail,
    submittedById: actorId,
    summary: data.summary,
    detailedProposal: data.detailedProposal,
    priceType: data.priceType,
    priceAmount: data.priceAmount ?? null,
    priceMaxAmount: data.priceMaxAmount ?? null,
    currency: data.currency || 'INR',
    priceUnit: data.priceUnit || null,
    deliveryTimeline: data.deliveryTimeline,
    validityDays: data.validityDays,
    validUntil,
    inclusions: data.inclusions ?? [],
    exclusions: data.exclusions || null,
    termsAndAssumptions: data.termsAndAssumptions || null,
    availabilityNote: data.availabilityNote || null,
    attachments: data.attachments ?? [],
    followUpPreference: data.followUpPreference,
    status: 'SUBMITTED',
    customerNote: null,
    shortlistedAt: null,
    acceptedAt: null,
    rejectedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  store.quotations.set(quoteId, quotation);

  // Increment subscription monthly usage counter
  if (sub) {
    sub.quotationsUsedMonth += 1;
    store.subscriptions.set(business.id, sub);
  }

  // Update match status to RESPONDED
  if (match) {
    match.status = 'RESPONDED';
    match.respondedAt = now;
    store.matches.set(match.id, match);
  }

  // Advance enquiry status to RESPONSES_RECEIVED if currently OPEN or MATCHING
  if (enquiry.status === 'OPEN' || enquiry.status === 'MATCHING') {
    enquiry.status = 'RESPONSES_RECEIVED';
  }
  enquiry.responsesCount += 1;
  enquiry.updatedAt = now;
  store.enquiries.set(enquiry.id, enquiry);

  // Notify customer
  await sendMarketplaceNotification({
    userId: enquiry.customerId,
    type: 'QUOTATION_RECEIVED',
    title: `New Quotation from ${business.name}`,
    body: `${business.name} submitted a quotation for "${enquiry.title}": ${quotation.summary}`,
    actionUrl: `/dashboard?tab=enquiries&enquiryId=${enquiry.id}`,
    dedupeKey: `quote_received:${quotation.id}`,
    metadata: {
      enquiryId: enquiry.id,
      quotationId: quotation.id,
      businessId: business.id,
    },
  });

  return quotation;
}

export async function updateQuotationStatusByCustomer(
  customerId: string,
  quotationId: string,
  action: 'SHORTLIST' | 'ACCEPT' | 'REJECT',
  customerNote?: string,
  isAdmin = false,
): Promise<BusinessQuotationDTO> {
  const store = getStore();
  const quotation = store.quotations.get(quotationId);
  if (!quotation) {
    throw new NotFoundError('Quotation');
  }

  const enquiry = store.enquiries.get(quotation.enquiryId);
  if (!enquiry) {
    throw new NotFoundError('Enquiry');
  }

  if (enquiry.customerId !== customerId && !isAdmin) {
    throw new AuthorizationError('Only the customer who posted this enquiry can shortlist, accept, or reject quotations');
  }

  const targetStatus =
    action === 'SHORTLIST'
      ? 'SHORTLISTED'
      : action === 'ACCEPT'
        ? 'ACCEPTED'
        : 'REJECTED';

  assertQuotationStatusTransition(quotation.status, targetStatus);

  const now = new Date().toISOString();
  quotation.status = targetStatus;
  if (customerNote !== undefined) {
    quotation.customerNote = customerNote || null;
  }
  if (targetStatus === 'SHORTLISTED') quotation.shortlistedAt = now;
  if (targetStatus === 'ACCEPTED') quotation.acceptedAt = now;
  if (targetStatus === 'REJECTED') quotation.rejectedAt = now;
  quotation.updatedAt = now;
  store.quotations.set(quotation.id, quotation);

  // Update enquiry status correspondingly
  if (targetStatus === 'SHORTLISTED' && enquiry.status === 'RESPONSES_RECEIVED') {
    enquiry.status = 'SHORTLISTED';
    enquiry.updatedAt = now;
    store.enquiries.set(enquiry.id, enquiry);
  } else if (targetStatus === 'ACCEPTED') {
    enquiry.status = 'ACCEPTED';
    enquiry.updatedAt = now;
    store.enquiries.set(enquiry.id, enquiry);
  }

  const biz = store.businesses.get(quotation.businessId);
  if (biz) {
    await sendMarketplaceNotification({
      userId: biz.ownerId,
      type: 'QUOTATION_STATUS_UPDATED',
      title: `Quotation ${targetStatus.toLowerCase()} for "${enquiry.title}"`,
      body: `The customer has ${targetStatus.toLowerCase()} your quotation (${quotation.referenceCode}).`,
      actionUrl: `/business/dashboard?tab=quotations`,
      dedupeKey: `quote_status:${quotation.id}:${targetStatus}`,
    });
  }

  return quotation;
}

// ============================================================
// 6. SAVED BUSINESSES, SAVED LISTINGS & REVIEWS
// ============================================================

export function toggleSavedBusiness(
  userId: string,
  businessId: string,
): { saved: boolean } {
  const store = getStore();
  const biz = store.businesses.get(businessId);
  if (!biz || biz.status !== 'PUBLISHED') {
    throw new NotFoundError('Business');
  }

  const key = `${userId}:${businessId}`;
  if (store.savedBusinesses.has(key)) {
    store.savedBusinesses.delete(key);
    return { saved: false };
  }

  store.savedBusinesses.set(key, {
    id: `savb_${generateId(10)}`,
    userId,
    businessId,
    createdAt: new Date().toISOString(),
  });
  return { saved: true };
}

export function toggleSavedListing(
  userId: string,
  listingId: string,
): { saved: boolean } {
  const store = getStore();
  const listing = store.listings.get(listingId);
  if (!listing || listing.status !== 'PUBLISHED') {
    throw new NotFoundError('Listing');
  }

  const key = `${userId}:${listingId}`;
  if (store.savedListings.has(key)) {
    store.savedListings.delete(key);
    return { saved: false };
  }

  store.savedListings.set(key, {
    id: `savl_${generateId(10)}`,
    userId,
    listingId,
    createdAt: new Date().toISOString(),
  });
  return { saved: true };
}

export function getSavedItemsForUser(userId: string): {
  savedBusinesses: BusinessProfileDTO[];
  savedListings: BusinessListingDTO[];
} {
  const store = getStore();
  const savedBusinesses: BusinessProfileDTO[] = [];
  const savedListings: BusinessListingDTO[] = [];

  for (const item of store.savedBusinesses.values()) {
    if (item.userId === userId) {
      const biz = store.businesses.get(item.businessId);
      if (biz && biz.status === 'PUBLISHED') {
        savedBusinesses.push(hydrateBusinessDTO(biz, false));
      }
    }
  }

  for (const item of store.savedListings.values()) {
    if (item.userId === userId) {
      const lst = store.listings.get(item.listingId);
      if (lst && lst.status === 'PUBLISHED') {
        savedListings.push(hydrateListingDTO(lst));
      }
    }
  }

  return { savedBusinesses, savedListings };
}

export function submitBusinessReview(
  user: { id: string; name?: string | null },
  rawInput: unknown,
): BusinessReviewDTO {
  const parsed = createReviewSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message || 'Invalid review data',
    );
  }
  const data = parsed.data;
  const store = getStore();

  const biz = store.businesses.get(data.businessId);
  if (!biz || biz.status !== 'PUBLISHED') {
    throw new NotFoundError('Business');
  }

  if (biz.ownerId === user.id) {
    throw new ValidationError('Business owners cannot review their own business profile');
  }

  // Check if customer had a real accepted/shortlisted quotation interaction with this business
  const hadVerifiedInteraction = Array.from(store.enquiries.values()).some((enq) => {
    if (enq.customerId !== user.id) return false;
    return Array.from(store.quotations.values()).some(
      (q) =>
        q.enquiryId === enq.id &&
        q.businessId === biz.id &&
        (q.status === 'SHORTLISTED' || q.status === 'ACCEPTED'),
    );
  });

  const reviewId = `rev_${biz.id}_${user.id}`;
  const now = new Date().toISOString();

  const review: BusinessReviewDTO = {
    id: reviewId,
    businessId: biz.id,
    userId: user.id,
    userName: user.name || 'Customer',
    enquiryId: data.enquiryId || null,
    rating: data.rating,
    title: data.title || null,
    comment: data.comment,
    verifiedInteraction: hadVerifiedInteraction,
    published: true,
    createdAt: now,
  };

  store.reviews.set(reviewId, review);

  // Recalculate business rating
  const allBizReviews = Array.from(store.reviews.values()).filter(
    (r) => r.businessId === biz.id && r.published,
  );
  biz.reviewCount = allBizReviews.length;
  biz.averageRating =
    allBizReviews.length > 0
      ? Number(
          (
            allBizReviews.reduce((acc, r) => acc + r.rating, 0) /
            allBizReviews.length
          ).toFixed(1),
        )
      : null;
  store.businesses.set(biz.id, biz);

  return review;
}

// ============================================================
// 7. SUBSCRIPTIONS, TEAM & ANALYTICS
// ============================================================

export function upgradeBusinessSubscriptionPlan(
  actorId: string,
  businessId: string,
  planTier: SubscriptionPlanTier,
  billingCycle: 'MONTHLY' | 'ANNUAL' = 'MONTHLY',
  paymentVerified = true,
  isAdmin = false,
): BusinessSubscriptionDTO {
  if (!canUserManageBusiness(actorId, businessId, isAdmin)) {
    throw new AuthorizationError('You do not have permission to manage subscriptions for this business');
  }

  const store = getStore();
  const biz = store.businesses.get(businessId);
  if (!biz) {
    throw new NotFoundError('Business');
  }

  if (planTier !== 'FREE' && !paymentVerified && !isAdmin) {
    throw new ValidationError('Verified payment confirmation is required to activate a paid plan');
  }

  const planConfig = BUSINESS_SUBSCRIPTION_PLANS[planTier];
  const now = new Date();
  const periodEnd = new Date(
    now.getTime() + (billingCycle === 'ANNUAL' ? 365 : 30) * 24 * 60 * 60 * 1000,
  );

  const existing = store.subscriptions.get(businessId);
  const updated: BusinessSubscriptionDTO = {
    id: existing?.id ?? `sub_${generateId(10)}`,
    businessId,
    planTier,
    status: 'ACTIVE',
    billingCycle,
    amountInr:
      billingCycle === 'ANNUAL'
        ? planConfig.annualPriceInr
        : planConfig.monthlyPriceInr,
    quotationsUsedMonth: existing?.quotationsUsedMonth ?? 0,
    quotationsLimitMonth: planConfig.limits.maxQuotationsPerMonth,
    listingsLimit: planConfig.limits.maxListings,
    teamMembersLimit: planConfig.limits.maxTeamMembers,
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: periodEnd.toISOString(),
  };

  store.subscriptions.set(businessId, updated);
  return updated;
}

export function addBusinessTeamMember(
  actorId: string,
  businessId: string,
  member: { userId: string; email?: string; name?: string; role: 'MANAGER' | 'RESPONDER' | 'VIEWER' },
  isAdmin = false,
): BusinessTeamMemberDTO[] {
  const store = getStore();
  const biz = store.businesses.get(businessId);
  if (!biz) throw new NotFoundError('Business');

  if (biz.ownerId !== actorId && !isAdmin) {
    throw new AuthorizationError('Only the business owner can add team members');
  }

  const currentMembers = store.teamMembers.get(businessId) ?? [];
  const sub = store.subscriptions.get(businessId);
  assertEntitlement(checkTeamMemberEntitlement(sub, currentMembers.length));

  if (currentMembers.some((m) => m.userId === member.userId)) {
    throw new ConflictError('This user is already a member of this business team');
  }

  const nextMember: BusinessTeamMemberDTO = {
    id: `mem_${generateId(10)}`,
    businessId,
    userId: member.userId,
    email: member.email,
    name: member.name,
    role: member.role,
    active: true,
    createdAt: new Date().toISOString(),
  };

  const updated = [...currentMembers, nextMember];
  store.teamMembers.set(businessId, updated);
  return updated;
}

export function getBusinessDashboardSummary(
  actorId: string,
  businessId?: string,
  isAdmin = false,
) {
  const userBusinesses = getBusinessesByUser(actorId);
  const targetBiz = businessId
    ? getStore().businesses.get(businessId)
    : userBusinesses[0]
      ? getStore().businesses.get(userBusinesses[0].id)
      : null;

  if (!targetBiz) {
    return null;
  }

  if (!canUserManageBusiness(actorId, targetBiz.id, isAdmin)) {
    throw new AuthorizationError('You do not have access to this business dashboard');
  }

  const store = getStore();
  const hydrated = hydrateBusinessDTO(targetBiz, true);
  const matchedEnquiries = listMatchedEnquiriesForBusiness(actorId, targetBiz.id, isAdmin);
  const quotations = Array.from(store.quotations.values())
    .filter((q) => q.businessId === targetBiz.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const shortlistedCount = quotations.filter(
    (q) => q.status === 'SHORTLISTED' || q.status === 'ACCEPTED',
  ).length;
  const acceptedCount = quotations.filter((q) => q.status === 'ACCEPTED').length;
  const team = store.teamMembers.get(targetBiz.id) ?? [];

  return {
    business: hydrated,
    allUserBusinesses: userBusinesses,
    analytics: {
      profileViews: targetBiz.profileViews,
      enquiryClicks: targetBiz.enquiryClicks,
      contactClicks: targetBiz.contactClicks,
      matchedEnquiriesCount: matchedEnquiries.length,
      quotationsSubmittedCount: quotations.length,
      shortlistedCount,
      acceptedCount,
      publishedListingsCount: (hydrated.listings ?? []).filter(
        (l) => l.status === 'PUBLISHED',
      ).length,
      averageRating: targetBiz.averageRating,
      reviewCount: targetBiz.reviewCount,
    },
    matchedEnquiries,
    quotations,
    team,
    subscription: hydrated.subscription,
  };
}

// ============================================================
// 8. MODERATION, REPORTS & ADMIN PORTAL
// ============================================================

export function createModerationReport(
  reporterId: string,
  rawInput: unknown,
): ModerationReportDTO {
  const parsed = createModerationReportSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message || 'Invalid report submission',
    );
  }
  const data = parsed.data;
  const store = getStore();
  const now = new Date().toISOString();
  const id = `rep_${generateId(10)}`;

  const report: ModerationReportDTO = {
    id,
    reporterId,
    targetType: data.targetType,
    targetId: data.targetId,
    reason: data.reason,
    details: data.details || null,
    status: 'OPEN',
    resolutionNote: null,
    resolvedById: null,
    resolvedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  store.reports.set(id, report);
  return report;
}

export async function executeAdminModeration(
  adminUserId: string,
  input: {
    resourceType: 'BUSINESS' | 'LISTING' | 'ENQUIRY' | 'REPORT' | 'CATEGORY';
    resourceId: string;
    action: string;
    verificationLevel?: VerificationLevel;
    note?: string;
  },
) {
  const store = getStore();
  const now = new Date().toISOString();

  if (input.resourceType === 'BUSINESS') {
    const biz = store.businesses.get(input.resourceId);
    if (!biz) throw new NotFoundError('Business');

    if (input.action === 'APPROVE_BUSINESS' || input.action === 'RESTORE_BUSINESS') {
      biz.status = 'PUBLISHED';
      biz.publishedAt = biz.publishedAt ?? now;
      biz.moderationNote = input.note || 'Approved by PROVENTA Moderation';
    } else if (input.action === 'SUSPEND_BUSINESS') {
      biz.status = 'SUSPENDED';
      biz.moderationNote = input.note || 'Suspended by PROVENTA Moderation';
    } else if (input.action === 'ARCHIVE_BUSINESS') {
      biz.status = 'ARCHIVED';
    } else if (input.action === 'SET_VERIFICATION_LEVEL' && input.verificationLevel) {
      biz.verificationLevel = input.verificationLevel;
      biz.moderationNote = input.note || `Verification level updated to ${input.verificationLevel}`;
    } else if (input.action === 'TOGGLE_FEATURED_BUSINESS') {
      biz.featured = !biz.featured;
    }

    biz.updatedAt = now;
    store.businesses.set(biz.id, biz);

    await sendMarketplaceNotification({
      userId: biz.ownerId,
      type: 'BUSINESS_MODERATION_UPDATE',
      title: `Storefront Update: ${biz.name}`,
      body: biz.moderationNote || `Your business profile status is now ${biz.status}.`,
      actionUrl: `/business/dashboard`,
    });

    return hydrateBusinessDTO(biz, true);
  }

  if (input.resourceType === 'LISTING') {
    const lst = store.listings.get(input.resourceId);
    if (!lst) throw new NotFoundError('Listing');

    if (input.action === 'SUSPEND_LISTING') {
      lst.status = 'SUSPENDED';
    } else if (input.action === 'RESTORE_LISTING') {
      lst.status = 'PUBLISHED';
    }
    lst.updatedAt = now;
    store.listings.set(lst.id, lst);
    return hydrateListingDTO(lst);
  }

  if (input.resourceType === 'ENQUIRY') {
    const enq = store.enquiries.get(input.resourceId);
    if (!enq) throw new NotFoundError('Enquiry');

    if (input.action === 'FLAG_ENQUIRY') {
      enq.status = 'FLAGGED_FOR_REVIEW';
    } else if (input.action === 'CLOSE_ENQUIRY') {
      enq.status = 'CLOSED';
      enq.closedAt = now;
    }
    enq.updatedAt = now;
    store.enquiries.set(enq.id, enq);
    return hydrateEnquiryDTO(enq);
  }

  if (input.resourceType === 'REPORT') {
    const rep = store.reports.get(input.resourceId);
    if (!rep) throw new NotFoundError('Moderation report');

    rep.status = input.action === 'DISMISS_REPORT' ? 'DISMISSED' : 'RESOLVED';
    rep.resolutionNote = input.note || null;
    rep.resolvedById = adminUserId;
    rep.resolvedAt = now;
    rep.updatedAt = now;
    store.reports.set(rep.id, rep);
    return rep;
  }

  throw new ValidationError('Unsupported moderation resource type');
}

export function getAdminMarketplaceOverview() {
  const store = getStore();
  const businesses = Array.from(store.businesses.values()).map((b) =>
    hydrateBusinessDTO(b, true),
  );
  const listings = Array.from(store.listings.values()).map(hydrateListingDTO);
  const enquiries = Array.from(store.enquiries.values()).map(hydrateEnquiryDTO);
  const quotations = Array.from(store.quotations.values());
  const reports = Array.from(store.reports.values());
  const categories = getCategories({ includeInactive: true, onlyTopLevel: true });

  return {
    metrics: {
      totalBusinesses: businesses.length,
      publishedBusinesses: businesses.filter((b) => b.status === 'PUBLISHED').length,
      pendingReviewBusinesses: businesses.filter((b) => b.status === 'PENDING_REVIEW').length,
      suspendedBusinesses: businesses.filter((b) => b.status === 'SUSPENDED').length,
      verifiedBusinesses: businesses.filter(
        (b) =>
          b.verificationLevel === 'VERIFIED_BUSINESS' ||
          b.verificationLevel === 'DOCUMENT_REVIEWED',
      ).length,
      totalListings: listings.length,
      publishedListings: listings.filter((l) => l.status === 'PUBLISHED').length,
      totalEnquiries: enquiries.length,
      openEnquiries: enquiries.filter((e) => isEnquiryOpenForQuotations(e.status)).length,
      totalQuotations: quotations.length,
      openReports: reports.filter((r) => r.status === 'OPEN').length,
      topLevelCategories: categories.length,
    },
    businesses,
    listings,
    enquiries,
    quotations,
    reports,
    categories,
  };
}
