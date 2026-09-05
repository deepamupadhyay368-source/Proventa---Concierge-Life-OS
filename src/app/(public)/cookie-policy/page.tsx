import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Cookie Policy' };

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 prose prose-neutral">
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded p-3 mb-8">This document is a template and requires professional legal review before publication.</p>
        <h1>Cookie Policy</h1>
        <p className="text-neutral-500 text-sm">Last updated: [DATE]</p>
        <h2>How we use cookies</h2>
        <p>Proventa uses essential cookies to maintain your session and security. We do not use third-party tracking or advertising cookies.</p>
      </div>
    </div>
  );
}
