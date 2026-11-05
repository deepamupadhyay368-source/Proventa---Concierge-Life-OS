import { NextRequest, NextResponse } from 'next/server';
import { getPublicSupplierStorefront } from '@/lib/supplier-intelligence/service';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSession();

    let buyerBusinessId: string | undefined;
    if (session?.user?.id) {
      const businesses = await getUserAuthorizedBusinesses(session.user.id);
      buyerBusinessId = businesses[0]?.id;
    }

    const storefront = await getPublicSupplierStorefront(slug, buyerBusinessId);

    if (!storefront) {
      return NextResponse.json(
        { success: false, error: 'Supplier storefront not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: storefront,
    });
  } catch (error: any) {
    console.error('Error fetching supplier storefront:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch supplier profile' },
      { status: 500 }
    );
  }
}
