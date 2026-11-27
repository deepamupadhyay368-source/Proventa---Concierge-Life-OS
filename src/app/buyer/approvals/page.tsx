'use client';

import { useState, useEffect } from 'react';
import { BuyerWorkspaceShell } from '@/components/procurement/BuyerWorkspaceShell';
import { CheckSquare, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function BuyerApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function loadApprovals() {
    setLoading(true);
    try {
      const res = await fetch('/api/procurement/approvals');
      const json = await res.json();
      if (json.success) setApprovals(json.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApprovals();
  }, []);

  async function decide(approvalId: string, decision: 'APPROVED' | 'REJECTED' | 'RETURNED_FOR_REVISION') {
    const reason =
      decision === 'APPROVED'
        ? 'Approved per technical & commercial evaluation'
        : window.prompt(`Enter mandatory reason for ${decision}:`) || '';

    if (decision !== 'APPROVED' && !reason.trim()) return;

    const res = await fetch('/api/procurement/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DECIDE', approvalId, decision, reason }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setFeedback({ type: 'error', text: json.error || 'Approval decision blocked.' });
    } else {
      setFeedback({ type: 'success', text: `Approval record updated to ${decision}.` });
      await loadApprovals();
    }
  }

  return (
    <BuyerWorkspaceShell
      title="Purchase Approvals & Governance"
      subtitle="Multi-level approval workflows enforcing separation of duties. The user creating an RFQ cannot unilaterally self-approve awards exceeding the dual-control threshold."
    >
      <div className="bg-white border border-[#D5DCE2] p-4 rounded-xs text-xs flex items-center gap-2.5 text-[#292F3D]">
        <ShieldCheck className="w-4 h-4 text-[#0F6B50] shrink-0" />
        <span>
          <strong>Separation of Duties Active:</strong> Dual-control threshold enforced server-side. Rejections and revision returns require documented audit reasons.
        </span>
      </div>

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

      {loading ? (
        <div className="bg-white border border-[#D5DCE2] p-10 text-center text-xs text-[#4A5568]">
          Loading pending purchase approvals...
        </div>
      ) : approvals.length === 0 ? (
        <div className="bg-white border border-[#D5DCE2] p-12 text-center space-y-2 rounded-xs">
          <CheckSquare className="w-8 h-8 text-[#9AA7B4] mx-auto" />
          <div className="text-sm font-bold text-[#172B3A]">No pending approval requests</div>
          <p className="text-xs text-[#4A5568]">
            Submitted purchase recommendations requiring multi-level sign-off will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#D5DCE2] rounded-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E9ECEF] border-b border-[#D5DCE2] font-mono text-[10px] uppercase text-[#292F3D]">
                <th className="p-3">RFQ / Quote</th>
                <th className="p-3">Approver Role</th>
                <th className="p-3 text-right">Recommended Value</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {approvals.map((a) => (
                <tr key={a.id}>
                  <td className="p-3 font-mono">
                    <div className="font-bold text-[#172B3A]">{a.rfqId}</div>
                    <div className="text-[11px] text-[#4A5568]">{a.quotationId}</div>
                  </td>
                  <td className="p-3 font-mono text-[11px]">{a.approverRole} (L{a.levelOrder})</td>
                  <td className="p-3 text-right font-mono font-bold tabular-nums">{a.recommendedAmountFormatted}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-[#E9ECEF] font-mono text-[10px] font-bold rounded-xs">
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {a.status === 'PENDING' ? (
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => decide(a.id, 'APPROVED')}
                          className="px-2.5 py-1 bg-[#0F6B50] text-white text-[11px] font-semibold rounded-xs"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => decide(a.id, 'RETURNED_FOR_REVISION')}
                          className="px-2.5 py-1 bg-[#E9ECEF] text-[#172B3A] text-[11px] font-semibold rounded-xs"
                        >
                          Return
                        </button>
                        <button
                          type="button"
                          onClick={() => decide(a.id, 'REJECTED')}
                          className="px-2.5 py-1 bg-red-600 text-white text-[11px] font-semibold rounded-xs"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#4A5568]">{a.decisionReason || 'Completed'}</span>
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
