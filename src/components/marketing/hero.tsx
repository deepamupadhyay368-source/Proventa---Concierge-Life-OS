'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Compass, Shield, Check } from 'lucide-react';

const SUGGESTIONS = [
  'Reserve a quiet rooftop table for 4 at Agashiye this Saturday evening',
  'Arrange an executive chauffeured airport pickup from Terminal 2 tomorrow at 8 PM',
  'Source a handwoven heritage Ashavali silk gift under ₹10,000 for an executive client',
  'Book a luxury weekend tent stay and safari permits at Gir Forest for next month',
];

export function HeroSection() {
  const [intent, setIntent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = intent.trim() || 'Reserve a quiet rooftop table for 4 this Saturday evening';
    window.location.href = `/wave1?intent=${encodeURIComponent(query)}`;
  };

  const handleChipClick = (suggestion: string) => {
    setIntent(suggestion);
  };

  return (
    <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 bg-[#faf8f5] overflow-hidden">
      {/* Soft Champagne Ambient Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-amber-100/50 via-brand-100/40 to-transparent blur-[140px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-1/3 left-1/5 w-[350px] h-[350px] bg-brand-100/30 blur-[120px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Subtle Membership Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-brand-200/80 text-[11px] uppercase tracking-[0.2em] font-medium text-brand-900 mb-8 backdrop-blur-md shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
          <span>Early Access · Cohort 1</span>
        </div>

        {/* Grand Editorial Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif tracking-tight text-neutral-900 mb-6 font-normal leading-[1.06]">
          Life, <span className="italic font-serif text-brand-700">Handled.</span>
        </h1>

        {/* Refined Subtitle */}
        <p className="text-lg sm:text-2xl text-neutral-600 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
          Your private personal concierge. Dining reservations, bespoke travel, thoughtful gifting, and lifestyle logistics — executed with quiet precision.
        </p>

        {/* Tactile Ivory Concierge Card */}
        <div className="max-w-2xl mx-auto mb-14">
          <form
            onSubmit={handleSubmit}
            className="p-3 sm:p-4 rounded-3xl bg-white/95 border border-brand-200 shadow-xl shadow-brand-900/5 backdrop-blur-md transition-all focus-within:border-brand-400 focus-within:shadow-2xl"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 flex items-center px-4 py-3 sm:py-2">
                <input
                  type="text"
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  placeholder="Ask your concierge anything... 'Quiet dinner for four on Saturday at 8 PM'"
                  className="w-full bg-transparent border-0 text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none font-light"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-neutral-900 text-[#faf8f5] text-xs uppercase tracking-widest font-semibold hover:bg-brand-950 transition-all shadow-md shrink-0"
              >
                <span>Delegate</span>
                <ArrowRight className="h-4 w-4 text-brand-300" />
              </button>
            </div>

            {/* Ambient Scenario Prompts */}
            <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-center sm:justify-start gap-2 px-2 text-[11px] text-neutral-500">
              <span className="font-serif italic text-brand-700">Member scenarios:</span>
              <button
                type="button"
                onClick={() => setIntent('Reserve prime tasting table for four this Saturday evening')}
                className="hover:text-neutral-900 hover:underline transition-colors"
              >
                Fine Dining
              </button>
              <span className="text-neutral-300">&bull;</span>
              <button
                type="button"
                onClick={() => setIntent('Plan a private weekend haveli retreat with driver')}
                className="hover:text-neutral-900 hover:underline transition-colors"
              >
                Curated Travel
              </button>
              <span className="text-neutral-300">&bull;</span>
              <button
                type="button"
                onClick={() => setIntent('Source and hand-deliver rare corporate gift hampers')}
                className="hover:text-neutral-900 hover:underline transition-colors"
              >
                Luxury Gifting
              </button>
            </div>
          </form>
        </div>

        {/* 3 Quiet-Luxury Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
          <div className="p-6 rounded-2xl bg-white/60 border border-brand-200/50 backdrop-blur-xs">
            <span className="font-serif italic text-2xl text-brand-600 font-normal block mb-2">01</span>
            <h3 className="text-base font-serif font-semibold text-neutral-900 mb-2">Effortless Delegation</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              Send a simple note. No searching through endless apps or calling busy venues. Just state what you need.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/60 border border-brand-200/50 backdrop-blur-xs">
            <span className="font-serif italic text-2xl text-brand-600 font-normal block mb-2">02</span>
            <h3 className="text-base font-serif font-semibold text-neutral-900 mb-2">Premier Ground Access</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              Our concierges maintain personal relationships with premier restaurants, boutique hotels, and vetted artisans.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/60 border border-brand-200/50 backdrop-blur-xs">
            <span className="font-serif italic text-2xl text-brand-600 font-normal block mb-2">03</span>
            <h3 className="text-base font-serif font-semibold text-neutral-900 mb-2">Absolute Discretion</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              Every detail is verified, line-item pricing approved by you, and executed with complete confidentiality.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
