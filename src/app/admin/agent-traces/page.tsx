import React from 'react';
import { db } from '@/lib/db';
import { ShieldCheck, AlertTriangle, Terminal, Layers, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAgentTracesPage() {
  const traces = await db.agentExecutionTrace.findMany({
    take: 40,
    orderBy: { createdAt: 'desc' },
    include: {
      task: {
        select: {
          publicId: true,
          category: true,
          status: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#141312] text-[#fafaf9] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#2e2924]">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#c8b99d]">Observability & Telemetry</span>
            <h1 className="text-2xl font-serif font-medium text-[#f5f3ef] mt-1">Autonomous Agent Traces</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-mono rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Dynamic MCP Registry Active
            </span>
          </div>
        </div>

        <div className="grid gap-4">
          {traces.length === 0 ? (
            <div className="p-12 text-center border border-[#2e2924] rounded-2xl bg-[#1a1714]">
              <Terminal className="w-8 h-8 text-[#6e6b65] mx-auto mb-3" />
              <p className="text-sm text-[#928f88]">No agent execution traces recorded yet.</p>
              <p className="text-xs text-[#6e6b65] mt-1">Traces populate automatically when autonomous plans execute.</p>
            </div>
          ) : (
            traces.map((trace) => (
              <div key={trace.id} className="p-5 border border-[#2e2924] rounded-xl bg-[#1a1714] hover:border-[#3e352b] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2.5 py-1 rounded font-mono bg-[#2a241e] text-[#c8b99d]">
                      {trace.agentRole}
                    </span>
                    <span className="text-xs font-mono text-[#928f88]">
                      Task: {trace.task?.publicId || 'N/A'}
                    </span>
                    <span className="text-xs font-mono text-[#6e6b65] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {trace.latencyMs ? trace.latencyMs + 'ms' : 'fast'}
                    </span>
                  </div>
                  {trace.isError ? (
                    <span className="text-xs font-mono text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Failed
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Executed
                    </span>
                  )}
                </div>

                <div className="text-sm font-medium text-[#f5f3ef] mb-2">{trace.intent}</div>

                {trace.errorMessage && (
                  <div className="p-3 mb-3 text-xs font-mono text-red-300 bg-red-950/30 border border-red-900/50 rounded-lg">
                    {trace.errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-[#141312] border border-[#2e2924]">
                    <div className="text-[#6e6b65] mb-1">Tool Input</div>
                    <pre className="text-[#c8b99d] overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(trace.inputData, null, 2)}
                    </pre>
                  </div>
                  <div className="p-3 rounded-lg bg-[#141312] border border-[#2e2924]">
                    <div className="text-[#6e6b65] mb-1">Result Payload</div>
                    <pre className="text-emerald-400/90 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(trace.outputData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
