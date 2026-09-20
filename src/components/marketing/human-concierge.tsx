'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Headphones, ShieldCheck, HeartHandshake } from 'lucide-react';

export function HumanConciergeSection() {
  return (
    <section id="human-concierge" className="py-32 px-6 sm:px-8 lg:px-12 bg-[#0a0a0a] text-white border-t border-[#171717]">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-[#262626] text-xs font-mono uppercase tracking-widest text-[#a3a3a3]">
            <Headphones className="w-3.5 h-3.5 text-[#c8b99d]" />
            <span>SOVEREIGN OPERATOR DESK</span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight uppercase leading-[0.95] font-sans">
            NOT JUST AI.
            <br />
            <span className="text-[#a3a3a3]">A HUMAN WHEN IT MATTERS.</span>
          </h2>

          <p className="text-lg sm:text-xl text-[#a3a3a3] font-light leading-relaxed">
            Technology helps us search and structure faster. But when a restaurant is fully booked, a flight schedule disrupts, or a bespoke gift requires artisan packaging, our senior concierge team handles the conversation in person.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#222222]">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#525252]">DIRECT ACCESS</span>
              <h4 className="text-base font-semibold text-white">Telephone &amp; Maître D' Relationships</h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                Direct lines to duty managers, hotel concierges, and private aviation handlers without automated bots.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#525252]">ZERO FABRICATION</span>
              <h4 className="text-base font-semibold text-white">Verifiable Reality</h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                No simulated references. Every confirmed booking is backed by genuine venue records and verified PNRs.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="#request-section"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black text-xs font-mono font-semibold uppercase tracking-wider hover:bg-[#eaeaea] transition-all group"
            >
              <span>Talk to a Concierge</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
