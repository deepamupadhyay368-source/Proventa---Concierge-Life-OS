'use client';

import { useState, useEffect } from 'react';
import { BuyerWorkspaceShell } from '@/components/procurement/BuyerWorkspaceShell';
import { AlertTriangle, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BuyerDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    purchaseOrderId: '',
    disputeType: 'QUANTITY_SHORTAGE',
    summary: '',
    description: '',
  });

  async function loadDisputes() {
    setLoading(true);
    try {
      const res = await fetch('/api/procurement/disputes');
      const json = await res.json();
      if (json.success) setDisputes(json.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDisputes();
  }, []);

  async function handleRaise(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const res = await fetch('/api/procurement/disputes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setFeedback({ type: 'error', text: json.error || 'Could not raise dispute.' });
    } else {
      setFeedback({ type: 'success', text: `Dispute ${json.data.disputeCode} logged with immutable audit trail.` });
      setShowForm(false);
      setForm({ purchaseOrderId: '', disputeType: 'QUANTITY_SHORTAGE', summary: '', description: '' });
      await loadDisputes();
    }
  }

  return (
    <BuyerWorkspaceShell
      title="Disputes & Quality Management"
      subtitle="Documented, append-only dispute resolution for quantity shortages, quality mismatches, late deliveries, and invoice discrepancies."
      actions={
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#172B3A] hover:bg-[#292F3D] text-white text-xs font-semibold rounded-xs inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-[#C9A45B]" />
          <span>{showForm ? 'Close Form' : 'Raise Dispute'}</span>
        </button>
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

      {showForm && (
        <form onSubmit={handleRaise} className="bg-white border border-[#D5DCE2] p-6 rounded-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold text-[#172B3A] border-b border-[#E9ECEF] pb-3">Raise Formal Procurement Dispute</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Purchase Order ID *</label>
              <input
                required
                value={form.purchaseOrderId}
                onChange={(e) => setForm({ ...form, purchaseOrderId: e.target.value })}
                placeholder="e.g. PO-2026-XXXXXX"
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Dispute Type *</label>
              <select
                value={form.disputeType}
                onChange={(e) => setForm({ ...form, disputeType: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs bg-white"
              >
                <option value="QUANTITY_SHORTAGE">Quantity Shortage</option>
                <option value="QUALITY_MISMATCH">Quality / Spec Mismatch</option>
                <option value="LATE_DELIVERY">Late Delivery</option>
                <option value="INCORRECT_INVOICE">Incorrect Invoice</option>
                <option value="DAMAGED_MATERIAL">Damaged Material</option>
                <option value="PAYMENT_DISPUTE">Payment Dispute</option>
                <option value="SUPPLIER_MISREPRESENTATION">Supplier Misrepresentation</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold mb-1">Summary *</label>
              <input
                required
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="Concise issue summary"
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold mb-1">Detailed Evidence &amp; Description *</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Provide weighbridge slip reference, challan number, or lab test details..."
                className="w-full p-3 border border-[#D5DCE2] rounded-xs"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-5 py-2 bg-[#172B3A] text-white font-semibold rounded-xs">
              Log Dispute
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="bg-white border border-[#D5DCE2] p-10 text-center text-xs text-[#4A5568]">
          Loading dispute records...
        </div>
      ) : disputes.length === 0 ? (
        <div className="bg-white border border-[#D5DCE2] p-12 text-center space-y-2 rounded-xs">
          <AlertTriangle className="w-8 h-8 text-[#9AA7B4] mx-auto" />
          <div className="text-sm font-bold text-[#172B3A]">No open procurement disputes</div>
          <p className="text-xs text-[#4A5568]">
            All raised disputes maintain an append-only audit trail that cannot be silently altered.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <div key={d.id} className="bg-white border border-[#D5DCE2] p-5 rounded-xs space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="font-mono font-bold text-[#172B3A]">
                  {d.disputeCode} &bull; PO {d.purchaseOrderId}
                </div>
                <span className="px-2 py-0.5 bg-[#E9ECEF] font-mono text-[10px] font-bold rounded-xs">
                  {d.status}
                </span>
              </div>
              <div className="font-semibold text-[#292F3D]">{d.summary}</div>
              <p className="text-[#4A5568]">{d.description}</p>
            </div>
          ))}
        </div>
      )}
    </BuyerWorkspaceShell>
  );
}
