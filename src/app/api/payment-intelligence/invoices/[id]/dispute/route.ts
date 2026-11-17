import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { PaymentIntelligenceService } from '@/lib/payment-intelligence/service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { disputedByBusinessId, disputeType, disputedAmount, reason, evidenceUrls } = body;

    if (!disputedByBusinessId || !disputeType || !reason) {
      return NextResponse.json(
        { success: false, error: 'disputedByBusinessId, disputeType, and reason are required' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim();

    const dispute = await PaymentIntelligenceService.raiseDispute({
      invoiceId: id,
      disputedByBusinessId,
      disputedByUserId: session.user.id,
      disputeType,
      disputedAmount: disputedAmount ? Number(disputedAmount) : undefined,
      reason,
      evidenceUrls,
      ipAddress,
    });

    return NextResponse.json({ success: true, data: dispute }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to raise dispute' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { disputeId, status, resolutionNotes, adjustmentAmount } = body;

    if (!disputeId || !status || !resolutionNotes) {
      return NextResponse.json(
        { success: false, error: 'disputeId, status, and resolutionNotes are required' },
        { status: 400 }
      );
    }

    const roles: string[] = (session.user as any)?.roles || [];
    const actorRole = roles.includes('ADMIN') ? 'ADMIN' : 'SUPPLIER';
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim();

    const resolved = await PaymentIntelligenceService.resolveDispute({
      disputeId,
      resolvedByUserId: session.user.id,
      status,
      resolutionNotes,
      adjustmentAmount: adjustmentAmount ? Number(adjustmentAmount) : undefined,
      actorRole,
      ipAddress,
    });

    return NextResponse.json({ success: true, data: resolved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to resolve dispute' },
      { status: 500 }
    );
  }
}
