import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Missing project slug' }, { status: 400 });
    }

    const project = await db.project.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug },
        ],
      },
      include: {
        locality: true,
        developerRelation: true,
        configurations: {
          orderBy: { bhk: 'asc' },
        },
        specifications: {
          orderBy: [{ category: 'asc' }, { featureName: 'asc' }],
        },
        amenities: {
          orderBy: [{ category: 'asc' }, { amenityName: 'asc' }],
        },
        constructionProgress: {
          orderBy: { asOfDate: 'desc' },
          include: { sourceDocument: true },
        },
        regulatoryEvents: {
          orderBy: { eventDate: 'desc' },
        },
        historicalSnapshots: {
          orderBy: { snapshotDate: 'desc' },
          take: 10,
        },
        sourceDocuments: {
          include: { source: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: `Project "${slug}" not found` },
        { status: 404 }
      );
    }

    // Lookup applicable statutory Jantri benchmark for this locality
    const jantri = await db.jantriBenchmark.findFirst({
      where: { localityId: project.localityId },
      orderBy: { effectiveFrom: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        jantriBenchmark: jantri,
      },
    });
  } catch (error: any) {
    console.error('Project detail fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error fetching project' },
      { status: 500 }
    );
  }
}
