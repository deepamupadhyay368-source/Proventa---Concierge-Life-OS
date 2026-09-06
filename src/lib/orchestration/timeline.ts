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
    return event;
  } catch (error) {
    logger.error({ error, params }, '[Timeline] Failed to append task event');
    return null;
  }
}
