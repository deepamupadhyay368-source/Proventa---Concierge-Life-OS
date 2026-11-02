'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Briefcase,
  Building2,
  Coins,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  RefreshCw,
  Info,
} from 'lucide-react';

export interface UniverseNode {
  id: string;
  name: string;
  category: 'core' | 'family' | 'asset' | 'business' | 'liability';
  subType: string;
  valueFormatted: string;
  equityShare?: string;
  status: 'VERIFIED' | 'ENCRYPTED' | 'ACTIVE';
  description: string;
  x: number; // percentage in viewBox
  y: number; // percentage in viewBox
  radius: number;
  connections: string[]; // IDs of connected nodes
}

const DEFAULT_NODES: UniverseNode[] = [
  // Core Anchor
  {
    id: 'core-trust',
    name: 'Primary Family Trust & Holdings',
    category: 'core',
    subType: 'Irrevocable Family Trust (PAN: AABTS7812E)',
    valueFormatted: '₹94,20,00,000 Net Worth',
    status: 'VERIFIED',
    description: 'Primary holding vehicle established under Indian Trusts Act 1882. Zero estate exposure.',
    x: 50,
    y: 50,
    radius: 36,
    connections: ['mem-1', 'mem-2', 'mem-3', 'mem-4', 'ast-equity', 'ast-realestate', 'ast-bullion', 'ast-treasury', 'biz-tech', 'biz-apex', 'lia-hdfc', 'lia-axis'],
  },

  // Family Members (Orbit 1)
  {
    id: 'mem-1',
    name: 'Managing Trustee',
    category: 'family',
    subType: 'Managing Trustee & Founder',
    valueFormatted: 'Beneficial Share: 45%',
    equityShare: '45%',
    status: 'VERIFIED',
    description: 'Direct signatory on all bank mandates, primary beneficiary under Trust Deed Clause 4.1.',
    x: 28,
    y: 28,
    radius: 24,
    connections: ['core-trust', 'biz-tech', 'ast-realestate'],
  },
  {
    id: 'mem-2',
    name: 'Co-Trustee',
    category: 'family',
    subType: 'Co-Trustee',
    valueFormatted: 'Beneficial Share: 35%',
    equityShare: '35%',
    status: 'VERIFIED',
    description: 'Joint signatory for asset acquisitions exceeding ₹1 Cr. Guardian for minor allocations.',
    x: 72,
    y: 28,
    radius: 22,
    connections: ['core-trust', 'ast-bullion', 'ast-treasury'],
  },
  {
    id: 'mem-3',
    name: 'Senior Beneficiary',
    category: 'family',
    subType: 'Beneficiary (Major)',
    valueFormatted: 'Beneficial Share: 10%',
    equityShare: '10%',
    status: 'VERIFIED',
    description: 'Contingent beneficiary with vested educational trust drawdowns commencing 2027.',
    x: 24,
    y: 72,
    radius: 19,
    connections: ['core-trust'],
  },
  {
    id: 'mem-4',
    name: 'Successor Beneficiary',
    category: 'family',
    subType: 'Beneficiary (Minor)',
    valueFormatted: 'Beneficial Share: 10%',
    equityShare: '10%',
    status: 'VERIFIED',
    description: 'DPDP-consented record managed under parental fiduciary guardianship.',
    x: 76,
    y: 72,
    radius: 19,
    connections: ['core-trust'],
  },

  // Asset Constellations (Orbit 2)
  {
    id: 'ast-equity',
    name: 'Demat & Listed Equity',
    category: 'asset',
    subType: 'Direct Equities & Mutual Funds',
    valueFormatted: '₹42,50,00,000',
    status: 'VERIFIED',
    description: 'Zerodha & HDFC Securities portfolios. Verified via NSDL/CDSL CAS integration.',
    x: 50,
    y: 18,
    radius: 26,
    connections: ['core-trust', 'mem-1'],
  },
  {
    id: 'ast-realestate',
    name: 'Prime Commercial Land',
    category: 'asset',
    subType: 'BKC Commercial Unit + Golf Links Villa',
    valueFormatted: '₹36,00,00,000',
    status: 'VERIFIED',
    description: 'Registered sale deed and RERA compliant titles held in encrypted vault.',
    x: 82,
    y: 50,
    radius: 25,
    connections: ['core-trust', 'mem-1', 'lia-hdfc'],
  },
  {
    id: 'ast-bullion',
    name: 'Physical Bullion & SGBs',
    category: 'asset',
    subType: '24K Minted Gold Bars + RBI SGBs',
    valueFormatted: '₹8,20,00,000',
    status: 'VERIFIED',
    description: 'Vaulted in safe deposit locker (L-409, Fort Branch) and RBI demat certificates.',
    x: 18,
    y: 50,
    radius: 21,
    connections: ['core-trust', 'mem-2'],
  },
  {
    id: 'ast-treasury',
    name: 'Treasury & Fixed Term Deposits',
    category: 'asset',
    subType: 'Liquid Surplus & Sweep Accounts',
    valueFormatted: '₹7,50,00,000',
    status: 'VERIFIED',
    description: 'Scheduled commercial bank deposits yielding average 7.4% p.a. monthly liquidity.',
    x: 50,
    y: 82,
    radius: 20,
    connections: ['core-trust', 'mem-2'],
  },

  // Operating Companies & Ventures (Orbit 3)
  {
    id: 'biz-tech',
    name: 'TechVentures India Pvt Ltd',
    category: 'business',
    subType: 'B2B SaaS / Series B (42% Equity)',
    valueFormatted: '₹18,50,00,000 (Family Share)',
    status: 'VERIFIED',
    description: 'Direct holding company shares registered under MCA CIN: U72200MH2021PTC123456.',
    x: 35,
    y: 12,
    radius: 21,
    connections: ['core-trust', 'mem-1'],
  },
  {
    id: 'biz-apex',
    name: 'Apex Supply Logistics LLP',
    category: 'business',
    subType: 'Operating Subsidiary (65% Stake)',
    valueFormatted: '₹12,00,00,000',
    status: 'ACTIVE',
    description: 'Cold chain infrastructure entity. GST returns and audited balance sheet verified.',
    x: 65,
    y: 12,
    radius: 20,
    connections: ['core-trust', 'mem-1'],
  },

  // Liabilities (Orbit 4)
  {
    id: 'lia-hdfc',
    name: 'HDFC Priority Term Facility',
    category: 'liability',
    subType: 'Commercial Mortgage @ 8.25%',
    valueFormatted: '-₹6,80,00,000 Outstanding',
    status: 'ACTIVE',
    description: 'Secured against BKC commercial asset. Monthly EMI ₹6.4 Lakh serviced on 5th of each month.',
    x: 88,
    y: 35,
    radius: 19,
    connections: ['core-trust', 'ast-realestate'],
  },
  {
    id: 'lia-axis',
    name: 'Axis Bank Working Facility',
    category: 'liability',
    subType: 'Revolving OD Line @ 8.65%',
    valueFormatted: '-₹3,20,00,000 Utilised',
    status: 'ACTIVE',
    description: 'Revolving liquidity line for opportunistic capital investments.',
    x: 12,
    y: 65,
    radius: 18,
    connections: ['core-trust'],
  },
];

