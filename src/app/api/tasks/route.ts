import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { checkAndConsumeEntitlement, attachFreeRequestTaskId, getOrCreateCustomerProfile } from '@/lib/membership/entitlement';
import { trackEvent } from '@/lib/analytics';
import { isAppError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const customerProfile = await getOrCreateCustomerProfile(user);
    if (!customerProfile) return NextResponse.json({ tasks: [] });

    // Lean select projection for high-speed dashboard loading
    const tasks = await db.task.findMany({
      where: { customerId: customerProfile.id },
      select: {
        id: true,
        publicId: true,
        category: true,
        intent: true,
        originalRequest: true,
        priority: true,
        status: true,
        assignedAgent: true,
        vendorName: true,
        budgetAmount: true,
        budgetCurrency: true,
        approvalRequired: true,
        approvalStatus: true,
        executionMethod: true,
        externalReferenceId: true,
        isEscalated: true,
        failedReason: true,
        proposedOptions: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        events: {
          where: {
            eventType: {
              not: 'INTERNAL_NOTE_ADDED',
            },
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            eventType: true,
            actorRole: true,
            message: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const customerProfile = await getOrCreateCustomerProfile(user);

    const body = await req.json();
    const { rawInput, urgency, taskId, sync } = body;

    if (!rawInput && !taskId) {
      return NextResponse.json({ error: 'Request description is required' }, { status: 400 });
    }

    // If creating a brand new task (not refining an existing taskId), verify and consume entitlement
    let isFreeRequest = false;
    if (!taskId) {
      const entitlement = await checkAndConsumeEntitlement(customerProfile.id);

      if (!entitlement.allowed) {
        void trackEvent({
          event: 'membership_gate_shown' as any,
          userId: user.id,
          properties: { reason: entitlement.reason },
        });

        return NextResponse.json(
          {
            error: entitlement.error,
            code: entitlement.code || 'MEMBERSHIP_REQUIRED',
            reason: entitlement.reason || 'FIRST_REQUEST_USED',
            availablePlans: entitlement.availablePlans || ['select', 'private', 'reserve'],
          },
          { status: 402 }
        );
      }

      isFreeRequest = entitlement.isFreeRequest;
      if (isFreeRequest) {
        void trackEvent({
          event: 'first_request_created' as any,
          userId: user.id,
          properties: { rawInputLength: rawInput?.length },
        });
      }
    }

    // Universal Autonomous Discovery & Execution Pipeline:
    // Execute AI understanding, agent routing, and multi-source discovery.
    // Generates up to 5 genuine options, persists them with the task, and returns to client.
    const result = await RequestOrchestrator.processRequest({
      rawInput: rawInput || '',
      customerId: customerProfile.id,
      existingTaskId: taskId,
      urgency,
    });

    if (!taskId && isFreeRequest && result?.task?.id) {
      await attachFreeRequestTaskId(customerProfile.id, result.task.id);
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/tasks error]:', error);
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    return NextResponse.json(
      { error: "We couldn't dispatch your request right now. Please try again.", code: 'DISPATCH_ERROR' },
      { status: 500 }
    );
  }
}
