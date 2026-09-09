import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const task = await db.task.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const isOwner = task.customer?.userId === user.id;
    const isStaff = user.roles.some((r) => ['CONCIERGE', 'CONCIERGE_MANAGER', 'ADMIN'].includes(r));
    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const options = (task.proposedOptions || []) as any[];

    return NextResponse.json({
      taskId: task.id,
      publicId: task.publicId,
      status: task.status,
      count: options.length,
      options,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}