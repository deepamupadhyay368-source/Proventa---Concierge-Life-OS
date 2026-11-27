'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProcurementNav } from '@/components/procurement/ProcurementNav';
import { ProcurementFooter } from '@/components/procurement/ProcurementFooter';
import {
  ShieldAlert,
  Scale,
  TrendingUp,
  CalendarClock,
  Award,
  Network,
  Workflow,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Building2,
} from 'lucide-react';

export default function ProventaShowcasePage() {
  const [pilot, setPilot] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    'comparison' | 'leakage' | 'prices' | 'timing' | 'reliability' | 'multiproject' | 'autopilot'
  >('comparison');

  useEffect(() => {
    fetch('/api/procurement/pilot/pacifica')
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setPilot(j.data);
      })
      .catch(() => {});
  }, []);

  const TABS = [
    { id: 'comparison', label: '1. Landed Cost & RFQ Comparison', icon: Scale },
    { id: 'leakage', label: '2. Leakage Detector', icon: ShieldAlert },
    { id: 'prices', label: '3. Material Price Intelligence', icon: TrendingUp },
    { id: 'timing', label: '4. Timing Intelligence', icon: CalendarClock },
    { id: 'reliability', label: '5. Supplier Reliability', icon: Award },
    { id: 'multiproject', label: '6. Multi-Project Consolidation', icon: Network },
    { id: 'autopilot', label: '7. Procurement Autopilot', icon: Workflow },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F5F7] text-[#172B3A] font-sans">
      <ProcurementNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Mandatory Demo Isolation Banner */}
        <div className="bg-[#172B3A] text-white border border-[#C9A45B] p-4 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#C9A45B] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-mono uppercase tracking-[0.14em] text-[#C9A45B] font-bold">
                DEMO / ILLUSTRATIVE SHOWCASE WORKSPACE — STRICTLY ISOLATED FROM PRODUCTION RECORDS
              </div>
              <p className="text-[#C5CFD8]">
                Walk through all seven PROVENTA Construction Procurement Intelligence capabilities on a synthetic Ahmedabad residential high-rise TMT Steel Fe-550D (120 MT) procurement cycle. No demo record is ever mixed with live buyer or supplier accounts.
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/signup"
              className="px-4 py-2 bg-[#0F6B50] hover:bg-[#0C5842] text-white text-xs font-semibold rounded-xs whitespace-nowrap"
            >
              Register Buyer Account
            </Link>
            <Link
              href="/supplier/register"
              className="px-4 py-2 bg-[#292F3D] hover:bg-[#343C4E] border border-[#C9A45B]/50 text-white text-xs font-semibold rounded-xs whitespace-nowrap"
            >
              Register Supplier
            </Link>
          </div>
        </div>

        {/* Sample Project Context Header */}
        <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#172B3A] text-[#C9A45B] flex items-center justify-center rounded-xs shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#0F6B50] font-bold">
                DEMO PROJECT: PAC-AHM-PILOT-01 &bull; AHMEDABAD, GUJARAT
              </div>
              <h1 className="text-xl font-bold text-[#172B3A]">
                Sample High-Rise Tower — 120 MT TMT Steel 16mm Fe-550D (IS 1786:2008)
              </h1>
              <p className="text-xs text-[#4A5568]">
                Requirement → RFQ → 3 Supplier Quotes → Landed Cost → Leakage → Timing → Reliability → Consolidation → Human-Gated Autopilot
              </p>
            </div>
          </div>
          <Link
            href="/buyer/dashboard"
            className="px-4 py-2 bg-[#E9ECEF] hover:bg-[#DCE2E8] text-[#172B3A] text-xs font-semibold rounded-xs inline-flex items-center gap-1.5 self-start md:self-center"
          >
            <span>Open Live Buyer Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 7-Feature Tab Switcher */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xs inline-flex items-center gap-1.5 transition-colors border ${
                  active
                    ? 'bg-[#172B3A] text-white border-[#172B3A]'
                    : 'bg-white text-[#292F3D] border-[#D5DCE2] hover:border-[#0F6B50]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#C9A45B]' : 'text-[#0F6B50]'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        <div className="bg-white border border-[#D5DCE2] p-6 rounded-xs space-y-5">
          {activeTab === 'comparison' && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E9ECEF] pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#172B3A]">True Landed Cost &amp; Like-for-Like RFQ Comparison (DEMO)</h2>
                  <p className="text-xs text-[#4A5568]">
                    Computed in integer INR paise (Base + 18% GST + Freight + Loading + Unloading + Insurance - Discounts). Non-equivalent specifications are explicitly flagged.
                  </p>
                </div>
                {pilot && (
                  <span className="px-2.5 py-1 bg-[#0F6B50]/10 text-[#0F6B50] font-mono text-[11px] font-bold rounded-xs">
                    Potential Savings (Illustrative): {pilot.baselineSummary.potentialSavingsFormatted} ({pilot.baselineSummary.potentialSavingsPercent}%)
                  </span>
                )}
              </div>

              {!pilot ? (
                <div className="text-xs text-[#4A5568] py-8 text-center">Loading landed-cost comparison matrix...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#E9ECEF] border-b border-[#D5DCE2] font-mono text-[10px] uppercase text-[#292F3D]">
                        <th className="p-3">Illustrative Supplier</th>
                        <th className="p-3">Brand &amp; Spec Equivalence</th>
                        <th className="p-3 text-right">Unit Landed</th>
                        <th className="p-3 text-right">Total Landed (120 MT)</th>
                        <th className="p-3">Delivery &amp; Credit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9ECEF]">
                      {pilot.comparison.rows.map((r: any) => (
                        <tr key={r.quotationId} className={r.technicalCompliance.hasMaterialMismatch ? 'bg-amber-50/70' : ''}>
                          <td className="p-3">
                            <div className="font-bold text-[#172B3A]">{r.supplierName}</div>
                            <div className="text-[10px] font-mono text-[#4A5568]">{r.verificationStatus}</div>
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
                                <span>Compliant (Fe-550D IS 1786:2008 + MTC)</span>
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
              )}
            </>
          )}

          {activeTab === 'leakage' && (
            <div className="space-y-4 text-xs">
              <h2 className="text-base font-bold text-[#172B3A]">Procurement Leakage Detector (DEMO EXAMPLE)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                <div className="p-4 bg-[#F3F5F7] border border-[#D5DCE2] rounded-xs">
                  <span className="text-[10px] text-[#4A5568] block">POTENTIAL EXPOSURE (REQUIRES REVIEW)</span>
                  <strong className="text-lg text-[#172B3A]">₹4,12,500.00</strong>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-xs">
                  <span className="text-[10px] text-red-700 block">CONFIRMED LEAKAGE (EVIDENCE-BACKED)</span>
                  <strong className="text-lg text-red-700">₹1,35,000.00</strong>
                </div>
                <div className="p-4 bg-[#0F6B50]/10 border border-[#0F6B50]/40 rounded-xs">
                  <span className="text-[10px] text-[#0F6B50] block">VERIFIED RECOVERED SAVINGS</span>
                  <strong className="text-lg text-[#0F6B50]">₹1,35,000.00</strong>
                </div>
              </div>
              <div className="p-4 border border-[#D5DCE2] rounded-xs space-y-2">
                <div className="font-bold text-[#172B3A]">Sample Flagged Anomaly — QUANTITY_DISCREPANCY (High Severity)</div>
                <p className="text-[#4A5568]">
                  Illustrative Invoice INV-DEMO-402 billed 50.0 MT against 48.0 MT verified at site weighbridge GRN-DEMO-118 (2.0 MT variance = ₹1,35,000.00 held automatically before finance payout).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'prices' && (
            <div className="space-y-4 text-xs">
              <h2 className="text-base font-bold text-[#172B3A]">Material Price Intelligence (DEMO BENCHMARK)</h2>
              <p className="text-[#4A5568]">
                Tracks sourced quotations, verified POs, and verified invoices strictly like-for-like by grade and unit. Whenever fewer than 3 verified observations exist, PROVENTA displays <strong>&quot;Insufficient verified data to generate a reliable benchmark.&quot;</strong> instead of fabricating market prices.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                <div className="p-4 bg-[#F3F5F7] border border-[#D5DCE2] rounded-xs">
                  <span className="text-[10px] text-[#4A5568] block">ILLUSTRATIVE MEDIAN (FE-550D / MT)</span>
                  <strong className="text-lg text-[#172B3A]">₹66,350.00</strong>
                </div>
                <div className="p-4 bg-[#F3F5F7] border border-[#D5DCE2] rounded-xs">
                  <span className="text-[10px] text-[#4A5568] block">OBSERVED RANGE (3+ VERIFIED QUOTES)</span>
                  <strong className="text-lg text-[#172B3A]">₹65,980 – ₹68,950</strong>
                </div>
                <div className="p-4 bg-[#F3F5F7] border border-[#D5DCE2] rounded-xs">
                  <span className="text-[10px] text-[#0F6B50] block">FRESHNESS INDICATOR</span>
                  <strong className="text-lg text-[#0F6B50]">FRESH (&lt; 14 Days)</strong>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timing' && (
            <div className="space-y-4 text-xs">
              <h2 className="text-base font-bold text-[#172B3A]">Procurement Timing Intelligence (DEMO FORECAST)</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono bg-[#F3F5F7] p-4 rounded-xs">
                <div><span className="text-[10px] text-[#4A5568] block">BOQ REQUIRED</span><strong>120 MT</strong></div>
                <div><span className="text-[10px] text-[#4A5568] block">SITE STOCK</span><strong>18 MT</strong></div>
                <div><span className="text-[10px] text-[#4A5568] block">OPEN POs</span><strong>22 MT</strong></div>
                <div><span className="text-[10px] text-red-700 block">EXPECTED SHORTAGE</span><strong className="text-red-700">80 MT</strong></div>
                <div><span className="text-[10px] text-[#0F6B50] block">RECOMMENDED BUY</span><strong className="text-[#0F6B50]">90 MT (incl. safety)</strong></div>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-xs">
                <strong>PROCUREMENT_BEGIN_SOON (MODERATE CONFIDENCE):</strong> Podium Slab pour requires 80 MT net TMT Steel in 18 days. Initiate RFQ immediately to preserve a 14-day mill dispatch + 7-day approval buffer.
              </div>
            </div>
          )}

          {activeTab === 'reliability' && (
            <div className="space-y-4 text-xs">
              <h2 className="text-base font-bold text-[#172B3A]">Supplier Reliability Intelligence (DEMO SCORING)</h2>
              <p className="text-[#4A5568]">
                Configurable 7-dimension weighting: Delivery (25%), Quality (25%), Quantity Fulfilment (15%), Quotation Responsiveness (10%), Invoice Accuracy (10%), Disputes (10%), Documentation (5%). Suppliers with &lt; 3 completed transactions are strictly marked <strong>INSUFFICIENT_DATA</strong>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-[#D5DCE2] rounded-xs">
                  <div className="font-bold text-[#172B3A]">Sample Distributor A</div>
                  <div className="text-xl font-mono font-bold text-[#0F6B50] mt-1">94.0 / 100</div>
                  <div className="text-[11px] text-[#4A5568] mt-1">18 completed demo txns &bull; Verified</div>
                </div>
                <div className="p-4 border border-[#D5DCE2] rounded-xs">
                  <div className="font-bold text-[#172B3A]">Sample Distributor B</div>
                  <div className="text-xl font-mono font-bold text-[#0F6B50] mt-1">91.2 / 100</div>
                  <div className="text-[11px] text-[#4A5568] mt-1">12 completed demo txns &bull; Verified</div>
                </div>
                <div className="p-4 border border-amber-300 bg-amber-50/60 rounded-xs">
                  <div className="font-bold text-[#172B3A]">Sample Regional Dealer C</div>
                  <div className="text-base font-mono font-bold text-amber-900 mt-1">INSUFFICIENT_DATA</div>
                  <div className="text-[11px] text-amber-800 mt-1">0 completed txns &bull; Verification Pending</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'multiproject' && (
            <div className="space-y-4 text-xs">
              <h2 className="text-base font-bold text-[#172B3A]">Multi-Project Purchasing Intelligence (DEMO CONSOLIDATION)</h2>
              <div className="p-4 bg-[#F3F5F7] border border-[#D5DCE2] rounded-xs space-y-2">
                <div className="font-bold text-[#172B3A]">Compatible Consolidation Identified: 210 MT TMT Steel 16mm Fe-550D</div>
                <p className="text-[#4A5568]">
                  Tower A (S.G. Highway, 120 MT) + Tower B (Shela, 90 MT) share identical BIS IS 1786:2008 Fe-550D specifications, Ahmedabad West delivery corridor, and a 9-day delivery window overlap. Incompatible specs or schedules (&gt; 21 days apart) are automatically blocked from merging.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'autopilot' && (
            <div className="space-y-4 text-xs">
              <h2 className="text-base font-bold text-[#172B3A]">Procurement Autopilot — Human-Controlled Workflow (DEMO)</h2>
              <div className="p-4 bg-[#172B3A] text-white rounded-xs space-y-2">
                <div className="font-mono text-[#C9A45B] font-bold">APPROVAL GATE ENFORCED: NO AUTO-AWARD PERMITTED</div>
                <p className="text-[#C5CFD8]">
                  Autopilot prepares the RFQ draft, matches verified Ahmedabad distributors, flags Sample Dealer C&apos;s non-equivalent Fe-500 substitution, drafts clarification questions, and stages the approval summary — while strictly requiring authorised human buyer sign-off before sending invitations or issuing a Purchase Order.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <ProcurementFooter />
    </div>
  );
}
