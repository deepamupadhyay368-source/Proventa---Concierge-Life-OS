import { redirect } from 'next/navigation';

export default function LegacyAIDisclosureRedirect() {
  redirect('/legal/ai');
}
