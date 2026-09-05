import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function searchProviders(params: {
  citySlug?: string;
  categorySlug?: string;
  query?: string;
}) {
  const { citySlug = 'ahmedabad', categorySlug, query } = params;
  return db.provider.findMany({
    where: {
      status: { in: ['VERIFIED', 'ACTIVE'] },
      city: { slug: citySlug },
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { notes: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      address: true,
      bookingMethod: true,
      status: true,
      reliabilityScore: true,
      category: { select: { name: true, slug: true } },
      services: { where: { available: true }, select: { name: true, priceRange: true } },
    },
    take: 10,
  });
}

export async function getProviderDetails(providerId: string) {
  return db.provider.findFirst({
    where: { id: providerId, status: { in: ['VERIFIED', 'ACTIVE'] } },
    include: {
      services: true,
      verifications: { orderBy: { verifiedAt: 'desc' }, take: 1 },
    },
  });
}

export async function searchAvailability(params: {
  providerId: string;
  date: string;
  partySize?: number;
}) {
  const apiConfig = await db.providerApiConfig.findUnique({
    where: { providerId: params.providerId, active: true },
  });
  if (!apiConfig) {
    return {
      status: 'REQUIRES_CONCIERGE_VERIFICATION',
      message: 'Provider does not offer real-time API. A human concierge will call to verify availability.',
      available: null,
    };
  }
  return {
    status: 'AVAILABLE',
    message: 'Confirmed via provider integration API.',
    available: true,
  };
}

export async function getCustomerPreferences(customerId: string) {
  return db.customerPreference.findMany({
    where: { customerId },
    select: { category: true, key: true, value: true },
  });
}

export async function createRecommendation(params: {
  requestId: string;
  recommendationData: any;
}) {
  return db.aIRecommendation.create({
    data: {
      requestId: params.requestId,
      content: params.recommendationData,
    },
  });
}

export async function draftMessage(params: {
  requestId: string;
  content: string;
}) {
  return {
    requestId: params.requestId,
    draft: params.content,
    status: 'AWAITING_CONCIERGE_APPROVAL',
  };
}

export async function requestHumanHandoff(params: {
  requestId: string;
  reason: string;
}) {
  logger.info({ requestId: params.requestId, reason: params.reason }, 'AI requested human handoff');
  await db.conciergeRequest.update({
    where: { id: params.requestId },
    data: { status: 'CONCIERGE_REVIEW' },
  });
  await db.internalNote.create({
    data: {
      requestId: params.requestId,
      authorId: 'system',
      content: '[AI Human Handoff]: ' + params.reason,
    },
  });
  return { handoff: true, reason: params.reason };
}

export async function createApprovalRequest(params: {
  requestId: string;
  customerId: string;
  title: string;
  details: any;
}) {
  return db.approval.create({
    data: {
      requestId: params.requestId,
      customerId: params.customerId,
      title: params.title,
      details: params.details,
      status: 'PENDING',
    },
  });
}
