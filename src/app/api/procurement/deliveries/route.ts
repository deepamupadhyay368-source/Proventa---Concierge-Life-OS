import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const orgIds = businesses.length ? businesses.map((b) => b.id) : [session.user.id];
    const isAdmin = (session.user.roles || []).some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'FOUNDER'].includes(r));

    const deliveries = await db.procurementDelivery.findMany({
      where: isAdmin
        ? {}
        : { OR: [{ organisationId: { in: orgIds } }, { supplierBusinessId: { in: orgIds } }] },
      include: { goodsReceipts: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: deliveries });
  } catch (error) {
    console.error('[Procurement Deliveries GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load deliveries' }, { status: 500 });
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

    // Record Goods Receipt Note (GRN) for a delivery
    if (body.action === 'RECORD_GRN' && body.deliveryId) {
      const delivery = await db.procurementDelivery.findUnique({ where: { id: body.deliveryId } });
      if (!delivery) {
        return NextResponse.json({ success: false, error: 'Delivery record not found' }, { status: 404 });
      }
      if (!orgIds.includes(delivery.organisationId)) {
        return NextResponse.json({ success: false, error: 'Forbidden: Only the buyer organisation can record a GRN' }, { status: 403 });
      }

      const receivedQty = Number(body.receivedQuantity);
      const acceptedQty = Number(body.acceptedQuantity);
      const rejectedQty = Math.max(0, receivedQty - acceptedQty);

      const grnNumber = `GRN-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const newReceivedTotal = delivery.receivedQuantity + receivedQty;
      const newStatus =
        rejectedQty > 0
          ? 'DELIVERY_DISCREPANCY'
          : newReceivedTotal >= delivery.orderedQuantity
          ? 'DELIVERED'
          : 'PARTIALLY_DELIVERED';

      const [grn, updatedDelivery] = await db.$transaction([
        db.goodsReceipt.create({
          data: {
            organisationId: delivery.organisationId,
            deliveryId: delivery.id,
            purchaseOrderId: delivery.purchaseOrderId,
            grnNumber,
            receivedQuantity: receivedQty,
            acceptedQuantity: acceptedQty,
            rejectedQuantity: rejectedQty,
            unit: delivery.unit,
            qualityStatus: rejectedQty > 0 ? 'CONDITIONAL' : 'PASSED',
            inspectionNotes: body.inspectionNotes || null,
            receivedByUserId: session.user.id,
          },
        }),
        db.procurementDelivery.update({
          where: { id: delivery.id },
          data: {
            receivedQuantity: newReceivedTotal,
            actualDeliveryDate: new Date(),
            receivingEmployeeName: body.receivingEmployeeName || session.user.name || 'Site Engineer',
            discrepancyNotes: rejectedQty > 0 ? body.inspectionNotes || 'Quantity/quality variance recorded' : null,
            status: newStatus,
          },
        }),
      ]);

      return NextResponse.json({ success: true, data: { grn, delivery: updatedDelivery } }, { status: 201 });
    }

    // Create new dispatch / delivery record
    if (!body.purchaseOrderId || !body.orderedQuantity || Number(body.orderedQuantity) <= 0) {
      return NextResponse.json(
        { success: false, error: 'purchaseOrderId and positive orderedQuantity are required.' },
        { status: 400 }
      );
    }

    const deliveryCode = `DLV-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const delivery = await db.procurementDelivery.create({
      data: {
        organisationId: orgIds[0],
        purchaseOrderId: body.purchaseOrderId,
        supplierBusinessId: body.supplierBusinessId || orgIds[0],
        deliveryCode,
        status: body.vehicleNumber ? 'DISPATCHED' : 'CONFIRMED',
        dispatchDate: body.vehicleNumber ? new Date() : null,
        expectedDeliveryDate: body.expectedDeliveryDate ? new Date(body.expectedDeliveryDate) : null,
        vehicleNumber: body.vehicleNumber || null,
        transporterName: body.transporterName || null,
        ewayBillRef: body.ewayBillRef || null,
        deliveryChallanRef: body.deliveryChallanRef || null,
        orderedQuantity: Number(body.orderedQuantity),
        dispatchedQuantity: Number(body.dispatchedQuantity || 0),
        unit: body.unit || 'MT',
        supportingDocumentKeys: Array.isArray(body.supportingDocumentKeys) ? body.supportingDocumentKeys : [],
      },
    });

    return NextResponse.json({ success: true, data: delivery }, { status: 201 });
  } catch (error: any) {
    console.error('[Procurement Deliveries POST]', error);
    return NextResponse.json({ success: false, error: error.message || 'Delivery operation failed' }, { status: 500 });
  }
}
