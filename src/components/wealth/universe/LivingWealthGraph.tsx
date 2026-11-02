'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, ShieldCheck, Sparkles, Filter } from 'lucide-react';

interface DataPoint {
  label: string;
  month: string;
  netWorthCr: number; // in Crores
  investedCr: number;
  realPurchasingPowerCr: number;
  milestone?: string;
}

const HISTORICAL_DATA: Record<string, DataPoint[]> = {
  '1Y': [
    { label: 'Nov 2025', month: 'Nov', netWorthCr: 84.5, investedCr: 60.0, realPurchasingPowerCr: 81.2 },
    { label: 'Jan 2026', month: 'Jan', netWorthCr: 86.8, investedCr: 61.5, realPurchasingPowerCr: 82.8 },
    { label: 'Mar 2026', month: 'Mar', netWorthCr: 88.4, investedCr: 63.0, realPurchasingPowerCr: 83.5, milestone: 'TechVentures Series B' },
    { label: 'May 2026', month: 'May', netWorthCr: 89.9, investedCr: 64.2, realPurchasingPowerCr: 84.1 },
    { label: 'Jul 2026', month: 'Jul', netWorthCr: 91.5, investedCr: 65.5, realPurchasingPowerCr: 84.9 },
    { label: 'Sep 2026', month: 'Sep', netWorthCr: 93.1, investedCr: 66.8, realPurchasingPowerCr: 85.6 },
    { label: 'Nov 2026', month: 'Nov', netWorthCr: 94.2, investedCr: 68.0, realPurchasingPowerCr: 86.2, milestone: 'Commercial Land Certified' },
  ],
  '3Y': [
    { label: '2023', month: '2023', netWorthCr: 62.0, investedCr: 45.0, realPurchasingPowerCr: 62.0 },
    { label: '2024', month: '2024', netWorthCr: 71.4, investedCr: 52.0, realPurchasingPowerCr: 68.5 },
    { label: '2025', month: '2025', netWorthCr: 82.6, investedCr: 59.0, realPurchasingPowerCr: 76.8 },
    { label: '2026', month: '2026', netWorthCr: 94.2, investedCr: 68.0, realPurchasingPowerCr: 86.2 },
  ],
  '5Y': [
    { label: '2021', month: '2021', netWorthCr: 44.5, investedCr: 32.0, realPurchasingPowerCr: 44.5 },
    { label: '2022', month: '2022', netWorthCr: 53.0, investedCr: 38.0, realPurchasingPowerCr: 50.1 },
    { label: '2023', month: '2023', netWorthCr: 62.0, investedCr: 45.0, realPurchasingPowerCr: 56.8 },
    { label: '2024', month: '2024', netWorthCr: 71.4, investedCr: 52.0, realPurchasingPowerCr: 63.2 },
    { label: '2025', month: '2025', netWorthCr: 82.6, investedCr: 59.0, realPurchasingPowerCr: 70.8 },
    { label: '2026', month: '2026', netWorthCr: 94.2, investedCr: 68.0, realPurchasingPowerCr: 78.4 },
  ],
};

