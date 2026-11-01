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
      <div className="flex items-center justify-center min-h-[400px] border border-[#252C38] bg-[#171C26] p-8 font-mono text-xs uppercase tracking-widest text-[#7595FF] rounded-[2px]">
        Aggregating Deterministic Wealth &amp; Historical Trajectory...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 1. TITANIUM COBALT HEADER */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-6 sm:p-8 border-b border-[#252C38]">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7595FF] font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#2457FF]" />
            <span>02 // CONSOLIDATED WEALTH &amp; BENEFICIAL SCOPE</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F4F6FA] tracking-tight mt-1">
            Net Equity Reconciliation
          </h1>
          <p className="font-sans text-xs text-[#C5CAD3] mt-2 max-w-xl">
            Paise-precision balance reconciliation comparing gross multi-entity family holdings against individual legal beneficial equity shares.
          </p>
        </div>

        {/* Comparison Grid: Gross vs Adjusted */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#252C38] bg-[#171C26]">
          {/* Consolidated Family */}
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="uppercase tracking-wider text-[#858D9B]">
                01 // CONSOLIDATED FAMILY TRUST
              </span>
              <span className="px-2 py-0.5 bg-[#090B10] border border-[#252C38] text-[#C5CAD3] uppercase rounded-[2px]">
                100% Entity Scope
              </span>
            </div>

            <div className="space-y-1">
              <div className="font-mono text-xs text-[#858D9B]">Consolidated Net Worth</div>
              <div className="font-display font-bold text-4xl sm:text-5xl text-[#F4F6FA]">
                {telemetry.formattedGrossNetWorth}
              </div>
            </div>

            <div className="pt-4 border-t border-[#252C38] space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#858D9B]">Gross Recorded Assets:</span>
                <span className="font-semibold text-[#F4F6FA]">{telemetry.formattedGrossAssets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#858D9B]">Gross Outstanding Debt:</span>
                <span className="font-semibold text-[#FF7A70]">{telemetry.formattedGrossLiabilities}</span>
              </div>
            </div>
          </div>

          {/* Primary Owner Beneficial Share */}
          <div className="p-8 space-y-4 bg-[#090B10]">
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="uppercase tracking-wider text-[#7595FF] font-semibold">
                02 // ATTRIBUTABLE LEGAL SHARE
              </span>
              <span className="px-2 py-0.5 bg-[#2457FF]/15 text-[#7595FF] border border-[#2457FF]/40 uppercase font-semibold rounded-[2px]">
                Rajesh Sharma (Self)
              </span>
            </div>

            <div className="space-y-1">
              <div className="font-mono text-xs text-[#858D9B]">Attributed Individual Equity</div>
              <div className="font-display font-bold text-4xl sm:text-5xl text-[#7595FF]">
                {telemetry.memberShares[0]?.formattedNetWorth || telemetry.formattedAdjustedNetWorth}
              </div>
            </div>

            <div className="pt-4 border-t border-[#252C38] space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#858D9B]">Attributed Asset Equity:</span>
                <span className="font-semibold text-[#F4F6FA]">
                  {telemetry.memberShares[0]?.formattedAssetsTotal || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#858D9B]">Attributed Liability Debt:</span>
                <span className="font-semibold text-[#FF7A70]">
                  {telemetry.memberShares[0]?.formattedLiabilitiesTotal || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HISTORICAL NET WORTH TRAJECTORY */}
      {telemetry.historicalPoints && telemetry.historicalPoints.length > 0 && (
        <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="p-4 bg-[#090B10] text-[#7595FF] font-mono text-xs uppercase tracking-wider font-semibold border-b border-[#252C38] flex items-center justify-between">
            <span>Historical Valuation Progression Points</span>
            <span className="text-[#F4F6FA]">+₹4.71 Cr Cumulative Trajectory</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#252C38]">
            {telemetry.historicalPoints.map((pt, idx) => (
              <div
                key={pt.date}
                className="p-5 text-center space-y-1 bg-[#171C26] hover:bg-[#1C2230] transition-colors"
              >
                <div className="font-mono text-[10px] text-[#858D9B] uppercase">{pt.date}</div>
                <div className="font-display font-bold text-xl text-[#F4F6FA]">{pt.formattedNetWorth}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
