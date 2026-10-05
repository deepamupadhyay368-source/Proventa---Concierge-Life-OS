'use client';

import { useState } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

export function HeroSection() {
  const [intent, setIntent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = intent.trim() || 'Reserve a quiet table for 4 this Saturday evening';
    window.location.href = `/sign-up?intent=${encodeURIComponent(query)}`;
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 bg-white overflow-hidden live-bg-canvas">
      {/* Live Moving Ambient Light Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-[#E5E9ED]/60 via-[#F1F3F5]/40 to-transparent blur-[120px] pointer-events-none -z-10 rounded-full live-orb-1" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-[#F7F8FA]/80 via-[#E1E5E8]/30 to-transparent blur-[140px] pointer-events-none -z-10 rounded-full live-orb-2" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-radial from-[#F1F3F5]/50 to-transparent blur-[100px] pointer-events-none -z-10 live-orb-3" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Live Pulsing Membership Tag */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E1E5E8] text-[11px] uppercase tracking-[0.16em] font-semibold text-[#1F2933] mb-8 shadow-xs hover:border-[#A7B0B8] transition-all hover:scale-[1.02] cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
          </span>
          <span>Your first request is on us · Experience Proventa</span>
        </div>

        {/* Live Flowing Modern Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-[#1F2933] mb-6 leading-[1.08]">
          Life, <span className="live-flowing-text font-semibold">Handled.</span>
        </h1>

        {/* Refined Subtitle */}
        <p className="text-base sm:text-xl text-[#66717C] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          For people who value their time. Try Proventa with your first request. Tell us what you need, and we&apos;ll take it from there.
        </p>

        {/* Clean Executive Delegation Card with Live Focus & Hover Glow */}
        <div className="max-w-2xl mx-auto mb-14">
          <form
            onSubmit={handleSubmit}
            className="p-2 sm:p-2.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#E1E5E8] shadow-sm hover:shadow-lg transition-all focus-within:border-[#1F2933] focus-within:shadow-xl focus-within:ring-2 focus-within:ring-[#1F2933]/5"
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
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1F2933] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#111820] hover:shadow-md transition-all shadow-xs shrink-0 active:scale-[0.98]"
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

          {/* Primary / Secondary Onboarding CTAs */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#1F2933] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#111820] hover:shadow-md transition-all shadow-xs w-full sm:w-auto"
            >
              <span>Join Proventa</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#A7B0B8]" />
            </a>
            <a
              href="/sign-in"
              className="text-xs uppercase tracking-wider font-semibold text-[#66717C] hover:text-[#1F2933] transition-colors py-2 px-3"
            >
              Already a member? <span className="underline text-[#1F2933]">Sign in</span>
            </a>
          </div>
        </div>

        {/* 3 Pillars in Live Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto text-left">
          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#E1E5E8] shadow-xs hover:border-[#A7B0B8] hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#66717C] block mb-2">01 · Precision</span>
            <h3 className="text-sm font-semibold text-[#1F2933] mb-1.5">Effortless Delegation</h3>
            <p className="text-xs text-[#66717C] leading-relaxed">
              State what you need. AI evaluates constraints, checks live verified inventory, and curates up to 5 genuine options.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#E1E5E8] shadow-xs hover:border-[#A7B0B8] hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#66717C] block mb-2">02 · Execution</span>
            <h3 className="text-sm font-semibold text-[#1F2933] mb-1.5">Human Concierge Desk</h3>
            <p className="text-xs text-[#66717C] leading-relaxed">
              Once you approve an option, our dedicated concierge team handles venue liaison, phone bookings, and real confirmations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#E1E5E8] shadow-xs hover:border-[#A7B0B8] hover:shadow-md hover:-translate-y-1 transition-all duration-300">
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
