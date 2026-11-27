'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BuyerWorkspaceShell } from '@/components/procurement/BuyerWorkspaceShell';
import { ClipboardList, Plus, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function BuyerRequirementsPage() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    projectId: '',
    title: '',
    materialName: 'TMT Steel Reinforcement Bars',
    quantity: '50',
    unit: 'MT',
    preferredBrands: 'Tata Tiscon, JSW Neosteel',
    deliveryLocation: '',
    requiredDeliveryDate: '',
    budgetRupees: '',
    paymentTerms: '30 Days Credit against GRN',
    submitNow: true,
  });

  async function loadAll() {
    setLoading(true);
    try {
      const [resReq, resProj] = await Promise.all([
        fetch('/api/procurement/requirements'),
        fetch('/api/procurement/projects'),
      ]);
      const jsonReq = await resReq.json();
      const jsonProj = await resProj.json();
      if (jsonReq.success) setRequirements(jsonReq.data || []);
      if (jsonProj.success) {
        setProjects(jsonProj.data || []);
        if (jsonProj.data?.length && !form.projectId) {
          setForm((prev) => ({ ...prev, projectId: jsonProj.data[0].id }));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const res = await fetch('/api/procurement/requirements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        quantity: Number(form.quantity),
        preferredBrands: form.preferredBrands.split(',').map((s) => s.trim()).filter(Boolean),
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setFeedback({ type: 'error', text: json.error || 'Failed to save requirement.' });
    } else {
      setFeedback({ type: 'success', text: `Requirement ${json.data.requirementCode} saved (${json.data.status}).` });
      setShowForm(false);
      await loadAll();
    }
  }

  return (
    <BuyerWorkspaceShell
      title="Procurement Requirements"
      subtitle="Capture project-linked material requirements, lock technical specifications, and convert approved requirements into formal RFQs."
      actions={
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#172B3A] hover:bg-[#292F3D] text-white text-xs font-semibold rounded-xs inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-[#C9A45B]" />
          <span>{showForm ? 'Close Form' : 'New Requirement'}</span>
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
        <form onSubmit={handleCreate} className="bg-white border border-[#D5DCE2] p-6 rounded-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold text-[#172B3A] border-b border-[#E9ECEF] pb-3">
            Create Material Procurement Requirement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1">Linked Project *</label>
              <select
                required
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs bg-white"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.projectCode} — {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Requirement Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Tower A Podium TMT Steel Lot 2"
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Material Name *</label>
              <input
                required
                value={form.materialName}
                onChange={(e) => setForm({ ...form, materialName: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Quantity *</label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Unit</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs bg-white"
              >
                <option value="MT">MT (Metric Tonnes)</option>
                <option value="BAG">BAG (50 kg)</option>
                <option value="CUM">CUM (Cubic Meter)</option>
                <option value="MTR">MTR (Meter)</option>
                <option value="SQFT">SQFT</option>
                <option value="NOS">NOS</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Required Delivery Date</label>
              <input
                type="date"
                value={form.requiredDeliveryDate}
                onChange={(e) => setForm({ ...form, requiredDeliveryDate: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold mb-1">Preferred Brands (comma-separated)</label>
              <input
                value={form.preferredBrands}
                onChange={(e) => setForm({ ...form, preferredBrands: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Budget Estimate (INR, optional)</label>
              <input
                type="number"
                value={form.budgetRupees}
                onChange={(e) => setForm({ ...form, budgetRupees: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="submit" className="px-5 py-2 bg-[#0F6B50] text-white font-semibold rounded-xs">
              Save Requirement
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="bg-white border border-[#D5DCE2] p-10 text-center text-xs text-[#4A5568]">
          Loading procurement requirements...
        </div>
      ) : requirements.length === 0 ? (
        <div className="bg-white border border-[#D5DCE2] p-12 text-center space-y-3 rounded-xs">
          <ClipboardList className="w-8 h-8 text-[#9AA7B4] mx-auto" />
          <div className="text-sm font-bold text-[#172B3A]">No procurement requirements yet</div>
          <p className="text-xs text-[#4A5568] max-w-md mx-auto">
            Create a construction project first, then log material requirements to manage approvals and launch RFQs.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#D5DCE2] rounded-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E9ECEF] border-b border-[#D5DCE2] font-mono text-[10px] uppercase text-[#292F3D]">
                <th className="p-3">Code</th>
                <th className="p-3">Project</th>
                <th className="p-3">Material &amp; Title</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Budget</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {requirements.map((r) => (
                <tr key={r.id} className="hover:bg-[#F3F5F7]">
                  <td className="p-3 font-mono font-bold text-[#172B3A]">{r.requirementCode}</td>
                  <td className="p-3">{r.project?.projectCode || '—'}</td>
                  <td className="p-3">
                    <div className="font-semibold text-[#172B3A]">{r.title}</div>
                    <div className="text-[11px] text-[#4A5568]">{r.materialName}</div>
                  </td>
                  <td className="p-3 font-mono tabular-nums">{r.quantity} {r.unit}</td>
                  <td className="p-3 font-mono tabular-nums">{r.budgetFormatted}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-[#E9ECEF] text-[#172B3A] font-mono text-[10px] font-bold rounded-xs">
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/rfq/new?requirementId=${encodeURIComponent(r.id)}`}
                      className="inline-flex items-center gap-1 text-[#0F6B50] font-semibold hover:underline"
                    >
                      <span>Convert to RFQ</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
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
