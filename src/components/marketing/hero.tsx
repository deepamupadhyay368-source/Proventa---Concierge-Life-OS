'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, MessageSquare, PhoneCall, ShieldCheck } from 'lucide-react';

const SUGGESTIONS = [
  'Book dinner for 4 at Agashiye this Saturday, quiet rooftop table',
  'Arrange executive sedan airport pickup from Ahmedabad Terminal 2 tomorrow 8 PM',
  'Curate a heritage handloom gift under ₹10,000 for a VIP client',
  'Book luxury weekend tent stay at Gir Forest for next month',
];

export function HeroSection() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((i) => (i + 1) % SUGGESTIONS.length);
    }, 4500);
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
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#fafaf9]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* City & Batch Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-300 text-xs font-bold text-neutral-800 mb-8 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-neutral-900"></span>
          <span>AHMEDABAD · WAVE 1 MEMBERSHIP NOW OPEN</span>
        </div>

        {/* Primary Bold Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-neutral-900 mb-6 uppercase">
          Life, Handled.
        </h1>

        {/* Clear Subtitle */}
        <p className="text-lg sm:text-2xl text-neutral-700 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
          The personal concierge service for Ahmedabad. Tell us what you need — reservations, travel, errands, appointments, or gifting. We handle every single detail.
        </p>

        {/* Simple Bold Request Box */}
        <div className="max-w-2xl mx-auto mb-12">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-3 border-2 border-neutral-900 shadow-xl text-left"
          >
            <div className="p-2">
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                What can we take care of for you today?
              </label>
              <textarea
                rows={3}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={SUGGESTIONS[promptIndex]}
                className="w-full text-base sm:text-lg font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-100 px-2">
              <span className="text-xs text-neutral-500 font-medium hidden sm:inline">
                A real human concierge will review and verify every booking.
              </span>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 text-white font-bold text-sm hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <span>Delegate This</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Quick Suggestions Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-bold text-neutral-400 mr-1">Popular:</span>
            {SUGGESTIONS.slice(0, 3).map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(s)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
              >
                {s.length > 38 ? s.substring(0, 38) + '...' : s}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Bold Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-6 text-left">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 font-bold mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-1">You Ask in Plain Words</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              No complicated apps or rigid forms. Just type or say what you need like texting an assistant.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 font-bold mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-1">We Verify in Ahmedabad</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Our local team calls venues, checks real availability, and secures the best tables and rates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 font-bold mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-1">Approved &amp; Confirmed</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Review details and price on one simple card. Nothing is charged or booked without your ok.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
