'use client';

import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Layers,
  TrendingUp,
  ShieldAlert,
  Flag,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';
import { formatInr } from '@/lib/wealth/engine';

interface Milestone {
  id: string;
  year: number;
  label: string;
  category: 'SUCCESSION' | 'LIQUIDITY' | 'PHILANTHROPY' | 'ESTATE';
  projectedPaise: number;
  description: string;
}

const DEFAULT_MILESTONES: Milestone[] = [
  {
    id: 'm1',
    year: 2028,
    label: 'TechVentures Series B Secondary',
    category: 'LIQUIDITY',
    projectedPaise: 5800000000, // ₹58 Cr
    description: 'Partial founder equity redemption channeled to Sovereign Bullion reserve.',
  },
  {
    id: 'm2',
    year: 2032,
    label: 'Generational Trust Tranche 1',
    category: 'SUCCESSION',
    projectedPaise: 7600000000, // ₹76 Cr
    description: 'First educational & enterprise endowment vesting for Gen-2 trustees.',
  },
  {
    id: 'm3',
    year: 2038,
    label: 'Sharma Philanthropic Foundation',
    category: 'PHILANTHROPY',
    projectedPaise: 11000000000, // ₹110 Cr
    description: 'Establishment of perpetual STEM educational trust endowed with commercial rent yields.',
  },
  {
    id: 'm4',
    year: 2045,
    label: 'Full Estate Succession Horizon',
    category: 'ESTATE',
    projectedPaise: 18500000000, // ₹185 Cr
    description: 'Autonomous multi-jurisdiction entity transition under zero-probate constitution.',
  },
];

