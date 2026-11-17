import { NextResponse } from 'next/server';
import {
  submitConstructionQuotation,
  reviseConstructionQuotation,
  getQuotationById,
  getConstructionRfqById,
} from '@/lib/procurement/repository';
import { getSession } from '@/lib/auth/session';
import { resolveSupplierContext, getUserAuthorizedBusinesses } from '@/lib/business/auth-context';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Quotation ID is required' },
        { status: 400 }
      );
    }

    const quotation = getQuotationById(id);
    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Confidentiality Check: Ensure requester is either RFQ owner (Buyer) or Quotation submitter (Supplier)
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to view quotation details' },
        { status: 401 }
      );
    }

    const user = session.user;
    const isAdmin = user.roles?.some((r: string) => ['SUPER_ADMIN', 'ADMIN'].includes(r));

    if (!isAdmin) {
      const authorizedBusinesses = await getUserAuthorizedBusinesses(user.id);
      const authorizedBizIds = new Set(authorizedBusinesses.map((b) => b.id));

      const isQuotingSupplier =
        quotation.supplierId === user.id ||
        (quotation.supplierBusinessId && authorizedBizIds.has(quotation.supplierBusinessId)) ||
        authorizedBizIds.has(quotation.supplierId);

      const rfq = getConstructionRfqById(quotation.rfqId);
      const isRfqBuyer =
        rfq &&
        (rfq.buyerId === user.id ||
          (rfq.buyerBusinessId && authorizedBizIds.has(rfq.buyerBusinessId)));

      if (!isQuotingSupplier && !isRfqBuyer) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden: Competitor quotations are strictly confidential and cannot be viewed by other suppliers.',
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, data: quotation });
  } catch (error) {
    console.error('Error fetching quotation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotation' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await getSession();

    if (body.action === 'revise' && body.quotationId) {
      const existing = getQuotationById(body.quotationId);
      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Quotation not found' },
          { status: 404 }
        );
      }

      if (session?.user?.id) {
        const supplierCtx = await resolveSupplierContext({
          user: session.user,
          requestedSupplierId: existing.supplierId,
        });
        if (!supplierCtx.isAuthorized) {
          return NextResponse.json(
            { success: false, error: 'Forbidden: You cannot revise this quotation' },
            { status: 403 }
          );
        }
      }

      const revised = reviseConstructionQuotation({
        quotationId: body.quotationId,
        items: body.items,
        deliveryCharges: body.deliveryCharges,
        discountAmount: body.discountAmount,
        promisedDeliveryDate: body.promisedDeliveryDate,
        validityDays: body.validityDays,
        paymentTerms: body.paymentTerms,
        supplierNotes: body.supplierNotes,
      });

      return NextResponse.json({ success: true, data: revised });
    }

    if (!body.rfqId || !body.supplierId || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'RFQ ID, Supplier ID, and item quotes are required' },
        { status: 400 }
      );
    }

    // Verify session supplier authorization
    if (session?.user?.id) {
      const supplierCtx = await resolveSupplierContext({
        user: session.user,
        requestedSupplierId: body.supplierId,
      });
      if (!supplierCtx.isAuthorized) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You are not authorized to quote on behalf of this supplier identity' },
          { status: 403 }
        );
      }
    }

    const quotation = submitConstructionQuotation({
      rfqId: body.rfqId,
      supplierId: body.supplierId,
      items: body.items,
      deliveryCharges: body.deliveryCharges || 0,
      discountAmount: body.discountAmount || 0,
      promisedDeliveryDate: body.promisedDeliveryDate || new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
      validityDays: body.validityDays || 7,
      paymentTerms: body.paymentTerms || 'Standard Terms',
      supplierNotes: body.supplierNotes,
      attachments: body.attachments,
    });

    return NextResponse.json({ success: true, data: quotation }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting quotation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit quotation' },
      { status: 500 }
    );
  }
}
