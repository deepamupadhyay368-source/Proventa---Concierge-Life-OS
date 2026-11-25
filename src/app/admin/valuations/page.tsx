'use client';

import { Activity, Sliders, CheckCircle2 } from 'lucide-react';

export default function AdminValuationsPage() {
  const modelParameters = [
    { param: 'Base Annual Structural Depreciation', value: '-1.50% / year', baseline: 'Gujarat Concrete Frame Standard' },
    { param: 'High-Floor Premium (Floors 10+)', value: '+0.50% / floor', baseline: 'AUDA High-Rise Residential' },
    { param: 'Reserved Covered Parking Credit', value: '+₹2,50,000 / slot', baseline: 'Western Ahmedabad Standard' },
    { param: 'Furnishing Multiplier (Fully Furnished)', value: '+8.0% of base', baseline: 'Modular kitchen + woodwork' },
    { param: 'Club Amenities Multiplier (Grade A)', value: '+6.0% of base', baseline: 'Pool, gym, sports courts' },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[#C8C4BA] pb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
          Model Calibration
        </span>
        <h1 className="font-display text-2xl font-bold text-[#202B3C]">
          Hedonic Valuation Engine Parameters
        </h1>
        <p className="text-xs text-[#69717B] mt-1">
          Review algorithmic weights used to derive property valuation ranges from registered base comps.
        </p>
      </div>

      <div className="bg-white border border-[#C8C4BA] overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C]">
              <th className="p-3.5 font-bold uppercase tracking-wider">Parameter Variable</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Calibrated Multiplier</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Audit Baseline</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Calibration Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C8C4BA]/50">
            {modelParameters.map((p, idx) => (
              <tr key={idx} className="hover:bg-[#F5F3ED]/40 transition-colors">
                <td className="p-3.5 font-bold text-[#202B3C]">{p.param}</td>
                <td className="p-3.5 font-mono text-[#547568] font-bold">{p.value}</td>
                <td className="p-3.5 text-[#69717B]">{p.baseline}</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold">
                    ACTIVE_IN_PRODUCTION
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
