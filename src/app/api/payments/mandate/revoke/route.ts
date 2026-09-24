import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const customerProfile = await db.customerProfile.findFirst({
      where: { userId: user.id },
    });

    if (!customerProfile) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    const updatedProfile = await db.customerPaymentProfile.updateMany({
      where: { customerId: customerProfile.id },
      data: {
        mandateStatus: 'REVOKED',
        mandateRevokedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'UPI Autopay mandate has been revoked.',
      count: updatedProfile.count,
    });
  } catch (error: any) {
    console.error('[POST /api/payments/mandate/revoke]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to revoke mandate' },
      { status: 500 }
    );
  }
}
