'use client';

import { useState, useEffect } from 'react';
import { BuyerWorkspaceShell } from '@/components/procurement/BuyerWorkspaceShell';
import { BarChart3, ShieldCheck } from 'lucide-react';

export default function BuyerAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/procurement/analytics');
        const json = await res.json();
        if (json.success) setStats(json.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <BuyerWorkspaceShell
      title="PROVENTA Procurement Savings Intelligence"
      subtitle="Live metrics computed strictly from authorised database records. Potential quotation savings and verified realised savings are separated by audit policy."
    >
      {loading ? (
        <div className="bg-white border border-[#D5DCE2] p-10 text-center text-xs text-[#4A5568]">
          Computing procurement intelligence metrics...
        </div>
      ) : !stats ? (
        <div className="bg-white border border-[#D5DCE2] p-10 text-center text-xs text-[#4A5568]">
          Sign in with an authorised buyer account to view organisation procurement analytics.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
              <div className="text-[10px] font-mono uppercase text-[#4A5568]">Actual Procurement Expenditure</div>
              <div className="text-2xl font-bold text-[#172B3A] font-mono tabular-nums mt-1">
                {stats.totalExpenditureFormatted}
              </div>
              <div className="text-[11px] text-[#4A5568] mt-1">{stats.activePurchaseOrdersCount} Purchase Orders</div>
            </div>

            <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
              <div className="text-[10px] font-mono uppercase text-[#0F6B50]">Verified Realised Savings</div>
              <div className="text-2xl font-bold text-[#0F6B50] font-mono tabular-nums mt-1">
                {stats.realisedSavingsFormatted}
              </div>
              <div className="text-[11px] text-[#4A5568] mt-1">Linked to approved PO + GRN/Invoice</div>
            </div>

            <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
              <div className="text-[10px] font-mono uppercase text-[#C9A45B]">Potential Savings (Unverified)</div>
              <div className="text-2xl font-bold text-[#172B3A] font-mono tabular-nums mt-1">
                {stats.potentialSavingsFormatted}
              </div>
              <div className="text-[11px] text-[#4A5568] mt-1">Quotation vs. baseline (not yet executed)</div>
            </div>

            <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
              <div className="text-[10px] font-mono uppercase text-[#4A5568]">Active Operational Pipeline</div>
              <div className="text-2xl font-bold text-[#172B3A] font-mono tabular-nums mt-1">
                {stats.activeRfqsCount} RFQs
              </div>
              <div className="text-[11px] text-[#4A5568] mt-1">
                {stats.pendingApprovalsCount} pending approvals &bull; {stats.delayedDeliveriesCount} delayed
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs flex items-start gap-3 text-xs text-[#292F3D]">
            <ShieldCheck className="w-4 h-4 text-[#0F6B50] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#172B3A]">Savings Integrity Disclosure:</strong> {stats.dataIntegrityNote}
            </div>
          </div>
        </>
      )}
    </BuyerWorkspaceShell>
  );
}
