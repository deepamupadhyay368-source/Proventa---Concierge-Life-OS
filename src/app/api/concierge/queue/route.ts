import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge } from '@/lib/auth/session';
import { isAppError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    await requireConcierge();

    const [requests, escalatedTasks] = await Promise.all([
      db.conciergeRequest.findMany({
        where: { deletedAt: null },
        include: {
          customer: { include: { user: { select: { name: true, email: true, phone: true } }, preferences: true } },
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
          customer: { include: { user: { select: { name: true, email: true, phone: true } }, preferences: true } },
          events: { orderBy: { createdAt: 'desc' }, take: 10 },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      }),
    ]);

    return NextResponse.json({ requests, escalatedTasks });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}
