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

      {/* Primary Login Form */}
      <form onSubmit={handlePassKeySubmit} className="space-y-4">
        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C5CAD3]">
            Registered Institutional Email
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trustee@familyoffice.in"
              required
              autoComplete="email"
              className="w-full px-3.5 py-2.5 bg-[#090B10] border border-[#252C38] focus:border-[#2457FF] focus:outline-none rounded-xs text-sm text-[#F4F6FA] placeholder-[#858D9B]/50 transition-colors"
            />
            <Mail className="w-4 h-4 text-[#858D9B] absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* 12-Digit Numeric Pass Key */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C5CAD3]">
              12-Digit PROVENTA Pass Key
            </label>
            <Link
              href="/recover-passkey"
              className="text-[10px] font-mono uppercase text-[#7595FF] hover:underline"
            >
              Forgot Pass Key?
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
            Enter the 12-digit numeric Pass Key you established during registration.
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
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Account Links & Recovery Actions */}
      <div className="pt-2 border-t border-[#252C38] flex flex-col gap-2.5 text-center text-xs font-mono">
        <div className="flex items-center justify-between text-[#858D9B]">
          <span>Need a new account?</span>
          <Link href="/sign-up" className="text-[#7595FF] hover:underline font-bold">
            Create Account →
          </Link>
        </div>
        <div className="flex items-center justify-between text-[#858D9B]">
          <span>Lost your 12-digit key?</span>
          <Link href="/recover-passkey" className="text-[#C5CAD3] hover:text-[#7595FF] hover:underline">
            Recover Pass Key →
          </Link>
        </div>
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
