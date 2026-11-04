import { NextResponse } from 'next/server';
import { selectQuotationAndCreatePo } from '@/lib/procurement/repository';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quotationId } = await params;
    const body = await request.json();

    if (!body.rfqId) {
      return NextResponse.json(
        { success: false, error: 'RFQ ID is required' },
        { status: 400 }
      );
    }

    if (!body.buyerConfirmed) {
      return NextResponse.json(
        { success: false, error: 'Explicit buyer confirmation is mandatory' },
        { status: 400 }
      );
    }

    const order = selectQuotationAndCreatePo({
      rfqId: body.rfqId,
      quotationId,
      buyerConfirmed: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Quotation accepted and Purchase Order generated successfully',
      data: order,
    });
  } catch (error: any) {
    console.error('Error selecting quotation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to select quotation' },
      { status: 500 }
    );
  }
}
