'use client';

import { useState, useEffect } from 'react';
import { BuyerWorkspaceShell } from '@/components/procurement/BuyerWorkspaceShell';
import { ShieldAlert, Download, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LeakageDetectorPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function loadAlerts() {
    setLoading(true);
    try {
      const res = await fetch('/api/procurement/intelligence/leakage');
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  async function runScan() {
    setScanning(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/procurement/intelligence/leakage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceDeviationThresholdPct: 8 }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedback({ type: 'error', text: json.error || 'Leakage scan failed.' });
      } else {
        setFeedback({
          type: 'success',
          text: `Scan complete: analysed ${json.data.scannedOrders} POs and ${json.data.scannedInvoices} invoices (${json.data.newAlertsCreated} new alerts).`,
        });
        await loadAlerts();
      }
    } finally {
      setScanning(false);
    }
  }

  async function updateAlert(alertId: string, status: string) {
    const reason =
      status === 'DISMISSED'
        ? window.prompt('Enter mandatory audit reason for dismissing this alert:') || ''
        : window.prompt(`Optional resolution note for ${status}:`) || 'Reviewed by procurement auditor';
    if (status === 'DISMISSED' && !reason.trim()) return;

    const res = await fetch('/api/procurement/intelligence/leakage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alertId,
        status,
        resolutionNotes: status !== 'DISMISSED' ? reason : undefined,
        dismissalReason: status === 'DISMISSED' ? reason : undefined,
      }),
    });
    const json = await res.json();
    if (json.success) {
      setFeedback({ type: 'success', text: `Alert updated to ${status}.` });
      await loadAlerts();
    } else {
      setFeedback({ type: 'error', text: json.error || 'Could not update alert.' });
    }
  }

  const summary = data?.summary;
  const alerts = data?.alerts || [];

  return (
    <BuyerWorkspaceShell
      title="Procurement Leakage Detector"
      subtitle="Transparent, explainable anomaly auditing across purchase orders, invoices, GRNs, freight charges, and approval thresholds. Separates Potential Leakage, Confirmed Leakage, and Recovered Savings."
      actions={
        <>
          <a
            href="/api/procurement/intelligence/leakage?format=csv"
            className="px-3.5 py-2 bg-[#E9ECEF] hover:bg-[#DCE2E8] text-[#172B3A] text-xs font-semibold rounded-xs inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Audit</span>
          </a>
          <button
            type="button"
            onClick={runScan}
            disabled={scanning}
            className="px-4 py-2 bg-[#172B3A] hover:bg-[#292F3D] text-white text-xs font-semibold rounded-xs inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C9A45B] ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Scanning Records...' : 'Run Leakage Scan'}</span>
          </button>
        </>
      }
    >
      {feedback && (
        <div
          className={`p-3.5 border text-xs flex items-center gap-2 rounded-xs ${
            feedback.type === 'success'
              ? 'bg-[#0F6B50]/10 border-[#0F6B50] text-[#0F6B50]'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Three Strictly Separated Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
          <div className="text-[10px] font-mono uppercase text-[#4A5568]">Potential Leakage Exposure</div>
          <div className="text-2xl font-bold font-mono text-[#172B3A] mt-1 tabular-nums">
            {summary?.potentialExposureFormatted ?? '₹0.00'}
          </div>
          <div className="text-[11px] text-[#4A5568] mt-1">Estimated exposure requiring review</div>
        </div>
        <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
          <div className="text-[10px] font-mono uppercase text-red-700">Confirmed Leakage</div>
          <div className="text-2xl font-bold font-mono text-red-700 mt-1 tabular-nums">
            {summary?.confirmedLeakageFormatted ?? '₹0.00'}
          </div>
          <div className="text-[11px] text-[#4A5568] mt-1">Backed by verified investigation evidence</div>
        </div>
        <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
          <div className="text-[10px] font-mono uppercase text-[#0F6B50]">Verified Recovered Savings</div>
          <div className="text-2xl font-bold font-mono text-[#0F6B50] mt-1 tabular-nums">
            {summary?.recoveredSavingsFormatted ?? '₹0.00'}
          </div>
          <div className="text-[11px] text-[#4A5568] mt-1">Documented credit notes / recoveries</div>
        </div>
        <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
          <div className="text-[10px] font-mono uppercase text-[#4A5568]">Investigations (Open / Closed)</div>
          <div className="text-2xl font-bold font-mono text-[#172B3A] mt-1 tabular-nums">
            {summary ? `${summary.openInvestigations} / ${summary.resolvedCases}` : '0 / 0'}
          </div>
          <div className="text-[11px] text-[#4A5568] mt-1">Total alerts: {summary?.totalAlerts ?? 0}</div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-[#D5DCE2] p-10 text-center text-xs text-[#4A5568]">
          Loading procurement leakage audit alerts...
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white border border-[#D5DCE2] p-12 text-center space-y-2 rounded-xs">
          <ShieldAlert className="w-8 h-8 text-[#9AA7B4] mx-auto" />
          <div className="text-sm font-bold text-[#172B3A]">No leakage alerts recorded</div>
          <p className="text-xs text-[#4A5568]">
            Click <strong>Run Leakage Scan</strong> to audit authorised Purchase Orders, Goods Receipts, and Supplier Invoices.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#D5DCE2] rounded-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E9ECEF] border-b border-[#D5DCE2] font-mono text-[10px] uppercase text-[#292F3D]">
                <th className="p-3">Alert / Ref</th>
                <th className="p-3">Classification</th>
                <th className="p-3">Explanation</th>
                <th className="p-3 text-right">Potential Exposure</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {alerts.map((a: any) => (
                <tr key={a.id}>
                  <td className="p-3 font-mono align-top">
                    <div className="font-bold text-[#172B3A]">{a.alertCode}</div>
                    <div className="text-[11px] text-[#4A5568]">{a.transactionType}: {a.transactionRef}</div>
                  </td>
                  <td className="p-3 align-top">
                    <span className="px-2 py-0.5 bg-[#172B3A] text-[#C9A45B] font-mono text-[10px] rounded-xs block w-fit">
                      {a.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-[#4A5568] mt-1 block">Severity: {a.severity}</span>
                  </td>
                  <td className="p-3 max-w-md align-top text-[#292F3D]">{a.explanation}</td>
                  <td className="p-3 text-right font-mono font-bold tabular-nums align-top">
                    {a.potentialExposureFormatted}
                  </td>
                  <td className="p-3 font-mono text-[10px] font-bold align-top">{a.status}</td>
                  <td className="p-3 align-top">
                    {['OPEN', 'UNDER_INVESTIGATION'].includes(a.status) && (
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => updateAlert(a.id, 'UNDER_INVESTIGATION')}
                          className="px-2 py-1 bg-[#E9ECEF] text-[#172B3A] text-[10px] font-semibold rounded-xs"
                        >
                          Investigate
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAlert(a.id, 'RESOLVED')}
                          className="px-2 py-1 bg-[#0F6B50] text-white text-[10px] font-semibold rounded-xs"
                        >
                          Resolve
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAlert(a.id, 'DISMISSED')}
                          className="px-2 py-1 bg-red-600 text-white text-[10px] font-semibold rounded-xs"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </BuyerWorkspaceShell>
  );
}
