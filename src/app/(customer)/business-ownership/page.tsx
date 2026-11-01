'use client';

import { useEffect, useState } from 'react';
import {
  Network,
  Building2,
  Share2,
  FileText,
  CheckCircle2,
  Layers,
  ArrowRight,
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
      <div className="flex items-center justify-center min-h-[300px] text-xs font-mono text-[#A78BFA]">
        Mapping Multi-Tier Corporate Shareholding Graph...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A78BFA] mb-1">
            FAMILY WEALTH OS // BUSINESS INTELLIGENCE
          </div>
          <h1 className="font-serif text-3xl text-white">Corporate Ownership &amp; Shareholding Map</h1>
          <p className="text-xs text-[#9D8BC9] font-light mt-1">
            Multi-tier family holding companies, LLPs, and direct vs indirect effective ownership percentages.
          </p>
        </div>
      </div>

      {/* Protocol Banner */}
      <div className="p-4 rounded-xl bg-[#0E1322] border border-[#1E293B] text-xs text-[#9D8BC9] flex items-center gap-2.5">
        <Network className="w-4 h-4 text-[#A78BFA] shrink-0" />
        <span>
          <strong>Attributed Equity Attribution Standard:</strong> Enterprise enterprise values are never automatically counted as personal net worth. PROVENTA models validated cap-tables, debt subtractions, and effective family shareholding.
        </span>
      </div>

      {/* Effective Family Ownership Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {graph.familyEffectiveOwnership.map((eff) => (
          <div
            key={eff.entityId}
            className="p-5 rounded-2xl bg-[#0E1322] border border-[#2D1854] space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E1035] text-[#A78BFA] border border-[#3E236E]">
                {eff.effectiveFamilySharePercentage}% Family Equity
              </span>
              <Building2 className="w-4 h-4 text-[#DDD0F7]" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">{eff.entityName}</h3>
              <div className="text-2xl font-serif font-bold text-white mt-1">
                {eff.formattedAttributedValue}
              </div>
            </div>

            <div className="pt-2 border-t border-[#1E293B] text-[10px] text-[#9D8BC9] font-mono">
              Attributed Family Net Equity Holding
            </div>
          </div>
        ))}
      </div>

      {/* Visual Multi-Tier Structure */}
      <div className="p-6 rounded-2xl bg-[#0E1322] border border-[#1E293B] space-y-6">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
          Multi-Tier Shareholding Structure
        </h3>

        <div className="space-y-4">
          {graph.entities.map((entity) => (
            <div
              key={entity.id}
              className="p-5 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#7C3AED]" />
                    <h4 className="text-base font-semibold text-white">{entity.name}</h4>
                  </div>
                  <div className="text-[10px] text-[#9D8BC9] font-mono mt-0.5">
                    {entity.entityType.replace(/_/g, ' ')} · CIN: {entity.registrationNumber}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-serif font-bold text-white">{entity.formattedValuation}</div>
                  <div className="text-[10px] text-[#9D8BC9] font-mono">Total Company Valuation</div>
                </div>
              </div>

              {/* Cap Table Breakdown */}
              <div className="pt-3 border-t border-[#1E293B] space-y-2">
                <div className="text-[10px] font-mono uppercase text-[#A78BFA]">Direct Cap-Table Owners</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {entity.directOwners.map((owner, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-[#0E1322] border border-[#1E293B] text-xs flex justify-between items-center"
                    >
                      <span className={owner.isFamilyMember ? 'text-white font-medium' : 'text-[#9D8BC9]'}>
                        {owner.ownerName}
                      </span>
                      <span className="font-mono font-bold text-[#A78BFA]">{owner.equityPercentage}%</span>
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
