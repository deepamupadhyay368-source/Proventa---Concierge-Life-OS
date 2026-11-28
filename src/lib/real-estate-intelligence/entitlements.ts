/**
 * PROVENTA — Real Estate Intelligence Centralised Plan Entitlements
 * Enforces Property OS passport limits, monthly PDF report quotas, and watchlist limits
 * from centralised plan definitions and live database usage counts.
 */

import { db } from '@/lib/db';

export type RealEstatePlanTier = 'FREE' | 'PERSONAL' | 'INVESTOR' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface RealEstatePlanLimits {
  tier: RealEstatePlanTier;
  maxPropertyPassports: number;
  maxMonthlyPdfReports: number;
  maxWatchlists: number;
  multiScenarioInvestment: boolean;
  apiAccessEnabled: boolean;
}

export const REAL_ESTATE_PLAN_LIMITS: Record<RealEstatePlanTier, RealEstatePlanLimits> = {
  FREE: {
    tier: 'FREE',
    maxPropertyPassports: 3,
    maxMonthlyPdfReports: 2,
    maxWatchlists: 5,
    multiScenarioInvestment: true,
    apiAccessEnabled: false,
  },
  PERSONAL: {
    tier: 'PERSONAL',
    maxPropertyPassports: 10,
    maxMonthlyPdfReports: 10,
    maxWatchlists: 20,
    multiScenarioInvestment: true,
    apiAccessEnabled: false,
  },
  INVESTOR: {
    tier: 'INVESTOR',
    maxPropertyPassports: 35,
    maxMonthlyPdfReports: 30,
    maxWatchlists: 100,
    multiScenarioInvestment: true,
    apiAccessEnabled: false,
  },
  PROFESSIONAL: {
    tier: 'PROFESSIONAL',
    maxPropertyPassports: 150,
    maxMonthlyPdfReports: 150,
    maxWatchlists: 500,
    multiScenarioInvestment: true,
    apiAccessEnabled: true,
  },
  ENTERPRISE: {
    tier: 'ENTERPRISE',
    maxPropertyPassports: 10_000,
    maxMonthlyPdfReports: 5_000,
    maxWatchlists: 5_000,
    multiScenarioInvestment: true,
    apiAccessEnabled: true,
  },
};

export async function resolveUserRealEstatePlan(
  userId: string,
  userRoles: readonly string[] = []
): Promise<RealEstatePlanLimits> {
  if (userRoles.some((r) => ['SUPER_ADMIN', 'FOUNDER', 'ADMIN'].includes(r))) {
    return REAL_ESTATE_PLAN_LIMITS.ENTERPRISE;
  }

  let sub = null;
  try {
    sub = await db.homeSubscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    // Gracefully fail closed to FREE tier limits if HomeSubscription table is not provisioned
    return REAL_ESTATE_PLAN_LIMITS.FREE;
  }

  if (!sub) return REAL_ESTATE_PLAN_LIMITS.FREE;

  const nameUpper = (sub.plan?.name || sub.planId || '').toUpperCase();
  if (nameUpper.includes('ENTERPRISE')) return REAL_ESTATE_PLAN_LIMITS.ENTERPRISE;
  if (nameUpper.includes('PROFESSIONAL') || nameUpper.includes('PREMIUM')) {
    return REAL_ESTATE_PLAN_LIMITS.PROFESSIONAL;
  }
  if (nameUpper.includes('INVESTOR') || nameUpper.includes('FAMILY')) {
    return REAL_ESTATE_PLAN_LIMITS.INVESTOR;
  }
  return REAL_ESTATE_PLAN_LIMITS.PERSONAL;
}

export async function checkPassportCreationEntitlement(
  userId: string,
  userRoles: readonly string[] = []
): Promise<{ allowed: boolean; used: number; limit: number; tier: RealEstatePlanTier }> {
  const plan = await resolveUserRealEstatePlan(userId, userRoles);
  const used = await db.propertyPassport.count({
    where: { ownerUserId: userId, deletedAt: null },
  });
  return {
    allowed: used < plan.maxPropertyPassports,
    used,
    limit: plan.maxPropertyPassports,
    tier: plan.tier,
  };
}

export async function checkMonthlyReportEntitlement(
  userId: string,
  userRoles: readonly string[] = []
): Promise<{ allowed: boolean; used: number; limit: number; tier: RealEstatePlanTier }> {
  const plan = await resolveUserRealEstatePlan(userId, userRoles);
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const used = await db.realEstateReport.count({
    where: { ownerUserId: userId, createdAt: { gte: monthStart } },
  });
  return {
    allowed: used < plan.maxMonthlyPdfReports,
    used,
    limit: plan.maxMonthlyPdfReports,
    tier: plan.tier,
  };
}
