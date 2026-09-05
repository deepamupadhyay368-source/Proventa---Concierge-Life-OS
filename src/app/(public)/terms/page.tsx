import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 prose prose-neutral">
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded p-3 mb-8">This document is a template and requires professional legal review before publication.</p>
        <h1>Terms of Service</h1>
        <p className="text-neutral-500 text-sm">Last updated: [DATE]</p>
        <h2>Acceptance</h2>
        <p>By using Proventa, you agree to these terms. If you do not agree, please do not use the service.</p>
        <h2>Service description</h2>
        <p>Proventa provides concierge assistance combining AI technology with human concierges. We assist in researching, arranging, and managing tasks and services on your behalf.</p>
        <h2>Approvals and bookings</h2>
        <p>No booking or financial commitment is made without your explicit approval. You retain full authority over all decisions.</p>
        <h2>Limitations</h2>
        <p>We act as intermediaries with third-party providers. We are not responsible for the actions or failures of external providers. See our Third-Party Disclosure for details.</p>
        <h2>Contact</h2>
        <p><a href="mailto:hello@proventa.in">hello@proventa.in</a></p>
      </div>
    </div>
  );
}
