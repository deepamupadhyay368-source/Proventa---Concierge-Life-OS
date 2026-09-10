import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import Link from 'next/link';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  Building,
  DollarSign,
  ArrowRight
} from 'lucide-react';

import { ConciergeOperatorDesk } from '@/components/admin/ConciergeOperatorDesk';

export default async function AdminTasksPage() {
  await requireAdmin();

  const tasks = await db.task.findMany({
    include: {
      customer: { include: { user: { select: { name: true, email: true } } } },
      events: { orderBy: { createdAt: 'desc' }, take: 1 },
      subtasks: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const counts = {
    total: tasks.length,
    needsHuman: tasks.filter((t) => t.status === 'NEEDS_HUMAN' || t.isEscalated).length,
    awaitingApproval: tasks.filter((t) => t.status === 'AWAITING_APPROVAL' || t.status === 'OPTIONS_READY').length,
    executing: tasks.filter((t) => ['SEARCHING', 'APPROVED', 'EXECUTING', 'VERIFYING'].includes(t.status)).length,
    confirmed: tasks.filter((t) => ['CONFIRMED', 'COMPLETED'].includes(t.status)).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Task Engine Operations</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Central ledger of autonomous agent workflows, approvals, and human concierge fallback queues.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider block">Total Tasks</span>
          <span className="text-xl font-bold text-neutral-900">{counts.total}</span>
        </div>
        <div className="bg-white border border-purple-200 rounded-xl p-3.5 shadow-xs bg-purple-50/20">
          <span className="text-[11px] text-purple-700 font-medium uppercase tracking-wider block">Needs Human</span>
          <span className="text-xl font-bold text-purple-900">{counts.needsHuman}</span>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-3.5 shadow-xs bg-amber-50/20">
          <span className="text-[11px] text-amber-700 font-medium uppercase tracking-wider block">Awaiting Approval</span>
          <span className="text-xl font-bold text-amber-900">{counts.awaitingApproval}</span>
        </div>
        <div className="bg-white border border-blue-200 rounded-xl p-3.5 shadow-xs bg-blue-50/20">
          <span className="text-[11px] text-blue-700 font-medium uppercase tracking-wider block">In Flight</span>
          <span className="text-xl font-bold text-blue-900">{counts.executing}</span>
        </div>
        <div className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-xs bg-emerald-50/20">
          <span className="text-[11px] text-emerald-700 font-medium uppercase tracking-wider block">Confirmed</span>
          <span className="text-xl font-bold text-emerald-900">{counts.confirmed}</span>
        </div>
      </div>

      {/* Live Operator Intervention Desk */}
      <ConciergeOperatorDesk tasks={tasks} />
      {/* Tasks Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-neutral-100">
          {tasks.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400">No tasks registered yet.</div>
          ) : (
            tasks.map((t) => {
              const isConfirmed = ['CONFIRMED', 'COMPLETED'].includes(t.status);
              const isNeedsHuman = t.status === 'NEEDS_HUMAN';
              const isAwaiting = t.status === 'AWAITING_APPROVAL';

              return (
                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-neutral-900">#{t.publicId}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isConfirmed
                            ? 'bg-emerald-100 text-emerald-800'
                            : isNeedsHuman
                            ? 'bg-purple-100 text-purple-900'
                            : isAwaiting
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {t.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">
                        · {t.assignedAgent}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-neutral-900 line-clamp-1">{t.intent || t.originalRequest}</p>

                    <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                      <span>Client: {t.customer?.user?.name || 'Customer'}</span>
                      {t.vendorName && <span>· Provider: {t.vendorName}</span>}
                      {t.budgetAmount && <span>· Budget: ₹{t.budgetAmount.toLocaleString('en-IN')}</span>}
                      {t.externalReferenceId && (
                        <span className="font-mono text-emerald-700 font-semibold">· Ref: {t.externalReferenceId}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/tasks/${t.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      <span>Inspect Task</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}