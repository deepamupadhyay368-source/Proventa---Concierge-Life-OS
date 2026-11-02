'use client';

import { useEffect, useState } from 'react';
import {
  Send,
  PieChart,
  Coins,
  ArrowLeftRight,
  Lock,
  Target,
  Users,
  CheckCircle2,
  Terminal,
  FileSpreadsheet,
  Activity,
  Bot,
} from 'lucide-react';
import { AIAgentRole, AIAssistantMessage, AIInsightObservation } from '@/lib/wealth/types';

const AGENT_TABS: Array<{ role: AIAgentRole; label: string; code: string; icon: any; promptHint: string }> = [
  { role: 'FAMILY_ASSISTANT', label: 'Family Assistant', code: 'AGT-01', icon: Users, promptHint: 'Query consolidated positions, member access, or portfolio overviews...' },
  { role: 'WEALTH_ANALYST', label: 'Wealth Analyst', code: 'AGT-02', icon: PieChart, promptHint: 'Analyze asset concentration, trailing CAGR, or allocation drift...' },
  { role: 'ASSET_INTELLIGENCE', label: 'Asset Intelligence', code: 'AGT-03', icon: Coins, promptHint: 'Audit missing title deeds, outdated valuations, or unverified holdings...' },
  { role: 'CASHFLOW_ANALYST', label: 'Cashflow Analyst', code: 'AGT-04', icon: ArrowLeftRight, promptHint: 'Audit monthly inflows, recurring EMIs, and savings rates...' },
  { role: 'DOCUMENT_INTELLIGENCE', code: 'AGT-05', label: 'Vault Intelligence', icon: Lock, promptHint: 'Review extracted deed numbers, dates, or unconfirmed uploads...' },
  { role: 'GOAL_SCENARIO', code: 'AGT-06', label: 'Goals & Scenarios', icon: Target, promptHint: 'Model capital milestone targets or run mathematical compound simulations...' },
];

