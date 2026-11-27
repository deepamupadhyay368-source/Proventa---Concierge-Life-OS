'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Plus, ShieldCheck, Database, Train } from 'lucide-react';
import { AHMEDABAD_GANDHINAGAR_LOCALITIES } from '@/lib/real-estate-intelligence/market-engine';

interface AdminRegistryRow {
  id: string;
  proventaPropertyId: string;
  title: string;
  locality: string;
  propertyType: string;
  verificationStatus: string;
  sourceProvenance: string;
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<AdminRegistryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [obsForm, setObsForm] = useState({
    locality: 'Bopal',
    segment: 'RESIDENTIAL',
    propertyType: 'APARTMENT',
    pricePerSqFtRupees: '6500',
    rentalYieldPct: '3.2',
    transactionCount: '5',
    reportingPeriod: '2026-Q4',
    dataSource: 'Gujarat Sub-Registrar Official Deed Index',
    methodology: 'Median registered carpet-area transaction rate',
    verificationStatus: 'ADMIN_SUBMITTED',
  });

  const [infraForm, setInfraForm] = useState({
    name: '',
    locality: 'GIFT City',
    corridor: 'SG Highway - GIFT City',
    category: 'METRO',
    status: 'UNDER_CONSTRUCTION',
    expectedCompletionYear: '2027',
    sourceReference: 'GMRC Official Corridor Release',
  });

