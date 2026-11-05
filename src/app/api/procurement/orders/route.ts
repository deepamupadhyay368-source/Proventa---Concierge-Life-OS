import { NextResponse } from 'next/server';
import {
  listBuyerOrders,
  listSupplierOrders,
} from '@/lib/procurement/repository';
import { getSession } from '@/lib/auth/session';
import { resolveSupplierContext } from '@/lib/business/auth-context';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const requestedSupplierId = searchParams.get('supplierId');
    const session = await getSession();

    if (requestedSupplierId) {
      if (session?.user?.id) {
        const supplierCtx = await resolveSupplierContext({
          user: session.user,
          requestedSupplierId,
        });

        if (!supplierCtx.isAuthorized) {
          return NextResponse.json(
            { success: false, error: 'Forbidden: You are not authorized to view orders for this supplier' },
            { status: 403 }
          );
        }

        const orders = listSupplierOrders(supplierCtx.supplierId);
        return NextResponse.json({ success: true, data: orders });
      }

      const orders = listSupplierOrders(requestedSupplierId);
      return NextResponse.json({ success: true, data: orders });
    }

    let effectiveBuyerId = buyerId || 'all';
    if (session?.user?.id && !session.user.roles?.some((r: string) => ['SUPER_ADMIN', 'ADMIN'].includes(r))) {
      effectiveBuyerId = session.user.id;
    }

    const orders = listBuyerOrders(effectiveBuyerId);
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error listing orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list orders' },
      { status: 500 }
    );
  }
}
