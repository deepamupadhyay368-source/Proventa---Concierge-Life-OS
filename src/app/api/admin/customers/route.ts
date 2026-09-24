import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { isAppError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

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
        ...(statusFilter && statusFilter !== 'ALL' ? { status: statusFilter as any } : {}),
      },
      ...(cityFilter ? { city: { equals: cityFilter, mode: 'insensitive' } } : {}),
    };

    const [totalCount, activeCount, pendingCount, suspendedCount, customers] = await Promise.all([
      db.customerProfile.count({ where: whereClause }),
      db.customerProfile.count({ where: { user: { status: 'ACTIVE' } } }),
      db.customerProfile.count({ where: { user: { status: 'PENDING_VERIFICATION' } } }),
      db.customerProfile.count({ where: { user: { status: 'SUSPENDED' } } }),
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
              userRoles: {
                select: {
                  role: true,
                },
              },
            },
          },
          preferences: {
            select: {
              id: true,
              category: true,
              key: true,
              value: true,
            },
          },
          tasks: {
            select: {
              id: true,
              status: true,
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

    const formattedCustomers = customers.map((c) => {
      const activeTasks = c.tasks.filter((t) => !['COMPLETED', 'CANCELLED', 'FAILED'].includes(t.status)).length;
      const completedTasks = c.tasks.filter((t) => t.status === 'COMPLETED').length;
      return {
        id: c.id,
        userId: c.userId,
        city: c.city,
        preferredComm: c.preferredComm,
        onboardingCompleted: c.onboardingCompleted,
        createdAt: c.createdAt,
        user: c.user,
        preferencesCount: c.preferences.length,
        taskStats: {
          total: c._count.tasks,
          active: activeTasks,
          completed: completedTasks,
        },
        bookingsCount: c._count.bookings,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        totalCount,
        stats: {
          total: totalCount,
          active: activeCount,
          pending: pendingCount,
          suspended: suspendedCount,
        },
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        customers: formattedCustomers,
      },
    });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error?.name === 'AuthorizationError' || error?.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized: ADMIN privilege required' }, { status: 403 });
    }
    if (error?.name === 'AuthenticationError' || error?.message?.includes('Authentication')) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
