import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge } from '@/lib/auth/session';
import { assertValidTransition } from '@/lib/workflow/state-machine';
import { trackEvent } from '@/lib/analytics';
import { createAuditLog } from '@/lib/audit';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireConcierge();
    const { id: requestId } = await params;
    const { status, note } = await req.json();

    const request = await db.conciergeRequest.findUnique({
      where: { id: requestId },
      include: { customer: true },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    assertValidTransition(request.status, status);

    const updateData: any = { status };
    if (status === 'COMPLETED') updateData.completedAt = new Date();
    if (status === 'CANCELLED') updateData.cancelledAt = new Date();

    await db.$transaction([
      db.conciergeRequest.update({
        where: { id: requestId },
        data: updateData,
      }),
      db.requestStatusHistory.create({
        data: {
          requestId,
          fromStatus: request.status,
          toStatus: status,
          changedById: user.id,
          note: note || `Status updated to ${status}`,
        },
      }),
      ...(status === 'COMPLETED'
        ? [
            db.notification.create({
              data: {
                userId: request.customer.userId,
                type: 'REQUEST_COMPLETED',
                title: 'Request Completed',
                body: 'Your request has been completed. We would love your feedback.',
                actionUrl: `/requests/${requestId}`,
              },
            }),
          ]
        : []),
    ]);

    if (status === 'COMPLETED') {
      void trackEvent({
        event: 'request_completed',
        userId: request.customer.userId,
        properties: { requestId },
      });
    }

    void createAuditLog({
      actorId: user.id,
      action: 'UPDATE',
      resourceType: 'ConciergeRequest',
      resourceId: requestId,
      after: { status },
    });

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 500 });
  }
}
