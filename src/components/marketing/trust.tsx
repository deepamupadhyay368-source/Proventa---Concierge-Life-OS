'use client';

import React from 'react';

export function TrustSection() {
  return (
    <section className="py-32 px-6 sm:px-8 lg:px-12 bg-[#080808] text-white border-t border-[#171717]">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs uppercase tracking-widest font-mono text-[#737373]">THE STANDARD</p>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight uppercase font-sans">
            ONE CONCIERGE.
            <br />
            COUNTLESS POSSIBILITIES.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#222222]">
          <div className="space-y-3">
            <h4 className="text-lg font-bold tracking-tight uppercase">ABSOLUTE DISCRETION</h4>
            <p className="text-sm text-[#a3a3a3] font-light leading-relaxed">
              Every request is handled confidentially. Your personal preferences, schedules, and arrangements remain private to you and your assigned concierge.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-bold tracking-tight uppercase">VERIFIED REALITY</h4>
            <p className="text-sm text-[#a3a3a3] font-light leading-relaxed">
              We never fabricate confirmations. If an airline seat or dinner table is unavailable, we state it clearly and provide genuine alternatives.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-bold tracking-tight uppercase">SOVEREIGN OWNERSHIP</h4>
            <p className="text-sm text-[#a3a3a3] font-light leading-relaxed">
              From the moment your request arrives until the final confirmation is logged, a dedicated human operator takes personal accountability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
