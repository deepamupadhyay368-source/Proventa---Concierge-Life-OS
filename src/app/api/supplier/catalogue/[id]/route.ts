import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { updateSupplierProduct, deleteSupplierProduct } from '@/lib/supplier-intelligence/service';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: productId } = await params;
    const body = await req.json();

    const business = await db.business.findFirst({
      where: { ownerId: user.id },
      include: { supplierProfile: true },
    });

    const supplierProfileId = business?.supplierProfile?.id || `sp_${user.id}`;

    const updated = await updateSupplierProduct(productId, supplierProfileId, body, user.id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: productId } = await params;

    const business = await db.business.findFirst({
      where: { ownerId: user.id },
      include: { supplierProfile: true },
    });

    const supplierProfileId = business?.supplierProfile?.id || `sp_${user.id}`;
    await deleteSupplierProduct(productId, supplierProfileId, user.id);

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete product' },
      { status: 400 }
    );
  }
}
