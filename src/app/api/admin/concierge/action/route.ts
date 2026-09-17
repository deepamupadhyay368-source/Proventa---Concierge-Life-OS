import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await requireSuperAdmin();
    const body = await req.json();
    const { taskId, action, notes, metadata } = body;

    if (!taskId || !action) {
      return NextResponse.json({ error: 'taskId and action are required' }, { status: 400 });
    }

    let updatedStatus: any = undefined;
    let isEscalated: boolean | undefined = undefined;

    if (action === 'CALL_COMPLETED') {
      updatedStatus = 'EXECUTING';
      isEscalated = false;
    } else if (action === 'RESOLVE_ESCALATION') {
      updatedStatus = 'EXECUTING';
      isEscalated = false;
    } else if (action === 'ESCALATE') {
      updatedStatus = 'NEEDS_HUMAN';
      isEscalated = true;
    }

    const task = await db.task.update({
      where: { id: taskId },
      data: {
        ...(updatedStatus ? { status: updatedStatus } : {}),
        ...(isEscalated !== undefined ? { isEscalated } : {}),
      },
    });

    // Create event log
    await db.taskEvent.create({
      data: {
        taskId,
        eventType: `CONCIERGE_ACTION_${action}`,
        actorRole: 'CONCIERGE',
        message: notes || `Concierge operator ${sessionUser.email} performed ${action}`,
        data: {
          operator: sessionUser.email,
          action,
          notes,
          metadata,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    if (error?.name === 'AuthorizationError' || error?.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized: SUPER_ADMIN required' }, { status: 403 });
    }
    if (error?.name === 'AuthenticationError' || error?.message?.includes('Authentication')) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    return NextResponse.json({ error: error?.message || 'Failed to execute concierge action' }, { status: 500 });
  }
}
