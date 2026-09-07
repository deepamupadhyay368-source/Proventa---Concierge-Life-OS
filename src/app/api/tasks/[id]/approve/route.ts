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
    const isStaff = user.roles.some((r) => ['CONCIERGE', 'CONCIERGE_MANAGER', 'ADMIN'].includes(r));
    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: 'Unauthorized to approve task' }, { status: 403 });
    }

    const result = await RequestOrchestrator.executeApprovedTask({
      taskId: id,
      option,
      userId: user.id,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[POST /api/tasks/[id]/approve]', error);
    return NextResponse.json({ error: error.message || 'Approval execution failed' }, { status: 500 });
  }
}
