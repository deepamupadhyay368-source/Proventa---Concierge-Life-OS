import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const user = await requireConcierge();

    const [requests, escalatedTasks] = await Promise.all([
      db.conciergeRequest.findMany({
        where: { deletedAt: null },
        include: {
          customer: { include: { user: { select: { name: true, email: true } }, preferences: true } },
          category: true,
          assignments: {
            where: { unassignedAt: null },
            include: { concierge: { include: { user: { select: { id: true, name: true } } } } },
          },
          slaRecord: true,
          approvals: { where: { status: 'PENDING' } },
        },
        orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
      }),
      db.task.findMany({
        where: { status: 'NEEDS_HUMAN' },
        include: {
          customer: { include: { user: { select: { name: true, email: true } }, preferences: true } },
          events: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      }),
    ]);

    return NextResponse.json({ requests, escalatedTasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}
