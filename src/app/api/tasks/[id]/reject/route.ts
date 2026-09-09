import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { appendTaskEvent } from '@/lib/orchestration/timeline';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { reason } = body;

    const task = await db.task.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const isOwner = task.customer?.userId === user.id;
    const isStaff = user.roles.some((r) => ['CONCIERGE', 'CONCIERGE_MANAGER', 'ADMIN'].includes(r));
    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedTask = await db.task.update({
      where: { id },
      data: {
        approvalStatus: 'DECLINED',
        status: 'NEEDS_HUMAN',
        isEscalated: true,
        failedReason: reason || 'Customer declined proposal. Escalated to concierge for alternate options.',
      },
    });

    await appendTaskEvent({
      taskId: id,
      eventType: 'PROPOSAL_DECLINED',
      actorRole: 'CUSTOMER',
      actorId: user.id,
      message: `Client declined proposal: ${reason || 'Requested alternate options'}. Escalated to Concierge Desk.`,
      data: { reason },
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to reject option' }, { status: 500 });
  }
}