'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getAuthenticationKeyStrength } from '@/lib/validation/schemas';

function ConciergeResetAuthKeyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newKey, setNewKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(
    !token ? 'Missing or invalid recovery token. Please request a new recovery link from your manager.' : null
  );

  const strength = getAuthenticationKeyStrength(newKey);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError('Missing recovery token.');
      return;
    }

    if (newKey.length < 8) {
      setError('Authentication Key must be at least 8 characters long.');
      return;
    }

    if (newKey !== confirmKey) {
      setError('Authentication Keys do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/concierge/auth/reset-auth-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newAuthenticationKey: newKey,
          confirmNewAuthenticationKey: confirmKey,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to reset Concierge Authentication Key.');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-1 shadow-lg shadow-amber-500/10">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-100">
            Set Concierge Authentication Key
          </h1>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            "Your private key. Your Proventa identity."
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  New Concierge Authentication Key *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="password"
                    required
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Enter new private key (min 8 chars)"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Confirm New Authentication Key *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="password"
                    required
                    value={confirmKey}
                    onChange={(e) => setConfirmKey(e.target.value)}
                    placeholder="Re-enter new private key"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950 rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{loading ? 'Resetting Key...' : 'Reset Authentication Key'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center py-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 mb-1">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-100">Concierge Key Reset Complete</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Your Concierge Authentication Key has been updated. You can now access the Concierge Workspace.
              </p>
              <div className="pt-2">
                <Link
                  href="/concierge/sign-in"
                  className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950 rounded-xl text-xs font-semibold"
                >
                  Sign In to Concierge Desk
                </Link>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-neutral-800 text-center">
            <Link
              href="/concierge/sign-in"
              className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Concierge Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConciergeResetAuthKeyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-xs text-amber-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      }
    >
      <ConciergeResetAuthKeyForm />
    </Suspense>
  );
}
