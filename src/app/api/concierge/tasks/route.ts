import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge } from '@/lib/auth/session';
import { ConciergeOperationsService } from '@/lib/concierge/service';
import { isAppError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await requireConcierge();
    const { searchParams } = new URL(req.url);

    const queueFilter = searchParams.get('filter') || 'all';
    const category = searchParams.get('category') || '';
    const priority = searchParams.get('priority') || '';
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const assigned = searchParams.get('assigned') || 'all'; // 'all' | 'me' | 'unassigned'

    // Build base query
    const where: any = {};

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }
    if (priority) {
      where.priority = priority;
    }

    // Queue tab filters
    switch (queueFilter.toLowerCase()) {
      case 'new':
        where.status = { in: ['REQUESTED', 'UNDERSTANDING'] };
        break;
      case 'unassigned':
        where.assignedAgent = { not: sessionUser.email };
        where.clientPreferences = {
          path: ['assignedOperator'],
          equals: null,
        };
        break;
      case 'my_tasks':
        where.OR = [
          { assignedAgent: sessionUser.name || sessionUser.email },
          { clientPreferences: { path: ['assignedOperator'], equals: sessionUser.name || sessionUser.email } },
        ];
        break;
      case 'in_progress':
      case 'executing':
        where.status = { in: ['EXECUTING', 'VERIFYING'] };
        break;
      case 'waiting_customer':
        where.status = 'NEEDS_INFORMATION';
        break;
      case 'waiting_provider':
        where.status = { in: ['NEEDS_HUMAN', 'EXECUTING'] };
        where.events = { some: { eventType: 'AWAITING_PROVIDER' } };
        break;
      case 'awaiting_approval':
        where.status = 'AWAITING_APPROVAL';
        break;
      case 'ready_to_execute':
        where.status = 'APPROVED';
        break;
      case 'escalated':
        where.isEscalated = true;
        break;
      case 'completed':
        where.status = { in: ['COMPLETED', 'CONFIRMED'] };
        break;
      default:
        break;
    }

    if (assigned === 'me') {
      where.OR = [
        { assignedAgent: sessionUser.name || sessionUser.email },
        { clientPreferences: { path: ['assignedOperator'], equals: sessionUser.name || sessionUser.email } },
      ];
    } else if (assigned === 'unassigned') {
      where.clientPreferences = {
        path: ['assignedOperator'],
        equals: null,
      };
    }

    const tasksRaw = await db.task.findMany({
      where,
      include: {
        customer: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
        events: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
      take: 100,
    });

    // Compute SLA and format items
    const formattedTasks = tasksRaw
      .map((t) => {
        const sla = ConciergeOperationsService.calculateSLA(t);
        const prefs = (t.clientPreferences as Record<string, any>) || {};
        const customerName = t.customer?.user?.name || 'Valued Member';
        const customerEmail = t.customer?.user?.email || '';
        const customerPhone = t.customer?.user?.phone || '';

        return {
          id: t.id,
          publicId: t.publicId,
          category: t.category,
          intent: t.intent,
          originalRequest: t.originalRequest,
          priority: t.priority,
          status: t.status,
          isEscalated: t.isEscalated,
          executionMethod: t.executionMethod,
          assignedAgent: t.assignedAgent,
          assignedOperator: prefs.assignedOperator || null,
          claimedAt: prefs.claimedAt || null,
          budgetAmount: t.budgetAmount,
          budgetCurrency: t.budgetCurrency,
          externalReferenceId: t.externalReferenceId,
          failedReason: t.failedReason,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          completedAt: t.completedAt ? t.completedAt.toISOString() : null,
          slaStatus: sla.status,
          waitingMinutes: sla.waitingMinutes,
          customerName,
          customerEmail,
          customerPhone,
          latestEvent: t.events[0]
            ? {
                id: t.events[0].id,
                eventType: t.events[0].eventType,
                actorRole: t.events[0].actorRole,
                message: t.events[0].message,
                createdAt: t.events[0].createdAt.toISOString(),
              }
            : null,
        };
      })
      .filter((t) => {
        if (!search) return true;
        return (
          t.publicId.toLowerCase().includes(search) ||
          t.customerName.toLowerCase().includes(search) ||
          t.customerEmail.toLowerCase().includes(search) ||
          t.intent.toLowerCase().includes(search) ||
          t.originalRequest.toLowerCase().includes(search) ||
          (t.externalReferenceId && t.externalReferenceId.toLowerCase().includes(search))
        );
      });

    // Calculate queue count aggregates
    const [allCount, newCount, inProgressCount, waitingCustomerCount, awaitingApprovalCount, readyCount, completedCount, escalatedCount] = await Promise.all([
      db.task.count(),
      db.task.count({ where: { status: { in: ['REQUESTED', 'UNDERSTANDING'] } } }),
      db.task.count({ where: { status: { in: ['EXECUTING', 'VERIFYING'] } } }),
      db.task.count({ where: { status: 'NEEDS_INFORMATION' } }),
      db.task.count({ where: { status: 'AWAITING_APPROVAL' } }),
      db.task.count({ where: { status: 'APPROVED' } }),
      db.task.count({ where: { status: { in: ['COMPLETED', 'CONFIRMED'] } } }),
      db.task.count({ where: { isEscalated: true } }),
    ]);

    return NextResponse.json({
      success: true,
      tasks: formattedTasks,
      counts: {
        all: allCount,
        new: newCount,
        in_progress: inProgressCount,
        waiting_customer: waitingCustomerCount,
        awaiting_approval: awaitingApprovalCount,
        ready_to_execute: readyCount,
        completed: completedCount,
        escalated: escalatedCount,
      },
      user: {
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
    return NextResponse.json({ error: error?.message || 'Unauthorized' }, { status: 401 });
  }
}
