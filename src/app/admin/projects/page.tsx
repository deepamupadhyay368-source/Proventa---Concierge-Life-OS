'use client';

import { Building, Plus, CheckCircle2 } from 'lucide-react';
import { CANONICAL_PROJECTS } from '@/lib/real-estate/constants';

export default function AdminProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#C8C4BA] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            RERA Registry
          </span>
          <h1 className="font-display text-2xl font-bold text-[#202B3C]">
            Verified Real Estate Projects
          </h1>
        </div>

        <button
          onClick={() => alert('Add Project RERA ingestion modal.')}
          className="px-3.5 py-2 bg-[#202B3C] text-white text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      <div className="bg-white border border-[#C8C4BA] overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C]">
              <th className="p-3.5 font-bold uppercase tracking-wider">Project Name</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Developer</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Locality</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Gujarat RERA Number</th>
              <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Carpet Range</th>
              <th className="p-3.5 font-bold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C8C4BA]/50">
            {CANONICAL_PROJECTS.map((p) => (
              <tr key={p.id} className="hover:bg-[#F5F3ED]/40 transition-colors">
                <td className="p-3.5 font-bold text-[#202B3C]">{p.name}</td>
                <td className="p-3.5 text-[#69717B]">{p.developer}</td>
                <td className="p-3.5 text-[#69717B]">{p.localityName}</td>
                <td className="p-3.5 font-mono text-[11px] text-[#202B3C]">{p.reraRegistrationNumber}</td>
                <td className="p-3.5 font-mono text-[#202B3C]">{p.carpetAreaRange.min} – {p.carpetAreaRange.max} sq ft</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold">
                    {p.verifiedDataStatus}
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
