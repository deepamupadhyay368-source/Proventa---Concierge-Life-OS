'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Lock,
  ArrowLeft,
  Loader2,
  Check,
  Layers,
  Database,
} from 'lucide-react';

export default function AdminDataResetPage() {
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmInput, setConfirmInput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const loadPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/system/data-reset');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load preview');
      } else {
        setPreview(data.preview);
      }
    } catch {
      setError('Network error fetching reset preview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreview();
  }, []);

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmInput !== 'RESET PRIVATE BETA DATA') {
      setError('You must type exactly "RESET PRIVATE BETA DATA" to confirm.');
      return;
    }

    setExecuting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/system/data-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationText: confirmInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Execution failed');
      } else {
        setResult(data);
        await loadPreview();
      }
    } catch {
      setError('Network error executing reset');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/overview"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors mb-2 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Control Center</span>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <span>Operational Data Reset</span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                Founder Only
              </span>
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Purge stale development, simulation, and automated smoke test records while preserving all protected infrastructure.
            </p>
          </div>
          <button
            onClick={loadPreview}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Preview</span>
          </button>
        </div>
      </div>

      {result && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-900">
          <div className="flex items-center gap-2 font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{result.message}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/60 font-mono text-[11px]">
            <div>Tasks Deleted: {result.deletedSummary?.tasks}</div>
            <div>Events Deleted: {result.deletedSummary?.taskEvents}</div>
            <div>Test Users Deleted: {result.deletedSummary?.testUsers}</div>
            <div>Bookings Deleted: {result.deletedSummary?.bookings}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identified for Deletion */}
        <div className="bg-white border border-rose-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
              <Trash2 className="h-4 w-4" />
              <span>STALE TEST DATA TO BE REMOVED</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-600">
              Zero Customer Impact
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-neutral-400">Calculating preview...</div>
          ) : (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-600">Test Operational Tasks</span>
                <span className="font-mono font-bold text-neutral-900">{preview?.testTasksCount || 0}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-600">Task Timeline & Trace Events</span>
                <span className="font-mono font-bold text-neutral-900">{preview?.testTaskEventsCount || 0}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-600">Agent Run Records</span>
                <span className="font-mono font-bold text-neutral-900">{preview?.testAgentRunsCount || 0}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-600">Synthetic Bookings</span>
                <span className="font-mono font-bold text-neutral-900">{preview?.testBookingsCount || 0}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-600">Sandbox Test Payments</span>
                <span className="font-mono font-bold text-neutral-900">{preview?.testPaymentsCount || 0}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-neutral-600">Automated Test Customer Accounts</span>
                <span className="font-mono font-bold text-neutral-900">{preview?.testUsersCount || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Protected Infrastructure */}
        <div className="bg-white border border-emerald-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <ShieldCheck className="h-4 w-4" />
              <span>PROTECTED CORE INFRASTRUCTURE</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
              100% Preserved
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-neutral-400">Loading protected items...</div>
          ) : (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-600">Founder & Admin Accounts</span>
                <span className="font-mono font-bold text-emerald-700">✓ {preview?.preservedAdminsCount || 0} Preserved</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-600">Concierge Employee Profiles</span>
                <span className="font-mono font-bold text-emerald-700">✓ {preview?.preservedEmployeesCount || 0} Preserved</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-600">Wave 1 Private Beta Invitations</span>
                <span className="font-mono font-bold text-emerald-700">✓ {preview?.preservedInvitationsCount || 0} Preserved</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-600">Service Categories & City Hubs</span>
                <span className="font-mono font-bold text-emerald-700">✓ {preview?.preservedCategoriesCount || 0} Categories</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-600">Curated Provider Network</span>
                <span className="font-mono font-bold text-emerald-700">✓ {preview?.preservedProvidersCount || 0} Providers</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-neutral-600">System Settings & Feature Flags</span>
                <span className="font-mono font-bold text-emerald-700">✓ {preview?.preservedSettingsCount || 0} Settings</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation & Execution Section */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
            <Lock className="h-4 w-4" />
            <span>Explicit Founder Authorization Gate</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            To prevent accidental data loss, executing this operational data reset requires typing the exact phrase below.
          </p>
        </div>

        <form onSubmit={handleExecute} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-neutral-400 mb-1.5">
              Type <span className="text-white font-bold select-all">RESET PRIVATE BETA DATA</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="RESET PRIVATE BETA DATA"
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-neutral-400">
              Audit log will record this action with actor ID and timestamp.
            </span>
            <button
              type="submit"
              disabled={executing || confirmInput !== 'RESET PRIVATE BETA DATA'}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
            >
              {executing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Executing Reset...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Execute Production Operational Reset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
