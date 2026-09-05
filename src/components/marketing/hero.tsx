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
  const [promptIndex, setPromptIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((i) => (i + 1) % SUGGESTIONS.length);
    }, 4800);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim() || SUGGESTIONS[promptIndex];
    window.location.href = `/wave1?intent=${encodeURIComponent(query)}`;
  };

  const handleChipClick = (suggestion: string) => {
    setInputValue(suggestion);
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
          <span>Ahmedabad · Wave 1 Cohort</span>
        </div>

        {/* Grand Editorial Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif tracking-tight text-neutral-900 mb-6 font-normal leading-[1.06]">
          Life, <span className="italic font-serif text-brand-700">Handled.</span>
        </h1>

        {/* Refined Subtitle */}
        <p className="text-lg sm:text-2xl text-neutral-600 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
          Your private personal concierge in Ahmedabad. Dining reservations, bespoke travel, thoughtful gifting, and lifestyle logistics — executed with quiet precision.
        </p>

        {/* Tactile Ivory Concierge Card */}
        <div className="max-w-2xl mx-auto mb-14">
          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-brand-200/90 shadow-[0_20px_50px_rgba(41,31,24,0.06)] hover:border-brand-300 transition-all text-left"
          >
            <div className="p-3">
              <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-brand-700 uppercase mb-3">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                  <span>Personal Concierge Desk</span>
                </span>
                <span className="text-[11px] text-neutral-400 font-normal lowercase tracking-normal">plain english or gujarati</span>
              </div>

              <textarea
                rows={3}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={SUGGESTIONS[promptIndex]}
                className="w-full text-base sm:text-lg font-normal text-neutral-900 placeholder:text-neutral-400/80 focus:outline-none resize-none bg-transparent leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-brand-100/80 px-3">
              <span className="text-xs text-neutral-500 font-normal hidden sm:inline">
                Verified with local venues by a dedicated human concierge.
              </span>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-neutral-900 text-[#faf8f5] text-xs uppercase tracking-widest font-semibold hover:bg-brand-950 transition-all shadow-sm hover:shadow-md shrink-0"
              >
                <span>Delegate This</span>
                <ArrowRight className="h-3.5 w-3.5 text-brand-300" />
              </button>
            </div>
          </form>

          {/* Curated Editorial Suggestion Tags */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 mr-1">Curated:</span>
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(s)}
                className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white/70 border border-brand-200/70 text-neutral-700 hover:border-brand-400 hover:text-neutral-900 transition-colors shadow-2xs"
              >
                {s.length > 35 ? s.substring(0, 35) + '...' : s}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Refined Quiet Luxury Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-8 text-left border-t border-brand-200/60">
          <div className="p-6 rounded-2xl bg-white/60 border border-brand-200/50 backdrop-blur-xs">
            <span className="font-serif italic text-2xl text-brand-600 font-normal block mb-2">01</span>
            <h3 className="text-base font-serif font-semibold text-neutral-900 mb-2">Effortless Delegation</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              Send a simple note. No searching through endless apps or calling busy venues. Just state what you need.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/60 border border-brand-200/50 backdrop-blur-xs">
            <span className="font-serif italic text-2xl text-brand-600 font-normal block mb-2">02</span>
            <h3 className="text-base font-serif font-semibold text-neutral-900 mb-2">Ahmedabad Access</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              Our concierges maintain personal relationships with premier local restaurants, hotels, and luxury artisans.
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
