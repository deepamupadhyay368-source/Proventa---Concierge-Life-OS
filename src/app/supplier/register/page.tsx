import { redirect } from 'next/navigation';

export default function SupplierRegisterRedirect() {
  redirect('/onboarding/business?role=SUPPLIER');
}
