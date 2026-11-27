'use client';

import { useState, useEffect } from 'react';
import { BuyerWorkspaceShell } from '@/components/procurement/BuyerWorkspaceShell';
import { Workflow, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ProcurementAutopilotPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/procurement/intelligence/autopilot');
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function confirmExecution(executionId: string) {
    const res = await fetch('/api/procurement/intelligence/autopilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'CONFIRM', executionId }),
    });
    const json = await res.json();
    if (json.success) {
      setFeedback('Workflow confirmed and recorded in immutable audit trail.');
      await load();
    }
  }

  return (
    <BuyerWorkspaceShell
      title="Procurement Autopilot"
      subtitle="Human-controlled procurement workflow automation for RFQ drafting, explainable supplier matching, quotation analysis, follow-ups, and delivery exception monitoring."
    >
      <div className="bg-[#172B3A] text-white p-4 rounded-xs border border-[#292F3D] text-xs flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#C9A45B] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#C9A45B]">Human-Controlled Automation Policy:</strong>{' '}
          {data?.humanControlPolicy ||
            'No automated workflow may approve, award, amend, or commit a purchase without explicit human authorisation.'}
          {' '}AI Provider Status: <strong className="font-mono">{data?.aiProviderConfigured ? 'CONFIGURED' : 'DETERMINISTIC MODE (AI KEY UNCONFIGURED)'}</strong>.
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-[#0F6B50]/10 border border-[#0F6B50] text-[#0F6B50] text-xs flex items-center gap-2 rounded-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Delivery Exception Monitor */}
      {data?.deliveryExceptions?.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 p-5 rounded-xs space-y-2 text-xs">
          <div className="font-bold text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Automated Delivery Exception Alerts ({data.deliveryExceptions.length})</span>
          </div>
          {data.deliveryExceptions.map((ex: any, i: number) => (
            <div key={i} className="text-amber-900">
              &bull; <strong>{ex.exceptionType}:</strong> {ex.message}
            </div>
          ))}
        </div>
      )}

      {/* Workflow Execution Queue */}
      {loading ? (
        <div className="bg-white border border-[#D5DCE2] p-10 text-center text-xs text-[#4A5568]">
          Loading autopilot workflow queue...
        </div>
      ) : (data?.executions?.length || 0) === 0 ? (
        <div className="bg-white border border-[#D5DCE2] p-12 text-center space-y-2 rounded-xs">
          <Workflow className="w-8 h-8 text-[#9AA7B4] mx-auto" />
          <div className="text-sm font-bold text-[#172B3A]">No staged autopilot workflows</div>
          <p className="text-xs text-[#4A5568] max-w-md mx-auto">
            Staged RFQ drafts, supplier match recommendations, and follow-up schedules appear here for explicit human confirmation before execution.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#D5DCE2] rounded-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E9ECEF] border-b border-[#D5DCE2] font-mono text-[10px] uppercase text-[#292F3D]">
                <th className="p-3">Workflow Type</th>
                <th className="p-3">Idempotency Key</th>
                <th className="p-3">Status</th>
                <th className="p-3">Human Gate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {data.executions.map((ex: any) => (
                <tr key={ex.id}>
                  <td className="p-3 font-mono font-bold text-[#172B3A]">{ex.workflowType}</td>
                  <td className="p-3 font-mono text-[11px] text-[#4A5568]">{ex.idempotencyKey}</td>
                  <td className="p-3 font-mono text-[10px] font-bold">{ex.status}</td>
                  <td className="p-3">
                    {ex.status === 'DRAFT_AWAITING_CONFIRMATION' ? (
                      <button
                        type="button"
                        onClick={() => confirmExecution(ex.id)}
                        className="px-3 py-1 bg-[#0F6B50] text-white text-[11px] font-semibold rounded-xs"
                      >
                        Confirm &amp; Execute
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#4A5568]">Audited</span>
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
