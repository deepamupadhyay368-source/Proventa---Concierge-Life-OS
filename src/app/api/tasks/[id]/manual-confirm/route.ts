import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge } from '@/lib/auth/session';
import { validateTransition } from '@/lib/orchestration/state-machine';
import { appendTaskEvent } from '@/lib/orchestration/timeline';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireConcierge();
    const taskId = params.id;
    const body = await req.json();
    const { confirmationRef, notes, vendorName } = body;

    if (!confirmationRef || !confirmationRef.trim()) {
      return NextResponse.json(
        { error: 'Genuine confirmation reference is required. Proventa strictly prohibits fabricated bookings.' },
        { status: 400 }
      );
    }

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: { customer: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Guard state transition
    validateTransition(task.status as any, 'CONFIRMED');

    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        status: 'CONFIRMED',
        externalReferenceId: confirmationRef.trim(),
        vendorName: vendorName || task.vendorName,
        completedAt: new Date(),
      },
    });

    await appendTaskEvent({
      taskId,
      eventType: 'CONFIRMED_BY_CONCIERGE',
      actorRole: 'CONCIERGE',
      actorId: user.id,
      message: `Confirmed by Concierge ${user.name || 'Team'}. Vendor Ref: ${confirmationRef.trim()}`,
      data: { confirmationRef, notes, confirmedBy: user.email },
    });

    if (task.customerId && task.requestId) {
      await db.booking.create({
        data: {
          requestId: task.requestId,
          customerId: task.customerId,
          status: 'CONFIRMED',
          confirmationRef: confirmationRef.trim(),
          details: {
            taskIntent: task.intent || task.originalRequest,
            vendorName: vendorName || task.vendorName || 'Verified Partner',
            confirmedBy: user.name || 'Concierge Desk',
            notes,
            confirmedAt: new Date().toISOString(),
          },
        },
      });
    }

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error: any) {
    console.error('[POST /api/tasks/[id]/manual-confirm]', error);
    return NextResponse.json({ error: error.message || 'Manual confirmation failed' }, { status: 500 });
  }
}
