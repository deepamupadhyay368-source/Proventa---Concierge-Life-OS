'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function ConciergeCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadCustomers() {
    try {
      setLoading(true);
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/concierge/customers${params}`);
      if (res.ok) {
        const json = await res.json();
        setCustomers(json.customers || []);
      }
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 text-amber-400" />
            <span>Private Clients Directory</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Access member profiles, VIP preferences, past booking history, and contact details
          </p>
        </div>

        <button
          onClick={loadCustomers}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search private clients by name, email, or phone number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadCustomers()}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {/* Customer List */}
      <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-16 text-center text-neutral-500 text-xs">Loading clients...</div>
        ) : customers.length === 0 ? (
          <div className="p-16 text-center text-neutral-400 text-xs">No matching client records found.</div>
        ) : (
          <div className="divide-y divide-neutral-800/60">
            {customers.map((c) => (
              <div
                key={c.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-amber-300 text-sm">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-100">{c.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {c.membershipTier}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-neutral-500" />
                        <span>{c.email}</span>
                      </span>
                      {c.phone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="h-3 w-3 text-neutral-500" />
                          <span>{c.phone}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-neutral-500" />
                        <span>{c.city}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right text-xs">
                    <div className="font-mono font-bold text-neutral-200">{c.tasksCount} Requests</div>
                    <div className="text-[10px] text-neutral-500">Lifetime handled</div>
                  </div>
                  <Link
                    href={`/concierge/tasks?search=${encodeURIComponent(c.name)}`}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-xs font-medium text-neutral-200 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>View Tasks</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
