import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const targetWorkspace = body.workspace; // 'BUYER' | 'SUPPLIER'

    if (!['BUYER', 'SUPPLIER'].includes(targetWorkspace)) {
      return NextResponse.json({ success: false, error: 'Invalid target workspace' }, { status: 400 });
    }

    const business = await db.business.findFirst({
      where: { ownerId: user.id },
      include: { buyerProfile: true, supplierProfile: true },
    });

    if (!business) {
      return NextResponse.json({ success: false, error: 'Business profile not found' }, { status: 404 });
    }

    // Return target dashboard route
    const redirectUrl = targetWorkspace === 'BUYER' ? '/buyer/dashboard' : '/supplier/dashboard';

    return NextResponse.json({
      success: true,
      activeWorkspace: targetWorkspace,
      redirectUrl,
      businessName: business.name,
      platformRole: business.platformRole,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Unauthorized' },
      { status: 401 }
    );
  }
}
