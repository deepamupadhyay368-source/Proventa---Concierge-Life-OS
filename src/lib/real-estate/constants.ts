/**
 * PROVENTA REAL ESTATE INTELLIGENCE
 * Authoritative Canonical Data Models & Constants
 * Initial Market: Ahmedabad, Gujarat, India
 */

export interface LocalityIntelligence {
  slug: string;
  name: string;
  city: string;
  state: string;
  zone: string;
  pincode: string;
  avgPriceSqFt: number;
  priceRangeSqFt: { min: number; max: number };
  grossRentalYield: number; // Percentage e.g. 3.4%
  historicalGrowth1Yr: number; // Percentage e.g. 8.2%
  historicalGrowth3Yr: number;
  transactionVolumeQuarter: number; // Calibrated quarterly market transaction benchmark
  totalActiveProjects: number;
  reraRegisteredShare: number; // e.g. 96%
  primaryTypology: string;
  description: string;
  infrastructureHighlights: string[];
  connectivityNotes: string;
  topProjects: string[];
  dataFreshness: string;
  confidenceScore: number; // Research Calibration Index (0 - 100)
}

export const AHMEDABAD_LOCALITIES: LocalityIntelligence[] = [
  {
    slug: 'south-bopal',
    name: 'South Bopal',
    city: 'Ahmedabad',
    state: 'Gujarat',
    zone: 'West',
    pincode: '380058',
    avgPriceSqFt: 4650,
    priceRangeSqFt: { min: 3900, max: 5600 },
    grossRentalYield: 3.5,
    historicalGrowth1Yr: 8.4,
    historicalGrowth3Yr: 24.1,
    transactionVolumeQuarter: 342,
    totalActiveProjects: 28,
    reraRegisteredShare: 98,
    primaryTypology: '2 & 3 BHK High-rise Apartments',
    description: 'South Bopal represents a dominant western residential growth corridor connected directly to SP Ring Road. Characterised by mid-to-upper residential developments, retail high-streets and organized society infrastructure.',
    infrastructureHighlights: [
      'Immediate access to Sardar Patel Ring Road',
      'Operational BRTS network along Bopal-Ambli Road',
      'Proximity to South Bopal Central Park and prominent educational institutes'
    ],
    connectivityNotes: '15 mins to SG Highway, 35 mins to Ahmedabad International Airport.',
    topProjects: ['Aarohi Elegance', 'Gala Aria', 'Safal Parisar', 'Sun South Park'],
    dataFreshness: 'Q3 2026 Calibration Benchmark',
    confidenceScore: 92,
  },
  {
    slug: 'shela',
    name: 'Shela',
    city: 'Ahmedabad',
    state: 'Gujarat',
    zone: 'South-West',
    pincode: '380058',
    avgPriceSqFt: 4950,
    priceRangeSqFt: { min: 4200, max: 6200 },
    grossRentalYield: 3.3,
    historicalGrowth1Yr: 9.8,
    historicalGrowth3Yr: 28.5,
    transactionVolumeQuarter: 410,
    totalActiveProjects: 36,
    reraRegisteredShare: 99,
    primaryTypology: '3 & 4 BHK Luxury Apartments & Gated Villas',
    description: 'Emerging as one of Ahmedabad’s most dynamic premium residential micro-markets. Rapid absorption driven by structured clubhouses, wide planned town-planning (TP) roads, and reputable developers.',
    infrastructureHighlights: [
      'Club O7 and Sky City arterial road connectivity',
      'Planned municipal drainage and stormwater upgrades under AUDA',
      'High density of institutional grade club & sports amenities'
    ],
    connectivityNotes: 'Direct connectivity to Sanand Industrial Corridor and SG Highway.',
    topProjects: ['Goyal Orchid Whitefield', 'Shilp Revanta', 'Samavesh', 'Sun South Winds'],
    dataFreshness: 'Q3 2026 Calibration Benchmark',
    confidenceScore: 94,
  },
  {
    slug: 'gota',
    name: 'Gota',
    city: 'Ahmedabad',
    state: 'Gujarat',
    zone: 'North-West',
    pincode: '382481',
    avgPriceSqFt: 4200,
    priceRangeSqFt: { min: 3500, max: 5100 },
    grossRentalYield: 3.8,
    historicalGrowth1Yr: 7.2,
    historicalGrowth3Yr: 21.0,
    transactionVolumeQuarter: 512,
    totalActiveProjects: 44,
    reraRegisteredShare: 97,
    primaryTypology: '2 & 3 BHK Value & Mid-Segment Housing',
    description: 'Prime northern node alongside SG Highway. High transaction liquidity driven by young professionals, proximity to corporate commercial hubs on SG Highway, and established public transport.',
    infrastructureHighlights: [
      'SG Highway flyover corridor for seamless north-south transit',
      'Direct arterial link to Chandkheda and Sabarmati Railway Terminal',
      'Comprehensive healthcare hubs including KD Hospital vicinity'
    ],
    connectivityNotes: '10 mins to Nirma University, 20 mins to Gandhinagar infocity.',
    topProjects: ['Godrej Garden City', 'Shayona Aakash', 'Vandemataram City', 'Silver Pearl'],
    dataFreshness: 'Q3 2026 Calibration Benchmark',
    confidenceScore: 91,
  },
  {
    slug: 'science-city',
    name: 'Science City',
    city: 'Ahmedabad',
    state: 'Gujarat',
    zone: 'West',
    pincode: '380060',
    avgPriceSqFt: 6800,
    priceRangeSqFt: { min: 5800, max: 8800 },
    grossRentalYield: 3.1,
    historicalGrowth1Yr: 11.2,
    historicalGrowth3Yr: 32.4,
    transactionVolumeQuarter: 285,
    totalActiveProjects: 22,
    reraRegisteredShare: 100,
    primaryTypology: '3, 4 & 5 BHK Premium High-Rise Residences',
    description: 'High-prestige western suburb characterized by broad tree-lined avenues, iconic landmark institutions, and luxury residential projects catering to business families and CXOs.',
    infrastructureHighlights: [
      'Gujarat Science City cultural and civic anchor zone',
      'Direct link to SP Ring Road and Sola flyover junction',
      'Underground cabling and modern civic sanitation grids'
    ],
    connectivityNotes: '8 mins to SG Highway commercial district, 25 mins to GIFT City.',
    topProjects: ['Silver Radiance', 'Malabar County', 'The Capital Suites', 'Status Elysium'],
    dataFreshness: 'Q3 2026 Calibration Benchmark',
    confidenceScore: 95,
  },
  {
    slug: 'satellite',
    name: 'Satellite',
    city: 'Ahmedabad',
    state: 'Gujarat',
    zone: 'West',
    pincode: '380015',
    avgPriceSqFt: 7900,
    priceRangeSqFt: { min: 6800, max: 10200 },
    grossRentalYield: 3.0,
    historicalGrowth1Yr: 6.5,
    historicalGrowth3Yr: 18.2,
    transactionVolumeQuarter: 198,
    totalActiveProjects: 14,
    reraRegisteredShare: 96,
    primaryTypology: 'Mature High-Density Apartments & Commercial Enclaves',
    description: 'Long-established upscale neighbourhood with fully mature civic infrastructure, high retail concentration, and strong resale stability. Steady demand across redevelopment and secondary sales.',
    infrastructureHighlights: [
      'Ahmedabad Metro Line (Apparel Park to Thaltej) connectivity',
      'Dense retail high-street and premier educational institutions',
      'Proximity to ISRO space application center'
    ],
    connectivityNotes: '5 mins to SG Highway, 20 mins to Kalupur Railway Station.',
    topProjects: ['Shivalik Highstreet', 'Venus Atlantis', 'Aakash Residency'],
    dataFreshness: 'Q3 2026 Calibration Benchmark',
    confidenceScore: 96,
  },
  {
    slug: 'thaltej',
    name: 'Thaltej',
    city: 'Ahmedabad',
    state: 'Gujarat',
    zone: 'West',
    pincode: '380059',
    avgPriceSqFt: 8400,
    priceRangeSqFt: { min: 7100, max: 11500 },
    grossRentalYield: 2.9,
    historicalGrowth1Yr: 8.9,
    historicalGrowth3Yr: 26.8,
    transactionVolumeQuarter: 215,
    totalActiveProjects: 19,
    reraRegisteredShare: 98,
    primaryTypology: 'Luxury High-rise & Ultra-Prime Bungalow Societies',
    description: 'Premier western residential address housing influential corporate leadership and generational wealth. Known for sprawling bungalows, prime high-rise penthouses and direct access to Thaltej Metro Station.',
    infrastructureHighlights: [
      'Thaltej Metro Station terminal access',
      'Direct convergence of SG Highway and Sindhu Bhavan Road',
      'Zydus Hospital and high-end medical facilities'
    ],
    connectivityNotes: 'Direct gateway to Sindhu Bhavan corporate strip.',
    topProjects: ['Sun Prima', 'Gala Haven', 'The House of Lords', 'Aarya Greens'],
    dataFreshness: 'Q3 2026 Calibration Benchmark',
    confidenceScore: 95,
  },
  {
    slug: 'bodakdev',
    name: 'Bodakdev',
    city: 'Ahmedabad',
    state: 'Gujarat',
    zone: 'West',
    pincode: '380054',
    avgPriceSqFt: 9200,
    priceRangeSqFt: { min: 7800, max: 13500 },
    grossRentalYield: 2.8,
    historicalGrowth1Yr: 9.4,
    historicalGrowth3Yr: 28.1,
    transactionVolumeQuarter: 165,
    totalActiveProjects: 12,
    reraRegisteredShare: 99,
    primaryTypology: 'Ultra-Luxury Apartments, Penthouses & Private Estates',
    description: 'Recognized as one of Ahmedabad’s most exclusive residential sectors, encompassing Sindhu Bhavan Road and Judges Bungalow Road. Commands the highest capital benchmarks in western Gujarat.',
    infrastructureHighlights: [
      'Sindhu Bhavan Road lifestyle and institutional luxury strip',
      'Dense concentration of Grade-A commercial towers',
      'Exemplary tree canopy and underground utility networks'
    ],
    connectivityNotes: 'Directly on SG Highway & SBR commercial nexus.',
    topProjects: ['Shivalik Edge', 'Takshashila Air', 'The Sovereign', 'Binori Pristine'],
    dataFreshness: 'Q3 2026 Calibration Benchmark',
    confidenceScore: 97,
  },
  {
    slug: 'prahlad-nagar',
    name: 'Prahlad Nagar',
    city: 'Ahmedabad',
    state: 'Gujarat',
    zone: 'South-West',
    pincode: '380015',
    avgPriceSqFt: 7600,
    priceRangeSqFt: { min: 6400, max: 9600 },
    grossRentalYield: 3.4,
    historicalGrowth1Yr: 6.8,
    historicalGrowth3Yr: 19.5,
    transactionVolumeQuarter: 230,
    totalActiveProjects: 11,
    reraRegisteredShare: 98,
    primaryTypology: 'Corporate Hub Residential & Executive Housing',
    description: 'Vibrant urban center integrating corporate IT & consulting towers with residential societies. Highly liquid rental market for executives and corporate tenants.',
    infrastructureHighlights: [
      'Prahlad Nagar Garden civic and recreational park',
      'Corporate road connectivity linking 132ft Ring Road to SG Highway',
      'Extensive banking, culinary, and commercial retail infrastructure'
    ],
    connectivityNotes: 'Immediate connectivity to SG Highway and Makarba.',
    topProjects: ['Safal Profitaire', 'Dev Arc', 'Venus Parkland'],
    dataFreshness: 'Q3 2026 Calibration Benchmark',
    confidenceScore: 96,
  },
  {
    slug: 'sg-highway',
    name: 'SG Highway Corridor',
    city: 'Ahmedabad',
    state: 'Gujarat',
    zone: 'Central-West',
    pincode: '380060',
    avgPriceSqFt: 6200,
    priceRangeSqFt: { min: 5200, max: 8500 },
    grossRentalYield: 3.6,
    historicalGrowth1Yr: 8.7,
    historicalGrowth3Yr: 25.4,
    transactionVolumeQuarter: 480,
    totalActiveProjects: 52,
    reraRegisteredShare: 99,
    primaryTypology: 'Mixed-Use Commercial & High-Rise Residential Towers',
    description: 'The definitive economic spine of modern Ahmedabad connecting Sarkhej to Gandhinagar. Hosts multinational offices, luxury auto showrooms, premier hospitals, and mixed-use complexes.',
    infrastructureHighlights: [
      'Elevated multi-lane expressway network',
      'Direct linkage to major ring roads and Gandhinagar bypass',
      'Dense cluster of corporate headquarters and private universities'
    ],
    connectivityNotes: 'Seamless north-south transit across the entire metropolitan area.',
    topProjects: ['Titanium Square', 'Mondeal Heights', 'Zircon Heights'],
    dataFreshness: 'Q3 2026 Calibration Benchmark',
    confidenceScore: 93,
  },
  {
    slug: 'gandhinagar',
    name: 'Gandhinagar (Kudasan & Raysan)',
    city: 'Gandhinagar',
    state: 'Gujarat',
    zone: 'North Metro',
    pincode: '382421',
    avgPriceSqFt: 5100,
    priceRangeSqFt: { min: 4300, max: 6700 },
    grossRentalYield: 4.1,
    historicalGrowth1Yr: 12.4,
    historicalGrowth3Yr: 36.2,
    transactionVolumeQuarter: 395,
    totalActiveProjects: 38,
    reraRegisteredShare: 100,
    primaryTypology: 'Residential Gated Communities & Student/Tech Housing',
    description: 'The capital city’s fastest growing residential belt adjacent to PDPU, Infocity, and National Law University. High rental yields driven by academic and IT workforce demographics.',
    infrastructureHighlights: [
      'Ahmedabad-Gandhinagar Metro Phase-2 operational line',
      'Planned green belt zoning and wide grid-based city roads',
      'Proximity to PDEU, DA-IICT and TCS Garima Park'
    ],
    connectivityNotes: '10 mins to GIFT City, 18 mins to Ahmedabad Airport.',
    topProjects: ['Swagat Holiday Greens', 'Pramukh Oasis', 'Radhe Infinity'],
    dataFreshness: 'Q3 2026 Calibration Benchmark',
    confidenceScore: 92,
  },
  {
    slug: 'gift-city',
    name: 'GIFT City & Environs',
    city: 'Gandhinagar',
    state: 'Gujarat',
    zone: 'SEZ / International Finance',
    pincode: '382355',
    avgPriceSqFt: 7800,
    priceRangeSqFt: { min: 6500, max: 11000 },
    grossRentalYield: 4.4,
    historicalGrowth1Yr: 15.6,
    historicalGrowth3Yr: 48.0,
    transactionVolumeQuarter: 310,
    totalActiveProjects: 24,
    reraRegisteredShare: 100,
    primaryTypology: 'International Financial District Residences & Dual-Regime Flats',
    description: 'India’s first operational Smart City and International Financial Services Centre (IFSC). Unprecedented capital inflows, regulatory tax incentives, and global banking institutional presence.',
    infrastructureHighlights: [
      'Automated Waste Collection System (AWCS) and District Cooling',
      'Underground utility tunnel carrying power, water, cooling and data',
      'Dedicated international exchange and multi-tier regulatory ecosystem'
    ],
    connectivityNotes: '15 mins to Ahmedabad International Airport via SP Ring Road.',
    topProjects: ['Sobha Dream Heights', 'Shivalik Curv', 'Nila Spaces Vida'],
    dataFreshness: 'Q3 2026 Calibration Benchmark',
    confidenceScore: 96,
  },
];

