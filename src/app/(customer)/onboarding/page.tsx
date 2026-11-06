import { redirect } from 'next/navigation';

export default async function OnboardingRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (typeof val === 'string') {
      qs.set(key, val);
    } else if (Array.isArray(val) && val[0]) {
      qs.set(key, val[0]);
    }
  }
  const queryString = qs.toString();
  redirect(`/onboarding/business${queryString ? `?${queryString}` : ''}`);
}
