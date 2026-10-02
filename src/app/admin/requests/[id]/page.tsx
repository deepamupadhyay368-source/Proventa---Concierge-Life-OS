import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth/session';
import {
  ArrowLeft,
  ListTodo,
  ShieldCheck,
  Calendar,
  Sparkles,
  Bot,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  CreditCard,
  Building,
} from 'lucide-react';
import { TaskOperatorActions } from '@/components/admin/TaskOperatorActions';

export const dynamic = 'force-dynamic';

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  await requireSuperAdmin();
  const resolvedParams = await Promise.resolve(params);

  const task = await db.task.findFirst({
    where: {
      OR: [
        { id: resolvedParams.id },
        { publicId: resolvedParams.id },
      ],
    },
    include: {
      customer: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              status: true,
            },
          },
        },
      },
      events: {
        orderBy: { createdAt: 'desc' },
      },
      subtasks: {
        select: {
          id: true,
          publicId: true,
          intent: true,
          status: true,
        },
      },
      planSteps: {
        orderBy: { stepNumber: 'asc' },
      },
    },
  });

  if (!task) {
    notFound();
  }

  const customerUser = task.customer?.user;
  const proposedOptions = task.proposedOptions as any[];

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <Link
          href="/admin/requests"
          className="inline-flex items-center gap-1.5 text-xs text-[#66717C] hover:text-[#111820] transition-colors mb-3 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Master Requests</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E1E5E8] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F1F3F5] border border-[#E1E5E8] flex items-center justify-center font-mono text-xl font-bold text-[#111820]">
              #{task.publicId}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-medium text-[#111820]">
                  {task.intent}
                </h1>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-medium ${
                    ['CONFIRMED', 'COMPLETED'].includes(task.status)
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : ['NEEDS_HUMAN', 'FAILED'].includes(task.status)
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : ['AWAITING_APPROVAL', 'OPTIONS_READY'].includes(task.status)
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {task.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#66717C] font-mono mt-1">
                <span>Category: {task.category.toUpperCase()}</span>
                <span>·</span>
                <span>Assigned Agent: {task.assignedAgent}</span>
                <span>·</span>
                <span>Priority: {task.priority}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TaskOperatorActions taskId={task.id} currentStatus={task.status} />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Request Specs & Customer/Event Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Specs & Proposals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Raw Verbatim Request */}
          <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-semibold text-[#111820] flex items-center gap-2 pb-3 border-b border-[#E1E5E8]">
              <ListTodo className="w-4 h-4 text-[#1F2933]" />
              <span>Verbatim Member Request</span>
            </h2>
            <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] text-sm text-[#111820] leading-relaxed font-sans">
              &ldquo;{task.originalRequest}&rdquo;
            </div>
          </div>

          {/* AI Extracted Intent & Entities */}
          <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[#111820] flex items-center gap-2 pb-3 border-b border-[#E1E5E8]">
              <Sparkles className="w-4 h-4 text-[#1F2933]" />
              <span>Agentic Extraction &amp; Context</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8]">
                <span className="text-[10px] font-mono uppercase text-[#66717C] block">Assigned Specialist</span>
                <span className="text-[#111820] font-medium mt-0.5 block">{task.assignedAgent}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8]">
                <span className="text-[10px] font-mono uppercase text-[#66717C] block">Budget Ceiling</span>
                <span className="text-[#111820] font-mono font-medium mt-0.5 block">
                  {task.budgetAmount ? `₹${(task.budgetAmount / 100).toLocaleString('en-IN')}` : 'Not specified'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8]">
                <span className="text-[10px] font-mono uppercase text-[#66717C] block">Approval Required</span>
                <span className="text-[#111820] font-mono mt-0.5 block">{task.approvalRequired ? 'Yes' : 'No'}</span>
              </div>
            </div>

            {task.clientPreferences && (
              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#66717C] block font-medium">Applied Customer Taste Vector</span>
                <pre className="text-xs text-[#111820] font-mono overflow-x-auto">
                  {JSON.stringify(task.clientPreferences, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Proposed Options */}
          <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[#111820] flex items-center gap-2 pb-3 border-b border-[#E1E5E8]">
              <Layers className="w-4 h-4 text-[#1F2933]" />
              <span>Orchestrated Proposals &amp; Options</span>
            </h2>

            {proposedOptions && Array.isArray(proposedOptions) && proposedOptions.length > 0 ? (
              <div className="space-y-3">
                {proposedOptions.map((opt: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-[#111820]">{opt.title || opt.name || `Option ${idx + 1}`}</h4>
                      {opt.price && (
                        <span className="text-xs font-mono text-[#111820] font-medium">{opt.price}</span>
                      )}
                    </div>
                    {opt.description && (
                      <p className="text-xs text-[#525F6C]">{opt.description}</p>
                    )}
                    {opt.location && (
                      <p className="text-[11px] text-[#66717C] font-mono">{opt.location}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#66717C]">
                No structured options generated yet for this request.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customer Profile Card + Event Timeline */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E5E8]">
              <h2 className="text-sm font-semibold text-[#111820] flex items-center gap-2">
                <User className="w-4 h-4 text-[#1F2933]" />
                <span>Requester</span>
              </h2>
              {task.customerId && (
                <Link
                  href={`/admin/customers/${task.customerId}`}
                  className="text-xs text-[#66717C] hover:text-[#111820] font-mono flex items-center gap-1"
                >
                  <span>Profile</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-sm font-medium text-[#111820]">{customerUser?.name || 'Private VIP Member'}</div>
              <div className="text-[#111820] font-mono">{customerUser?.email}</div>
              <div className="text-[#66717C] font-mono">{customerUser?.phone || 'No phone recorded'}</div>
            </div>
          </div>

          {/* Chronological Event Timeline */}
          <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E5E8]">
              <h2 className="text-sm font-semibold text-[#111820] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1F2933]" />
                <span>Event Audit Stream ({task.events.length})</span>
              </h2>
            </div>

            {task.events.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#66717C]">No events recorded yet.</div>
            ) : (
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#E1E5E8]">
                {task.events.map((ev) => (
                  <div key={ev.id} className="relative flex items-start gap-3 text-xs pl-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#1F2933] shrink-0 mt-0.5" />
                    <div className="overflow-hidden flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] text-[#1F2933] uppercase font-bold">
                          {ev.actorRole} · {ev.eventType}
                        </span>
                        <span className="text-[10px] text-[#66717C] font-mono shrink-0">
                          {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-[#111820] font-medium">{ev.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
