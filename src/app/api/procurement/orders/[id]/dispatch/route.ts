import { NextResponse } from 'next/server';
import {
  getPurchaseOrderById,
  getPurchaseOrderByIdAsync,
  updateOrderDispatchDetails,
  advanceOrderDeliveryStage,
} from '@/lib/procurement/repository';
import type { DeliveryTrackingStage } from '@/lib/procurement/types';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';
import { createBusinessAuditLog } from '@/lib/business/service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    let order = getPurchaseOrderById(orderId);
    if (!order) {
      order = await getPurchaseOrderByIdAsync(orderId);
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Purchase Order not found' },
        { status: 404 }
      );
    }

    // 1. Enforce Authentication
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to update dispatch details', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const user = session.user;
    const userRoles = (user.roles as string[]) || [];
    const isAdmin = userRoles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE'].includes(r));

    // 2. Enforce Supplier Authorization Check
    if (!isAdmin) {
      const authorized = await getUserAuthorizedBusinesses(user.id);
      const authBizIds = new Set(authorized.map((b) => b.id));

      const isAssignedSupplier =
        (order.supplierId && (order.supplierId === user.id || authBizIds.has(order.supplierId))) ||
        (order.supplierBusinessId && authBizIds.has(order.supplierBusinessId));

      if (!isAssignedSupplier) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden: Only the assigned supplier can record dispatch details or advance shipping stages',
            code: 'FORBIDDEN_NOT_ORDER_SUPPLIER',
          },
          { status: 403 }
        );
      }
    }

    const body = await request.json();

    if (body.action === 'advanceStage') {
      if (!body.stage) {
        return NextResponse.json(
          { success: false, error: 'Target delivery stage is required' },
          { status: 400 }
        );
      }

      const updated = advanceOrderDeliveryStage({
        orderId,
        stage: body.stage as DeliveryTrackingStage,
        note: body.note || `Stage updated to ${body.stage}`,
        updatedBy: body.updatedBy || user.name || user.email || 'Logistics Coordinator',
        actorRole: body.actorRole || 'TRANSPORTER',
      });

      void createBusinessAuditLog({
        businessId: order.supplierBusinessId || 'platform',
        userId: user.id,
        action: 'ORDER_STAGE_ADVANCED',
        details: `Stage for PO ${order.referenceCode} advanced to ${body.stage}`,
        metadata: { orderId: order.id, stage: body.stage },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    if (!body.vehicleNumber || !body.driverName || !body.driverPhone) {
      return NextResponse.json(
        { success: false, error: 'Vehicle number, driver name, and driver phone are required' },
        { status: 400 }
      );
    }

    const updatedOrder = updateOrderDispatchDetails({
      orderId,
      dispatch: {
        vehicleType: body.vehicleType || 'Tata Ace / 10-Wheeler',
        vehicleNumber: body.vehicleNumber,
        driverName: body.driverName,
        driverPhone: body.driverPhone,
        transporterName: body.transporterName || 'Direct Supplier Fleet',
        eWayBillNumber: body.eWayBillNumber,
        dispatchDateTime: body.dispatchDateTime || new Date().toISOString(),
        estimatedDeliveryTime: body.estimatedDeliveryTime || new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        trackingNotes: body.trackingNotes,
      },
      advanceToStatus: body.advanceToStatus || 'DISPATCHED',
      updatedBy: body.updatedBy || user.name || user.email || 'Supplier Dispatch Desk',
      actorRole: body.actorRole || 'SUPPLIER',
    });

    void createBusinessAuditLog({
      businessId: order.supplierBusinessId || 'platform',
      userId: user.id,
      action: 'ORDER_DISPATCH_RECORDED',
      details: `Dispatch details recorded for PO ${order.referenceCode} (Vehicle: ${body.vehicleNumber})`,
      metadata: { orderId: order.id, vehicleNumber: body.vehicleNumber, driverName: body.driverName },
    });

    return NextResponse.json({
      success: true,
      message: 'Dispatch details recorded and tracking stage updated',
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error updating order dispatch:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update dispatch details' },
      { status: 500 }
    );
  }
}
