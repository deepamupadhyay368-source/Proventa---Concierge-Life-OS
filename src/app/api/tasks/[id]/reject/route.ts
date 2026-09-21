import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const {
      reason,
      feedback,
      action = 'REJECT_ALL',
      replaceOptionId,
      keptOptionIds,
      newRawInput,
      newConstraints,
    } = body;

    const task = await db.task.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const isOwner = task.customer?.userId === user.id;
    const isStaff = user.roles.some((r) => ['CONCIERGE', 'CONCIERGE_MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(r));
    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const result = await RequestOrchestrator.cycleOptionBatch({
      taskId: id,
      userId: user.id,
      action,
      feedback: feedback || reason,
      replaceOptionId,
      keptOptionIds,
      newRawInput,
      newConstraints,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[POST /api/tasks/[id]/reject]', error);
    return NextResponse.json({ error: error.message || 'Failed to process recommendation cycle' }, { status: 500 });
  }
}