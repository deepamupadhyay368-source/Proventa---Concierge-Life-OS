import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { importEvidenceCsv } from '@/lib/real-estate/evidence-service';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userRoles = (session.user.roles as string[]) || [];
    const isAuthorized = userRoles.some((r) =>
      ['SUPER_ADMIN', 'ADMIN', 'FOUNDER', 'MODERATOR'].includes(r)
    );

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin privileges required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { entityType, csvText, sourceId, sourceDocumentId } = body;

    if (!entityType || !['TRANSACTIONS', 'LISTINGS', 'JANTRI'].includes(entityType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing entityType (must be TRANSACTIONS, LISTINGS, or JANTRI)' },
        { status: 400 }
      );
    }

    if (!csvText || typeof csvText !== 'string' || !csvText.trim()) {
      return NextResponse.json(
        { success: false, error: 'csvText content is required' },
        { status: 400 }
      );
    }

    if (!sourceId) {
      return NextResponse.json(
        { success: false, error: 'sourceId is required to preserve provenance' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim();

    const result = await importEvidenceCsv({
      entityType,
      csvText,
      sourceId,
      sourceDocumentId,
      userId: session.user.id,
      userEmail: session.user.email || undefined,
      ipAddress,
    });

    return NextResponse.json({
      success: result.success,
      data: result,
    });
  } catch (error: any) {
    console.error('[API admin/evidence/import POST]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Import processing failure' },
      { status: 500 }
    );
  }
}
