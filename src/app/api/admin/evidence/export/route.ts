import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { exportApprovedEvidenceCsv } from '@/lib/real-estate/evidence-service';

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
    const entityType = (searchParams.get('entityType') as 'TRANSACTIONS' | 'LISTINGS' | 'JANTRI') || 'TRANSACTIONS';
    const localityId = searchParams.get('localityId') || undefined;

    const csvContent = await exportApprovedEvidenceCsv({
      entityType,
      localityId,
    });

    const filename = `proventa_verified_${entityType.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('[API admin/evidence/export GET]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Export generation failure' },
      { status: 500 }
    );
  }
}
