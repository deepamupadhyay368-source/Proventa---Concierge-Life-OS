'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // In production this hits the password recovery handler
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send recovery instructions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#202B38] flex items-center justify-center px-4 py-16 font-sans selection:bg-[#29465F] selection:text-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex flex-col items-center">
            <span className="font-editorial text-3xl font-normal tracking-tight text-[#202B38]">PROVENTA</span>
            <span className="text-[10px] font-mono tracking-widest text-[#29465F] uppercase font-bold">
              Real Estate Intelligence
            </span>
          </Link>
          <p className="text-xs text-[#697586]">
            Account Security & Recovery Desk
          </p>
        </div>

        <div className="border border-[#E8EBEF] bg-white p-8 space-y-6">
          <div className="border-b border-[#E8EBEF]/50 pb-4">
            <h1 className="font-editorial text-2xl font-normal text-[#202B38]">
              Password Recovery
            </h1>
            <p className="text-xs text-[#697586] mt-1">
              Enter the email associated with your PROVENTA account.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Recovery link dispatched</span>
                </div>
                <p>
                  If an account exists for <strong className="font-mono">{email}</strong>, we have dispatched secure password reset instructions.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full py-2.5 px-4 bg-[#29465F] text-white text-xs font-semibold text-center block hover:bg-[#29465F]/90"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-300 text-xs text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#202B38] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#697586]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8EBEF] text-xs text-[#202B38] placeholder-[#69717B] focus:outline-hidden focus:border-[#202B3C]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#29465F] text-white text-xs font-semibold hover:bg-[#29465F]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-xs"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="border border-[#E8EBEF] bg-white p-4 text-xs text-[#202B38] flex items-center justify-between shadow-xs">
          <span className="text-[#697586]">Remember your credentials?</span>
          <Link href="/login" className="text-[#29465F] hover:underline font-bold">
            Sign In →
          </Link>
        </div>
      </div>
    </div>
  );
}
