'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  CalendarCheck, 
  CreditCard, 
  AlertCircle, 
  ArrowRight,
  Info
} from 'lucide-react';
import { homeDataStore } from '@/lib/home/repository';
import { HOME_SUBSCRIPTION_PLANS } from '@/lib/home/constants';
import { HomeSubscriptionPlan } from '@/lib/home/types';

export default function CustomerSubscriptionPage() {
  const customerId = 'cust-bopal-01';
  const customer = homeDataStore.getCustomerById(customerId);
  const subscription = homeDataStore.getSubscriptionByCustomerId(customerId);

  const getPlanPrice = (planTier?: string) => {
    return HOME_SUBSCRIPTION_PLANS.find(p => p.tier === planTier)?.monthlyPrice || 599;
  };

  const [selectedPlanCode, setSelectedPlanCode] = useState<string>(subscription?.planTier.toUpperCase() || 'FAMILY');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUpdatePlan = (tierKey: string) => {
    setSelectedPlanCode(tierKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DFD5] pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#53634A]">Membership Management</span>
          <h1 className="text-3xl font-bold text-[#171A17] mt-1">My Household Subscription</h1>
          <p className="text-xs text-stone-500 mt-1">Entitlements, renewal dates & plan configuration for your household</p>
        </div>

        <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5" /> Active & Renewing Automatically
        </span>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Membership preferences updated successfully. New billing terms take effect from your next cycle.</span>
        </div>
      )}

      {/* Active Subscription Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Current Plan Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Subscribed Plan</span>
            <span className="bg-[#53634A]/10 text-[#53634A] text-[11px] font-bold px-2 py-0.5 rounded">
              Current
            </span>
          </div>
          <div className="text-3xl font-bold text-[#171A17]">{subscription?.planTier} Plan</div>
          <div className="text-sm font-semibold text-stone-700">₹{getPlanPrice(subscription?.planTier)} / month</div>
          <div className="text-xs text-stone-500 pt-2 border-t border-stone-100">
            Next renewal: {subscription?.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '25 Dec 2026'}
          </div>
        </div>

        {/* Entitlement Counter */}
        <div className="bg-[#53634A] text-white p-6 rounded-2xl shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">Monthly Visits</span>
            <CalendarCheck className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="text-4xl font-extrabold">{subscription?.visitsRemainingCurrentPeriod || 0} Visits Left</div>
          <div className="text-xs text-stone-200">
            {subscription?.visitsUsedCurrentPeriod || 0} of {subscription?.visitsEntitlementTotal || 0} used this period • {subscription?.visitsRolloverCount || 0} rolled over
          </div>
          <div className="text-[11px] text-stone-200 pt-2 border-t border-white/20">
            Covers electrical, plumbing, carpentry & appliances
          </div>
        </div>

        {/* Protection Terms */}
        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Member Guarantees</span>
            <ShieldCheck className="w-5 h-5 text-[#53634A]" />
          </div>
          <ul className="text-xs text-stone-600 space-y-1.5 pt-1">
            <li className="flex items-center gap-1.5">✓ <strong>30-Day Workmanship Guarantee</strong> on all repairs</li>
            <li className="flex items-center gap-1.5">✓ Zero markup on transparent spare parts</li>
            <li className="flex items-center gap-1.5">✓ Verified & police background-checked technicians</li>
          </ul>
          <div className="text-[11px] text-stone-400 pt-2 border-t border-stone-100">
            Compliant with PROVENTA Fair-Use Household Policy
          </div>
        </div>

      </div>

      {/* Plan Switcher / Upgrade Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#171A17]">Change or Upgrade Membership Plan</h2>
          <p className="text-xs text-stone-500">Switch plans anytime. Upgrades take effect immediately with pro-rated visit additions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOME_SUBSCRIPTION_PLANS.map((plan: HomeSubscriptionPlan) => {
            const isCurrent = subscription?.planTier.toUpperCase() === plan.tier.toUpperCase();

            return (
              <div
                key={plan.id}
                className={`p-6 rounded-2xl border transition relative flex flex-col justify-between ${
                  isCurrent
                    ? 'border-[#53634A] bg-[#53634A]/5 ring-2 ring-[#53634A]/20'
                    : 'border-[#E3DFD5] bg-stone-50/50 hover:border-stone-400'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-3 left-6 bg-[#53634A] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Current Active Plan
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#171A17]">{plan.name}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">{plan.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[#171A17]">₹{plan.monthlyPrice}</span>
                    <span className="text-xs text-stone-500">/ month</span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-stone-200/60 text-xs">
                    <div className="font-semibold text-stone-700">{plan.includedVisitsPerBillingMonth} Included Visits / month</div>
                    <ul className="space-y-1 text-stone-600">
                      {plan.features.slice(0, 3).map((feat: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#53634A] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-stone-200 text-stone-600 text-xs font-semibold cursor-default"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdatePlan(plan.tier)}
                      className="w-full py-2.5 rounded-xl bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold transition"
                    >
                      Switch to {plan.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cancellation & Policy Notice */}
      <div className="bg-stone-50 rounded-2xl p-6 border border-[#E3DFD5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-600">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold text-stone-800">14-Day Cooling Off Period & Easy Cancellation</div>
            <p className="text-stone-500">
              You can cancel your monthly membership at any time with no lock-in. Annual plans include a 14-day money-back cooling-off period.
            </p>
          </div>
        </div>

        <Link
          href="/refund-policy"
          className="text-[#53634A] font-bold hover:underline shrink-0"
        >
          View Cancellation Policy →
        </Link>
      </div>
    </div>
  );
}
