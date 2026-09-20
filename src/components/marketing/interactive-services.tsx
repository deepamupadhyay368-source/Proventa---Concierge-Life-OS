'use client';

import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

const SERVICES = [
  {
    id: 'TRAVEL',
    name: 'TRAVEL',
    subtitle: 'Commercial Aviation & Private Charter',
    description: 'Bespoke flight routing, premium cabin bookings, schedule tracking, and terminal meet-and-assist.',
    sample: 'IndiGo · Air India · Executive Charters',
  },
  {
    id: 'DINING',
    name: 'DINING',
    subtitle: 'Fine Dining & Verified Tables',
    description: 'Prime table reservations at heritage havelis, tasting menus, and maître d\' direct placements.',
    sample: 'Agashiye · Vintage Terrace · Curated Culinary',
  },
  {
    id: 'STAYS',
    name: 'STAYS',
    subtitle: 'Luxury Suites, Estates & Villas',
    description: 'Private heritage estates, royal palaces, boutique desert resorts, and personalized luxury villas.',
    sample: 'Heritage Suites · Taj Estates · Private Havelis',
  },
  {
    id: 'EXPERIENCES',
    name: 'EXPERIENCES',
    subtitle: 'Curated Access & Bespoke Escapes',
    description: 'Private wildlife safaris, regional architectural tours, and bespoke weekend itineraries.',
    sample: 'Gir Private Trails · Pol Architectural Tours',
  },
  {
    id: 'TRANSPORT',
    name: 'TRANSPORT',
    subtitle: 'Chauffeur Fleet & Ground Mobility',
    description: 'Dedicated executive sedans, seamless airport transfers, and reliable full-day private chauffeurs.',
    sample: 'Mercedes E-Class · Toyota Vellfire · Airport Escort',
  },
  {
    id: 'GIFTS',
    name: 'GIFTS',
    subtitle: 'Bespoke Procurement & Presentation',
    description: 'Handcrafted artisan textiles, rare antiquities, floral arrangements, and doorstep presentation.',
    sample: 'Artisan Patola · Luxury Silver · Hand-tied Florals',
  },
  {
    id: 'EVENTS',
    name: 'EVENTS',
    subtitle: 'Cultural Previews & Private Evenings',
    description: 'Private gallery previews, concert VIP passes, literary gatherings, and private dining events.',
    sample: 'Heritage Concerts · Private Art Vernissages',
  },
  {
    id: 'EVERYDAY TASKS',
    name: 'EVERYDAY TASKS',
    subtitle: 'Discreet Logistics & Family Office',
    description: 'Document notarization, urgent courier dispatch, lifestyle errands, and trusted domestic assistance.',
    sample: 'Express Secure Logistics · Calendar Alignment',
  },
];

export function InteractiveServicesSection() {
  const [activeId, setActiveId] = useState<string>('TRAVEL');
  const activeService = SERVICES.find((s) => s.id === activeId) || SERVICES[0];

  return (
    <section id="services" className="py-32 px-6 sm:px-8 lg:px-12 bg-[#080808] text-white border-t border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-xs uppercase tracking-widest font-mono text-[#737373] mb-3">CURATED CAPABILITIES</p>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight uppercase font-sans">
            WHATEVER LIFE NEEDS.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Editorial Interactive List */}
          <div className="lg:col-span-7 divide-y divide-[#1c1c1c]">
            {SERVICES.map((service) => {
              const isSelected = activeId === service.id;
              return (
                <div
                  key={service.id}
                  onMouseEnter={() => setActiveId(service.id)}
                  onClick={() => setActiveId(service.id)}
                  className="py-6 sm:py-8 cursor-pointer group flex items-center justify-between transition-all"
                >
                  <div className="space-y-1">
                    <h3
                      className={`text-2xl sm:text-4xl font-bold tracking-tight uppercase transition-all duration-300 font-sans ${
                        isSelected
                          ? 'text-white translate-x-2'
                          : 'text-[#444444] group-hover:text-[#a3a3a3]'
                      }`}
                    >
                      {service.name}
                    </h3>
                    <p className={`text-xs font-mono transition-opacity duration-300 ${
                      isSelected ? 'text-[#a3a3a3] opacity-100' : 'opacity-0'
                    }`}>
                      {service.subtitle}
                    </p>
                  </div>

                  <ArrowUpRight
                    className={`w-5 h-5 transition-all duration-300 ${
                      isSelected
                        ? 'text-white opacity-100 translate-x-1 -translate-y-1'
                        : 'text-[#444444] opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Right: Dynamic Editorial Showcase */}
          <div className="lg:col-span-5 sticky top-32 p-8 sm:p-10 rounded-3xl bg-[#111111] border border-[#242424] space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#737373]">FEATURED DISPATCH</span>
              <h4 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase font-sans">
                {activeService.name}
              </h4>
              <p className="text-xs font-mono text-[#a3a3a3]">{activeService.subtitle}</p>
            </div>

            <p className="text-sm text-[#d4d4d4] font-light leading-relaxed">
              {activeService.description}
            </p>

            <div className="p-4 rounded-xl bg-[#090909] border border-[#1f1f1f] space-y-1.5 text-xs font-mono">
              <span className="text-[10px] uppercase text-[#525252] block font-semibold">Verified Network Partners</span>
              <span className="text-[#a3a3a3] block">{activeService.sample}</span>
            </div>

            <div className="pt-4 border-t border-[#1f1f1f] flex items-center justify-between text-xs font-mono text-[#737373]">
              <span>Direct Human Maître D' Coordination</span>
              <span className="text-emerald-400 font-semibold">● ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
