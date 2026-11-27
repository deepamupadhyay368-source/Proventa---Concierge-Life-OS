'use client';

import { useState, useEffect } from 'react';
import { BuyerWorkspaceShell } from '@/components/procurement/BuyerWorkspaceShell';
import { Building2, Plus, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProjectItem {
  id: string;
  projectCode: string;
  name: string;
  location: string;
  address: string;
  city: string;
  projectType: string;
  developerOrContractor: string;
  projectManagerName?: string | null;
  status: string;
  approvedBudgetFormatted: string;
  materialBudgetFormatted: string;
  requirementsCount: number;
  potentialSavingsFormatted: string;
  realisedSavingsFormatted: string;
}

export default function BuyerProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    projectCode: '',
    name: '',
    location: '',
    address: '',
    city: 'Ahmedabad',
    projectType: 'RESIDENTIAL_TOWER',
    projectManagerName: '',
    approvedBudgetRupees: '',
    materialBudgetRupees: '',
  });

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await fetch('/api/procurement/projects');
      const json = await res.json();
      if (json.success) setProjects(json.data || []);
      else if (res.status === 401) {
        setFeedback({ type: 'error', text: 'Please sign in to view or create organisation construction projects.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Failed to load projects from server.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/procurement/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedback({ type: 'error', text: json.error || 'Could not create project.' });
      } else {
        setFeedback({ type: 'success', text: `Project ${json.data.projectCode} created successfully.` });
        setShowForm(false);
        setForm({
          projectCode: '',
          name: '',
          location: '',
          address: '',
          city: 'Ahmedabad',
          projectType: 'RESIDENTIAL_TOWER',
          projectManagerName: '',
          approvedBudgetRupees: '',
          materialBudgetRupees: '',
        });
        await loadProjects();
      }
    } catch {
      setFeedback({ type: 'error', text: 'Network error while creating project.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BuyerWorkspaceShell
      title="Construction Projects"
      subtitle="Manage active construction sites, material procurement budgets, and project-isolated spending across your organisation."
      actions={
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#172B3A] hover:bg-[#292F3D] text-white text-xs font-semibold rounded-xs inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-[#C9A45B]" />
          <span>{showForm ? 'Close Form' : 'New Construction Project'}</span>
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
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-[#D5DCE2] p-6 rounded-xs space-y-4">
          <h2 className="text-sm font-bold text-[#172B3A] border-b border-[#E9ECEF] pb-3">
            Create Organisation Construction Project
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#292F3D] mb-1">Project Code *</label>
              <input
                required
                value={form.projectCode}
                onChange={(e) => setForm({ ...form, projectCode: e.target.value })}
                placeholder="e.g. AHM-SGH-01"
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#292F3D] mb-1">Project Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Horizon Commercial Tower"
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#292F3D] mb-1">Project Type</label>
              <select
                value={form.projectType}
                onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs bg-white"
              >
                <option value="RESIDENTIAL_TOWER">Residential Tower</option>
                <option value="COMMERCIAL">Commercial Complex</option>
                <option value="INDUSTRIAL">Industrial / Warehouse</option>
                <option value="INFRASTRUCTURE">Infrastructure / EPC</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#292F3D] mb-1">Micro-Market / Location *</label>
              <input
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. S.G. Highway, Ahmedabad"
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-[#292F3D] mb-1">Site Delivery Address *</label>
              <input
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Full plot/FP number and approach road for heavy trailers"
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#292F3D] mb-1">Project Manager</label>
              <input
                value={form.projectManagerName}
                onChange={(e) => setForm({ ...form, projectManagerName: e.target.value })}
                placeholder="e.g. Rajesh Patel"
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#292F3D] mb-1">Approved Budget (INR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.approvedBudgetRupees}
                onChange={(e) => setForm({ ...form, approvedBudgetRupees: e.target.value })}
                placeholder="e.g. 250000000"
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#292F3D] mb-1">Material Procurement Budget (INR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.materialBudgetRupees}
                onChange={(e) => setForm({ ...form, materialBudgetRupees: e.target.value })}
                placeholder="e.g. 110000000"
                className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-[#D5DCE2] text-xs font-semibold rounded-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#0F6B50] hover:bg-[#0C5842] text-white text-xs font-semibold rounded-xs disabled:opacity-50"
            >
              {submitting ? 'Saving Project...' : 'Create Project'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="bg-white border border-[#D5DCE2] p-10 text-center text-xs text-[#4A5568]">
          Loading authorised construction projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-[#D5DCE2] p-12 text-center space-y-3 rounded-xs">
          <Building2 className="w-8 h-8 text-[#9AA7B4] mx-auto" />
          <div className="text-sm font-bold text-[#172B3A]">No construction projects recorded yet</div>
          <p className="text-xs text-[#4A5568] max-w-md mx-auto">
            Create your first construction project to track material procurement budgets, link RFQs, and monitor realised savings per site.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((p) => (
            <div key={p.id} className="bg-white border border-[#D5DCE2] p-5 rounded-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0F6B50]">
                    {p.projectCode} &bull; {p.projectType.replace(/_/g, ' ')}
                  </span>
                  <h3 className="text-base font-bold text-[#172B3A] mt-0.5">{p.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-[#4A5568] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A45B]" />
                    <span>{p.location}, {p.city}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-[#E9ECEF] text-[#172B3A] font-mono text-[10px] font-bold rounded-xs">
                  {p.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E9ECEF] text-xs font-mono">
                <div className="bg-[#F3F5F7] p-2.5 rounded-xs">
                  <span className="text-[10px] text-[#4A5568] block">MATERIAL BUDGET</span>
                  <span className="font-bold text-[#172B3A] tabular-nums">{p.materialBudgetFormatted}</span>
                </div>
                <div className="bg-[#F3F5F7] p-2.5 rounded-xs">
                  <span className="text-[10px] text-[#4A5568] block">REALISED SAVINGS</span>
                  <span className="font-bold text-[#0F6B50] tabular-nums">{p.realisedSavingsFormatted}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#4A5568] pt-1">
                <span>PM: {p.projectManagerName || 'Unassigned'}</span>
                <span>{p.requirementsCount} linked requirements</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </BuyerWorkspaceShell>
  );
}
