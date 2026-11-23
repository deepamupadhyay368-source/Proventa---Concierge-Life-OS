'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  IndianRupee, 
  ArrowRight,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { homeDataStore } from '@/lib/home/repository';
import { HomeServiceRequest } from '@/lib/home/types';

export default function PartnerJobsPage() {
  const techId = 'tech-elec-01'; // Jignesh Solanki
  const requests = homeDataStore.getAllRequests({ technicianId: techId });
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'ACTION_REQUIRED' | 'COMPLETED'>('ALL');

  const filteredRequests = requests.filter(req => {
    if (filter === 'ACTIVE') return ['TECHNICIAN_ASSIGNED', 'WORK_STARTED'].includes(req.status);
    if (filter === 'ACTION_REQUIRED') return req.status === 'AWAITING_CUSTOMER_APPROVAL';
    if (filter === 'COMPLETED') return ['WORK_COMPLETED', 'CLOSED'].includes(req.status);
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DFD5] pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#53634A]">Dispatched Jobs</span>
          <h1 className="text-3xl font-bold text-[#171A17] mt-1">Job Queue & Service Logs</h1>
          <p className="text-xs text-stone-500 mt-1">Assigned service calls across Bopal, South Bopal & Satellite localities</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/partner/dashboard"
            className="inline-flex items-center gap-1.5 bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition"
          >
            <Briefcase className="w-4 h-4" />
            <span>Open Active Workbench</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
        {(['ALL', 'ACTIVE', 'ACTION_REQUIRED', 'COMPLETED'] as const).map(tab => {
          const count = requests.filter(r => {
            if (tab === 'ACTIVE') return ['TECHNICIAN_ASSIGNED', 'WORK_STARTED'].includes(r.status);
            if (tab === 'ACTION_REQUIRED') return r.status === 'AWAITING_CUSTOMER_APPROVAL';
            if (tab === 'COMPLETED') return ['WORK_COMPLETED', 'CLOSED'].includes(r.status);
            return true;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                filter === tab
                  ? 'bg-[#53634A] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-[#E3DFD5] hover:bg-stone-50'
              }`}
            >
              {tab.replace('_', ' ')} ({count})
            </button>
          );
        })}
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E3DFD5] text-stone-500 text-sm">
            No jobs found under the selected filter.
          </div>
        ) : (
          filteredRequests.map(req => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-[#E3DFD5] p-6 shadow-xs space-y-4 hover:border-[#53634A]/50 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-stone-500">{req.requestCode}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    req.status === 'AWAITING_CUSTOMER_APPROVAL' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                    req.status === 'WORK_STARTED' ? 'bg-indigo-100 text-indigo-800' :
                    req.status === 'WORK_COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-stone-100 text-stone-700'
                  }`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-xs text-stone-400">
                  Scheduled: {req.preferredDate} ({req.preferredTimeSlot})
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <h3 className="text-lg font-bold text-[#171A17]">{req.serviceName}</h3>
                  <p className="text-xs text-stone-600">{req.issueDescription}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#53634A]" /> South Bopal, Ahmedabad
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-stone-400" /> +91 98250 12345 (Customer)
                    </span>
                  </div>
                </div>

                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Base Payout:</span>
                    <strong className="text-emerald-700">₹280 (Bundled Visit)</strong>
                  </div>
                  {req.totalCustomerPayable > 0 && (
                    <div className="flex items-center justify-between text-stone-600">
                      <span>Approved Material:</span>
                      <strong className="text-stone-800">₹{req.totalCustomerPayable}</strong>
                    </div>
                  )}
                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between font-bold text-stone-900">
                    <span>Total Technician Settlement:</span>
                    <span>₹{280 + (req.totalCustomerPayable || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                <Link
                  href="/partner/dashboard"
                  className="inline-flex items-center gap-1.5 bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
                >
                  <span>Open in Workbench</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
