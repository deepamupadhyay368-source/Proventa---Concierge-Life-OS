'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PieChart,
  Users,
  Coins,
  CreditCard,
  ArrowLeftRight,
  Lock,
  ShieldCheck,
  Target,
  Network,
  BrainCircuit,
  FileSpreadsheet,
  Settings,
  ChevronDown,
  Search,
  Bell,
  Sparkles,
  Plus,
  X,
  Menu,
  CheckCircle2,
  Send,
  Building2,
  Terminal,
  ShieldAlert,
  Activity,
  Orbit,
} from 'lucide-react';
import { BRAND_CONFIG, FAMILY_NAV_ITEMS } from '@/lib/brand';
import { cn } from '@/lib/utils';
import { IntelligencePulse } from './universe/IntelligencePulse';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  PieChart,
  Users,
  Coins,
  CreditCard,
  ArrowLeftRight,
  Lock,
  ShieldCheck,
  Target,
  Network,
  BrainCircuit,
  FileSpreadsheet,
  Settings,
};

export function WealthAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState('fam_sharma_heritage');
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiChat, setAiChat] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string; agent?: string }>>([
    {
      role: 'assistant',
      text: 'PROVENTA LIVING FINANCIAL UNIVERSE // MULTI-AGENT INTELLIGENCE ACTIVE\n\nWorkspace: Sharma Family Trust & Holdings [FWS-001]\nCalculation Core: Deterministic Integer Paise (0 drift, 100% mathematical audit)\nAll 6 specialized intelligence desks synchronized: Treasury, Vault Forensics, Cap-Table, Continuity, Protection, and Macro Allocation.',
      time: '09:00 IST',
      agent: 'ORCHESTRATOR',
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Available Workspaces for Rajesh Sharma
  const workspaces = [
    {
      id: 'fam_sharma_heritage',
      name: 'Sharma Family Trust & Holdings',
      type: 'FAMILY OFFICE',
      role: 'TRUSTEE / OWNER',
      membersCount: 4,
      code: 'FWS-001',
    },
    {
      id: 'ind_usr_rajesh_sharma',
      name: 'Rajesh Sharma (Personal Universe)',
      type: 'INDIVIDUAL',
      role: 'PRIMARY BENEFICIARY',
      membersCount: 1,
      code: 'IND-082',
    },
  ];

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  const handleSendAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || isAiLoading) return;

    const userText = aiQuery.trim();
    setAiQuery('');
    setAiChat((prev) => [...prev, { role: 'user', text: userText, time: 'Just now' }]);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/wealth/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: currentWorkspaceId,
          query: userText,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiChat((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.data.content,
            time: 'Just now',
            agent: data.data.agentRole || 'ANALYST',
          },
        ]);
      } else {
        setAiChat((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'RESEARCH EXCEPTION: Unable to resolve query across active portfolio indices.',
            time: 'Just now',
            agent: 'SYSTEM',
          },
        ]);
      }
    } catch (err) {
      setAiChat((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'CONNECTION FAULT: Telemetry network timeout.',
          time: 'Just now',
          agent: 'SYSTEM',
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      {/* LIVING FINANCIAL UNIVERSE TOP BAR */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 lg:px-8 flex items-center justify-between gap-4 shadow-sm">
        {/* Left: Mobile trigger + Monogram + Wordmark + Workspace Selector */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-2 text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg"
            aria-label="Open Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Geometric Monogram & Universe Wordmark */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-[#2563EB] text-white flex items-center justify-center font-display font-bold text-sm tracking-tighter rounded-lg shadow-sm shadow-blue-500/25 transition-all group-hover:bg-[#1D4ED8]">
              P
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-display text-lg tracking-[0.12em] uppercase font-bold text-[#0F172A] leading-none">
                {BRAND_CONFIG.name}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#2563EB] font-medium mt-0.5">
                LIVING FINANCIAL UNIVERSE
              </span>
            </div>
          </Link>

          <div className="h-6 w-[1px] bg-[#E2E8F0] mx-1 hidden md:block" />

          {/* Precision Workspace Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-[#F8FAFC] hover:bg-white border border-[#CBD5E1] hover:border-[#94A3B8] text-xs font-mono transition-colors rounded-lg shadow-sm"
            >
              <span className="text-[10px] text-[#2563EB] font-bold">{currentWorkspace.code}</span>
              <span className="font-medium text-[#0F172A] max-w-[130px] sm:max-w-[220px] truncate">
                {currentWorkspace.name}
              </span>
              <ChevronDown className="w-3 h-3 text-[#64748B]" />
            </button>

            {isWorkspaceMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-80 bg-white border border-[#CBD5E1] shadow-xl p-2 z-50 rounded-xl">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#64748B] px-3 py-1.5 border-b border-[#E2E8F0]">
                  Connected Workspaces
                </div>
                <div className="py-1 space-y-1">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setCurrentWorkspaceId(ws.id);
                        setIsWorkspaceMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs font-mono transition-colors border rounded-lg ${
                        ws.id === currentWorkspaceId
                          ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                          : 'border-transparent text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{ws.name}</div>
                        <div className={`text-[10px] mt-0.5 ${ws.id === currentWorkspaceId ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
                          {ws.type} · {ws.role}
                        </div>
                      </div>
                      {ws.id === currentWorkspaceId && (
                        <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-[#E2E8F0]">
                  <Link
                    href="/family"
                    onClick={() => setIsWorkspaceMenuOpen(false)}
                    className="w-full px-3 py-2 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#475569] hover:text-[#2563EB] hover:bg-[#F8FAFC] rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Register New Family Trust
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Utility Bar: Intelligence Pulse, Research Console, Profile */}
        <div className="flex items-center gap-3">
          {/* Living Telemetry Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-[#F0FDFA] border border-[#99F6E4] font-mono text-[11px] text-[#0D9488] rounded-full">
            <span className="w-2 h-2 bg-[#0D9488] rounded-full animate-pulse" />
            <span>INTEGER PAISE ENGINE // ACTIVE</span>
          </div>

          {/* Proprietary Intelligence Pulse Trigger */}
          <IntelligencePulse />

          {/* Integrated Research Console Trigger */}
          <button
            type="button"
            onClick={() => setIsAIOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-mono text-xs uppercase tracking-wider transition-all rounded-lg shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline font-semibold">Research Console</span>
          </button>

          {/* Audit Reports */}
          <Link
            href="/reports"
            className="p-2 border border-[#CBD5E1] bg-white text-[#475569] hover:text-[#0F172A] hover:border-[#2563EB] transition-colors rounded-lg shadow-sm"
            title="Consolidated Statements"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </Link>

          {/* User Profile */}
          <Link
            href="/settings"
            className="flex items-center gap-2.5 pl-2 border-l border-[#E2E8F0]"
          >
            <div className="w-8 h-8 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg flex items-center justify-center font-mono text-xs font-bold text-[#1D4ED8] shadow-sm">
              RS
            </div>
            <div className="hidden lg:block text-left font-mono">
              <div className="text-xs font-semibold text-[#0F172A] leading-none">R. Sharma</div>
              <div className="text-[10px] text-[#64748B] mt-0.5">Trustee // Owner</div>
            </div>
          </Link>
        </div>
      </header>

      {/* MAIN LAYOUT: SIDEBAR + CONTENT CANVAS */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP PEARL WHITE SIDEBAR */}
        <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-[#E2E8F0] shrink-0 p-4 space-y-6 overflow-y-auto shadow-sm">
          <div className="space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#64748B] px-3 py-1.5 border-b border-[#E2E8F0] mb-2 flex items-center justify-between">
              <span>UNIVERSE // 13 REGISTERS</span>
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            </div>
            {FAMILY_NAV_ITEMS.map((item, index) => {
              const Icon = ICON_MAP[item.icon] || LayoutDashboard;
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);

              const indexNumber = String(index + 1).padStart(2, '0');

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-mono transition-all rounded-lg border ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE] border-l-4 border-l-[#2563EB] font-semibold shadow-sm'
                      : 'border-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`text-[10px] font-mono ${isActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`}>
                      {indexNumber}
                    </span>
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      isActive ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-[#F1F5F9] text-[#2563EB] border-[#E2E8F0]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Living Universe Integrity Stamp */}
          <div className="mt-auto p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#64748B] flex items-center justify-between">
              <span>LEDGER INTEGRITY</span>
              <span className="text-[#0D9488] font-bold">100% PAISE</span>
            </div>
            <div className="text-xs text-[#475569] leading-relaxed">
              Every balance computed deterministically in integer paise with zero floating-point drift.
            </div>
            <div className="font-mono text-[10px] text-[#64748B] pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
              <span>DPDP ACT 2023</span>
              <span className="text-[#2563EB] font-medium">AES-GCM-256</span>
            </div>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
            <div className="relative w-80 bg-white border-r border-[#E2E8F0] p-5 flex flex-col space-y-4 z-10 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#2563EB] text-white flex items-center justify-center font-mono text-xs font-bold rounded-lg">
                    P
                  </div>
                  <span className="font-display text-lg uppercase tracking-wider text-[#0F172A] font-bold">PROVENTA</span>
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 border border-[#CBD5E1] text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                {FAMILY_NAV_ITEMS.map((item, index) => {
                  const Icon = ICON_MAP[item.icon] || LayoutDashboard;
                  const isActive = pathname.startsWith(item.href);
                  const indexNumber = String(index + 1).padStart(2, '0');
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 text-xs font-mono border rounded-lg ${
                        isActive
                          ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE] border-l-4 border-l-[#2563EB]'
                          : 'border-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                      }`}
                    >
                      <span className="text-[10px] text-[#94A3B8]">{indexNumber}</span>
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT CANVAS */}
        <main className="flex-1 overflow-y-auto bg-[#FAFBFC]">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {/* AI RESEARCH CONSOLE (SLIDE-OVER PANEL) */}
      {isAIOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white border-l border-[#E2E8F0] shadow-2xl flex flex-col font-sans">
          {/* Header */}
          <div className="p-4 bg-[#F8FAFC] text-[#0F172A] border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#2563EB] text-white flex items-center justify-center font-mono text-xs font-bold rounded-lg">
                AI
              </div>
              <div>
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#0F172A] font-bold">PROVENTA INTELLIGENCE</h3>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#2563EB]">6 Multi-Agent Desks</p>
              </div>
            </div>
            <button
              onClick={() => setIsAIOpen(false)}
              className="p-1 border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Observation Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {aiChat.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#2563EB] mb-1 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full" />
                    <span>AGENT // {msg.agent || 'ANALYST'}</span>
                  </div>
                )}
                <div
                  className={`max-w-[92%] p-3.5 text-xs leading-relaxed border rounded-xl ${
                    msg.role === 'user'
                      ? 'bg-[#2563EB] text-white border-[#2563EB] font-mono shadow-sm'
                      : 'bg-[#F8FAFC] text-[#334155] border-[#E2E8F0] font-sans'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="font-mono text-[9px] text-[#94A3B8] mt-1">{msg.time}</span>
              </div>
            ))}
            {isAiLoading && (
              <div className="p-3 bg-[#F0FDFA] border border-[#99F6E4] rounded-lg flex items-center gap-2 font-mono text-xs text-[#0D9488]">
                <span className="w-2 h-2 bg-[#0D9488] rounded-full animate-ping" />
                <span>INDEXING FAMILY PORTFOLIO TELEMETRY...</span>
              </div>
            )}
          </div>

          {/* Research Query Input */}
          <form onSubmit={handleSendAi} className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex gap-2">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Query equity split, vault documents, liability debt service..."
              className="flex-1 bg-white border border-[#CBD5E1] px-3.5 py-2 text-xs font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-lg"
            />
            <button
              type="submit"
              disabled={isAiLoading || !aiQuery.trim()}
              className="px-4 py-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-mono text-xs uppercase tracking-wider disabled:opacity-50 transition-colors rounded-lg shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default WealthAppShell;
