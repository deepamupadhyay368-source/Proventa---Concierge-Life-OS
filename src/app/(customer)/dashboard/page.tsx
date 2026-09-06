'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, ArrowRight, Clock, CheckCircle2, AlertCircle, Calendar, MessageSquare, ChevronRight } from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get('welcome') === 'true';

  const [input, setInput] = useState('');
  const [urgency, setUrgency] = useState<'NORMAL' | 'URGENT' | 'ASAP'>('NORMAL');
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/requests')
      .then((res) => res.json())
      .then((data) => {
        if (data.requests) setRequests(data.requests);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput: input, urgency }),
      });
      const data = await res.json();
      if (res.ok && data.request) {
        setInput('');
        router.push(`/requests/${data.request.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const activeRequests = requests.filter((r) => !['COMPLETED', 'CANCELLED'].includes(r.status));
  const pendingApprovals = requests.flatMap((r) => r.approvals || []);
  const bookings = requests.flatMap((r) => r.bookings || []).filter((b) => b.status === 'CONFIRMED');

  return (
    <div className="space-y-8 pb-12">
      {isWelcome && (
        <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-brand-700" />
            <span>Welcome to Proventa Wave 1. Your concierge is ready. Tell us what you need handled below.</span>
          </div>
        </div>
      )}

      {/* Hero Request Creation Box */}
      <section id="new-request" className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Concierge Life OS</p>
          <h1 className="text-2xl font-semibold text-neutral-900 mt-1">What can we take care of?</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Plain language. No category selection required. A concierge will review and verify every detail.
          </p>
        </div>

        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div className="relative">
            <textarea
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Find me a quiet rooftop restaurant for Saturday for four people, around ₹2,000 per person, and arrange the reservation."
              className="w-full p-4 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400 resize-none"
              required
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-medium">Urgency:</span>
              {(['NORMAL', 'URGENT', 'ASAP'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setUrgency(lvl)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    urgency === lvl
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting || !input.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting to Concierge...' : 'Tell Proventa'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Ahmedabad Delegation Prompts */}
          <div className="pt-2 border-t border-neutral-100 flex items-center gap-2 overflow-x-auto text-xs py-1 scrollbar-none">
            <span className="text-neutral-400 shrink-0 font-medium">Quick suggestions:</span>
            {[
              { label: 'Dinner at Agashiye', text: 'Reserve a quiet terrace table for 4 at Agashiye for Saturday 8:00 PM.' },
              { label: 'Airport Chauffeur', text: 'Arrange an executive sedan pickup from SVPIA Airport to Bodakdev tomorrow at 11:30 AM.' },
              { label: 'ITC Narmada Spa', text: 'Book an afternoon Ayurvedic Kaya Kalp massage at ITC Narmada for two.' },
              { label: 'GIFT City Boardroom', text: 'Reserve an executive boardroom at GIFT City with audiovisual setup for Thursday.' },
            ].map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setInput(s.text)}
                className="shrink-0 px-2.5 py-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-lg text-[11px] transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </form>
      </section>

      {/* Curated Ahmedabad Directory Showcase */}
      <section className="bg-gradient-to-br from-[#faf8f5] to-white border border-[#e8e2d8] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#8a7053]">Ahmedabad Network Live</span>
            </div>
            <h2 className="text-lg font-serif font-medium text-neutral-900 mt-1">36 Verified Establishments in Ahmedabad</h2>
            <p className="text-xs text-neutral-500">From UNESCO heritage dining to Sindhu Bhavan luxury hubs and GIFT City protocols.</p>
          </div>
          <Link
            href="/what-we-handle"
            className="text-xs font-semibold text-[#8a7053] hover:text-[#5a4937] inline-flex items-center gap-1 shrink-0"
          >
            Explore all services <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          {[
            { tag: 'Dining', name: 'Agashiye Heritage', count: '10 venues', sample: 'Reserve dinner at Agashiye for 2 this weekend' },
            { tag: 'Hotels', name: 'ITC Narmada & Taj', count: '6 hotels', sample: 'Check suite availability at ITC Narmada' },
            { tag: 'Transit', name: 'SVPIA Airport Fleet', count: 'Chauffeurs', sample: 'Arrange Mercedes airport pickup at 6 PM' },
            { tag: 'Wellness', name: 'Kaya Kalp & Spas', count: '5 sanctuaries', sample: 'Book a luxury spa package for Saturday' },
            { tag: 'Heritage', name: 'Calico & Adalaj', count: '5 sites', sample: 'Arrange a private guided tour of Calico Museum' },
            { tag: 'Shopping', name: 'Bandhej & TBZ', count: '7 boutiques', sample: 'Schedule private shopping appointment at Bandhej' },
          ].map((item) => (
            <button
              key={item.tag}
              type="button"
              onClick={() => {
                setInput(item.sample);
                const el = document.getElementById('new-request');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-left p-3 rounded-xl bg-white border border-[#e8e2d8] hover:border-[#b09a78] hover:shadow-xs transition-all group"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8a7053] block">{item.tag}</span>
              <p className="text-xs font-medium text-neutral-900 mt-0.5 group-hover:text-brand-900 line-clamp-1">{item.name}</p>
              <span className="text-[10px] text-neutral-400 mt-1 block">{item.count}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Pending Approvals Notice */}
      {pendingApprovals.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  {pendingApprovals.length} Proposal{pendingApprovals.length > 1 ? 's' : ''} Awaiting Your Approval
                </p>
                <p className="text-xs text-amber-700">
                  Your concierge has prepared recommendations and requires your confirmation before booking.
                </p>
              </div>
            </div>
            <Link
              href={`/requests/${pendingApprovals[0].requestId}`}
              className="px-4 py-2 bg-amber-800 text-white rounded-lg text-xs font-medium hover:bg-amber-900 transition-colors"
            >
              Review Now
            </Link>
          </div>
        </section>
      )}

      {/* Active Requests List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Active Requests</h2>
          <Link href="/requests" className="text-xs text-neutral-500 hover:text-neutral-900 font-medium">
            View all ({requests.length})
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-neutral-400">Loading requests...</div>
        ) : activeRequests.length === 0 ? (
          <div className="p-8 bg-white border border-neutral-200 rounded-xl text-center">
            <p className="text-sm font-medium text-neutral-700">No active requests</p>
            <p className="text-xs text-neutral-400 mt-1">Tell us what you need in the box above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {activeRequests.map((req) => (
              <Link
                key={req.id}
                href={`/requests/${req.id}`}
                className="p-5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-sm transition-all flex items-center justify-between"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-full">
                      {req.status.replace(/_/g, ' ')}
                    </span>
                    {req.urgency !== 'NORMAL' && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                        {req.urgency}
                      </span>
                    )}
                    <span className="text-xs text-neutral-400">
                      {new Date(req.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                    {req.aiSummary || req.rawInput}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-neutral-400">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Bookings */}
      {bookings.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Confirmed Bookings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bookings.map((b) => (
              <div key={b.id} className="p-5 bg-white border border-neutral-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Confirmed
                  </span>
                  <span className="text-xs text-neutral-400 number-mono">Ref: {b.confirmationRef || 'Verified'}</span>
                </div>
                <p className="text-sm font-semibold text-neutral-900">{b.provider?.name || 'Verified Provider'}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {b.details?.date ? new Date(b.details.date).toLocaleDateString() : 'Scheduled'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-neutral-400">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
