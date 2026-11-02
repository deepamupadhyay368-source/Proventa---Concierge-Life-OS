'use client';

import React, { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Check,
  Copy,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export default function RecoverPassKeyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [newPassKey, setNewPassKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmedSaved, setConfirmedSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn(
        'google',
        { callbackUrl: '/recover-passkey' },
        { prompt: 'select_account' },
      );
    } catch {
      setError('Google verification failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGenerateNewKey = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/recover-passkey', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to rotate pass key.');
        setLoading(false);
        return;
      }
      setNewPassKey(data.passKey);
    } catch {
      setError('Network error rotating pass key.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!newPassKey) return;
    try {
      await navigator.clipboard.writeText(newPassKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleEnterCockpit = () => {
    if (!confirmedSaved) return;
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171C26] border border-[#252C38] rounded-xs font-mono text-[10px] uppercase tracking-widest text-[#7595FF]">
            <KeyRound className="w-3 h-3 text-[#2457FF]" />
            <span>SOVEREIGN KEY RECOVERY</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-[#F4F6FA] uppercase">
            Recover Pass Key
          </h1>
          <p className="font-mono text-xs text-[#858D9B]">
            Google-authenticated key rotation &amp; reissuance protocol.
          </p>
        </div>

        <div className="mt-8 bg-[#171C26] border border-[#252C38] rounded-xs p-6 sm:p-8 space-y-6 shadow-2xl">
          {error && (
            <div className="p-3.5 bg-[#FF7A70]/10 border border-[#FF7A70] rounded-xs text-xs text-[#FF7A70] font-medium">
              {error}
            </div>
          )}

          {/* Phase 3: NEW PASS KEY DISPLAY */}
          {newPassKey ? (
            <div className="space-y-6">
              <div className="p-4 bg-[#2457FF]/10 border border-[#2457FF]/30 rounded-xs flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#7595FF] shrink-0 mt-0.5" />
                <div className="text-xs text-[#C5CAD3] space-y-1">
                  <span className="font-bold text-[#F4F6FA] uppercase tracking-wider block">
                    New 12-Digit Numeric Pass Key Issued
                  </span>
                  <p>
                    Your previous pass key has been permanently revoked. Store this new 12-digit pass key safely. 
                    You will use it with your email address for all future logins.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#858D9B]">
                  Your New 12-Digit Pass Key
                </label>
                <div className="p-4 bg-[#090B10] border border-[#2457FF] rounded-xs flex items-center justify-between gap-2">
                  <span className="font-mono font-black text-lg sm:text-2xl text-[#7595FF] tracking-[0.15em] select-all break-all">
                    {newPassKey}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-2 bg-[#2457FF] text-white hover:bg-[#1D4ED8] font-mono text-xs uppercase font-bold rounded-xs flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 p-3 bg-[#090B10] border border-[#252C38] rounded-xs cursor-pointer hover:border-[#7595FF] transition-colors">
                <input
                  type="checkbox"
                  checked={confirmedSaved}
                  onChange={(e) => setConfirmedSaved(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-xs border-[#252C38] bg-[#171C26] text-[#2457FF] focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-[#C5CAD3] leading-snug">
                  I have securely copied and saved my new <strong className="text-white">12-Digit PROVENTA Pass Key</strong>.
                </span>
              </label>

              <button
                type="button"
                onClick={handleEnterCockpit}
                disabled={!confirmedSaved}
                className="w-full py-3.5 bg-[#2457FF] text-white hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed font-heading font-bold text-xs uppercase tracking-wider rounded-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Financial Cockpit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : status === 'authenticated' && session?.user ? (
            /* Phase 2: GOOGLE AUTHENTICATED -> ISSUE NEW KEY */
            <div className="space-y-5">
              <div className="p-4 bg-[#090B10] border border-[#252C38] rounded-xs space-y-2">
                <div className="font-mono text-[10px] uppercase text-[#7595FF] tracking-wider font-semibold">
                  Verified Google Identity
                </div>
                <div className="text-sm font-bold text-[#F4F6FA]">{session.user.name}</div>
                <div className="text-xs text-[#858D9B] font-mono">{session.user.email}</div>
              </div>

              <p className="text-xs text-[#C5CAD3] leading-relaxed">
                Clicking below will revoke your old pass key and generate a fresh, unique 12-digit numeric PROVENTA Pass Key for your account.
              </p>

              <button
                type="button"
                onClick={handleGenerateNewKey}
                disabled={loading}
                className="w-full py-3.5 bg-[#2457FF] text-white hover:bg-[#1D4ED8] disabled:opacity-50 font-heading font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reissuing Sovereign Key...</span>
                  </>
                ) : (
                  <>
                    <span>Generate New 12-Digit Pass Key</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link href="/sign-in" className="text-xs font-mono text-[#858D9B] hover:text-white uppercase tracking-wider">
                  ← Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            /* Phase 1: REQUEST GOOGLE IDENTITY VERIFICATION */
            <div className="space-y-5">
              <div className="p-4 bg-[#FF7A70]/10 border border-[#FF7A70]/30 rounded-xs flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-[#FF7A70] shrink-0 mt-0.5" />
                <div className="text-xs text-[#C5CAD3] space-y-1">
                  <span className="font-bold text-[#F4F6FA] uppercase tracking-wider block">
                    Zero-Knowledge Protection
                  </span>
                  <p>
                    PROVENTA servers never store your plaintext pass key. To reissue a lost key, you must authenticate through your verified Google account.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-[#252C38] rounded-xs bg-[#F4F6FA] hover:bg-white text-xs font-heading font-bold uppercase tracking-wider text-[#090B10] transition-all shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#090B10]" />
                ) : (
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Verify with Google to Reissue Key</span>
              </button>

              <div className="text-center pt-2">
                <Link href="/sign-in" className="text-xs font-mono text-[#858D9B] hover:text-white uppercase tracking-wider">
                  ← Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
