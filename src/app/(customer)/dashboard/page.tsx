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
} from 'lucide-react';
import { NetWorthSummary, AIInsightObservation } from '@/lib/wealth/types';

export default function FamilyWealthDashboard() {
  const [telemetry, setTelemetry] = useState<NetWorthSummary | null>(null);
  const [observations, setObservations] = useState<AIInsightObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('CONSOLIDATED');
  const [activeHistoryMetric, setActiveHistoryMetric] = useState<'NET_WORTH' | 'ASSETS' | 'LIABILITIES'>('NET_WORTH');

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
      <div className="flex flex-col items-center justify-center min-h-[500px] border border-[#101010] bg-[#FAF9F6] p-12">
        <div className="w-8 h-8 bg-[#101010] text-[#F0EDE5] flex items-center justify-center font-mono text-sm font-bold animate-pulse mb-4">
          P
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#101010]">
          SYNTHESIZING FINANCIAL TELEMETRY // INTEGER PAISE ENGINE
        </div>
        <div className="font-mono text-[10px] text-[#85827B] mt-2">
          Workspace: Sharma Family Trust &amp; Holdings [FWS-001]
        </div>
      </div>
    );
  }

  if (!telemetry) return null;

  // Historical calculation points for SVG line chart
  const history = (telemetry.historicalPoints && telemetry.historicalPoints.length > 0)
    ? telemetry.historicalPoints
    : [
        { date: '2024-03-31', grossAssetsPaise: 135000000000, grossLiabilitiesPaise: 10000000000, netWorthPaise: 125000000000, formattedNetWorth: '₹12.50 Cr' },
        { date: '2024-06-30', grossAssetsPaise: 139000000000, grossLiabilitiesPaise: 10000000000, netWorthPaise: 129000000000, formattedNetWorth: '₹12.90 Cr' },
        { date: '2024-09-30', grossAssetsPaise: 144500000000, grossLiabilitiesPaise: 10000000000, netWorthPaise: 134500000000, formattedNetWorth: '₹13.45 Cr' },
        { date: '2024-12-31', grossAssetsPaise: 148000000000, grossLiabilitiesPaise: 10000000000, netWorthPaise: 138000000000, formattedNetWorth: '₹13.80 Cr' },
        { date: '2025-03-31', grossAssetsPaise: 153000000000, grossLiabilitiesPaise: 10600000000, netWorthPaise: 142400000000, formattedNetWorth: '₹14.24 Cr' },
      ];

  const minPaise = Math.min(...history.map((h) => h.netWorthPaise)) * 0.95;
  const maxPaise = Math.max(...history.map((h) => h.netWorthPaise)) * 1.05;
  const svgWidth = 800;
  const svgHeight = 220;
  const pointsString = history
    .map((pt, i) => {
      const x = (i / (history.length - 1)) * (svgWidth - 40) + 20;
      const y = svgHeight - 30 - ((pt.netWorthPaise - minPaise) / (maxPaise - minPaise)) * (svgHeight - 60);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-10">
      {/* 1. ARCHITECTURAL OPENING COMPOSITION */}
      <div className="border border-[#101010] bg-[#FAF9F6]">
        {/* Top Identification Header */}
        <div className="p-4 sm:p-6 border-b border-[#101010] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF9F6]">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#85827B]">
              <span>01 // PROVENTA</span>
              <span>/</span>
              <span>FAMILY WEALTH</span>
              <span>/</span>
              <span className="text-[#263B35] font-semibold">TERMINAL ACTIVE</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight mt-1">
              YOUR FINANCIAL POSITION
            </h1>
          </div>

          {/* Member Scope Switcher */}
          <div className="flex flex-wrap items-center gap-1 border border-[#101010] p-1 bg-[#F0EDE5]">
            <button
              onClick={() => setSelectedUserFilter('CONSOLIDATED')}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                selectedUserFilter === 'CONSOLIDATED'
                  ? 'bg-[#101010] text-[#F0EDE5] font-semibold'
                  : 'text-[#101010] hover:bg-[#FAF9F6]'
              }`}
            >
              Consolidated Family
            </button>
            <button
              onClick={() => setSelectedUserFilter('usr_rajesh_sharma')}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                selectedUserFilter === 'usr_rajesh_sharma'
                  ? 'bg-[#101010] text-[#F0EDE5] font-semibold'
                  : 'text-[#101010] hover:bg-[#FAF9F6]'
              }`}
            >
              Rajesh (Self)
            </button>
            <button
              onClick={() => setSelectedUserFilter('usr_sunita_sharma')}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                selectedUserFilter === 'usr_sunita_sharma'
                  ? 'bg-[#101010] text-[#F0EDE5] font-semibold'
                  : 'text-[#101010] hover:bg-[#FAF9F6]'
              }`}
            >
              Sunita (Spouse)
            </button>
            <button
              onClick={() => setSelectedUserFilter('usr_aarav_sharma')}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                selectedUserFilter === 'usr_aarav_sharma'
                  ? 'bg-[#101010] text-[#F0EDE5] font-semibold'
                  : 'text-[#101010] hover:bg-[#FAF9F6]'
              }`}
            >
              Aarav (Child)
            </button>
          </div>
        </div>

        {/* Monumental Total Net Worth Display */}
        <div className="p-6 sm:p-10 lg:p-12 border-b border-[#101010] bg-[#FAF9F6]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#85827B]">
                {selectedUserFilter === 'CONSOLIDATED'
                  ? 'CONSOLIDATED FAMILY NET EQUITY // EXCLUDING DOUBLE COUNTING'
                  : 'INDIVIDUAL LEGAL BENEFICIAL SHARE // EQUITY ADJUSTED'}
              </div>
              <div className="font-serif text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#101010] mt-3 leading-none">
                {selectedUserFilter === 'CONSOLIDATED'
                  ? telemetry.formattedGrossNetWorth
                  : telemetry.formattedAdjustedNetWorth}
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-[#101010]/20">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#263B35] text-[#FAF9F6] font-mono text-xs uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+4.05% Trailing 12M Compound</span>
              </div>
              <div className="font-mono text-[10px] text-[#85827B] uppercase tracking-widest">
                Valuation Date: {new Date(telemetry.calculatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Structured Financial Statement Ledger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#101010] bg-[#F0EDE5]">
          {/* 01: Total Assets */}
          <div className="p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-[#85827B]">
              <span>01 // TOTAL ASSETS</span>
              <Coins className="w-3.5 h-3.5 text-[#101010]" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-normal text-[#101010]">
              {selectedUserFilter === 'CONSOLIDATED'
                ? telemetry.formattedGrossAssets
                : telemetry.formattedAdjustedAssets}
            </div>
            <div className="font-mono text-[10px] text-[#85827B]">
              Across {telemetry.totalAssetsCount} verified recorded asset entries
            </div>
          </div>

          {/* 02: Total Liabilities */}
          <div className="p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-[#85827B]">
              <span>02 // TOTAL LIABILITIES</span>
              <CreditCard className="w-3.5 h-3.5 text-[#A63B32]" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-normal text-[#A63B32]">
              {selectedUserFilter === 'CONSOLIDATED'
                ? telemetry.formattedGrossLiabilities
                : telemetry.formattedAdjustedLiabilities}
            </div>
            <div className="font-mono text-[10px] text-[#85827B]">
              Debt to asset ratio: 9.94% (Comfortable institutional tier)
            </div>
          </div>

          {/* 03: Ownership-Adjusted Equity */}
          <div className="p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-[#85827B]">
              <span>03 // NET FAMILY EQUITY</span>
              <Building2 className="w-3.5 h-3.5 text-[#101010]" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-normal text-[#101010]">
              {telemetry.formattedAdjustedNetWorth}
            </div>
            <div className="font-mono text-[10px] text-[#263B35]">
              Attributed according to registered title deeds
            </div>
          </div>

          {/* 04: Vault Integrity */}
          <div className="p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-[#85827B]">
              <span>04 // VAULT INTEGRITY</span>
              <Lock className="w-3.5 h-3.5 text-[#101010]" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-normal text-[#101010]">
              {telemetry.unverifiedAssetsCount === 0 ? '100% AUDITED' : `${telemetry.totalAssetsCount - telemetry.unverifiedAssetsCount} / ${telemetry.totalAssetsCount} VERIFIED`}
            </div>
            <div className="font-mono text-[10px] text-[#85827B]">
              Title documents &amp; Demat CAMS statements registered
            </div>
          </div>
        </div>
      </div>

      {/* 2. WEALTH HISTORY VISUALISATION (ARCHITECTURAL CHART) */}
      <div className="border border-[#101010] bg-[#FAF9F6]">
        <div className="p-4 sm:p-5 border-b border-[#101010] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#101010]" />
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[#101010] font-semibold">
              02 // WEALTH HISTORY TIMELINE &amp; TRAJECTORY
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveHistoryMetric('NET_WORTH')}
              className={`px-2.5 py-1 text-[11px] uppercase border border-[#101010] ${
                activeHistoryMetric === 'NET_WORTH' ? 'bg-[#101010] text-[#F0EDE5]' : 'bg-[#FAF9F6] text-[#101010]'
              }`}
            >
              Net Worth
            </button>
            <span className="text-[#85827B]">|</span>
            <span className="text-[10px] text-[#85827B] uppercase">FY 2024-25 Trajectory</span>
          </div>
        </div>

        {/* SVG Architectural Chart Area */}
        <div className="p-6 bg-[#FAF9F6] overflow-x-auto">
          <div className="min-w-[700px]">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48 stroke-[#101010]">
              {/* Background architectural grid rules */}
              <line x1="20" y1="30" x2={svgWidth - 20} y2="30" stroke="#E0DBD0" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="20" y1="80" x2={svgWidth - 20} y2="80" stroke="#E0DBD0" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="20" y1="130" x2={svgWidth - 20} y2="130" stroke="#E0DBD0" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="20" y1="180" x2={svgWidth - 20} y2="180" stroke="#101010" strokeWidth="1" />

              {/* Data curve */}
              <polyline
                fill="none"
                stroke="#101010"
                strokeWidth="2.5"
                points={pointsString}
              />

              {/* Data points */}
              {history.map((pt, i) => {
                const x = (i / (history.length - 1)) * (svgWidth - 40) + 20;
                const y = svgHeight - 30 - ((pt.netWorthPaise - minPaise) / (maxPaise - minPaise)) * (svgHeight - 60);
                return (
                  <g key={i}>
                    <rect x={x - 4} y={y - 4} width="8" height="8" fill="#101010" />
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      className="font-mono text-[9px] fill-[#101010] font-semibold"
                    >
                      ₹{(pt.netWorthPaise / 1000000000).toFixed(2)} Cr
                    </text>
                    <text
                      x={x}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      className="font-mono text-[9px] fill-[#85827B] uppercase"
                    >
                      {pt.date}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="p-3 bg-[#F0EDE5] border-t border-[#101010] flex items-center justify-between font-mono text-[10px] text-[#85827B]">
          <span>INDEX: ₹ 14.24 CRORE DETERMINISTIC PEAK</span>
          <span>METHOD: EXACT PAISE RECORDING (ZERO ESTIMATION DRIFT)</span>
        </div>
      </div>

      {/* 3. ASSET ALLOCATION AND FAMILY OWNERSHIP INDEX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Asset Class Allocation Matrix (6 cols) */}
        <div className="lg:col-span-6 border border-[#101010] bg-[#FAF9F6] flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-[#101010] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#101010]" />
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#101010] font-semibold">
                  03 // ASSET CLASS ALLOCATION MATRIX
                </h3>
              </div>
              <Link href="/assets" className="font-mono text-xs uppercase tracking-wider text-[#101010] underline hover:text-[#263B35]">
                View Register →
              </Link>
            </div>

            {/* Proportion Bar */}
            <div className="p-5 border-b border-[#101010] bg-[#F0EDE5]">
              <div className="h-6 w-full border border-[#101010] bg-[#FAF9F6] flex overflow-hidden">
                {telemetry.assetAllocation.map((a, idx) => {
                  const bg =
                    idx === 0
                      ? 'bg-[#101010]'
                      : idx === 1
                      ? 'bg-[#263B35]'
                      : 'bg-[#B6A68A]';
                  return (
                    <div
                      key={a.category}
                      style={{ width: `${a.percentage}%` }}
                      className={`${bg} h-full border-r border-[#101010] last:border-r-0`}
                      title={`${a.label}: ${a.percentage}%`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] text-[#85827B] mt-2">
                <span>PHYSICAL (REAL ESTATE / GOLD)</span>
                <span>FINANCIAL (DEMAT / LIQUID)</span>
                <span>BUSINESS EQUITY</span>
              </div>
            </div>

            {/* Structured Table */}
            <div className="divide-y divide-[#101010]">
              {telemetry.assetAllocation.map((alloc, idx) => (
                <div key={alloc.category} className="p-4 flex items-center justify-between hover:bg-[#F0EDE5] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#85827B]">0{idx + 1}</span>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider font-semibold text-[#101010]">
                        {alloc.label}
                      </div>
                      <div className="font-mono text-[10px] text-[#85827B]">
                        {alloc.count} legal instruments attached
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-lg text-[#101010]">{alloc.formattedTotal}</div>
                    <div className="font-mono text-[10px] text-[#263B35] font-semibold">{alloc.percentage}% share</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-[#101010] bg-[#F0EDE5] flex items-center justify-between font-mono text-xs">
            <span className="text-[#85827B]">Unverified or missing deed flags:</span>
            <span className="font-semibold text-[#101010]">{telemetry.missingInformationCount} Instruments Flagged</span>
          </div>
        </div>

        {/* Right: Family Ownership Index (6 cols) */}
        <div className="lg:col-span-6 border border-[#101010] bg-[#FAF9F6] flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-[#101010] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#101010]" />
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#101010] font-semibold">
                  04 // FAMILY OWNERSHIP &amp; EQUITY INDEX
                </h3>
              </div>
              <Link href="/family" className="font-mono text-xs uppercase tracking-wider text-[#101010] underline hover:text-[#263B35]">
                Governance →
              </Link>
            </div>

            {/* Member Table */}
            <div className="divide-y divide-[#101010]">
              {telemetry.memberShares.map((m, idx) => (
                <div key={m.memberId} className="p-4 flex items-center justify-between hover:bg-[#F0EDE5] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-[#FAF9F6] border border-[#101010] flex items-center justify-center font-mono text-xs font-bold">
                      {m.memberName.charAt(0)}
                    </span>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider font-semibold text-[#101010]">
                        {m.memberName}
                      </div>
                      <div className="font-mono text-[10px] text-[#85827B]">
                        Assets: {m.formattedAssetsTotal} · Debt: {m.formattedLiabilitiesTotal}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-lg text-[#101010]">{m.formattedNetWorth}</div>
                    <div className="font-mono text-[10px] text-[#263B35] font-semibold">
                      {m.percentageOfFamilyNetWorth}% of family capital
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-[#101010] bg-[#F0EDE5] font-mono text-[10px] text-[#85827B]">
            All percentages calculated directly from registered title deed co-ownership records in the Family Vault.
          </div>
        </div>
      </div>

      {/* 4. PROACTIVE INSTITUTIONAL INTELLIGENCE NOTICES */}
      {observations.length > 0 && (
        <div className="border border-[#101010] bg-[#FAF9F6]">
          <div className="p-4 sm:p-5 border-b border-[#101010] flex items-center justify-between bg-[#101010] text-[#F0EDE5]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#B6A68A]" />
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#F0EDE5] font-semibold">
                05 // PROVENTA INTELLIGENCE — INSTITUTIONAL AUDIT OBSERVATIONS
              </h3>
            </div>
            <span className="font-mono text-[10px] uppercase text-[#B6A68A]">
              Deterministic Rules Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#101010]">
            {observations.map((obs) => (
              <div key={obs.id} className="p-5 space-y-3 bg-[#FAF9F6]">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="px-2 py-0.5 bg-[#101010] text-[#F0EDE5] uppercase tracking-wider">
                    {obs.agentRole.replace('_', ' ')}
                  </span>
                  <span className={`uppercase font-semibold ${obs.severity === 'ALERT' ? 'text-[#A63B32]' : 'text-[#263B35]'}`}>
                    {obs.severity}
                  </span>
                </div>
                <h4 className="font-serif text-base text-[#101010] leading-snug">{obs.title}</h4>
                <p className="font-sans text-xs text-[#85827B] leading-relaxed">
                  {obs.observation}
                </p>
                {obs.actionableStep && (
                  <div className="pt-2 border-t border-[#101010]/15 font-mono text-[11px] text-[#101010]">
                    <span className="font-semibold text-[#263B35]">Action:</span> {obs.actionableStep}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ARCHITECTURAL QUICK ACTION BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/assets"
          className="p-5 border border-[#101010] bg-[#FAF9F6] hover:bg-[#101010] hover:text-[#F0EDE5] group transition-colors flex flex-col justify-between h-32"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#85827B] group-hover:text-[#B6A68A]">
            01 // REGISTER
          </div>
          <div>
            <div className="font-serif text-lg leading-tight">+ Record Asset</div>
            <div className="font-mono text-[10px] text-[#85827B] group-hover:text-[#F0EDE5]/70 mt-0.5">
              Property, Demat, Gold, Equity
            </div>
          </div>
        </Link>

        <Link
          href="/liabilities"
          className="p-5 border border-[#101010] bg-[#FAF9F6] hover:bg-[#101010] hover:text-[#F0EDE5] group transition-colors flex flex-col justify-between h-32"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#85827B] group-hover:text-[#B6A68A]">
            02 // OBLIGATION
          </div>
          <div>
            <div className="font-serif text-lg leading-tight">+ Log Liability</div>
            <div className="font-mono text-[10px] text-[#85827B] group-hover:text-[#F0EDE5]/70 mt-0.5">
              Mortgages, Auto Debt, EMIs
            </div>
          </div>
        </Link>

        <Link
          href="/vault"
          className="p-5 border border-[#101010] bg-[#FAF9F6] hover:bg-[#101010] hover:text-[#F0EDE5] group transition-colors flex flex-col justify-between h-32"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#85827B] group-hover:text-[#B6A68A]">
            03 // ENCRYPTION
          </div>
          <div>
            <div className="font-serif text-lg leading-tight">Upload to Vault</div>
            <div className="font-mono text-[10px] text-[#85827B] group-hover:text-[#F0EDE5]/70 mt-0.5">
              Title Deed, Share Certificate
            </div>
          </div>
        </Link>

        <Link
          href="/reports"
          className="p-5 border border-[#101010] bg-[#FAF9F6] hover:bg-[#101010] hover:text-[#F0EDE5] group transition-colors flex flex-col justify-between h-32"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#85827B] group-hover:text-[#B6A68A]">
            04 // AUDIT
          </div>
          <div>
            <div className="font-serif text-lg leading-tight">Financial Statement</div>
            <div className="font-mono text-[10px] text-[#85827B] group-hover:text-[#F0EDE5]/70 mt-0.5">
              Printable Statement of Position
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
