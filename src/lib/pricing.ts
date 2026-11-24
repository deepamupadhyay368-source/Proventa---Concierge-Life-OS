import { db } from '@/lib/db';
import type { MembershipPlan as PrismaPlan, PlanBillingInterval, PlanBookingPriority } from '@prisma/client';

export interface MembershipPlanData {
  id: string;
  name: string;
  pricePaise: number;
  monthlyPrice: number;
  currency: string;
  billingInterval: 'MONTHLY' | 'ANNUAL';
  visitEntitlement: number;
  allocationIntervalMonths: number;
  visitsPerAllocation: number;
  visitDurationMinutes: number;
  bookingPriority: 'STANDARD' | 'PRIORITY' | 'HIGHEST';
  serviceCategories: string[];
  features: string[];
  isActive: boolean;
  displayOrder: number;
}

export const OFFICIAL_PLANS: Record<string, MembershipPlanData> = {
  essential: {
    id: 'essential',
    name: 'Essential',
    pricePaise: 34900,
    monthlyPrice: 349,
    currency: 'INR',
    billingInterval: 'MONTHLY',
    visitEntitlement: 4,
    allocationIntervalMonths: 3,
    visitsPerAllocation: 1,
    visitDurationMinutes: 45,
    bookingPriority: 'STANDARD',
    serviceCategories: ['Minor plumbing', 'Minor electrical', 'Minor carpentry'],
    features: [
      '4 maintenance visits per year',
      '1 visit every 3 months',
      'Maximum 45 minutes per visit',
      'Standard booking priority',
      'Household Maintenance Passport included',
      'Maintenance reminders included',
      'Minor plumbing, electrical & carpentry',
    ],
    isActive: true,
    displayOrder: 1,
  },
  family: {
    id: 'family',
    name: 'Family',
    pricePaise: 69900,
    monthlyPrice: 699,
    currency: 'INR',
    billingInterval: 'MONTHLY',
    visitEntitlement: 12,
    allocationIntervalMonths: 1,
    visitsPerAllocation: 1,
    visitDurationMinutes: 45,
    bookingPriority: 'PRIORITY',
    serviceCategories: ['Minor plumbing', 'Minor electrical', 'Minor carpentry'],
    features: [
      '12 maintenance visits per year',
      '1 visit per billing month',
      'Maximum 45 minutes per visit',
      'Priority booking queue',
      'Annual household maintenance review included',
      'Household Maintenance Passport included',
      'Maintenance reminders included',
      'Minor plumbing, electrical & carpentry',
    ],
    isActive: true,
    displayOrder: 2,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    pricePaise: 119900,
    monthlyPrice: 1199,
    currency: 'INR',
    billingInterval: 'MONTHLY',
    visitEntitlement: 24,
    allocationIntervalMonths: 1,
    visitsPerAllocation: 2,
    visitDurationMinutes: 45,
    bookingPriority: 'HIGHEST',
    serviceCategories: ['Minor plumbing', 'Minor electrical', 'Minor carpentry'],
    features: [
      '24 maintenance visits per year',
      '2 visits per billing month',
      'Maximum 45 minutes per visit',
      'Highest booking priority',
      'Quarterly preventive maintenance inspection included',
      'Household asset register included',
      'Household Maintenance Passport included',
      'Maintenance reminders included',
      'Same-technician preference (subject to availability)',
      'Minor plumbing, electrical & carpentry',
    ],
    isActive: true,
    displayOrder: 3,
  },
};

/**
 * Seed approved membership plans idempotently into the database.
 */
