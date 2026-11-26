export type MembershipTierSlug = 'essential' | 'family' | 'premium' | 'select' | 'private' | 'reserve';

export interface MembershipPlan {
  id: string;
  name: string;
  priceInr: number; // In Rupees
  pricePaise: number; // In Paise for Razorpay
  formattedPrice: string;
  cadence: string;
  positioning: string;
  description: string;
  recommended?: boolean;
  benefits: string[];
  priorityLevel: 'STANDARD' | 'PRIORITY' | 'HIGHEST_DEDICATED';
  badge?: string;
}

export const CANONICAL_MEMBERSHIP_PLANS: Record<string, MembershipPlan> = {
  essential: {
    id: 'essential',
    name: 'Essential',
    priceInr: 349,
    pricePaise: 34900,
    formattedPrice: '₹349',
    cadence: '/month',
    positioning: 'Routine domestic peace of mind.',
    description: '4 maintenance visits per year (1 visit every 3 months). Max 45 mins per visit.',
    priorityLevel: 'STANDARD',
    benefits: [
      '4 maintenance visits per year',
      '1 visit allocated every 3 months',
      'Maximum 45 minutes per visit',
      'Minor plumbing, electrical & carpentry',
      'Standard booking priority',
      'Household Maintenance Passport included',
      'Maintenance reminders included',
    ],
  },
  family: {
    id: 'family',
    name: 'Family',
    priceInr: 699,
    pricePaise: 69900,
    formattedPrice: '₹699',
    cadence: '/month',
    positioning: 'Complete care for active homes.',
    description: '12 maintenance visits per year (1 visit per month). Max 45 mins per visit.',
    recommended: true,
    badge: 'Popular',
    priorityLevel: 'PRIORITY',
    benefits: [
      '12 maintenance visits per year',
      '1 visit allocated every month',
      'Maximum 45 minutes per visit',
      'Minor plumbing, electrical & carpentry',
      'Priority booking queue',
      'Annual household maintenance review included',
      'Household Maintenance Passport included',
      'Maintenance reminders included',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    priceInr: 1199,
    pricePaise: 119900,
    formattedPrice: '₹1,199',
    cadence: '/month',
    positioning: 'Comprehensive household maintenance & assurance.',
    description: '24 maintenance visits per year (2 visits per month). Max 45 mins per visit.',
    priorityLevel: 'HIGHEST_DEDICATED',
    badge: 'Comprehensive',
    benefits: [
      '24 maintenance visits per year',
      '2 visits allocated every month',
      'Maximum 45 minutes per visit',
      'Minor plumbing, electrical & carpentry',
      'Highest booking priority',
      'Quarterly preventive maintenance inspection included',
      'Household asset register included',
      'Household Maintenance Passport included',
      'Maintenance reminders included',
      'Same-technician preference (subject to availability)',
    ],
  },
  // Compatibility aliases for legacy lookups
  select: {
    id: 'essential',
    name: 'Essential',
    priceInr: 349,
    pricePaise: 34900,
    formattedPrice: '₹349',
    cadence: '/month',
    positioning: 'Routine domestic peace of mind.',
    description: '4 maintenance visits per year (1 visit every 3 months). Max 45 mins per visit.',
    priorityLevel: 'STANDARD',
    benefits: [
      '4 maintenance visits per year',
      '1 visit allocated every 3 months',
      'Maximum 45 minutes per visit',
      'Minor plumbing, electrical & carpentry',
    ],
  },
  private: {
    id: 'family',
    name: 'Family',
    priceInr: 699,
    pricePaise: 69900,
    formattedPrice: '₹699',
    cadence: '/month',
    positioning: 'Complete care for active homes.',
    description: '12 maintenance visits per year (1 visit per month). Max 45 mins per visit.',
    recommended: true,
    priorityLevel: 'PRIORITY',
    benefits: [
      '12 maintenance visits per year',
      '1 visit allocated every month',
      'Maximum 45 minutes per visit',
      'Minor plumbing, electrical & carpentry',
    ],
  },
  reserve: {
    id: 'premium',
    name: 'Premium',
    priceInr: 1199,
    pricePaise: 119900,
    formattedPrice: '₹1,199',
    cadence: '/month',
    positioning: 'Comprehensive household maintenance & assurance.',
    description: '24 maintenance visits per year (2 visits per month). Max 45 mins per visit.',
    priorityLevel: 'HIGHEST_DEDICATED',
    benefits: [
      '24 maintenance visits per year',
      '2 visits allocated every month',
      'Maximum 45 minutes per visit',
      'Minor plumbing, electrical & carpentry',
    ],
  },
};

export const MEMBERSHIP_PLANS_LIST: MembershipPlan[] = [
  CANONICAL_MEMBERSHIP_PLANS.essential,
  CANONICAL_MEMBERSHIP_PLANS.family,
  CANONICAL_MEMBERSHIP_PLANS.premium,
];

export const MEMBERSHIP_COMPARISON_ROWS = [
  { feature: 'Annual Visits', essential: '4 visits', family: '12 visits', premium: '24 visits' },
  { feature: 'Allocation Frequency', essential: '1 every 3 months', family: '1 every month', premium: '2 every month' },
  { feature: 'Max Visit Duration', essential: '45 minutes', family: '45 minutes', premium: '45 minutes' },
  { feature: 'Unused Visit Rollover', essential: 'No rollover', family: 'No rollover', premium: 'No rollover' },
  { feature: 'Minor Plumbing, Electrical & Carpentry', essential: true, family: true, premium: true },
  { feature: 'Household Maintenance Passport', essential: true, family: true, premium: true },
  { feature: 'Maintenance Reminders', essential: true, family: true, premium: true },
  { feature: 'Annual Maintenance Review', essential: false, family: true, premium: true },
  { feature: 'Quarterly Preventive Inspection', essential: false, family: false, premium: true },
  { feature: 'Household Asset Register', essential: false, family: false, premium: true },
];

export function getCanonicalPlan(planString?: string | null): MembershipPlan {
  if (!planString) return CANONICAL_MEMBERSHIP_PLANS.essential;
  const normalized = planString.toLowerCase().trim();
  if (normalized.includes('premium') || normalized.includes('reserve')) return CANONICAL_MEMBERSHIP_PLANS.premium;
  if (normalized.includes('family') || normalized.includes('private')) return CANONICAL_MEMBERSHIP_PLANS.family;
  return CANONICAL_MEMBERSHIP_PLANS.essential;
}

export const isValidPlanId = (id?: string | null): boolean => {
  if (!id) return false;
  return ['essential', 'family', 'premium', 'select', 'private', 'reserve'].includes(id.toLowerCase());
};

export const getPlanById = (id?: string | null): MembershipPlan => {
  return getCanonicalPlan(id);
};

export const MEMBERSHIP_PAYMENT_DISCLOSURE =
  'PROVENTA Home membership covers minor domestic maintenance visits as specified in the plan. All visits are capped at 45 minutes per visit. Materials and spare parts are charged separately at MRP.';
