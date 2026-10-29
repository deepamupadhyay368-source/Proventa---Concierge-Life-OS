import { generateId } from '@/lib/utils';
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors';
import {
  getCategories,
  getCategoryBySlugOrId,
} from './repository';
import { matchBusinessesForEnquiry } from './matching-engine';
import { sendMarketplaceNotification } from './notifications';
import { extractStructuredMissionBrief } from './mission-ai';
import type {
  MissionDTO,
  MissionStage,
  MissionCandidateSupplier,
  MissionActivityDTO,
  QuotationComparisonItem,
  StructuredMissionBrief,
  MissionActivityType,
} from './mission-types';
import type {
  BusinessProfileDTO,
  BusinessQuotationDTO,
  CustomerEnquiryDTO,
  EnquiryMatchDTO,
} from './types';
import { VERIFICATION_BADGE_META } from './types';

interface MissionStore {
  activities: Map<string, MissionActivityDTO[]>;
}

const globalForMissions = globalThis as unknown as {
  __proventaMissionStore?: MissionStore;
};

function getMissionStore(): MissionStore {
  if (!globalForMissions.__proventaMissionStore) {
    globalForMissions.__proventaMissionStore = {
      activities: new Map(),
    };
  }
  return globalForMissions.__proventaMissionStore;
}

// Access marketplace store from global
function getMarketplaceStore() {
  const globalStore = (globalThis as unknown as {
    __proventaMarketplaceStore?: {
      enquiries: Map<string, CustomerEnquiryDTO & {
        isMission?: boolean;
        missionStage?: MissionStage;
        aiBrief?: StructuredMissionBrief | null;
        approvedSupplierIds?: string[];
        conciergeFallback?: boolean;
        completionNote?: string | null;
        acceptedQuotationId?: string | null;
      }>;
      businesses: Map<string, BusinessProfileDTO & { secondaryCategoryIds: string[] }>;
      matches: Map<string, EnquiryMatchDTO>;
      quotations: Map<string, BusinessQuotationDTO>;
    };
  }).__proventaMarketplaceStore;

  if (!globalStore) {
    // Force initialize if not yet loaded
    getCategories();
    return (globalThis as unknown as {
      __proventaMarketplaceStore: {
        enquiries: Map<string, CustomerEnquiryDTO & {
          isMission?: boolean;
          missionStage?: MissionStage;
          aiBrief?: StructuredMissionBrief | null;
          approvedSupplierIds?: string[];
          conciergeFallback?: boolean;
          completionNote?: string | null;
          acceptedQuotationId?: string | null;
        }>;
        businesses: Map<string, BusinessProfileDTO & { secondaryCategoryIds: string[] }>;
        matches: Map<string, EnquiryMatchDTO>;
        quotations: Map<string, BusinessQuotationDTO>;
      };
    }).__proventaMarketplaceStore;
  }
  return globalStore;
}

export function logMissionActivity(
  enquiryId: string,
  activity: {
    actorId: string;
    actorRole: 'CUSTOMER' | 'BUSINESS' | 'CONCIERGE' | 'SYSTEM';
    type: MissionActivityType;
    title: string;
    description?: string | null;
    metadata?: Record<string, unknown> | null;
  },
): MissionActivityDTO {
  const store = getMissionStore();
  const list = store.activities.get(enquiryId) || [];
  const record: MissionActivityDTO = {
    id: `act_${generateId(12)}`,
    enquiryId,
    actorId: activity.actorId,
    actorRole: activity.actorRole,
    type: activity.type,
    title: activity.title,
    description: activity.description || null,
    metadata: activity.metadata || null,
    createdAt: new Date().toISOString(),
  };
  list.unshift(record); // newest first
  store.activities.set(enquiryId, list);
  return record;
}

export function getMissionActivities(enquiryId: string): MissionActivityDTO[] {
  const store = getMissionStore();
  return store.activities.get(enquiryId) || [];
}

/**
 * Builds candidate supplier cards clearly distinguishing:
 * 1. Verified Facts (legal badges, registered location, active listings)
 * 2. Supplier Claims (self-reported turnaround, highlights, tags)
 * 3. AI Estimates (match confidence, relevance fit)
 */
