import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { getOrCreateUserBusiness, createBusinessAuditLog } from '@/lib/business/service';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const business = await getOrCreateUserBusiness(user.id);
    const authorizedBusinesses = await getUserAuthorizedBusinesses(user.id);

    return NextResponse.json({
      success: true,
      data: {
        business,
        authorizedBusinesses,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const business = await db.business.findFirst({
      where: { ownerId: user.id },
    });

    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    const allowedFields = [
      'name',
      'tagline',
      'shortDescription',
      'description',
      'website',
      'contactEmail',
      'contactPhone',
      'whatsappNumber',
      'addressLine1',
      'addressLine2',
      'area',
      'city',
      'state',
      'postalCode',
      'serviceAreas',
      'servesPanIndia',
      'authorizedContacts',
    ];

    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    const updated = await db.business.update({
      where: { id: business.id },
      data: updateData,
      include: {
        buyerProfile: true,
        supplierProfile: true,
        documents: true,
      },
    });

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || undefined;
    await createBusinessAuditLog({
      businessId: business.id,
      userId: user.id,
      action: 'BUSINESS_PROFILE_UPDATED',
      details: 'Updated business profile contact and location settings.',
      metadata: updateData,
      ipAddress,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update business profile' },
      { status: 400 }
    );
  }
}
