'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Terminal, Shield, Cpu, Activity, CheckCircle2 } from 'lucide-react';

const SUGGESTIONS = [
  'Book dinner for 4 at Agashiye this Saturday, quiet rooftop table',
  'Arrange executive sedan airport pickup from Ahmedabad Terminal 2 tomorrow 8 PM',
  'Curate a heritage handloom gift under ₹10,000 for a VIP client',
  'Book luxury weekend tent stay at Gir Forest for next month',
];

export function HeroSection() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPromptIndex((i) => (i + 1) % SUGGESTIONS.length);
        setFade(true);
      }, 250);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    window.location.href = `/wave1?intent=${encodeURIComponent(inputValue.trim())}`;
  };

  const handleChipClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-slate-50 tech-grid">
      {/* Radiant Glowing Mesh Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-400/20 via-sky-300/20 to-purple-400/15 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-400/15 blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Status Chip / Value Proposition */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-cyan-200 backdrop-blur-md text-xs font-mono text-cyan-800 mb-8 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
          <span className="font-semibold">YOUR PRIVATE AI + HUMAN LIFESTYLE CONCIERGE // AHMEDABAD WAVE 1</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 uppercase">
          Life, <span className="tech-gradient-text">Handled.</span>
        </h1>

        {/* Subtitle explaining exactly what it does */}
        <p className="text-base sm:text-xl text-slate-700 max-w-3xl mx-auto mb-6 leading-relaxed font-normal">
          <strong className="text-slate-900 font-semibold">Delegate your everyday to-dos, reservations, and errands.</strong> Just type or speak what you need — our <span className="text-cyan-700 font-medium">AI plans it in seconds</span>, and our <span className="text-purple-700 font-medium">real human concierges in Ahmedabad</span> make the calls, verify the details, and book it for you.
        </p>

        {/* 3 Core Pillars Pill */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 text-xs font-mono text-slate-600">
          <span className="px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
            <span>1. You Ask In Plain English</span>
          </span>
          <span className="hidden sm:inline text-slate-400">&rarr;</span>
          <span className="px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>2. AI Solves & Compiles Options</span>
          </span>
          <span className="hidden sm:inline text-slate-400">&rarr;</span>
          <span className="px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>3. Human Concierge Verifies & Executes</span>
          </span>
        </div>

        {/* Interactive Futuristic Request Field */}
        <div className="max-w-2xl mx-auto mb-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white/90 backdrop-blur-md rounded-2xl p-2 border border-slate-200 hover:border-cyan-500/60 shadow-xl shadow-slate-200/50 transition-all text-left"
          >
            <div className="p-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
                <span className="flex items-center gap-1.5 text-cyan-700 font-semibold">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>CONCIERGE_PROMPT_INPUT:</span>
                </span>
                <span className="text-[10px] text-slate-400">[Enter to submit]</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder=""
                  className="w-full text-base sm:text-lg font-medium text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400 font-sans"
                />
                {!inputValue && (
                  <p
                    className="absolute top-0 left-0 text-base sm:text-lg text-slate-400 pointer-events-none transition-opacity duration-300 line-clamp-1"
                    style={{ opacity: fade ? 1 : 0 }}
                  >
                    {SUGGESTIONS[promptIndex]}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 px-3 pb-1">
              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline-flex items-center gap-1">
                <Shield className="h-3 w-3 text-emerald-600" />
                <span>Zero-Hallucination Protocol Active</span>
              </span>

              <button
                type="submit"
                className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-md shadow-cyan-600/20"
              >
                <span>Dispatch Request</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>

          {/* Quick Command Trigger Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-[10px] font-mono text-slate-500 mr-1">QUICK INJECT:</span>
            {SUGGESTIONS.slice(0, 3).map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(s)}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-400 text-[11px] font-mono text-slate-600 hover:text-cyan-700 transition-all shadow-xs"
              >
                + {s.split(' ')[1]} {s.split(' ')[2]}...
              </button>
            ))}
          </div>
        </div>

        {/* Real-time System Telemetry Strip */}
        <div className="max-w-xl mx-auto py-3 px-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-around text-[10px] font-mono text-slate-600 mb-12">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            LATENCY: 14MS
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            <Cpu className="h-3 w-3 text-cyan-600" />
            AI ENGINE: GEMINI 1.5 PRO
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-purple-600" />
            HUMAN GATE: STANDING BY
          </span>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/wave1"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 font-mono tracking-wider"
          >
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <span>JOIN WAVE 1 WAITLIST</span>
          </Link>

          <Link
            href="/how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium transition-all font-mono shadow-xs"
          >
            <span>EXPLORE SYSTEM ARCHITECTURE</span>
            <ArrowRight className="h-4 w-4 text-cyan-600" />
          </Link>
        </div>
      </div>
    </section>
  );
}
