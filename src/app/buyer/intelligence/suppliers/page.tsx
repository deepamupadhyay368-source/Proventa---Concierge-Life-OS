'use client';

import { useState, useEffect } from 'react';
import { BuyerWorkspaceShell } from '@/components/procurement/BuyerWorkspaceShell';
import { Award, ShieldCheck } from 'lucide-react';

export default function SupplierReliabilityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/procurement/intelligence/suppliers');
        const json = await res.json();
        if (json.success) setData(json.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const weights = data?.weights;
  const snapshots = data?.snapshots || [];

  return (
    <BuyerWorkspaceShell
      title="Supplier Reliability Intelligence"
      subtitle="Evidence-based supplier performance scoring across delivery punctuality, quality acceptance, quantity fulfilment, quotation responsiveness, invoice accuracy, disputes, and documentation."
    >
      {weights && (
        <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs space-y-3">
          <div className="text-xs font-bold text-[#172B3A] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F6B50]" />
            <span>Active Scoring Methodology (Minimum Sample: {weights.minSampleTransactions} Completed Transactions)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center font-mono text-[11px]">
            <div className="bg-[#F3F5F7] p-2.5 rounded-xs"><span className="block text-[9px] text-[#4A5568]">DELIVERY</span><strong>{weights.deliveryReliabilityPct}%</strong></div>
            <div className="bg-[#F3F5F7] p-2.5 rounded-xs"><span className="block text-[9px] text-[#4A5568]">QUALITY</span><strong>{weights.qualityPerformancePct}%</strong></div>
            <div className="bg-[#F3F5F7] p-2.5 rounded-xs"><span className="block text-[9px] text-[#4A5568]">QUANTITY</span><strong>{weights.quantityFulfilmentPct}%</strong></div>
            <div className="bg-[#F3F5F7] p-2.5 rounded-xs"><span className="block text-[9px] text-[#4A5568]">RESPONSE</span><strong>{weights.quotationResponsePct}%</strong></div>
            <div className="bg-[#F3F5F7] p-2.5 rounded-xs"><span className="block text-[9px] text-[#4A5568]">INVOICE</span><strong>{weights.commercialAccuracyPct}%</strong></div>
            <div className="bg-[#F3F5F7] p-2.5 rounded-xs"><span className="block text-[9px] text-[#4A5568]">DISPUTES</span><strong>{weights.disputePerformancePct}%</strong></div>
            <div className="bg-[#F3F5F7] p-2.5 rounded-xs"><span className="block text-[9px] text-[#4A5568]">DOCS</span><strong>{weights.documentationPct}%</strong></div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-[#D5DCE2] p-10 text-center text-xs text-[#4A5568]">
          Loading evidence-based supplier reliability records...
        </div>
      ) : snapshots.length === 0 ? (
        <div className="bg-white border border-[#D5DCE2] p-12 text-center space-y-2 rounded-xs">
          <Award className="w-8 h-8 text-[#9AA7B4] mx-auto" />
          <div className="text-sm font-bold text-[#172B3A]">Insufficient transaction history for reliability scoring</div>
          <p className="text-xs text-[#4A5568] max-w-md mx-auto">
            PROVENTA never assigns high reliability scores merely because a supplier has no recorded disputes. Scores populate automatically as deliveries, GRNs, and invoices complete.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#D5DCE2] rounded-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E9ECEF] border-b border-[#D5DCE2] font-mono text-[10px] uppercase text-[#292F3D]">
                <th className="p-3">Supplier</th>
                <th className="p-3 text-right">Completed Txns</th>
                <th className="p-3 text-right">Reliability Score</th>
                <th className="p-3">Status</th>
                <th className="p-3">Methodology</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {snapshots.map((s: any) => (
                <tr key={s.id}>
                  <td className="p-3 font-bold text-[#172B3A]">{s.supplierName}</td>
                  <td className="p-3 text-right font-mono tabular-nums">{s.completedTransactions}</td>
                  <td className="p-3 text-right font-mono font-bold tabular-nums">
                    {s.hasSufficientData && s.compositeScore !== null ? `${s.compositeScore} / 100` : 'INSUFFICIENT DATA'}
                  </td>
                  <td className="p-3 font-mono text-[10px]">{s.hasSufficientData ? 'SCORED' : 'INSUFFICIENT_DATA'}</td>
                  <td className="p-3 font-mono text-[11px] text-[#4A5568]">{s.methodologyVersion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </BuyerWorkspaceShell>
  );
}
