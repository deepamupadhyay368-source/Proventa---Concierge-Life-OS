'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { getAuthenticationKeyStrength } from '@/lib/validation/schemas';

export default function ConciergeSecurityPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profile, setProfile] = useState<{ email?: string; name?: string; role?: string } | null>(null);
  const [showChangeModal, setShowChangeModal] = useState(false);

  const [currentKey, setCurrentKey] = useState('');
  const [newKey, setNewKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/concierge/auth/session');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user || data);
        }
      } catch (err) {
        console.error('Failed to load concierge session:', err);
      } finally {
        setFetching(false);
      }
    }
    loadProfile();
  }, []);

  const strength = getAuthenticationKeyStrength(newKey);

  async function handleChangeKey(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newKey.length < 8) {
      setError('New Authentication Key must be at least 8 characters long.');
      return;
    }

    if (newKey !== confirmKey) {
      setError('New Authentication Keys do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/concierge/auth/change-auth-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentAuthenticationKey: currentKey,
          newAuthenticationKey: newKey,
          confirmNewAuthenticationKey: confirmKey,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to update Concierge Authentication Key.');
        setLoading(false);
        return;
      }

      setSuccess('Your Concierge Authentication Key has been updated successfully.');
      setCurrentKey('');
      setNewKey('');
      setConfirmKey('');
      setShowChangeModal(false);
    } catch (err) {
      setError('Network error updating Authentication Key. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8 font-sans">
        {/* Navigation & Header */}
        <div className="space-y-2">
          <Link
            href="/concierge/tasks"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Concierge Workspace
          </Link>
          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-100">Concierge Desk Security</h1>
              <p className="text-xs text-neutral-400">Employee authentication credentials &amp; workspace protections.</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {success && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-xl flex items-start gap-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{success}</div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-800/50 rounded-xl flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Concierge Authentication Key Card */}
        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-100">
                  Proventa Authentication Key
                </h2>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Required for every Concierge login and operations session.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-1">
              <span className="text-neutral-500 uppercase tracking-wider text-[10px] font-semibold">Security State</span>
              <p className="font-semibold text-neutral-200">Enforced for Concierge Access</p>
            </div>
            <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-1">
              <span className="text-neutral-500 uppercase tracking-wider text-[10px] font-semibold">Role Tier</span>
              <p className="font-semibold text-amber-400">{profile?.role || 'Senior Concierge'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowChangeModal(true); setError(null); setSuccess(null); }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 text-xs font-semibold rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Change Authentication Key</span>
            </button>
            <Link
              href="/concierge/forgot-auth-key"
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 transition-all flex items-center gap-2"
            >
              <span>Recover Authentication Key</span>
            </Link>
          </div>

          <div className="p-3.5 bg-amber-500/5 rounded-xl border border-amber-500/10 text-[11px] text-neutral-400 leading-relaxed">
            <strong>Security Reminder:</strong> Never share your Concierge Authentication Key. Proventa personnel and managers will never ask you to disclose it.
          </div>
        </div>

        {/* Change Key Modal */}
        {showChangeModal && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-100">
                Update Concierge Authentication Key
              </h3>
              <button
                type="button"
                onClick={() => setShowChangeModal(false)}
                className="text-xs text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleChangeKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Current Authentication Key *
                </label>
                <input
                  type="password"
                  required
                  value={currentKey}
                  onChange={(e) => setCurrentKey(e.target.value)}
                  placeholder="Enter current private key"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  New Authentication Key (min 8 characters) *
                </label>
                <input
                  type="password"
                  required
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="Enter new private key"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500/60"
                />
                {newKey && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400">Strength: <strong className="text-neutral-200">{strength.label}</strong></span>
                      <span className="text-neutral-500">{strength.feedback}</span>
                    </div>
                    <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          strength.strength === 'STRONG' ? 'bg-emerald-400 w-full' :
                          strength.strength === 'MODERATE' ? 'bg-amber-400 w-2/3' : 'bg-rose-500 w-1/3'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Confirm New Authentication Key *
                </label>
                <input
                  type="password"
                  required
                  value={confirmKey}
                  onChange={(e) => setConfirmKey(e.target.value)}
                  placeholder="Confirm new private key"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="py-3 px-5 bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950 text-xs font-semibold rounded-xl shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{loading ? 'Updating Key...' : 'Save New Key'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangeModal(false)}
                  className="py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl border border-neutral-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
