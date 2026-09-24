import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';
import { isAppError } from '@/lib/errors';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  city: z.string().max(100).optional(),
  preferredComm: z.enum(['IN_APP', 'EMAIL', 'WHATSAPP', 'SMS']).optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        customerProfile: {
          select: {
            id: true,
            city: true,
            preferredComm: true,
            onboardingCompleted: true,
            createdAt: true,
            preferences: true,
          },
        },
        userRoles: {
          select: {
            role: true,
          },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        status: dbUser.status,
        roles: dbUser.userRoles.map((r) => r.role),
        customerProfile: dbUser.customerProfile,
        createdAt: dbUser.createdAt,
      },
    });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    const { name, phone, city, preferredComm } = parsed.data;

    // Update User record
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone: phone ? phone.trim() : null } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
      },
    });

    // Update or Upsert CustomerProfile record
    let updatedProfile = null;
    if (city !== undefined || preferredComm !== undefined) {
      updatedProfile = await db.customerProfile.upsert({
        where: { userId: user.id },
        update: {
          ...(city !== undefined ? { city } : {}),
          ...(preferredComm !== undefined ? { preferredComm } : {}),
        },
        create: {
          userId: user.id,
          city: city || 'Ahmedabad',
          preferredComm: preferredComm || 'IN_APP',
        },
      });
    } else {
      updatedProfile = await db.customerProfile.findUnique({
        where: { userId: user.id },
      });
    }

    await createAuditLog({
      actorId: user.id,
      action: 'UPDATE',
      resourceType: 'CustomerProfile',
      resourceId: updatedProfile?.id || user.id,
      after: { name, phone, city, preferredComm },
    });

    return NextResponse.json({
      success: true,
      profile: {
        ...updatedUser,
        customerProfile: updatedProfile,
      },
    });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
