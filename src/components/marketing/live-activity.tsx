'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, CheckCircle2 } from 'lucide-react';

const LIVE_EVENTS = [
  { action: 'Dinner being arranged', venue: 'The House of MG, Ahmedabad', status: 'IN PROGRESS', time: 'Just now' },
  { action: 'Weekend escape being planned', venue: 'Heritage Estate, Gir Sanctuary', status: 'CURATING', time: '1m ago' },
  { action: 'Airport transfer being coordinated', venue: 'AMD ➔ BOM Executive Chauffeur', status: 'DISPATCHED', time: '3m ago' },
  { action: 'Bespoke gift being arranged', venue: 'Artisan Textile Presentation', status: 'PACKAGING', time: '4m ago' },
  { action: 'Restaurant reservation confirmed', venue: 'Heritage Fine Dining Table for Two', status: 'CONFIRMED', time: '6m ago' },
  { action: 'Private flight route mapped', venue: 'Ahmedabad (AMD) ➔ Delhi (DEL)', status: 'INSPECTION', time: '8m ago' },
];

export function LiveActivitySection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LIVE_EVENTS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const visibleItems = [
    LIVE_EVENTS[currentIndex],
    LIVE_EVENTS[(currentIndex + 1) % LIVE_EVENTS.length],
    LIVE_EVENTS[(currentIndex + 2) % LIVE_EVENTS.length],
  ];

  return (
    <section id="live-stream" className="py-24 px-6 sm:px-8 lg:px-12 bg-[#0a0a0a] text-white border-t border-[#171717]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#737373] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>ACTIVE DISPATCH FEED</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight uppercase font-sans">
              PROVENTA IS LIVE.
            </h2>
          </div>
          <p className="text-sm text-[#a3a3a3] max-w-md font-light">
            Real mandates actively handled in the background by dedicated concierge operators right now.
          </p>
        </div>

        <div className="space-y-3">
          {visibleItems.map((item, idx) => (
            <div
              key={`${item.action}-${idx}`}
              className="p-5 sm:p-6 rounded-2xl bg-[#121212] border border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-700 ease-out hover:border-[#383838]"
              style={{
                opacity: 1 - idx * 0.22,
                transform: `scale(${1 - idx * 0.02})`,
              }}
            >
              <div className="flex items-center gap-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-white tracking-tight">{item.action}</h3>
                  <p className="text-xs text-[#737373] font-mono mt-0.5">{item.venue}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-full bg-[#1c1c1c] text-[#d4d4d4] border border-[#2e2e2e]">
                  {item.status}
                </span>
                <span className="text-[#525252]">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
