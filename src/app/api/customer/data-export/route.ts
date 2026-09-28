import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Fetch all records associated with this customer
    const userRecord = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const profile = await db.customerProfile.findUnique({
      where: { userId: user.id },
      include: {
        preferences: true,
      },
    });

    const tasks = profile
      ? await db.task.findMany({
          where: { customerId: profile.id },
          include: {
            events: true,
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    const policyAcceptances = await db.policyAcceptance.findMany({
      where: { userId: user.id },
      orderBy: { acceptedAt: 'desc' },
    });

    const privacyRequests = await db.privacyRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      exportType: 'CUSTOMER_PERSONAL_DATA_DOSSIER',
      sovereignStewardshipNotice:
        'This file contains the complete personal and operational records stored by Proventa for your account.',
      account: userRecord,
      profile: profile
        ? {
            id: profile.id,
            preferredComm: profile.preferredComm,
            primaryUseCases: profile.primaryUseCases,
            city: profile.city,
            preferences: profile.preferences.map((p) => ({
              category: p.category,
              key: p.key,
              value: p.value,
              source: p.source,
              updatedAt: p.updatedAt,
            })),
          }
        : null,
      tasks: tasks.map((t) => ({
        id: t.id,
        publicId: t.publicId,
        category: t.category,
        intent: t.intent,
        originalRequest: t.originalRequest,
        status: t.status,
        priority: t.priority,
        budgetAmount: t.budgetAmount,
        budgetCurrency: t.budgetCurrency,
        createdAt: t.createdAt,
        completedAt: t.completedAt,
        events: t.events.map((e) => ({
          eventType: e.eventType,
          message: e.message,
          actorRole: e.actorRole,
          createdAt: e.createdAt,
        })),
      })),
      policyAcceptances: policyAcceptances.map((p) => ({
        policyType: p.policyType,
        policyVersion: p.policyVersion,
        acceptanceContext: p.acceptanceContext,
        acceptedAt: p.acceptedAt,
      })),
      privacyRequests: privacyRequests.map((r) => ({
        id: r.id,
        requestType: r.requestType,
        status: r.status,
        createdAt: r.createdAt,
      })),
    };

    await createAuditLog({
      actorId: user.id,
      actorRole: 'CUSTOMER',
      action: 'EXPORT_DATA',
      resourceType: 'CustomerProfile',
      resourceId: user.id,
    });

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="proventa-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error: any) {
    console.error('[GET /api/customer/data-export]', error);
    return NextResponse.json({ error: error.message || 'Export failed' }, { status: 500 });
  }
}
