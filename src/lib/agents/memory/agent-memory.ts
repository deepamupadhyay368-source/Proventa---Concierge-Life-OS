import { db } from '@/lib/db';

export interface ClientMemoryContext {
  customerId: string;
  explicitPreferences: Record<string, any>;
  inferredPreferences: Record<string, any>;
  recentBookings: Array<{
    category?: string;
    vendorName?: string;
    details?: any;
    completedAt?: Date;
  }>;
  activeTasks: Array<{
    id: string;
    publicId: string;
    category: string;
    status: string;
    originalRequest: string;
  }>;
}

export class AgentMemoryManager {
  /**
   * Retrieves isolated client memory context strictly partitioned by customerId.
   * Cross-client leakage is physically impossible by query design.
   */
  static async getClientContext(customerId: string): Promise<ClientMemoryContext> {
    if (!customerId) {
      return {
        customerId: '',
        explicitPreferences: {},
        inferredPreferences: {},
        recentBookings: [],
        activeTasks: [],
      };
    }

    // 1. Fetch preferences
    const preferencesRecords = await db.customerPreference.findMany({
      where: { customerId },
    });

    const explicitPreferences: Record<string, any> = {};
    const inferredPreferences: Record<string, any> = {};

    preferencesRecords.forEach((record) => {
      if (record.source === 'inferred') {
        inferredPreferences[record.key] = record.value;
      } else {
        explicitPreferences[record.key] = record.value;
      }
    });

    // 2. Fetch past confirmed bookings (up to 5 most recent)
    const recentCompletedTasks = await db.task.findMany({
      where: {
        customerId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      orderBy: { completedAt: 'desc' },
      take: 5,
      select: {
        category: true,
        vendorName: true,
        externalReferenceId: true,
        completedAt: true,
      },
    });

    // 3. Fetch active tasks for cross-task coordination
    const activeTasks = await db.task.findMany({
      where: {
        customerId,
        status: { in: ['REQUESTED', 'UNDERSTANDING', 'SEARCHING', 'OPTIONS_READY', 'AWAITING_APPROVAL', 'EXECUTING'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        publicId: true,
        category: true,
        status: true,
        originalRequest: true,
      },
    });

    return {
      customerId,
      explicitPreferences,
      inferredPreferences,
      recentBookings: recentCompletedTasks.map((t) => ({
        category: t.category,
        vendorName: t.vendorName || undefined,
        completedAt: t.completedAt || undefined,
      })),
      activeTasks: activeTasks.map((t) => ({
        id: t.id,
        publicId: t.publicId,
        category: t.category,
        status: t.status,
        originalRequest: t.originalRequest,
      })),
    };
  }

  /**
   * Records an inferred preference derived from client decisions.
   */
  static async recordInferredPreference(
    customerId: string,
    category: string,
    key: string,
    value: any
  ) {
    if (!customerId) return;
    await db.customerPreference.upsert({
      where: {
        customerId_category_key: {
          customerId,
          category,
          key,
        },
      },
      update: {
        value,
        source: 'inferred',
        updatedAt: new Date(),
      },
      create: {
        customerId,
        category,
        key,
        value,
        source: 'inferred',
      },
    });
  }
}
