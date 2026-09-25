'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Check,
  Clock,
  Search,
  Send,
  UserCheck,
  UserPlus,
  RefreshCw,
  Ban,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Loader2,
  Users,
} from 'lucide-react';

export default function AdminWave1Page() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'WAITLISTED' | 'INVITED' | 'REGISTERED'>('ALL');
  const [loading, setLoading] = useState(true);

  // Direct Invitation Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('Ahmedabad');
  const [newNotes, setNewNotes] = useState('');
  const [creating, setCreating] = useState(false);

  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<{ name: string; email: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/wave1');
      const data = await res.json();
      if (data.registrations) setRegistrations(data.registrations);
      if (data.invitations) setInvitations(data.invitations);
      if (data.stats) setStats(data.stats);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDirectInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;
    setCreating(true);
    setActionMessage(null);

    try {
      const res = await fetch('/api/admin/wave1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          name: newName,
          email: newEmail,
          phone: newPhone,
          city: newCity,
          notes: newNotes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.inviteUrl) {
        setInviteUrl({ name: newName, email: newEmail, url: data.inviteUrl });
        setCreateModalOpen(false);
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        setNewNotes('');
        await loadData();
      } else {
        alert(data.error || 'Failed to create invitation');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleInviteRegistration = async (registrationId: string) => {
    setInvitingId(registrationId);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/wave1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE', registrationId }),
      });
      const data = await res.json();
      if (res.ok && data.inviteUrl) {
        const reg = registrations.find((r) => r.id === registrationId);
        setInviteUrl({ name: reg?.name || 'Member', email: reg?.email || '', url: data.inviteUrl });
        await loadData();
      }
    } finally {
      setInvitingId(null);
    }
  };

  const handleResend = async (invitationId: string) => {
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/wave1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESEND', invitationId }),
      });
      const data = await res.json();
      if (res.ok && data.inviteUrl) {
        setActionMessage('Fresh invitation token generated and dispatched.');
        await loadData();
      } else {
        alert(data.error || 'Failed to resend');
      }
    } catch {
      alert('Error during resend');
    }
  };

  const handleRevoke = async (invitationId: string) => {
    if (!confirm('Are you sure you want to revoke this invitation? The link will immediately stop working.')) return;
    try {
      const res = await fetch('/api/admin/wave1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REVOKE', invitationId }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage('Invitation revoked successfully.');
        await loadData();
      }
    } catch {
      alert('Error revoking invitation');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = registrations.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      (r.phone && r.phone.includes(search));
    const matchFilter = filter === 'ALL' || r.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <span>Wave 1 Private Beta Invitations</span>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
              Founder Control
            </span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage cohort candidate waitlist, issue cryptographically secure invitations, and monitor beta onboarding.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-neutral-200 rounded-lg text-xs bg-white focus:outline-none w-56"
            />
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Create Invitation</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm">
          <div className="text-[11px] font-medium text-neutral-500">Waitlist Candidates</div>
          <div className="text-xl font-bold text-neutral-900 mt-1">{stats.waitlisted || 0}</div>
        </div>
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm">
          <div className="text-[11px] font-medium text-blue-600">Invitations Dispatched</div>
          <div className="text-xl font-bold text-blue-900 mt-1">{stats.invited || 0}</div>
        </div>
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm">
          <div className="text-[11px] font-medium text-emerald-600">Active Beta Members</div>
          <div className="text-xl font-bold text-emerald-900 mt-1">{stats.registered || 0}</div>
        </div>
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm">
          <div className="text-[11px] font-medium text-neutral-500">Active Unused Tokens</div>
          <div className="text-xl font-bold text-neutral-900 mt-1">{stats.activeInvitations || 0}</div>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-600 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Generated Invite Link Banner */}
      {inviteUrl && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-900">
              ✓ Invitation Link Ready for {inviteUrl.name} ({inviteUrl.email})
            </span>
            <button
              onClick={() => copyToClipboard(inviteUrl.url)}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-200/70 hover:bg-amber-300/70 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-700" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Link'}</span>
            </button>
          </div>
          <div className="p-2.5 bg-white border border-amber-200 rounded-lg font-mono text-[11px] text-neutral-800 break-all select-all">
            {inviteUrl.url}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-200 pb-2 text-xs">
        {(['ALL', 'WAITLISTED', 'INVITED', 'REGISTERED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === tab ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Registrations List */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400">Loading Wave 1 candidates...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">No matching registrations found.</div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filtered.map((r) => {
              const latestInv = r.invitations && r.invitations.length > 0 ? r.invitations[0] : null;
              const isInvited = r.status === 'INVITED';
              const isRegistered = r.status === 'REGISTERED';

              return (
                <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/50 transition-colors">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-900">{r.name}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isRegistered ? 'bg-emerald-100 text-emerald-800' :
                        isInvited ? 'bg-blue-100 text-blue-800' :
                        'bg-neutral-100 text-neutral-700'
                      }`}>
                        {r.status}
                      </span>
                      <span className="text-xs text-neutral-400">{r.city}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono">
                      <span>{r.email}</span>
                      {r.phone && <span>• {r.phone}</span>}
                      {r.company && <span>• {r.company}</span>}
                    </div>
                    {latestInv && (
                      <div className="text-[10px] text-neutral-400">
                        Invited {new Date(latestInv.sentAt).toLocaleDateString()} · Expires {new Date(latestInv.expiresAt).toLocaleDateString()}
                        {latestInv.revokedAt && <span className="text-rose-500 font-semibold ml-1">(REVOKED)</span>}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {r.status === 'WAITLISTED' && (
                      <button
                        onClick={() => handleInviteRegistration(r.id)}
                        disabled={invitingId === r.id}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {invitingId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        <span>Send Invite</span>
                      </button>
                    )}

                    {isInvited && latestInv && !latestInv.acceptedAt && !latestInv.revokedAt && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleResend(latestInv.id)}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                          title="Generate fresh link and resend"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Resend</span>
                        </button>
                        <button
                          onClick={() => handleRevoke(latestInv.id)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                          title="Revoke invitation"
                        >
                          <Ban className="h-3 w-3" />
                          <span>Revoke</span>
                        </button>
                      </div>
                    )}

                    {isRegistered && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <Check className="h-3.5 w-3.5" />
                        <span>Active Founding Member</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Direct Invitation Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-amber-600" />
                <span>Create Wave 1 Private Beta Invitation</span>
              </h2>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDirectInvite} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Arjun Mehta"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Work / Personal Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="arjun.mehta@example.com"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Mobile Number (Optional)</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">City Hub</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Internal Founder Notes</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Founding cohort invitee"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3.5 py-2 border border-neutral-200 rounded-lg font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  <span>Generate Invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
