'use client';

import { Utensils, Gift, Compass, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const USE_CASES = [
  {
    category: 'Dining & Tables',
    title: 'A Table for Four at Agashiye',
    prompt: '“Reserve a quiet rooftop table for four at Agashiye on Saturday at 8 PM. Two vegetarian tasting menus.”',
    outcome: 'Handled: Prime heritage rooftop table secured. Dietary notes and celebratory arrangements pre-coordinated with the maître d’.',
    icon: Utensils,
  },
  {
    category: 'Curated Gifting',
    title: 'Client Appreciation Gift',
    prompt: '“I need a bespoke heritage gift for a visiting London executive under ₹10,000 delivered to Hyatt Vastrapur by 5 PM.”',
    outcome: 'Handled: Authentic Ashavali handloom piece curated from local artisans, calligraphy note inscribed, and hand-delivered on time.',
    icon: Gift,
  },
  {
    category: 'Weekend Retreats',
    title: 'Spontaneous Family Getaway',
    prompt: '“Plan a restorative two-night weekend stay within three hours of Ahmedabad for my family. Quiet and scenic.”',
    outcome: 'Handled: Private boutique heritage villa booked, chauffeured luxury SUV coordinated, and custom dining itinerary arranged.',
    icon: Compass,
  },
  {
    category: 'Daily Logistics',
    title: 'Time-Critical Errands',
    prompt: '“Collect original legal deeds from my office, secure notary stamps, and courier with same-day tracking to Gandhinagar.”',
    outcome: 'Handled: Dedicated concierge runner dispatched, notarization executed, and proof of receipt delivered to your app.',
    icon: CheckCircle2,
  },
];

export function UseCasesSection() {
  return (
    <section className="py-28 bg-white border-t border-brand-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-18">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-700 mb-3 block">
            Member Scenarios
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif font-normal tracking-tight text-neutral-900 mb-4 leading-tight">
            The luxury of time, <span className="italic font-serif text-brand-700">reclaimed.</span>
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-light">
            A glimpse into the daily requests entrusted to our Ahmedabad desk. One text, and the details are handled.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
          {USE_CASES.map((uc, idx) => {
            const Icon = uc.icon;
            return (
              <div
                key={idx}
                className="luxury-card p-7 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-brand-700">
                      {uc.category}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200/60 flex items-center justify-center text-brand-800">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="text-lg font-serif font-semibold text-neutral-900 mb-4 group-hover:text-brand-800 transition-colors">
                    {uc.title}
                  </h3>

                  <div className="p-4 rounded-xl bg-[#faf8f5] border border-brand-100 text-xs font-normal text-neutral-700 italic leading-relaxed mb-5">
                    {uc.prompt}
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-100">
                  <p className="text-xs text-neutral-600 leading-relaxed font-light">
                    <strong className="font-semibold text-neutral-900">{uc.outcome.split(':')[0]}:</strong>
                    {uc.outcome.split(':')[1]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-[#291f18] to-[#3a2f26] text-[#faf8f5] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-normal text-white">Have a bespoke request today?</h3>
            <p className="text-xs text-brand-200 font-light">Our concierge desk is active for Ahmedabad Wave 1 members.</p>
          </div>
          <Link
            href="/wave1"
            className="px-7 py-3.5 bg-brand-100 text-neutral-950 text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-white transition-colors shrink-0 shadow-xs"
          >
            Ask Your Concierge
          </Link>
        </div>
      </div>
    </section>
  );
}
