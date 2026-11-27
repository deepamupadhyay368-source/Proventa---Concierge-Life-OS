import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

/**
 * GET /api/real-estate/reports/[id]/download
 * Secure, owner-verified PDF binary download.
 * Returns 401 if unauthenticated, 403 if cross-user IDOR attempt, 404 if not found.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await context.params;
    const report = await db.realEstateReport.findUnique({
      where: { id },
      select: {
        id: true,
        ownerUserId: true,
        reportReference: true,
        pdfBase64: true,
        sha256Checksum: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    const userRoles = (session.user as { roles?: string[] }).roles ?? [];
    const isAdmin = userRoles.some((r) => ['SUPER_ADMIN', 'FOUNDER', 'ADMIN'].includes(r));
    if (report.ownerUserId !== session.user.id && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this report.' },
        { status: 403 }
      );
    }

    const pdfBytes = Buffer.from(report.pdfBase64, 'base64');
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${report.reportReference}.pdf"`,
        'Content-Length': String(pdfBytes.length),
        'X-Content-SHA256': report.sha256Checksum,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    console.error('[GET /api/real-estate/reports/[id]/download]', err);
    return NextResponse.json({ error: 'Failed to download PDF report.' }, { status: 500 });
  }
}
