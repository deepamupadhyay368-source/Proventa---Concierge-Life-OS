/**
 * PROVENTA — Single Source of Truth for Brand & Platform Configuration
 * Product Category: Industrial Procurement Platform
 * Tagline: Require. Compare. Select. Deliver.
 */


export const BRAND_COLORS = {
  primary: '#536B88', // Steel Blue
  background: '#292F3D', // Primary Background
  nav: '#191B20', // Navigation Charcoal
  secondaryBackground: '#252B38', // Secondary Background
  surface: '#303746', // Working Surface
  typography: '#F1F2F4', // Primary Typography
  accent: '#C66A42', // Accent Orange
  white: '#FFFFFF', // Pure White
  steelBlue: '#536B88', // Steel Blue
  mutedText: '#A8ADB7', // Secondary Typography
  border: '#414957', // Structural Border
  success: '#4A7C59',
  warning: '#C66A42',
  error: '#D9534F',
} as const;

export const BRAND_CONFIG = {
  name: 'PROVENTA',
  displayName: 'Proventa',
  tagline: 'Require. Compare. Select. Deliver.',
  supportingStatement: 'Industrial Procurement. Simplified.',
  valueProposition: 'Connect with verified construction material suppliers, compare competitive quotations, and coordinate site delivery.',
  centralValueProposition: 'Source construction materials across Ahmedabad & Gujarat with transparent pricing, verified dealers, and tracked dispatch.',
  description:
    'PROVENTA is a digital construction procurement network connecting contractors, builders, developers, and individual buyers with verified material suppliers through competitive quotations and coordinated delivery.',
  shortDescription:
    'PROVENTA — Industrial Procurement Platform. Require. Compare. Select. Deliver.',
  category: 'Industrial Procurement Platform',
  domain: process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@proventa.in',
  currency: 'INR',
  currencySymbol: '₹',
  initialCities: [
    'Ahmedabad',
    'Gandhinagar',
    'Vadodara',
    'Surat',
    'Rajkot',
    'Bhavnagar',
    'Jamnagar',
    'Mumbai',
    'Pune',
    'Bengaluru',
  ],
  urls: {
    base: process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in',
    rfqNew: '/rfq/new',
    buyerDashboard: '/buyer/dashboard',
    buyerRfqs: '/buyer/rfqs',
    buyerOrders: '/buyer/orders',
    supplierRegister: '/supplier/register',
    supplierDashboard: '/supplier/dashboard',
    supplierRfqs: '/supplier/rfqs',
    supplierOrders: '/supplier/orders',
    adminProcurement: '/admin/procurement',
    logisticsDeliveries: '/logistics/deliveries',
    overview: '/overview',
    dashboard: '/dashboard',
    wealth: '/wealth',
    family: '/family',
    assets: '/assets',
    liabilities: '/liabilities',
    cashflow: '/cashflow',
    vault: '/vault',
    protection: '/protection',
    goals: '/goals',
    businessOwnership: '/business-ownership',
    intelligence: '/intelligence',
    reports: '/reports',
    settings: '/settings',
    onboarding: '/onboarding/business',
    pricing: '/pricing',
    adminPortal: '/admin',
    exploreBusinesses: '/businesses',
    productsAndServices: '/listings',
    postEnquiry: '/rfq/new',
    forBusinesses: '/for-suppliers',
    registerBusiness: '/supplier/register',
    businessDashboard: '/supplier/dashboard',
    customerDashboard: '/buyer/dashboard',
  },
  contact: {
    supportEmail: process.env.SUPPORT_EMAIL || 'support@proventa.in',
    privacyEmail: 'privacy@proventa.in',
  },
  seo: {
    defaultTitle: 'PROVENTA — Industrial Procurement Platform',
    titleTemplate: '%s | PROVENTA',
    keywords: [
      'PROVENTA',
      'construction procurement platform',
      'building materials Ahmedabad',
      'TMT steel supplier Gujarat',
      'cement wholesale price',
      'construction material quotation',
      'contractor material sourcing',
      'ready mix concrete Ahmedabad',
      'sand and aggregates delivery',
      'tiles and sanitaryware wholesale',
    ],
  },
} as const;

export const CONSTRUCTION_UNITS = [
  'Bags',
  'Metric tonnes (MT)',
  'Kilograms (KG)',
  'Cubic feet (Cu.ft)',
  'Cubic metres (Cu.m)',
  'Square feet (Sq.ft)',
  'Pieces (Nos)',
  'Boxes',
  'Litres (L)',
] as const;

export type ConstructionUnit = (typeof CONSTRUCTION_UNITS)[number];

