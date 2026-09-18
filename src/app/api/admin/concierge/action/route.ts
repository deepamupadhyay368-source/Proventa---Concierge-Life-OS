import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await requireSuperAdmin();
    const body = await req.json();
    const { taskId, action, notes, metadata } = body;

    if (!taskId || !action) {
      return NextResponse.json({ error: 'taskId and action are required' }, { status: 400 });
    }

    const taskRecord = await db.task.findUnique({
      where: { id: taskId },
      include: { customer: { include: { user: true } } },
    });

    if (!taskRecord) {
      return NextResponse.json({ error: `Task ${taskId} not found` }, { status: 404 });
    }

    let updatedStatus: any = undefined;
    let isEscalated: boolean | undefined = undefined;
    let externalReferenceId: string | undefined = undefined;
    let failedReason: string | undefined = undefined;
    let eventType = `CONCIERGE_ACTION_${action}`;
    let eventMessage = notes || `Concierge operator ${sessionUser.email} performed ${action}`;

    switch (action) {
      case 'CLAIM':
        eventType = 'OPERATOR_CLAIMED';
        eventMessage = `Operator ${sessionUser.email} claimed task.`;
        break;

      case 'CONTACT_PROVIDER':
        eventType = 'PROVIDER_CONTACTED';
        eventMessage = notes || `Outreach initiated to vendor desk for ${taskRecord.vendorName || 'venue'}.`;
        break;

      case 'ADD_NOTE':
        eventType = 'CONCIERGE_NOTE_ADDED';
        eventMessage = notes || 'Operator added internal notes.';
        break;

      case 'REQUEST_CUSTOMER_INFO':
        updatedStatus = 'NEEDS_INFORMATION';
        eventType = 'CUSTOMER_INFO_REQUESTED';
        eventMessage = notes || 'Additional clarification requested from member.';
        break;

      case 'AWAITING_PROVIDER':
        eventType = 'AWAITING_PROVIDER';
        eventMessage = notes || 'Awaiting confirmation or callback from venue maître d\' / dispatch.';
        break;

      case 'CONFIRM': {
        const ref = metadata?.externalReference || body.externalReference;
        if (!ref || typeof ref !== 'string' || !ref.trim()) {
          return NextResponse.json(
            { error: 'Genuine external confirmation reference is mandatory to confirm a booking.' },
            { status: 400 }
          );
        }

        // Strict zero-fabrication validation
        const upperRef = ref.trim().toUpperCase();
        if (
          upperRef.startsWith('PV-') ||
          upperRef.startsWith('PV-AMD-') ||
          upperRef.startsWith('MOCK-') ||
          upperRef.startsWith('DEMO-') ||
          upperRef.includes('SANDBOX')
        ) {
          return NextResponse.json(
            { error: 'Synthetic, simulated, or mock references (e.g. PV-*, MOCK-*) are strictly prohibited by Proventa zero-fabrication policy.' },
            { status: 400 }
          );
        }

        updatedStatus = 'CONFIRMED';
        isEscalated = false;
        externalReferenceId = ref.trim();
        eventType = 'CONFIRMED_BY_CONCIERGE';
        eventMessage = `Confirmed by Senior Concierge ${sessionUser.name || sessionUser.email}. Vendor Ref: ${externalReferenceId}`;

        // Authoritative Booking creation
        if (taskRecord.customerId) {
          let reqId = taskRecord.requestId;
          if (!reqId) {
            const defaultCity = await db.city.findFirst({ where: { active: true } });
            if (defaultCity) {
              const count = await db.conciergeRequest.count();
              const newReq = await db.conciergeRequest.create({
                data: {
                  customerId: taskRecord.customerId,
                  cityId: defaultCity.id,
                  rawInput: taskRecord.originalRequest || taskRecord.intent || 'Concierge execution request',
                  publicId: `REQ-${(count + 1).toString().padStart(4, '0')}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
                  status: 'BOOKED',
                },
              });
              reqId = newReq.id;
              await db.task.update({
                where: { id: taskRecord.id },
                data: { requestId: reqId },
              });
            }
          }

          if (reqId) {
            await db.booking.create({
              data: {
                requestId: reqId,
                customerId: taskRecord.customerId,
                status: 'CONFIRMED',
                confirmationRef: externalReferenceId,
                details: {
                  title: taskRecord.intent,
                  vendorName: taskRecord.vendorName || metadata?.vendorName || 'Verified Partner',
                  confirmedBy: sessionUser.email,
                  confirmedAt: new Date().toISOString(),
                  notes,
                  ...metadata,
                },
              },
            });
          }
        }
        break;
      }

      case 'FAIL':
        updatedStatus = 'FAILED';
        isEscalated = false;
        failedReason = notes || 'Unable to fulfill request with partner venue.';
        eventType = 'TASK_FAILED_BY_CONCIERGE';
        eventMessage = failedReason;
        break;

      case 'ESCALATE':
        updatedStatus = 'NEEDS_HUMAN';
        isEscalated = true;
        eventType = 'TASK_ESCALATED_BY_CONCIERGE';
        eventMessage = notes || 'Escalated to Lead Concierge for senior intervention.';
        break;

      case 'COMPLETE':
        updatedStatus = 'COMPLETED';
        isEscalated = false;
        eventType = 'TASK_COMPLETED_BY_CONCIERGE';
        eventMessage = notes || 'Task successfully fulfilled and verified by concierge desk.';
        break;

      case 'CALL_COMPLETED':
      case 'RESOLVE_ESCALATION':
        updatedStatus = 'EXECUTING';
        isEscalated = false;
        break;

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        ...(updatedStatus ? { status: updatedStatus } : {}),
        ...(isEscalated !== undefined ? { isEscalated } : {}),
        ...(externalReferenceId ? { externalReferenceId, completedAt: new Date() } : {}),
        ...(failedReason ? { failedReason } : {}),
        updatedAt: new Date(),
      },
    });

    // Create event log in timeline
    await db.taskEvent.create({
      data: {
        taskId,
        eventType,
        actorRole: 'CONCIERGE',
        message: eventMessage,
        data: {
          operator: sessionUser.email,
          action,
          notes,
          metadata,
          externalReferenceId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTask,
    });
  } catch (error: any) {
    if (error?.name === 'AuthorizationError' || error?.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized: SUPER_ADMIN required' }, { status: 403 });
    }
    if (error?.name === 'AuthenticationError' || error?.message?.includes('Authentication')) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    return NextResponse.json({ error: error?.message || 'Failed to execute concierge action' }, { status: 500 });
  }
}
