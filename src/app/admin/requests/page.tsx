import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth/session';
import {
  ListTodo,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Bot,
  User,
  Filter,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string; priority?: string; category?: string; page?: string };
}) {
  await requireSuperAdmin();

  const query = searchParams?.q?.toLowerCase()?.trim();
  const statusFilter = searchParams?.status;
  const priorityFilter = searchParams?.priority;
  const categoryFilter = searchParams?.category;
  const currentPage = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const pageSize = 15;
  const skip = (currentPage - 1) * pageSize;

  const whereClause: any = {
    ...(query
      ? {
          OR: [
            { publicId: { contains: query, mode: 'insensitive' } },
            { intent: { contains: query, mode: 'insensitive' } },
            { originalRequest: { contains: query, mode: 'insensitive' } },
            { customer: { user: { email: { contains: query, mode: 'insensitive' } } } },
            { customer: { user: { name: { contains: query, mode: 'insensitive' } } } },
          ],
        }
      : {}),
    ...(statusFilter ? { status: statusFilter as any } : {}),
    ...(priorityFilter ? { priority: priorityFilter as any } : {}),
    ...(categoryFilter ? { category: { equals: categoryFilter, mode: 'insensitive' } } : {}),
  };

  const [
    totalCount,
    tasks,
    totalAll,
    activeCount,
    needsHumanCount,
    awaitingApprovalCount,
    completedCount,
  ] = await Promise.all([
    db.task.count({ where: whereClause }),
    db.task.findMany({
      where: whereClause,
      include: {
        customer: {
          include: {
            user: {
              select: { name: true, email: true, phone: true },
            },
          },
        },
        events: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    db.task.count(),
    db.task.count({
      where: {
        status: { in: ['REQUESTED', 'SEARCHING', 'OPTIONS_READY', 'AWAITING_APPROVAL', 'APPROVED', 'EXECUTING', 'VERIFYING'] },
      },
    }),
    db.task.count({ where: { OR: [{ status: 'NEEDS_HUMAN' }, { isEscalated: true }] } }),
    db.task.count({ where: { status: { in: ['AWAITING_APPROVAL', 'OPTIONS_READY'] } } }),
    db.task.count({ where: { status: { in: ['CONFIRMED', 'COMPLETED'] } } }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E1E5E8] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#F1F3F5] text-[#1F2933] px-2.5 py-0.5 rounded border border-[#E1E5E8] font-medium">
              Mission Control
            </span>
            <span className="text-xs text-[#66717C] font-mono">
              Autonomous DAG &amp; Concierge Central Ledger
            </span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#111820] mt-2">
            Master Requests &amp; Orchestration
          </h1>
          <p className="text-xs text-[#66717C] mt-1 max-w-2xl">
            Live stream of member requests, multi-agent autonomous executions, customer approvals, and human intervention queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E1E5E8] text-xs font-mono text-[#1F2933] shadow-xs">
            Total Requests: <span className="font-bold text-[#111820]">{totalAll}</span>
          </div>
        </div>
      </div>

      {/* KPI Status Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-[#E1E5E8] rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] text-[#66717C] font-mono uppercase tracking-wider block">Total Pipeline</span>
          <span className="text-xl font-bold font-mono text-[#111820] mt-1 block">{totalAll}</span>
        </div>
        <div className="bg-white border border-[#E1E5E8] rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] text-amber-700 font-mono uppercase tracking-wider block">In-Flight Active</span>
          <span className="text-xl font-bold font-mono text-amber-700 mt-1 block">{activeCount}</span>
        </div>
        <div className="bg-white border border-[#E1E5E8] rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] text-[#1F2933] font-mono uppercase tracking-wider block">Awaiting Approval</span>
          <span className="text-xl font-bold font-mono text-[#111820] mt-1 block">{awaitingApprovalCount}</span>
        </div>
        <div className="bg-white border border-[#E1E5E8] rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] text-purple-700 font-mono uppercase tracking-wider block">Needs Human</span>
          <span className="text-xl font-bold font-mono text-purple-700 mt-1 block">{needsHumanCount}</span>
        </div>
        <div className="bg-white border border-[#E1E5E8] rounded-2xl p-3.5 shadow-xs">
          <span className="text-[10px] text-emerald-700 font-mono uppercase tracking-wider block">Completed</span>
          <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block">{completedCount}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E1E5E8] space-y-3 shadow-xs">
        <form method="GET" action="/admin/requests" className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#66717C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={searchParams?.q || ''}
              placeholder="Search by request ID (e.g. TSK-0001), intent, or customer..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] text-xs text-[#111820] placeholder-[#66717C] focus:bg-white focus:outline-hidden focus:border-[#1F2933] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              name="category"
              defaultValue={categoryFilter || ''}
              className="px-3 py-2 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] text-xs text-[#111820] focus:bg-white focus:outline-hidden focus:border-[#1F2933]"
            >
              <option value="">All Categories</option>
              <option value="dining">Dining</option>
              <option value="travel">Travel</option>
              <option value="mobility">Mobility</option>
              <option value="wellness">Wellness</option>
              <option value="events">Events</option>
              <option value="shopping">Shopping</option>
              <option value="services">Services</option>
              <option value="general">General</option>
            </select>

            <select
              name="priority"
              defaultValue={priorityFilter || ''}
              className="px-3 py-2 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] text-xs text-[#111820] focus:bg-white focus:outline-hidden focus:border-[#1F2933]"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#1F2933] hover:bg-[#111820] text-xs font-medium text-white transition-colors cursor-pointer shadow-xs"
            >
              Filter
            </button>

            {(query || statusFilter || priorityFilter || categoryFilter) && (
              <Link
                href="/admin/requests"
                className="px-3 py-2 text-xs text-[#66717C] hover:text-[#111820] transition-colors font-mono"
              >
                Reset
              </Link>
            )}
          </div>
        </form>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['ALL', 'REQUESTED', 'SEARCHING', 'OPTIONS_READY', 'AWAITING_APPROVAL', 'EXECUTING', 'CONFIRMED', 'COMPLETED', 'NEEDS_HUMAN', 'FAILED'].map((st) => {
            const isCurrent = st === 'ALL' ? !statusFilter : statusFilter === st;
            const queryParams = new URLSearchParams();
            if (query) queryParams.set('q', query);
            if (priorityFilter) queryParams.set('priority', priorityFilter);
            if (categoryFilter) queryParams.set('category', categoryFilter);
            if (st !== 'ALL') queryParams.set('status', st);

            return (
              <Link
                key={st}
                href={`/admin/requests?${queryParams.toString()}`}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-colors ${
                  isCurrent
                    ? 'bg-[#1F2933] text-white font-medium shadow-xs'
                    : 'text-[#66717C] hover:text-[#111820] hover:bg-[#F7F8FA]'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Requests Ledger Table */}
      <div className="bg-white border border-[#E1E5E8] rounded-2xl overflow-hidden shadow-xs">
        {tasks.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F8FA] border border-[#E1E5E8] text-[#66717C] flex items-center justify-center mx-auto">
              <ListTodo className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-[#111820]">No matching requests found</div>
            <p className="text-xs text-[#66717C] max-w-sm mx-auto">
              No task or concierge request matched your filter parameters. Try expanding your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E1E5E8] bg-[#F7F8FA] text-[#66717C] font-mono uppercase text-[10px]">
                  <th className="py-3 px-4 font-medium">Task ID</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Intent / Overview</th>
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Priority</th>
                  <th className="py-3 px-4 font-medium">Created</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E5E8]">
                {tasks.map((t) => {
                  const customerUser = t.customer?.user;
                  return (
                    <tr key={t.id} className="hover:bg-[#F7F8FA]/60 transition-colors group">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#111820]">
                        #{t.publicId}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] uppercase text-[#525F6C]">
                        <span className="px-2 py-0.5 rounded bg-[#F1F3F5] border border-[#E1E5E8] font-medium">
                          {t.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-md">
                        <div className="text-[#111820] font-medium truncate">{t.intent}</div>
                        <div className="text-[#66717C] text-[11px] truncate mt-0.5">{t.originalRequest}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#111820]">
                        <div className="text-[#111820] font-medium">{customerUser?.name || 'Private VIP'}</div>
                        <div className="text-[#66717C] text-[11px]">{customerUser?.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                            ['CONFIRMED', 'COMPLETED'].includes(t.status)
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ['NEEDS_HUMAN', 'FAILED'].includes(t.status)
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : ['AWAITING_APPROVAL', 'OPTIONS_READY'].includes(t.status)
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {t.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-medium ${
                            t.priority === 'URGENT'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : t.priority === 'HIGH'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'text-[#66717C]'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#66717C] font-mono text-[11px]">
                        {new Date(t.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/requests/${t.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E1E5E8] hover:bg-[#F7F8FA] hover:border-[#A7B0B8] text-xs text-[#1F2933] font-medium transition-colors shadow-xs"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#66717C]" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#E1E5E8] bg-[#F7F8FA] flex items-center justify-between">
            <div className="text-xs text-[#66717C] font-mono">
              Showing {skip + 1} - {Math.min(skip + pageSize, totalCount)} of {totalCount} requests
            </div>
            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <Link
                  href={`/admin/requests?page=${currentPage - 1}${query ? `&q=${query}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}${priorityFilter ? `&priority=${priorityFilter}` : ''}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E1E5E8] text-xs text-[#1F2933] hover:bg-[#F7F8FA] flex items-center gap-1 transition-colors shadow-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-[#F7F8FA] border border-[#E1E5E8] text-xs text-[#8C96A0] flex items-center gap-1 cursor-not-allowed">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </span>
              )}

              <span className="text-xs font-mono text-[#111820] px-2 font-medium">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={`/admin/requests?page=${currentPage + 1}${query ? `&q=${query}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}${priorityFilter ? `&priority=${priorityFilter}` : ''}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E1E5E8] text-xs text-[#1F2933] hover:bg-[#F7F8FA] flex items-center gap-1 transition-colors shadow-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-[#F7F8FA] border border-[#E1E5E8] text-xs text-[#8C96A0] flex items-center gap-1 cursor-not-allowed">
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
