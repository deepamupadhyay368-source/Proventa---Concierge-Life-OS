import { NextResponse } from 'next/server';
import {
  listBuyerOrders,
  listSupplierOrders,
} from '@/lib/procurement/repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const supplierId = searchParams.get('supplierId');

    if (supplierId) {
      const orders = listSupplierOrders(supplierId);
      return NextResponse.json({ success: true, data: orders });
    }

    const orders = listBuyerOrders(buyerId || 'all');
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error listing orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list orders' },
      { status: 500 }
    );
  }
}
