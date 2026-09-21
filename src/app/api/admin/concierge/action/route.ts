import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge, requireSuperAdmin } from '@/lib/auth/session';
import { sendBookingConfirmationEmail } from '@/lib/email/sender';
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp';
import { isAppError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let sessionUser: any;
    try {
      sessionUser = await requireConcierge();
    } catch {
      // ignore
    }
    if (!sessionUser) {
      sessionUser = await requireSuperAdmin();
    }
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
    let priority: any = undefined;
    let proposedOptions: any = undefined;
    let approvalRequired: boolean | undefined = undefined;
    let approvalStatus: any = undefined;
    let updatedPreferences = (taskRecord.clientPreferences as Record<string, any>) || {};
    let assignedAgent: string | undefined = undefined;
    let eventType = `CONCIERGE_ACTION_${action}`;
    let eventMessage = notes || `Concierge operator ${sessionUser.name || sessionUser.email} performed ${action}`;

    switch (action) {
      case 'CLAIM':
        eventType = 'OPERATOR_CLAIMED';
        assignedAgent = sessionUser.name || sessionUser.email;
        updatedPreferences = {
          ...updatedPreferences,
          assignedOperator: sessionUser.name || sessionUser.email,
          claimedAt: new Date().toISOString(),
        };
        eventMessage = `Operator ${sessionUser.name || sessionUser.email} took ownership of this request.`;
        if (taskRecord.status === 'REQUESTED' || taskRecord.status === 'QUEUED') {
          updatedStatus = 'UNDERSTANDING';
        }
        break;

      case 'CHANGE_PRIORITY': {
        const newPri = body.priority || metadata?.priority;
        if (!['LOW', 'NORMAL', 'HIGH', 'URGENT'].includes(newPri)) {
          return NextResponse.json({ error: 'Valid priority required (LOW, NORMAL, HIGH, URGENT)' }, { status: 400 });
        }
        priority = newPri;
        eventType = 'PRIORITY_CHANGED';
        eventMessage = `Priority adjusted to ${newPri}. ${notes || ''}`.trim();
        break;
      }

      case 'CONTACT_PROVIDER':
        eventType = 'PROVIDER_CONTACTED';
        eventMessage = notes || `Outreach initiated to vendor desk for ${taskRecord.vendorName || 'venue'}.`;
        break;

      case 'ADD_NOTE':
        eventType = 'CONCIERGE_NOTE_ADDED';
        eventMessage = notes || 'Operator added notes.';
        break;

      case 'ADD_INTERNAL_NOTE':
        eventType = 'INTERNAL_NOTE_ADDED';
        eventMessage = notes || 'Internal operational note added.';
        break;

      case 'REQUEST_CUSTOMER_INFO':
        updatedStatus = 'NEEDS_INFORMATION';
        eventType = 'CUSTOMER_INFO_REQUESTED';
        eventMessage = notes || 'Additional clarification requested from member.';
        break;

      case 'SEND_CUSTOMER_MESSAGE':
        eventType = 'CONCIERGE_MESSAGE_SENT';
        eventMessage = notes || body.message || 'Message sent to member.';
        break;

      case 'ADD_PROPOSAL': {
        const proposal = metadata?.proposal || body.proposal;
        if (!proposal || !proposal.title) {
          return NextResponse.json({ error: 'Valid proposal with title is required' }, { status: 400 });
        }
        const existing = Array.isArray(taskRecord.proposedOptions) ? (taskRecord.proposedOptions as any[]) : [];
        proposedOptions = [...existing, proposal];
        updatedStatus = 'OPTIONS_READY';
        eventType = 'OPTIONS_FOUND';
        eventMessage = `Option proposed: ${proposal.title} (${proposal.providerName || 'Curated'})`;
        break;
      }

      case 'REQUEST_APPROVAL':
        updatedStatus = 'AWAITING_APPROVAL';
        approvalRequired = true;
        approvalStatus = 'PENDING';
        eventType = 'APPROVAL_REQUESTED';
        eventMessage = notes || 'Option submitted for member confirmation.';
        break;

      case 'READY_TO_EXECUTE':
        updatedStatus = 'APPROVED';
        eventType = 'READY_FOR_EXECUTION';
        eventMessage = notes || 'All parameters verified. Ready for immediate provider booking / ticket issuance.';
        break;

      case 'VERIFY_REFERENCE':
        eventType = 'REFERENCE_VERIFIED';
        eventMessage = notes || `External provider reference ${taskRecord.externalReferenceId || ''} verified with venue maître d' / partner dispatch.`;
        break;

      case 'REOPEN':
        updatedStatus = 'UNDERSTANDING';
        isEscalated = false;
        eventType = 'TASK_REOPENED';
        eventMessage = notes || 'Request reopened by concierge operator for further handling.';
        break;

      case 'AWAITING_PROVIDER':
        eventType = 'AWAITING_PROVIDER';
        eventMessage = notes || 'Awaiting confirmation or callback from venue maître d\' / dispatch.';
        break;

      case 'CONFIRM': {
        const ref =
          metadata?.externalReference ||
          metadata?.reference ||
          body.externalReference ||
          body.reference;
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
          upperRef.startsWith('TEST-') ||
          upperRef.startsWith('FAKE-') ||
          upperRef.includes('SANDBOX') ||
          ['NONE', 'N/A', 'NA', 'NULL', 'UNDEFINED', 'TEST', 'MOCK', 'FAKE', 'SIMULATED'].includes(upperRef)
        ) {
          return NextResponse.json(
            { error: 'Synthetic, simulated, or mock references (e.g. PV-*, MOCK-*, TEST-*) are strictly prohibited by Proventa zero-fabrication policy. Enter the authentic confirmation reference issued by the airline, hotel, restaurant, or merchant.' },
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

        // Send Member Confirmation Notifications
        if (taskRecord.customer?.user?.email) {
          try {
            await sendBookingConfirmationEmail({
              email: taskRecord.customer.user.email,
              name: taskRecord.customer.user.name || 'Valued Member',
              title: taskRecord.intent || taskRecord.originalRequest,
              reference: externalReferenceId,
              vendor: taskRecord.vendorName || metadata?.vendorName || 'Verified Partner Desk',
              notes,
              actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in'}/tasks/${taskRecord.id}`,
            });
          } catch (e) {
            console.error('[admin/concierge/action] Confirmation email error:', e);
          }
        }

        if (taskRecord.customer?.user?.phone) {
          try {
            await sendWhatsAppNotification({
              phone: taskRecord.customer.user.phone,
              template: 'BOOKING_CONFIRMED',
              params: {
                name: taskRecord.customer.user.name || 'Member',
                details: `${taskRecord.intent || 'Your reservation'} with ${taskRecord.vendorName || 'Verified Partner'}`,
                actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in'}/tasks/${taskRecord.id}`,
              },
            });
          } catch (e) {
            console.error('[admin/concierge/action] WhatsApp notification error:', e);
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

      case 'REVIEW':
        eventType = 'CONCIERGE_REVIEWED';
        eventMessage = notes || 'Request placed under active review by Concierge Desk.';
        break;

      case 'VERIFY':
      case 'VERIFY_REFERENCE':
        eventType = 'REFERENCE_VERIFIED';
        eventMessage = notes || `External provider reference ${taskRecord.externalReferenceId || ''} verified with venue maître d' / partner dispatch.`;
        break;

      case 'CANCEL':
        updatedStatus = 'CANCELLED';
        isEscalated = false;
        eventType = 'TASK_CANCELLED';
        eventMessage = notes || 'Task cancelled by concierge operator.';
        break;

      case 'COMPLETE':
        updatedStatus = 'COMPLETED';
        isEscalated = false;
        eventType = 'TASK_COMPLETED';
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
        ...(priority ? { priority } : {}),
        ...(proposedOptions ? { proposedOptions } : {}),
        ...(approvalRequired !== undefined ? { approvalRequired } : {}),
        ...(approvalStatus ? { approvalStatus } : {}),
        ...(assignedAgent ? { assignedAgent } : {}),
        clientPreferences: updatedPreferences,
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

    if (action === 'CONFIRM') {
      await db.taskEvent.create({
        data: {
          taskId,
          eventType: 'PROVIDER_CONFIRMED',
          actorRole: 'CONCIERGE',
          message: `Provider confirmed booking. Reference: ${externalReferenceId}`,
          data: {
            operator: sessionUser.email,
            reference: externalReferenceId,
            confirmedAt: new Date().toISOString(),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedTask,
    });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    if (error?.name === 'AuthorizationError' || error?.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized: Concierge access required' }, { status: 403 });
    }
    if (error?.name === 'AuthenticationError' || error?.message?.includes('Authentication')) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    return NextResponse.json({ error: error?.message || 'Failed to execute concierge action' }, { status: 500 });
  }
}

