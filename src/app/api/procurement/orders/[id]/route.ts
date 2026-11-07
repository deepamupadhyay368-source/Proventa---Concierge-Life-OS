import { NextResponse } from 'next/server';
import { getPurchaseOrderById, getPurchaseOrderByIdAsync } from '@/lib/procurement/repository';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';
import { createBusinessAuditLog } from '@/lib/business/service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let order = getPurchaseOrderById(id);
    if (!order) {
      order = await getPurchaseOrderByIdAsync(id);
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
        { success: false, error: 'Authentication required to access Purchase Order', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const user = session.user;
    const userRoles = (user.roles as string[]) || [];
    const isAdmin = userRoles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE'].includes(r));

    // 2. Administrator Access with Audit Logging
    if (isAdmin) {
      void createBusinessAuditLog({
        businessId: order.buyerBusinessId || 'platform',
        userId: user.id,
        action: 'ADMIN_PO_INSPECTION',
        details: `Administrator ${user.email} inspected Purchase Order ${order.referenceCode} (${order.id})`,
        metadata: { orderId: order.id, referenceCode: order.referenceCode },
      });

      return NextResponse.json({
        success: true,
        data: order,
        accessRole: 'ADMINISTRATOR',
      });
    }

    // 3. Resolve user authorized businesses
    const authorized = await getUserAuthorizedBusinesses(user.id);
    const authBizIds = new Set(authorized.map((b) => b.id));

    // Check Buyer Perspective
    const isBuyer =
      (order.buyerId && (order.buyerId === user.id || authBizIds.has(order.buyerId))) ||
      (order.buyerBusinessId && authBizIds.has(order.buyerBusinessId));

    // Check Supplier Perspective
    const isSupplier =
      (order.supplierId && (order.supplierId === user.id || authBizIds.has(order.supplierId))) ||
      (order.supplierBusinessId && authBizIds.has(order.supplierBusinessId));

    if (!isBuyer && !isSupplier) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: You do not have permission to view this Purchase Order',
          code: 'FORBIDDEN_TENANT_ISOLATION',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
      accessRole: isBuyer ? 'BUYER' : 'SUPPLIER',
    });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
