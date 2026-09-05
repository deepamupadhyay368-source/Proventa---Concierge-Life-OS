import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { trackEvent } from '@/lib/analytics';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const fullUserData = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        customerProfile: {
          include: {
            preferences: true,
          },
        },
        sentMessages: {
          where: { isInternal: false },
          select: {
            id: true,
            requestId: true,
            content: true,
            type: true,
            createdAt: true,
          },
        },
        consentRecords: true,
        supportTickets: true,
        notifications: {
          select: {
            id: true,
            type: true,
            title: true,
            body: true,
            createdAt: true,
            readAt: true,
          },
        },
      },
    });

    if (!fullUserData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Customer requests, approvals, bookings, and payments
    const requests = fullUserData.customerProfile?.id
      ? await db.conciergeRequest.findMany({
          where: { customerId: fullUserData.customerProfile.id },
          include: {
            statusHistory: true,
            approvals: true,
            bookings: {
              include: {
                events: true,
                payment: true,
              },
            },
            feedback: true,
          },
        })
      : [];

    const exportArchive = {
      exportMetadata: {
        generatedAt: new Date().toISOString(),
        proventaVersion: '2.0-wave1',
        regulatoryStandard: 'Digital Personal Data Protection Act (DPDP) 2023',
        description: 'Complete Personal Data Archive & Audit History for Proventa Concierge Life OS',
      },
      user: fullUserData,
      requests,
    };

    // Log the export in audit log
    await db.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: 'CUSTOMER',
        action: 'EXPORT_DATA',
        resourceType: 'User',
        resourceId: user.id,
        after: { exportTimestamp: new Date().toISOString() },
      },
    });

    void trackEvent({
      event: 'customer_data_exported',
      userId: user.id,
    });

    const jsonStr = JSON.stringify(exportArchive, null, 2);

    return new NextResponse(jsonStr, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="proventa-data-export-${user.id}.json"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 500 });
  }
}
