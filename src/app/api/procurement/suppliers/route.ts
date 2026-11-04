import { NextResponse } from 'next/server';
import {
  listSuppliers,
  registerSupplier,
} from '@/lib/procurement/repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category') || undefined;
    const city = searchParams.get('city') || undefined;
    const search = searchParams.get('search') || undefined;

    const suppliers = listSuppliers({ categorySlug, city, search });
    return NextResponse.json({ success: true, data: suppliers });
  } catch (error) {
    console.error('Error listing suppliers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list suppliers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.businessName || !body.gstin || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Business name, GSTIN, and phone number are required' },
        { status: 400 }
      );
    }

    const supplier = registerSupplier({
      businessName: body.businessName,
      slug: body.slug || body.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      gstin: body.gstin.toUpperCase(),
      panNumber: body.panNumber,
      contactPerson: body.contactPerson || body.businessName,
      email: body.email || 'dealer@proventa.in',
      phone: body.phone,
      address: body.address || 'Ahmedabad, Gujarat',
      city: body.city || 'Ahmedabad',
      state: body.state || 'Gujarat',
      pincode: body.pincode || '380001',
      operatingZones: body.operatingZones || ['All Ahmedabad', 'Gandhinagar'],
      primaryCategories: body.primaryCategories || ['building-materials'],
      brandsOffered: body.brandsOffered || [],
      verificationBadge: body.gstin.length === 15 ? 'GST_VERIFIED' : 'BASIC_VERIFIED',
      bankDetails: body.bankDetails,
    });

    return NextResponse.json({ success: true, data: supplier }, { status: 201 });
  } catch (error: any) {
    console.error('Error registering supplier:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register supplier' },
      { status: 500 }
    );
  }
}
