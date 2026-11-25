'use client';

import { FileBarChart, Download, Plus, ArrowUpRight } from 'lucide-react';

export default function ProfessionalReportsPage() {
  const reports = [
    { id: 'prep-01', client: 'Aashna Shah Family Trust', title: 'Comprehensive Portfolio Valuation Audit', date: '08-Oct-2026', format: 'Institutional White-Label PDF', pages: 28 },
    { id: 'prep-02', client: 'Dr. Vikram Patel & Family', title: 'Bodakdev Resale Arbitrage Assessment', date: '01-Oct-2026', format: 'White-Label PDF', pages: 18 },
    { id: 'prep-03', client: 'Internal Advisory Desk', title: 'GIFT City Dual-Regime Residential Yields', date: '25-Sep-2026', format: 'Excel Data Matrix + PDF', pages: 42 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C8C4BA] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            Institutional Dossiers
          </span>
          <h1 className="font-display text-2xl font-bold text-[#202B3C]">
            Client Valuation & Advisory Reports
          </h1>
        </div>

        <button
          onClick={() => alert('New client advisory dossier generator triggered.')}
          className="px-3.5 py-2 bg-[#202B3C] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#202B3C]/90 shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Generate Client Dossier</span>
        </button>
      </div>

      <div className="bg-white border border-[#C8C4BA] divide-y divide-[#C8C4BA]/50">
        {reports.map((r) => (
          <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F5F3ED]/40 transition-colors">
            <div className="flex items-start gap-3">
              <FileBarChart className="h-5 w-5 text-[#547568] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-mono font-bold text-[#547568] uppercase">{r.client}</p>
                <h3 className="font-display text-base font-bold text-[#202B3C]">{r.title}</h3>
                <p className="text-[11px] font-mono text-[#69717B] mt-0.5">{r.format} • {r.pages} pages • {r.date}</p>
              </div>
            </div>

            <button
              onClick={() => alert(`Downloading institutional dossier: ${r.title}`)}
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
