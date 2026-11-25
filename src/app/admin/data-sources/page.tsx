'use client';

import { Database, Plus, CheckCircle2 } from 'lucide-react';

export default function AdminDataSourcesPage() {
  const sources = [
    {
      name: 'Gujarat Revenue Dept. Sub-Registrar Portal (Garvi)',
      type: 'STATUTORY_DEED_REGISTRY',
      reference: 'GARVI-GUJ-REV-API-2026',
      collectionDate: '01-Oct-2026',
      observationDate: 'Q3 2026',
      verificationStatus: 'VERIFIED',
      licenceStatus: 'AUTHORIZED_RESEARCH_INDEX',
      dataFreshness: 'Quarterly',
      lastReviewed: '15-Oct-2026',
    },
    {
      name: 'Gujarat Real Estate Regulatory Authority (GujRERA)',
      type: 'REGULATORY_PROJECT_FILING',
      reference: 'GUJRERA-QPR-PORTAL',
      collectionDate: '10-Oct-2026',
      observationDate: 'Q3 2026',
      verificationStatus: 'VERIFIED',
      licenceStatus: 'PUBLIC_REGULATORY_DISCLOSURE',
      dataFreshness: 'Quarterly',
      lastReviewed: '16-Oct-2026',
    },
    {
      name: 'Ahmedabad Urban Development Authority (AUDA)',
      type: 'TOWN_PLANNING_MAPS',
      reference: 'AUDA-DP-2021-SANCTION',
      collectionDate: '05-Sep-2026',
      observationDate: 'Annual',
      verificationStatus: 'VERIFIED',
      licenceStatus: 'OFFICIAL_MUNICIPAL_SCHEME',
      dataFreshness: 'Bi-Annual',
      lastReviewed: '20-Sep-2026',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#C8C4BA] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            Data Governance
          </span>
          <h1 className="font-display text-2xl font-bold text-[#202B3C]">
            Data Sources & Ingestion Channels
          </h1>
        </div>

        <button
          onClick={() => alert('New data source channel integration.')}
          className="px-3.5 py-2 bg-[#202B3C] text-white text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Register Source Feed</span>
        </button>
      </div>

      <div className="bg-white border border-[#C8C4BA] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C]">
              <th className="p-3.5 font-bold uppercase tracking-wider">Source Entity</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Reference Code</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Type</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Freshness</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Licence Status</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Last Reviewed</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C8C4BA]/50 font-mono text-[11px]">
            {sources.map((s, idx) => (
              <tr key={idx} className="hover:bg-[#F5F3ED]/40 transition-colors">
                <td className="p-3.5 font-sans font-bold text-[#202B3C]">{s.name}</td>
                <td className="p-3.5 text-[#202B3C]">{s.reference}</td>
                <td className="p-3.5 font-sans text-[#69717B]">{s.type}</td>
                <td className="p-3.5 text-[#202B3C]">{s.dataFreshness}</td>
                <td className="p-3.5 font-sans text-[#547568]">{s.licenceStatus}</td>
                <td className="p-3.5 text-[#69717B]">{s.lastReviewed}</td>
                <td className="p-3.5 font-sans">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono font-bold text-[10px]">
                    {s.verificationStatus}
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
