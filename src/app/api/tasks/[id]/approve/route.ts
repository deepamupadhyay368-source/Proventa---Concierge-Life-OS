import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { option } = body;

    const result = await RequestOrchestrator.executeApprovedTask({
      taskId: params.id,
      option,
      userId: user.id,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[POST /api/tasks/[id]/approve]', error);
    return NextResponse.json({ error: error.message || 'Approval execution failed' }, { status: 500 });
  }
}
