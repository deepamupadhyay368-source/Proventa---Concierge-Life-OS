'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Wrench, 
  CheckCircle2, 
  MapPin, 
  Star, 
  ArrowLeft,
  Sparkles,
  UserCheck,
  Clock
} from 'lucide-react';
import { HomeServiceRequest } from '@/lib/home/types';
import { TechnicianMatchScore } from '@/lib/home/allocation-engine';

interface DispatchItem {
  request: HomeServiceRequest;
  recommendations: TechnicianMatchScore[];
}

export default function AdminDispatchPage() {
  const [dispatchQueue, setDispatchQueue] = useState<DispatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/admin/dispatch');
      const data = await res.json();
      if (data.success) {
        setDispatchQueue(data.dispatchQueue);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAssign = async (requestId: string, technicianId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, technicianId })
      });
      const data = await res.json();
      if (data.success) {
        await fetchQueue();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAutoDispatch = async (requestId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, autoAssign: true })
      });
      const data = await res.json();
      if (data.success) {
        await fetchQueue();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DFD5] pb-6">
        <div>
          <Link href="/admin" className="text-xs text-[#53634A] font-semibold flex items-center gap-1 mb-2 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Operations Overview
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-[#171A17]">Live Technician Dispatch Queue</h1>
            <span className="text-xs uppercase font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {dispatchQueue.length} Pending
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Algorithmic scoring matches requests by trade skill, locality distance, customer continuity & rating.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="text-xs font-semibold px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
        >
          Refresh Queue
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-sm text-stone-500">Loading dispatch queue...</div>
      ) : dispatchQueue.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#171A17]">Dispatch Queue is Clear</h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            All customer requests have been assigned to verified technicians. New requests will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {dispatchQueue.map(({ request, recommendations }) => (
            <div key={request.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs space-y-6">
              
              {/* Request Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-stone-500">{request.requestCode}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      {request.categoryKey}
                    </span>
                    <span className="text-xs text-stone-400">• Scheduled: {request.preferredDate} ({request.preferredTimeSlot})</span>
                  </div>
                  <h3 className="font-bold text-lg text-[#171A17] mt-1">{request.serviceName}</h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Customer: <strong className="text-stone-900">{request.customerName}</strong> • {request.address.locality}, Ahmedabad
                  </p>
                </div>

                <button
                  onClick={() => handleAutoDispatch(request.id)}
                  disabled={actionLoading || recommendations.length === 0}
                  className="bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Auto-Dispatch Top Candidate</span>
                </button>
              </div>

              {/* Reported Issue Summary */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700">
                <span className="font-bold text-stone-600 block mb-1">Issue Details:</span>
                {request.issueDescription}
              </div>

              {/* Recommended Candidates */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Recommended Technicians ({recommendations.length})
                  </h4>
                  <span className="text-[11px] text-stone-500">Ranked by allocation algorithm</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendations.map(rec => (
                    <div
                      key={rec.technician.id}
                      className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white transition space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#171A17]">{rec.technician.fullName}</span>
                          <span className="font-mono text-xs font-extrabold text-[#53634A] bg-[#53634A]/10 px-2 py-0.5 rounded">
                            {rec.totalScore}/100
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-stone-600">
                          <span className="flex items-center gap-1 font-bold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-current" /> {rec.technician.ratingAverage}
                          </span>
                          <span>•</span>
                          <span>{rec.technician.operatingLocality}</span>
                        </div>

                        {/* Match reasons */}
                        <div className="space-y-1 pt-1 text-[11px] text-stone-600">
                          {rec.reasons.map((r, i) => (
                            <div key={i} className="flex items-start gap-1">
                              <span className="text-emerald-600">✓</span>
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-stone-100">
                        <button
                          onClick={() => handleAssign(request.id, rec.technician.id)}
                          disabled={actionLoading || !rec.isAvailableNow}
                          className="w-full bg-[#171A17] hover:bg-stone-800 disabled:opacity-40 text-white text-xs font-semibold py-2 rounded-xl transition"
                        >
                          {rec.isAvailableNow ? 'Assign This Partner' : 'Busy on Active Job'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
