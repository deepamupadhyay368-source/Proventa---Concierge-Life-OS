import { NextResponse } from 'next/server';
import {
  updateOrderDispatchDetails,
  advanceOrderDeliveryStage,
} from '@/lib/procurement/repository';
import type { DeliveryTrackingStage } from '@/lib/procurement/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
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
        updatedBy: body.updatedBy || 'Logistics Coordinator',
        actorRole: body.actorRole || 'TRANSPORTER',
      });

      return NextResponse.json({ success: true, data: updated });
    }

    if (!body.vehicleNumber || !body.driverName || !body.driverPhone) {
      return NextResponse.json(
        { success: false, error: 'Vehicle number, driver name, and driver phone are required' },
        { status: 400 }
      );
    }

    const order = updateOrderDispatchDetails({
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
      updatedBy: body.updatedBy || 'Supplier Dispatch Desk',
      actorRole: body.actorRole || 'SUPPLIER',
    });

    return NextResponse.json({
      success: true,
      message: 'Dispatch details recorded and tracking stage updated',
      data: order,
    });
  } catch (error: any) {
    console.error('Error updating order dispatch:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update dispatch details' },
      { status: 500 }
    );
  }
}
