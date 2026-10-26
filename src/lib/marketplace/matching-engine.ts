import { MATCHING_ENGINE_WEIGHTS } from '@/lib/brand';
import type {
  BusinessProfileDTO,
  CustomerEnquiryDTO,
  MatchScoreBreakdown,
} from './types';

export interface CandidateBusinessForMatching extends BusinessProfileDTO {
  secondaryCategoryIds?: string[];
}

export interface ScoredBusinessMatch {
  businessId: string;
  businessName: string;
  businessSlug: string;
  businessCity: string;
  matchScore: number;
  matchReasons: string[];
  scoreBreakdown: MatchScoreBreakdown;
  notificationDedupeKey: string;
}

export interface MatchingEngineConfig {
  primaryCategoryMatch: number;
  secondaryCategoryMatch: number;
  subcategoryOrListingMatch: number;
  cityExactMatch: number;
  serviceAreaOrStateMatch: number;
  panIndiaCoverageMatch: number;
  keywordRelevanceMax: number;
  activeOperatingStatusBonus: number;
  minimumMatchThreshold: number;
  maxMatchedBusinessesPerEnquiry: number;
}

function tokenizeKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3)
    .filter(
      (token) =>
        ![
          'the',
          'and',
          'for',
          'with',
          'need',
          'want',
          'looking',
          'require',
          'required',
          'from',
          'into',
          'that',
          'this',
          'our',
          'are',
        ].includes(token),
    );
}

export function buildNotificationDedupeKey(
  enquiryId: string,
  businessId: string,
): string {
  return `enquiry_match:${enquiryId}:${businessId}`;
}

