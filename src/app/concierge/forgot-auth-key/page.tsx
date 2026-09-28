'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ConciergeForgotAuthKeyPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/concierge/auth/forgot-auth-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError('Unable to process recovery request. Please contact your Concierge Manager.');
      }
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
            Concierge Key Recovery
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
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-neutral-400 leading-relaxed">
                Enter your verified staff email. If authenticated in the Concierge employee roster, a recovery challenge will be generated.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Work Email / Staff ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@proventa.in"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-amber-500/60 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950 rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{loading ? 'Dispatched Request...' : 'Send Recovery Link'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center py-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 mb-1">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-100">Recovery Challenge Initiated</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                If an active employee account matches <strong>{email}</strong>, a recovery link has been dispatched.
              </p>
              <div className="pt-2">
                <Link
                  href="/concierge/sign-in"
                  className="text-xs text-amber-400 font-semibold hover:underline"
                >
                  Return to Concierge Sign In
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
