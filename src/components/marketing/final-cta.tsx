'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FinalCTASection() {
  return (
    <section className="py-40 px-6 sm:px-8 lg:px-12 bg-black text-white border-t border-[#171717] text-center relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <h2 className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-tighter uppercase font-sans leading-[0.88]">
          LIVE MORE.
          <br />
          <span className="text-[#525252]">PLAN LESS.</span>
        </h2>

        <p className="text-lg sm:text-2xl text-[#a3a3a3] font-light max-w-xl mx-auto leading-relaxed">
          Your life doesn't need another app. It needs someone to handle it.
        </p>

        <div className="pt-6">
          <Link
            href="#request-section"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black text-sm font-mono font-semibold uppercase tracking-wider hover:bg-[#eaeaea] transition-all group shadow-2xl"
          >
            <span>Request Proventa</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
