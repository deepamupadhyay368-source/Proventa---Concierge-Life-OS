'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Download,
  FileText,
  Lock,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { AHMEDABAD_GANDHINAGAR_LOCALITIES } from '@/lib/real-estate-intelligence/market-engine';

interface PersistedReport {
  id: string;
  reportReference: string;
  reportType: string;
  subjectTitle: string;
  geography: string;
  confidenceLevel: string;
  dataSources: string[];
  sha256Checksum: string;
  pageCount: number;
  createdAt: string;
  downloadUrl: string;
}

const REPORT_TYPES = [
  { value: 'LOCALITY_INTELLIGENCE', label: 'Locality Intelligence Report (PDF)' },
  { value: 'MARKET_COMPARISON', label: 'Market Comparison Report (PDF)' },
  { value: 'PROPERTY_VALUATION', label: 'Indicative Property Valuation Report (PDF)' },
  { value: 'PORTFOLIO_PERFORMANCE', label: 'Private Portfolio Performance Report (PDF)' },
  { value: 'PROPERTY_INTELLIGENCE', label: 'Living Registry Property Report (PDF)' },
  { value: 'PROJECT_INTELLIGENCE', label: 'RERA Project Intelligence Report (PDF)' },
] as const;

export default function ReportsPage() {
  const [reports, setReports] = useState<PersistedReport[]>([]);
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [reportType, setReportType] = useState<string>('LOCALITY_INTELLIGENCE');
  const [locality, setLocality] = useState('Bopal');
  const [localityB, setLocalityB] = useState('GIFT City');
  const [propertyId, setPropertyId] = useState('');
  const [projectSlug, setProjectSlug] = useState('');
  const [carpetAreaSqFt, setCarpetAreaSqFt] = useState('1450');

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/real-estate/reports');
      if (res.status === 401) {
        setUnauthenticated(true);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setUnauthenticated(false);
        setReports(data.reports || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  async function handleGeneratePdf(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setFeedback(null);
    try {
      const payload: Record<string, unknown> = {
        reportType,
        segment: 'RESIDENTIAL',
      };
      if (reportType === 'LOCALITY_INTELLIGENCE' || reportType === 'PROPERTY_VALUATION') {
        payload.locality = locality;
      }
      if (reportType === 'PROPERTY_VALUATION') {
        payload.carpetAreaSqFt = Number(carpetAreaSqFt) || 1200;
      }
      if (reportType === 'MARKET_COMPARISON') {
        payload.localities = [locality, localityB];
      }
      if (reportType === 'PROPERTY_INTELLIGENCE') {
        payload.propertyId = propertyId.trim();
      }
      if (reportType === 'PROJECT_INTELLIGENCE') {
        payload.projectSlug = projectSlug.trim();
      }

      const res = await fetch('/api/real-estate/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'PDF report generation failed.' });
        return;
      }
      setFeedback({
        type: 'success',
        text: `Generated genuine ${data.pageCount}-page PDF (${data.reportReference}, SHA-256: ${data.sha256Checksum.slice(0, 12)}...).`,
      });
      loadReports();
    } catch {
      setFeedback({ type: 'error', text: 'Unexpected error generating PDF report.' });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="border-b border-slate-800 pb-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
            MODULE 07 // INSTITUTIONAL PDF INTELLIGENCE REPORTS
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Database-Backed PDF Report Center
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Generate genuine, SHA-256 checksummed PDF reports computed strictly server-side from verified PostgreSQL
            records. PROVENTA never publishes static demo reports or fabricated observation counts. For Investment
            Feasibility PDFs, use the{' '}
            <Link href="/investment-intelligence" className="text-emerald-400 underline underline-offset-4">
              Investment Intelligence Engine
            </Link>
            .
          </p>
        </div>

        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-200/90">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p>
            Every generated PDF carries server-verified source provenance, confidence status (including{' '}
            <span className="font-mono">INSUFFICIENT_DATA</span> when fewer than 3 sourced observations exist), and a
            mandatory non-certified statutory valuation disclaimer.
          </p>
        </div>

        {loading ? (
          <div className="mt-8 h-40 animate-pulse rounded-xl border border-slate-800 bg-slate-900/40" />
        ) : unauthenticated ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-10 text-center">
            <Lock className="mx-auto h-10 w-10 text-emerald-400" />
            <h2 className="mt-4 text-xl font-semibold text-white">Sign in to generate and download PDF reports</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              All PDF reports are owner-scoped, persisted in PostgreSQL, and protected against unauthorized cross-user
              downloads.
            </p>
            <Link
              href="/login?callbackUrl=/reports"
              className="mt-6 inline-block rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Sign In to Report Center
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            {/* Generator Form */}
            <form
              onSubmit={handleGeneratePdf}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-5"
            >
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Plus className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Generate New PDF Report</h2>
              </div>

              {feedback && (
                <div
                  className={`mt-4 rounded-lg border px-3.5 py-2.5 text-xs ${
                    feedback.type === 'success'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                      : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              <div className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="text-slate-400">Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  >
                    {REPORT_TYPES.map((rt) => (
                      <option key={rt.value} value={rt.value}>
                        {rt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {(reportType === 'LOCALITY_INTELLIGENCE' ||
                  reportType === 'PROPERTY_VALUATION' ||
                  reportType === 'MARKET_COMPARISON') && (
                  <div>
                    <label className="text-slate-400">Primary Locality</label>
                    <select
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    >
                      {AHMEDABAD_GANDHINAGAR_LOCALITIES.map((l) => (
                        <option key={l.slug} value={l.name}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {reportType === 'MARKET_COMPARISON' && (
                  <div>
                    <label className="text-slate-400">Comparison Locality</label>
                    <select
                      value={localityB}
                      onChange={(e) => setLocalityB(e.target.value)}
                      className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    >
                      {AHMEDABAD_GANDHINAGAR_LOCALITIES.map((l) => (
                        <option key={l.slug} value={l.name}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {reportType === 'PROPERTY_VALUATION' && (
                  <div>
                    <label className="text-slate-400">Carpet Area (sq ft)</label>
                    <input
                      type="number"
                      min={100}
                      value={carpetAreaSqFt}
                      onChange={(e) => setCarpetAreaSqFt(e.target.value)}
                      className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white"
                    />
                  </div>
                )}

                {reportType === 'PROPERTY_INTELLIGENCE' && (
                  <div>
                    <label className="text-slate-400">PROVENTA Property ID (PV-PROP-...)</label>
                    <input
                      required
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value)}
                      placeholder="PV-PROP-AHM-2026-XXXXXX"
                      className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white"
                    />
                  </div>
                )}

                {reportType === 'PROJECT_INTELLIGENCE' && (
                  <div>
                    <label className="text-slate-400">Project Slug</label>
                    <input
                      required
                      value={projectSlug}
                      onChange={(e) => setProjectSlug(e.target.value)}
                      placeholder="e.g. adani-shantigram-waterlily"
                      className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={generating}
                  className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  {generating ? 'Rendering PDF...' : 'Generate Server-Verified PDF'}
                </button>
              </div>
            </form>

            {/* Persisted Report Archive */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-7">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Your Persisted PDF Reports ({reports.length})
                </h2>
                <span className="font-mono text-[11px] text-slate-400">OWNER-ISOLATED</span>
              </div>

              {reports.length === 0 ? (
                <div className="mt-8 rounded-lg border border-dashed border-slate-800 p-8 text-center">
                  <FileText className="mx-auto h-8 w-8 text-slate-600" />
                  <p className="mt-2 text-sm text-slate-400">
                    No generated reports yet. Create a database-backed PDF report using the panel on the left.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {reports.map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-col justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-emerald-400">{r.reportReference}</span>
                          <span className="rounded border border-slate-700 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                            {r.confidenceLevel}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-white">{r.subjectTitle}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                          {r.pageCount} page(s) &middot; SHA-256: {r.sha256Checksum.slice(0, 14)}... &middot;{' '}
                          {new Date(r.createdAt).toISOString().split('T')[0]}
                        </p>
                      </div>
                      <a
                        href={r.downloadUrl}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download PDF
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
