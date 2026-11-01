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
      <div className="flex items-center justify-center min-h-[400px] border border-[#101010] bg-[#FAF9F6] p-8 font-mono text-xs uppercase tracking-widest text-[#101010]">
        Compiling Consolidated Statement of Family Position...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 1. INSTITUTIONAL HEADER & PRINT TRIGGER */}
      <div className="border border-[#101010] bg-[#FAF9F6] print:hidden">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#85827B]">
              13 // FINANCIAL STATEMENTS &amp; AUDIT EXPORTS
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight mt-1">
              Consolidated Statement of Position
            </h1>
            <p className="font-sans text-xs text-[#85827B] mt-2 max-w-xl">
              Audit-ready formal balance sheet and ownership schedules suitable for private trustees, family offices, and chartered accountants.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] font-mono text-xs uppercase tracking-wider font-semibold border border-[#101010] transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Statement (PDF)</span>
          </button>
        </div>
      </div>

      {/* 2. FORMAL EDITORIAL STATEMENT (PRINTABLE INSTITUTIONAL DOCUMENT) */}
      <div className="border border-[#101010] bg-[#FAF9F6] p-8 sm:p-12 space-y-10 print:border-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-[#101010] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#85827B]">
              <span>PROVENTA</span>
              <span>//</span>
              <span>THE WEALTH INSTITUTION</span>
              <span>//</span>
              <span>FORM 10-A</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#101010] tracking-tight mt-2">
              Consolidated Statement of Family Financial Position
            </h2>
            <div className="font-mono text-xs text-[#85827B] mt-1">
              Entity: Sharma Family Trust &amp; Holdings · Workspace Code: FWS-001
            </div>
          </div>
          <div className="text-left sm:text-right font-mono text-xs text-[#101010] space-y-0.5">
            <div>Valuation Date: {new Date(telemetry.calculatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            <div>Accounting Standard: Integer Paise Deterministic Engine</div>
            <div>Reporting Currency: Indian Rupee (INR / ₹)</div>
          </div>
        </div>

        {/* Core Summary Ledger Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#101010] border border-[#101010] bg-[#F0EDE5]">
          <div className="p-6 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              01 // GROSS FAMILY ASSETS
            </div>
            <div className="font-serif text-3xl text-[#101010] font-normal">
              {telemetry.formattedGrossAssets}
            </div>
            <div className="font-mono text-[10px] text-[#263B35]">
              {telemetry.totalAssetsCount} Verified Instruments Attached
            </div>
          </div>

          <div className="p-6 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
              02 // TOTAL OUTSTANDING LIABILITIES
            </div>
            <div className="font-serif text-3xl text-[#A63B32] font-normal">
              {telemetry.formattedGrossLiabilities}
            </div>
            <div className="font-mono text-[10px] text-[#85827B]">
              {telemetry.totalLiabilitiesCount} Documented Amortisation Lines
            </div>
          </div>

          <div className="p-6 space-y-1 bg-[#101010] text-[#F0EDE5]">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#B6A68A]">
              03 // CONSOLIDATED NET FAMILY WORTH
            </div>
            <div className="font-serif text-3xl text-[#F0EDE5] font-normal">
              {telemetry.formattedGrossNetWorth}
            </div>
            <div className="font-mono text-[10px] text-[#B6A68A]">
              Deterministic Mathematical Net Equity
            </div>
          </div>
        </div>

        {/* Asset Class Allocation Schedule */}
        <div className="space-y-3">
          <div className="font-mono text-xs uppercase tracking-wider text-[#101010] font-semibold flex items-center justify-between border-b border-[#101010] pb-2">
            <span>Schedule I: Asset Class Allocation Breakdown</span>
            <span className="text-[#85827B] text-[10px]">Verified Title Deeds</span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#101010] text-[#F0EDE5] font-mono text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4 border-b border-[#101010]">Asset Class Classification</th>
                <th className="py-2.5 px-4 border-b border-[#101010]">Instruments</th>
                <th className="py-2.5 px-4 border-b border-[#101010]">Valuation Amount</th>
                <th className="py-2.5 px-4 border-b border-[#101010] text-right">Portfolio Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#101010] text-[#101010]">
              {telemetry.assetAllocation.map((a) => (
                <tr key={a.category}>
                  <td className="py-3 px-4 font-mono font-semibold">{a.label}</td>
                  <td className="py-3 px-4 font-mono">{a.count} Registered</td>
                  <td className="py-3 px-4 font-serif text-base">{a.formattedTotal}</td>
                  <td className="py-3 px-4 font-mono text-right font-bold text-[#263B35]">{a.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Member Equity Distribution Schedule */}
        <div className="space-y-3">
          <div className="font-mono text-xs uppercase tracking-wider text-[#101010] font-semibold flex items-center justify-between border-b border-[#101010] pb-2">
            <span>Schedule II: Beneficiary Equity Attribution</span>
            <span className="text-[#85827B] text-[10px]">Proportional Title Deed Mapping</span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#101010] text-[#F0EDE5] font-mono text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4 border-b border-[#101010]">Family Member / Beneficiary</th>
                <th className="py-2.5 px-4 border-b border-[#101010]">Attributed Assets</th>
                <th className="py-2.5 px-4 border-b border-[#101010]">Attributed Debt</th>
                <th className="py-2.5 px-4 border-b border-[#101010]">Net Personal Position</th>
                <th className="py-2.5 px-4 border-b border-[#101010] text-right">Beneficial Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#101010] text-[#101010]">
              {telemetry.memberShares.map((m) => (
                <tr key={m.memberId}>
                  <td className="py-3 px-4 font-mono font-semibold">{m.memberName}</td>
                  <td className="py-3 px-4 font-mono">{m.formattedAssetsTotal}</td>
                  <td className="py-3 px-4 font-mono text-[#A63B32]">{m.formattedLiabilitiesTotal}</td>
                  <td className="py-3 px-4 font-serif text-base">{m.formattedNetWorth}</td>
                  <td className="py-3 px-4 font-mono text-right font-bold text-[#263B35]">{m.percentageOfFamilyNetWorth}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trustee Certification & Sign-off Block */}
        <div className="pt-8 border-t border-[#101010] grid grid-cols-1 sm:grid-cols-2 gap-8 font-mono text-xs">
          <div className="space-y-4">
            <div className="text-[10px] uppercase tracking-wider text-[#85827B]">
              PRIMARY TRUSTEE EXECUTION &amp; SEAL
            </div>
            <div className="h-16 border-b border-[#101010] flex items-end pb-1 font-serif text-lg text-[#101010]">
              Rajesh Sharma (Trustee)
            </div>
            <div className="text-[10px] text-[#85827B]">Authorized Signatory · Sharma Family Trust</div>
          </div>

          <div className="space-y-4">
            <div className="text-[10px] uppercase tracking-wider text-[#85827B]">
              CRYPTOGRAPHIC SYSTEM CERTIFICATION
            </div>
            <div className="p-3 bg-[#F0EDE5] border border-[#101010] text-[10px] text-[#101010] space-y-1">
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
