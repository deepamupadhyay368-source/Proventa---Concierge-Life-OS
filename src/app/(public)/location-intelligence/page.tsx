'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Compass, MapPin, Train } from 'lucide-react';

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
    <div className="min-h-screen bg-[#FFFFFF] text-[#202B38]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E8EBEF] pb-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#29465F]">
              MODULE 05 // LOCATION &amp; INFRASTRUCTURE INTELLIGENCE
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#202B38]">
              Ahmedabad &amp; Gandhinagar Locality Dossiers
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-[#697586]">
              Live database-backed locality profiles and infrastructure lifecycle tracking. Zero hardcoded prices or
              fabricated transaction volumes.
            </p>
          </div>
          <Link
            href="/market-intelligence"
            className="rounded-xs border border-[#287A55]/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-[#287A55] hover:bg-emerald-500/20"
          >
            Open Corridor Comparison &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 h-56 animate-pulse rounded-xs border border-[#E8EBEF] bg-[#F7F8FA]" />
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <div className="rounded-xs border border-[#E8EBEF] bg-[#FFFFFF] p-4 lg:col-span-4">
              <p className="flex items-center gap-2 font-mono text-xs text-[#697586]">
                <Compass className="h-4 w-4 text-[#29465F]" /> 13 MONITORED CORRIDORS
              </p>
              <div className="mt-3 space-y-1.5">
                {corridors.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setSelected(c.name)}
                    className={`flex w-full items-center justify-between rounded-xs px-3 py-2 text-left text-xs transition ${
                      activeCorridor?.slug === c.slug
                        ? 'bg-[#29465F] text-[#FFFFFF] border border-[#29465F]'
                        : 'bg-[#F7F8FA] text-[#202B38] hover:bg-[#F3F5F7]'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-[11px] text-[#929BA6]">{c.zone}</p>
                    </div>
                    <span className="font-mono text-[10px] text-[#697586]">{c.benchmark.confidenceLevel}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6 lg:col-span-8">
              {activeCorridor && (
                <div className="rounded-xs border border-[#E8EBEF] bg-[#FFFFFF] p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-[#202B38]">{activeCorridor.name}</h2>
                      <p className="mt-1 flex items-center gap-1 text-xs text-[#697586]">
                        <MapPin className="h-3.5 w-3.5 text-[#29465F]" />
                        {activeCorridor.zone} &middot; {activeCorridor.city}, Gujarat
                      </p>
                    </div>
                    {activeCorridor.benchmark.status === 'RELIABLE' ? (
                      <span className="inline-flex items-center gap-1 rounded border border-[#287A55]/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs text-[#287A55]">
                        <CheckCircle2 className="h-3.5 w-3.5" /> RELIABLE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-mono text-xs text-[#B17A30]">
                        <AlertCircle className="h-3.5 w-3.5" /> INSUFFICIENT_DATA
                      </span>
                    )}
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3 text-xs">
                    <div className="rounded-xs bg-[#F7F8FA] p-4">
                      <span className="text-[#929BA6]">Median Residential Rate</span>
                      <p className="mt-1 font-mono text-lg font-bold text-[#202B38]">
                        {activeCorridor.benchmark.formattedMedianPriceSqFt || 'INSUFFICIENT_DATA'}
                      </p>
                    </div>
                    <div className="rounded-xs bg-[#F7F8FA] p-4">
                      <span className="text-[#929BA6]">Sourced Observations</span>
                      <p className="mt-1 font-mono text-lg font-bold text-[#202B38]">
                        {activeCorridor.benchmark.observationCount}
                      </p>
                    </div>
                    <div className="rounded-xs bg-[#F7F8FA] p-4">
                      <span className="text-[#929BA6]">Tracked Infrastructure</span>
                      <p className="mt-1 font-mono text-lg font-bold text-[#287A55]">
                        {activeCorridor.infrastructureSummary.total}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-[#697586]">{activeCorridor.benchmark.message}</p>

                  <div className="mt-6 border-t border-[#E8EBEF] pt-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-[#202B38]">
                      <Train className="h-4 w-4 text-[#29465F]" />
                      Infrastructure Assets in {activeCorridor.name}
                    </h3>
                    {activeInfra.length === 0 ? (
                      <p className="mt-3 text-xs text-[#929BA6]">
                        No verified infrastructure assets recorded for {activeCorridor.name} yet.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {activeInfra.map((a) => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between rounded bg-[#F7F8FA] px-3 py-2 text-xs"
                          >
                            <div>
                              <p className="font-medium text-[#202B38]">{a.name}</p>
                              <p className="text-[11px] text-[#929BA6]">
                                {a.category} &middot; Source: {a.sourceReference}
                              </p>
                            </div>
                            <span className="rounded border border-[#E8EBEF] px-2 py-0.5 font-mono text-[10px] text-[#287A55]">
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
