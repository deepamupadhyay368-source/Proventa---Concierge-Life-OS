import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import {
  AHMEDABAD_GANDHINAGAR_LOCALITIES,
  computeLocalityMarketBenchmark,
} from '@/lib/real-estate-intelligence/market-engine';
import {
  buildRateLimitHeaders,
  checkRateLimitAsync,
  getClientIpFromHeaders,
} from '@/lib/real-estate-intelligence/rate-limit';

const createObservationSchema = z.object({
  recordType: z.literal('OBSERVATION'),
  locality: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(80).default('Ahmedabad'),
  segment: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'LAND']),
  propertyType: z.enum(['APARTMENT', 'VILLA', 'OFFICE', 'PLOT', 'RETAIL']),
  pricePerSqFtRupees: z.number().positive(),
  rentalYieldPct: z.number().min(0).max(25).optional().nullable(),
  transactionCount: z.number().int().min(1).default(1),
  reportingPeriod: z.string().trim().min(4).max(32),
  observationDate: z.string().datetime().optional(),
  dataSource: z.string().trim().min(3).max(200),
  sourceUrl: z.string().url().optional().nullable(),
  methodology: z.string().trim().min(5).max(500),
  verificationStatus: z
    .enum(['VERIFIED', 'ADMIN_SUBMITTED', 'EXTERNALLY_SOURCED', 'UNVERIFIED'])
    .default('ADMIN_SUBMITTED'),
});

const createInfrastructureSchema = z.object({
  recordType: z.literal('INFRASTRUCTURE'),
  name: z.string().trim().min(3).max(160),
  locality: z.string().trim().min(2).max(100),
  corridor: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(80).default('Ahmedabad'),
  category: z.enum(['METRO', 'EXPRESSWAY', 'COMMERCIAL_HUB', 'EDUCATION', 'HEALTHCARE', 'AIRPORT', 'TRANSIT']),
  status: z.enum(['OPERATIONAL', 'UNDER_CONSTRUCTION', 'PROPOSED', 'UNVERIFIED']),
  expectedCompletionYear: z.number().int().min(1990).max(2060).optional().nullable(),
  sourceReference: z.string().trim().min(3).max(240),
});

function serializeBenchmark(b: ReturnType<typeof computeLocalityMarketBenchmark>) {
  return {
    ...b,
    medianPriceSqFtPaise: b.medianPriceSqFtPaise !== null ? b.medianPriceSqFtPaise.toString() : null,
    minPriceSqFtPaise: b.minPriceSqFtPaise !== null ? b.minPriceSqFtPaise.toString() : null,
    maxPriceSqFtPaise: b.maxPriceSqFtPaise !== null ? b.maxPriceSqFtPaise.toString() : null,
  };
}

/**
 * GET /api/real-estate/market
 * Returns all 13 Ahmedabad & Gandhinagar corridors with DB-backed benchmarks
 * (explicit INSUFFICIENT_DATA when < 3 verified/sourced observations exist),
 * infrastructure lifecycle records, and optional locality-vs-locality comparison (?compare=Bopal,Thaltej).
 */
