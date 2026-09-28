'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KeyRound, Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotAuthKeyPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-auth-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError('Unable to process recovery request. Please try again.');
      }
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
            Recover Authentication Key
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
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-[#6e6b65] leading-relaxed">
                Enter the email address associated with your Proventa account. If verified, we will send an Authentication Key reset link.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#141312] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8680]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-3.5 py-3 bg-[#faf8f5] border border-[#ded7cc] rounded-xl text-xs text-[#141312] focus:outline-none focus:border-[#6d5941]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#1f1b16] hover:bg-[#332d26] text-[#faf8f5] rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin text-[#ddc8a9]" />}
                <span>{loading ? 'Dispatched Request...' : 'Send Recovery Link'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center py-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mb-1">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-[#141312]">Recovery Dispatched</h3>
              <p className="text-xs text-[#6e6b65] leading-relaxed">
                If an active Proventa account matches <strong>{email}</strong>, a secure recovery challenge has been sent.
              </p>
              <div className="pt-2">
                <Link
                  href="/sign-in"
                  className="text-xs text-[#8a7053] font-semibold hover:underline"
                >
                  Return to Sign In
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
