import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

/**
 * GET /api/real-estate/reports
 * Strictly returns ONLY the authenticated user's persisted PDF reports.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const reports = await db.realEstateReport.findMany({
      where: { ownerUserId: session.user.id },
      select: {
        id: true,
        reportReference: true,
        reportType: true,
        subjectTitle: true,
        geography: true,
        confidenceLevel: true,
        dataSources: true,
        sha256Checksum: true,
        pageCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      reports: reports.map((r) => ({
        ...r,
        downloadUrl: `/api/real-estate/reports/${r.id}/download`,
      })),
    });
  } catch (err) {
    console.error('[GET /api/real-estate/reports]', err);
    return NextResponse.json({ error: 'Failed to list generated reports.' }, { status: 500 });
  }
}
