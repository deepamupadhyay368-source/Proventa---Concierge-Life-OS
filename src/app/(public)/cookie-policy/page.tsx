import { redirect } from 'next/navigation';

export default function LegacyCookieRedirect() {
  redirect('/legal/cookies');
}