export async function seedMembershipPlans(): Promise<void> {
  for (const plan of Object.values(OFFICIAL_PLANS)) {
    await db.membershipPlan.upsert({
      where: { id: plan.id },
      create: {
        id: plan.id,
        name: plan.name,
        pricePaise: plan.pricePaise,
        currency: plan.currency,
        billingInterval: plan.billingInterval as PlanBillingInterval,
        visitEntitlement: plan.visitEntitlement,
        allocationIntervalMonths: plan.allocationIntervalMonths,
        visitsPerAllocation: plan.visitsPerAllocation,
        visitDurationMinutes: plan.visitDurationMinutes,
        bookingPriority: plan.bookingPriority as PlanBookingPriority,
        serviceCategories: plan.serviceCategories,
        features: plan.features,
        isActive: plan.isActive,
        displayOrder: plan.displayOrder,
      },
      update: {
        name: plan.name,
        pricePaise: plan.pricePaise,
        currency: plan.currency,
        billingInterval: plan.billingInterval as PlanBillingInterval,
        visitEntitlement: plan.visitEntitlement,
        allocationIntervalMonths: plan.allocationIntervalMonths,
        visitsPerAllocation: plan.visitsPerAllocation,
        visitDurationMinutes: plan.visitDurationMinutes,
        bookingPriority: plan.bookingPriority as PlanBookingPriority,
        serviceCategories: plan.serviceCategories,
        features: plan.features,
        isActive: plan.isActive,
        displayOrder: plan.displayOrder,
      },
    });
  }
}

/**
 * Get single plan by ID. Fallbacks safely to official fallback configuration if DB query fails or during cold start.
 */
export async function getPlan(id: string): Promise<MembershipPlanData> {
  const normalizedId = id.trim().toLowerCase();
  try {
    const dbPlan = await db.membershipPlan.findUnique({
      where: { id: normalizedId },
    });
    if (dbPlan && dbPlan.isActive) {
      return {
        id: dbPlan.id,
        name: dbPlan.name,
        pricePaise: dbPlan.pricePaise,
        monthlyPrice: Math.round(dbPlan.pricePaise / 100),
        currency: dbPlan.currency,
        billingInterval: dbPlan.billingInterval,
        visitEntitlement: dbPlan.visitEntitlement,
        allocationIntervalMonths: dbPlan.allocationIntervalMonths,
        visitsPerAllocation: dbPlan.visitsPerAllocation,
        visitDurationMinutes: dbPlan.visitDurationMinutes,
        bookingPriority: dbPlan.bookingPriority,
        serviceCategories: dbPlan.serviceCategories,
        features: dbPlan.features,
        isActive: dbPlan.isActive,
        displayOrder: dbPlan.displayOrder,
      };
    }
  } catch (err) {
    // Database connection fallback
  }

  const fallback = OFFICIAL_PLANS[normalizedId];
  if (!fallback) {
    throw new Error(`Plan with ID "${id}" not found`);
  }
  return fallback;
}

/**
 * List all active plans ordered by display order.
 */
export async function listPlans(): Promise<MembershipPlanData[]> {
  try {
    const dbPlans = await db.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    if (dbPlans && dbPlans.length > 0) {
      return dbPlans.map((p) => ({
        id: p.id,
        name: p.name,
        pricePaise: p.pricePaise,
        monthlyPrice: Math.round(p.pricePaise / 100),
        currency: p.currency,
        billingInterval: p.billingInterval,
        visitEntitlement: p.visitEntitlement,
        allocationIntervalMonths: p.allocationIntervalMonths,
        visitsPerAllocation: p.visitsPerAllocation,
        visitDurationMinutes: p.visitDurationMinutes,
        bookingPriority: p.bookingPriority,
        serviceCategories: p.serviceCategories,
        features: p.features,
        isActive: p.isActive,
        displayOrder: p.displayOrder,
      }));
    }
  } catch (err) {
    // Fallback to official plans array
  }

  return Object.values(OFFICIAL_PLANS).sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Calculate tax in paise (18% GST).
 */
export function calculateTax(amountPaise: number, ratePercent = 18): number {
  return Math.round((amountPaise * ratePercent) / 100);
}

/**
 * Calculate checkout total amount in paise.
 */
export function getCheckoutAmount(planId: string, applyTax = true): {
  planId: string;
  baseAmountPaise: number;
  taxPaise: number;
  totalAmountPaise: number;
  currency: string;
} {
  const plan = OFFICIAL_PLANS[planId.toLowerCase()];
  if (!plan) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }
  const baseAmountPaise = plan.pricePaise;
  const taxPaise = applyTax ? calculateTax(baseAmountPaise) : 0;
  const totalAmountPaise = baseAmountPaise + taxPaise;

  return {
    planId: plan.id,
    baseAmountPaise,
    taxPaise,
    totalAmountPaise,
    currency: plan.currency,
  };
}
