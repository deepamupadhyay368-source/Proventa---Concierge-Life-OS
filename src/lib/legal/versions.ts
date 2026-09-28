/**
 * PROVENTA — CANONICAL POLICY & LEGAL VERSION CONFIGURATION
 * Single source of truth for legal documents, effective dates, and policy versions.
 */

export const POLICY_VERSIONS = {
  privacy: '1.0',
  terms: '1.0',
  privateBeta: '1.0',
  conciergeTerms: '1.0',
  payments: '1.0',
  aiDisclosure: '1.0',
  refunds: '1.0',
  cookies: '1.0',
  security: '1.0',
} as const;

export const POLICY_EFFECTIVE_DATES = {
  privacy: 'September 2026',
  terms: 'September 2026',
  privateBeta: 'September 2026',
  conciergeTerms: 'September 2026',
  payments: 'September 2026',
  aiDisclosure: 'September 2026',
  refunds: 'September 2026',
  cookies: 'September 2026',
  security: 'September 2026',
} as const;

export interface LegalDocumentMeta {
  slug: string;
  href: string;
  title: string;
  shortTitle: string;
  version: string;
  effectiveDate: string;
  description: string;
  category: 'CORE' | 'SERVICES' | 'TRANSPARENCY' | 'RIGHTS';
}

export const LEGAL_DOCUMENTS: LegalDocumentMeta[] = [
  {
    slug: 'privacy',
    href: '/legal/privacy',
    title: 'Privacy Policy',
    shortTitle: 'Privacy',
    version: POLICY_VERSIONS.privacy,
    effectiveDate: POLICY_EFFECTIVE_DATES.privacy,
    description: 'Factual disclosures on personal data collection, sovereign processing, lifestyle preference handling, and user rights.',
    category: 'CORE',
  },
  {
    slug: 'terms',
    href: '/legal/terms',
    title: 'Terms of Service',
    shortTitle: 'Terms',
    version: POLICY_VERSIONS.terms,
    effectiveDate: POLICY_EFFECTIVE_DATES.terms,
    description: 'Comprehensive agreement governing account registration, request delegation, recommendation cycles, and member responsibilities.',
    category: 'CORE',
  },
  {
    slug: 'private-beta',
    href: '/legal/private-beta',
    title: 'Private Beta Terms',
    shortTitle: 'Private Beta',
    version: POLICY_VERSIONS.privateBeta,
    effectiveDate: POLICY_EFFECTIVE_DATES.privateBeta,
    description: 'Specific terms governing early access participation, evolving provider integrations, and human concierge coordination.',
    category: 'CORE',
  },
  {
    slug: 'concierge-terms',
    href: '/legal/concierge-terms',
    title: 'Concierge Service Terms',
    shortTitle: 'Concierge Terms',
    version: POLICY_VERSIONS.conciergeTerms,
    effectiveDate: POLICY_EFFECTIVE_DATES.conciergeTerms,
    description: 'Operational lifecycle from research and 5-option cycles to customer approval, provider execution, and zero-fabrication standards.',
    category: 'SERVICES',
  },
  {
    slug: 'refunds',
    href: '/legal/refunds',
    title: 'Cancellation & Refund Policy',
    shortTitle: 'Refunds & Cancellation',
    version: POLICY_VERSIONS.refunds,
    effectiveDate: POLICY_EFFECTIVE_DATES.refunds,
    description: 'Clear distinction between Proventa concierge services and third-party merchant/provider cancellation terms.',
    category: 'SERVICES',
  },
  {
    slug: 'payments',
    href: '/legal/payments',
    title: 'Payment Terms & Security',
    shortTitle: 'Payment Terms',
    version: POLICY_VERSIONS.payments,
    effectiveDate: POLICY_EFFECTIVE_DATES.payments,
    description: 'Secure checkout processing via Razorpay, UPI Autopay authorizations, and non-custodial payment credential standards.',
    category: 'SERVICES',
  },
  {
    slug: 'ai',
    href: '/legal/ai',
    title: 'AI & Automation Disclosure',
    shortTitle: 'AI Disclosure',
    version: POLICY_VERSIONS.aiDisclosure,
    effectiveDate: POLICY_EFFECTIVE_DATES.aiDisclosure,
    description: 'How AI assists with classification and research, why AI outputs require genuine provider confirmation, and human oversight.',
    category: 'TRANSPARENCY',
  },
  {
    slug: 'cookies',
    href: '/legal/cookies',
    title: 'Cookie Policy',
    shortTitle: 'Cookies',
    version: POLICY_VERSIONS.cookies,
    effectiveDate: POLICY_EFFECTIVE_DATES.cookies,
    description: 'Actual session authentication, CSRF tokens, and preference cookies used. Zero third-party behavioral advertising trackers.',
    category: 'TRANSPARENCY',
  },
  {
    slug: 'security',
    href: '/legal/security',
    title: 'Security & Trust Architecture',
    shortTitle: 'Security',
    version: POLICY_VERSIONS.security,
    effectiveDate: POLICY_EFFECTIVE_DATES.security,
    description: 'Multi-layer defense: password hashing, role-based isolation, personal security keys, TLS encryption, and immutable audit logs.',
    category: 'TRANSPARENCY',
  },
  {
    slug: 'privacy-requests',
    href: '/legal/privacy-requests',
    title: 'Data Rights & Privacy Requests',
    shortTitle: 'Privacy Requests',
    version: POLICY_VERSIONS.privacy,
    effectiveDate: POLICY_EFFECTIVE_DATES.privacy,
    description: 'Self-service data export (JSON), correction requests, account erasure, and consent withdrawal mechanisms.',
    category: 'RIGHTS',
  },
  {
    slug: 'grievance',
    href: '/legal/grievance',
    title: 'Grievance & Privacy Redressal',
    shortTitle: 'Grievance Officer',
    version: POLICY_VERSIONS.privacy,
    effectiveDate: POLICY_EFFECTIVE_DATES.privacy,
    description: 'Designated contact channel (privacy@proventa.in) and formal complaint escalation procedures.',
    category: 'RIGHTS',
  },
];
