'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  PieChart,
  ShieldCheck,
  AlertTriangle,
  Coins,
  CreditCard,
  Plus,
  ArrowRight,
  Sparkles,
  Lock,
  ArrowLeftRight,
  FileText,
  Calendar,
  Building2,
  UserCheck,
} from 'lucide-react';
import { NetWorthSummary, AIInsightObservation } from '@/lib/wealth/types';

export default function FamilyWealthDashboard() {
  const [telemetry, setTelemetry] = useState<NetWorthSummary | null>(null);
  const [observations, setObservations] = useState<AIInsightObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('CONSOLIDATED');

  async function loadDashboardData(targetUserId?: string) {
    setLoading(true);
    try {
      const url = targetUserId && targetUserId !== 'CONSOLIDATED'
        ? `/api/wealth/telemetry?workspaceId=fam_sharma_heritage&userId=${targetUserId}`
        : '/api/wealth/telemetry?workspaceId=fam_sharma_heritage';

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setTelemetry(json.data.telemetry);
        setObservations(json.data.observations || []);
      }
    } catch (err) {
      console.error('Failed to load telemetry', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboardData(selectedUserFilter);
  }, [selectedUserFilter]);

  if (loading && !telemetry) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-xs font-mono text-[#A78BFA]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A78BFA] animate-ping" />
          <span>Synthesizing Deterministic Living Wealth Telemetry...</span>
        </div>
      </div>
    );
  }

  if (!telemetry) return null;

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER & WORKSPACE SCOPE FILTER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#1E1035] border border-[#3E236E] text-[10px] font-mono uppercase tracking-widest text-[#A78BFA] mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            LIVING WEALTH OS // ZERO DOUBLE-COUNTING
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-white">
            {selectedUserFilter === 'CONSOLIDATED'
              ? 'Sharma Family Holdings'
              : selectedUserFilter === 'usr_rajesh_sharma'
              ? 'Rajesh Sharma // Ownership Share'
              : selectedUserFilter === 'usr_sunita_sharma'
              ? 'Sunita Sharma // Ownership Share'
              : 'Aarav Sharma // Ownership Share'}
          </h1>
          <p className="text-xs text-[#9D8BC9] font-light mt-1">
            Deterministic valuation as of {new Date(telemetry.calculatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Member filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#0E1322] border border-[#1E293B]">
          <button
            onClick={() => setSelectedUserFilter('CONSOLIDATED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedUserFilter === 'CONSOLIDATED'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30'
                : 'text-[#9D8BC9] hover:text-white'
            }`}
          >
            Consolidated Family
          </button>
          <button
            onClick={() => setSelectedUserFilter('usr_rajesh_sharma')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedUserFilter === 'usr_rajesh_sharma'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30'
                : 'text-[#9D8BC9] hover:text-white'
            }`}
          >
            Rajesh (Self)
          </button>
          <button
            onClick={() => setSelectedUserFilter('usr_sunita_sharma')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedUserFilter === 'usr_sunita_sharma'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30'
                : 'text-[#9D8BC9] hover:text-white'
            }`}
          >
            Sunita (Spouse)
          </button>
          <button
            onClick={() => setSelectedUserFilter('usr_aarav_sharma')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedUserFilter === 'usr_aarav_sharma'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30'
                : 'text-[#9D8BC9] hover:text-white'
            }`}
          >
            Aarav (Child)
          </button>
        </div>
      </div>

      {/* 2. CORE KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Consolidated Net Worth */}
        <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#2D1854] relative overflow-hidden shadow-lg">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#A78BFA]">
            {selectedUserFilter === 'CONSOLIDATED' ? 'Total Family Net Worth' : 'Adjusted Individual Net Worth'}
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-white font-bold mt-2">
            {selectedUserFilter === 'CONSOLIDATED'
              ? telemetry.formattedGrossNetWorth
              : telemetry.formattedAdjustedNetWorth}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#10B981] mt-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+4.05% trailing 12M growth</span>
          </div>
        </div>

        {/* Total Assets */}
        <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9D8BC9]">
              {selectedUserFilter === 'CONSOLIDATED' ? 'Gross Family Assets' : 'Attributed Assets'}
            </span>
            <Coins className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl font-serif text-white font-bold mt-2">
            {selectedUserFilter === 'CONSOLIDATED'
              ? telemetry.formattedGrossAssets
              : telemetry.formattedAdjustedAssets}
          </div>
          <div className="text-xs text-[#9D8BC9] mt-3">
            Across {telemetry.totalAssetsCount} verified and recorded holdings
          </div>
        </div>

        {/* Total Liabilities */}
        <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9D8BC9]">
              {selectedUserFilter === 'CONSOLIDATED' ? 'Gross Liabilities' : 'Attributed Debt'}
            </span>
            <CreditCard className="w-4 h-4 text-[#F43F5E]" />
          </div>
          <div className="text-2xl font-serif text-white font-bold mt-2">
            {selectedUserFilter === 'CONSOLIDATED'
              ? telemetry.formattedGrossLiabilities
              : telemetry.formattedAdjustedLiabilities}
          </div>
          <div className="text-xs text-[#F43F5E] mt-3">
            Home mortgages &amp; vehicle obligations
          </div>
        </div>

        {/* Data Confidence / Vault Health */}
        <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9D8BC9]">
              Vault Verification
            </span>
            <Lock className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div className="text-2xl font-serif text-white font-bold mt-2">
            {telemetry.unverifiedAssetsCount === 0 ? '100% Verified' : `${telemetry.totalAssetsCount - telemetry.unverifiedAssetsCount} of ${telemetry.totalAssetsCount} Verified`}
          </div>
          <div className="text-xs text-[#9D8BC9] mt-3 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Title Deeds &amp; CAMS Statements attached</span>
          </div>
        </div>
      </div>

      {/* 3. PROACTIVE LIVING AI OBSERVATIONS STRIP */}
      {observations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#A78BFA]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Proactive AI Living Observations</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {observations.map((obs) => (
              <div
                key={obs.id}
                className="p-4 rounded-xl bg-[#1E1035]/60 border border-[#3E236E] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2A164D] text-[#DDD0F7]">
                    {obs.agentRole.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-[#A78BFA] font-medium">{obs.severity}</span>
                </div>
                <h4 className="text-xs font-semibold text-white">{obs.title}</h4>
                <p className="text-[11px] text-[#9D8BC9] font-light leading-relaxed">
                  {obs.observation}
                </p>
                {obs.actionableStep && (
                  <div className="pt-2 border-t border-[#3E236E]/40 text-[10px] text-[#A78BFA]">
                    Recommendation: {obs.actionableStep}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ASSET ALLOCATION & MEMBER DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Asset Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0E1322] border border-[#1E293B] space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#A78BFA]" />
              <h3 className="text-sm font-semibold text-white">Asset Category Allocation</h3>
            </div>
            <Link href="/assets" className="text-xs text-[#A78BFA] hover:text-white transition-colors">
              Manage Assets →
            </Link>
          </div>

          {/* Allocation Bar */}
          <div className="h-4 w-full rounded-full bg-[#1E293B] overflow-hidden flex">
            {telemetry.assetAllocation.map((a) => {
              const color =
                a.category === 'PHYSICAL'
                  ? 'bg-[#7C3AED]'
                  : a.category === 'FINANCIAL'
                  ? 'bg-[#10B981]'
                  : 'bg-[#F59E0B]';
              return (
                <div
                  key={a.category}
                  style={{ width: `${a.percentage}%` }}
                  className={`${color} h-full transition-all`}
                  title={`${a.label} (${a.percentage}%)`}
                />
              );
            })}
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-3 gap-3">
            {telemetry.assetAllocation.map((alloc) => {
              const border =
                alloc.category === 'PHYSICAL'
                  ? 'border-[#7C3AED]/40'
                  : alloc.category === 'FINANCIAL'
                  ? 'border-[#10B981]/40'
                  : 'border-[#F59E0B]/40';
              return (
                <div
                  key={alloc.category}
                  className={`p-3.5 rounded-xl bg-[#0B0F19] border ${border} space-y-1`}
                >
                  <div className="text-[10px] text-[#9D8BC9] uppercase font-mono">{alloc.label}</div>
                  <div className="text-base font-serif font-bold text-white">{alloc.formattedTotal}</div>
                  <div className="text-[10px] text-[#A78BFA] font-mono">
                    {alloc.percentage}% · {alloc.count} items
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-[#0B0F19] border border-[#1E293B] text-[11px] text-[#9D8BC9] flex items-center justify-between">
            <span>Missing documentation or outdated valuations:</span>
            <span className="font-mono text-white font-semibold">{telemetry.missingInformationCount} flags</span>
          </div>
        </div>

        {/* Member-Wise Distribution (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0E1322] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#A78BFA]" />
              <h3 className="text-sm font-semibold text-white">Family Member Shares</h3>
            </div>
            <Link href="/family" className="text-xs text-[#A78BFA] hover:text-white transition-colors">
              Manage Family →
            </Link>
          </div>

          <div className="space-y-3">
            {telemetry.memberShares.map((m) => (
              <div
                key={m.memberId}
                className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B] flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-white">{m.memberName}</div>
                  <div className="text-[10px] text-[#9D8BC9] font-mono">
                    Assets: {m.formattedAssetsTotal} · Debt: {m.formattedLiabilitiesTotal}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-serif font-bold text-white">{m.formattedNetWorth}</div>
                  <div className="text-[10px] text-[#10B981] font-mono">
                    {m.percentageOfFamilyNetWorth}% of wealth
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-[#64748B] font-light leading-relaxed">
            Percentages account for legal primary title and validated co-ownership deeds registered in the Family Vault.
          </p>
        </div>
      </div>

      {/* 5. QUICK ACTIONS & CONNECTED MODULE SHORTCUTS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/assets"
          className="p-4 rounded-xl bg-[#0E1322] border border-[#1E293B] hover:border-[#7C3AED] hover:bg-[#1E1035]/40 transition-all group space-y-2"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1E1035] flex items-center justify-center text-[#A78BFA] group-hover:scale-110 transition-transform">
            <Coins className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-white">+ Add New Asset</div>
          <div className="text-[10px] text-[#9D8BC9]">Property, Demat, Gold, Equity</div>
        </Link>

        <Link
          href="/liabilities"
          className="p-4 rounded-xl bg-[#0E1322] border border-[#1E293B] hover:border-[#7C3AED] hover:bg-[#1E1035]/40 transition-all group space-y-2"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1E1035] flex items-center justify-center text-[#A78BFA] group-hover:scale-110 transition-transform">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-white">+ Record Liability</div>
          <div className="text-[10px] text-[#9D8BC9]">Home Loans, Auto Debt, EMIs</div>
        </Link>

        <Link
          href="/vault"
          className="p-4 rounded-xl bg-[#0E1322] border border-[#1E293B] hover:border-[#7C3AED] hover:bg-[#1E1035]/40 transition-all group space-y-2"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1E1035] flex items-center justify-center text-[#A78BFA] group-hover:scale-110 transition-transform">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-white">Upload to Vault</div>
          <div className="text-[10px] text-[#9D8BC9]">Encrypted Deed or Statement</div>
        </Link>

        <Link
          href="/goals"
          className="p-4 rounded-xl bg-[#0E1322] border border-[#1E293B] hover:border-[#7C3AED] hover:bg-[#1E1035]/40 transition-all group space-y-2"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1E1035] flex items-center justify-center text-[#A78BFA] group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-white">Simulate Scenario</div>
          <div className="text-[10px] text-[#9D8BC9]">Hypothetical Compound Math</div>
        </Link>
      </div>
    </div>
  );
}
