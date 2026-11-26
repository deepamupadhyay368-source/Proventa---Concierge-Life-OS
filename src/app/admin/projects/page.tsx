'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Plus, ExternalLink, RefreshCw, CheckCircle2, Search, Filter } from 'lucide-react';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState<'ALL' | 'Ahmedabad' | 'Gandhinagar'>('ALL');
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepMessage, setSweepMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      const json = await res.json();
      if (json.success) {
        setProjects(json.data);
      } else {
        setError(json.error || 'Failed to fetch projects');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function triggerMonitoringSweep() {
    try {
      setIsSweeping(true);
      setSweepMessage(null);
      const res = await fetch('/api/admin/research/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RUN_MONITORING_SWEEP' }),
      });
      const json = await res.json();
      if (json.success) {
        setSweepMessage(`Monitoring sweep completed: ${json.data.totalMonitored} projects verified current.`);
        fetchProjects();
      } else {
        alert(json.error || 'Failed to trigger sweep');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSweeping(false);
    }
  }

  const filtered = projects.filter((p) => {
    if (districtFilter !== 'ALL' && p.district !== districtFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchDev = p.developer?.toLowerCase().includes(q);
      const matchRera = p.reraNumber?.toLowerCase().includes(q);
      const matchLoc = p.locality?.name?.toLowerCase().includes(q);
      if (!matchName && !matchDev && !matchRera && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C8C4BA] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            Service 3 • Project Information Registry
          </span>
          <h1 className="font-editorial text-2xl font-bold text-[#202B3C]">
            Verified Residential Project Dossiers
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerMonitoringSweep}
            disabled={isSweeping}
            className="px-3.5 py-2 bg-[#F5F3ED] border border-[#C8C4BA] text-[#202B3C] hover:bg-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSweeping ? 'animate-spin text-[#547568]' : ''}`} />
            <span>{isSweeping ? 'Monitoring Sweep Active...' : 'Run Continuous Monitoring Sweep'}</span>
          </button>
        </div>
      </div>

      {sweepMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{sweepMessage}</span>
        </div>
      )}

      {/* Control bar */}
      <div className="bg-white border border-[#C8C4BA] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-[#69717B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search verified projects by name, RERA, developer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F5F3ED]/50 border border-[#C8C4BA] text-xs text-[#202B3C] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <button
            onClick={() => setDistrictFilter('ALL')}
            className={`px-3 py-1 text-[11px] font-semibold border ${
              districtFilter === 'ALL' ? 'bg-[#202B3C] text-white border-[#202B3C]' : 'border-[#C8C4BA] text-[#69717B]'
            }`}
          >
            All Markets ({projects.length})
          </button>
          <button
            onClick={() => setDistrictFilter('Ahmedabad')}
            className={`px-3 py-1 text-[11px] font-semibold border ${
              districtFilter === 'Ahmedabad' ? 'bg-[#202B3C] text-white border-[#202B3C]' : 'border-[#C8C4BA] text-[#69717B]'
            }`}
          >
            Ahmedabad ({projects.filter((p) => p.district === 'Ahmedabad').length})
          </button>
          <button
            onClick={() => setDistrictFilter('Gandhinagar')}
            className={`px-3 py-1 text-[11px] font-semibold border ${
              districtFilter === 'Gandhinagar' ? 'bg-[#202B3C] text-white border-[#202B3C]' : 'border-[#C8C4BA] text-[#69717B]'
            }`}
          >
            Gandhinagar ({projects.filter((p) => p.district === 'Gandhinagar').length})
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white border border-[#C8C4BA] overflow-x-auto shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-[#69717B]">
            Loading verified projects...
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-800 text-xs font-mono">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-[#69717B]">
            No projects matched your criteria.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C] font-mono">
                <th className="p-3.5 font-bold uppercase tracking-wider">Project Name</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Developer</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Locality & District</th>
                <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Gujarat RERA Number</th>
                <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Carpet Range</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Scale</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Verification</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C8C4BA]/50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#F5F3ED]/40 transition-colors">
                  <td className="p-3.5 font-bold text-[#202B3C]">
                    <div className="flex flex-col">
                      <span>{p.name}</span>
                      <span className="text-[10px] text-[#69717B] font-mono">{p.possessionStatus}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-[#69717B]">{p.developer || 'Independent'}</td>
                  <td className="p-3.5 text-[#202B3C]">
                    <span className="font-semibold">{p.locality?.name}</span>, {p.district}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-[#202B3C] select-all font-semibold">
                    {p.reraNumber}
                  </td>
                  <td className="p-3.5 font-mono text-[#202B3C] tabular-nums">
                    {p.carpetAreaRangeMin} – {p.carpetAreaRangeMax} sq ft
                  </td>
                  <td className="p-3.5 font-mono text-[#69717B]">
                    {p.totalTowers}T / {p.totalUnits}U
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold">
                      {p.verificationBadge}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      href={`/project-intelligence/${p.slug}`}
                      target="_blank"
                      className="px-2.5 py-1 bg-[#202B3C] hover:bg-[#547568] text-white text-[10px] font-mono uppercase tracking-wider font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Public</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
