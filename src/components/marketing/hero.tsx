'use client';

import { useState } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

export function HeroSection() {
  const [intent, setIntent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = intent.trim() || 'Reserve a quiet table for 4 this Saturday evening';
    window.location.href = `/wave1?intent=${encodeURIComponent(query)}`;
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 bg-white overflow-hidden">
      {/* Subtle Cool Silver/Slate Ambient Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-[#F1F3F5] via-[#F7F8FA] to-transparent blur-[140px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Subtle Membership Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7F8FA] border border-[#E1E5E8] text-[11px] uppercase tracking-[0.16em] font-semibold text-[#1F2933] mb-8 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1F2933]"></span>
          <span>Concierge Life OS · Early Access Cohort 1</span>
        </div>

        {/* Crisp Modern Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-[#1F2933] mb-6 leading-[1.08]">
          Life, <span className="text-[#66717C] font-normal">Handled.</span>
        </h1>

        {/* Refined Subtitle */}
        <p className="text-base sm:text-xl text-[#66717C] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          The intelligent operating system for your life. AI-powered discovery and planning paired with dedicated human concierge execution for dining, travel, appointments, and logistics.
        </p>

        {/* Clean Executive Delegation Card */}
        <div className="max-w-2xl mx-auto mb-14">
          <form
            onSubmit={handleSubmit}
            className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#E1E5E8] shadow-sm transition-all focus-within:border-[#1F2933] focus-within:shadow-md"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center px-3 py-2">
                <input
                  type="text"
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  placeholder="What would you like Proventa to take care of?"
                  className="w-full bg-transparent border-0 text-sm sm:text-base text-[#1F2933] placeholder:text-[#A7B0B8] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#1F2933] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#111820] transition-all shadow-xs shrink-0 active:scale-[0.99]"
              >
                <span>Delegate</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#A7B0B8]" />
              </button>
            </div>

            {/* Quick Scenario Chips */}
            <div className="mt-2.5 pt-2.5 border-t border-[#F1F3F5] flex flex-wrap items-center justify-center sm:justify-start gap-2 px-2 text-xs text-[#66717C]">
              <span className="font-medium text-[#1F2933]">Examples:</span>
              <button
                type="button"
                onClick={() => setIntent('Reserve prime tasting table for 4 at Agashiye this Saturday evening')}
                className="hover:text-[#1F2933] hover:underline transition-colors"
              >
                Fine Dining
              </button>
              <span className="text-[#E1E5E8]">&bull;</span>
              <button
                type="button"
                onClick={() => setIntent('Business class flight from Ahmedabad to Delhi for 2 tomorrow morning')}
                className="hover:text-[#1F2933] hover:underline transition-colors"
              >
                Executive Flights
              </button>
              <span className="text-[#E1E5E8]">&bull;</span>
              <button
                type="button"
                onClick={() => setIntent('Luxury haveli weekend retreat in Udaipur with chauffeur')}
                className="hover:text-[#1F2933] hover:underline transition-colors"
              >
                Curated Stays
              </button>
            </div>
          </form>
        </div>

        {/* 3 Pillars in Clean Slate / Silver */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto text-left">
          <div className="p-5 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8]">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#66717C] block mb-2">01 · Precision</span>
            <h3 className="text-sm font-semibold text-[#1F2933] mb-1.5">Effortless Delegation</h3>
            <p className="text-xs text-[#66717C] leading-relaxed">
              State what you need. AI evaluates constraints, checks live verified inventory, and curates up to 5 genuine options.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8]">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#66717C] block mb-2">02 · Execution</span>
            <h3 className="text-sm font-semibold text-[#1F2933] mb-1.5">Human Concierge Desk</h3>
            <p className="text-xs text-[#66717C] leading-relaxed">
              Once you approve an option, our dedicated concierge team handles venue liaison, phone bookings, and real confirmations.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8]">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#66717C] block mb-2">03 · Integrity</span>
            <h3 className="text-sm font-semibold text-[#1F2933] mb-1.5">Zero Fabrication</h3>
            <p className="text-xs text-[#66717C] leading-relaxed">
              Deterministic verification against real provider references, transparent itemized pricing, and strict member privacy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
