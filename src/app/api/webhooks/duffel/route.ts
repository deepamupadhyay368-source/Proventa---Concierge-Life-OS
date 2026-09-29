/**
 * PROVENTA — DUFFEL WEBHOOKS ROUTE
 * Receives and processes real-time asynchronous event dispatches from Duffel API.
 * Strictly verifies HMAC-SHA256 signatures via `Duffel-Signature` header.
 * Idempotently updates tasks, timeline events, and customer folios.
 */

import { NextRequest, NextResponse } from 'next/server';
import { duffelClient } from '@/lib/orchestration/adapters/duffel-client';
import { db } from '@/lib/db';
import { appendTaskEvent } from '@/lib/orchestration/timeline';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('duffel-signature');

    // 1. Signature Verification
    const isValid = duffelClient.verifyWebhookSignature(rawBody, signatureHeader);
    if (!isValid) {
      logger.warn({ signatureHeader }, '[DuffelWebhook] Invalid or missing webhook signature');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const eventType = event.type || event.event;
    const eventData = event.data || {};
    const eventId = event.id || `evt_${Date.now()}`;

    logger.info({ eventType, eventId }, '[DuffelWebhook] Processing verified event');

    // 2. Event Dispatching
    switch (eventType) {
      // ----------------------------------------------------
      // FLIGHTS: ORDER CREATED / CONFIRMED
      // ----------------------------------------------------
      case 'order.created': {
        const orderId = eventData.id;
        const bookingRef = eventData.booking_reference;

        if (orderId || bookingRef) {
          // Find matching task by external reference or clientPreferences.duffelOrderId
          const task = await db.task.findFirst({
            where: {
              OR: [
                { externalReferenceId: bookingRef },
                { externalReferenceId: orderId },
              ],
            },
          });

          if (task) {
            await appendTaskEvent({
              taskId: task.id,
              eventType: 'PROVIDER_CONFIRMED',
              actorRole: 'SYSTEM',
              message: `Duffel verified flight order confirmed. Airline PNR: ${bookingRef || orderId}.`,
              data: { orderId, bookingRef, eventId },
            });
          }
        }
        break;
      }

      // ----------------------------------------------------
      // FLIGHTS: ORDER CANCELLED
      // ----------------------------------------------------
      case 'order.cancelled': {
        const orderId = eventData.id;
        const bookingRef = eventData.booking_reference;

        const task = await db.task.findFirst({
          where: {
            OR: [
              { externalReferenceId: bookingRef },
              { externalReferenceId: orderId },
            ],
          },
        });

        if (task && task.status !== 'CANCELLED') {
          await db.task.update({
            where: { id: task.id },
            data: { status: 'CANCELLED' },
          });

          await appendTaskEvent({
            taskId: task.id,
            eventType: 'TASK_CANCELLED',
            actorRole: 'SYSTEM',
            message: `Flight order ${bookingRef || orderId} cancelled with airline via Duffel.`,
            data: { orderId, bookingRef, eventId },
          });
        }
        break;
      }

      // ----------------------------------------------------
      // FLIGHTS: AIRLINE INITIATED SCHEDULE CHANGE
      // ----------------------------------------------------
      case 'airline_initiated_change': {
        const orderId = eventData.order_id || eventData.id;
        const task = await db.task.findFirst({
          where: {
            OR: [
              { externalReferenceId: orderId },
            ],
          },
        });

        if (task) {
          await appendTaskEvent({
            taskId: task.id,
            eventType: 'FLIGHT_SCHEDULE_UPDATED',
            actorRole: 'SYSTEM',
            message: 'Airline announced flight schedule modification. Details updated.',
            data: { eventData, eventId },
          });
        }
        break;
      }

      // ----------------------------------------------------
      // STAYS: BOOKING CONFIRMED
      // ----------------------------------------------------
      case 'stays.booking.confirmed': {
        const bookingId = eventData.id;
        const crsRef = eventData.reference || eventData.accommodation_reference;

        const task = await db.task.findFirst({
          where: {
            OR: [
              { externalReferenceId: crsRef },
              { externalReferenceId: bookingId },
            ],
          },
        });

        if (task) {
          await appendTaskEvent({
            taskId: task.id,
            eventType: 'PROVIDER_CONFIRMED',
            actorRole: 'SYSTEM',
            message: `Duffel Stay confirmed at hotel. CRS Reference: ${crsRef || bookingId}.`,
            data: { bookingId, crsRef, eventId },
          });
        }
        break;
      }

      // ----------------------------------------------------
      // STAYS: BOOKING CANCELLED
      // ----------------------------------------------------
      case 'stays.booking.cancelled': {
        const bookingId = eventData.id;
        const crsRef = eventData.reference;

        const task = await db.task.findFirst({
          where: {
            OR: [
              { externalReferenceId: crsRef },
              { externalReferenceId: bookingId },
            ],
          },
        });

        if (task && task.status !== 'CANCELLED') {
          await db.task.update({
            where: { id: task.id },
            data: { status: 'CANCELLED' },
          });

          await appendTaskEvent({
            taskId: task.id,
            eventType: 'TASK_CANCELLED',
            actorRole: 'SYSTEM',
            message: `Hotel booking ${crsRef || bookingId} cancelled.`,
            data: { bookingId, crsRef, eventId },
          });
        }
        break;
      }

      default:
        logger.info({ eventType }, '[DuffelWebhook] Unhandled event type received');
        break;
    }

    return NextResponse.json({ received: true, eventId });
  } catch (err: any) {
    logger.error({ err }, '[DuffelWebhook] Webhook processing failed');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
