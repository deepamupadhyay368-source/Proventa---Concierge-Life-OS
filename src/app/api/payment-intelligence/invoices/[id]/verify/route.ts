import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { PaymentIntelligenceService } from '@/lib/payment-intelligence/service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { verificationStatus, notes } = body;

    if (!verificationStatus) {
      return NextResponse.json({ success: false, error: 'verificationStatus is required' }, { status: 400 });
    }

    const roles: string[] = (session.user as any)?.roles || [];
    const actorRole = roles.includes('ADMIN') ? 'ADMIN' : (roles.includes('BUYER') ? 'BUYER' : 'SUPPLIER');
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim();

    const updated = await PaymentIntelligenceService.verifyRecord({
      invoiceId: id,
      verifiedByUserId: session.user.id,
      actorRole,
      verificationStatus,
      notes,
      ipAddress,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Verification update failed' },
      { status: 500 }
    );
  }
}
