import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';
import { evaluateSeparationOfDuties } from '@/lib/construction-procurement/rbac';
import { rupeesToPaise, formatInrFromPaise } from '@/lib/construction-procurement/money';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const orgIds = businesses.length ? businesses.map((b) => b.id) : [session.user.id];
    const isAdmin = (session.user.roles || []).some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'FOUNDER'].includes(r));

    const records = await db.procurementApprovalRecord.findMany({
      where: isAdmin ? {} : { organisationId: { in: orgIds } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: records.map((r) => ({
        ...r,
        recommendedAmountPaise: r.recommendedAmountPaise.toString(),
        recommendedAmountFormatted: formatInrFromPaise(r.recommendedAmountPaise),
      })),
    });
  } catch (error) {
    console.error('[Procurement Approvals GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load approvals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const orgIds = businesses.length ? businesses.map((b) => b.id) : [session.user.id];

    // Action: decide on an existing pending approval
    if (body.action === 'DECIDE' && body.approvalId) {
      const existing = await db.procurementApprovalRecord.findUnique({ where: { id: body.approvalId } });
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Approval record not found' }, { status: 404 });
      }
      if (!orgIds.includes(existing.organisationId)) {
        return NextResponse.json({ success: false, error: 'Forbidden: Cross-organisation approval denied' }, { status: 403 });
      }
      if (existing.status !== 'PENDING') {
        return NextResponse.json({ success: false, error: `Approval already decided (${existing.status})` }, { status: 409 });
      }

      const decision = body.decision as 'APPROVED' | 'REJECTED' | 'RETURNED_FOR_REVISION';
      if (!['APPROVED', 'REJECTED', 'RETURNED_FOR_REVISION'].includes(decision)) {
        return NextResponse.json({ success: false, error: 'Invalid decision status' }, { status: 400 });
      }
      if ((decision === 'REJECTED' || decision === 'RETURNED_FOR_REVISION') && !body.reason?.trim()) {
        return NextResponse.json({ success: false, error: 'A written reason is mandatory for rejection or return.' }, { status: 400 });
      }

      if (decision === 'APPROVED') {
        const sod = evaluateSeparationOfDuties({
          rfqCreatorUserId: existing.requestedByUserId,
          actorUserId: session.user.id,
          actorRoles: (session.user.roles as string[]) || ['PROCUREMENT_MANAGER'],
          amountPaise: existing.recommendedAmountPaise,
        });
        if (!sod.allowed) {
          return NextResponse.json({ success: false, error: sod.reason, code: 'SEPARATION_OF_DUTIES' }, { status: 403 });
        }
      }

      const updated = await db.procurementApprovalRecord.update({
        where: { id: existing.id },
        data: {
          status: decision,
          approverUserId: session.user.id,
          decisionReason: body.reason?.trim() || 'Approved per commercial & technical review',
          decidedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: { ...updated, recommendedAmountPaise: updated.recommendedAmountPaise.toString() },
      });
    }

    // Action: submit a new approval request
    if (!body.rfqId || !body.quotationId || !body.recommendedAmountRupees) {
      return NextResponse.json(
        { success: false, error: 'rfqId, quotationId, and recommendedAmountRupees are required.' },
        { status: 400 }
      );
    }

    const amountPaise = rupeesToPaise(body.recommendedAmountRupees);
    const created = await db.procurementApprovalRecord.create({
      data: {
        organisationId: orgIds[0],
        rfqId: body.rfqId,
        quotationId: body.quotationId,
        recommendedAmountPaise: amountPaise,
        requestedByUserId: session.user.id,
        approverRole: body.approverRole || 'PROCUREMENT_HEAD',
        levelOrder: Number(body.levelOrder || 1),
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      { success: true, data: { ...created, recommendedAmountPaise: created.recommendedAmountPaise.toString() } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Procurement Approvals POST]', error);
    return NextResponse.json({ success: false, error: error.message || 'Approval operation failed' }, { status: 500 });
  }
}
