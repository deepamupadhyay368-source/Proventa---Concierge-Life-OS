import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth/session';
import {
  ShieldAlert,
  ShieldCheck,
  ListTodo,
  Radio,
  Search,
  Lock,
  ArrowUpRight,
  Filter,
  Clock,
  User,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams?: { stream?: string; q?: string; page?: string };
}) {
  await requireSuperAdmin();

  const stream = searchParams?.stream || 'system';
  const query = searchParams?.q?.toLowerCase()?.trim();
  const take = 30;

  // Query the selected stream
  let systemLogs: any[] = [];
  let taskEvents: any[] = [];
  let securityEvents: any[] = [];
  let webhookLogs: any[] = [];

  const [sysCount, taskCount, secCount, hookCount] = await Promise.all([
    db.auditLog.count(),
    db.taskEvent.count(),
    db.securityEvent.count(),
    db.webhookEventLog.count(),
  ]);

  if (stream === 'system') {
    systemLogs = await db.auditLog.findMany({
      where: query
        ? {
            OR: [
              { resourceType: { contains: query, mode: 'insensitive' } },
              { resourceId: { contains: query, mode: 'insensitive' } },
              { actor: { email: { contains: query, mode: 'insensitive' } } },
            ],
          }
        : {},
      include: { actor: { select: { email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take,
    });
  } else if (stream === 'tasks') {
    taskEvents = await db.taskEvent.findMany({
      where: query
        ? {
            OR: [
              { eventType: { contains: query, mode: 'insensitive' } },
              { message: { contains: query, mode: 'insensitive' } },
              { task: { publicId: { contains: query, mode: 'insensitive' } } },
            ],
          }
        : {},
      include: {
        task: {
          select: {
            publicId: true,
            intent: true,
            customer: { select: { user: { select: { name: true, email: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  } else if (stream === 'security') {
    securityEvents = await db.securityEvent.findMany({
      where: query
        ? {
            OR: [
              { ipAddress: { contains: query, mode: 'insensitive' } },
              { user: { email: { contains: query, mode: 'insensitive' } } },
            ],
          }
        : {},
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take,
    });
  } else if (stream === 'webhooks') {
    webhookLogs = await db.webhookEventLog.findMany({
      where: query
        ? {
            OR: [
              { providerKey: { contains: query, mode: 'insensitive' } },
              { eventType: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {},
      orderBy: { receivedAt: 'desc' },
      take,
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#23201c] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#26211b] text-[#c8b99d] px-2.5 py-0.5 rounded border border-[#3e352b]">
              Immutable Telemetry
            </span>
            <span className="text-xs text-[#736f68] font-mono">
              Cryptographic Audit Trails · DPDP Act Compliant
            </span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#f5f3ef] mt-2">
            Audit Trails &amp; Security Stream
          </h1>
          <p className="text-xs text-[#928f88] mt-1 max-w-2xl">
            Live multi-stream audit trail covering administrative role modifications, task state transitions, security perimeter alarms, and external partner webhooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#141210] border border-[#23201c] text-xs font-mono text-[#c8b99d]">
            Total Events: <span className="font-bold text-[#f5f3ef]">{sysCount + taskCount + secCount + hookCount}</span>
          </div>
        </div>
      </div>

      {/* Stream Tabs */}
      <div className="flex items-center gap-2 border-b border-[#23201c] pb-2 overflow-x-auto">
        {[
          { id: 'system', label: 'System Audit Logs', count: sysCount, icon: ShieldCheck },
          { id: 'tasks', label: 'Task Engine Events', count: taskCount, icon: ListTodo },
          { id: 'security', label: 'Security Perimeters', count: secCount, icon: Lock },
          { id: 'webhooks', label: 'Webhook Ingests', count: hookCount, icon: Radio },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = stream === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/admin/audit?stream=${tab.id}`}
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

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#141210] border border-[#23201c]">
        <form method="GET" action="/admin/audit" className="flex items-center gap-3">
          <input type="hidden" name="stream" value={stream} />
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#736f68] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={searchParams?.q || ''}
              placeholder={`Search ${stream} stream events by actor, ID, or resource...`}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0e0d0c] border border-[#23201c] text-xs text-[#f5f3ef] placeholder-[#524e47] focus:outline-none focus:border-[#9c8260] transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#26211b] border border-[#3e352b] hover:bg-[#322c24] text-xs font-medium text-[#f5f3ef] transition-colors"
          >
            Filter
          </button>
          {query && (
            <Link
              href={`/admin/audit?stream=${stream}`}
              className="px-3 py-2 text-xs text-[#736f68] hover:text-[#c8b99d] transition-colors font-mono"
            >
              Reset
            </Link>
          )}
        </form>
      </div>

      {/* Stream Display */}
      <div className="bg-[#141210] border border-[#23201c] rounded-2xl overflow-hidden shadow-md">
        {/* Stream 1: System Audit Logs */}
        {stream === 'system' && (
          <div>
            {systemLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#736f68]">No system audit logs found.</div>
            ) : (
              <div className="divide-y divide-[#1c1916]">
                {systemLogs.map((l) => (
                  <div key={l.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#181614] transition-colors text-xs">
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#2a241e] text-[#c8b99d] border border-[#3d342a]">
                          {l.action}
                        </span>
                        <span className="font-medium text-[#f5f3ef]">
                          {l.resourceType || 'System'}: {l.resourceId || 'Global'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#736f68] font-mono truncate">
                        Actor: {l.actor?.email || 'System Daemon'} {l.ipAddress ? `· IP: ${l.ipAddress}` : ''}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#524e47] font-mono shrink-0">
                      {new Date(l.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stream 2: Task Events */}
        {stream === 'tasks' && (
          <div>
            {taskEvents.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#736f68]">No task events found.</div>
            ) : (
              <div className="divide-y divide-[#1c1916]">
                {taskEvents.map((e) => (
                  <div key={e.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#181614] transition-colors text-xs">
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#c8b99d]">
                          #{e.task?.publicId || 'TASK'}
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1c1916] text-[#a8a49c]">
                          {e.actorRole} · {e.eventType}
                        </span>
                      </div>
                      <p className="text-xs text-[#f5f3ef] truncate">{e.message}</p>
                      <p className="text-[11px] text-[#736f68] truncate">
                        Task: {e.task?.intent} (Client: {e.task?.customer?.user?.name || e.task?.customer?.user?.email})
                      </p>
                    </div>
                    <span className="text-[11px] text-[#524e47] font-mono shrink-0">
                      {new Date(e.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stream 3: Security Events */}
        {stream === 'security' && (
          <div>
            {securityEvents.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#736f68]">No security anomalies or events logged.</div>
            ) : (
              <div className="divide-y divide-[#1c1916]">
                {securityEvents.map((s) => (
                  <div key={s.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#181614] transition-colors text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40">
                          {s.type}
                        </span>
                        <span className="font-medium text-[#f5f3ef]">
                          {s.user?.email || 'Anonymous / Unauthenticated'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#736f68] font-mono">
                        IP: {s.ipAddress || 'Not recorded'} · UA: {s.userAgent?.slice(0, 50) || 'Unknown'}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#524e47] font-mono shrink-0">
                      {new Date(s.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stream 4: Webhook Event Logs */}
        {stream === 'webhooks' && (
          <div>
            {webhookLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#736f68]">No inbound partner webhooks recorded.</div>
            ) : (
              <div className="divide-y divide-[#1c1916]">
                {webhookLogs.map((w) => (
                  <div key={w.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#181614] transition-colors text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#1c1916] text-[#c8b99d]">
                          {w.providerKey}
                        </span>
                        <span className="font-medium text-[#f5f3ef] font-mono">{w.eventType}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${w.processed ? 'bg-emerald-950/60 text-emerald-400' : 'bg-amber-950/60 text-amber-400'}`}>
                          {w.processed ? 'PROCESSED' : 'PENDING'}
                        </span>
                      </div>
                      {w.error && <p className="text-red-400 text-[11px] font-mono">{w.error}</p>}
                    </div>
                    <span className="text-[11px] text-[#524e47] font-mono shrink-0">
                      {new Date(w.receivedAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
