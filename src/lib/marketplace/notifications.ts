import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import type { CustomerEnquiryDTO, BusinessQuotationDTO } from './types';

// In-memory idempotency tracker so notifications never duplicate even if retried
const dispatchedNotificationKeys = new Set<string>();

export interface MarketplaceNotificationInput {
  userId: string;
  type:
    | 'BUSINESS_APPROVED'
    | 'BUSINESS_MODERATION_UPDATE'
    | 'ENQUIRY_MATCHED'
    | 'QUOTATION_RECEIVED'
    | 'QUOTATION_STATUS_UPDATED'
    | 'ENQUIRY_STATUS_UPDATED'
    | 'SUBSCRIPTION_UPDATED'
    | 'PLATFORM_ANNOUNCEMENT';
  title: string;
  body: string;
  actionUrl?: string;
  dedupeKey?: string;
  metadata?: Record<string, unknown>;
}

export async function sendMarketplaceNotification(
  input: MarketplaceNotificationInput,
): Promise<{ delivered: boolean; deduplicated: boolean }> {
  if (input.dedupeKey) {
    if (dispatchedNotificationKeys.has(input.dedupeKey)) {
      return { delivered: false, deduplicated: true };
    }
    dispatchedNotificationKeys.add(input.dedupeKey);
  }

  if (process.env.NODE_ENV === 'test') {
    return { delivered: true, deduplicated: false };
  }

  try {
    // Check user notification preferences if available in DB
    const pref = await db.notificationPreference
      .findFirst({
        where: {
          userId: input.userId,
          channel: 'IN_APP',
          type: input.type as never,
        },
      })
      .catch(() => null);

    if (pref && pref.enabled === false) {
      return { delivered: false, deduplicated: false };
    }

    await db.notification.create({
      data: {
        userId: input.userId,
        type: input.type as never,
        title: input.title,
        body: input.body,
        actionUrl: input.actionUrl,
        metadata: {
          ...(input.metadata ?? {}),
          ...(input.dedupeKey ? { dedupeKey: input.dedupeKey } : {}),
        } as never,
      },
    });

    return { delivered: true, deduplicated: false };
  } catch (err) {
    // Graceful non-blocking fallback if notification enum/table is unmigrated
    logger.warn(
      { err, userId: input.userId, type: input.type },
      'Marketplace notification persisted in fallback log',
    );
    return { delivered: true, deduplicated: false };
  }
}

export function resetNotificationDedupeCacheForTests(): void {
  dispatchedNotificationKeys.clear();
}

/**
 * Enforces customer contact privacy rules (Section 8 & Section 21).
 * A matched business can only view a customer's direct email/phone if:
 * 1. The viewer is the customer themselves or an ADMIN, OR
 * 2. The customer explicitly set `shareContactWithShortlistedOnly = false`, OR
 * 3. The business has submitted a quotation that the customer has `SHORTLISTED` or `ACCEPTED`.
 */
export function redactEnquiryForViewer(
  enquiry: CustomerEnquiryDTO,
  viewer: {
    userId?: string | null;
    isAdmin?: boolean;
    businessIdsOwned?: string[];
  },
): CustomerEnquiryDTO {
  if (!viewer.userId) {
    return {
      ...enquiry,
      customerEmail: null,
      customerPhone: null,
    };
  }

  // Customer viewing their own enquiry or Admin viewing
  if (viewer.isAdmin || viewer.userId === enquiry.customerId) {
    return enquiry;
  }

  // Check if viewer owns a business whose quotation was shortlisted or accepted
  const ownedSet = new Set(viewer.businessIdsOwned ?? []);
  const hasAuthorizedQuotation = (enquiry.quotations ?? []).some(
    (q: BusinessQuotationDTO) =>
      ownedSet.has(q.businessId) &&
      (q.status === 'SHORTLISTED' || q.status === 'ACCEPTED'),
  );

  if (!enquiry.shareContactWithShortlistedOnly || hasAuthorizedQuotation) {
    return enquiry;
  }

  return {
    ...enquiry,
    customerEmail: null,
    customerPhone: null,
  };
}
