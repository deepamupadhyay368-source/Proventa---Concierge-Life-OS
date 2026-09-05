import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 prose prose-neutral">
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded p-3 mb-8">This document is a template and should be reviewed by a qualified legal professional before publication.</p>
        <h1>Privacy Policy</h1>
        <p className="text-neutral-500 text-sm">Last updated: [DATE] &mdash; This document requires professional legal review.</p>
        <h2>Who we are</h2>
        <p>Proventa is a Concierge Life OS. We are committed to protecting your personal information and being transparent about how we use it.</p>
        <h2>What we collect</h2>
        <p>We collect information you provide directly: name, email, phone, preferences, and request content. We collect this only to provide the concierge service.</p>
        <h2>How we use your information</h2>
        <p>To process your requests, communicate with you, improve our service, and comply with legal obligations. We do not use your data for advertising or model training without explicit authorisation.</p>
        <h2>Data security</h2>
        <p>We use industry-standard security measures including encryption, access controls, and regular security reviews.</p>
        <h2>Your rights</h2>
        <p>You may access, correct, or delete your personal data at any time by contacting us at privacy@proventa.in.</p>
        <h2>Contact</h2>
        <p>For privacy concerns: <a href="mailto:privacy@proventa.in">privacy@proventa.in</a></p>
      </div>
    </div>
  );
}
