import { NextRequest, NextResponse } from 'next/server';
import { searchSuppliers } from '@/lib/supplier-intelligence/service';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await getSession();

    let buyerBusinessId: string | undefined;
    if (session?.user?.id) {
      const businesses = await getUserAuthorizedBusinesses(session.user.id);
      buyerBusinessId = businesses[0]?.id;
    }

    const query = searchParams.get('q') || searchParams.get('query') || undefined;
    const category = searchParams.get('category') || undefined;
    const subcategory = searchParams.get('subcategory') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const grade = searchParams.get('grade') || undefined;
    const supplierType = searchParams.get('supplierType') || undefined;
    const district = searchParams.get('district') || undefined;
    const state = searchParams.get('state') || undefined;
    const pincode = searchParams.get('pincode') || undefined;
    const gstVerifiedOnly = searchParams.get('gstVerified') === 'true';
    const proventaVerifiedOnly = searchParams.get('proventaVerified') === 'true';
    const panIndiaOnly = searchParams.get('panIndia') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await searchSuppliers(
      {
        query,
        category,
        subcategory,
        brand,
        grade,
        supplierType,
        district,
        state,
        pincode,
        gstVerifiedOnly,
        proventaVerifiedOnly,
        panIndiaOnly,
        page,
        limit,
      },
      buyerBusinessId
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error searching suppliers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search suppliers' },
      { status: 500 }
    );
  }
}
