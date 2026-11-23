'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck,
  Receipt,
  ArrowUpRight
} from 'lucide-react';
import { homeDataStore } from '@/lib/home/repository';

export default function CustomerPaymentsPage() {
  const customerId = 'cust-bopal-01';
  const customer = homeDataStore.getCustomerById(customerId);
  const subscription = homeDataStore.getSubscriptionByCustomerId(customerId);

  const transactions = [
    {
      id: 'inv-2026-11-01',
      date: '01 Nov 2026',
      description: 'Family Membership (Monthly) — 4 Included Visits',
      amount: 599,
      gst: 107.82,
      total: 706.82,
      type: 'MEMBERSHIP',
      status: 'PAID',
      method: 'UPI AutoPay (okhdfcbank@patel)',
      invoiceNumber: 'PRV-HOME-2026-8819',
    },
    {
      id: 'inv-2026-11-23',
      date: '23 Nov 2026',
      description: 'Material Charge: Legrand 32A Double-Pole MCB Replacement (Req #REQ-2026-001)',
      amount: 680,
      gst: 0, // Direct procurement pass-through
      total: 680,
      type: 'MATERIAL',
      status: 'PAID',
      method: 'Razorpay Instant UPI (Verified)',
      invoiceNumber: 'PRV-MAT-2026-0042',
    },
    {
      id: 'inv-2026-10-01',
      date: '01 Oct 2026',
      description: 'Family Membership (Monthly) — 4 Included Visits',
      amount: 599,
      gst: 107.82,
      total: 706.82,
      type: 'MEMBERSHIP',
      status: 'PAID',
      method: 'UPI AutoPay (okhdfcbank@patel)',
      invoiceNumber: 'PRV-HOME-2026-7740',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DFD5] pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#53634A]">Financial Ledger</span>
          <h1 className="text-3xl font-bold text-[#171A17] mt-1">Invoices & Billing History</h1>
          <p className="text-xs text-stone-500 mt-1">Tax-compliant GST invoices, spare part receipts & auto-renewal records</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> All Payments Settled
          </span>
        </div>
      </div>

      {/* Payment Method Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Default Payment Method</span>
            <CreditCard className="w-4 h-4 text-[#53634A]" />
          </div>
          <div className="text-lg font-bold text-[#171A17]">UPI AutoPay (e-Mandate)</div>
          <div className="font-mono text-xs text-stone-600">okhdfcbank@patel</div>
          <div className="pt-2 border-t border-stone-100 text-xs text-emerald-700 font-medium">
            ✓ Auto-debit active on 1st of each month
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Upcoming Renewal</span>
            <Receipt className="w-4 h-4 text-stone-500" />
          </div>
          <div className="text-2xl font-bold text-[#171A17]">₹707 <span className="text-xs font-normal text-stone-500">incl. 18% GST</span></div>
          <div className="text-xs text-stone-600">
            Scheduled for 25 Dec 2026 (Family Plan)
          </div>
          <div className="pt-2 border-t border-stone-100 text-xs text-stone-500">
            Includes 4 monthly visits + rollover balance
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Tax & GSTIN</span>
            <FileText className="w-4 h-4 text-[#53634A]" />
          </div>
          <div className="text-xs text-stone-700 space-y-1">
            <div><strong>PROVENTA Technologies Pvt Ltd</strong></div>
            <div className="font-mono text-[11px] text-stone-500">GSTIN: 24AAACP9928C1Z4</div>
            <div className="text-[11px] text-stone-500">SAC Code: 998719 (Maintenance & Repair Services)</div>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-[#171A17]">Payment History & Tax Invoices</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Invoice / Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-stone-50/70 transition">
                  <td className="py-4 px-4">
                    <div className="font-mono font-bold text-stone-800">{tx.invoiceNumber}</div>
                    <div className="text-stone-400 text-[11px]">{tx.date}</div>
                  </td>
                  <td className="py-4 px-4 max-w-xs">
                    <div className="font-semibold text-stone-800">{tx.description}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.type === 'MEMBERSHIP' ? 'bg-[#53634A]/10 text-[#53634A]' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-stone-500 font-mono text-[11px]">
                    {tx.method}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-bold text-stone-900 text-sm">₹{tx.total}</div>
                    {tx.gst > 0 && <div className="text-[10px] text-stone-400">incl. ₹{tx.gst} GST</div>}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => alert(`Downloading Invoice ${tx.invoiceNumber}`)}
                      className="inline-flex items-center gap-1 text-xs text-[#53634A] hover:underline font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
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
