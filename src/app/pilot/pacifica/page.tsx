'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProcurementNav } from '@/components/procurement/ProcurementNav';
import { ProcurementFooter } from '@/components/procurement/ProcurementFooter';
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, FileText } from 'lucide-react';

export default function PacificaPilotPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/procurement/pilot/pacifica');
        const json = await res.json();
        if (json.success) setData(json.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F5F7] text-[#172B3A] font-sans">
      <ProcurementNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Mandatory Sample Data Disclosure Banner */}
        <div className="bg-[#172B3A] text-white border border-[#C9A45B] p-5 rounded-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#C9A45B] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#C9A45B] font-bold">
              {data?.dataClassificationLabel || 'INSTITUTIONAL PILOT DEMONSTRATION — SAMPLE DATA (ISOLATED FROM PRODUCTION)'}
            </div>
            <p className="text-xs text-[#C5CFD8] leading-relaxed">
              This workspace demonstrates PROVENTA&apos;s institutional pilot configuration (one buyer organisation, one Ahmedabad project, one material category, three competing supplier quotations, and a Procurement Savings Assessment Report). All figures below are clearly labelled sample data and are never mixed with real production transactions.
            </p>
          </div>
        </div>

        {loading || !data ? (
          <div className="bg-white border border-[#D5DCE2] p-12 text-center text-xs text-[#4A5568]">
            Loading Pacifica Institutional Pilot Assessment...
          </div>
        ) : (
          <>
            {/* Scope Header */}
            <div className="bg-white border border-[#D5DCE2] p-6 rounded-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#0F6B50] font-bold">
                  {data.project.projectCode} &bull; {data.buyerOrganisation.segment}
                </span>
                <h1 className="text-2xl font-bold text-[#172B3A]">{data.buyerOrganisation.name}</h1>
                <p className="text-xs text-[#4A5568]">
                  Project: <strong>{data.project.name}</strong> &bull; Material: <strong>{data.project.materialCategory}</strong> ({data.project.requirementQuantity})
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Link
                  href="/buyer/projects"
                  className="px-4 py-2.5 bg-[#0F6B50] hover:bg-[#0C5842] text-white text-xs font-semibold rounded-xs inline-flex items-center gap-1.5"
                >
                  <span>Start Genuine Buyer Pilot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Savings Assessment KPI Strip */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
                <div className="text-[10px] font-mono uppercase text-[#4A5568]">Sample Baseline Landed Cost</div>
                <div className="text-xl font-bold font-mono text-[#172B3A] mt-1 tabular-nums">
                  {data.baselineSummary.baselineTotalFormatted}
                </div>
                <div className="text-[11px] font-mono text-[#4A5568] mt-1">
                  {data.baselineSummary.baselineUnitLandedFormatted} / MT
                </div>
              </div>
              <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
                <div className="text-[10px] font-mono uppercase text-[#0F6B50]">Lowest Spec-Compliant Quote</div>
                <div className="text-xl font-bold font-mono text-[#0F6B50] mt-1 tabular-nums">
                  {data.baselineSummary.lowestCompliantTotalFormatted}
                </div>
                <div className="text-[11px] font-mono text-[#4A5568] mt-1">
                  {data.baselineSummary.lowestCompliantUnitLandedFormatted} / MT
                </div>
              </div>
              <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
                <div className="text-[10px] font-mono uppercase text-[#C9A45B]">Potential Savings (Illustrative)</div>
                <div className="text-xl font-bold font-mono text-[#172B3A] mt-1 tabular-nums">
                  {data.baselineSummary.potentialSavingsFormatted}
                </div>
                <div className="text-[11px] font-mono text-[#0F6B50] mt-1">
                  {data.baselineSummary.potentialSavingsPercent}% vs sample baseline
                </div>
              </div>
              <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
                <div className="text-[10px] font-mono uppercase text-[#4A5568]">Verified Realised Savings</div>
                <div className="text-xl font-bold font-mono text-[#172B3A] mt-1 tabular-nums">₹0.00</div>
                <div className="text-[11px] text-[#4A5568] mt-1">Requires approved PO + GRN + Invoice</div>
              </div>
            </div>

            {/* Landed Cost Comparison Table */}
            <div className="bg-white border border-[#D5DCE2] rounded-xs overflow-x-auto">
              <div className="p-4 border-b border-[#E9ECEF] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0F6B50]" />
                  <h2 className="text-sm font-bold text-[#172B3A]">Like-for-Like Landed Cost Comparison (Sample Quotations)</h2>
                </div>
                <span className="text-[10px] font-mono uppercase text-[#4A5568]">
                  Non-equivalent quotes flagged: {data.comparison.nonEquivalentWarningCount}
                </span>
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#E9ECEF] border-b border-[#D5DCE2] font-mono text-[10px] uppercase text-[#292F3D]">
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Brand &amp; Technical Compliance</th>
                    <th className="p-3 text-right">Unit Landed</th>
                    <th className="p-3 text-right">Total Landed</th>
                    <th className="p-3">Delivery &amp; Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9ECEF]">
                  {data.comparison.rows.map((r: any) => (
                    <tr key={r.quotationId} className={r.technicalCompliance.hasMaterialMismatch ? 'bg-amber-50/70' : ''}>
                      <td className="p-3">
                        <div className="font-bold text-[#172B3A]">{r.supplierName}</div>
                        <div className="text-[10px] font-mono text-[#4A5568] mt-0.5">{r.verificationStatus}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold">{r.brandQuoted}</div>
                        {r.technicalCompliance.hasMaterialMismatch ? (
                          <div className="text-[11px] text-red-700 flex items-start gap-1 mt-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{r.technicalCompliance.summary}</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#0F6B50] flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Fully Spec-Compliant (Fe-550D IS 1786)</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-bold tabular-nums">{r.formattedUnitLandedCost}</td>
                      <td className="p-3 text-right font-mono font-bold tabular-nums">{r.formattedTotalLandedCost}</td>
                      <td className="p-3">
                        <div className="font-semibold">{r.deliveryDays} Days</div>
                        <div className="text-[11px] text-[#4A5568]">{r.paymentTerms}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Risks & Evidence Limitations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#D5DCE2] p-6 rounded-xs space-y-3">
                <h3 className="text-sm font-bold text-[#172B3A]">Commercial &amp; Delivery Risk Assessment</h3>
                <ul className="space-y-2 text-xs text-[#292F3D]">
                  {data.commercialAndDeliveryRisks.map((risk: string) => (
                    <li key={risk} className="flex items-start gap-2">
                      <span className="text-[#C9A45B] font-bold">&bull;</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-[#D5DCE2] p-6 rounded-xs space-y-3 text-xs">
                <h3 className="text-sm font-bold text-[#172B3A]">Benchmark Disclosures &amp; Evidence Limitations</h3>
                <div className="space-y-1.5 text-[#4A5568]">
                  <div><strong className="text-[#172B3A]">Source:</strong> {data.potentialSavings.disclosure.dataSource}</div>
                  <div><strong className="text-[#172B3A]">Specification:</strong> {data.potentialSavings.disclosure.productSpecification}</div>
                  <div><strong className="text-[#172B3A]">Geography:</strong> {data.potentialSavings.disclosure.geography}</div>
                  <div><strong className="text-[#172B3A]">Sample Size:</strong> {data.potentialSavings.disclosure.sampleSize} quotations</div>
                  <div className="pt-2 border-t border-[#E9ECEF] text-[#292F3D]">{data.disclaimer}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <ProcurementFooter />
    </div>
  );
}
