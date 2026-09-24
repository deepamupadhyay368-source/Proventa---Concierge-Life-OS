import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { isAppError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const customerProfile = await db.customerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!customerProfile) {
      return NextResponse.json({ bookings: [] });
    }

    const bookings = await db.booking.findMany({
      where: { customerId: customerProfile.id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookings });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}