export interface RealEstateProject {
  id: string;
  name: string;
  developer: string;
  localitySlug: string;
  localityName: string;
  reraRegistrationNumber: string;
  projectStatus: 'UNDER_CONSTRUCTION' | 'READY_TO_MOVE' | 'NEW_LAUNCH';
  configurations: string[];
  carpetAreaRange: { min: number; max: number };
  priceRangeLakhs: { min: number; max: number };
  estimatedPossession: string;
  totalUnits: number;
  openSpaceRatioPercent: number;
  lastVerifiedDate: string;
  verifiedDataStatus: 'VERIFIED' | 'SOURCE-REPORTED';
}

export const CANONICAL_PROJECTS: RealEstateProject[] = [
  {
    id: 'proj-01',
    name: 'Aarohi Elegance',
    developer: 'Aarohi Developers',
    localitySlug: 'south-bopal',
    localityName: 'South Bopal',
    reraRegistrationNumber: 'PR/GJ/AHMEDABAD/SANAND/AUDA/RAA04812/280219',
    projectStatus: 'READY_TO_MOVE',
    configurations: ['2 BHK', '3 BHK'],
    carpetAreaRange: { min: 780, max: 1220 },
    priceRangeLakhs: { min: 54, max: 85 },
    estimatedPossession: 'Completed Q4 2023',
    totalUnits: 280,
    openSpaceRatioPercent: 65,
    lastVerifiedDate: '26-Nov-2026',
    verifiedDataStatus: 'QUARANTINED',
  },
  {
    id: 'proj-02',
    name: 'Shilp Revanta',
    developer: 'AYB Buildcon LLP / Shilp Group',
    localitySlug: 'south-bopal',
    localityName: 'South Bopal',
    reraRegistrationNumber: 'PR/GJ/AHMEDABAD/SANAND/AUDA/MAA07874/050121',
    projectStatus: 'READY_TO_MOVE',
    configurations: ['3 BHK', '4 BHK'],
    carpetAreaRange: { min: 1140, max: 1890 },
    priceRangeLakhs: { min: 82, max: 145 },
    estimatedPossession: 'Completed Q2 2025',
    totalUnits: 802,
    openSpaceRatioPercent: 70,
    lastVerifiedDate: '26-Nov-2026',
    verifiedDataStatus: 'VERIFIED',
  },
  {
    id: 'proj-03',
    name: 'Sobha Dream Heights',
    developer: 'Sobha Limited',
    localitySlug: 'gift-city',
    localityName: 'GIFT City',
    reraRegistrationNumber: 'PR/GJ/GANDHINAGAR/GANDHINAGAR/OTHERS/RAA05158/290319',
    projectStatus: 'READY_TO_MOVE',
    configurations: ['1 BHK', '2 BHK', '3 BHK'],
    carpetAreaRange: { min: 540, max: 1350 },
    priceRangeLakhs: { min: 65, max: 175 },
    estimatedPossession: 'Completed Q1 2025',
    totalUnits: 512,
    openSpaceRatioPercent: 72,
    lastVerifiedDate: '10-Sep-2026',
    verifiedDataStatus: 'VERIFIED',
  },
  {
    id: 'proj-04',
    name: 'Silver Radiance',
    developer: 'Silver Group',
    localitySlug: 'science-city',
    localityName: 'Science City',
    reraRegistrationNumber: 'PR/GJ/AHMEDABAD/AHMEDABAD-CITY/AUDA/RAA08291/050422',
    projectStatus: 'READY_TO_MOVE',
    configurations: ['3 BHK', '4 BHK', '5 BHK Penthouse'],
    carpetAreaRange: { min: 1450, max: 3200 },
    priceRangeLakhs: { min: 135, max: 340 },
    estimatedPossession: 'Completed Q3 2024',
    totalUnits: 160,
    openSpaceRatioPercent: 68,
    lastVerifiedDate: '20-Aug-2026',
    verifiedDataStatus: 'VERIFIED',
  },
  {
    id: 'proj-05',
    name: 'Takshashila Air',
    developer: 'Takshashila Realties',
    localitySlug: 'bodakdev',
    localityName: 'Bodakdev',
    reraRegistrationNumber: 'PR/GJ/AHMEDABAD/AHMEDABAD-CITY/AUDA/RAA02941/140618',
    projectStatus: 'READY_TO_MOVE',
    configurations: ['4 BHK', '5 BHK Ultra Penthouse'],
    carpetAreaRange: { min: 2800, max: 5400 },
    priceRangeLakhs: { min: 320, max: 780 },
    estimatedPossession: 'Completed Q1 2023',
    totalUnits: 72,
    openSpaceRatioPercent: 62,
    lastVerifiedDate: '01-Jul-2026',
    verifiedDataStatus: 'VERIFIED',
  },
];

