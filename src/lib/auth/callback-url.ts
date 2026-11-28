const DEFAULT_AUTHENTICATED_PATH = '/dashboard';
const CANONICAL_ORIGIN = 'https://proventa.in';

const DISALLOWED_POST_LOGIN_PATHS = [
  '/login',
  '/signup',
  '/sign-in',
  '/sign-up',
  '/register',
  '/register-details',
];

const CONTROL_CHAR_OR_BACKSLASH = /[\u0000-\u001F\u007F\\]/;
const ENCODED_UNSAFE_SEGMENT = /%(?:5c|0[0-9a-f]|1[0-9a-f]|7f)/i;

function isDisallowedPath(pathname: string, allowLoginOrRoot = false): boolean {
  const withoutQueryOrHash = pathname.split('?')[0].split('#')[0];
  const trimmedTrailing = withoutQueryOrHash.replace(/\/+$/, '') || '/';
  const cleanLower = trimmedTrailing.toLowerCase();
  if (allowLoginOrRoot && (trimmedTrailing === '/login' || trimmedTrailing === '/')) {
    return false;
  }
  return DISALLOWED_POST_LOGIN_PATHS.includes(cleanLower);
}

function resolveCanonicalOrigin(baseUrl?: string): string {
  if (!baseUrl) return CANONICAL_ORIGIN;
  try {
    const parsed = new URL(baseUrl);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin;
    }
  } catch {
    // Fall back to canonical origin
  }
  return CANONICAL_ORIGIN;
}

function validateRelativeCandidate(
  candidate: string,
  canonicalOrigin: string,
  allowLoginOrRoot: boolean,
): string | null {
  if (!candidate.startsWith('/')) return null;
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return null;
  if (CONTROL_CHAR_OR_BACKSLASH.test(candidate)) return null;

  const pathPart = candidate.split('?')[0].split('#')[0];
  if (ENCODED_UNSAFE_SEGMENT.test(pathPart)) return null;
  if (/^\/%2f/i.test(pathPart) || /%2f%2f/i.test(pathPart)) return null;

  // Validate single- and double-decoded forms to prevent encoding bypasses
  let decodedOnce: string;
  try {
    decodedOnce = decodeURIComponent(pathPart);
  } catch {
    return null;
  }
  if (
    CONTROL_CHAR_OR_BACKSLASH.test(decodedOnce) ||
    !decodedOnce.startsWith('/') ||
    decodedOnce.startsWith('//')
  ) {
    return null;
  }

  let decodedTwice: string;
  try {
    decodedTwice = decodeURIComponent(decodedOnce);
  } catch {
    return null;
  }
  if (
    CONTROL_CHAR_OR_BACKSLASH.test(decodedTwice) ||
    !decodedTwice.startsWith('/') ||
    decodedTwice.startsWith('//')
  ) {
    return null;
  }

  // Parse against canonical origin and confirm origin & pathname safety
  let parsed: URL;
  try {
    parsed = new URL(candidate, canonicalOrigin);
  } catch {
    return null;
  }

  if (parsed.origin !== canonicalOrigin) return null;
  if (
    !parsed.pathname.startsWith('/') ||
    parsed.pathname.startsWith('//') ||
    CONTROL_CHAR_OR_BACKSLASH.test(parsed.pathname)
  ) {
    return null;
  }

  // Reject disallowed auth-loop destinations across raw, parsed, and decoded forms (case-insensitive)
  if (
    isDisallowedPath(parsed.pathname, allowLoginOrRoot) ||
    isDisallowedPath(decodedOnce, allowLoginOrRoot) ||
    isDisallowedPath(decodedTwice, allowLoginOrRoot)
  ) {
    return null;
  }

  return `${parsed.pathname}${parsed.search}${parsed.hash}` || DEFAULT_AUTHENTICATED_PATH;
}

function sanitizeInternalUrl(
  rawUrl: string | undefined | null,
  baseUrl: string | undefined,
  allowLoginOrRoot: boolean,
): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed || CONTROL_CHAR_OR_BACKSLASH.test(trimmed)) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  const canonicalOrigin = resolveCanonicalOrigin(baseUrl);

  if (trimmed.startsWith('/')) {
    return (
      validateRelativeCandidate(trimmed, canonicalOrigin, allowLoginOrRoot) ??
      DEFAULT_AUTHENTICATED_PATH
    );
  }

  if (baseUrl) {
    try {
      const base = new URL(baseUrl);
      const target = new URL(trimmed);
      if (target.origin !== base.origin || target.protocol !== base.protocol) {
        return DEFAULT_AUTHENTICATED_PATH;
      }
      const relative = `${target.pathname}${target.search}${target.hash}`;
      return (
        validateRelativeCandidate(relative, base.origin, allowLoginOrRoot) ??
        DEFAULT_AUTHENTICATED_PATH
      );
    } catch {
      return DEFAULT_AUTHENTICATED_PATH;
    }
  }

  return DEFAULT_AUTHENTICATED_PATH;
}

export function sanitizeCallbackPath(
  rawUrl: string | undefined | null,
  baseUrl?: string,
): string {
  return sanitizeInternalUrl(rawUrl, baseUrl, false);
}

/**
 * Shared NextAuth redirect callback sanitizer (invoked for both sign-in and sign-out).
 * Applies the exact same origin, backslash, double-slash, encoding, and control-character
 * protections as sanitizeCallbackPath, while permitting explicit sign-out targets `/login`
 * and `/`. Authenticated visits to `/login` remain safely redirected to `/dashboard` by
 * middleware and HomeSignInForm, preventing post-login authentication loops.
 */
export function sanitizeNextAuthRedirect(
  rawUrl: string | undefined | null,
  baseUrl: string,
): string {
  return sanitizeInternalUrl(rawUrl, baseUrl, true);
}
