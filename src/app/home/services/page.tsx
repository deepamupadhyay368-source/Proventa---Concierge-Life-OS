'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Droplet, 
  Hammer, 
  Wind, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  CalendarCheck,
  ChevronDown,
  Info
} from 'lucide-react';
import { HOME_SERVICE_CATEGORIES } from '@/lib/home/constants';

export default function ServicesPage() {
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('ALL');

  const filteredCategories = selectedCategoryKey === 'ALL'
    ? HOME_SERVICE_CATEGORIES
    : HOME_SERVICE_CATEGORIES.filter(c => c.key === selectedCategoryKey);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-[#53634A] bg-[#53634A]/10 px-3 py-1 rounded-full border border-[#53634A]/20">
          Standardized Catalogue
        </span>
        <h1 className="text-4xl font-bold text-[#171A17]">Our Service Catalogue</h1>
        <p className="text-stone-600 text-sm leading-relaxed">
          Clear inclusions, transparent durations, safety protocols, and upfront material pricing across 7 core domestic trades in Ahmedabad.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-[#E3DFD5] pb-4">
        <button
          onClick={() => setSelectedCategoryKey('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            selectedCategoryKey === 'ALL'
              ? 'bg-[#53634A] text-white'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-[#E3DFD5]'
          }`}
        >
          All Categories
        </button>
        {HOME_SERVICE_CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategoryKey(cat.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              selectedCategoryKey === cat.key
                ? 'bg-[#53634A] text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-[#E3DFD5]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Categories & Service Items */}
      <div className="space-y-14">
        {filteredCategories.map(cat => (
          <div key={cat.key} className="space-y-6">
            <div className="border-b border-[#E3DFD5] pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#171A17]">{cat.name}</h2>
                <p className="text-xs text-stone-500">{cat.description}</p>
              </div>
              <span className="text-xs font-mono text-stone-400 font-medium">
                {cat.services.length} services
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.services.map(srv => (
                <div key={srv.id} className="bg-white rounded-2xl p-6 border border-[#E3DFD5] shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-stone-400">{srv.code}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>~{srv.estimatedDurationMin} mins</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#171A17] leading-snug">{srv.name}</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">{srv.description}</p>

                    {/* Inclusions */}
                    <div className="pt-2 border-t border-stone-100 space-y-1.5">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Scope of Work</span>
                      <ul className="text-xs text-stone-700 space-y-1">
                        {srv.inclusions.map((inc, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Exclusions */}
                    {srv.exclusions.length > 0 && (
                      <div className="pt-1 text-[11px] text-stone-500">
                        <span className="font-semibold text-stone-600">Exclusions: </span>
                        <span>{srv.exclusions.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing & Booking Action */}
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-stone-400">Non-member price</div>
                      <div className="font-bold text-stone-900 text-sm">₹{srv.standardPrice}</div>
                    </div>
                    <Link
                      href={`/home/customer/book?service=${srv.code}`}
                      className="inline-flex items-center gap-1.5 bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>Book Service</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
