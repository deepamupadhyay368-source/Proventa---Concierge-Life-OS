'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  CalendarCheck, 
  Clock, 
  FileText, 
  PlusCircle, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Wrench,
  User,
  ArrowUpRight
} from 'lucide-react';
import { homeDataStore } from '@/lib/home/repository';
import { HomeServiceRequest } from '@/lib/home/types';

export default function CustomerDashboardPage() {
  // Using active seed customer: Rajesh & Meera Patel in South Bopal
  const customerId = 'cust-bopal-01';
  const customer = homeDataStore.getCustomerById(customerId);
  const subscription = homeDataStore.getSubscriptionByCustomerId(customerId);
  const requests = homeDataStore.getAllRequests({ customerId });
  const passport = homeDataStore.getPassportEntries(customerId);

  const getStatusBadge = (status: HomeServiceRequest['status']) => {
    switch (status) {
      case 'AWAITING_CUSTOMER_APPROVAL':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">Action Required: Approve Charge</span>;
      case 'TECHNICIAN_ASSIGNED':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Technician Assigned</span>;
      case 'WORK_STARTED':
        return <span className="bg-indigo-100 text-indigo-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">In Progress</span>;
      case 'WORK_COMPLETED':
      case 'CLOSED':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Completed & Verified</span>;
      default:
        return <span className="bg-stone-100 text-stone-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      
      {/* Top Welcome & Quick Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#53634A]">Member Dashboard</span>
            <span className="text-stone-300">•</span>
            <span className="text-xs text-stone-500">{customer?.locality}, Ahmedabad</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171A17]">{customer?.fullName}</h1>
          <p className="text-xs text-stone-500 mt-1">{customer?.apartmentOrSociety}, Flat {customer?.flatOrHouseNumber}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/home/customer/passport"
            className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-4 py-2.5 rounded-xl border border-stone-200 transition"
          >
            <FileText className="w-4 h-4 text-[#53634A]" />
            <span>Home Passport ({passport.length})</span>
          </Link>
          <Link
            href="/home/customer/book"
            className="inline-flex items-center gap-1.5 bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book a Service</span>
          </Link>
        </div>
      </div>

      {/* Membership Card & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Plan */}
        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Subscription</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Member
            </span>
          </div>
          <div className="text-2xl font-bold text-[#171A17]">{subscription?.planTier} Plan</div>
          <div className="text-xs text-stone-600">
            Next renewal: {subscription?.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : 'N/A'} ({subscription?.billingFrequency.toLowerCase()})
          </div>
          <div className="pt-2 border-t border-stone-100">
            <Link href="/home/membership" className="text-xs text-[#53634A] font-semibold hover:underline">
              Manage / Upgrade Plan →
            </Link>
          </div>
        </div>

        {/* Visit Entitlement Balance */}
        <div className="bg-[#53634A] text-white p-6 rounded-2xl shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">Visits Remaining</span>
            <CalendarCheck className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="text-4xl font-extrabold">{subscription?.visitsRemainingCurrentPeriod || 0} Visits</div>
          <div className="text-xs text-stone-200">
            Used {subscription?.visitsUsedCurrentPeriod || 0} of {subscription?.visitsEntitlementTotal || 0} monthly visits • {subscription?.visitsRolloverCount || 0} rolled over
          </div>
          <div className="pt-2 border-t border-white/20 text-[11px] text-stone-200">
            Zero labour diagnostic charge on all included visits
          </div>
        </div>

        {/* Preferred Technician */}
        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Assigned Local Hub</span>
            <Wrench className="w-4 h-4 text-[#53634A]" />
          </div>
          <div className="font-bold text-base text-[#171A17]">South Bopal Technician Cluster</div>
          <div className="text-xs text-stone-600">
            Primary Contact: Jignesh Solanki (Electrical Lead) • 4.88 ★ Rating
          </div>
          <div className="pt-2 border-t border-stone-100 text-xs text-emerald-700 font-semibold">
            ✓ Priority 2-hour response active
          </div>
        </div>

      </div>

      {/* Service Requests Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-bold text-[#171A17]">Household Service Requests</h2>
            <p className="text-xs text-stone-500">Track real-time status, approve materials, and view past job logs</p>
          </div>
          <Link href="/home/customer/book" className="text-xs font-semibold text-[#53634A] hover:underline flex items-center gap-1">
            New Request <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12 text-stone-500 text-sm">
            No service requests found. Click "Book a Service" to schedule your first maintenance visit.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div 
                key={req.id} 
                className="p-5 rounded-2xl border border-[#E3DFD5] hover:border-[#53634A]/50 bg-stone-50/50 hover:bg-white transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-stone-500">{req.requestCode}</span>
                    {getStatusBadge(req.status)}
                    <span className="text-xs text-stone-400">• {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h3 className="font-bold text-base text-[#171A17]">{req.serviceName}</h3>
                  <p className="text-xs text-stone-600 line-clamp-1">{req.issueDescription}</p>

                  <div className="flex items-center gap-4 text-xs text-stone-500 pt-1">
                    <span>Scheduled: <strong>{req.preferredDate} ({req.preferredTimeSlot})</strong></span>
                    {req.assignedTechnicianName && (
                      <span>Technician: <strong className="text-stone-800">{req.assignedTechnicianName}</strong></span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {req.status === 'AWAITING_CUSTOMER_APPROVAL' && (
                    <Link
                      href={`/home/customer/requests/${req.id}`}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition"
                    >
                      Review Material (₹{req.totalCustomerPayable})
                    </Link>
                  )}
                  <Link
                    href={`/home/customer/requests/${req.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#53634A] hover:text-[#43523B] bg-white px-3.5 py-2 rounded-xl border border-stone-200 hover:border-stone-300 shadow-2xs transition"
                  >
                    <span>View Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
