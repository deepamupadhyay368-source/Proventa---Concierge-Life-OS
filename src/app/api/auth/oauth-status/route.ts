import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const googleClientId =
    process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || '';
  const googleClientSecret =
    process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || '';

  return NextResponse.json({
    google: Boolean(googleClientId.trim() && googleClientSecret.trim()),
    apple: Boolean(process.env.APPLE_ID && process.env.APPLE_SECRET),
    microsoft: Boolean(
      process.env.AUTH_MICROSOFT_ENTRA_ID_ID &&
        process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
    ),
    callbackPath: '/api/auth/callback/google',
  });
}
