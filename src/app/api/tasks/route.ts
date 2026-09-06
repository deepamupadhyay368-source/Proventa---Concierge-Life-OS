import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const customerProfile = await db.customerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!customerProfile) return NextResponse.json({ tasks: [] });

    const tasks = await db.task.findMany({
      where: { customerId: customerProfile.id },
      include: {
        events: { orderBy: { createdAt: 'desc' }, take: 15 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    let customerProfile = await db.customerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!customerProfile) {
      customerProfile = await db.customerProfile.create({
        data: { userId: user.id, city: 'Ahmedabad' },
      });
    }

    const body = await req.json();
    const { rawInput, urgency, taskId } = body;

    if (!rawInput && !taskId) {
      return NextResponse.json({ error: 'Request description is required' }, { status: 400 });
    }

    const result = await RequestOrchestrator.processRequest({
      rawInput: rawInput || '',
      customerId: customerProfile.id,
      existingTaskId: taskId,
      urgency,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/tasks]', error);
    return NextResponse.json({ error: error.message || 'Failed to process task' }, { status: 500 });
  }
}
