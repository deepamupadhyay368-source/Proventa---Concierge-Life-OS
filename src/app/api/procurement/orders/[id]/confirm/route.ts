import { NextResponse } from 'next/server';
import { confirmOrderDeliveryReceipt } from '@/lib/procurement/repository';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();

    if (!body.receivedBy || !body.receiverPhone) {
      return NextResponse.json(
        { success: false, error: 'Receiver name and phone are required for physical site delivery sign-off' },
        { status: 400 }
      );
    }

    const order = confirmOrderDeliveryReceipt({
      orderId,
      buyerName: body.buyerName || body.receivedBy,
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

    return NextResponse.json({
      success: true,
      message: 'Delivery receipt verified, supplier rated, and order closed successfully',
      data: order,
    });
  } catch (error: any) {
    console.error('Error confirming delivery receipt:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to confirm receipt' },
      { status: 500 }
    );
  }
}
