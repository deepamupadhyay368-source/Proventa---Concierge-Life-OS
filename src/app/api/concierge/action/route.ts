import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge } from '@/lib/auth/session';
import { sendBookingConfirmationEmail, sendExecutionFailureEmail } from '@/lib/email/sender';
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp';
import { isAppError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await requireConcierge();
    const body = await req.json();
    const {
      taskId,
      action,
      notes,
      note,
      metadata,
      message,
      priority: reqPriority,
      externalReference,
      confirmationReference,
      reference,
      targetOperator,
      targetOperatorEmail,
      targetOperatorName,
      question,
      personContacted,
      contactMethod,
      providerResponse,
      hostName,
      amount,
    } = body;

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
    let eventMessage = notes || note || `Concierge operator ${sessionUser.name || sessionUser.email} performed ${action}`;

    const operatorIdentifier = sessionUser.name || sessionUser.email;

    switch (action) {
      case 'CLAIM':
        // Concurrency lock check: prevent overriding if another operator already claimed it
        if (updatedPreferences.assignedOperator && updatedPreferences.assignedOperator !== operatorIdentifier) {
          // Senior Concierge, Manager, or Admin can override/reassign; ordinary concierge blocked
          const isManagerOrSenior = sessionUser.roles.some((r) =>
            ['SUPER_ADMIN', 'FOUNDER', 'ADMIN', 'CONCIERGE_MANAGER', 'SENIOR_CONCIERGE'].includes(r)
          );
          if (!isManagerOrSenior) {
            return NextResponse.json(
              { error: `Task is already claimed by ${updatedPreferences.assignedOperator}. Senior Concierge or Manager permission required to reassign.` },
              { status: 409 }
            );
          }
        }

        eventType = 'OPERATOR_CLAIMED';
        assignedAgent = operatorIdentifier;
        updatedPreferences = {
          ...updatedPreferences,
          assignedOperator: operatorIdentifier,
          assignedOperatorEmail: sessionUser.email,
          claimedAt: new Date().toISOString(),
        };
        eventMessage = `Operator ${operatorIdentifier} took ownership of this request.`;
        if (taskRecord.status === 'REQUESTED' || taskRecord.status === 'QUEUED') {
          updatedStatus = 'UNDERSTANDING';
        }
        break;

      case 'START_WORK':
        updatedStatus = 'EXECUTING';
        eventType = 'CONCIERGE_STARTED_WORK';
        eventMessage = notes || note || `Concierge operator ${operatorIdentifier} started execution on task.`;
        break;

      case 'REASSIGN': {
        const target = targetOperator || targetOperatorName || targetOperatorEmail || metadata?.targetOperator;
        if (!target) {
          return NextResponse.json({ error: 'targetOperator is required for reassignment' }, { status: 400 });
        }
        eventType = 'OPERATOR_REASSIGNED';
        assignedAgent = target;
        const reassignHistory = Array.isArray(updatedPreferences.reassignmentHistory)
          ? [...updatedPreferences.reassignmentHistory]
          : [];
        reassignHistory.push({
          from: updatedPreferences.assignedOperator || 'Unassigned',
          to: target,
          reassignedBy: operatorIdentifier,
          timestamp: new Date().toISOString(),
          reason: notes || note || 'Workload rebalance',
        });

        updatedPreferences = {
          ...updatedPreferences,
          assignedOperator: target,
          assignedOperatorEmail: targetOperatorEmail || target,
          reassignmentHistory: reassignHistory,
        };
        eventMessage = `Task reassigned from ${updatedPreferences.assignedOperator || 'Unassigned'} to ${target} by ${operatorIdentifier}.`;
        break;
      }

      case 'CHANGE_PRIORITY': {
        const newPri = reqPriority || metadata?.priority;
        if (!['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL', 'MEDIUM'].includes(newPri)) {
          return NextResponse.json({ error: 'Valid priority required' }, { status: 400 });
        }
        priority = newPri === 'NORMAL' ? 'MEDIUM' : newPri;
        eventType = 'PRIORITY_CHANGED';
        eventMessage = `Priority adjusted to ${newPri}. ${notes || note || ''}`.trim();
        break;
      }

      case 'CONTACT_PROVIDER': {
        eventType = 'PROVIDER_CONTACTED';
        const contactLogs = Array.isArray(updatedPreferences.humanExecutionLogs)
          ? [...updatedPreferences.humanExecutionLogs]
          : [];
        contactLogs.push({
          id: `log_${Date.now()}`,
          contactMethod: contactMethod || 'PHONE',
          employeeName: operatorIdentifier,
          employeeEmail: sessionUser.email,
          contactedAt: new Date().toISOString(),
          personContacted: personContacted || 'Venue Host',
          actionRequested: 'Availability & Booking',
          providerResponse: providerResponse || notes || note || 'Provider contacted',
          amountQuoted: amount,
        });
        updatedPreferences = {
          ...updatedPreferences,
          humanExecutionLogs: contactLogs,
        };
        eventMessage = `Contacted ${personContacted || 'provider desk'} via ${contactMethod || 'phone'}: ${providerResponse || 'Inquiry made'}`;
        break;
      }

      case 'AWAITING_PROVIDER':
        eventType = 'AWAITING_PROVIDER';
        eventMessage = notes || note || 'Awaiting confirmation or callback from venue maître d\' / dispatch.';
        break;

      case 'ADD_INTERNAL_NOTE':
      case 'ADD_NOTE': {
        eventType = 'INTERNAL_NOTE_ADDED';
        const noteText = note || notes || message;
        if (!noteText) {
          return NextResponse.json({ error: 'Note content is required' }, { status: 400 });
        }
        const existingNotes = Array.isArray(updatedPreferences.internalNotes)
          ? [...updatedPreferences.internalNotes]
          : [];
        existingNotes.push({
          id: `note_${Date.now()}`,
          content: noteText,
          author: operatorIdentifier,
          authorEmail: sessionUser.email,
          createdAt: new Date().toISOString(),
        });
        updatedPreferences = {
          ...updatedPreferences,
          internalNotes: existingNotes,
        };
        eventMessage = `Internal note added by ${operatorIdentifier}`;
        break;
      }

      case 'REQUEST_CUSTOMER_INFO': {
        updatedStatus = 'NEEDS_INFORMATION';
        eventType = 'CUSTOMER_INFO_REQUESTED';
        const infoQuery = question || message || notes || note || 'Clarification needed';
        eventMessage = `Information requested: ${infoQuery}`;
        const comms = Array.isArray(updatedPreferences.communications)
          ? [...updatedPreferences.communications]
          : [];
        comms.push({
          id: `comm_${Date.now()}`,
          type: 'INFO_REQUEST',
          message: infoQuery,
          channel: 'APP_NOTIFICATION',
          sentBy: operatorIdentifier,
          createdAt: new Date().toISOString(),
        });
        updatedPreferences = {
          ...updatedPreferences,
          communications: comms,
        };
        break;
      }

      case 'SEND_CUSTOMER_MESSAGE': {
        eventType = 'CONCIERGE_MESSAGE_SENT';
        const msgText = message || notes || note;
        if (!msgText) {
          return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
        }
        eventMessage = `Message sent to member: ${msgText}`;
        const comms = Array.isArray(updatedPreferences.communications)
          ? [...updatedPreferences.communications]
          : [];
        comms.push({
          id: `comm_${Date.now()}`,
          type: 'DIRECT_MESSAGE',
          message: msgText,
          channel: 'WHATSAPP',
          sentBy: operatorIdentifier,
          createdAt: new Date().toISOString(),
        });
        updatedPreferences = {
          ...updatedPreferences,
          communications: comms,
        };
        break;
      }

      case 'CONFIRM': {
        const ref = confirmationReference || reference || externalReference || metadata?.externalReference || body.ref;
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
            { error: `Synthetic, simulated, or mock reference (${ref}) is strictly prohibited by Proventa Zero-Fabrication Policy. Enter the authentic confirmation reference issued directly by the airline, hotel, restaurant, or merchant.` },
            { status: 400 }
          );
        }

        updatedStatus = 'CONFIRMED';
        isEscalated = false;
        externalReferenceId = ref.trim();
        eventType = 'CONFIRMED_BY_CONCIERGE';
        eventMessage = `Confirmed by Concierge ${operatorIdentifier}. Host: ${hostName || 'Direct Desk'}, Ref: ${externalReferenceId}`;

        // Create Authoritative Booking Record if models exist
        if (taskRecord.customerId && db.city && db.conciergeRequest && db.booking) {
          try {
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
                    hostName,
                    confirmedBy: sessionUser.email,
                    confirmedAt: new Date().toISOString(),
                    amount,
                    notes: notes || note,
                    ...metadata,
                  },
                },
              });
            }
          } catch (bookingErr) {
            console.warn('[concierge/action] Booking model creation skipped/mocked:', bookingErr);
          }
        }

        // Dual-Channel Notification Dispatch
        if (taskRecord.customer?.user?.email) {
          try {
            await sendBookingConfirmationEmail({
              email: taskRecord.customer.user.email,
              name: taskRecord.customer.user.name || 'Valued Member',
              title: taskRecord.intent || taskRecord.originalRequest,
              reference: externalReferenceId,
              vendor: taskRecord.vendorName || metadata?.vendorName || 'Verified Partner Desk',
              notes: notes || note,
              actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in'}/tasks/${taskRecord.id}`,
            });
          } catch (e) {
            console.error('[concierge/action] Confirmation email error:', e);
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
            console.error('[concierge/action] WhatsApp notification error:', e);
          }
        }
        break;
      }

      case 'COMPLETE':
        updatedStatus = 'COMPLETED';
        eventType = 'TASK_COMPLETED_BY_CONCIERGE';
        eventMessage = notes || note || `Task fulfilled and marked complete by ${operatorIdentifier}.`;
        break;

      case 'ESCALATE': {
        const isSenior = sessionUser.roles.some((r) =>
          ['SUPER_ADMIN', 'FOUNDER', 'ADMIN', 'CONCIERGE_MANAGER', 'SENIOR_CONCIERGE'].includes(r)
        );
        isEscalated = true;
        priority = 'CRITICAL';
        eventType = 'TASK_ESCALATED';
        eventMessage = notes || note || body.reason || `Task escalated to Concierge Lead by ${operatorIdentifier}`;
        break;
      }

      case 'FAIL': {
        updatedStatus = 'FAILED';
        failedReason = notes || note || 'Fulfillment could not be completed with verified provider.';
        eventType = 'EXECUTION_FAILED_HUMAN';
        eventMessage = `Task failed by concierge: ${failedReason}`;
        break;
      }

      default:
        break;
    }

    // Persist task updates
    const updateData: any = {
      clientPreferences: updatedPreferences,
      updatedAt: new Date(),
    };

    if (updatedStatus !== undefined) updateData.status = updatedStatus;
    if (isEscalated !== undefined) updateData.isEscalated = isEscalated;
    if (externalReferenceId !== undefined) updateData.externalReferenceId = externalReferenceId;
    if (failedReason !== undefined) updateData.failedReason = failedReason;
    if (priority !== undefined) updateData.priority = priority;
    if (assignedAgent !== undefined) updateData.assignedAgent = assignedAgent;

    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: updateData,
    });

    // Record Event
    if (db.taskEvent) {
      await db.taskEvent.create({
        data: {
          taskId,
          eventType,
          actorRole: sessionUser.roles[0] || 'CONCIERGE',
          message: eventMessage,
          data: {
            operator: sessionUser.email,
            operatorName: sessionUser.name,
            action,
            notes: notes || note,
            ...metadata,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      taskId,
      action,
      status: updatedTask.status,
      assignedOperator: updatedPreferences.assignedOperator || operatorIdentifier,
      reference: externalReferenceId,
      message: 'Operation executed successfully',
    });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    console.error('Concierge Action execution error:', error);
    return NextResponse.json({ error: 'Internal server error while executing concierge action' }, { status: 500 });
  }
}
