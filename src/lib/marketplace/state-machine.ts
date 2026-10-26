import type {
  BusinessStatus,
  EnquiryStatus,
  QuotationStatus,
  MatchStatus,
} from './types';
import { ValidationError } from '@/lib/errors';

const ALLOWED_BUSINESS_TRANSITIONS: Record<BusinessStatus, BusinessStatus[]> = {
  DRAFT: ['PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'],
  PENDING_REVIEW: ['PUBLISHED', 'DRAFT', 'SUSPENDED', 'ARCHIVED'],
  PUBLISHED: ['DRAFT', 'SUSPENDED', 'ARCHIVED'],
  SUSPENDED: ['PUBLISHED', 'ARCHIVED'],
  ARCHIVED: ['DRAFT', 'PUBLISHED'],
};

const ALLOWED_ENQUIRY_TRANSITIONS: Record<EnquiryStatus, EnquiryStatus[]> = {
  DRAFT: ['OPEN', 'MATCHING', 'CANCELLED'],
  OPEN: ['MATCHING', 'RESPONSES_RECEIVED', 'CLOSED', 'CANCELLED', 'EXPIRED', 'FLAGGED_FOR_REVIEW'],
  MATCHING: ['OPEN', 'RESPONSES_RECEIVED', 'CLOSED', 'CANCELLED', 'EXPIRED', 'FLAGGED_FOR_REVIEW'],
  RESPONSES_RECEIVED: ['SHORTLISTED', 'ACCEPTED', 'CLOSED', 'CANCELLED', 'EXPIRED', 'FLAGGED_FOR_REVIEW'],
  SHORTLISTED: ['ACCEPTED', 'CLOSED', 'CANCELLED', 'FLAGGED_FOR_REVIEW'],
  ACCEPTED: ['CLOSED', 'FLAGGED_FOR_REVIEW'],
  CLOSED: [],
  CANCELLED: [],
  EXPIRED: ['CLOSED'],
  FLAGGED_FOR_REVIEW: ['OPEN', 'CLOSED', 'CANCELLED'],
};

const ALLOWED_QUOTATION_TRANSITIONS: Record<QuotationStatus, QuotationStatus[]> = {
  SUBMITTED: ['UPDATED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
  UPDATED: ['UPDATED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['UPDATED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
  ACCEPTED: [],
  REJECTED: ['SHORTLISTED'],
  WITHDRAWN: [],
};

const ALLOWED_MATCH_TRANSITIONS: Record<MatchStatus, MatchStatus[]> = {
  MATCHED: ['NOTIFIED', 'VIEWED', 'RESPONDED', 'DECLINED', 'EXPIRED'],
  NOTIFIED: ['VIEWED', 'RESPONDED', 'DECLINED', 'EXPIRED'],
  VIEWED: ['RESPONDED', 'DECLINED', 'EXPIRED'],
  RESPONDED: [],
  DECLINED: [],
  EXPIRED: [],
};

export function canTransitionBusinessStatus(
  from: BusinessStatus,
  to: BusinessStatus,
): boolean {
  if (from === to) return true;
  return (ALLOWED_BUSINESS_TRANSITIONS[from] ?? []).includes(to);
}

export function assertBusinessStatusTransition(
  from: BusinessStatus,
  to: BusinessStatus,
): void {
  if (!canTransitionBusinessStatus(from, to)) {
    throw new ValidationError(
      `Invalid business status transition from ${from} to ${to}`,
    );
  }
}

export function canTransitionEnquiryStatus(
  from: EnquiryStatus,
  to: EnquiryStatus,
): boolean {
  if (from === to) return true;
  return (ALLOWED_ENQUIRY_TRANSITIONS[from] ?? []).includes(to);
}

export function assertEnquiryStatusTransition(
  from: EnquiryStatus,
  to: EnquiryStatus,
): void {
  if (!canTransitionEnquiryStatus(from, to)) {
    throw new ValidationError(
      `Invalid enquiry status transition from ${from} to ${to}`,
    );
  }
}

export function canTransitionQuotationStatus(
  from: QuotationStatus,
  to: QuotationStatus,
): boolean {
  if (from === to) return true;
  return (ALLOWED_QUOTATION_TRANSITIONS[from] ?? []).includes(to);
}

export function assertQuotationStatusTransition(
  from: QuotationStatus,
  to: QuotationStatus,
): void {
  if (!canTransitionQuotationStatus(from, to)) {
    throw new ValidationError(
      `Invalid quotation status transition from ${from} to ${to}`,
    );
  }
}

export function canTransitionMatchStatus(
  from: MatchStatus,
  to: MatchStatus,
): boolean {
  if (from === to) return true;
  return (ALLOWED_MATCH_TRANSITIONS[from] ?? []).includes(to);
}

export function isBusinessPubliclyDiscoverable(business: {
  status: BusinessStatus;
  name?: string | null;
  primaryCategoryId?: string | null;
  city?: string | null;
}): boolean {
  return (
    business.status === 'PUBLISHED' &&
    Boolean(business.name && business.name.trim().length >= 2) &&
    Boolean(business.primaryCategoryId) &&
    Boolean(business.city)
  );
}

export function isEnquiryOpenForQuotations(status: EnquiryStatus): boolean {
  return (
    status === 'OPEN' ||
    status === 'MATCHING' ||
    status === 'RESPONSES_RECEIVED' ||
    status === 'SHORTLISTED'
  );
}
