import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { isAppError, toSafeError, ValidationError } from '@/lib/errors';
import { createAuditLog } from '@/lib/audit';
import {
  acceptMissionQuotation,
  approveMissionRfqDistribution,
  cancelMission,
  confirmMissionCompletion,
  getMissionById,
  requestConciergeMissionFallback,
  shortlistMissionQuotation,
} from '@/lib/marketplace/mission-service';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await getSession();
    const mission = getMissionById(id, {
      userId: session?.user?.id || null,
      role: (session?.user as { roles?: string[] })?.roles?.[0] || 'CUSTOMER',
    });

    return NextResponse.json({ mission });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await getSession();
    const body = await req.json();

    const customerId = session?.user?.id || body.customerId;
    if (!customerId) {
      throw new ValidationError('Customer identification required to update mission.');
    }

    const action = body.action as string;
    let updatedMission;

    switch (action) {
      case 'APPROVE_RFQ_DISTRIBUTION': {
        const supplierIds = (body.supplierIds as string[]) || [];
        updatedMission = await approveMissionRfqDistribution(
          id,
          customerId,
          supplierIds,
        );
        break;
      }

      case 'SHORTLIST_QUOTATION': {
        if (!body.quotationId) throw new ValidationError('quotationId is required.');
        updatedMission = await shortlistMissionQuotation(
          id,
          customerId,
          body.quotationId,
          body.note,
        );
        break;
      }

      case 'ACCEPT_QUOTATION': {
        if (!body.quotationId) throw new ValidationError('quotationId is required.');
        updatedMission = await acceptMissionQuotation(
          id,
          customerId,
          body.quotationId,
        );
        break;
      }

      case 'CONCIERGE_FALLBACK': {
        updatedMission = await requestConciergeMissionFallback(
          id,
          customerId,
          body.note,
        );
        break;
      }

      case 'CONFIRM_COMPLETION': {
        updatedMission = await confirmMissionCompletion(
          id,
          customerId,
          body.note,
        );
        break;
      }

      case 'CANCEL': {
        updatedMission = await cancelMission(
          id,
          customerId,
          body.reason,
        );
        break;
      }

      default:
        throw new ValidationError(`Unknown mission action: ${action}`);
    }

    if (session?.user?.id) {
      await createAuditLog({
        actorId: session.user.id,
        actorRole: (session.user as { roles?: string[] })?.roles?.[0] ?? 'CUSTOMER',
        action: 'UPDATE',
        resourceType: 'Mission',
        resourceId: id,
        after: {
          action,
          stage: updatedMission.missionStage,
        },
      });
    }

    return NextResponse.json({ mission: updatedMission });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}
