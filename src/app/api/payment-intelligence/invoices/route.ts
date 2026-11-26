import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { PaymentIntelligenceRepository } from '@/lib/payment-intelligence/repository';
import { PaymentIntelligenceService } from '@/lib/payment-intelligence/service';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to list invoices', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let buyerBusinessId = searchParams.get('buyerBusinessId') || undefined;
    let supplierBusinessId = searchParams.get('supplierBusinessId') || undefined;
    const status = searchParams.get('status') || undefined;
    const isDisputed = searchParams.has('isDisputed')
      ? searchParams.get('isDisputed') === 'true'
      : undefined;

    const user = session.user;
    const userRoles = (user.roles as string[]) || [];
    const isAdmin = userRoles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'FOUNDER', 'FINANCE'].includes(r));

    if (!isAdmin) {
      const authorized = await getUserAuthorizedBusinesses(user.id);
      const authorizedIds = new Set([user.id, ...authorized.map((b) => b.id)]);

      if (buyerBusinessId && !authorizedIds.has(buyerBusinessId)) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You are not authorized to view invoices for this buyer business', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }

      if (supplierBusinessId && !authorizedIds.has(supplierBusinessId)) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You are not authorized to view invoices for this supplier business', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }

      // If neither is specified, default to user's primary authorized business
      if (!buyerBusinessId && !supplierBusinessId) {
        if (authorized.length > 0) {
          buyerBusinessId = authorized[0].id;
        } else {
          buyerBusinessId = user.id;
        }
      }
    }

    const invoices = await PaymentIntelligenceRepository.listInvoices({
      buyerBusinessId,
      supplierBusinessId,
      status,
      isDisputed,
    });

    return NextResponse.json({
      success: true,
      data: invoices,
      count: invoices.length,
    });
  } catch (error: any) {
    console.error('[API payment-intelligence/invoices GET]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list invoices' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      invoiceNumber,
      purchaseOrderId,
      rfqId,
      buyerBusinessId,
      buyerBusinessName,
      supplierBusinessId,
      supplierBusinessName,
      paymentTerms,
      paymentTermsDays,
      items,
      documentUrl,
      documentFileName,
      notes,
    } = body;

    if (!invoiceNumber || !buyerBusinessId || !supplierBusinessId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required invoice fields (invoiceNumber, buyerBusinessId, supplierBusinessId, items)' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim();

    const invoice = await PaymentIntelligenceService.createInvoice({
      invoiceNumber,
      purchaseOrderId,
      rfqId,
      buyerBusinessId,
      buyerBusinessName,
      supplierBusinessId,
      supplierBusinessName,
      issuerUserId: session.user.id,
      recipientUserId: body.recipientUserId,
      paymentTerms: paymentTerms || 'NET_30',
      paymentTermsDays: paymentTermsDays ? Number(paymentTermsDays) : 30,
      items,
      documentUrl,
      documentFileName,
      notes,
      ipAddress,
    });

    return NextResponse.json({
      success: true,
      data: invoice,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[API payment-intelligence/invoices POST]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