export function scoreBusinessForEnquiry(
  enquiry: Pick<
    CustomerEnquiryDTO,
    | 'id'
    | 'categoryId'
    | 'subcategoryId'
    | 'targetBusinessId'
    | 'targetListingId'
    | 'title'
    | 'description'
    | 'requirementType'
    | 'city'
    | 'state'
    | 'deliveryMode'
  >,
  business: CandidateBusinessForMatching,
  config: MatchingEngineConfig = MATCHING_ENGINE_WEIGHTS,
): ScoredBusinessMatch | null {
  // 1. Strict publication, moderation, and operating eligibility gates
  if (business.status !== 'PUBLISHED') {
    return null;
  }
  if (business.operatingStatus === 'TEMPORARILY_CLOSED') {
    return null;
  }

  const reasons: string[] = [];
  let categoryScore = 0;
  let subcategoryScore = 0;
  let locationScore = 0;
  let listingRelevanceScore = 0;
  let keywordScore = 0;
  let operatingStatusScore = 0;
  let directTargetBonus = 0;

  // 2. Direct target business check (if customer initiated enquiry from this business's storefront)
  const isDirectTarget = Boolean(
    enquiry.targetBusinessId && enquiry.targetBusinessId === business.id,
  );
  if (isDirectTarget) {
    directTargetBonus = 25;
    reasons.push('Directly selected by customer');
  }

  // 3. Category matching
  const secondaryIds = new Set([
    ...(business.secondaryCategoryIds ?? []),
    ...(business.secondaryCategories?.map((c) => c.id) ?? []),
  ]);

  if (business.primaryCategoryId === enquiry.categoryId) {
    categoryScore = config.primaryCategoryMatch;
    reasons.push('Primary category match');
  } else if (secondaryIds.has(enquiry.categoryId)) {
    categoryScore = config.secondaryCategoryMatch;
    reasons.push('Secondary category match');
  } else {
    // Check if any published listing is in the enquiry's category
    const hasListingInCategory = (business.listings ?? []).some(
      (l) => l.status === 'PUBLISHED' && l.categoryId === enquiry.categoryId,
    );
    if (hasListingInCategory) {
      categoryScore = config.secondaryCategoryMatch;
      reasons.push('Offers published product/service in category');
    } else if (!isDirectTarget) {
      // Unrelated category and not a direct target -> do not match
      return null;
    }
  }

  // 4. Subcategory & specific listing matching
  const publishedListings = (business.listings ?? []).filter(
    (l) => l.status === 'PUBLISHED',
  );

  if (enquiry.targetListingId) {
    const hasTargetListing = publishedListings.some(
      (l) => l.id === enquiry.targetListingId,
    );
    if (hasTargetListing) {
      listingRelevanceScore = config.subcategoryOrListingMatch;
      reasons.push('Matches requested product/service listing');
    }
  }

  if (enquiry.subcategoryId && listingRelevanceScore === 0) {
    const matchesSubcategory =
      secondaryIds.has(enquiry.subcategoryId) ||
      publishedListings.some((l) => l.subcategoryId === enquiry.subcategoryId);
    if (matchesSubcategory) {
      subcategoryScore = config.subcategoryOrListingMatch;
      reasons.push('Matches specialized subcategory');
    }
  }

  // 5. Location & service area matching
  const normalizedEnquiryCity = enquiry.city.trim().toLowerCase();
  const normalizedBusinessCity = business.city.trim().toLowerCase();
  const normalizedServiceAreas = (business.serviceAreas ?? []).map((a) =>
    a.trim().toLowerCase(),
  );

  if (normalizedBusinessCity === normalizedEnquiryCity) {
    locationScore = config.cityExactMatch;
    reasons.push(`Located in ${enquiry.city}`);
  } else if (normalizedServiceAreas.includes(normalizedEnquiryCity)) {
    locationScore = config.cityExactMatch - 3;
    reasons.push(`Actively serves ${enquiry.city}`);
  } else if (
    business.state.trim().toLowerCase() === enquiry.state.trim().toLowerCase()
  ) {
    locationScore = config.serviceAreaOrStateMatch;
    reasons.push(`Operates within ${enquiry.state}`);
  } else if (business.servesPanIndia || enquiry.deliveryMode === 'REMOTE') {
    locationScore = config.panIndiaCoverageMatch;
    reasons.push('Supports Pan-India / remote delivery');
  } else if (!isDirectTarget) {
    // Out of service area for on-site/local requirement
    return null;
  }

  // 6. Keyword & offering relevance
  const enquiryTokens = tokenizeKeywords(
    `${enquiry.title} ${enquiry.description}`,
  );
  if (enquiryTokens.length > 0) {
    const businessCorpus = [
      business.name,
      business.tagline ?? '',
      business.shortDescription ?? '',
      business.description ?? '',
      ...(business.tags ?? []),
      ...(business.highlights ?? []),
      ...publishedListings.map(
        (l) => `${l.title} ${l.shortSummary ?? ''} ${(l.tags ?? []).join(' ')}`,
      ),
    ]
      .join(' ')
      .toLowerCase();

    let matchedTokenCount = 0;
    const matchedKeywords: string[] = [];
    const uniqueTokens = Array.from(new Set(enquiryTokens));

    for (const token of uniqueTokens) {
      if (businessCorpus.includes(token)) {
        matchedTokenCount++;
        if (matchedKeywords.length < 3) {
          matchedKeywords.push(token);
        }
      }
    }

    if (matchedTokenCount > 0) {
      const ratio = Math.min(1, matchedTokenCount / Math.min(uniqueTokens.length, 6));
      keywordScore = Math.round(ratio * config.keywordRelevanceMax);
      if (matchedKeywords.length > 0) {
        reasons.push(`Relevant capabilities: ${matchedKeywords.join(', ')}`);
      }
    }
  }

  // 7. Operating status & verification readiness bonus
  if (
    business.operatingStatus === 'OPEN' ||
    business.operatingStatus === 'ACCEPTING_ENQUIRIES'
  ) {
    operatingStatusScore = config.activeOperatingStatusBonus;
  }

  const rawTotal =
    categoryScore +
    subcategoryScore +
    locationScore +
    listingRelevanceScore +
    keywordScore +
    operatingStatusScore +
    directTargetBonus;

  const totalScore = Math.min(100, Math.round(rawTotal));

  if (totalScore < config.minimumMatchThreshold && !isDirectTarget) {
    return null;
  }

  return {
    businessId: business.id,
    businessName: business.name,
    businessSlug: business.slug,
    businessCity: business.city,
    matchScore: totalScore,
    matchReasons: reasons,
    scoreBreakdown: {
      categoryScore,
      subcategoryScore,
      locationScore,
      listingRelevanceScore,
      keywordScore,
      operatingStatusScore,
      directTargetBonus,
      totalScore,
    },
    notificationDedupeKey: buildNotificationDedupeKey(enquiry.id, business.id),
  };
}

export function matchBusinessesForEnquiry(
  enquiry: Pick<
    CustomerEnquiryDTO,
    | 'id'
    | 'customerId'
    | 'categoryId'
    | 'subcategoryId'
    | 'targetBusinessId'
    | 'targetListingId'
    | 'title'
    | 'description'
    | 'requirementType'
    | 'city'
    | 'state'
    | 'deliveryMode'
  >,
  candidateBusinesses: CandidateBusinessForMatching[],
  config: MatchingEngineConfig = MATCHING_ENGINE_WEIGHTS,
): ScoredBusinessMatch[] {
  const seenBusinessIds = new Set<string>();
  const matches: ScoredBusinessMatch[] = [];

  for (const business of candidateBusinesses) {
    // Do not match a customer's own business to their own enquiry
    if (business.ownerId === enquiry.customerId) {
      continue;
    }
    if (seenBusinessIds.has(business.id)) {
      continue;
    }

    const scored = scoreBusinessForEnquiry(enquiry, business, config);
    if (scored) {
      seenBusinessIds.add(business.id);
      matches.push(scored);
    }
  }

  // Sort deterministically by matchScore DESC, then featured DESC, then reviewCount DESC
  matches.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.businessName.localeCompare(b.businessName);
  });

  return matches.slice(0, config.maxMatchedBusinessesPerEnquiry);
}
