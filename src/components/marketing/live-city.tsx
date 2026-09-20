'use client';

import React, { useState } from 'react';
import { MapPin, Building, Utensils, Plane, Compass, Car } from 'lucide-react';

const CITIES = [
  {
    id: 'AMD',
    name: 'AHMEDABAD',
    status: 'ACTIVE HUB',
    isLive: true,
    hubs: [
      { name: 'Heritage Walled City & Agashiye', category: 'DINING', detail: 'Prime table reservation desks' },
      { name: 'Sardar Vallabhbhai Patel Int. (AMD)', category: 'TRAVEL', detail: 'Fast-track terminal transfers' },
      { name: 'Gift City Corporate Corridor', category: 'MOBILITY', detail: 'Dedicated executive fleet' },
      { name: 'Prahlad Nagar & Bodakdev', category: 'EXPERIENCES', detail: 'Curated lifestyle & culinary' },
    ],
  },
  {
    id: 'BOM',
    name: 'MUMBAI',
    status: 'IN PROGRESS',
    isLive: false,
    hubs: [
      { name: 'Bandra Kurla Complex (BKC)', category: 'MOBILITY', detail: 'Intercity executive corridor' },
      { name: 'South Mumbai Heritage', category: 'STAYS', detail: 'Iconic harbor suites & dining' },
    ],
  },
  {
    id: 'DEL',
    name: 'DELHI',
    status: 'COMING NEXT',
    isLive: false,
    hubs: [
      { name: 'Lutyens & Diplomatic Enclave', category: 'EVENTS', detail: 'Exclusive embassy access' },
      { name: 'Aerocity Hospitality District', category: 'STAYS', detail: 'Executive airport layovers' },
    ],
  },
  {
    id: 'BLR',
    name: 'BANGALORE',
    status: 'PLANNED',
    isLive: false,
    hubs: [
      { name: 'Indiranagar & Lavelle Road', category: 'DINING', detail: 'Curated tasting tables' },
    ],
  },
];

export function LiveCitySection() {
  const [activeCityId, setActiveCityId] = useState('AMD');
  const city = CITIES.find((c) => c.id === activeCityId) || CITIES[0];

  return (
    <section className="py-32 px-6 sm:px-8 lg:px-12 bg-black text-white border-t border-[#171717]">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#737373] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>TERRITORIAL PRESENCE</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight uppercase font-sans">
              {city.name} — LIVE.
            </h2>
          </div>

          {/* City Selector */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono">
            {CITIES.map((c) => {
              const isCurrent = c.id === activeCityId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCityId(c.id)}
                  className={`px-4 py-2 rounded-full border transition-all ${
                    isCurrent
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-[#121212] text-[#737373] border-[#262626] hover:text-white'
                  }`}
                >
                  <span>{c.name}</span>
                  {c.isLive && <span className="ml-1.5 text-emerald-500 font-bold">●</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* City Activity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {city.hubs.map((hub, idx) => (
            <div
              key={`${hub.name}-${idx}`}
              className="p-6 rounded-2xl bg-[#0f0f0f] border border-[#222222] space-y-3 hover:border-[#383838] transition-colors"
            >
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#525252] block">
                {hub.category}
              </span>
              <h4 className="text-base font-semibold text-white tracking-tight">{hub.name}</h4>
              <p className="text-xs text-[#a3a3a3] font-light leading-relaxed">{hub.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
