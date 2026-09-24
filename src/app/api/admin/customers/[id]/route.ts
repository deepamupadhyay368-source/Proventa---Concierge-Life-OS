import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';
import { isAppError } from '@/lib/errors';
import { z } from 'zod';

const adminUpdateCustomerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  city: z.string().max(100).optional(),
  preferredComm: z.enum(['IN_APP', 'EMAIL', 'WHATSAPP', 'SMS']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const adminUser = await requireAdmin();
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    // Search by CustomerProfile ID first, then User ID
    let customer = await db.customerProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            userRoles: {
              select: {
                role: true,
                grantedAt: true,
              },
            },
            consentRecords: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
        preferences: {
          orderBy: { category: 'asc' },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          include: {
            events: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        bookings: {
          orderBy: { createdAt: 'desc' },
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
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Fetch related audit logs
    const auditLogs = await db.auditLog.findMany({
      where: {
        OR: [
          { resourceId: customer.userId },
          { resourceId: customer.id },
          { actorId: customer.userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      customer: {
        ...customer,
        auditLogs,
      },
    });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error?.name === 'AuthorizationError' || error?.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized: ADMIN privilege required' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Failed to fetch customer profile' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const adminUser = await requireAdmin();
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const customer = await db.customerProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: { user: true },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = adminUpdateCustomerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    const { name, phone, city, preferredComm, status } = parsed.data;

    // Update User
    const updatedUser = await db.user.update({
      where: { id: customer.userId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone: phone ? phone.trim() : null } : {}),
        ...(status !== undefined ? { status } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
      },
    });

    // Update CustomerProfile
    const updatedProfile = await db.customerProfile.update({
      where: { id: customer.id },
      data: {
        ...(city !== undefined ? { city } : {}),
        ...(preferredComm !== undefined ? { preferredComm } : {}),
      },
    });

    // Audit Log
    await createAuditLog({
      actorId: adminUser.id,
      actorRole: adminUser.roles[0] || 'ADMIN',
      action: 'ADMIN_ACTION',
      resourceType: 'CustomerProfile',
      resourceId: customer.id,
      after: { name, phone, city, preferredComm, status },
    });

    return NextResponse.json({
      success: true,
      customer: {
        ...updatedProfile,
        user: updatedUser,
      },
    });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error.message || 'Failed to update customer' }, { status: 500 });
  }
}
