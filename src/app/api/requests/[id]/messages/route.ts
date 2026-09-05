import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { sendMessageSchema } from '@/lib/validation/schemas';
import { trackEvent } from '@/lib/analytics';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: requestId } = await params;

    const request = await db.conciergeRequest.findUnique({
      where: { id: requestId },
      include: { customer: true },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const isCustomer = request.customer.userId === user.id;
    const isConciergeOrAdmin = user.roles.some((r) => ['CONCIERGE', 'CONCIERGE_MANAGER', 'ADMIN'].includes(r));

    if (!isCustomer && !isConciergeOrAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const messages = await db.requestMessage.findMany({
      where: {
        requestId,
        deletedAt: null,
        ...(isCustomer ? { isInternal: false } : {}),
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        attachments: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ messages });
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
    const { id: requestId } = await params;
    const body = await req.json();

    const request = await db.conciergeRequest.findUnique({
      where: { id: requestId },
      include: { customer: true },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const isCustomer = request.customer.userId === user.id;
    const isConcierge = user.roles.some((r) => ['CONCIERGE', 'CONCIERGE_MANAGER', 'ADMIN'].includes(r));

    if (!isCustomer && !isConcierge) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const senderRole = isCustomer ? 'CUSTOMER' : 'CONCIERGE';

    const message = await db.requestMessage.create({
      data: {
        requestId,
        senderId: user.id,
        senderRole,
        content: body.content,
        type: body.type || 'TEXT',
        isInternal: body.isInternal === true && isConcierge ? true : false,
        metadata: body.metadata || null,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    if (isCustomer && request.status === 'NEEDS_INFORMATION') {
      await db.conciergeRequest.update({
        where: { id: requestId },
        data: { status: 'UNDERSTANDING' },
      });
    }

    void trackEvent({
      event: 'message_received',
      userId: user.id,
      properties: { requestId, role: senderRole },
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 500 });
  }
}
