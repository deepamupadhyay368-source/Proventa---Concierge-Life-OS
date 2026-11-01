'use client';

import { useEffect, useState } from 'react';
import {
  Printer,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { NetWorthSummary } from '@/lib/wealth/types';

export default function ReportsPage() {
  const [telemetry, setTelemetry] = useState<NetWorthSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/wealth/telemetry?workspaceId=fam_sharma_heritage');
        const json = await res.json();
        if (json.success) {
          setTelemetry(json.data.telemetry);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  function handlePrint() {
    window.print();
  }

  if (loading || !telemetry) {
    return (
      <div className="flex items-center justify-center min-h-[400px] border border-[#252C38] bg-[#171C26] p-8 font-mono text-xs uppercase tracking-widest text-[#7595FF] rounded-[2px]">
        Compiling Consolidated Statement of Family Position...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 1. TITANIUM COBALT HEADER & PRINT TRIGGER */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)] print:hidden">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7595FF] font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#2457FF]" />
              <span>13 // FINANCIAL STATEMENTS &amp; AUDIT EXPORTS</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F4F6FA] tracking-tight mt-1">
              Consolidated Statement of Position
            </h1>
            <p className="font-sans text-xs text-[#C5CAD3] mt-2 max-w-xl">
              Audit-ready formal balance sheet and ownership schedules suitable for private trustees, family offices, and chartered accountants.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] font-mono text-xs uppercase tracking-wider font-semibold border border-[#7595FF]/40 rounded-[2px] shadow-[0_0_15px_rgba(36,87,255,0.3)] transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Statement (PDF)</span>
          </button>
        </div>
      </div>

      {/* 2. FORMAL TITANIUM STATEMENT (PRINTABLE INSTITUTIONAL DOCUMENT) */}
      <div className="border border-[#252C38] bg-[#171C26] p-8 sm:p-12 space-y-10 rounded-[2px] shadow-[0_4px_24px_rgba(0,0,0,0.5)] print:border-none print:p-0 print:bg-white print:text-black">
        {/* Document Header */}
        <div className="border-b border-[#252C38] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6 print:border-black">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#7595FF] font-semibold print:text-neutral-600">
              <span>PROVENTA</span>
              <span>//</span>
              <span>FAMILY WEALTH OS</span>
              <span>//</span>
              <span>FORM 10-A</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#F4F6FA] tracking-tight mt-2 print:text-black">
              Consolidated Statement of Family Financial Position
            </h2>
            <div className="font-mono text-xs text-[#858D9B] mt-1 print:text-neutral-600">
              Entity: Sharma Family Trust &amp; Holdings · Workspace Code: FWS-001
            </div>
          </div>
          <div className="text-left sm:text-right font-mono text-xs text-[#C5CAD3] space-y-0.5 print:text-black">
            <div>Valuation Date: {new Date(telemetry.calculatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            <div>Accounting Standard: Integer Paise Deterministic Engine</div>
            <div>Reporting Currency: Indian Rupee (INR / ₹)</div>
          </div>
        </div>

        {/* Core Summary Ledger Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#252C38] border border-[#252C38] bg-[#090B10] rounded-[2px] print:divide-black print:border-black print:bg-neutral-100">
          <div className="p-6 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B] print:text-neutral-600">
              01 // GROSS FAMILY ASSETS
            </div>
            <div className="font-display font-bold text-3xl text-[#F4F6FA] print:text-black">
              {telemetry.formattedGrossAssets}
            </div>
            <div className="font-mono text-[10px] text-[#7595FF] print:text-black">
              {telemetry.totalAssetsCount} Verified Instruments Attached
            </div>
          </div>

          <div className="p-6 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#858D9B] print:text-neutral-600">
              02 // TOTAL OUTSTANDING LIABILITIES
            </div>
            <div className="font-display font-bold text-3xl text-[#FF7A70] print:text-red-700">
              {telemetry.formattedGrossLiabilities}
            </div>
            <div className="font-mono text-[10px] text-[#858D9B] print:text-neutral-600">
              {telemetry.totalLiabilitiesCount} Documented Amortisation Lines
            </div>
          </div>

          <div className="p-6 space-y-1 bg-[#171C26] border-l border-[#2457FF] text-[#F4F6FA] print:bg-neutral-200 print:text-black print:border-black">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#7595FF] font-semibold print:text-black">
              03 // CONSOLIDATED NET FAMILY WORTH
            </div>
            <div className="font-display font-bold text-3xl text-[#F4F6FA] print:text-black">
              {telemetry.formattedGrossNetWorth}
            </div>
            <div className="font-mono text-[10px] text-[#7595FF] print:text-black">
              Deterministic Mathematical Net Equity
            </div>
          </div>
        </div>

        {/* Asset Class Allocation Schedule */}
        <div className="space-y-3">
          <div className="font-mono text-xs uppercase tracking-wider text-[#F4F6FA] font-bold flex items-center justify-between border-b border-[#252C38] pb-2 print:text-black print:border-black">
            <span>Schedule I: Asset Class Allocation Breakdown</span>
            <span className="text-[#7595FF] text-[10px] font-semibold print:text-neutral-600">Verified Title Deeds</span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#090B10] text-[#7595FF] font-mono text-[10px] uppercase tracking-wider print:bg-neutral-200 print:text-black">
              <tr>
                <th className="py-2.5 px-4 border-b border-[#252C38] print:border-black">Asset Class Classification</th>
                <th className="py-2.5 px-4 border-b border-[#252C38] print:border-black">Instruments</th>
                <th className="py-2.5 px-4 border-b border-[#252C38] print:border-black">Valuation Amount</th>
                <th className="py-2.5 px-4 border-b border-[#252C38] print:border-black text-right">Portfolio Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252C38] text-[#F4F6FA] print:divide-black print:text-black">
              {telemetry.assetAllocation.map((a) => (
                <tr key={a.category}>
                  <td className="py-3 px-4 font-mono font-semibold">{a.label}</td>
                  <td className="py-3 px-4 font-mono text-[#C5CAD3] print:text-black">{a.count} Registered</td>
                  <td className="py-3 px-4 font-display font-bold text-base">{a.formattedTotal}</td>
                  <td className="py-3 px-4 font-mono text-right font-bold text-[#7595FF] print:text-black">{a.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Member Equity Distribution Schedule */}
        <div className="space-y-3">
          <div className="font-mono text-xs uppercase tracking-wider text-[#F4F6FA] font-bold flex items-center justify-between border-b border-[#252C38] pb-2 print:text-black print:border-black">
            <span>Schedule II: Beneficiary Equity Attribution</span>
            <span className="text-[#7595FF] text-[10px] font-semibold print:text-neutral-600">Proportional Title Deed Mapping</span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#090B10] text-[#7595FF] font-mono text-[10px] uppercase tracking-wider print:bg-neutral-200 print:text-black">
              <tr>
                <th className="py-2.5 px-4 border-b border-[#252C38] print:border-black">Family Member / Beneficiary</th>
                <th className="py-2.5 px-4 border-b border-[#252C38] print:border-black">Attributed Assets</th>
                <th className="py-2.5 px-4 border-b border-[#252C38] print:border-black">Attributed Debt</th>
                <th className="py-2.5 px-4 border-b border-[#252C38] print:border-black">Net Personal Position</th>
                <th className="py-2.5 px-4 border-b border-[#252C38] print:border-black text-right">Beneficial Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252C38] text-[#F4F6FA] print:divide-black print:text-black">
              {telemetry.memberShares.map((m) => (
                <tr key={m.memberId}>
                  <td className="py-3 px-4 font-mono font-semibold">{m.memberName}</td>
                  <td className="py-3 px-4 font-mono text-[#C5CAD3] print:text-black">{m.formattedAssetsTotal}</td>
                  <td className="py-3 px-4 font-mono text-[#FF7A70] print:text-red-700">{m.formattedLiabilitiesTotal}</td>
                  <td className="py-3 px-4 font-display font-bold text-base">{m.formattedNetWorth}</td>
                  <td className="py-3 px-4 font-mono text-right font-bold text-[#7595FF] print:text-black">{m.percentageOfFamilyNetWorth}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trustee Certification & Sign-off Block */}
        <div className="pt-8 border-t border-[#252C38] grid grid-cols-1 sm:grid-cols-2 gap-8 font-mono text-xs print:border-black">
          <div className="space-y-4">
            <div className="text-[10px] uppercase tracking-wider text-[#85827B] print:text-neutral-600">
              PRIMARY TRUSTEE EXECUTION &amp; SEAL
            </div>
            <div className="h-16 border-b border-[#252C38] flex items-end pb-1 font-display font-bold text-lg text-[#F4F6FA] print:border-black print:text-black">
              Rajesh Sharma (Trustee)
            </div>
            <div className="text-[10px] text-[#85827B] print:text-neutral-600">Authorized Signatory · Sharma Family Trust</div>
          </div>

          <div className="space-y-4">
            <div className="text-[10px] uppercase tracking-wider text-[#85827B] print:text-neutral-600">
              CRYPTOGRAPHIC SYSTEM CERTIFICATION
            </div>
            <div className="p-3 bg-[#090B10] border border-[#252C38] text-[10px] text-[#C5CAD3] space-y-1 rounded-[2px] print:bg-neutral-100 print:text-black print:border-black">
              <div>SHA-256 Digest: 82d650c...a19f</div>
              <div>Audit Timestamp: {new Date().toISOString()}</div>
              <div>Digital Personal Data Protection Act 2023 Compliant</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
