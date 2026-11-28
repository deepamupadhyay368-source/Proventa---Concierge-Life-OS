'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreditCard, Check, Shield, Download, ArrowUpRight, AlertCircle } from 'lucide-react';
import { REAL_ESTATE_MEMBERSHIP_PLANS } from '@/lib/real-estate/constants';

export default function MembershipBillingPage() {
  const [activePlanId, setActivePlanId] = useState('personal');

  const invoices = [
    { id: 'INV-2026-0091', date: '01-Oct-2026', plan: 'Personal Member (Annual)', amount: '₹1,990', status: 'PAID' },
    { id: 'INV-2025-0043', date: '01-Oct-2025', plan: 'Personal Member (Annual)', amount: '₹1,990', status: 'PAID' },
  ];

  const currentPlan = REAL_ESTATE_MEMBERSHIP_PLANS.find((p) => p.id === activePlanId) || REAL_ESTATE_MEMBERSHIP_PLANS[1];

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-[#E8EBEF] pb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#29465F] font-bold">
          Account Subscription
        </span>
        <h1 className="font-editorial text-2xl font-normal text-[#202B38]">
          Membership & Billing Management
        </h1>
        <p className="text-xs text-[#697586] mt-1">
          Review your active entitlement limits, upgrade plan, or download tax invoices.
        </p>
      </div>

      {/* Active Subscription Summary */}
      <div className="bg-white border border-[#202B3C] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EBEF]/50 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#29465F] uppercase">
              Current Active Tier
            </span>
            <h2 className="font-editorial text-2xl font-normal text-[#202B38]">
              {currentPlan.name}
            </h2>
            <p className="text-xs text-[#697586]">{currentPlan.tagline}</p>
          </div>

          <div className="text-right font-mono">
            <span className="text-2xl font-bold text-[#202B38] tabular-nums">
              ₹{currentPlan.annualPrice.toLocaleString('en-IN')}/yr
            </span>
            <span className="block text-[11px] text-[#29465F]">Renews automatically on 01-Oct-2027</span>
          </div>
        </div>

        {/* Usage & Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#F7F8FA] border border-[#E8EBEF]/40">
            <span className="text-[#697586] block text-[10px]">Property Vault Capacity</span>
            <span className="font-bold text-[#202B38] tabular-nums">2 / {currentPlan.trackedPropertiesLimit} Units Used</span>
          </div>
          <div className="p-3 bg-[#F7F8FA] border border-[#E8EBEF]/40">
            <span className="text-[#697586] block text-[10px]">Monthly Valuation Reports</span>
            <span className="font-bold text-[#202B38] tabular-nums">1 / {currentPlan.reportsPerMonth} Downloaded this month</span>
          </div>
          <div className="p-3 bg-[#F7F8FA] border border-[#E8EBEF]/40">
            <span className="text-[#697586] block text-[10px]">Billing Status</span>
            <span className="font-bold text-[#29465F]">Active • Good Standing</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/pricing"
            className="h-10 px-4 bg-[#29465F] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center hover:bg-[#29465F]/90"
          >
            Upgrade to Investor Suite (₹1,499/mo)
          </Link>
          <button
            onClick={() => alert('Cancellation request recorded. Your plan remains active until the end of the billing period.')}
            className="h-10 px-4 bg-white border border-[#E8EBEF] text-[#697586] hover:text-[#202B38] text-xs font-bold uppercase tracking-wider inline-flex items-center hover:bg-[#F7F8FA]"
          >
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* Available Plans Selector */}
      <div className="space-y-4">
        <h3 className="font-editorial text-xl font-normal text-[#202B38]">
          Available Membership Tiers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REAL_ESTATE_MEMBERSHIP_PLANS.filter((p) => p.id !== 'free').map((p) => (
            <div
              key={p.id}
              className={`p-5 bg-white border flex flex-col justify-between ${
                p.id === activePlanId ? 'border-[#202B3C] ring-1 ring-[#202B3C]' : 'border-[#E8EBEF]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-editorial text-lg font-normal text-[#202B38]">{p.name}</h4>
                  {p.id === activePlanId && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#29465F] text-white font-bold uppercase">
                      Current
                    </span>
                  )}
                </div>
                <div className="font-mono text-xl font-bold text-[#202B38] tabular-nums">
                  ₹{p.monthlyPrice}/mo
                </div>
                <ul className="space-y-1.5 text-xs text-[#202B38]">
                  {p.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="h-3.5 w-3.5 text-[#29465F] shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {p.id !== activePlanId && (
                <button
                  onClick={() => {
                    setActivePlanId(p.id);
                    alert(`Switched preview plan to ${p.name}`);
                  }}
                  className="mt-4 w-full h-10 bg-white border border-[#202B3C] text-[#202B38] text-xs font-bold uppercase tracking-wider hover:bg-[#F7F8FA]"
                >
                  Select Plan
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Billing Invoices */}
      <div className="bg-white border border-[#E8EBEF] p-6 space-y-4">
        <h3 className="font-editorial text-xl font-normal text-[#202B38]">
          Billing History & GST Invoices
        </h3>

        <div className="divide-y divide-[#C8C4BA]/50 text-xs font-mono">
          {invoices.map((inv) => (
            <div key={inv.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#202B38]">{inv.id}</span>
                <span className="text-[#697586] ml-3">{inv.date}</span>
                <span className="text-[#697586] ml-3">• {inv.plan}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-[#202B38]">{inv.amount}</span>
                <button
                  onClick={() => alert(`Downloading GST invoice: ${inv.id}`)}
                  className="text-[#29465F] hover:underline flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Invoice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
