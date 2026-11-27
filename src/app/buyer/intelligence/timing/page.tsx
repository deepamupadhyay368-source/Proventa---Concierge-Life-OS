'use client';

import { useState, useEffect } from 'react';
import { BuyerWorkspaceShell } from '@/components/procurement/BuyerWorkspaceShell';
import { CalendarClock, AlertTriangle } from 'lucide-react';

export default function ProcurementTimingPage() {
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/procurement/intelligence/timing');
        const json = await res.json();
        if (json.success) setForecasts(json.data?.forecasts || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <BuyerWorkspaceShell
      title="Procurement Timing Intelligence"
      subtitle="Forward-looking material requirement forecasting across project milestones, BOQ quantities, site stock, open purchase orders, and lead-time buffers."
    >
      {loading ? (
        <div className="bg-white border border-[#D5DCE2] p-10 text-center text-xs text-[#4A5568]">
          Computing procurement timing forecasts...
        </div>
      ) : forecasts.length === 0 ? (
        <div className="bg-white border border-[#D5DCE2] p-12 text-center space-y-2 rounded-xs">
          <CalendarClock className="w-8 h-8 text-[#9AA7B4] mx-auto" />
          <div className="text-sm font-bold text-[#172B3A]">No project milestones scheduled yet</div>
          <p className="text-xs text-[#4A5568] max-w-md mx-auto">
            Add project milestones and site inventory records via POST `/api/procurement/intelligence/timing` to calculate shortages, RFQ start dates, and schedule risk alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {forecasts.map((f) => (
            <div key={`${f.projectId}-${f.milestoneName}`} className="bg-white border border-[#D5DCE2] p-5 rounded-xs space-y-3 text-xs">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#0F6B50] font-bold">
                    {f.projectName} &bull; {f.milestoneName}
                  </span>
                  <h2 className="text-base font-bold text-[#172B3A] mt-0.5">{f.materialName}</h2>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <div>Required By: <strong>{f.requiredByDateIso}</strong></div>
                  <div className="text-[#0F6B50]">Suggested RFQ Start: <strong>{f.suggestedRfqInitiationDateIso}</strong></div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono bg-[#F3F5F7] p-3 rounded-xs">
                <div><span className="text-[10px] text-[#4A5568] block">REQUIRED</span><strong>{f.requiredQuantity} {f.unit}</strong></div>
                <div><span className="text-[10px] text-[#4A5568] block">AVAILABLE STOCK</span><strong>{f.availableQuantity} {f.unit}</strong></div>
                <div><span className="text-[10px] text-[#4A5568] block">OPEN POs</span><strong>{f.alreadyOrderedQuantity} {f.unit}</strong></div>
                <div><span className="text-[10px] text-red-700 block">SHORTAGE</span><strong className="text-red-700">{f.expectedShortage} {f.unit}</strong></div>
                <div><span className="text-[10px] text-[#0F6B50] block">RECOMMENDED BUY</span><strong className="text-[#0F6B50]">{f.recommendedProcurementQuantity} {f.unit}</strong></div>
              </div>

              {f.alerts.length > 0 && (
                <div className="space-y-1.5">
                  {f.alerts.map((al: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-2 rounded-xs">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span><strong>{al.type}:</strong> {al.message}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-[#E9ECEF] text-[#4A5568]">
                <strong className="text-[#172B3A]">Decision Support ({f.confidence}):</strong> {f.priceTimingExplanation}
              </div>
            </div>
          ))}
        </div>
      )}
    </BuyerWorkspaceShell>
  );
}
