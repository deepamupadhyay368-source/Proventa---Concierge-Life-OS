import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConciergeSession } from '@/lib/auth/concierge-session';
import { isAppError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await requireConciergeSession();

    const user = await db.user.findUnique({
      where: { id: session.id },
      include: {
        userRoles: true,
        conciergeAgent: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roles: user.userRoles.map((r) => r.role),
        conciergeAgent: user.conciergeAgent,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to fetch employee profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireConciergeSession();
    const body = await req.json();
    const { name, phone, timezone, shiftStart, shiftEnd } = body;

    // Permitted fields only — role/status changes are strictly blocked here!
    const updateData: any = {};
    if (name && typeof name === 'string' && name.trim().length >= 2) {
      updateData.name = name.trim();
    }
    if (phone !== undefined && typeof phone === 'string') {
      updateData.phone = phone.trim();
    }

    const updatedUser = await db.user.update({
      where: { id: session.id },
      data: updateData,
      include: {
        userRoles: true,
        conciergeAgent: true,
      },
    });

    if (updatedUser.conciergeAgent && (timezone || shiftStart || shiftEnd)) {
      await db.conciergeAgent.update({
        where: { id: updatedUser.conciergeAgent.id },
        data: {
          ...(timezone ? { timezone } : {}),
          ...(shiftStart ? { shiftStart } : {}),
          ...(shiftEnd ? { shiftEnd } : {}),
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        roles: updatedUser.userRoles.map((r) => r.role),
      },
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to update employee profile' }, { status: 500 });
  }
}
