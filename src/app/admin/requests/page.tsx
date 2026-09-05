import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import Link from 'next/link';

export default async function AdminAllRequestsPage() {
  await requireAdmin();

  const requests = await db.conciergeRequest.findMany({
    where: { deletedAt: null },
    include: {
      customer: { include: { user: { select: { name: true, email: true } } } },
      category: true,
      assignments: {
        where: { unassignedAt: null },
        include: { concierge: { include: { user: { select: { name: true } } } } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">All System Requests</h1>
        <p className="text-xs text-neutral-500 mt-0.5">Central ledger of all customer concierge requests and assignments.</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-neutral-100">
          {requests.map((r) => (
            <div key={r.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-neutral-100 rounded-full">
                    {r.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-semibold text-neutral-900">{r.customer?.user?.name}</span>
                  <span className="text-xs text-neutral-400">· {new Date(r.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-neutral-700 line-clamp-1">{r.aiSummary || r.rawInput}</p>
                <p className="text-[11px] text-neutral-400">
                  Concierge: {r.assignments?.[0]?.concierge?.user?.name || 'Unassigned'} · Category: {r.category?.name || 'General'}
                </p>
              </div>

              <Link
                href={`/concierge-ops/requests/${r.id}`}
                className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Inspect Workspace
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
