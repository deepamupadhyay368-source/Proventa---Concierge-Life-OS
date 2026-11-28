'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Building,
  TrendingUp,
  Bookmark,
  FileText,
  Plus,
  ArrowUpRight,
  MapPin,
  ShieldCheck,
  User,
} from 'lucide-react';

interface PropertyOsRecord {
  id: string;
  title: string;
  locality: string;
  city: string;
  propertyType: string;
}

interface WatchlistRecord {
  id: string;
  targetType: string;
  targetIdOrSlug: string;
  targetLabel: string;
  alertFrequency: string;
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
  const { data: session } = useSession();
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
  const firstName = session?.user?.name?.split(' ')[0] || 'Member';

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EBEF] pb-5">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A58A61]">
            Member Dashboard
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#202B38] mt-1">
            Welcome back, {firstName}
          </h1>
          <p className="text-xs text-[#697586] mt-1">
            Monitor your registered properties, saved watchlists, sourced market benchmarks, and persisted reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/property-os"
            className="h-10 px-4 bg-[#29465F] hover:bg-[#20384C] text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Open Property OS</span>
          </Link>
          <Link
            href="/price"
            className="h-10 px-4 bg-[#FFFFFF] hover:bg-[#F3F5F7] border border-[#E8EBEF] text-[#202B38] text-xs font-semibold uppercase tracking-wider inline-flex items-center transition-colors"
          >
            12-Factor Valuation
          </Link>
        </div>
      </div>

      {/* Live API-Backed Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E8EBEF] p-5 space-y-1">
          <span className="text-[10px] font-semibold text-[#697586] uppercase tracking-wider">
            My Properties
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B38] tabular-nums">
            {loading ? '—' : properties.length}
          </div>
          <p className="text-[11px] text-[#929BA6]">Private Property OS vault</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8EBEF] p-5 space-y-1">
          <span className="text-[10px] font-semibold text-[#697586] uppercase tracking-wider">
            Saved Watchlists
          </span>
          <div className="font-mono text-2xl font-bold text-[#29465F] tabular-nums">
            {loading ? '—' : watchlists.length}
          </div>
          <p className="text-[11px] text-[#929BA6]">Tracked localities &amp; assets</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8EBEF] p-5 space-y-1">
          <span className="text-[10px] font-semibold text-[#697586] uppercase tracking-wider">
            Verified Market Corridors
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B38] tabular-nums">
            {loading ? '—' : `${reliableCorridors.length} / ${corridors.length}`}
          </div>
          <p className="text-[11px] text-[#929BA6]">Ahmedabad &amp; Gandhinagar</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8EBEF] p-5 space-y-1">
          <span className="text-[10px] font-semibold text-[#697586] uppercase tracking-wider">
            My Reports
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B38] tabular-nums">
            {loading ? '—' : reports.length}
          </div>
          <p className="text-[11px] text-[#929BA6]">Persisted PDF dossiers</p>
        </div>
      </div>

      {/* My Properties & Saved Watchlists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-[#FFFFFF] border border-[#E8EBEF] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8EBEF] pb-3">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-[#29465F]" />
              <h2 className="text-sm font-bold text-[#202B38]">My Properties</h2>
            </div>
            <Link
              href="/property-os"
              className="text-xs font-semibold text-[#29465F] hover:underline inline-flex items-center gap-1"
            >
              <span>Manage Vault</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="p-6 bg-[#F7F8FA] border border-[#E8EBEF] text-center space-y-3">
              <ShieldCheck className="h-6 w-6 text-[#29465F] mx-auto" />
              <p className="text-xs text-[#697586]">
                No properties registered in your private Property OS vault yet.
              </p>
              <Link
                href="/property-os"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#29465F] hover:bg-[#20384C] text-[#FFFFFF] text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Property</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.slice(0, 5).map((prop) => (
                <div
                  key={prop.id}
                  className="p-4 bg-[#F7F8FA] border border-[#E8EBEF] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="text-sm font-semibold text-[#202B38] truncate">{prop.title}</div>
                    <div className="text-xs text-[#697586] flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-[#29465F]" />
                      <span>
                        {prop.locality}, {prop.city}
                      </span>
                      <span className="text-[#929BA6]">&bull;</span>
                      <span>{prop.propertyType}</span>
                    </div>
                  </div>
                  <Link
                    href="/property-os"
                    className="px-3 py-1.5 bg-[#FFFFFF] border border-[#E8EBEF] text-xs font-semibold text-[#29465F] hover:border-[#29465F] shrink-0"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-5 bg-[#FFFFFF] border border-[#E8EBEF] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8EBEF] pb-3">
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-[#A58A61]" />
              <h2 className="text-sm font-bold text-[#202B38]">Saved Watchlists</h2>
            </div>
            <Link
              href="/dashboard/watchlist"
              className="text-xs font-semibold text-[#29465F] hover:underline"
            >
              View All
            </Link>
          </div>

          {watchlists.length === 0 ? (
            <div className="p-6 bg-[#F7F8FA] border border-[#E8EBEF] text-center space-y-3">
              <p className="text-xs text-[#697586]">
                Save any Gujarat locality, project, or Property ID to track verified market updates.
              </p>
              <Link
                href="/market-intelligence"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFFFFF] hover:bg-[#F3F5F7] border border-[#E8EBEF] text-[#202B38] text-xs font-semibold"
              >
                <span>Browse Markets</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {watchlists.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#F7F8FA] border border-[#E8EBEF] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#202B38] truncate">
                      {item.targetLabel}
                    </div>
                    <div className="text-[11px] text-[#697586]">
                      {item.targetType} &bull; {item.alertFrequency}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#FFFFFF] border border-[#E8EBEF] text-[#287A55]">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Market Intelligence Snapshot */}
      <section className="bg-[#FFFFFF] border border-[#E8EBEF] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8EBEF] pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#29465F]" />
            <h2 className="text-sm font-bold text-[#202B38]">Market Intelligence</h2>
          </div>
          <Link
            href="/market-intelligence"
            className="text-xs font-semibold text-[#29465F] hover:underline"
          >
            Full Benchmarks &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8EBEF] bg-[#F3F5F7] text-[10px] font-semibold uppercase text-[#697586]">
                <th className="py-2.5 px-4">Corridor</th>
                <th className="py-2.5 px-4">Median Rate</th>
                <th className="py-2.5 px-4">Rental Yield</th>
                <th className="py-2.5 px-4">Observations</th>
                <th className="py-2.5 px-4">Period &amp; Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EBEF]">
              {corridors.slice(0, 6).map((c) => (
                <tr key={c.slug} className="hover:bg-[#F7F8FA]">
                  <td className="py-2.5 px-4 font-semibold text-[#202B38]">
                    {c.name} <span className="text-[10px] font-normal text-[#929BA6]">({c.city})</span>
                  </td>
                  <td className="py-2.5 px-4 font-mono tabular-nums text-[#202B38]">
                    {c.benchmark.status === 'RELIABLE' && c.benchmark.formattedMedianPriceSqFt
                      ? c.benchmark.formattedMedianPriceSqFt
                      : <span className="text-[#B17A30]">INSUFFICIENT_DATA</span>}
                  </td>
                  <td className="py-2.5 px-4 font-mono tabular-nums text-[#202B38]">
                    {c.benchmark.averageRentalYieldPct !== null
                      ? `${c.benchmark.averageRentalYieldPct.toFixed(2)}%`
                      : '—'}
                  </td>
                  <td className="py-2.5 px-4 font-mono tabular-nums text-[#697586]">
                    {c.benchmark.observationCount}
                  </td>
                  <td className="py-2.5 px-4 text-[#697586]">
                    {c.benchmark.latestReportingPeriod || 'Awaiting verified observations'}
                    {c.benchmark.sources?.length ? ` · ${c.benchmark.sources[0]}` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* My Reports & Account Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 bg-[#FFFFFF] border border-[#E8EBEF] p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E8EBEF] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#29465F]" />
              <h2 className="text-sm font-bold text-[#202B38]">My Reports</h2>
            </div>
            <Link href="/reports" className="text-xs font-semibold text-[#29465F] hover:underline">
              Generate Report &rarr;
            </Link>
          </div>
          {reports.length === 0 ? (
            <p className="text-xs text-[#697586]">
              No persisted intelligence reports yet. Generate any of the seven institutional report types with PDF export from the Reports page.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reports.slice(0, 4).map((rep) => (
                <Link
                  key={rep.id}
                  href="/reports"
                  className="p-3 bg-[#F7F8FA] border border-[#E8EBEF] hover:border-[#29465F] flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#202B38] truncate">{rep.title}</div>
                    <div className="text-[11px] text-[#697586]">
                      {rep.reportType} &bull; {new Date(rep.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#29465F] shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-4 bg-[#FFFFFF] border border-[#E8EBEF] p-6 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#E8EBEF] pb-3">
            <User className="h-4 w-4 text-[#29465F]" />
            <h2 className="text-sm font-bold text-[#202B38]">Profile &amp; Account</h2>
          </div>
          <p className="text-xs text-[#697586] leading-relaxed">
            Manage your profile information, password &amp; passkey security, and notification preferences.
          </p>
          <div className="flex flex-col gap-2 pt-1">
            <Link
              href="/dashboard/profile"
              className="px-3 py-2 bg-[#F7F8FA] hover:bg-[#F3F5F7] border border-[#E8EBEF] text-xs font-semibold text-[#202B38] flex items-center justify-between"
            >
              <span>Profile Settings</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#29465F]" />
            </Link>
            <Link
              href="/dashboard/security"
              className="px-3 py-2 bg-[#F7F8FA] hover:bg-[#F3F5F7] border border-[#E8EBEF] text-xs font-semibold text-[#202B38] flex items-center justify-between"
            >
              <span>Security &amp; Access</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#29465F]" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
