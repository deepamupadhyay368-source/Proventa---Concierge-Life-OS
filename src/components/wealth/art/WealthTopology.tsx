'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Users,
  Building2,
  Coins,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  RefreshCw,
  Info,
  Sparkles,
  Lock,
} from 'lucide-react';

export interface TopologyNode {
  id: string;
  name: string;
  stratum: 'TRUST_ROOT' | 'BENEFICIARY' | 'CAPITAL_ASSET' | 'OPERATING_CORP' | 'DEBT_FACILITY';
  code: string;
  valuationFormatted: string;
  equityPercentage?: string;
  material: 'TITANIUM' | 'CHROME' | 'CERAMIC' | 'RESIN' | 'SIGNAL_GOLD';
  status: 'VERIFIED' | 'ENCRYPTED' | 'ACTIVE';
  jurisdiction: string;
  panCin: string;
  fiduciaryNotes: string;
  x: number; // percentage
  y: number; // percentage
  depthZ: number; // 0 to 1 spatial depth
  connections: string[]; // Connected node IDs
}

const DEFAULT_TOPOLOGY: TopologyNode[] = [
  // 1. Root Trust Anchor
  {
    id: 'node-root',
    name: 'Sharma Family Trust & Holdings',
    stratum: 'TRUST_ROOT',
    code: 'FWS-001',
    valuationFormatted: '₹94,20,00,000 Net Worth',
    material: 'SIGNAL_GOLD',
    status: 'VERIFIED',
    jurisdiction: 'Indian Trusts Act 1882 (Mumbai)',
    panCin: 'PAN: AABTS7812E',
    fiduciaryNotes: 'Irrevocable discretionary family trust. Zero personal probate or estate taxation exposure under Indian law.',
    x: 50,
    y: 50,
    depthZ: 1.0,
    connections: ['node-mem1', 'node-mem2', 'node-mem3', 'node-ast1', 'node-ast2', 'node-ast3', 'node-ast4', 'node-biz1', 'node-biz2', 'node-lia1', 'node-lia2'],
  },

  // 2. Family Beneficiaries
  {
    id: 'node-mem1',
    name: 'Rajesh Sharma',
    stratum: 'BENEFICIARY',
    code: 'BEN-01',
    valuationFormatted: 'Attributed Share: 45%',
    equityPercentage: '45.0%',
    material: 'CHROME',
    status: 'VERIFIED',
    jurisdiction: 'Primary Trustee & Signatory',
    panCin: 'PAN: ABCPS1234F',
    fiduciaryNotes: 'Sole discretionary signatory on capital transfers up to ₹5 Cr. Primary lifetime beneficiary.',
    x: 26,
    y: 26,
    depthZ: 0.85,
    connections: ['node-root', 'node-biz1', 'node-ast1'],
  },
  {
    id: 'node-mem2',
    name: 'Sunita Sharma',
    stratum: 'BENEFICIARY',
    code: 'BEN-02',
    valuationFormatted: 'Attributed Share: 35%',
    equityPercentage: '35.0%',
    material: 'CERAMIC',
    status: 'VERIFIED',
    jurisdiction: 'Co-Trustee',
    panCin: 'PAN: BKPSS9876K',
    fiduciaryNotes: 'Dual-key confirmation required for real property alienation or trust deed amendments.',
    x: 74,
    y: 26,
    depthZ: 0.85,
    connections: ['node-root', 'node-ast3', 'node-ast4'],
  },
  {
    id: 'node-mem3',
    name: 'Aarav Sharma',
    stratum: 'BENEFICIARY',
    code: 'BEN-03',
    valuationFormatted: 'Attributed Share: 20%',
    equityPercentage: '20.0%',
    material: 'RESIN',
    status: 'ENCRYPTED',
    jurisdiction: 'Contingent Successor',
    panCin: 'UID: ****-****-8812',
    fiduciaryNotes: 'Intergenerational succession vesting structured across 2027-2032 educational trust tranches.',
    x: 50,
    y: 84,
    depthZ: 0.7,
    connections: ['node-root'],
  },

  // 3. Capital Assets
  {
    id: 'node-ast1',
    name: 'BKC Prime Commercial Land & Suite',
    stratum: 'CAPITAL_ASSET',
    code: 'AST-01',
    valuationFormatted: '₹36,00,00,000',
    material: 'TITANIUM',
    status: 'VERIFIED',
    jurisdiction: 'Sub-Registrar Mumbai / RERA Certified',
    panCin: 'Deed No: MUM-4401-2018',
    fiduciaryNotes: 'Commercial lease yields ₹24.5 Lakh monthly rental income. Zero encumbrance on 70% floor space.',
    x: 82,
    y: 50,
    depthZ: 0.9,
    connections: ['node-root', 'node-mem1', 'node-lia1'],
  },
  {
    id: 'node-ast2',
    name: 'Listed Demat Equity & Mutual Funds',
    stratum: 'CAPITAL_ASSET',
    code: 'AST-02',
    valuationFormatted: '₹42,50,00,000',
    material: 'CHROME',
    status: 'VERIFIED',
    jurisdiction: 'NSDL / CDSL Demat Holdings',
    panCin: 'DP ID: IN300126-10492817',
    fiduciaryNotes: 'Bluechip equity index funds and direct equities verified via daily CAMS / Karvy feeds.',
    x: 50,
    y: 16,
    depthZ: 0.95,
    connections: ['node-root', 'node-mem1'],
  },
  {
    id: 'node-ast3',
    name: 'Allocated Physical Bullion & SGBs',
    stratum: 'CAPITAL_ASSET',
    code: 'AST-03',
    valuationFormatted: '₹8,20,00,000',
    material: 'SIGNAL_GOLD',
    status: 'VERIFIED',
    jurisdiction: 'Safe Deposit Vault L-409 (Fort Branch)',
    panCin: 'Certificate: MMTC-PAMP-999',
    fiduciaryNotes: '999.9 purity minted bars audited semi-annually with chartered valuer verification certificates.',
    x: 18,
    y: 50,
    depthZ: 0.8,
    connections: ['node-root', 'node-mem2'],
  },
  {
    id: 'node-ast4',
    name: 'Treasury Reserves & Fixed Deposits',
    stratum: 'CAPITAL_ASSET',
    code: 'AST-04',
    valuationFormatted: '₹7,50,00,000',
    material: 'CERAMIC',
    status: 'VERIFIED',
    jurisdiction: 'Scheduled Commercial Banking Tier',
    panCin: 'HDFC Escrow A/C 50200...',
    fiduciaryNotes: 'Operational treasury providing 4.8X liquidity coverage for all annual family debt servicing.',
    x: 32,
    y: 72,
    depthZ: 0.75,
    connections: ['node-root', 'node-mem2'],
  },

  // 4. Operating Corporate Ventures
  {
    id: 'node-biz1',
    name: 'TechVentures India Pvt Ltd',
    stratum: 'OPERATING_CORP',
    code: 'BIZ-01',
    valuationFormatted: '₹18,50,00,000 (Family 42% Stake)',
    equityPercentage: '42.0%',
    material: 'CHROME',
    status: 'VERIFIED',
    jurisdiction: 'MCA RoC Mumbai / Series B',
    panCin: 'CIN: U72200MH2021PTC123456',
    fiduciaryNotes: 'B2B Enterprise SaaS entity. Direct beneficial ownership held through holding company vehicle.',
    x: 34,
    y: 10,
    depthZ: 0.9,
    connections: ['node-root', 'node-mem1'],
  },
  {
    id: 'node-biz2',
    name: 'Apex Supply Logistics LLP',
    stratum: 'OPERATING_CORP',
    code: 'BIZ-02',
    valuationFormatted: '₹12,00,00,000 (Family 65% Stake)',
    equityPercentage: '65.0%',
    material: 'RESIN',
    status: 'ACTIVE',
    jurisdiction: 'MCA LLP Registrar',
    panCin: 'LLPIN: AAB-9102',
    fiduciaryNotes: 'Cold-chain freight logistics infrastructure. Audited balance sheet and GST filing verified.',
    x: 66,
    y: 10,
    depthZ: 0.85,
    connections: ['node-root', 'node-mem1'],
  },

  // 5. Debt Facilities
  {
    id: 'node-lia1',
    name: 'HDFC Commercial Mortgage Facility',
    stratum: 'DEBT_FACILITY',
    code: 'LIA-01',
    valuationFormatted: '-₹6,80,00,000 Principal',
    material: 'TITANIUM',
    status: 'ACTIVE',
    jurisdiction: 'Secured against BKC Property',
    panCin: 'Facility No: HDFC-CF-9082',
    fiduciaryNotes: 'Structured commercial loan @ 8.25% p.a. Monthly service ₹6,40,000 serviced from rental escrow.',
    x: 88,
    y: 36,
    depthZ: 0.8,
    connections: ['node-root', 'node-ast1'],
  },
  {
    id: 'node-lia2',
    name: 'Axis Bank Revolving Credit Line',
    stratum: 'DEBT_FACILITY',
    code: 'LIA-02',
    valuationFormatted: '-₹3,20,00,000 Drawn',
    material: 'TITANIUM',
    status: 'ACTIVE',
    jurisdiction: 'Clean Overdraft Facility',
    panCin: 'OD A/C 91200...',
    fiduciaryNotes: 'Opportunistic capital liquidity line @ 8.65% floating. Zero prepayment penalty.',
    x: 12,
    y: 66,
    depthZ: 0.75,
    connections: ['node-root'],
  },
];

