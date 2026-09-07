import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function appendTaskEvent(params: {
  taskId: string;
  eventType: string;
  actorRole: 'CUSTOMER' | 'CONCIERGE' | 'AI_AGENT' | 'SYSTEM';
  actorId?: string;
  message: string;
  data?: Record<string, any>;
}) {
  try {
    const event = await db.taskEvent.create({
      data: {
        taskId: params.taskId,
        eventType: params.eventType,
        actorRole: params.actorRole,
        actorId: params.actorId || null,
        message: params.message,
        data: params.data ? (params.data as any) : undefined,
      },
    });

    // Also update Task updatedAt
    await db.task.update({
      where: { id: params.taskId },
      data: { updatedAt: new Date() },
    });

    logger.info({ taskId: params.taskId, eventType: params.eventType }, `[Timeline] ${params.message}`);

    // Automatic In-App Notification Trigger for Key Milestones
    const NOTIFIABLE_EVENTS = [
      'REQUEST_RECEIVED',
      'APPROVAL_REQUESTED',
      'CONFIRMED',
      'BOOKING_CONFIRMED',
      'CONFIRMED_BY_CONCIERGE',
      'ESCALATED_TO_CONCIERGE',
      'FAILED',
    ];

    if (NOTIFIABLE_EVENTS.includes(params.eventType)) {
      try {
        const task = await db.task.findUnique({
          where: { id: params.taskId },
          include: { customer: true },
        });

        if (task && task.customer?.userId) {
          let notifType: any = 'REQUEST_RECEIVED';
          if (params.eventType === 'APPROVAL_REQUESTED') notifType = 'APPROVAL_REQUIRED';
          else if (['CONFIRMED', 'BOOKING_CONFIRMED', 'CONFIRMED_BY_CONCIERGE'].includes(params.eventType)) notifType = 'BOOKING_CONFIRMED';
          else if (params.eventType === 'ESCALATED_TO_CONCIERGE') notifType = 'CONCIERGE_ASSIGNED';
          else if (params.eventType === 'FAILED') notifType = 'REQUEST_FAILED';

          await db.notification.create({
            data: {
              userId: task.customer.userId,
              type: notifType,
              title: `Task #${task.publicId || task.id.slice(-6)}: ${params.eventType.replace(/_/g, ' ')}`,
              body: params.message,
              actionUrl: `/tasks/${task.id}`,
              metadata: { taskId: task.id, eventType: params.eventType, data: params.data },
            },
          });
        }
      } catch (notifErr) {
        logger.warn({ notifErr, taskId: params.taskId }, '[Timeline] Background notification dispatch skipped');
      }
    }

    return event;
  } catch (error) {
    logger.error({ error, params }, '[Timeline] Failed to append task event');
    return null;
  }
}
