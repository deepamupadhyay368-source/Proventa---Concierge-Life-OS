import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireSuperAdmin();

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalCustomers,
      newCustomers7d,
      newCustomers30d,
      totalTasks,
      activeTasks,
      completedTasks,
      needsHumanTasks,
      totalBookings,
      confirmedBookings,
      payments,
      categoryDistribution,
    ] = await Promise.all([
      db.customerProfile.count(),
      db.customerProfile.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      db.customerProfile.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      db.task.count(),
      db.task.count({
        where: {
          status: {
            in: ['REQUESTED', 'SEARCHING', 'OPTIONS_READY', 'AWAITING_APPROVAL', 'APPROVED', 'EXECUTING', 'VERIFYING'],
          },
        },
      }),
      db.task.count({ where: { status: { in: ['CONFIRMED', 'COMPLETED'] } } }),
      db.task.count({ where: { OR: [{ status: 'NEEDS_HUMAN' }, { isEscalated: true }] } }),
      db.booking.count(),
      db.booking.count({ where: { status: 'CONFIRMED' } }),
      db.payment.findMany({
        where: { status: 'CAPTURED' },
        select: { amount: true },
      }),
      db.task.groupBy({
        by: ['category'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
    ]);

    const totalGMVPaise = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        newCustomers7d,
        newCustomers30d,
        totalTasks,
        activeTasks,
        completedTasks,
        needsHumanTasks,
        totalBookings,
        confirmedBookings,
        totalGMVPaise,
        categoryDistribution: categoryDistribution.map((c) => ({
          category: c.category,
          count: c._count.id,
        })),
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
