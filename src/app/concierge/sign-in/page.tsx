'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

function ConciergeSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/concierge/tasks';
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === 'Unauthorized' ? 'Access denied. Valid Concierge credentials required.' : null
  );

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your work email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/concierge/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid employee credentials. Please try again.');
        setLoading(false);
        return;
      }

      // Successfully authenticated
      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      setError('Network or server error while authenticating. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Brand & Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-neutral-950 font-bold text-xl shadow-lg shadow-amber-500/20 mb-2">
          P
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl font-bold tracking-wider text-neutral-100">PROVENTA</span>
          <span className="text-[11px] uppercase tracking-widest font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
            Concierge Desk
          </span>
        </div>
        <h1 className="text-lg font-medium text-neutral-300">
          Employee Operations Sign-In
        </h1>
        <p className="text-xs text-neutral-400 max-w-xs mx-auto">
          Separate authentication required for Proventa Concierge execution workstations.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-800/50 rounded-xl flex items-start gap-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{error}</div>
        </div>
      )}

      {/* Login Form */}
      <div className="bg-neutral-900/70 border border-neutral-800/80 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/50 space-y-6">
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Work Email / Employee ID
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@proventa.in"
                className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-semibold text-xs rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Concierge Desk</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Policy footer */}
        <div className="pt-4 border-t border-neutral-800/80 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-400/80 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Zero-Fabrication & Strict RBAC Active</span>
          </div>
          <p className="text-[10px] text-neutral-500 leading-relaxed">
            Confidential internal operations system. Access is monitored and audited.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConciergeSignInPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center px-4 selection:bg-amber-500/30 selection:text-amber-200">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading Concierge Operations Desk...</span>
          </div>
        }
      >
        <ConciergeSignInForm />
      </Suspense>
    </div>
  );
}
