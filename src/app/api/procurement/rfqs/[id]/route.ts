import { NextResponse } from 'next/server';
import {
  getConstructionRfqById,
  compareQuotationsForRfq,
} from '@/lib/procurement/repository';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rfq = getConstructionRfqById(id);

    if (!rfq) {
      return NextResponse.json(
        { success: false, error: 'RFQ not found' },
        { status: 404 }
      );
    }

    const comparison = compareQuotationsForRfq(rfq.id);

    return NextResponse.json({
      success: true,
      data: {
        rfq,
        comparison,
      },
    });
  } catch (error) {
    console.error('Error fetching RFQ detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch RFQ details' },
      { status: 500 }
    );
  }
}
