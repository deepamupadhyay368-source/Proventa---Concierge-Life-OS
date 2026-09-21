import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const task = await db.task.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const isOwner = task.customer?.userId === user.id;
    const isStaff = user.roles.some((r) => ['CONCIERGE', 'CONCIERGE_MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(r));
    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const options = (task.proposedOptions || []) as any[];
    const prefs = (task.clientPreferences as Record<string, any>) || {};
    const batchHistory = Array.isArray(prefs.batchHistory) ? prefs.batchHistory : [];
    const currentBatchId = prefs.currentBatchId || (batchHistory.length > 0 ? batchHistory[batchHistory.length - 1].batchId : 'BATCH-001');
    const batchNumber = batchHistory.length > 0 ? batchHistory[batchHistory.length - 1].batchNumber : 1;

    return NextResponse.json({
      taskId: task.id,
      publicId: task.publicId,
      status: task.status,
      currentBatchId,
      batchNumber,
      count: options.length,
      options,
      batchHistory,
      rejectedOptionIds: prefs.rejectedOptionIds || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { action = 'REJECT_ALL', feedback, replaceOptionId, keptOptionIds, newRawInput, newConstraints } = body;

    const result = await RequestOrchestrator.cycleOptionBatch({
      taskId: id,
      userId: user.id,
      action,
      feedback,
      replaceOptionId,
      keptOptionIds,
      newRawInput,
      newConstraints,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[POST /api/tasks/[id]/options]', error);
    return NextResponse.json({ error: error.message || 'Failed to cycle options' }, { status: 500 });
  }
}