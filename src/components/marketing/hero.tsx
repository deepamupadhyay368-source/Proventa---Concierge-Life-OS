'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowDown } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-between pt-36 pb-16 px-6 sm:px-8 lg:px-12 bg-black text-white overflow-hidden">
      {/* Subtle Slow-Moving Ambient Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-neutral-700 via-neutral-900 to-black blur-[140px] animate-pulse-soft" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-neutral-800 via-neutral-950 to-black blur-[140px] animate-pulse-soft" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Top Tag */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171717] border border-[#262626] text-xs font-mono text-[#a3a3a3] uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>PROVENTA — LIVE</span>
        </div>
      </div>

      {/* Center Dominant Typography */}
      <div className="relative z-10 my-auto py-12 max-w-5xl">
        <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10.5rem] font-bold tracking-tighter leading-[0.85] font-sans uppercase">
          LIFE,
          <br />
          HANDLED.
        </h1>

        <p className="mt-8 text-lg sm:text-xl md:text-2xl text-[#a3a3a3] max-w-xl font-light leading-relaxed">
          Your personal concierge for whatever life needs.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link
            href="#request-section"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black text-sm font-mono font-semibold uppercase tracking-wider hover:bg-[#eaeaea] transition-all group"
          >
            <span>Request a Concierge</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="#live-stream"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-full text-xs font-mono uppercase tracking-widest text-[#a3a3a3] hover:text-white transition-colors"
          >
            <span>Explore Proventa</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </Link>
        </div>
      </div>

      {/* Bottom Subtle Statement */}
      <div className="relative z-10 pt-8 border-t border-[#222222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-[#737373]">
        <div>
          <span>CONCIERGE LIFE OS</span>
          <span className="mx-2">·</span>
          <span>HUMAN-FIRST EXECUTION</span>
        </div>
        <div>
          <span>AHMEDABAD</span>
          <span className="mx-2">/</span>
          <span>MUMBAI</span>
          <span className="mx-2">/</span>
          <span>DELHI</span>
        </div>
      </div>
    </section>
  );
}
