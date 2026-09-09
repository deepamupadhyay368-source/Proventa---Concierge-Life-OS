'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Plane,
  Building,
  Utensils,
  Car,
  Gift,
  Film,
  Calendar,
  CreditCard,
  Lock,
  ArrowRight,
  X,
} from 'lucide-react';
import { DAGGraphView, type DAGNodeViewProps } from '@/components/tasks/dag-graph-view';

export interface TaskExecutionWidgetProps {
  taskId: string;
  publicId?: string;
  status: string;
  assignedAgent?: string;
  category?: string;
  events?: Array<{
    id: string;
    eventType: string;
    actorRole: string;
    message: string;
    createdAt: string;
    data?: any;
  }>;
  proposedOptions?: Array<{
    id: string;
    providerName: string;
    title: string;
    description: string;
    priceAmount: number;
    priceFormatted: string;
    availability?: string;
    isMock?: boolean;
    verificationReference?: string;
  }>;
  dagNodes?: DAGNodeViewProps[];
  externalReferenceId?: string;
  onApproveOption?: (option: any) => void;
  onDeclineOption?: () => void;
  approving?: boolean;
}

const CATEGORY_ICONS: Record<string, any> = {
  flights: Plane,
  travel: Plane,
  hotel: Building,
  dining: Utensils,
  cabs: Car,
  mobility: Car,
  gifts: Gift,
  shopping: Gift,
  movies: Film,
  calendar: Calendar,
};

export function TaskExecutionWidget({
  taskId,
  publicId,
  status,
  assignedAgent = 'Concierge Specialist',
  category = 'concierge',
  events = [],
  proposedOptions = [],
  dagNodes = [],
  externalReferenceId,
  onApproveOption,
  onDeclineOption,
  approving = false,
}: TaskExecutionWidgetProps) {
  const [showDAG, setShowDAG] = useState(true);
  const [showEvents, setShowEvents] = useState(false);

  const isConfirmed = ['CONFIRMED', 'COMPLETED'].includes(status);
  const isAwaitingApproval = status === 'AWAITING_APPROVAL' || status === 'OPTIONS_READY';
  const isExecuting = status === 'EXECUTING' || status === 'SEARCHING' || status === 'VERIFYING';
  const isNeedsHuman = status === 'NEEDS_HUMAN';

  const IconComponent = CATEGORY_ICONS[category.toLowerCase()] || Sparkles;

  return (
    <div className="bg-white border border-[#ded7cc] rounded-2xl p-5 shadow-xs space-y-4 my-3 font-sans">
      {/* Top Header: Agent & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0eae1] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#faf8f5] border border-[#e8e2d8] text-[#8a7053]">
            <IconComponent className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#141312] uppercase tracking-wider">
                {assignedAgent}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#faf8f5] border border-[#ded7cc] text-[#6d5941] font-mono">
                #{publicId || taskId.slice(-6)}
              </span>
            </div>
            <p className="text-[11px] text-[#6e6b65]">
              Coordinated via Proventa Multi-Agent Gateway
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2">
          {isConfirmed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Verified & Confirmed
            </span>
          ) : isAwaitingApproval ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 animate-pulse">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
              Member Approval Required
            </span>
          ) : isExecuting ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
              <Clock className="h-3.5 w-3.5 text-blue-600 animate-spin" />
              Autonomous Execution Active
            </span>
          ) : isNeedsHuman ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
              <AlertCircle className="h-3.5 w-3.5 text-purple-600" />
              Senior Concierge Triaged
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
              {status}
            </span>
          )}
        </div>
      </div>

      {/* Authoritative Provider Verification Badge */}
      {externalReferenceId && (
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-emerald-950">
                Authoritative External Reference Verified
              </p>
              <p className="text-[11px] text-emerald-800 font-mono">
                Provider Reference: <span className="font-bold">{externalReferenceId}</span>
              </p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-white/90 border border-emerald-200 font-mono text-emerald-800 uppercase font-semibold">
            Zero-Fabrication Validated
          </span>
        </div>
      )}

      {/* Embedded DAG Execution Graph */}
      {dagNodes && dagNodes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#6d5941] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Execution Graph (DAG)
            </span>
            <button
              onClick={() => setShowDAG(!showDAG)}
              className="text-[11px] text-[#8a7053] hover:underline flex items-center gap-1"
            >
              {showDAG ? 'Collapse graph' : 'Expand graph'}
              {showDAG ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          {showDAG && (
            <DAGGraphView nodes={dagNodes} rootObjective={`Execution plan for ${assignedAgent}`} />
          )}
        </div>
      )}

      {/* In-Chat Proposal Cards for Immediate One-Click Approval */}
      {isAwaitingApproval && proposedOptions.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-[#141312] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-amber-700" />
              <span>Select & Approve an Option to Execute</span>
            </div>
            {onDeclineOption && (
              <button
                onClick={onDeclineOption}
                disabled={approving}
                className="text-[11px] text-neutral-500 hover:text-red-700 flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <X className="h-3 w-3" />
                <span>Decline all</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {proposedOptions.map((opt) => (
              <div
                key={opt.id}
                className="p-4 rounded-xl border-2 border-amber-300/80 bg-amber-50/40 hover:bg-amber-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#141312]">{opt.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-amber-200 text-[#8a7053] font-mono font-semibold">
                      {opt.providerName}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6e6b65] mt-1">{opt.description}</p>
                  {opt.availability && (
                    <p className="text-[10px] text-emerald-700 font-mono mt-1 font-medium">
                      ✓ {opt.availability}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <span className="font-serif text-sm font-bold text-[#141312]">
                    {opt.priceFormatted || `₹${opt.priceAmount.toLocaleString('en-IN')}`}
                  </span>
                  {onApproveOption && (
                    <button
                      onClick={() => onApproveOption(opt)}
                      disabled={approving}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#141312] hover:bg-[#242321] text-amber-100 text-xs font-semibold shadow-xs disabled:opacity-50 transition-all"
                    >
                      <Lock className="h-3 w-3 text-amber-300" />
                      <span>{approving ? 'Authorizing...' : 'Approve & Book'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step Timeline Drawer */}
      {events && events.length > 0 && (
        <div className="border-t border-[#f0eae1] pt-3">
          <button
            onClick={() => setShowEvents(!showEvents)}
            className="w-full flex items-center justify-between text-xs text-[#8a7053] hover:text-[#141312] transition-colors"
          >
            <span>Live Audit Trail ({events.length} events logged)</span>
            {showEvents ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showEvents && (
            <div className="space-y-2 mt-3 pt-2 border-t border-neutral-100 max-h-48 overflow-y-auto pr-1">
              {events.map((e) => (
                <div key={e.id} className="text-[11px] flex items-start gap-2 text-[#6e6b65]">
                  <span className="number-mono text-[#a8a29e] shrink-0">
                    {new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-medium text-[#141312] shrink-0">[{e.actorRole}]:</span>
                  <span className="flex-1">{e.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

