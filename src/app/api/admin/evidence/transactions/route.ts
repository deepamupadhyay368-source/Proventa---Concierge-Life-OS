import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { EvidenceVerificationStatus } from '@prisma/client';

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
    const localityId = searchParams.get('localityId') || undefined;
    const status = searchParams.get('status') as EvidenceVerificationStatus | undefined;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    const where: any = {
      ...(localityId ? { localityId } : {}),
      ...(status ? { verificationStatus: status } : {}),
      ...(search
        ? {
            OR: [
              { deedId: { contains: search, mode: 'insensitive' } },
              { sourceReference: { contains: search, mode: 'insensitive' } },
              { subRegistrarOffice: { contains: search, mode: 'insensitive' } },
              { project: { name: { contains: search, mode: 'insensitive' } } },
              { locality: { name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [transactions, totalCount] = await Promise.all([
      db.propertyTransaction.findMany({
        where,
        include: {
          locality: { select: { id: true, name: true, slug: true } },
          project: { select: { id: true, name: true, slug: true } },
          source: { select: { id: true, name: true, code: true } },
          sourceDocument: { select: { id: true, fileName: true, fileUrl: true } },
          duplicateOf: { select: { id: true, deedId: true, transactedPriceLakhs: true } },
        },
        orderBy: { registrationDate: 'desc' },
        skip,
        take: limit,
      }),
      db.propertyTransaction.count({ where }),
    ]);

    // Also get counts by verification status for tab badges
    const statusCounts = await db.propertyTransaction.groupBy({
      by: ['verificationStatus'],
      _count: { id: true },
    });

    const statusCountsMap: Record<string, number> = {};
    statusCounts.forEach((s) => {
      statusCountsMap[s.verificationStatus] = s._count.id;
    });

    return NextResponse.json({
      success: true,
      data: transactions,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      statusCounts: statusCountsMap,
    });
  } catch (error: any) {
    console.error('[API admin/evidence/transactions GET]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list transactions' },
      { status: 500 }
    );
  }
}
