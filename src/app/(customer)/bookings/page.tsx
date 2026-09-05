'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarCheck, CheckCircle2, ChevronRight, Clock } from 'lucide-react';

export default function BookingsPage() {
  const [requests, setRequests] = useState<any[]>([]);
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

  const allBookings = requests.flatMap((r) =>
    (r.bookings || []).map((b: any) => ({ ...b, requestSummary: r.aiSummary || r.rawInput }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Your Bookings</h1>
        <p className="text-xs text-neutral-500 mt-1">Confirmed reservations and scheduled services managed by Proventa.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-neutral-400">Loading bookings...</div>
      ) : allBookings.length === 0 ? (
        <div className="p-12 bg-white border border-neutral-200 rounded-2xl text-center">
          <CalendarCheck className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-800">No bookings yet</p>
          <p className="text-xs text-neutral-500 mt-1">
            When you approve a proposal from your concierge, the confirmed booking will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allBookings.map((b) => (
            <Link
              key={b.id}
              href={`/requests/${b.requestId}`}
              className="p-5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    b.status === 'CONFIRMED' ? 'bg-green-50 text-green-700' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {b.status === 'CONFIRMED' && <CheckCircle2 className="h-3 w-3" />}
                    {b.status}
                  </span>
                  <span className="text-xs text-neutral-400 number-mono">Ref: {b.confirmationRef || 'Pending'}</span>
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">{b.provider?.name || 'Verified Provider'}</h3>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{b.requestSummary}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                <span>View conversation & details</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
