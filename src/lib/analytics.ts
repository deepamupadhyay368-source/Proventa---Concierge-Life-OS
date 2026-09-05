import { db } from './db';
import { logger } from './logger';

export type AnalyticsEventName =
  | 'landing_view'
  | 'wave1_started'
  | 'wave1_completed'
  | 'invitation_sent'
  | 'account_created'
  | 'verification_completed'
  | 'onboarding_completed'
  | 'request_created'
  | 'clarification_completed'
  | 'concierge_assigned'
  | 'recommendation_created'
  | 'recommendation_viewed'
  | 'approval_requested'
  | 'approval_completed'
  | 'booking_confirmed'
  | 'request_completed'
  | 'feedback_submitted'
  | 'support_ticket_created'
  | 'preference_updated'
  | 'session_started'
  | 'password_reset_requested'
  | 'message_received'
  | 'message_sent'
  | 'google_auth_initiated'
  | 'customer_data_exported'
  | 'customer_account_deleted';

interface TrackEventParams {
  event: AnalyticsEventName;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function trackEvent(params: TrackEventParams): Promise<void> {
  try {
    await db.analyticsEvent.create({
      data: {
        event: params.event,
        userId: params.userId,
        sessionId: params.sessionId,
        properties: params.properties as never,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    // Analytics failure must never block the user experience
    logger.warn({ error, event: params.event }, 'Analytics event failed to record');
  }
}
