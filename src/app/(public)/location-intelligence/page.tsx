'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { AHMEDABAD_LOCALITIES, LocalityIntelligence } from '@/lib/real-estate/constants';
import { 
  MapPin, 
  TrendingUp, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Filter
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
      
      {/* Header */}
      <div className="border-b border-[#C8C4BA] pb-6">
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#547568]">
          Micro-Market Research &bull; Ahmedabad & Gandhinagar
        </span>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#202B3C] tracking-tight mt-1">
          Location Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-[#69717B] mt-2 max-w-3xl leading-relaxed">
          Comprehensive market research on Ahmedabad residential corridors: capital appreciation trajectories, rental yields, town-planning infrastructure, and verified transaction density.
        </p>
      </div>

      {/* Micromarket Selector & Zone Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#C8C4BA] p-4">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-[#547568]" />
          <span className="font-bold text-[#202B3C] uppercase text-[11px] tracking-wider font-mono">Zone:</span>
          {['ALL', 'WEST', 'SOUTH-WEST', 'NORTH', 'SEZ'].map((z) => (
            <button
              key={z}
              onClick={() => setZoneFilter(z)}
              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                zoneFilter === z
                  ? 'bg-[#202B3C] text-white shadow-xs'
                  : 'bg-[#F5F3ED] text-[#69717B] hover:text-[#202B3C]'
              }`}
            >
              {z === 'SEZ' ? 'GIFT City / SEZ' : z}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#69717B] font-mono">
          Displaying {filteredLocalities.length} of {AHMEDABAD_LOCALITIES.length} Analyzed Micro-Markets
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Locality Roster List (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#C8C4BA] divide-y divide-[#E2DFD6] overflow-hidden shadow-xs">
          <div className="p-3.5 bg-[#F5F3ED] border-b border-[#C8C4BA] text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C]">
            Select Analyzed Locality
          </div>
          <div className="max-h-[640px] overflow-y-auto divide-y divide-[#E2DFD6]">
            {filteredLocalities.map((loc) => {
              const isSelected = loc.slug === selectedLocality.slug;
              return (
                <button
                  key={loc.slug}
                  onClick={() => setSelectedLocalitySlug(loc.slug)}
                  className={`w-full text-left p-4 transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-[#F5F3ED] border-l-4 border-l-[#202B3C]'
                      : 'hover:bg-[#F5F3ED]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#202B3C]">{loc.name}</span>
                    <span className="text-[10px] font-mono text-[#69717B] bg-[#E2DFD6] px-1.5 py-0.5 uppercase">
                      {loc.zone}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#69717B] font-mono">
                    <span className="tabular-nums">Avg: ₹{loc.avgPriceSqFt.toLocaleString('en-IN')}/sq ft</span>
                    <span className="text-[#547568] font-bold tabular-nums">+{loc.historicalGrowth1Yr}% (1y)</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Locality Detailed Brief (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#C8C4BA] p-6 sm:p-8 shadow-xs space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#C8C4BA] pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-[#547568] font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>{selectedLocality.city}, {selectedLocality.state} &bull; PIN {selectedLocality.pincode}</span>
              </div>
              <h2 className="font-editorial text-3xl font-bold text-[#202B3C] tracking-tight mt-1">
                {selectedLocality.name} Locality Intelligence
              </h2>
              <p className="text-xs text-[#69717B] mt-1 font-mono">
                Primary Typology: {selectedLocality.primaryTypology}
              </p>
            </div>
            <div className="px-3 py-1.5 bg-[#F5F3ED] border border-[#C8C4BA] text-[11px] font-mono text-[#202B3C] text-right">
              <div>Confidence: <strong>{selectedLocality.confidenceScore}%</strong></div>
              <div className="text-[10px] text-[#547568]">{selectedLocality.dataFreshness}</div>
            </div>
          </div>

          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-[#F5F3ED] border border-[#C8C4BA] font-mono">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-sans">
                Avg Price / Sq.Ft
              </span>
              <div className="text-xl font-bold text-[#202B3C] mt-1 tabular-nums">
                ₹{selectedLocality.avgPriceSqFt.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-[#69717B] tabular-nums">
                Range: ₹{selectedLocality.priceRangeSqFt.min} – ₹{selectedLocality.priceRangeSqFt.max}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-sans">
                Gross Rental Yield
              </span>
              <div className="text-xl font-bold text-[#547568] mt-1 tabular-nums">
                {selectedLocality.grossRentalYield}%
              </div>
              <span className="text-[10px] text-[#69717B]">Residential benchmark</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-sans">
                Historical Growth
              </span>
              <div className="text-xl font-bold text-[#547568] mt-1 tabular-nums">
                +{selectedLocality.historicalGrowth1Yr}%
              </div>
              <span className="text-[10px] text-[#69717B] tabular-nums">3-Yr: +{selectedLocality.historicalGrowth3Yr}%</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-sans">
                Q3 2026 Volume
              </span>
              <div className="text-xl font-bold text-[#202B3C] mt-1 tabular-nums">
                {selectedLocality.transactionVolumeQuarter}
              </div>
              <span className="text-[10px] text-[#69717B]">Recorded sub-registrar deeds</span>
            </div>
          </div>

          {/* Architectural Photography Banner */}
          <div className="relative h-48 w-full border border-[#C8C4BA] overflow-hidden bg-[#202B3C]">
            <Image
              src="https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80"
              alt={`${selectedLocality.name} Urban Corridor`}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#202B3C]/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 text-white font-mono text-xs">
              <span className="font-bold">{selectedLocality.name} Micro-Market</span> &bull; {selectedLocality.totalActiveProjects} Active RERA Registered Projects
            </div>
          </div>

          {/* Locality Market Narrative */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#202B3C]">
              Economic & Locality Assessment
            </h3>
            <p className="text-xs sm:text-sm text-[#69717B] leading-relaxed">
              {selectedLocality.description}
            </p>
          </div>

          {/* Town Planning & Infrastructure Highlights */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#202B3C]">
              AUDA Town Planning & Infrastructure Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedLocality.infrastructureHighlights.map((point, i) => (
                <div key={i} className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]/50 flex items-start gap-2.5 text-xs text-[#202B3C]">
                  <CheckCircle2 className="w-4 h-4 text-[#547568] shrink-0 mt-0.5" />
                  <span className="leading-snug">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Connectivity Notes */}
          <div className="p-4 bg-[#F5F3ED] border border-[#C8C4BA] space-y-1 text-xs">
            <span className="font-bold text-[#202B3C] font-mono uppercase text-[10px] block">
              Transit & Transit Nodes:
            </span>
            <p className="text-[#69717B] leading-relaxed font-mono">
              {selectedLocality.connectivityNotes}
            </p>
          </div>

          {/* Prominent Projects in Locality */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#202B3C]">
              Canonical RERA Projects in this Micro-Market
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedLocality.topProjects.map((proj) => (
                <span
                  key={proj}
                  className="px-3 py-1.5 bg-white border border-[#C8C4BA] text-[#202B3C] text-xs font-semibold"
                >
                  {proj}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 border-t border-[#C8C4BA] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[#69717B]">
              Have a property in {selectedLocality.name}?
            </span>
            <Link
              href={`/property-intelligence?locality=${selectedLocality.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#202B3C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#151D29] shadow-xs"
            >
              <span>Evaluate Property in {selectedLocality.name}</span>
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
