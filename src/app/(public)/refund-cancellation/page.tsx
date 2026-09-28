import { redirect } from 'next/navigation';

export default function LegacyRefundCancellationRedirect() {
  redirect('/legal/refunds');
}
