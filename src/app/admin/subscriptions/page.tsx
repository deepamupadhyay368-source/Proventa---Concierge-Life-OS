'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  CreditCard, 
  CalendarCheck, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  AlertCircle 
} from 'lucide-react';
import { homeDataStore } from '@/lib/home/repository';
import { HOME_SUBSCRIPTION_PLANS } from '@/lib/home/constants';
import { HomeSubscriptionPlan } from '@/lib/home/types';

export default function AdminSubscriptionsPage() {
  const customers = homeDataStore.getAllCustomers();
  const activeSubs = customers.map(c => homeDataStore.getSubscriptionByCustomerId(c.id)).filter(Boolean);

  const getPlanPrice = (planTier: string) => {
    return HOME_SUBSCRIPTION_PLANS.find(p => p.tier === planTier)?.monthlyPrice || 599;
  };

  const mrr = activeSubs.reduce((acc, s) => acc + (s ? getPlanPrice(s.planTier) : 0), 0);
  const totalVisitsEntitled = activeSubs.reduce((acc, s) => acc + (s?.visitsEntitlementTotal || 0), 0);
  const totalVisitsUsed = activeSubs.reduce((acc, s) => acc + (s?.visitsUsedCurrentPeriod || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DFD5] pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#53634A]">Operations • Revenue & MRR</span>
          <h1 className="text-3xl font-bold text-[#171A17] mt-1">Household Subscriptions</h1>
          <p className="text-xs text-stone-500 mt-1">Active memberships, plan distributions & monthly visit consumption</p>
        </div>

        <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full self-start sm:self-auto">
          <TrendingUp className="w-3.5 h-3.5" /> 94.2% Monthly Retention Rate
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E3DFD5] shadow-xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active MRR</span>
          <div className="text-2xl font-bold text-[#171A17] mt-1">₹{mrr || 1198}</div>
          <span className="text-[11px] text-emerald-700">Recurring Subscription Revenue</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3DFD5] shadow-xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Subscribed Households</span>
          <div className="text-2xl font-bold text-[#171A17] mt-1">{activeSubs.length}</div>
          <span className="text-[11px] text-stone-500">Ahmedabad Western Cluster</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3DFD5] shadow-xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Monthly Visit Utilization</span>
          <div className="text-2xl font-bold text-indigo-700 mt-1">
            {totalVisitsUsed} / {totalVisitsEntitled}
          </div>
          <span className="text-[11px] text-stone-500">Visits consumed this period</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3DFD5] shadow-xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Average Plan ARPU</span>
          <div className="text-2xl font-bold text-[#171A17] mt-1">₹599</div>
          <span className="text-[11px] text-stone-500">Family Plan dominant tier</span>
        </div>
      </div>

      {/* Plans Config Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {HOME_SUBSCRIPTION_PLANS.map((plan: HomeSubscriptionPlan) => (
          <div key={plan.id} className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base text-[#171A17]">{plan.name}</span>
              <span className="bg-[#53634A]/10 text-[#53634A] text-[11px] font-bold px-2 py-0.5 rounded">
                ₹{plan.monthlyPrice}/mo
              </span>
            </div>
            <div className="text-xs text-stone-600 font-medium">
              {plan.includedVisitsPerBillingMonth} Monthly Visits Entitlement
            </div>
            <p className="text-xs text-stone-500">{plan.tagline}</p>
            <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-400">
              Annual Price: ₹{plan.annualPrice} (2 Months Free)
            </div>
          </div>
        ))}
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#E3DFD5] shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#171A17]">Subscribed Households Roster</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Member / Household</th>
                <th className="py-3 px-4">Locality</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Visits Remaining</th>
                <th className="py-3 px-4">Billing Frequency</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {customers.map(cust => {
                const sub = homeDataStore.getSubscriptionByCustomerId(cust.id);
                if (!sub) return null;

                return (
                  <tr key={cust.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-4 px-4">
                      <div className="font-bold text-stone-900">{cust.fullName}</div>
                      <div className="text-stone-400 text-[11px]">{cust.apartmentOrSociety}, Flat {cust.flatOrHouseNumber}</div>
                    </td>
                    <td className="py-4 px-4 text-stone-700 font-medium">
                      {cust.locality}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-stone-800">{sub.planTier} Plan</span>
                      <div className="text-[11px] text-stone-400">₹{getPlanPrice(sub.planTier)}/mo</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-emerald-700">{sub.visitsRemainingCurrentPeriod} / {sub.visitsEntitlementTotal}</span>
                      <div className="text-[10px] text-stone-400">{sub.visitsUsedCurrentPeriod} used this cycle</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-stone-600">
                      {sub.billingFrequency}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
