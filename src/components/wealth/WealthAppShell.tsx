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
  User,
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
  const [aiChat, setAiChat] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: 'Welcome to PROVENTA Family Wealth Assistant. I have indexed your family assets, liabilities, cashflows, and encrypted vault documents. What would you like to review today?',
      time: 'Just now',
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Available Workspaces for Rajesh Sharma
  const workspaces = [
    {
      id: 'fam_sharma_heritage',
      name: 'Sharma Family Trust & Holdings',
      type: 'FAMILY',
      role: 'OWNER',
      membersCount: 4,
    },
    {
      id: 'ind_usr_rajesh_sharma',
      name: 'Rajesh Sharma (Personal)',
      type: 'INDIVIDUAL',
      role: 'OWNER',
      membersCount: 1,
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
          { role: 'assistant', text: data.data.content, time: 'Just now' },
        ]);
      } else {
        setAiChat((prev) => [
          ...prev,
          { role: 'assistant', text: 'Unable to analyze query. Please try again.', time: 'Just now' },
        ]);
      }
    } catch (err) {
      setAiChat((prev) => [
        ...prev,
        { role: 'assistant', text: 'Network error connecting to AI agent.', time: 'Just now' },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8F9FD] flex flex-col antialiased">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 h-16 bg-[#0E1322]/95 backdrop-blur-md border-b border-[#1E293B] px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Wordmark */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-1.5 rounded-lg text-[#9D8BC9] hover:text-white hover:bg-[#1E1035]"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#1E1035] flex items-center justify-center font-bold text-white text-base shadow-lg shadow-[#7C3AED]/20 border border-[#A78BFA]/30">
              P
            </div>
            <span className="font-serif text-xl tracking-[0.15em] uppercase text-white font-medium hidden sm:inline-block">
              {BRAND_CONFIG.name}
            </span>
          </Link>

          <span className="h-4 w-[1px] bg-[#1E293B] mx-1" />

          {/* Workspace Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1E1035] hover:bg-[#2A164D] border border-[#3E236E] text-xs font-medium text-white transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span className="max-w-[140px] sm:max-w-[220px] truncate">{currentWorkspace.name}</span>
              <span className="hidden md:inline-block px-1.5 py-0.2 rounded bg-[#0B0F19] text-[9px] font-mono text-[#DDD0F7]">
                {currentWorkspace.role}
              </span>
              <ChevronDown className="w-3 h-3 text-[#9D8BC9]" />
            </button>

            {isWorkspaceMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl bg-[#0E1322] border border-[#3E236E] shadow-2xl p-2 z-50">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#9D8BC9] px-3 py-1.5">
                  Available Workspaces
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setCurrentWorkspaceId(ws.id);
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      ws.id === currentWorkspaceId
                        ? 'bg-[#1E1035] text-white border border-[#3E236E]'
                        : 'text-[#9D8BC9] hover:bg-[#1E1035]/50 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white">{ws.name}</div>
                      <div className="text-[10px] text-[#9D8BC9] font-mono mt-0.5">
                        {ws.type} · {ws.membersCount} Member{ws.membersCount > 1 ? 's' : ''}
                      </div>
                    </div>
                    {ws.id === currentWorkspaceId && (
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    )}
                  </button>
                ))}
                <div className="pt-2 mt-2 border-t border-[#1E293B]">
                  <Link
                    href="/family"
                    onClick={() => setIsWorkspaceMenuOpen(false)}
                    className="w-full px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-semibold text-[#A78BFA] hover:text-white hover:bg-[#1E1035]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create New Family Workspace
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Search, AI button, Notifications, User avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsAIOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#7C3AED]/20 to-[#1E1035] hover:from-[#7C3AED]/30 hover:to-[#2A164D] border border-[#7C3AED]/40 text-xs font-medium text-white transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A78BFA] animate-pulse" />
            <span className="hidden sm:inline">AI Intelligence</span>
          </button>

          <Link
            href="/notifications"
            className="p-2 rounded-lg text-[#9D8BC9] hover:text-white hover:bg-[#1E1035] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#10B981]" />
          </Link>

          {/* User profile */}
          <Link
            href="/profile"
            className="flex items-center gap-2 pl-2 border-l border-[#1E293B]"
          >
            <div className="w-7 h-7 rounded-full bg-[#2A164D] border border-[#3E236E] flex items-center justify-center text-xs font-bold text-white">
              RS
            </div>
            <div className="hidden xl:block text-left text-xs">
              <div className="font-semibold text-white leading-tight">Rajesh Sharma</div>
              <div className="text-[10px] text-[#9D8BC9] font-mono leading-none">Family Head</div>
            </div>
          </Link>
        </div>
      </header>

      {/* MAIN BODY: SIDEBAR + CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex w-64 flex-col bg-[#070A12] border-r border-[#1E293B] shrink-0 p-4 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9D8BC9] px-3 py-1">
              NAVIGATION
            </div>
            {FAMILY_NAV_ITEMS.map((item) => {
              const Icon = ICON_MAP[item.icon] || LayoutDashboard;
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard' || pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#1E1035] text-white border border-[#3E236E] font-semibold'
                      : 'text-[#9D8BC9] hover:text-white hover:bg-[#1E1035]/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#A78BFA]' : 'text-[#64748B]'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#7C3AED]/20 text-[#A78BFA]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Telemetry Widget in Sidebar */}
          <div className="mt-auto p-3.5 rounded-xl bg-[#0E1322] border border-[#1E293B] space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#9D8BC9]">
              Active System Status
            </div>
            <div className="flex items-center gap-2 text-xs text-[#10B981]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Paise-Precision Engine</span>
            </div>
            <div className="text-[11px] text-[#64748B] leading-tight">
              All 10 modules operational under DPDP Act privacy protocol.
            </div>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
            <div className="relative w-72 bg-[#070A12] border-r border-[#1E293B] p-5 flex flex-col space-y-4 z-10 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                <span className="font-serif text-lg uppercase tracking-wider text-white">PROVENTA</span>
                <button onClick={() => setMobileNavOpen(false)} className="text-[#9D8BC9] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-1">
                {FAMILY_NAV_ITEMS.map((item) => {
                  const Icon = ICON_MAP[item.icon] || LayoutDashboard;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
                        isActive ? 'bg-[#1E1035] text-white border border-[#3E236E]' : 'text-[#9D8BC9]'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#A78BFA]" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* AI ASSISTANT SIDE DRAWER */}
      {isAIOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#0E1322] border-l border-[#3E236E] shadow-2xl flex flex-col">
          <div className="p-4 border-b border-[#1E293B] flex items-center justify-between bg-[#0B0F19]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1E1035] flex items-center justify-center text-[#A78BFA]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Family Wealth AI</h3>
                <p className="text-[10px] text-[#9D8BC9] font-mono">6 Specialized Agents</p>
              </div>
            </div>
            <button
              onClick={() => setIsAIOpen(false)}
              className="p-1 rounded-lg text-[#9D8BC9] hover:text-white hover:bg-[#1E1035]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiChat.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#7C3AED] text-white rounded-br-none'
                      : 'bg-[#1E1035] text-[#F8F9FD] border border-[#3E236E] rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-[#64748B] mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex items-center gap-2 text-xs text-[#A78BFA] p-3 rounded-lg bg-[#1E1035]/50 border border-[#3E236E]">
                <span className="w-2 h-2 rounded-full bg-[#A78BFA] animate-ping" />
                <span>Consulting Multi-Agent Orchestrator...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendAi} className="p-3 border-t border-[#1E293B] bg-[#0B0F19] flex gap-2">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask about net worth, cashflows, vault deeds..."
              className="flex-1 bg-[#0E1322] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED]"
            />
            <button
              type="submit"
              disabled={isAiLoading || !aiQuery.trim()}
              className="p-2 rounded-lg bg-[#7C3AED] hover:bg-[#8B5CF6] text-white disabled:opacity-50 transition-all"
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
