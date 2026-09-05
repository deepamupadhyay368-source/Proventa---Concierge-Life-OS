import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge } from '@/lib/auth/session';
import { trackEvent } from '@/lib/analytics';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await requireConcierge();
    const { requestId, conciergeUserId } = await req.json();

    const targetUserId = conciergeUserId || user.id;

    let agent = await db.conciergeAgent.findUnique({
      where: { userId: targetUserId },
    });

    if (!agent) {
      agent = await db.conciergeAgent.create({
        data: {
          userId: targetUserId,
          isOnline: true,
          activeRequestsCount: 1,
        },
      });
    }

    // Unassign existing active assignments on this request
    await db.requestAssignment.updateMany({
      where: { requestId, unassignedAt: null },
      data: { unassignedAt: new Date() },
    });

    // Create new assignment
    const assignment = await db.requestAssignment.create({
      data: {
        requestId,
        conciergeId: agent.id,
        assignedBy: user.id,
      },
    });

    await db.conciergeRequest.update({
      where: { id: requestId },
      data: { assignedToId: agent.id },
    });

    void trackEvent({
      event: 'concierge_assigned',
      userId: user.id,
      properties: { requestId, conciergeId: agent.id },
    });

    void createAuditLog({
      actorId: user.id,
      action: 'UPDATE',
      resourceType: 'ConciergeRequest',
      resourceId: requestId,
      after: { assignedTo: agent.id },
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}
