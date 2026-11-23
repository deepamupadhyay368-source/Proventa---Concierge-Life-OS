'use client';

import React from 'react';
import Link from 'next/link';
import { 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Download, 
  Building, 
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import { homeDataStore } from '@/lib/home/repository';

export default function PartnerEarningsPage() {
  const techId = 'tech-elec-01'; // Jignesh Solanki
  const payouts = homeDataStore.getAllPayouts(techId);

  const totalEarnings = payouts.reduce((acc, p) => acc + p.netPayoutAmount, 0);

  const payoutHistory = [
    {
      id: 'settle-2026-w46',
      period: '10 Nov – 16 Nov 2026',
      jobsCount: 14,
      labourPayout: 3920, // 14 * 280
      materialReimbursements: 2450,
      surgeBonus: 300,
      totalPayout: 6670,
      status: 'PAID',
      utr: 'CMS2026111799281',
      date: '17 Nov 2026',
    },
    {
      id: 'settle-2026-w45',
      period: '03 Nov – 09 Nov 2026',
      jobsCount: 12,
      labourPayout: 3360,
      materialReimbursements: 1800,
      surgeBonus: 150,
      totalPayout: 5310,
      status: 'PAID',
      utr: 'CMS2026111088412',
      date: '10 Nov 2026',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DFD5] pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#53634A]">Partner Finance</span>
          <h1 className="text-3xl font-bold text-[#171A17] mt-1">Earnings & Settlements</h1>
          <p className="text-xs text-stone-500 mt-1">Weekly direct IMPS payouts, labour visit compensation & parts reimbursement</p>
        </div>

        <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5" /> Bank KYC Verified for Instant IMPS
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Pending Balance */}
        <div className="bg-[#53634A] text-white p-6 rounded-2xl shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">Unsettled Balance</span>
            <Clock className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="text-4xl font-extrabold">₹{totalEarnings || 960}</div>
          <div className="text-xs text-stone-200">
            Includes bundled visit compensation + approved spare part pass-throughs
          </div>
          <div className="pt-2 border-t border-white/20 text-[11px] text-stone-200">
            Next settlement: Monday, 30 Nov 2026
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Registered Bank Account</span>
            <Building className="w-4 h-4 text-[#53634A]" />
          </div>
          <div className="text-lg font-bold text-[#171A17]">HDFC Bank Ltd</div>
          <div className="font-mono text-xs text-stone-600">A/C: ••••••••8819 (IFSC: HDFC0000288)</div>
          <div className="pt-2 border-t border-stone-100 text-xs text-emerald-700 font-semibold">
            ✓ Auto-credit enabled via PROVENTA Partner CMS
          </div>
        </div>

        {/* Compensation Schedule */}
        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Rate Card Entitlement</span>
            <ShieldCheck className="w-4 h-4 text-[#53634A]" />
          </div>
          <div className="text-xs space-y-1.5 text-stone-700">
            <div className="flex justify-between">
              <span>Bundled Member Visit:</span>
              <strong className="text-emerald-700">₹280 / visit</strong>
            </div>
            <div className="flex justify-between">
              <span>Emergency Surge Bonus:</span>
              <strong className="text-amber-700">₹150 / call</strong>
            </div>
            <div className="flex justify-between">
              <span>Spare Parts Markup:</span>
              <strong className="text-stone-800">100% Pass-Through</strong>
            </div>
          </div>
          <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-400">
            Zero commission withheld on labour rates
          </div>
        </div>
      </div>

      {/* Payout Settlements History */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-[#171A17]">Weekly Settlement Ledger</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Period / Date</th>
                <th className="py-3 px-4">Completed Calls</th>
                <th className="py-3 px-4">Labour Entitlement</th>
                <th className="py-3 px-4">Parts Reimbursed</th>
                <th className="py-3 px-4 text-right">Settled Amount</th>
                <th className="py-3 px-4 text-right">UTR / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {payoutHistory.map(row => (
                <tr key={row.id} className="hover:bg-stone-50/70 transition">
                  <td className="py-4 px-4">
                    <div className="font-bold text-stone-800">{row.period}</div>
                    <div className="text-[11px] text-stone-400">Settled on {row.date}</div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-stone-800">
                    {row.jobsCount} visits
                  </td>
                  <td className="py-4 px-4 font-mono text-stone-600">
                    ₹{row.labourPayout}
                  </td>
                  <td className="py-4 px-4 font-mono text-stone-600">
                    ₹{row.materialReimbursements}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-stone-900 text-sm">
                    ₹{row.totalPayout}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full mb-0.5">
                      PAID
                    </span>
                    <div className="font-mono text-[10px] text-stone-400">{row.utr}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
