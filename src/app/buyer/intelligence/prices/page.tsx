'use client';

import { useState, useEffect } from 'react';
import { BuyerWorkspaceShell } from '@/components/procurement/BuyerWorkspaceShell';
import { TrendingUp, Download, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function MaterialPriceIntelligencePage() {
  const [categorySlug, setCategorySlug] = useState('tmt-steel');
  const [grade, setGrade] = useState('Fe-550D');
  const [unit, setUnit] = useState('MT');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    materialCategorySlug: 'tmt-steel',
    materialName: 'TMT Steel 16mm',
    brand: 'Tata Tiscon',
    grade: 'Fe-550D',
    unit: 'MT',
    city: 'Ahmedabad',
    basePriceUnitRupees: '',
    gstRatePercent: '18',
    freightUnitRupees: '950',
    sourceType: 'SUPPLIER_QUOTATION',
    supportingDocumentRef: '',
  });

  async function loadPrices() {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ categorySlug, grade, unit }).toString();
      const res = await fetch(`/api/procurement/intelligence/prices?${qs}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrices();
  }, [categorySlug, grade, unit]);

  async function handleRecord(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const res = await fetch('/api/procurement/intelligence/prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setFeedback({ type: 'error', text: json.error || 'Could not record observation.' });
    } else {
      setFeedback({ type: 'success', text: 'Verified price observation recorded in integer paise.' });
      setShowForm(false);
      await loadPrices();
    }
  }

  const benchmark = data?.benchmark;
  const observations = data?.observations || [];

  return (
    <BuyerWorkspaceShell
      title="Material Price Intelligence"
      subtitle="Like-for-like verified construction material benchmarks across Ahmedabad, Gandhinagar & Gujarat. Never fabricates price history when verified observations are insufficient."
      actions={
        <>
          <a
            href={`/api/procurement/intelligence/prices?categorySlug=${encodeURIComponent(categorySlug)}&grade=${encodeURIComponent(grade)}&unit=${encodeURIComponent(unit)}&format=csv`}
            className="px-3.5 py-2 bg-[#E9ECEF] hover:bg-[#DCE2E8] text-[#172B3A] text-xs font-semibold rounded-xs inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-[#172B3A] hover:bg-[#292F3D] text-white text-xs font-semibold rounded-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#C9A45B]" />
            <span>Record Price Observation</span>
          </button>
        </>
      }
    >
      {/* Like-for-like Filter Bar */}
      <div className="bg-white border border-[#D5DCE2] p-4 rounded-xs grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-semibold mb-1">Material Category</label>
          <select
            value={categorySlug}
            onChange={(e) => {
              setCategorySlug(e.target.value);
              if (e.target.value === 'cement') {
                setGrade('OPC 53');
                setUnit('BAG');
              } else if (e.target.value === 'tmt-steel') {
                setGrade('Fe-550D');
                setUnit('MT');
              }
            }}
            className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs bg-white"
          >
            <option value="tmt-steel">TMT Steel Reinforcement Bars</option>
            <option value="cement">Portland Cement (OPC / PPC)</option>
            <option value="ready-mix-concrete">Ready-Mix Concrete (RMC)</option>
            <option value="aac-blocks-bricks">AAC Blocks &amp; Bricks</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Exact Grade (Like-for-Like Lock)</label>
          <input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Unit of Measurement</label>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs"
          />
        </div>
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

      {showForm && (
        <form onSubmit={handleRecord} className="bg-white border border-[#D5DCE2] p-6 rounded-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold text-[#172B3A] border-b border-[#E9ECEF] pb-3">
            Record Sourced Material Price Observation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1">Material Name *</label>
              <input required value={form.materialName} onChange={(e) => setForm({ ...form, materialName: e.target.value })} className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Brand *</label>
              <input required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Grade *</label>
              <input required value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Base Unit Price (INR) *</label>
              <input required type="number" step="0.01" value={form.basePriceUnitRupees} onChange={(e) => setForm({ ...form, basePriceUnitRupees: e.target.value })} className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Freight / Unit (INR)</label>
              <input type="number" step="0.01" value={form.freightUnitRupees} onChange={(e) => setForm({ ...form, freightUnitRupees: e.target.value })} className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Evidence Source *</label>
              <select value={form.sourceType} onChange={(e) => setForm({ ...form, sourceType: e.target.value })} className="w-full h-9 px-3 border border-[#D5DCE2] rounded-xs bg-white">
                <option value="SUPPLIER_QUOTATION">Actual Supplier Quotation</option>
                <option value="VERIFIED_PO">Verified Purchase Order</option>
                <option value="VERIFIED_INVOICE">Verified Invoice</option>
                <option value="PUBLIC_MARKET_REF">Public Market Reference</option>
                <option value="MANUAL_OBSERVATION">Manual Observation (Pending Verification)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-5 py-2 bg-[#0F6B50] text-white font-semibold rounded-xs">
              Save Observation
            </button>
          </div>
        </form>
      )}

      {/* Benchmark Summary Banner */}
      {loading ? (
        <div className="bg-white border border-[#D5DCE2] p-10 text-center text-xs text-[#4A5568]">
          Loading verified price benchmarks...
        </div>
      ) : benchmark?.status === 'INSUFFICIENT_DATA' ? (
        <div className="bg-amber-50 border border-amber-300 p-6 rounded-xs space-y-2">
          <div className="text-sm font-bold text-amber-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>{benchmark.message}</span>
          </div>
          <p className="text-xs text-amber-800">
            Found {benchmark.verifiedObservationCount} verified observation(s) for {benchmark.grade} ({benchmark.unit}); a minimum of 3 verified like-for-like observations is required before displaying a benchmark range. PROVENTA never fabricates price history.
          </p>
        </div>
      ) : benchmark ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
            <div className="text-[10px] font-mono uppercase text-[#0F6B50]">Median Landed Price</div>
            <div className="text-2xl font-bold font-mono text-[#172B3A] mt-1 tabular-nums">{benchmark.formattedMedian}</div>
            <div className="text-[11px] text-[#4A5568] mt-1">per {benchmark.unit} ({benchmark.verifiedObservationCount} verified obs.)</div>
          </div>
          <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
            <div className="text-[10px] font-mono uppercase text-[#4A5568]">Observed Range (Low – High)</div>
            <div className="text-lg font-bold font-mono text-[#172B3A] mt-1 tabular-nums">
              {benchmark.formattedLowest} – {benchmark.formattedHighest}
            </div>
            <div className="text-[11px] text-[#4A5568] mt-1">Volatility: {benchmark.volatilityPercent}%</div>
          </div>
          <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
            <div className="text-[10px] font-mono uppercase text-[#4A5568]">Data Freshness</div>
            <div className="text-xl font-bold font-mono text-[#0F6B50] mt-1">{benchmark.freshness}</div>
            <div className="text-[11px] text-[#4A5568] mt-1">
              Last obs: {benchmark.lastObservationDateIso?.split('T')[0]}
            </div>
          </div>
          <div className="bg-white border border-[#D5DCE2] p-5 rounded-xs">
            <div className="text-[10px] font-mono uppercase text-[#4A5568]">Verified Sources</div>
            <div className="text-xs font-mono text-[#172B3A] mt-2">
              {benchmark.sourcesIncluded.join(', ')}
            </div>
          </div>
        </div>
      ) : null}

      {observations.length > 0 && (
        <div className="bg-white border border-[#D5DCE2] rounded-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E9ECEF] border-b border-[#D5DCE2] font-mono text-[10px] uppercase text-[#292F3D]">
                <th className="p-3">Date</th>
                <th className="p-3">Material &amp; Brand</th>
                <th className="p-3">Grade / City</th>
                <th className="p-3 text-right">Landed Unit Price</th>
                <th className="p-3">Source &amp; Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {observations.map((o: any) => (
                <tr key={o.id}>
                  <td className="p-3 font-mono">{String(o.observationDate).split('T')[0]}</td>
                  <td className="p-3">
                    <div className="font-semibold text-[#172B3A]">{o.materialName}</div>
                    <div className="text-[11px] text-[#4A5568]">{o.brand}</div>
                  </td>
                  <td className="p-3">{o.grade} &bull; {o.city}</td>
                  <td className="p-3 text-right font-mono font-bold tabular-nums">{o.landedPriceFormatted} / {o.unit}</td>
                  <td className="p-3 font-mono text-[10px]">{o.sourceType} ({o.verificationStatus})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </BuyerWorkspaceShell>
  );
}
