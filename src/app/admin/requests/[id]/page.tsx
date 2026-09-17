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
          className="inline-flex items-center gap-1.5 text-xs text-[#858077] hover:text-[#c8b99d] transition-colors mb-3 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Master Requests</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#23201c] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1e1a16] border border-[#3d342a] flex items-center justify-center font-mono text-xl font-bold text-[#c8b99d]">
              #{task.publicId}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-medium text-[#f5f3ef]">
                  {task.intent}
                </h1>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-medium ${
                    ['CONFIRMED', 'COMPLETED'].includes(task.status)
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                      : ['NEEDS_HUMAN', 'FAILED'].includes(task.status)
                      ? 'bg-purple-950/60 text-purple-400 border border-purple-800/40'
                      : ['AWAITING_APPROVAL', 'OPTIONS_READY'].includes(task.status)
                      ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                      : 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                  }`}
                >
                  {task.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#736f68] font-mono mt-1">
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
          <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md space-y-3">
            <h2 className="text-sm font-semibold text-[#f5f3ef] flex items-center gap-2 pb-3 border-b border-[#23201c]">
              <ListTodo className="w-4 h-4 text-[#c8b99d]" />
              <span>Verbatim Member Request</span>
            </h2>
            <div className="p-4 rounded-xl bg-[#0e0d0c] border border-[#23201c] text-sm text-[#f5f3ef] leading-relaxed font-sans">
              &ldquo;{task.originalRequest}&rdquo;
            </div>
          </div>

          {/* AI Extracted Intent & Entities */}
          <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md space-y-4">
            <h2 className="text-sm font-semibold text-[#f5f3ef] flex items-center gap-2 pb-3 border-b border-[#23201c]">
              <Sparkles className="w-4 h-4 text-[#c8b99d]" />
              <span>Agentic Extraction &amp; Context</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0e0d0c] border border-[#23201c]">
                <span className="text-[10px] font-mono uppercase text-[#736f68] block">Assigned Specialist</span>
                <span className="text-[#f5f3ef] font-medium mt-0.5 block">{task.assignedAgent}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0e0d0c] border border-[#23201c]">
                <span className="text-[10px] font-mono uppercase text-[#736f68] block">Budget Ceiling</span>
                <span className="text-[#c8b99d] font-mono font-medium mt-0.5 block">
                  {task.budgetAmount ? `₹${(task.budgetAmount / 100).toLocaleString('en-IN')}` : 'Not specified'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0e0d0c] border border-[#23201c]">
                <span className="text-[10px] font-mono uppercase text-[#736f68] block">Approval Required</span>
                <span className="text-[#f5f3ef] font-mono mt-0.5 block">{task.approvalRequired ? 'Yes' : 'No'}</span>
              </div>
            </div>

            {task.clientPreferences && (
              <div className="p-4 rounded-xl bg-[#0e0d0c] border border-[#23201c] space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#736f68] block">Applied Customer Taste Vector</span>
                <pre className="text-xs text-[#a8a49c] font-mono overflow-x-auto">
                  {JSON.stringify(task.clientPreferences, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Proposed Options */}
          <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md space-y-4">
            <h2 className="text-sm font-semibold text-[#f5f3ef] flex items-center gap-2 pb-3 border-b border-[#23201c]">
              <Layers className="w-4 h-4 text-[#c8b99d]" />
              <span>Orchestrated Proposals &amp; Options</span>
            </h2>

            {proposedOptions && Array.isArray(proposedOptions) && proposedOptions.length > 0 ? (
              <div className="space-y-3">
                {proposedOptions.map((opt: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#0e0d0c] border border-[#23201c] space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-[#f5f3ef]">{opt.title || opt.name || `Option ${idx + 1}`}</h4>
                      {opt.price && (
                        <span className="text-xs font-mono text-[#c8b99d]">{opt.price}</span>
                      )}
                    </div>
                    {opt.description && (
                      <p className="text-xs text-[#a8a49c]">{opt.description}</p>
                    )}
                    {opt.location && (
                      <p className="text-[11px] text-[#736f68] font-mono">{opt.location}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#736f68]">
                No structured options generated yet for this request.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customer Profile Card + Event Timeline */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#23201c]">
              <h2 className="text-sm font-semibold text-[#f5f3ef] flex items-center gap-2">
                <User className="w-4 h-4 text-[#c8b99d]" />
                <span>Requester</span>
              </h2>
              {task.customerId && (
                <Link
                  href={`/admin/customers/${task.customerId}`}
                  className="text-xs text-[#736f68] hover:text-[#c8b99d] font-mono flex items-center gap-1"
                >
                  <span>Profile</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-sm font-medium text-[#f5f3ef]">{customerUser?.name || 'Private VIP Member'}</div>
              <div className="text-[#a8a49c] font-mono">{customerUser?.email}</div>
              <div className="text-[#736f68] font-mono">{customerUser?.phone || 'No phone recorded'}</div>
            </div>
          </div>

          {/* Chronological Event Timeline */}
          <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#23201c]">
              <h2 className="text-sm font-semibold text-[#f5f3ef] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#c8b99d]" />
                <span>Event Audit Stream ({task.events.length})</span>
              </h2>
            </div>

            {task.events.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#736f68]">No events recorded yet.</div>
            ) : (
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#23201c]">
                {task.events.map((ev) => (
                  <div key={ev.id} className="relative flex items-start gap-3 text-xs pl-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#26211b] border border-[#3e352b] shrink-0 mt-0.5" />
                    <div className="overflow-hidden flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] text-[#c8b99d] uppercase">
                          {ev.actorRole} · {ev.eventType}
                        </span>
                        <span className="text-[10px] text-[#524e47] font-mono shrink-0">
                          {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-[#f5f3ef]">{ev.message}</p>
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
