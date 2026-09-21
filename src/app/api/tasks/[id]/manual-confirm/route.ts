import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge } from '@/lib/auth/session';
import { isAppError } from '@/lib/errors';
import { validateTransition } from '@/lib/orchestration/state-machine';
import { appendTaskEvent } from '@/lib/orchestration/timeline';
import { sendBookingConfirmationEmail } from '@/lib/email/sender';
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireConcierge();
    const { id: taskId } = await params;
    const body = await req.json();
    const { confirmationRef, notes, vendorName } = body;

    const cleanRef = typeof confirmationRef === 'string' ? confirmationRef.trim() : '';

    if (!cleanRef || cleanRef.length < 2) {
      return NextResponse.json(
        { error: 'Genuine confirmation reference is required. Proventa strictly prohibits fabricated bookings.' },
        { status: 400 }
      );
    }

    const lowerRef = cleanRef.toLowerCase();
    if (['none', 'n/a', 'na', 'null', 'undefined', 'test', 'mock', 'fake', 'simulated'].includes(lowerRef)) {
      return NextResponse.json(
        { error: 'Invalid reference: A real booking reference or confirmation code from the venue is required.' },
        { status: 400 }
      );
    }

    const upperRef = cleanRef.toUpperCase();
    if (
      upperRef.startsWith('PV-') ||
      upperRef.startsWith('PV-AMD-') ||
      upperRef.startsWith('MOCK-') ||
      upperRef.startsWith('DEMO-') ||
      upperRef.startsWith('TEST-') ||
      upperRef.startsWith('FAKE-') ||
      upperRef.includes('SANDBOX')
    ) {
      return NextResponse.json(
        { error: 'Synthetic, simulated, or mock references (e.g. PV-*, MOCK-*, TEST-*, FAKE-*, DEMO-*) are strictly prohibited by Proventa zero-fabrication policy. Enter the authentic confirmation reference issued by the airline, hotel, restaurant, or merchant.' },
        { status: 400 }
      );
    }

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        customer: {
          include: { user: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.status !== 'CONFIRMED') {
      validateTransition(task.status as any, 'CONFIRMED');
    }

    // Ensure a parent ConciergeRequest exists for proper historical and customer booking linkage
    let requestId = task.requestId;
    if (!requestId && task.customerId) {
      const defaultCity = (await db.city.findFirst({ where: { active: true } })) || (await db.city.findFirst());
      if (defaultCity) {
        const count = await db.conciergeRequest.count();
        const newReq = await db.conciergeRequest.create({
          data: {
            customerId: task.customerId,
            cityId: defaultCity.id,
            rawInput: task.originalRequest || task.intent || 'Concierge execution request',
            publicId: `REQ-${(count + 1).toString().padStart(4, '0')}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
            status: 'BOOKED',
          },
        });
        requestId = newReq.id;
      }
    }

    let updatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        status: 'CONFIRMED',
        isEscalated: false,
        requestId: requestId || task.requestId,
        externalReferenceId: cleanRef,
        vendorName: vendorName || task.vendorName,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await appendTaskEvent({
      taskId,
      eventType: 'CONFIRMED_BY_CONCIERGE',
      actorRole: 'CONCIERGE',
      actorId: user.id,
      message: `Confirmed by Concierge ${user.name || user.email || 'Team'}. Vendor Ref: ${cleanRef}`,
      data: {
        confirmationRef: cleanRef,
        vendorName: vendorName || task.vendorName,
        notes,
        confirmedBy: user.email,
        confirmedAt: new Date().toISOString(),
      },
    });

    await appendTaskEvent({
      taskId,
      eventType: 'PROVIDER_CONFIRMED',
      actorRole: 'CONCIERGE',
      actorId: user.id,
      message: `Provider confirmed booking. Confirmation code: ${cleanRef}`,
      data: {
        confirmationRef: cleanRef,
        vendorName: vendorName || task.vendorName,
        confirmedBy: user.email,
        confirmedAt: new Date().toISOString(),
      },
    });

    if (body.andComplete) {
      validateTransition('CONFIRMED', 'COMPLETED');
      updatedTask = await db.task.update({
        where: { id: taskId },
        data: {
          status: 'COMPLETED',
          updatedAt: new Date(),
        },
      });
      await appendTaskEvent({
        taskId,
        eventType: 'TASK_COMPLETED',
        actorRole: 'CONCIERGE',
        actorId: user.id,
        message: notes ? `Task completed: ${notes}` : `Task completed and fulfilled with reference ${cleanRef}.`,
        data: {
          confirmationRef: cleanRef,
          notes,
        },
      });
    }

    // Create authoritative booking record
    if (task.customerId && (requestId || task.requestId)) {
      await db.booking.create({
        data: {
          requestId: requestId || task.requestId!,
          customerId: task.customerId,
          status: 'CONFIRMED',
          confirmationRef: cleanRef,
          details: {
            taskIntent: task.intent || task.originalRequest,
            vendorName: vendorName || task.vendorName || 'Verified Partner',
            confirmedBy: user.name || user.email || 'Concierge Desk',
            notes,
            confirmedAt: new Date().toISOString(),
          },
          bookedAt: new Date(),
          confirmedAt: new Date(),
        },
      });
    }

    // Customer Notification: Email
    if (task.customer?.user?.email) {
      try {
        await sendBookingConfirmationEmail({
          email: task.customer.user.email,
          name: task.customer.user.name || 'Valued Member',
          title: task.intent || task.originalRequest,
          reference: cleanRef,
          vendor: vendorName || task.vendorName || 'Verified Partner Desk',
          notes,
          actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in'}/tasks/${taskId}`,
        });
      } catch (emailErr) {
        console.error('[manual-confirm] Confirmation email error:', emailErr);
      }
    }

    // Customer Notification: WhatsApp
    if (task.customer?.user?.phone) {
      try {
        await sendWhatsAppNotification({
          phone: task.customer.user.phone,
          template: 'BOOKING_CONFIRMED',
          params: {
            name: task.customer.user.name || 'Member',
            details: `${task.intent || 'Your reservation'} with ${vendorName || task.vendorName || 'Verified Partner'}`,
            actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in'}/tasks/${taskId}`,
          },
        });
      } catch (waErr) {
        console.error('[manual-confirm] WhatsApp notification error:', waErr);
      }
    }

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('[POST /api/tasks/[id]/manual-confirm]', error);
    return NextResponse.json({ error: error.message || 'Manual confirmation failed' }, { status: 500 });
  }
}