export default function IntelligencePage() {
  const [activeAgent, setActiveAgent] = useState<AIAgentRole>('FAMILY_ASSISTANT');
  const [observations, setObservations] = useState<AIInsightObservation[]>([]);
  const [messages, setMessages] = useState<AIAssistantMessage[]>([
    {
      id: 'init_1',
      role: 'assistant',
      agentRole: 'FAMILY_ASSISTANT',
      content:
        'MEMORANDUM // PROVENTA RESEARCH CONSOLE INITIALIZED\n\nTo: Sharma Family Trust & Holdings [FWS-001]\nFrom: Lead Family Intelligence Analyst\nClassification: RESTRICTED // PRIVILEGED\n\nAll subsequent analytical research notes are generated strictly from verified workspace database records. Mathematical calculations are deterministically computed in integer paise without estimation drift.\n\nSpecify your inquiry below to commence portfolio analysis.',
      dataSourcesCited: ['PROVENTA Integer Paise Calculation Engine', 'Sharma Family Trust Holdings Registry', 'Family Vault Encrypted Archive'],
      dataDate: new Date().toISOString().split('T')[0],
      timestamp: '09:00 IST',
    },
  ]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadObservations() {
      try {
        const res = await fetch('/api/wealth/ai?workspaceId=fam_sharma_heritage');
        const json = await res.json();
        if (json.success) {
          setObservations(json.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    void loadObservations();
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query.trim();
    setQuery('');

    const userMsg: AIAssistantMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/wealth/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'fam_sharma_heritage',
          query: userText,
          agentRole: activeAgent,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setMessages((prev) => [...prev, json.data]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: 'assistant',
            content: 'RESEARCH NOTE: Unable to synthesize response from current active portfolio indices.',
            timestamp: 'Just now',
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'SYSTEM NOTICE: Network connection fault to multi-agent orchestrator.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const currentTab = AGENT_TABS.find((t) => t.role === activeAgent) || AGENT_TABS[0];

  return (
    <div className="space-y-8 font-sans">
      {/* 1. LIVING RESEARCH CONSOLE BANNER */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-[#E2E8F0]">
          <div className="font-mono text-xs uppercase tracking-wider text-[#2563EB] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
            <span>SYSTEM 03 // INTELLIGENCE CONSOLE</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#0F172A] tracking-tight mt-1">
            Financial Research Workspace
          </h1>
          <p className="font-sans text-xs text-[#475569] mt-2 max-w-xl">
            Analytical workspace powered by 6 specialized financial intelligence agents with permission-scoped retrieval, formula citations, and strict zero-hallucination controls.
          </p>
        </div>

        {/* Observations Strip */}
        {observations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0] bg-[#FAFBFC]">
            {observations.map((obs) => (
              <div key={obs.id} className="p-6 space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="px-2.5 py-0.5 bg-white border border-[#CBD5E1] text-[#2563EB] uppercase font-bold rounded-full">
                    {obs.agentRole.replace('_', ' ')}
                  </span>
                  <span className={`font-bold uppercase ${obs.severity === 'ALERT' ? 'text-amber-600' : 'text-[#0D9488]'}`}>
                    {obs.severity}
                  </span>
                </div>
                <h4 className="font-display font-bold text-base text-[#0F172A]">{obs.title}</h4>
                <p className="font-sans text-xs text-[#475569] leading-relaxed">{obs.observation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. RESEARCH WORKSPACE CONSOLE */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl flex flex-col h-[700px] shadow-sm overflow-hidden">
        {/* Agent Selector Bar */}
        <div className="p-3 bg-[#FAFBFC] border-b border-[#E2E8F0] flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {AGENT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAgent === tab.role;
            return (
              <button
                key={tab.role}
                onClick={() => setActiveAgent(tab.role)}
                className={`flex items-center gap-2 px-3.5 py-2 font-mono text-xs uppercase tracking-wider transition-all rounded-lg border ${
                  isActive
                    ? 'bg-[#2563EB] text-white border-[#2563EB] font-bold shadow-sm'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:bg-white'
                }`}
              >
                <span className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-[#94A3B8]'}`}>{tab.code}</span>
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Research Notes Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAFBFC]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#2563EB] mb-1 flex items-center gap-2 font-semibold">
                  <Terminal className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>RESEARCH MEMORANDUM // {msg.agentRole || currentTab.label}</span>
                </div>
              )}
              <div
                className={`max-w-[90%] p-5 text-xs leading-relaxed border rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-[#2563EB] text-white border-[#2563EB] font-mono shadow-sm'
                    : 'bg-white text-[#0F172A] border-[#E2E8F0] shadow-sm space-y-4'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.dataSourcesCited && msg.dataSourcesCited.length > 0 && (
                  <div className="pt-3 border-t border-[#F1F5F9] font-mono text-[11px] space-y-1">
                    <div className="uppercase tracking-wider text-[#2563EB] font-bold">
                      CITED DATA SOURCES &amp; ENGINE EVIDENCE:
                    </div>
                    {msg.dataSourcesCited.map((src, i) => (
                      <div key={i} className="flex items-center gap-2 text-[#475569]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                        <span>{src}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="font-mono text-[10px] text-[#94A3B8] mt-1">{msg.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="p-4 border border-[#99F6E4] bg-[#F0FDFA] rounded-xl flex items-center gap-3 font-mono text-xs text-[#0D9488]">
              <span className="w-2.5 h-2.5 bg-[#0D9488] rounded-full animate-ping" />
              <span>CONSULTING {currentTab.label.toUpperCase()} ENGINE // CORRELATING ASSET REGISTERS...</span>
            </div>
          )}
        </div>

        {/* Query Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-[#E2E8F0] flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={currentTab.promptHint}
            className="flex-1 bg-[#FAFBFC] border border-[#CBD5E1] px-4 py-3 font-mono text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] rounded-lg"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-mono text-xs uppercase tracking-wider font-semibold transition-all rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            <span>Dispatch Inquiry</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
