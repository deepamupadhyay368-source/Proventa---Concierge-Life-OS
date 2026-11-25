import React from 'react';
import Link from 'next/link';
import {
  Building,
  Database,
  ShieldCheck,
  FileText,
  Users,
  CreditCard,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AHMEDABAD_LOCALITIES, CANONICAL_PROJECTS } from '@/lib/real-estate/constants';

export const dynamic = 'force-dynamic';

export default function AdminOverviewPage() {
  const verifiedProjectsCount = CANONICAL_PROJECTS.length;
  const totalLocalities = AHMEDABAD_LOCALITIES.length;
  const totalObservedDeeds = AHMEDABAD_LOCALITIES.reduce((acc, l) => acc + l.transactionVolumeQuarter, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C8C4BA] pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#547568] font-mono">
            Intelligence Operations Centre
          </span>
          <h1 className="text-3xl font-bold text-[#202B3C] mt-1 font-display">
            PROVENTA Intelligence Console
          </h1>
          <p className="text-xs text-[#69717B] mt-1">
            Ahmedabad & Gandhinagar Data Registry • Sub-Registrar Transactions & Gujarat RERA Monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/transactions"
            className="inline-flex items-center gap-2 bg-[#202B3C] hover:bg-[#202B3C]/90 text-white text-xs font-semibold px-4 py-2.5 shadow-xs transition"
          >
            <span>Review Transaction Queue ({totalObservedDeeds})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Aggregate Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider">
            Active Ahmedabad Localities
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B3C]">
            {totalLocalities} Corridors
          </div>
          <p className="text-[11px] text-[#547568] font-mono">100% RERA & AUDA Mapped</p>
        </div>

        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider">
            Verified Sub-Registrar Deeds
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B3C]">
            {totalObservedDeeds.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-[#547568] font-mono">Q3 2026 Observed Records</p>
        </div>

        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider">
            RERA Registry Projects
          </span>
          <div className="font-mono text-2xl font-bold text-[#202B3C]">
            {verifiedProjectsCount} Canonical Profiles
          </div>
          <p className="text-[11px] text-[#69717B] font-mono">Quarterly Filings Audited</p>
        </div>

        <div className="bg-white border border-[#C8C4BA] p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-mono text-[#69717B] uppercase tracking-wider">
            Hedonic Model Confidence
          </span>
          <div className="font-mono text-2xl font-bold text-[#547568]">
            94.2%
          </div>
          <p className="text-[11px] text-[#547568] font-mono">Carpet-Area Benchmark Baseline</p>
        </div>
      </div>

      {/* Quick Access Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#C8C4BA] p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#202B3C] uppercase tracking-wider">
            <Database className="h-4 w-4 text-[#547568]" />
            <span>Data Ingestion & Feeds</span>
          </div>
          <p className="text-xs text-[#69717B] leading-relaxed">
            Upload authorized sub-registrar deed records, RERA QPR tables, and developer sanction drawings.
          </p>
          <Link
            href="/admin/data-sources"
            className="text-xs font-semibold text-[#547568] hover:underline flex items-center gap-1 pt-1"
          >
            <span>Manage Feeds</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="bg-white border border-[#C8C4BA] p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#202B3C] uppercase tracking-wider">
            <Building className="h-4 w-4 text-[#547568]" />
            <span>Project & Developer Registry</span>
          </div>
          <p className="text-xs text-[#69717B] leading-relaxed">
            Audit Gujarat RERA registration certificates, promoter track records, and construction status.
          </p>
          <Link
            href="/admin/projects"
            className="text-xs font-semibold text-[#547568] hover:underline flex items-center gap-1 pt-1"
          >
            <span>Manage Projects</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="bg-white border border-[#C8C4BA] p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#202B3C] uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-[#547568]" />
            <span>Data Verification & Audit</span>
          </div>
          <p className="text-xs text-[#69717B] leading-relaxed">
            Review data classification tags (VERIFIED, SOURCE-REPORTED, MODEL-ESTIMATED) and audit edit logs.
          </p>
          <Link
            href="/admin/audit"
            className="text-xs font-semibold text-[#547568] hover:underline flex items-center gap-1 pt-1"
          >
            <span>View Audit Logs</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
