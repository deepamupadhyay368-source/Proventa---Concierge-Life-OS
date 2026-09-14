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
  '/demo',
];

const AUTH_ROUTES = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'];

export default auth(async (req) => {
  const { nextUrl, auth: session } = req as NextRequest & { auth: { user?: { id?: string; roles?: string[] } } | null };
  const pathname = nextUrl.pathname;

  const isPublic =
    PUBLIC_ROUTES.some((r) => pathname === r) ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/webhooks') ||
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

  // Special handling for admin routes
  if (pathname === '/admin/login') {
    if (isLoggedIn && userRoles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'].includes(r))) {
      return NextResponse.redirect(new URL('/admin', nextUrl));
    }
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublic) return NextResponse.next();

  // Admin route protection: must be logged in with admin privileges, else go to /admin/login
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      const adminLoginUrl = new URL('/admin/login', nextUrl);
      adminLoginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(adminLoginUrl);
    }
    if (!userRoles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'].includes(r))) {
      return NextResponse.redirect(new URL('/admin/login?error=Unauthorized', nextUrl));
    }
  }

  // Require authentication for other protected routes
  if (!isLoggedIn) {
    const signInUrl = new URL('/sign-in', nextUrl);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname.startsWith('/concierge-ops') && !userRoles.some((r) => ['SUPER_ADMIN', 'CONCIERGE', 'CONCIERGE_MANAGER', 'ADMIN'].includes(r))) {
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
