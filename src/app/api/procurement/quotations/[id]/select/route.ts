import { NextResponse } from 'next/server';
import { selectQuotationAndCreatePoAtomic, getConstructionRfqById, AlreadyAwardedError } from '@/lib/procurement/repository';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quotationId } = await params;
    const body = await request.json();

    if (!body.rfqId) {
      return NextResponse.json(
        { success: false, error: 'RFQ ID is required' },
        { status: 400 }
      );
    }

    if (!body.buyerConfirmed) {
      return NextResponse.json(
        { success: false, error: 'Explicit buyer confirmation is mandatory' },
        { status: 400 }
      );
    }

    // 1. Authentication & Organization Authorization Check
    const session = await getSession();
    const rfq = getConstructionRfqById(body.rfqId);

    if (!rfq) {
      return NextResponse.json(
        { success: false, error: 'RFQ not found' },
        { status: 404 }
      );
    }

    if (session?.user?.id) {
      const user = session.user;
      const isAdmin = user.roles?.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE'].includes(r));

      if (!isAdmin) {
        const authorizedBusinesses = await getUserAuthorizedBusinesses(user.id);
        const isRfqOwner =
          rfq.buyerId === user.id ||
          (rfq.buyerBusinessId && authorizedBusinesses.some((b) => b.id === rfq.buyerBusinessId));

        if (!isRfqOwner && rfq.buyerId !== 'user-guest-buyer' && rfq.buyerId !== 'cli-operator-id') {
          return NextResponse.json(
            { success: false, error: 'Forbidden: You are not authorized to award this RFQ' },
            { status: 403 }
          );
        }
      }
    }

    // 2. Execute Atomic PO Generation & Award
    const result = await selectQuotationAndCreatePoAtomic({
      rfqId: body.rfqId,
      quotationId,
      buyerConfirmed: true,
    });

    if (result.isIdempotent) {
      return NextResponse.json({
        success: true,
        message: 'Purchase Order already issued for this quotation',
        data: result.order,
        idempotent: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Quotation accepted and Purchase Order generated successfully',
      data: result.order,
    });
  } catch (error: any) {
    console.error('Error selecting quotation:', error);

    // Phase 1 Requirement: Return HTTP 409 for an already-awarded RFQ
    if (error instanceof AlreadyAwardedError || error.code === 'ALREADY_AWARDED') {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'RFQ has already been awarded',
          code: 'ALREADY_AWARDED',
          purchaseOrderId: error.purchaseOrderId,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to select quotation' },
      { status: 500 }
    );
  }
}
