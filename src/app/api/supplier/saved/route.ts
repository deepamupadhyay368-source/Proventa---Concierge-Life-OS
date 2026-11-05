import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';
import { toggleSaveSupplier, listSavedSuppliers } from '@/lib/supplier-intelligence/service';

export async function GET() {
  try {
    const user = await requireAuth();
    const businesses = await getUserAuthorizedBusinesses(user.id);
    const buyerBusinessId = businesses[0]?.id || user.id;

    const saved = await listSavedSuppliers(buyerBusinessId);
    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (!body.supplierBusinessId) {
      return NextResponse.json(
        { success: false, error: 'supplierBusinessId is required' },
        { status: 400 }
      );
    }

    const businesses = await getUserAuthorizedBusinesses(user.id);
    const buyerBusinessId = businesses[0]?.id || user.id;

    const result = await toggleSaveSupplier(
      buyerBusinessId,
      body.supplierBusinessId,
      body.notes,
      body.tags
    );

    return NextResponse.json({
      success: true,
      message: result.isSaved ? 'Supplier saved to favorites' : 'Supplier removed from favorites',
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save supplier' },
      { status: 400 }
    );
  }
}
