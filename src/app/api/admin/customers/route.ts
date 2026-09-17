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
    const cityFilter = searchParams.get('city');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const skip = (page - 1) * pageSize;

    const whereClause: any = {
      user: {
        ...(query
          ? {
              OR: [
                { email: { contains: query, mode: 'insensitive' } },
                { name: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(statusFilter ? { status: statusFilter as any } : {}),
      },
      ...(cityFilter ? { city: { equals: cityFilter, mode: 'insensitive' } } : {}),
    };

    const [totalCount, customers] = await Promise.all([
      db.customerProfile.count({ where: whereClause }),
      db.customerProfile.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              status: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              bookings: true,
            },
          },
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
        customers,
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
