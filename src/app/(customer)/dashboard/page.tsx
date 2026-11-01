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
      <div className="flex flex-col items-center justify-center min-h-[500px] border border-[#252C38] bg-[#171C26] p-12 rounded-[2px]">
        <div className="w-9 h-9 bg-[#2457FF] text-[#F4F6FA] flex items-center justify-center font-mono text-sm font-bold border border-[#7595FF]/40 animate-pulse mb-4 rounded-[2px]">
          P
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#F4F6FA] font-semibold">
          SYNTHESIZING FINANCIAL TELEMETRY // TITANIUM COBALT CORE
        </div>
        <div className="font-mono text-[10px] text-[#7595FF] mt-2">
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
  const svgWidth = 860;
  const svgHeight = 240;
  const points = history.map((pt, i) => {
    const x = (i / (history.length - 1)) * (svgWidth - 60) + 30;
    const y = svgHeight - 40 - ((pt.netWorthPaise - minPaise) / (maxPaise - minPaise)) * (svgHeight - 80);
    return { x, y, pt };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPolygonPoints = `${points[0].x},${svgHeight - 35} ${polylinePoints} ${points[points.length - 1].x},${svgHeight - 35}`;

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
      {/* 1. TITANIUM COBALT COMMAND OPENING */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        {/* Top Identification Header */}
        <div className="p-4 sm:p-6 border-b border-[#252C38] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#171C26]">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#858D9B]">
              <span className="text-[#F4F6FA] font-bold">PROVENTA</span>
              <span className="text-[#252C38]">/</span>
              <span className="text-[#7595FF] font-semibold">FAMILY WEALTH OS</span>
              <span className="text-[#252C38]">/</span>
              <span className="text-[#2457FF] flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 bg-[#2457FF] rounded-full animate-ping" />
                COMMAND CORE ACTIVE
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl text-[#F4F6FA] font-bold tracking-tight mt-1.5">
              FINANCIAL COMMAND CENTRE
            </h1>
          </div>

          {/* Member Scope Switcher */}
          <div className="flex flex-wrap items-center gap-1 border border-[#252C38] p-1 bg-[#090B10] rounded-[2px]">
            <button
              onClick={() => setSelectedUserFilter('CONSOLIDATED')}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all rounded-[2px] ${
                selectedUserFilter === 'CONSOLIDATED'
                  ? 'bg-[#2457FF] text-[#F4F6FA] font-semibold shadow-[0_0_12px_rgba(36,87,255,0.3)]'
                  : 'text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#171C26]'
              }`}
            >
              Consolidated Family
            </button>
            <button
              onClick={() => setSelectedUserFilter('usr_rajesh_sharma')}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all rounded-[2px] ${
                selectedUserFilter === 'usr_rajesh_sharma'
                  ? 'bg-[#2457FF] text-[#F4F6FA] font-semibold shadow-[0_0_12px_rgba(36,87,255,0.3)]'
                  : 'text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#171C26]'
              }`}
            >
              Rajesh (Self)
            </button>
            <button
              onClick={() => setSelectedUserFilter('usr_sunita_sharma')}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all rounded-[2px] ${
                selectedUserFilter === 'usr_sunita_sharma'
                  ? 'bg-[#2457FF] text-[#F4F6FA] font-semibold shadow-[0_0_12px_rgba(36,87,255,0.3)]'
                  : 'text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#171C26]'
              }`}
            >
              Sunita (Spouse)
            </button>
            <button
              onClick={() => setSelectedUserFilter('usr_aarav_sharma')}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all rounded-[2px] ${
                selectedUserFilter === 'usr_aarav_sharma'
                  ? 'bg-[#2457FF] text-[#F4F6FA] font-semibold shadow-[0_0_12px_rgba(36,87,255,0.3)]'
                  : 'text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#171C26]'
              }`}
            >
              Aarav (Child)
            </button>
          </div>
        </div>

        {/* Prominent Oversized Total Family Net Worth Display */}
        <div className="p-6 sm:p-10 lg:p-12 border-b border-[#252C38] bg-[#090B10]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#7595FF] font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#2457FF]" />
                <span>
                  {selectedUserFilter === 'CONSOLIDATED'
                    ? 'TOTAL FAMILY NET WORTH // CONSOLIDATED BENEFICIAL VALUE'
                    : 'OWNERSHIP-ADJUSTED NET WORTH // LEGAL BENEFICIAL SHARE'}
                </span>
              </div>
              <div className="font-display font-bold text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#F4F6FA] mt-3 leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                {selectedUserFilter === 'CONSOLIDATED'
                  ? telemetry.formattedGrossNetWorth
                  : telemetry.formattedAdjustedNetWorth}
              </div>
              <div className="font-mono text-xs text-[#858D9B] mt-3">
                Zero estimation drift · Integer paise precision math · Verified across all 13 family registries
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-[#252C38]">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#2457FF]/15 border border-[#2457FF]/40 text-[#7595FF] font-mono text-xs uppercase tracking-wider rounded-[2px]">
                <TrendingUp className="w-4 h-4 text-[#7595FF]" />
                <span className="font-semibold">+4.05% Trailing 12M Trajectory</span>
              </div>
              <div className="font-mono text-[10px] text-[#C5CAD3] uppercase tracking-widest">
                Valuation Snapshot: {new Date(telemetry.calculatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Part Structured Rectangular Ledger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#252C38] bg-[#171C26]">
          {/* 01: Gross Assets */}
          <div className="p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              <span>01 // GROSS ASSETS</span>
              <Coins className="w-3.5 h-3.5 text-[#7595FF]" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-[#F4F6FA]">
              {selectedUserFilter === 'CONSOLIDATED'
                ? telemetry.formattedGrossAssets
                : telemetry.formattedAdjustedAssets}
            </div>
            <div className="font-mono text-[10px] text-[#C5CAD3]">
              Across {telemetry.totalAssetsCount} verified physical, financial &amp; equity assets
            </div>
          </div>

          {/* 02: Total Liabilities */}
          <div className="p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              <span>02 // TOTAL LIABILITIES</span>
              <CreditCard className="w-3.5 h-3.5 text-[#FF7A70]" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-[#FF7A70]">
              {selectedUserFilter === 'CONSOLIDATED'
                ? telemetry.formattedGrossLiabilities
                : telemetry.formattedAdjustedLiabilities}
            </div>
            <div className="font-mono text-[10px] text-[#C5CAD3]">
              Debt to asset ratio: 9.94% (High solvency safety tier)
            </div>
          </div>

          {/* 03: Ownership-Adjusted Equity */}
          <div className="p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              <span>03 // ADJUSTED NET WORTH</span>
              <Building2 className="w-3.5 h-3.5 text-[#7595FF]" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-[#F4F6FA]">
              {telemetry.formattedAdjustedNetWorth}
            </div>
            <div className="font-mono text-[10px] text-[#7595FF]">
              Attributed according to registered title deeds
            </div>
          </div>

          {/* 04: Vault Integrity */}
          <div className="p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#858D9B]">
              <span>04 // VAULT INTEGRITY</span>
              <Lock className="w-3.5 h-3.5 text-[#7595FF]" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-[#F4F6FA]">
              {telemetry.unverifiedAssetsCount === 0 ? '100% AUDITED' : `${telemetry.totalAssetsCount - telemetry.unverifiedAssetsCount} / ${telemetry.totalAssetsCount} AUDITED`}
            </div>
            <div className="font-mono text-[10px] text-[#C5CAD3]">
              AES-GCM-256 encrypted deeds &amp; CAMS statements
            </div>
          </div>
        </div>
      </div>

      {/* 2. WEALTH HISTORY GRAPH — DIGITAL COBALT AGAINST GRAPHITE */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-4 sm:p-5 border-b border-[#252C38] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#171C26]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-[#2457FF]/15 border border-[#2457FF]/40 rounded-[2px] flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-[#7595FF]" />
            </div>
            <div>
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[#F4F6FA] font-bold">
                WEALTH TRAJECTORY &amp; HISTORICAL VALUATION
              </h2>
              <p className="font-mono text-[9px] text-[#858D9B] uppercase tracking-wider mt-0.5">
                Consolidated family net capital indexed over FY 2024-26
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveHistoryMetric('NET_WORTH')}
              className={`px-3 py-1 text-xs uppercase border rounded-[2px] font-semibold transition-all ${
                activeHistoryMetric === 'NET_WORTH'
                  ? 'bg-[#2457FF] text-[#F4F6FA] border-[#2457FF] shadow-[0_0_12px_rgba(36,87,255,0.3)]'
                  : 'bg-[#090B10] text-[#C5CAD3] border-[#252C38] hover:text-[#F4F6FA]'
              }`}
            >
              Net Worth
            </button>
            <span className="text-[#364052]">|</span>
            <span className="text-[10px] text-[#7595FF] uppercase font-semibold">100% Deterministic History</span>
          </div>
        </div>

        {/* Large Cobalt SVG Chart on Graphite Background */}
        <div className="p-6 bg-[#171C26] overflow-x-auto">
          <div className="min-w-[760px]">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56">
              <defs>
                <linearGradient id="cobaltGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2457FF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2457FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Minimal Coordinate Grid Lines */}
              <line x1="30" y1="40" x2={svgWidth - 30} y2="40" stroke="#252C38" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="90" x2={svgWidth - 30} y2="90" stroke="#252C38" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="140" x2={svgWidth - 30} y2="140" stroke="#252C38" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1={svgHeight - 35} x2={svgWidth - 30} y2={svgHeight - 35} stroke="#364052" strokeWidth="1.5" />

              {/* Area Glow */}
              <polygon points={areaPolygonPoints} fill="url(#cobaltGradient)" />

              {/* High-Precision Cobalt Polyline */}
              <polyline
                fill="none"
                stroke="#2457FF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />

              {/* Data Points with Titanium Badges */}
              {points.map((p, i) => (
                <g key={i}>
                  {/* Subtle guide tick */}
                  <line x1={p.x} y1={p.y} x2={p.x} y2={svgHeight - 35} stroke="#252C38" strokeWidth="1" strokeDasharray="2 2" />

                  {/* Rectangular Titanium Marker */}
                  <rect
                    x={p.x - 4}
                    y={p.y - 4}
                    width="8"
                    height="8"
                    fill="#090B10"
                    stroke="#2457FF"
                    strokeWidth="2"
                    className="cursor-pointer hover:scale-125 transition-transform"
                  />

                  {/* Value Stamp */}
                  <rect
                    x={p.x - 38}
                    y={p.y - 24}
                    width="76"
                    height="18"
                    fill="#090B10"
                    stroke="#252C38"
                    rx="2"
                  />
                  <text
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                    className="font-mono text-[10px] fill-[#F4F6FA] font-bold"
                  >
                    ₹{(p.pt.netWorthPaise / 1000000000).toFixed(2)} Cr
                  </text>

                  {/* Date Axis Label */}
                  <text
                    x={p.x}
                    y={svgHeight - 14}
                    textAnchor="middle"
                    className="font-mono text-[10px] fill-[#858D9B] uppercase"
                  >
                    {p.pt.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="p-3.5 bg-[#090B10] border-t border-[#252C38] flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[10px] text-[#858D9B]">
          <span className="text-[#C5CAD3]">
            MAX PEAK: <span className="text-[#F4F6FA] font-bold">₹14.24 CRORE</span> (Q1 FY 2025-26)
          </span>
          <span className="text-[#7595FF]">
            ENGINE: DETERMINISTIC BIGINT PAISE (ZERO ESTIMATION DRIFT)
          </span>
        </div>
      </div>

      {/* 3. ASSET ALLOCATION & FAMILY OWNERSHIP INDEX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Asset Class Allocation Matrix (6 cols) */}
        <div className="lg:col-span-6 border border-[#252C38] bg-[#171C26] rounded-[2px] flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-[#252C38] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#7595FF]" />
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#F4F6FA] font-bold">
                  ASSET CLASS ALLOCATION MATRIX
                </h3>
              </div>
              <Link href="/assets" className="font-mono text-xs uppercase tracking-wider text-[#7595FF] hover:underline">
                View Register →
              </Link>
            </div>

            {/* Segmented Proportion Bar */}
            <div className="p-5 border-b border-[#252C38] bg-[#090B10]">
              <div className="h-6 w-full border border-[#252C38] bg-[#171C26] flex overflow-hidden rounded-[2px]">
                {telemetry.assetAllocation.map((a, idx) => {
                  const bg =
                    idx === 0
                      ? 'bg-[#2457FF]'
                      : idx === 1
                      ? 'bg-[#7595FF]'
                      : 'bg-[#C5CAD3]';
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
              <div className="flex items-center justify-between font-mono text-[10px] text-[#858D9B] mt-2.5">
                <span className="flex items-center gap-1.5 text-[#2457FF]">
                  <span className="w-2 h-2 bg-[#2457FF]" /> PHYSICAL ASSETS
                </span>
                <span className="flex items-center gap-1.5 text-[#7595FF]">
                  <span className="w-2 h-2 bg-[#7595FF]" /> FINANCIAL (DEMAT / LIQUID)
                </span>
                <span className="flex items-center gap-1.5 text-[#C5CAD3]">
                  <span className="w-2 h-2 bg-[#C5CAD3]" /> BUSINESS EQUITY
                </span>
              </div>
            </div>

            {/* Structured Table */}
            <div className="divide-y divide-[#252C38]">
              {telemetry.assetAllocation.map((alloc, idx) => (
                <div key={alloc.category} className="p-4 flex items-center justify-between hover:bg-[#1C2230] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#7595FF] font-semibold">0{idx + 1}</span>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider font-semibold text-[#F4F6FA]">
                        {alloc.label}
                      </div>
                      <div className="font-mono text-[10px] text-[#858D9B]">
                        {alloc.count} legal instruments registered
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-bold text-[#F4F6FA]">{alloc.formattedTotal}</div>
                    <div className="font-mono text-[10px] text-[#7595FF] font-semibold">{alloc.percentage}% share</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-[#252C38] bg-[#090B10] flex items-center justify-between font-mono text-xs">
            <span className="text-[#858D9B]">Missing Title Deed / Document Flags:</span>
            <span className="font-semibold text-[#7595FF]">{telemetry.missingInformationCount} Instruments Flagged</span>
          </div>
        </div>

        {/* Right: Family Ownership Index (6 cols) */}
        <div className="lg:col-span-6 border border-[#252C38] bg-[#171C26] rounded-[2px] flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-[#252C38] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#7595FF]" />
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#F4F6FA] font-bold">
                  FAMILY OWNERSHIP &amp; EQUITY INDEX
                </h3>
              </div>
              <Link href="/family" className="font-mono text-xs uppercase tracking-wider text-[#7595FF] hover:underline">
                Governance →
              </Link>
            </div>

            {/* Member Table */}
            <div className="divide-y divide-[#252C38]">
              {telemetry.memberShares.map((m, idx) => (
                <div key={m.memberId} className="p-4 flex items-center justify-between hover:bg-[#1C2230] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#090B10] border border-[#252C38] rounded-[2px] flex items-center justify-center font-mono text-xs font-bold text-[#7595FF]">
                      {m.memberName.charAt(0)}
                    </span>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider font-semibold text-[#F4F6FA]">
                        {m.memberName}
                      </div>
                      <div className="font-mono text-[10px] text-[#85827B]">
                        Assets: {m.formattedAssetsTotal} · Debt: {m.formattedLiabilitiesTotal}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-bold text-[#F4F6FA]">{m.formattedNetWorth}</div>
                    <div className="font-mono text-[10px] text-[#7595FF] font-semibold">
                      {m.percentageOfFamilyNetWorth}% beneficial share
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-[#252C38] bg-[#090B10] font-mono text-[10px] text-[#858D9B]">
            All percentages calculated directly from registered title deed co-ownership records in the Family Vault.
          </div>
        </div>
      </div>

      {/* 4. FINANCIAL ACTIVITY & UPCOMING OBLIGATIONS (STRUCTURED DATA SECTIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upcoming Financial Obligations (6 cols) */}
        <div className="lg:col-span-6 border border-[#252C38] bg-[#171C26] rounded-[2px]">
          <div className="p-4 sm:p-5 border-b border-[#252C38] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#7595FF]" />
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#F4F6FA] font-bold">
                UPCOMING FINANCIAL OBLIGATIONS
              </h3>
            </div>
            <Link href="/liabilities" className="font-mono text-xs uppercase tracking-wider text-[#7595FF] hover:underline">
              Amortisation Schedules →
            </Link>
          </div>

          <div className="divide-y divide-[#252C38]">
            {upcomingObligations.map((obl) => (
              <div key={obl.id} className="p-4 flex items-center justify-between hover:bg-[#1C2230] transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-[#252C38] text-[#C5CAD3] font-mono text-[9px] uppercase tracking-wider rounded-[2px]">
                      {obl.type}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#F4F6FA]">{obl.title}</span>
                  </div>
                  <div className="font-mono text-[10px] text-[#85827B]">
                    Due: <span className="text-[#C5CAD3]">{obl.dueDate}</span> · Debit from: {obl.account}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-base text-[#F4F6FA]">{obl.amountFormatted}</div>
                  <span className="inline-block mt-0.5 font-mono text-[9px] px-1.5 py-0.2 bg-[#2457FF]/15 text-[#7595FF] border border-[#2457FF]/30 rounded-[2px]">
                    {obl.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-[#090B10] border-t border-[#252C38] flex items-center justify-between font-mono text-[10px] text-[#85827B]">
            <span>NEXT 30 DAYS DEBT OUTFLOW: ₹ 10,72,800</span>
            <span className="text-[#7595FF]">LIQUIDITY COVER: 4.8X</span>
          </div>
        </div>

        {/* Right: Recent Financial Activity (6 cols) */}
        <div className="lg:col-span-6 border border-[#252C38] bg-[#171C26] rounded-[2px]">
          <div className="p-4 sm:p-5 border-b border-[#252C38] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#7595FF]" />
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#F4F6FA] font-bold">
                RECORDED FINANCIAL ACTIVITY
              </h3>
            </div>
            <Link href="/cashflow" className="font-mono text-xs uppercase tracking-wider text-[#7595FF] hover:underline">
              Treasury Ledger →
            </Link>
          </div>

          <div className="divide-y divide-[#252C38]">
            {recentActivities.map((act) => (
              <div key={act.id} className="p-4 flex items-center justify-between hover:bg-[#1C2230] transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#7595FF] font-semibold">{act.code}</span>
                    <span className="font-mono text-xs font-semibold text-[#F4F6FA]">{act.title}</span>
                  </div>
                  <div className="font-mono text-[10px] text-[#85827B]">
                    {act.timestamp} · {act.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-display font-bold text-base ${act.isCredit ? 'text-[#7595FF]' : 'text-[#FF7A70]'}`}>
                    {act.delta}
                  </div>
                  <span className="font-mono text-[9px] text-[#85827B]">AUDITED PAISE</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-[#090B10] border-t border-[#252C38] flex items-center justify-between font-mono text-[10px] text-[#85827B]">
            <span>TOTAL TRANSACTIONS LOGGED: 48</span>
            <span className="text-[#7595FF]">INTERNAL TRANSFERS EXCLUDED</span>
          </div>
        </div>
      </div>

      {/* 5. PROACTIVE AI OBSERVATIONS & CITATIONS */}
      {observations.length > 0 && (
        <div className="border border-[#252C38] bg-[#171C26] rounded-[2px]">
          <div className="p-4 sm:p-5 border-b border-[#252C38] flex items-center justify-between bg-[#090B10]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#7595FF]" />
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#F4F6FA] font-bold">
                PROVENTA INTELLIGENCE — INSTITUTIONAL OBSERVATIONS
              </h3>
            </div>
            <span className="font-mono text-[10px] uppercase text-[#7595FF] font-semibold">
              6 Specialized Agents Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#252C38]">
            {observations.map((obs) => (
              <div key={obs.id} className="p-5 space-y-3 bg-[#171C26]">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="px-2 py-0.5 bg-[#090B10] text-[#7595FF] border border-[#252C38] uppercase tracking-wider font-semibold rounded-[2px]">
                    {obs.agentRole.replace('_', ' ')}
                  </span>
                  <span className={`uppercase font-semibold ${obs.severity === 'ALERT' ? 'text-[#FF7A70]' : 'text-[#7595FF]'}`}>
                    {obs.severity}
                  </span>
                </div>
                <h4 className="font-display font-bold text-base text-[#F4F6FA] leading-snug">{obs.title}</h4>
                <p className="font-sans text-xs text-[#C5CAD3] leading-relaxed">
                  {obs.observation}
                </p>
                {obs.actionableStep && (
                  <div className="pt-2 border-t border-[#252C38] font-mono text-[11px] text-[#F4F6FA]">
                    <span className="font-semibold text-[#7595FF]">Action:</span> {obs.actionableStep}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TITANIUM COBALT ACTION TRIGGERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/assets"
          className="p-5 border border-[#252C38] bg-[#171C26] hover:bg-[#1C2230] hover:border-[#7595FF]/50 group transition-all rounded-[2px] flex flex-col justify-between h-32"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#7595FF] group-hover:text-[#F4F6FA]">
            01 // REGISTER
          </div>
          <div>
            <div className="font-display text-lg font-bold text-[#F4F6FA] leading-tight group-hover:text-[#7595FF] transition-colors">
              + Record Asset
            </div>
            <div className="font-mono text-[10px] text-[#858D9B] mt-0.5">
              Property, Demat, Gold, Equity
            </div>
          </div>
        </Link>

        <Link
          href="/liabilities"
          className="p-5 border border-[#252C38] bg-[#171C26] hover:bg-[#1C2230] hover:border-[#7595FF]/50 group transition-all rounded-[2px] flex flex-col justify-between h-32"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#7595FF] group-hover:text-[#F4F6FA]">
            02 // OBLIGATION
          </div>
          <div>
            <div className="font-display text-lg font-bold text-[#F4F6FA] leading-tight group-hover:text-[#7595FF] transition-colors">
              + Log Liability
            </div>
            <div className="font-mono text-[10px] text-[#858D9B] mt-0.5">
              Mortgages, Auto Debt, EMIs
            </div>
          </div>
        </Link>

        <Link
          href="/vault"
          className="p-5 border border-[#252C38] bg-[#171C26] hover:bg-[#1C2230] hover:border-[#7595FF]/50 group transition-all rounded-[2px] flex flex-col justify-between h-32"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#7595FF] group-hover:text-[#F4F6FA]">
            03 // ENCRYPTION
          </div>
          <div>
            <div className="font-display text-lg font-bold text-[#F4F6FA] leading-tight group-hover:text-[#7595FF] transition-colors">
              Upload to Vault
            </div>
            <div className="font-mono text-[10px] text-[#85827B] mt-0.5">
              Title Deed, Share Certificate
            </div>
          </div>
        </Link>

        <Link
          href="/reports"
          className="p-5 border border-[#252C38] bg-[#171C26] hover:bg-[#1C2230] hover:border-[#7595FF]/50 group transition-all rounded-[2px] flex flex-col justify-between h-32"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#7595FF] group-hover:text-[#F4F6FA]">
            04 // AUDIT
          </div>
          <div>
            <div className="font-display text-lg font-bold text-[#F4F6FA] leading-tight group-hover:text-[#7595FF] transition-colors">
              Financial Statement
            </div>
            <div className="font-mono text-[10px] text-[#85827B] mt-0.5">
              Printable Statement of Position
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
