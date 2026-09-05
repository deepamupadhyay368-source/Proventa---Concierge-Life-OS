import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { supportTicketSchema } from '@/lib/validation/schemas';
import { trackEvent } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = supportTicketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { subject, description, requestId } = parsed.data;

    const ticket = await db.supportTicket.create({
      data: {
        customerId: user.id,
        requestId: requestId || null,
        subject,
        description,
        status: 'OPEN',
      },
    });

    void trackEvent({
      event: 'support_ticket_created',
      userId: user.id,
      properties: { ticketId: ticket.id, subject },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 500 });
  }
}
