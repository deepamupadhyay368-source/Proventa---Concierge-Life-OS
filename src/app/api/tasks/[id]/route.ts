import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const task = await db.task.findUnique({
      where: { id },
      include: {
        customer: true,
        events: { orderBy: { createdAt: 'desc' } },
        agentRuns: true,
      },
    });

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    // IDOR Protection: Must be task owner or Concierge/Admin/SuperAdmin
    const isOwner = task.customer?.userId === user.id;
    const isStaff = user.roles.some((r) =>
      ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE_MANAGER', 'CONCIERGE'].includes(r)
    );

    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: 'Unauthorized access to task' }, { status: 403 });
    }

    if (!isStaff) {
      const customerSafeEvents = task.events.filter(
        (e) => e.eventType !== 'INTERNAL_NOTE_ADDED' && !e.eventType.includes('INTERNAL')
      );
      const prefs = (task.clientPreferences as Record<string, any>) || {};
      const customerSafeTask = {
        ...task,
        events: customerSafeEvents,
        customerStatusMessage: prefs.customerStatusMessage || 'Your Proventa Concierge is handling this.',
      };
      return NextResponse.json({ task: customerSafeTask });
    }

    return NextResponse.json({ task });
  } catch (error: any) {
    if (error?.statusCode) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}
