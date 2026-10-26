/**
 * PROVENTA — Single Source of Truth for Brand & Platform Configuration
 * Product Category: Universal Business Discovery & Growth Platform
 */

export const BRAND_CONFIG = {
  name: 'PROVENTA',
  displayName: 'Proventa',
  tagline: 'Every Business. One Place.',
  supportingStatement: 'Discover businesses. Showcase products. Post enquiries. Connect and grow.',
  valueProposition: 'Businesses get discovered. Customers find solutions. Opportunities become connections.',
  centralValueProposition: 'Businesses get discovered. Customers find solutions. Opportunities become connections.',
  description:
    'PROVENTA is a universal business discovery and growth platform that helps businesses showcase their offerings, connect with potential customers, and receive relevant enquiries through one accessible digital marketplace.',
  shortDescription:
    'Discover businesses, explore products and services, and connect with the right providers across industries.',
  category: 'Universal Business Discovery & Growth Platform',
  domain: process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@proventa.in',
  initialCities: [
    'Ahmedabad',
    'Surat',
    'Vadodara',
    'Rajkot',
    'Gandhinagar',
    'Mumbai',
    'Bengaluru',
    'Delhi NCR',
    'Pune',
    'Hyderabad',
  ],
  initialMarket: {
    country: 'India',
    countryCode: 'IN',
    primaryState: 'Gujarat',
    featuredCities: [
      'Ahmedabad',
      'Surat',
      'Vadodara',
      'Rajkot',
      'Gandhinagar',
      'Mumbai',
      'Bengaluru',
      'Delhi NCR',
      'Pune',
      'Hyderabad',
    ],
  },
  urls: {
    base: process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in',
    exploreBusinesses: '/businesses',
    productsAndServices: '/listings',
    postEnquiry: '/enquiries/new',
    forBusinesses: '/for-businesses',
    registerBusiness: '/business/register',
    businessDashboard: '/business/dashboard',
    customerDashboard: '/dashboard',
    adminPortal: '/admin',
  },
  contact: {
    supportEmail: process.env.SUPPORT_EMAIL || 'support@proventa.in',
    privacyEmail: 'privacy@proventa.in',
  },
  seo: {
    defaultTitle: 'PROVENTA — Every Business. One Place.',
    titleTemplate: '%s | PROVENTA',
    keywords: [
      'PROVENTA',
      'business discovery platform',
      'digital storefront India',
      'customer enquiry marketplace',
      'B2B and B2C marketplace',
      'find suppliers and service providers',
      'Gujarat business directory',
      'India business network',
      'request quotations',
      'showcase products and services',
    ],
  },
} as const;

export interface InitialCategoryDef {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sortOrder: number;
  subcategories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
  }>;
  enquiryAttributes: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'select';
    placeholder?: string;
    options?: string[];
    required?: boolean;
  }>;
}

/**
 * Hierarchical initial category taxonomy covering all 18 required industry verticals.
 * Extensible via the administrator category management portal without code changes.
 */
