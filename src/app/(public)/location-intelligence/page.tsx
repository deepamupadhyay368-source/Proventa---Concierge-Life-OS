'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AHMEDABAD_LOCALITIES, LocalityIntelligence } from '@/lib/real-estate/constants';
import { 
  MapPin, 
  TrendingUp, 
  Percent, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Layers
} from 'lucide-react';
import Link from 'next/link';

function LocationIntelligenceContent() {
  const searchParams = useSearchParams();
  const initialLocalityParam = searchParams?.get('locality') || 'south-bopal';

  const [selectedLocalitySlug, setSelectedLocalitySlug] = useState<string>(initialLocalityParam);
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');

  const selectedLocality: LocalityIntelligence = useMemo(() => {
    return (
      AHMEDABAD_LOCALITIES.find((l) => l.slug === selectedLocalitySlug) ||
      AHMEDABAD_LOCALITIES[0]
    );
  }, [selectedLocalitySlug]);

  const filteredLocalities = useMemo(() => {
    if (zoneFilter === 'ALL') return AHMEDABAD_LOCALITIES;
    return AHMEDABAD_LOCALITIES.filter((l) => l.zone.toUpperCase().includes(zoneFilter));
  }, [zoneFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="border-b border-[#C8C4BA] pb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#547568]">
          Micro-Market Research &bull; Ahmedabad & Gandhinagar
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#202B3C] tracking-tight mt-1">
          Location Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-[#69717B] mt-2 max-w-3xl leading-relaxed">
          Comprehensive market research on Ahmedabad residential corridors: capital appreciation trajectories, rental yields, town-planning infrastructure, and verified transaction density.
        </p>
      </div>

      {/* Micromarket Selector & Zone Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#C8C4BA] p-4 rounded-xs shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-[#547568]" />
          <span className="font-bold text-[#202B3C] uppercase text-[11px] tracking-wider">Zone Filter:</span>
          {['ALL', 'WEST', 'SOUTH-WEST', 'NORTH', 'CENTRAL'].map((z) => (
            <button
              key={z}
              onClick={() => setZoneFilter(z)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-2xs transition-colors cursor-pointer ${
                zoneFilter === z
                  ? 'bg-[#202B3C] text-white'
                  : 'bg-stone-100 text-[#69717B] hover:text-[#202B3C]'
              }`}
            >
              {z}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#69717B] font-mono">
          Showing {filteredLocalities.length} of {AHMEDABAD_LOCALITIES.length} Analyzed Localities
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Locality Roster List */}
        <div className="lg:col-span-4 bg-white border border-[#C8C4BA] rounded-xs shadow-xs divide-y divide-stone-200 overflow-hidden">
          <div className="p-3.5 bg-stone-50 border-b border-stone-200 text-xs font-bold uppercase tracking-wider text-[#202B3C]">
            Select Analyzed Locality
          </div>
          <div className="max-h-[640px] overflow-y-auto divide-y divide-stone-100">
            {filteredLocalities.map((loc) => {
              const isSelected = loc.slug === selectedLocality.slug;
              return (
                <button
                  key={loc.slug}
                  onClick={() => setSelectedLocalitySlug(loc.slug)}
                  className={`w-full text-left p-4 transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-[#F5F3ED] border-l-4 border-l-[#547568]'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#202B3C]">{loc.name}</span>
                    <span className="text-[10px] font-mono text-[#69717B] bg-stone-200/60 px-1.5 py-0.5 rounded-2xs">
                      {loc.zone}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#69717B] font-mono">
                    <span>Avg: ₹{loc.avgPriceSqFt.toLocaleString('en-IN')}/sq.ft</span>
                    <span className="text-emerald-700 font-semibold">+{loc.historicalGrowth1Yr}% (1y)</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Locality Detailed Brief */}
        <div className="lg:col-span-8 bg-white border border-[#C8C4BA] p-6 sm:p-8 rounded-xs shadow-xs space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-[#547568] font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>{selectedLocality.city}, {selectedLocality.state} &bull; PIN {selectedLocality.pincode}</span>
              </div>
              <h2 className="text-3xl font-black text-[#202B3C] tracking-tight mt-1">
                {selectedLocality.name} Locality Intelligence
              </h2>
              <p className="text-xs text-[#69717B] mt-1">
                Primary Typology: {selectedLocality.primaryTypology}
              </p>
            </div>
            <div className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-xs text-[11px] font-mono text-[#69717B] text-right">
              <div>Confidence: {selectedLocality.confidenceScore}%</div>
              <div>{selectedLocality.dataFreshness}</div>
            </div>
          </div>

          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-[#F5F3ED] border border-[#C8C4BA] rounded-xs font-mono">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-sans">
                Avg Price / Sq.Ft
              </span>
              <div className="text-xl font-black text-[#202B3C] mt-1">
                ₹{selectedLocality.avgPriceSqFt.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-[#69717B]">
                Range: ₹{selectedLocality.priceRangeSqFt.min} – ₹{selectedLocality.priceRangeSqFt.max}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-sans">
                Gross Rental Yield
              </span>
              <div className="text-xl font-black text-[#547568] mt-1">
                {selectedLocality.grossRentalYield}%
              </div>
              <span className="text-[10px] text-[#69717B]">Residential standard</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-sans">
                1-Year Appreciation
              </span>
              <div className="text-xl font-black text-emerald-700 mt-1">
                +{selectedLocality.historicalGrowth1Yr}%
              </div>
              <span className="text-[10px] text-[#69717B]">3-Yr: +{selectedLocality.historicalGrowth3Yr}%</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-sans">
                RERA Compliance
              </span>
              <div className="text-xl font-black text-[#202B3C] mt-1">
                {selectedLocality.reraRegisteredShare}%
              </div>
              <span className="text-[10px] text-[#69717B]">{selectedLocality.totalActiveProjects} Active Projects</span>
            </div>
          </div>

          {/* Narrative & Locality Context */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#202B3C]">
              Locality Character & Growth Dynamics
            </h3>
            <p className="text-xs text-[#69717B] leading-relaxed">
              {selectedLocality.description}
            </p>
          </div>

          {/* Infrastructure Highlights */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#202B3C]">
              Infrastructure & Town Planning Highlights
            </h3>
            <ul className="space-y-2 text-xs text-[#202B3C]">
              {selectedLocality.infrastructureHighlights.map((infra, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#547568] shrink-0 mt-0.5" />
                  <span>{infra}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] font-mono text-[#69717B] pt-1">
              <strong>Transit:</strong> {selectedLocality.connectivityNotes}
            </p>
          </div>

          {/* Top Development Projects */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#202B3C]">
              Prominent Projects in {selectedLocality.name}
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {selectedLocality.topProjects.map((proj, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-stone-100 border border-stone-300 text-[#202B3C] font-medium rounded-xs"
                >
                  {proj}
                </span>
              ))}
            </div>
          </div>

          {/* CTA to evaluate property in this locality */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-[#69717B]">
              Have a property in {selectedLocality.name}?
            </span>
            <Link
              href={`/property-intelligence?locality=${selectedLocality.slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#202B3C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#151D29] rounded-xs"
            >
              <span>Evaluate Specific Property in {selectedLocality.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function LocationIntelligencePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono text-xs text-[#69717B]">Loading Locality Intelligence...</div>}>
      <LocationIntelligenceContent />
    </Suspense>
  );
}
