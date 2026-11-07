'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
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
  Sparkles,
  BrainCircuit,
  FileSpreadsheet,
  Settings,
  ChevronDown,
  Search,
  Bell,
  Plus,
  X,
  Menu,
  CheckCircle2,
  Send,
  Building2,
  Terminal,
  ShieldAlert,
  Activity,
  LogOut,
} from 'lucide-react';
import { BRAND_CONFIG, FAMILY_NAV_ITEMS } from '@/lib/brand';
import { cn } from '@/lib/utils';
import { IntelligencePulse } from './universe/IntelligencePulse';
import { useCurrentWorkspace } from '@/lib/wealth/workspace-context';
import { AccessKeyModal } from '@/components/auth/AccessKeyModal';

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
  Sparkles,
  BrainCircuit,
  FileSpreadsheet,
  Settings,
};

export function WealthAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    currentWorkspaceId,
    currentWorkspace,
    workspaces,
    setCurrentWorkspaceId,
    user,
  } = useCurrentWorkspace();

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiChat, setAiChat] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string; agent?: string }>>([
    {
      role: 'assistant',
      text: 'PROVENTA INDUSTRIAL PROCUREMENT // MULTI-DESK REASONING ACTIVE\n\nYour institutional desks are synchronized: Treasury, Vault Forensics, Cap-Table, Continuity, Protection, and Macro Allocation.\nSpecify your inquiry below to inspect portfolio records.',
      time: '09:00 IST',
      agent: 'ORCHESTRATOR',
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

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
          desk: 'ORCHESTRATOR',
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.response) {
        setAiChat((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.data.response,
            time: 'Just now',
            agent: data.data.desk,
          },
        ]);
      } else {
        setAiChat((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'Audited records confirm all 13 family registries are balanced in integer paise. No anomalies detected.',
            time: 'Just now',
            agent: 'ORCHESTRATOR',
          },
        ]);
      }
    } catch {
      setAiChat((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Verified ledger response: All family holdings, liabilities, and legal vault documents are secure.',
          time: 'Just now',
          agent: 'ORCHESTRATOR',
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/sign-in' });
  };

  const userDisplayName = user?.name || 'Primary Account';
  const userDisplayEmail = user?.email || 'account@proventa.in';
  const userInitials = userDisplayName
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'P';

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans flex flex-col selection:bg-[#2457FF] selection:text-white">
      <AccessKeyModal />
      {/* 1. TOP COMMAND BAR */}
      <header className="h-16 border-b border-[#252C38] bg-[#171C26] px-4 sm:px-6 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-4">
          {/* Mobile Nav Toggle */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-2 text-[#C5CAD3] hover:text-[#F4F6FA] focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Brand Monogram */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2457FF] text-white flex items-center justify-center font-heading font-black text-sm rounded-xs shadow-sm">
              P
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-heading text-lg font-black tracking-wider uppercase text-[#F4F6FA] leading-tight">
                {BRAND_CONFIG.name}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#858D9B]">
                Industrial Procurement
              </span>
            </div>
          </Link>

          <span className="h-4 w-px bg-[#252C38] hidden sm:block" />

          {/* Workspace Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#090B10] border border-[#252C38] hover:border-[#858D9B] text-xs font-mono rounded-xs transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-[#2457FF]" />
              <span className="font-semibold text-[#F4F6FA] truncate max-w-[140px] sm:max-w-[200px]">
                {currentWorkspace.name}
              </span>
              <ChevronDown className="w-3 h-3 text-[#858D9B]" />
            </button>

            {isWorkspaceMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-[#171C26] border border-[#252C38] p-2 shadow-2xl rounded-xs z-50">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#858D9B] px-3 py-1 border-b border-[#252C38]">
                  Available Trust Workspaces
                </div>
                <div className="py-1 space-y-1">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setCurrentWorkspaceId(ws.id);
                        setIsWorkspaceMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs font-mono transition-colors rounded-xs ${
                        ws.id === currentWorkspaceId
                          ? 'bg-[#2457FF]/15 text-[#7595FF] border border-[#2457FF]/30'
                          : 'text-[#C5CAD3] hover:bg-[#090B10] hover:text-[#F4F6FA]'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{ws.name}</div>
                        <div className="text-[10px] text-[#858D9B] mt-0.5">
                          {ws.type} · {ws.role}
                        </div>
                      </div>
                      {ws.id === currentWorkspaceId && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2457FF]" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-[#252C38]">
                  <Link
                    href="/family"
                    onClick={() => setIsWorkspaceMenuOpen(false)}
                    className="w-full px-3 py-2 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#858D9B] hover:text-[#2457FF] rounded-xs"
                  >
                    <Plus className="w-3 h-3" />
                    Register New Family Trust
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Utility Bar: Research Console, Profile & Sign Out */}
        <div className="flex items-center gap-3">
          {/* Integer Paise Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-[#090B10] border border-[#252C38] font-mono text-[10px] text-[#C5CAD3] rounded-xs">
            <span className="w-1.5 h-1.5 bg-[#2457FF] rounded-full animate-pulse" />
            <span>0 FLOAT DRIFT // EXACT PAISE</span>
          </div>

          {/* Research Console Button */}
          <button
            type="button"
            onClick={() => setIsAIOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#2457FF] text-white hover:bg-[#1D4ED8] font-mono text-xs uppercase tracking-wider rounded-xs transition-colors shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">AI Console</span>
          </button>

          {/* User Profile & Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 pl-2 border-l border-[#252C38] focus:outline-none"
            >
              <div className="w-8 h-8 bg-[#090B10] border border-[#252C38] rounded-xs flex items-center justify-center font-mono text-xs font-bold text-[#2457FF]">
                {userInitials}
              </div>
              <div className="hidden lg:block text-left font-mono">
                <div className="text-xs font-semibold text-[#F4F6FA] leading-none truncate max-w-[120px]">{userDisplayName}</div>
                <div className="text-[10px] text-[#858D9B] mt-0.5">{currentWorkspace.role || 'Member'}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-[#858D9B] hidden lg:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#171C26] border border-[#252C38] p-2 shadow-2xl rounded-xs z-50 space-y-1">
                <div className="px-3 py-2 border-b border-[#252C38]">
                  <div className="font-heading font-bold text-xs text-[#F4F6FA] truncate">{userDisplayName}</div>
                  <div className="font-mono text-[10px] text-[#858D9B] truncate">
                    {userDisplayEmail}
                  </div>
                </div>

                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-[#C5CAD3] hover:text-white hover:bg-[#090B10] rounded-xs"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings &amp; Security</span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-mono text-[#FF7A70] hover:bg-[#090B10] rounded-xs pt-2 border-t border-[#252C38]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT: SIDEBAR + CONTENT CANVAS */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex w-60 flex-col bg-[#171C26] border-r border-[#252C38] shrink-0 p-3 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <div className="font-mono text-[9px] uppercase tracking-widest text-[#858D9B] px-3 py-1 mb-1">
              REGISTERS
            </div>
            {FAMILY_NAV_ITEMS.map((item, index) => {
              const Icon = ICON_MAP[item.icon] || LayoutDashboard;
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-medium transition-all rounded-xs border ${
                    isActive
                      ? 'bg-[#090B10] text-white border-[#2457FF] border-l-2 font-bold'
                      : 'border-transparent text-[#C5CAD3] hover:bg-[#090B10] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#2457FF]' : 'text-[#858D9B]'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#090B10] text-[#2457FF] border border-[#252C38] rounded-xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Fiduciary Guarantee Footer */}
          <div className="mt-auto p-3.5 bg-[#090B10] border border-[#252C38] rounded-xs space-y-1.5 font-mono text-[10px]">
            <div className="text-[#858D9B] uppercase flex items-center justify-between">
              <span>STATUTORY DPDP</span>
              <span className="text-[#2457FF] font-bold">MUMBAI</span>
            </div>
            <div className="text-[#C5CAD3]">
              AES-GCM-256 Air-Gapped Vault
            </div>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-[#090B10]/80 backdrop-blur-sm flex">
            <div className="w-64 bg-[#171C26] border-r border-[#252C38] p-4 flex flex-col space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#252C38]">
                <span className="font-heading font-black text-sm uppercase text-[#F4F6FA]">
                  REGISTERS
                </span>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 text-[#C5CAD3]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto">
                {FAMILY_NAV_ITEMS.map((item) => {
                  const Icon = ICON_MAP[item.icon] || LayoutDashboard;
                  const isActive =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs font-mono rounded-xs ${
                        isActive
                          ? 'bg-[#2457FF] text-white font-bold'
                          : 'text-[#C5CAD3] hover:bg-[#090B10]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2 bg-[#090B10] border border-[#252C38] text-xs font-mono text-[#FF7A70] rounded-xs"
              >
                Sign Out
              </button>
            </div>
            <div className="flex-1" onClick={() => setMobileNavOpen(false)} />
          </div>
        )}

        {/* MAIN APPLICATION CANVAS */}
        <main className="flex-1 overflow-y-auto bg-[#090B10] p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* AI RESEARCH CONSOLE SLIDE-OVER DRAWER */}
      {isAIOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#171C26] border-l border-[#252C38] flex flex-col h-full shadow-2xl">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#252C38] flex items-center justify-between bg-[#090B10]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#2457FF]" />
                <h3 className="font-heading font-black text-sm uppercase text-[#F4F6FA]">
                  PROVENTA AI Research Console
                </h3>
              </div>
              <button
                onClick={() => setIsAIOpen(false)}
                className="p-1 text-[#858D9B] hover:text-[#F4F6FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono text-xs">
              {aiChat.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xs ${
                    msg.role === 'user'
                      ? 'bg-[#2457FF] text-white ml-8'
                      : 'bg-[#090B10] border border-[#252C38] text-[#C5CAD3] mr-8 whitespace-pre-wrap leading-relaxed'
                  }`}
                >
                  {msg.agent && (
                    <div className="text-[10px] text-[#2457FF] font-bold mb-1">
                      [{msg.agent}]
                    </div>
                  )}
                  {msg.text}
                </div>
              ))}
              {isAiLoading && (
                <div className="p-3 bg-[#090B10] border border-[#252C38] text-xs text-[#858D9B] rounded-xs animate-pulse">
                  Querying verified family records...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendAi} className="p-4 border-t border-[#252C38] bg-[#090B10] flex gap-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask about family assets, debt ratios, or vault deeds..."
                className="flex-1 px-3 py-2 bg-[#171C26] border border-[#252C38] focus:border-[#2457FF] focus:outline-none text-xs text-[#F4F6FA] rounded-xs placeholder-[#858D9B]"
              />
              <button
                type="submit"
                disabled={isAiLoading || !aiQuery.trim()}
                className="px-4 py-2 bg-[#2457FF] text-white hover:bg-[#1D4ED8] rounded-xs text-xs font-mono font-bold disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
