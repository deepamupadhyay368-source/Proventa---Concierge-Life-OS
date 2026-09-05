import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { updatePreferenceSchema } from '@/lib/validation/schemas';
import { trackEvent } from '@/lib/analytics';

export async function GET() {
  try {
    const user = await requireAuth();
    const profile = await db.customerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ preferences: [] });
    }

    const preferences = await db.customerPreference.findMany({
      where: { customerId: profile.id },
      orderBy: { category: 'asc' },
    });

    return NextResponse.json({ preferences });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    let profile = await db.customerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await db.customerProfile.create({ data: { userId: user.id } });
    }

    const body = await req.json();
    const parsed = updatePreferenceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { category, key, value } = parsed.data;

    const preference = await db.customerPreference.upsert({
      where: {
        customerId_category_key: {
          customerId: profile.id,
          category,
          key,
        },
      },
      update: { value, source: 'explicit' },
      create: {
        customerId: profile.id,
        category,
        key,
        value,
        source: 'explicit',
      },
    });

    void trackEvent({
      event: 'preference_updated',
      userId: user.id,
      properties: { category, key },
    });

    return NextResponse.json({ success: true, preference });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save preference' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const profile = await db.customerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { id } = await req.json();
    await db.customerPreference.deleteMany({
      where: { id, customerId: profile.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete' }, { status: 500 });
  }
}
