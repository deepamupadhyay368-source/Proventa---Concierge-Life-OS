import { db } from '@/lib/db';
import { SPECIALIST_AGENTS } from '@/lib/agents/specialists/domain-agents';
import { ToolRegistry } from '@/lib/agents/registry/tool-registry';
import { Bot, Shield, Wrench, CheckCircle2, Clock, AlertTriangle, PlayCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AgentConsolePage() {
  const agents = Object.values(SPECIALIST_AGENTS);
  const tools = ToolRegistry.getAllTools();

  // Fetch recent 15 agent execution runs from database
  const recentRuns = await db.agentRunRecord.findMany({
    orderBy: { createdAt: 'desc' },
    take: 15,
    include: {
      task: {
        select: {
          publicId: true,
          originalRequest: true,
          status: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif text-neutral-900 tracking-tight flex items-center gap-3">
          <Bot className="h-7 w-7 text-brand-600" />
          Autonomous AI Agent Platform
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Specialized autonomous agents, tool permissions registry, context-isolated memory, and real-time execution telemetry.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-500 text-xs font-medium uppercase tracking-wider">
            <Bot className="h-4 w-4 text-brand-600" />
            Specialist Agents
          </div>
          <p className="text-2xl font-semibold text-neutral-900 mt-2">{agents.length}</p>
          <p className="text-[11px] text-neutral-400 mt-1">Active across 12 domains</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-500 text-xs font-medium uppercase tracking-wider">
            <Wrench className="h-4 w-4 text-emerald-600" />
            Registered Tools
          </div>
          <p className="text-2xl font-semibold text-neutral-900 mt-2">{tools.length}</p>
          <p className="text-[11px] text-neutral-400 mt-1">Zod-validated & risk-rated</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-500 text-xs font-medium uppercase tracking-wider">
            <Shield className="h-4 w-4 text-indigo-600" />
            Zero-Hallucination Policy
          </div>
          <p className="text-2xl font-semibold text-emerald-700 mt-2">Active</p>
          <p className="text-[11px] text-neutral-400 mt-1">Strict adapter verification</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-500 text-xs font-medium uppercase tracking-wider">
            <Clock className="h-4 w-4 text-amber-600" />
            Recorded Runs
          </div>
          <p className="text-2xl font-semibold text-neutral-900 mt-2">{recentRuns.length}</p>
          <p className="text-[11px] text-neutral-400 mt-1">Audited in live database</p>
        </div>
      </div>

      {/* Agents Directory */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-base font-medium text-neutral-900 flex items-center gap-2">
            <Bot className="h-5 w-5 text-neutral-700" />
            Specialized Domain Agents Directory
          </h2>
          <span className="text-xs text-neutral-400">12 Specialized Runtimes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:gap-px bg-neutral-100">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">{agent.name}</h3>
                  <span className="inline-block mt-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                    Category: {agent.category}
                  </span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" title="Online"></span>
              </div>

              <p className="text-xs text-neutral-600 line-clamp-2">{agent.role}</p>

              <div className="space-y-1.5 pt-2 border-t border-neutral-100 text-xs">
                <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Allowed Tools</div>
                <div className="flex flex-wrap gap-1">
                  {agent.allowedTools.map((t) => (
                    <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-50 text-neutral-700 border border-neutral-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-1 text-xs">
                <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Permissions</div>
                <div className="flex flex-wrap gap-1">
                  {agent.permissions.slice(0, 4).map((p) => (
                    <span key={p} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {p}
                    </span>
                  ))}
                  {agent.permissions.length > 4 && (
                    <span className="text-[9px] font-mono px-1 py-0.5 text-neutral-400">
                      +{agent.permissions.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Telemetry & Run Viewer */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-base font-medium text-neutral-900 flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-brand-600" />
            Live Agent Execution Telemetry (Recent Runs)
          </h2>
          <span className="text-xs text-neutral-400">Audit & Non-Fabrication Records</span>
        </div>

        {recentRuns.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            No agent executions logged yet. Process requests to view live telemetry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Task</th>
                  <th className="px-6 py-3">Agent</th>
                  <th className="px-6 py-3">Tools Invoked</th>
                  <th className="px-6 py-3">Latency</th>
                  <th className="px-6 py-3">Outcome</th>
                  <th className="px-6 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {recentRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-neutral-50/50">
                    <td className="px-6 py-3.5">
                      <span className="font-mono font-medium text-neutral-900">{run.task?.publicId || run.taskId.slice(0, 8)}</span>
                      <p className="text-[11px] text-neutral-500 truncate max-w-xs">{run.task?.originalRequest}</p>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-neutral-800">{run.agentName}</td>
                    <td className="px-6 py-3.5 font-mono text-[11px]">
                      {run.toolsCalled.join(', ') || 'Direct execution'}
                    </td>
                    <td className="px-6 py-3.5 text-neutral-500 font-mono">
                      {run.latencyMs ? `${run.latencyMs}ms` : '—'}
                    </td>
                    <td className="px-6 py-3.5">
                      {run.success ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <CheckCircle2 className="h-3 w-3" />
                          VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          <AlertTriangle className="h-3 w-3" />
                          ESCALATED
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-neutral-400 font-mono text-[11px]">
                      {new Date(run.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
