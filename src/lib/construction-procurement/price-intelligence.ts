/**
 * PROVENTA — FEATURE 2: MATERIAL PRICE INTELLIGENCE ENGINE
 * Computes verified historical benchmarks strictly on like-for-like specifications.
 * Never fabricates market prices or chart history; enforces minimum verified sample sizes
 * and freshness indicators.
 */

import { formatInrFromPaise } from './money';

export interface PriceObservationRecord {
  id: string;
  materialCategorySlug: string;
  materialName: string;
  brand: string;
  grade: string;
  unit: string;
  city: string;
  locality?: string | null;
  supplierName?: string | null;
  basePriceUnitPaise: bigint;
  landedPriceUnitPaise: bigint;
  observationDate: Date;
  sourceType: string;
  verificationStatus: string;
}

export interface PriceBenchmarkSummary {
  status: 'RELIABLE' | 'INSUFFICIENT_DATA';
  message: string;
  materialCategorySlug: string;
  grade: string;
  unit: string;
  city: string;
  verifiedObservationCount: number;
  totalObservationCount: number;
  lowestUnitPaise: bigint | null;
  highestUnitPaise: bigint | null;
  medianUnitPaise: bigint | null;
  formattedLowest: string | null;
  formattedHighest: string | null;
  formattedMedian: string | null;
  volatilityPercent: number | null;
  lastObservationDateIso: string | null;
  freshness: 'FRESH' | 'AGING' | 'STALE' | 'UNAVAILABLE';
  sourcesIncluded: string[];
}

export const MIN_VERIFIED_OBSERVATIONS_FOR_BENCHMARK = 3;

export function computeMaterialPriceBenchmark(params: {
  observations: readonly PriceObservationRecord[];
  materialCategorySlug: string;
  grade: string;
  unit: string;
  city?: string;
  now?: Date;
}): PriceBenchmarkSummary {
  const now = params.now ?? new Date();
  const normGrade = params.grade.trim().toLowerCase();
  const normUnit = params.unit.trim().toLowerCase();
  const normCity = params.city?.trim().toLowerCase();

  // Strict like-for-like filtering: never compare different grades or units as equivalent
  const matching = params.observations.filter((o) => {
    if (o.materialCategorySlug !== params.materialCategorySlug) return false;
    if (o.grade.trim().toLowerCase() !== normGrade) return false;
    if (o.unit.trim().toLowerCase() !== normUnit) return false;
    if (normCity && o.city.trim().toLowerCase() !== normCity) return false;
    return true;
  });

  const verified = matching.filter((o) => o.verificationStatus === 'VERIFIED');

  if (verified.length < MIN_VERIFIED_OBSERVATIONS_FOR_BENCHMARK) {
    return {
      status: 'INSUFFICIENT_DATA',
      message: 'Insufficient verified data to generate a reliable benchmark.',
      materialCategorySlug: params.materialCategorySlug,
      grade: params.grade,
      unit: params.unit,
      city: params.city || 'All Gujarat Locations',
      verifiedObservationCount: verified.length,
      totalObservationCount: matching.length,
      lowestUnitPaise: null,
      highestUnitPaise: null,
      medianUnitPaise: null,
      formattedLowest: null,
      formattedHighest: null,
      formattedMedian: null,
      volatilityPercent: null,
      lastObservationDateIso:
        verified.length > 0
          ? new Date(Math.max(...verified.map((v) => v.observationDate.getTime()))).toISOString()
          : null,
      freshness: verified.length === 0 ? 'UNAVAILABLE' : computeFreshness(verified, now),
      sourcesIncluded: Array.from(new Set(verified.map((v) => v.sourceType))),
    };
  }

  const sortedPrices = verified
    .map((v) => v.landedPriceUnitPaise)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const lowest = sortedPrices[0];
  const highest = sortedPrices[sortedPrices.length - 1];
  const mid = Math.floor(sortedPrices.length / 2);
  const median =
    sortedPrices.length % 2 === 1
      ? sortedPrices[mid]
      : (sortedPrices[mid - 1] + sortedPrices[mid]) / BigInt(2);

  // Volatility indicator: spread as % of median
  const volatilityPercent =
    median > BigInt(0)
      ? Math.round((Number(highest - lowest) / Number(median)) * 10000) / 100
      : 0;

  const latestTs = Math.max(...verified.map((v) => v.observationDate.getTime()));
  const freshness = computeFreshness(verified, now);

  return {
    status: 'RELIABLE',
    message: `Benchmark derived from ${verified.length} verified like-for-like observations (${params.grade}, ${params.unit}).`,
    materialCategorySlug: params.materialCategorySlug,
    grade: params.grade,
    unit: params.unit,
    city: params.city || 'All Gujarat Locations',
    verifiedObservationCount: verified.length,
    totalObservationCount: matching.length,
    lowestUnitPaise: lowest,
    highestUnitPaise: highest,
    medianUnitPaise: median,
    formattedLowest: formatInrFromPaise(lowest),
    formattedHighest: formatInrFromPaise(highest),
    formattedMedian: formatInrFromPaise(median),
    volatilityPercent,
    lastObservationDateIso: new Date(latestTs).toISOString(),
    freshness,
    sourcesIncluded: Array.from(new Set(verified.map((v) => v.sourceType))),
  };
}

function computeFreshness(
  observations: readonly PriceObservationRecord[],
  now: Date
): 'FRESH' | 'AGING' | 'STALE' {
  const latestTs = Math.max(...observations.map((v) => v.observationDate.getTime()));
  const ageDays = (now.getTime() - latestTs) / (24 * 3600 * 1000);
  if (ageDays <= 14) return 'FRESH';
  if (ageDays <= 30) return 'AGING';
  return 'STALE';
}