export const INITIAL_MARKETPLACE_CATEGORIES: InitialCategoryDef[] = [
  {
    id: 'cat-tech-software',
    name: 'Technology & Software',
    slug: 'technology-software',
    description: 'Software development, IT services, cloud infrastructure, SaaS, and hardware solutions.',
    icon: 'Code2',
    sortOrder: 1,
    subcategories: [
      { id: 'sub-web-mobile', name: 'Web & Mobile App Development', slug: 'web-mobile-development', description: 'Custom web applications, iOS and Android development' },
      { id: 'sub-cloud-devops', name: 'Cloud & IT Infrastructure', slug: 'cloud-it-infrastructure', description: 'Cloud migration, DevOps, cybersecurity, and managed IT' },
      { id: 'sub-erp-crm', name: 'ERP, CRM & Enterprise Software', slug: 'erp-crm-software', description: 'Business automation, ERP implementation, and SaaS tools' },
    ],
    enquiryAttributes: [
      { key: 'projectScope', label: 'Project Scope', type: 'select', options: ['New Build', 'Feature Extension', 'Maintenance & Support', 'Licensing / SaaS', 'Hardware Procurement'] },
      { key: 'techStack', label: 'Preferred Technology / Platform', type: 'text', placeholder: 'e.g., React, Node.js, AWS, SAP, Tally' },
    ],
  },
  {
    id: 'cat-professional-services',
    name: 'Professional Services',
    slug: 'professional-services',
    description: 'B2B and B2C specialized business support, HR, recruitment, and operational services.',
    icon: 'Briefcase',
    sortOrder: 2,
    subcategories: [
      { id: 'sub-hr-staffing', name: 'HR & Recruitment', slug: 'hr-recruitment', description: 'Talent acquisition, payroll, and staffing services' },
      { id: 'sub-translation-writing', name: 'Translation & Documentation', slug: 'translation-documentation', description: 'Business documentation and localization' },
    ],
    enquiryAttributes: [
      { key: 'serviceMode', label: 'Delivery Mode', type: 'select', options: ['On-site', 'Remote', 'Hybrid'] },
      { key: 'engagementType', label: 'Engagement Type', type: 'select', options: ['One-time Project', 'Monthly Retainer', 'Annual Contract'] },
    ],
  },
  {
    id: 'cat-legal-compliance',
    name: 'Legal & Compliance',
    slug: 'legal-compliance',
    description: 'Corporate law, GST & regulatory filings, trademark registration, and contract advisory.',
    icon: 'Scale',
    sortOrder: 3,
    subcategories: [
      { id: 'sub-corporate-law', name: 'Corporate & Commercial Law', slug: 'corporate-commercial-law', description: 'Agreements, incorporation, and compliance' },
      { id: 'sub-ip-trademark', name: 'IP, Patents & Trademarks', slug: 'ip-patents-trademarks', description: 'Brand registration and intellectual property protection' },
    ],
    enquiryAttributes: [
      { key: 'jurisdiction', label: 'Jurisdiction / State', type: 'text', placeholder: 'e.g., Gujarat, Maharashtra, All India' },
      { key: 'entityType', label: 'Client Entity Type', type: 'select', options: ['Individual', 'Sole Proprietorship', 'LLP / Partnership', 'Private Limited'] },
    ],
  },
  {
    id: 'cat-accounting-finance',
    name: 'Accounting & Finance',
    slug: 'accounting-finance',
    description: 'Chartered accountants, bookkeeping, tax advisory, audit, and financial planning.',
    icon: 'Calculator',
    sortOrder: 4,
    subcategories: [
      { id: 'sub-tax-gst', name: 'GST & Income Tax Filing', slug: 'gst-income-tax', description: 'Tax compliance, returns, and advisory' },
      { id: 'sub-audit-bookkeeping', name: 'Audit & Bookkeeping', slug: 'audit-bookkeeping', description: 'Statutory audit, accounting, and CFO services' },
    ],
    enquiryAttributes: [
      { key: 'annualTurnoverRange', label: 'Approximate Annual Turnover', type: 'select', options: ['Under ₹20 Lakh', '₹20 Lakh – ₹1 Cr', '₹1 Cr – ₹10 Cr', 'Above ₹10 Cr', 'Not Applicable'] },
    ],
  },
  {
    id: 'cat-manufacturing',
    name: 'Manufacturing',
    slug: 'manufacturing',
    description: 'Contract manufacturing, precision engineering, textiles, chemicals, and OEM production.',
    icon: 'Factory',
    sortOrder: 5,
    subcategories: [
      { id: 'sub-textile-mfg', name: 'Textiles & Garment Manufacturing', slug: 'textiles-garment-mfg', description: 'Fabric mills, processing, and apparel OEM' },
      { id: 'sub-machinery-parts', name: 'Machinery & Precision Components', slug: 'machinery-precision-components', description: 'CNC machining, casting, and industrial equipment' },
      { id: 'sub-packaging-mfg', name: 'Packaging & Printing', slug: 'packaging-printing', description: 'Corrugated boxes, flexible packaging, and commercial print' },
    ],
    enquiryAttributes: [
      { key: 'materialSpec', label: 'Material / Technical Specification', type: 'text', placeholder: 'e.g., SS 304, 100% Cotton 180 GSM, 5-ply corrugated' },
      { key: 'orderFrequency', label: 'Order Frequency', type: 'select', options: ['Single Batch', 'Monthly Recurring', 'Sample First'] },
    ],
  },
  {
    id: 'cat-industrial-supplies',
    name: 'Industrial Supplies',
    slug: 'industrial-supplies',
    description: 'Pumps, valves, electrical switchgear, safety equipment, tools, and MRO supplies.',
    icon: 'Wrench',
    sortOrder: 6,
    subcategories: [
      { id: 'sub-electrical-automation', name: 'Electrical & Automation', slug: 'electrical-automation', description: 'Panels, cables, motors, and PLCs' },
      { id: 'sub-safety-mro', name: 'Safety Gear & MRO', slug: 'safety-gear-mro', description: 'PPE, industrial tools, and consumables' },
    ],
    enquiryAttributes: [
      { key: 'gradeStandard', label: 'Required Grade / Certification', type: 'text', placeholder: 'e.g., ISI, ISO, CE, Flameproof' },
    ],
  },
  {
    id: 'cat-construction-materials',
    name: 'Construction & Building Materials',
    slug: 'construction-building-materials',
    description: 'Cement, steel, tiles, ceramics, architectural hardware, contractors, and civil engineering.',
    icon: 'HardHat',
    sortOrder: 7,
    subcategories: [
      { id: 'sub-tiles-ceramics', name: 'Tiles, Marble & Sanitaryware', slug: 'tiles-marble-sanitaryware', description: 'Vitrified tiles, natural stone, and bath fittings' },
      { id: 'sub-structural-steel', name: 'Cement, Steel & Structural Supplies', slug: 'cement-steel-structural', description: 'TMT bars, ready-mix concrete, and structural steel' },
    ],
    enquiryAttributes: [
      { key: 'materialType', label: 'Material Type', type: 'text', placeholder: 'e.g., GVT Tiles 600x1200mm, Fe500D TMT Bars' },
      { key: 'deliverySiteCity', label: 'Delivery Site Location', type: 'text', placeholder: 'e.g., Sanand, Ahmedabad' },
    ],
  },
  {
    id: 'cat-retail-consumer',
    name: 'Retail & Consumer Brands',
    slug: 'retail-consumer-brands',
    description: 'FMCG distributors, electronics retailers, specialty stores, and D2C consumer goods.',
    icon: 'ShoppingBag',
    sortOrder: 8,
    subcategories: [
      { id: 'sub-electronics-appliances', name: 'Electronics & Appliances', slug: 'electronics-appliances', description: 'Consumer electronics, office hardware, and appliances' },
      { id: 'sub-fmcg-wholesale', name: 'FMCG & General Merchandise', slug: 'fmcg-general-merchandise', description: 'Wholesale and retail consumer products' },
    ],
    enquiryAttributes: [
      { key: 'purchaseType', label: 'Purchase Type', type: 'select', options: ['Retail / Single Unit', 'Bulk / Institutional', 'Distribution Enquiry'] },
    ],
  },
  {
    id: 'cat-fashion-apparel',
    name: 'Fashion & Apparel',
    slug: 'fashion-apparel',
    description: 'Boutiques, ethnic wear, corporate uniforms, footwear, jewelry, and accessories.',
    icon: 'Shirt',
    sortOrder: 9,
    subcategories: [
      { id: 'sub-ethnic-bridal', name: 'Ethnic & Occasion Wear', slug: 'ethnic-occasion-wear', description: 'Handloom, studio couture, and traditional apparel' },
      { id: 'sub-uniforms-workwear', name: 'Corporate & Institutional Uniforms', slug: 'corporate-uniforms', description: 'Custom branded workwear and school uniforms' },
    ],
    enquiryAttributes: [
      { key: 'customizationRequired', label: 'Customization Needed', type: 'select', options: ['Ready-to-ship', 'Custom Sizing / Tailoring', 'Custom Branding / Embroidery'] },
    ],
  },
  {
    id: 'cat-food-hospitality',
    name: 'Food & Hospitality',
    slug: 'food-hospitality',
    description: 'Catering services, commercial food suppliers, bakeries, restaurants, and corporate hospitality.',
    icon: 'Utensils',
    sortOrder: 10,
    subcategories: [
      { id: 'sub-catering-events', name: 'Corporate & Event Catering', slug: 'corporate-event-catering', description: 'Outdoor catering, box meals, and banquet services' },
      { id: 'sub-food-processing', name: 'Specialty Food & Agro Products', slug: 'specialty-food-agro', description: 'Spices, packaged foods, and wholesale ingredients' },
    ],
    enquiryAttributes: [
      { key: 'dietaryPreference', label: 'Dietary / Cuisine Requirements', type: 'text', placeholder: 'e.g., Pure Veg, Jain options, Continental' },
    ],
  },
  {
    id: 'cat-healthcare-wellness',
    name: 'Healthcare & Wellness',
    slug: 'healthcare-wellness',
    description: 'Clinics, diagnostic centers, medical equipment suppliers, pharmacies, and wellness studios.',
    icon: 'HeartPulse',
    sortOrder: 11,
    subcategories: [
      { id: 'sub-medical-supplies', name: 'Medical Devices & Lab Equipment', slug: 'medical-devices-equipment', description: 'Diagnostic instruments, hospital furniture, and consumables' },
      { id: 'sub-clinics-diagnostics', name: 'Clinics, Diagnostics & Occupational Health', slug: 'clinics-diagnostics', description: 'Corporate health checkups and specialized care' },
    ],
    enquiryAttributes: [
      { key: 'requirementCategory', label: 'Requirement Type', type: 'select', options: ['Equipment / Supplies', 'Corporate Health Checkup', 'Clinic / Diagnostic Service'] },
    ],
  },
  {
    id: 'cat-education-training',
    name: 'Education & Training',
    slug: 'education-training',
    description: 'Corporate training, skill development institutes, EdTech providers, and coaching.',
    icon: 'GraduationCap',
    sortOrder: 12,
    subcategories: [
      { id: 'sub-corporate-training', name: 'Corporate L&D & Workshops', slug: 'corporate-training-workshops', description: 'Leadership, technical upskilling, and compliance training' },
      { id: 'sub-language-test', name: 'Professional Certification & Coaching', slug: 'professional-certification', description: 'Vocational and professional skill programs' },
    ],
    enquiryAttributes: [
      { key: 'trainingFormat', label: 'Format', type: 'select', options: ['In-person Classroom', 'Live Online', 'Self-paced LMS'] },
    ],
  },
  {
    id: 'cat-home-living',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Interior design, modular furniture, solar installation, facility management, and home automation.',
    icon: 'Home',
    sortOrder: 13,
    subcategories: [
      { id: 'sub-interiors-furniture', name: 'Interior Design & Modular Furniture', slug: 'interior-design-furniture', description: 'Residential and office turnkey interiors' },
      { id: 'sub-solar-electrical', name: 'Rooftop Solar & Home Automation', slug: 'rooftop-solar-automation', description: 'Solar EPC, smart locks, and security systems' },
    ],
    enquiryAttributes: [
      { key: 'propertyType', label: 'Property Type', type: 'select', options: ['Residential Apartment / Villa', 'Commercial Office', 'Retail Showroom', 'Industrial Facility'] },
    ],
  },
  {
    id: 'cat-marketing-creative',
    name: 'Marketing & Creative Services',
    slug: 'marketing-creative-services',
    description: 'Branding agencies, digital marketing, commercial photography, video production, and PR.',
    icon: 'Megaphone',
    sortOrder: 14,
    subcategories: [
      { id: 'sub-digital-marketing', name: 'SEO, Performance & Social Media', slug: 'digital-marketing-seo', description: 'Lead generation, paid ads, and social management' },
      { id: 'sub-branding-design', name: 'Brand Identity, Packaging & Video', slug: 'branding-packaging-video', description: 'Graphic design, product shoots, and corporate films' },
    ],
    enquiryAttributes: [
      { key: 'deliverableType', label: 'Primary Deliverable', type: 'text', placeholder: 'e.g., Brand Identity, Product Shoot, Monthly Performance Ads' },
    ],
  },
  {
    id: 'cat-logistics-transport',
    name: 'Logistics & Transportation',
    slug: 'logistics-transportation',
    description: 'Freight forwarding, warehousing, cold chain, fleet transport, and courier services.',
    icon: 'Truck',
    sortOrder: 15,
    subcategories: [
      { id: 'sub-freight-cargo', name: 'Road, Air & Sea Freight', slug: 'road-air-sea-freight', description: 'FTL, PTL, customs clearance, and domestic transport' },
      { id: 'sub-warehousing-3pl', name: 'Warehousing & 3PL Fulfillment', slug: 'warehousing-3pl', description: 'Storage, inventory management, and last-mile delivery' },
    ],
    enquiryAttributes: [
      { key: 'originDestination', label: 'Origin & Destination Route', type: 'text', placeholder: 'e.g., Ahmedabad to Mumbai' },
      { key: 'cargoType', label: 'Cargo / Load Type', type: 'text', placeholder: 'e.g., Palletized boxes, 5 MT, Temperature controlled' },
    ],
  },
  {
    id: 'cat-events-media',
    name: 'Events & Media',
    slug: 'events-media',
    description: 'Exhibition stall fabricators, corporate event planners, AV production, and corporate gifting.',
    icon: 'CalendarRange',
    sortOrder: 16,
    subcategories: [
      { id: 'sub-exhibitions-stalls', name: 'Exhibition Stalls & Conferences', slug: 'exhibition-stalls-conferences', description: 'Trade show booths, stage setup, and AV rental' },
      { id: 'sub-corporate-gifting', name: 'Corporate Gifting & Merchandise', slug: 'corporate-gifting-merchandise', description: 'Custom hampers, awards, and promotional merchandise' },
    ],
    enquiryAttributes: [
      { key: 'eventDateWindow', label: 'Event Date / Timeline', type: 'text', placeholder: 'e.g., November 15–17, 2026' },
    ],
  },
  {
    id: 'cat-consulting',
    name: 'Consulting',
    slug: 'consulting',
    description: 'Management consulting, export-import advisory, ISO certification, and sustainability consulting.',
    icon: 'Compass',
    sortOrder: 17,
    subcategories: [
      { id: 'sub-business-strategy', name: 'Strategy & Operations Consulting', slug: 'strategy-operations-consulting', description: 'Process optimization, market entry, and growth strategy' },
      { id: 'sub-iso-quality', name: 'ISO, Quality & ESG Certification', slug: 'iso-quality-esg', description: 'ISO 9001, ZED certification, and environmental compliance' },
    ],
    enquiryAttributes: [
      { key: 'advisoryFocus', label: 'Advisory Focus Area', type: 'text', placeholder: 'e.g., Export compliance, ISO 9001 audit readiness' },
    ],
  },
  {
    id: 'cat-other-legitimate',
    name: 'Other Legitimate Categories',
    slug: 'other-categories',
    description: 'Specialized local services, agriculture supplies, bespoke craftsmanship, and emerging sectors.',
    icon: 'Layers',
    sortOrder: 18,
    subcategories: [
      { id: 'sub-agri-inputs', name: 'Agriculture & Horticulture Supplies', slug: 'agriculture-horticulture', description: 'Seeds, irrigation, and agritech equipment' },
      { id: 'sub-custom-services', name: 'Specialized & Custom Services', slug: 'specialized-custom-services', description: 'Other verified commercial products and services' },
    ],
    enquiryAttributes: [],
  },
];

