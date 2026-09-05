import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge } from '@/lib/auth/session';
import { assertValidTransition } from '@/lib/workflow/state-machine';
import { trackEvent } from '@/lib/analytics';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireConcierge();
    const { id: requestId } = await params;
    const body = await req.json();
    const { title, details, providerId } = body;

    const request = await db.conciergeRequest.findUnique({
      where: { id: requestId },
      include: { customer: true },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    assertValidTransition(request.status, 'OPTIONS_READY');

    const approval = await db.approval.create({
      data: {
        requestId,
        customerId: request.customer.id,
        title: title || 'Recommended Proposal',
        details: { ...details, providerId },
        status: 'PENDING',
      },
    });

    await db.$transaction([
      db.conciergeRequest.update({
        where: { id: requestId },
        data: { status: 'AWAITING_CUSTOMER' },
      }),
      db.requestStatusHistory.create({
        data: {
          requestId,
          fromStatus: request.status,
          toStatus: 'AWAITING_CUSTOMER',
          changedById: user.id,
          note: `Approval card sent: ${title}`,
        },
      }),
      db.requestMessage.create({
        data: {
          requestId,
          senderId: user.id,
          senderRole: 'CONCIERGE',
          content: `We have prepared an option for your approval: "${title}". Please review the proposal card above and click Approve or Request Changes.`,
          type: 'APPROVAL_CARD',
          metadata: { approvalId: approval.id, title, details },
        },
      }),
      db.notification.create({
        data: {
          userId: request.customer.userId,
          type: 'APPROVAL_REQUIRED',
          title: 'Proposal Ready for Approval',
          body: `Your concierge has prepared: "${title}". Tap to review and confirm.`,
          actionUrl: `/requests/${requestId}`,
        },
      }),
    ]);

    void trackEvent({
      event: 'approval_requested',
      userId: request.customer.userId,
      properties: { requestId, approvalId: approval.id },
    });

    return NextResponse.json({ success: true, approval }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 500 });
  }
}
