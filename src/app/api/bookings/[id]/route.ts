import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { isAppError } from '@/lib/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await requireAuth();
    const resolvedParams = await Promise.resolve(params);
    const bookingId = resolvedParams.id;

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        provider: true,
        payment: true,
        request: {
          select: {
            id: true,
            rawInput: true,
            aiSummary: true,
            status: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isOwner = booking.customer?.userId === user.id;
    const isStaff = user.roles.some((r) =>
      ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE_MANAGER', 'CONCIERGE'].includes(r)
    );

    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: 'Unauthorized access to booking' }, { status: 403 });
    }

    return NextResponse.json({ booking });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}
