import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge } from '@/lib/auth/session';
import { assertValidTransition } from '@/lib/workflow/state-machine';
import { trackEvent } from '@/lib/analytics';
import { createAuditLog } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireConcierge();
    const { id: requestId } = await params;
    const body = await req.json();
    const { providerId, confirmationRef, details, internalNotes } = body;

    if (!confirmationRef || !confirmationRef.trim()) {
      return NextResponse.json({ error: 'Genuine confirmation reference is required. Proventa strictly prohibits fabricated bookings.' }, { status: 400 });
    }

    const request = await db.conciergeRequest.findUnique({
      where: { id: requestId },
      include: { customer: true, approvals: { where: { status: 'APPROVED' }, take: 1 } },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const approvalId = request.approvals[0]?.id || null;

    const booking = await db.booking.create({
      data: {
        requestId,
        approvalId,
        customerId: request.customer.id,
        providerId: providerId || null,
        status: 'CONFIRMED',
        confirmationRef: confirmationRef.trim(),
        details: details || {},
        internalNotes: internalNotes || null,
        bookedAt: new Date(),
        confirmedAt: new Date(),
      },
      include: { provider: true },
    });

    await db.bookingEvent.create({
      data: {
        bookingId: booking.id,
        eventType: 'BOOKING_CONFIRMED',
        actorId: user.id,
        data: { confirmationRef, providerId },
      },
    });

    assertValidTransition(request.status, 'BOOKED');

    await db.$transaction([
      db.conciergeRequest.update({
        where: { id: requestId },
        data: { status: 'BOOKED' },
      }),
      db.requestStatusHistory.create({
        data: {
          requestId,
          fromStatus: request.status,
          toStatus: 'BOOKED',
          changedById: user.id,
          note: `Booking confirmed with ref: ${confirmationRef}`,
        },
      }),
      db.requestMessage.create({
        data: {
          requestId,
          senderId: user.id,
          senderRole: 'CONCIERGE',
          content: `Your reservation is confirmed! Reference: ${confirmationRef}. All booking details have been verified.`,
          type: 'BOOKING_CARD',
          metadata: { bookingId: booking.id, confirmationRef, details },
        },
      }),
      db.notification.create({
        data: {
          userId: request.customer.userId,
          type: 'BOOKING_CONFIRMED',
          title: 'Booking Confirmed',
          body: `Your booking with ${booking.provider?.name || 'the provider'} is confirmed (Ref: ${confirmationRef}).`,
          actionUrl: `/requests/${requestId}`,
        },
      }),
    ]);

    void trackEvent({
      event: 'booking_confirmed',
      userId: request.customer.userId,
      properties: { requestId, bookingId: booking.id, confirmationRef },
    });

    void createAuditLog({
      actorId: user.id,
      action: 'BOOKING_CONFIRMED',
      resourceType: 'Booking',
      resourceId: booking.id,
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 500 });
  }
}
