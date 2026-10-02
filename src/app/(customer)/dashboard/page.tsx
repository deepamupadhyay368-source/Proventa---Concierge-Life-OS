'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MessageSquare,
  ChevronRight,
  ListTodo,
  ShieldCheck,
  UserCheck,
  Plus,
  Lock
} from 'lucide-react';
import { getWelcomeMessage } from '@/lib/auth/greeting';
import { MembershipGate } from '@/components/membership/MembershipGate';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get('welcome') === 'true';

  const [input, setInput] = useState('');
  const [urgency, setUrgency] = useState<'NORMAL' | 'URGENT' | 'ASAP'>('NORMAL');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showMembershipGateModal, setShowMembershipGateModal] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    name?: string | null;
    email?: string;
    customerProfile?: {
      membershipPlan?: string | null;
      membershipStatus?: string | null;
      membershipRenewsAt?: string | null;
      freeRequestUsed?: boolean;
    } | null;
    entitlement?: {
      hasActiveMembership: boolean;
      freeRequestAvailable: boolean;
      freeRequestUsed: boolean;
      canCreateRequest: boolean;
      state: 'FREE_REQUEST_AVAILABLE' | 'FREE_REQUEST_USED' | 'ACTIVE_MEMBER';
    } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/tasks')
        .then((res) => (res.ok ? res.json() : { tasks: [] }))
        .catch(() => ({ tasks: [] })),
      fetch('/api/customer/profile')
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    ])
      .then(([tasksData, profileData]) => {
        if (tasksData?.tasks) setTasks(tasksData.tasks);
        if (profileData?.profile) setUserProfile(profileData.profile);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const entitlement = userProfile?.entitlement || {
    hasActiveMembership: userProfile?.customerProfile?.membershipStatus === 'ACTIVE',
    freeRequestAvailable:
      !(userProfile?.customerProfile?.membershipStatus === 'ACTIVE') &&
      !(userProfile?.customerProfile?.freeRequestUsed || (tasks && tasks.length > 0)),
    freeRequestUsed: Boolean(userProfile?.customerProfile?.freeRequestUsed || (tasks && tasks.length > 0)),
    canCreateRequest:
      userProfile?.customerProfile?.membershipStatus === 'ACTIVE' ||
      !(userProfile?.customerProfile?.freeRequestUsed || (tasks && tasks.length > 0)),
    state:
      userProfile?.customerProfile?.membershipStatus === 'ACTIVE'
        ? 'ACTIVE_MEMBER'
        : Boolean(userProfile?.customerProfile?.freeRequestUsed || (tasks && tasks.length > 0))
        ? 'FREE_REQUEST_USED'
        : 'FREE_REQUEST_AVAILABLE',
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || submitting) return;

    if (!entitlement.canCreateRequest) {
      setShowMembershipGateModal(true);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      // Direct integration into Proventa Task Execution Orchestration Engine
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput: input, urgency }),
      });

      if (res.status === 401) {
        router.push(`/sign-in?callbackUrl=${encodeURIComponent('/dashboard#new-request')}`);
        return;
      }

      if (res.status === 402) {
        setShowMembershipGateModal(true);
        setSubmitting(false);
        return;
      }

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON response, fallback
      }

      if (data?.code === 'MEMBERSHIP_REQUIRED') {
        setShowMembershipGateModal(true);
        setSubmitting(false);
        return;
      }

      if (res.ok && data?.task?.id) {
        setInput('');
        router.push(`/tasks/${data.task.id}`);
        return;
      }

      // Fallback to requests endpoint if needed
      const legacyRes = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput: input, urgency }),
      });

      if (legacyRes.status === 401) {
        router.push(`/sign-in?callbackUrl=${encodeURIComponent('/dashboard#new-request')}`);
        return;
      }

      if (legacyRes.status === 402) {
        setShowMembershipGateModal(true);
        setSubmitting(false);
        return;
      }

      let legacyData: any = null;
      try {
        legacyData = await legacyRes.json();
      } catch {
        // Non-JSON response
      }

      if (legacyData?.code === 'MEMBERSHIP_REQUIRED') {
        setShowMembershipGateModal(true);
        setSubmitting(false);
        return;
      }

      if (legacyRes.ok && legacyData?.request?.id) {
        setInput('');
        router.push(`/requests/${legacyData.request.id}`);
        return;
      }

      const msg =
        data?.error ||
        legacyData?.error ||
        'Unable to submit your concierge request right now. Please try again shortly or contact support.';
      setErrorMessage(msg);
    } catch (err: any) {
      console.error('[Tell Proventa]', err);
      setErrorMessage(err.message || 'A network error occurred while communicating with the concierge desk.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeTasks = tasks.filter((t) => !['COMPLETED', 'CANCELLED'].includes(t.status));
  const pendingApprovals = tasks.filter((t) => t.status === 'AWAITING_APPROVAL');
  const confirmedTasks = tasks.filter((t) => ['CONFIRMED', 'COMPLETED'].includes(t.status));

  const welcomeGreeting = getWelcomeMessage({
    name: userProfile?.name,
    isFirstLogin: isWelcome,
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Premium Personalized Welcome Header */}
      <section className="pt-2 pb-1 border-b border-[#E1E5E8]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8]">
                <Sparkles className="h-3 w-3 text-[#1F2933]" />
                <span>
                  {entitlement.hasActiveMembership ? 'Private Member Dashboard' : 'Proventa Experience'}
                </span>
              </span>
              <span className="text-xs text-[#66717C] font-mono">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-[#1F2933] animate-fade-in">
              {welcomeGreeting.title}
            </h1>
            <p className="text-sm text-[#66717C] mt-1 font-sans">
              {welcomeGreeting.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {entitlement.canCreateRequest ? (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('new-request');
                  el?.scrollIntoView({ behavior: 'smooth' });
                  const textarea = el?.querySelector('textarea');
                  textarea?.focus();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F2933] hover:bg-[#111820] text-white rounded-xl text-xs font-medium transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-[#A7B0B8]" />
                <span>+ New Request</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowMembershipGateModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F2933] hover:bg-[#111820] text-white rounded-xl text-xs font-medium transition-colors shadow-xs cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#A7B0B8]" />
                <span>View Memberships</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 1. Free Request Available Banner */}
      {entitlement.freeRequestAvailable && (
        <section className="bg-gradient-to-r from-[#F7F8FA] to-white border border-[#E1E5E8] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white border border-[#E1E5E8] flex items-center justify-center text-[#1F2933] shadow-xs shrink-0">
              <Sparkles className="h-5 w-5 text-[#1F2933]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wide text-[#111820]">
                  Your first request is on us.
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-medium bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8]">
                  Complimentary
                </span>
              </div>
              <p className="text-xs text-[#66717C] mt-0.5">
                Experience Proventa before choosing a membership. Submit any request below to start.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('new-request');
              el?.scrollIntoView({ behavior: 'smooth' });
              const textarea = el?.querySelector('textarea');
              textarea?.focus();
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1F2933] hover:bg-[#111820] text-white rounded-xl text-xs font-medium transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <span>+ New Request</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#A7B0B8]" />
          </button>
        </section>
      )}

      {/* 2. Free Request Consumed & No Active Membership -> Gate Banner */}
      {!entitlement.hasActiveMembership && entitlement.freeRequestUsed && (
        <section className="bg-white border border-[#E1E5E8] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] flex items-center justify-center text-[#1F2933] shrink-0">
              <Lock className="h-5 w-5 text-[#1F2933]" />
            </div>
            <div>
              <div className="text-xs font-semibold tracking-wide text-[#111820]">
                Your complimentary Proventa request has been used.
              </div>
              <p className="text-xs text-[#66717C] mt-0.5">
                Choose a membership to continue having Proventa handle more of your life.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowMembershipGateModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#111820] hover:bg-[#1F2933] text-white rounded-xl text-xs font-medium transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <span>View Memberships</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#A7B0B8]" />
          </button>
        </section>
      )}

      {/* 3. Active Membership Status Banner */}
      {entitlement.hasActiveMembership && userProfile && (
        <section className="bg-white border border-[#E1E5E8] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] flex items-center justify-center text-[#1F2933]">
              <ShieldCheck className="h-6 w-6 text-[#1F2933]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#66717C]">
                  Active Membership
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {userProfile.customerProfile?.membershipStatus || 'ACTIVE'}
                </span>
              </div>
              <div className="text-base font-bold text-[#111820] mt-0.5 flex items-center gap-2">
                <span>PROVENTA {userProfile.customerProfile?.membershipPlan || 'SELECT'}</span>
                <span className="text-xs font-normal text-[#66717C]">
                  {userProfile.customerProfile?.membershipPlan === 'RESERVE'
                    ? '• ₹9,999/month'
                    : userProfile.customerProfile?.membershipPlan === 'PRIVATE'
                    ? '• ₹4,999/month'
                    : '• ₹2,499/month'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-left sm:text-right">
              <span className="text-[#66717C] block text-[11px]">Next Renewal</span>
              <span className="font-semibold text-[#111820]">
                {userProfile.customerProfile?.membershipRenewsAt
                  ? new Date(userProfile.customerProfile.membershipRenewsAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Auto-renews monthly'}
              </span>
            </div>
            <Link
              href="/profile"
              className="px-3.5 py-2 rounded-xl bg-[#F1F3F5] hover:bg-[#E1E5E8] border border-[#E1E5E8] text-xs font-semibold text-[#1F2933] transition-colors"
            >
              Manage Membership
            </Link>
          </div>
        </section>
      )}

      {isWelcome && (
        <div className="p-4 bg-[#F7F8FA] border border-[#E1E5E8] rounded-xl text-sm text-[#1F2933] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#1F2933]" />
            <span>Welcome to Proventa. Your concierge is ready. Tell us what you need handled below.</span>
          </div>
        </div>
      )}

      {/* Hero Request Creation Box */}
      <section id="new-request" className="bg-white rounded-2xl border border-[#E1E5E8] p-6 sm:p-8 shadow-xs">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#66717C]">Concierge Life OS</p>
          <h2 className="text-2xl font-semibold text-[#1F2933] mt-1">What can we take care of?</h2>
          <p className="text-xs text-[#66717C] mt-1">
            Plain language. No category selection required. A concierge will review and verify every detail.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Request Not Dispatched</span>
              <span className="text-red-600">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* If membership is required to create request, show inline Membership Gate */}
        {!entitlement.canCreateRequest ? (
          <div className="py-2">
            <MembershipGate
              mode="inline"
              title="Your first Proventa request is complete."
              subtitle="Ready to have Proventa handle more of your life? Choose a membership to continue."
            />
          </div>
        ) : (
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="relative">
              <textarea
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Find me a quiet rooftop restaurant for Saturday for four people, around ₹2,000 per person, and arrange the reservation."
                className="w-full p-4 border border-[#E1E5E8] bg-[#F7F8FA] focus:bg-white focus:border-[#1F2933] rounded-xl text-sm text-[#1F2933] focus:outline-none placeholder:text-[#A7B0B8] resize-none transition-colors"
                required
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#66717C] font-medium">Urgency:</span>
                {(['NORMAL', 'URGENT', 'ASAP'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgency(lvl)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      urgency === lvl
                        ? 'bg-[#1F2933] text-white'
                        : 'bg-[#F1F3F5] text-[#66717C] hover:bg-[#E5E9ED]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting || !input.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F2933] hover:bg-[#111820] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {submitting ? 'Understanding your request...' : 'Tell Proventa'}
                <ArrowRight className="h-4 w-4 text-[#A7B0B8]" />
              </button>
            </div>

            {/* Quick Ahmedabad Delegation Prompts */}
            <div className="pt-2 border-t border-[#E1E5E8] flex items-center gap-2 overflow-x-auto text-xs py-1 scrollbar-none">
              <span className="text-[#66717C] shrink-0 font-medium">Quick suggestions:</span>
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
                  className="shrink-0 px-2.5 py-1 bg-[#F7F8FA] hover:bg-[#F1F3F5] border border-[#E1E5E8] text-[#1F2933] rounded-lg text-[11px] transition-colors cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </form>
        )}
      </section>

      {/* Curated Ahmedabad Directory Showcase */}
      <section className="bg-white border border-[#E1E5E8] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#1F2933]">Ahmedabad Network Live</span>
            </div>
            <h2 className="text-lg font-serif font-medium text-[#1F2933] mt-1">36 Verified Establishments in Ahmedabad</h2>
            <p className="text-xs text-[#66717C]">From UNESCO heritage dining to Sindhu Bhavan luxury hubs and GIFT City protocols.</p>
          </div>
          <Link
            href="/what-we-handle"
            className="text-xs font-semibold text-[#1F2933] hover:underline inline-flex items-center gap-1 shrink-0"
          >
            Explore all services <ArrowRight className="h-3.5 w-3.5 text-[#A7B0B8]" />
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
              className="text-left p-3 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] hover:border-[#1F2933] hover:bg-white hover:shadow-xs transition-all group cursor-pointer"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#66717C] block">{item.tag}</span>
              <p className="text-xs font-medium text-[#1F2933] mt-0.5 line-clamp-1">{item.name}</p>
              <span className="text-[10px] text-[#A7B0B8] mt-1 block font-mono">{item.count}</span>
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
                  Your concierge agent has prepared recommendations and requires your confirmation before booking.
                </p>
              </div>
            </div>
            <Link
              href={`/tasks/${pendingApprovals[0].id}`}
              className="px-4 py-2 bg-amber-800 text-white rounded-lg text-xs font-medium hover:bg-amber-900 transition-colors"
            >
              Review Now
            </Link>
          </div>
        </section>
      )}

      {/* Active Tasks & Delegations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-[#1F2933]" />
            <h2 className="text-lg font-semibold text-[#1F2933]">Active Delegations</h2>
          </div>
          <Link href="/tasks" className="text-xs text-[#66717C] hover:text-[#1F2933] font-medium">
            View Task Execution Center ({tasks.length})
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-[#66717C]">Loading tasks...</div>
        ) : activeTasks.length === 0 ? (
          <div className="p-8 bg-white border border-[#E1E5E8] rounded-xl text-center">
            <p className="text-sm font-medium text-[#1F2933]">No active tasks</p>
            <p className="text-xs text-[#66717C] mt-1">
              {entitlement.freeRequestAvailable
                ? 'Your first request is on us. Tell us what you need in the box above to get started.'
                : 'Tell us what you need in the box above to get started.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {activeTasks.map((t) => {
              const isNeedsHuman = t.status === 'NEEDS_HUMAN';
              const isAwaitingApproval = t.status === 'AWAITING_APPROVAL';

              return (
                <Link
                  key={t.id}
                  href={`/tasks/${t.id}`}
                  className="p-5 bg-white border border-[#E1E5E8] rounded-xl hover:border-[#1F2933] hover:shadow-xs transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          isAwaitingApproval
                            ? 'bg-amber-100 text-amber-800'
                            : isNeedsHuman
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-[#F1F3F5] text-[#1F2933]'
                        }`}
                      >
                        {isAwaitingApproval && <ShieldCheck className="h-3 w-3" />}
                        {isNeedsHuman && <UserCheck className="h-3 w-3" />}
                        {!isAwaitingApproval && !isNeedsHuman && <Clock className="h-3 w-3" />}
                        {t.status.replace(/_/g, ' ')}
                      </span>
                      {t.priority !== 'NORMAL' && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                          {t.priority}
                        </span>
                      )}
                      <span className="text-xs font-mono text-[#66717C]">#{t.publicId}</span>
                    </div>

                    <p className="text-sm font-medium text-[#1F2933] group-hover:text-[#111820] transition-colors">
                      {t.intent}
                    </p>

                    <p className="text-xs text-[#66717C] line-clamp-1">{t.originalRequest}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#66717C] hidden sm:block font-mono">
                      {new Date(t.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <ChevronRight className="h-5 w-5 text-[#A7B0B8] group-hover:text-[#1F2933] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Completed History Preview */}
      {confirmedTasks.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#66717C]">
              Fulfilled Delegations ({confirmedTasks.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {confirmedTasks.slice(0, 4).map((t) => (
              <Link
                key={t.id}
                href={`/tasks/${t.id}`}
                className="p-4 bg-white border border-[#E1E5E8] rounded-xl hover:border-[#1F2933] transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#66717C]">#{t.publicId}</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#1F2933] mt-1 line-clamp-1">{t.intent}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#A7B0B8] group-hover:text-[#1F2933] transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Membership Gate Modal */}
      {showMembershipGateModal && (
        <MembershipGate
          mode="modal"
          isOpen={showMembershipGateModal}
          onClose={() => setShowMembershipGateModal(false)}
          title="Your first Proventa request is complete."
          subtitle="Ready to have Proventa handle more of your life? Choose a membership to continue."
        />
      )}
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#66717C]">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
