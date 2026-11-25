'use client';

import { FileText, Plus, Download } from 'lucide-react';

export default function AdminReportsPage() {
  const publishedReports = [
    { title: 'Ahmedabad Residential Market Intelligence: Q3 2026', quarter: 'Q3 2026', downloads: 342, status: 'PUBLISHED' },
    { title: 'GIFT City & Environs Capital Inflow Brief 2026', quarter: 'Q3 2026', downloads: 184, status: 'PUBLISHED' },
    { title: 'SG Highway Micro-Market Dossier', quarter: 'Q2 2026', downloads: 512, status: 'ARCHIVED' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#C8C4BA] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            Editorial Desk
          </span>
          <h1 className="font-display text-2xl font-bold text-[#202B3C]">
            Published Research Dossiers
          </h1>
        </div>

        <button
          onClick={() => alert('Publish new quarterly report modal.')}
          className="px-3.5 py-2 bg-[#202B3C] text-white text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Publish New Dossier</span>
        </button>
      </div>

      <div className="bg-white border border-[#C8C4BA] overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C]">
              <th className="p-3.5 font-bold uppercase tracking-wider">Report Publication</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Quarter</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Member Downloads</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C8C4BA]/50">
            {publishedReports.map((r, idx) => (
              <tr key={idx} className="hover:bg-[#F5F3ED]/40 transition-colors">
                <td className="p-3.5 font-bold text-[#202B3C]">{r.title}</td>
                <td className="p-3.5 font-mono text-[#69717B]">{r.quarter}</td>
                <td className="p-3.5 font-mono font-bold text-[#547568]">{r.downloads}</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold">
                    {r.status}
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
