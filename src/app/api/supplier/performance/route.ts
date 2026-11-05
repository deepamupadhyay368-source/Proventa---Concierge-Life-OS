import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { resolveSupplierContext } from '@/lib/business/auth-context';
import { getPublicSupplierStorefront } from '@/lib/supplier-intelligence/service';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const requestedSupplierId = searchParams.get('supplierId');

    const supplierCtx = await resolveSupplierContext({
      user,
      requestedSupplierId,
    });

    if (!supplierCtx.isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You are not authorized to view this performance profile' },
        { status: 403 }
      );
    }

    const storefront = await getPublicSupplierStorefront(supplierCtx.supplierId);

    if (!storefront) {
      return NextResponse.json(
        { success: false, error: 'Supplier profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        supplierId: storefront.id,
        name: storefront.name,
        performance: storefront.performance,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Unauthorized' },
      { status: 401 }
    );
  }
}
