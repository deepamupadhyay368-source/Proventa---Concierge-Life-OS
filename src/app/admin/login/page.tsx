'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, KeyRound, Sparkles } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authenticationKey, setAuthenticationKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === 'Unauthorized'
      ? 'Access restricted. This portal requires an active Super Admin, Admin, or Support role.'
      : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your founder email and access credentials.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        authenticationKey: authenticationKey.trim() || undefined,
        securityKey: authenticationKey.trim() || undefined,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setError('Invalid admin credentials or account does not have administrative privileges.');
      } else if (res?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('A secure gateway handshake error occurred. Please check network connectivity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#1F2933] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#1F2933] selection:text-white relative overflow-hidden live-bg-canvas">
      {/* Moving Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-[#E5E9ED]/60 via-[#F1F3F5]/40 to-transparent blur-[120px] pointer-events-none -z-10 rounded-full live-orb-1" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-[#F7F8FA]/80 via-[#E1E5E8]/30 to-transparent blur-[140px] pointer-events-none -z-10 rounded-full live-orb-2" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E1E5E8] text-[#1F2933] text-[11px] font-mono tracking-widest uppercase mb-2 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Root Authentication Gateway</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1F2933]">
            PROVENTA
          </h1>
          <p className="text-xs text-[#66717C] tracking-widest uppercase font-mono">
            Founder &amp; Autonomous Operations Terminal
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-[#E1E5E8] rounded-2xl p-8 shadow-lg space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[#1F2933] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#1F2933]" />
              Elevated Session Access
            </h2>
            <p className="text-xs text-[#66717C]">
              Only authenticated administrators, founders, and system operators may proceed.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#1F2933] tracking-wide uppercase font-semibold">
                Admin Identifier / Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@proventa.dev"
                  required
                  autoComplete="username"
                  className="w-full bg-[#F7F8FA] border border-[#E1E5E8] rounded-xl px-4 py-3 pl-10 text-xs text-[#1F2933] placeholder-[#A7B0B8] focus:outline-none focus:border-[#1F2933] focus:bg-white focus:ring-1 focus:ring-[#1F2933] transition-all font-mono"
                />
                <Mail className="w-4 h-4 text-[#66717C] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono text-[#1F2933] tracking-wide uppercase font-semibold">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#F7F8FA] border border-[#E1E5E8] rounded-xl px-4 py-3 pl-10 text-xs text-[#1F2933] placeholder-[#A7B0B8] focus:outline-none focus:border-[#1F2933] focus:bg-white focus:ring-1 focus:ring-[#1F2933] transition-all font-mono"
                />
                <Lock className="w-4 h-4 text-[#66717C] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono text-[#66717C] tracking-wide uppercase font-medium">
                  Authentication Key <span className="text-[10px] text-[#A7B0B8] normal-case">(if configured)</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={authenticationKey}
                  onChange={(e) => setAuthenticationKey(e.target.value)}
                  placeholder="Optional authentication key"
                  autoComplete="off"
                  className="w-full bg-[#F7F8FA] border border-[#E1E5E8] rounded-xl px-4 py-3 pl-10 text-xs text-[#1F2933] placeholder-[#A7B0B8] focus:outline-none focus:border-[#1F2933] focus:bg-white focus:ring-1 focus:ring-[#1F2933] transition-all font-mono"
                />
                <KeyRound className="w-4 h-4 text-[#66717C] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#1F2933] hover:bg-[#111820] text-white font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Guarantee */}
          <div className="pt-4 border-t border-[#E1E5E8] flex items-center justify-between text-[11px] text-[#66717C] font-mono">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#1F2933]" />
              Secure Cryptographic Session
            </span>
            <span>AES-256 GCM</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-[#66717C] space-y-1">
          <p>© {new Date().getFullYear()} Proventa Technologies Inc. All rights reserved.</p>
          <p className="text-[10px] text-[#A7B0B8] font-mono">
            Direct Founder Access · Deepam G Upadhyay
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center text-xs font-mono text-[#1F2933]">Loading Secure Portal...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}

