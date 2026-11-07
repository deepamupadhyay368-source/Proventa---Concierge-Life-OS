import { NextResponse } from 'next/server';
import {
  getPurchaseOrderById,
  getPurchaseOrderByIdAsync,
  confirmOrderDeliveryReceipt,
} from '@/lib/procurement/repository';
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
        { success: false, error: 'Authentication required to confirm delivery receipt', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const user = session.user;
    const userRoles = (user.roles as string[]) || [];
    const isAdmin = userRoles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE'].includes(r));

    // 2. Enforce Buyer Authorization Check
    if (!isAdmin) {
      const authorized = await getUserAuthorizedBusinesses(user.id);
      const authBizIds = new Set(authorized.map((b) => b.id));

      const isIssuingBuyer =
        (order.buyerId && (order.buyerId === user.id || authBizIds.has(order.buyerId))) ||
        (order.buyerBusinessId && authBizIds.has(order.buyerBusinessId));

      if (!isIssuingBuyer) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden: Only the issuing buyer can confirm site delivery receipt and close this order',
            code: 'FORBIDDEN_NOT_ORDER_BUYER',
          },
          { status: 403 }
        );
      }
    }

    const body = await request.json();

    if (!body.receivedBy || !body.receiverPhone) {
      return NextResponse.json(
        { success: false, error: 'Receiver name and phone are required for physical site delivery sign-off' },
        { status: 400 }
      );
    }

    const confirmedOrder = confirmOrderDeliveryReceipt({
      orderId,
      buyerName: body.buyerName || user.name || body.receivedBy,
      confirmation: {
        confirmedReceivedQuantity: body.confirmedReceivedQuantity || '100% Full Order Received',
        receivedAt: body.receivedAt || new Date().toISOString(),
        receivedBy: body.receivedBy,
        receiverPhone: body.receiverPhone,
        hasDamageOrShortage: Boolean(body.hasDamageOrShortage),
        shortageDamageNotes: body.shortageDamageNotes,
        proofPhotos: body.proofPhotos || [],
        supplierRating: Math.max(1, Math.min(5, body.supplierRating || 5)),
        buyerFeedback: body.buyerFeedback || 'Goods received in satisfactory condition.',
      },
    });

    void createBusinessAuditLog({
      businessId: order.buyerBusinessId || 'platform',
      userId: user.id,
      action: 'ORDER_DELIVERY_CONFIRMED',
      details: `Delivery receipt confirmed for PO ${order.referenceCode} by ${body.receivedBy}`,
      metadata: {
        orderId: order.id,
        receivedBy: body.receivedBy,
        rating: body.supplierRating || 5,
        hasDamage: Boolean(body.hasDamageOrShortage),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery receipt verified, supplier rated, and order closed successfully',
      data: confirmedOrder,
    });
  } catch (error: any) {
    console.error('Error confirming delivery receipt:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to confirm receipt' },
      { status: 500 }
    );
  }
}