export interface FamilyNavItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  description: string;
  badge?: string;
  requiredTier?: 'FREE' | 'FAMILY' | 'FAMILY_PLUS' | 'FAMILY_OFFICE';
}

export const FAMILY_NAV_ITEMS: FamilyNavItem[] = [
  { id: 'overview', name: 'Overview', href: '/dashboard', icon: 'LayoutDashboard', description: 'Consolidated family net worth & living telemetry' },
  { id: 'wealth', name: 'My Wealth', href: '/wealth', icon: 'PieChart', description: 'Individual & ownership-adjusted net worth views' },
  { id: 'family', name: 'My Family', href: '/family', icon: 'Users', description: 'Workspaces, members, roles & permissions' },
  { id: 'assets', name: 'Assets', href: '/assets', icon: 'Coins', description: 'Financial, physical & business asset registers' },
  { id: 'liabilities', name: 'Liabilities', href: '/liabilities', icon: 'CreditCard', description: 'Loans, mortgages, credit cards & obligations' },
  { id: 'cashflow', name: 'Cashflow', href: '/cashflow', icon: 'ArrowLeftRight', description: 'Income, expenditure & recurring cashflow tracking' },
  { id: 'vault', name: 'Family Vault', href: '/vault', icon: 'Lock', description: 'Encrypted document repository & AI extraction' },
  { id: 'protection', name: 'Protection', href: '/protection', icon: 'ShieldCheck', description: 'Insurance coverage, renewals & policy records' },
  { id: 'goals', name: 'Goals', href: '/goals', icon: 'Target', description: 'Family milestone targets & scenario modeling' },
  { id: 'business', name: 'Business & Ownership', href: '/business-ownership', icon: 'Network', description: 'Corporate shareholdings & visual ownership map' },
  { id: 'decision-lab', name: 'Decision Lab', href: '/decision-lab', icon: 'Sparkles', description: 'Financial Decision Lab: Prepay vs Invest, FIRE & Buy vs Rent' },
  { id: 'intelligence', name: 'Intelligence', href: '/intelligence', icon: 'BrainCircuit', description: 'Multi-agent financial analysis & private assistant' },
  { id: 'reports', name: 'Reports', href: '/reports', icon: 'FileSpreadsheet', description: 'Deterministic net worth & audit statements' },
  { id: 'settings', name: 'Settings', href: '/settings', icon: 'Settings', description: 'Profile, security keys, DPDP privacy & subscriptions' },
];

export type WealthPlanTier = 'FREE' | 'FAMILY' | 'FAMILY_PLUS' | 'FAMILY_OFFICE';

export interface FamilyWealthPlan {
  tier: WealthPlanTier;
  name: string;
  tagline: string;
  description: string;
  priceInrAnnual: number;
  pricePaiseAnnual: number;
  formattedPrice: string;
  cadence: string;
  recommended?: boolean;
  limits: {
    maxFamilyMembers: number;
    maxWorkspaces: number;
    maxAssets: number;
    storageMb: number;
    aiRequestsPerMonth: number;
    canAccessCashflow: boolean;
    canAccessBusinessOwnership: boolean;
    canAccessScenarioSimulations: boolean;
    canAccessDocumentIntelligence: boolean;
  };
  features: string[];
}

