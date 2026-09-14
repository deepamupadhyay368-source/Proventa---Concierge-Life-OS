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
    <div className="min-h-screen bg-[#0c0b0a] text-[#f5f3ef] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#9c8260] selection:text-white relative overflow-hidden">
      {/* Subtle Luxury Atmospheric Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(156,130,96,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-y-0 w-full max-w-7xl mx-auto border-x border-[#23201c]/40 pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1916] border border-[#38332c] text-[#c8b99d] text-[11px] font-mono tracking-widest uppercase mb-2 shadow-inner">
            <ShieldCheck className="w-3.5 h-3.5 text-[#c8b99d]" />
            <span>Root Authentication Gateway</span>
          </div>
          <h1 className="text-3xl font-serif tracking-tight text-[#f5f3ef] font-semibold">
            PROVENTA
          </h1>
          <p className="text-xs text-[#928f88] tracking-widest uppercase font-mono">
            Founder &amp; Autonomous Operations Terminal
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#141210]/90 backdrop-blur-xl border border-[#2e2924] rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[#f5f3ef] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#c8b99d]" />
              Elevated Session Access
            </h2>
            <p className="text-xs text-[#7e7a73]">
              Only authenticated administrators, founders, and system operators may proceed.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#c8b99d] tracking-wide uppercase">
                Admin Identifier / Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@proventa.in"
                  required
                  autoComplete="username"
                  className="w-full bg-[#0c0b0a] border border-[#2e2924] rounded-xl px-4 py-3 pl-10 text-xs text-[#fafaf9] placeholder-[#57544f] focus:outline-none focus:border-[#9c8260] focus:ring-1 focus:ring-[#9c8260] transition-all font-mono"
                />
                <Mail className="w-4 h-4 text-[#6e6b65] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono text-[#c8b99d] tracking-wide uppercase">
                  Security Passkey
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
                  className="w-full bg-[#0c0b0a] border border-[#2e2924] rounded-xl px-4 py-3 pl-10 text-xs text-[#fafaf9] placeholder-[#57544f] focus:outline-none focus:border-[#9c8260] focus:ring-1 focus:ring-[#9c8260] transition-all font-mono"
                />
                <Lock className="w-4 h-4 text-[#6e6b65] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-[#b09a78] via-[#9c8260] to-[#8a7053] hover:from-[#c8b99d] hover:to-[#9c8260] text-black font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-black/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Verifying Root Key...</span>
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
          <div className="pt-4 border-t border-[#23201c] flex items-center justify-between text-[11px] text-[#6e6b65] font-mono">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#b09a78]" />
              Hardware-Assisted JWT
            </span>
            <span>AES-256 GCM</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-[#57544f] space-y-1">
          <p>© {new Date().getFullYear()} Proventa Technologies Inc. All rights reserved.</p>
          <p className="text-[10px] text-[#423e38] font-mono">
            Direct Founder Access · Deepam G Upadhyay
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0c0b0a] flex items-center justify-center text-xs font-mono text-[#c8b99d]">Loading Secure Portal...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}

