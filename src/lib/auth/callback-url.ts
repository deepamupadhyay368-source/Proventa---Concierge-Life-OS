const DISALLOWED_POST_LOGIN_PATHS = [
  '/login',
  '/signup',
  '/sign-in',
  '/sign-up',
  '/register',
  '/register-details',
];

function isDisallowedPath(pathname: string): boolean {
  const clean = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  return DISALLOWED_POST_LOGIN_PATHS.includes(clean);
}

export function sanitizeCallbackPath(
  rawUrl: string | undefined | null,
  baseUrl?: string,
): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return '/dashboard';
  }
  const trimmed = rawUrl.trim();
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.startsWith('/\\')
  ) {
    return isDisallowedPath(trimmed) ? '/dashboard' : trimmed;
  }
  if (baseUrl) {
    try {
      const target = new URL(trimmed);
      const base = new URL(baseUrl);
      if (target.origin === base.origin) {
        const candidate = `${target.pathname}${target.search}${target.hash}` || '/dashboard';
        return isDisallowedPath(candidate) ? '/dashboard' : candidate;
      }
    } catch {
      return '/dashboard';
    }
  }
  return '/dashboard';
}
