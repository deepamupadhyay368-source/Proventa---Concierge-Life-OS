/**
 * PROVENTA — MODULES 2, 3 & 5: MARKET, PROJECT & LOCATION INTELLIGENCE ENGINE
 * Covers 13 Ahmedabad & Gandhinagar corridors. Strictly enforces minimum verified
 * sample sizes, source provenance, and explicit infrastructure lifecycle status.
 */

import { formatInrFromPaise } from '@/lib/construction-procurement/money';

export const AHMEDABAD_GANDHINAGAR_LOCALITIES = [
  { slug: 'bopal', name: 'Bopal', zone: 'West Ahmedabad', city: 'Ahmedabad' },
  { slug: 'south-bopal', name: 'South Bopal', zone: 'West Ahmedabad', city: 'Ahmedabad' },
  { slug: 'gota', name: 'Gota', zone: 'North-West Ahmedabad', city: 'Ahmedabad' },
  { slug: 'science-city', name: 'Science City', zone: 'West Ahmedabad', city: 'Ahmedabad' },
  { slug: 'thaltej', name: 'Thaltej', zone: 'West Ahmedabad', city: 'Ahmedabad' },
  { slug: 'bodakdev', name: 'Bodakdev', zone: 'Prime West Ahmedabad', city: 'Ahmedabad' },
  { slug: 'satellite', name: 'Satellite', zone: 'Prime West Ahmedabad', city: 'Ahmedabad' },
  { slug: 'prahlad-nagar', name: 'Prahlad Nagar', zone: 'Commercial West Ahmedabad', city: 'Ahmedabad' },
  { slug: 'sg-highway', name: 'SG Highway', zone: 'Central Growth Spine', city: 'Ahmedabad' },
  { slug: 'shela', name: 'Shela', zone: 'Emerging South-West', city: 'Ahmedabad' },
  { slug: 'sanand', name: 'Sanand', zone: 'Industrial & Residential Belt', city: 'Ahmedabad' },
  { slug: 'changodar', name: 'Changodar', zone: 'Industrial & Logistics Corridor', city: 'Ahmedabad' },
  { slug: 'gift-city', name: 'GIFT City', zone: 'IFSC Financial Hub', city: 'Gandhinagar' },
] as const;

export interface MarketObservationItem {
  locality: string;
  segment: string;
  propertyType: string;
  pricePerSqFtPaise: bigint;
  rentalYieldPct?: number | null;
  transactionCount: number;
  reportingPeriod: string;
  observationDate: Date;
  dataSource: string;
  methodology: string;
  verificationStatus: string;
}

export interface LocalityMarketBenchmark {
  locality: string;
  segment: string;
  status: 'RELIABLE' | 'INSUFFICIENT_DATA';
  message: string;
  observationCount: number;
  medianPriceSqFtPaise: bigint | null;
  formattedMedianPriceSqFt: string | null;
  minPriceSqFtPaise: bigint | null;
  maxPriceSqFtPaise: bigint | null;
  averageRentalYieldPct: number | null;
  totalRecordedTransactions: number;
  latestReportingPeriod: string | null;
  sources: string[];
  confidenceLevel: 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT_DATA';
}

export function computeLocalityMarketBenchmark(
  locality: string,
  segment: string,
  observations: readonly MarketObservationItem[]
): LocalityMarketBenchmark {
  const normLoc = locality.trim().toLowerCase();
  const normSeg = segment.trim().toUpperCase();

  const eligible = observations.filter(
    (o) =>
      o.locality.trim().toLowerCase() === normLoc &&
      o.segment.trim().toUpperCase() === normSeg &&
      (o.verificationStatus === 'VERIFIED' ||
        o.verificationStatus === 'EXTERNALLY_SOURCED' ||
        o.verificationStatus === 'ADMIN_SUBMITTED')
  );

  if (eligible.length < 3) {
    return {
      locality,
      segment: normSeg,
      status: 'INSUFFICIENT_DATA',
      message: 'Insufficient verified market observations to compute a reliable locality benchmark (minimum 3 sourced observations required).',
      observationCount: eligible.length,
      medianPriceSqFtPaise: null,
      formattedMedianPriceSqFt: null,
      minPriceSqFtPaise: null,
      maxPriceSqFtPaise: null,
      averageRentalYieldPct: null,
      totalRecordedTransactions: eligible.reduce((a, o) => a + o.transactionCount, 0),
      latestReportingPeriod: eligible[0]?.reportingPeriod ?? null,
      sources: Array.from(new Set(eligible.map((o) => o.dataSource))),
      confidenceLevel: 'INSUFFICIENT_DATA',
    };
  }

  const sorted = eligible
    .map((o) => o.pricePerSqFtPaise)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / BigInt(2);

  const yields = eligible.map((o) => o.rentalYieldPct).filter((y): y is number => typeof y === 'number');
  const avgYield = yields.length ? Math.round((yields.reduce((a, b) => a + b, 0) / yields.length) * 100) / 100 : null;

  const latest = [...eligible].sort((a, b) => b.observationDate.getTime() - a.observationDate.getTime())[0];

  return {
    locality,
    segment: normSeg,
    status: 'RELIABLE',
    message: `Computed from ${eligible.length} sourced market observations.`,
    observationCount: eligible.length,
    medianPriceSqFtPaise: median,
    formattedMedianPriceSqFt: formatInrFromPaise(median),
    minPriceSqFtPaise: sorted[0],
    maxPriceSqFtPaise: sorted[sorted.length - 1],
    averageRentalYieldPct: avgYield,
    totalRecordedTransactions: eligible.reduce((a, o) => a + o.transactionCount, 0),
    latestReportingPeriod: latest.reportingPeriod,
    sources: Array.from(new Set(eligible.map((o) => o.dataSource))),
    confidenceLevel: eligible.length >= 10 ? 'HIGH' : eligible.length >= 5 ? 'MODERATE' : 'LOW',
  };
}

export interface ProjectComparisonItem {
  slug: string;
  name: string;
  developerName: string;
  locality: string;
  reraNumber?: string | null;
  constructionStatus: string;
  pricePerSqFtRupees: number | null;
  amenitiesCount: number;
  estimatedRentalYieldPct?: number | null;
  verificationStatus: string;
}

export function compareProjectsSideBySide(projects: readonly ProjectComparisonItem[]) {
  if (projects.length < 2) {
    throw new Error('At least 2 projects are required for side-by-side comparison.');
  }
  const priced = projects.filter((p) => p.pricePerSqFtRupees && p.pricePerSqFtRupees > 0);
  const lowestPriceProject = priced.length
    ? [...priced].sort((a, b) => (a.pricePerSqFtRupees ?? 0) - (b.pricePerSqFtRupees ?? 0))[0]
    : null;

  return {
    comparedCount: projects.length,
    lowestPricePerSqFtSlug: lowestPriceProject?.slug ?? null,
    projects: projects.map((p) => ({
      ...p,
      riskIndicators: [
        ...(!p.reraNumber ? ['RERA registration number not verified on file'] : []),
        ...(p.verificationStatus !== 'VERIFIED' ? [`Verification status: ${p.verificationStatus}`] : []),
      ],
    })),
    disclosure:
      'Comparison reflects recorded project attributes only. Developer track records, completion timelines, and available inventory are never fabricated when unavailable.',
  };
}
