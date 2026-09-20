import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireConcierge();

    const { searchParams } = new URL(req.url);
    const tab = searchParams.get('tab') || 'all';
    const category = searchParams.get('category') || '';
    const priority = searchParams.get('priority') || '';
    const search = searchParams.get('search') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Fetch lean tasks with essential fields only
    const tasks = await db.task.findMany({
      select: {
        id: true,
        publicId: true,
        category: true,
        intent: true,
        originalRequest: true,
        priority: true,
        status: true,
        isEscalated: true,
        executionMethod: true,
        assignedAgent: true,
        vendorName: true,
        budgetAmount: true,
        budgetCurrency: true,
        clientPreferences: true,
        externalReferenceId: true,
        failedReason: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        customer: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        events: {
          take: 3,
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
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    // Compute category counts & queue buckets
    const counts = {
      total: tasks.length,
      all: tasks.length,
      new: 0,
      in_progress: 0,
      waiting_customer: 0,
      waiting_provider: 0,
      awaiting_approval: 0,
      ready_to_execute: 0,
      completed: 0,
      escalated: 0,
    };

    const formattedTasks = tasks.map((t) => {
      const prefs = (t.clientPreferences as Record<string, any>) || {};
      const assignedOperator = prefs.assignedOperator || (t.assignedAgent?.includes('@') ? t.assignedAgent : null);
      const isCallReq = t.events.some((e) => e.eventType === 'AWAITING_CONCIERGE_CALL');

      // Determine queue bucket
      let queue = 'in_progress';
      if (t.isEscalated || t.status === 'NEEDS_HUMAN') {
        queue = 'escalated';
        counts.escalated++;
      } else if (['REQUESTED', 'UNDERSTANDING', 'QUEUED'].includes(t.status)) {
        queue = 'new';
        counts.new++;
      } else if (['NEEDS_INFORMATION'].includes(t.status)) {
        queue = 'waiting_customer';
        counts.waiting_customer++;
      } else if (isCallReq || t.events.some((e) => e.eventType === 'AWAITING_PROVIDER')) {
        queue = 'waiting_provider';
        counts.waiting_provider++;
      } else if (['AWAITING_APPROVAL', 'OPTIONS_READY'].includes(t.status)) {
        queue = 'awaiting_approval';
        counts.awaiting_approval++;
      } else if (['APPROVED'].includes(t.status)) {
        queue = 'ready_to_execute';
        counts.ready_to_execute++;
      } else if (['CONFIRMED', 'COMPLETED'].includes(t.status)) {
        queue = 'completed';
        counts.completed++;
      } else {
        queue = 'in_progress';
        counts.in_progress++;
      }

      const waitingMinutes = Math.max(0, Math.round((now.getTime() - new Date(t.createdAt).getTime()) / (60 * 1000)));

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
        assignedOperator,
        vendorName: t.vendorName,
        budgetAmount: t.budgetAmount,
        budgetCurrency: t.budgetCurrency,
        externalReferenceId: t.externalReferenceId,
        failedReason: t.failedReason,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        completedAt: t.completedAt,
        customerName: t.customer?.user?.name || 'VIP Member',
        customerEmail: t.customer?.user?.email || '',
        customerPhone: t.customer?.user?.phone || '',
        queue,
        waitingMinutes,
        latestEvent: t.events[0] || null,
      };
    });

    // Filter tasks if tab or search parameters specified
    let filtered = formattedTasks;

    if (tab && tab !== 'all') {
      filtered = filtered.filter((t) => t.queue === tab);
    }

    if (category) {
      filtered = filtered.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }

    if (priority) {
      filtered = filtered.filter((t) => t.priority === priority);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.publicId.toLowerCase().includes(q) ||
          t.intent.toLowerCase().includes(q) ||
          t.originalRequest.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.customerEmail.toLowerCase().includes(q) ||
          t.customerPhone.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      tasks: filtered,
      counts,
      totalCount: tasks.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error?.name === 'AuthorizationError' || error?.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized: SUPER_ADMIN required' }, { status: 403 });
    }
    if (error?.name === 'AuthenticationError' || error?.message?.includes('Authentication')) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    return NextResponse.json({ error: error?.message || 'Failed to fetch concierge queue' }, { status: 500 });
  }
}
