'use client';

import { Utensils, Gift, Compass, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const USE_CASES = [
  {
    category: 'Dining & VIP Tables',
    title: 'A Table for 4 at Agashiye',
    prompt: '“Reserve a quiet rooftop table for 4 at Agashiye on Saturday at 8 PM. Two vegetarian tasting menus.”',
    outcome: 'Handled: Prime heritage rooftop table secured. Dietary preferences and celebratory arrangements coordinated with the maître d’.',
    icon: Utensils,
  },
  {
    category: 'Executive Sourcing',
    title: 'Client Appreciation Gift',
    prompt: '“I need a bespoke heritage gift for a visiting London executive under ₹10,000 delivered to Hyatt Vastrapur by 5 PM.”',
    outcome: 'Handled: Authentic Ashavali handloom piece curated from local master artisans, inscribed note, and hand-delivered on time.',
    icon: Gift,
  },
  {
    category: 'Curated Getaways',
    title: 'Restorative Weekend Stay',
    prompt: '“Plan a restorative 2-night weekend stay within three hours of Ahmedabad for my family. Quiet and scenic.”',
    outcome: 'Handled: Researched 3 private boutique retreats; secured private courtyard suite with dedicated chauffeur transport.',
    icon: Compass,
  },
  {
    category: 'Confidential Logistics',
    title: 'Time-Critical Errands',
    prompt: '“Collect original legal deeds from my office, secure notary stamps, and courier with same-day tracking.”',
    outcome: 'Handled: Dedicated concierge runner dispatched, notarization executed, and proof of receipt delivered directly to your app.',
    icon: CheckCircle2,
  },
];

export function UseCasesSection() {
  return (
    <section className="py-24 bg-white border-t border-[#E1E5E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F8FA] border border-[#E1E5E8] text-[11px] font-semibold tracking-wider text-[#1F2933] uppercase mb-4 shadow-2xs">
            <span>Member Scenarios</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F2933] mb-4 leading-tight">
            The luxury of time, <span className="text-[#66717C] font-normal">reclaimed.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#66717C] leading-relaxed">
            A glimpse into the daily requests entrusted to our private concierge desk. One request, completely executed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {USE_CASES.map((uc, idx) => {
            const Icon = uc.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl bg-white border border-[#E1E5E8] hover:border-[#A7B0B8] flex flex-col justify-between transition-all shadow-xs hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#1F2933]">
                      {uc.category}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E1E5E8] flex items-center justify-center text-[#1F2933]">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-[#1F2933] mb-3">
                    {uc.title}
                  </h3>

                  <div className="p-3.5 rounded-lg bg-[#F7F8FA] border border-[#E1E5E8] text-xs text-[#303942] italic leading-relaxed mb-4">
                    {uc.prompt}
                  </div>
                </div>

                <div className="pt-3.5 border-t border-[#F1F3F5]">
                  <p className="text-xs text-[#66717C] leading-relaxed">
                    <strong className="font-semibold text-[#1F2933]">{uc.outcome.split(':')[0]}:</strong>
                    {uc.outcome.split(':')[1]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-8 sm:p-10 rounded-xl bg-[#1F2933] text-white border border-[#111820] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-semibold text-white">Have a bespoke request today?</h3>
            <p className="text-xs sm:text-sm text-[#A7B0B8]">Our concierge desk is active 24/7 for Early Access Cohort 1 members.</p>
          </div>
          <Link
            href="/wave1"
            className="px-6 py-3 bg-white text-[#1F2933] text-xs uppercase tracking-wider font-semibold rounded-lg hover:bg-[#F7F8FA] transition-colors shrink-0 shadow-xs active:scale-[0.99]"
          >
            Ask Your Concierge
          </Link>
        </div>
      </div>
    </section>
  );
}
