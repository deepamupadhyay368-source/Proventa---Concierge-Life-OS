import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';
import { appendDisputeAuditEntry, type DisputeAuditEntry } from '@/lib/construction-procurement/fulfilment-engine';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const orgIds = businesses.length ? businesses.map((b) => b.id) : [session.user.id];
    const isAdmin = (session.user.roles || []).some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'FOUNDER'].includes(r));

    const disputes = await db.procurementDispute.findMany({
      where: isAdmin ? {} : { organisationId: { in: orgIds } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: disputes });
  } catch (error) {
    console.error('[Procurement Disputes GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load disputes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.purchaseOrderId || !body.disputeType || !body.summary?.trim() || !body.description?.trim()) {
      return NextResponse.json(
        { success: false, error: 'purchaseOrderId, disputeType, summary, and description are required.' },
        { status: 400 }
      );
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const organisationId = businesses[0]?.id || session.user.id;
    const disputeCode = `DSP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const initialHistory = appendDisputeAuditEntry([], {
      timestampIso: new Date().toISOString(),
      actorUserId: session.user.id,
      action: 'CREATED',
      note: `Dispute opened (${body.disputeType}): ${body.summary.trim()}`,
      newStatus: 'OPEN',
    });

    const dispute = await db.procurementDispute.create({
      data: {
        organisationId,
        purchaseOrderId: body.purchaseOrderId,
        deliveryId: body.deliveryId || null,
        invoiceNumber: body.invoiceNumber || null,
        disputeCode,
        disputeType: body.disputeType,
        status: 'OPEN',
        summary: body.summary.trim(),
        description: body.description.trim(),
        evidenceDocumentKeys: Array.isArray(body.evidenceDocumentKeys) ? body.evidenceDocumentKeys : [],
        raisedByUserId: session.user.id,
        immutableHistoryJson: initialHistory as any,
      },
    });

    return NextResponse.json({ success: true, data: dispute }, { status: 201 });
  } catch (error: any) {
    console.error('[Procurement Disputes POST]', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to raise dispute' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.disputeId || !body.newStatus || !body.note?.trim()) {
      return NextResponse.json(
        { success: false, error: 'disputeId, newStatus, and an audit note are required.' },
        { status: 400 }
      );
    }

    const existing = await db.procurementDispute.findUnique({ where: { id: body.disputeId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Dispute not found' }, { status: 404 });
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const orgIds = businesses.length ? businesses.map((b) => b.id) : [session.user.id];
    const isAdmin = (session.user.roles || []).some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'FOUNDER'].includes(r));

    if (!isAdmin && !orgIds.includes(existing.organisationId)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Never overwrite or erase existing dispute history; append strictly
    const priorHistory = Array.isArray(existing.immutableHistoryJson)
      ? (existing.immutableHistoryJson as unknown as DisputeAuditEntry[])
      : [];

    const nextHistory = appendDisputeAuditEntry(priorHistory, {
      timestampIso: new Date().toISOString(),
      actorUserId: session.user.id,
      action: body.newStatus === 'RESOLVED' ? 'RESOLVED' : body.newStatus === 'CLOSED' ? 'CLOSED' : 'STATUS_CHANGED',
      note: body.note.trim(),
      previousStatus: existing.status,
      newStatus: body.newStatus,
    });

    const updated = await db.procurementDispute.update({
      where: { id: existing.id },
      data: {
        status: body.newStatus,
        resolutionNotes: body.resolutionNotes || existing.resolutionNotes,
        closureReason: body.newStatus === 'CLOSED' ? body.note.trim() : existing.closureReason,
        immutableHistoryJson: nextHistory as any,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[Procurement Disputes PATCH]', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update dispute' }, { status: 500 });
  }
}
