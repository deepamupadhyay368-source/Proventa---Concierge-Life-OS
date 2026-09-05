import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'About Proventa' };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 mb-6">About Proventa</h1>
        </div>
        <div className="space-y-6 text-neutral-600 leading-relaxed">
          <p className="text-lg">Proventa is a Concierge Life OS. We help people get things done — without the time, effort, and coordination that getting things done usually requires.</p>
          <p>We believe that the experience of having a trusted person take care of things for you shouldn't be exclusive. Good service, thoughtful execution, and genuine reliability shouldn't require a premium membership or a personal relationship with the right people.</p>
          <p>Proventa combines intelligent technology with real human concierges to understand what you need, research the best options, verify the details, and execute — with your approval at every consequential step.</p>
          <p>We're starting in Ahmedabad with a small, carefully managed Wave 1 cohort. We want to do this right before we expand.</p>
          <h2 className="text-xl font-semibold text-neutral-900 mt-10 mb-4">The principle</h2>
          <p className="text-lg font-medium text-neutral-800 italic">"I need this handled." — "Consider it handled."</p>
          <p>That's what we're building toward. Not a dashboard. Not a chatbot. Not a marketplace. A service that actually takes things off your plate.</p>
        </div>
        <div className="mt-14">
          <Link href="/wave1" className="inline-flex items-center px-6 py-3 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">Join Wave 1</Link>
        </div>
      </div>
    </div>
  );
}