export async function GET(req: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(req.headers);
    const rl = await checkRateLimitAsync(`market-get:${ip}`, 90, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for Market Intelligence.' },
        { status: 429, headers: buildRateLimitHeaders(rl) }
      );
    }

    const { searchParams } = new URL(req.url);
    const segment = (searchParams.get('segment') || 'RESIDENTIAL').trim().toUpperCase();
    const localityFilter = searchParams.get('locality')?.trim() || '';
    const compareParam = searchParams.get('compare')?.trim() || '';

    const [observations, infrastructureAssets] = await Promise.all([
      db.marketObservation.findMany({
        where: {
          segment,
          ...(localityFilter ? { locality: { equals: localityFilter, mode: 'insensitive' } } : {}),
        },
        orderBy: { observationDate: 'desc' },
        take: 1000,
      }),
      db.infrastructureAsset.findMany({
        where: localityFilter ? { locality: { equals: localityFilter, mode: 'insensitive' } } : {},
        orderBy: [{ status: 'asc' }, { name: 'asc' }],
        take: 250,
      }),
    ]);

    const localitiesToCompute = localityFilter
      ? AHMEDABAD_GANDHINAGAR_LOCALITIES.filter(
          (l) =>
            l.name.toLowerCase() === localityFilter.toLowerCase() ||
            l.slug.toLowerCase() === localityFilter.toLowerCase()
        )
      : AHMEDABAD_GANDHINAGAR_LOCALITIES;

    const corridors = localitiesToCompute.map((loc) => {
      const benchmark = computeLocalityMarketBenchmark(loc.name, segment, observations);
      const infra = infrastructureAssets.filter(
        (a) => a.locality.toLowerCase() === loc.name.toLowerCase()
      );
      return {
        ...loc,
        benchmark: serializeBenchmark(benchmark),
        infrastructureSummary: {
          total: infra.length,
          operational: infra.filter((a) => a.status === 'OPERATIONAL').length,
          underConstruction: infra.filter((a) => a.status === 'UNDER_CONSTRUCTION').length,
          proposed: infra.filter((a) => a.status === 'PROPOSED').length,
          unverified: infra.filter((a) => a.status === 'UNVERIFIED').length,
        },
      };
    });

    let comparison: Array<{
      locality: string;
      benchmark: ReturnType<typeof serializeBenchmark>;
      infrastructureAssets: typeof infrastructureAssets;
    }> | null = null;

    if (compareParam) {
      const requested = compareParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4);

      if (requested.length >= 2) {
        comparison = requested.map((locName) => ({
          locality: locName,
          benchmark: serializeBenchmark(computeLocalityMarketBenchmark(locName, segment, observations)),
          infrastructureAssets: infrastructureAssets.filter(
            (a) => a.locality.toLowerCase() === locName.toLowerCase()
          ),
        }));
      }
    }

    return NextResponse.json({
      geography: 'Ahmedabad & Gandhinagar, Gujarat, India',
      segment,
      totalCorridors: AHMEDABAD_GANDHINAGAR_LOCALITIES.length,
      corridors,
      infrastructureAssets,
      comparison,
      methodologyDisclosure:
        'Benchmarks compute median INR/sq ft strictly from VERIFIED and EXTERNALLY_SOURCED observations. Localities with fewer than 3 qualifying observations report INSUFFICIENT_DATA rather than synthetic estimates. Infrastructure statuses explicitly distinguish OPERATIONAL, UNDER_CONSTRUCTION, PROPOSED, and UNVERIFIED assets.',
    });
  } catch (err) {
    console.error('[GET /api/real-estate/market]', err);
    return NextResponse.json({ error: 'Failed to load Market Intelligence data.' }, { status: 500 });
  }
}

/**
 * POST /api/real-estate/market
 * Admin-only endpoint to record sourced MarketObservation or InfrastructureAsset entries.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Admin privileges required to record market intelligence.' }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (body?.recordType === 'INFRASTRUCTURE') {
      const parsed = createInfrastructureSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid infrastructure asset payload.', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      const d = parsed.data;
      const asset = await db.infrastructureAsset.create({
        data: {
          name: d.name,
          locality: d.locality,
          corridor: d.corridor,
          city: d.city,
          category: d.category,
          status: d.status,
          expectedCompletionYear: d.expectedCompletionYear ?? null,
          sourceReference: d.sourceReference,
        },
      });
      return NextResponse.json({ infrastructureAsset: asset }, { status: 201 });
    }

    const parsed = createObservationSchema.safeParse({ recordType: 'OBSERVATION', ...body });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid market observation payload.', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const pricePerSqFtPaise = BigInt(Math.round(d.pricePerSqFtRupees * 100));
    const created = await db.marketObservation.create({
      data: {
        locality: d.locality,
        city: d.city,
        segment: d.segment,
        propertyType: d.propertyType,
        pricePerSqFtPaise,
        rentalYieldPct: d.rentalYieldPct ?? null,
        transactionCount: d.transactionCount,
        reportingPeriod: d.reportingPeriod,
        observationDate: d.observationDate ? new Date(d.observationDate) : new Date(),
        dataSource: d.dataSource,
        sourceUrl: d.sourceUrl ?? null,
        methodology: d.methodology,
        verificationStatus: d.verificationStatus,
        confidenceLevel: d.verificationStatus === 'VERIFIED' ? 'HIGH' : 'MODERATE',
      },
    });

    return NextResponse.json(
      {
        observation: {
          ...created,
          pricePerSqFtPaise: created.pricePerSqFtPaise.toString(),
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/real-estate/market]', err);
    return NextResponse.json({ error: 'Failed to save market intelligence record.' }, { status: 500 });
  }
}
