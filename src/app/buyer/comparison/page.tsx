'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BuyerWorkspaceShell } from '@/components/procurement/BuyerWorkspaceShell';
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

export default function BuyerComparisonCentrePage() {
  const [pilotData, setPilotData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/procurement/pilot/pacifica');
        const json = await res.json();
        if (json.success) setPilotData(json.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const matrix = pilotData?.comparison;

  return (
    <BuyerWorkspaceShell
      title="PROVENTA Intelligent Comparison Centre"
      subtitle="Like-for-like landed-cost comparison in integer paise across base rate, GST, freight, loading, unloading, insurance, discounts, delivery lead time, and technical specification equivalence."
      actions={
        <Link
          href="/buyer/rfqs"
          className="px-4 py-2 bg-[#172B3A] hover:bg-[#292F3D] text-white text-xs font-semibold rounded-xs inline-flex items-center gap-1.5"
        >
          <span>Compare Live RFQ Quotations</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#C9A45B]" />
        </Link>
      }
    >
      <div className="bg-[#172B3A] text-white p-4 rounded-xs border border-[#292F3D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#C9A45B] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#C9A45B]">SAMPLE COMPARISON MODEL ACTIVE:</strong> Below is the interactive like-for-like landed-cost comparison engine using clearly labelled sample data. PROVENTA never auto-recommends the lowest price and explicitly flags non-equivalent technical specifications.
          </div>
        </div>
        <Link href="/pilot/pacifica" className="text-[#C9A45B] font-mono underline shrink-0">
          Full Pilot Report &rarr;
        </Link>
      </div>

      {loading || !matrix ? (
        <div className="bg-white border border-[#D5DCE2] p-10 text-center text-xs text-[#4A5568]">
          Calculating landed-cost comparison matrix...
        </div>
      ) : (
        <>
          <div className="bg-white border border-[#D5DCE2] rounded-xs overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#E9ECEF] border-b border-[#D5DCE2] font-mono text-[10px] uppercase text-[#292F3D]">
                  <th className="p-3">Supplier &amp; Verification</th>
                  <th className="p-3">Brand &amp; Spec Status</th>
                  <th className="p-3 text-right">Base + GST</th>
                  <th className="p-3 text-right">Freight / Handling</th>
                  <th className="p-3 text-right">Total Landed Cost</th>
                  <th className="p-3 text-right">Unit Landed</th>
                  <th className="p-3">Delivery &amp; Terms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9ECEF]">
                {matrix.rows.map((row: any) => {
                  const mismatch = row.technicalCompliance.hasMaterialMismatch;
                  const basePlusGst = (BigInt(row.baseMaterialPaise) + BigInt(row.gstPaise)) / BigInt(100);
                  const logistics =
                    (BigInt(row.freightPaise) +
                      BigInt(row.loadingPaise) +
                      BigInt(row.unloadingPaise) +
                      BigInt(row.insurancePaise) -
                      BigInt(row.discountPaise)) /
                    BigInt(100);

                  return (
                    <tr key={row.quotationId} className={mismatch ? 'bg-amber-50/60' : 'hover:bg-[#F3F5F7]'}>
                      <td className="p-3 align-top">
                        <div className="font-bold text-[#172B3A]">{row.supplierName}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-xs ${
                              row.verificationStatus === 'VERIFIED'
                                ? 'bg-[#0F6B50]/10 text-[#0F6B50]'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {row.verificationStatus}
                          </span>
                          {row.badges.map((b: string) => (
                            <span
                              key={b}
                              className={`px-1.5 py-0.5 text-[9px] font-mono rounded-xs ${
                                b === 'SPEC_MISMATCH_FLAGGED'
                                  ? 'bg-red-100 text-red-800 font-bold'
                                  : 'bg-[#172B3A] text-[#C9A45B]'
                              }`}
                            >
                              {b.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 align-top">
                        <div className="font-semibold text-[#172B3A]">{row.brandQuoted}</div>
                        {mismatch ? (
                          <div className="mt-1 text-[11px] text-red-700 flex items-start gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{row.technicalCompliance.summary}</span>
                          </div>
                        ) : (
                          <div className="mt-1 text-[11px] text-[#0F6B50] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Specification Equivalent</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono tabular-nums align-top">
                        ₹{Number(basePlusGst).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right font-mono tabular-nums align-top">
                        ₹{Number(logistics).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#172B3A] tabular-nums align-top">
                        {row.formattedTotalLandedCost}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#0F6B50] tabular-nums align-top">
                        {row.formattedUnitLandedCost} / {row.unit}
                      </td>
                      <td className="p-3 align-top">
                        <div className="font-semibold">{row.deliveryDays} Days</div>
                        <div className="text-[11px] text-[#4A5568]">{row.paymentTerms}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-white border border-[#D5DCE2] p-4 rounded-xs text-xs text-[#4A5568]">
            <strong className="text-[#172B3A]">Governance Rule:</strong> {matrix.governanceNote}
          </div>
        </>
      )}
    </BuyerWorkspaceShell>
  );
}
