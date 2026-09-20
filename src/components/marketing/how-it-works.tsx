'use client';

import React from 'react';

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-32 px-6 sm:px-8 lg:px-12 bg-black text-white border-t border-[#171717]">
      <div className="max-w-7xl mx-auto space-y-20">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest font-mono text-[#737373]">THE WORKFLOW</p>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight uppercase font-sans">
            EFFORTLESS BY DESIGN.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Step 01 */}
          <div className="space-y-4 pt-8 border-t border-[#262626]">
            <span className="text-5xl font-mono font-bold text-[#262626] block">01</span>
            <h3 className="text-2xl font-bold tracking-tight uppercase font-sans">ASK</h3>
            <p className="text-sm text-[#a3a3a3] font-light leading-relaxed">
              Tell us what you need in a single sentence. A table for two at Agashiye, an executive chauffeur to Mumbai, or a curated gift.
            </p>
          </div>

          {/* Step 02 */}
          <div className="space-y-4 pt-8 border-t border-[#262626]">
            <span className="text-5xl font-mono font-bold text-[#262626] block">02</span>
            <h3 className="text-2xl font-bold tracking-tight uppercase font-sans">WE HANDLE</h3>
            <p className="text-sm text-[#a3a3a3] font-light leading-relaxed">
              Our human concierge desk takes immediate ownership, coordinates verified inventory, and confirms directly with partner management.
            </p>
          </div>

          {/* Step 03 */}
          <div className="space-y-4 pt-8 border-t border-[#262626]">
            <span className="text-5xl font-mono font-bold text-[#262626] block">03</span>
            <h3 className="text-2xl font-bold tracking-tight uppercase font-sans">DONE</h3>
            <p className="text-sm text-[#a3a3a3] font-light leading-relaxed">
              Authoritative details appear on your timeline with genuine provider references. You get on with your life.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
