import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge } from '@/lib/auth/session';
import { isAppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireConcierge();
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const customerId = searchParams.get('id');

    if (customerId) {
      const customer = await db.customerProfile.findUnique({
        where: { id: customerId },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
          preferences: true,
          tasks: {
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
              id: true,
              publicId: true,
              category: true,
              intent: true,
              status: true,
              priority: true,
              budgetAmount: true,
              createdAt: true,
              completedAt: true,
            },
          },
        },
      });

      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        customer: {
          id: customer.id,
          userId: customer.user.id,
          name: customer.user.name || customer.user.email.split('@')[0],
          email: customer.user.email,
          phone: customer.user.phone,
          city: customer.city || 'Ahmedabad',
          membershipTier: 'Private Client',
          preferences: customer.preferences,
          createdAt: customer.user.createdAt,
          tasks: customer.tasks,
        },
      });
    }

    // List search
    const customers = await db.customerProfile.findMany({
      where: search
        ? {
            OR: [
              { user: { name: { contains: search, mode: 'insensitive' } } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
              { user: { phone: { contains: search } } },
            ],
          }
        : undefined,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
        _count: {
          select: { tasks: true },
        },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      customers: customers.map((c: any) => ({
        id: c.id,
        userId: c.user.id,
        name: c.user.name || c.user.email.split('@')[0],
        email: c.user.email,
        phone: c.user.phone,
        city: c.city || 'Ahmedabad',
        membershipTier: 'Private Client',
        tasksCount: c._count?.tasks || 0,
        createdAt: c.user.createdAt,
      })),
    });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    logger.error({ err: error }, 'Concierge customers API error');
    return NextResponse.json({ error: 'Failed to fetch customer data' }, { status: 500 });
  }
}