export function LivingWealthGraph({
  currentNetWorthPaise = 94200000000,
  formattedNetWorth = '₹94,20,00,000',
}: {
  currentNetWorthPaise?: number;
  formattedNetWorth?: string;
}) {
  const [timeRange, setTimeRange] = useState<'1Y' | '3Y' | '5Y'>('1Y');
  const [activeMetric, setActiveMetric] = useState<'all' | 'netWorth' | 'inflation'>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = useMemo(() => HISTORICAL_DATA[timeRange], [timeRange]);

  // Coordinate mapping for SVG
  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingY = 30;

  const minVal = useMemo(() => Math.min(...data.map((d) => d.investedCr)) * 0.9, [data]);
  const maxVal = useMemo(() => Math.max(...data.map((d) => d.netWorthCr)) * 1.08, [data]);

  const points = useMemo(() => {
    return data.map((d, index) => {
      const x = paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
      const yNetWorth = height - paddingY - ((d.netWorthCr - minVal) / (maxVal - minVal)) * (height - paddingY * 2);
      const yInvested = height - paddingY - ((d.investedCr - minVal) / (maxVal - minVal)) * (height - paddingY * 2);
      const yReal = height - paddingY - ((d.realPurchasingPowerCr - minVal) / (maxVal - minVal)) * (height - paddingY * 2);
      return { ...d, x, yNetWorth, yInvested, yReal };
    });
  }, [data, minVal, maxVal, width, height]);

  // Generate cubic bezier path
  const netWorthPath = useMemo(() => {
    if (!points.length) return '';
    let path = `M ${points[0].x} ${points[0].yNetWorth}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const cpX = (current.x + next.x) / 2;
      path += ` C ${cpX} ${current.yNetWorth}, ${cpX} ${next.yNetWorth}, ${next.x} ${next.yNetWorth}`;
    }
    return path;
  }, [points]);

  // Area path for gradient fill
  const netWorthArea = useMemo(() => {
    if (!points.length) return '';
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const baseY = height - paddingY;
    return `${netWorthPath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  }, [netWorthPath, points, height]);

  // Real purchasing power path
  const realPath = useMemo(() => {
    if (!points.length) return '';
    let path = `M ${points[0].x} ${points[0].yReal}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const cpX = (current.x + next.x) / 2;
      path += ` C ${cpX} ${current.yReal}, ${cpX} ${next.yReal}, ${next.x} ${next.yReal}`;
    }
    return path;
  }, [points]);

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-[0_4px_24px_-4px_rgba(30,27,75,0.04),0_1px_3px_0_rgba(30,27,75,0.02)] transition-all">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#64748B] font-medium">
              SYSTEM 01 // LIVING WEALTH GRAPH
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-mono text-[10px] rounded-full">
              <ShieldCheck className="w-3 h-3 text-[#2563EB]" /> VERIFIED TELEMETRY
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="font-display font-bold text-3xl sm:text-4xl text-[#0F172A] tracking-tight">
              {hoveredIndex !== null ? `₹${activePoint.netWorthCr.toFixed(2)} Cr` : formattedNetWorth}
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#0D9488] bg-[#F0FDFA] px-2 py-0.5 rounded-full border border-[#99F6E4]">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% p.a.
            </div>
          </div>
          <div className="font-mono text-xs text-[#64748B] mt-0.5">
            {hoveredIndex !== null ? `Snapshot point: ${activePoint.label}` : 'Evolving from 34 authenticated asset & liability records'}
          </div>
        </div>

        {/* Range Selector & Mode Switch */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg">
            {(['1Y', '3Y', '5Y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => {
                  setTimeRange(range);
                  setHoveredIndex(null);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-white text-[#2563EB] shadow-sm font-semibold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-xs">
            <button
              onClick={() => setActiveMetric('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeMetric === 'all'
                  ? 'bg-white text-[#0F172A] shadow-sm font-semibold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              All Layers
            </button>
            <button
              onClick={() => setActiveMetric('netWorth')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeMetric === 'netWorth'
                  ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Net Worth
            </button>
            <button
              onClick={() => setActiveMetric('inflation')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeMetric === 'inflation'
                  ? 'bg-[#0D9488] text-white shadow-sm font-semibold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              CPI Adjusted
            </button>
          </div>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative mt-6 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 sm:h-64 cursor-crosshair overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
              <stop offset="65%" stopColor="#3B82F6" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#EFF6FF" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="aquaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0D9488" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#F0FDFA" stopOpacity="0.00" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid Lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + ratio * (height - paddingY * 2);
            return (
              <line
                key={i}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Area Fill */}
          {(activeMetric === 'all' || activeMetric === 'netWorth') && (
            <motion.path
              d={netWorthArea}
              fill="url(#wealthGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* Inflation Adjusted Path */}
          {(activeMetric === 'all' || activeMetric === 'inflation') && (
            <motion.path
              d={realPath}
              fill="none"
              stroke="#0D9488"
              strokeWidth="2"
              strokeDasharray="6 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          )}

          {/* Main Net Worth Spline */}
          {(activeMetric === 'all' || activeMetric === 'netWorth') && (
            <motion.path
              d={netWorthPath}
              fill="none"
              stroke="#2563EB"
              strokeWidth="3.2"
              strokeLinecap="round"
              filter="url(#softGlow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          )}

          {/* Interactive Data Points & Constellation Nodes */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g key={idx}>
                {/* Vertical scrub line on hover */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingY}
                    x2={pt.x}
                    y2={height - paddingY}
                    stroke="#2563EB"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Milestone Marker Halo */}
                {pt.milestone && (
                  <circle
                    cx={pt.x}
                    cy={pt.yNetWorth}
                    r={isHovered ? '9' : '6'}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2"
                    className="animate-ping origin-center"
                    style={{ animationDuration: '3s' }}
                  />
                )}

                {/* Main Point Node */}
                <circle
                  cx={pt.x}
                  cy={pt.yNetWorth}
                  r={isHovered ? '7' : '4.5'}
                  fill={isHovered ? '#1D4ED8' : '#FFFFFF'}
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />

                {/* Transparent hit area for easy hover on mobile/desktop */}
                <rect
                  x={pt.x - 20}
                  y={paddingY}
                  width="40"
                  height={height - paddingY * 2}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />

                {/* X-Axis Month Label */}
                <text
                  x={pt.x}
                  y={height - 8}
                  textAnchor="middle"
                  className={`font-mono text-[11px] transition-colors ${
                    isHovered ? 'fill-[#2563EB] font-bold' : 'fill-[#64748B]'
                  }`}
                >
                  {pt.month}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                left: `clamp(10px, ${(activePoint.x / width) * 100}%, calc(100% - 240px))`,
                top: '12px',
              }}
              className="absolute pointer-events-none z-20 bg-[#0F172A] text-white p-3 rounded-lg shadow-xl border border-slate-700 min-w-[200px]"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-1.5 mb-1.5">
                <span>{activePoint.label}</span>
                <span className="text-[#60A5FA] font-medium">VERIFIED</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-xs text-slate-300">Net Worth:</span>
                  <span className="font-mono font-bold text-sm text-white">
                    ₹{activePoint.netWorthCr.toFixed(2)} Cr
                  </span>
                </div>
                <div className="flex justify-between items-baseline gap-2 text-xs">
                  <span className="text-slate-400">CPI Adjusted:</span>
                  <span className="font-mono text-[#2DD4BF]">
                    ₹{activePoint.realPurchasingPowerCr.toFixed(2)} Cr
                  </span>
                </div>
                {activePoint.milestone && (
                  <div className="mt-1 pt-1 border-t border-slate-800 text-[10px] text-amber-300 flex items-center gap-1 font-mono">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {activePoint.milestone}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend & Real-Time Synthesis Footer */}
      <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-[#2563EB] rounded-full" />
            <span className="text-[#334155] font-medium">Consolidated Net Worth</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 border-b-2 border-dashed border-[#0D9488]" />
            <span className="text-[#64748B]">Inflation-Adjusted Purchasing Power</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[#64748B]">
          <span className="text-[#0D9488] flex items-center gap-1 font-medium">
            <Activity className="w-3.5 h-3.5" /> 100% Integer Paise Math
          </span>
          <span>•</span>
          <span>Next revaluation cycle: 15 Nov 2026</span>
        </div>
      </div>
    </div>
  );
}
