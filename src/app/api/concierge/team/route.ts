import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge, requireSeniorConcierge } from '@/lib/auth/session';
import { isAppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await requireConcierge();

    // Fetch all users with employee/concierge roles
    const employees = await db.user.findMany({
      where: {
        userRoles: {
          some: {
            role: {
              in: [
                UserRole.FOUNDER,
                UserRole.SUPER_ADMIN,
                UserRole.ADMIN,
                UserRole.CONCIERGE_MANAGER,
                UserRole.SENIOR_CONCIERGE,
                UserRole.CONCIERGE,
                UserRole.SUPPORT,
                UserRole.FINANCE,
              ],
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        userRoles: { select: { role: true } },
        phone: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    // Fetch active tasks counts by operator
    const activeTasks = await db.task.findMany({
      where: {
        status: { in: ['NEEDS_HUMAN', 'EXECUTING', 'NEEDS_INFORMATION', 'VERIFYING', 'AWAITING_APPROVAL', 'APPROVED'] },
      },
      select: {
        id: true,
        assignedAgent: true,
        clientPreferences: true,
        status: true,
        priority: true,
        isEscalated: true,
      },
    });

    // Calculate workload stats per operator
    const workloadMap: Record<string, { totalActive: number; executing: number; escalated: number; urgent: number }> = {};

    for (const emp of employees) {
      const key = emp.name || emp.email;
      workloadMap[key] = { totalActive: 0, executing: 0, escalated: 0, urgent: 0 };
    }
    workloadMap['UNASSIGNED'] = { totalActive: 0, executing: 0, escalated: 0, urgent: 0 };

    for (const t of activeTasks) {
      const operator = (t.clientPreferences as any)?.assignedOperator || t.assignedAgent;
      let matchedKey = 'UNASSIGNED';

      if (operator && workloadMap[operator]) {
        matchedKey = operator;
      } else if (operator) {
        // Find matching employee by name or email
        const empMatch = employees.find((e) => e.name === operator || e.email === operator);
        if (empMatch) {
          matchedKey = empMatch.name || empMatch.email;
        }
      }

      if (!workloadMap[matchedKey]) {
        workloadMap[matchedKey] = { totalActive: 0, executing: 0, escalated: 0, urgent: 0 };
      }

      workloadMap[matchedKey].totalActive++;
      if (t.status === 'EXECUTING') workloadMap[matchedKey].executing++;
      if (t.isEscalated) workloadMap[matchedKey].escalated++;
      if (t.priority === 'URGENT' || (t.priority as any) === 'CRITICAL') workloadMap[matchedKey].urgent++;
    }

    const teamList = employees.map((emp) => {
      const key = emp.name || emp.email;
      const stats = workloadMap[key] || { totalActive: 0, executing: 0, escalated: 0, urgent: 0 };
      const rolesList = emp.userRoles.map((r) => r.role);
      return {
        id: emp.id,
        name: emp.name || emp.email.split('@')[0],
        email: emp.email,
        phone: emp.phone,
        roles: rolesList,
        primaryRole: rolesList[0] || 'CONCIERGE',
        isOnline: true,
        activeTasksCount: stats.totalActive,
        executingTasksCount: stats.executing,
        escalatedCount: stats.escalated,
        urgentCount: stats.urgent,
        capacity: 10,
        loadPercentage: Math.min(100, Math.round((stats.totalActive / 10) * 100)),
      };
    });

    const unassignedStats = workloadMap['UNASSIGNED'] || { totalActive: 0, executing: 0, escalated: 0, urgent: 0 };

    return NextResponse.json({
      success: true,
      currentUserRole: sessionUser.roles,
      team: teamList,
      unassignedTasksCount: unassignedStats.totalActive,
      totalActiveTasks: activeTasks.length,
      shiftInfo: {
        shiftName: 'Standard Operations Shift (IST)',
        shiftHours: '09:00 - 21:00 IST',
        activeOperatorsCount: teamList.length,
      },
    });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    logger.error({ err: error }, 'Team API error');
    return NextResponse.json({ error: 'Failed to fetch team operations data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await requireSeniorConcierge();
    const body = await req.json();
    const { action, taskIds, targetOperatorEmail, targetOperatorName, note } = body;

    if (action === 'BULK_REASSIGN') {
      if (!Array.isArray(taskIds) || taskIds.length === 0 || !targetOperatorEmail) {
        return NextResponse.json({ error: 'Missing taskIds or targetOperatorEmail' }, { status: 400 });
      }

      for (const taskId of taskIds) {
        const task = await db.task.findUnique({ where: { id: taskId } });
        if (!task) continue;

        const updatedPrefs = {
          ...((task.clientPreferences as any) || {}),
          assignedOperator: targetOperatorName || targetOperatorEmail,
          assignedOperatorEmail: targetOperatorEmail,
          reassignedBy: sessionUser.email,
          reassignedAt: new Date().toISOString(),
        };

        await db.task.update({
          where: { id: taskId },
          data: {
            assignedAgent: targetOperatorName || targetOperatorEmail,
            clientPreferences: updatedPrefs,
          },
        });

        if (db.taskEvent) {
          await db.taskEvent.create({
            data: {
              taskId,
              eventType: 'OPERATOR_REASSIGNED',
              actorRole: 'CONCIERGE_MANAGER',
              message: `Task reassigned to ${targetOperatorName || targetOperatorEmail} by ${sessionUser.name || sessionUser.email}. Note: ${note || 'Workload rebalance'}`,
              data: {
                reassignedBy: sessionUser.email,
                assignedTo: targetOperatorEmail,
                note,
              },
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        reassignedCount: taskIds.length,
        assignedTo: targetOperatorEmail,
      });
    }

    return NextResponse.json({ error: 'Unsupported team action' }, { status: 400 });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    logger.error({ err: error }, 'Team POST action error');
    return NextResponse.json({ error: 'Failed to execute team action' }, { status: 500 });
  }
}
