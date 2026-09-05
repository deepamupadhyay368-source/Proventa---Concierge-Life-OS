import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Dining Concierge — Proventa', description: 'Restaurant reservations, premier dining recommendations, and special occasion planning.' };

export default function DiningPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-semibold mb-6">Dining</h1>
        <p className="text-neutral-500 leading-relaxed mb-8">Tell Proventa where you want to go, or let us find the right place for the occasion. Reservations, special occasions, and dining coordination — handled.</p>
        <Link href="/wave1" className="inline-flex px-5 py-2.5 bg-neutral-900 text-white text-sm rounded-lg">Apply for Cohort 1 Access</Link>
      </div>
    </div>
  );
}
