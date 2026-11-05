import { NextResponse } from 'next/server';
import {
  createConstructionRfq,
  listBuyerRfqs,
  listSupplierMatchingRfqs,
  getProcurementMetrics,
} from '@/lib/procurement/repository';
import { getSession } from '@/lib/auth/session';
import { resolveSupplierContext, getUserAuthorizedBusinesses } from '@/lib/business/auth-context';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const requestedSupplierId = searchParams.get('supplierId');
    const metrics = searchParams.get('metrics');

    if (metrics === 'true') {
      const data = getProcurementMetrics();
      return NextResponse.json({ success: true, data });
    }

    const session = await getSession();

    if (requestedSupplierId) {
      if (session?.user?.id) {
        const supplierCtx = await resolveSupplierContext({
          user: session.user,
          requestedSupplierId,
        });

        if (!supplierCtx.isAuthorized) {
          return NextResponse.json(
            { success: false, error: 'Forbidden: You are not authorized to view RFQs for this supplier' },
            { status: 403 }
          );
        }

        const rfqs = listSupplierMatchingRfqs(supplierCtx.supplierId);
        return NextResponse.json({ success: true, data: rfqs });
      }

      const rfqs = listSupplierMatchingRfqs(requestedSupplierId);
      return NextResponse.json({ success: true, data: rfqs });
    }

    // Buyer view
    let effectiveBuyerId = buyerId || 'all';
    if (session?.user?.id && !session.user.roles?.some((r: string) => ['SUPER_ADMIN', 'ADMIN'].includes(r))) {
      effectiveBuyerId = session.user.id;
    }

    const rfqs = listBuyerRfqs(effectiveBuyerId);
    return NextResponse.json({ success: true, data: rfqs });
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch RFQs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title and at least one material line item are required' },
        { status: 400 }
      );
    }

    if (!body.delivery?.addressLine || !body.delivery?.siteContactPhone) {
      return NextResponse.json(
        { success: false, error: 'Site delivery address and contact phone are required' },
        { status: 400 }
      );
    }

    const session = await getSession();
    const userId = session?.user?.id || body.buyerId || 'user-guest-buyer';
    const userName = session?.user?.name || body.buyerName || 'Construction Buyer';
    const userEmail = session?.user?.email || body.buyerEmail || 'buyer@proventa.in';

    let buyerBusinessId = body.buyerBusinessId;
    if (!buyerBusinessId && session?.user?.id) {
      const businesses = await getUserAuthorizedBusinesses(session.user.id);
      if (businesses.length > 0) {
        buyerBusinessId = businesses[0].id;
      }
    }

    const rfq = createConstructionRfq({
      buyerId: userId,
      buyerBusinessId,
      buyerName: userName,
      buyerEmail: userEmail,
      buyerPhone: body.buyerPhone,
      buyerRole: body.buyerRole || 'CONTRACTOR',
      title: body.title,
      projectType: body.projectType || 'RESIDENTIAL',
      items: body.items,
      delivery: {
        siteName: body.delivery.siteName || 'Construction Site',
        addressLine: body.delivery.addressLine,
        city: body.delivery.city || 'Ahmedabad',
        state: body.delivery.state || 'Gujarat',
        pincode: body.delivery.pincode || '380060',
        siteContactPerson: body.delivery.siteContactPerson || 'Site Engineer',
        siteContactPhone: body.delivery.siteContactPhone,
        siteAccessNotes: body.delivery.siteAccessNotes,
        vehicleAccessibility: body.delivery.vehicleAccessibility || '10-Wheeler Truck',
      },
      requiredDeliveryDate: body.requiredDeliveryDate || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
      urgency: body.urgency || 'STANDARD',
      boqAttachments: body.boqAttachments,
      specialInstructions: body.specialInstructions,
    });

    return NextResponse.json({ success: true, data: rfq }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating RFQ:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create RFQ' },
      { status: 500 }
    );
  }
}
