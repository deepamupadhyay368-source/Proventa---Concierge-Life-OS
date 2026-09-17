import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase()?.trim();
    const statusFilter = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const skip = (page - 1) * pageSize;

    const whereClause: any = {
      ...(statusFilter ? { status: statusFilter as any } : {}),
      ...(query
        ? {
            OR: [
              { confirmationRef: { contains: query, mode: 'insensitive' } },
              { customer: { user: { name: { contains: query, mode: 'insensitive' } } } },
              { customer: { user: { email: { contains: query, mode: 'insensitive' } } } },
            ],
          }
        : {}),
    };

    const [totalCount, bookings] = await Promise.all([
      db.booking.count({ where: whereClause }),
      db.booking.findMany({
        where: whereClause,
        include: {
          customer: {
            include: {
              user: { select: { name: true, email: true, phone: true } },
            },
          },
          provider: {
            select: { name: true },
          },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        bookings,
      },
    });
  } catch (error: any) {
    if (error?.name === 'AuthorizationError' || error?.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized: SUPER_ADMIN required' }, { status: 403 });
    }
    if (error?.name === 'AuthenticationError' || error?.message?.includes('Authentication')) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
