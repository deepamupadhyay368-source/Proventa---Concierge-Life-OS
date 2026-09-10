import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateTransition } from '@/lib/orchestration/state-machine';
import { appendTaskEvent } from '@/lib/orchestration/timeline';
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, publicId, externalReferenceId, providerName, confirmedDetails, secret } = body;

    const expectedSecret = process.env.PARTNER_WEBHOOK_SECRET || 'proventa_partner_secret';
    if (secret && secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized webhook caller' }, { status: 401 });
    }

    if (!externalReferenceId) {
      return NextResponse.json({ error: 'externalReferenceId is required' }, { status: 400 });
    }

    const task = await db.task.findFirst({
      where: {
        OR: [
          taskId ? { id: taskId } : {},
          publicId ? { publicId } : {},
        ],
      },
      include: { customer: { include: { user: true } } },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    logger.info({ taskId: task.id, externalReferenceId }, '[PartnerConfirmation] Authentic partner reference received');

    try {
      validateTransition(task.status as any, 'CONFIRMED');
    } catch {
      // Idempotent state pass
    }

    const confirmedTask = await db.task.update({
      where: { id: task.id },
      data: {
        status: 'CONFIRMED',
        externalReferenceId,
        completedAt: new Date(),
        vendorName: providerName || task.vendorName,
      },
    });

    await appendTaskEvent({
      taskId: task.id,
      eventType: 'PARTNER_CONFIRMATION_INGESTED',
      actorRole: 'SYSTEM',
      message: `Partner confirmed booking with Authoritative Reference: ${externalReferenceId}`,
      data: {
        reference: externalReferenceId,
        provider: providerName || task.vendorName,
        confirmedDetails: confirmedDetails || {},
      },
    });

    if (task.requestId && task.customerId) {
      await db.booking.upsert({
        where: { id: task.id },
        update: {
          status: 'CONFIRMED',
          confirmationRef: externalReferenceId,
          details: {
            ...confirmedDetails,
            providerName: providerName || task.vendorName,
            updatedAt: new Date().toISOString(),
          },
        },
        create: {
          id: task.id,
          requestId: task.requestId,
          customerId: task.customerId,
          status: 'CONFIRMED',
          confirmationRef: externalReferenceId,
          details: {
            ...confirmedDetails,
            providerName: providerName || task.vendorName,
            confirmedAt: new Date().toISOString(),
          },
        },
      });
    }

    if (task.customer?.user?.phone) {
      try {
        await sendWhatsAppNotification({
          phone: task.customer.user.phone,
          template: 'BOOKING_CONFIRMED',
          params: {
            name: task.customer.user.name || 'Member',
            details: `${task.intent || 'Your Reservation'} · Ref: ${externalReferenceId}`,
            actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tasks/${task.id}`,
          },
        });
      } catch (e) {
        console.error('[PartnerWebhook] WhatsApp dispatch failed:', e);
      }
    }

    return NextResponse.json({
      success: true,
      taskId: confirmedTask.id,
      publicId: confirmedTask.publicId,
      status: 'CONFIRMED',
      externalReferenceId,
    });
  } catch (err: any) {
    logger.error({ err }, '[PartnerWebhook] Processing error');
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}