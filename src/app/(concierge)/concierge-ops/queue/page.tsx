'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, AlertTriangle, ShieldCheck, UserCheck, ChevronRight, RefreshCw } from 'lucide-react';

export default function ConciergeQueuePage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNASSIGNED' | 'URGENT' | 'AWAITING_REVIEW' | 'AWAITING_CUSTOMER'>('ALL');
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    try {
      const res = await fetch('/api/concierge/queue');
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const claimRequest = async (requestId: string) => {
    await fetch('/api/concierge/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });
    router.push(`/concierge-ops/requests/${requestId}`);
  };

  const filtered = requests.filter((r) => {
    if (filter === 'UNASSIGNED') return !r.assignedToId && !['COMPLETED', 'CANCELLED'].includes(r.status);
    if (filter === 'URGENT') return r.urgency !== 'NORMAL' && !['COMPLETED', 'CANCELLED'].includes(r.status);
    if (filter === 'AWAITING_REVIEW') return ['NEW', 'UNDERSTANDING', 'CONCIERGE_REVIEW'].includes(r.status);
    if (filter === 'AWAITING_CUSTOMER') return r.status === 'AWAITING_CUSTOMER';
    return !['COMPLETED', 'CANCELLED'].includes(r.status);
  });

  const urgentCount = requests.filter((r) => r.urgency !== 'NORMAL' && !['COMPLETED', 'CANCELLED'].includes(r.status)).length;
  const unassignedCount = requests.filter((r) => !r.assignedToId && !['COMPLETED', 'CANCELLED'].includes(r.status)).length;
  const awaitingCustomerCount = requests.filter((r) => r.status === 'AWAITING_CUSTOMER').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Concierge Triage Queue</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Cohort 1 Incoming & Active Requests</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadQueue}
            className="p-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 text-neutral-600"
            title="Refresh queue"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase">Active Total</span>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{requests.filter((r) => !['COMPLETED', 'CANCELLED'].includes(r.status)).length}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-red-500 uppercase">Urgent / ASAP</span>
          <p className="text-2xl font-bold text-red-600 mt-1">{urgentCount}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-amber-500 uppercase">Unassigned</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{unassignedCount}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-blue-500 uppercase">Awaiting Customer</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{awaitingCustomerCount}</p>
        </div>
      </div>

      {/* Queue Filter Bar */}
      <div className="flex items-center gap-1 border-b border-neutral-200 pb-2 text-xs">
        {(['ALL', 'UNASSIGNED', 'URGENT', 'AWAITING_REVIEW', 'AWAITING_CUSTOMER'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === tab ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400">Loading triage queue...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">No requests in this queue view.</div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filtered.map((r) => {
              const assignedAgent = r.assignments?.[0]?.concierge?.user?.name;
              return (
                <div key={r.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/70 transition-colors">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-full">
                        {r.status.replace(/_/g, ' ')}
                      </span>
                      {r.urgency !== 'NORMAL' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                          {r.urgency}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-neutral-900">{r.customer?.user?.name || 'Wave 1 Customer'}</span>
                      <span className="text-xs text-neutral-400">· {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <p className="text-xs font-medium text-neutral-800 line-clamp-1">
                      {r.aiSummary || r.rawInput}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                      <span>Assigned: <strong className="text-neutral-700 font-medium">{assignedAgent || 'Unassigned'}</strong></span>
                      <span>Category: {r.category?.name || 'General'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!assignedAgent ? (
                      <button
                        onClick={() => claimRequest(r.id)}
                        className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors"
                      >
                        Claim & Open
                      </button>
                    ) : (
                      <Link
                        href={`/concierge-ops/requests/${r.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                      >
                        <span>Open Workspace</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
