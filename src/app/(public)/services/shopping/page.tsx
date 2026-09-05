import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Shopping Concierge — Proventa', description: 'Gift sourcing, product research, and shopping arrangements.' };

export default function ShoppingPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-semibold mb-6">Shopping</h1>
        <p className="text-neutral-500 leading-relaxed mb-8">Gift sourcing, product research, and delivery coordination — handled.</p>
        <Link href="/wave1" className="inline-flex px-5 py-2.5 bg-neutral-900 text-white text-sm rounded-lg">Join Wave 1</Link>
      </div>
    </div>
  );
}
