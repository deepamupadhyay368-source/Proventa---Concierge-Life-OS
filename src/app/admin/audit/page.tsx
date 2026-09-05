import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { Shield } from 'lucide-react';

export default async function AdminAuditLogPage() {
  await requireAdmin();

  const logs = await db.auditLog.findMany({
    include: { actor: { select: { email: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-neutral-900" />
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Security & Audit Trails</h1>
          <p className="text-xs text-neutral-500">Immutable record of state changes, authorizations, and admin actions.</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-neutral-100 text-xs">
          {logs.map((l) => (
            <div key={l.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-neutral-900 text-white rounded">
                    {l.action}
                  </span>
                  <span className="font-semibold text-neutral-800">{l.resourceType || 'Resource'}</span>
                  <span className="text-neutral-400 number-mono">({l.resourceId || 'N/A'})</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Actor: {l.actor?.email || 'System'} {l.ipAddress && `· IP: ${l.ipAddress}`}
                </p>
              </div>

              <span className="text-neutral-400 text-[11px]">
                {new Date(l.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