export function WealthTopology({
  nodes = DEFAULT_TOPOLOGY,
  className = '',
}: {
  nodes?: TopologyNode[];
  className?: string;
}) {
  const [selectedStratum, setSelectedStratum] = useState<string>('ALL');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-root');

  const filteredNodes = useMemo(() => {
    if (selectedStratum === 'ALL') return nodes;
    return nodes.filter((n) => n.stratum === 'TRUST_ROOT' || n.stratum === selectedStratum);
  }, [nodes, selectedStratum]);

  const activeNode = useMemo(() => {
    return nodes.find((n) => n.id === (hoveredNodeId || selectedNodeId)) || nodes[0];
  }, [nodes, hoveredNodeId, selectedNodeId]);

  const connectedIds = useMemo(() => {
    const set = new Set<string>([activeNode.id]);
    activeNode.connections.forEach((c) => set.add(c));
    return set;
  }, [activeNode]);

  // Material style helper
  const getMaterialClasses = (material: TopologyNode['material']) => {
    switch (material) {
      case 'SIGNAL_GOLD':
        return {
          core: 'fill-[#D5A85D] stroke-[#F4F2ED]',
          glow: 'rgba(213, 168, 93, 0.45)',
          badge: 'bg-[#D5A85D]/15 text-[#D5A85D] border-[#D5A85D]/40',
        };
      case 'CHROME':
        return {
          core: 'fill-[#2457E8] stroke-[#A9D8F5]',
          glow: 'rgba(36, 87, 232, 0.4)',
          badge: 'bg-[#2457E8]/15 text-[#A9D8F5] border-[#2457E8]/40',
        };
      case 'TITANIUM':
        return {
          core: 'fill-[#B9C1CC] stroke-[#F4F2ED]',
          glow: 'rgba(185, 193, 204, 0.3)',
          badge: 'bg-[#262D3B] text-[#B9C1CC] border-[#384356]',
        };
      case 'CERAMIC':
        return {
          core: 'fill-[#F4F2ED] stroke-[#B9C1CC]',
          glow: 'rgba(244, 242, 237, 0.25)',
          badge: 'bg-[#FAF9F6] text-[#080A0F] border-[#E4E0D6]',
        };
      case 'RESIN':
        return {
          core: 'fill-[#7DC2ED] stroke-[#A9D8F5]',
          glow: 'rgba(125, 194, 237, 0.35)',
          badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
        };
    }
  };

  return (
    <div className={`mat-carbon rounded-[4px] overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-[#2A3342] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#171B23]">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#D5A85D]">
            <span className="w-1.5 h-1.5 bg-[#D5A85D] animate-ping" />
            <span>SIGNATURE ASSET // WEALTH TOPOLOGY</span>
            <span className="text-[#384356]">|</span>
            <span className="text-[#B9C1CC]">SPATIAL OWNERSHIP ARCHITECTURE</span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#F4F2ED] mt-1 tracking-tight">
            Connected Capital &amp; Family Structure
          </h2>
          <p className="font-sans text-xs text-[#B9C1CC] mt-0.5">
            Volumetric structural map resolving effective family equity, trust deeds, corporate entities, and credit covenants.
          </p>
        </div>

        {/* Stratum Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#080A0F] border border-[#2A3342] rounded-[2px] font-mono text-xs">
          {[
            { key: 'ALL', label: 'All Strata' },
            { key: 'BENEFICIARY', label: 'Trustees & Beneficiaries' },
            { key: 'CAPITAL_ASSET', label: 'Capital Assets' },
            { key: 'OPERATING_CORP', label: 'Corporate Ventures' },
            { key: 'DEBT_FACILITY', label: 'Debt Facilities' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedStratum(tab.key)}
              className={`px-3 py-1.5 uppercase tracking-wider rounded-[2px] transition-all ${
                selectedStratum === tab.key
                  ? 'bg-[#2457E8] text-[#F4F2ED] font-bold shadow-[0_0_12px_rgba(36,87,232,0.35)]'
                  : 'text-[#848E9D] hover:text-[#F4F2ED]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        {/* SVG Spatial Matrix Canvas (Cols 1-8) */}
        <div className="lg:col-span-8 relative bg-[#080A0F] p-4 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-[#2A3342] spatial-grid">
          {/* Volumetric Atmospheric Background Glows */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[360px] h-[360px] rounded-full bg-[#2457E8]/10 blur-3xl" />
            <div className="w-[200px] h-[200px] rounded-full bg-[#D5A85D]/10 blur-2xl" />
            {/* Architectural Isometric Rings */}
            <div className="w-[240px] h-[240px] rounded-full border border-[#2A3342]/70" />
            <div className="w-[420px] h-[420px] rounded-full border border-dashed border-[#384356]/60 animate-spin" style={{ animationDuration: '180s' }} />
          </div>

          <svg viewBox="0 0 100 100" className="w-full h-full max-h-[520px] select-none cursor-pointer">
            <defs>
              <filter id="topolGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connecting Cords & Energy Rays */}
            {filteredNodes.map((source) => {
              return source.connections.map((targetId) => {
                const target = filteredNodes.find((n) => n.id === targetId);
                if (!target || source.id > target.id) return null;

                const isLineActive =
                  (hoveredNodeId === source.id && connectedIds.has(target.id)) ||
                  (hoveredNodeId === target.id && connectedIds.has(source.id)) ||
                  (!hoveredNodeId && (selectedNodeId === source.id || selectedNodeId === target.id));

                const isDebt = source.stratum === 'DEBT_FACILITY' || target.stratum === 'DEBT_FACILITY';

                return (
                  <motion.line
                    key={`${source.id}-${target.id}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={isLineActive ? (isDebt ? '#D5A85D' : '#2457E8') : '#2A3342'}
                    strokeWidth={isLineActive ? '0.75' : '0.25'}
                    strokeDasharray={isDebt ? '1.2 1.2' : undefined}
                    opacity={isLineActive ? 0.95 : 0.35}
                    transition={{ duration: 0.2 }}
                  />
                );
              });
            })}

            {/* Render Stratum Nodes */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isConnected = connectedIds.has(node.id);
              const mat = getMaterialClasses(node.material);

              const opacity = hoveredNodeId ? (isHovered || isConnected ? 1 : 0.25) : 1;
              const nodeRadius = (node.stratum === 'TRUST_ROOT' ? 4.2 : 2.8) * node.depthZ;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="cursor-pointer transition-transform"
                >
                  {/* Subtle Pulse Ring */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={nodeRadius * 1.8}
                      fill="none"
                      stroke={node.stratum === 'DEBT_FACILITY' ? '#D5A85D' : '#2457E8'}
                      strokeWidth="0.4"
                      className="animate-ping origin-center"
                      style={{ animationDuration: '3s' }}
                    />
                  )}

                  {/* Outer Orbit Border */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeRadius}
                    fill="#171B23"
                    stroke={isSelected ? '#F4F2ED' : '#384356'}
                    strokeWidth={isSelected ? '0.8' : '0.4'}
                    opacity={opacity}
                  />

                  {/* Material Core Sphere */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeRadius * 0.6}
                    className={mat.core}
                    opacity={opacity}
                    filter="url(#topolGlow)"
                  />

                  {/* Technical Label Below */}
                  <text
                    x={node.x}
                    y={node.y + nodeRadius + 3.2}
                    textAnchor="middle"
                    className="font-mono text-[2.5px] uppercase tracking-wider fill-[#F4F2ED] font-semibold"
                    opacity={opacity}
                  >
                    {node.name.length > 22 ? `${node.name.slice(0, 20)}...` : node.name}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + nodeRadius + 5.8}
                    textAnchor="middle"
                    className="font-mono text-[1.9px] fill-[#848E9D]"
                    opacity={opacity}
                  >
                    {node.code} • {node.valuationFormatted.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Helper Badge */}
          <div className="absolute bottom-4 left-4 bg-[#171B23]/90 backdrop-blur-md border border-[#2A3342] px-3.5 py-1.5 rounded-[2px] font-mono text-[10px] text-[#B9C1CC] flex items-center gap-2 shadow-lg">
            <Info className="w-3.5 h-3.5 text-[#2457E8]" /> Interactive spatial topology • Hover node to trace legal beneficial links
          </div>
        </div>

        {/* Node Inspection Flyout Panel (Cols 9-12) */}
        <div className="lg:col-span-4 p-6 bg-[#171B23] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNode.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="space-y-5"
            >
              <div>
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[2px] font-bold uppercase tracking-wider border ${
                      getMaterialClasses(activeNode.material).badge
                    }`}
                  >
                    {activeNode.stratum} // {activeNode.status}
                  </span>
                  <span className="text-[#848E9D]">{activeNode.code}</span>
                </div>

                <h3 className="font-display font-bold text-2xl text-[#F4F2ED] mt-2.5 leading-snug">
                  {activeNode.name}
                </h3>
                <div className="font-mono text-xs text-[#2457E8] mt-1">{activeNode.jurisdiction}</div>
                <div className="font-mono text-[10px] text-[#848E9D] mt-0.5">{activeNode.panCin}</div>
              </div>

              {/* Metric Card */}
              <div className="p-4 bg-[#080A0F] border border-[#2A3342] rounded-[2px] space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#848E9D]">
                  LEGAL REGISTER VALUE / ATTRIBUTION
                </div>
                <div className="font-display font-bold text-3xl text-[#F4F2ED]">
                  {activeNode.valuationFormatted}
                </div>
                {activeNode.equityPercentage && (
                  <div className="font-mono text-xs text-[#D5A85D] font-bold">
                    Effective Family Beneficial Equity: {activeNode.equityPercentage}
                  </div>
                )}
              </div>

              {/* Fiduciary Directives */}
              <div className="space-y-1.5">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#848E9D]">
                  FIDUCIARY GOVERNANCE DIRECTIVES
                </div>
                <p className="font-sans text-xs text-[#B9C1CC] leading-relaxed">
                  {activeNode.fiduciaryNotes}
                </p>
              </div>

              {/* Connected Strands List */}
              <div className="space-y-2 pt-2 border-t border-[#2A3342]">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#848E9D]">
                  CONNECTED STRATA ({activeNode.connections.length} STRANDS)
                </div>
                <div className="max-h-44 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
                  {activeNode.connections.map((cId) => {
                    const cNode = nodes.find((n) => n.id === cId);
                    if (!cNode) return null;
                    return (
                      <button
                        key={cId}
                        onClick={() => setSelectedNodeId(cId)}
                        className="w-full text-left p-2 rounded-[2px] bg-[#1E242F] hover:bg-[#262D3B] border border-[#2A3342] hover:border-[#2457E8] transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-[#F4F2ED]">{cNode.name}</div>
                          <div className="text-[10px] text-[#848E9D]">{cNode.code} • {cNode.stratum}</div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-[#848E9D]" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action Trigger */}
          <div className="pt-4 border-t border-[#2A3342] mt-6 flex items-center gap-2">
            <button
              onClick={() => setSelectedNodeId('node-root')}
              className="flex-1 py-2.5 bg-[#2457E8] text-[#F4F2ED] font-mono text-xs uppercase tracking-wider font-semibold rounded-[2px] hover:bg-[#1B46CB] transition-colors shadow-lg"
            >
              Recenter to Trust Root
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
