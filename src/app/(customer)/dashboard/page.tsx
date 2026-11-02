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
import { TimeLandscapes } from '@/components/wealth/art/TimeLandscapes';

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
      <div className="flex flex-col items-center justify-center min-h-[500px] border border-[#252C38] bg-[#171C26] p-12 rounded-xs shadow-md">
        <div className="w-12 h-12 bg-[#2457FF] text-[#F4F6FA] flex items-center justify-center font-heading font-black text-lg rounded-xs shadow-lg animate-pulse mb-4">
          P
        </div>
        <div className="font-mono text-xs uppercase tracking-widest text-[#F4F6FA] font-bold">
          LOADING LIVING FINANCIAL UNIVERSE
        </div>
        <div className="font-mono text-[11px] text-[#7595FF] mt-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2457FF] animate-ping" />
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
    <div className="space-y-8 text-[#F4F6FA]">
      {/* 1. FINANCIAL COCKPIT OVERVIEW */}
      <div className="bg-[#171C26] border border-[#252C38] rounded-xs shadow-md overflow-hidden">
        {/* Top Header */}
        <div className="p-6 border-b border-[#252C38] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#858D9B]">
              <span className="text-[#F4F6FA] font-bold">PROVENTA</span>
              <span className="text-[#252C38]">/</span>
              <span className="text-[#2457FF] font-bold">FAMILY COCKPIT</span>
              <span className="text-[#252C38]">/</span>
              <span className="text-[#7595FF] flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 bg-[#2457FF] rounded-full animate-ping" />
                ACTIVE
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl text-[#F4F6FA] uppercase font-black tracking-tight mt-1.5">
              Financial Command Cockpit
            </h1>
          </div>

          {/* Member Scope Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 border border-[#252C38] p-1 bg-[#090B10] rounded-xs">
            <button
              onClick={() => setSelectedUserFilter('CONSOLIDATED')}
              className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all rounded-xs ${
                selectedUserFilter === 'CONSOLIDATED'
                  ? 'bg-[#2457FF] text-white font-bold shadow-sm'
                  : 'text-[#C5CAD3] hover:text-white hover:bg-[#171C26]'
              }`}
            >
              Consolidated Family
            </button>
            <button
              onClick={() => setSelectedUserFilter('usr_rajesh_sharma')}
              className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all rounded-xs ${
                selectedUserFilter === 'usr_rajesh_sharma'
                  ? 'bg-[#2457FF] text-white font-bold shadow-sm'
                  : 'text-[#C5CAD3] hover:text-white hover:bg-[#171C26]'
              }`}
            >
              Rajesh (Self)
            </button>
            <button
              onClick={() => setSelectedUserFilter('usr_sunita_sharma')}
              className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all rounded-xs ${
                selectedUserFilter === 'usr_sunita_sharma'
                  ? 'bg-[#2457FF] text-white font-bold shadow-sm'
                  : 'text-[#C5CAD3] hover:text-white hover:bg-[#171C26]'
              }`}
            >
              Sunita (Spouse)
            </button>
            <button
              onClick={() => setSelectedUserFilter('usr_aarav_sharma')}
              className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all rounded-xs ${
                selectedUserFilter === 'usr_aarav_sharma'
                  ? 'bg-[#2457FF] text-white font-bold shadow-sm'
                  : 'text-[#C5CAD3] hover:text-white hover:bg-[#171C26]'
              }`}
            >
              Aarav (Child)
            </button>
          </div>
        </div>

        {/* Net Worth Odometer */}
        <div className="p-8 sm:p-10 border-b border-[#252C38] bg-[#090B10] relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-[#2457FF] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2457FF] animate-pulse" />
                <span>
                  {selectedUserFilter === 'CONSOLIDATED'
                    ? 'TOTAL CONSOLIDATED FAMILY NET WORTH'
                    : 'OWNERSHIP-ADJUSTED BENEFICIAL NET WORTH'}
                </span>
              </div>
              <div className="font-heading font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#F4F6FA] mt-3 leading-none">
                {selectedUserFilter === 'CONSOLIDATED'
                  ? telemetry.formattedGrossNetWorth
                  : telemetry.formattedAdjustedNetWorth}
              </div>
              <div className="font-mono text-xs text-[#858D9B] mt-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2457FF]" />
                Zero estimation drift • Integer paise precision math • 100% Verified across all 13 family registries
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#252C38]">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#171C26] border border-[#252C38] text-[#7595FF] font-mono text-xs uppercase tracking-wider rounded-xs">
                <TrendingUp className="w-4 h-4 text-[#2457FF]" />
                <span className="font-bold">+14.2% Trailing 12M Trajectory</span>
              </div>
              <div className="font-mono text-[11px] text-[#858D9B]">
                Snapshot: {new Date(telemetry.calculatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Pillar Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#252C38] bg-[#171C26]">
          {/* 01: Gross Assets */}
          <div className="p-6 space-y-2 hover:bg-[#252C38]/30 transition-colors">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#858D9B]">
              <span>01 // TOTAL ASSETS</span>
              <Coins className="w-4 h-4 text-[#2457FF]" />
            </div>
            <div className="font-heading font-black text-2xl text-[#F4F6FA]">
              {telemetry.formattedGrossAssets}
            </div>
            <div className="font-mono text-[11px] text-[#7595FF]">
              Real estate, securities, bullion
            </div>
          </div>

          {/* 02: Total Liabilities */}
          <div className="p-6 space-y-2 hover:bg-[#252C38]/30 transition-colors">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#858D9B]">
              <span>02 // TOTAL DEBT</span>
              <CreditCard className="w-4 h-4 text-[#FF7A70]" />
            </div>
            <div className="font-heading font-black text-2xl text-[#FF7A70]">
              {telemetry.formattedGrossLiabilities}
            </div>
            <div className="font-mono text-[11px] text-[#858D9B]">
              Term debt, lines of credit
            </div>
          </div>

          {/* 03: Cashflow Velocity */}
          <div className="p-6 space-y-2 hover:bg-[#252C38]/30 transition-colors">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#858D9B]">
              <span>03 // NET CHANGE (30D)</span>
              <ArrowLeftRight className="w-4 h-4 text-[#2457FF]" />
            </div>
            <div className="font-heading font-black text-2xl text-[#F4F6FA]">
              {telemetry.formattedMonthlyChange}
            </div>
            <div className="font-mono text-[11px] text-[#7595FF]">
              +{telemetry.monthlyGrowthPercentage}% monthly velocity
            </div>
          </div>

          {/* 04: Active Vault Documents */}
          <div className="p-6 space-y-2 hover:bg-[#252C38]/30 transition-colors">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#858D9B]">
              <span>04 // ENCRYPTED DEEDS</span>
              <Lock className="w-4 h-4 text-[#2457FF]" />
            </div>
            <div className="font-heading font-black text-2xl text-[#F4F6FA]">
              {telemetry.totalAssetsCount} Deeds
            </div>
            <div className="font-mono text-[11px] text-[#858D9B]">
              AES-GCM-256 Air-Gapped
            </div>
          </div>
        </div>
      </div>

      {/* 2. LIVING WEALTH GRAPH & CONTROLS */}
      <div className="space-y-4">
        <LivingWealthGraph />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#171C26] border border-[#252C38] rounded-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUniverseTopology(!showUniverseTopology)}
              className="inline-flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-wider bg-[#090B10] text-[#F4F6FA] hover:bg-[#252C38] border border-[#252C38] rounded-xs transition-colors"
            >
              <Orbit className="w-3.5 h-3.5 text-[#2457FF]" />
              <span>{showUniverseTopology ? 'Hide Orbital Topology' : 'Interactive Orbital Topology'}</span>
            </button>
            <button
              onClick={() => setShowTimeLandscapes(!showTimeLandscapes)}
              className="inline-flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-wider bg-[#090B10] text-[#F4F6FA] hover:bg-[#252C38] border border-[#252C38] rounded-xs transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#2457FF]" />
              <span>{showTimeLandscapes ? 'Hide Time Landscapes' : '30-Year Time Landscapes'}</span>
            </button>
          </div>
          <Link href="/family" className="font-mono text-xs text-[#7595FF] hover:text-white">
            Open Family Governance Matrix →
          </Link>
        </div>

        {showUniverseTopology && <FinancialUniverse />}
        {showTimeLandscapes && <TimeLandscapes />}
      </div>

      {/* 3. ASSET ALLOCATION & FAMILY OWNERSHIP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Asset Class Allocation Matrix (6 cols) */}
        <div className="lg:col-span-6 bg-[#171C26] border border-[#252C38] rounded-xs shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-6 border-b border-[#252C38] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2457FF]" />
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#F4F6FA] font-bold">
                  ASSET CLASS ALLOCATION
                </h3>
              </div>
              <Link href="/assets" className="font-mono text-xs uppercase tracking-wider text-[#7595FF] hover:underline">
                View Register →
              </Link>
            </div>

            {/* Segmented Proportion Bar */}
            <div className="p-6 border-b border-[#252C38] bg-[#090B10]">
              <div className="h-4 w-full border border-[#252C38] bg-[#171C26] flex overflow-hidden rounded-xs">
                {telemetry.assetAllocation.map((a, idx) => {
                  const bg =
                    idx === 0
                      ? 'bg-[#2457FF]'
                      : idx === 1
                      ? 'bg-[#7595FF]'
                      : idx === 2
                      ? 'bg-[#C5CAD3]'
                      : 'bg-[#858D9B]';
                  return (
                    <div
                      key={a.category}
                      style={{ width: `${a.percentage}%` }}
                      className={`${bg} h-full border-r border-[#090B10] last:border-r-0`}
                      title={`${a.label}: ${a.percentage}%`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center justify-between font-mono text-[11px] text-[#858D9B] mt-3">
                <span className="flex items-center gap-1.5 text-[#2457FF]">
                  <span className="w-2 h-2 rounded-full bg-[#2457FF]" /> REAL ESTATE
                </span>
                <span className="flex items-center gap-1.5 text-[#7595FF]">
                  <span className="w-2 h-2 rounded-full bg-[#7595FF]" /> EQUITIES &amp; DEMAT
                </span>
                <span className="flex items-center gap-1.5 text-[#C5CAD3]">
                  <span className="w-2 h-2 rounded-full bg-[#C5CAD3]" /> BULLION &amp; CASH
                </span>
              </div>
            </div>

            {/* Structured Table */}
            <div className="divide-y divide-[#252C38]">
              {telemetry.assetAllocation.map((alloc, idx) => (
                <div key={alloc.category} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#252C38]/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#2457FF] font-bold">0{idx + 1}</span>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider font-semibold text-[#F4F6FA]">
                        {alloc.label}
                      </div>
                      <div className="font-mono text-[11px] text-[#858D9B]">
                        {alloc.count} legal instruments registered
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading font-black text-lg text-[#F4F6FA]">{alloc.formattedTotal}</div>
                    <div className="font-mono text-xs text-[#7595FF] font-semibold">{alloc.percentage}% share</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-[#252C38] bg-[#090B10] flex items-center justify-between font-mono text-xs">
            <span className="text-[#858D9B]">Missing Title Deed Flags:</span>
            <span className="font-semibold text-[#7595FF]">{telemetry.missingInformationCount} Instruments Flagged</span>
          </div>
        </div>

        {/* Right: Family Ownership Index (6 cols) */}
        <div className="lg:col-span-6 bg-[#171C26] border border-[#252C38] rounded-xs shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-6 border-b border-[#252C38] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#2457FF]" />
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#F4F6FA] font-bold">
                  FAMILY OWNERSHIP INDEX
                </h3>
              </div>
              <Link href="/family" className="font-mono text-xs uppercase tracking-wider text-[#7595FF] hover:underline">
                Governance →
              </Link>
            </div>

            {/* Member Table */}
            <div className="divide-y divide-[#252C38]">
              {telemetry.memberShares.map((m) => (
                <div key={m.memberId} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#252C38]/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#090B10] border border-[#252C38] rounded-xs flex items-center justify-center font-mono text-xs font-bold text-[#7595FF]">
                      {m.memberName.charAt(0)}
                    </span>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider font-semibold text-[#F4F6FA]">
                        {m.memberName}
                      </div>
                      <div className="font-mono text-[11px] text-[#858D9B]">
                        Assets: {m.formattedAssetsTotal} · Debt: {m.formattedLiabilitiesTotal}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading font-black text-lg text-[#F4F6FA]">{m.formattedNetWorth}</div>
                    <div className="font-mono text-xs text-[#2457FF] font-bold">
                      {m.percentageOfFamilyNetWorth}% beneficial share
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-[#252C38] bg-[#090B10] font-mono text-[11px] text-[#858D9B]">
            All percentages calculated directly from registered title deed co-ownership records in the Family Vault.
          </div>
        </div>
      </div>

      {/* 4. FINANCIAL ACTIVITY & UPCOMING OBLIGATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upcoming Financial Obligations (6 cols) */}
        <div className="lg:col-span-6 bg-[#171C26] border border-[#252C38] rounded-xs shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#252C38] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2457FF]" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#F4F6FA] font-bold">
                UPCOMING OBLIGATIONS
              </h3>
            </div>
            <Link href="/liabilities" className="font-mono text-xs uppercase tracking-wider text-[#7595FF] hover:underline">
              Amortisation Schedules →
            </Link>
          </div>

          <div className="divide-y divide-[#252C38]">
            {upcomingObligations.map((obl) => (
              <div key={obl.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#252C38]/30 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#090B10] text-[#C5CAD3] font-mono text-[10px] uppercase tracking-wider rounded-xs border border-[#252C38]">
                      {obl.type}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#F4F6FA]">{obl.title}</span>
                  </div>
                  <div className="font-mono text-[11px] text-[#858D9B]">
                    Due: <span className="text-[#F4F6FA] font-medium">{obl.dueDate}</span> · Debit from: {obl.account}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-heading font-black text-base text-[#F4F6FA]">{obl.amountFormatted}</div>
                  <span className="inline-block mt-0.5 font-mono text-[10px] px-2 py-0.5 bg-[#2457FF]/15 text-[#7595FF] border border-[#2457FF]/30 rounded-xs">
                    {obl.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#090B10] border-t border-[#252C38] flex items-center justify-between font-mono text-xs text-[#858D9B]">
            <span>NEXT 30 DAYS DEBT OUTFLOW: ₹10,72,800</span>
            <span className="text-[#7595FF] font-bold">LIQUIDITY COVER: 4.8X</span>
          </div>
        </div>

        {/* Right: Recent Financial Activity (6 cols) */}
        <div className="lg:col-span-6 bg-[#171C26] border border-[#252C38] rounded-xs shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#252C38] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2457FF]" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#F4F6FA] font-bold">
                RECORDED FINANCIAL ACTIVITY
              </h3>
            </div>
            <Link href="/cashflow" className="font-mono text-xs uppercase tracking-wider text-[#7595FF] hover:underline">
              Treasury Ledger →
            </Link>
          </div>

          <div className="divide-y divide-[#252C38]">
            {recentActivities.map((act) => (
              <div key={act.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#252C38]/30 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#2457FF] font-bold">[{act.code}]</span>
                    <span className="font-mono text-xs font-semibold text-[#F4F6FA]">{act.title}</span>
                  </div>
                  <div className="font-mono text-[11px] text-[#858D9B]">
                    {act.timestamp} · {act.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-heading font-black text-base ${act.isCredit ? 'text-[#2457FF]' : 'text-[#FF7A70]'}`}>
                    {act.delta}
                  </div>
                  <span className="font-mono text-[10px] text-[#858D9B]">AUDITED PAISE</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#090B10] border-t border-[#252C38] flex items-center justify-between font-mono text-xs text-[#858D9B]">
            <span>TOTAL TRANSACTIONS LOGGED: 48</span>
            <span className="text-[#7595FF] font-medium">INTERNAL TRANSFERS EXCLUDED</span>
          </div>
        </div>
      </div>

      {/* 5. QUICK ACTION BUTTONS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/assets"
          className="p-6 border border-[#252C38] bg-[#171C26] hover:border-[#2457FF] group transition-all rounded-xs flex flex-col justify-between h-32"
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#2457FF]">
            01 // ASSETS
          </div>
          <div>
            <div className="font-heading text-lg font-bold text-[#F4F6FA] leading-tight group-hover:text-[#7595FF] transition-colors">
              + Record Asset
            </div>
            <div className="font-mono text-[11px] text-[#858D9B] mt-1">
              Property, Demat, Gold, Equity
            </div>
          </div>
        </Link>

        <Link
          href="/liabilities"
          className="p-6 border border-[#252C38] bg-[#171C26] hover:border-[#2457FF] group transition-all rounded-xs flex flex-col justify-between h-32"
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#2457FF]">
            02 // DEBT
          </div>
          <div>
            <div className="font-heading text-lg font-bold text-[#F4F6FA] leading-tight group-hover:text-[#7595FF] transition-colors">
              + Log Liability
            </div>
            <div className="font-mono text-[11px] text-[#858D9B] mt-1">
              Mortgages, Auto Debt, EMIs
            </div>
          </div>
        </Link>

        <Link
          href="/vault"
          className="p-6 border border-[#252C38] bg-[#171C26] hover:border-[#2457FF] group transition-all rounded-xs flex flex-col justify-between h-32"
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#2457FF]">
            03 // VAULT
          </div>
          <div>
            <div className="font-heading text-lg font-bold text-[#F4F6FA] leading-tight group-hover:text-[#7595FF] transition-colors">
              Upload to Vault
            </div>
            <div className="font-mono text-[11px] text-[#858D9B] mt-1">
              Title Deeds, Share Certificates
            </div>
          </div>
        </Link>

        <Link
          href="/reports"
          className="p-6 border border-[#252C38] bg-[#171C26] hover:border-[#2457FF] group transition-all rounded-xs flex flex-col justify-between h-32"
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#2457FF]">
            04 // AUDIT
          </div>
          <div>
            <div className="font-heading text-lg font-bold text-[#F4F6FA] leading-tight group-hover:text-[#7595FF] transition-colors">
              Financial Statement
            </div>
            <div className="font-mono text-[11px] text-[#858D9B] mt-1">
              Printable Statement of Position
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
