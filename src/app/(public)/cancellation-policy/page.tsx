import { redirect } from 'next/navigation';

export default function LegacyCancellationPolicyRedirect() {
  redirect('/legal/refunds');
}
