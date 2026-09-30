'use client';

import React from 'react';
import { CheckCircle2, Clock, Sparkles, AlertCircle } from 'lucide-react';

export interface DAGNodeViewProps {
  id: string;
  category: string;
  assignedAgent: string;
  objective: string;
  executionType: 'SEQUENTIAL' | 'PARALLEL' | 'CONDITIONAL';
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  verificationReference?: string;
  error?: string;
}

export function DAGGraphView({
  nodes,
  rootObjective,
}: {
  nodes: DAGNodeViewProps[];
  rootObjective: string;
}) {
  if (!nodes || nodes.length === 0) return null;

  return (
    <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#1F2933]" />
          <h3 className="text-xs uppercase tracking-widest font-semibold text-[#1F2933]">
            Autonomous Execution Graph
          </h3>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F7F8FA] border border-[#E1E5E8] text-[#1F2933] font-mono">
          {nodes.filter((n) => n.status === 'COMPLETED').length}/{nodes.length} Handled
        </span>
      </div>

      <p className="text-xs text-[#66717C] mb-5 font-sans">
        Request decomposed into coordinated subtasks executed across Proventa specialist agents:
      </p>

      <div className="space-y-3 relative">
        {nodes.map((node, idx) => {
          const isCompleted = node.status === 'COMPLETED';
          const isRunning = node.status === 'RUNNING';
          const isFailed = node.status === 'FAILED';

          return (
            <div
              key={node.id}
              className={`p-4 rounded-xl border transition-all ${
                isCompleted
                  ? 'bg-emerald-50/40 border-emerald-200/80 text-emerald-950'
                  : isRunning
                  ? 'bg-[#F1F3F5] border-[#1F2933] text-[#1F2933] animate-pulse'
                  : isFailed
                  ? 'bg-red-50/40 border-red-200 text-red-950'
                  : 'bg-[#F7F8FA] border-[#E1E5E8] text-[#303942]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : isFailed ? (
                      <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-[#A7B0B8] shrink-0" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#1F2933] font-sans">
                        {node.objective}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#E1E5E8] text-[#1F2933] font-mono">
                        {node.executionType}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#66717C] font-sans">
                      Assigned to <span className="font-medium text-[#1F2933]">{node.assignedAgent}</span>
                    </p>
                    {node.verificationReference && (
                      <p className="text-[10px] text-emerald-700 font-mono mt-1">
                        Authoritative Ref: {node.verificationReference}
                      </p>
                    )}
                    {node.error && (
                      <p className="text-[10px] text-red-600 font-mono mt-1">
                        {node.error}
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : isRunning
                      ? 'bg-[#1F2933] text-white'
                      : isFailed
                      ? 'bg-red-100 text-red-800'
                      : 'bg-[#E5E9ED] text-[#303942]'
                  }`}
                >
                  {node.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
