'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building,
  TrendingUp,
  Bookmark,
  FileText,
  Plus,
  ArrowUpRight,
  MapPin,
  Satellite,
  Bell,
  ShieldCheck,
} from 'lucide-react';

interface PropertyOsRecord {
  id: string;
  title: string;
  locality: string;
  city: string;
  propertyType: string;
  carpetAreaSqFt?: number | null;
  acquisitionPricePaise?: string | null;
  updatedAt?: string;
}

interface WatchlistRecord {
  id: string;
  targetType: string;
  targetIdOrSlug: string;
  targetLabel: string;
  alertFrequency: string;
  createdAt: string;
}

interface CorridorRecord {
  slug: string;
  name: string;
  city: string;
  benchmark: {
    status: 'RELIABLE' | 'INSUFFICIENT_DATA';
    formattedMedianPriceSqFt: string | null;
    averageRentalYieldPct: number | null;
    observationCount: number;
    latestReportingPeriod: string | null;
    sources: string[];
  };
}

interface ReportRecord {
  id: string;
  reportType: string;
  title: string;
  createdAt: string;
}

export default function DashboardOverviewPage() {
  const [properties, setProperties] = useState<PropertyOsRecord[]>([]);
  const [watchlists, setWatchlists] = useState<WatchlistRecord[]>([]);
  const [corridors, setCorridors] = useState<CorridorRecord[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/real-estate/property-os').then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch('/api/real-estate/watchlists').then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch('/api/real-estate/market?segment=RESIDENTIAL').then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch('/api/real-estate/reports').then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([osJson, wlJson, marketJson, repJson]) => {
      if (!active) return;
      if (Array.isArray(osJson?.properties)) setProperties(osJson.properties);
      if (Array.isArray(wlJson?.watchlists)) setWatchlists(wlJson.watchlists);
      if (Array.isArray(marketJson?.corridors)) setCorridors(marketJson.corridors);
      if (Array.isArray(repJson?.reports)) setReports(repJson.reports);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const reliableCorridors = corridors.filter((c) => c.benchmark?.status === 'RELIABLE');

  return (
    <div className="space-y-8">
      {/* Page Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#29384B] pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#D7AD69] font-bold">
            Authenticated Intelligence Terminal
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F5F7FA] mt-1">
            Portfolio Intelligence Overview
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/property-os"
            className="h-10 px-4 bg-[#4D9FFF] hover:bg-[#3B8EEE] text-[#080E18] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Open Property OS</span>
          </Link>
          <Link
            href="/price"
            className="h-10 px-4 bg-[#152235] hover:bg-[#1B2A3D] border border-[#29384B] text-[#F5F7FA] text-xs font-bold uppercase tracking-wider inline-flex items-center transition-colors"
          >
            12-Factor Valuation
          </Link>
        </div>
      </div>

      {/* Live DB-Backed Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#152235] border border-[#29384B] p-5 space-y-1">
          <span className="text-[10px] font-mono text-[#748398] uppercase tracking-wider">
            Saved Properties (Property OS)
          </span>
          <div className="font-mono text-2xl font-bold text-[#F5F7FA] tabular-nums">
            {loading ? '—' : properties.length}
          </div>
          <p className="text-[11px] text-[#4D9FFF] font-mono">
            Private encrypted owner ledger
          </p>
        </div>

        <div className="bg-[#152235] border border-[#29384B] p-5 space-y-1">
          <span className="text-[10px] font-mono text-[#748398] uppercase tracking-wider">
            Active Watchlist Monitors
          </span>
          <div className="font-mono text-2xl font-bold text-[#D7AD69] tabular-nums">
            {loading ? '—' : watchlists.length}
          </div>
          <p className="text-[11px] text-[#AAB6C5] font-mono">
            Localities, projects &amp; assets
          </p>
        </div>

        <div className="bg-[#152235] border border-[#29384B] p-5 space-y-1">
          <span className="text-[10px] font-mono text-[#748398] uppercase tracking-wider">
            Verified Market Corridors
          </span>
          <div className="font-mono text-2xl font-bold text-[#F5F7FA] tabular-nums">
            {loading ? '—' : `${reliableCorridors.length} / ${corridors.length}`}
          </div>
          <p className="text-[11px] text-[#AAB6C5] font-mono">
            Ahmedabad &amp; Gandhinagar
          </p>
        </div>

        <div className="bg-[#152235] border border-[#29384B] p-5 space-y-1">
          <span className="text-[10px] font-mono text-[#748398] uppercase tracking-wider">
            Saved Intelligence Reports
          </span>
          <div className="font-mono text-2xl font-bold text-[#F5F7FA] tabular-nums">
            {loading ? '—' : reports.length}
          </div>
          <p className="text-[11px] text-[#4D9FFF] font-mono">
            PDF &amp; persisted dossiers
          </p>
        </div>
      </div>

      {/* Saved Properties & Watchlist Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Saved Properties */}
        <section className="lg:col-span-7 bg-[#101A29] border border-[#29384B] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#29384B] pb-3">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-[#4D9FFF]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5F7FA]">
                Saved Properties
              </h2>
            </div>
            <Link
              href="/property-os"
              className="text-xs font-mono text-[#4D9FFF] hover:underline inline-flex items-center gap-1"
            >
              <span>Manage Vault</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="p-6 bg-[#080E18] border border-[#29384B] text-center space-y-3">
              <ShieldCheck className="h-6 w-6 text-[#D7AD69] mx-auto" />
              <p className="text-xs text-[#AAB6C5]">
                No properties registered in your private Property OS vault yet.
              </p>
              <Link
                href="/property-os"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#152235] hover:bg-[#1B2A3D] border border-[#29384B] text-xs font-semibold text-[#F5F7FA]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Register First Property</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.slice(0, 5).map((prop) => (
                <div
                  key={prop.id}
                  className="p-4 bg-[#152235] border border-[#29384B] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="text-sm font-semibold text-[#F5F7FA] truncate">{prop.title}</div>
                    <div className="text-xs text-[#AAB6C5] flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-[#4D9FFF]" />
                      <span>
                        {prop.locality}, {prop.city}
                      </span>
                      <span className="text-[#748398]">&bull;</span>
                      <span className="font-mono text-[11px]">{prop.propertyType}</span>
                    </div>
                  </div>
                  <Link
                    href="/property-os"
                    className="px-3 py-1.5 bg-[#080E18] border border-[#29384B] text-[11px] font-mono text-[#4D9FFF] hover:border-[#4D9FFF] shrink-0"
                  >
                    Inspect
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Market Watchlist */}
        <section className="lg:col-span-5 bg-[#101A29] border border-[#29384B] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#29384B] pb-3">
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-[#D7AD69]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5F7FA]">
                Market Watchlist
              </h2>
            </div>
            <Link
              href="/dashboard/watchlist"
              className="text-xs font-mono text-[#D7AD69] hover:underline"
            >
              View All
            </Link>
          </div>

          {watchlists.length === 0 ? (
            <div className="p-6 bg-[#080E18] border border-[#29384B] text-center space-y-3">
              <Bell className="h-6 w-6 text-[#4D9FFF] mx-auto" />
              <p className="text-xs text-[#AAB6C5]">
                Track any Gujarat locality, project, or Property ID to receive verified market alerts.
              </p>
              <Link
                href="/market-intelligence"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#152235] hover:bg-[#1B2A3D] border border-[#29384B] text-xs font-semibold text-[#F5F7FA]"
              >
                <span>Browse Corridors</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {watchlists.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#152235] border border-[#29384B] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#F5F7FA] truncate">
                      {item.targetLabel}
                    </div>
                    <div className="text-[10px] font-mono text-[#748398]">
                      {item.targetType} &bull; Alerts: {item.alertFrequency}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#080E18] border border-[#29384B] text-[#4D9FFF]">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Live Sourced Market Indicators with Freshness */}
      <section className="bg-[#101A29] border border-[#29384B] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#29384B] pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#4D9FFF]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5F7FA]">
              Sourced Market Indicators &amp; Freshness
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/location-intelligence"
              className="text-xs font-mono text-[#D7AD69] hover:underline inline-flex items-center gap-1"
            >
              <Satellite className="h-3.5 w-3.5" />
              <span>Satellite Map</span>
            </Link>
            <Link
              href="/market-intelligence"
              className="text-xs font-mono text-[#4D9FFF] hover:underline"
            >
              Full Benchmarks &rarr;
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#29384B] text-[10px] font-mono uppercase text-[#748398]">
                <th className="py-2 pr-4">Corridor</th>
                <th className="py-2 pr-4">Median Rate</th>
                <th className="py-2 pr-4">Rental Yield</th>
                <th className="py-2 pr-4">Observations</th>
                <th className="py-2">Period &amp; Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B2A3D]">
              {corridors.slice(0, 6).map((c) => (
                <tr key={c.slug} className="hover:bg-[#152235]/60">
                  <td className="py-2.5 pr-4 font-semibold text-[#F5F7FA]">
                    {c.name}{' '}
                    <span className="text-[10px] font-mono text-[#748398]">({c.city})</span>
                  </td>
                  <td className="py-2.5 pr-4 font-mono tabular-nums text-[#F5F7FA]">
                    {c.benchmark.status === 'RELIABLE' && c.benchmark.formattedMedianPriceSqFt
                      ? c.benchmark.formattedMedianPriceSqFt
                      : 'INSUFFICIENT_DATA'}
                  </td>
                  <td className="py-2.5 pr-4 font-mono tabular-nums text-[#D7AD69]">
                    {c.benchmark.averageRentalYieldPct !== null
                      ? `${c.benchmark.averageRentalYieldPct.toFixed(2)}%`
                      : '—'}
                  </td>
                  <td className="py-2.5 pr-4 font-mono tabular-nums text-[#AAB6C5]">
                    {c.benchmark.observationCount}
                  </td>
                  <td className="py-2.5 font-mono text-[11px] text-[#748398]">
                    {c.benchmark.latestReportingPeriod || 'Awaiting observations'}
                    {c.benchmark.sources?.length ? ` · ${c.benchmark.sources[0]}` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Reports */}
      <section className="bg-[#101A29] border border-[#29384B] p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#29384B] pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#D7AD69]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5F7FA]">
              Recent Persisted Reports
            </h2>
          </div>
          <Link href="/reports" className="text-xs font-mono text-[#4D9FFF] hover:underline">
            Generate Report &rarr;
          </Link>
        </div>
        {reports.length === 0 ? (
          <p className="text-xs text-[#748398]">
            No persisted intelligence reports yet. Generate any of the 7 institutional report types with PDF export from the Reports module.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reports.slice(0, 4).map((rep) => (
              <Link
                key={rep.id}
                href="/reports"
                className="p-3 bg-[#152235] border border-[#29384B] hover:border-[#4D9FFF] flex items-center justify-between gap-3 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#F5F7FA] truncate">{rep.title}</div>
                  <div className="text-[10px] font-mono text-[#748398]">
                    {rep.reportType} &bull; {new Date(rep.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#4D9FFF] shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
