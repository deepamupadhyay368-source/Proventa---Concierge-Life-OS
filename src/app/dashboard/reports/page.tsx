'use client';

import Link from 'next/link';
import { FileText, Download, Calendar, ArrowUpRight } from 'lucide-react';

export default function SavedReportsPage() {
  const reports = [
    {
      id: 'rep-q3-ahmedabad',
      title: 'Ahmedabad Residential Market Intelligence: Q3 2026',
      date: '15-Oct-2026',
      category: 'Market Digest',
      size: '4.8 MB',
    },
    {
      id: 'rep-val-shela',
      title: 'Valuation Dossier: Shilp Revanta Flat 1102 (Shela)',
      date: '10-Oct-2026',
      category: 'Algorithmic Valuation',
      size: '1.4 MB',
    },
    {
      id: 'rep-gift-city',
      title: 'GIFT City & Environs Capital Inflow Brief 2026',
      date: '28-Sep-2026',
      category: 'Special Report',
      size: '3.2 MB',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C8C4BA] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            Research Library
          </span>
          <h1 className="font-display text-2xl font-bold text-[#202B3C]">
            Saved & Generated Intelligence Reports
          </h1>
        </div>

        <Link
          href="/reports"
          className="px-3.5 py-2 bg-[#202B3C] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#202B3C]/90 shadow-xs"
        >
          <span>Browse Research Desk</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="bg-white border border-[#C8C4BA] divide-y divide-[#C8C4BA]/50">
        {reports.map((rep) => (
          <div key={rep.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F5F3ED]/40 transition-colors">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-[#547568] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display text-sm font-bold text-[#202B3C]">{rep.title}</h3>
                <div className="flex items-center gap-3 text-[11px] font-mono text-[#69717B] mt-0.5">
                  <span className="px-1.5 py-0.2 bg-[#F5F3ED] border border-[#C8C4BA]">{rep.category}</span>
                  <span>{rep.date}</span>
                  <span>{rep.size}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert(`Downloading verified report copy: ${rep.title}`)}
              className="px-3 py-1.5 bg-[#202B3C] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#202B3C]/90 self-start sm:self-center"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
