'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Building,
  FileText,
  Lock,
  Plus,
  Receipt,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react';
import { AHMEDABAD_GANDHINAGAR_LOCALITIES } from '@/lib/real-estate-intelligence/market-engine';

interface PortfolioSummary {
  totalProperties: number;
  vacantProperties: number;
  totalAcquisitionFormatted: string;
  totalEstimatedValueFormatted: string;
  appreciationFormatted: string;
  appreciationPercent: number;
  annualRentalIncomeFormatted: string;
  annualExpensesFormatted: string;
  netRentalYieldPercent: number;
  upcomingAlerts: Array<{ type: string; passportId: string; message: string }>;
  privacyNotice: string;
}

interface PropertyPassportRecord {
  id: string;
  passportCode: string;
  nickname: string;
  propertyCategory: string;
  propertyType: string;
  address: string;
  locality: string;
  city: string;
  occupancyStatus: string;
  purchasePricePaise: string;
  currentEstimatedPaise: string;
  expenses: Array<{ id: string; category: string; amountPaise: string; expenseDate: string; description: string }>;
  leases: Array<{
    id: string;
    tenantName: string;
    monthlyRentPaise: string;
    leaseEndDate: string;
    status: string;
  }>;
  maintenanceRecords: Array<{ id: string; title: string; costPaise: string; status: string; scheduledDate: string | null }>;
  timelineEvents: Array<{ id: string; eventType: string; eventDate: string; title: string }>;
}

