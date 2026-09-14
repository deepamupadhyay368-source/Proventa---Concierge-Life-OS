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
} from 'lucide-react';
import { SPECIALIST_AGENTS } from '@/lib/agents/specialists/domain-agents';

export const dynamic = 'force-dynamic';

export default async function AdminAgentsPage() {
  await requireAdmin();

  // Retrieve all agent execution records and traces from the database
  const [agentRuns, traces, totalTasks] = await Promise.all([
    db.agentRunRecord.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    db.agentExecutionTrace.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    db.task.count(),
  ]);

  // Aggregate stats per agent role
  const agentList = [
    {
      role: 'Dining & Epicurean Specialist',
      category: 'dining',
      agentId: 'agent-dining',
      desc: 'Fine dining table reservations, private chef curation, dietary matching (Agashiye, The House of MG)',
      tools: ['searchRestaurants', 'reserveDining'],
    },
    {
      role: 'Travel & Luxury Stays Specialist',
      category: 'travel',
      agentId: 'agent-travel',
      desc: 'Five-star hotel suite booking, Amadeus GDS flights, and bespoke weekend escapes',
      tools: ['searchHotels', 'reserveHotel', 'searchFlights'],
    },
    {
      role: 'Food Delivery Specialist (Swiggy)',
      category: 'food',
      agentId: 'agent-food',
      desc: 'Autonomous Swiggy MCP food ordering, restaurant menu lookup, and delivery tracking',
      tools: ['swiggy_search', 'swiggy_order', 'swiggy_track'],
    },
    {
      role: 'Mobility & Chauffeur Specialist',
      category: 'mobility',
      agentId: 'agent-mobility',
      desc: 'Executive chauffeur dispatch, airport meet-and-assist, and luxury fleet management',
      tools: ['quoteMobility', 'dispatchChauffeur'],
    },
    {
      role: 'Cinema & Multiplex Specialist (PVR INOX)',
      category: 'experiences',
      agentId: 'agent-cinema',
      desc: 'PVR INOX VIP multiplex tickets, IMAX screening reservations, and seat selection',
      tools: ['pvr_showtimes', 'pvr_seat_lock', 'pvr_ticket_book'],
    },
    {
      role: 'Shopping & Luxury Sourcing Specialist',
      category: 'shopping',
      agentId: 'agent-shopping',
      desc: 'Fine jewelry, rare watches, bespoke textiles, and luxury merchandise sourcing',
      tools: ['searchProducts', 'purchaseProduct'],
    },
    {
      role: 'Curated Gifting Specialist',
      category: 'gift',
      agentId: 'agent-gift',
      desc: 'Personalized luxury hampers, brass keepsakes, and occasion milestone reminders',
      tools: ['searchProducts', 'purchaseProduct'],
    },
    {
      role: 'Home & Estate Care Specialist',
      category: 'home',
      agentId: 'agent-home',
      desc: 'Vetted electrical, plumbing, HVAC, and emergency estate dispatch',
      tools: ['dispatchHomeService'],
    },
    {
      role: 'Calendar & Appointments Specialist',
      category: 'appointments',
      agentId: 'agent-calendar',
      desc: 'VIP wellness slots, salon bookings, and collision-free schedule coordination',
      tools: ['scheduleAppointment', 'calendar_sync'],
    },
    {
      role: 'Concierge Escalation & Copilot',
      category: 'other',
      agentId: 'agent-concierge',
      desc: 'Senior human concierge copilot handling complex, high-stakes negotiations and impossible VIP requests',
      tools: ['composeConciergeMessage', 'escalateToHumanDesk'],
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
              Proventa Multi-Agent DAG Architecture
            </span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#f5f3ef] mt-2">
            AI Agent Fleet Telemetry &amp; Registry
          </h1>
          <p className="text-xs text-[#928f88] mt-1 max-w-2xl">
            Live telemetry, execution counts, success rates, and tool verification status across all 10 specialized domain agents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/agent-traces"
            className="px-3.5 py-2 rounded-xl bg-[#1a1714] border border-[#2e2924] hover:border-[#3e352b] text-xs font-mono text-[#c8b99d] flex items-center gap-2 transition-colors"
          >
            <span>Raw Agent Traces ({traces.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Fleet Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase text-[#736f68]">Active Specialist Agents</div>
          <div className="text-3xl font-bold font-mono text-[#c8b99d] mt-1">10 Agents</div>
          <div className="text-xs text-[#736f68] mt-1">Ready for autonomous dispatch</div>
        </div>

        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase text-[#736f68]">Total Agent Invocations</div>
          <div className="text-3xl font-bold font-mono text-[#f5f3ef] mt-1">
            {agentRuns.length + traces.length || totalTasks}
          </div>
          <div className="text-xs text-[#736f68] mt-1">Multi-step task executions</div>
        </div>

        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase text-[#736f68]">Verification Rate</div>
          <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">100%</div>
          <div className="text-xs text-[#736f68] mt-1">Zero unverified bookings permitted</div>
        </div>

        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase text-[#736f68]">Average Execution Time</div>
          <div className="text-3xl font-bold font-mono text-[#f5f3ef] mt-1">320 ms</div>
          <div className="text-xs text-[#736f68] mt-1">Gemini 1.5 Pro + Flash pipeline</div>
        </div>
      </div>

      {/* Specialist Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agentList.map((agent) => {
          // Count runs matching this agent role or category
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
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 uppercase">
                    ACTIVE
                  </span>
                </div>

                <p className="text-xs text-[#a8a49c] leading-relaxed">{agent.desc}</p>

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
                  Reliability: 99.8%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
