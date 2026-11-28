'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  ShieldCheck,
  MapPin,
  Layers,
  Clock,
  FileCheck2,
} from 'lucide-react';
import { AHMEDABAD_GANDHINAGAR_LOCALITIES } from '@/lib/real-estate-intelligence/market-engine';

interface RegistryPropertyRecord {
  id: string;
  proventaPropertyId: string;
  hierarchy: string[];
  landParcelCode: string | null;
  projectSlug: string | null;
  buildingName: string | null;
  unitNumber: string | null;
  propertyCategory: string;
  propertyType: string;
  title: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  carpetAreaSqFt: number | null;
  builtUpAreaSqFt: number | null;
  constructionStatus: string;
  configuration: string | null;
  developerName: string | null;
  reraNumber: string | null;
  verificationStatus: string;
  sourceProvenance: string;
  createdAt: string;
  lifecycleEvents: Array<{
    id: string;
    eventType: string;
    eventDate: string;
    summary: string;
  }>;
}

function VerificationBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    VERIFIED: 'border-[#287A55]/30 bg-[#F3F5F7] text-[#287A55]',
    EXTERNALLY_SOURCED: 'border-sky-500/40 bg-sky-500/10 text-[#29465F]',
    USER_SUBMITTED: 'border-amber-500/40 bg-amber-500/10 text-[#B17A30]',
    UNVERIFIED: 'border-[#E8EBEF] bg-[#F3F5F7] text-[#202B38]',
    REJECTED: 'border-rose-500/40 bg-rose-500/10 text-[#B94343]',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[11px] font-medium ${
        styles[status] || styles.UNVERIFIED
      }`}
    >
      {status === 'VERIFIED' ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
      {status}
    </span>
  );
}

export default function PropertyIntelligencePage() {
  const [query, setQuery] = useState('');
  const [locality, setLocality] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [properties, setProperties] = useState<RegistryPropertyRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchNotice, setWatchNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const initialQ = sp.get('q');
      const initialLoc = sp.get('locality');
      if (initialQ) setQuery(initialQ);
      if (initialLoc) setLocality(initialLoc);
    }
  }, []);

  async function handleWatchProperty(prop: RegistryPropertyRecord) {
    setWatchNotice(null);
    const res = await fetch('/api/real-estate/watchlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetType: 'PROPERTY',
        targetIdOrSlug: prop.proventaPropertyId,
        targetLabel: `${prop.title} (${prop.locality})`,
      }),
    });
    if (res.status === 401) {
      setWatchNotice('Sign in (/login) to add properties to your Watchlist.');
      return;
    }
    if (res.ok) {
      setWatchNotice(`Added ${prop.proventaPropertyId} to your Watchlist.`);
    }
  }

  const [showSubmit, setShowSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [form, setForm] = useState({
    title: '',
    address: '',
    locality: 'Bopal',
    city: 'Ahmedabad',
    propertyCategory: 'RESIDENTIAL',
    propertyType: 'APARTMENT',
    landParcelCode: '',
    projectSlug: '',
    buildingName: '',
    unitNumber: '',
    carpetAreaSqFt: '',
    configuration: '3 BHK',
    developerName: '',
    reraNumber: '',
    sourceProvenance: 'Owner / user-submitted property dossier',
  });

  const fetchRegistry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (locality) params.set('locality', locality);
      if (propertyType) params.set('propertyType', propertyType);
      if (verificationStatus) params.set('verificationStatus', verificationStatus);

      const res = await fetch(`/api/real-estate/registry?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Living Property Registry.');
      }
      setProperties(data.properties || []);
      setTotalCount(data.totalCount || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to query registry.');
    } finally {
      setLoading(false);
    }
  }, [query, locality, propertyType, verificationStatus]);

  useEffect(() => {
    fetchRegistry();
  }, [fetchRegistry]);

  async function handleSubmitProperty(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitFeedback(null);
    try {
      const res = await fetch('/api/real-estate/registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          address: form.address,
          locality: form.locality,
          city: form.city,
          propertyCategory: form.propertyCategory,
          propertyType: form.propertyType,
          landParcelCode: form.landParcelCode || undefined,
          projectSlug: form.projectSlug || undefined,
          buildingName: form.buildingName || undefined,
          unitNumber: form.unitNumber || undefined,
          carpetAreaSqFt: form.carpetAreaSqFt ? Number(form.carpetAreaSqFt) : undefined,
          configuration: form.configuration || undefined,
          developerName: form.developerName || undefined,
          reraNumber: form.reraNumber || undefined,
          sourceProvenance: form.sourceProvenance,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setSubmitFeedback({
          type: 'error',
          message: 'Please sign in first (/login) to register a property in the Living Property Registry.',
        });
        return;
      }
      if (res.status === 409) {
        setSubmitFeedback({
          type: 'error',
          message: `Duplicate blocked: ${data.reason || data.error} (Existing ID: ${data.matchedPropertyId})`,
        });
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      setSubmitFeedback({
        type: 'success',
        message: `Registered permanent ID ${data.property.proventaPropertyId} with status USER_SUBMITTED.`,
      });
      setForm((prev) => ({
        ...prev,
        title: '',
        address: '',
        buildingName: '',
        unitNumber: '',
        carpetAreaSqFt: '',
        reraNumber: '',
      }));
      fetchRegistry();
    } catch (err) {
      setSubmitFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to register property.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#202B38]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#E8EBEF] pb-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#29465F]">
              MODULE 01 // LIVING PROPERTY REGISTRY
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#202B38]">
              Property Intelligence &amp; Permanent Registry
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-[#697586]">
              Every property carries a permanent <span className="font-mono text-[#287A55]">PV-PROP-...</span>{' '}
              identity structured across Land &rarr; Project &rarr; Building &rarr; Unit &rarr; Property with duplicate
              prevention and explicit verification provenance. Private owner passports are strictly isolated in{' '}
              <Link href="/property-os" className="text-[#29465F] underline underline-offset-4 hover:text-[#287A55]">
                Property OS
              </Link>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSubmit((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xs bg-[#29465F] px-4 py-2.5 text-sm font-semibold text-[#FFFFFF] transition hover:bg-[#20384C]"
          >
            <Plus className="h-4 w-4" />
            {showSubmit ? 'Close Submission Form' : 'Register Property'}
          </button>
        </div>

        {/* Submit Property Form */}
        {showSubmit && (
          <form
            onSubmit={handleSubmitProperty}
            className="mt-6 rounded-xs border border-[#E8EBEF] bg-[#FFFFFF] p-6"
          >
            <div className="flex items-center justify-between border-b border-[#E8EBEF] pb-4">
              <div>
                <h2 className="text-base font-semibold text-[#202B38]">Submit Property to Living Registry</h2>
                <p className="text-xs text-[#697586]">
                  Duplicate addresses and duplicate RERA+unit pairs are automatically rejected (HTTP 409). All user
                  submissions enter as <span className="font-mono text-[#B17A30]">USER_SUBMITTED</span> and are never
                  auto-verified.
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 text-[#29465F]" />
            </div>

            {submitFeedback && (
              <div
                className={`mt-4 rounded-xs border px-4 py-3 text-sm ${
                  submitFeedback.type === 'success'
                    ? 'border-[#287A55]/30 bg-emerald-500/10 text-[#287A55]'
                    : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                }`}
              >
                {submitFeedback.message}
              </div>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-[#202B38]">Property Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Sun Skyview Tower B - 904"
                  className="mt-1 w-full rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] px-3 py-2 text-sm text-[#202B38] focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202B38]">Locality *</label>
                <select
                  value={form.locality}
                  onChange={(e) => setForm({ ...form, locality: e.target.value })}
                  className="mt-1 w-full rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] px-3 py-2 text-sm text-[#202B38] focus:border-emerald-500 focus:outline-none"
                >
                  {AHMEDABAD_GANDHINAGAR_LOCALITIES.map((l) => (
                    <option key={l.slug} value={l.name}>
                      {l.name} ({l.city})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202B38]">Property Type *</label>
                <select
                  value={form.propertyType}
                  onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                  className="mt-1 w-full rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] px-3 py-2 text-sm text-[#202B38] focus:border-emerald-500 focus:outline-none"
                >
                  <option value="APARTMENT">Apartment</option>
                  <option value="VILLA">Villa</option>
                  <option value="BUNGALOW">Bungalow</option>
                  <option value="OFFICE">Commercial Office</option>
                  <option value="RETAIL">Retail</option>
                  <option value="PLOT">Land Plot</option>
                  <option value="WAREHOUSE">Industrial Warehouse</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#202B38]">Full Street Address *</label>
                <input
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="FP 42, TP Scheme 2, South Bopal Main Road, Ahmedabad 380058"
                  className="mt-1 w-full rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] px-3 py-2 text-sm text-[#202B38] focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202B38]">Carpet Area (sq ft)</label>
                <input
                  type="number"
                  min={50}
                  value={form.carpetAreaSqFt}
                  onChange={(e) => setForm({ ...form, carpetAreaSqFt: e.target.value })}
                  placeholder="1450"
                  className="mt-1 w-full rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] px-3 py-2 text-sm text-[#202B38] focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202B38]">Land / FP Parcel Code</label>
                <input
                  value={form.landParcelCode}
                  onChange={(e) => setForm({ ...form, landParcelCode: e.target.value })}
                  placeholder="TP-02 / FP-42"
                  className="mt-1 w-full rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] px-3 py-2 text-sm text-[#202B38] focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202B38]">Building / Tower</label>
                <input
                  value={form.buildingName}
                  onChange={(e) => setForm({ ...form, buildingName: e.target.value })}
                  placeholder="Tower B"
                  className="mt-1 w-full rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] px-3 py-2 text-sm text-[#202B38] focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202B38]">Unit / Flat No.</label>
                <input
                  value={form.unitNumber}
                  onChange={(e) => setForm({ ...form, unitNumber: e.target.value })}
                  placeholder="904"
                  className="mt-1 w-full rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] px-3 py-2 text-sm text-[#202B38] focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202B38]">Gujarat RERA Number</label>
                <input
                  value={form.reraNumber}
                  onChange={(e) => setForm({ ...form, reraNumber: e.target.value })}
                  placeholder="PR/GJ/AHMEDABAD/..."
                  className="mt-1 w-full rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] px-3 py-2 text-sm text-[#202B38] focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202B38]">Configuration</label>
                <input
                  value={form.configuration}
                  onChange={(e) => setForm({ ...form, configuration: e.target.value })}
                  placeholder="3 BHK / Grade-A Office"
                  className="mt-1 w-full rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] px-3 py-2 text-sm text-[#202B38] focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#202B38]">Source Provenance *</label>
                <input
                  required
                  value={form.sourceProvenance}
                  onChange={(e) => setForm({ ...form, sourceProvenance: e.target.value })}
                  className="mt-1 w-full rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] px-3 py-2 text-sm text-[#202B38] focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSubmit(false)}
                className="rounded-xs border border-[#E8EBEF] px-4 py-2 text-sm text-[#202B38] hover:bg-[#F3F5F7]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xs bg-[#29465F] px-5 py-2 text-sm font-semibold text-[#FFFFFF] hover:bg-[#20384C] disabled:opacity-50"
              >
                {submitting ? 'Registering...' : 'Assign Permanent PV-PROP ID'}
              </button>
            </div>
          </form>
        )}

        {/* Search & Filter Bar */}
        <div className="mt-6 grid gap-3 rounded-xs border border-[#E8EBEF] bg-[#FFFFFF] p-4 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#929BA6]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search PV-PROP ID, address, RERA, building..."
              className="w-full rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] py-2 pl-9 pr-3 text-sm text-[#202B38] focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <select
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            className="rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] px-3 py-2 text-sm text-[#202B38] focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All 13 Corridors</option>
            {AHMEDABAD_GANDHINAGAR_LOCALITIES.map((l) => (
              <option key={l.slug} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] px-3 py-2 text-sm text-[#202B38] focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Property Types</option>
            <option value="APARTMENT">Apartment</option>
            <option value="VILLA">Villa</option>
            <option value="OFFICE">Office</option>
            <option value="PLOT">Plot</option>
            <option value="RETAIL">Retail</option>
          </select>
          <select
            value={verificationStatus}
            onChange={(e) => setVerificationStatus(e.target.value)}
            className="rounded-xs border border-[#E8EBEF] bg-[#F7F8FA] px-3 py-2 text-sm text-[#202B38] focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Verification States</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="EXTERNALLY_SOURCED">EXTERNALLY_SOURCED</option>
            <option value="USER_SUBMITTED">USER_SUBMITTED</option>
            <option value="UNVERIFIED">UNVERIFIED</option>
          </select>
        </div>

        {/* Results */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between text-xs text-[#697586]">
            <span className="font-mono">
              PUBLIC REGISTRY RECORDS: <strong className="text-[#202B38]">{totalCount}</strong>
            </span>
            <span>Private Property OS assets are never indexed here.</span>
          </div>

          {watchNotice && (
            <div className="mb-3 rounded-xs border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs text-sky-200">
              {watchNotice}
            </div>
          )}

          {error && (
            <div className="rounded-xs border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-44 animate-pulse rounded-xs border border-[#E8EBEF] bg-[#F7F8FA]" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-xs border border-dashed border-[#E8EBEF] bg-[#FFFFFF]/30 p-10 text-center">
              <Building2 className="mx-auto h-10 w-10 text-slate-600" />
              <h3 className="mt-3 text-base font-medium text-[#202B38]">No public registry records match this filter</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-[#697586]">
                PROVENTA never fabricates placeholder property records. Register a property above to issue a permanent{' '}
                <span className="font-mono text-[#287A55]">PV-PROP-...</span> identifier.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {properties.map((prop) => (
                <div
                  key={prop.id}
                  className="rounded-xs border border-[#E8EBEF] bg-[#FFFFFF] p-5 transition hover:border-[#E8EBEF]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs text-[#29465F]">{prop.proventaPropertyId}</span>
                      <h3 className="mt-1 text-lg font-semibold text-[#202B38]">{prop.title}</h3>
                    </div>
                    <VerificationBadge status={prop.verificationStatus} />
                  </div>

                  <p className="mt-2 flex items-start gap-1.5 text-xs text-[#697586]">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#929BA6]" />
                    <span>
                      {prop.address} &middot; {prop.locality}, {prop.city}
                    </span>
                  </p>

                  {/* 5-Level Hierarchy Breadcrumbs */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-[#929BA6]" />
                    {prop.hierarchy.map((node, i) => (
                      <span
                        key={`${prop.id}-h-${i}`}
                        className="rounded bg-[#F7F8FA] px-2 py-0.5 font-mono text-[11px] text-[#202B38]"
                      >
                        {node}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#E8EBEF] pt-3 text-xs">
                    <div>
                      <span className="text-[#929BA6]">Type / Config</span>
                      <p className="font-medium text-[#202B38]">
                        {prop.propertyType} {prop.configuration ? `· ${prop.configuration}` : ''}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#929BA6]">Carpet Area</span>
                      <p className="font-mono font-medium text-[#202B38]">
                        {prop.carpetAreaSqFt ? `${prop.carpetAreaSqFt.toLocaleString()} sq ft` : 'Not verified'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#929BA6]">RERA Ref</span>
                      <p className="truncate font-mono text-[#202B38]">{prop.reraNumber || 'Unverified'}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#E8EBEF]/80 pt-3 text-[11px] text-[#697586]">
                    <span className="flex items-center gap-1">
                      <FileCheck2 className="h-3.5 w-3.5 text-[#929BA6]" />
                      Source: {prop.sourceProvenance}
                    </span>
                    <span className="flex items-center gap-2 font-mono">
                      <button
                        type="button"
                        onClick={() => handleWatchProperty(prop)}
                        className="rounded border border-[#287A55]/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-[#287A55] hover:bg-emerald-500/20"
                      >
                        + Watch
                      </button>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {prop.lifecycleEvents.length} event(s)
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
