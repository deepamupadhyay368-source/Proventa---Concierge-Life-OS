'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, MapPin, TrendingUp } from 'lucide-react';

interface CorridorBenchmark {
  slug: string;
  name: string;
  city: string;
  zone: string;
  benchmark: {
    status: 'RELIABLE' | 'INSUFFICIENT_DATA';
    formattedMedianPriceSqFt: string | null;
    medianPriceSqFtPaise: string | null;
    averageRentalYieldPct: number | null;
    observationCount: number;
    latestReportingPeriod: string | null;
    sources: string[];
  };
}

interface PublishedProject {
  id: string;
  slug: string;
  name: string;
  developer: string | null;
  reraNumber: string | null;
  district: string | null;
  possessionStatus: string | null;
  locality?: { name: string; city: string } | null;
}

export function CorporateMarketSnapshot() {
  const [corridors, setCorridors] = useState<CorridorBenchmark[]>([]);
  const [projects, setProjects] = useState<PublishedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/real-estate/market?segment=RESIDENTIAL')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch('/api/projects')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]).then(([marketJson, projectJson]) => {
      if (!active) return;
      if (Array.isArray(marketJson?.corridors)) setCorridors(marketJson.corridors);
      if (Array.isArray(projectJson?.data)) setProjects(projectJson.data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const topCorridors = corridors.slice(0, 6);
  const maxPaise = Math.max(
    1,
    ...topCorridors.map((c) => Number(c.benchmark?.medianPriceSqFtPaise || 0))
  );

  return (
    <>
      {/* SECTION 4 — PROJECT INTELLIGENCE */}
      <section className="bg-[#FFFFFF] border-b border-[#E8EBEF] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A58A61]">
                Project Intelligence
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202B38]">
                Verified Developments &amp; Regulatory Records
              </h2>
              <p className="text-sm text-[#697586] leading-relaxed">
                Inspect structured Gujarat RERA project dossiers, developer histories, carpet-area configurations, and side-by-side project comparisons sourced from official regulatory disclosures.
              </p>
              <div className="pt-2">
                <Link
                  href="/project-intelligence"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#29465F] hover:bg-[#20384C] text-[#FFFFFF] text-xs font-semibold rounded-xs transition-colors"
                >
                  <span>Explore Project Intelligence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="relative aspect-[16/9] w-full border border-[#E8EBEF] overflow-hidden bg-[#F7F8FA]">
                <Image
                  src="/images/proventa-corporate-projects.webp"
                  alt="Modern residential towers in natural daylight"
                  fill
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>

          {/* Live Verified Projects Strip */}
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.slice(0, 3).map((project) => (
                <Link
                  key={project.id}
                  href={`/project-intelligence/${project.slug}`}
                  className="bg-[#FFFFFF] border border-[#E8EBEF] hover:border-[#29465F] p-6 space-y-3 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-[#287A55] font-medium">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Published RERA Record
                      </span>
                      <span className="text-[#929BA6] font-mono text-[10px]">
                        {project.district || 'Gujarat'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#202B38]">{project.name}</h3>
                    <p className="text-xs text-[#697586]">
                      {project.developer || 'Verified Developer'}
                      {project.locality?.name ? ` · ${project.locality.name}` : ''}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F3F5F7] flex items-center justify-between text-[11px] text-[#697586]">
                    <span className="font-mono truncate max-w-[70%]">
                      {project.reraNumber || 'Regulatory Filing'}
                    </span>
                    <span className="text-[#29465F] font-semibold">Dossier &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-[#F7F8FA] border border-[#E8EBEF] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#29465F] shrink-0" />
                <p className="text-xs text-[#697586]">
                  {loading
                    ? 'Loading published RERA project records…'
                    : 'Browse all verified Ahmedabad and Gandhinagar residential projects in the Project Intelligence registry.'}
                </p>
              </div>
              <Link
                href="/project-intelligence"
                className="text-xs font-semibold text-[#29465F] hover:underline shrink-0"
              >
                Open Directory &rarr;
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 5 — MARKET INTELLIGENCE */}
      <section className="bg-[#F7F8FA] border-b border-[#E8EBEF] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A58A61]">
                Market Intelligence
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202B38]">
                Sourced Locality Benchmarks &amp; Market Comparisons
              </h2>
              <p className="text-sm text-[#697586]">
                Every benchmark is computed directly from verified database observations with explicit reporting periods and provenance. Corridors with fewer than 3 observations display <span className="font-mono text-[#B17A30]">INSUFFICIENT_DATA</span>.
              </p>
            </div>
            <Link
              href="/market-intelligence"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFFFFF] hover:bg-[#F3F5F7] border border-[#E8EBEF] text-[#202B38] text-xs font-semibold rounded-xs transition-colors self-start md:self-auto"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#29465F]" />
              <span>Compare All 13 Corridors</span>
            </Link>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E8EBEF] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8EBEF] bg-[#F3F5F7] text-[10px] font-semibold uppercase tracking-wider text-[#697586]">
                  <th className="py-3 px-5">Locality / Corridor</th>
                  <th className="py-3 px-4">Median Rate</th>
                  <th className="py-3 px-4">Relative Index</th>
                  <th className="py-3 px-4">Rental Yield</th>
                  <th className="py-3 px-4">Observations</th>
                  <th className="py-3 px-5">Source Date &amp; Provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EBEF]">
                {topCorridors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-5 text-center text-[#697586]">
                      {loading
                        ? 'Loading live market intelligence benchmarks…'
                        : 'Open Market Intelligence to inspect all 13 Ahmedabad and Gandhinagar corridors.'}
                    </td>
                  </tr>
                ) : (
                  topCorridors.map((c) => {
                    const paise = Number(c.benchmark?.medianPriceSqFtPaise || 0);
                    const pct = c.benchmark.status === 'RELIABLE' && paise > 0 ? Math.max(12, Math.round((paise / maxPaise) * 100)) : 0;
                    return (
                      <tr key={c.slug} className="hover:bg-[#F7F8FA]">
                        <td className="py-3.5 px-5 font-semibold text-[#202B38]">
                          <Link href={`/market-intelligence?locality=${encodeURIComponent(c.name)}`} className="hover:text-[#29465F] inline-flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#29465F]" />
                            <span>{c.name}</span>
                            <span className="text-[10px] font-normal text-[#929BA6]">({c.city})</span>
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums font-semibold text-[#202B38]">
                          {c.benchmark.status === 'RELIABLE' && c.benchmark.formattedMedianPriceSqFt
                            ? c.benchmark.formattedMedianPriceSqFt
                            : <span className="text-[#B17A30] font-normal">INSUFFICIENT_DATA</span>}
                        </td>
                        <td className="py-3.5 px-4 w-40">
                          <div className="h-2 w-full bg-[#F3F5F7] overflow-hidden">
                            {pct > 0 && <div className="h-full bg-[#29465F]" style={{ width: `${pct}%` }} />}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums text-[#202B38]">
                          {c.benchmark.averageRentalYieldPct !== null
                            ? `${c.benchmark.averageRentalYieldPct.toFixed(2)}%`
                            : '—'}
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums text-[#697586]">
                          {c.benchmark.observationCount}
                        </td>
                        <td className="py-3.5 px-5 text-[#697586]">
                          {c.benchmark.latestReportingPeriod || 'Awaiting ≥3 verified records'}
                          {c.benchmark.sources?.length ? ` · ${c.benchmark.sources[0]}` : ''}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
