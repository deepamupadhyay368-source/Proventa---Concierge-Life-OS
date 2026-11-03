import { NextRequest, NextResponse } from 'next/server';

/**
 * PROVENTA CSRF and Origin Protection Guard
 * 
 * Verifies that state-changing requests (POST, PUT, PATCH, DELETE) originate
 * from legitimate PROVENTA domains, preventing Cross-Site Request Forgery.
 */

const ALLOWED_ORIGINS = new Set([
  'https://proventa.in',
  'https://www.proventa.in',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

export function validateOrigin(req: NextRequest): boolean {
  // Safe HTTP read methods are exempt
  const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
  if (safeMethods.has(req.method.toUpperCase())) {
    return true;
  }

  // Allow test environments without HTTP origin headers
  if (process.env.NODE_ENV === 'test') {
    return true;
  }

  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  // If environment specifies an explicit base URL, add it to allowed origins
  if (process.env.NEXTAUTH_URL) {
    try {
      const parsed = new URL(process.env.NEXTAUTH_URL);
      ALLOWED_ORIGINS.add(parsed.origin);
    } catch {
      // Invalid URL in env ignored
    }
  }

  // 1. Origin header check
  if (origin) {
    try {
      const parsedOrigin = new URL(origin).origin;
      return ALLOWED_ORIGINS.has(parsedOrigin);
    } catch {
      return false;
    }
  }

  // 2. Referer header check if Origin is absent
  if (referer) {
    try {
      const parsedReferer = new URL(referer).origin;
      return ALLOWED_ORIGINS.has(parsedReferer);
    } catch {
      return false;
    }
  }

  // If both origin and referer are missing on state-changing methods from external browser,
  // allow only if X-Requested-With or Content-Type: application/json is verified (standard modern CORS defense)
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return true;
  }

  return false;
}

export function csrfProtection(req: NextRequest): NextResponse | null {
  if (!validateOrigin(req)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Untrusted or invalid origin (CSRF protection)' },
      { status: 403 },
    );
  }
  return null;
}
