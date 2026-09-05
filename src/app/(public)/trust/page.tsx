import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Trust & Security' };

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 prose prose-neutral">
        <h1>Trust & Security</h1>
        <p className="text-neutral-500 text-sm">Last updated: [DATE]</p>
        <h2>Our commitment</h2>
        <p>Delegating parts of your life requires trust. We protect your data and are transparent about our processes.</p>
      </div>
    </div>
  );
}