  const loadRegistry = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/real-estate/registry?limit=50');
      const data = await res.json();
      if (res.ok) setProperties(data.properties || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegistry();
  }, [loadRegistry]);

  async function moderateProperty(id: string, decision: 'VERIFIED' | 'REJECTED') {
    setStatusMsg(null);
    const res = await fetch('/api/real-estate/registry/verify', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        decision,
        verificationNotes:
          decision === 'VERIFIED'
            ? 'Verified against official Gujarat RERA / sub-registrar records.'
            : 'Insufficient documentary provenance supplied.',
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatusMsg(`Moderation failed: ${data.error}`);
      return;
    }
    setStatusMsg(`Updated ${data.property.proventaPropertyId} to ${decision}.`);
    loadRegistry();
  }

  async function submitObservation(e: React.FormEvent) {
    e.preventDefault();
    setStatusMsg(null);
    const res = await fetch('/api/real-estate/market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recordType: 'OBSERVATION',
        locality: obsForm.locality,
        segment: obsForm.segment,
        propertyType: obsForm.propertyType,
        pricePerSqFtRupees: Number(obsForm.pricePerSqFtRupees),
        rentalYieldPct: Number(obsForm.rentalYieldPct),
        transactionCount: Number(obsForm.transactionCount),
        reportingPeriod: obsForm.reportingPeriod,
        dataSource: obsForm.dataSource,
        methodology: obsForm.methodology,
        verificationStatus: obsForm.verificationStatus,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatusMsg(`Observation failed: ${data.error}`);
      return;
    }
    setStatusMsg(`Recorded ${obsForm.verificationStatus} market observation for ${obsForm.locality}.`);
  }

  async function submitInfrastructure(e: React.FormEvent) {
    e.preventDefault();
    setStatusMsg(null);
    const res = await fetch('/api/real-estate/market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recordType: 'INFRASTRUCTURE',
        name: infraForm.name,
        locality: infraForm.locality,
        corridor: infraForm.corridor,
        category: infraForm.category,
        status: infraForm.status,
        expectedCompletionYear: infraForm.expectedCompletionYear ? Number(infraForm.expectedCompletionYear) : null,
        sourceReference: infraForm.sourceReference,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatusMsg(`Infrastructure creation failed: ${data.error}`);
      return;
    }
    setStatusMsg(`Recorded infrastructure asset "${infraForm.name}" (${infraForm.status}).`);
    setInfraForm((prev) => ({ ...prev, name: '' }));
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-[#C8C4BA] pb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
          Real Estate Intelligence Moderation &amp; Data Governance
        </span>
        <h1 className="font-display text-2xl font-bold text-[#202B3C]">
          Property Registry Verification &amp; Market Ingestion Console
        </h1>
      </div>

      {statusMsg && (
        <div className="rounded border border-emerald-400 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900">
          {statusMsg}
        </div>
      )}

      {/* Registry Verification Queue */}
      <section className="bg-white border border-[#C8C4BA] overflow-hidden">
        <div className="flex items-center justify-between bg-[#F5F3ED] border-b border-[#C8C4BA] px-4 py-3">
          <h2 className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#202B3C]">
            <ShieldCheck className="h-4 w-4 text-[#547568]" />
            Living Property Registry Moderation ({properties.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-xs text-slate-500">Loading registry records...</div>
        ) : properties.length === 0 ? (
          <div className="p-6 text-xs text-slate-500">No public registry submissions recorded yet.</div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F3ED]/60 border-b border-[#C8C4BA] text-[#202B3C]">
                <th className="p-3 font-bold">PV-PROP ID</th>
                <th className="p-3 font-bold">Title &amp; Locality</th>
                <th className="p-3 font-bold">Provenance</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C8C4BA]/50">
              {properties.map((p) => (
                <tr key={p.id}>
                  <td className="p-3 font-mono text-[#202B3C]">{p.proventaPropertyId}</td>
                  <td className="p-3">
                    <p className="font-semibold text-[#202B3C]">{p.title}</p>
                    <p className="text-[11px] text-[#69717B]">
                      {p.locality} &middot; {p.propertyType}
                    </p>
                  </td>
                  <td className="p-3 text-[#69717B]">{p.sourceProvenance}</td>
                  <td className="p-3 font-mono font-bold">{p.verificationStatus}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => moderateProperty(p.id, 'VERIFIED')}
                        className="inline-flex items-center gap-1 rounded bg-emerald-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-800"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => moderateProperty(p.id, 'REJECTED')}
                        className="inline-flex items-center gap-1 rounded bg-rose-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-rose-800"
                      >
                        <XCircle className="h-3 w-3" /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Market Observation & Infrastructure Ingestion */}
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={submitObservation} className="bg-white border border-[#C8C4BA] p-5 space-y-3 text-xs">
          <h2 className="flex items-center gap-2 font-mono font-bold uppercase text-[#202B3C]">
            <Database className="h-4 w-4 text-[#547568]" /> Record Sourced Market Observation
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={obsForm.locality}
              onChange={(e) => setObsForm({ ...obsForm, locality: e.target.value })}
              className="border border-[#C8C4BA] px-2.5 py-2"
            >
              {AHMEDABAD_GANDHINAGAR_LOCALITIES.map((l) => (
                <option key={l.slug} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
            <select
              value={obsForm.verificationStatus}
              onChange={(e) => setObsForm({ ...obsForm, verificationStatus: e.target.value })}
              className="border border-[#C8C4BA] px-2.5 py-2"
            >
              <option value="VERIFIED">VERIFIED</option>
              <option value="ADMIN_SUBMITTED">ADMIN_SUBMITTED</option>
              <option value="EXTERNALLY_SOURCED">EXTERNALLY_SOURCED</option>
            </select>
            <input
              type="number"
              required
              value={obsForm.pricePerSqFtRupees}
              onChange={(e) => setObsForm({ ...obsForm, pricePerSqFtRupees: e.target.value })}
              placeholder="INR / sq ft"
              className="border border-[#C8C4BA] px-2.5 py-2 font-mono"
            />
            <input
              value={obsForm.reportingPeriod}
              onChange={(e) => setObsForm({ ...obsForm, reportingPeriod: e.target.value })}
              placeholder="2026-Q4"
              className="border border-[#C8C4BA] px-2.5 py-2 font-mono"
            />
          </div>
          <input
            required
            value={obsForm.dataSource}
            onChange={(e) => setObsForm({ ...obsForm, dataSource: e.target.value })}
            placeholder="Original Data Source"
            className="w-full border border-[#C8C4BA] px-2.5 py-2"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 bg-[#202B3C] px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-3.5 w-3.5" /> Save Observation
          </button>
        </form>

        <form onSubmit={submitInfrastructure} className="bg-white border border-[#C8C4BA] p-5 space-y-3 text-xs">
          <h2 className="flex items-center gap-2 font-mono font-bold uppercase text-[#202B3C]">
            <Train className="h-4 w-4 text-[#547568]" /> Record Infrastructure Asset
          </h2>
          <input
            required
            value={infraForm.name}
            onChange={(e) => setInfraForm({ ...infraForm, name: e.target.value })}
            placeholder="e.g. Ahmedabad Metro Phase 2 GIFT City Spur"
            className="w-full border border-[#C8C4BA] px-2.5 py-2"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={infraForm.locality}
              onChange={(e) => setInfraForm({ ...infraForm, locality: e.target.value })}
              className="border border-[#C8C4BA] px-2.5 py-2"
            >
              {AHMEDABAD_GANDHINAGAR_LOCALITIES.map((l) => (
                <option key={l.slug} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
            <select
              value={infraForm.status}
              onChange={(e) => setInfraForm({ ...infraForm, status: e.target.value })}
              className="border border-[#C8C4BA] px-2.5 py-2"
            >
              <option value="OPERATIONAL">OPERATIONAL</option>
              <option value="UNDER_CONSTRUCTION">UNDER_CONSTRUCTION</option>
              <option value="PROPOSED">PROPOSED</option>
              <option value="UNVERIFIED">UNVERIFIED</option>
            </select>
          </div>
          <input
            required
            value={infraForm.sourceReference}
            onChange={(e) => setInfraForm({ ...infraForm, sourceReference: e.target.value })}
            placeholder="Official Source Reference"
            className="w-full border border-[#C8C4BA] px-2.5 py-2"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 bg-[#202B3C] px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-3.5 w-3.5" /> Save Infrastructure Asset
          </button>
        </form>
      </div>
    </div>
  );
}
