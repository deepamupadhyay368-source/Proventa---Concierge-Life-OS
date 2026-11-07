'use client';

import React, { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  KeyRound,
  Check,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function RecoverPassKeyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [newPassKey, setNewPassKey] = useState('');
  const [confirmPassKey, setConfirmPassKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const formatDigits = (raw: string): string => {
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 12);
    if (digits.length > 8) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
    } else if (digits.length > 4) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
    }
    return digits;
  };

  const handlePassKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassKey(formatDigits(e.target.value));
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassKey(formatDigits(e.target.value));
  };

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
      setError('Google identity verification failed. Please try again.');
      setLoading(false);
    }
  };

  const handleResetPassKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPassKey = newPassKey.replace(/[^0-9]/g, '');
    const cleanConfirm = confirmPassKey.replace(/[^0-9]/g, '');

    if (cleanPassKey.length !== 12) {
      setError('Your new PROVENTA Pass Key must be exactly 12 numeric digits.');
      return;
    }

    if (cleanPassKey !== cleanConfirm) {
      setError('The confirmation Pass Key does not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/recover-passkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassKey: cleanPassKey,
          confirmPassKey: cleanConfirm,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to update Pass Key. Please try again.');
      } else {
        setIsSuccess(true);
        await signOut({ redirect: false });
      }
    } catch {
      setError('Network error while resetting Pass Key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] flex items-center justify-center px-4 py-16 font-sans selection:bg-[#536B88] selection:text-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-[#536B88] text-[#FFFFFF] flex items-center justify-center font-heading font-black text-lg shadow-sm rounded-sm">
              P
            </div>
            <span className="font-heading text-2xl tracking-[0.14em] uppercase font-black text-[#FFFFFF]">
              PROVENTA
            </span>
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A8ADB7] font-semibold">
            Industrial Procurement Platform
          </p>
        </div>

        <div className="border border-[#414957] bg-[#303746] p-8 shadow-sm space-y-6 rounded-sm">
          <div className="border-b border-[#414957] pb-4">
            <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-[#FFFFFF]">
              Recover Pass Key
            </h1>
            <p className="text-xs text-[#A8ADB7] mt-1">
              Verify your identity via Google to set a new 12-digit numeric Pass Key.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 bg-[#252B38] border border-[#D9534F] text-xs text-[#D9534F] font-medium rounded-sm"
            >
              {error}
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-6">
              <div className="p-4 bg-[#252B38] border border-[#4A7C59] flex items-start gap-3 rounded-sm">
                <Check className="w-5 h-5 text-[#4A7C59] shrink-0 mt-0.5" />
                <div className="text-xs text-[#F1F2F4] space-y-1">
                  <span className="font-bold text-[#FFFFFF] uppercase tracking-wider block">
                    Pass Key Updated Successfully
                  </span>
                  <p className="text-[#A8ADB7]">
                    Your new 12-digit numeric Pass Key has been encrypted and secured.
                    Please sign in using your registered email and your new pass key.
                  </p>
                </div>
              </div>

              <Link
                href="/sign-in?recovered=true"
                className="w-full py-3.5 bg-[#C66A42] text-white hover:bg-[#B35A33] font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm rounded-sm"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : session?.user ? (
            /* STEP 2: CREATE NEW 12-DIGIT PASS KEY */
            <form onSubmit={handleResetPassKey} className="space-y-5">
              <div className="p-3.5 bg-[#252B38] border border-[#414957] space-y-1 rounded-sm">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#A8ADB7]">VERIFIED IDENTITY:</span>
                  <span className="text-[#536B88] flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#536B88]" />
                    {session.user.email}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
                  Enter New 12-Digit Pass Key
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newPassKey}
                  onChange={handlePassKeyChange}
                  placeholder="1234-5678-9012"
                  maxLength={14}
                  required
                  autoComplete="new-password"
                  className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none font-mono font-bold text-sm tracking-widest text-[#FFFFFF] placeholder-[#A8ADB7] transition-colors rounded-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
                  Confirm New 12-Digit Pass Key
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={confirmPassKey}
                  onChange={handleConfirmChange}
                  placeholder="1234-5678-9012"
                  maxLength={14}
                  required
                  autoComplete="new-password"
                  className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none font-mono font-bold text-sm tracking-widest text-[#FFFFFF] placeholder-[#A8ADB7] transition-colors rounded-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#C66A42] text-white hover:bg-[#B35A33] disabled:opacity-50 font-heading font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm rounded-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Set New 12-Digit Pass Key</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 1: VERIFY IDENTITY WITH GOOGLE */
            <div className="space-y-6">
              <div className="p-4 bg-[#252B38] border border-[#414957] text-xs font-mono text-[#A8ADB7] space-y-2 rounded-sm">
                <p>
                  To rotate your private 12-digit Pass Key, you must verify ownership of your registered Google account.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-[#414957] bg-[#252B38] hover:bg-[#191B20] text-xs font-heading font-bold uppercase tracking-wider text-[#FFFFFF] transition-all shadow-sm disabled:opacity-50 rounded-sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#FFFFFF]" />
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
                <span>Verify with Google</span>
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-[#414957] text-center">
            <Link
              href="/sign-in"
              className="text-xs font-mono text-[#A8ADB7] hover:text-[#FFFFFF] uppercase tracking-wider font-bold"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
