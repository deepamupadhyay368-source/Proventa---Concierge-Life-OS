'use client';

import { TrendingUp, BarChart2, MapPin, Download } from 'lucide-react';
import { AHMEDABAD_LOCALITIES } from '@/lib/real-estate/constants';

export default function ProfessionalMarketPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C8C4BA] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            Empirical Market Matrix
          </span>
          <h1 className="font-display text-2xl font-bold text-[#202B3C]">
            Ahmedabad Transaction Velocity & Absorption
          </h1>
        </div>

        <button
          onClick={() => alert('Exporting full Excel transaction evidence dataset for professional subscribers.')}
          className="px-3.5 py-2 bg-[#202B3C] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#202B3C]/90 shadow-xs"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Excel Dataset (.xlsx)</span>
        </button>
      </div>

      <div className="bg-white border border-[#C8C4BA] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C]">
              <th className="p-3.5 font-bold uppercase tracking-wider">Locality</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Zone</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Weighted ₹/Sq Ft</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Quarterly Volume</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Rental Yield</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">1-Yr Growth</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">RERA Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C8C4BA]/50 font-mono">
            {AHMEDABAD_LOCALITIES.map((loc) => (
              <tr key={loc.slug} className="hover:bg-[#F5F3ED]/40 transition-colors">
                <td className="p-3.5 font-sans font-bold text-[#202B3C]">{loc.name}</td>
                <td className="p-3.5 font-sans text-[#69717B]">{loc.zone}</td>
                <td className="p-3.5 font-bold text-[#202B3C]">₹{loc.avgPriceSqFt.toLocaleString('en-IN')}</td>
                <td className="p-3.5 text-[#202B3C]">{loc.transactionVolumeQuarter} units</td>
                <td className="p-3.5 text-[#547568] font-bold">{loc.grossRentalYield}%</td>
                <td className="p-3.5 text-[#547568]">+{loc.historicalGrowth1Yr}%</td>
                <td className="p-3.5 text-[#202B3C]">{loc.reraRegisteredShare}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
