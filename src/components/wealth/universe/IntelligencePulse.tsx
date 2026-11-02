'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldAlert,
  TrendingUp,
  FileCheck2,
  Calendar,
  ChevronRight,
  X,
  ExternalLink,
  Bot,
  Activity,
} from 'lucide-react';

export interface IntelligenceObservation {
  id: string;
  desk: 'ASSET_INTELLIGENCE' | 'CASHFLOW_ANALYST' | 'DOCUMENT_INTELLIGENCE' | 'WEALTH_ANALYST';
  severity: 'OPPORTUNITY' | 'ALERT' | 'INTEGRITY';
  title: string;
  summary: string;
  citation: string;
  actionText: string;
  timestamp: string;
}

const DEFAULT_OBSERVATIONS: IntelligenceObservation[] = [
  {
    id: 'OBS-401',
    desk: 'ASSET_INTELLIGENCE',
    severity: 'OPPORTUNITY',
    title: 'SGB Tranche 2018-VI Redemption Window Approaching',
    summary: 'RBI Sovereign Gold Bond tranche maturing on 18 Dec 2026. Capital gains tax is 100% exempt upon redemption.',
    citation: 'AST-003 // RBI SGB Demat Holding 400 Units',
    actionText: 'Review Reinvestment Strategy',
    timestamp: '12m ago',
  },
  {
    id: 'OBS-402',
    desk: 'CASHFLOW_ANALYST',
    severity: 'INTEGRITY',
    title: 'Surplus Treasury Yield Optimization Identified',
    summary: '₹1.80 Cr in low-yield operational sweep account can be deployed into AAA Corporate Liquid Funds @ 7.85% p.a.',
    citation: 'CSH-002 // HDFC Escrow Operating Balance',
    actionText: 'Run Scenario Simulation',
    timestamp: '42m ago',
  },
  {
    id: 'OBS-403',
    desk: 'DOCUMENT_INTELLIGENCE',
    severity: 'ALERT',
    title: 'BKC Commercial Unit Fire & Hazard Policy Renewal Due',
    summary: 'Commercial property insurance policy POL-COM-882 expires in 28 days. Renewal premium estimate ₹1.45 Lakh.',
    citation: 'DOC-912 // HDFC ERGO Commercial Policy',
    actionText: 'Initiate Premium Payment',
    timestamp: '2h ago',
  },
];

export function IntelligencePulse({
  observations = DEFAULT_OBSERVATIONS,
  className = '',
}: {
  observations?: IntelligenceObservation[];
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedObs, setSelectedObs] = useState<IntelligenceObservation | null>(null);

  return (
    <>
      {/* Trigger Button with Living Subtle Pulse */}
      <button
        onClick={() => setIsOpen(true)}
        className={`relative inline-flex items-center gap-2.5 px-3 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#2563EB] rounded-full shadow-sm hover:shadow transition-all group ${className}`}
      >
        {/* Dual Ring Living Pulse */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0D9488] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0D9488]" />
        </span>

        <span className="font-mono text-xs font-medium text-[#1E293B] group-hover:text-[#2563EB] transition-colors">
          INTELLIGENCE PULSE
        </span>

        <span className="px-1.5 py-0.2 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] font-mono text-[10px] font-bold rounded-full">
          {observations.length}
        </span>
      </button>

      {/* Slide-over Observation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-[#0F172A]/30 backdrop-blur-sm"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                className="w-screen max-w-md bg-white border-l border-[#E2E8F0] shadow-2xl flex flex-col justify-between"
              >
                {/* Header */}
                <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488] animate-pulse" />
                      <span className="font-mono text-xs uppercase tracking-wider text-[#64748B] font-semibold">
                        SYSTEM 03 // INTELLIGENCE PULSE
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-xl text-[#0F172A] mt-1">
                      Active AI Observations
                    </h3>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Deterministic audit telemetry across 6 specialized desks.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-[#F1F5F9] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Desk Telemetry Strip */}
                <div className="px-6 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                  <div className="flex items-center gap-1.5 text-[#0D9488]">
                    <Activity className="w-3.5 h-3.5" />
                    <span>6 DESKS ACTIVE</span>
                  </div>
                  <span>DPDP ACT ENCRYPTED</span>
                </div>

                {/* Observations Stream */}
                <div className="p-6 flex-1 overflow-y-auto space-y-4">
                  {observations.map((obs) => {
                    const isAlert = obs.severity === 'ALERT';
                    const isOpportunity = obs.severity === 'OPPORTUNITY';

                    return (
                      <div
                        key={obs.id}
                        className="p-4 bg-white border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-md rounded-xl transition-all space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border ${
                              isAlert
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : isOpportunity
                                ? 'bg-[#F0FDFA] text-[#0D9488] border-[#99F6E4]'
                                : 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                            }`}
                          >
                            {obs.severity} // {obs.desk.replace('_', ' ')}
                          </span>
                          <span className="font-mono text-[11px] text-[#94A3B8]">{obs.timestamp}</span>
                        </div>

                        <h4 className="font-display font-bold text-sm text-[#0F172A] leading-snug">
                          {obs.title}
                        </h4>

                        <p className="text-xs text-[#475569] leading-relaxed">
                          {obs.summary}
                        </p>

                        <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                          <span className="font-mono text-[10px] text-[#64748B] truncate max-w-[200px]">
                            {obs.citation}
                          </span>
                          <button className="text-[#2563EB] hover:text-[#1D4ED8] font-medium font-mono text-xs flex items-center gap-1 hover:underline">
                            {obs.actionText} <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Trigger */}
                <div className="p-6 border-t border-[#E2E8F0] bg-[#FAFBFC] flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[#64748B]">
                    Zero automated executions without trustee sign-off.
                  </span>
                  <a
                    href="/intelligence"
                    className="px-4 py-2 bg-[#2563EB] text-white text-xs font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors shadow-sm"
                  >
                    Open Intelligence Console
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
