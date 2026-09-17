import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth/session';
import {
  Headphones,
  PhoneCall,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Phone,
  User,
  MessageSquare,
} from 'lucide-react';
import { ConciergeOperatorDesk } from '@/components/admin/ConciergeOperatorDesk';

export const dynamic = 'force-dynamic';

export default async function AdminConciergeOpsPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  await requireSuperAdmin();

  const activeTab = searchParams?.tab || 'calls';
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Fetch real task queues
  const [allTasks, completedTodayCount] = await Promise.all([
    db.task.findMany({
      where: {
        OR: [
          { status: 'NEEDS_HUMAN' },
          { isEscalated: true },
          { status: 'AWAITING_APPROVAL' },
          { status: 'OPTIONS_READY' },
          { events: { some: { eventType: 'AWAITING_CONCIERGE_CALL' } } },
          { completedAt: { gte: twentyFourHoursAgo } },
        ],
      },
      include: {
        customer: {
          include: {
            user: {
              select: { name: true, email: true, phone: true },
            },
          },
        },
        events: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    }),
    db.task.count({
      where: {
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        updatedAt: { gte: twentyFourHoursAgo },
      },
    }),
  ]);

  // Categorize into the 4 queues
  const awaitingCallTasks = allTasks.filter(
    (t) =>
      t.events?.some((e) => e.eventType === 'AWAITING_CONCIERGE_CALL') ||
      (t.status === 'NEEDS_HUMAN' && t.customer?.user?.phone)
  );

  const needsHumanTasks = allTasks.filter(
    (t) => t.status === 'NEEDS_HUMAN' || t.isEscalated
  );

  const awaitingApprovalTasks = allTasks.filter(
    (t) => t.status === 'AWAITING_APPROVAL' || t.status === 'OPTIONS_READY'
  );

  const completedTodayTasks = allTasks.filter(
    (t) => ['CONFIRMED', 'COMPLETED'].includes(t.status)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#23201c] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#26211b] text-[#c8b99d] px-2.5 py-0.5 rounded border border-[#3e352b]">
              Human In The Loop
            </span>
            <span className="text-xs text-[#736f68] font-mono">
              Senior Concierge Desk · Sovereign Telephony &amp; Escalation Dispatch
            </span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#f5f3ef] mt-2">
            Concierge Operations Terminal
          </h1>
          <p className="text-xs text-[#928f88] mt-1 max-w-2xl">
            Live queue of member call requests, complex reservation handoffs, custom vendor bookings, and pending client approvals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs font-mono text-purple-300">
            Escalations: <span className="font-bold">{needsHumanTasks.length}</span>
          </div>
        </div>
      </div>

      {/* 4 Navigation Queue Tabs */}
      <div className="flex items-center gap-2 border-b border-[#23201c] pb-2 overflow-x-auto">
        {[
          { id: 'calls', label: 'Awaiting Concierge Call', count: awaitingCallTasks.length, icon: PhoneCall },
          { id: 'escalations', label: 'Needs Human / Escalated', count: needsHumanTasks.length, icon: AlertTriangle },
          { id: 'approvals', label: 'Pending Approvals', count: awaitingApprovalTasks.length, icon: Clock },
          { id: 'completed', label: 'Completed (24h)', count: completedTodayCount, icon: CheckCircle2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/admin/concierge?tab=${tab.id}`}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#26211b] text-[#f5f3ef] border border-[#3e352b] shadow-sm'
                  : 'text-[#736f68] hover:text-[#f5f3ef] hover:bg-[#161412]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#c8b99d]' : 'text-[#524e47]'}`} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-[#3d342a] text-[#c8b99d]'
                    : 'bg-[#1c1916] text-[#736f68]'
                }`}
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Tab 1: Calls */}
      {activeTab === 'calls' && (
        <div className="space-y-4">
          <div className="text-xs text-[#736f68] font-mono">
            Direct member telephone requests and high-touch outbound call sheets.
          </div>

          {awaitingCallTasks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#141210] border border-[#23201c] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1a1714] border border-[#282420] text-[#736f68] flex items-center justify-center mx-auto">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-[#f5f3ef]">No pending call requests</div>
              <p className="text-xs text-[#736f68] max-w-sm mx-auto">
                All scheduled calls and telephone reservation dispatches have been handled by concierge operators.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {awaitingCallTasks.map((t) => {
                const user = t.customer?.user;
                return (
                  <div key={t.id} className="p-5 rounded-2xl bg-[#141210] border border-[#23201c] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#c8b99d]">#{t.publicId}</span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1c1916] text-[#a8a49c]">
                          {t.category}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                        CALL REQUIRED
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-[#f5f3ef]">{t.intent}</h4>
                      <p className="text-xs text-[#736f68] line-clamp-2">{t.originalRequest}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0e0d0c] border border-[#23201c] space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[#a8a49c]">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#524e47]" />
                          <span>{user?.name || 'Private VIP Member'}</span>
                        </span>
                        <span className="font-mono text-[11px] text-[#c8b99d]">{user?.phone || 'No phone'}</span>
                      </div>
                      <div className="text-[11px] text-[#736f68] font-mono">
                        Requested: {new Date(t.createdAt).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#23201c]">
                      <Link
                        href={`/admin/requests/${t.id}`}
                        className="text-xs text-[#736f68] hover:text-[#c8b99d] font-mono flex items-center gap-1"
                      >
                        <span>Full Request Context</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/admin/requests/${t.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#26211b] border border-[#3e352b] hover:bg-[#332c23] text-xs font-mono text-[#c8b99d] transition-colors"
                      >
                        Handle Call &amp; Log
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Escalations (ConciergeOperatorDesk) */}
      {activeTab === 'escalations' && (
        <div className="space-y-4">
          <div className="text-xs text-[#736f68] font-mono">
            Autonomous agent fallback queue: tasks requiring bespoke partner negotiation or human reservation.
          </div>
          <ConciergeOperatorDesk tasks={allTasks} />
        </div>
      )}

      {/* Tab 3: Pending Approvals */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="text-xs text-[#736f68] font-mono">
            Tasks with options presented to the customer, awaiting member decision.
          </div>

          {awaitingApprovalTasks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#141210] border border-[#23201c] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1a1714] border border-[#282420] text-[#736f68] flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-[#f5f3ef]">No proposals awaiting approval</div>
              <p className="text-xs text-[#736f68] max-w-sm mx-auto">
                All generated options have been either confirmed, modified, or closed by members.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#1c1916] bg-[#141210] border border-[#23201c] rounded-2xl overflow-hidden">
              {awaitingApprovalTasks.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#181614] transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#c8b99d]">#{t.publicId}</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                        {t.status}
                      </span>
                      <span className="text-xs text-[#736f68] font-mono">· {t.category}</span>
                    </div>
                    <p className="text-xs text-[#f5f3ef]">{t.intent}</p>
                    <p className="text-[11px] text-[#736f68]">
                      Customer: {t.customer?.user?.name || t.customer?.user?.email}
                    </p>
                  </div>
                  <Link
                    href={`/admin/requests/${t.id}`}
                    className="px-3 py-1.5 rounded-lg bg-[#1c1916] border border-[#2a241e] hover:border-[#3d342a] text-xs text-[#c8b99d] transition-colors flex items-center gap-1"
                  >
                    <span>Inspect Proposals</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Completed Today */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          <div className="text-xs text-[#736f68] font-mono">
            Requests confirmed and fulfilled in the last 24 hours.
          </div>

          {completedTodayTasks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#141210] border border-[#23201c] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1a1714] border border-[#282420] text-[#736f68] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-[#f5f3ef]">No tasks completed in last 24h</div>
              <p className="text-xs text-[#736f68] max-w-sm mx-auto">
                Completed requests will appear here after confirmation.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#1c1916] bg-[#141210] border border-[#23201c] rounded-2xl overflow-hidden">
              {completedTodayTasks.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#181614] transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#c8b99d]">#{t.publicId}</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        {t.status}
                      </span>
                      <span className="text-xs text-[#736f68] font-mono">· {t.category}</span>
                    </div>
                    <p className="text-xs text-[#f5f3ef]">{t.intent}</p>
                    <p className="text-[11px] text-[#736f68]">
                      Customer: {t.customer?.user?.name || t.customer?.user?.email}
                    </p>
                  </div>
                  <Link
                    href={`/admin/requests/${t.id}`}
                    className="px-3 py-1.5 rounded-lg bg-[#1c1916] border border-[#2a241e] hover:border-[#3d342a] text-xs text-[#c8b99d] transition-colors flex items-center gap-1"
                  >
                    <span>View Record</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
