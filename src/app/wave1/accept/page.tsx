'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, Lock, User, Mail, ArrowRight, KeyRound } from 'lucide-react';

function AcceptForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<{
    name: string;
    email: string;
    city?: string;
    expiresAt?: string;
  } | null>(null);

  const [verifying, setVerifying] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [confirmSecurityKey, setConfirmSecurityKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyInvitation() {
      if (!token) {
        setTokenError('No invitation token was provided.');
        setVerifying(false);
        return;
      }

      try {
        const res = await fetch(`/api/wave1/accept?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok || !data.valid) {
          setTokenError(data.error || 'This invitation is invalid or has expired.');
        } else {
          setInvitation(data);
        }
      } catch {
        setTokenError('Unable to verify invitation link. Please check your internet connection.');
      } finally {
        setVerifying(false);
      }
    }

    verifyInvitation();
  }, [token]);

  if (verifying) {
    return (
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600 mx-auto" />
        <p className="text-xs text-neutral-500">Verifying your Private Beta invitation...</p>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-semibold text-neutral-900">Invitation Unavailable</h1>
        <p className="text-xs text-neutral-500 leading-relaxed">{tokenError}</p>
        <div className="pt-4 border-t border-neutral-100 flex justify-center gap-3">
          <Link href="/sign-in" className="text-xs font-semibold text-amber-700 hover:underline">
            Already have an account? Sign In
          </Link>
          <span className="text-neutral-300">•</span>
          <Link href="/" className="text-xs text-neutral-500 hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (securityKey && securityKey !== confirmSecurityKey) {
      setError('Security keys do not match');
      return;
    }
    if (securityKey && securityKey.length < 4) {
      setError('Security Key must be at least 4 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/wave1/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
          securityKey: securityKey || undefined,
          confirmSecurityKey: confirmSecurityKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to accept invitation.');
      } else {
        router.push('/sign-in?verified=true&wave1=true');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-neutral-200 shadow-lg space-y-6">
      {/* Brand & Badge */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block">
          <p className="text-2xl font-serif font-semibold tracking-tight text-neutral-900">Proventa</p>
          <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-mono">Concierge Life OS</p>
        </Link>
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-[11px] text-amber-800 font-semibold tracking-wide">
            Wave 1 Private Beta
          </span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-lg font-semibold text-neutral-900">
          Welcome, {invitation?.name || 'Member'}
        </h1>
        <p className="text-xs text-neutral-500 leading-relaxed">
          You're invited to the exclusive Proventa Private Beta. Create your password to activate your founding member account.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Verified Invited Email (Locked to avoid impersonation) */}
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Invited Work / Personal Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="email"
              disabled
              value={invitation?.email || ''}
              className="w-full pl-10 pr-3 py-2 bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-600 cursor-not-allowed select-all"
            />
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">This invitation is linked strictly to this email address.</p>
        </div>

        {/* Create Password */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">Create Password *</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="At least 8 characters"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">Confirm Password *</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="••••••••••••"
            />
          </div>
        </div>

        {/* Create Personal Security Key */}
        <div className="pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-neutral-700 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-amber-600" />
              <span>Personal Security Key / PIN *</span>
            </label>
            <span className="text-[10px] text-neutral-400">Required at every login</span>
          </div>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="password"
              required
              value={securityKey}
              onChange={(e) => setSecurityKey(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="e.g. 6-digit PIN or secret phrase"
            />
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">Keep this confidential. You will insert this security key each time you access Proventa.</p>
        </div>

        {/* Confirm Security Key */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">Confirm Security Key *</label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="password"
              required
              value={confirmSecurityKey}
              onChange={(e) => setConfirmSecurityKey(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="Re-enter your security key"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Activating Founding Membership...</span>
            </>
          ) : (
            <>
              <span>Activate Account & Enter Proventa</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Security note */}
      <div className="pt-4 border-t border-neutral-100 text-center space-y-1 text-[11px] text-neutral-400">
        <div className="flex items-center justify-center gap-1 text-emerald-600 font-medium">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Encrypted Founding Member Onboarding</span>
        </div>
        <p className="text-[10px]">Your personal concierge desk is activated instantly upon onboarding.</p>
      </div>
    </div>
  );
}

export default function Wave1AcceptPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12 selection:bg-amber-500/20">
      <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400">Loading invitation...</div>}>
        <AcceptForm />
      </Suspense>
    </div>
  );
}
