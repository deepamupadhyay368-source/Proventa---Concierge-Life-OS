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
      totalTasks,
      completedTasks,
      escalatedTasks,
      autonomousTasks,
      categoryCounts,
      statusCounts,
      totalCustomers,
      newCustomers7d,
      newCustomers30d,
      completedTasksTimes,
    ] = await Promise.all([
      db.task.count(),
      db.task.count({ where: { status: { in: ['CONFIRMED', 'COMPLETED'] } } }),
      db.task.count({ where: { OR: [{ status: 'NEEDS_HUMAN' }, { isEscalated: true }] } }),
      db.task.count({
        where: {
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          isEscalated: false,
        },
      }),
      db.task.groupBy({
        by: ['category'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      db.task.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      db.customerProfile.count(),
      db.customerProfile.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      db.customerProfile.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      db.task.findMany({
        where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
        select: { createdAt: true, completedAt: true, updatedAt: true },
        take: 100,
      }),
    ]);

    const autonomousRatio =
      completedTasks > 0
        ? Math.round((autonomousTasks / completedTasks) * 100)
        : 100;

    let avgResolutionMinutes = 0;
    if (completedTasksTimes.length > 0) {
      const totalMs = completedTasksTimes.reduce((acc, t) => {
        const end = t.completedAt || t.updatedAt;
        return acc + (end.getTime() - t.createdAt.getTime());
      }, 0);
      avgResolutionMinutes = Math.max(1, Math.round(totalMs / completedTasksTimes.length / 60000));
    }

    return NextResponse.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        escalatedTasks,
        autonomousTasks,
        autonomousRatio,
        escalationRate: totalTasks > 0 ? ((escalatedTasks / totalTasks) * 100).toFixed(1) : '0.0',
        avgResolutionMinutes,
        totalCustomers,
        newCustomers7d,
        newCustomers30d,
        categories: categoryCounts.map((c) => ({ category: c.category, count: c._count.id })),
        statuses: statusCounts.map((s) => ({ status: s.status, count: s._count.id })),
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
