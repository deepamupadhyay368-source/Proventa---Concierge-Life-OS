'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Play,
  Building,
  Car,
  Utensils,
  Gift,
  ExternalLink,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { DEMO_SCENARIOS, type DemoScenario } from '@/lib/demo/scenarios';

export default function DemoLabPage() {
  const router = useRouter();
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0]);
  const [running, setRunning] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);

  const handleLaunchScenario = async () => {
    setRunning(true);
    setLogMessages(['[Init] Initializing autonomous concierge pipeline...']);
    setCreatedTaskId(null);

    try {
      setLogMessages((prev) => [...prev, `[Ingest] Ingesting request: "${selectedScenario.prompt}"`]);
      
      const res = await fetch('/api/tasks/from-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: selectedScenario.prompt,
          category: selectedScenario.category,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process request');

      const task = data.task;
      setCreatedTaskId(task.id);

      setLogMessages((prev) => [
        ...prev,
        `[Agent Assigned] Routed to ${task.assignedAgent || selectedScenario.expectedAgent}`,
        `[Options Generated] Discovered ${data.proposals?.length || 0} verified options`,
        `[Approval Gate] Status is now: ${task.status}`,
        `[Mobile Bridge] WhatsApp interactive notification dispatched to client mobile`,
      ]);

      setTimeout(() => {
        router.push(`/tasks/${task.id}`);
      }, 1500);
    } catch (err: any) {
      setLogMessages((prev) => [...prev, `[Error] ${err.message}`]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 font-sans">
      <div className="border-b border-[#e8e2d8] pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8a7053]">
            Proventa Systems · Demonstration Lab
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
            End-to-End Execution
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141312]">
          Experience Real Concierge Task Execution
        </h1>
        <p className="text-xs sm:text-sm text-[#5a4937] mt-1 max-w-3xl leading-relaxed">
          Select any verified real-world scenario to observe the complete Proventa lifecycle: natural-language ingestion, multi-agent decomposition, live option presentation with approval buttons, WhatsApp bridge dispatch, and zero-fabrication verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEMO_SCENARIOS.map((sc) => {
          const isSelected = selectedScenario.id === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => setSelectedScenario(sc)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                isSelected
                  ? 'border-[#8a7053] bg-[#faf8f5] shadow-md shadow-brand-900/5'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a7053]">
                    {sc.categoryLabel}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      sc.tier === 'REAL'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {sc.tier} EXECUTION
                  </span>
                </div>

                <h3 className="text-base font-serif font-semibold text-[#141312] mb-1.5">
                  {sc.title}
                </h3>
                <p className="text-xs text-[#6e6b65] leading-relaxed mb-3">
                  {sc.description}
                </p>

                <div className="bg-white/80 border border-[#e8e2d8] rounded-xl p-3 text-xs italic text-[#3a3835]">
                  &ldquo;{sc.prompt}&rdquo;
                </div>
              </div>

              <div className="pt-3 border-t border-[#f0eae1] flex items-center justify-between text-xs text-[#6e6b65]">
                <span>Est: <strong className="text-[#141312]">{sc.budgetEstimate}</strong></span>
                <span className="text-[11px] font-medium text-[#8a7053] flex items-center gap-1">
                  {isSelected ? 'Selected' : 'Select scenario'}
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border-2 border-[#141312] bg-[#141312] text-[#faf8f5] p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 block mb-1">
              Active Demonstration Target
            </span>
            <h2 className="text-xl font-serif text-white">{selectedScenario.title}</h2>
          </div>

          <button
            onClick={handleLaunchScenario}
            disabled={running}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#141312] text-xs uppercase tracking-widest font-bold shadow-lg transition-all disabled:opacity-50"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{running ? 'Executing Scenario...' : 'Execute Live Scenario'}</span>
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>Execution Telemetry Console</span>
            <span className="text-[10px] text-emerald-400 font-bold">● GATEWAY READY</span>
          </div>

          <div className="bg-[#0a0a09] border border-neutral-800 rounded-xl p-4 font-mono text-xs text-neutral-300 space-y-1.5 min-h-[140px] max-h-64 overflow-y-auto">
            {logMessages.length === 0 ? (
              <p className="text-neutral-600">
                Click &quot;Execute Live Scenario&quot; to initiate multi-agent parsing, option generation, and task lifecycle tracking.
              </p>
            ) : (
              logMessages.map((msg, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 select-none">&gt;</span>
                  <span className={msg.includes('[Error]') ? 'text-red-400' : msg.includes('[Pass Issued]') ? 'text-emerald-400' : 'text-neutral-300'}>
                    {msg}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {createdTaskId && (
          <div className="pt-2 flex items-center justify-end">
            <Link
              href={`/tasks/${createdTaskId}`}
              className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:underline font-semibold"
            >
              <span>View Interactive Approval & Verified Pass in Task Ledger</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#5a4937]">
        <div className="p-4 rounded-xl bg-white border border-neutral-200">
          <ShieldCheck className="h-5 w-5 text-emerald-700 mb-2" />
          <h4 className="font-semibold text-neutral-900 mb-1">Zero-Fabrication Guarantee</h4>
          <p className="text-neutral-500 leading-relaxed">External references are only generated after real partner validation or explicit telephone verification.</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-neutral-200">
          <MessageSquare className="h-5 w-5 text-amber-700 mb-2" />
          <h4 className="font-semibold text-neutral-900 mb-1">WhatsApp & Mobile Bridge</h4>
          <p className="text-neutral-500 leading-relaxed">Interactive notifications sent directly to client chat apps with 1-reply approval support.</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-neutral-200">
          <Building className="h-5 w-5 text-purple-700 mb-2" />
          <h4 className="font-semibold text-neutral-900 mb-1">Human Operator Desk</h4>
          <p className="text-neutral-500 leading-relaxed">Instant fallback queue for senior concierges to inject proposals and log offline reservations.</p>
        </div>
      </div>
    </div>
  );
}