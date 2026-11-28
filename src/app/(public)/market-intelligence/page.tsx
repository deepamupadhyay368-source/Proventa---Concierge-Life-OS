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
    OPERATIONAL: 'border-[#287A55]/30 bg-[#F3F5F7] text-[#287A55]',
    UNDER_CONSTRUCTION: 'border-amber-500/40 bg-amber-500/10 text-[#B17A30]',
    PROPOSED: 'border-sky-500/40 bg-sky-500/10 text-[#29465F]',
    UNVERIFIED: 'border-[#E8EBEF] bg-[#F3F5F7] text-[#202B38]',
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
    <div className="min-h-screen bg-[#FFFFFF] text-[#202B38]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#E8EBEF] pb-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#29465F]">
              MODULES 02 &amp; 05 // MARKET &amp; LOCATION INTELLIGENCE
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#202B38]">
              Ahmedabad &amp; Gandhinagar Market Terminal
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-[#697586]">
              13 tracked micro-markets across Ahmedabad and Gandhinagar. Benchmarks are calculated strictly from
              verified and externally sourced database observations. Corridors with fewer than 3 qualifying records
              explicitly display <span className="font-mono text-[#B17A30]">INSUFFICIENT_DATA</span>.
            </p>
          </div>
          <div className="flex rounded-xs border border-[#E8EBEF] bg-[#FFFFFF] p-1">
            {(['RESIDENTIAL', 'COMMERCIAL', 'LAND'] as const).map((seg) => (
              <button
                key={seg}
                type="button"
                onClick={() => setSegment(seg)}
                className={`rounded-md px-3.5 py-1.5 font-mono text-xs font-medium transition ${
                  segment === seg ? 'bg-[#29465F] text-[#FFFFFF]' : 'text-[#697586] hover:text-[#202B38]'
                }`}
              >
                {seg}
              </button>
            ))}
          </div>
        </div>

        {/* Locality-vs-Locality Comparison */}
        <section className="mt-8 rounded-xs border border-[#E8EBEF] bg-[#FFFFFF] p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-[#29465F]" />
              <h2 className="text-base font-semibold text-[#202B38]">Locality-vs-Locality Side-by-Side Comparison</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={compareA}
                onChange={(e) => setCompareA(e.target.value)}
                className="rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] px-3 py-1.5 text-sm text-[#202B38]"
              >
                {corridors.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="font-mono text-xs text-[#929BA6]">VS</span>
              <select
                value={compareB}
                onChange={(e) => setCompareB(e.target.value)}
                className="rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] px-3 py-1.5 text-sm text-[#202B38]"
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
              <div key={idx} className="rounded-xs border border-[#E8EBEF] bg-[#F7F8FA]/70 p-4">
                {c ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[#202B38]">{c.name}</h3>
                        <p className="text-xs text-[#697586]">
                          {c.zone} &middot; {c.city}
                        </p>
                      </div>
                      <span
                        className={`rounded border px-2 py-0.5 font-mono text-[11px] ${
                          c.benchmark.status === 'RELIABLE'
                            ? 'border-[#287A55]/30 bg-[#F3F5F7] text-[#287A55]'
                            : 'border-amber-500/40 bg-amber-500/10 text-[#B17A30]'
                        }`}
                      >
                        {c.benchmark.confidenceLevel}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                      <div className="rounded bg-[#FFFFFF] p-2.5">
                        <span className="text-[#929BA6]">Median / sq ft</span>
                        <p className="mt-1 font-mono text-sm font-semibold text-[#202B38]">
                          {c.benchmark.formattedMedianPriceSqFt || 'Insufficient data'}
                        </p>
                      </div>
                      <div className="rounded bg-[#FFFFFF] p-2.5">
                        <span className="text-[#929BA6]">Avg Rental Yield</span>
                        <p className="mt-1 font-mono text-sm font-semibold text-[#202B38]">
                          {c.benchmark.averageRentalYieldPct !== null ? `${c.benchmark.averageRentalYieldPct}%` : '—'}
                        </p>
                      </div>
                      <div className="rounded bg-[#FFFFFF] p-2.5">
                        <span className="text-[#929BA6]">Verified Obs.</span>
                        <p className="mt-1 font-mono text-sm font-semibold text-[#202B38]">
                          {c.benchmark.observationCount}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-[#697586]">{c.benchmark.message}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#697586]">
                      <span className="font-mono text-[#287A55]">
                        Operational Infra: {c.infrastructureSummary.operational}
                      </span>
                      <span className="font-mono text-[#B17A30]">
                        Under Construction: {c.infrastructureSummary.underConstruction}
                      </span>
                      <span className="font-mono text-[#29465F]">
                        Proposed: {c.infrastructureSummary.proposed}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[#929BA6]">Loading corridor data...</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* All 13 Corridors Grid */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#202B38]">
              <Compass className="h-5 w-5 text-[#29465F]" />
              All 13 Ahmedabad &amp; Gandhinagar Corridors ({segment})
            </h2>
            <span className="font-mono text-xs text-[#697586]">MIN 3 SOURCED OBSERVATIONS REQUIRED</span>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-xs border border-[#E8EBEF] bg-[#F7F8FA]" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {corridors.map((c) => (
                <div
                  key={c.slug}
                  className="rounded-xs border border-[#E8EBEF] bg-[#FFFFFF] p-5 transition hover:border-[#E8EBEF]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-[#202B38]">{c.name}</h3>
                      <p className="flex items-center gap-1 text-xs text-[#697586]">
                        <MapPin className="h-3 w-3 text-[#929BA6]" />
                        {c.zone} &middot; {c.city}
                      </p>
                    </div>
                    {c.benchmark.status === 'RELIABLE' ? (
                      <CheckCircle2 className="h-4 w-4 text-[#29465F]" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-[#B17A30]" />
                    )}
                  </div>

                  {c.benchmark.status === 'RELIABLE' ? (
                    <div className="mt-4">
                      <p className="font-mono text-2xl font-semibold text-[#287A55]">
                        {c.benchmark.formattedMedianPriceSqFt}
                        <span className="ml-1 text-xs font-normal text-[#697586]">/ sq ft</span>
                      </p>
                      <p className="mt-1 text-xs text-[#697586]">
                        {c.benchmark.observationCount} sourced obs. &middot; Period:{' '}
                        {c.benchmark.latestReportingPeriod || '—'}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xs border border-amber-500/20 bg-amber-500/5 p-3">
                      <p className="font-mono text-xs font-medium text-[#B17A30]">INSUFFICIENT VERIFIED DATA</p>
                      <p className="mt-1 text-[11px] text-[#697586]">
                        {c.benchmark.observationCount}/3 verified observations recorded for {segment}. No synthetic
                        estimate displayed.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-[#E8EBEF] pt-3 font-mono text-[11px] text-[#697586]">
                    <span>CONFIDENCE: {c.benchmark.confidenceLevel}</span>
                    <span>INFRA ASSETS: {c.infrastructureSummary.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Infrastructure Lifecycle Tracker */}
        <section className="mt-10 rounded-xs border border-[#E8EBEF] bg-[#FFFFFF] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[#202B38]">
                <Train className="h-5 w-5 text-[#29465F]" />
                Infrastructure Lifecycle Intelligence
              </h2>
              <p className="mt-1 text-xs text-[#697586]">
                Strictly separates <span className="text-[#287A55]">OPERATIONAL</span> assets from{' '}
                <span className="text-[#B17A30]">UNDER_CONSTRUCTION</span>,{' '}
                <span className="text-[#29465F]">PROPOSED</span>, and <span className="text-[#202B38]">UNVERIFIED</span>{' '}
                projects.
              </p>
            </div>
            <Hammer className="h-5 w-5 text-[#929BA6]" />
          </div>

          {infraAssets.length === 0 ? (
            <div className="mt-5 rounded-xs border border-dashed border-[#E8EBEF] p-6 text-center text-sm text-[#697586]">
              <Activity className="mx-auto mb-2 h-6 w-6 text-slate-600" />
              No verified infrastructure assets have been recorded in this environment yet. Admin-verified Metro,
              Expressway, and GIFT City infrastructure records appear here automatically once ingested.
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E8EBEF] font-mono text-[#697586]">
                  <tr>
                    <th className="py-2 pr-4">Asset</th>
                    <th className="py-2 pr-4">Locality / Corridor</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Target Year</th>
                    <th className="py-2">Source Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EBEF]/70">
                  {infraAssets.map((a) => (
                    <tr key={a.id}>
                      <td className="py-3 pr-4 font-medium text-[#202B38]">{a.name}</td>
                      <td className="py-3 pr-4 text-[#202B38]">
                        {a.locality} ({a.corridor})
                      </td>
                      <td className="py-3 pr-4 font-mono text-[#697586]">{a.category}</td>
                      <td className="py-3 pr-4">
                        <InfraStatusBadge status={a.status} />
                      </td>
                      <td className="py-3 pr-4 font-mono text-[#202B38]">{a.expectedCompletionYear || '—'}</td>
                      <td className="py-3 text-[#697586]">{a.sourceReference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Multi-Project Side-by-Side Comparison */}
        <section className="mt-10 rounded-xs border border-[#E8EBEF] bg-[#FFFFFF] p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-[#202B38]">Multi-Project RERA Side-by-Side Comparison</h2>
              <p className="mt-1 text-xs text-[#697586]">
                Select 2 to 6 projects from the live PROVENTA RERA database to compare pricing, RERA status, and risk flags.
              </p>
            </div>
            <button
              type="button"
              onClick={runProjectCompare}
              className="rounded-xs bg-[#29465F] px-4 py-2 text-xs font-semibold text-[#FFFFFF] hover:bg-[#20384C]"
            >
              Compare Selected ({selectedProjectSlugs.length})
            </button>
          </div>

          {projectCompareError && (
            <p className="mt-3 text-xs text-[#B94343]">{projectCompareError}</p>
          )}

          {availableProjects.length === 0 ? (
            <p className="mt-4 text-xs text-[#929BA6]">
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
                    className={`rounded-xs border px-3 py-1.5 text-xs transition ${
                      active
                        ? 'border-emerald-500 bg-emerald-500/15 text-[#287A55]'
                        : 'border-[#E8EBEF] bg-[#F7F8FA] text-[#202B38] hover:border-slate-500'
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
                <thead className="border-b border-[#E8EBEF] font-mono text-[#697586]">
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
                <tbody className="divide-y divide-[#E8EBEF]/70">
                  {projectComparison.projects.map((p) => (
                    <tr key={p.slug}>
                      <td className="py-2.5 pr-4 font-semibold text-[#202B38]">{p.name}</td>
                      <td className="py-2.5 pr-4 text-[#202B38]">{p.developerName}</td>
                      <td className="py-2.5 pr-4 text-[#202B38]">{p.locality}</td>
                      <td className="py-2.5 pr-4 font-mono text-[#202B38]">{p.reraNumber || 'Unverified'}</td>
                      <td className="py-2.5 pr-4 font-mono text-[#697586]">{p.constructionStatus}</td>
                      <td className="py-2.5 pr-4 font-mono text-[#287A55]">
                        {p.pricePerSqFtRupees ? `INR ${p.pricePerSqFtRupees.toLocaleString('en-IN')}` : 'N/A'}
                      </td>
                      <td className="py-2.5 text-[#B17A30]">
                        {p.riskIndicators.length ? p.riskIndicators.join('; ') : 'None flagged'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-[11px] text-[#929BA6]">{projectComparison.disclosure}</p>
            </div>
          )}
        </section>

        {/* Methodology Disclosure */}
        {methodologyDisclosure && (
          <div className="mt-6 flex items-start gap-2.5 rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] p-4 text-xs text-[#697586]">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#29465F]" />
            <p>{methodologyDisclosure}</p>
          </div>
        )}
      </div>
    </div>
  );
}
