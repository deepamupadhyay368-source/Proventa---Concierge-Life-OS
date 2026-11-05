import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { bulkUploadSupplierProducts } from '@/lib/supplier-intelligence/service';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (!body.products || !Array.isArray(body.products) || body.products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'A valid products array is required' },
        { status: 400 }
      );
    }

    const business = await db.business.findFirst({
      where: { ownerId: user.id },
      include: { supplierProfile: true },
    });

    let supplierProfileId = business?.supplierProfile?.id;
    if (!supplierProfileId) {
      if (business) {
        const createdSp = await db.supplierProfile.create({
          data: {
            businessId: business.id,
            supplierType: 'Distributor',
            operatingCategories: ['building-materials'],
          },
        });
        supplierProfileId = createdSp.id;
      } else {
        supplierProfileId = `sp_${user.id}`;
      }
    }

    const result = await bulkUploadSupplierProducts(
      supplierProfileId,
      body.products,
      user.id
    );

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${result.addedCount} catalogue products`,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Bulk upload failed' },
      { status: 400 }
    );
  }
}
