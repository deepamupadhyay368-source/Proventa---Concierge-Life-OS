import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge } from '@/lib/auth/session';
import { ConciergeOperationsService } from '@/lib/concierge/service';
import { isAppError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const sessionUser = await requireConcierge();
    const resolvedParams = await Promise.resolve(params);
    const taskId = resolvedParams.id;

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        customer: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: `Task ${taskId} not found` }, { status: 404 });
    }

    const prefs = (task.clientPreferences as Record<string, any>) || {};
    const sla = ConciergeOperationsService.calculateSLA(task);
    const brief = ConciergeOperationsService.generateBrief(task, task.customer?.user);
    const providerContact = ConciergeOperationsService.resolveProviderContact(task.vendorName, task.category);

    // Fetch customer history counts
    const [activeCount, completedCount] = await Promise.all([
      db.task.count({ where: { customerId: task.customerId, status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
      db.task.count({ where: { customerId: task.customerId, status: 'COMPLETED' } }),
    ]);

    // Parse approval history batches
    const batchHistory = Array.isArray(prefs.batchHistory) ? prefs.batchHistory : [];
    const approvedOption = prefs.approvedOption || (Array.isArray(task.proposedOptions) ? task.proposedOptions[0] : null);

    // Extract internal notes and communication events from task timeline
    const internalNotes = task.events
      .filter((e) => e.eventType === 'INTERNAL_NOTE_ADDED' || e.eventType === 'CONCIERGE_NOTE_ADDED')
      .map((e) => {
        const data = (e.data as Record<string, any>) || {};
        return {
          id: e.id,
          authorName: data.operator || e.actorRole,
          authorEmail: data.operator || '',
          content: e.message,
          createdAt: e.createdAt.toISOString(),
        };
      });

    const communications = task.events
      .filter((e) =>
        ['CONCIERGE_MESSAGE_SENT', 'CUSTOMER_INFO_REQUESTED', 'USER_REPLIED', 'CONFIRMED', 'AWAITING_CONCIERGE_CALL'].includes(e.eventType)
      )
      .map((e) => {
        const isCustomer = e.actorRole === 'CUSTOMER';
        return {
          id: e.id,
          direction: isCustomer ? ('INBOUND' as const) : ('OUTBOUND' as const),
          channel: 'IN_APP' as const,
          sender: isCustomer ? (task.customer?.user?.name || 'Member') : 'Proventa Concierge',
          message: e.message,
          createdAt: e.createdAt.toISOString(),
          deliveryStatus: 'DELIVERED',
        };
      });

    const formattedEvents = task.events.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      actorRole: e.actorRole,
      message: e.message,
      data: e.data,
      createdAt: e.createdAt.toISOString(),
    }));

    const workspaceData = {
      id: task.id,
      publicId: task.publicId,
      category: task.category,
      subcategory: task.subcategory,
      intent: task.intent,
      originalRequest: task.originalRequest,
      priority: task.priority,
      status: task.status,
      isEscalated: task.isEscalated,
      assignedAgent: task.assignedAgent,
      assignedOperator: prefs.assignedOperator || null,
      claimedAt: prefs.claimedAt || null,
      slaStatus: sla.status,
      waitingMinutes: sla.waitingMinutes,
      budgetAmount: task.budgetAmount,
      budgetCurrency: task.budgetCurrency,
      externalReferenceId: task.externalReferenceId,
      failedReason: task.failedReason,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
      deadline: task.deadline ? task.deadline.toISOString() : null,

      customer: {
        id: task.customer?.id || task.customerId,
        userId: task.customer?.user?.id || '',
        name: task.customer?.user?.name || 'Valued Member',
        email: task.customer?.user?.email || '',
        phone: task.customer?.user?.phone || null,
        city: task.customer?.city || null,
        membershipTier: 'FOUNDING_MEMBER',
        preferences: prefs,
        activeTasksCount: activeCount,
        completedTasksCount: completedCount,
      },

      brief,
      providerContact,

      approvalHistory: {
        batches: batchHistory,
        approvedOption,
      },

      events: formattedEvents,
      internalNotes,
      communications,
    };

    return NextResponse.json({
      success: true,
      task: workspaceData,
      currentUser: {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        roles: sessionUser.roles,
      },
    });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error?.name === 'AuthorizationError' || error?.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized: Concierge access required' }, { status: 403 });
    }
    return NextResponse.json({ error: error?.message || 'Failed to fetch task workspace data' }, { status: 500 });
  }
}
