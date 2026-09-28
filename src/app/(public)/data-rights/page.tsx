import { redirect } from 'next/navigation';

export default function LegacyDataRightsRedirect() {
  redirect('/legal/privacy-requests');
}
