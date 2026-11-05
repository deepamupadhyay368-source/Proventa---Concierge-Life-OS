import { NextResponse } from 'next/server';
import {
  getConstructionRfqById,
  compareQuotationsForRfq,
  getQuotationsForRfq,
} from '@/lib/procurement/repository';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');

    const rfq = getConstructionRfqById(id);

    if (!rfq) {
      return NextResponse.json(
        { success: false, error: 'RFQ not found' },
        { status: 404 }
      );
    }

    // Security & Confidentiality: If requested from a supplier perspective,
    // redact competitor prices and line-item details.
    let comparison: any = null;
    let supplierQuotations = undefined;

    if (supplierId) {
      const allQuotes = getQuotationsForRfq(rfq.id);
      supplierQuotations = allQuotes.filter((q) => q.supplierId === supplierId);
      comparison = {
        rfq,
        quotationsCount: allQuotes.length,
        status: rfq.status,
      };
    } else {
      comparison = compareQuotationsForRfq(rfq.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        rfq,
        comparison,
        supplierQuotations,
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
