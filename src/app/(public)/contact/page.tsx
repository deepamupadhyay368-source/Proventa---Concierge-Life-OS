import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-8">Get in touch</h1>
        <div className="space-y-6">
          <div className="p-6 border border-neutral-100 rounded-xl">
            <p className="text-sm font-medium text-neutral-700 mb-1">General enquiries</p>
            <a href="mailto:hello@proventa.in" className="text-brand-700 hover:underline">hello@proventa.in</a>
          </div>
          <div className="p-6 border border-neutral-100 rounded-xl">
            <p className="text-sm font-medium text-neutral-700 mb-1">Concierge support</p>
            <a href="mailto:concierge@proventa.in" className="text-brand-700 hover:underline">concierge@proventa.in</a>
          </div>
          <div className="p-6 border border-neutral-100 rounded-xl">
            <p className="text-sm font-medium text-neutral-700 mb-1">Privacy & security</p>
            <a href="mailto:privacy@proventa.in" className="text-brand-700 hover:underline">privacy@proventa.in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
