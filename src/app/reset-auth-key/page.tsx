'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, Lock, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getAuthenticationKeyStrength } from '@/lib/validation/schemas';

function ResetAuthKeyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newKey, setNewKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(
    !token ? 'Missing or invalid recovery token. Please request a new recovery link.' : null
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
      const res = await fetch('/api/auth/reset-auth-key', {
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
        setError(data.error || 'Failed to reset Authentication Key.');
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
    <div className="min-h-screen bg-[#faf8f5] text-[#141312] flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#ede8df] text-[#6d5941] mb-1 shadow-xs">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#141312]">
            Set New Authentication Key
          </h1>
          <p className="text-xs text-[#6e6b65] max-w-xs mx-auto">
            "Your private key. Your Proventa identity."
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white border border-[#ded7cc] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#141312] mb-1.5">
                  New Proventa Authentication Key *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8680]" />
                  <input
                    type="password"
                    required
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Enter new private key (min 8 chars)"
                    className="w-full pl-10 pr-3.5 py-3 bg-[#faf8f5] border border-[#ded7cc] rounded-xl text-xs text-[#141312] focus:outline-none focus:border-[#6d5941]"
                  />
                </div>
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#141312] mb-1.5">
                  Confirm New Authentication Key *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8680]" />
                  <input
                    type="password"
                    required
                    value={confirmKey}
                    onChange={(e) => setConfirmKey(e.target.value)}
                    placeholder="Re-enter new private key"
                    className="w-full pl-10 pr-3.5 py-3 bg-[#faf8f5] border border-[#ded7cc] rounded-xl text-xs text-[#141312] focus:outline-none focus:border-[#6d5941]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-3.5 px-4 bg-[#1f1b16] hover:bg-[#332d26] text-[#faf8f5] rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin text-[#ddc8a9]" />}
                <span>{loading ? 'Resetting...' : 'Reset Authentication Key'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center py-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mb-1">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-[#141312]">Authentication Key Updated</h3>
              <p className="text-xs text-[#6e6b65] leading-relaxed">
                Your Proventa Authentication Key has been reset. You can now sign in to your dashboard.
              </p>
              <div className="pt-2">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center w-full py-3 px-4 bg-[#1f1b16] hover:bg-[#332d26] text-[#faf8f5] rounded-xl text-xs font-semibold"
                >
                  Sign In with New Key
                </Link>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#ded7cc]/60 text-center">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1 text-xs text-[#6e6b65] hover:text-[#141312]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetAuthKeyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center text-xs text-[#6d5941]">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      }
    >
      <ResetAuthKeyForm />
    </Suspense>
  );
}
