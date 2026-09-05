import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const user = await requireConcierge();

    const requests = await db.conciergeRequest.findMany({
      where: { deletedAt: null },
      include: {
        customer: { include: { user: { select: { name: true, email: true } }, preferences: true } },
        category: true,
        assignments: {
          where: { unassignedAt: null },
          include: { concierge: { include: { user: { select: { id: true, name: true } } } } },
        },
        slaRecord: true,
        approvals: { where: { status: 'PENDING' } },
      },
      orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}
