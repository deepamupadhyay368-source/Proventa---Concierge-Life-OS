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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#23201c] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#26211b] text-[#c8b99d] px-2.5 py-0.5 rounded border border-[#3e352b]">
              Mission Control
            </span>
            <span className="text-xs text-[#736f68] font-mono">
              Autonomous DAG &amp; Concierge Central Ledger
            </span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#f5f3ef] mt-2">
            Master Requests &amp; Orchestration
          </h1>
          <p className="text-xs text-[#928f88] mt-1 max-w-2xl">
            Live stream of member requests, multi-agent autonomous executions, customer approvals, and human intervention queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#141210] border border-[#23201c] text-xs font-mono text-[#c8b99d]">
            Total Requests: <span className="font-bold text-[#f5f3ef]">{totalAll}</span>
          </div>
        </div>
      </div>

      {/* KPI Status Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-3.5">
          <span className="text-[10px] text-[#736f68] font-mono uppercase tracking-wider block">Total Pipeline</span>
          <span className="text-xl font-bold font-mono text-[#f5f3ef] mt-1 block">{totalAll}</span>
        </div>
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-3.5">
          <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block">In-Flight Active</span>
          <span className="text-xl font-bold font-mono text-amber-300 mt-1 block">{activeCount}</span>
        </div>
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-3.5">
          <span className="text-[10px] text-[#c8b99d] font-mono uppercase tracking-wider block">Awaiting Approval</span>
          <span className="text-xl font-bold font-mono text-[#f5f3ef] mt-1 block">{awaitingApprovalCount}</span>
        </div>
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-3.5">
          <span className="text-[10px] text-purple-400 font-mono uppercase tracking-wider block">Needs Human</span>
          <span className="text-xl font-bold font-mono text-purple-300 mt-1 block">{needsHumanCount}</span>
        </div>
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-3.5">
          <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block">Completed</span>
          <span className="text-xl font-bold font-mono text-emerald-300 mt-1 block">{completedCount}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#141210] border border-[#23201c] space-y-3">
        <form method="GET" action="/admin/requests" className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#736f68] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={searchParams?.q || ''}
              placeholder="Search by request ID (e.g. TSK-0001), intent, or customer..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0e0d0c] border border-[#23201c] text-xs text-[#f5f3ef] placeholder-[#524e47] focus:outline-none focus:border-[#9c8260] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              name="category"
              defaultValue={categoryFilter || ''}
              className="px-3 py-2 rounded-xl bg-[#0e0d0c] border border-[#23201c] text-xs text-[#f5f3ef] focus:outline-none focus:border-[#9c8260]"
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
              className="px-3 py-2 rounded-xl bg-[#0e0d0c] border border-[#23201c] text-xs text-[#f5f3ef] focus:outline-none focus:border-[#9c8260]"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#26211b] border border-[#3e352b] hover:bg-[#322c24] text-xs font-medium text-[#f5f3ef] transition-colors"
            >
              Filter
            </button>

            {(query || statusFilter || priorityFilter || categoryFilter) && (
              <Link
                href="/admin/requests"
                className="px-3 py-2 text-xs text-[#736f68] hover:text-[#c8b99d] transition-colors font-mono"
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
                    ? 'bg-[#2a241e] text-[#c8b99d] border border-[#3d342a]'
                    : 'text-[#736f68] hover:text-[#f5f3ef] hover:bg-[#1a1714]'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Requests Ledger Table */}
      <div className="bg-[#141210] border border-[#23201c] rounded-2xl overflow-hidden shadow-md">
        {tasks.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1a1714] border border-[#282420] text-[#736f68] flex items-center justify-center mx-auto">
              <ListTodo className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-[#f5f3ef]">No matching requests found</div>
            <p className="text-xs text-[#736f68] max-w-sm mx-auto">
              No task or concierge request matched your filter parameters. Try expanding your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#23201c] bg-[#100f0d] text-[#736f68] font-mono uppercase text-[10px]">
                  <th className="py-3 px-4 font-normal">Task ID</th>
                  <th className="py-3 px-4 font-normal">Category</th>
                  <th className="py-3 px-4 font-normal">Intent / Overview</th>
                  <th className="py-3 px-4 font-normal">Customer</th>
                  <th className="py-3 px-4 font-normal">Status</th>
                  <th className="py-3 px-4 font-normal">Priority</th>
                  <th className="py-3 px-4 font-normal">Created</th>
                  <th className="py-3 px-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1916]">
                {tasks.map((t) => {
                  const customerUser = t.customer?.user;
                  return (
                    <tr key={t.id} className="hover:bg-[#181614] transition-colors group">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#c8b99d]">
                        #{t.publicId}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] uppercase text-[#a8a49c]">
                        <span className="px-2 py-0.5 rounded bg-[#1c1916] border border-[#2a241e]">
                          {t.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-md">
                        <div className="text-[#f5f3ef] font-medium truncate">{t.intent}</div>
                        <div className="text-[#736f68] text-[11px] truncate mt-0.5">{t.originalRequest}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#a8a49c]">
                        <div className="text-[#f5f3ef]">{customerUser?.name || 'Private VIP'}</div>
                        <div className="text-[#736f68] text-[11px]">{customerUser?.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                            ['CONFIRMED', 'COMPLETED'].includes(t.status)
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : ['NEEDS_HUMAN', 'FAILED'].includes(t.status)
                              ? 'bg-purple-950/60 text-purple-400 border border-purple-800/40'
                              : ['AWAITING_APPROVAL', 'OPTIONS_READY'].includes(t.status)
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                              : 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                          }`}
                        >
                          {t.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase ${
                            t.priority === 'URGENT'
                              ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                              : t.priority === 'HIGH'
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                              : 'text-[#736f68]'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#736f68] font-mono text-[11px]">
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
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1c1916] border border-[#2a241e] hover:border-[#3d342a] text-xs text-[#c8b99d] transition-colors"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
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
          <div className="p-4 border-t border-[#23201c] bg-[#100f0d] flex items-center justify-between">
            <div className="text-xs text-[#736f68] font-mono">
              Showing {skip + 1} - {Math.min(skip + pageSize, totalCount)} of {totalCount} requests
            </div>
            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <Link
                  href={`/admin/requests?page=${currentPage - 1}${query ? `&q=${query}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}${priorityFilter ? `&priority=${priorityFilter}` : ''}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
                  className="px-3 py-1.5 rounded-lg bg-[#1a1714] border border-[#282420] text-xs text-[#f5f3ef] hover:border-[#3e352b] flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-[#12110f] border border-[#1c1916] text-xs text-[#423e38] flex items-center gap-1 cursor-not-allowed">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </span>
              )}

              <span className="text-xs font-mono text-[#c8b99d] px-2">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={`/admin/requests?page=${currentPage + 1}${query ? `&q=${query}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}${priorityFilter ? `&priority=${priorityFilter}` : ''}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
                  className="px-3 py-1.5 rounded-lg bg-[#1a1714] border border-[#282420] text-xs text-[#f5f3ef] hover:border-[#3e352b] flex items-center gap-1 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-[#12110f] border border-[#1c1916] text-xs text-[#423e38] flex items-center gap-1 cursor-not-allowed">
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