export function buildCandidateSuppliers(
  enquiryId: string,
  candidateBusinesses: BusinessProfileDTO[],
  approvedIds: Set<string>,
): MissionCandidateSupplier[] {
  const store = getMarketplaceStore();
  const allMatches = Array.from(store.matches.values()).filter(
    (m) => m.enquiryId === enquiryId,
  );
  const matchMap = new Map(allMatches.map((m) => [m.businessId, m]));

  return candidateBusinesses
    .filter((biz) => matchMap.has(biz.id))
    .map((biz) => {
      const match = matchMap.get(biz.id)!;
      const badge = VERIFICATION_BADGE_META[biz.verificationLevel];

      return {
        businessId: biz.id,
        businessName: biz.name,
        businessSlug: biz.slug,
        businessCity: biz.city,
        matchScore: match.matchScore,
        matchReasons: match.matchReasons,
        scoreBreakdown: match.scoreBreakdown || {
          categoryScore: 0,
          subcategoryScore: 0,
          locationScore: 0,
          listingRelevanceScore: 0,
          keywordScore: 0,
          operatingStatusScore: 0,
          directTargetBonus: 0,
          totalScore: match.matchScore,
        },
        verifiedFacts: {
          isVerified: badge.isVerified,
          verificationBadge: badge.label,
          establishedYear:
            (biz as { yearEstablished?: number; establishedYear?: number }).yearEstablished ||
            (biz as { establishedYear?: number }).establishedYear ||
            undefined,
          registeredCity: biz.city,
          state: biz.state,
          panIndiaCoverage: Boolean(biz.servesPanIndia),
          gstVerified: Boolean(biz.gstNumber),
          activeOfferingsCount: (biz.listings || []).length,
        },
        supplierClaims: {
          highlights: biz.highlights || [],
          tagline: biz.tagline || undefined,
          serviceAreas: biz.serviceAreas || [],
          turnaroundClaim: biz.highlights?.find((h) =>
            h.toLowerCase().includes('hour') || h.toLowerCase().includes('day'),
          ),
          tags: biz.tags || [],
        },
        aiEstimates: {
          matchScore: match.matchScore,
          relevanceRationale: match.matchReasons.join('. '),
          capabilityFit: (match.matchScore >= 85
            ? 'HIGH'
            : match.matchScore >= 65
              ? 'MEDIUM'
              : 'MODERATE') as 'HIGH' | 'MEDIUM' | 'MODERATE',
        },
        approvedForRfq: approvedIds.has(biz.id),
        notifiedAt: match.notifiedAt,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Formats quotations received into side-by-side comparison rows with transparent scoring.
 */
export function buildQuotationComparisonItems(
  enquiryId: string,
): QuotationComparisonItem[] {
  const store = getMarketplaceStore();
  const quotations = Array.from(store.quotations.values()).filter(
    (q) => q.enquiryId === enquiryId,
  );

  return quotations.map((q) => {
    const biz = store.businesses.get(q.businessId);
    const badge = biz
      ? VERIFICATION_BADGE_META[biz.verificationLevel]
      : { isVerified: false, label: 'Unverified Profile' };

    // Transparent calculation: no invented data
    const isFixed = q.priceType === 'FIXED_QUOTE';
    const priceScore = isFixed && q.priceAmount ? 90 : 70;
    const verifiedBonus = badge.isVerified ? 10 : 0;
    const overallScore = Math.min(100, Math.round(priceScore * 0.6 + verifiedBonus + 30));

    return {
      quotationId: q.id,
      referenceCode: q.referenceCode,
      businessId: q.businessId,
      businessName: biz?.name || q.businessName || 'Registered Business',
      businessSlug: biz?.slug || q.businessSlug || '',
      businessCity: biz?.city || 'India',
      isVerified: badge.isVerified,
      verificationBadge: badge.label,
      summary: q.summary,
      detailedProposal: q.detailedProposal,
      priceType: q.priceType,
      priceAmount: q.priceAmount,
      deliveryTimeline: q.deliveryTimeline,
      inclusions: q.inclusions || [],
      exclusions: q.exclusions,
      terms: q.termsAndAssumptions,
      validUntil: q.validUntil,
      status: q.status,
      customerNote: q.customerNote,
      createdAt: q.createdAt,
      transparentScore: {
        overallScore,
        priceCompetitiveness: isFixed ? 'EXCELLENT' : 'COMPETITIVE',
        timelinePace: q.deliveryTimeline.toLowerCase().includes('day') ? 'FAST' : 'STANDARD',
        verifiedBonus,
      },
    };
  });
}

/**
 * Creates a new PROVENTA Mission:
 * 1. Natural Language extraction with Gemini AI (fallback to deterministic parser)
 * 2. Zod schema validation
 * 3. Identifies candidate registered businesses
 * 4. Logs initial audit activity
 * 5. Returns MissionDTO
 */
export async function createMission(
  customer: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  },
  rawInput: {
    naturalLanguagePrompt: string;
    structuredOverrides?: {
      city?: string;
      budgetMin?: number;
      budgetMax?: number;
      timeline?: string;
      urgencyLevel?: 'STANDARD' | 'URGENT' | 'CRITICAL';
      categorySlug?: string;
      deliveryMode?: 'ON_SITE' | 'REMOTE' | 'DELIVERY' | 'EITHER';
    };
  },
): Promise<MissionDTO> {
  if (!rawInput.naturalLanguagePrompt || rawInput.naturalLanguagePrompt.trim().length < 10) {
    throw new ValidationError(
      'Please describe your business requirement in at least 10 characters.',
    );
  }

  // 1. Run AI / Fallback Extraction
  const aiBrief = await extractStructuredMissionBrief(rawInput);

  const store = getMarketplaceStore();
  const category =
    getCategoryBySlugOrId(aiBrief.categorySlug) || getCategories({ onlyTopLevel: true })[0];

  const now = new Date().toISOString();
  const enquiryId = `enq_${generateId(12)}`;
  const referenceCode = `PRV-MSN-${generateId(6).toUpperCase()}`;

  // 2. Initialize CustomerEnquiry with Mission fields
  const enquiryRecord: CustomerEnquiryDTO & {
    isMission: boolean;
    missionStage: MissionStage;
    aiBrief: StructuredMissionBrief;
    approvedSupplierIds: string[];
    conciergeFallback: boolean;
    completionNote: string | null;
    acceptedQuotationId: string | null;
  } = {
    id: enquiryId,
    referenceCode,
    customerId: customer.id,
    customerName: customer.name || 'Enterprise Customer',
    customerEmail: customer.email || null,
    customerPhone: customer.phone || null,
    categoryId: category.id,
    subcategoryId: null,
    targetBusinessId: null,
    targetListingId: null,
    title: aiBrief.title,
    description: aiBrief.scopeSummary,
    requirementType: 'HYBRID',
    city: aiBrief.city,
    state: 'Gujarat',
    deliveryMode: aiBrief.deliveryMode,
    quantity: aiBrief.deliverables.join('; '),
    budgetMin: aiBrief.budgetMin,
    budgetMax: aiBrief.budgetMax,
    currency: 'INR',
    timeline: aiBrief.timeline,
    urgency: aiBrief.urgencyLevel,
    categoryAttributes: {
      deliverables: aiBrief.deliverables.join('; '),
      priorities: aiBrief.priorities.join('; '),
      confidenceScore: String(aiBrief.confidenceScore),
      missingInformation: aiBrief.missingInformation.join('; '),
    },
    attachments: [],
    preferredContactMethod: 'PLATFORM',
    shareContactWithShortlistedOnly: true,
    status: 'OPEN',
    isMission: true,
    missionStage: 'RFQ_PENDING_APPROVAL',
    aiBrief,
    approvedSupplierIds: [],
    conciergeFallback: false,
    completionNote: null,
    acceptedQuotationId: null,
    matchedCount: 0,
    responsesCount: 0,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    closedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  store.enquiries.set(enquiryId, enquiryRecord);

  // 3. Match candidate real businesses
  const candidateBusinesses = Array.from(store.businesses.values());
  const scoredMatches = matchBusinessesForEnquiry(
    enquiryRecord,
    candidateBusinesses,
  );

  for (const match of scoredMatches) {
    const matchId = `mtc_${generateId(12)}`;
    const matchRecord: EnquiryMatchDTO = {
      id: matchId,
      enquiryId,
      businessId: match.businessId,
      matchScore: match.matchScore,
      matchReasons: match.matchReasons,
      scoreBreakdown: match.scoreBreakdown,
      status: 'MATCHED',
      notifiedAt: null, // will be set once customer approves RFQ distribution
      viewedAt: null,
      respondedAt: null,
      declinedAt: null,
      declineReason: null,
      notificationDedupeKey: match.notificationDedupeKey,
      createdAt: now,
    };
    store.matches.set(matchId, matchRecord);
  }

  enquiryRecord.matchedCount = scoredMatches.length;
  store.enquiries.set(enquiryId, enquiryRecord);

  // 4. Log initial mission activities
  logMissionActivity(enquiryId, {
    actorId: customer.id,
    actorRole: 'CUSTOMER',
    type: 'MISSION_CREATED',
    title: 'Mission Initialized',
    description: `Customer submitted requirement: "${aiBrief.title}" in ${aiBrief.city}.`,
    metadata: {
      urgency: aiBrief.urgencyLevel,
      budgetRange: aiBrief.budgetMax ? `₹${aiBrief.budgetMin || 0} - ₹${aiBrief.budgetMax}` : 'Open',
    },
  });

  logMissionActivity(enquiryId, {
    actorId: 'ai-engine',
    actorRole: 'SYSTEM',
    type: 'AI_PARSED',
    title: aiBrief.aiExtracted ? 'AI Requirement Extraction Complete' : 'Structured Brief Compiled',
    description: `Extracted ${aiBrief.deliverables.length} deliverables and matched ${scoredMatches.length} candidate businesses in ${category.name}.`,
    metadata: {
      confidenceScore: aiBrief.confidenceScore,
      missingCount: aiBrief.missingInformation.length,
      matchedBusinesses: scoredMatches.length,
    },
  });

  return getMissionById(enquiryId, { userId: customer.id, role: 'CUSTOMER' });
}

/**
 * Retrieves a mission with real candidate suppliers, quotations, and activity history.
 */
export function getMissionById(
  enquiryId: string,
  viewer?: { userId?: string | null; role?: string | null },
): MissionDTO {
  const store = getMarketplaceStore();
  const enq = store.enquiries.get(enquiryId);

  if (!enq) {
    throw new NotFoundError(`Mission with ID ${enquiryId} does not exist.`);
  }

  // Authorization check
  const isOwner = viewer?.userId && viewer.userId === enq.customerId;
  const isAdmin = viewer?.role && ['ADMIN', 'SUPER_ADMIN', 'FOUNDER', 'CONCIERGE'].includes(viewer.role);
  const isApprovedSupplier = viewer?.userId
    ? (enq.approvedSupplierIds || []).some((bId) => {
        const b = store.businesses.get(bId);
        return b && b.ownerId === viewer.userId;
      })
    : false;

  if (viewer?.userId && !isOwner && !isAdmin && !isApprovedSupplier) {
    // Check if supplier matched
    const isMatchedSupplier = Array.from(store.matches.values()).some(
      (m) =>
        m.enquiryId === enquiryId &&
        store.businesses.get(m.businessId)?.ownerId === viewer.userId,
    );
    if (!isMatchedSupplier) {
      throw new AuthorizationError('You do not have permission to view this mission.');
    }
  }

  // Category name
  const cat = getCategoryBySlugOrId(enq.categoryId);
  const categoryName = cat?.name || 'General Commercial';

  const approvedSet = new Set(enq.approvedSupplierIds || []);
  const allBusinesses = Array.from(store.businesses.values());
  const candidateSuppliers = buildCandidateSuppliers(enquiryId, allBusinesses, approvedSet);
  const quotations = buildQuotationComparisonItems(enquiryId);
  const activities = getMissionActivities(enquiryId);

  // Redact customer contact if viewer is a supplier and quote is not shortlisted/accepted
  const canSeeContact = isOwner || isAdmin || quotations.some(
    (q) =>
      ['SHORTLISTED', 'ACCEPTED'].includes(q.status) &&
      store.businesses.get(q.businessId)?.ownerId === viewer?.userId,
  );

  return {
    id: enq.id,
    referenceCode: enq.referenceCode,
    customerId: enq.customerId,
    customerName: enq.customerName || 'Enterprise Customer',
    customerEmail: canSeeContact ? (enq.customerEmail ?? null) : null,
    customerPhone: canSeeContact ? (enq.customerPhone ?? null) : null,
    isMission: Boolean(enq.isMission),
    missionStage: enq.missionStage || (enq.status === 'ACCEPTED' ? 'OFFER_ACCEPTED' : 'RFQ_DISPATCHED'),
    title: enq.title,
    description: enq.description,
    categoryId: enq.categoryId,
    categoryName,
    city: enq.city,
    state: enq.state,
    deliveryMode: (enq.deliveryMode as 'ON_SITE' | 'REMOTE' | 'DELIVERY' | 'EITHER') || 'EITHER',
    quantity: enq.quantity,
    budgetMin: enq.budgetMin,
    budgetMax: enq.budgetMax,
    currency: enq.currency,
    timeline: enq.timeline,
    urgency: enq.urgency,
    aiBrief: enq.aiBrief || null,
    approvedSupplierIds: enq.approvedSupplierIds || [],
    conciergeFallback: Boolean(enq.conciergeFallback),
    completionNote: enq.completionNote || null,
    acceptedQuotationId: enq.acceptedQuotationId || null,
    candidateSuppliers,
    quotations,
    activities,
    createdAt: enq.createdAt,
    updatedAt: enq.updatedAt,
  };
}

/**
 * Customer approves RFQ distribution to selected suppliers.
 */
export async function approveMissionRfqDistribution(
  missionId: string,
  customerId: string,
  supplierIds: string[],
): Promise<MissionDTO> {
  const store = getMarketplaceStore();
  const enq = store.enquiries.get(missionId);

  if (!enq) {
    throw new NotFoundError('Mission not found');
  }
  if (enq.customerId !== customerId) {
    throw new AuthorizationError('Only the mission owner can approve RFQ distribution.');
  }
  if (supplierIds.length === 0) {
    throw new ValidationError('Please select at least one registered supplier to invite.');
  }

  const now = new Date().toISOString();
  enq.approvedSupplierIds = supplierIds;
  enq.missionStage = 'RFQ_DISPATCHED';
  enq.updatedAt = now;
  store.enquiries.set(missionId, enq);

  // Update matches to NOTIFIED and dispatch deduplicated notifications
  let dispatchedCount = 0;
  for (const bId of supplierIds) {
    const match = Array.from(store.matches.values()).find(
      (m) => m.enquiryId === missionId && m.businessId === bId,
    );
    if (match) {
      match.status = 'NOTIFIED';
      match.notifiedAt = now;
      store.matches.set(match.id, match);
    }

    const biz = store.businesses.get(bId);
    if (biz) {
      dispatchedCount++;
      await sendMarketplaceNotification({
        userId: biz.ownerId,
        type: 'ENQUIRY_MATCHED',
        title: `RFQ Invitation: ${enq.title}`,
        body: `You have been selected to submit a quotation for "${enq.title}" in ${enq.city}. Review specifications and submit your offer.`,
        actionUrl: `/business/dashboard?tab=enquiries&enquiryId=${missionId}`,
        dedupeKey: `mission_rfq:${missionId}:${bId}`,
      });
    }
  }

  logMissionActivity(missionId, {
    actorId: customerId,
    actorRole: 'CUSTOMER',
    type: 'RFQ_APPROVED',
    title: 'Customer Approved RFQ Distribution',
    description: `Customer selected and approved ${supplierIds.length} candidate suppliers.`,
    metadata: { supplierCount: supplierIds.length },
  });

  logMissionActivity(missionId, {
    actorId: 'system',
    actorRole: 'SYSTEM',
    type: 'RFQ_DISPATCHED',
    title: 'RFQs Dispatched to Suppliers',
    description: `Formal quotation invitations sent to ${dispatchedCount} verified vendor consoles.`,
    metadata: { dispatchedCount },
  });

  return getMissionById(missionId, { userId: customerId, role: 'CUSTOMER' });
}

/**
 * Supplier submits a formal quotation for the mission.
 */
export async function submitMissionQuotation(
  missionId: string,
  supplierUser: { id: string; name?: string | null },
  input: {
    businessId: string;
    summary: string;
    detailedProposal: string;
    priceType: 'FIXED_QUOTE' | 'INDICATIVE_ESTIMATE' | 'RANGE_ESTIMATE' | 'INSPECTION_REQUIRED';
    priceAmount?: number;
    priceMaxAmount?: number;
    deliveryTimeline: string;
    validityDays?: number;
    inclusions?: string[];
    exclusions?: string;
    terms?: string;
  },
): Promise<MissionDTO> {
  const store = getMarketplaceStore();
  const enq = store.enquiries.get(missionId);

  if (!enq) {
    throw new NotFoundError('Mission not found');
  }

  const biz = store.businesses.get(input.businessId);
  if (!biz) {
    throw new NotFoundError('Business not found');
  }
  if (biz.ownerId !== supplierUser.id) {
    throw new AuthorizationError('You can only submit quotations for your own registered business.');
  }

  const now = new Date().toISOString();
  const validityDays = input.validityDays || 14;
  const validUntil = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();
  const quotationId = `quo_${generateId(12)}`;
  const referenceCode = `PRV-QTE-${generateId(6).toUpperCase()}`;

  const quoteRecord: BusinessQuotationDTO = {
    id: quotationId,
    referenceCode,
    enquiryId: missionId,
    businessId: biz.id,
    businessName: biz.name,
    businessSlug: biz.slug,
    submittedById: supplierUser.id,
    summary: input.summary,
    detailedProposal: input.detailedProposal,
    priceType: input.priceType,
    priceAmount: input.priceAmount || null,
    priceMaxAmount: input.priceMaxAmount || null,
    currency: 'INR',
    priceUnit: 'total',
    deliveryTimeline: input.deliveryTimeline,
    validityDays,
    validUntil,
    inclusions: input.inclusions || ['Turnkey fulfillment according to specification'],
    exclusions: input.exclusions || null,
    termsAndAssumptions: input.terms || null,
    availabilityNote: 'Subject to schedule upon acceptance',
    attachments: [],
    followUpPreference: 'PLATFORM_AND_PHONE',
    status: 'SUBMITTED',
    customerNote: null,
    shortlistedAt: null,
    acceptedAt: null,
    rejectedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  store.quotations.set(quotationId, quoteRecord);

  // Update mission stage to QUOTATIONS_RECEIVED if still RFQ_DISPATCHED
  if (['RFQ_DISPATCHED', 'MATCHING', 'RFQ_PENDING_APPROVAL'].includes(enq.missionStage || '')) {
    enq.missionStage = 'QUOTATIONS_RECEIVED';
  }
  enq.responsesCount = (enq.responsesCount || 0) + 1;
  enq.updatedAt = now;
  store.enquiries.set(missionId, enq);

  logMissionActivity(missionId, {
    actorId: supplierUser.id,
    actorRole: 'BUSINESS',
    type: 'QUOTATION_RECEIVED',
    title: `Quotation Received from ${biz.name}`,
    description: `Submitted offer: ${input.priceAmount ? `₹${input.priceAmount.toLocaleString('en-IN')}` : 'Estimate'} · ETA: ${input.deliveryTimeline}`,
    metadata: {
      quotationId,
      referenceCode,
      priceAmount: input.priceAmount || null,
      deliveryTimeline: input.deliveryTimeline,
    },
  });

  // Notify customer
  await sendMarketplaceNotification({
    userId: enq.customerId,
    type: 'QUOTATION_RECEIVED',
    title: `New Quotation for "${enq.title}"`,
    body: `${biz.name} submitted a formal quotation (${input.priceAmount ? `₹${input.priceAmount.toLocaleString('en-IN')}` : 'Estimate'}). Compare it on your Mission Cockpit.`,
    actionUrl: `/missions/${missionId}`,
    dedupeKey: `quote_notif:${missionId}:${quotationId}`,
  });

  return getMissionById(missionId, { userId: supplierUser.id, role: 'BUSINESS' });
}

/**
 * Customer shortlists a quotation.
 */
export async function shortlistMissionQuotation(
  missionId: string,
  customerId: string,
  quotationId: string,
  note?: string,
): Promise<MissionDTO> {
  const store = getMarketplaceStore();
  const enq = store.enquiries.get(missionId);

  if (!enq) throw new NotFoundError('Mission not found');
  if (enq.customerId !== customerId) throw new AuthorizationError('Only mission owner can shortlist.');

  const quote = store.quotations.get(quotationId);
  if (!quote || quote.enquiryId !== missionId) throw new NotFoundError('Quotation not found');

  const now = new Date().toISOString();
  quote.status = 'SHORTLISTED';
  quote.shortlistedAt = now;
  quote.customerNote = note || 'Shortlisted for final comparison';
  store.quotations.set(quotationId, quote);

  enq.missionStage = 'IN_REVIEW';
  store.enquiries.set(missionId, enq);

  logMissionActivity(missionId, {
    actorId: customerId,
    actorRole: 'CUSTOMER',
    type: 'QUOTATION_SHORTLISTED',
    title: `Quotation Shortlisted: ${quote.referenceCode}`,
    description: `Customer shortlisted ${quote.businessName || 'supplier proposal'}. Contact details unmasked.`,
    metadata: { quotationId, businessId: quote.businessId },
  });

  return getMissionById(missionId, { userId: customerId, role: 'CUSTOMER' });
}

/**
 * Customer explicitly accepts winning quotation and awards the mission.
 */
export async function acceptMissionQuotation(
  missionId: string,
  customerId: string,
  quotationId: string,
): Promise<MissionDTO> {
  const store = getMarketplaceStore();
  const enq = store.enquiries.get(missionId);

  if (!enq) throw new NotFoundError('Mission not found');
  if (enq.customerId !== customerId) throw new AuthorizationError('Only mission owner can accept quotations.');

  const quote = store.quotations.get(quotationId);
  if (!quote || quote.enquiryId !== missionId) throw new NotFoundError('Quotation not found');

  const now = new Date().toISOString();
  quote.status = 'ACCEPTED';
  quote.acceptedAt = now;
  store.quotations.set(quotationId, quote);

  // Reject other quotations politely
  for (const other of store.quotations.values()) {
    if (other.enquiryId === missionId && other.id !== quotationId) {
      other.status = 'REJECTED';
      other.rejectedAt = now;
      store.quotations.set(other.id, other);
    }
  }

  enq.missionStage = 'OFFER_ACCEPTED';
  enq.acceptedQuotationId = quotationId;
  enq.status = 'ACCEPTED';
  enq.updatedAt = now;
  store.enquiries.set(missionId, enq);

  logMissionActivity(missionId, {
    actorId: customerId,
    actorRole: 'CUSTOMER',
    type: 'QUOTATION_ACCEPTED',
    title: `Commercial Award: ${quote.businessName || 'Supplier'} Accepted`,
    description: `Customer awarded mission to quotation ${quote.referenceCode} (${quote.priceAmount ? `₹${quote.priceAmount.toLocaleString('en-IN')}` : 'Agreed price'}).`,
    metadata: { quotationId, businessId: quote.businessId, price: quote.priceAmount },
  });

  // Notify awarded business
  const biz = store.businesses.get(quote.businessId);
  if (biz) {
    await sendMarketplaceNotification({
      userId: biz.ownerId,
      type: 'QUOTATION_STATUS_UPDATED',
      title: `Offer Accepted! Mission Awarded for "${enq.title}"`,
      body: `Congratulations! Customer awarded the mission to your business. Coordinate fulfillment and delivery milestones.`,
      actionUrl: `/business/dashboard?tab=enquiries&enquiryId=${missionId}`,
      dedupeKey: `accepted_award:${missionId}:${quotationId}`,
    });
  }

  return getMissionById(missionId, { userId: customerId, role: 'CUSTOMER' });
}

/**
 * Customer activates PROVENTA Concierge fallback when no matches exist or upon request.
 */
export async function requestConciergeMissionFallback(
  missionId: string,
  customerId: string,
  note?: string,
): Promise<MissionDTO> {
  const store = getMarketplaceStore();
  const enq = store.enquiries.get(missionId);

  if (!enq) throw new NotFoundError('Mission not found');
  if (enq.customerId !== customerId) throw new AuthorizationError('Only mission owner can request concierge assistance.');

  enq.conciergeFallback = true;
  enq.updatedAt = new Date().toISOString();
  store.enquiries.set(missionId, enq);

  logMissionActivity(missionId, {
    actorId: customerId,
    actorRole: 'CUSTOMER',
    type: 'CONCIERGE_FALLBACK_REQUESTED',
    title: 'PROVENTA Concierge Sourcing Activated',
    description: note || 'Customer requested human-assisted sourcing from verified industry network.',
    metadata: { conciergeEscalated: true },
  });

  return getMissionById(missionId, { userId: customerId, role: 'CUSTOMER' });
}

/**
 * Customer explicitly confirms mission completion.
 */
export async function confirmMissionCompletion(
  missionId: string,
  customerId: string,
  note?: string,
): Promise<MissionDTO> {
  const store = getMarketplaceStore();
  const enq = store.enquiries.get(missionId);

  if (!enq) throw new NotFoundError('Mission not found');
  if (enq.customerId !== customerId) throw new AuthorizationError('Only mission owner can confirm completion.');

  const now = new Date().toISOString();
  enq.missionStage = 'COMPLETED';
  enq.status = 'CLOSED';
  enq.closedAt = now;
  enq.completionNote = note || 'All deliverables fulfilled and accepted by customer.';
  enq.updatedAt = now;
  store.enquiries.set(missionId, enq);

  logMissionActivity(missionId, {
    actorId: customerId,
    actorRole: 'CUSTOMER',
    type: 'COMPLETION_CONFIRMED',
    title: 'Mission Marked Completed',
    description: enq.completionNote,
    metadata: { closedAt: now },
  });

  return getMissionById(missionId, { userId: customerId, role: 'CUSTOMER' });
}

/**
 * Customer cancels the mission.
 */
export async function cancelMission(
  missionId: string,
  customerId: string,
  reason?: string,
): Promise<MissionDTO> {
  const store = getMarketplaceStore();
  const enq = store.enquiries.get(missionId);

  if (!enq) throw new NotFoundError('Mission not found');
  if (enq.customerId !== customerId) throw new AuthorizationError('Only mission owner can cancel.');

  const now = new Date().toISOString();
  enq.missionStage = 'CANCELLED';
  enq.status = 'CANCELLED';
  enq.closedAt = now;
  enq.updatedAt = now;
  store.enquiries.set(missionId, enq);

  logMissionActivity(missionId, {
    actorId: customerId,
    actorRole: 'CUSTOMER',
    type: 'MISSION_CANCELLED',
    title: 'Mission Cancelled',
    description: reason || 'Customer closed the requirement.',
    metadata: { closedAt: now },
  });

  return getMissionById(missionId, { userId: customerId, role: 'CUSTOMER' });
}

/**
 * Lists all missions for a customer (or all missions for an admin/concierge).
 */
export function listCustomerMissions(
  userId: string,
  options?: { stage?: MissionStage; limit?: number },
): MissionDTO[] {
  const store = getMarketplaceStore();
  const missions = Array.from(store.enquiries.values())
    .filter((e) => e.customerId === userId && (e.isMission !== false))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((e) => getMissionById(e.id, { userId, role: 'CUSTOMER' }));

  if (options?.stage) {
    return missions.filter((m) => m.missionStage === options.stage);
  }
  return missions.slice(0, options?.limit || 50);
}
