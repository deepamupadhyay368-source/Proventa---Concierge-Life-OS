'use client';

import { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Shield,
  CheckCircle2,
  Calendar,
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
      <div className="flex items-center justify-center min-h-[300px] text-xs font-mono text-[#A78BFA]">
        Compiling Consolidated Statement of Family Net Worth...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A78BFA] mb-1">
            FAMILY WEALTH OS // FINANCIAL REPORTING
          </div>
          <h1 className="font-serif text-3xl text-white">Consolidated Wealth Reports &amp; Statements</h1>
          <p className="text-xs text-[#9D8BC9] font-light mt-1">
            Deterministic statements suitable for family offices, board reviews, and chartered accountants.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#8B5CF6] transition-all shadow-md shadow-[#7C3AED]/25"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Printable Statement Document */}
      <div className="p-8 rounded-2xl bg-[#0E1322] border border-[#1E293B] space-y-8 print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-[#1E293B] gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#A78BFA]">
              PROVENTA // CERTIFIED WEALTH RECORD
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
              Consolidated Statement of Family Financial Position
            </h2>
            <div className="text-xs text-[#9D8BC9] mt-1 font-mono">
              Entity: Sharma Family Trust &amp; Holdings · Workspace ID: fam_sharma_heritage
            </div>
          </div>
          <div className="text-right text-xs font-mono text-[#9D8BC9]">
            <div>As of: {new Date(telemetry.calculatedAt).toLocaleDateString()}</div>
            <div>Currency: Indian Rupee (INR)</div>
          </div>
        </div>

        {/* Core Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-1">
            <div className="text-[10px] font-mono uppercase text-[#9D8BC9]">Gross Family Assets</div>
            <div className="text-2xl font-serif font-bold text-white">{telemetry.formattedGrossAssets}</div>
            <div className="text-[10px] text-[#10B981] font-mono">{telemetry.totalAssetsCount} Verified Items</div>
          </div>

          <div className="p-5 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-1">
            <div className="text-[10px] font-mono uppercase text-[#9D8BC9]">Gross Total Debt</div>
            <div className="text-2xl font-serif font-bold text-[#F43F5E]">{telemetry.formattedGrossLiabilities}</div>
            <div className="text-[10px] text-[#F43F5E] font-mono">{telemetry.totalLiabilitiesCount} Active Facilities</div>
          </div>

          <div className="p-5 rounded-xl bg-[#1E1035] border border-[#3E236E] space-y-1">
            <div className="text-[10px] font-mono uppercase text-[#A78BFA]">Consolidated Net Worth</div>
            <div className="text-2xl font-serif font-bold text-white">{telemetry.formattedGrossNetWorth}</div>
            <div className="text-[10px] text-[#DDD0F7] font-mono">100% Deterministic Mathematical Precision</div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-white">Asset Allocation Schedule</h3>
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070A12] border-b border-[#1E293B] text-[10px] font-mono uppercase text-[#9D8BC9]">
              <tr>
                <th className="py-2.5 px-3">Asset Classification</th>
                <th className="py-2.5 px-3">Holdings Count</th>
                <th className="py-2.5 px-3">Valuation Amount</th>
                <th className="py-2.5 px-3 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-white">
              {telemetry.assetAllocation.map((a) => (
                <tr key={a.category}>
                  <td className="py-3 px-3 font-semibold">{a.label}</td>
                  <td className="py-3 px-3 font-mono">{a.count}</td>
                  <td className="py-3 px-3 font-serif font-bold">{a.formattedTotal}</td>
                  <td className="py-3 px-3 font-mono text-right font-bold text-[#A78BFA]">{a.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Member Equity Distribution Schedule */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-white">Member Beneficial Ownership Schedule</h3>
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070A12] border-b border-[#1E293B] text-[10px] font-mono uppercase text-[#9D8BC9]">
              <tr>
                <th className="py-2.5 px-3">Family Member</th>
                <th className="py-2.5 px-3">Attributed Assets</th>
                <th className="py-2.5 px-3">Attributed Debt</th>
                <th className="py-2.5 px-3">Net Personal Equity</th>
                <th className="py-2.5 px-3 text-right">Family Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-white">
              {telemetry.memberShares.map((m) => (
                <tr key={m.memberId}>
                  <td className="py-3 px-3 font-semibold">{m.memberName}</td>
                  <td className="py-3 px-3 font-mono">{m.formattedAssetsTotal}</td>
                  <td className="py-3 px-3 font-mono text-[#F43F5E]">{m.formattedLiabilitiesTotal}</td>
                  <td className="py-3 px-3 font-serif font-bold">{m.formattedNetWorth}</td>
                  <td className="py-3 px-3 font-mono text-right font-bold text-[#10B981]">{m.percentageOfFamilyNetWorth}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legal & Calculation Footnotes */}
        <div className="pt-6 border-t border-[#1E293B] text-[10px] text-[#64748B] space-y-1.5 leading-relaxed font-mono">
          <p>
            * Generated automatically by PROVENTA Family Wealth OS calculation engine using paise-precision integer arithmetic.
          </p>
          <p>
            * All figures represent recorded valuations verified against uploaded documents (Index II deeds, CAMS statements, RoC filings).
          </p>
          <p>
            * PROVENTA is not a registered investment advisor or intermediary under SEBI. This statement is prepared strictly for internal family governance and recordkeeping.
          </p>
        </div>
      </div>
    </div>
  );
}
