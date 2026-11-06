export function sanitizeCallbackPath(
  rawUrl: string | undefined | null,
  baseUrl?: string,
): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return '/buyer/dashboard';
  }
  const trimmed = rawUrl.trim();
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.startsWith('/\\')
  ) {
    return trimmed;
  }
  if (baseUrl) {
    try {
      const target = new URL(trimmed);
      const base = new URL(baseUrl);
      if (target.origin === base.origin) {
        return `${target.pathname}${target.search}${target.hash}` || '/buyer/dashboard';
      }
    } catch {
      return '/buyer/dashboard';
    }
  }
  return '/buyer/dashboard';
}
