import { NextResponse } from 'next/server';
import {
  getConstructionRfqById,
  compareQuotationsForRfq,
  getQuotationsForRfq,
} from '@/lib/procurement/repository';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses, resolveSupplierContext } from '@/lib/business/auth-context';
import { createBusinessAuditLog } from '@/lib/business/service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const requestedSupplierId = searchParams.get('supplierId');

    const rfq = getConstructionRfqById(id);

    if (!rfq) {
      return NextResponse.json(
        { success: false, error: 'RFQ not found' },
        { status: 404 }
      );
    }

    // 1. Enforce Authentication
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to access RFQ details', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const user = session.user;
    const userRoles = user.roles || [];
    const isAdmin = userRoles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE'].includes(r));

    // 2. Administrator Access with Mandatory Audit Logging
    if (isAdmin) {
      void createBusinessAuditLog({
        businessId: rfq.buyerBusinessId || 'platform',
        userId: user.id,
        action: 'ADMIN_RFQ_INSPECTION',
        details: `Administrator ${user.email} inspected full procurement records for RFQ ${rfq.referenceCode} (${rfq.id})`,
        metadata: { rfqId: rfq.id, referenceCode: rfq.referenceCode },
      });

      const comparison = compareQuotationsForRfq(rfq.id);
      const allQuotes = getQuotationsForRfq(rfq.id);

      return NextResponse.json({
        success: true,
        data: {
          rfq,
          comparison,
          quotations: allQuotes,
          accessRole: 'ADMINISTRATOR',
        },
      });
    }

    // Resolve user's authorized businesses
    const authorizedBusinesses = await getUserAuthorizedBusinesses(user.id);
    const isOwnBuyer =
      rfq.buyerId === user.id ||
      (rfq.buyerBusinessId && authorizedBusinesses.some((b) => b.id === rfq.buyerBusinessId));

    // 3. Supplier Perspective Check
    if (requestedSupplierId) {
      const supplierContext = await resolveSupplierContext({
        user,
        requestedSupplierId,
      });

      if (!supplierContext.isAuthorized) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden: You are not authorized to represent this supplier identity',
            code: 'FORBIDDEN_SUPPLIER_MISMATCH',
          },
          { status: 403 }
        );
      }

      const activeSupplierId = supplierContext.supplierId;
      const isInvitedOrEligible =
        rfq.invitedSupplierIds.includes(activeSupplierId) ||
        rfq.invitedSupplierIds.length === 0;

      if (!isInvitedOrEligible && !isOwnBuyer) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden: You are not an invited or eligible supplier for this RFQ',
            code: 'FORBIDDEN_NOT_INVITED',
          },
          { status: 403 }
        );
      }

      // Filter: Supplier can ONLY see their own quotation
      const allQuotes = getQuotationsForRfq(rfq.id);
      const ownQuotes = allQuotes.filter((q) => q.supplierId === activeSupplierId);

      // Redacted comparison: strictly omit competitor rates, GST, freight, terms, attachments, or names
      const redactedComparison = {
        rfqId: rfq.id,
        referenceCode: rfq.referenceCode,
        status: rfq.status,
        totalQuotationsReceived: allQuotes.length,
        myQuotationsCount: ownQuotes.length,
        myLatestQuotationStatus: ownQuotes[0]?.status || null,
        competitorsRedacted: true,
      };

      return NextResponse.json({
        success: true,
        data: {
          rfq,
          comparison: redactedComparison,
          supplierQuotations: ownQuotes,
          accessRole: 'SUPPLIER',
        },
      });
    }

    // 4. Buyer Perspective Check (IDOR Prevention)
    if (!isOwnBuyer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: You do not have permission to view another buyer\'s RFQ',
          code: 'FORBIDDEN_IDOR',
        },
        { status: 403 }
      );
    }

    // Authorized Buyer sees full comparison matrix and all itemized quotations
    const comparison = compareQuotationsForRfq(rfq.id);
    return NextResponse.json({
      success: true,
      data: {
        rfq,
        comparison,
        accessRole: 'BUYER',
      },
    });
  } catch (error: any) {
    console.error('Error fetching RFQ detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch RFQ details' },
      { status: 500 }
    );
  }
}
