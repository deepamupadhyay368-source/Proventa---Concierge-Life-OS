import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'How It Works', description: 'Understand the Proventa process from request to completion.' };

const STEPS = [
  { n: '01', title: 'Tell us what you need', body: "Open Proventa and describe what you need — in plain language. You don't need to pick a category, fill out a form, or figure out which provider to use. Just say what you want." },
  { n: '02', title: 'We figure it out', body: "Proventa uses intelligent technology to understand your request, research relevant options, and prepare a recommendation tailored to your preferences. If something is unclear, we'll ask a quick clarifying question." },
  { n: '03', title: 'A concierge takes over when needed', body: "For requests that require a phone call, a negotiation, a real-time availability check, or any form of human judgment, a Proventa concierge takes over directly. You'll see this happen transparently." },
  { n: '04', title: 'You approve', body: "Before anything is booked or arranged, you'll see exactly what we're proposing — provider, date, price, terms, cancellation policy. You approve, request changes, or decline. Nothing happens without your confirmation." },
  { n: '05', title: 'Done', body: "Proventa or your concierge executes the approved action and provides you with a genuine confirmation. Your request is marked complete and we follow up where appropriate." },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-14">
          <p className="text-xs font-medium text-brand-700 tracking-widest uppercase mb-4">The process</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 mb-6">How Proventa works</h1>
          <p className="text-lg text-neutral-500 leading-relaxed">One request. One owner. One clear outcome.</p>
        </div>
        <div className="space-y-12">
          {STEPS.map((step) => (
            <div key={step.n} className="flex gap-8">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 flex items-center justify-center bg-neutral-50 border border-neutral-200 rounded-xl">
                  <span className="text-sm font-semibold text-neutral-400">{step.n}</span>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-3">{step.title}</h2>
                <p className="text-neutral-500 leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-10 border-t border-neutral-100 text-center">
          <Link href="/wave1" className="inline-flex items-center px-6 py-3 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
            Join Wave 1
          </Link>
        </div>
      </div>
    </div>
  );
}