export function FinancialUniverse({
  nodes = DEFAULT_NODES,
  className = '',
}: {
  nodes?: UniverseNode[];
  className?: string;
}) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'family' | 'asset' | 'business' | 'liability'>('all');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('core-trust');

  const filteredNodes = useMemo(() => {
    if (selectedFilter === 'all') return nodes;
    return nodes.filter((n) => n.category === 'core' || n.category === selectedFilter);
  }, [nodes, selectedFilter]);

  const activeNode = useMemo(() => {
    return nodes.find((n) => n.id === (hoveredNodeId || selectedNodeId)) || nodes[0];
  }, [nodes, hoveredNodeId, selectedNodeId]);

  // Connected nodes of currently active node
  const connectedNodeIds = useMemo(() => {
    if (!activeNode) return new Set<string>();
    const set = new Set<string>([activeNode.id]);
    activeNode.connections.forEach((id) => set.add(id));
    return set;
  }, [activeNode]);

  // Color mappings
  const getNodeColor = (category: UniverseNode['category']) => {
    switch (category) {
      case 'core':
        return {
          fill: '#2563EB',
          stroke: '#93C5FD',
          glow: 'rgba(37, 99, 235, 0.4)',
          badge: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
        };
      case 'family':
        return {
          fill: '#1E1B4B',
          stroke: '#C7D2FE',
          glow: 'rgba(30, 27, 75, 0.3)',
          badge: 'bg-[#EEF2FF] text-[#312E81] border-[#C7D2FE]',
        };
      case 'asset':
        return {
          fill: '#0D9488',
          stroke: '#99F6E4',
          glow: 'rgba(13, 148, 136, 0.35)',
          badge: 'bg-[#F0FDFA] text-[#0D9488] border-[#99F6E4]',
        };
      case 'business':
        return {
          fill: '#4338CA',
          stroke: '#C7D2FE',
          glow: 'rgba(67, 56, 202, 0.3)',
          badge: 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]',
        };
      case 'liability':
        return {
          fill: '#E11D48',
          stroke: '#FECDD3',
          glow: 'rgba(225, 29, 72, 0.3)',
          badge: 'bg-rose-50 text-rose-600 border-rose-200',
        };
    }
  };

  return (
    <div className={`bg-white border border-[#E2E8F0] rounded-xl shadow-[0_4px_24px_-4px_rgba(30,27,75,0.04),0_1px_3px_0_rgba(30,27,75,0.02)] overflow-hidden ${className}`}>
      {/* Visual System Header */}
      <div className="p-6 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#64748B] font-medium">
              SYSTEM 02 // LIVING FINANCIAL UNIVERSE
            </span>
            <span className="px-2.5 py-0.5 bg-[#F0FDFA] text-[#0D9488] border border-[#99F6E4] rounded-full text-[10px] font-mono">
              INTERACTIVE ORBITAL TOPOLOGY
            </span>
          </div>
          <h2 className="font-display font-bold text-2xl text-[#0F172A] mt-1 tracking-tight">
            Family Ownership & Capital Constellation
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time multi-generational synthesis linking beneficiaries, legal entities, holdings, and facilities.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg">
          {(
            [
              { key: 'all', label: 'All Constellation' },
              { key: 'family', label: 'Trustees & Family' },
              { key: 'asset', label: 'Capital Assets' },
              { key: 'business', label: 'Operating Ventures' },
              { key: 'liability', label: 'Debt Facilities' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                selectedFilter === tab.key
                  ? 'bg-white text-[#2563EB] shadow-sm font-semibold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
        {/* SVG Living Universe Canvas (Cols 1-8) */}
        <div className="lg:col-span-8 relative bg-gradient-to-br from-[#FAFBFC] via-[#F8FAFC] to-[#F1F5F9] p-4 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-[#E2E8F0]">
          {/* Ambient Orbital Rings */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[180px] h-[180px] rounded-full border border-[#E2E8F0]/70" />
            <div className="w-[320px] h-[320px] rounded-full border border-dashed border-[#E2E8F0]/60 animate-spin" style={{ animationDuration: '140s' }} />
            <div className="w-[460px] h-[460px] rounded-full border border-[#E2E8F0]/50" />
          </div>

          <svg viewBox="0 0 100 100" className="w-full h-full max-h-[500px] select-none cursor-pointer">
            <defs>
              <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connecting Luminous Strands */}
            {filteredNodes.map((source) => {
              return source.connections.map((targetId) => {
                const target = filteredNodes.find((n) => n.id === targetId);
                if (!target || source.id > target.id) return null; // render each line once

                const isLineActive =
                  (hoveredNodeId === source.id && connectedNodeIds.has(target.id)) ||
                  (hoveredNodeId === target.id && connectedNodeIds.has(source.id)) ||
                  (!hoveredNodeId && (selectedNodeId === source.id || selectedNodeId === target.id));

                return (
                  <motion.line
                    key={`${source.id}-${target.id}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={isLineActive ? '#2563EB' : '#CBD5E1'}
                    strokeWidth={isLineActive ? '0.75' : '0.25'}
                    strokeDasharray={source.category === 'liability' || target.category === 'liability' ? '1.5 1.5' : undefined}
                    opacity={isLineActive ? 0.9 : 0.4}
                    transition={{ duration: 0.2 }}
                  />
                );
              });
            })}

            {/* Render Nodes */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isConnected = connectedNodeIds.has(node.id);
              const colors = getNodeColor(node.category);

              // Dim nodes that aren't related to the hovered/selected node
              const opacity = hoveredNodeId ? (isHovered || isConnected ? 1 : 0.25) : 1;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="cursor-pointer transition-transform"
                >
                  {/* Subtle Pulse Ring for Active Node */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={(node.radius / 10) * 1.6}
                      fill="none"
                      stroke={colors.fill}
                      strokeWidth="0.5"
                      className="animate-ping origin-center"
                      style={{ animationDuration: '2.5s' }}
                    />
                  )}

                  {/* Outer Ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius / 10}
                    fill={isSelected ? '#FFFFFF' : '#FAFBFC'}
                    stroke={colors.fill}
                    strokeWidth={isSelected ? '1' : '0.6'}
                    opacity={opacity}
                    className="transition-all"
                  />

                  {/* Inner Core Ball */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={(node.radius / 10) * 0.55}
                    fill={colors.fill}
                    opacity={opacity}
                    filter="url(#nodeGlow)"
                  />

                  {/* Node Label Below */}
                  <text
                    x={node.x}
                    y={node.y + (node.radius / 10) + 3}
                    textAnchor="middle"
                    className="font-sans text-[2.6px] font-semibold fill-[#1E293B]"
                    opacity={opacity}
                  >
                    {node.name.length > 20 ? `${node.name.slice(0, 18)}...` : node.name}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + (node.radius / 10) + 5.8}
                    textAnchor="middle"
                    className="font-mono text-[1.9px] fill-[#64748B]"
                    opacity={opacity}
                  >
                    {node.valueFormatted.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick Helper Floating Badge */}
          <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-sm border border-[#E2E8F0] px-3 py-1.5 rounded-full text-[11px] font-mono text-[#64748B] flex items-center gap-2 shadow-sm pointer-events-none">
            <Info className="w-3.5 h-3.5 text-[#2563EB]" /> Hover or click any node to explore beneficial ownership links
          </div>
        </div>

        {/* Node Inspection Flyout (Cols 9-12) */}
        <div className="lg:col-span-4 p-6 bg-white flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNode.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${
                      getNodeColor(activeNode.category).badge
                    }`}
                  >
                    {activeNode.category} // {activeNode.status}
                  </span>
                  <span className="font-mono text-xs text-[#64748B]">{activeNode.id}</span>
                </div>

                <h3 className="font-display font-bold text-xl text-[#0F172A] mt-2">
                  {activeNode.name}
                </h3>
                <p className="font-mono text-xs text-[#2563EB] mt-0.5">{activeNode.subType}</p>
              </div>

              {/* Metric Card */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                  CONSOLIDATED VALUE / EQUITY ATTRIBUTION
                </div>
                <div className="font-display font-bold text-2xl text-[#0F172A]">
                  {activeNode.valueFormatted}
                </div>
                {activeNode.equityShare && (
                  <div className="font-mono text-xs text-[#0D9488] font-medium">
                    Effective Family Beneficial Stake: {activeNode.equityShare}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                  FIDUCIARY GOVERNANCE & NOTES
                </div>
                <p className="text-xs text-[#334155] leading-relaxed">
                  {activeNode.description}
                </p>
              </div>

              {/* Active Connections List */}
              <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                  CONNECTED TOPOLOGY ({activeNode.connections.length} STRANDS)
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                  {activeNode.connections.map((connId) => {
                    const connNode = nodes.find((n) => n.id === connId);
                    if (!connNode) return null;
                    return (
                      <button
                        key={connId}
                        onClick={() => setSelectedNodeId(connId)}
                        className="w-full text-left p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#BFDBFE] transition-colors flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-medium text-[#0F172A]">{connNode.name}</div>
                          <div className="font-mono text-[10px] text-[#64748B]">{connNode.subType}</div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action Trigger */}
          <div className="pt-4 border-t border-[#E2E8F0] mt-6 flex items-center gap-2">
            <button className="flex-1 py-2 bg-[#2563EB] text-white text-xs font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors shadow-sm">
              Inspect Deed & Verification
            </button>
            <button
              onClick={() => setSelectedNodeId('core-trust')}
              className="p-2 border border-[#E2E8F0] rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
              title="Reset to Core Trust"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
