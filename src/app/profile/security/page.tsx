'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, KeyRound, Lock, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { getAuthenticationKeyStrength } from '@/lib/validation/schemas';

export default function CustomerSecurityPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [userProfile, setUserProfile] = useState<{ email?: string; name?: string; authKeyUpdatedAt?: string } | null>(null);
  const [showChangeModal, setShowChangeModal] = useState(false);
  
  const [currentKey, setCurrentKey] = useState('');
  const [newKey, setNewKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/customer/profile');
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data.user || data);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
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
      const res = await fetch('/api/auth/change-auth-key', {
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
        setError(data.error || 'Failed to update Authentication Key.');
        setLoading(false);
        return;
      }

      setSuccess('Your Proventa Authentication Key has been updated successfully.');
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
    <div className="min-h-screen bg-[#faf8f5] text-[#141312] px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8 font-sans">
        {/* Navigation & Header */}
        <div className="space-y-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-[#8a7053] hover:text-[#141312] font-semibold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-xl bg-[#ede8df] flex items-center justify-center text-[#6d5941] shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#141312]">Security &amp; Identity</h1>
              <p className="text-xs text-[#6e6b65]">Manage your Proventa credentials and access protections.</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{success}</div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Proventa Authentication Key Card */}
        <div className="bg-white border border-[#ded7cc] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ded7cc]/60 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[#8a7053]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#141312]">
                  Proventa Authentication Key
                </h2>
              </div>
              <p className="text-xs text-[#6e6b65] leading-relaxed">
                Your Authentication Key protects your Proventa identity and is required whenever you sign in.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[#faf8f5] rounded-xl border border-[#ede8df] space-y-1">
              <span className="text-[#8a8680] uppercase tracking-wider text-[10px] font-semibold">Security State</span>
              <p className="font-semibold text-[#141312]">One-Way Encrypted &amp; Enforced</p>
            </div>
            <div className="p-4 bg-[#faf8f5] rounded-xl border border-[#ede8df] space-y-1">
              <span className="text-[#8a8680] uppercase tracking-wider text-[10px] font-semibold">Last Changed</span>
              <p className="font-semibold text-[#141312]">
                {userProfile?.authKeyUpdatedAt
                  ? new Date(userProfile.authKeyUpdatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'Active since account registration'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowChangeModal(true); setError(null); setSuccess(null); }}
              className="px-4 py-2.5 bg-[#1f1b16] hover:bg-[#332d26] text-[#faf8f5] text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5 text-[#ddc8a9]" />
              <span>Change Authentication Key</span>
            </button>
            <Link
              href="/forgot-auth-key"
              className="px-4 py-2.5 bg-[#f5f3ef] hover:bg-[#ede8df] text-[#6d5941] text-xs font-semibold rounded-xl border border-[#ded7cc] transition-all flex items-center gap-2"
            >
              <span>Recover Authentication Key</span>
            </Link>
          </div>

          {/* Security Message */}
          <div className="p-3.5 bg-[#fbf9f6] rounded-xl border border-[#e8e2d8] text-[11px] text-[#6e6b65] leading-relaxed">
            <strong>Security Reminder:</strong> Never share your Authentication Key with anyone. Proventa personnel will never ask you to disclose it.
          </div>
        </div>

        {/* Change Key Modal / Expandable Form */}
        {showChangeModal && (
          <div className="bg-white border border-[#ded7cc] rounded-2xl p-6 shadow-md space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#ded7cc]/60 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#141312]">
                Update Authentication Key
              </h3>
              <button
                type="button"
                onClick={() => setShowChangeModal(false)}
                className="text-xs text-[#8a8680] hover:text-[#141312]"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleChangeKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#141312] uppercase tracking-wider mb-1.5">
                  Current Authentication Key *
                </label>
                <input
                  type="password"
                  required
                  value={currentKey}
                  onChange={(e) => setCurrentKey(e.target.value)}
                  placeholder="Enter current private key"
                  className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-[#ded7cc] rounded-xl text-xs text-[#141312] focus:outline-none focus:border-[#6d5941] font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#141312] uppercase tracking-wider mb-1.5">
                  New Authentication Key (min 8 characters) *
                </label>
                <input
                  type="password"
                  required
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="Enter new private key"
                  className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-[#ded7cc] rounded-xl text-xs text-[#141312] focus:outline-none focus:border-[#6d5941] font-sans"
                />
                {newKey && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#6e6b65]">Strength: <strong>{strength.label}</strong></span>
                      <span className="text-[#8a8680]">{strength.feedback}</span>
                    </div>
                    <div className="h-1 w-full bg-[#e8e2d8] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          strength.strength === 'STRONG' ? 'bg-emerald-500 w-full' :
                          strength.strength === 'MODERATE' ? 'bg-amber-500 w-2/3' : 'bg-red-500 w-1/3'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#141312] uppercase tracking-wider mb-1.5">
                  Confirm New Authentication Key *
                </label>
                <input
                  type="password"
                  required
                  value={confirmKey}
                  onChange={(e) => setConfirmKey(e.target.value)}
                  placeholder="Confirm new private key"
                  className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-[#ded7cc] rounded-xl text-xs text-[#141312] focus:outline-none focus:border-[#6d5941] font-sans"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="py-3 px-5 bg-[#1f1b16] hover:bg-[#332d26] text-[#faf8f5] text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin text-[#ddc8a9]" />}
                  <span>{loading ? 'Updating Key...' : 'Save New Key'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangeModal(false)}
                  className="py-3 px-4 bg-[#f5f3ef] hover:bg-[#ede8df] text-[#6e6b65] text-xs font-semibold rounded-xl border border-[#ded7cc] transition-all"
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
