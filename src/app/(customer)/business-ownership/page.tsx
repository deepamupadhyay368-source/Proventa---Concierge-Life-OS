'use client';

import { useEffect, useState } from 'react';
import {
  Network,
  Building2,
  Share2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { BusinessOwnershipGraphDTO } from '@/lib/wealth/types';

export default function BusinessOwnershipPage() {
  const [graph, setGraph] = useState<BusinessOwnershipGraphDTO | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadGraph() {
    setLoading(true);
    try {
      const res = await fetch('/api/wealth/business-ownership?familyId=fam_sharma_heritage');
      const json = await res.json();
      if (json.success && json.data) {
        setGraph(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGraph();
  }, []);

  if (loading || !graph) {
    return (
      <div className="flex items-center justify-center min-h-[400px] border border-[#101010] bg-[#FAF9F6] p-8 font-mono text-xs uppercase tracking-widest text-[#101010]">
        Resolving Corporate Shareholding Graph...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 1. INSTITUTIONAL HEADER & OWNERSHIP BANNER */}
      <div className="border border-[#101010] bg-[#FAF9F6]">
        <div className="p-6 sm:p-8 border-b border-[#101010]">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#85827B]">
            10 // CORPORATE HOLDING &amp; BENEFICIAL OWNERSHIP
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight mt-1">
            Corporate Cap-Table Map
          </h1>
          <p className="font-sans text-xs text-[#85827B] mt-2 max-w-xl">
            Mathematical resolution of multi-tier family holding companies, operating subsidiaries, and direct vs. indirect beneficial equity shares without double counting.
          </p>
        </div>

        {/* Attribution Protocol Banner */}
        <div className="p-4 bg-[#F0EDE5] border-b border-[#101010] flex items-center gap-3 font-mono text-xs text-[#101010]">
          <Network className="w-4 h-4 text-[#263B35] shrink-0" />
          <span>
            <strong>BENEFICIAL ATTRIBUTION STANDARD:</strong> Enterprise valuations are never counted in gross. PROVENTA models holding entity shares, subtracting external debt and applying exact effective family percentages.
          </span>
        </div>

        {/* Effective Equity Cards Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#101010] bg-[#FAF9F6]">
          {graph.familyEffectiveOwnership.map((eff, idx) => (
            <div key={eff.entityId} className="p-6 space-y-2">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-[#85827B]">ENT-0{idx + 1}</span>
                <span className="px-2 py-0.5 bg-[#263B35] text-[#FAF9F6] uppercase font-semibold">
                  {eff.effectiveFamilySharePercentage}% Effective Equity
                </span>
              </div>
              <h3 className="font-serif text-xl text-[#101010]">{eff.entityName}</h3>
              <div className="font-serif text-2xl text-[#101010] font-normal">
                {eff.formattedAttributedValue}
              </div>
              <div className="font-mono text-[10px] text-[#85827B]">
                Attributed family beneficial holding
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. MULTI-TIER ENTITY BREAKDOWN */}
      <div className="border border-[#101010] bg-[#FAF9F6]">
        <div className="p-4 bg-[#101010] text-[#F0EDE5] font-mono text-xs uppercase tracking-wider font-semibold">
          Registered Entities &amp; Cap-Table Registry
        </div>

        <div className="divide-y divide-[#101010]">
          {graph.entities.map((entity, idx) => (
            <div key={entity.id} className="p-6 space-y-4 hover:bg-[#F0EDE5] transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#101010]" />
                    <h4 className="font-serif text-xl text-[#101010]">{entity.name}</h4>
                  </div>
                  <div className="font-mono text-[10px] text-[#85827B] mt-0.5">
                    {entity.entityType.replace(/_/g, ' ')} · CIN: {entity.registrationNumber}
                  </div>
                </div>
                <div className="text-left sm:text-right font-mono">
                  <div className="font-serif text-xl text-[#101010]">{entity.formattedValuation}</div>
                  <div className="text-[10px] text-[#85827B]">Total Enterprise Valuation</div>
                </div>
              </div>

              {/* Cap Table Breakdown */}
              <div className="pt-3 border-t border-[#101010]/15 space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#85827B]">
                  Direct Cap-Table Shareholders
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {entity.directOwners.map((owner, i) => (
                    <div
                      key={i}
                      className="p-3 border border-[#101010] bg-[#FAF9F6] text-xs font-mono flex justify-between items-center"
                    >
                      <span className={owner.isFamilyMember ? 'font-semibold text-[#101010]' : 'text-[#85827B]'}>
                        {owner.ownerName}
                      </span>
                      <span className="font-bold text-[#101010]">{owner.equityPercentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
