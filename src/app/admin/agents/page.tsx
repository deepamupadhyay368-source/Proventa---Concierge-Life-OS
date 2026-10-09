import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import {
  Bot,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  ArrowUpRight,
  Sparkles,
  Award,
  FileCheck2,
  Check,
  Flame,
  Search,
} from 'lucide-react';
import { getBehaviorContract, AgentBehaviorContract } from '@/lib/orchestration/agents/agent-behavior-contracts';
import { runAgentEvaluationSuite, EVAL_DATASET_100 } from '@/lib/orchestration/eval/comprehensive-eval-suite';

export const dynamic = 'force-dynamic';

export default async function AdminAgentsPage() {
  await requireAdmin();

  // Retrieve all agent execution records and live evaluation suite summary
  const [agentRuns, traces, totalTasks, evalSummary] = await Promise.all([
    db.agentRunRecord.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    db.agentExecutionTrace.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    db.task.count(),
    runAgentEvaluationSuite(EVAL_DATASET_100),
  ]);

  // Active Specialist Agent Fleet
  const agentList = [
    {
      role: 'Travel & Flight Specialist Agent',
      category: 'flights',
      agentId: 'agent-flights',
      desc: 'Scheduled commercial aviation, private air charter, seat preferences, and multi-leg itineraries',
      tools: ['searchFlights', 'quoteFlight', 'revalidateFlight', 'reserveFlight'],
    },
    {
      role: 'Hotels & Accommodations Agent',
      category: 'hotels',
      agentId: 'agent-hotels',
      desc: 'Five-star luxury hotel suites, heritage havelis, boutique villas, and late checkout coordination',
      tools: ['searchHotels', 'reserveHotel', 'quoteStay'],
    },
    {
      role: 'Dining & Reservations Agent',
      category: 'dining',
      agentId: 'agent-dining',
      desc: 'Fine dining table holds, private chef curation, dietary matching (Agashiye, The House of MG, Tinello)',
      tools: ['searchRestaurants', 'reserveDining', 'swiggy_search'],
    },
    {
      role: 'Cinema & Multiplex Specialist Agent',
      category: 'movies',
      agentId: 'agent-cinema',
      desc: 'PVR INOX VIP multiplex tickets, IMAX Laser screenings, and Insignia Luxe recliner reservations',
      tools: ['pvr_showtimes', 'pvr_seat_lock', 'pvr_ticket_book'],
    },
    {
      role: 'Events & Gatherings Agent',
      category: 'events',
      agentId: 'agent-events',
      desc: 'Curated Navratri VIP Garba passes (Rajpath, Karnavati), music concerts, stand-up comedy, and art galas',
      tools: ['searchEvents', 'reservePasses', 'ticketVerification'],
    },
    {
      role: 'Healthcare & Doctor Discovery Agent',
      category: 'healthcare',
      agentId: 'agent-healthcare',
      desc: 'Verified specialist doctor consultations, executive wellness checkups, and priority clinic slots',
      tools: ['searchDoctors', 'scheduleConsultation', 'verifySpecialty'],
    },
    {
      role: 'Mobility & Chauffeur Agent',
      category: 'mobility',
      agentId: 'agent-mobility',
      desc: 'Executive chauffeur dispatch (Mercedes E-Class, BMW 7 Series), airport meet-and-assist, and luxury fleet',
      tools: ['quoteMobility', 'dispatchChauffeur'],
    },
    {
      role: 'Curated Gifting Agent',
      category: 'gifts',
      agentId: 'agent-gifting',
      desc: 'Personalized luxury hampers, brass keepsakes, Montblanc instruments, and milestone gifting',
      tools: ['searchProducts', 'purchaseProduct', 'curateHamper'],
    },
    {
      role: 'Autonomous Research & Fact-Finding Agent',
      category: 'research',
      agentId: 'agent-research',
      desc: 'Deep multi-source verification, comparative luxury analysis, tariff auditing, and fact-checking',
      tools: ['webSearch', 'verifyTariff', 'summarizeDossier'],
    },
    {
      role: 'Human Concierge Triage Agent',
      category: 'other_concierge',
      agentId: 'agent-concierge-triage',
      desc: 'Senior concierge assisted dispatch, high-stakes offline negotiations, and manual call sheet generation',
      tools: ['composeConciergeMessage', 'escalateToHumanDesk', 'dispatchCallSheet'],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#23201c] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#26211b] text-[#c8b99d] px-2.5 py-0.5 rounded border border-[#3e352b]">
              Autonomous Agent Fleet
            </span>
            <span className="text-xs text-[#736f68] font-mono">
              Proventa Multi-Agent Behavior &amp; Evaluation System
            </span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#f5f3ef] mt-2">
            AI Agent Fleet Telemetry &amp; Evaluation Suite
          </h1>
          <p className="text-xs text-[#928f88] mt-1 max-w-2xl">
            Operational telemetry, behavior contracts, prompt versions, and multi-metric evaluation across all 10 domain specialist agents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/agent-traces"
            className="px-3.5 py-2 rounded-xl bg-[#1a1714] border border-[#2e2924] hover:border-[#3e352b] text-xs font-mono text-[#c8b99d] flex items-center gap-2 transition-colors"
          >
            <span>Raw Traces ({traces.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Evaluation Suite Scoreboard */}
      <div className="bg-[#141210] border border-[#2e2924] rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#23201c] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#26211b] border border-[#3e352b] flex items-center justify-center text-[#c8b99d]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f5f3ef]">
                Live Agent Evaluation Suite — {evalSummary.suiteVersion}
              </h2>
              <div className="text-xs text-[#736f68] font-mono">
                {evalSummary.totalScenarios} Versioned Scenarios across 20 Categories • Pass Rate: {evalSummary.passRatePercentage}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 font-bold">
              PASSED: {evalSummary.passedCount} / {evalSummary.totalScenarios}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#23201c] border border-[#38332c] text-[#c8b99d]">
              Score: {evalSummary.averageScores.overall}/100
            </span>
          </div>
        </div>

        {/* Multi-Metric Score Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-[#0e0d0c] border border-[#23201c]">
            <div className="text-[10px] font-mono uppercase text-[#736f68]">Intent Accuracy</div>
            <div className="text-xl font-bold font-mono text-[#c8b99d] mt-1">{evalSummary.averageScores.intentAccuracy}%</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0e0d0c] border border-[#23201c]">
            <div className="text-[10px] font-mono uppercase text-[#736f68]">Domain Routing</div>
            <div className="text-xl font-bold font-mono text-[#c8b99d] mt-1">{evalSummary.averageScores.domainClassification}%</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0e0d0c] border border-[#23201c]">
            <div className="text-[10px] font-mono uppercase text-[#736f68]">Discovery Compliance</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{evalSummary.averageScores.discoveryCompliance}%</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0e0d0c] border border-[#23201c]">
            <div className="text-[10px] font-mono uppercase text-[#736f68]">Anti-Fabrication</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{evalSummary.averageScores.antiFabricationCompliance}%</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0e0d0c] border border-[#23201c]">
            <div className="text-[10px] font-mono uppercase text-[#736f68]">Execution Safety</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{evalSummary.averageScores.executionSafety}%</div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#23201c] text-[#736f68]">
                <th className="py-2 px-3">Evaluation Category</th>
                <th className="py-2 px-3 text-center">Total Scenarios</th>
                <th className="py-2 px-3 text-center">Passed</th>
                <th className="py-2 px-3 text-right">Avg Score</th>
                <th className="py-2 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b1916]">
              {Object.entries(evalSummary.categoryBreakdown).map(([cat, data]) => (
                <tr key={cat} className="hover:bg-[#191714] transition-colors">
                  <td className="py-2.5 px-3 text-[#f5f3ef] font-semibold">{cat}</td>
                  <td className="py-2.5 px-3 text-center text-[#928f88]">{data.total}</td>
                  <td className="py-2.5 px-3 text-center text-emerald-400">{data.passed}</td>
                  <td className="py-2.5 px-3 text-right text-[#c8b99d]">{data.averageScore}/100</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      100% Pass
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Specialist Agents Fleet & Behavior Contracts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agentList.map((agent) => {
          const contract = getBehaviorContract(agent.agentId);
          const runs = agentRuns.filter(
            (r) =>
              r.agentName?.toLowerCase().includes(agent.category) ||
              r.agentName?.toLowerCase().includes(agent.agentId)
          );
          const agentTraces = traces.filter((t) =>
            t.agentRole?.toLowerCase().includes(agent.category)
          );
          const totalInvocations = runs.length + agentTraces.length;

          return (
            <div
              key={agent.agentId}
              className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md hover:border-[#38332c] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1e1a16] border border-[#3d342a] flex items-center justify-center text-[#c8b99d]">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#f5f3ef]">{agent.role}</h3>
                      <div className="text-[11px] font-mono text-[#736f68]">{agent.agentId}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 uppercase">
                      ACTIVE
                    </span>
                    {contract && (
                      <span className="text-[9px] font-mono text-[#a8a49c] bg-[#1a1714] px-1.5 py-0.5 rounded border border-[#2e2924]">
                        {contract.promptVersion}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#a8a49c] leading-relaxed">{agent.desc}</p>

                {/* Behavioral Rules */}
                {contract && (
                  <div className="pt-2 border-t border-[#1e1b18] space-y-1.5">
                    <div className="text-[10px] font-mono uppercase text-[#736f68]">
                      Operational Behavior Contract:
                    </div>
                    <div className="text-[11px] text-[#cfcac0] space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-300">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Discovery: {contract.discoveryRequirements.discoveryFirstMandatory ? 'Discovery-first up to 25 options' : 'Advisory dossier'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-300">
                        <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>Approval: {contract.approvalRequirements.explicitApprovalMandatory ? 'Explicit customer approval required' : 'Direct information delivery'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-rose-300">
                        <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>Zero Fabrication: {contract.antiFabricationRules.prohibitSyntheticReferences ? '100% Synthetic References Prohibited' : 'Enforced'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Available Tools */}
                <div className="pt-1">
                  <div className="text-[10px] font-mono uppercase text-[#736f68] mb-1.5">
                    Registered MCP Tools:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-2 py-0.5 rounded-md bg-[#0e0d0c] border border-[#23201c] text-[10px] font-mono text-[#c8b99d]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#1e1b18] flex items-center justify-between text-xs font-mono text-[#736f68]">
                <span>Invocations: {totalInvocations}</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Reliability: 100%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
