import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';
import { evaluateThreeWayMatch } from '@/lib/construction-procurement/fulfilment-engine';
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

    const records = await db.threeWayMatchRecord.findMany({
      where: isAdmin ? {} : { organisationId: { in: orgIds } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: records.map((r) => ({
        ...r,
        poTotalPaise: r.poTotalPaise.toString(),
        poTotalFormatted: formatInrFromPaise(r.poTotalPaise),
        grnValuePaise: r.grnValuePaise.toString(),
        grnValueFormatted: formatInrFromPaise(r.grnValuePaise),
        invoiceTotalPaise: r.invoiceTotalPaise.toString(),
        invoiceTotalFormatted: formatInrFromPaise(r.invoiceTotalPaise),
        variancePaise: r.variancePaise.toString(),
        varianceFormatted: formatInrFromPaise(r.variancePaise),
      })),
    });
  } catch (error) {
    console.error('[Procurement Invoices GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load invoice reconciliation records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.purchaseOrderId || !body.invoiceNumber?.trim() || !body.supplierGstin?.trim()) {
      return NextResponse.json(
        { success: false, error: 'purchaseOrderId, invoiceNumber, and supplierGstin are required.' },
        { status: 400 }
      );
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const organisationId = businesses[0]?.id || session.user.id;

    const match = evaluateThreeWayMatch({
      purchaseOrderId: body.purchaseOrderId,
      invoiceNumber: body.invoiceNumber.trim(),
      poOrderedQuantity: Number(body.poOrderedQuantity),
      poUnitRatePaise: rupeesToPaise(body.poUnitRateRupees),
      poGstRatePercent: Number(body.poGstRatePercent ?? 18),
      grnAcceptedQuantity:
        body.grnAcceptedQuantity !== null && body.grnAcceptedQuantity !== undefined
          ? Number(body.grnAcceptedQuantity)
          : null,
      invoiceBilledQuantity: Number(body.invoiceBilledQuantity),
      invoiceUnitRatePaise: rupeesToPaise(body.invoiceUnitRateRupees),
      invoiceTaxAmountPaise: rupeesToPaise(body.invoiceTaxRupees),
      invoiceTotalAmountPaise: rupeesToPaise(body.invoiceTotalRupees),
    });

    const record = await db.threeWayMatchRecord.create({
      data: {
        organisationId,
        purchaseOrderId: body.purchaseOrderId,
        goodsReceiptId: body.goodsReceiptId || null,
        invoiceNumber: body.invoiceNumber.trim(),
        supplierGstin: body.supplierGstin.trim().toUpperCase(),
        poTotalPaise: match.poTotalPaise,
        grnValuePaise: match.grnValuePaise,
        invoiceTotalPaise: match.invoiceTotalPaise,
        taxAmountPaise: rupeesToPaise(body.invoiceTaxRupees),
        variancePaise: match.variancePaise,
        status: match.status,
        discrepancyReasons: match.discrepancyReasons,
        paymentStatus: match.eligibleForPaymentApproval ? 'APPROVED' : 'ON_HOLD',
        verifiedByUserId: session.user.id,
        verifiedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...record,
          poTotalPaise: record.poTotalPaise.toString(),
          grnValuePaise: record.grnValuePaise.toString(),
          invoiceTotalPaise: record.invoiceTotalPaise.toString(),
          taxAmountPaise: record.taxAmountPaise.toString(),
          variancePaise: record.variancePaise.toString(),
          evaluation: {
            ...match,
            poTotalPaise: match.poTotalPaise.toString(),
            grnValuePaise: match.grnValuePaise.toString(),
            invoiceTotalPaise: match.invoiceTotalPaise.toString(),
            variancePaise: match.variancePaise.toString(),
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'This invoice number has already been submitted for this Purchase Order.' },
        { status: 409 }
      );
    }
    console.error('[Procurement Invoices POST]', error);
    return NextResponse.json({ success: false, error: error.message || 'Three-way match failed' }, { status: 400 });
  }
}
