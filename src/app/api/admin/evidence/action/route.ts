import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { processEvidenceAction } from '@/lib/real-estate/evidence-service';

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
    const { entityType, entityId, action, reason, correctionData } = body;

    if (!entityType || !['TRANSACTION', 'LISTING', 'JANTRI'].includes(entityType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid entityType (TRANSACTION, LISTING, or JANTRI)' },
        { status: 400 }
      );
    }

    if (!entityId) {
      return NextResponse.json(
        { success: false, error: 'entityId is required' },
        { status: 400 }
      );
    }

    if (!action || !['APPROVE', 'REJECT', 'FLAG', 'CORRECT'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action (APPROVE, REJECT, FLAG, or CORRECT)' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim();

    const result = await processEvidenceAction({
      entityType,
      entityId,
      action,
      reason,
      correctionData,
      reviewerUserId: session.user.id,
      reviewerEmail: session.user.email || undefined,
      ipAddress,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API admin/evidence/action POST]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Evidence action processing failure' },
      { status: 500 }
    );
  }
}