export const FAMILY_WEALTH_SUBSCRIPTION_PLANS: Record<WealthPlanTier, FamilyWealthPlan> = {
  FREE: {
    tier: 'FREE',
    name: 'Free Plan',
    tagline: 'Individual financial foundation.',
    description: 'Essential net-worth tracking and recordkeeping for individual wealth organization.',
    priceInrAnnual: 0,
    pricePaiseAnnual: 0,
    formattedPrice: '₹0',
    cadence: 'forever',
    limits: {
      maxFamilyMembers: 1,
      maxWorkspaces: 1,
      maxAssets: 15,
      storageMb: 250,
      aiRequestsPerMonth: 20,
      canAccessCashflow: false,
      canAccessBusinessOwnership: false,
      canAccessScenarioSimulations: false,
      canAccessDocumentIntelligence: false,
    },
    features: [
      'One personal workspace',
      'Track up to 15 assets & liabilities',
      'Individual net-worth dashboard',
      '250 MB encrypted Family Vault storage',
      'Basic financial records & valuation history',
      'Deterministic net worth calculation engine',
    ],
  },
  FAMILY: {
    tier: 'FAMILY',
    name: 'Family Plan',
    tagline: 'Connected family wealth management.',
    description: 'Brings immediate family members into one synchronized, permission-controlled workspace.',
    priceInrAnnual: 1999,
    pricePaiseAnnual: 199900,
    formattedPrice: '₹1,999',
    cadence: '/year',
    recommended: true,
    limits: {
      maxFamilyMembers: 4,
      maxWorkspaces: 2,
      maxAssets: 75,
      storageMb: 2048,
      aiRequestsPerMonth: 100,
      canAccessCashflow: true,
      canAccessBusinessOwnership: false,
      canAccessScenarioSimulations: true,
      canAccessDocumentIntelligence: false,
    },
    features: [
      'Everything in Free',
      'Up to 4 family members with granular role permissions',
      'Consolidated family net-worth dashboard with joint ownership',
      '2 GB encrypted Family Vault storage',
      'Cashflow & recurring obligation tracking',
      'Family protection & insurance renewal reminders',
      'Basic AI Family Wealth Analyst',
      'Printable & exportable family net-worth statements',
    ],
  },
  FAMILY_PLUS: {
    tier: 'FAMILY_PLUS',
    name: 'Family Plus',
    tagline: 'Complete financial intelligence for extended families.',
    description: 'Advanced document intelligence, scenario planning, and expanded storage for growing families.',
    priceInrAnnual: 4999,
    pricePaiseAnnual: 499900,
    formattedPrice: '₹4,999',
    cadence: '/year',
    limits: {
      maxFamilyMembers: 8,
      maxWorkspaces: 5,
      maxAssets: 250,
      storageMb: 10240,
      aiRequestsPerMonth: 500,
      canAccessCashflow: true,
      canAccessBusinessOwnership: true,
      canAccessScenarioSimulations: true,
      canAccessDocumentIntelligence: true,
    },
    features: [
      'Everything in Family Plan',
      'Up to 8 family members across multiple family relationships',
      '10 GB encrypted Family Vault storage',
      'AI Document Intelligence & automatic statement extraction',
      'Hypothetical financial scenario modeling (savings, education, loan prepayments)',
      'Family goal planning & contributor tracking',
      '500 monthly queries across 6 specialized AI agents',
      'Comprehensive audit trails & privacy consent controls',
    ],
  },
  FAMILY_OFFICE: {
    tier: 'FAMILY_OFFICE',
    name: 'Family Office',
    tagline: 'Enterprise-grade infrastructure for complex family holdings.',
    description: 'Designed for business families, multiple holding entities, and multi-generational succession.',
    priceInrAnnual: 14999,
    pricePaiseAnnual: 1499900,
    formattedPrice: '₹14,999',
    cadence: '/year',
    limits: {
      maxFamilyMembers: 25,
      maxWorkspaces: 20,
      maxAssets: 2000,
      storageMb: 51200,
      aiRequestsPerMonth: 2500,
      canAccessCashflow: true,
      canAccessBusinessOwnership: true,
      canAccessScenarioSimulations: true,
      canAccessDocumentIntelligence: true,
    },
    features: [
      'Everything in Family Plus',
      'Up to 25 members across multi-tier family structures',
      '50 GB encrypted document storage',
      'Multi-tier corporate shareholding & visual business ownership maps',
      'Full continuity & succession directory (nominees, wills, emergency directives)',
      'Professional advisor collaboration with read-only viewer roles',
      'Priority AI engine with dedicated family wealth telemetry',
      'Custom accounting year & historical multi-year snapshots',
    ],
  },
};

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
    id: 'cat-building-materials',
    name: 'Building Materials',
    slug: 'building-materials',
    description: 'Cement, TMT Steel, Sand, Aggregates, Bricks, AAC Blocks, and Ready-Mix Concrete (RMC).',
    icon: 'Hammer',
    sortOrder: 1,
    subcategories: [
      { id: 'sub-cement', name: 'Cement (OPC 43/53, PPC, White)', slug: 'cement', description: 'UltraTech, Ambuja, ACC, JK Lakshmi 50kg bags' },
      { id: 'sub-tmt-steel', name: 'TMT Steel & Rebars (Fe 500D / 550D)', slug: 'tmt-steel', description: 'Tata Tiscon, Jindal Panther, Kamdhenu primary & secondary steel' },
      { id: 'sub-sand-aggregates', name: 'Sand & Aggregates (10mm, 20mm, Kapchi)', slug: 'sand-aggregates', description: 'River sand, manufactured sand, crushed stone aggregates' },
      { id: 'sub-bricks-blocks', name: 'Bricks & AAC Lightweight Blocks', slug: 'bricks-blocks', description: 'Red clay bricks, fly-ash bricks, Siporex/AAC blocks' },
      { id: 'sub-rmc', name: 'Ready-Mix Concrete (RMC M20 to M40)', slug: 'ready-mix-concrete', description: 'Computerized transit-mixer batch delivery to site' },
    ],
    enquiryAttributes: [
      { key: 'materialGrade', label: 'Material Grade / Spec', type: 'text', placeholder: 'e.g., Fe 550D TMT, 53 Grade OPC, M25 Concrete' },
      { key: 'deliverySiteAddress', label: 'Site Address (Ahmedabad / Gujarat)', type: 'text', placeholder: 'e.g., Science City Road, Sola, Ahmedabad - 380060' },
      { key: 'deliveryVehicleAccess', label: 'Site Vehicle Access', type: 'select', options: ['10-Wheeler Truck Accessible', 'Tata Ace / Small Truck Only', 'Trailer Accessible', 'Unrestricted'] },
    ],
  },
  {
    id: 'cat-electrical',
    name: 'Electrical Supplies',
    slug: 'electrical',
    description: 'Wires, industrial cables, modular switches, DB panels, conduits, and architectural lighting.',
    icon: 'Zap',
    sortOrder: 2,
    subcategories: [
      { id: 'sub-wires-cables', name: 'Wires & Armoured Cables', slug: 'wires-cables', description: 'Polycab, Havells, RR Kabel FRLS copper wires and industrial power cables' },
      { id: 'sub-switches-plates', name: 'Modular Switches, Plates & Sockets', slug: 'switches-sockets', description: 'Legrand, Schneider, Anchor Roma, Havells modular accessories' },
      { id: 'sub-panels-mcb', name: 'Distribution Boards & MCBs', slug: 'panels-mcb', description: 'MCB boxes, RCCB, changeover switches, industrial panels' },
      { id: 'sub-lighting-luminaires', name: 'Lighting & Commercial Luminaires', slug: 'lighting', description: 'LED downlights, flood lights, commercial high-bay, strip lights' },
      { id: 'sub-conduits-fittings', name: 'PVC Conduits & Cable Trays', slug: 'conduits-trays', description: 'Heavy-duty PVC conduit pipes, GI cable trays and junction boxes' },
    ],
    enquiryAttributes: [
      { key: 'voltageGrade', label: 'Voltage & Current Spec', type: 'text', placeholder: 'e.g., 1100V FRLS 2.5 sq mm, 63A 4-Pole MCB' },
      { key: 'brandPreference', label: 'Brand Preference', type: 'text', placeholder: 'e.g., Polycab, Havells, Schneider Electric' },
    ],
  },
  {
    id: 'cat-plumbing',
    name: 'Plumbing & Water Systems',
    slug: 'plumbing',
    description: 'CPVC/UPVC pipes, fittings, water storage tanks, booster pumps, and sanitary fixtures.',
    icon: 'Droplets',
    sortOrder: 3,
    subcategories: [
      { id: 'sub-pipes-fittings', name: 'CPVC, UPVC & SWR Pipes & Fittings', slug: 'pipes-fittings', description: 'Astral, Ashirvad, Supreme, Finolex plumbing pipelines' },
      { id: 'sub-pumps-motors', name: 'Water Pumps & Hydro-pneumatic Systems', slug: 'pumps-motors', description: 'Submersible pumps, pressure boosters, monobloc motors' },
      { id: 'sub-tanks-storage', name: 'Water Storage Tanks (Overhead/Loft)', slug: 'tanks-storage', description: 'Sintex, Vectus multi-layer anti-bacterial tanks (500L - 5000L)' },
      { id: 'sub-sanitary-drainage', name: 'Sanitaryware, Faucets & Drainage', slug: 'sanitary-faucets', description: 'Jaquar, Kohler, Cera, Hindware CP fittings and wall-hung closets' },
    ],
    enquiryAttributes: [
      { key: 'pipeClassSchedule', label: 'Pressure Class / Schedule', type: 'text', placeholder: 'e.g., SDR 11 CPVC, Schedule 40/80 UPVC' },
      { key: 'sitePipingPhase', label: 'Construction Phase', type: 'select', options: ['Concealed Rough-in Piping', 'Drainage & Soil Piping', 'Final Sanitaryware & Fixtures'] },
    ],
  },
  {
    id: 'cat-tiles-flooring',
    name: 'Tiles & Flooring',
    slug: 'tiles-flooring',
    description: 'Vitrified tiles, ceramic wall tiles, natural marble slabs, granite, and exterior paving.',
    icon: 'Grid',
    sortOrder: 4,
    subcategories: [
      { id: 'sub-vitrified-tiles', name: 'Vitrified Tiles (GVT / PGVT / Double Charge)', slug: 'vitrified-tiles', description: '600x1200mm, 800x1600mm, 1200x1800mm Kajaria, Somany, Simpolo' },
      { id: 'sub-marble-granite', name: 'Natural Marble & Granite Slabs', slug: 'marble-granite', description: 'Italian Botticino, Makrana white, Black Galaxy granite, kitchen countertops' },
      { id: 'sub-ceramic-wall-tiles', name: 'Ceramic Wall Tiles & Mosaics', slug: 'ceramic-tiles', description: 'Bathroom, kitchen backsplash and decorative elevation tiles' },
      { id: 'sub-pavers-stone', name: 'Paver Blocks & Outdoor Stone', slug: 'pavers-outdoor-stone', description: 'Heavy-duty interlocking pavers, Kotah stone, Dholpur sandstone' },
    ],
    enquiryAttributes: [
      { key: 'tileDimensions', label: 'Tile Dimensions (mm)', type: 'text', placeholder: 'e.g., 600x1200mm, 800x1600mm' },
      { key: 'finishType', label: 'Finish Preference', type: 'select', options: ['High Gloss', 'Satin Matte', 'Carving / Rustic', 'Bookmatch Polished'] },
    ],
  },
  {
    id: 'cat-finishing-materials',
    name: 'Finishing & Chemicals',
    slug: 'finishing-materials',
    description: 'Paints, waterproof coatings, tile adhesives, epoxy grouts, wall putty, and sealants.',
    icon: 'Paintbrush',
    sortOrder: 5,
    subcategories: [
      { id: 'sub-paints-coatings', name: 'Interior & Exterior Paints & Primers', slug: 'paints-coatings', description: 'Asian Paints Apex Ultima, Royale, Berger weather-coat emulsions' },
      { id: 'sub-waterproofing', name: 'Waterproofing Membranes & Chemicals', slug: 'waterproofing', description: 'Dr. Fixit, Fosroc, Sika terrace, basement and wet-area waterproofing' },
      { id: 'sub-adhesives-grouts', name: 'Tile Adhesives & Epoxy Grouts', slug: 'tile-adhesives', description: 'Roff, Pidilite, Laticrete polymer-modified tile adhesives' },
      { id: 'sub-wall-putty', name: 'Polymer Wall Putty & Plaster', slug: 'wall-putty', description: 'Birla White, JK WallMaxx white cement water-resistant putty' },
    ],
    enquiryAttributes: [
      { key: 'applicationArea', label: 'Application Area', type: 'select', options: ['Exterior Walls', 'Interior Walls & Ceilings', 'Rooftop Terrace / Balcony', 'Swimming Pool / Basements'] },
      { key: 'surfaceSubstrate', label: 'Surface Substrate', type: 'text', placeholder: 'e.g., Fresh Sand-Face Plaster, Concrete Slab, Existing Tile' },
    ],
  },
  {
    id: 'cat-doors-windows',
    name: 'Doors, Windows & Hardware',
    slug: 'doors-windows',
    description: 'Aluminium sections, UPVC acoustic frames, flush doors, plywood, and architectural hardware.',
    icon: 'DoorClosed',
    sortOrder: 6,
    subcategories: [
      { id: 'sub-aluminium-windows', name: 'Aluminium Window Sections & Sliding Doors', slug: 'aluminium-windows', description: 'Jindal powder-coated/anodized sections, Domal series sliding systems' },
      { id: 'sub-upvc-doors-windows', name: 'UPVC Doors & Acoustic Windows', slug: 'upvc-doors-windows', description: 'Multi-chamber reinforced UPVC casement, tilt-and-turn windows' },
      { id: 'sub-flush-doors-ply', name: 'Flush Doors & Waterproof Plywood', slug: 'flush-doors-plywood', description: 'BWP/BWR grade boiling waterproof plywood, solid core flush doors' },
      { id: 'sub-hardware-fittings', name: 'Architectural Hardware & Smart Locks', slug: 'architectural-hardware', description: 'Godrej, Dorset, Yale stainless steel mortise locks, hinges, door closers' },
    ],
    enquiryAttributes: [
      { key: 'profileSystem', label: 'Profile System / Grade', type: 'text', placeholder: 'e.g., 27mm Domal section, Heavy-duty UPVC 2.5mm wall' },
      { key: 'glassSpecification', label: 'Glass Requirement', type: 'select', options: ['5mm / 6mm Clear Toughened', 'Double Glazed (DGU) Soundproof', 'Frosted / Tinted Glass', 'Frames Only (No Glass)'] },
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