/**
 * Configurable Matching Engine Weights (Section 9)
 * Transparent, deterministic scoring mechanism for matching customer enquiries to businesses.
 */
export const MATCHING_ENGINE_WEIGHTS = {
  PRIMARY_CATEGORY_MATCH: 35,
  SECONDARY_CATEGORY_MATCH: 22,
  CITY_EXACT_MATCH: 25,
  STATE_OR_SERVICE_AREA_MATCH: 15,
  PAN_INDIA_COVERAGE_MATCH: 10,
  LISTING_TYPE_MATCH: 10,
  KEYWORD_RELEVANCE_MAX: 20,
  VERIFIED_CONTACT_BONUS: 5,
  MINIMUM_QUALIFYING_SCORE: 25,
  DEFAULT_MAX_MATCHES_PER_ENQUIRY: 15,
  primaryCategoryMatch: 35,
  secondaryCategoryMatch: 22,
  subcategoryOrListingMatch: 15,
  cityExactMatch: 25,
  serviceAreaOrStateMatch: 15,
  panIndiaCoverageMatch: 10,
  keywordRelevanceMax: 20,
  activeOperatingStatusBonus: 5,
  minimumMatchThreshold: 25,
  maxMatchedBusinessesPerEnquiry: 15,
} as const;

/**
 * Freemium & Paid Business Subscription Plans (Section 15)
 */
