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
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to access procurement requirements', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const requestedSupplierId = searchParams.get('supplierId');
    const metrics = searchParams.get('metrics');

    const user = session.user;
    const userRoles = (user.roles as string[]) || [];
    const isAdmin = userRoles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'FOUNDER'].includes(r));

    if (metrics === 'true') {
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Administrator privileges required to access platform metrics', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }
      const data = getProcurementMetrics();
      return NextResponse.json({ success: true, data });
    }

    if (requestedSupplierId) {
      const supplierCtx = await resolveSupplierContext({
        user,
        requestedSupplierId,
      });

      if (!supplierCtx.isAuthorized && !isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You are not authorized to view RFQs for this supplier', code: 'FORBIDDEN_SUPPLIER_MISMATCH' },
          { status: 403 }
        );
      }

      const rfqs = listSupplierMatchingRfqs(supplierCtx.supplierId || requestedSupplierId);
      return NextResponse.json({ success: true, data: rfqs });
    }

    // Buyer view: strictly authorized
    if (isAdmin) {
      const rfqs = listBuyerRfqs(buyerId || 'all');
      return NextResponse.json({ success: true, data: rfqs });
    }

    // For non-admin buyers, scope strictly to user ID and their authorized businesses
    const authorized = await getUserAuthorizedBusinesses(user.id);
    const userBusinessIds = authorized.map((b) => b.id);
    const userRfqs = listBuyerRfqs(user.id);
    const businessRfqs = userBusinessIds.flatMap((bId) => listBuyerRfqs(bId));
    
    // Deduplicate by id
    const seen = new Set<string>();
    const combined: typeof userRfqs = [];
    for (const rfq of [...userRfqs, ...businessRfqs]) {
      if (!seen.has(rfq.id)) {
        seen.add(rfq.id);
        combined.push(rfq);
      }
    }

    return NextResponse.json({ success: true, data: combined });
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
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in to create a requirement.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Requirement title is required' },
        { status: 400 }
      );
    }

    if (body.title.trim().length > 200) {
      return NextResponse.json(
        { success: false, error: 'Title cannot exceed 200 characters' },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one material line item is required' },
        { status: 400 }
      );
    }

    if (body.items.length > 20) {
      return NextResponse.json(
        { success: false, error: 'Maximum 20 line items allowed per RFQ' },
        { status: 400 }
      );
    }

    for (const item of body.items) {
      if (!item.materialName || !item.materialName.trim()) {
        return NextResponse.json(
          { success: false, error: 'Each line item must have a valid material name' },
          { status: 400 }
        );
      }
      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        return NextResponse.json(
          { success: false, error: `Invalid quantity for ${item.materialName}. Quantity must be a positive number.` },
          { status: 400 }
        );
      }
    }

    if (!body.delivery?.addressLine || !body.delivery?.siteContactPhone) {
      return NextResponse.json(
        { success: false, error: 'Site delivery address and contact phone are required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const userName = session.user.name || body.buyerName || 'Construction Buyer';
    const userEmail = session.user.email || body.buyerEmail || 'buyer@proventa.in';

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
