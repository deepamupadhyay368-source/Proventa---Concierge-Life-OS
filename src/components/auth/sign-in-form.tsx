'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { loginSchema } from '@/lib/validation/schemas';
import { Phone, Mail, ArrowRight, Loader2, KeyRound, Sparkles } from 'lucide-react';
import type { z } from 'zod';

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
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        securityKey: data.securityKey || '',
        redirect: false,
      });
      if (result?.error) {
        setError('Invalid email or password. Please verify your credentials.');
      } else {
        router.push(safeCallback);
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading('google');
    setError(null);
    try {
      await signIn('google', {
        callbackUrl: safeCallback,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Continue with Google failed. Please try again.';
      setError(msg);
      setOauthLoading(null);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      // Immediate redirect to dashboard in demo mode
      router.push(safeCallback);
      router.refresh();
    } catch {
      setError('Unable to load demo workspace.');
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
      setError(
        err instanceof Error ? err.message : 'Network error sending OTP.',
      );
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
      setError(
        err instanceof Error ? err.message : 'Sign in failed. Please try again.',
      );
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

      {/* Primary Action: Continue with Google */}
      <div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-[#252C38] rounded-xs bg-[#F4F6FA] hover:bg-white text-xs font-heading font-bold uppercase tracking-wider text-[#090B10] transition-all shadow-sm disabled:opacity-50"
        >
          {oauthLoading === 'google' ? (
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
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#252C38] w-full" />
        <span className="bg-[#171C26] px-3 font-mono text-[10px] uppercase tracking-widest text-[#858D9B] absolute">
          Or with credentials
        </span>
      </div>

      {/* Method Switcher: Email or Phone */}
      <div className="grid grid-cols-2 rounded-xs bg-[#090B10] p-1 border border-[#252C38]">
        <button
          type="button"
          onClick={() => {
            setMethod('email');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 font-mono text-xs uppercase tracking-wider transition-colors rounded-xs ${
            method === 'email'
              ? 'bg-[#2457FF] text-white font-bold'
              : 'text-[#858D9B] hover:text-[#F4F6FA]'
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Email</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMethod('phone');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 font-mono text-xs uppercase tracking-wider transition-colors rounded-xs ${
            method === 'phone'
              ? 'bg-[#2457FF] text-white font-bold'
              : 'text-[#858D9B] hover:text-[#F4F6FA]'
          }`}
        >
          <Phone className="h-3.5 w-3.5" />
          <span>Phone OTP</span>
        </button>
      </div>

      {/* Email + Password Form */}
      {method === 'email' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C5CAD3]">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="trustee@familyoffice.in"
              className="w-full px-3.5 py-2.5 bg-[#090B10] border border-[#252C38] focus:border-[#2457FF] focus:outline-none rounded-xs text-sm text-[#F4F6FA] placeholder-[#858D9B]/50 transition-colors"
            />
            {errors.email && (
              <p className="text-xs text-[#FF7A70]">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C5CAD3]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[10px] font-mono text-[#858D9B] hover:text-[#2457FF]"
              >
                Forgot password?
              </Link>
            </div>
            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-[#090B10] border border-[#252C38] focus:border-[#2457FF] focus:outline-none rounded-xs text-sm text-[#F4F6FA] placeholder-[#858D9B]/50 transition-colors"
            />
            {errors.password && (
              <p className="text-xs text-[#FF7A70]">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2457FF] text-white hover:bg-[#1D4ED8] font-heading font-bold text-xs uppercase tracking-wider rounded-xs transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Cockpit</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Phone OTP Form */}
      {method === 'phone' && (
        <div className="space-y-4">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C5CAD3]">
                  Mobile Number (India +91)
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-[#090B10] border border-[#252C38] focus:border-[#2457FF] focus:outline-none rounded-xs text-sm text-[#F4F6FA] placeholder-[#858D9B]/50 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={phoneLoading}
                className="w-full py-3 bg-[#2457FF] text-white hover:bg-[#1D4ED8] font-heading font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {phoneLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Send Login OTP</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C5CAD3]">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full px-3.5 py-2.5 bg-[#090B10] border border-[#252C38] focus:border-[#2457FF] focus:outline-none rounded-xs text-sm text-[#F4F6FA] text-center font-mono tracking-widest placeholder-[#858D9B]/50 transition-colors"
                />
                {devOtpHint && (
                  <p className="text-[10px] font-mono text-[#2457FF]">
                    Development OTP: {devOtpHint}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="py-2.5 px-3 border border-[#252C38] text-xs font-mono text-[#858D9B] hover:text-[#F4F6FA] rounded-xs"
                >
                  Change
                </button>
                <button
                  type="submit"
                  disabled={phoneLoading}
                  className="flex-1 py-2.5 bg-[#2457FF] text-white hover:bg-[#1D4ED8] font-heading font-bold text-xs uppercase tracking-wider rounded-xs flex items-center justify-center gap-2"
                >
                  {phoneLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Verify &amp; Enter Cockpit</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Instant Demo Access Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleDemoSignIn}
          disabled={loading}
          className="w-full py-2.5 px-3 bg-[#090B10] hover:bg-[#252C38] border border-[#252C38] text-xs font-mono text-[#C5CAD3] hover:text-white rounded-xs transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2457FF]" />
          <span>Quick Demo: Enter as Sharma Family Office</span>
        </button>
      </div>
    </div>
  );
}
