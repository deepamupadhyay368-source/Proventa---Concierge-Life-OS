import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { createConciergeToken, CONCIERGE_COOKIE_NAME, CONCIERGE_SESSION_DURATION } from '@/lib/auth/concierge-session';
import { isAppError } from '@/lib/errors';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, employeeId } = body;
    const identifier = (email || employeeId || '').trim().toLowerCase();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Work email / Employee ID and password are required' },
        { status: 400 }
      );
    }

    // Look up employee user in database
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { id: identifier },
        ],
      },
      include: {
        userRoles: true,
      },
    });

    if (!user || (!user.passwordHash && !(user as any).password)) {
      return NextResponse.json(
        { error: 'Invalid employee credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const hash = user.passwordHash || (user as any).password;
    const isPasswordValid = await verifyPassword(password, hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid employee credentials' },
        { status: 401 }
      );
    }

    // Check employee authorization roles
    const roles: UserRole[] = user.userRoles?.map((r) => r.role as UserRole) || [];
    const isAuthorizedConcierge = roles.some((r) =>
      ['CONCIERGE', 'SENIOR_CONCIERGE', 'CONCIERGE_MANAGER', 'ADMIN', 'FOUNDER', 'SUPER_ADMIN'].includes(r)
    );

    if (!isAuthorizedConcierge) {
      return NextResponse.json(
        { error: 'Access denied. Account does not have Concierge Desk execution permissions.' },
        { status: 403 }
      );
    }

    // Generate cryptographically signed Concierge session token
    const token = createConciergeToken({
      id: user.id,
      email: user.email,
      name: user.name,
      roles,
    });

    const isProd = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        roles,
        primaryRole: roles[0] || 'CONCIERGE',
      },
      message: 'Concierge Desk session established',
    });

    // Set dedicated HttpOnly Concierge session cookie
    response.cookies.set({
      name: CONCIERGE_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: CONCIERGE_SESSION_DURATION,
    });

    return response;
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('[Concierge Auth] Sign-in error:', error);
    return NextResponse.json({ error: 'Internal error authenticating employee' }, { status: 500 });
  }
}
