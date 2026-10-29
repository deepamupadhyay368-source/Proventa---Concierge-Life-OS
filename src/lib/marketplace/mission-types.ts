import type {
  MatchScoreBreakdown,
  QuotationPriceType,
  QuotationStatus,
} from './types';

export type MissionStage =
  | 'DRAFT'
  | 'MATCHING'
  | 'RFQ_PENDING_APPROVAL'
  | 'RFQ_DISPATCHED'
  | 'QUOTATIONS_RECEIVED'
  | 'IN_REVIEW'
  | 'OFFER_ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type MissionUrgency = 'STANDARD' | 'URGENT' | 'CRITICAL';
export type MissionDeliveryMode = 'ON_SITE' | 'REMOTE' | 'DELIVERY' | 'EITHER';
export type MissionActorRole = 'CUSTOMER' | 'BUSINESS' | 'CONCIERGE' | 'SYSTEM';

export type MissionActivityType =
  | 'MISSION_CREATED'
  | 'AI_PARSED'
  | 'RFQ_APPROVED'
  | 'RFQ_DISPATCHED'
  | 'QUOTATION_RECEIVED'
  | 'QUOTATION_SHORTLISTED'
  | 'QUOTATION_ACCEPTED'
  | 'QUOTATION_DECLINED'
  | 'CONCIERGE_FALLBACK_REQUESTED'
  | 'STATUS_UPDATED'
  | 'COMPLETION_CONFIRMED'
  | 'MISSION_CANCELLED';

export interface StructuredMissionBrief {
  title: string;
  categorySlug: string;
  categoryName: string;
  scopeSummary: string;
  deliverables: string[];
  specifications: Record<string, string>;
  qualityStandards: string[];
  urgencyLevel: MissionUrgency;
  timeline: string;
  budgetMin: number | null;
  budgetMax: number | null;
  city: string;
  deliveryMode: MissionDeliveryMode;
  priorities: string[];
  confidenceScore: number; // 0.0 - 1.0
  missingInformation: string[];
  clarificationQuestions: string[];
  aiExtracted: boolean;
}

export interface MissionVerifiedFacts {
  isVerified: boolean;
  verificationBadge: string;
  establishedYear?: number;
  registeredCity: string;
  state: string;
  panIndiaCoverage: boolean;
  gstVerified: boolean;
  activeOfferingsCount: number;
}

export interface MissionSupplierClaims {
  highlights: string[];
  tagline?: string;
  serviceAreas: string[];
  turnaroundClaim?: string;
  tags: string[];
}

export interface MissionAIEstimates {
  matchScore: number;
  relevanceRationale: string;
  capabilityFit: 'HIGH' | 'MEDIUM' | 'MODERATE';
}

export interface MissionCandidateSupplier {
  businessId: string;
  businessName: string;
  businessSlug: string;
  businessCity: string;
  matchScore: number;
  matchReasons: string[];
  scoreBreakdown: MatchScoreBreakdown;
  verifiedFacts: MissionVerifiedFacts;
  supplierClaims: MissionSupplierClaims;
  aiEstimates: MissionAIEstimates;
  approvedForRfq: boolean;
  notifiedAt: string | null;
}

export interface MissionActivityDTO {
  id: string;
  enquiryId: string;
  actorId: string;
  actorRole: MissionActorRole;
  type: MissionActivityType;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface QuotationComparisonItem {
  quotationId: string;
  referenceCode: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  businessCity: string;
  isVerified: boolean;
  verificationBadge: string;
  summary: string;
  detailedProposal: string;
  priceType: QuotationPriceType;
  priceAmount: number | null;
  deliveryTimeline: string;
  inclusions: string[];
  exclusions: string | null;
  terms: string | null;
  validUntil: string | null;
  status: QuotationStatus;
  customerNote: string | null;
  createdAt: string;
  transparentScore: {
    overallScore: number;
    priceCompetitiveness: 'EXCELLENT' | 'COMPETITIVE' | 'CUSTOM';
    timelinePace: 'FAST' | 'STANDARD' | 'ESTIMATED';
    verifiedBonus: number;
  };
}

export interface MissionDTO {
  id: string;
  referenceCode: string;
  customerId: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  isMission: boolean;
  missionStage: MissionStage;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  city: string;
  state: string;
  deliveryMode: MissionDeliveryMode;
  quantity: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  timeline: string | null;
  urgency: string;
  aiBrief: StructuredMissionBrief | null;
  approvedSupplierIds: string[];
  conciergeFallback: boolean;
  completionNote: string | null;
  acceptedQuotationId: string | null;
  candidateSuppliers: MissionCandidateSupplier[];
  quotations: QuotationComparisonItem[];
  activities: MissionActivityDTO[];
  createdAt: string;
  updatedAt: string;
}
