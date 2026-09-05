import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Concierge Service in Ahmedabad — Proventa',
  description: 'Proventa brings concierge life management to Ahmedabad. Dining, travel, experiences, home services and more — handled.',
};

export default function AhmedabadPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-semibold mb-6">Concierge Service in Ahmedabad</h1>
        <p className="text-neutral-500 leading-relaxed mb-8">Proventa is launching its Concierge Life OS in Ahmedabad first. Wave 1 is a limited cohort — register to join the list.</p>
        <Link href="/wave1" className="inline-flex px-5 py-2.5 bg-neutral-900 text-white text-sm rounded-lg">Join Wave 1</Link>
      </div>
    </div>
  );
}
