import { NextRequest, NextResponse } from 'next/server';
import { getConciergeSession } from '@/lib/auth/concierge-session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getConciergeSession();
  if (!session) {
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.id,
      email: session.email,
      name: session.name,
      roles: session.roles,
      primaryRole: session.primaryRole,
      expiresAt: session.expiresAt,
    },
  });
}
