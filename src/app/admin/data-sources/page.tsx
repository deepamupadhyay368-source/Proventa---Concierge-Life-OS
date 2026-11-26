'use client';

import { useState, useEffect } from 'react';
import { Database, Plus, CheckCircle2, ShieldCheck, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';

export default function AdminDataSourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    officialDomain: '',
    sourceCategory: 'REGULATORY_AUTHORITY',
    accessMethod: 'STATUTORY_PUBLIC_INSPECTION',
    permissionStatus: 'PUBLIC_STATUTORY_DISCLOSURE',
    provenanceUrl: '',
    reliabilityScore: '0.95',
  });

  useEffect(() => {
    fetchSources();
  }, []);

  async function fetchSources() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/research/sources');
      const json = await res.json();
      if (json.success) {
        setSources(json.sources || []);
      } else {
        setError(json.error || 'Failed to fetch sources');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSource(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/research/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        setFormData({
          code: '',
          name: '',
          officialDomain: '',
          sourceCategory: 'REGULATORY_AUTHORITY',
          accessMethod: 'STATUTORY_PUBLIC_INSPECTION',
          permissionStatus: 'PUBLIC_STATUTORY_DISCLOSURE',
          provenanceUrl: '',
          reliabilityScore: '0.95',
        });
        fetchSources();
      } else {
        alert(json.error || 'Failed to register source');
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C8C4BA] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            Official Source Registry & Discovery
          </span>
          <h1 className="font-editorial text-2xl font-bold text-[#202B3C]">
            Statutory Data Sources & Feeds
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-[#202B3C] text-white hover:bg-[#547568] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Register Official Source</span>
        </button>
      </div>

      {/* Source Health Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-3 bg-white border border-[#C8C4BA]">
          <span className="text-[10px] text-[#69717B] uppercase block">Total Registered Sources</span>
          <span className="text-xl font-bold text-[#202B3C]">{sources.length}</span>
        </div>
        <div className="p-3 bg-white border border-[#C8C4BA]">
          <span className="text-[10px] text-[#69717B] uppercase block">Health Status</span>
          <span className="text-base font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-4 h-4" /> 100% Operational
          </span>
        </div>
        <div className="p-3 bg-white border border-[#C8C4BA]">
          <span className="text-[10px] text-[#69717B] uppercase block">Primary Regulatory Feed</span>
          <span className="text-xs font-bold text-[#202B3C] mt-1 block">Gujarat RERA (GujRERA)</span>
        </div>
        <div className="p-3 bg-white border border-[#C8C4BA]">
          <span className="text-[10px] text-[#69717B] uppercase block">Planning Jurisdictions</span>
          <span className="text-xs font-bold text-[#202B3C] mt-1 block">AUDA (Ahd) & GUDA (Gnr)</span>
        </div>
      </div>

      {/* Sources Table */}
      <div className="bg-white border border-[#C8C4BA] overflow-x-auto shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-[#69717B]">
            Inspecting statutory source health...
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-800 text-xs font-mono">
            {error}
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C] font-mono">
                <th className="p-3.5 font-bold uppercase tracking-wider">Source Entity</th>
                <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Code</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Category</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Access Method</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Statutory Permission</th>
                <th className="p-3.5 font-bold uppercase tracking-wider font-mono">Reliability</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C8C4BA]/50 text-[11px] font-mono">
              {sources.map((s, idx) => (
                <tr key={idx} className="hover:bg-[#F5F3ED]/40 transition-colors">
                  <td className="p-3.5 font-sans font-bold text-[#202B3C]">
                    <div className="flex flex-col">
                      <span>{s.name}</span>
                      <a
                        href={s.domain.startsWith('http') ? s.domain : `https://${s.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#547568] hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span>{s.domain}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </td>
                  <td className="p-3.5 font-bold text-[#202B3C]">{s.code}</td>
                  <td className="p-3.5 font-sans text-[#69717B]">{s.category}</td>
                  <td className="p-3.5 font-sans text-[#202B3C]">{s.accessMethod}</td>
                  <td className="p-3.5 font-sans text-[#547568] font-semibold">{s.permissionStatus}</td>
                  <td className="p-3.5 font-bold text-[#202B3C] tabular-nums">
                    {(s.reliabilityScore * 100).toFixed(0)}%
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[10px]">
                      {s.healthStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-[#C8C4BA] max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="border-b border-[#C8C4BA] pb-3 flex justify-between items-center">
              <h3 className="font-editorial text-lg font-bold text-[#202B3C]">
                Register Discovered Official Source
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs font-mono text-[#69717B] hover:text-[#202B3C]"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleRegisterSource} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#69717B] text-[10px] uppercase font-bold mb-1">Source Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GUJRERA_OFFICIAL_API"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full p-2 border border-[#C8C4BA] bg-[#F5F3ED]/50"
                />
              </div>

              <div>
                <label className="block text-[#69717B] text-[10px] uppercase font-bold mb-1">Source Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gujarat RERA Portal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-[#C8C4BA] bg-[#F5F3ED]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#69717B] text-[10px] uppercase font-bold mb-1">Official Domain</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. gujrera.gujarat.gov.in"
                    value={formData.officialDomain}
                    onChange={(e) => setFormData({ ...formData, officialDomain: e.target.value })}
                    className="w-full p-2 border border-[#C8C4BA] bg-[#F5F3ED]/50"
                  />
                </div>
                <div>
                  <label className="block text-[#69717B] text-[10px] uppercase font-bold mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. RERA_REGULATORY"
                    value={formData.sourceCategory}
                    onChange={(e) => setFormData({ ...formData, sourceCategory: e.target.value })}
                    className="w-full p-2 border border-[#C8C4BA] bg-[#F5F3ED]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#69717B] text-[10px] uppercase font-bold mb-1">Access Method</label>
                <input
                  type="text"
                  placeholder="e.g. STATUTORY_PUBLIC_PORTAL_EXTRACTION"
                  value={formData.accessMethod}
                  onChange={(e) => setFormData({ ...formData, accessMethod: e.target.value })}
                  className="w-full p-2 border border-[#C8C4BA] bg-[#F5F3ED]/50"
                />
              </div>

              <div>
                <label className="block text-[#69717B] text-[10px] uppercase font-bold mb-1">Permission Status</label>
                <input
                  type="text"
                  placeholder="e.g. PUBLIC_STATUTORY_DISCLOSURE_RERA_ACT"
                  value={formData.permissionStatus}
                  onChange={(e) => setFormData({ ...formData, permissionStatus: e.target.value })}
                  className="w-full p-2 border border-[#C8C4BA] bg-[#F5F3ED]/50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#C8C4BA]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-[#C8C4BA] text-[#69717B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#202B3C] text-white font-bold hover:bg-[#547568]"
                >
                  Register Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
