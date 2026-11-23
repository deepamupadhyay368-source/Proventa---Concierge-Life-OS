'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  CalendarCheck, 
  Wrench, 
  ChevronRight, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { homeDataStore } from '@/lib/home/repository';
import { HomeServiceRequest } from '@/lib/home/types';

export default function CustomerRequestsPage() {
  const customerId = 'cust-bopal-01';
  const requests = homeDataStore.getAllRequests({ customerId });
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'ACTION_REQUIRED' | 'COMPLETED'>('ALL');

  const filteredRequests = requests.filter(req => {
    if (filter === 'ACTIVE') {
      return ['SUBMITTED', 'TECHNICIAN_ASSIGNED', 'WORK_STARTED'].includes(req.status);
    }
    if (filter === 'ACTION_REQUIRED') {
      return req.status === 'AWAITING_CUSTOMER_APPROVAL';
    }
    if (filter === 'COMPLETED') {
      return ['WORK_COMPLETED', 'CLOSED'].includes(req.status);
    }
    return true;
  });

  const getStatusBadge = (status: HomeServiceRequest['status']) => {
    switch (status) {
      case 'AWAITING_CUSTOMER_APPROVAL':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">Action Required: Approve Material</span>;
      case 'TECHNICIAN_ASSIGNED':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Technician Assigned</span>;
      case 'WORK_STARTED':
        return <span className="bg-indigo-100 text-indigo-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Work in Progress</span>;
      case 'WORK_COMPLETED':
      case 'CLOSED':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Completed & Verified</span>;
      default:
        return <span className="bg-stone-100 text-stone-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DFD5] pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#53634A]">Member Service Logs</span>
          <h1 className="text-3xl font-bold text-[#171A17] mt-1">Service Requests</h1>
          <p className="text-xs text-stone-500 mt-1">Real-time status tracking, arrival windows & technician records for your home</p>
        </div>

        <Link
          href="/customer/book"
          className="inline-flex items-center gap-2 bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book New Request</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
        {(['ALL', 'ACTIVE', 'ACTION_REQUIRED', 'COMPLETED'] as const).map(tab => {
          const count = requests.filter(r => {
            if (tab === 'ACTIVE') return ['SUBMITTED', 'TECHNICIAN_ASSIGNED', 'WORK_STARTED'].includes(r.status);
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

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E3DFD5] space-y-3">
            <Clock className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="text-stone-600 text-sm">No service requests match the selected filter.</p>
            <Link href="/customer/book" className="inline-block text-xs text-[#53634A] font-bold hover:underline">
              Create a service request →
            </Link>
          </div>
        ) : (
          filteredRequests.map(req => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-[#E3DFD5] hover:border-[#53634A]/50 p-6 transition shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-stone-500">{req.requestCode}</span>
                  {getStatusBadge(req.status)}
                </div>
                <div className="text-xs text-stone-400">
                  Logged on {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <h3 className="text-lg font-bold text-[#171A17]">{req.serviceName}</h3>
                  <p className="text-xs text-stone-600">{req.issueDescription}</p>
                </div>

                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Arrival Window:</span>
                    <strong className="text-stone-800">{req.preferredTimeSlot}</strong>
                  </div>
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Scheduled Date:</span>
                    <strong className="text-stone-800">{req.preferredDate}</strong>
                  </div>
                  {req.assignedTechnicianName && (
                    <div className="flex items-center justify-between text-stone-600 pt-1 border-t border-stone-200">
                      <span>Technician:</span>
                      <strong className="text-[#53634A]">{req.assignedTechnicianName}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100 text-xs">
                <div className="flex items-center gap-4 text-stone-500">
                  <span>Visit Entitlement: <strong className="text-emerald-700">{req.isSubscriptionCovered ? 'Included (1 Visit Deducted)' : 'Standard Callout'}</strong></span>
                  {req.totalCustomerPayable > 0 && (
                    <span>Additional Material: <strong className="text-stone-800">₹{req.totalCustomerPayable}</strong></span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {req.status === 'AWAITING_CUSTOMER_APPROVAL' && (
                    <Link
                      href={`/customer/requests/${req.id}`}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl transition"
                    >
                      Approve Material Quote (₹{req.totalCustomerPayable})
                    </Link>
                  )}
                  <Link
                    href={`/customer/requests/${req.id}`}
                    className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold px-4 py-2 rounded-xl transition"
                  >
                    <span>Full Job Tracker</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
