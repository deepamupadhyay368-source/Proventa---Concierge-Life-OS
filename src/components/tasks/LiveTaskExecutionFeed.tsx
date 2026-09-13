'use client';

import React from 'react';
import { CheckCircle2, Clock, ShieldAlert, Loader2, PlayCircle } from 'lucide-react';

export interface PlanStepItem {
  id: string;
  stepNumber: number;
  title: string;
  description?: string;
  assignedAgent: string;
  toolName: string;
  status: 'PENDING' | 'READY' | 'EXECUTING' | 'WAITING_FOR_CONFIRMATION' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  costPaise?: number;
  providerReference?: string;
}

interface LiveTaskExecutionFeedProps {
  taskId: string;
  steps: PlanStepItem[];
  currentStatus: string;
  onApproveStep?: (stepId: string) => void;
}

export const LiveTaskExecutionFeed: React.FC<LiveTaskExecutionFeedProps> = ({
  taskId,
  steps,
  currentStatus,
  onApproveStep,
}) => {
  return (
    <div className="bg-[#1a1714] border border-[#2e2924] rounded-2xl p-6 text-[#fafaf9]">
      <div className="flex items-center justify-between border-b border-[#2e2924] pb-4 mb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#c8b99d]">Autonomous Execution Engine</span>
          <h3 className="text-lg font-serif font-medium text-[#f5f3ef] mt-1">Multi-Agent Task Plan</h3>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#2a241e] text-[#c8b99d] border border-[#3e352b]">
          {currentStatus}
        </span>
      </div>

      <div className="space-y-4">
        {steps.map((step) => {
          const isCompleted = step.status === 'COMPLETED';
          const isExecuting = step.status === 'EXECUTING';
          const isWaiting = step.status === 'WAITING_FOR_CONFIRMATION';

          return (
            <div
              key={step.id || step.stepNumber}
              className={`p-4 rounded-xl border transition-all ${
                isExecuting
                  ? 'border-[#b09a78] bg-[#221d17]'
                  : isWaiting
                  ? 'border-[#eab308]/60 bg-[#262014]'
                  : isCompleted
                  ? 'border-[#2e2924] bg-[#161412] opacity-80'
                  : 'border-[#2e2924]/60 bg-[#141312]/40 opacity-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isExecuting ? (
                      <Loader2 className="w-5 h-5 text-[#c8b99d] animate-spin" />
                    ) : isWaiting ? (
                      <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" />
                    ) : (
                      <Clock className="w-5 h-5 text-[#6e6b65]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#928f88]">Step {step.stepNumber}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#2a241e] text-[#b09a78] font-mono">
                        {step.assignedAgent}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-[#f5f3ef] mt-1">{step.title}</h4>
                    {step.description && (
                      <p className="text-xs text-[#928f88] mt-0.5">{step.description}</p>
                    )}
                    {step.providerReference && (
                      <div className="mt-2 text-xs font-mono text-emerald-400/90 bg-emerald-950/30 px-2.5 py-1 rounded inline-block">
                        Ref: {step.providerReference}
                      </div>
                    )}
                  </div>
                </div>

                {isWaiting && onApproveStep && (
                  <button
                    onClick={() => onApproveStep(step.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#b09a78] hover:bg-[#c8b99d] text-[#141312] text-xs font-semibold transition-colors"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    Authorize
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
