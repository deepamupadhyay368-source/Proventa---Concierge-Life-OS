import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { trackEvent } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));

    if (body.confirmation !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json(
        { error: 'Confirmation string DELETE_MY_ACCOUNT is required to execute deletion' },
        { status: 400 }
      );
    }

    const timestamp = new Date();
    const anonymizedEmail = `deleted-${user.id}-${Date.now()}@anonymized.proventa.in`;

    // Audit log before mutation
    await db.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: 'CUSTOMER',
        action: 'DELETE_DATA',
        resourceType: 'User',
        resourceId: user.id,
        after: {
          requestedAt: timestamp.toISOString(),
          dpdpCompliance: 'Right to Erasure fulfilled',
        },
      },
    });

    // Record security event
    await db.securityEvent.create({
      data: {
        type: 'ACCOUNT_LOCKED',
        userId: user.id,
        details: { reason: 'Customer invoked DPDP right to erasure' },
      },
    });

    // Anonymize user record and mark deleted
    await db.user.update({
      where: { id: user.id },
      data: {
        email: anonymizedEmail,
        name: 'Deleted User',
        phone: null,
        status: 'DELETED',
        deletedAt: timestamp,
      },
    });

    // Revoke all active sessions
    await db.session.deleteMany({
      where: { userId: user.id },
    });

    void trackEvent({
      event: 'customer_account_deleted',
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Your account and personal identifying data have been erased in compliance with DPDP.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 500 });
  }
}
