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
import { useCurrentWorkspace } from '@/lib/wealth/workspace-context';

export default function BusinessOwnershipPage() {
  const { currentWorkspaceId, isLoaded } = useCurrentWorkspace();
  const [graph, setGraph] = useState<BusinessOwnershipGraphDTO | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadGraph() {
    if (!currentWorkspaceId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/wealth/business-ownership?familyId=${encodeURIComponent(currentWorkspaceId)}`);
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
    if (isLoaded) {
      void loadGraph();
    }
  }, [currentWorkspaceId, isLoaded]);

  if (loading || !graph) {
    return (
      <div className="flex items-center justify-center min-h-[400px] border border-[#252C38] bg-[#171C26] p-8 font-mono text-xs uppercase tracking-widest text-[#7595FF] rounded-[2px]">
        Resolving Corporate Shareholding Graph...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* 1. TITANIUM COBALT HEADER & OWNERSHIP BANNER */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-6 sm:p-8 border-b border-[#252C38]">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7595FF] font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#2457FF]" />
            <span>10 // CORPORATE HOLDING &amp; BENEFICIAL OWNERSHIP</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F4F6FA] tracking-tight mt-1">
            Corporate Cap-Table Map
          </h1>
          <p className="font-sans text-xs text-[#C5CAD3] mt-2 max-w-xl">
            Mathematical resolution of multi-tier family holding companies, operating subsidiaries, and direct vs. indirect beneficial equity shares without double counting.
          </p>
        </div>

        {/* Attribution Protocol Banner */}
        <div className="p-4 bg-[#090B10] border-b border-[#252C38] flex items-center gap-3 font-mono text-xs text-[#C5CAD3]">
          <Network className="w-4 h-4 text-[#7595FF] shrink-0" />
          <span>
            <strong className="text-[#F4F6FA]">BENEFICIAL ATTRIBUTION STANDARD:</strong> Enterprise valuations are never counted in gross. PROVENTA models holding entity shares, subtracting external debt and applying exact effective family percentages.
          </span>
        </div>

        {/* Effective Equity Cards Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#252C38] bg-[#090B10]">
          {graph.familyEffectiveOwnership.map((eff, idx) => (
            <div key={eff.entityId} className="p-6 space-y-2">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-[#7595FF] font-semibold">ENT-0{idx + 1}</span>
                <span className="px-2 py-0.5 bg-[#2457FF]/15 text-[#7595FF] border border-[#2457FF]/40 uppercase font-semibold rounded-[2px]">
                  {eff.effectiveFamilySharePercentage}% Effective Equity
                </span>
              </div>
              <h3 className="font-display font-bold text-xl text-[#F4F6FA]">{eff.entityName}</h3>
              <div className="font-display font-bold text-2xl text-[#F4F6FA]">
                {eff.formattedAttributedValue}
              </div>
              <div className="font-mono text-[10px] text-[#858D9B]">
                Attributed family beneficial holding
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. MULTI-TIER ENTITY BREAKDOWN */}
      <div className="border border-[#252C38] bg-[#171C26] rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-4 bg-[#090B10] text-[#7595FF] font-mono text-xs uppercase tracking-wider font-semibold border-b border-[#252C38]">
          Registered Entities &amp; Cap-Table Registry
        </div>

        <div className="divide-y divide-[#252C38]">
          {graph.entities.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-[#171C26]">
              <div className="w-10 h-10 mx-auto bg-[#2457FF]/10 text-[#2457FF] flex items-center justify-center rounded-xs border border-[#2457FF]/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="font-heading font-bold text-base text-[#F4F6FA]">No Operating Entities Registered</div>
              <p className="text-xs text-[#858D9B] max-w-sm mx-auto">
                No corporate shareholding logged in this workspace. Record family LLPs, private limited entities, or holding company structures.
              </p>
            </div>
          ) : (
            graph.entities.map((entity, idx) => (
              <div key={entity.id} className="p-6 space-y-4 hover:bg-[#1C2230] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#7595FF]" />
                      <h4 className="font-display font-bold text-xl text-[#F4F6FA]">{entity.name}</h4>
                    </div>
                    <div className="font-mono text-[10px] text-[#858D9B] mt-0.5">
                      {entity.entityType.replace(/_/g, ' ')} · CIN: {entity.registrationNumber}
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-mono">
                    <div className="font-display font-bold text-xl text-[#F4F6FA]">{entity.formattedValuation}</div>
                    <div className="text-[10px] text-[#858D9B]">Total Enterprise Valuation</div>
                  </div>
                </div>

                {/* Cap Table Breakdown */}
                <div className="pt-3 border-t border-[#252C38] space-y-2">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#7595FF] font-semibold">
                    Direct Cap-Table Shareholders
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {entity.directOwners.map((owner, i) => (
                      <div
                        key={i}
                        className="p-3 border border-[#252C38] bg-[#090B10] text-xs font-mono flex justify-between items-center rounded-[2px]"
                      >
                        <span className={owner.isFamilyMember ? 'font-semibold text-[#F4F6FA]' : 'text-[#858D9B]'}>
                          {owner.ownerName}
                        </span>
                        <span className="font-bold text-[#7595FF]">{owner.equityPercentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
