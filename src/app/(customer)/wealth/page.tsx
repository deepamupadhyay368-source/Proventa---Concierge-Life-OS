'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PieChart,
  Coins,
  CreditCard,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { NetWorthSummary } from '@/lib/wealth/types';

export default function MyWealthPage() {
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

  if (loading || !telemetry) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs font-mono text-[#A78BFA]">
        Aggregating Deterministic Wealth &amp; Historical Trajectory...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A78BFA] mb-1">
            FAMILY WEALTH OS // NET WORTH ENGINE
          </div>
          <h1 className="font-serif text-3xl text-white">Net Worth Deep Dive</h1>
          <p className="text-xs text-[#9D8BC9] font-light mt-1">
            Paise-precision breakdown comparing gross family holdings against ownership-adjusted equity.
          </p>
        </div>
      </div>

      {/* Comparison Grid: Gross vs Adjusted */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#0E1322] border border-[#2D1854] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#A78BFA]">
              Consolidated Family Position
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E1035] text-[#DDD0F7]">
              100% Entity Scope
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-[#9D8BC9]">Consolidated Net Worth</div>
            <div className="text-3xl font-serif font-bold text-white">
              {telemetry.formattedGrossNetWorth}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1E293B] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#9D8BC9]">Total Recorded Assets:</span>
              <span className="font-mono text-white font-semibold">{telemetry.formattedGrossAssets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9D8BC9]">Total Outstanding Debt:</span>
              <span className="font-mono text-[#F43F5E] font-semibold">{telemetry.formattedGrossLiabilities}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0E1322] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#10B981]">
              Primary Owner Beneficial Share
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#064E3B]/40 text-[#10B981]">
              Rajesh Sharma
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-[#9D8BC9]">Attributed Individual Equity</div>
            <div className="text-3xl font-serif font-bold text-white">
              {telemetry.memberShares[0]?.formattedNetWorth || telemetry.formattedAdjustedNetWorth}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1E293B] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#9D8BC9]">Proportional Asset Share:</span>
              <span className="font-mono text-white font-semibold">
                {telemetry.memberShares[0]?.formattedAssetsTotal || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9D8BC9]">Proportional Debt Share:</span>
              <span className="font-mono text-[#F43F5E] font-semibold">
                {telemetry.memberShares[0]?.formattedLiabilitiesTotal || '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Trajectory Table */}
      {telemetry.historicalPoints && telemetry.historicalPoints.length > 0 && (
        <div className="rounded-2xl bg-[#0E1322] border border-[#1E293B] overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Historical Net Worth Trajectory</div>
            <span className="text-xs text-[#10B981] font-mono">+₹4.71 Cr cumulative progression</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
            {telemetry.historicalPoints.map((pt) => (
              <div
                key={pt.date}
                className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B] text-center space-y-1"
              >
                <div className="text-[10px] font-mono text-[#9D8BC9]">{pt.date}</div>
                <div className="text-sm font-serif font-bold text-white">{pt.formattedNetWorth}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
