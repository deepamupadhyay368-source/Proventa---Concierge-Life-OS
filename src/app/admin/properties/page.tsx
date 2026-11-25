'use client';

import { Building, Plus, MapPin } from 'lucide-react';
import { AHMEDABAD_LOCALITIES } from '@/lib/real-estate/constants';

export default function AdminPropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#C8C4BA] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            Asset Classification
          </span>
          <h1 className="font-display text-2xl font-bold text-[#202B3C]">
            Monitored Localities & Benchmark Corridors
          </h1>
        </div>

        <button
          onClick={() => alert('New locality baseline creation modal triggered.')}
          className="px-3.5 py-2 bg-[#202B3C] text-white text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Locality Corridor</span>
        </button>
      </div>

      <div className="bg-white border border-[#C8C4BA] overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C]">
              <th className="p-3.5 font-bold uppercase tracking-wider">Locality Name</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Zone</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Weighted ₹/Sq Ft</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Q3 Volume</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Confidence</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C8C4BA]/50 font-mono">
            {AHMEDABAD_LOCALITIES.map((loc) => (
              <tr key={loc.slug} className="hover:bg-[#F5F3ED]/40 transition-colors">
                <td className="p-3.5 font-sans font-bold text-[#202B3C]">{loc.name}</td>
                <td className="p-3.5 font-sans text-[#69717B]">{loc.zone}</td>
                <td className="p-3.5 text-[#202B3C]">₹{loc.avgPriceSqFt.toLocaleString('en-IN')}</td>
                <td className="p-3.5 text-[#202B3C]">{loc.transactionVolumeQuarter} deeds</td>
                <td className="p-3.5 text-[#547568] font-bold">{loc.confidenceScore}%</td>
                <td className="p-3.5 font-sans">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold">
                    VERIFIED
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
