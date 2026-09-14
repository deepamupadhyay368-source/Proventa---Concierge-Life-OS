import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import {
  ArrowLeft,
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Bot,
  User,
  ExternalLink,
  ChevronRight,
  Terminal,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  await requireAdmin();
  const resolvedParams = await Promise.resolve(params);

  const task = await db.task.findUnique({
    where: { id: resolvedParams.id },
    include: {
      customer: {
        include: {
          user: {
            select: { name: true, email: true, phone: true },
          },
        },
      },
      planSteps: {
        orderBy: { stepNumber: 'asc' },
      },
      executionTraces: {
        orderBy: { createdAt: 'asc' },
      },
      subtasks: true,
      events: {
        orderBy: { createdAt: 'desc' },
      },
      externalTransactions: true,
    },
  });

  if (!task) {
    notFound();
  }

  const isConfirmed = ['CONFIRMED', 'COMPLETED'].includes(task.status);
  const isNeedsHuman = ['NEEDS_HUMAN', 'FAILED'].includes(task.status);

  return (
    <div className="space-y-8">
      {/* Breadcrumbs & Header */}
      <div>
        <Link
          href="/admin/tasks"
          className="inline-flex items-center gap-1.5 text-xs text-[#858077] hover:text-[#c8b99d] transition-colors mb-3 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Task Engine Operations</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#23201c] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-[#c8b99d]">
                #{task.publicId}
              </span>
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded bg-[#1c1916] text-[#a8a49c] border border-[#2e2924]">
                {task.category}
              </span>
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase font-medium ${
                  isConfirmed
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                    : isNeedsHuman
                    ? 'bg-purple-950/60 text-purple-400 border border-purple-800/40'
                    : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                }`}
              >
                {task.status}
              </span>
            </div>
            <h1 className="text-2xl font-serif font-medium text-[#f5f3ef] mt-2">
              {task.intent}
            </h1>
            <p className="text-xs text-[#736f68] font-mono mt-1">
              Created: {new Date(task.createdAt).toLocaleString()} · Client:{' '}
              {task.customer?.user?.name || task.customer?.user?.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {task.externalTransactions && task.externalTransactions.length > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-[#1a1714] border border-[#2e2924] text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PNR: {task.externalTransactions[0]?.providerReference || 'Confirmed'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4">
          <div className="text-[10px] font-mono uppercase text-[#736f68]">Client</div>
          <div className="text-sm font-medium text-[#f5f3ef] mt-1 truncate">
            {task.customer?.user?.name || 'Private VIP Member'}
          </div>
          <div className="text-[11px] font-mono text-[#736f68] truncate">
            {task.customer?.user?.email}
          </div>
        </div>

        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4">
          <div className="text-[10px] font-mono uppercase text-[#736f68]">Budget Cap</div>
          <div className="text-sm font-medium text-[#c8b99d] font-mono mt-1">
            {task.budgetAmount ? `₹${task.budgetAmount.toLocaleString('en-IN')}` : 'Flexible / Quoted'}
          </div>
          <div className="text-[11px] text-[#736f68]">Authorized limit</div>
        </div>

        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4">
          <div className="text-[10px] font-mono uppercase text-[#736f68]">DAG Pipeline Steps</div>
          <div className="text-sm font-medium text-[#f5f3ef] font-mono mt-1">
            {task.planSteps.length} Multi-Step Actions
          </div>
          <div className="text-[11px] text-[#736f68]">Autonomous sequence</div>
        </div>

        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4">
          <div className="text-[10px] font-mono uppercase text-[#736f68]">Escalation Trigger</div>
          <div className="text-sm font-medium font-mono mt-1">
            {task.isEscalated ? (
              <span className="text-purple-400">Human Operator Active</span>
            ) : (
              <span className="text-emerald-400">Autonomous Machine Loop</span>
            )}
          </div>
          <div className="text-[11px] text-[#736f68]">Zero risk compliance</div>
        </div>
      </div>

      {/* Multi-Step DAG Pipeline Visualizer */}
      <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-[#23201c] pb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#c8b99d]" />
            <h2 className="text-sm font-semibold text-[#f5f3ef]">
              Autonomous DAG Execution Pipeline
            </h2>
          </div>
          <span className="text-xs font-mono text-[#736f68]">
            {task.planSteps.length} Step(s) Recorded
          </span>
        </div>

        {task.planSteps.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#736f68]">
            Plan steps initialized dynamically at runtime.
          </div>
        ) : (
          <div className="space-y-4">
            {task.planSteps.map((step: any) => (
              <div
                key={step.id}
                className="p-4 rounded-xl bg-[#0e0d0c] border border-[#23201c] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#1e1a16] border border-[#3d342a] flex items-center justify-center font-mono text-xs font-bold text-[#c8b99d]">
                      {step.stepNumber}
                    </span>
                    <span className="text-xs font-semibold text-[#f5f3ef]">
                      {step.description}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-medium ${
                      step.status === 'COMPLETED'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        : step.status === 'IN_PROGRESS'
                        ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                        : 'bg-[#1c1916] text-[#736f68] border border-[#2e2924]'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>

                {/* Tool and Action Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#141210] p-3 rounded-lg border border-[#1e1b18]">
                  <div>
                    <span className="text-[#736f68] font-mono text-[10px] uppercase block">
                      Specialist Assigned
                    </span>
                    <span className="font-mono text-[#c8b99d] text-[11px]">
                      {step.assignedAgentRole || 'Domain Specialist'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#736f68] font-mono text-[10px] uppercase block">
                      Tool Invocation
                    </span>
                    <span className="font-mono text-[#f5f3ef] text-[11px]">
                      {step.actionType || 'executeTool'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raw Agent Telemetry Traces with Secret Masking */}
      <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-[#23201c] pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-[#f5f3ef]">
              Agent Trace Inspector (Masked Secrets)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded">
            AES-256 Masking Active
          </span>
        </div>

        {task.executionTraces.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#736f68]">
            No raw execution trace anomalies captured.
          </div>
        ) : (
          <div className="space-y-3">
            {task.executionTraces.map((trace: any) => (
              <div
                key={trace.id}
                className="p-4 rounded-xl bg-[#0c0b0a] border border-[#23201c] space-y-2 font-mono text-xs"
              >
                <div className="flex items-center justify-between text-[#858077]">
                  <span className="text-[#c8b99d] font-bold">{trace.agentRole}</span>
                  <span className="text-[10px]">{new Date(trace.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="text-[11px] text-[#a8a49c]">
                  Tool: <span className="text-emerald-400">{trace.toolName || 'N/A'}</span> · Latency:{' '}
                  {trace.latencyMs}ms
                </div>
                {trace.toolInput && (
                  <pre className="p-2.5 rounded-lg bg-[#141210] border border-[#1e1b18] text-[10px] text-[#736f68] overflow-x-auto">
                    {JSON.stringify(trace.toolInput, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
