'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Coins,
  CreditCard,
  Plus,
  ArrowRight,
  Lock,
  ArrowLeftRight,
  FileText,
  Calendar,
  Building2,
  UserCheck,
  ShieldAlert,
  Terminal,
  Activity,
  Layers,
  Clock,
  CheckCircle2,
  Sparkles,
  Orbit,
  ExternalLink,
} from 'lucide-react';
import { NetWorthSummary, AIInsightObservation } from '@/lib/wealth/types';
import { LivingWealthGraph } from '@/components/wealth/universe/LivingWealthGraph';
import { FinancialUniverse } from '@/components/wealth/universe/FinancialUniverse';

export default function FamilyWealthDashboard() {
  const [telemetry, setTelemetry] = useState<NetWorthSummary | null>(null);
  const [observations, setObservations] = useState<AIInsightObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('CONSOLIDATED');
  const [showUniverseTopology, setShowUniverseTopology] = useState<boolean>(false);

  async function loadDashboardData(targetUserId?: string) {
    setLoading(true);
    try {
      const url =
        targetUserId && targetUserId !== 'CONSOLIDATED'
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
      <div className="flex flex-col items-center justify-center min-h-[500px] border border-[#CBD5E1] bg-white p-12 rounded-2xl shadow-sm">
        <div className="w-10 h-10 bg-[#2563EB] text-white flex items-center justify-center font-display font-bold text-base rounded-xl shadow-md shadow-blue-500/25 animate-pulse mb-4">
          P
        </div>
        <div className="font-mono text-xs uppercase tracking-wider text-[#0F172A] font-semibold">
          SYNTHESIZING LIVING FINANCIAL UNIVERSE
        </div>
        <div className="font-mono text-[11px] text-[#2563EB] mt-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-ping" />
          <span>Sharma Family Trust &amp; Holdings [FWS-001]</span>
        </div>
      </div>
    );
  }

  if (!telemetry) return null;

  // Upcoming scheduled obligations for Sharma Family
  const upcomingObligations = [
    {
      id: 'obl-01',
      title: 'HDFC Home Loan EMI // Gulmohar Villa',
      dueDate: '10 Nov 2026',
      amountFormatted: '₹1,42,800',
      account: 'HDFC Priority Bank A/C',
      type: 'DEBT SERVICE',
      status: 'SCHEDULED',
    },
    {
      id: 'obl-02',
      title: 'Max Life Smart Wealth Plan Premium',
      dueDate: '28 Nov 2026',
      amountFormatted: '₹2,50,000',
      account: 'Sunita Sharma / Direct Debit',
      type: 'PROTECTION',
      status: 'AUTO-DEBIT',
    },
    {
      id: 'obl-03',
      title: 'Advance Income Tax Q3 FY26 // Trust',
      dueDate: '15 Dec 2026',
      amountFormatted: '₹6,80,000',
      account: 'Sharma Family Trust Treasury',
      type: 'STATUTORY',
      status: 'PENDING AUDIT',
    },
  ];

  // Recent verified financial activities
  const recentActivities = [
    {
      id: 'act-01',
      title: 'Physical Gold Sovereign Certificate Vaulted',
      timestamp: 'Yesterday, 16:40 IST',
      category: 'VAULT INTAKE',
      delta: '+₹25,00,000',
      isCredit: true,
      code: 'DOC-041',
    },
    {
      id: 'act-02',
      title: 'Kotak Auto Loan Monthly Amortisation',
      timestamp: '01 Nov 2026',
      category: 'DEBT AMORTISATION',
      delta: '-₹48,500',
      isCredit: false,
      code: 'LIA-003',
    },
    {
      id: 'act-03',
      title: 'TCS & Infosys Dividend Credited',
      timestamp: '27 Oct 2026',
      category: 'TREASURY YIELD',
      delta: '+₹86,400',
      isCredit: true,
      code: 'CASH-089',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. LIVING FINANCIAL UNIVERSE COCKPIT OPENING */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_4px_24px_-4px_rgba(30,27,75,0.04),0_1px_3px_0_rgba(30,27,75,0.02)] overflow-hidden">
        {/* Top Identification Header */}
        <div className="p-6 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#64748B]">
              <span className="text-[#0F172A] font-bold">PROVENTA</span>
              <span className="text-[#CBD5E1]">/</span>
              <span className="text-[#2563EB] font-semibold">LIVING FINANCIAL UNIVERSE</span>
              <span className="text-[#CBD5E1]">/</span>
              <span className="text-[#0D9488] flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 bg-[#0D9488] rounded-full animate-ping" />
                SYSTEM ACTIVE
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl text-[#0F172A] font-bold tracking-tight mt-1.5">
              Financial Command Cockpit
            </h1>
          </div>

          {/* Member Scope Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 border border-[#CBD5E1] p-1 bg-[#F8FAFC] rounded-xl shadow-sm">
            <button
              onClick={() => setSelectedUserFilter('CONSOLIDATED')}
              className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-all rounded-lg ${
                selectedUserFilter === 'CONSOLIDATED'
                  ? 'bg-white text-[#2563EB] font-bold shadow-sm'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50'
              }`}
            >
              Consolidated Family
            </button>
            <button
              onClick={() => setSelectedUserFilter('usr_rajesh_sharma')}
              className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-all rounded-lg ${
                selectedUserFilter === 'usr_rajesh_sharma'
                  ? 'bg-white text-[#2563EB] font-bold shadow-sm'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50'
              }`}
            >
              Rajesh (Self)
            </button>
            <button
              onClick={() => setSelectedUserFilter('usr_sunita_sharma')}
              className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-all rounded-lg ${
                selectedUserFilter === 'usr_sunita_sharma'
                  ? 'bg-white text-[#2563EB] font-bold shadow-sm'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50'
              }`}
            >
              Sunita (Spouse)
            </button>
            <button
              onClick={() => setSelectedUserFilter('usr_aarav_sharma')}
              className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-all rounded-lg ${
                selectedUserFilter === 'usr_aarav_sharma'
                  ? 'bg-white text-[#2563EB] font-bold shadow-sm'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50'
              }`}
            >
              Aarav (Child)
            </button>
          </div>
        </div>

        {/* Prominent Living Net Worth Odometer */}
        <div className="p-8 sm:p-12 border-b border-[#E2E8F0] bg-gradient-to-br from-[#FAFBFC] via-white to-[#F8FAFC]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-[#2563EB] font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                <span>
                  {selectedUserFilter === 'CONSOLIDATED'
                    ? 'TOTAL CONSOLIDATED FAMILY NET WORTH'
                    : 'OWNERSHIP-ADJUSTED BENEFICIAL NET WORTH'}
                </span>
              </div>
              <div className="font-display font-bold text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#0F172A] mt-3 leading-none">
                {selectedUserFilter === 'CONSOLIDATED'
                  ? telemetry.formattedGrossNetWorth
                  : telemetry.formattedAdjustedNetWorth}
              </div>
              <div className="font-mono text-xs text-[#64748B] mt-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
                Zero estimation drift • Integer paise precision math • 100% Verified across all 13 family registries
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-[#E2E8F0]">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F0FDFA] border border-[#99F6E4] text-[#0D9488] font-mono text-xs uppercase tracking-wider rounded-full">
                <TrendingUp className="w-4 h-4 text-[#0D9488]" />
                <span className="font-semibold">+14.2% Trailing 12M Trajectory</span>
              </div>
              <div className="font-mono text-[11px] text-[#64748B]">
                Snapshot Date: {new Date(telemetry.calculatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Part Dimensional Ledger with Dynamic Depth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] bg-white">
          {/* 01: Gross Assets */}
          <div className="p-6 space-y-2 hover:bg-[#F8FAFC] transition-colors">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#64748B]">
              <span>01 // GROSS ASSETS</span>
              <Coins className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A]">
              {selectedUserFilter === 'CONSOLIDATED'
                ? telemetry.formattedGrossAssets
                : telemetry.formattedAdjustedAssets}
            </div>
            <div className="font-mono text-xs text-[#64748B]">
              Across {telemetry.totalAssetsCount} verified physical, financial &amp; equity assets
            </div>
          </div>

          {/* 02: Total Liabilities */}
          <div className="p-6 space-y-2 hover:bg-[#F8FAFC] transition-colors">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#64748B]">
              <span>02 // TOTAL LIABILITIES</span>
              <CreditCard className="w-4 h-4 text-rose-500" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-rose-600">
              {selectedUserFilter === 'CONSOLIDATED'
                ? telemetry.formattedGrossLiabilities
                : telemetry.formattedAdjustedLiabilities}
            </div>
            <div className="font-mono text-xs text-[#64748B]">
              Debt to asset ratio: 9.94% (High solvency safety tier)
            </div>
          </div>

          {/* 03: Ownership-Adjusted Equity */}
          <div className="p-6 space-y-2 hover:bg-[#F8FAFC] transition-colors">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#64748B]">
              <span>03 // ADJUSTED EQUITY</span>
              <Building2 className="w-4 h-4 text-[#0D9488]" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A]">
              {telemetry.formattedAdjustedNetWorth}
            </div>
            <div className="font-mono text-xs text-[#0D9488] font-medium">
              Attributed according to registered title deeds
            </div>
          </div>

          {/* 04: Vault Integrity */}
          <div className="p-6 space-y-2 hover:bg-[#F8FAFC] transition-colors">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#64748B]">
              <span>04 // VAULT INTEGRITY</span>
              <Lock className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A]">
              {telemetry.unverifiedAssetsCount === 0
                ? '100% AUDITED'
                : `${telemetry.totalAssetsCount - telemetry.unverifiedAssetsCount} / ${telemetry.totalAssetsCount} AUDITED`}
            </div>
            <div className="font-mono text-xs text-[#64748B]">
              AES-GCM-256 encrypted deeds &amp; CAMS statements
            </div>
          </div>
        </div>
      </div>

      {/* 2. LIVING WEALTH GRAPH (SYSTEM 01) */}
      <LivingWealthGraph
        currentNetWorthPaise={telemetry.grossNetWorthPaise}
        formattedNetWorth={
          selectedUserFilter === 'CONSOLIDATED'
            ? telemetry.formattedGrossNetWorth
            : telemetry.formattedAdjustedNetWorth
        }
      />

      {/* 3. OPTIONAL TOGGLE: FINANCIAL UNIVERSE TOPOLOGY (SYSTEM 02) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowUniverseTopology(!showUniverseTopology)}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#2563EB] hover:text-[#1D4ED8] font-semibold"
          >
            <Orbit className="w-4 h-4" />
            <span>{showUniverseTopology ? 'Hide Orbital Universe Topology' : 'Expand Interactive Orbital Universe Topology (System 02)'}</span>
          </button>
          <Link href="/family" className="font-mono text-xs text-[#64748B] hover:text-[#2563EB]">
            Open Full Family Governance Matrix →
          </Link>
        </div>

        {showUniverseTopology && <FinancialUniverse />}
      </div>

      {/* 4. ASSET ALLOCATION & FAMILY OWNERSHIP INDEX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Asset Class Allocation Matrix (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2563EB]" />
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#0F172A] font-bold">
                  ASSET CLASS ALLOCATION MATRIX
                </h3>
              </div>
              <Link href="/assets" className="font-mono text-xs uppercase tracking-wider text-[#2563EB] hover:underline">
                View Register →
              </Link>
            </div>

            {/* Segmented Proportion Bar */}
            <div className="p-6 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="h-6 w-full border border-[#CBD5E1] bg-white flex overflow-hidden rounded-lg shadow-inner">
                {telemetry.assetAllocation.map((a, idx) => {
                  const bg =
                    idx === 0
                      ? 'bg-[#2563EB]'
                      : idx === 1
                      ? 'bg-[#3B82F6]'
                      : idx === 2
                      ? 'bg-[#0D9488]'
                      : 'bg-[#CBD5E1]';
                  return (
                    <div
                      key={a.category}
                      style={{ width: `${a.percentage}%` }}
                      className={`${bg} h-full border-r border-white last:border-r-0`}
                      title={`${a.label}: ${a.percentage}%`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center justify-between font-mono text-[11px] text-[#64748B] mt-3">
                <span className="flex items-center gap-1.5 text-[#2563EB]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" /> PHYSICAL REALTY
                </span>
                <span className="flex items-center gap-1.5 text-[#3B82F6]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /> EQUITIES &amp; DEMAT
                </span>
                <span className="flex items-center gap-1.5 text-[#0D9488]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" /> BULLION &amp; TREASURY
                </span>
              </div>
            </div>

            {/* Structured Table */}
            <div className="divide-y divide-[#F1F5F9]">
              {telemetry.assetAllocation.map((alloc, idx) => (
                <div key={alloc.category} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#2563EB] font-bold">0{idx + 1}</span>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0F172A]">
                        {alloc.label}
                      </div>
                      <div className="font-mono text-[11px] text-[#64748B]">
                        {alloc.count} legal instruments registered
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-bold text-[#0F172A]">{alloc.formattedTotal}</div>
                    <div className="font-mono text-xs text-[#2563EB] font-semibold">{alloc.percentage}% share</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-[#E2E8F0] bg-[#FAFBFC] flex items-center justify-between font-mono text-xs">
            <span className="text-[#64748B]">Missing Title Deed Flags:</span>
            <span className="font-semibold text-[#2563EB]">{telemetry.missingInformationCount} Instruments Flagged</span>
          </div>
        </div>

        {/* Right: Family Ownership Index (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#2563EB]" />
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#0F172A] font-bold">
                  FAMILY OWNERSHIP &amp; EQUITY INDEX
                </h3>
              </div>
              <Link href="/family" className="font-mono text-xs uppercase tracking-wider text-[#2563EB] hover:underline">
                Governance →
              </Link>
            </div>

            {/* Member Table */}
            <div className="divide-y divide-[#F1F5F9]">
              {telemetry.memberShares.map((m) => (
                <div key={m.memberId} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg flex items-center justify-center font-mono text-xs font-bold text-[#1D4ED8]">
                      {m.memberName.charAt(0)}
                    </span>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider font-semibold text-[#0F172A]">
                        {m.memberName}
                      </div>
                      <div className="font-mono text-[11px] text-[#64748B]">
                        Assets: {m.formattedAssetsTotal} · Debt: {m.formattedLiabilitiesTotal}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-bold text-[#0F172A]">{m.formattedNetWorth}</div>
                    <div className="font-mono text-xs text-[#0D9488] font-semibold">
                      {m.percentageOfFamilyNetWorth}% beneficial share
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-[#E2E8F0] bg-[#FAFBFC] font-mono text-[11px] text-[#64748B]">
            All percentages calculated directly from registered title deed co-ownership records in the Family Vault.
          </div>
        </div>
      </div>

      {/* 5. FINANCIAL ACTIVITY & UPCOMING OBLIGATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upcoming Financial Obligations (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2563EB]" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#0F172A] font-bold">
                UPCOMING FINANCIAL OBLIGATIONS
              </h3>
            </div>
            <Link href="/liabilities" className="font-mono text-xs uppercase tracking-wider text-[#2563EB] hover:underline">
              Amortisation Schedules →
            </Link>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {upcomingObligations.map((obl) => (
              <div key={obl.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#475569] font-mono text-[10px] uppercase tracking-wider rounded-md">
                      {obl.type}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#0F172A]">{obl.title}</span>
                  </div>
                  <div className="font-mono text-[11px] text-[#64748B]">
                    Due: <span className="text-[#0F172A] font-medium">{obl.dueDate}</span> · Debit from: {obl.account}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-base text-[#0F172A]">{obl.amountFormatted}</div>
                  <span className="inline-block mt-0.5 font-mono text-[10px] px-2 py-0.5 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-full">
                    {obl.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#FAFBFC] border-t border-[#E2E8F0] flex items-center justify-between font-mono text-xs text-[#64748B]">
            <span>NEXT 30 DAYS DEBT OUTFLOW: ₹10,72,800</span>
            <span className="text-[#0D9488] font-bold">LIQUIDITY COVER: 4.8X</span>
          </div>
        </div>

        {/* Right: Recent Financial Activity (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2563EB]" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#0F172A] font-bold">
                RECORDED FINANCIAL ACTIVITY
              </h3>
            </div>
            <Link href="/cashflow" className="font-mono text-xs uppercase tracking-wider text-[#2563EB] hover:underline">
              Treasury Ledger →
            </Link>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {recentActivities.map((act) => (
              <div key={act.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#2563EB] font-bold">{act.code}</span>
                    <span className="font-mono text-xs font-semibold text-[#0F172A]">{act.title}</span>
                  </div>
                  <div className="font-mono text-[11px] text-[#64748B]">
                    {act.timestamp} · {act.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-display font-bold text-base ${act.isCredit ? 'text-[#0D9488]' : 'text-rose-600'}`}>
                    {act.delta}
                  </div>
                  <span className="font-mono text-[10px] text-[#94A3B8]">AUDITED PAISE</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#FAFBFC] border-t border-[#E2E8F0] flex items-center justify-between font-mono text-xs text-[#64748B]">
            <span>TOTAL TRANSACTIONS LOGGED: 48</span>
            <span className="text-[#2563EB] font-medium">INTERNAL TRANSFERS EXCLUDED</span>
          </div>
        </div>
      </div>

      {/* 6. PROACTIVE AI OBSERVATIONS & CITATIONS */}
      {observations.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-[#FAFBFC]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#2563EB]" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#0F172A] font-bold">
                PROVENTA INTELLIGENCE — INSTITUTIONAL OBSERVATIONS
              </h3>
            </div>
            <span className="font-mono text-[11px] uppercase text-[#2563EB] font-semibold">
              6 Specialized Agents Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0]">
            {observations.map((obs) => (
              <div key={obs.id} className="p-6 space-y-3 bg-white">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="px-2.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] uppercase font-bold rounded-full">
                    {obs.agentRole.replace('_', ' ')}
                  </span>
                  <span className={`uppercase font-bold ${obs.severity === 'ALERT' ? 'text-amber-600' : 'text-[#0D9488]'}`}>
                    {obs.severity}
                  </span>
                </div>
                <h4 className="font-display font-bold text-base text-[#0F172A] leading-snug">{obs.title}</h4>
                <p className="font-sans text-xs text-[#475569] leading-relaxed">
                  {obs.observation}
                </p>
                {obs.actionableStep && (
                  <div className="pt-2 border-t border-[#F1F5F9] font-mono text-xs text-[#0F172A]">
                    <span className="font-semibold text-[#2563EB]">Action:</span> {obs.actionableStep}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. QUICK ACTION REGISTERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/assets"
          className="p-6 border border-[#CBD5E1] bg-white hover:border-[#2563EB] hover:shadow-md group transition-all rounded-2xl flex flex-col justify-between h-36"
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#2563EB]">
            01 // REGISTER
          </div>
          <div>
            <div className="font-display text-lg font-bold text-[#0F172A] leading-tight group-hover:text-[#2563EB] transition-colors">
              + Record Asset
            </div>
            <div className="font-mono text-[11px] text-[#64748B] mt-1">
              Property, Demat, Gold, Equity
            </div>
          </div>
        </Link>

        <Link
          href="/liabilities"
          className="p-6 border border-[#CBD5E1] bg-white hover:border-[#2563EB] hover:shadow-md group transition-all rounded-2xl flex flex-col justify-between h-36"
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#2563EB]">
            02 // OBLIGATION
          </div>
          <div>
            <div className="font-display text-lg font-bold text-[#0F172A] leading-tight group-hover:text-[#2563EB] transition-colors">
              + Log Liability
            </div>
            <div className="font-mono text-[11px] text-[#64748B] mt-1">
              Mortgages, Auto Debt, EMIs
            </div>
          </div>
        </Link>

        <Link
          href="/vault"
          className="p-6 border border-[#CBD5E1] bg-white hover:border-[#2563EB] hover:shadow-md group transition-all rounded-2xl flex flex-col justify-between h-36"
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#2563EB]">
            03 // ENCRYPTION
          </div>
          <div>
            <div className="font-display text-lg font-bold text-[#0F172A] leading-tight group-hover:text-[#2563EB] transition-colors">
              Upload to Vault
            </div>
            <div className="font-mono text-[11px] text-[#64748B] mt-1">
              Title Deed, Share Certificate
            </div>
          </div>
        </Link>

        <Link
          href="/reports"
          className="p-6 border border-[#CBD5E1] bg-white hover:border-[#2563EB] hover:shadow-md group transition-all rounded-2xl flex flex-col justify-between h-36"
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#2563EB]">
            04 // AUDIT
          </div>
          <div>
            <div className="font-display text-lg font-bold text-[#0F172A] leading-tight group-hover:text-[#2563EB] transition-colors">
              Financial Statement
            </div>
            <div className="font-mono text-[11px] text-[#64748B] mt-1">
              Printable Statement of Position
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
