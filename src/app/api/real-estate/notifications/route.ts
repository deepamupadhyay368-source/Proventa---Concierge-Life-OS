import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

const markReadSchema = z.object({
  id: z.string().trim().optional(),
  markAllRead: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const notifications = await db.realEstateNotification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      unreadCount: notifications.filter((n) => !n.isRead).length,
      notifications,
    });
  } catch (err) {
    console.error('[GET /api/real-estate/notifications]', err);
    return NextResponse.json({ error: 'Failed to load notifications.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = markReadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    if (parsed.data.markAllRead) {
      await db.realEstateNotification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ updated: 'all' });
    }

    if (parsed.data.id) {
      const existing = await db.realEstateNotification.findUnique({
        where: { id: parsed.data.id },
        select: { id: true, userId: true },
      });
      if (!existing) return NextResponse.json({ error: 'Notification not found.' }, { status: 404 });
      if (existing.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
      }
      await db.realEstateNotification.update({
        where: { id: existing.id },
        data: { isRead: true },
      });
      return NextResponse.json({ updated: existing.id });
    }

    return NextResponse.json({ error: 'Provide id or markAllRead: true.' }, { status: 400 });
  } catch (err) {
    console.error('[PATCH /api/real-estate/notifications]', err);
    return NextResponse.json({ error: 'Failed to update notifications.' }, { status: 500 });
  }
}
