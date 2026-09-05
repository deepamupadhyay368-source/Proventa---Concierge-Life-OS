'use client';

import { useState, useEffect } from 'react';
import { Mail, Check, Clock, Search, Send, UserCheck } from 'lucide-react';

export default function AdminWave1Page() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'WAITLISTED' | 'INVITED' | 'REGISTERED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<{ id: string; url: string } | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/wave1');
      const data = await res.json();
      if (data.registrations) setRegistrations(data.registrations);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInvite = async (registrationId: string) => {
    setInviting(registrationId);
    try {
      const res = await fetch('/api/admin/wave1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      });
      const data = await res.json();
      if (res.ok && data.inviteUrl) {
        setInviteUrl({ id: registrationId, url: data.inviteUrl });
        loadData();
      }
    } finally {
      setInviting(null);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Wave 1 Early Access List</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Manage waitlisted candidates and send secure onboarding invitations.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-neutral-200 rounded-lg text-xs bg-white focus:outline-none w-60"
            />
          </div>
        </div>
      </div>

      {inviteUrl && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-xs space-y-1">
          <p className="font-semibold text-green-900">Invitation Generated & Sent via Email!</p>
          <p className="text-green-700">Direct Invitation Link: <span className="font-mono underline select-all">{inviteUrl.url}</span></p>
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

      {/* Registrations Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400">Loading registrations...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">No matching registrations found.</div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filtered.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-900">{r.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      r.status === 'REGISTERED' ? 'bg-green-100 text-green-800' :
                      r.status === 'INVITED' ? 'bg-blue-100 text-blue-800' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-neutral-400">{r.city}</span>
                  </div>

                  <p className="text-xs text-neutral-600">{r.email} {r.phone && `· ${r.phone}`}</p>
                  {r.intendedUse && (
                    <p className="text-[11px] text-neutral-500 italic mt-0.5 line-clamp-1">
                      &ldquo;{r.intendedUse}&rdquo;
                    </p>
                  )}
                </div>

                <div>
                  {r.status === 'WAITLISTED' && (
                    <button
                      onClick={() => handleInvite(r.id)}
                      disabled={inviting === r.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                    >
                      <Send className="h-3 w-3" />
                      <span>{inviting === r.id ? 'Inviting...' : 'Send Invitation'}</span>
                    </button>
                  )}
                  {r.status === 'INVITED' && (
                    <span className="text-xs text-neutral-400 font-medium">Invited ({new Date(r.invitedAt).toLocaleDateString()})</span>
                  )}
                  {r.status === 'REGISTERED' && (
                    <span className="text-xs text-green-700 font-medium flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5" /> Active Member
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
