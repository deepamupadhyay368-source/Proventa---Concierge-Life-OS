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
  Compass,
} from 'lucide-react';
import { NetWorthSummary, AIInsightObservation } from '@/lib/wealth/types';
import { LivingWealthGraph } from '@/components/wealth/universe/LivingWealthGraph';
import { FinancialUniverse } from '@/components/wealth/universe/FinancialUniverse';
import { ProventaObject, TimeLandscapes } from '@/components/wealth/art';

export default function FamilyWealthDashboard() {
  const [telemetry, setTelemetry] = useState<NetWorthSummary | null>(null);
  const [observations, setObservations] = useState<AIInsightObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('CONSOLIDATED');
  const [showUniverseTopology, setShowUniverseTopology] = useState<boolean>(false);
  const [showTimeLandscapes, setShowTimeLandscapes] = useState<boolean>(false);

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
      <div className="flex flex-col items-center justify-center min-h-[500px] border border-[#B9C1CC]/20 bg-[#171B23] p-12 rounded-sm shadow-md">
        <div className="w-12 h-12 bg-[#2457E8] text-[#F4F2ED] flex items-center justify-center font-heading font-black text-lg rounded-xs shadow-lg shadow-[#2457E8]/20 animate-pulse mb-4">
          P
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.25em] text-[#F4F2ED] font-bold">
          SYNTHESIZING LIVING FINANCIAL UNIVERSE
        </div>
        <div className="font-mono text-[11px] text-[#A9D8F5] mt-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2457E8] animate-ping" />
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
    <div className="space-y-8 text-[#F4F2ED]">
      {/* 1. LIVING FINANCIAL UNIVERSE COCKPIT OPENING */}
      <div className="bg-[#171B23] border border-[#B9C1CC]/20 rounded-sm shadow-md overflow-hidden">
        {/* Top Identification Header */}
        <div className="p-6 border-b border-[#B9C1CC]/15 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#171B23]">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#B9C1CC]/70">
              <span className="text-[#F4F2ED] font-bold">PROVENTA</span>
              <span className="text-[#B9C1CC]/30">/</span>
              <span className="text-[#2457E8] font-bold">EXPERIMENTAL DIGITAL ART</span>
              <span className="text-[#B9C1CC]/30">/</span>
              <span className="text-[#A9D8F5] flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 bg-[#2457E8] rounded-full animate-ping" />
                SYSTEM ACTIVE
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl text-[#F4F2ED] uppercase font-black tracking-tight mt-1.5">
              Financial Command Cockpit
            </h1>
          </div>

          {/* Member Scope Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 border border-[#B9C1CC]/20 p-1 bg-[#080A0F] rounded-xs shadow-inner">
            <button
              onClick={() => setSelectedUserFilter('CONSOLIDATED')}
              className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all rounded-xs ${
                selectedUserFilter === 'CONSOLIDATED'
                  ? 'bg-[#2457E8] text-[#F4F2ED] font-bold shadow-sm'
                  : 'text-[#B9C1CC] hover:text-[#F4F2ED] hover:bg-[#171B23]'
              }`}
            >
              Consolidated Family
            </button>
            <button
              onClick={() => setSelectedUserFilter('usr_rajesh_sharma')}
              className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all rounded-xs ${
                selectedUserFilter === 'usr_rajesh_sharma'
                  ? 'bg-[#2457E8] text-[#F4F2ED] font-bold shadow-sm'
                  : 'text-[#B9C1CC] hover:text-[#F4F2ED] hover:bg-[#171B23]'
              }`}
            >
              Rajesh (Self)
            </button>
            <button
              onClick={() => setSelectedUserFilter('usr_sunita_sharma')}
              className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all rounded-xs ${
                selectedUserFilter === 'usr_sunita_sharma'
                  ? 'bg-[#2457E8] text-[#F4F2ED] font-bold shadow-sm'
                  : 'text-[#B9C1CC] hover:text-[#F4F2ED] hover:bg-[#171B23]'
              }`}
            >
              Sunita (Spouse)
            </button>
            <button
              onClick={() => setSelectedUserFilter('usr_aarav_sharma')}
              className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all rounded-xs ${
                selectedUserFilter === 'usr_aarav_sharma'
                  ? 'bg-[#2457E8] text-[#F4F2ED] font-bold shadow-sm'
                  : 'text-[#B9C1CC] hover:text-[#F4F2ED] hover:bg-[#171B23]'
              }`}
            >
              Aarav (Child)
            </button>
          </div>
        </div>

        {/* Prominent Living Net Worth Odometer with 3D Object Emblem */}
        <div className="p-8 sm:p-10 border-b border-[#B9C1CC]/15 bg-gradient-to-br from-[#080A0F] via-[#171B23] to-[#080A0F] relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#2457E8]/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#2457E8] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2457E8] animate-pulse" />
                <span>
                  {selectedUserFilter === 'CONSOLIDATED'
                    ? 'TOTAL CONSOLIDATED FAMILY NET WORTH'
                    : 'OWNERSHIP-ADJUSTED BENEFICIAL NET WORTH'}
                </span>
              </div>
              <div className="font-heading font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#F4F2ED] mt-3 leading-none">
                {selectedUserFilter === 'CONSOLIDATED'
                  ? telemetry.formattedGrossNetWorth
                  : telemetry.formattedAdjustedNetWorth}
              </div>
              <div className="font-mono text-xs text-[#B9C1CC]/70 mt-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D5A85D]" />
                Zero estimation drift • Integer paise precision math • 100% Verified across all 13 family registries
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#B9C1CC]/15">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#171B23] border border-[#2457E8]/50 text-[#A9D8F5] font-mono text-xs uppercase tracking-wider rounded-xs">
                <TrendingUp className="w-4 h-4 text-[#2457E8]" />
                <span className="font-bold">+14.2% Trailing 12M Trajectory</span>
              </div>
              <div className="font-mono text-[11px] text-[#B9C1CC]/60">
                Snapshot Date: {new Date(telemetry.calculatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Part Dimensional Ledger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#B9C1CC]/15 bg-[#171B23]">
          {/* 01: Gross Assets */}
          <div className="p-6 space-y-2 hover:bg-[#252C38]/40 transition-colors">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#B9C1CC]/70">
              <span>01 // TOTAL ASSETS</span>
              <Coins className="w-4 h-4 text-[#2457E8]" />
            </div>
            <div className="font-heading font-black text-2xl text-[#F4F2ED]">
              {telemetry.formattedGrossAssets}
            </div>
            <div className="font-mono text-[11px] text-[#A9D8F5]">
              Real estate, securities, bullion
            </div>
          </div>

          {/* 02: Total Liabilities */}
          <div className="p-6 space-y-2 hover:bg-[#252C38]/40 transition-colors">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#B9C1CC]/70">
              <span>02 // TOTAL LIABILITIES</span>
              <CreditCard className="w-4 h-4 text-[#D5A85D]" />
            </div>
            <div className="font-heading font-black text-2xl text-[#D5A85D]">
              {telemetry.formattedGrossLiabilities}
            </div>
            <div className="font-mono text-[11px] text-[#B9C1CC]/70">
              Term debt, lines of credit
            </div>
          </div>

          {/* 03: Cashflow Velocity */}
          <div className="p-6 space-y-2 hover:bg-[#252C38]/40 transition-colors">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#B9C1CC]/70">
              <span>03 // NET CHANGE (30D)</span>
              <ArrowLeftRight className="w-4 h-4 text-[#2457E8]" />
            </div>
            <div className="font-heading font-black text-2xl text-[#F4F2ED]">
              {telemetry.formattedMonthlyChange}
            </div>
            <div className="font-mono text-[11px] text-[#A9D8F5]">
              +{telemetry.monthlyGrowthPercentage}% monthly velocity
            </div>
          </div>

          {/* 04: Active Vault Documents */}
          <div className="p-6 space-y-2 hover:bg-[#252C38]/40 transition-colors">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#B9C1CC]/70">
              <span>04 // ENCRYPTED INSTRUMENTS</span>
              <Lock className="w-4 h-4 text-[#2457E8]" />
            </div>
            <div className="font-heading font-black text-2xl text-[#F4F2ED]">
              {telemetry.totalAssetsCount} Registered Deeds
            </div>
            <div className="font-mono text-[11px] text-[#B9C1CC]/70">
              AES-GCM-256 Air-Gapped
            </div>
          </div>
        </div>
      </div>

      {/* 2. LIVING WEALTH GRAPH & ORBITAL TOPOLOGY */}
      <div className="space-y-4">
        <LivingWealthGraph />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#171B23] border border-[#B9C1CC]/20 rounded-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUniverseTopology(!showUniverseTopology)}
              className="inline-flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-wider bg-[#080A0F] text-[#F4F2ED] hover:bg-[#252C38] border border-[#B9C1CC]/30 rounded-xs transition-colors"
            >
              <Orbit className="w-3.5 h-3.5 text-[#2457E8]" />
              <span>{showUniverseTopology ? 'Hide Orbital Universe Topology' : 'Expand Interactive Orbital Topology (System 02)'}</span>
            </button>
            <button
              onClick={() => setShowTimeLandscapes(!showTimeLandscapes)}
              className="inline-flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-wider bg-[#080A0F] text-[#F4F2ED] hover:bg-[#252C38] border border-[#B9C1CC]/30 rounded-xs transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#D5A85D]" />
              <span>{showTimeLandscapes ? 'Hide Time Landscapes' : 'Open 30-Yr Time Landscapes (System 04)'}</span>
            </button>
          </div>
          <Link href="/family" className="font-mono text-xs text-[#A9D8F5] hover:text-[#F4F2ED]">
            Open Full Family Governance Matrix →
          </Link>
        </div>

        {showUniverseTopology && <FinancialUniverse />}
        {showTimeLandscapes && <TimeLandscapes />}
      </div>

      {/* 3. ASSET ALLOCATION & FAMILY OWNERSHIP INDEX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Asset Class Allocation Matrix (6 cols) */}
        <div className="lg:col-span-6 bg-[#171B23] border border-[#B9C1CC]/20 rounded-sm shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-6 border-b border-[#B9C1CC]/15 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2457E8]" />
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#F4F2ED] font-bold">
                  ASSET CLASS ALLOCATION MATRIX
                </h3>
              </div>
              <Link href="/assets" className="font-mono text-xs uppercase tracking-wider text-[#A9D8F5] hover:underline">
                View Register →
              </Link>
            </div>

            {/* Segmented Proportion Bar */}
            <div className="p-6 border-b border-[#B9C1CC]/15 bg-[#080A0F]">
              <div className="h-5 w-full border border-[#B9C1CC]/30 bg-[#171B23] flex overflow-hidden rounded-xs">
                {telemetry.assetAllocation.map((a, idx) => {
                  const bg =
                    idx === 0
                      ? 'bg-[#2457E8]'
                      : idx === 1
                      ? 'bg-[#7595FF]'
                      : idx === 2
                      ? 'bg-[#D5A85D]'
                      : 'bg-[#B9C1CC]/50';
                  return (
                    <div
                      key={a.category}
                      style={{ width: `${a.percentage}%` }}
                      className={`${bg} h-full border-r border-[#080A0F] last:border-r-0`}
                      title={`${a.label}: ${a.percentage}%`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center justify-between font-mono text-[11px] text-[#B9C1CC]/70 mt-3">
                <span className="flex items-center gap-1.5 text-[#2457E8]">
                  <span className="w-2 h-2 rounded-full bg-[#2457E8]" /> PHYSICAL REALTY
                </span>
                <span className="flex items-center gap-1.5 text-[#7595FF]">
                  <span className="w-2 h-2 rounded-full bg-[#7595FF]" /> EQUITIES &amp; DEMAT
                </span>
                <span className="flex items-center gap-1.5 text-[#D5A85D]">
                  <span className="w-2 h-2 rounded-full bg-[#D5A85D]" /> BULLION &amp; TREASURY
                </span>
              </div>
            </div>

            {/* Structured Table */}
            <div className="divide-y divide-[#B9C1CC]/10">
              {telemetry.assetAllocation.map((alloc, idx) => (
                <div key={alloc.category} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#252C38]/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#2457E8] font-bold">0{idx + 1}</span>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider font-semibold text-[#F4F2ED]">
                        {alloc.label}
                      </div>
                      <div className="font-mono text-[11px] text-[#B9C1CC]/60">
                        {alloc.count} legal instruments registered
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading font-black text-lg text-[#F4F2ED]">{alloc.formattedTotal}</div>
                    <div className="font-mono text-xs text-[#A9D8F5] font-semibold">{alloc.percentage}% share</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-[#B9C1CC]/15 bg-[#080A0F] flex items-center justify-between font-mono text-xs">
            <span className="text-[#B9C1CC]/70">Missing Title Deed Flags:</span>
            <span className="font-semibold text-[#A9D8F5]">{telemetry.missingInformationCount} Instruments Flagged</span>
          </div>
        </div>

        {/* Right: Family Ownership Index (6 cols) */}
        <div className="lg:col-span-6 bg-[#171B23] border border-[#B9C1CC]/20 rounded-sm shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-6 border-b border-[#B9C1CC]/15 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#2457E8]" />
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#F4F2ED] font-bold">
                  FAMILY OWNERSHIP &amp; EQUITY INDEX
                </h3>
              </div>
              <Link href="/family" className="font-mono text-xs uppercase tracking-wider text-[#A9D8F5] hover:underline">
                Governance →
              </Link>
            </div>

            {/* Member Table */}
            <div className="divide-y divide-[#B9C1CC]/10">
              {telemetry.memberShares.map((m) => (
                <div key={m.memberId} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#252C38]/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#080A0F] border border-[#B9C1CC]/30 rounded-xs flex items-center justify-center font-mono text-xs font-bold text-[#A9D8F5]">
                      {m.memberName.charAt(0)}
                    </span>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider font-semibold text-[#F4F2ED]">
                        {m.memberName}
                      </div>
                      <div className="font-mono text-[11px] text-[#B9C1CC]/60">
                        Assets: {m.formattedAssetsTotal} · Debt: {m.formattedLiabilitiesTotal}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading font-black text-lg text-[#F4F2ED]">{m.formattedNetWorth}</div>
                    <div className="font-mono text-xs text-[#2457E8] font-bold">
                      {m.percentageOfFamilyNetWorth}% beneficial share
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-[#B9C1CC]/15 bg-[#080A0F] font-mono text-[11px] text-[#B9C1CC]/70">
            All percentages calculated directly from registered title deed co-ownership records in the Family Vault.
          </div>
        </div>
      </div>

      {/* 4. FINANCIAL ACTIVITY & UPCOMING OBLIGATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upcoming Financial Obligations (6 cols) */}
        <div className="lg:col-span-6 bg-[#171B23] border border-[#B9C1CC]/20 rounded-sm shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#B9C1CC]/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2457E8]" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#F4F2ED] font-bold">
                UPCOMING FINANCIAL OBLIGATIONS
              </h3>
            </div>
            <Link href="/liabilities" className="font-mono text-xs uppercase tracking-wider text-[#A9D8F5] hover:underline">
              Amortisation Schedules →
            </Link>
          </div>

          <div className="divide-y divide-[#B9C1CC]/10">
            {upcomingObligations.map((obl) => (
              <div key={obl.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#252C38]/40 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#080A0F] text-[#B9C1CC] font-mono text-[10px] uppercase tracking-wider rounded-xs border border-[#B9C1CC]/20">
                      {obl.type}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#F4F2ED]">{obl.title}</span>
                  </div>
                  <div className="font-mono text-[11px] text-[#B9C1CC]/60">
                    Due: <span className="text-[#F4F2ED] font-medium">{obl.dueDate}</span> · Debit from: {obl.account}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-heading font-black text-base text-[#F4F2ED]">{obl.amountFormatted}</div>
                  <span className="inline-block mt-0.5 font-mono text-[10px] px-2 py-0.5 bg-[#2457E8]/20 text-[#A9D8F5] border border-[#2457E8]/40 rounded-xs">
                    {obl.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#080A0F] border-t border-[#B9C1CC]/15 flex items-center justify-between font-mono text-xs text-[#B9C1CC]/70">
            <span>NEXT 30 DAYS DEBT OUTFLOW: ₹10,72,800</span>
            <span className="text-[#A9D8F5] font-bold">LIQUIDITY COVER: 4.8X</span>
          </div>
        </div>

        {/* Right: Recent Financial Activity (6 cols) */}
        <div className="lg:col-span-6 bg-[#171B23] border border-[#B9C1CC]/20 rounded-sm shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#B9C1CC]/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2457E8]" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#F4F2ED] font-bold">
                RECORDED FINANCIAL ACTIVITY
              </h3>
            </div>
            <Link href="/cashflow" className="font-mono text-xs uppercase tracking-wider text-[#A9D8F5] hover:underline">
              Treasury Ledger →
            </Link>
          </div>

          <div className="divide-y divide-[#B9C1CC]/10">
            {recentActivities.map((act) => (
              <div key={act.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#252C38]/40 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#2457E8] font-bold">[{act.code}]</span>
                    <span className="font-mono text-xs font-semibold text-[#F4F2ED]">{act.title}</span>
                  </div>
                  <div className="font-mono text-[11px] text-[#B9C1CC]/60">
                    {act.timestamp} · {act.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-heading font-black text-base ${act.isCredit ? 'text-[#2457E8]' : 'text-rose-400'}`}>
                    {act.delta}
                  </div>
                  <span className="font-mono text-[10px] text-[#B9C1CC]/60">AUDITED PAISE</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#080A0F] border-t border-[#B9C1CC]/15 flex items-center justify-between font-mono text-xs text-[#B9C1CC]/70">
            <span>TOTAL TRANSACTIONS LOGGED: 48</span>
            <span className="text-[#A9D8F5] font-medium">INTERNAL TRANSFERS EXCLUDED</span>
          </div>
        </div>
      </div>

      {/* 5. PROACTIVE AI OBSERVATIONS & CITATIONS */}
      {observations.length > 0 && (
        <div className="bg-[#171B23] border border-[#B9C1CC]/20 rounded-sm shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#B9C1CC]/15 flex items-center justify-between bg-[#080A0F]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#2457E8]" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#F4F2ED] font-bold">
                PROVENTA INTELLIGENCE — INSTITUTIONAL OBSERVATIONS
              </h3>
            </div>
            <span className="font-mono text-[11px] uppercase text-[#A9D8F5] font-semibold">
              6 Specialized Desks Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#B9C1CC]/15">
            {observations.map((obs) => (
              <div key={obs.id} className="p-6 space-y-3 bg-[#171B23]">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="px-2 py-0.5 bg-[#080A0F] text-[#A9D8F5] border border-[#2457E8]/40 uppercase font-bold rounded-xs">
                    {obs.agentRole.replace(/_/g, ' ')}
                  </span>
                  <span className={`uppercase font-bold ${obs.severity === 'ALERT' ? 'text-[#D5A85D]' : 'text-[#2457E8]'}`}>
                    {obs.severity}
                  </span>
                </div>
                <h4 className="font-heading font-bold text-base text-[#F4F2ED] leading-snug">{obs.title}</h4>
                <p className="font-sans text-xs text-[#B9C1CC]/80 leading-relaxed">
                  {obs.observation}
                </p>
                {obs.actionableStep && (
                  <div className="pt-2 border-t border-[#B9C1CC]/10 font-mono text-xs text-[#F4F2ED]">
                    <span className="font-semibold text-[#2457E8]">Action:</span> {obs.actionableStep}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. QUICK ACTION REGISTERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/assets"
          className="p-6 border border-[#B9C1CC]/20 bg-[#171B23] hover:border-[#2457E8] group transition-all rounded-sm flex flex-col justify-between h-36"
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#2457E8]">
            01 // REGISTER
          </div>
          <div>
            <div className="font-heading text-lg font-bold text-[#F4F2ED] leading-tight group-hover:text-[#A9D8F5] transition-colors">
              + Record Asset
            </div>
            <div className="font-mono text-[11px] text-[#B9C1CC]/60 mt-1">
              Property, Demat, Gold, Equity
            </div>
          </div>
        </Link>

        <Link
          href="/liabilities"
          className="p-6 border border-[#B9C1CC]/20 bg-[#171B23] hover:border-[#2457E8] group transition-all rounded-sm flex flex-col justify-between h-36"
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#2457E8]">
            02 // OBLIGATION
          </div>
          <div>
            <div className="font-heading text-lg font-bold text-[#F4F2ED] leading-tight group-hover:text-[#A9D8F5] transition-colors">
              + Log Liability
            </div>
            <div className="font-mono text-[11px] text-[#B9C1CC]/60 mt-1">
              Mortgages, Auto Debt, EMIs
            </div>
          </div>
        </Link>

        <Link
          href="/vault"
          className="p-6 border border-[#B9C1CC]/20 bg-[#171B23] hover:border-[#2457E8] group transition-all rounded-sm flex flex-col justify-between h-36"
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#2457E8]">
            03 // ENCRYPTION
          </div>
          <div>
            <div className="font-heading text-lg font-bold text-[#F4F2ED] leading-tight group-hover:text-[#A9D8F5] transition-colors">
              Upload to Vault
            </div>
            <div className="font-mono text-[11px] text-[#B9C1CC]/60 mt-1">
              Title Deed, Share Certificate
            </div>
          </div>
        </Link>

        <Link
          href="/reports"
          className="p-6 border border-[#B9C1CC]/20 bg-[#171B23] hover:border-[#2457E8] group transition-all rounded-sm flex flex-col justify-between h-36"
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#2457E8]">
            04 // AUDIT
          </div>
          <div>
            <div className="font-heading text-lg font-bold text-[#F4F2ED] leading-tight group-hover:text-[#A9D8F5] transition-colors">
              Financial Statement
            </div>
            <div className="font-mono text-[11px] text-[#B9C1CC]/60 mt-1">
              Printable Statement of Position
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
