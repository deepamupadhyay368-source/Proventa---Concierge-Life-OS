'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Clock, Users, ShieldCheck, Search, CheckCircle2 } from 'lucide-react';
import { AHMEDABAD_LOCALITIES } from '@/lib/home/constants';

export default function ServiceAreasPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLocalities = AHMEDABAD_LOCALITIES.filter(loc =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.pincodes.some(p => p.includes(searchTerm)) ||
    loc.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-[#53634A] bg-[#53634A]/10 px-3 py-1 rounded-full border border-[#53634A]/20">
          City Coverage
        </span>
        <h1 className="text-4xl font-bold text-[#171A17]">Operational Service Areas in Ahmedabad</h1>
        <p className="text-stone-600 text-sm leading-relaxed">
          We maintain dedicated technician clusters across Ahmedabad's Western and North-Western residential corridors to guarantee under 90-minute arrival for emergency calls.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto pt-2">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search locality, zone, or pincode (e.g. 380058, Bopal)..."
              className="w-full text-sm rounded-xl border border-[#E3DFD5] px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#53634A] bg-white shadow-xs"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          </div>
        </div>
      </div>

      {/* Localities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocalities.map(loc => (
          <div key={loc.id} className="bg-white rounded-2xl p-6 border border-[#E3DFD5] shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                  {loc.zone.replace('_', ' ')} ZONE
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active Hub</span>
                </span>
              </div>

              <h3 className="font-bold text-xl text-[#171A17]">{loc.name}</h3>

              <div className="space-y-1.5 text-xs text-stone-600 pt-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>Avg. Arrival Response: <strong>~{loc.averageResponseTimeMin} minutes</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>Verified Technicians: <strong>{loc.activeTechniciansCount} active</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>Covered Households: <strong>{loc.coveredHouseholdsCount}+ members</strong></span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                  Covered Pincodes
                </span>
                <div className="flex flex-wrap gap-1">
                  {loc.pincodes.map(pin => (
                    <span key={pin} className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      {pin}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <Link
                href="/membership"
                className="w-full text-center block bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold py-2.5 rounded-xl transition"
              >
                Join in {loc.name}
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
