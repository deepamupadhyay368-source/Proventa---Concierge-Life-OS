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
      text: 'PROVENTA RESEARCH CONSOLE INITIALIZED.\n\nActive workspace: Sharma Family Trust & Holdings.\nDeterministic calculation engine active (0 drift, integer paise precision).\nAll 6 specialized intelligence agents standing by for balance queries, deed analysis, or scenario audits.',
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
    <div className="min-h-screen bg-[#F0EDE5] text-[#101010] flex flex-col font-sans selection:bg-[#101010] selection:text-[#F0EDE5]">
      {/* INSTITUTIONAL TOP BAR */}
      <header className="sticky top-0 z-40 h-16 bg-[#FAF9F6] border-b border-[#101010] px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile trigger + Monogram + Wordmark + Workspace Selector */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-2 text-[#101010] hover:bg-[#F0EDE5] border border-[#101010]"
            aria-label="Open Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Architectural Monogram & Wordmark */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-[#101010] text-[#F0EDE5] flex items-center justify-center font-mono font-bold text-sm tracking-tighter border border-[#101010] transition-colors group-hover:bg-[#263B35]">
              P
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-serif text-lg tracking-[0.2em] uppercase font-normal text-[#101010] leading-none">
                {BRAND_CONFIG.name}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#85827B] mt-0.5">
                WEALTH INSTITUTION
              </span>
            </div>
          </Link>

          <div className="h-6 w-[1px] bg-[#101010]/20 mx-1 hidden md:block" />

          {/* Institutional Workspace Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#F0EDE5] border border-[#101010] text-xs font-mono transition-colors"
            >
              <span className="text-[10px] text-[#85827B]">{currentWorkspace.code}</span>
              <span className="font-medium text-[#101010] max-w-[130px] sm:max-w-[220px] truncate">
                {currentWorkspace.name}
              </span>
              <ChevronDown className="w-3 h-3 text-[#101010]" />
            </button>

            {isWorkspaceMenuOpen && (
              <div className="absolute left-0 mt-1 w-80 bg-[#FAF9F6] border border-[#101010] shadow-[4px_4px_0px_0px_#101010] p-2 z-50">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#85827B] px-3 py-1.5 border-b border-[#101010]/15">
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
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs font-mono transition-colors border ${
                        ws.id === currentWorkspaceId
                          ? 'bg-[#101010] text-[#F0EDE5] border-[#101010]'
                          : 'border-transparent text-[#101010] hover:bg-[#F0EDE5]'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{ws.name}</div>
                        <div className={`text-[10px] mt-0.5 ${ws.id === currentWorkspaceId ? 'text-[#B6A68A]' : 'text-[#85827B]'}`}>
                          {ws.type} · {ws.role}
                        </div>
                      </div>
                      {ws.id === currentWorkspaceId && (
                        <CheckCircle2 className="w-4 h-4 text-[#B6A68A]" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-[#101010]/15">
                  <Link
                    href="/family"
                    onClick={() => setIsWorkspaceMenuOpen(false)}
                    className="w-full px-3 py-2 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#101010] hover:bg-[#F0EDE5]"
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
          {/* Institutional Status Badge */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-[#F0EDE5] border border-[#101010]/30 font-mono text-[10px] uppercase tracking-wider text-[#101010]">
            <span className="w-1.5 h-1.5 bg-[#263B35]" />
            <span>SYS.NORMAL // PAISE-PRECISION</span>
          </div>

          {/* Research Console Trigger */}
          <button
            type="button"
            onClick={() => setIsAIOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] font-mono text-xs uppercase tracking-wider transition-colors border border-[#101010]"
          >
            <Terminal className="w-3.5 h-3.5 text-[#B6A68A]" />
            <span className="hidden sm:inline">Research Console</span>
          </button>

          {/* Notifications */}
          <Link
            href="/reports"
            className="p-2 border border-[#101010] bg-[#FAF9F6] text-[#101010] hover:bg-[#F0EDE5] transition-colors relative"
            title="Audit Statements"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </Link>

          {/* User Profile */}
          <Link
            href="/settings"
            className="flex items-center gap-2.5 pl-2 border-l border-[#101010]/20"
          >
            <div className="w-8 h-8 bg-[#FAF9F6] border border-[#101010] flex items-center justify-center font-mono text-xs font-bold text-[#101010]">
              RS
            </div>
            <div className="hidden lg:block text-left font-mono">
              <div className="text-xs font-semibold text-[#101010] leading-none">R. Sharma</div>
              <div className="text-[9px] uppercase tracking-wider text-[#85827B] mt-0.5">Trustee // Owner</div>
            </div>
          </Link>
        </div>
      </header>

      {/* MAIN LAYOUT: SIDEBAR + CONTENT CANVAS */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP INSTITUTIONAL SIDEBAR */}
        <aside className="hidden lg:flex w-64 flex-col bg-[#FAF9F6] border-r border-[#101010] shrink-0 p-4 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#85827B] px-3 py-1.5 border-b border-[#101010]/15 mb-2">
              INDEX // 13 REGISTERS
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
                  className={`flex items-center justify-between px-3 py-2 text-xs font-mono transition-colors border ${
                    isActive
                      ? 'bg-[#101010] text-[#F0EDE5] border-[#101010] font-semibold'
                      : 'border-transparent text-[#101010] hover:bg-[#F0EDE5] hover:border-[#101010]/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`text-[10px] font-mono ${isActive ? 'text-[#B6A68A]' : 'text-[#85827B]'}`}>
                      {indexNumber}
                    </span>
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#FAF9F6]' : 'text-[#101010]'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1 py-0.2 border ${
                      isActive ? 'bg-[#263B35] text-[#FAF9F6] border-[#263B35]' : 'bg-[#F0EDE5] text-[#101010] border-[#101010]/20'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Institutional Integrity Stamp */}
          <div className="mt-auto p-3 bg-[#F0EDE5] border border-[#101010] space-y-2">
            <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#85827B] flex items-center justify-between">
              <span>LEDGER INTEGRITY</span>
              <span className="text-[#263B35] font-bold">100%</span>
            </div>
            <div className="text-[11px] font-serif text-[#101010] leading-snug">
              Every balance calculated deterministically in integer paise without floating-point error.
            </div>
            <div className="font-mono text-[9px] text-[#85827B] pt-1 border-t border-[#101010]/15 flex items-center justify-between">
              <span>DPDP ACT 2023</span>
              <span>ENCRYPTED</span>
            </div>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-[#101010]/70" onClick={() => setMobileNavOpen(false)} />
            <div className="relative w-80 bg-[#FAF9F6] border-r border-[#101010] p-5 flex flex-col space-y-4 z-10 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#101010]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#101010] text-[#F0EDE5] flex items-center justify-center font-mono text-xs font-bold">
                    P
                  </div>
                  <span className="font-serif text-lg uppercase tracking-wider text-[#101010]">PROVENTA</span>
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 border border-[#101010] text-[#101010] hover:bg-[#F0EDE5]"
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
                      className={`flex items-center gap-3 px-3 py-2 text-xs font-mono border ${
                        isActive
                          ? 'bg-[#101010] text-[#F0EDE5] border-[#101010]'
                          : 'border-transparent text-[#101010] hover:bg-[#F0EDE5]'
                      }`}
                    >
                      <span className="text-[10px] text-[#85827B]">{indexNumber}</span>
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
        <main className="flex-1 overflow-y-auto bg-[#F0EDE5]">
          <div className="max-w-[1520px] mx-auto p-4 sm:p-6 lg:p-10">{children}</div>
        </main>
      </div>

      {/* AI RESEARCH CONSOLE (SLIDE-OVER PANEL) */}
      {isAIOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#FAF9F6] border-l border-[#101010] shadow-[ -8px_0px_0px_0px_rgba(16,16,16,0.1) ] flex flex-col font-sans">
          {/* Header */}
          <div className="p-4 bg-[#101010] text-[#F0EDE5] border-b border-[#101010] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-[#263B35] text-[#FAF9F6] flex items-center justify-center font-mono text-xs font-bold">
                AI
              </div>
              <div>
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#F0EDE5]">PROVENTA INTELLIGENCE</h3>
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#B6A68A]">6 Multi-Agent Analysts</p>
              </div>
            </div>
            <button
              onClick={() => setIsAIOpen(false)}
              className="p-1 border border-[#F0EDE5]/30 text-[#F0EDE5] hover:bg-[#F0EDE5] hover:text-[#101010] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Terminal Observation Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F6]">
            {aiChat.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[#85827B] mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#263B35]" />
                    <span>AGENT // {msg.agent || 'ANALYST'}</span>
                  </div>
                )}
                <div
                  className={`max-w-[92%] p-3.5 text-xs leading-relaxed border ${
                    msg.role === 'user'
                      ? 'bg-[#101010] text-[#F0EDE5] border-[#101010] font-mono'
                      : 'bg-[#F0EDE5] text-[#101010] border-[#101010] font-sans'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="font-mono text-[9px] text-[#85827B] mt-1">{msg.time}</span>
              </div>
            ))}
            {isAiLoading && (
              <div className="p-3 bg-[#F0EDE5] border border-[#101010] flex items-center gap-2 font-mono text-xs text-[#101010]">
                <span className="w-2 h-2 bg-[#101010] animate-ping" />
                <span>INDEXING FAMILY PORTFOLIO TELEMETRY...</span>
              </div>
            )}
          </div>

          {/* Research Console Query Input */}
          <form onSubmit={handleSendAi} className="p-3 bg-[#F0EDE5] border-t border-[#101010] flex gap-2">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Query equity split, vault documents, liability debt service..."
              className="flex-1 bg-[#FAF9F6] border border-[#101010] px-3 py-2 text-xs font-mono text-[#101010] placeholder-[#85827B] focus:outline-none focus:ring-1 focus:ring-[#101010]"
            />
            <button
              type="submit"
              disabled={isAiLoading || !aiQuery.trim()}
              className="px-4 py-2 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] font-mono text-xs uppercase tracking-wider disabled:opacity-50 transition-colors border border-[#101010]"
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
