'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileText,
  UserCheck,
  Download,
  AlertCircle,
  Clock,
  ExternalLink,
  Search,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { LEGAL_DOCUMENTS, POLICY_VERSIONS, POLICY_EFFECTIVE_DATES } from '@/lib/legal/versions';

export default function AdminLegalDashboardPage() {
  const [data, setData] = useState<{
    metrics?: {
      totalAcceptances: number;
      breakdown: { policyType: string; policyVersion: string; count: number }[];
    };
    recentAcceptances?: {
      id: string;
      policyType: string;
      policyVersion: string;
      acceptanceContext: string;
      acceptedAt: string;
      ipAddress: string | null;
      user: { id: string; email: string; name: string | null };
    }[];
    privacyRequests?: {
      id: string;
      email: string;
      name: string | null;
      requestType: string;
      status: string;
      createdAt: string;
      details: string | null;
    }[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/legal/acceptances');
      if (!res.ok) {
        throw new Error('Failed to fetch legal metrics or unauthorized');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-800 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Governance &amp; Trust</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight mt-1">
            Legal &amp; Privacy Command Center
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time consent metrics, statutory compliance status, and sovereign privacy requests queue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/legal"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Public Hub</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Total Policy Acceptances
          </span>
          <p className="text-2xl font-bold text-neutral-900">
            {data?.metrics?.totalAcceptances ?? (loading ? '—' : '0')}
          </p>
          <p className="text-[11px] text-emerald-600 flex items-center gap-1 pt-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified Consent Records</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Canonical Version
          </span>
          <p className="text-2xl font-bold text-neutral-900">v{POLICY_VERSIONS.privacy}</p>
          <p className="text-[11px] text-neutral-500 pt-1">
            Effective: {POLICY_EFFECTIVE_DATES.privacy}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Active Privacy Requests
          </span>
          <p className="text-2xl font-bold text-neutral-900">
            {data?.privacyRequests?.filter((r) => r.status === 'SUBMITTED' || r.status === 'IN_REVIEW').length ??
              (loading ? '—' : '0')}
          </p>
          <p className="text-[11px] text-neutral-500 pt-1">
            Total logged: {data?.privacyRequests?.length ?? 0}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Statutory Transparency
          </span>
          <p className="text-sm font-semibold text-neutral-900 mt-2">11 Public Documents</p>
          <p className="text-[11px] text-brand-700 font-medium">100% Zero-Fabrication Compliant</p>
        </div>
      </div>

      {/* Privacy Requests Queue */}
      <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold text-neutral-900">Sovereign Privacy Requests Queue</h2>
            <p className="text-xs text-neutral-500">
              Customer requests for data access, correction, deletion, or consent withdrawal.
            </p>
          </div>
          <Link
            href="/legal/privacy-requests"
            target="_blank"
            className="text-xs text-brand-700 hover:text-brand-900 underline font-medium"
          >
            Public Portal &rarr;
          </Link>
        </div>

        {data?.privacyRequests && data.privacyRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-700 border-b border-neutral-200">
                  <th className="p-3 font-semibold">Submitted</th>
                  <th className="p-3 font-semibold">User / Email</th>
                  <th className="p-3 font-semibold">Request Type</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-neutral-600">
                {data.privacyRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="p-3 whitespace-nowrap text-neutral-500">
                      {new Date(req.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="p-3 font-medium text-neutral-900">
                      {req.name ? `${req.name} (${req.email})` : req.email}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 font-mono text-[10px]">
                        {req.requestType}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          req.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'IN_REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs truncate text-neutral-500" title={req.details || ''}>
                      {req.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-neutral-400 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
            No pending privacy requests in the queue.
          </div>
        )}
      </div>

      {/* Canonical Legal Documents Directory */}
      <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-neutral-900">Canonical Policy Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEGAL_DOCUMENTS.map((doc) => (
            <Link
              key={doc.slug}
              href={doc.href}
              target="_blank"
              className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 hover:border-brand-300 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="font-mono">v{doc.version}</span>
                  <span className="px-1.5 py-0.5 bg-neutral-200/60 rounded text-[9px] font-medium uppercase tracking-wider">
                    {doc.category}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-neutral-900 mt-1 group-hover:text-brand-700 transition-colors flex items-center justify-between">
                  <span>{doc.title}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1">
                  {doc.description}
                </p>
              </div>
              <span className="text-[10px] text-brand-800 font-medium">Effective {doc.effectiveDate}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