export function TimeLandscapes({
  currentNetWorthPaise = 4824500000, // ₹48.24 Cr
  growthRate = 11.2, // 11.2% CAGR nominal
  inflationRate = 5.5, // 5.5% inflation
  className = '',
}: {
  currentNetWorthPaise?: number;
  growthRate?: number;
  inflationRate?: number;
  className?: string;
}) {
  const [selectedYear, setSelectedYear] = useState<number>(2035);
  const [activeTab, setActiveTab] = useState<'TOPOGRAPHY' | 'STRATA' | 'SCENARIO'>('TOPOGRAPHY');
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(DEFAULT_MILESTONES[1]);
  const [stressFactor, setStressFactor] = useState<number>(0); // 0 = baseline, 1 = moderate shock, 2 = severe shock

  const currentYear = 2026;
  const maxYear = 2056;
  const yearsSpan = maxYear - currentYear;

  // Generate 31 points (2026 to 2056)
  const trajectoryPoints = Array.from({ length: yearsSpan + 1 }).map((_, i) => {
    const yr = currentYear + i;
    const t = i;
    const effectiveGrowth = (growthRate - stressFactor * 2.5) / 100;
    const effectiveInflation = (inflationRate + stressFactor * 1.5) / 100;

    // Nominal compounding: V * (1 + g)^t
    const nominal = currentNetWorthPaise * Math.pow(1 + effectiveGrowth, t);
    // Real compounding (inflation-discounted): V * ((1+g)/(1+i))^t
    const real = currentNetWorthPaise * Math.pow((1 + effectiveGrowth) / (1 + effectiveInflation), t);
    // Conservative baseline (pure capital preservation)
    const floor = currentNetWorthPaise * Math.pow(1 + 0.04, t);

    return {
      year: yr,
      nominalPaise: Math.round(nominal),
      realPaise: Math.round(real),
      floorPaise: Math.round(floor),
    };
  });

  const selectedPoint = trajectoryPoints.find((p) => p.year === selectedYear) || trajectoryPoints[0];

  // SVG dimensions for topographical elevation terrain
  const width = 800;
  const height = 320;
  const paddingX = 40;
  const paddingY = 40;

  const maxVal = trajectoryPoints[trajectoryPoints.length - 1].nominalPaise * 1.1;

  const getCoordinates = (p: (typeof trajectoryPoints)[0], type: 'nominal' | 'real' | 'floor') => {
    const x = paddingX + ((p.year - currentYear) / yearsSpan) * (width - 2 * paddingX);
    const val = type === 'nominal' ? p.nominalPaise : type === 'real' ? p.realPaise : p.floorPaise;
    const y = height - paddingY - (val / maxVal) * (height - 2 * paddingY);
    return { x, y };
  };

  const nominalPath = trajectoryPoints
    .map((p, idx) => {
      const { x, y } = getCoordinates(p, 'nominal');
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const realPath = trajectoryPoints
    .map((p, idx) => {
      const { x, y } = getCoordinates(p, 'real');
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const floorPath = trajectoryPoints
    .map((p, idx) => {
      const { x, y } = getCoordinates(p, 'floor');
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  // Shaded area between nominal and real (representing inflation erosion strata)
  const nominalCoordinates = trajectoryPoints.map((p) => getCoordinates(p, 'nominal'));
  const realCoordinates = trajectoryPoints.map((p) => getCoordinates(p, 'real'));

  const areaStrataPath = `${nominalCoordinates.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')} ${realCoordinates
    .slice()
    .reverse()
    .map((c) => `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ')} Z`;

  // Shaded area under real down to baseline
  const baselineY = height - paddingY;
  const underRealPath = `${realCoordinates.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')} L ${width - paddingX} ${baselineY} L ${paddingX} ${baselineY} Z`;

  // Selected cursor X
  const selectedX = paddingX + ((selectedYear - currentYear) / yearsSpan) * (width - 2 * paddingX);

  return (
    <div
      className={`relative rounded-sm bg-[#080A0F] border border-[#B9C1CC]/20 p-6 md:p-8 overflow-hidden ${className}`}
    >
      {/* Background Volumetric Glow & Atmospheric Spatial Grid */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#2457E8]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#D5A85D]/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#B9C1CC]/15">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-[#2457E8] uppercase mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2457E8] inline-block animate-pulse" />
            <span>SIGNATURE ASSET D // TIME LANDSCAPES</span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#F4F2ED] uppercase tracking-tight">
            Multi-Decadal Capital Horizon
          </h2>
          <p className="text-xs sm:text-sm text-[#B9C1CC]/70 mt-1 max-w-xl">
            Dimensional terrain representing 30-year compounding trajectory, inflation erosion strata, and structural family milestones.
          </p>
        </div>

        {/* Tab Controls & Stress Selector */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <div className="flex items-center bg-[#171B23] border border-[#B9C1CC]/20 p-0.5 rounded-sm">
            {(['TOPOGRAPHY', 'STRATA', 'SCENARIO'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 transition-all ${
                  activeTab === tab
                    ? 'bg-[#2457E8] text-[#F4F2ED] font-bold shadow-sm'
                    : 'text-[#B9C1CC] hover:text-[#F4F2ED]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#171B23] border border-[#B9C1CC]/20 px-2 py-1 rounded-sm text-[#B9C1CC]">
            <Sliders className="w-3 h-3 text-[#D5A85D]" />
            <span className="text-[10px] tracking-wider uppercase">Stress:</span>
            <select
              value={stressFactor}
              onChange={(e) => setStressFactor(Number(e.target.value))}
              aria-label="Macro scenario stress factor"
              className="bg-transparent text-[#F4F2ED] focus:outline-none cursor-pointer text-[11px]"
            >
              <option value={0} className="bg-[#171B23] text-[#F4F2ED]">Baseline (11.2% CAGR)</option>
              <option value={1} className="bg-[#171B23] text-[#F4F2ED]">Stagflation (-2.5% Yield)</option>
              <option value={2} className="bg-[#171B23] text-[#F4F2ED]">Global Shock (-5.0% Yield)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Interactive Elevation Canvas / SVG */}
      <div className="relative mt-6">
        <div className="w-full overflow-x-auto pb-4">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto min-w-[650px] overflow-visible select-none"
          >
            <defs>
              <linearGradient id="nominalGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2457E8" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#7595FF" stopOpacity="1" />
                <stop offset="100%" stopColor="#A9D8F5" stopOpacity="1" />
              </linearGradient>

              <linearGradient id="strataFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2457E8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#171B23" stopOpacity="0.05" />
              </linearGradient>

              <linearGradient id="realFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2457E8" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#080A0F" stopOpacity="0.9" />
              </linearGradient>

              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#B9C1CC" strokeOpacity="0.06" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Background architectural grid */}
            <rect width={width} height={height} fill="url(#grid)" />

            {/* Shaded Area Under Real Capital */}
            <path d={underRealPath} fill="url(#realFill)" />

            {/* Shaded Inflation Strata */}
            <path d={areaStrataPath} fill="url(#strataFill)" />

            {/* Trajectory Elevation Contours */}
            <path
              d={nominalPath}
              fill="none"
              stroke="url(#nominalGlow)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            <path
              d={realPath}
              fill="none"
              stroke="#D5A85D"
              strokeWidth="1.8"
              strokeDasharray="4 3"
              strokeOpacity="0.85"
            />

            <path
              d={floorPath}
              fill="none"
              stroke="#B9C1CC"
              strokeWidth="1"
              strokeDasharray="2 4"
              strokeOpacity="0.35"
            />

            {/* Decade Vertical Grid Reference Markers */}
            {[2026, 2030, 2035, 2040, 2045, 2050, 2055].map((yr) => {
              const x = paddingX + ((yr - currentYear) / yearsSpan) * (width - 2 * paddingX);
              return (
                <g key={yr}>
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={baselineY}
                    stroke="#B9C1CC"
                    strokeOpacity="0.12"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={x}
                    y={baselineY + 18}
                    textAnchor="middle"
                    fill="#B9C1CC"
                    opacity="0.6"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {yr}
                  </text>
                </g>
              );
            })}

            {/* Milestone Monolith Beacons */}
            {DEFAULT_MILESTONES.map((m) => {
              const x = paddingX + ((m.year - currentYear) / yearsSpan) * (width - 2 * paddingX);
              const isSelected = activeMilestone?.id === m.id;
              const point = trajectoryPoints.find((p) => p.year === m.year) || trajectoryPoints[0];
              const { y } = getCoordinates(point, 'nominal');

              return (
                <g
                  key={m.id}
                  className="cursor-pointer group"
                  onClick={() => {
                    setActiveMilestone(m);
                    setSelectedYear(m.year);
                  }}
                >
                  {/* Monolith Pillar Line */}
                  <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={baselineY}
                    stroke={isSelected ? '#2457E8' : '#D5A85D'}
                    strokeWidth={isSelected ? '2' : '1'}
                    strokeDasharray={isSelected ? 'none' : '3 3'}
                    strokeOpacity={isSelected ? '1' : '0.6'}
                  />

                  {/* Monolith Beacon Head */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? '6' : '4'}
                    fill={isSelected ? '#2457E8' : '#D5A85D'}
                    stroke="#080A0F"
                    strokeWidth="2"
                    className="transition-transform group-hover:scale-125"
                  />

                  {/* Monolith Label Tag */}
                  <rect
                    x={x - 30}
                    y={y - 24}
                    width="60"
                    height="16"
                    rx="2"
                    fill={isSelected ? '#2457E8' : '#171B23'}
                    stroke={isSelected ? '#A9D8F5' : '#B9C1CC'}
                    strokeOpacity="0.4"
                  />
                  <text
                    x={x}
                    y={y - 13}
                    textAnchor="middle"
                    fill={isSelected ? '#F4F2ED' : '#B9C1CC'}
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {m.year} // {m.category.slice(0, 3)}
                  </text>
                </g>
              );
            })}

            {/* Active Year Cursor Scrubber */}
            <g>
              <line
                x1={selectedX}
                y1={paddingY}
                x2={selectedX}
                y2={baselineY}
                stroke="#A9D8F5"
                strokeWidth="1.5"
              />
              <circle
                cx={selectedX}
                cy={getCoordinates(selectedPoint, 'nominal').y}
                r="5"
                fill="#A9D8F5"
                stroke="#080A0F"
                strokeWidth="2"
              />
              <circle
                cx={selectedX}
                cy={getCoordinates(selectedPoint, 'real').y}
                r="4"
                fill="#D5A85D"
                stroke="#080A0F"
                strokeWidth="2"
              />
            </g>
          </svg>
        </div>

        {/* Year Scrubber Slider Control */}
        <div className="mt-4 flex items-center gap-4 bg-[#171B23]/70 p-3 rounded-sm border border-[#B9C1CC]/15">
          <Calendar className="w-4 h-4 text-[#2457E8]" />
          <span className="font-mono text-xs text-[#B9C1CC] whitespace-nowrap">
            HORIZON SCRUBBER: <strong className="text-[#F4F2ED]">{selectedYear}</strong> (+{selectedYear - currentYear} YRS)
          </span>
          <input
            type="range"
            min={currentYear}
            max={maxYear}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            aria-label="Select horizon year"
            className="w-full accent-[#2457E8] bg-[#080A0F] h-1.5 rounded-sm cursor-pointer"
          />
          <span className="font-mono text-xs text-[#B9C1CC]/70">{maxYear}</span>
        </div>
      </div>

      {/* Telemetry Readout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Nominal Wealth */}
        <div className="p-4 rounded-sm bg-[#171B23] border border-[#2457E8]/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-[#A9D8F5] mb-1">
            <span>[PROJECTED NOMINAL CAPITAL]</span>
            <span className="w-2 h-2 rounded-full bg-[#2457E8]" />
          </div>
          <div className="text-2xl font-heading font-black text-[#F4F2ED]">
            {formatInr(selectedPoint.nominalPaise)}
          </div>
          <div className="text-xs text-[#B9C1CC]/70 mt-1 font-mono">
            {growthRate - stressFactor * 2.5}% Nominal CAGR (Compound Annual Growth)
          </div>
        </div>

        {/* Inflation-Discounted (Real Purchasing Power) */}
        <div className="p-4 rounded-sm bg-[#171B23] border border-[#D5A85D]/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-[#D5A85D] mb-1">
            <span>[REAL PURCHASING POWER]</span>
            <span className="w-2 h-2 rounded-full bg-[#D5A85D]" />
          </div>
          <div className="text-2xl font-heading font-black text-[#F4F2ED]">
            {formatInr(selectedPoint.realPaise)}
          </div>
          <div className="text-xs text-[#B9C1CC]/70 mt-1 font-mono">
            Inflation-Adjusted @ {inflationRate + stressFactor * 1.5}% INR Index
          </div>
        </div>

        {/* Inflation Erosion Delta */}
        <div className="p-4 rounded-sm bg-[#171B23] border border-[#B9C1CC]/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-[#B9C1CC] mb-1">
            <span>[ESTIMATED INFLATION EROSION]</span>
            <ShieldAlert className="w-3.5 h-3.5 text-[#B9C1CC]" />
          </div>
          <div className="text-2xl font-heading font-black text-[#B9C1CC]">
            -{formatInr(selectedPoint.nominalPaise - selectedPoint.realPaise)}
          </div>
          <div className="text-xs text-[#B9C1CC]/70 mt-1 font-mono">
            Hedged via Real Estate + Gold Bullion allocations
          </div>
        </div>
      </div>

      {/* Selected Milestone Detail Banner */}
      {activeMilestone && (
        <div className="mt-4 p-4 rounded-sm bg-[#171B23]/90 border-l-4 border-l-[#2457E8] border border-[#B9C1CC]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-sm bg-[#2457E8]/10 text-[#2457E8] mt-0.5">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#A9D8F5]">
                  YEAR {activeMilestone.year} MONOLITH // {activeMilestone.category}
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#2457E8]/20 text-[#A9D8F5] rounded-xs">
                  CERTIFIED
                </span>
              </div>
              <h4 className="font-heading font-bold text-sm text-[#F4F2ED] mt-0.5">
                {activeMilestone.label}
              </h4>
              <p className="text-xs text-[#B9C1CC] mt-0.5 max-w-xl">
                {activeMilestone.description}
              </p>
            </div>
          </div>

          <div className="sm:text-right shrink-0">
            <div className="text-[10px] font-mono text-[#B9C1CC]/60 uppercase">Horizon Threshold</div>
            <div className="font-heading font-bold text-base text-[#D5A85D]">
              {formatInr(activeMilestone.projectedPaise)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