function formatPaise(paiseStr: string): string {
  const rupees = Number(BigInt(paiseStr)) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

export default function PropertyOsPage() {
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [passports, setPassports] = useState<PropertyPassportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [newPassport, setNewPassport] = useState({
    nickname: '',
    propertyCategory: 'RESIDENTIAL',
    propertyType: 'APARTMENT',
    address: '',
    locality: 'Bopal',
    city: 'Ahmedabad',
    purchasePriceRupees: '9500000',
    currentEstimatedRupees: '11200000',
    occupancyStatus: 'RENTED',
  });

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/real-estate/property-os');
      if (res.status === 401) {
        setUnauthenticated(true);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setUnauthenticated(false);
        setSummary(data.summary);
        setPassports(data.passports || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  async function handleCreatePassport(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const res = await fetch('/api/real-estate/property-os', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CREATE_PASSPORT',
        nickname: newPassport.nickname,
        propertyCategory: newPassport.propertyCategory,
        propertyType: newPassport.propertyType,
        address: newPassport.address,
        locality: newPassport.locality,
        city: newPassport.city,
        purchasePriceRupees: Number(newPassport.purchasePriceRupees || 0),
        currentEstimatedRupees: Number(newPassport.currentEstimatedRupees || 0),
        occupancyStatus: newPassport.occupancyStatus,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback(data.error || 'Failed to create Property Passport.');
      return;
    }
    setFeedback(`Created private Digital Property Passport ${data.passport.passportCode}.`);
    setShowCreate(false);
    setNewPassport((prev) => ({ ...prev, nickname: '', address: '' }));
    loadPortfolio();
  }

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
              MODULE 06 // PROPERTY OS &amp; DIGITAL PROPERTY PASSPORT
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Private Owner Portfolio &amp; Asset Vault
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Track private acquisition costs, expenses, tenant leases, maintenance records, document keys, and
              chronological property timelines. Strictly owner-isolated.
            </p>
          </div>
          {!unauthenticated && (
            <button
              type="button"
              onClick={() => setShowCreate((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              <Plus className="h-4 w-4" />
              {showCreate ? 'Close Form' : 'New Property Passport'}
            </button>
          )}
        </div>

        {/* Privacy Guarantee Banner */}
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-xs text-emerald-200">
          <Lock className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>
            <strong>Strict Privacy Isolation:</strong> Every Property Passport, expense ledger, tenant lease, and
            document key is scoped exclusively to your authenticated account and is NEVER exposed in the public
            Living Property Registry.
          </span>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-28 animate-pulse rounded-xl border border-slate-800 bg-slate-900/40" />
            ))}
          </div>
        ) : unauthenticated ? (
          <div className="mt-10 rounded-xl border border-slate-800 bg-slate-900/60 p-10 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-emerald-400" />
            <h2 className="mt-4 text-xl font-semibold text-white">Sign in to access your private Property OS</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              Digital Property Passports, lease expiry reminders, and private expense ledgers require authentication
              to enforce strict per-owner isolation.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/login?callbackUrl=/property-os"
                className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Sign In to Property OS
              </Link>
              <Link
                href="/property-intelligence"
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm text-slate-200 hover:bg-slate-800"
              >
                Browse Public Registry
              </Link>
            </div>
          </div>
        ) : (
          <>
            {feedback && (
              <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {feedback}
              </div>
            )}

            {/* Create Passport Form */}
            {showCreate && (
              <form
                onSubmit={handleCreatePassport}
                className="mt-6 rounded-xl border border-slate-800 bg-slate-900/70 p-6"
              >
                <h2 className="text-base font-semibold text-white">Create Private Digital Property Passport</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-xs text-slate-400">Asset Nickname *</label>
                    <input
                      required
                      value={newPassport.nickname}
                      onChange={(e) => setNewPassport({ ...newPassport, nickname: e.target.value })}
                      placeholder="e.g. Bopal 3BHK Rental"
                      className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400">Locality *</label>
                    <select
                      value={newPassport.locality}
                      onChange={(e) => setNewPassport({ ...newPassport, locality: e.target.value })}
                      className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                    >
                      {AHMEDABAD_GANDHINAGAR_LOCALITIES.map((l) => (
                        <option key={l.slug} value={l.name}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400">Occupancy Status</label>
                    <select
                      value={newPassport.occupancyStatus}
                      onChange={(e) => setNewPassport({ ...newPassport, occupancyStatus: e.target.value })}
                      className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                    >
                      <option value="OWNER_OCCUPIED">Owner Occupied</option>
                      <option value="RENTED">Rented</option>
                      <option value="VACANT">Vacant</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs text-slate-400">Full Address *</label>
                    <input
                      required
                      value={newPassport.address}
                      onChange={(e) => setNewPassport({ ...newPassport, address: e.target.value })}
                      placeholder="Flat 904, Tower B, South Bopal, Ahmedabad"
                      className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400">Purchase Price (INR)</label>
                    <input
                      type="number"
                      value={newPassport.purchasePriceRupees}
                      onChange={(e) => setNewPassport({ ...newPassport, purchasePriceRupees: e.target.value })}
                      className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400">Current Estimated Value (INR)</label>
                    <input
                      type="number"
                      value={newPassport.currentEstimatedRupees}
                      onChange={(e) => setNewPassport({ ...newPassport, currentEstimatedRupees: e.target.value })}
                      className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-emerald-500 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                    >
                      Create Private Passport
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Portfolio KPIs */}
            {summary && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <span className="font-mono text-[11px] text-slate-400">PORTFOLIO VALUE</span>
                  <p className="mt-1 font-mono text-2xl font-bold text-white">
                    {summary.totalEstimatedValueFormatted}
                  </p>
                  <span className="text-xs text-emerald-400">
                    Appreciation: {summary.appreciationPercent}% ({summary.appreciationFormatted})
                  </span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <span className="font-mono text-[11px] text-slate-400">ANNUAL RENTAL INCOME</span>
                  <p className="mt-1 font-mono text-2xl font-bold text-emerald-400">
                    {summary.annualRentalIncomeFormatted}
                  </p>
                  <span className="text-xs text-slate-400">Net Yield: {summary.netRentalYieldPercent}%</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <span className="font-mono text-[11px] text-slate-400">TRAILING 12M EXPENSES</span>
                  <p className="mt-1 font-mono text-2xl font-bold text-amber-300">
                    {summary.annualExpensesFormatted}
                  </p>
                  <span className="text-xs text-slate-400">
                    Properties: {summary.totalProperties} ({summary.vacantProperties} vacant)
                  </span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <span className="font-mono text-[11px] text-slate-400">60-DAY ALERTS</span>
                  <p className="mt-1 font-mono text-2xl font-bold text-sky-300">
                    {summary.upcomingAlerts.length}
                  </p>
                  <span className="text-xs text-slate-400">Lease renewals &amp; open maintenance</span>
                </div>
              </div>
            )}

            {/* Alerts List */}
            {summary && summary.upcomingAlerts.length > 0 && (
              <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                  <Bell className="h-4 w-4" />
                  Upcoming Lease Expiry &amp; Maintenance Alerts
                </h3>
                <ul className="mt-2 space-y-1 text-xs text-amber-100">
                  {summary.upcomingAlerts.map((a, i) => (
                    <li key={i} className="font-mono">
                      [{a.type}] {a.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Passports List */}
            <div className="mt-8 space-y-4">
              {passports.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
                  <Building className="mx-auto h-10 w-10 text-slate-600" />
                  <h3 className="mt-3 text-base font-medium text-white">No Digital Property Passports yet</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Create your first private Property Passport above to track acquisition cost, leases, expenses, and
                    maintenance timelines.
                  </p>
                </div>
              ) : (
                passports.map((p) => (
                  <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs text-emerald-400">{p.passportCode}</span>
                        <h3 className="mt-1 text-lg font-semibold text-white">{p.nickname}</h3>
                        <p className="text-xs text-slate-400">
                          {p.address} &middot; {p.locality}, {p.city}
                        </p>
                      </div>
                      <span className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1 font-mono text-xs text-slate-200">
                        {p.occupancyStatus}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-4 text-xs">
                      <div className="rounded bg-slate-950 p-3">
                        <span className="text-slate-500">Purchase Price</span>
                        <p className="mt-1 font-mono text-sm font-semibold text-white">
                          {formatPaise(p.purchasePricePaise)}
                        </p>
                      </div>
                      <div className="rounded bg-slate-950 p-3">
                        <span className="text-slate-500">Est. Value</span>
                        <p className="mt-1 font-mono text-sm font-semibold text-emerald-300">
                          {formatPaise(p.currentEstimatedPaise)}
                        </p>
                      </div>
                      <div className="rounded bg-slate-950 p-3">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Users className="h-3 w-3" /> Active Leases
                        </span>
                        <p className="mt-1 font-mono text-sm font-semibold text-white">{p.leases.length}</p>
                      </div>
                      <div className="rounded bg-slate-950 p-3">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Receipt className="h-3 w-3" /> Expenses / <Wrench className="h-3 w-3" /> Maint.
                        </span>
                        <p className="mt-1 font-mono text-sm font-semibold text-white">
                          {p.expenses.length} / {p.maintenanceRecords.length}
                        </p>
                      </div>
                    </div>

                    {p.timelineEvents.length > 0 && (
                      <div className="mt-4 border-t border-slate-800 pt-3">
                        <p className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                          <FileText className="h-3.5 w-3.5" /> RECENT TIMELINE
                        </p>
                        <ul className="mt-2 space-y-1 text-xs text-slate-300">
                          {p.timelineEvents.slice(0, 3).map((ev) => (
                            <li key={ev.id}>
                              <span className="font-mono text-slate-500">
                                {new Date(ev.eventDate).toISOString().split('T')[0]}
                              </span>{' '}
                              &middot; <span className="text-emerald-300">{ev.eventType}</span> &mdash; {ev.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
