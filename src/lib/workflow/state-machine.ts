import { RequestStatus } from '@prisma/client';

export const VALID_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  NEW: ['UNDERSTANDING', 'NEEDS_INFORMATION', 'CANCELLED'],
  UNDERSTANDING: ['NEEDS_INFORMATION', 'AI_RESEARCHING', 'CONCIERGE_REVIEW', 'CANCELLED'],
  NEEDS_INFORMATION: ['UNDERSTANDING', 'AI_RESEARCHING', 'CONCIERGE_REVIEW', 'CANCELLED'],
  AI_RESEARCHING: ['CONCIERGE_REVIEW', 'OPTIONS_READY', 'NEEDS_INFORMATION', 'CANCELLED'],
  CONCIERGE_REVIEW: ['OPTIONS_READY', 'NEEDS_INFORMATION', 'ESCALATED', 'CANCELLED'],
  OPTIONS_READY: ['AWAITING_CUSTOMER', 'CONCIERGE_REVIEW', 'CANCELLED'],
  AWAITING_CUSTOMER: ['APPROVED', 'NEEDS_INFORMATION', 'CANCELLED'],
  APPROVED: ['EXECUTING', 'CANCELLED'],
  EXECUTING: ['BOOKED', 'IN_PROGRESS', 'FAILED', 'ESCALATED', 'CANCELLED'],
  BOOKED: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'FAILED', 'ESCALATED'],
  COMPLETED: [],
  CANCELLED: [],
  FAILED: ['CONCIERGE_REVIEW', 'ESCALATED', 'CANCELLED'],
  ESCALATED: ['CONCIERGE_REVIEW', 'CANCELLED'],
};

export function isValidTransition(from: RequestStatus, to: RequestStatus): boolean {
  const allowed = VALID_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

export function assertValidTransition(from: RequestStatus, to: RequestStatus): void {
  if (!isValidTransition(from, to)) {
    throw new Error('Invalid state transition from ' + from + ' to ' + to);
  }
}
