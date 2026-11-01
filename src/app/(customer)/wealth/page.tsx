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
      <div className="flex items-center justify-center min-h-[400px] border border-[#101010] bg-[#FAF9F6] p-8 font-mono text-xs uppercase tracking-widest text-[#101010]">
        Aggregating Deterministic Wealth &amp; Historical Trajectory...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 1. INSTITUTIONAL HEADER */}
      <div className="border border-[#101010] bg-[#FAF9F6]">
        <div className="p-6 sm:p-8 border-b border-[#101010]">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#85827B]">
            02 // CONSOLIDATED WEALTH &amp; BENEFICIAL SCOPE
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight mt-1">
            Net Equity Reconciliation
          </h1>
          <p className="font-sans text-xs text-[#85827B] mt-2 max-w-xl">
            Paise-precision balance reconciliation comparing gross multi-entity family holdings against individual legal beneficial equity shares.
          </p>
        </div>

        {/* Comparison Grid: Gross vs Adjusted */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#101010] bg-[#FAF9F6]">
          {/* Consolidated Family */}
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="uppercase tracking-wider text-[#85827B]">
                01 // CONSOLIDATED FAMILY TRUST
              </span>
              <span className="px-2 py-0.5 bg-[#101010] text-[#F0EDE5] uppercase">
                100% Entity Scope
              </span>
            </div>

            <div className="space-y-1">
              <div className="font-mono text-xs text-[#85827B]">Consolidated Net Worth</div>
              <div className="font-serif text-4xl sm:text-5xl font-normal text-[#101010]">
                {telemetry.formattedGrossNetWorth}
              </div>
            </div>

            <div className="pt-4 border-t border-[#101010]/15 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#85827B]">Gross Recorded Assets:</span>
                <span className="font-semibold text-[#101010]">{telemetry.formattedGrossAssets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#85827B]">Gross Outstanding Debt:</span>
                <span className="font-semibold text-[#A63B32]">{telemetry.formattedGrossLiabilities}</span>
              </div>
            </div>
          </div>

          {/* Primary Owner Beneficial Share */}
          <div className="p-8 space-y-4 bg-[#F0EDE5]">
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="uppercase tracking-wider text-[#85827B]">
                02 // ATTRIBUTABLE LEGAL SHARE
              </span>
              <span className="px-2 py-0.5 bg-[#263B35] text-[#FAF9F6] uppercase">
                Rajesh Sharma (Self)
              </span>
            </div>

            <div className="space-y-1">
              <div className="font-mono text-xs text-[#85827B]">Attributed Individual Equity</div>
              <div className="font-serif text-4xl sm:text-5xl font-normal text-[#263B35]">
                {telemetry.memberShares[0]?.formattedNetWorth || telemetry.formattedAdjustedNetWorth}
              </div>
            </div>

            <div className="pt-4 border-t border-[#101010]/15 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#85827B]">Attributed Asset Equity:</span>
                <span className="font-semibold text-[#101010]">
                  {telemetry.memberShares[0]?.formattedAssetsTotal || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#85827B]">Attributed Liability Debt:</span>
                <span className="font-semibold text-[#A63B32]">
                  {telemetry.memberShares[0]?.formattedLiabilitiesTotal || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HISTORICAL NET WORTH TRAJECTORY */}
      {telemetry.historicalPoints && telemetry.historicalPoints.length > 0 && (
        <div className="border border-[#101010] bg-[#FAF9F6]">
          <div className="p-4 bg-[#101010] text-[#F0EDE5] font-mono text-xs uppercase tracking-wider font-semibold flex items-center justify-between">
            <span>Historical Valuation Progression Points</span>
            <span className="text-[#B6A68A]">+₹4.71 Cr Cumulative Trajectory</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#101010]">
            {telemetry.historicalPoints.map((pt, idx) => (
              <div
                key={pt.date}
                className="p-5 text-center space-y-1 bg-[#FAF9F6] hover:bg-[#F0EDE5] transition-colors"
              >
                <div className="font-mono text-[10px] text-[#85827B] uppercase">{pt.date}</div>
                <div className="font-serif text-xl font-normal text-[#101010]">{pt.formattedNetWorth}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
