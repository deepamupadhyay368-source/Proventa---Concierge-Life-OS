'use client';

import { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Send,
  PieChart,
  Coins,
  ArrowLeftRight,
  Lock,
  Target,
  Users,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { AIAgentRole, AIAssistantMessage, AIInsightObservation } from '@/lib/wealth/types';

const AGENT_TABS: Array<{ role: AIAgentRole; label: string; icon: any; promptHint: string }> = [
  { role: 'FAMILY_ASSISTANT', label: 'Family Assistant', icon: Users, promptHint: 'Ask any question about your family financial universe...' },
  { role: 'WEALTH_ANALYST', label: 'Wealth Analyst', icon: PieChart, promptHint: 'Analyze asset concentration, trailing growth, or category allocation...' },
  { role: 'ASSET_INTELLIGENCE', label: 'Asset Intelligence', icon: Coins, promptHint: 'Audit missing documents, outdated valuations, or unverified holdings...' },
  { role: 'CASHFLOW_ANALYST', label: 'Cashflow Analyst', icon: ArrowLeftRight, promptHint: 'Summarize monthly inflows, recurring EMIs, and savings rate...' },
  { role: 'DOCUMENT_INTELLIGENCE', label: 'Vault Intelligence', icon: Lock, promptHint: 'Review extracted deed numbers, dates, or unconfirmed uploads...' },
  { role: 'GOAL_SCENARIO', label: 'Goals & Scenarios', icon: Target, promptHint: 'Query Stanford Masters fund or simulate future savings models...' },
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
        'Hello! I am your PROVENTA Family Intelligence Assistant.\n\nAll my responses are generated using permission-scoped context from your secure family workspace. Every monetary value is calculated deterministically with paise-level precision.\n\nHow can I help you today?',
      dataSourcesCited: ['PROVENTA Deterministic Calculation Engine', 'Sharma Family Trust Holdings'],
      dataDate: new Date().toISOString().split('T')[0],
      timestamp: 'Just now',
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
            content: 'Unable to process query. Please check your prompt and try again.',
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
          content: 'Network connection error.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const currentTab = AGENT_TABS.find((t) => t.role === activeAgent) || AGENT_TABS[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A78BFA] mb-1">
            FAMILY WEALTH OS // MULTI-AGENT ORCHESTRATOR
          </div>
          <h1 className="font-serif text-3xl text-white">Family Intelligence &amp; Multi-Agent Engine</h1>
          <p className="text-xs text-[#9D8BC9] font-light mt-1">
            Permission-scoped context retrieval, prompt injection defense, and deterministic calculation citations.
          </p>
        </div>
      </div>

      {/* Proactive Observations Strip */}
      {observations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {observations.map((obs) => (
            <div
              key={obs.id}
              className="p-4 rounded-xl bg-[#0E1322] border border-[#2D1854] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E1035] text-[#A78BFA]">
                  {obs.agentRole.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-[#10B981] font-mono">{obs.severity}</span>
              </div>
              <h4 className="text-xs font-semibold text-white">{obs.title}</h4>
              <p className="text-[11px] text-[#9D8BC9] font-light leading-relaxed">{obs.observation}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main Agent Interface */}
      <div className="rounded-2xl bg-[#0E1322] border border-[#1E293B] overflow-hidden flex flex-col h-[650px]">
        {/* Agent Switcher Bar */}
        <div className="p-3 bg-[#070A12] border-b border-[#1E293B] flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {AGENT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAgent === tab.role;
            return (
              <button
                key={tab.role}
                onClick={() => setActiveAgent(tab.role)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#1E1035] text-white border border-[#3E236E]'
                    : 'text-[#9D8BC9] hover:text-white hover:bg-[#1E1035]/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#A78BFA]' : 'text-[#64748B]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#7C3AED] text-white rounded-br-none'
                    : 'bg-[#0B0F19] text-[#F8F9FD] border border-[#1E293B] rounded-bl-none space-y-3'
                }`}
              >
                <div>{msg.content}</div>

                {msg.dataSourcesCited && msg.dataSourcesCited.length > 0 && (
                  <div className="pt-3 border-t border-[#1E293B] text-[10px] text-[#A78BFA] font-mono space-y-0.5">
                    <div className="text-[9px] uppercase tracking-wider text-[#64748B]">
                      CITED RECORD SOURCES &amp; ENGINE AUDIT:
                    </div>
                    {msg.dataSourcesCited.map((src, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[#9D8BC9]">
                        <CheckCircle2 className="w-3 h-3 text-[#10B981] shrink-0" />
                        <span>{src}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[9px] text-[#64748B] mt-1 px-1 font-mono">{msg.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#A78BFA] p-4 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A78BFA] animate-ping" />
              <span>Consulting {currentTab.label} with permission-scoped context...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-[#070A12] border-t border-[#1E293B] flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={currentTab.promptHint}
            className="flex-1 bg-[#0E1322] border border-[#1E293B] rounded-xl px-4 py-3 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED]"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#8B5CF6] text-white disabled:opacity-50 transition-all text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
