/**
 * PROVENTA — Industrial Procurement Platform
 * Business & Procurement Notification Dispatcher
 */

import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email/sender';

export interface BusinessNotificationPayload {
  userId: string;
  type:
    | 'VERIFICATION_SUBMITTED'
    | 'VERIFICATION_VERIFIED'
    | 'VERIFICATION_REJECTED'
    | 'VERIFICATION_ADDITIONAL_INFO_REQUIRED'
    | 'RFQ_MATCHED'
    | 'QUOTATION_RECEIVED'
    | 'QUOTATION_AWARDED'
    | 'PO_ISSUED'
    | 'DELIVERY_UPDATE';
  title: string;
  body: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export async function sendBusinessNotification(payload: BusinessNotificationPayload): Promise<boolean> {
  try {
    // 1. Create In-App Notification in PostgreSQL
    const notif = await db.notification.create({
      data: {
        userId: payload.userId,
        type: 'PLATFORM_ANNOUNCEMENT' as any,
        title: payload.title,
        body: payload.body,
        actionUrl: payload.actionUrl,
        metadata: (payload.metadata as any) ?? undefined,
      },
    });

    // 2. Fetch User Email to dispatch asynchronous notification email
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { email: true, name: true },
    });

    if (user?.email) {
      void sendEmail({
        to: user.email,
        subject: `[PROVENTA] ${payload.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #191B20; color: #F1F2F4; padding: 24px; border: 1px solid #414957; border-radius: 4px;">
            <div style="border-bottom: 2px solid #C66A42; padding-bottom: 12px; margin-bottom: 20px;">
              <h2 style="color: #FFFFFF; margin: 0; font-size: 20px; letter-spacing: 0.05em;">PROVENTA</h2>
              <span style="color: #A8ADB7; font-size: 11px; text-transform: uppercase;">Industrial Procurement Platform</span>
            </div>
            <h3 style="color: #F1F2F4; margin-top: 0;">${payload.title}</h3>
            <p style="color: #D1D5DB; font-size: 14px; line-height: 1.6;">${payload.body}</p>
            ${
              payload.actionUrl
                ? `<div style="margin-top: 24px;">
                     <a href="https://proventa.in${payload.actionUrl}" style="background-color: #C66A42; color: #FFFFFF; padding: 10px 20px; text-decoration: none; font-weight: bold; font-size: 13px; text-transform: uppercase; border-radius: 2px; display: inline-block;">View in Portal</a>
                   </div>`
                : ''
            }
            <div style="border-top: 1px solid #414957; margin-top: 32px; padding-top: 12px; font-size: 11px; color: #6B7280;">
              Proventa Technologies India &bull; Ahmedabad, Gujarat &bull; Official Procurement Notice
            </div>
          </div>
        `,
      }).catch((err) => {
        console.warn('[sendBusinessNotification] Email delivery notice:', err.message);
      });
    }

    return true;
  } catch (err) {
    console.error('[sendBusinessNotification] Failed to create notification:', err);
    return false;
  }
}
