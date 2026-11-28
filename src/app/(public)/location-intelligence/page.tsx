'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Compass, MapPin, Train } from 'lucide-react';
import { SatelliteMapSection } from '@/components/real-estate/SatelliteMapSection';

interface CorridorData {
  slug: string;
  name: string;
  zone: string;
  city: string;
  benchmark: {
    status: 'RELIABLE' | 'INSUFFICIENT_DATA';
    formattedMedianPriceSqFt: string | null;
    observationCount: number;
    confidenceLevel: string;
    message: string;
  };
  infrastructureSummary: {
    total: number;
    operational: number;
    underConstruction: number;
    proposed: number;
    unverified: number;
  };
}

interface InfraAsset {
  id: string;
  name: string;
  locality: string;
  corridor: string;
  category: string;
  status: string;
  expectedCompletionYear: number | null;
  sourceReference: string;
}

export default function LocationIntelligencePage() {
  const [corridors, setCorridors] = useState<CorridorData[]>([]);
  const [infra, setInfra] = useState<InfraAsset[]>([]);
  const [selected, setSelected] = useState<string>('Bopal');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/real-estate/market?segment=RESIDENTIAL')
      .then((r) => r.json())
      .then((data) => {
        setCorridors(data.corridors || []);
        setInfra(data.infrastructureAssets || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeCorridor = corridors.find((c) => c.name === selected) || corridors[0];
  const activeInfra = infra.filter(
    (a) => activeCorridor && a.locality.toLowerCase() === activeCorridor.name.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#080E18] text-[#F5F7FA]">
      {/* Aerial Corridor Night Banner */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden border-b border-[#29384B]">
        <Image
          src="/images/proventa-aerial-corridor-night.webp"
          alt="Aerial night view of illuminated metropolitan urban growth corridor"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080E18]/95 via-[#080E18]/80 to-[#080E18]/55" />
        <div className="relative z-10 mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D7AD69]">
            MODULE 05 // LOCATION &amp; SATELLITE INTELLIGENCE
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FA]">
            Ahmedabad &amp; Gandhinagar Locality Dossiers
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-[#29384B] pb-6 md:flex-row md:items-end">
          <p className="max-w-3xl text-sm text-[#AAB6C5]">
            Live satellite imagery and database-backed locality profiles with infrastructure lifecycle tracking. Zero hardcoded prices or fabricated transaction volumes.
          </p>
          <Link
            href="/market-intelligence"
            className="rounded-xs border border-[#29384B] bg-[#152235] px-4 py-2 text-xs font-semibold text-[#4D9FFF] hover:bg-[#1B2A3D] transition-colors"
          >
            Open Corridor Comparison &rarr;
          </Link>
        </div>

        {/* Interactive Gujarat Satellite Intelligence Map */}
        <div className="mt-8">
          <SatelliteMapSection
            initialLocalitySlug={activeCorridor?.slug || 'bopal'}
            onSelectLocality={(name) => setSelected(name)}
          />
        </div>

        {loading ? (
          <div className="mt-8 h-56 animate-pulse rounded-xl border border-slate-800 bg-slate-900/40" />
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 lg:col-span-4">
              <p className="flex items-center gap-2 font-mono text-xs text-slate-400">
                <Compass className="h-4 w-4 text-emerald-400" /> 13 MONITORED CORRIDORS
              </p>
              <div className="mt-3 space-y-1.5">
                {corridors.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setSelected(c.name)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                      activeCorridor?.slug === c.slug
                        ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40'
                        : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-[11px] text-slate-500">{c.zone}</p>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{c.benchmark.confidenceLevel}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6 lg:col-span-8">
              {activeCorridor && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">{activeCorridor.name}</h2>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                        {activeCorridor.zone} &middot; {activeCorridor.city}, Gujarat
                      </p>
                    </div>
                    {activeCorridor.benchmark.status === 'RELIABLE' ? (
                      <span className="inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" /> RELIABLE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-mono text-xs text-amber-300">
                        <AlertCircle className="h-3.5 w-3.5" /> INSUFFICIENT_DATA
                      </span>
                    )}
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3 text-xs">
                    <div className="rounded-lg bg-slate-950 p-4">
                      <span className="text-slate-500">Median Residential Rate</span>
                      <p className="mt-1 font-mono text-lg font-bold text-white">
                        {activeCorridor.benchmark.formattedMedianPriceSqFt || 'INSUFFICIENT_DATA'}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-950 p-4">
                      <span className="text-slate-500">Sourced Observations</span>
                      <p className="mt-1 font-mono text-lg font-bold text-white">
                        {activeCorridor.benchmark.observationCount}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-950 p-4">
                      <span className="text-slate-500">Tracked Infrastructure</span>
                      <p className="mt-1 font-mono text-lg font-bold text-emerald-300">
                        {activeCorridor.infrastructureSummary.total}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-400">{activeCorridor.benchmark.message}</p>

                  <div className="mt-6 border-t border-slate-800 pt-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Train className="h-4 w-4 text-emerald-400" />
                      Infrastructure Assets in {activeCorridor.name}
                    </h3>
                    {activeInfra.length === 0 ? (
                      <p className="mt-3 text-xs text-slate-500">
                        No verified infrastructure assets recorded for {activeCorridor.name} yet.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {activeInfra.map((a) => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between rounded bg-slate-950 px-3 py-2 text-xs"
                          >
                            <div>
                              <p className="font-medium text-white">{a.name}</p>
                              <p className="text-[11px] text-slate-500">
                                {a.category} &middot; Source: {a.sourceReference}
                              </p>
                            </div>
                            <span className="rounded border border-slate-700 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                              {a.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
