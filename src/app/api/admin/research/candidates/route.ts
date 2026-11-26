import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const userRoles = (session.user.roles as string[]) || [];
    const isAuthorized = userRoles.some((r) =>
      ['SUPER_ADMIN', 'ADMIN', 'FOUNDER', 'MODERATOR'].includes(r)
    );

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized administrative access' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING_REVIEW';

    const candidates = await db.projectCandidate.findMany({
      where: status !== 'ALL' ? { reviewStatus: status } : undefined,
      include: {
        source: { select: { code: true, name: true } },
        matchedProject: { select: { id: true, name: true, reraNumber: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const statusCounts = await db.projectCandidate.groupBy({
      by: ['reviewStatus'],
      _count: true,
    });

    return NextResponse.json({
      success: true,
      total: candidates.length,
      data: candidates,
      statusCounts: statusCounts.reduce((acc: any, curr) => {
        acc[curr.reviewStatus] = curr._count;
        return acc;
      }, {}),
    });
  } catch (error: any) {
    console.error('Admin candidates query error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
