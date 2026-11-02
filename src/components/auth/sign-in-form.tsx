'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { loginSchema } from '@/lib/validation/schemas';
import { Phone, Mail, ArrowRight, Loader2, KeyRound, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import type { z } from 'zod';
import { format12DigitPassKey } from '@/lib/auth/access-key';

type FormData = z.infer<typeof loginSchema>;

function getSafeCallbackUrl(raw?: string): string {
  if (!raw || typeof raw !== 'string') return '/dashboard';
  const trimmed = raw.trim();
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.startsWith('/\\')
  ) {
    return trimmed;
  }
  return '/dashboard';
}

export function SignInForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const safeCallback = getSafeCallbackUrl(callbackUrl);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  // Form input states
  const [email, setEmail] = useState('');
  const [passKey, setPassKey] = useState('');

  // Secondary methods
  const [showAlternative, setShowAlternative] = useState(false);
  const [altMethod, setAltMethod] = useState<'password' | 'phone'>('password');
  const [password, setPassword] = useState('');

  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Auto-format 12-digit pass key with hyphens XXXX-XXXX-XXXX as user types
  const handlePassKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Remove non-numeric characters for digits
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 12);
    let formatted = digits;
    if (digits.length > 8) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
    }
    setPassKey(formatted);
  };

  const handlePassKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !passKey.trim()) {
      setError('Please provide both your registered email and 12-digit Pass Key.');
      return;
    }

    setLoading(true);
    setError(null);

    const cleanPassKey = passKey.replace(/[^0-9]/g, '');
    if (cleanPassKey.length !== 12 && !passKey.trim().toUpperCase().startsWith('PROV-')) {
      setError('PROVENTA Pass Key must be exactly 12 numeric digits.');
      setLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        accessKey: cleanPassKey || passKey.trim(),
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes('TooManyAttempts') || result.error.includes('rate_limit')) {
          setError('Authentication temporarily locked due to excessive failed attempts. Please wait 15 minutes or recover via Google.');
        } else {
          setError('Invalid email or 12-digit Pass Key. Please verify your credentials.');
        }
      } else {
        router.push(safeCallback);
        router.refresh();
      }
    } catch {
      setError('Authentication service error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password: password,
        redirect: false,
      });
      if (result?.error) {
        setError('Invalid email or password.');
      } else {
        router.push(safeCallback);
        router.refresh();
      }
    } catch {
      setError('Sign in error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading('google');
    setError(null);
    try {
      await signIn(
        'google',
        {
          callbackUrl: safeCallback,
        },
        { prompt: 'select_account' },
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Continue with Google failed. Please try again.';
      setError(msg);
      setOauthLoading(null);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Please enter a valid mobile number.');
      return;
    }
    setPhoneLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send OTP code.');
      } else {
        setOtpSent(true);
        if (data.devOtpHint) {
          setDevOtpHint(data.devOtpHint);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error sending OTP.');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    setPhoneLoading(true);
    setError(null);
    try {
      const result = await signIn('phone-otp', {
        phone: phoneNumber,
        otp: otpCode,
        redirect: false,
      });
      if (result?.error) {
        setError('Invalid or expired OTP code. Please try again.');
      } else {
        router.push(safeCallback);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="p-3.5 bg-[#FF7A70]/10 border border-[#FF7A70] rounded-xs text-xs text-[#FF7A70] font-medium"
        >
          {error}
        </div>
      )}

      {/* PRIMARY AUTHENTICATION: 12-DIGIT PASS KEY FORM */}
      <form onSubmit={handlePassKeySubmit} className="space-y-4">
        {/* Email Address */}
        <div className="space-y-1">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C5CAD3]">
            Registered Institutional Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. trustee@familyoffice.in"
            required
            autoComplete="email"
            className="w-full px-3.5 py-2.5 bg-[#090B10] border border-[#252C38] focus:border-[#2457FF] focus:outline-none rounded-xs text-sm text-[#F4F6FA] placeholder-[#858D9B]/50 transition-colors"
          />
        </div>

        {/* 12-Digit Numeric Pass Key */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C5CAD3]">
              12-Digit PROVENTA Pass Key
            </label>
            <Link
              href="/recover-passkey"
              className="text-[10px] font-mono uppercase text-[#7595FF] hover:underline"
            >
              Lost Pass Key?
            </Link>
          </div>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={passKey}
              onChange={handlePassKeyChange}
              placeholder="1234-5678-9012"
              maxLength={14}
              required
              autoComplete="one-time-code"
              className="w-full px-3.5 py-2.5 bg-[#090B10] border border-[#252C38] focus:border-[#2457FF] focus:outline-none rounded-xs font-mono font-bold text-sm tracking-widest text-[#F4F6FA] placeholder-[#858D9B]/50 transition-colors"
            />
            <KeyRound className="w-4 h-4 text-[#858D9B] absolute right-3 top-3 pointer-events-none" />
          </div>
          <p className="text-[10px] font-mono text-[#858D9B]">
            Enter the 12-digit sovereign key issued during your initial registration.
          </p>
        </div>

        {/* Primary Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#2457FF] text-white hover:bg-[#1D4ED8] font-heading font-bold text-xs uppercase tracking-wider rounded-xs transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Sign In with Pass Key</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Recover with Google Link */}
      <div className="text-center">
        <Link
          href="/recover-passkey"
          className="text-xs font-mono text-[#858D9B] hover:text-[#7595FF] transition-colors"
        >
          Forgot or lost your 12-digit pass key? <span className="text-[#7595FF] underline">Recover with Google</span>
        </Link>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center pt-2">
        <div className="border-t border-[#252C38] w-full" />
        <span className="bg-[#171C26] px-3 font-mono text-[10px] uppercase tracking-widest text-[#858D9B] absolute">
          First-Time Registration
        </span>
      </div>

      {/* Google OAuth (For first-time registration and identity verification) */}
      <div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#252C38] rounded-xs bg-[#090B10] hover:bg-[#252C38]/60 text-xs font-heading font-bold uppercase tracking-wider text-[#F4F6FA] transition-all shadow-sm disabled:opacity-50"
        >
          {oauthLoading === 'google' ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
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
          <span>Continue with Google</span>
        </button>
        <p className="text-[10px] font-mono text-[#858D9B] text-center mt-1.5">
          New users verify their Google identity to establish a 12-digit pass key.
        </p>
      </div>

      {/* Alternative Credentials Collapsible */}
      <div className="pt-2 border-t border-[#252C38]">
        <button
          type="button"
          onClick={() => setShowAlternative(!showAlternative)}
          className="w-full flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#858D9B] hover:text-[#C5CAD3] py-1"
        >
          <span>Administrative Sign-In (Password / Phone)</span>
          {showAlternative ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAlternative && (
          <div className="mt-3 space-y-4 pt-3 border-t border-[#252C38]/60">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAltMethod('password')}
                className={`flex-1 py-1.5 font-mono text-[10px] uppercase tracking-wider rounded-xs border ${
                  altMethod === 'password'
                    ? 'border-[#2457FF] text-[#7595FF] bg-[#2457FF]/10'
                    : 'border-[#252C38] text-[#858D9B]'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => setAltMethod('phone')}
                className={`flex-1 py-1.5 font-mono text-[10px] uppercase tracking-wider rounded-xs border ${
                  altMethod === 'phone'
                    ? 'border-[#2457FF] text-[#7595FF] bg-[#2457FF]/10'
                    : 'border-[#252C38] text-[#858D9B]'
                }`}
              >
                Phone OTP
              </button>
            </div>

            {altMethod === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Account Password"
                  required
                  className="w-full px-3.5 py-2 bg-[#090B10] border border-[#252C38] focus:border-[#2457FF] focus:outline-none rounded-xs text-xs text-[#F4F6FA]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#252C38] hover:bg-[#2457FF] text-white font-mono text-xs uppercase font-bold rounded-xs transition-colors"
                >
                  Sign In with Password
                </button>
              </form>
            )}

            {altMethod === 'phone' && (
              <div className="space-y-3">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 bg-[#090B10] border border-[#252C38] focus:border-[#2457FF] focus:outline-none rounded-xs text-xs text-[#F4F6FA]"
                    />
                    <button
                      type="submit"
                      disabled={phoneLoading}
                      className="w-full py-2.5 bg-[#252C38] hover:bg-[#2457FF] text-white font-mono text-xs uppercase font-bold rounded-xs transition-colors"
                    >
                      {phoneLoading ? 'Sending...' : 'Send SMS OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="6-digit OTP"
                      className="w-full px-3.5 py-2 bg-[#090B10] border border-[#252C38] focus:border-[#2457FF] focus:outline-none rounded-xs text-xs text-[#F4F6FA] text-center font-mono tracking-widest"
                    />
                    {devOtpHint && (
                      <p className="text-[10px] font-mono text-[#2457FF]">Development OTP: {devOtpHint}</p>
                    )}
                    <button
                      type="submit"
                      disabled={phoneLoading}
                      className="w-full py-2.5 bg-[#2457FF] text-white font-mono text-xs uppercase font-bold rounded-xs transition-colors"
                    >
                      Verify OTP
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
