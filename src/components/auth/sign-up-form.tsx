'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { registerSchema } from '@/lib/validation/schemas';
import { Loader2, KeyRound, Copy, Check, ArrowRight } from 'lucide-react';
import type { z } from 'zod';

type FormData = z.infer<typeof registerSchema>;

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  // Key display success state
  const [generatedAuthKey, setGeneratedAuthKey] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [keyConfirmed, setKeyConfirmed] = useState(false);
  const [entering, setEntering] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        if (json.authenticationKey) {
          setGeneratedAuthKey(json.authenticationKey);
          setCredentials({
            email: data.email.trim().toLowerCase(),
            password: data.password,
          });
        } else {
          router.push('/sign-in?registered=true');
        }
      } else {
        setError(json.error ?? 'Registration failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (!generatedAuthKey) return;
    navigator.clipboard.writeText(generatedAuthKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleProceedToProventa = async () => {
    if (!credentials || !generatedAuthKey) {
      router.push('/sign-in');
      return;
    }

    setEntering(true);
    setError(null);
    try {
      const signInResult = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        securityKey: generatedAuthKey,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        router.push('/sign-in?registered=true');
      }
    } catch {
      router.push('/sign-in?registered=true');
    } finally {
      setEntering(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to continue with Google.',
      );
      setOauthLoading(null);
    }
  };

  if (generatedAuthKey) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-[#E9DFCC] border border-[#D5CBB8] rounded-[2px] text-center space-y-4">
          <div className="inline-flex p-3 rounded-[2px] bg-[#171A14] text-[#F6F0E4] mx-auto">
            <KeyRound className="h-6 w-6 text-[#B94E2D]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-mono text-xs font-medium tracking-[0.18em] uppercase text-[#181914]">
              YOUR PROVENTA AUTHENTICATION KEY
            </h2>
            <p className="text-xs text-[#5C584F]">
              Your unique account authentication key has been generated.
            </p>
          </div>

          <div className="p-4 bg-[#FBF8F1] border border-[#181914] rounded-[2px] text-lg sm:text-xl font-mono font-semibold tracking-[0.18em] text-[#181914] select-all break-all">
            {generatedAuthKey}
          </div>

          <p className="text-xs text-[#5C584F] leading-relaxed max-w-sm mx-auto">
            Save this key securely. You will need it when signing in with email and password.
          </p>

          <button
            type="button"
            onClick={handleCopyKey}
            className="btn-secondary py-2 px-4"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-[#B94E2D]" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Key</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-4 pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#181914] font-medium p-3 bg-[#FBF8F1] border border-[#D5CBB8] rounded-[2px]">
            <input
              type="checkbox"
              checked={keyConfirmed}
              onChange={(e) => setKeyConfirmed(e.target.checked)}
              className="mt-0.5 accent-[#B94E2D]"
            />
            <span className="leading-relaxed">
              I have safely copied and stored my Proventa Authentication Key.
            </span>
          </label>

          <button
            type="button"
            disabled={!keyConfirmed || entering}
            onClick={handleProceedToProventa}
            className="btn-terracotta w-full"
          >
            {entering && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{entering ? 'Entering PROVENTA...' : 'Continue to Dashboard'}</span>
            {!entering && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    );
  }

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
          onClick={handleGoogleSignUp}
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

      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#D5CBB8] w-full" />
        <span className="bg-[#F5F0E5] px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5C584F] absolute">
          Or register with email
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#181914] mb-1.5"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="input-enterprise"
            placeholder="Your full name"
            {...register('name')}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-[#B94E2D]">{errors.name.message}</p>
          )}
        </div>

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
          <label
            htmlFor="password"
            className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#181914] mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="input-enterprise"
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-[#B94E2D]">{errors.password.message}</p>
          )}
          <p className="text-[11px] text-[#5C584F] mt-1">
            Minimum 8 characters with uppercase, lowercase &amp; numbers.
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#181914] mb-1.5"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="input-enterprise"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-[#B94E2D]">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-[#D5CBB8] space-y-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#5C584F]">
            <input
              type="checkbox"
              required
              {...register('termsConsent', {
                required:
                  'You must agree to the Terms of Service and Privacy Policy to continue.',
              })}
              className="mt-0.5 accent-[#B94E2D]"
            />
            <span className="leading-relaxed">
              I agree to the{' '}
              <Link
                href="/legal/terms"
                className="font-semibold text-[#181914] underline hover:text-[#B94E2D]"
              >
                Terms of Service
              </Link>{' '}
              and acknowledge the{' '}
              <Link
                href="/legal/privacy"
                className="font-semibold text-[#181914] underline hover:text-[#B94E2D]"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.termsConsent && (
            <p className="text-xs text-[#B94E2D]">{errors.termsConsent.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-terracotta w-full"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>
            {loading ? 'Creating Account...' : 'Create Account'}
          </span>
        </button>
      </form>
    </div>
  );
}
