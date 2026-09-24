import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const { option } = body;

    const { db } = await import('@/lib/db');
    const task = await db.task.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const isOwner = task.customer?.userId === user.id;
    const isStaff = user.roles.some((r) =>
      ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE_MANAGER', 'CONCIERGE'].includes(r)
    );
    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: 'Unauthorized to approve task' }, { status: 403 });
    }


    let selectedOption = body.option;
    if (!selectedOption && body.optionId && Array.isArray(task.proposedOptions)) {
      selectedOption = (task.proposedOptions as any[]).find(
        (o: any) => o.id === body.optionId
      );
    }
    if (!selectedOption && Array.isArray(task.proposedOptions) && task.proposedOptions.length > 0) {
      selectedOption = (task.proposedOptions as any[])[0];
    }
    if (!selectedOption) {
      return NextResponse.json({ error: 'No option specified and no proposed options available' }, { status: 400 });
    }

    const result = await RequestOrchestrator.executeApprovedTask({
      taskId: id,
      option: selectedOption,
      userId: user.id,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[POST /api/tasks/[id]/approve]', error);
    return NextResponse.json({ error: error.message || 'Approval execution failed' }, { status: 500 });
  }
}
