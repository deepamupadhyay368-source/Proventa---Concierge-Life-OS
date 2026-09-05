import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { createProviderSchema } from '@/lib/validation/schemas';
import { createAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    await requireAdmin();
    const providers = await db.provider.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        city: true,
        services: true,
        verifications: { take: 1, orderBy: { verifiedAt: 'desc' } },
      },
      orderBy: { reliabilityScore: 'desc' },
    });
    return NextResponse.json({ providers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const parsed = createProviderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { name, categoryId, address, phone, email, website, bookingMethod, notes } = parsed.data;

    const city = await db.city.findFirst({ where: { slug: 'ahmedabad' } });

    const provider = await db.provider.create({
      data: {
        name,
        cityId: city?.id || 'city_ahm',
        categoryId,
        address: address || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        bookingMethod: bookingMethod as any,
        status: 'ACTIVE',
        reliabilityScore: 90,
        notes: notes || null,
        verifications: {
          create: {
            verifiedBy: admin.id,
            verifiedAt: new Date(),
            contactCheck: true,
            serviceCheck: true,
            notes: 'Verified via admin onboarding',
          },
        },
      },
    });

    void createAuditLog({
      actorId: admin.id,
      action: 'CREATE',
      resourceType: 'Provider',
      resourceId: provider.id,
    });

    return NextResponse.json({ success: true, provider }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create provider' }, { status: 500 });
  }
}
