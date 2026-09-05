'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Filter } from 'lucide-react';

export default function RequestsListPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'COMPLETED'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/requests')
      .then((res) => res.json())
      .then((data) => {
        if (data.requests) setRequests(data.requests);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (filter === 'ACTIVE') return !['COMPLETED', 'CANCELLED'].includes(r.status);
    if (filter === 'PENDING') return r.status === 'AWAITING_CUSTOMER' || (r.approvals && r.approvals.length > 0);
    if (filter === 'COMPLETED') return r.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Your Requests</h1>
          <p className="text-xs text-neutral-500 mt-1">Track every request from submission through execution and follow-up.</p>
        </div>

        <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-1 self-start">
          {(['ALL', 'ACTIVE', 'PENDING', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === tab ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-neutral-400">Loading requests...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-12 bg-white border border-neutral-200 rounded-2xl text-center">
          <p className="text-sm font-semibold text-neutral-800">No requests found</p>
          <p className="text-xs text-neutral-500 mt-1">Nothing matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredRequests.map((req) => (
            <Link
              key={req.id}
              href={`/requests/${req.id}`}
              className="p-5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 transition-all flex items-center justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-full">
                    {req.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {new Date(req.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                  {req.aiSummary || req.rawInput}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-400 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
