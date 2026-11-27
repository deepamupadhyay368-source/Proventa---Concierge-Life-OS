'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Bookmark,
  Building,
  CheckCheck,
  Download,
  FileText,
  Lock,
  Pencil,
  Plus,
  Receipt,
  ShieldCheck,
  Trash2,
  Upload,
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
    leaseStartDate: string;
    leaseEndDate: string;
    status: string;
  }>;
  maintenanceRecords: Array<{ id: string; title: string; costPaise: string; status: string; scheduledDate: string | null }>;
  timelineEvents: Array<{ id: string; eventType: string; eventDate: string; title: string }>;
  documents?: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    sha256Checksum: string;
    downloadUrl: string;
  }>;
}

interface WatchlistItem {
  id: string;
  targetType: string;
  targetIdOrSlug: string;
  targetLabel: string;
  alertFrequency: string;
}

interface NotificationItem {
  id: string;
  category: string;
  title: string;
  message: string;
  targetUrl: string | null;
  isRead: boolean;
  createdAt: string;
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
  const [watchlists, setWatchlists] = useState<WatchlistItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [activeActionPassportId, setActiveActionPassportId] = useState<string | null>(null);
  const [actionTab, setActionTab] = useState<'EXPENSE' | 'LEASE' | 'MAINTENANCE' | 'DOCUMENT' | 'TIMELINE'>('EXPENSE');
  const [expForm, setExpForm] = useState({
    category: 'PROPERTY_TAX',
    amountRupees: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [leaseForm, setLeaseForm] = useState({
    tenantName: '',
    monthlyRentRupees: '',
    leaseStartDate: new Date().toISOString().split('T')[0],
    leaseEndDate: '',
  });
  const [maintForm, setMaintForm] = useState({ title: '', costRupees: '0', scheduledDate: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [timelineForm, setTimelineForm] = useState({
    eventType: 'RENOVATION',
    eventDate: new Date().toISOString().split('T')[0],
    title: '',
  });

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

      const [wlRes, notifRes] = await Promise.all([
        fetch('/api/real-estate/watchlists'),
        fetch('/api/real-estate/notifications'),
      ]);
      if (wlRes.ok) {
        const wlData = await wlRes.json();
        setWatchlists(wlData.watchlists || []);
      }
      if (notifRes.ok) {
        const nData = await notifRes.json();
        setNotifications(nData.notifications || []);
        setUnreadCount(nData.unreadCount || 0);
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

  async function submitChildAction(e: React.FormEvent, passportId: string) {
    e.preventDefault();
    setFeedback(null);

    if (actionTab === 'DOCUMENT') {
      if (!uploadFile) {
        setFeedback('Please choose a PDF, PNG, JPEG, or WEBP file to upload.');
        return;
      }
      const fd = new FormData();
      fd.append('passportId', passportId);
      fd.append('file', uploadFile);
      const res = await fetch('/api/real-estate/property-os/documents', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error || 'Document upload failed.');
        return;
      }
      setFeedback(`Uploaded private document ${data.document.fileName} (SHA-256 verified).`);
      setUploadFile(null);
      setActiveActionPassportId(null);
      loadPortfolio();
      return;
    }

    let payload: Record<string, unknown> = { passportId };
    if (actionTab === 'EXPENSE') {
      payload = {
        action: 'ADD_EXPENSE',
        passportId,
        category: expForm.category,
        amountRupees: Number(expForm.amountRupees),
        expenseDate: expForm.expenseDate,
        description: expForm.description,
      };
    } else if (actionTab === 'LEASE') {
      payload = {
        action: 'ADD_LEASE',
        passportId,
        tenantName: leaseForm.tenantName,
        monthlyRentRupees: Number(leaseForm.monthlyRentRupees),
        leaseStartDate: leaseForm.leaseStartDate,
        leaseEndDate: leaseForm.leaseEndDate,
      };
    } else if (actionTab === 'MAINTENANCE') {
      payload = {
        action: 'ADD_MAINTENANCE',
        passportId,
        title: maintForm.title,
        costRupees: Number(maintForm.costRupees || 0),
        scheduledDate: maintForm.scheduledDate || null,
      };
    } else {
      payload = {
        action: 'ADD_TIMELINE',
        passportId,
        eventType: timelineForm.eventType,
        eventDate: timelineForm.eventDate,
        title: timelineForm.title,
      };
    }

    const res = await fetch('/api/real-estate/property-os', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback(data.error || 'Action failed.');
      return;
    }
    setFeedback(`Saved ${actionTab.toLowerCase()} record to private Property Passport.`);
    setActiveActionPassportId(null);
    loadPortfolio();
  }

  async function handleEditExpense(exp: { id: string; description: string; amountPaise: string }) {
    const newAmtStr = window.prompt('Update expense amount (INR):', String(Number(BigInt(exp.amountPaise)) / 100));
    if (!newAmtStr) return;
    const amountRupees = Number(newAmtStr);
    if (!Number.isFinite(amountRupees) || amountRupees <= 0) return;
    const res = await fetch('/api/real-estate/property-os', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'UPDATE_EXPENSE', id: exp.id, amountRupees }),
    });
    if (res.ok) {
      setFeedback('Updated expense record and refreshed portfolio summary.');
      loadPortfolio();
    }
  }

  async function handleDeleteChild(type: 'EXPENSE' | 'LEASE', id: string) {
    const res = await fetch(`/api/real-estate/property-os?type=${type}&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setFeedback(`Deleted ${type.toLowerCase()} record.`);
      loadPortfolio();
    }
  }

  async function handleEditLease(lease: { id: string; monthlyRentPaise: string; status: string }) {
    const newRentStr = window.prompt('Update monthly rent (INR):', String(Number(BigInt(lease.monthlyRentPaise)) / 100));
    if (!newRentStr) return;
    const monthlyRentRupees = Number(newRentStr);
    if (!Number.isFinite(monthlyRentRupees) || monthlyRentRupees <= 0) return;
    const res = await fetch('/api/real-estate/property-os', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'UPDATE_LEASE', id: lease.id, monthlyRentRupees }),
    });
    if (res.ok) {
      setFeedback('Updated lease rent and refreshed rental summary.');
      loadPortfolio();
    }
  }

  async function handleDeleteDocument(docId: string) {
    const res = await fetch(`/api/real-estate/property-os/documents/${encodeURIComponent(docId)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setFeedback('Deleted private document.');
      loadPortfolio();
    }
  }

  async function handleRemoveWatchlist(id: string) {
    const res = await fetch(`/api/real-estate/watchlists?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) {
      setFeedback('Removed item from Watchlist.');
      loadPortfolio();
    }
  }

  async function handleMarkNotificationRead(id?: string) {
    const res = await fetch('/api/real-estate/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(id ? { id } : { markAllRead: true }),
    });
    if (res.ok) loadPortfolio();
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
              Full lifecycle management: passports, expense CRUD, lease CRUD, private binary documents, watchlists, and
              notifications. Strictly owner-isolated.
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
            <strong>Strict Privacy Isolation:</strong> Every Property Passport, expense, lease, private binary document,
            watchlist, and notification is scoped exclusively to your authenticated account and never leaked publicly.
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
              Digital Property Passports, binary documents, watchlists, and notifications require authentication to
              enforce strict per-owner isolation.
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
                  <span className="font-mono text-[11px] text-slate-400">NOTIFICATIONS &amp; ALERTS</span>
                  <p className="mt-1 font-mono text-2xl font-bold text-sky-300">
                    {unreadCount} unread / {summary.upcomingAlerts.length} alerts
                  </p>
                  <span className="text-xs text-slate-400">Watchlists: {watchlists.length}</span>
                </div>
              </div>
            )}

            {/* Watchlists & Notification Centre */}
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Bookmark className="h-4 w-4 text-emerald-400" />
                    Your Watchlists ({watchlists.length})
                  </h2>
                  <Link href="/property-intelligence" className="text-xs text-emerald-400 hover:underline">
                    + Browse Registry
                  </Link>
                </div>
                {watchlists.length === 0 ? (
                  <p className="mt-4 text-xs text-slate-500">
                    No watchlisted properties or corridors yet. Click &ldquo;+ Watch&rdquo; on any property in the
                    Living Property Registry.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2 text-xs">
                    {watchlists.map((w) => (
                      <li
                        key={w.id}
                        className="flex items-center justify-between rounded bg-slate-950 px-3 py-2"
                      >
                        <div>
                          <span className="font-mono text-[10px] text-emerald-400">{w.targetType}</span>
                          <p className="font-medium text-white">{w.targetLabel}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveWatchlist(w.id)}
                          className="text-rose-400 hover:text-rose-300"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Bell className="h-4 w-4 text-emerald-400" />
                    Notification Centre ({unreadCount} unread)
                  </h2>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMarkNotificationRead()}
                      className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                    >
                      <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className="mt-4 text-xs text-slate-500">
                    No notifications yet. PDF report completions and registry moderation updates appear here.
                  </p>
                ) : (
                  <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-xs">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`flex items-start justify-between gap-2 rounded px-3 py-2 ${
                          n.isRead ? 'bg-slate-950/50 text-slate-400' : 'border border-emerald-500/30 bg-slate-950 text-white'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{n.title}</p>
                          <p className="text-[11px] text-slate-400">{n.message}</p>
                        </div>
                        {!n.isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkNotificationRead(n.id)}
                            className="shrink-0 font-mono text-[10px] text-emerald-400 hover:underline"
                          >
                            Mark read
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Passports List */}
            <div className="mt-8 space-y-4">
              {passports.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
                  <Building className="mx-auto h-10 w-10 text-slate-600" />
                  <h3 className="mt-3 text-base font-medium text-white">No Digital Property Passports yet</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Create your first private Property Passport above to manage expenses, leases, private documents,
                    and timelines.
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
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveActionPassportId(activeActionPassportId === p.id ? null : p.id)
                          }
                          className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
                        >
                          {activeActionPassportId === p.id ? 'Close Records' : '+ Add Record / Upload'}
                        </button>
                        <span className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1 font-mono text-xs text-slate-200">
                          {p.occupancyStatus}
                        </span>
                      </div>
                    </div>

                    {activeActionPassportId === p.id && (
                      <form
                        onSubmit={(e) => submitChildAction(e, p.id)}
                        className="mt-4 space-y-3 rounded-lg border border-slate-700 bg-slate-950 p-4 text-xs"
                      >
                        <div className="flex flex-wrap gap-1.5">
                          {(['EXPENSE', 'LEASE', 'MAINTENANCE', 'DOCUMENT', 'TIMELINE'] as const).map((tab) => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setActionTab(tab)}
                              className={`rounded px-2.5 py-1 font-mono text-[11px] ${
                                actionTab === tab
                                  ? 'bg-emerald-500 font-semibold text-slate-950'
                                  : 'bg-slate-900 text-slate-400'
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        {actionTab === 'EXPENSE' && (
                          <div className="grid gap-2 sm:grid-cols-4">
                            <select
                              value={expForm.category}
                              onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                            >
                              <option value="PROPERTY_TAX">Property Tax</option>
                              <option value="MAINTENANCE">Maintenance</option>
                              <option value="RENOVATION">Renovation</option>
                              <option value="STAMP_DUTY_REGISTRATION">Stamp Duty</option>
                              <option value="INSURANCE">Insurance</option>
                            </select>
                            <input
                              required
                              type="number"
                              placeholder="Amount (INR)"
                              value={expForm.amountRupees}
                              onChange={(e) => setExpForm({ ...expForm, amountRupees: e.target.value })}
                              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                            />
                            <input
                              required
                              type="date"
                              value={expForm.expenseDate}
                              onChange={(e) => setExpForm({ ...expForm, expenseDate: e.target.value })}
                              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                            />
                            <input
                              required
                              placeholder="Description"
                              value={expForm.description}
                              onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                            />
                          </div>
                        )}

                        {actionTab === 'LEASE' && (
                          <div className="grid gap-2 sm:grid-cols-4">
                            <input
                              required
                              placeholder="Tenant Name"
                              value={leaseForm.tenantName}
                              onChange={(e) => setLeaseForm({ ...leaseForm, tenantName: e.target.value })}
                              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                            />
                            <input
                              required
                              type="number"
                              placeholder="Monthly Rent (INR)"
                              value={leaseForm.monthlyRentRupees}
                              onChange={(e) => setLeaseForm({ ...leaseForm, monthlyRentRupees: e.target.value })}
                              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                            />
                            <input
                              required
                              type="date"
                              value={leaseForm.leaseStartDate}
                              onChange={(e) => setLeaseForm({ ...leaseForm, leaseStartDate: e.target.value })}
                              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                            />
                            <input
                              required
                              type="date"
                              value={leaseForm.leaseEndDate}
                              onChange={(e) => setLeaseForm({ ...leaseForm, leaseEndDate: e.target.value })}
                              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                            />
                          </div>
                        )}

                        {actionTab === 'MAINTENANCE' && (
                          <div className="grid gap-2 sm:grid-cols-3">
                            <input
                              required
                              placeholder="Task Title"
                              value={maintForm.title}
                              onChange={(e) => setMaintForm({ ...maintForm, title: e.target.value })}
                              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                            />
                            <input
                              type="number"
                              placeholder="Est. Cost (INR)"
                              value={maintForm.costRupees}
                              onChange={(e) => setMaintForm({ ...maintForm, costRupees: e.target.value })}
                              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                            />
                            <input
                              type="date"
                              value={maintForm.scheduledDate}
                              onChange={(e) => setMaintForm({ ...maintForm, scheduledDate: e.target.value })}
                              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                            />
                          </div>
                        )}

                        {actionTab === 'DOCUMENT' && (
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <input
                              required
                              type="file"
                              accept="application/pdf,image/png,image/jpeg,image/webp"
                              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                              className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                            />
                            <span className="shrink-0 font-mono text-[10px] text-slate-400">
                              PDF/PNG/JPEG/WEBP &le; 10MB
                            </span>
                          </div>
                        )}

                        {actionTab === 'TIMELINE' && (
                          <div className="grid gap-2 sm:grid-cols-3">
                            <select
                              value={timelineForm.eventType}
                              onChange={(e) => setTimelineForm({ ...timelineForm, eventType: e.target.value })}
                              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                            >
                              <option value="RENOVATION">Renovation</option>
                              <option value="REGISTRATION">Registration</option>
                              <option value="REPAIR">Repair</option>
                              <option value="VALUATION_UPDATE">Valuation Update</option>
                            </select>
                            <input
                              required
                              type="date"
                              value={timelineForm.eventDate}
                              onChange={(e) => setTimelineForm({ ...timelineForm, eventDate: e.target.value })}
                              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                            />
                            <input
                              required
                              placeholder="Event Summary"
                              value={timelineForm.title}
                              onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })}
                              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                            />
                          </div>
                        )}

                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded bg-emerald-500 px-3.5 py-1.5 font-semibold text-slate-950 hover:bg-emerald-400"
                        >
                          {actionTab === 'DOCUMENT' ? <Upload className="h-3.5 w-3.5" /> : null}
                          Save {actionTab}
                        </button>
                      </form>
                    )}

                    <div className="mt-4 grid gap-3 text-xs sm:grid-cols-4">
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

                    {/* Expenses, Leases & Private Binary Documents Lists */}
                    <div className="mt-4 grid gap-4 border-t border-slate-800 pt-4 text-xs md:grid-cols-3">
                      <div>
                        <p className="font-mono text-[11px] text-slate-400">EXPENSES ({p.expenses.length})</p>
                        {p.expenses.length === 0 ? (
                          <p className="mt-1 text-slate-600">None recorded</p>
                        ) : (
                          <ul className="mt-2 space-y-1.5">
                            {p.expenses.map((exp) => (
                              <li key={exp.id} className="flex items-center justify-between rounded bg-slate-950 px-2.5 py-1.5">
                                <div>
                                  <p className="text-white">{exp.description}</p>
                                  <p className="font-mono text-[10px] text-amber-300">{formatPaise(exp.amountPaise)}</p>
                                </div>
                                <div className="flex gap-1.5">
                                  <button type="button" onClick={() => handleEditExpense(exp)} title="Edit expense" className="text-sky-400 hover:text-sky-300">
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button type="button" onClick={() => handleDeleteChild('EXPENSE', exp.id)} title="Delete expense" className="text-rose-400 hover:text-rose-300">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div>
                        <p className="font-mono text-[11px] text-slate-400">LEASES ({p.leases.length})</p>
                        {p.leases.length === 0 ? (
                          <p className="mt-1 text-slate-600">None recorded</p>
                        ) : (
                          <ul className="mt-2 space-y-1.5">
                            {p.leases.map((l) => (
                              <li key={l.id} className="flex items-center justify-between rounded bg-slate-950 px-2.5 py-1.5">
                                <div>
                                  <p className="text-white">{l.tenantName}</p>
                                  <p className="font-mono text-[10px] text-emerald-300">
                                    {formatPaise(l.monthlyRentPaise)}/mo &middot; ends {new Date(l.leaseEndDate).toISOString().split('T')[0]}
                                  </p>
                                </div>
                                <div className="flex gap-1.5">
                                  <button type="button" onClick={() => handleEditLease(l)} title="Edit lease" className="text-sky-400 hover:text-sky-300">
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button type="button" onClick={() => handleDeleteChild('LEASE', l.id)} title="Delete lease" className="text-rose-400 hover:text-rose-300">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div>
                        <p className="font-mono text-[11px] text-slate-400">
                          PRIVATE DOCUMENTS ({p.documents?.length ?? 0})
                        </p>
                        {!p.documents?.length ? (
                          <p className="mt-1 text-slate-600">No private files uploaded</p>
                        ) : (
                          <ul className="mt-2 space-y-1.5">
                            {p.documents.map((doc) => (
                              <li key={doc.id} className="flex items-center justify-between rounded bg-slate-950 px-2.5 py-1.5">
                                <span className="truncate pr-2 text-white">{doc.fileName}</span>
                                <div className="flex shrink-0 gap-2">
                                  <a href={doc.downloadUrl} title="Download private document" className="text-emerald-400 hover:text-emerald-300">
                                    <Download className="h-3.5 w-3.5" />
                                  </a>
                                  <button type="button" onClick={() => handleDeleteDocument(doc.id)} title="Delete document" className="text-rose-400 hover:text-rose-300">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
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
