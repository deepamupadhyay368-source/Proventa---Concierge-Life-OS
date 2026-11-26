import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType') as any;
    const entityId = searchParams.get('entityId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const logs = await db.evidenceAuditLog.findMany({
      where: {
        ...(entityType ? { entityType } : {}),
        ...(entityId ? { entityId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error: any) {
    console.error('[API admin/evidence/audit-logs GET]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list audit logs' },
      { status: 500 }
    );
  }
}
