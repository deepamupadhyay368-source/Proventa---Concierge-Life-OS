export type MembershipTierSlug = 'select' | 'private' | 'reserve';

export interface MembershipPlan {
  id: MembershipTierSlug;
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

export const CANONICAL_MEMBERSHIP_PLANS: Record<MembershipTierSlug, MembershipPlan> = {
  select: {
    id: 'select',
    name: 'SELECT',
    priceInr: 2499,
    pricePaise: 249900,
    formattedPrice: '₹2,499',
    cadence: '/month',
    positioning: 'Your everyday Concierge.',
    description: 'Essential life coordination and intelligent planning for professionals and individuals.',
    priorityLevel: 'STANDARD',
    benefits: [
      'AI-powered planning',
      'Dining & experiences',
      'Travel planning',
      'Events & activities',
      'Gifting',
      'Appointments',
      'Weekend planning',
      'Human Concierge assistance',
      'Standard priority',
    ],
  },
  private: {
    id: 'private',
    name: 'PRIVATE',
    priceInr: 4999,
    pricePaise: 499900,
    formattedPrice: '₹4,999',
    cadence: '/month',
    positioning: 'More of your life, handled.',
    description: 'Elevated, high-touch support and complex coordination for active individuals and families.',
    recommended: true,
    badge: 'Recommended',
    priorityLevel: 'PRIORITY',
    benefits: [
      'AI-powered planning',
      'Dining & experiences',
      'Travel planning',
      'Events & activities',
      'Gifting',
      'Appointments',
      'Weekend planning',
      'Human Concierge assistance',
      'Priority Concierge',
      'Faster response',
      'Complex requests',
      'Bespoke planning',
      'Deeper personalization',
      'Priority human execution',
      'Family assistance',
    ],
  },
  reserve: {
    id: 'reserve',
    name: 'RESERVE',
    priceInr: 9999,
    pricePaise: 999900,
    formattedPrice: '₹9,999',
    cadence: '/month',
    positioning: 'Your life, personally managed.',
    description: 'Comprehensive personal management with dedicated concierge desk and proactive planning.',
    priorityLevel: 'HIGHEST_DEDICATED',
    benefits: [
      'AI-powered planning',
      'Dining & experiences',
      'Travel planning',
      'Events & activities',
      'Gifting',
      'Appointments',
      'Weekend planning',
      'Human Concierge assistance',
      'Priority Concierge',
      'Faster response',
      'Complex requests',
      'Bespoke planning',
      'Deeper personalization',
      'Priority human execution',
      'Family assistance',
      'Highest request priority',
      'Dedicated Concierge',
      'Bespoke lifestyle management',
      'Family & household assistance',
      'Premium travel planning',
      'High-touch personal assistance',
      'Proactive planning',
    ],
  },
};

export const MEMBERSHIP_PLANS_LIST: MembershipPlan[] = [
  CANONICAL_MEMBERSHIP_PLANS.select,
  CANONICAL_MEMBERSHIP_PLANS.private,
  CANONICAL_MEMBERSHIP_PLANS.reserve,
];

export const MEMBERSHIP_COMPARISON_MATRIX = [
  { feature: 'AI-powered planning', select: true, private: true, reserve: true },
  { feature: 'Dining & experiences', select: true, private: true, reserve: true },
  { feature: 'Travel planning', select: true, private: true, reserve: true },
  { feature: 'Events & activities', select: true, private: true, reserve: true },
  { feature: 'Gifting', select: true, private: true, reserve: true },
  { feature: 'Appointments', select: true, private: true, reserve: true },
  { feature: 'Weekend planning', select: true, private: true, reserve: true },
  { feature: 'Human Concierge assistance', select: true, private: true, reserve: true },
  { feature: 'Standard priority', select: true, private: false, reserve: false },
  { feature: 'Priority Concierge', select: false, private: true, reserve: true },
  { feature: 'Faster response', select: false, private: true, reserve: true },
  { feature: 'Complex requests', select: false, private: true, reserve: true },
  { feature: 'Bespoke planning', select: false, private: true, reserve: true },
  { feature: 'Deeper personalization', select: false, private: true, reserve: true },
  { feature: 'Priority human execution', select: false, private: true, reserve: true },
  { feature: 'Family assistance', select: false, private: true, reserve: true },
  { feature: 'Highest request priority', select: false, private: false, reserve: true },
  { feature: 'Dedicated Concierge', select: false, private: false, reserve: true },
  { feature: 'Bespoke lifestyle management', select: false, private: false, reserve: true },
  { feature: 'Family & household assistance', select: false, private: false, reserve: true },
  { feature: 'Premium travel planning', select: false, private: false, reserve: true },
  { feature: 'High-touch personal assistance', select: false, private: false, reserve: true },
  { feature: 'Proactive planning', select: false, private: false, reserve: true },
];

export const MEMBERSHIP_PAYMENT_DISCLOSURE =
  "Membership covers Proventa's Concierge service. Purchases and third-party services are charged separately.";

export function getPlanById(planId?: string | null): MembershipPlan | null {
  if (!planId) return null;
  const normalized = planId.toLowerCase().trim() as MembershipTierSlug;
  return CANONICAL_MEMBERSHIP_PLANS[normalized] || null;
}

export function isValidPlanId(planId?: string | null): planId is MembershipTierSlug {
  if (!planId) return false;
  const normalized = planId.toLowerCase().trim();
  return normalized === 'select' || normalized === 'private' || normalized === 'reserve';
}

export function normalizeMembershipPlan(planString?: string | null): MembershipPlan {
  if (!planString) return CANONICAL_MEMBERSHIP_PLANS.select;
  const normalized = planString.toLowerCase().trim();
  if (normalized.includes('reserve')) return CANONICAL_MEMBERSHIP_PLANS.reserve;
  if (normalized.includes('private')) return CANONICAL_MEMBERSHIP_PLANS.private;
  return CANONICAL_MEMBERSHIP_PLANS.select;
}

