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
    <div className="min-h-screen bg-[#070B12] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
              MODULE 05 // LOCATION &amp; INFRASTRUCTURE INTELLIGENCE
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Ahmedabad &amp; Gandhinagar Locality Dossiers
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Live database-backed locality profiles and infrastructure lifecycle tracking. Zero hardcoded prices or
              fabricated transaction volumes.
            </p>
          </div>
          <Link
            href="/market-intelligence"
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
          >
            Open Corridor Comparison &rarr;
          </Link>
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
