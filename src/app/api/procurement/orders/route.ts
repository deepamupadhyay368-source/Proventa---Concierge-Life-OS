import { NextResponse } from 'next/server';
import {
  listBuyerOrders,
  listSupplierOrders,
} from '@/lib/procurement/repository';
import { getSession } from '@/lib/auth/session';
import { resolveSupplierContext, getUserAuthorizedBusinesses } from '@/lib/business/auth-context';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const requestedSupplierId = searchParams.get('supplierId');
    const session = await getSession();

    // Enforce Authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to list purchase orders', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const user = session.user;
    const userRoles = (user.roles as string[]) || [];
    const isAdmin = userRoles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE'].includes(r));

    // Supplier view
    if (requestedSupplierId) {
      const supplierCtx = await resolveSupplierContext({
        user,
        requestedSupplierId,
      });

      if (!supplierCtx.isAuthorized) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You are not authorized to view orders for this supplier', code: 'FORBIDDEN_SUPPLIER_MISMATCH' },
          { status: 403 }
        );
      }

      const orders = listSupplierOrders(supplierCtx.supplierId);
      return NextResponse.json({ success: true, data: orders });
    }

    // Administrator can view any buyer or all orders
    if (isAdmin) {
      const orders = listBuyerOrders(buyerId || 'all');
      return NextResponse.json({ success: true, data: orders });
    }

    // Buyer view: find authorized businesses
    const authorized = await getUserAuthorizedBusinesses(user.id);
    const userBusinessIds = authorized.map((b) => b.id);

    // List orders where user is buyer or belongs to buyer business
    const userOrders = listBuyerOrders(user.id);
    const businessOrders = userBusinessIds.flatMap((bId) => listBuyerOrders(bId));

    // Combine and deduplicate
    const orderMap = new Map();
    for (const ord of [...userOrders, ...businessOrders]) {
      orderMap.set(ord.id, ord);
    }

    return NextResponse.json({
      success: true,
      data: Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    });
  } catch (error) {
    console.error('Error listing orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list orders' },
      { status: 500 }
    );
  }
}
