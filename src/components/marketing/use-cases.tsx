'use client';

import { Utensils, Gift, Compass, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const USE_CASES = [
  {
    title: 'Dinner Reservations',
    prompt: '“Find somewhere quiet in Ahmedabad for four on Saturday. Rooftop table, around ₹2,000 per person.”',
    result: 'Handled: Prime table confirmed at Under The Neem Tree. Dietary notes and preferred seating verified with the manager.',
    icon: Utensils,
  },
  {
    title: 'Curated Gifting',
    prompt: '“I need a thoughtful heritage gift for a visiting executive under ₹10,000 by tomorrow afternoon.”',
    result: 'Handled: Handcrafted Gujarati textile and silver piece sourced, gift-packaged with custom note, delivered to their hotel.',
    icon: Gift,
  },
  {
    title: 'Weekend Escapes',
    prompt: '“Plan a relaxing two-night getaway within 3 hours of Ahmedabad for next weekend with my family.”',
    result: 'Handled: Luxury cottage booked near Gir, chauffeured vehicle scheduled, and safari permits pre-arranged.',
    icon: Compass,
  },
  {
    title: 'Busy Day Errands',
    prompt: '“I need an urgent contract notarized and delivered to S.G. Highway, plus dry cleaning picked up.”',
    result: 'Handled: Document collected, notarized by our team, couriered with tracking, and dry cleaning delivered to your home.',
    icon: CheckCircle2,
  },
];

export function UseCasesSection() {
  return (
    <section className="py-24 bg-white border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Real Examples</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-900 mb-4">
            Whatever Needs Taking Care Of.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
            No dropdowns or tedious forms. Just state your request in plain English. Your concierge handles the legwork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {USE_CASES.map((uc, idx) => {
            const Icon = uc.icon;
            return (
              <div
                key={idx}
                className="bg-[#fafaf9] rounded-2xl p-6 border border-neutral-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-900 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-3">{uc.title}</h3>

                  <div className="p-4 bg-white rounded-xl border border-neutral-200 text-sm font-medium text-neutral-800 mb-4 leading-relaxed">
                    {uc.prompt}
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed pt-3 border-t border-neutral-200/80">
                  <span className="font-bold text-neutral-900">{uc.result.split(':')[0]}:</span>
                  {uc.result.split(':')[1]}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-8 bg-neutral-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Have something specific in mind?</h3>
            <p className="text-xs text-neutral-400">Tell our team today and we will organize options for you.</p>
          </div>
          <Link
            href="/wave1"
            className="px-6 py-3 bg-white text-neutral-900 text-sm font-bold rounded-xl hover:bg-neutral-100 transition-colors shrink-0"
          >
            Ask Proventa
          </Link>
        </div>
      </div>
    </section>
  );
}
