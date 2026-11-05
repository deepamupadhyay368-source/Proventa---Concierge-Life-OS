import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { resolveSupplierContext } from '@/lib/business/auth-context';
import { db } from '@/lib/db';
import { addSupplierProduct } from '@/lib/supplier-intelligence/service';

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
        { success: false, error: 'Forbidden: You are not authorized to view this supplier catalogue' },
        { status: 403 }
      );
    }

    // Fetch supplier products
    const business = await db.business.findFirst({
      where: {
        OR: [{ id: supplierCtx.supplierId }, { slug: supplierCtx.supplierId }, { ownerId: user.id }],
      },
      include: {
        supplierProfile: {
          include: {
            products: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    const products = business?.supplierProfile?.products || [];
    return NextResponse.json({ success: true, data: products });
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

    if (!body.name || !body.category || !body.unit) {
      return NextResponse.json(
        { success: false, error: 'Product name, category, and unit are mandatory' },
        { status: 400 }
      );
    }

    const business = await db.business.findFirst({
      where: { ownerId: user.id },
      include: { supplierProfile: true },
    });

    let supplierProfileId = business?.supplierProfile?.id;
    if (!supplierProfileId) {
      // Auto-create supplier profile if missing
      if (business) {
        const createdSp = await db.supplierProfile.create({
          data: {
            businessId: business.id,
            supplierType: 'Distributor',
            operatingCategories: [body.category],
          },
        });
        supplierProfileId = createdSp.id;
      } else {
        supplierProfileId = `sp_${user.id}`;
      }
    }

    const product = await addSupplierProduct(
      supplierProfileId,
      {
        name: body.name,
        category: body.category,
        subcategory: body.subcategory,
        description: body.description,
        brand: body.brand,
        grade: body.grade,
        standards: body.standards,
        specifications: body.specifications,
        unit: body.unit,
        indicativePrice: body.indicativePrice ? parseFloat(body.indicativePrice) : undefined,
        moq: body.moq ? parseInt(body.moq, 10) : undefined,
        availableQuantity: body.availableQuantity ? parseFloat(body.availableQuantity) : undefined,
        hsnCode: body.hsnCode,
        gstRate: body.gstRate ? parseFloat(body.gstRate) : 18,
        images: body.images,
        warehouses: body.warehouses,
        deliveryLocations: body.deliveryLocations,
      },
      user.id
    );

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 400 }
    );
  }
}
