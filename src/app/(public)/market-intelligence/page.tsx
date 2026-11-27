'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Compass,
  GitCompare,
  Hammer,
  Info,
  MapPin,
  Train,
} from 'lucide-react';

interface BenchmarkData {
  locality: string;
  segment: string;
  status: 'RELIABLE' | 'INSUFFICIENT_DATA';
  message: string;
  observationCount: number;
  formattedMedianPriceSqFt: string | null;
  averageRentalYieldPct: number | null;
  totalRecordedTransactions: number;
  latestReportingPeriod: string | null;
  sources: string[];
  confidenceLevel: 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT_DATA';
}

interface CorridorRow {
  slug: string;
  name: string;
  zone: string;
  city: string;
  benchmark: BenchmarkData;
  infrastructureSummary: {
    total: number;
    operational: number;
    underConstruction: number;
    proposed: number;
    unverified: number;
  };
}

interface InfrastructureAssetRecord {
  id: string;
  name: string;
  locality: string;
  corridor: string;
  city: string;
  category: string;
  status: 'OPERATIONAL' | 'UNDER_CONSTRUCTION' | 'PROPOSED' | 'UNVERIFIED';
  expectedCompletionYear: number | null;
  sourceReference: string;
}

function InfraStatusBadge({ status }: { status: InfrastructureAssetRecord['status'] }) {
  const map: Record<InfrastructureAssetRecord['status'], string> = {
    OPERATIONAL: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    UNDER_CONSTRUCTION: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    PROPOSED: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    UNVERIFIED: 'border-slate-600 bg-slate-800 text-slate-300',
  };
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[11px] ${map[status]}`}>
      {status}
    </span>
  );
}

export default function MarketIntelligencePage() {
  const [segment, setSegment] = useState<'RESIDENTIAL' | 'COMMERCIAL' | 'LAND'>('RESIDENTIAL');
  const [corridors, setCorridors] = useState<CorridorRow[]>([]);
  const [infraAssets, setInfraAssets] = useState<InfrastructureAssetRecord[]>([]);
  const [methodologyDisclosure, setMethodologyDisclosure] = useState('');
  const [loading, setLoading] = useState(true);
  const [compareA, setCompareA] = useState('Bopal');
  const [compareB, setCompareB] = useState('GIFT City');
  const [availableProjects, setAvailableProjects] = useState<Array<{ slug: string; name: string; developer: string | null }>>([]);
  const [selectedProjectSlugs, setSelectedProjectSlugs] = useState<string[]>([]);
  const [projectComparison, setProjectComparison] = useState<{
    lowestPricePerSqFtSlug: string | null;
    projects: Array<{
      slug: string;
      name: string;
      developerName: string;
      locality: string;
      reraNumber?: string | null;
      constructionStatus: string;
      pricePerSqFtRupees: number | null;
      verificationStatus: string;
      riskIndicators: string[];
    }>;
    disclosure: string;
  } | null>(null);
  const [projectCompareError, setProjectCompareError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/real-estate/projects/compare')
      .then((r) => r.json())
      .then((d) => setAvailableProjects(d.availableProjects || []))
      .catch(() => {});
  }, []);

  async function runProjectCompare() {
    setProjectCompareError(null);
    if (selectedProjectSlugs.length < 2) {
      setProjectCompareError('Select at least 2 RERA projects to compare.');
      return;
    }
    const res = await fetch('/api/real-estate/projects/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slugs: selectedProjectSlugs }),
    });
    const data = await res.json();
    if (!res.ok) {
      setProjectCompareError(data.error || 'Comparison failed.');
      return;
    }
    setProjectComparison(data);
  }

  const fetchMarket = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/real-estate/market?segment=${segment}`);
      const data = await res.json();
      if (res.ok) {
        setCorridors(data.corridors || []);
        setInfraAssets(data.infrastructureAssets || []);
        setMethodologyDisclosure(data.methodologyDisclosure || '');
      }
    } finally {
      setLoading(false);
    }
  }, [segment]);

  useEffect(() => {
    fetchMarket();
  }, [fetchMarket]);

  const leftCorridor = corridors.find((c) => c.name === compareA);
  const rightCorridor = corridors.find((c) => c.name === compareB);

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
              MODULES 02 &amp; 05 // MARKET &amp; LOCATION INTELLIGENCE
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Ahmedabad &amp; Gandhinagar Market Terminal
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              13 tracked micro-markets across Ahmedabad and Gandhinagar. Benchmarks are calculated strictly from
              verified and externally sourced database observations. Corridors with fewer than 3 qualifying records
              explicitly display <span className="font-mono text-amber-300">INSUFFICIENT_DATA</span>.
            </p>
          </div>
          <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-1">
            {(['RESIDENTIAL', 'COMMERCIAL', 'LAND'] as const).map((seg) => (
              <button
                key={seg}
                type="button"
                onClick={() => setSegment(seg)}
                className={`rounded-md px-3.5 py-1.5 font-mono text-xs font-medium transition ${
                  segment === seg ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {seg}
              </button>
            ))}
          </div>
        </div>

        {/* Locality-vs-Locality Comparison */}
        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Locality-vs-Locality Side-by-Side Comparison</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={compareA}
                onChange={(e) => setCompareA(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white"
              >
                {corridors.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="font-mono text-xs text-slate-500">VS</span>
              <select
                value={compareB}
                onChange={(e) => setCompareB(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white"
              >
                {corridors.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[leftCorridor, rightCorridor].map((c, idx) => (
              <div key={idx} className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                {c ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{c.name}</h3>
                        <p className="text-xs text-slate-400">
                          {c.zone} &middot; {c.city}
                        </p>
                      </div>
                      <span
                        className={`rounded border px-2 py-0.5 font-mono text-[11px] ${
                          c.benchmark.status === 'RELIABLE'
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                            : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                        }`}
                      >
                        {c.benchmark.confidenceLevel}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                      <div className="rounded bg-slate-900 p-2.5">
                        <span className="text-slate-500">Median / sq ft</span>
                        <p className="mt-1 font-mono text-sm font-semibold text-white">
                          {c.benchmark.formattedMedianPriceSqFt || 'Insufficient data'}
                        </p>
                      </div>
                      <div className="rounded bg-slate-900 p-2.5">
                        <span className="text-slate-500">Avg Rental Yield</span>
                        <p className="mt-1 font-mono text-sm font-semibold text-white">
                          {c.benchmark.averageRentalYieldPct !== null ? `${c.benchmark.averageRentalYieldPct}%` : '—'}
                        </p>
                      </div>
                      <div className="rounded bg-slate-900 p-2.5">
                        <span className="text-slate-500">Verified Obs.</span>
                        <p className="mt-1 font-mono text-sm font-semibold text-white">
                          {c.benchmark.observationCount}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-400">{c.benchmark.message}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
                      <span className="font-mono text-emerald-300">
                        Operational Infra: {c.infrastructureSummary.operational}
                      </span>
                      <span className="font-mono text-amber-300">
                        Under Construction: {c.infrastructureSummary.underConstruction}
                      </span>
                      <span className="font-mono text-sky-300">
                        Proposed: {c.infrastructureSummary.proposed}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Loading corridor data...</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* All 13 Corridors Grid */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Compass className="h-5 w-5 text-emerald-400" />
              All 13 Ahmedabad &amp; Gandhinagar Corridors ({segment})
            </h2>
            <span className="font-mono text-xs text-slate-400">MIN 3 SOURCED OBSERVATIONS REQUIRED</span>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-xl border border-slate-800 bg-slate-900/40" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {corridors.map((c) => (
                <div
                  key={c.slug}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-slate-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{c.name}</h3>
                      <p className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        {c.zone} &middot; {c.city}
                      </p>
                    </div>
                    {c.benchmark.status === 'RELIABLE' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-400" />
                    )}
                  </div>

                  {c.benchmark.status === 'RELIABLE' ? (
                    <div className="mt-4">
                      <p className="font-mono text-2xl font-semibold text-emerald-300">
                        {c.benchmark.formattedMedianPriceSqFt}
                        <span className="ml-1 text-xs font-normal text-slate-400">/ sq ft</span>
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {c.benchmark.observationCount} sourced obs. &middot; Period:{' '}
                        {c.benchmark.latestReportingPeriod || '—'}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                      <p className="font-mono text-xs font-medium text-amber-300">INSUFFICIENT VERIFIED DATA</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {c.benchmark.observationCount}/3 verified observations recorded for {segment}. No synthetic
                        estimate displayed.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 font-mono text-[11px] text-slate-400">
                    <span>CONFIDENCE: {c.benchmark.confidenceLevel}</span>
                    <span>INFRA ASSETS: {c.infrastructureSummary.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Infrastructure Lifecycle Tracker */}
        <section className="mt-10 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Train className="h-5 w-5 text-emerald-400" />
                Infrastructure Lifecycle Intelligence
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Strictly separates <span className="text-emerald-300">OPERATIONAL</span> assets from{' '}
                <span className="text-amber-300">UNDER_CONSTRUCTION</span>,{' '}
                <span className="text-sky-300">PROPOSED</span>, and <span className="text-slate-300">UNVERIFIED</span>{' '}
                projects.
              </p>
            </div>
            <Hammer className="h-5 w-5 text-slate-500" />
          </div>

          {infraAssets.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-slate-800 p-6 text-center text-sm text-slate-400">
              <Activity className="mx-auto mb-2 h-6 w-6 text-slate-600" />
              No verified infrastructure assets have been recorded in this environment yet. Admin-verified Metro,
              Expressway, and GIFT City infrastructure records appear here automatically once ingested.
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 font-mono text-slate-400">
                  <tr>
                    <th className="py-2 pr-4">Asset</th>
                    <th className="py-2 pr-4">Locality / Corridor</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Target Year</th>
                    <th className="py-2">Source Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {infraAssets.map((a) => (
                    <tr key={a.id}>
                      <td className="py-3 pr-4 font-medium text-white">{a.name}</td>
                      <td className="py-3 pr-4 text-slate-300">
                        {a.locality} ({a.corridor})
                      </td>
                      <td className="py-3 pr-4 font-mono text-slate-400">{a.category}</td>
                      <td className="py-3 pr-4">
                        <InfraStatusBadge status={a.status} />
                      </td>
                      <td className="py-3 pr-4 font-mono text-slate-300">{a.expectedCompletionYear || '—'}</td>
                      <td className="py-3 text-slate-400">{a.sourceReference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Multi-Project Side-by-Side Comparison */}
        <section className="mt-10 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-white">Multi-Project RERA Side-by-Side Comparison</h2>
              <p className="mt-1 text-xs text-slate-400">
                Select 2 to 6 projects from the live PROVENTA RERA database to compare pricing, RERA status, and risk flags.
              </p>
            </div>
            <button
              type="button"
              onClick={runProjectCompare}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Compare Selected ({selectedProjectSlugs.length})
            </button>
          </div>

          {projectCompareError && (
            <p className="mt-3 text-xs text-rose-300">{projectCompareError}</p>
          )}

          {availableProjects.length === 0 ? (
            <p className="mt-4 text-xs text-slate-500">
              No RERA projects recorded in this environment yet.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {availableProjects.map((p) => {
                const active = selectedProjectSlugs.includes(p.slug);
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() =>
                      setSelectedProjectSlugs((prev) =>
                        active ? prev.filter((s) => s !== p.slug) : prev.length < 6 ? [...prev, p.slug] : prev
                      )
                    }
                    className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                      active
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200'
                        : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          )}

          {projectComparison && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 font-mono text-slate-400">
                  <tr>
                    <th className="py-2 pr-4">Project</th>
                    <th className="py-2 pr-4">Developer</th>
                    <th className="py-2 pr-4">Locality</th>
                    <th className="py-2 pr-4">RERA</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Est. INR/sq ft</th>
                    <th className="py-2">Risk Indicators</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {projectComparison.projects.map((p) => (
                    <tr key={p.slug}>
                      <td className="py-2.5 pr-4 font-semibold text-white">{p.name}</td>
                      <td className="py-2.5 pr-4 text-slate-300">{p.developerName}</td>
                      <td className="py-2.5 pr-4 text-slate-300">{p.locality}</td>
                      <td className="py-2.5 pr-4 font-mono text-slate-300">{p.reraNumber || 'Unverified'}</td>
                      <td className="py-2.5 pr-4 font-mono text-slate-400">{p.constructionStatus}</td>
                      <td className="py-2.5 pr-4 font-mono text-emerald-300">
                        {p.pricePerSqFtRupees ? `INR ${p.pricePerSqFtRupees.toLocaleString('en-IN')}` : 'N/A'}
                      </td>
                      <td className="py-2.5 text-amber-300">
                        {p.riskIndicators.length ? p.riskIndicators.join('; ') : 'None flagged'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-[11px] text-slate-500">{projectComparison.disclosure}</p>
            </div>
          )}
        </section>

        {/* Methodology Disclosure */}
        {methodologyDisclosure && (
          <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <p>{methodologyDisclosure}</p>
          </div>
        )}
      </div>
    </div>
  );
}
