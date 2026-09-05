import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { approvalResponseSchema } from '@/lib/validation/schemas';
import { assertValidTransition } from '@/lib/workflow/state-machine';
import { createAuditLog } from '@/lib/audit';
import { trackEvent } from '@/lib/analytics';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: requestId } = await params;
    const body = await req.json();

    const parsed = approvalResponseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid response' }, { status: 422 });
    }

    const { approvalId, response, note } = parsed.data;

    const approval = await db.approval.findUnique({
      where: { id: approvalId },
      include: {
        request: { include: { customer: true } },
      },
    });

    if (!approval || approval.requestId !== requestId) {
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 });
    }

    if (approval.request.customer.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to approve this request' }, { status: 403 });
    }

    if (approval.status !== 'PENDING') {
      return NextResponse.json({ error: 'This approval has already been processed.' }, { status: 400 });
    }

    if (response === 'APPROVED') {
      assertValidTransition(approval.request.status, 'APPROVED');

      await db.$transaction([
        db.approval.update({
          where: { id: approvalId },
          data: { status: 'APPROVED', approvedAt: new Date() },
        }),
        db.conciergeRequest.update({
          where: { id: requestId },
          data: { status: 'APPROVED' },
        }),
        db.requestStatusHistory.create({
          data: {
            requestId,
            fromStatus: approval.request.status,
            toStatus: 'APPROVED',
            changedById: user.id,
            note: note || 'Approved by customer',
          },
        }),
        db.requestMessage.create({
          data: {
            requestId,
            senderId: user.id,
            senderRole: 'CUSTOMER',
            content: `✓ Proposal approved. Please proceed with execution. ${note ? `Note: ${note}` : ''}`,
            type: 'TEXT',
          },
        }),
      ]);

      void createAuditLog({
        actorId: user.id,
        action: 'APPROVAL_GIVEN',
        resourceType: 'Approval',
        resourceId: approvalId,
      });
    } else if (response === 'DECLINED') {
      await db.$transaction([
        db.approval.update({
          where: { id: approvalId },
          data: { status: 'DECLINED', declinedAt: new Date() },
        }),
        db.requestMessage.create({
          data: {
            requestId,
            senderId: user.id,
            senderRole: 'CUSTOMER',
            content: `Declined proposed options. ${note ? `Reason: ${note}` : ''}`,
            type: 'TEXT',
          },
        }),
      ]);
      void createAuditLog({
        actorId: user.id,
        action: 'APPROVAL_DECLINED',
        resourceType: 'Approval',
        resourceId: approvalId,
      });
    } else if (response === 'CHANGED') {
      await db.$transaction([
        db.approval.update({
          where: { id: approvalId },
          data: { status: 'CHANGED', changedAt: new Date() },
        }),
        db.conciergeRequest.update({
          where: { id: requestId },
          data: { status: 'CONCIERGE_REVIEW' },
        }),
        db.requestMessage.create({
          data: {
            requestId,
            senderId: user.id,
            senderRole: 'CUSTOMER',
            content: `Requested changes to proposal: ${note || 'Alternative options requested'}`,
            type: 'TEXT',
          },
        }),
      ]);
    }

    void trackEvent({
      event: 'approval_completed',
      userId: user.id,
      properties: { requestId, approvalId, decision: response },
    });

    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process approval' }, { status: 500 });
  }
}
