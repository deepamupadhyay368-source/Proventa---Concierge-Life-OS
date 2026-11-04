import { NextResponse } from 'next/server';
import { getPurchaseOrderById } from '@/lib/procurement/repository';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = getPurchaseOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Purchase Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
