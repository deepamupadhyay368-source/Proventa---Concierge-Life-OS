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
      {/* 1. INSTITUTIONAL HEADER */}
      <div className="border border-[#101010] bg-[#FAF9F6]">
        <div className="p-6 sm:p-8 border-b border-[#101010]">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#85827B]">
            12 // PROVENTA INTELLIGENCE // INSTITUTIONAL RESEARCH WORKSPACE
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight mt-1">
            Financial Research Console
          </h1>
          <p className="font-sans text-xs text-[#85827B] mt-2 max-w-xl">
            Analytical workspace powered by 6 specialized financial intelligence agents with permission-scoped retrieval, formula citations, and strict zero-hallucination controls.
          </p>
        </div>

        {/* Observations Strip */}
        {observations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#101010] bg-[#F0EDE5]">
            {observations.map((obs) => (
              <div key={obs.id} className="p-5 space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="px-2 py-0.5 bg-[#101010] text-[#F0EDE5] uppercase">
                    {obs.agentRole.replace('_', ' ')}
                  </span>
                  <span className={`font-semibold uppercase ${obs.severity === 'ALERT' ? 'text-[#A63B32]' : 'text-[#263B35]'}`}>
                    {obs.severity}
                  </span>
                </div>
                <h4 className="font-serif text-base text-[#101010]">{obs.title}</h4>
                <p className="font-sans text-xs text-[#85827B] leading-relaxed">{obs.observation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. RESEARCH WORKSPACE CONSOLE */}
      <div className="border border-[#101010] bg-[#FAF9F6] flex flex-col h-[700px]">
        {/* Agent Selector Bar */}
        <div className="p-3 bg-[#101010] text-[#F0EDE5] border-b border-[#101010] flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {AGENT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAgent === tab.role;
            return (
              <button
                key={tab.role}
                onClick={() => setActiveAgent(tab.role)}
                className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors border ${
                  isActive
                    ? 'bg-[#FAF9F6] text-[#101010] border-[#FAF9F6] font-semibold'
                    : 'border-transparent text-[#B6A68A] hover:text-[#F0EDE5] hover:bg-[#2A2925]'
                }`}
              >
                <span className="text-[10px] text-[#85827B]">{tab.code}</span>
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Research Notes Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAF9F6]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#85827B] mb-1 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-[#263B35]" />
                  <span>RESEARCH MEMORANDUM // {msg.agentRole || currentTab.label}</span>
                </div>
              )}
              <div
                className={`max-w-[90%] p-5 text-xs leading-relaxed border ${
                  msg.role === 'user'
                    ? 'bg-[#101010] text-[#F0EDE5] border-[#101010] font-mono'
                    : 'bg-[#F0EDE5] text-[#101010] border-[#101010] space-y-4'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.dataSourcesCited && msg.dataSourcesCited.length > 0 && (
                  <div className="pt-3 border-t border-[#101010]/20 font-mono text-[10px] space-y-1">
                    <div className="uppercase tracking-widest text-[#85827B]">
                      CITED DATA SOURCES &amp; ENGINE EVIDENCE:
                    </div>
                    {msg.dataSourcesCited.map((src, i) => (
                      <div key={i} className="flex items-center gap-2 text-[#101010]">
                        <CheckCircle2 className="w-3 h-3 text-[#263B35] shrink-0" />
                        <span>{src}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="font-mono text-[9px] text-[#85827B] mt-1">{msg.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="p-4 border border-[#101010] bg-[#F0EDE5] flex items-center gap-3 font-mono text-xs text-[#101010]">
              <span className="w-2.5 h-2.5 bg-[#101010] animate-ping" />
              <span>CONSULTING {currentTab.label.toUpperCase()} ENGINE // CORRELATING ASSET REGISTERS...</span>
            </div>
          )}
        </div>

        {/* Query Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-[#F0EDE5] border-t border-[#101010] flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={currentTab.promptHint}
            className="flex-1 bg-[#FAF9F6] border border-[#101010] px-4 py-3 font-mono text-xs text-[#101010] placeholder-[#85827B] focus:outline-none focus:ring-1 focus:ring-[#101010]"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] font-mono text-xs uppercase tracking-wider font-semibold border border-[#101010] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <span>Dispatch Inquiry</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
