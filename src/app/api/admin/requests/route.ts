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
    const priorityFilter = searchParams.get('priority');
    const categoryFilter = searchParams.get('category');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const skip = (page - 1) * pageSize;

    const whereClause: any = {
      ...(query
        ? {
            OR: [
              { publicId: { contains: query, mode: 'insensitive' } },
              { intent: { contains: query, mode: 'insensitive' } },
              { originalRequest: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(statusFilter ? { status: statusFilter as any } : {}),
      ...(priorityFilter ? { priority: priorityFilter as any } : {}),
      ...(categoryFilter ? { category: { equals: categoryFilter, mode: 'insensitive' } } : {}),
    };

    const [totalCount, tasks] = await Promise.all([
      db.task.count({ where: whereClause }),
      db.task.findMany({
        where: whereClause,
        include: {
          customer: {
            include: {
              user: { select: { name: true, email: true, phone: true } },
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
        tasks,
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

export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = await requireSuperAdmin();
    const body = await req.json();
    const { taskId, status } = body;

    if (!taskId || !status) {
      return NextResponse.json({ error: 'taskId and status are required' }, { status: 400 });
    }

    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        status: status as any,
        isEscalated: status === 'NEEDS_HUMAN',
        completedAt: ['CONFIRMED', 'COMPLETED'].includes(status) ? new Date() : undefined,
      },
    });

    // Record audit event
    await db.taskEvent.create({
      data: {
        taskId,
        eventType: `STATUS_CHANGED_${status}`,
        actorRole: 'CONCIERGE',
        message: `Admin ${sessionUser.email} transitioned task status to ${status}`,
        data: { updatedBy: sessionUser.email, newStatus: status },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTask,
    });
  } catch (error: any) {
    if (error?.name === 'AuthorizationError' || error?.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized: SUPER_ADMIN required' }, { status: 403 });
    }
    if (error?.name === 'AuthenticationError' || error?.message?.includes('Authentication')) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    return NextResponse.json({ error: error?.message || 'Failed to update task' }, { status: 500 });
  }
}
