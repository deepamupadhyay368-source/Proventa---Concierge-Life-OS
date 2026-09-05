import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge } from '@/lib/auth/session';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireConcierge();
    const { id: requestId } = await params;

    const notes = await db.internalNote.findMany({
      where: { requestId },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ notes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireConcierge();
    const { id: requestId } = await params;
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Note content required' }, { status: 400 });
    }

    const note = await db.internalNote.create({
      data: {
        requestId,
        authorId: user.id,
        content: content.trim(),
      },
      include: { author: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}
