import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { validateTransition } from '@/lib/orchestration/state-machine';
import { appendTaskEvent } from '@/lib/orchestration/timeline';
import { AdapterRegistry } from '@/lib/orchestration/adapters';

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

    validateTransition(task.status as any, 'CANCELLED');

    // If external booking reference exists, attempt adapter cancellation
    if (task.externalReferenceId && task.category) {
      const adapter = AdapterRegistry.getPrimaryAdapter(task.category);
      if (adapter.cancelBooking) {
        await adapter.cancelBooking(task.externalReferenceId, reason);
      }
    }

    const updatedTask = await db.task.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        failedReason: reason || 'Cancelled by client',
      },
    });

    await appendTaskEvent({
      taskId: id,
      eventType: 'TASK_CANCELLED',
      actorRole: isOwner ? 'CUSTOMER' : 'CONCIERGE',
      actorId: user.id,
      message: `Task cancelled: ${reason || 'Client requested cancellation'}.`,
      data: { reason },
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to cancel task' }, { status: 500 });
  }
}