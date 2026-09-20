import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { isAppError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const customerProfile = await db.customerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!customerProfile) return NextResponse.json({ tasks: [] });

    // Lean select projection for high-speed dashboard loading
    const tasks = await db.task.findMany({
      where: { customerId: customerProfile.id },
      select: {
        id: true,
        publicId: true,
        category: true,
        intent: true,
        originalRequest: true,
        priority: true,
        status: true,
        assignedAgent: true,
        vendorName: true,
        budgetAmount: true,
        budgetCurrency: true,
        approvalRequired: true,
        approvalStatus: true,
        executionMethod: true,
        externalReferenceId: true,
        isEscalated: true,
        failedReason: true,
        proposedOptions: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        events: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            eventType: true,
            actorRole: true,
            message: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
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
    const { rawInput, urgency, taskId, sync } = body;

    if (!rawInput && !taskId) {
      return NextResponse.json({ error: 'Request description is required' }, { status: 400 });
    }

    // Synchronous execution path (for tests or callers requesting instant option generation)
    if (sync === true || taskId) {
      const result = await RequestOrchestrator.processRequest({
        rawInput: rawInput || '',
        customerId: customerProfile.id,
        existingTaskId: taskId,
        urgency,
      });
      return NextResponse.json(result, { status: 201 });
    }

    // Fast Human-First Concierge Execution Path:
    // 1. Create and persist the task immediately in Postgres (<150ms).
    // 2. Return 201 with the persisted task record so the client UI updates without blocking.
    // 3. Continue AI understanding and agent proposal search in background.
    const initialTask = await RequestOrchestrator.createInitialTask({
      rawInput: rawInput || '',
      customerId: customerProfile.id,
      urgency,
    });

    // Detached background refinement
    RequestOrchestrator.processRequest({
      rawInput: rawInput || '',
      customerId: customerProfile.id,
      existingTaskId: initialTask.id,
      urgency,
    }).catch((bgError) => {
      console.warn('[POST /api/tasks background error, routed to human concierge]:', bgError?.message || bgError);
      // Ensure task remains visible to concierge operators
      db.task.update({
        where: { id: initialTask.id },
        data: {
          status: 'NEEDS_HUMAN',
          isEscalated: true,
          executionMethod: 'HUMAN_CONCIERGE',
          failedReason: 'Routed to Senior Concierge Desk for direct human coordination.',
        },
      }).catch(() => {});
    });

    return NextResponse.json({ task: initialTask, options: [] }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/tasks]', error);
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error.message || 'Failed to process task' }, { status: 500 });
  }
}
