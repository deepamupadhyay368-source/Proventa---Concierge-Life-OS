import { NextRequest, NextResponse } from 'next/server';
import { CONCIERGE_COOKIE_NAME } from '@/lib/auth/concierge-session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const isProd = process.env.NODE_ENV === 'production';
  const response = NextResponse.json({
    success: true,
    message: 'Signed out of Concierge Operations Desk',
  });

  // Clear dedicated Concierge session cookie
  response.cookies.set({
    name: CONCIERGE_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

export async function GET(req: NextRequest) {
  return POST(req);
}
