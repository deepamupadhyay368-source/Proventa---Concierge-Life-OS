import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  compareProjectsSideBySide,
  type ProjectComparisonItem,
} from '@/lib/real-estate-intelligence/market-engine';

const compareProjectsSchema = z.object({
  slugs: z.array(z.string().trim().min(1)).min(2).max(6),
});

async function runProjectComparison(slugs: string[]) {
  const projects = await db.project.findMany({
    where: { slug: { in: slugs } },
    select: {
      slug: true,
      name: true,
      developer: true,
      district: true,
      reraNumber: true,
      possessionStatus: true,
      priceRangeMinLakhs: true,
      priceRangeMaxLakhs: true,
      carpetAreaRangeMin: true,
      carpetAreaRangeMax: true,
      verificationBadge: true,
      locality: {
        select: { name: true },
      },
    },
  });

  if (projects.length < 2) {
    return NextResponse.json(
      {
        error: 'At least 2 matching projects in the PROVENTA database are required for comparison.',
        foundSlugs: projects.map((p) => p.slug),
      },
      { status: 404 }
    );
  }

  const items: ProjectComparisonItem[] = projects.map((p) => {
    const avgPriceLakhs =
      p.priceRangeMinLakhs && p.priceRangeMaxLakhs
        ? (p.priceRangeMinLakhs + p.priceRangeMaxLakhs) / 2
        : p.priceRangeMinLakhs ?? p.priceRangeMaxLakhs ?? null;
    const avgCarpetSqFt =
      p.carpetAreaRangeMin && p.carpetAreaRangeMax
        ? (p.carpetAreaRangeMin + p.carpetAreaRangeMax) / 2
        : p.carpetAreaRangeMin ?? p.carpetAreaRangeMax ?? null;

    const pricePerSqFtRupees =
      avgPriceLakhs && avgCarpetSqFt && avgCarpetSqFt > 0
        ? Math.round((avgPriceLakhs * 100_000) / avgCarpetSqFt)
        : null;

    return {
      slug: p.slug,
      name: p.name,
      developerName: p.developer || 'Unverified Developer',
      locality: p.locality?.name || p.district || 'Ahmedabad',
      reraNumber: p.reraNumber,
      constructionStatus: p.possessionStatus || 'UNSPECIFIED',
      pricePerSqFtRupees,
      amenitiesCount: 0,
      estimatedRentalYieldPct: null,
      verificationStatus: p.verificationBadge === 'OFFICIALLY_VERIFIED' ? 'VERIFIED' : p.verificationBadge,
    };
  });

  return NextResponse.json(compareProjectsSideBySide(items));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSlugs = searchParams.get('slugs')?.trim() || '';
    const slugs = rawSlugs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (slugs.length < 2) {
      const sampleProjects = await db.project.findMany({
        select: { slug: true, name: true, developer: true, reraNumber: true, locality: { select: { name: true } } },
        take: 12,
        orderBy: { name: 'asc' },
      });
      return NextResponse.json({
        message: 'Pass ?slugs=slug-a,slug-b (or POST { slugs: [...] }) to compare 2 to 6 RERA projects.',
        availableProjects: sampleProjects,
      });
    }

    return await runProjectComparison(slugs.slice(0, 6));
  } catch (err) {
    console.error('[GET /api/real-estate/projects/compare]', err);
    return NextResponse.json({ error: 'Failed to compare projects.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = compareProjectsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Provide between 2 and 6 project slugs to compare.', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    return await runProjectComparison(parsed.data.slugs);
  } catch (err) {
    console.error('[POST /api/real-estate/projects/compare]', err);
    return NextResponse.json({ error: 'Failed to compare projects.' }, { status: 500 });
  }
}
