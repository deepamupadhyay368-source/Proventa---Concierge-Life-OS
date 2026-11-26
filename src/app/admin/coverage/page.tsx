'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  ArrowRight,
  Filter,
  RefreshCw,
  AlertTriangle,
  Scale,
  FileSpreadsheet,
  ExternalLink,
} from 'lucide-react';

interface LocalityCoverageItem {
  id: string;
  slug: string;
  name: string;
  city: string;
  zone: string | null;
  totalRecords: number;
  verifiedTransactionsCount: number;
  pendingTransactionsCount: number;
  verifiedListingsCount: number;
  pendingListingsCount: number;
  verifiedJantriCount: number;
  totalProjects: number;
  valuationEligibility: 'VERIFIED_VALUATION_ELIGIBLE' | 'PRELIMINARY_CALIBRATION' | 'INSUFFICIENT_DATA' | 'RESTRICTED';
  valuationReady: boolean;
  evidenceGaps: string[];
  projects: Array<{ id: string; name: string; slug: string; valuationEligibility: string }>;
  updatedAt: string;
}

const PRIORITY_LOCALITY_SLUGS = ['south-bopal', 'shela', 'gota', 'science-city'];

export default function AdminCoverageDashboardPage() {
  const [coverageData, setCoverageData] = useState<LocalityCoverageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reassessingLocalityId, setReassessingLocalityId] = useState<string | null>(null);
  const [filterScope, setFilterScope] = useState<'PRIORITY' | 'ALL'>('PRIORITY');
  const [filterEligibility, setFilterEligibility] = useState<string>('ALL');

  const loadCoverage = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/evidence/coverage');
      const json = await res.json();
      if (json.success && json.data) {
        setCoverageData(json.data);
      }
    } catch (err) {
      console.error('Failed to load coverage dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoverage();
  }, []);

  const handleReassess = async (locId: string) => {
    try {
      setReassessingLocalityId(locId);
      const res = await fetch(`/api/admin/evidence/coverage?localityId=${locId}`);
      const json = await res.json();
      if (json.success) {
        await loadCoverage();
      }
    } catch (err) {
      console.error('Failed to reassess coverage:', err);
    } finally {
      setReassessingLocalityId(null);
    }
  };

  const filteredLocalities = coverageData.filter((loc) => {
    if (filterScope === 'PRIORITY' && !PRIORITY_LOCALITY_SLUGS.includes(loc.slug)) {
      return false;
    }
    if (filterEligibility !== 'ALL' && loc.valuationEligibility !== filterEligibility) {
      return false;
    }
    return true;
  });

  const aggregateStats = {
    totalRecords: coverageData.reduce((acc, curr) => acc + curr.totalRecords, 0),
    verifiedTransactions: coverageData.reduce((acc, curr) => acc + curr.verifiedTransactionsCount, 0),
    pendingTransactions: coverageData.reduce((acc, curr) => acc + curr.pendingTransactionsCount, 0),
    eligibleCount: coverageData.filter((c) => c.valuationEligibility === 'VERIFIED_VALUATION_ELIGIBLE').length,
    calibrationCount: coverageData.filter((c) => c.valuationEligibility === 'PRELIMINARY_CALIBRATION').length,
    insufficientCount: coverageData.filter((c) => c.valuationEligibility === 'INSUFFICIENT_DATA').length,
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C8C4BA] pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#547568] font-bold">
            PROVENTA Intelligence &bull; Evidence Quality Governance
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#202B3C] tracking-tight mt-1">
            Data Coverage & Valuation Eligibility Dashboard
          </h1>
          <p className="text-xs text-[#69717B] mt-1 max-w-3xl leading-relaxed">
            Deterministic valuation readiness determined strictly by empirical evidence criteria (minimum 3 verified deeds, recent 180-day market observations, and statutory Jantri anchor). No arbitrary percentage confidence scores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCoverage}
            disabled={loading}
            className="px-3.5 py-2 bg-white border border-[#C8C4BA] text-[#202B3C] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#F5F3ED] transition-colors font-mono cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Audit</span>
          </button>
          <Link
            href="/admin/transactions"
            className="px-3.5 py-2 bg-[#202B3C] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#202B3C]/90 font-mono"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Manage Evidence Ledger</span>
          </Link>
        </div>
      </div>

      {/* Aggregate Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="p-4 bg-white border border-[#C8C4BA] shadow-xs">
          <span className="text-[10px] font-bold text-[#69717B] uppercase block">Total Evidence</span>
          <span className="text-2xl font-bold text-[#202B3C] mt-1 block">{aggregateStats.totalRecords}</span>
          <span className="text-[10px] text-[#69717B]">Transactions &amp; Comps</span>
        </div>

        <div className="p-4 bg-white border border-[#C8C4BA] shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase block">Verified Deeds</span>
          <span className="text-2xl font-bold text-emerald-800 mt-1 block">{aggregateStats.verifiedTransactions}</span>
          <span className="text-[10px] text-emerald-600">Audit approved</span>
        </div>

        <div className="p-4 bg-white border border-[#C8C4BA] shadow-xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase block">Pending Queue</span>
          <span className="text-2xl font-bold text-amber-800 mt-1 block">{aggregateStats.pendingTransactions}</span>
          <span className="text-[10px] text-amber-600">Awaiting verification</span>
        </div>

        <div className="p-4 bg-white border border-[#C8C4BA] shadow-xs">
          <span className="text-[10px] font-bold text-[#202B3C] uppercase block">Valuation Ready</span>
          <span className="text-2xl font-bold text-emerald-800 mt-1 block">{aggregateStats.eligibleCount}</span>
          <span className="text-[10px] text-[#69717B]">Fully certified corridors</span>
        </div>

        <div className="p-4 bg-white border border-[#C8C4BA] shadow-xs">
          <span className="text-[10px] font-bold text-[#202B3C] uppercase block">Calibration Stage</span>
          <span className="text-2xl font-bold text-amber-800 mt-1 block">{aggregateStats.calibrationCount}</span>
          <span className="text-[10px] text-[#69717B]">Partial coverage</span>
        </div>

        <div className="p-4 bg-white border border-[#C8C4BA] shadow-xs">
          <span className="text-[10px] font-bold text-[#202B3C] uppercase block">Insufficient Data</span>
          <span className="text-2xl font-bold text-stone-600 mt-1 block">{aggregateStats.insufficientCount}</span>
          <span className="text-[10px] text-[#69717B]">Blocked from valuation</span>
        </div>
      </div>

      {/* Filter and Scope Controls */}
      <div className="bg-white border border-[#C8C4BA] p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold uppercase text-[11px] text-[#202B3C]">Geographic Focus:</span>
          <button
            onClick={() => setFilterScope('PRIORITY')}
            className={`px-3 py-1 font-mono text-xs uppercase font-bold tracking-wider cursor-pointer ${
              filterScope === 'PRIORITY'
                ? 'bg-[#202B3C] text-white'
                : 'bg-[#F5F3ED] text-[#69717B] hover:text-[#202B3C]'
            }`}
          >
            Phase 1 Scope (Bopal, Shela, Gota, Science City)
          </button>
          <button
            onClick={() => setFilterScope('ALL')}
            className={`px-3 py-1 font-mono text-xs uppercase font-bold tracking-wider cursor-pointer ${
              filterScope === 'ALL'
                ? 'bg-[#202B3C] text-white'
                : 'bg-[#F5F3ED] text-[#69717B] hover:text-[#202B3C]'
            }`}
          >
            All Ahmedabad &amp; Gandhinagar ({coverageData.length})
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-[#69717B] text-[11px] uppercase">Eligibility Filter:</span>
          <select
            value={filterEligibility}
            onChange={(e) => setFilterEligibility(e.target.value)}
            className="h-8 px-2 bg-[#F5F3ED] border border-[#C8C4BA] text-xs font-mono text-[#202B3C]"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED_VALUATION_ELIGIBLE">Verified Eligible</option>
            <option value="PRELIMINARY_CALIBRATION">Preliminary Calibration</option>
            <option value="INSUFFICIENT_DATA">Insufficient Data</option>
          </select>
        </div>
      </div>

      {/* Coverage Roster Cards */}
      <div className="space-y-4">
        {filteredLocalities.map((loc) => {
          const isReassessing = reassessingLocalityId === loc.id;
          const isPriority = PRIORITY_LOCALITY_SLUGS.includes(loc.slug);

          return (
            <div
              key={loc.id}
              className={`bg-white border p-6 transition-all shadow-xs space-y-4 ${
                loc.valuationEligibility === 'VERIFIED_VALUATION_ELIGIBLE'
                  ? 'border-emerald-400 border-l-4 border-l-emerald-600'
                  : loc.valuationEligibility === 'PRELIMINARY_CALIBRATION'
                  ? 'border-amber-300 border-l-4 border-l-amber-500'
                  : 'border-[#C8C4BA] border-l-4 border-l-stone-400'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E2DFD8] pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-editorial text-xl sm:text-2xl font-bold text-[#202B3C]">
                      {loc.name}
                    </span>
                    {isPriority && (
                      <span className="px-2 py-0.5 bg-[#547568]/10 text-[#547568] border border-[#547568]/30 font-mono text-[9px] font-bold uppercase tracking-wider">
                        Initial Focus Scope
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-[#69717B]">
                      {loc.city} &bull; {loc.zone || 'Zone TBD'}
                    </span>
                  </div>
                  <div className="text-xs text-[#69717B]">
                    Slug: <code className="font-mono text-[#202B3C]">{loc.slug}</code> &bull; Projects Tracked: {loc.totalProjects}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Badge */}
                  {loc.valuationEligibility === 'VERIFIED_VALUATION_ELIGIBLE' ? (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>VALUATION ELIGIBLE</span>
                    </span>
                  ) : loc.valuationEligibility === 'PRELIMINARY_CALIBRATION' ? (
                    <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 text-xs font-mono font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>CALIBRATION STAGING</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-stone-100 text-stone-700 border border-stone-300 text-xs font-mono font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-stone-500" />
                      <span>INSUFFICIENT DATA</span>
                    </span>
                  )}

                  <button
                    onClick={() => handleReassess(loc.id)}
                    disabled={isReassessing}
                    className="p-1.5 text-[#69717B] hover:text-[#202B3C] hover:bg-[#F5F3ED] border border-[#C8C4BA] text-xs transition-colors"
                    title="Re-run deterministic rules"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isReassessing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Evidence Dimensions Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs bg-[#F5F3ED] p-4 border border-[#C8C4BA]/50">
                <div>
                  <span className="text-[10px] text-[#69717B] uppercase block">Verified Deeds (Rule: &ge;3)</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-lg font-bold text-[#202B3C]">{loc.verifiedTransactionsCount}</span>
                    <span className="text-[10px] text-[#69717B]">/ 3 required</span>
                  </div>
                  {loc.pendingTransactionsCount > 0 && (
                    <span className="text-[10px] text-amber-700 block">+{loc.pendingTransactionsCount} in pending queue</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-[#69717B] uppercase block">Asking Comps (Rule: &ge;1)</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-lg font-bold text-[#202B3C]">{loc.verifiedListingsCount}</span>
                    <span className="text-[10px] text-[#69717B]">verified</span>
                  </div>
                  {loc.pendingListingsCount > 0 && (
                    <span className="text-[10px] text-amber-700 block">+{loc.pendingListingsCount} pending</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-[#69717B] uppercase block">Govt Jantri Baseline (Rule: &ge;1)</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-lg font-bold text-[#202B3C]">{loc.verifiedJantriCount}</span>
                    <span className="text-[10px] text-[#69717B]">official rates</span>
                  </div>
                  <span className="text-[10px] text-[#547568] block">Statutory circle anchor</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#69717B] uppercase block">Total Repository Density</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-lg font-bold text-[#202B3C]">{loc.totalRecords}</span>
                    <span className="text-[10px] text-[#69717B]">records</span>
                  </div>
                  <span className="text-[10px] text-[#69717B] block">Last audit: {new Date(loc.updatedAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Explicit Evidence Gaps Breakdown */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-[#202B3C] block">
                  Deterministic Quality Audit &amp; Evidence Gaps:
                </span>
                {loc.evidenceGaps.length === 0 ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All validation criteria fulfilled. This micro-market is certified for automated valuation calculation.</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {loc.evidenceGaps.map((gap, gIdx) => (
                      <div key={gIdx} className="p-2 bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-center gap-2 font-mono">
                        <AlertCircle className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <span>{gap}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Links */}
              <div className="pt-2 border-t border-[#E2DFD8] flex items-center justify-between text-xs font-mono">
                <Link
                  href={`/admin/transactions?localityId=${loc.id}`}
                  className="text-[#202B3C] hover:text-[#547568] font-bold flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#547568]" />
                  <span>Inspect Transactions ({loc.verifiedTransactionsCount + loc.pendingTransactionsCount})</span>
                </Link>

                <Link
                  href={`/location-intelligence?locality=${loc.slug}`}
                  target="_blank"
                  className="text-[#69717B] hover:text-[#202B3C] flex items-center gap-1 text-[11px]"
                >
                  <span>Preview Public Intelligence</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
