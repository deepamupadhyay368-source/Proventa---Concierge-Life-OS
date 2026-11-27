'use client';

import { useState, useEffect } from 'react';
import { BuyerWorkspaceShell } from '@/components/procurement/BuyerWorkspaceShell';
import { Network } from 'lucide-react';

export default function MultiProjectIntelligencePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/procurement/intelligence/multi-project');
        const json = await res.json();
        if (json.success) setData(json.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <BuyerWorkspaceShell
      title="Multi-Project Purchasing Intelligence"
      subtitle="Organisation-wide spend visibility, cross-project rate attribution, supplier concentration analysis, and specification-verified consolidation opportunities."
    >
      {loading ? (
        <div className="bg-white border border-[#D5DCE2] p-10 text-center text-xs text-[#4A5568]">
          Loading multi-project purchasing intelligence...
        </div>
      ) : !data ? (
        <div className="bg-white border border-[#D5DCE2] p-10 text-center text-xs text-[#4A5568]">
          Sign in with an authorised buyer account to access cross-project analytics.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
              <div className="text-[10px] font-mono uppercase text-[#4A5568]">Active Projects</div>
              <div className="text-2xl font-bold font-mono text-[#172B3A] mt-1 tabular-nums">{data.activeProjectsCount}</div>
            </div>
            <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
              <div className="text-[10px] font-mono uppercase text-[#4A5568]">Open Requirements</div>
              <div className="text-2xl font-bold font-mono text-[#172B3A] mt-1 tabular-nums">{data.openRequirementsCount}</div>
            </div>
            <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
              <div className="text-[10px] font-mono uppercase text-[#0F6B50]">Combined Expenditure</div>
              <div className="text-2xl font-bold font-mono text-[#0F6B50] mt-1 tabular-nums">{data.totalExpenditureFormatted}</div>
            </div>
          </div>

          <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs space-y-3">
            <h2 className="text-sm font-bold text-[#172B3A]">Supplier Concentration &amp; Dependency Risk</h2>
            {data.supplierConcentration?.length === 0 ? (
              <p className="text-xs text-[#4A5568]">No executed purchase orders recorded yet for concentration analysis.</p>
            ) : (
              <div className="divide-y divide-[#E9ECEF] text-xs">
                {data.supplierConcentration.map((s: any) => (
                  <div key={s.supplierBusinessId} className="py-2.5 flex items-center justify-between">
                    <span className="font-semibold text-[#172B3A]">{s.supplierName}</span>
                    <div className="flex items-center gap-4 font-mono">
                      <span>{s.formattedSpend} ({s.sharePercent}%)</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-xs ${
                          s.dependencyRisk === 'HIGH'
                            ? 'bg-red-100 text-red-800'
                            : s.dependencyRisk === 'MODERATE'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-[#0F6B50]/10 text-[#0F6B50]'
                        }`}
                      >
                        {s.dependencyRisk}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs space-y-3">
            <h2 className="text-sm font-bold text-[#172B3A] flex items-center gap-2">
              <Network className="w-4 h-4 text-[#0F6B50]" />
              <span>Consolidation Opportunities</span>
            </h2>
            {data.consolidationOpportunities?.length === 0 ? (
              <p className="text-xs text-[#4A5568]">
                No multi-project consolidation evaluations saved yet. Compatible requirements across 2+ projects with matching specifications and delivery windows appear here.
              </p>
            ) : (
              <div className="divide-y divide-[#E9ECEF] text-xs">
                {data.consolidationOpportunities.map((c: any) => (
                  <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-[#172B3A]">{c.opportunityCode} &bull; {c.materialName}</div>
                      <div className="text-[11px] text-[#4A5568]">
                        {c.combinedQuantity} {c.unit} across {c.projectIds.length} projects &bull; {c.supplierOverlapIds.length} overlapping suppliers
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-[#E9ECEF] font-mono text-[10px] font-bold rounded-xs">{c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </BuyerWorkspaceShell>
  );
}
