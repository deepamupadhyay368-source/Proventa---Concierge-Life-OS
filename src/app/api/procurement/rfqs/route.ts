import { NextResponse } from 'next/server';
import {
  createConstructionRfq,
  listBuyerRfqs,
  listSupplierMatchingRfqs,
  getProcurementMetrics,
} from '@/lib/procurement/repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const supplierId = searchParams.get('supplierId');
    const metrics = searchParams.get('metrics');

    if (metrics === 'true') {
      const data = getProcurementMetrics();
      return NextResponse.json({ success: true, data });
    }

    if (supplierId) {
      const rfqs = listSupplierMatchingRfqs(supplierId);
      return NextResponse.json({ success: true, data: rfqs });
    }

    const rfqs = listBuyerRfqs(buyerId || 'all');
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

    const rfq = createConstructionRfq({
      buyerId: body.buyerId || 'user-guest-buyer',
      buyerName: body.buyerName || 'Construction Buyer',
      buyerEmail: body.buyerEmail || 'buyer@proventa.in',
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
