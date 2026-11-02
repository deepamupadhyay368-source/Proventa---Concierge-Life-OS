'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, TrendingUp, Users, Building, Coins, ArrowUpRight } from 'lucide-react';
import { CursorTiltContainer, OrbitalFloat } from './MotionPrimitives';

export function HeroUniverseVisual() {
  const [activeTab, setActiveTab] = useState<'constellation' | 'growth' | 'vault'>('constellation');

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Ambient Lighting & Orbital Rings Backdrop */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-gradient-to-tr from-blue-100/40 via-indigo-50/20 to-teal-50/40 blur-3xl" />
        <div className="absolute w-[420px] h-[420px] rounded-full border border-blue-200/40 animate-spin" style={{ animationDuration: '90s' }} />
        <div className="absolute w-[620px] h-[620px] rounded-full border border-dashed border-slate-200/60 animate-spin" style={{ animationDuration: '140s' }} />
      </div>

      {/* Main Interactive Floating Display */}
      <CursorTiltContainer className="relative z-10">
        <div className="bg-white/95 backdrop-blur-xl border border-[#E2E8F0] rounded-2xl shadow-[0_20px_60px_-15px_rgba(30,27,75,0.08),0_4px_16px_0_rgba(37,99,235,0.06)] p-6 sm:p-8 overflow-hidden">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-display font-bold text-sm shadow-md shadow-blue-500/20">
                P
              </div>
              <div>
                <div className="font-display font-bold text-base text-[#0F172A] tracking-tight">
                  Sharma Family Trust & Holdings
                </div>
                <div className="font-mono text-[11px] text-[#64748B] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
                  <span>LIVE UNIVERSE TELEMETRY // FWS-001</span>
                </div>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center p-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab('constellation')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'constellation'
                    ? 'bg-white text-[#2563EB] shadow-sm font-semibold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Capital Universe
              </button>
              <button
                onClick={() => setActiveTab('growth')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'growth'
                    ? 'bg-white text-[#2563EB] shadow-sm font-semibold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Living Trajectory
              </button>
              <button
                onClick={() => setActiveTab('vault')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'vault'
                    ? 'bg-white text-[#2563EB] shadow-sm font-semibold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Vault & Governance
              </button>
            </div>
          </div>

          {/* Interactive Visual Stage */}
          <div className="py-6 min-h-[300px] sm:min-h-[340px] flex flex-col justify-center">
            {activeTab === 'constellation' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Net Worth Odometer */}
                <div className="text-center">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#64748B] font-medium">
                    CONSOLIDATED LIVING NET WORTH
                  </span>
                  <div className="font-display font-bold text-4xl sm:text-6xl text-[#0F172A] tracking-tight mt-1">
                    ₹94,20,00,000
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-[#F0FDFA] text-[#0D9488] border border-[#99F6E4] rounded-full text-xs font-mono">
                    <TrendingUp className="w-3.5 h-3.5" /> +₹11.60 Cr Accretion (TTM) • 100% Integer Paise Math
                  </div>
                </div>

                {/* Interactive Orbital Node Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:bg-white rounded-xl transition-all shadow-sm">
                    <div className="flex items-center justify-between text-xs text-[#64748B]">
                      <span className="font-mono text-[10px]">AST-01 // EQUITIES</span>
                      <Building className="w-3.5 h-3.5 text-[#2563EB]" />
                    </div>
                    <div className="font-display font-bold text-lg text-[#0F172A] mt-1">₹42.50 Cr</div>
                    <div className="text-[11px] text-[#64748B] font-mono">Demat & Mutual Funds</div>
                  </div>

                  <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:bg-white rounded-xl transition-all shadow-sm">
                    <div className="flex items-center justify-between text-xs text-[#64748B]">
                      <span className="font-mono text-[10px]">AST-02 // REALTY</span>
                      <Building className="w-3.5 h-3.5 text-[#0D9488]" />
                    </div>
                    <div className="font-display font-bold text-lg text-[#0F172A] mt-1">₹36.00 Cr</div>
                    <div className="text-[11px] text-[#64748B] font-mono">BKC Unit & Land Parcels</div>
                  </div>

                  <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#BFDBFE] hover:bg-white rounded-xl transition-all shadow-sm">
                    <div className="flex items-center justify-between text-xs text-[#64748B]">
                      <span className="font-mono text-[10px]">AST-03 // VENTURES</span>
                      <Coins className="w-3.5 h-3.5 text-[#4338CA]" />
                    </div>
                    <div className="font-display font-bold text-lg text-[#0F172A] mt-1">₹18.50 Cr</div>
                    <div className="text-[11px] text-[#64748B] font-mono">TechVentures (42% Stake)</div>
                  </div>

                  <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-rose-200 hover:bg-white rounded-xl transition-all shadow-sm">
                    <div className="flex items-center justify-between text-xs text-[#64748B]">
                      <span className="font-mono text-[10px]">LIA-01 // DEBT</span>
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                    </div>
                    <div className="font-display font-bold text-lg text-rose-600 mt-1">-₹10.00 Cr</div>
                    <div className="text-[11px] text-[#64748B] font-mono">Commercial Mortgage</div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'growth' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display font-bold text-2xl text-[#0F172A]">
                      Living Trajectory & Inflation Hedge
                    </div>
                    <p className="text-xs text-[#64748B]">
                      Real-time growth curve modeled against 6% long-term CPI inflation.
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-[#BFDBFE]">
                    CAGR: 14.2% p.a.
                  </span>
                </div>

                {/* Mini SVG Trajectory Preview */}
                <div className="h-44 w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex items-center justify-center">
                  <svg viewBox="0 0 400 120" className="w-full h-full">
                    <path
                      d="M 20 100 Q 120 85, 200 65 T 380 20"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="3"
                    />
                    <path
                      d="M 20 100 Q 120 85, 200 65 T 380 20 L 380 110 L 20 110 Z"
                      fill="rgba(37, 99, 235, 0.08)"
                    />
                    <path
                      d="M 20 100 Q 120 92, 200 80 T 380 50"
                      fill="none"
                      stroke="#0D9488"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <circle cx="380" cy="20" r="5" fill="#2563EB" />
                    <circle cx="200" cy="65" r="4" fill="#2563EB" />
                  </svg>
                </div>
              </motion.div>
            )}

            {activeTab === 'vault' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display font-bold text-2xl text-[#0F172A]">
                      Encrypted Deed Vault & Multi-Trustee Shield
                    </div>
                    <p className="text-xs text-[#64748B]">
                      AES-GCM-256 client-side zero-knowledge encryption under DPDP Act 2023.
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#0D9488] bg-[#F0FDFA] px-2.5 py-1 rounded-full border border-[#99F6E4]">
                    100% AIR-GAPPED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-1">
                    <div className="font-mono font-bold text-[#0F172A]">Trust Deed 2019</div>
                    <div className="text-[#64748B]">Registered Sub-Registrar Mumbai</div>
                    <div className="text-[10px] text-[#0D9488] font-mono">SHA-256: e8f2...b41a</div>
                  </div>
                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-1">
                    <div className="font-mono font-bold text-[#0F172A]">BKC Sale Deed</div>
                    <div className="text-[#64748B]">Commercial Title Verified</div>
                    <div className="text-[10px] text-[#0D9488] font-mono">SHA-256: 7a3c...98fd</div>
                  </div>
                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-1">
                    <div className="font-mono font-bold text-[#0F172A]">MCA Share Certificates</div>
                    <div className="text-[#64748B]">TechVentures Series B Form 2</div>
                    <div className="text-[10px] text-[#0D9488] font-mono">SHA-256: 4b11...32cd</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#64748B]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#0D9488] font-medium">
                <ShieldCheck className="w-4 h-4" /> Zero-Knowledge Fiduciary Security
              </span>
              <span>•</span>
              <span>4 Verified Trustees</span>
            </div>
            <a
              href="/dashboard"
              className="text-[#2563EB] hover:text-[#1D4ED8] font-medium flex items-center gap-1 hover:underline"
            >
              Enter Living Operating System <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </CursorTiltContainer>
    </div>
  );
}
