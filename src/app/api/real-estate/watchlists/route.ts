import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

const createWatchlistSchema = z.object({
  targetType: z.enum(['PROPERTY', 'PROJECT', 'LOCALITY', 'SEGMENT']),
  targetIdOrSlug: z.string().trim().min(1).max(160),
  targetLabel: z.string().trim().min(2).max(180),
  alertFrequency: z.enum(['IMMEDIATE', 'DAILY', 'WEEKLY']).default('WEEKLY'),
  emailEnabled: z.boolean().default(true),
  inAppEnabled: z.boolean().default(true),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const items = await db.realEstateWatchlist.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ watchlists: items });
  } catch (err) {
    console.error('[GET /api/real-estate/watchlists]', err);
    return NextResponse.json({ error: 'Failed to load watchlists.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createWatchlistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid watchlist payload.', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const item = await db.realEstateWatchlist.upsert({
      where: {
        userId_targetType_targetIdOrSlug: {
          userId: session.user.id,
          targetType: d.targetType,
          targetIdOrSlug: d.targetIdOrSlug,
        },
      },
      update: {
        targetLabel: d.targetLabel,
        alertFrequency: d.alertFrequency,
        emailEnabled: d.emailEnabled,
        inAppEnabled: d.inAppEnabled,
      },
      create: {
        userId: session.user.id,
        targetType: d.targetType,
        targetIdOrSlug: d.targetIdOrSlug,
        targetLabel: d.targetLabel,
        alertFrequency: d.alertFrequency,
        emailEnabled: d.emailEnabled,
        inAppEnabled: d.inAppEnabled,
      },
    });

    return NextResponse.json({ watchlist: item }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/real-estate/watchlists]', err);
    return NextResponse.json({ error: 'Failed to save watchlist entry.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id')?.trim();
    if (!id) {
      return NextResponse.json({ error: 'Watchlist id is required.' }, { status: 400 });
    }

    const existing = await db.realEstateWatchlist.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Watchlist entry not found.' }, { status: 404 });
    }
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    await db.realEstateWatchlist.delete({ where: { id } });
    return NextResponse.json({ deleted: true, id });
  } catch (err) {
    console.error('[DELETE /api/real-estate/watchlists]', err);
    return NextResponse.json({ error: 'Failed to remove watchlist entry.' }, { status: 500 });
  }
}
