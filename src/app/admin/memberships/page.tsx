'use client';

import { CreditCard, CheckCircle2 } from 'lucide-react';
import { REAL_ESTATE_MEMBERSHIP_PLANS } from '@/lib/real-estate/constants';

export default function AdminMembershipsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-[#C8C4BA] pb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
          Commercial Governance
        </span>
        <h1 className="font-display text-2xl font-bold text-[#202B3C]">
          Canonical Real Estate Membership Tiers
        </h1>
        <p className="text-xs text-[#69717B] mt-1">
          Centrally managed pricing and usage limit definitions for all customer tiers.
        </p>
      </div>

      <div className="bg-white border border-[#C8C4BA] overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C]">
              <th className="p-3.5 font-bold uppercase tracking-wider">Plan Name</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Monthly Price</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Annual Price</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Vault Limit</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Reports / Mo</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C8C4BA]/50 font-mono">
            {REAL_ESTATE_MEMBERSHIP_PLANS.map((p) => (
              <tr key={p.id} className="hover:bg-[#F5F3ED]/40 transition-colors">
                <td className="p-3.5 font-sans font-bold text-[#202B3C]">{p.name}</td>
                <td className="p-3.5 text-[#202B3C]">₹{p.monthlyPrice.toLocaleString('en-IN')}</td>
                <td className="p-3.5 font-bold text-[#547568]">₹{p.annualPrice.toLocaleString('en-IN')}</td>
                <td className="p-3.5 text-[#202B3C]">{p.trackedPropertiesLimit} Units</td>
                <td className="p-3.5 text-[#202B3C]">{p.reportsPerMonth}</td>
                <td className="p-3.5 font-sans">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold">
                    ACTIVE
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
