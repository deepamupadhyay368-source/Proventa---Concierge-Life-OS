import { BUSINESS_SUBSCRIPTION_PLANS, type BusinessPlanTier } from '@/lib/brand';
import type { BusinessSubscriptionDTO, SubscriptionPlanTier } from './types';
import { AuthorizationError } from '@/lib/errors';
import { createHmac } from 'crypto';

export interface PlanEntitlementCheck {
  allowed: boolean;
  reason?: string;
  currentTier: SubscriptionPlanTier;
  limit: number;
  used: number;
  upgradeRecommended?: SubscriptionPlanTier;
}

export function getPlanLimits(tier: SubscriptionPlanTier) {
  const plan = BUSINESS_SUBSCRIPTION_PLANS[tier as BusinessPlanTier] ?? BUSINESS_SUBSCRIPTION_PLANS.FREE;
  return plan.limits;
}

export function checkListingEntitlement(
  subscription: Pick<BusinessSubscriptionDTO, 'planTier' | 'status' | 'listingsLimit'> | null | undefined,
  currentPublishedOrDraftListingsCount: number,
): PlanEntitlementCheck {
  const tier: SubscriptionPlanTier =
    subscription && subscription.status === 'ACTIVE' ? subscription.planTier : 'FREE';
  const limits = getPlanLimits(tier);
  const maxListings = subscription?.listingsLimit ?? limits.maxListings;

  if (currentPublishedOrDraftListingsCount >= maxListings) {
    return {
      allowed: false,
      reason: `Your ${tier} plan supports up to ${maxListings} product/service listings. Upgrade your plan to publish more offerings.`,
      currentTier: tier,
      limit: maxListings,
      used: currentPublishedOrDraftListingsCount,
      upgradeRecommended: tier === 'FREE' ? 'PRO' : 'PREMIUM',
    };
  }

  return {
    allowed: true,
    currentTier: tier,
    limit: maxListings,
    used: currentPublishedOrDraftListingsCount,
  };
}

export function checkQuotationEntitlement(
  subscription:
    | Pick<BusinessSubscriptionDTO, 'planTier' | 'status' | 'quotationsUsedMonth' | 'quotationsLimitMonth'>
    | null
    | undefined,
): PlanEntitlementCheck {
  const tier: SubscriptionPlanTier =
    subscription && subscription.status === 'ACTIVE' ? subscription.planTier : 'FREE';
  const limits = getPlanLimits(tier);
  const maxQuotes = subscription?.quotationsLimitMonth ?? limits.maxQuotationsPerMonth;
  const usedQuotes = subscription?.quotationsUsedMonth ?? 0;

  if (usedQuotes >= maxQuotes) {
    return {
      allowed: false,
      reason: `You have used all ${maxQuotes} monthly quotation responses included in your ${tier} plan. Upgrade to respond to more customer enquiries.`,
      currentTier: tier,
      limit: maxQuotes,
      used: usedQuotes,
      upgradeRecommended: tier === 'FREE' ? 'PRO' : 'PREMIUM',
    };
  }

  return {
    allowed: true,
    currentTier: tier,
    limit: maxQuotes,
    used: usedQuotes,
  };
}

export function checkTeamMemberEntitlement(
  subscription: Pick<BusinessSubscriptionDTO, 'planTier' | 'status' | 'teamMembersLimit'> | null | undefined,
  currentMembersCount: number,
): PlanEntitlementCheck {
  const tier: SubscriptionPlanTier =
    subscription && subscription.status === 'ACTIVE' ? subscription.planTier : 'FREE';
  const limits = getPlanLimits(tier);
  const maxMembers = subscription?.teamMembersLimit ?? limits.maxTeamMembers;

  if (currentMembersCount >= maxMembers) {
    return {
      allowed: false,
      reason: `Your ${tier} plan includes up to ${maxMembers} team member(s). Upgrade your plan to add additional team members.`,
      currentTier: tier,
      limit: maxMembers,
      used: currentMembersCount,
      upgradeRecommended: tier === 'FREE' ? 'PRO' : 'PREMIUM',
    };
  }

  return {
    allowed: true,
    currentTier: tier,
    limit: maxMembers,
    used: currentMembersCount,
  };
}

export function assertEntitlement(check: PlanEntitlementCheck): void {
  if (!check.allowed) {
    throw new AuthorizationError(check.reason || 'Plan limit reached');
  }
}

export function verifyRazorpayPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret?: string;
}): boolean {
  const secret = params.secret ?? process.env.RAZORPAY_KEY_SECRET ?? '';
  if (!secret || !params.orderId || !params.paymentId || !params.signature) {
    return false;
  }

  const payload = `${params.orderId}|${params.paymentId}`;
  const expectedSignature = createHmac('sha256', secret).update(payload).digest('hex');

  if (expectedSignature.length !== params.signature.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    diff |= expectedSignature.charCodeAt(i) ^ params.signature.charCodeAt(i);
  }
  return diff === 0;
}
