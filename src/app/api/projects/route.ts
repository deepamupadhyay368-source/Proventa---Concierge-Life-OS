import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const district = searchParams.get('district')?.trim() || '';
    const locality = searchParams.get('locality')?.trim() || '';
    const bhk = searchParams.get('bhk')?.trim() || '';
    const possession = searchParams.get('possession')?.trim() || '';
    const includeQuarantined = searchParams.get('includeQuarantined') === 'true';

    const where: any = {};

    // Publication Governance: Only return publicly approved and visible projects by default
    if (!includeQuarantined) {
      where.isPubliclyVisible = true;
      where.publicationStatus = 'PUBLISHED';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { developer: { contains: search, mode: 'insensitive' } },
        { reraNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (district && district !== 'all') {
      where.district = { equals: district, mode: 'insensitive' };
    }

    if (locality && locality !== 'all') {
      where.locality = {
        OR: [
          { slug: { equals: locality, mode: 'insensitive' } },
          { name: { equals: locality, mode: 'insensitive' } },
        ],
      };
    }

    if (possession && possession !== 'all') {
      where.possessionStatus = { contains: possession, mode: 'insensitive' };
    }

    if (bhk && bhk !== 'all') {
      const bhkNum = parseFloat(bhk);
      if (!isNaN(bhkNum)) {
        where.configurations = {
          some: { bhk: bhkNum },
        };
      }
    }

    const projects = await db.project.findMany({
      where,
      include: {
        locality: { select: { id: true, name: true, slug: true, city: true } },
        developerRelation: { select: { id: true, name: true, brandName: true } },
        configurations: {
          select: { id: true, bhk: true, typology: true, carpetAreaSqFt: true },
          orderBy: { bhk: 'asc' },
        },
        _count: {
          select: {
            configurations: true,
            specifications: true,
            amenities: true,
            sourceDocuments: true,
          },
        },
      },
      orderBy: [{ district: 'asc' }, { name: 'asc' }],
    });

    // Extract available localities and districts for filter pills
    const allLocalities = await db.locality.findMany({
      select: { name: true, slug: true, city: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      total: projects.length,
      data: projects,
      filterMeta: {
        districts: ['Ahmedabad', 'Gandhinagar'],
        localities: allLocalities,
      },
    });
  } catch (error: any) {
    console.error('Projects query error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve project directory' },
      { status: 500 }
    );
  }
}
