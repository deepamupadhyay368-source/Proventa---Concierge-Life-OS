import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | PROVENTA — Every Business. One Place.',
  description: 'Contact PROVENTA for customer enquiries, business onboarding, verification, and platform support.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-3">Get in Touch</h1>
        <p className="text-sm text-neutral-500 mb-8">
          Reach out to the PROVENTA team for business storefront onboarding, verification, or customer marketplace support.
        </p>
        <div className="space-y-6">
          <div className="p-6 border border-neutral-200 rounded-xl">
            <p className="text-sm font-semibold text-neutral-900 mb-1">General &amp; Customer Marketplace Support</p>
            <a href="mailto:support@proventa.in" className="text-brand-700 hover:underline text-sm">support@proventa.in</a>
          </div>
          <div className="p-6 border border-neutral-200 rounded-xl">
            <p className="text-sm font-semibold text-neutral-900 mb-1">Business Onboarding &amp; Storefront Verification</p>
            <a href="mailto:businesses@proventa.in" className="text-brand-700 hover:underline text-sm">businesses@proventa.in</a>
          </div>
          <div className="p-6 border border-neutral-200 rounded-xl">
            <p className="text-sm font-semibold text-neutral-900 mb-1">Privacy, Trust &amp; Moderation</p>
            <a href="mailto:privacy@proventa.in" className="text-brand-700 hover:underline text-sm">privacy@proventa.in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
