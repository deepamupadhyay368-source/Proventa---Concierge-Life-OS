import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export class FeedbackLearner {
  /**
   * Automatically derives inferred preferences from successful bookings and user feedback.
   * Enables agents to continuously adapt to each client over time.
   */
  static async recordTaskOutcome(params: {
    customerId: string;
    taskId: string;
    category: string;
    vendorName?: string;
    actionTaken: 'CONFIRMED' | 'DECLINED' | 'MODIFIED';
    clientFeedback?: string;
    details?: Record<string, any>;
  }) {
    const { customerId, category, vendorName, actionTaken, details } = params;
    if (!customerId) return;

    try {
      // 1. If confirmed, infer affinity for the vendor and service parameters
      if (actionTaken === 'CONFIRMED' && vendorName) {
        await db.customerPreference.upsert({
          where: {
            customerId_category_key: {
              customerId,
              category,
              key: 'favoriteVendor',
            },
          },
          update: {
            value: vendorName,
            source: 'inferred',
            updatedAt: new Date(),
          },
          create: {
            customerId,
            category,
            key: 'favoriteVendor',
            value: vendorName,
            source: 'inferred',
          },
        });

        // If dining, record party size and special notes preferences
        if (category === 'dining' && details?.partySize) {
          await db.customerPreference.upsert({
            where: {
              customerId_category_key: {
                customerId,
                category: 'dining',
                key: 'usualPartySize',
              },
            },
            update: { value: details.partySize, source: 'inferred' },
            create: { customerId, category: 'dining', key: 'usualPartySize', value: details.partySize, source: 'inferred' },
          });
        }
      }

      logger.info({ customerId, category, actionTaken }, '[FeedbackLearner] Inferred preference updated');
    } catch (err) {
      logger.warn({ err, customerId }, '[FeedbackLearner] Error recording inferred preference');
    }
  }
}
