'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { HOME_SUBSCRIPTION_PLANS } from '@/lib/home/constants';

export default function MembershipPage() {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-[#53634A] bg-[#53634A]/10 px-3 py-1 rounded-full border border-[#53634A]/20">
          Transparent Pricing
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#171A17]">
          One Membership. Every Household Essential.
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Select the membership that fits your apartment or villa. All tiers include certified technicians, upfront part approval, and a 30-day workmanship warranty.
        </p>

        {/* Toggle */}
        <div className="inline-flex items-center p-1 rounded-xl bg-stone-200/60 border border-[#E3DFD5] text-xs font-semibold mt-4">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-5 py-2.5 rounded-lg transition ${billingCycle === 'MONTHLY' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'}`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('ANNUAL')}
            className={`px-5 py-2.5 rounded-lg transition flex items-center gap-1.5 ${billingCycle === 'ANNUAL' ? 'bg-[#53634A] text-white shadow-xs' : 'text-stone-600'}`}
          >
            <span>Annual Membership (Save up to 20%)</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {HOME_SUBSCRIPTION_PLANS.map((plan) => {
          const effectiveMonthly = billingCycle === 'ANNUAL'
            ? Math.round(plan.annualPrice / 12)
            : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-8 flex flex-col justify-between border transition relative ${
                plan.isPopular 
                  ? 'bg-white border-[#53634A] shadow-xl ring-2 ring-[#53634A]/20' 
                  : 'bg-white border-[#E3DFD5] shadow-xs'
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#53634A] text-white text-[11px] font-bold tracking-wider uppercase px-4 py-1 rounded-full shadow-sm">
                  Recommended for Most Families
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-2xl text-[#171A17]">{plan.name}</h3>
                  <p className="text-xs text-stone-500 mt-1">{plan.tagline}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#171A17]">₹{effectiveMonthly}</span>
                  <span className="text-xs text-stone-500">/ month</span>
                </div>
                {billingCycle === 'ANNUAL' && (
                  <p className="text-xs text-[#53634A] font-medium">Billed annually at ₹{plan.annualPrice} (Includes 2 months free)</p>
                )}

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs">
                  <div className="font-bold text-[#171A17] flex items-center justify-between">
                    <span>Included Monthly Visits:</span>
                    <span className="text-[#53634A] text-sm">{plan.includedVisitsPerBillingMonth} Visits</span>
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    Cap: {plan.visitDurationCapHours} hrs per visit • {plan.visitRolloverAllowed ? 'Rollover up to ' + plan.maxRolloverVisits + ' visits' : 'No rollover'}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Features & Entitlements</span>
                  <ul className="space-y-2.5 text-xs text-stone-700">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#53634A] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-stone-100">
                <Link
                  href={`/join?plan=${plan.tier.toLowerCase()}&frequency=${billingCycle.toLowerCase()}`}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    plan.isPopular
                      ? 'bg-[#53634A] hover:bg-[#43523B] text-white shadow-md'
                      : 'bg-[#171A17] hover:bg-stone-800 text-white'
                  }`}
                >
                  <span>Subscribe to {plan.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Entitlements Comparison Matrix */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs space-y-6">
        <h3 className="font-bold text-xl text-[#171A17]">Plan Comparison Matrix</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Entitlement / Feature</th>
                <th className="py-3 px-4 font-semibold">Essential (₹349/mo)</th>
                <th className="py-3 px-4 font-semibold">Family (₹699/mo)</th>
                <th className="py-3 px-4 font-semibold">Premium (₹1,199/mo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              <tr>
                <td className="py-3.5 px-4 font-medium">Annual Entitlement</td>
                <td className="py-3.5 px-4 font-semibold text-stone-900">4 Visits / Year</td>
                <td className="py-3.5 px-4 font-semibold text-[#53634A]">12 Visits / Year</td>
                <td className="py-3.5 px-4 font-semibold text-[#53634A]">24 Visits / Year</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">Allocation Interval</td>
                <td className="py-3.5 px-4">1 visit every 3 months</td>
                <td className="py-3.5 px-4">1 visit per month</td>
                <td className="py-3.5 px-4 font-semibold text-[#53634A]">2 visits per month</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">Max Duration / Visit</td>
                <td className="py-3.5 px-4">Maximum 45 mins</td>
                <td className="py-3.5 px-4">Maximum 45 mins</td>
                <td className="py-3.5 px-4">Maximum 45 mins</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">Unused Visit Rollover</td>
                <td className="py-3.5 px-4 text-stone-400">No Rollover</td>
                <td className="py-3.5 px-4 text-stone-400">No Rollover</td>
                <td className="py-3.5 px-4 text-stone-400">No Rollover</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">Booking Priority</td>
                <td className="py-3.5 px-4">Standard</td>
                <td className="py-3.5 px-4 text-[#53634A] font-semibold">Priority</td>
                <td className="py-3.5 px-4 text-[#53634A] font-bold">Highest</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">Minor Plumbing, Electrical & Carpentry</td>
                <td className="py-3.5 px-4 text-emerald-600">✓ Included</td>
                <td className="py-3.5 px-4 text-emerald-600">✓ Included</td>
                <td className="py-3.5 px-4 text-emerald-600">✓ Included</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">Household Maintenance Passport</td>
                <td className="py-3.5 px-4 text-emerald-600">✓ Included</td>
                <td className="py-3.5 px-4 text-emerald-600">✓ Included</td>
                <td className="py-3.5 px-4 text-emerald-600">✓ Included</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">Preventive Maintenance Review</td>
                <td className="py-3.5 px-4 text-stone-400">—</td>
                <td className="py-3.5 px-4 text-emerald-600">✓ Annual Review</td>
                <td className="py-3.5 px-4 text-emerald-600">✓ Quarterly Inspection</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">Household Asset Register</td>
                <td className="py-3.5 px-4 text-stone-400">—</td>
                <td className="py-3.5 px-4 text-stone-400">—</td>
                <td className="py-3.5 px-4 text-emerald-600">✓ Included</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Fair Usage Policy */}
      <div className="bg-stone-100 rounded-2xl p-6 sm:p-8 border border-stone-200 space-y-3">
        <h4 className="font-bold text-base text-[#171A17] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#53634A]" />
          <span>Fair Usage & Entitlement Policy</span>
        </h4>
        <p className="text-xs text-stone-600 leading-relaxed">
          Memberships are tied to a single registered residential address. Maintenance visit duration is capped at 45 minutes per visit. Unused visits do not roll over across allocation intervals. If PROVENTA fails to fulfil a valid request, the entitlement is never forfeited. Materials, spare parts, and specialist projects are separately chargeable.
        </p>
      </div>

    </div>
  );
}
