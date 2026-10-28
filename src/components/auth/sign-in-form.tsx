'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { loginSchema } from '@/lib/validation/schemas';
import { Phone, Mail, ArrowRight, Loader2, KeyRound } from 'lucide-react';
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
        setError('Invalid email, password, or Proventa Authentication Key.');
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
      const statusRes = await fetch('/api/auth/oauth-status');
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (!statusData.google) {
          setError(
            'Google OAuth is not yet configured in this environment. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Continue with Google.',
          );
          setOauthLoading(null);
          return;
        }
      }
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
          className="p-3.5 bg-[#B94E2D]/10 border border-[#B94E2D] rounded-[2px] text-xs text-[#8E3519] font-medium"
        >
          {error}
        </div>
      )}

      {/* Primary OAuth Action: Continue with Google */}
      <div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#181914] rounded-[2px] bg-[#FBF8F1] hover:bg-[#E9DFCC] text-xs font-mono font-medium uppercase tracking-[0.14em] text-[#181914] transition-colors disabled:opacity-50"
        >
          {oauthLoading === 'google' ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#181914]" />
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
        <div className="border-t border-[#D5CBB8] w-full" />
        <span className="bg-[#F5F0E5] px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5C584F] absolute">
          Or sign in with credentials
        </span>
      </div>

      {/* Method Switcher: Email or Mobile Phone */}
      <div className="grid grid-cols-2 rounded-[2px] bg-[#E9DFCC] p-1 border border-[#D5CBB8]">
        <button
          type="button"
          onClick={() => {
            setMethod('email');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
            method === 'email'
              ? 'bg-[#171A14] text-[#F6F0E4]'
              : 'text-[#5C584F] hover:text-[#181914]'
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
          className={`flex items-center justify-center gap-2 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
            method === 'phone'
              ? 'bg-[#171A14] text-[#F6F0E4]'
              : 'text-[#5C584F] hover:text-[#181914]'
          }`}
        >
          <Phone className="h-3.5 w-3.5" />
          <span>Mobile OTP</span>
        </button>
      </div>

      {method === 'email' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#181914] mb-1.5"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input-enterprise"
              placeholder="you@domain.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-[#B94E2D]">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#181914]"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#5C584F] hover:text-[#B94E2D] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="input-enterprise"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-[#B94E2D]">{errors.password.message}</p>
            )}
          </div>

          <div className="pt-3 border-t border-[#D5CBB8]">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="securityKey"
                className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#181914] flex items-center gap-1.5"
              >
                <KeyRound className="h-3.5 w-3.5 text-[#B94E2D]" />
                <span>Proventa Authentication Key</span>
              </label>
              <Link
                href="/forgot-auth-key"
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#5C584F] hover:text-[#B94E2D] hover:underline"
              >
                Recover key
              </Link>
            </div>
            <input
              id="securityKey"
              type="password"
              autoComplete="one-time-code"
              className="input-enterprise font-mono tracking-wider"
              placeholder="PV-XXXXXXXX-XXXXXXXX"
              {...register('securityKey')}
            />
            {errors.securityKey && (
              <p className="mt-1 text-xs text-[#B94E2D]">{errors.securityKey.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-terracotta w-full mt-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>
      )}

      {method === 'phone' && (
        <div className="space-y-4">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#181914] mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="input-enterprise"
                />
                <p className="mt-1.5 text-[11px] text-[#5C584F]">
                  We will send a 6-digit verification code to your phone.
                </p>
              </div>

              <button
                type="submit"
                disabled={phoneLoading}
                className="btn-terracotta w-full"
              >
                {phoneLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {phoneLoading ? 'Sending OTP...' : 'Send Verification Code'}
                </span>
                {!phoneLoading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#181914]">
                    Enter 6-Digit Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                    }}
                    className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#5C584F] hover:text-[#B94E2D] hover:underline"
                  >
                    Change Number
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="input-enterprise text-center font-mono text-base tracking-[0.3em]"
                />
                {devOtpHint && (
                  <p className="mt-1.5 text-xs text-[#181914] bg-[#E9DFCC] p-2 border border-[#D5CBB8] font-mono">
                    Dev Code Preview: <strong>{devOtpHint}</strong>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={phoneLoading}
                className="btn-terracotta w-full"
              >
                {phoneLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{phoneLoading ? 'Verifying...' : 'Verify & Sign In'}</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
