import React from 'react';
import Link from 'next/link';
import {
  Building,
  Database,
  ShieldCheck,
  FileText,
  ArrowRight,
  MapPin,
  Lock,
  Bell,
} from 'lucide-react';
import { db } from '@/lib/db';
import { AHMEDABAD_GANDHINAGAR_LOCALITIES } from '@/lib/real-estate-intelligence/market-engine';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const [
    totalRegistryProperties,
    verifiedRegistryProperties,
    pendingRegistryProperties,
    sourcedMarketObservations,
    unverifiedMarketObservations,
    totalProjects,
    totalInfraAssets,
    totalPassports,
    totalReports,
    totalWatchlists,
  ] = await Promise.all([
    db.registryProperty.count({ where: { deletedAt: null } }),
    db.registryProperty.count({ where: { deletedAt: null, verificationStatus: 'VERIFIED' } }),
    db.registryProperty.count({ where: { deletedAt: null, verificationStatus: 'USER_SUBMITTED' } }),
    db.marketObservation.count({
      where: { verificationStatus: { in: ['VERIFIED', 'EXTERNALLY_SOURCED', 'ADMIN_SUBMITTED'] } },
    }),
    db.marketObservation.count({
      where: { verificationStatus: { in: ['UNVERIFIED', 'USER_SUBMITTED', 'SYNTHETIC_TEST_DATA'] } },
    }),
    db.project.count(),
    db.infrastructureAsset.count(),
    db.propertyPassport.count({ where: { deletedAt: null } }),
    db.realEstateReport.count(),
    db.realEstateWatchlist.count(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C8C4BA] pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#547568] font-mono">
            Live PostgreSQL Intelligence Operations Centre
          </span>
          <h1 className="text-3xl font-normal text-[#202B3C] mt-1 font-editorial">
            PROVENTA Intelligence Console
          </h1>
          <p className="text-xs text-[#69717B] mt-1">
            Ahmedabad &amp; Gandhinagar Real Estate Intelligence &bull; Zero Hardcoded Statistics &bull; Live Database Counts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/properties"
            className="inline-flex items-center gap-2 bg-[#202B3C] hover:bg-[#202B3C]/90 text-white text-xs font-bold uppercase tracking-wider h-10 px-4 transition"
          >
            <span>Moderate Registry ({pendingRegistryProperties} pending)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Live Database Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#547568]" /> Monitored Corridors
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B3C]">
            {AHMEDABAD_GANDHINAGAR_LOCALITIES.length} Corridors
          </div>
          <p className="text-[11px] text-[#547568] font-mono">
            {totalInfraAssets} infrastructure assets tracked
          </p>
        </div>

        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#547568]" /> Sourced Market Observations
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B3C]">
            {sourcedMarketObservations > 0 ? sourcedMarketObservations.toLocaleString('en-IN') : 'INSUFFICIENT_DATA'}
          </div>
          <p className="text-[11px] text-[#69717B] font-mono">
            Excludes {unverifiedMarketObservations} unverified / synthetic rows
          </p>
        </div>

        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#547568]" /> Living Property Registry
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B3C]">
            {totalRegistryProperties.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-[#547568] font-mono">
            {verifiedRegistryProperties} VERIFIED &middot; {pendingRegistryProperties} USER_SUBMITTED
          </p>
        </div>

        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#547568]" /> RERA Project Records
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B3C]">
            {totalProjects.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-[#69717B] font-mono">Live Prisma Project table</p>
        </div>
      </div>

      {/* Private Property OS & Governance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#547568]" /> Private Property OS Passports
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B3C]">{totalPassports}</div>
          <p className="text-[11px] text-[#69717B]">Aggregate count only; owner dossiers remain strictly isolated.</p>
        </div>

        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#547568]" /> Persisted PDF Reports
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B3C]">{totalReports}</div>
          <p className="text-[11px] text-[#69717B]">Server-generated SHA-256 PDFs in PostgreSQL.</p>
        </div>

        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-[#547568]" /> Active User Watchlists
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B3C]">{totalWatchlists}</div>
          <p className="text-[11px] text-[#69717B]">Monitored properties, projects &amp; corridors.</p>
        </div>
      </div>

      {/* Quick Admin Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/properties"
          className="bg-white border border-[#C8C4BA] p-4 hover:border-[#202B3C] transition flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-bold text-[#202B3C]">Registry Verification &amp; Market Ingestion</p>
            <p className="text-xs text-[#69717B]">Approve/reject properties &amp; record sourced market observations</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#202B3C]" />
        </Link>
        <Link
          href="/admin/projects"
          className="bg-white border border-[#C8C4BA] p-4 hover:border-[#202B3C] transition flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-bold text-[#202B3C]">RERA Project Management</p>
            <p className="text-xs text-[#69717B]">Inspect and govern Gujarat RERA project database</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#202B3C]" />
        </Link>
        <Link
          href="/admin/audit"
          className="bg-white border border-[#C8C4BA] p-4 hover:border-[#202B3C] transition flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-bold text-[#202B3C]">Security &amp; Payment Audit Logs</p>
            <p className="text-xs text-[#69717B]">Inspect Phase 6.8 payment ledger and RBAC events</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#202B3C]" />
        </Link>
      </div>
    </div>
  );
}
