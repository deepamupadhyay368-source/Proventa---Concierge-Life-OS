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
} from 'lucide-react';
import { BRAND_CONFIG, FAMILY_NAV_ITEMS } from '@/lib/brand';
import { cn } from '@/lib/utils';

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
      text: 'PROVENTA INTELLIGENCE CONSOLE // TITANIUM COBALT ACTIVE\n\nWorkspace: Sharma Family Trust & Holdings [FWS-001]\nCalculation Core: Deterministic Integer Paise (0 drift, 100% mathematical audit)\nAll 6 specialized intelligence desks synchronized: Treasury, Vault Forensics, Cap-Table, Continuity, Protection, and Macro Allocation.',
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
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] flex flex-col font-sans selection:bg-[#2457FF] selection:text-[#F4F6FA]">
      {/* TITANIUM COBALT TOP BAR */}
      <header className="sticky top-0 z-40 h-16 bg-[#171C26] border-b border-[#252C38] px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile trigger + Geometric P Monogram + Wordmark + Workspace Selector */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-2 text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] border border-[#252C38] rounded-[2px]"
            aria-label="Open Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Architectural Geometric Monogram & Titanium Wordmark */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-[#2457FF] text-[#F4F6FA] flex items-center justify-center font-mono font-bold text-sm tracking-tighter border border-[#7595FF]/40 rounded-[2px] transition-all group-hover:bg-[#1B46D9]">
              P
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-display text-lg tracking-[0.16em] uppercase font-bold text-[#F4F6FA] leading-none">
                {BRAND_CONFIG.name}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#7595FF] mt-0.5">
                FAMILY WEALTH OS
              </span>
            </div>
          </Link>

          <div className="h-6 w-[1px] bg-[#252C38] mx-1 hidden md:block" />

          {/* Precision Workspace Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-[#090B10] hover:bg-[#1C2230] border border-[#252C38] text-xs font-mono transition-colors rounded-[2px]"
            >
              <span className="text-[10px] text-[#7595FF] font-semibold">{currentWorkspace.code}</span>
              <span className="font-medium text-[#F4F6FA] max-w-[130px] sm:max-w-[220px] truncate">
                {currentWorkspace.name}
              </span>
              <ChevronDown className="w-3 h-3 text-[#858D9B]" />
            </button>

            {isWorkspaceMenuOpen && (
              <div className="absolute left-0 mt-1 w-80 bg-[#171C26] border border-[#252C38] shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-2 z-50 rounded-[2px]">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#858D9B] px-3 py-1.5 border-b border-[#252C38]">
                  Institutional Workspaces
                </div>
                <div className="py-1 space-y-1">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setCurrentWorkspaceId(ws.id);
                        setIsWorkspaceMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs font-mono transition-colors border rounded-[2px] ${
                        ws.id === currentWorkspaceId
                          ? 'bg-[#2457FF]/15 text-[#F4F6FA] border-[#2457FF]'
                          : 'border-transparent text-[#C5CAD3] hover:bg-[#252C38] hover:text-[#F4F6FA]'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{ws.name}</div>
                        <div className={`text-[10px] mt-0.5 ${ws.id === currentWorkspaceId ? 'text-[#7595FF]' : 'text-[#858D9B]'}`}>
                          {ws.type} · {ws.role}
                        </div>
                      </div>
                      {ws.id === currentWorkspaceId && (
                        <CheckCircle2 className="w-4 h-4 text-[#7595FF]" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-[#252C38]">
                  <Link
                    href="/family"
                    onClick={() => setIsWorkspaceMenuOpen(false)}
                    className="w-full px-3 py-2 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#C5CAD3] hover:text-[#7595FF] hover:bg-[#252C38] rounded-[2px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Register New Family Trust
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Utility Bar: Status, AI Console trigger, Profile */}
        <div className="flex items-center gap-3">
          {/* Cobalt Telemetry Badge */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-[#090B10] border border-[#252C38] font-mono text-[10px] uppercase tracking-wider text-[#C5CAD3] rounded-[2px]">
            <span className="w-1.5 h-1.5 bg-[#2457FF] rounded-full animate-pulse" />
            <span>PAISE-PRECISION ENGINE // ACTIVE</span>
          </div>

          {/* Integrated Research Console Trigger */}
          <button
            type="button"
            onClick={() => setIsAIOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] font-mono text-xs uppercase tracking-wider transition-all border border-[#7595FF]/40 rounded-[2px]"
          >
            <Terminal className="w-3.5 h-3.5 text-[#F4F6FA]" />
            <span className="hidden sm:inline font-semibold">Research Console</span>
          </button>

          {/* Audit Reports */}
          <Link
            href="/reports"
            className="p-2 border border-[#252C38] bg-[#090B10] text-[#C5CAD3] hover:text-[#F4F6FA] hover:border-[#7595FF]/40 transition-colors rounded-[2px]"
            title="Consolidated Statements"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </Link>

          {/* User Profile */}
          <Link
            href="/settings"
            className="flex items-center gap-2.5 pl-2 border-l border-[#252C38]"
          >
            <div className="w-8 h-8 bg-[#252C38] border border-[#364052] rounded-[2px] flex items-center justify-center font-mono text-xs font-bold text-[#F4F6FA]">
              RS
            </div>
            <div className="hidden lg:block text-left font-mono">
              <div className="text-xs font-semibold text-[#F4F6FA] leading-none">R. Sharma</div>
              <div className="text-[9px] uppercase tracking-wider text-[#858D9B] mt-0.5">Trustee // Owner</div>
            </div>
          </Link>
        </div>
      </header>

      {/* MAIN LAYOUT: GRAPHITE SIDEBAR + CONTENT CANVAS */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP DARK GRAPHITE SIDEBAR */}
        <aside className="hidden lg:flex w-64 flex-col bg-[#171C26] border-r border-[#252C38] shrink-0 p-4 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#858D9B] px-3 py-1.5 border-b border-[#252C38] mb-2 flex items-center justify-between">
              <span>INDEX // 13 REGISTERS</span>
              <span className="w-1.5 h-1.5 bg-[#2457FF]" />
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
                  className={`flex items-center justify-between px-3 py-2 text-xs font-mono transition-all rounded-[2px] border ${
                    isActive
                      ? 'bg-[#2457FF]/15 text-[#F4F6FA] border-[#2457FF] border-l-4 font-semibold shadow-[0_0_15px_rgba(36,87,255,0.15)]'
                      : 'border-transparent text-[#C5CAD3] hover:bg-[#252C38] hover:text-[#F4F6FA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`text-[10px] font-mono ${isActive ? 'text-[#7595FF]' : 'text-[#858D9B]'}`}>
                      {indexNumber}
                    </span>
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#7595FF]' : 'text-[#858D9B]'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-[2px] border ${
                      isActive ? 'bg-[#2457FF] text-[#F4F6FA] border-[#2457FF]' : 'bg-[#090B10] text-[#7595FF] border-[#252C38]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Titanium Integrity Stamp */}
          <div className="mt-auto p-3 bg-[#090B10] border border-[#252C38] rounded-[2px] space-y-2">
            <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#858D9B] flex items-center justify-between">
              <span>LEDGER AUDIT</span>
              <span className="text-[#7595FF] font-bold">100% PAISE</span>
            </div>
            <div className="text-[11px] text-[#C5CAD3] leading-snug">
              Every balance computed deterministically in integer paise with zero floating-point drift.
            </div>
            <div className="font-mono text-[9px] text-[#858D9B] pt-1.5 border-t border-[#252C38] flex items-center justify-between">
              <span>DPDP ACT 2023</span>
              <span className="text-[#7595FF]">AES-GCM-256</span>
            </div>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-[#090B10]/80 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
            <div className="relative w-80 bg-[#171C26] border-r border-[#252C38] p-5 flex flex-col space-y-4 z-10 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#252C38]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#2457FF] text-[#F4F6FA] flex items-center justify-center font-mono text-xs font-bold rounded-[2px]">
                    P
                  </div>
                  <span className="font-display text-lg uppercase tracking-wider text-[#F4F6FA] font-bold">PROVENTA</span>
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 border border-[#252C38] text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] rounded-[2px]"
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
                      className={`flex items-center gap-3 px-3 py-2 text-xs font-mono border rounded-[2px] ${
                        isActive
                          ? 'bg-[#2457FF]/15 text-[#F4F6FA] border-[#2457FF] border-l-4'
                          : 'border-transparent text-[#C5CAD3] hover:bg-[#252C38] hover:text-[#F4F6FA]'
                      }`}
                    >
                      <span className="text-[10px] text-[#858D9B]">{indexNumber}</span>
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
        <main className="flex-1 overflow-y-auto bg-[#090B10]">
          <div className="max-w-[1520px] mx-auto p-4 sm:p-6 lg:p-10">{children}</div>
        </main>
      </div>

      {/* AI RESEARCH CONSOLE (SLIDE-OVER PANEL) */}
      {isAIOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#171C26] border-l border-[#252C38] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col font-sans">
          {/* Header */}
          <div className="p-4 bg-[#090B10] text-[#F4F6FA] border-b border-[#252C38] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-[#2457FF] text-[#F4F6FA] flex items-center justify-center font-mono text-xs font-bold rounded-[2px]">
                AI
              </div>
              <div>
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#F4F6FA] font-bold">PROVENTA INTELLIGENCE</h3>
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#7595FF]">6 Multi-Agent Desks</p>
              </div>
            </div>
            <button
              onClick={() => setIsAIOpen(false)}
              className="p-1 border border-[#252C38] text-[#C5CAD3] hover:bg-[#252C38] hover:text-[#F4F6FA] transition-colors rounded-[2px]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Terminal Observation Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#171C26]">
            {aiChat.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[#7595FF] mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#2457FF]" />
                    <span>AGENT // {msg.agent || 'ANALYST'}</span>
                  </div>
                )}
                <div
                  className={`max-w-[92%] p-3.5 text-xs leading-relaxed border rounded-[2px] ${
                    msg.role === 'user'
                      ? 'bg-[#2457FF] text-[#F4F6FA] border-[#2457FF] font-mono'
                      : 'bg-[#090B10] text-[#C5CAD3] border-[#252C38] font-sans'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="font-mono text-[9px] text-[#858D9B] mt-1">{msg.time}</span>
              </div>
            ))}
            {isAiLoading && (
              <div className="p-3 bg-[#090B10] border border-[#252C38] rounded-[2px] flex items-center gap-2 font-mono text-xs text-[#7595FF]">
                <span className="w-2 h-2 bg-[#2457FF] animate-ping" />
                <span>INDEXING FAMILY PORTFOLIO TELEMETRY...</span>
              </div>
            )}
          </div>

          {/* Research Console Query Input */}
          <form onSubmit={handleSendAi} className="p-3 bg-[#090B10] border-t border-[#252C38] flex gap-2">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Query equity split, vault documents, liability debt service..."
              className="flex-1 bg-[#171C26] border border-[#252C38] px-3 py-2 text-xs font-mono text-[#F4F6FA] placeholder-[#858D9B] focus:outline-none focus:border-[#2457FF] rounded-[2px]"
            />
            <button
              type="submit"
              disabled={isAiLoading || !aiQuery.trim()}
              className="px-4 py-2 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] font-mono text-xs uppercase tracking-wider disabled:opacity-50 transition-colors border border-[#7595FF]/40 rounded-[2px]"
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
