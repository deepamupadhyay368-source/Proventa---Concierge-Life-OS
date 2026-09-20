'use client';

import React from 'react';
import { ArrowDown } from 'lucide-react';

export function CoreMessageSection() {
  return (
    <section className="py-32 px-6 sm:px-8 lg:px-12 bg-black text-white border-t border-[#171717]">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Core Big Words */}
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-widest font-mono text-[#737373]">THE PROVENTA PRINCIPLE</p>
          <div className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-tighter leading-none font-sans uppercase">
            <div>YOU ASK.</div>
            <div className="text-[#737373]">WE HANDLE.</div>
          </div>
        </div>

        {/* 3 Step Editorial Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-[#222222]">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#525252]">STAGE 01</span>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight uppercase">YOU ASK.</h3>
            <p className="text-sm text-[#a3a3a3] font-light leading-relaxed">
              Send a message in plain language. A dinner, a flight, a luxury stay, a rare gift. No forms or dropdowns required.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#525252]">STAGE 02</span>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight uppercase text-white">PROVENTA WORKS.</h3>
            <p className="text-sm text-[#a3a3a3] font-light leading-relaxed">
              Technology accelerates the research. Real human concierges coordinate partner maître d's, airlines, and private estates.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#525252]">STAGE 03</span>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight uppercase text-white">YOU LIVE.</h3>
            <p className="text-sm text-[#a3a3a3] font-light leading-relaxed">
              The booking is verified. The table is held. The confirmation arrives directly to your timeline. Your time remains yours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
