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
    <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 text-[#1F2933] shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E1E5E8] pb-4 mb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#66717C]">Autonomous Execution Engine</span>
          <h3 className="text-lg font-serif font-medium text-[#1F2933] mt-1">Multi-Agent Task Plan</h3>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8]">
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
                  ? 'border-[#1F2933] bg-[#F7F8FA]'
                  : isWaiting
                  ? 'border-amber-400 bg-amber-50/40'
                  : isCompleted
                  ? 'border-[#E1E5E8] bg-white opacity-90'
                  : 'border-[#E1E5E8]/60 bg-[#F7F8FA]/60 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : isExecuting ? (
                      <Loader2 className="w-5 h-5 text-[#1F2933] animate-spin" />
                    ) : isWaiting ? (
                      <ShieldAlert className="w-5 h-5 text-amber-600 animate-pulse" />
                    ) : (
                      <Clock className="w-5 h-5 text-[#A7B0B8]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#66717C]">Step {step.stepNumber}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#F1F3F5] text-[#1F2933] font-mono border border-[#E1E5E8]">
                        {step.assignedAgent}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-[#1F2933] mt-1">{step.title}</h4>
                    {step.description && (
                      <p className="text-xs text-[#66717C] mt-0.5">{step.description}</p>
                    )}
                    {step.providerReference && (
                      <div className="mt-2 text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-block">
                        Ref: {step.providerReference}
                      </div>
                    )}
                  </div>
                </div>

                {isWaiting && onApproveStep && (
                  <button
                    onClick={() => onApproveStep(step.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F2933] hover:bg-[#111820] text-white text-xs font-semibold transition-colors shadow-xs"
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