export type BusinessPlanTier = 'FREE' | 'PRO' | 'PREMIUM';

export interface BusinessSubscriptionPlan {
  tier: BusinessPlanTier;
  name: string;
  priceInrMonthly: number;
  monthlyPriceInr: number;
  annualPriceInr: number;
  pricePaiseMonthly: number;
  formattedPrice: string;
  cadence: string;
  tagline: string;
  description: string;
  recommended?: boolean;
  limits: {
    maxListings: number;
    maxQuotationsPerMonth: number;
    maxTeamMembers: number;
  };
  entitlements: {
    maxActiveListings: number;
    maxMonthlyQuotationResponses: number;
    maxTeamMembers: number;
    analyticsLevel: 'BASIC' | 'ADVANCED' | 'EXPANDED';
    promotedPlacementEligible: boolean;
    customCatalogueUploads: boolean;
    priorityEnquiryAlerts: boolean;
  };
  features: string[];
}

export const BUSINESS_SUBSCRIPTION_PLANS: Record<BusinessPlanTier, BusinessSubscriptionPlan> = {
  FREE: {
    tier: 'FREE',
    name: 'Free Plan',
    priceInrMonthly: 0,
    monthlyPriceInr: 0,
    annualPriceInr: 0,
    pricePaiseMonthly: 0,
    formattedPrice: '₹0',
    cadence: 'forever',
    tagline: 'Get your business discovered online.',
    description: 'Essential digital storefront and enquiry discovery for startups, freelancers, and local businesses.',
    limits: {
      maxListings: 5,
      maxQuotationsPerMonth: 10,
      maxTeamMembers: 1,
    },
    entitlements: {
      maxActiveListings: 5,
      maxMonthlyQuotationResponses: 10,
      maxTeamMembers: 1,
      analyticsLevel: 'BASIC',
      promotedPlacementEligible: false,
      customCatalogueUploads: false,
      priorityEnquiryAlerts: false,
    },
    features: [
      'Public business storefront (/business/your-name)',
      'Up to 5 product or service listings',
      'Basic directory search visibility',
      'Receive matched customer enquiries',
      'Submit up to 10 quotations per month',
      'Basic profile view & enquiry counts',
    ],
  },
  PRO: {
    tier: 'PRO',
    name: 'Pro Plan',
    priceInrMonthly: 1499,
    monthlyPriceInr: 1499,
    annualPriceInr: 14990,
    pricePaiseMonthly: 149900,
    formattedPrice: '₹1,499',
    cadence: '/month',
    tagline: 'Scale your offerings and respond to more leads.',
    description: 'Enhanced storefront capacity, catalogue uploads, team collaboration, and detailed conversion analytics.',
    recommended: true,
    limits: {
      maxListings: 50,
      maxQuotationsPerMonth: 100,
      maxTeamMembers: 5,
    },
    entitlements: {
      maxActiveListings: 50,
      maxMonthlyQuotationResponses: 100,
      maxTeamMembers: 5,
      analyticsLevel: 'ADVANCED',
      promotedPlacementEligible: false,
      customCatalogueUploads: true,
      priorityEnquiryAlerts: true,
    },
    features: [
      'Everything in Free Plan',
      'Up to 50 product or service listings',
      'Submit up to 100 quotations per month',
      'Portfolio & PDF catalogue uploads',
      'Advanced analytics (views, clicks, quote shortlist rates)',
      'Up to 5 business team members',
      'Priority enquiry notifications',
    ],
  },
  PREMIUM: {
    tier: 'PREMIUM',
    name: 'Premium Plan',
    priceInrMonthly: 3999,
    monthlyPriceInr: 3999,
    annualPriceInr: 39990,
    pricePaiseMonthly: 399900,
    formattedPrice: '₹3,999',
    cadence: '/month',
    tagline: 'Maximum reach and enterprise lead management.',
    description: 'Unlimited listings, eligible promoted category placement, expanded team permissions, and full funnel reporting.',
    limits: {
      maxListings: 500,
      maxQuotationsPerMonth: 1000,
      maxTeamMembers: 20,
    },
    entitlements: {
      maxActiveListings: 500,
      maxMonthlyQuotationResponses: 1000,
      maxTeamMembers: 20,
      analyticsLevel: 'EXPANDED',
      promotedPlacementEligible: true,
      customCatalogueUploads: true,
      priorityEnquiryAlerts: true,
    },
    features: [
      'Everything in Pro Plan',
      'Up to 500 product or service listings',
      'Up to 1,000 quotations per month',
      'Eligible for clearly labelled Featured placements',
      'Expanded multi-member team access (up to 20)',
      'Full enquiry-to-quotation funnel analytics',
    ],
  },
};

