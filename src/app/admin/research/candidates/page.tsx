'use client';

import { useState, useEffect } from 'react';
import {
  FileSearch,
  CheckCircle2,
  XCircle,
  GitMerge,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('PENDING_REVIEW');
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, [activeTab]);

  async function fetchCandidates() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/research/candidates?status=${activeTab}`);
      const json = await res.json();
      if (json.success) {
        setCandidates(json.data);
        setStatusCounts(json.statusCounts || {});
      } else {
        setError(json.error || 'Failed to fetch candidate queue');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(candidateId: string, decision: 'APPROVED_NEW' | 'MERGED_EXISTING' | 'REJECTED') {
    try {
      setActionLoading(candidateId);
      const res = await fetch('/api/admin/research/candidates/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, decision }),
      });
      const json = await res.json();
      if (json.success) {
        fetchCandidates();
      } else {
        alert(json.error || 'Action failed');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C8C4BA] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            Service 1 & 4 • Project Discovery & Duplicate Detection
          </span>
          <h1 className="font-editorial text-2xl font-bold text-[#202B3C]">
            Discovered Project Candidate Queue
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#C8C4BA] gap-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab('PENDING_REVIEW')}
          className={`px-4 py-2 font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'PENDING_REVIEW'
              ? 'border-[#202B3C] text-[#202B3C] bg-white'
              : 'border-transparent text-[#69717B] hover:text-[#202B3C]'
          }`}
        >
          Pending Review ({statusCounts['PENDING_REVIEW'] || 0})
        </button>
        <button
          onClick={() => setActiveTab('MERGED_EXISTING')}
          className={`px-4 py-2 font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'MERGED_EXISTING'
              ? 'border-[#202B3C] text-[#202B3C] bg-white'
              : 'border-transparent text-[#69717B] hover:text-[#202B3C]'
          }`}
        >
          Duplicates Filtered ({statusCounts['MERGED_EXISTING'] || 0})
        </button>
        <button
          onClick={() => setActiveTab('APPROVED_NEW')}
          className={`px-4 py-2 font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'APPROVED_NEW'
              ? 'border-[#202B3C] text-[#202B3C] bg-white'
              : 'border-transparent text-[#69717B] hover:text-[#202B3C]'
          }`}
        >
          Approved ({statusCounts['APPROVED_NEW'] || 0})
        </button>
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'ALL'
              ? 'border-[#202B3C] text-[#202B3C] bg-white'
              : 'border-transparent text-[#69717B] hover:text-[#202B3C]'
          }`}
        >
          All Records
        </button>
      </div>

      {/* Candidate List */}
      <div className="bg-white border border-[#C8C4BA] overflow-x-auto shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-[#69717B]">
            Querying discovery candidate records...
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-800 text-xs font-mono">
            {error}
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-[#69717B]">
            No candidate projects in this review state.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C] font-mono">
                <th className="p-3.5 font-bold uppercase tracking-wider">Candidate Name</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Developer</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Locality</th>
                <th className="p-3.5 font-bold uppercase tracking-wider font-mono">RERA Number</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Duplicate Match Analysis</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Status</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C8C4BA]/50">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-[#F5F3ED]/40 transition-colors">
                  <td className="p-3.5 font-bold text-[#202B3C]">
                    <div className="flex flex-col">
                      <span>{c.rawProjectName}</span>
                      <span className="text-[10px] text-[#69717B] font-mono">Ref: {c.externalReferenceId || 'DIRECT_FEED'}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-[#69717B]">{c.rawDeveloperName || 'Unspecified'}</td>
                  <td className="p-3.5 text-[#202B3C]">
                    {c.rawLocalityName}, {c.rawDistrictName}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-[#202B3C] select-all font-semibold">
                    {c.rawReraNumber || 'Under Registration'}
                  </td>
                  <td className="p-3.5 text-[11px] font-mono">
                    {c.matchedProject ? (
                      <div className="space-y-0.5">
                        <span className="text-amber-800 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          Matched: {c.matchedProject.name}
                        </span>
                        <span className="text-[#69717B] text-[10px] block">
                          Confidence: {(c.matchConfidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-emerald-800 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 shrink-0" /> Unique Project
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 font-mono">
                    <span
                      className={`px-2 py-0.5 border text-[10px] font-bold ${
                        c.reviewStatus === 'MERGED_EXISTING'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : c.reviewStatus === 'APPROVED_NEW'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-blue-50 text-blue-800 border-blue-300'
                      }`}
                    >
                      {c.reviewStatus}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono">
                    {c.reviewStatus === 'PENDING_REVIEW' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAction(c.id, 'APPROVED_NEW')}
                          disabled={actionLoading === c.id}
                          className="px-2 py-1 bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] uppercase font-bold"
                        >
                          Approve New
                        </button>
                        {c.matchedProject && (
                          <button
                            onClick={() => handleAction(c.id, 'MERGED_EXISTING')}
                            disabled={actionLoading === c.id}
                            className="px-2 py-1 bg-amber-800 hover:bg-amber-900 text-white text-[10px] uppercase font-bold"
                          >
                            Confirm Duplicate
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(c.id, 'REJECTED')}
                          disabled={actionLoading === c.id}
                          className="px-2 py-1 bg-rose-800 hover:bg-rose-900 text-white text-[10px] uppercase font-bold"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#69717B]">Reviewed</span>
                    )}
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
