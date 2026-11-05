import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { inviteSupplierToRfq } from '@/lib/supplier-intelligence/service';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (!body.rfqId || !body.supplierBusinessId) {
      return NextResponse.json(
        { success: false, error: 'rfqId and supplierBusinessId are required' },
        { status: 400 }
      );
    }

    const result = await inviteSupplierToRfq(
      body.rfqId,
      body.supplierBusinessId,
      user.id
    );

    return NextResponse.json({
      success: true,
      message: 'Supplier successfully invited to RFQ opportunity',
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to invite supplier' },
      { status: 400 }
    );
  }
}
