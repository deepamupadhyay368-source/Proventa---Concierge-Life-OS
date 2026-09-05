import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';

// Public routes — no auth needed
const PUBLIC_ROUTES = [
  '/',
  '/how-it-works',
  '/what-we-handle',
  '/about',
  '/faq',
  '/wave1',
  '/privacy',
  '/terms',
  '/cookie-policy',
  '/concierge-terms',
  '/cancellation-policy',
  '/third-party-disclosure',
  '/trust',
  '/contact',
  '/sign-in',
  '/sign-up',
  '/verify',
  '/reset-password',
  '/forgot-password',
];

const AUTH_ROUTES = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'];

export default auth(async (req) => {
  const { nextUrl, auth: session } = req as NextRequest & { auth: { user?: { id?: string; roles?: string[] } } | null };
  const pathname = nextUrl.pathname;

  const isPublic =
    PUBLIC_ROUTES.some((r) => pathname === r) ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/wave1') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/services') ||
    pathname.startsWith('/concierge') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.startsWith('/site.webmanifest');

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isLoggedIn = !!session?.user?.id;
  const userRoles: string[] = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Allow public routes
  if (isPublic) return NextResponse.next();

  // Require authentication
  if (!isLoggedIn) {
    const signInUrl = new URL('/sign-in', nextUrl);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Role-based route protection
  if (pathname.startsWith('/admin') && !userRoles.includes('ADMIN')) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  if (pathname.startsWith('/concierge-ops') && !userRoles.some((r) => ['CONCIERGE', 'CONCIERGE_MANAGER', 'ADMIN'].includes(r))) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  const response = NextResponse.next();
  response.headers.set('X-Request-Id', crypto.randomUUID());
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