export interface RealEstatePlan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  tagline: string;
  targetAudience: string;
  trackedPropertiesLimit: number;
  reportsPerMonth: number;
  features: string[];
  badge?: string;
  popular?: boolean;
}

export const REAL_ESTATE_MEMBERSHIP_PLANS: RealEstatePlan[] = [
  {
    id: 'free',
    name: 'Free Access',
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'INR',
    tagline: 'Basic property searches and locality overviews.',
    targetAudience: 'Prospective buyers & casual researchers',
    trackedPropertiesLimit: 3,
    reportsPerMonth: 0,
    features: [
      'Basic property search across Ahmedabad',
      'Locality price benchmarks and infrastructure overviews',
      'Up to 3 saved properties in Personal Vault',
      'Indicative price ranges where verified data exists',
      'Standard valuation confidence indicators',
    ],
  },
  {
    id: 'personal',
    name: 'Personal Member',
    monthlyPrice: 199,
    annualPrice: 1990,
    currency: 'INR',
    tagline: 'Full valuation history & private document management for home owners.',
    targetAudience: 'Property owners & active home buyers',
    trackedPropertiesLimit: 10,
    reportsPerMonth: 2,
    popular: true,
    badge: 'Most Popular',
    features: [
      'Track up to 10 properties with continuous value monitoring',
      'Full Personal Property Vault with encrypted document storage',
      'Historical valuation snapshots & price trends',
      '2 downloadable full property valuation reports per month',
      'Property tax, maintenance & transaction cost tracking',
      'Locality price and rental yield quarterly alerts',
    ],
  },
  {
    id: 'investor',
    name: 'Investor Suite',
    monthlyPrice: 499,
    annualPrice: 4990,
    currency: 'INR',
    tagline: 'Multi-property cashflow analysis, rental yields & project comparative intelligence.',
    targetAudience: 'Active real estate investors & portfolio managers',
    trackedPropertiesLimit: 35,
    reportsPerMonth: 10,
    features: [
      'Expanded tracking for up to 35 residential & commercial units',
      'Institutional Investment & Cashflow Yield Calculator',
      'Loan amortization, net cashflow & cash-on-cash return modeling',
      'Project comparison matrices and RERA regulatory filings track',
      '10 detailed downloadable research reports per month',
      'Micro-market quarterly appreciation reports',
    ],
  },
  {
    id: 'professional',
    name: 'Professional Suite',
    monthlyPrice: 1999,
    annualPrice: 19990,
    currency: 'INR',
    tagline: 'Client portfolio management, unbranded analytical reports & market data access.',
    targetAudience: 'Real estate advisory firms, wealth managers & valuation analysts',
    trackedPropertiesLimit: 150,
    reportsPerMonth: 50,
    features: [
      'Client portfolio segregations for up to 150 properties',
      '50 institutional valuation & project intelligence reports/month',
      'Exportable Excel transaction evidence tables',
      'Advanced locality transaction volume & absorption rates',
      'Multi-scenario financial projections & sensitivity analysis',
      'Dedicated institutional relationship analyst',
    ],
  },
];
