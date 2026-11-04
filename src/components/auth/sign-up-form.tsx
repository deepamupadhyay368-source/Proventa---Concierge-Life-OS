'use client';

import { useState } from 'react';
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
        setError(json.error || 'Failed to create account.');
      }
    } catch {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (!generatedAuthKey) return;
    navigator.clipboard.writeText(generatedAuthKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceedToProventa = async () => {
    if (!credentials || !keyConfirmed) return;
    setEntering(true);
    try {
      const res = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });
      if (res?.ok) {
        router.push('/buyer/dashboard');
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
      await signIn('google', {
        callbackUrl: '/buyer/dashboard',
      });
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
        <div className="p-6 bg-[#252B38] border border-[#414957] text-center space-y-4 rounded-sm">
          <div className="inline-flex p-3 bg-[#191B20] text-[#536B88] mx-auto border border-[#414957] rounded-sm">
            <KeyRound className="h-6 w-6 text-[#536B88]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-heading font-bold text-sm tracking-widest uppercase text-[#FFFFFF]">
              YOUR PROVENTA AUTHENTICATION KEY
            </h2>
            <p className="text-xs text-[#A8ADB7]">
              Your unique account key for emergency verification.
            </p>
          </div>

          <div className="p-3 bg-[#191B20] border border-[#414957] font-mono text-sm tracking-wider break-all text-[#C66A42] select-all font-bold rounded-sm">
            {generatedAuthKey}
          </div>

          <button
            type="button"
            onClick={handleCopyKey}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#414957] bg-[#303746] hover:bg-[#252B38] text-xs font-mono uppercase tracking-wider text-[#F1F2F4] transition-colors rounded-sm"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#4A7C59]" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Key</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={keyConfirmed}
              onChange={(e) => setKeyConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#C66A42]"
            />
            <span className="text-xs text-[#A8ADB7]">
              I have safely copied and stored my Authentication Key in my records.
            </span>
          </label>

          <button
            type="button"
            onClick={handleProceedToProventa}
            disabled={!keyConfirmed || entering}
            className="w-full py-3.5 bg-[#C66A42] text-white hover:bg-[#B35A33] font-heading font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50 rounded-sm"
          >
            {entering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Enter Procurement Portal</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
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
          className="p-3.5 bg-[#252B38] border border-[#D9534F] text-xs text-[#D9534F] font-medium rounded-sm"
        >
          {error}
        </div>
      )}

      {/* Primary Action: Continue with Google */}
      <div>
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-[#414957] bg-[#252B38] hover:bg-[#191B20] text-xs font-heading font-bold uppercase tracking-wider text-[#FFFFFF] transition-all shadow-sm disabled:opacity-50 rounded-sm"
        >
          {oauthLoading === 'google' ? (
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
          <span>Continue with Google</span>
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#414957] w-full" />
        <span className="bg-[#303746] px-3 font-mono text-[10px] uppercase tracking-widest text-[#A8ADB7] absolute">
          Or create account with email
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
            Full Name
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="Pravin Patel"
            className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none text-sm text-[#FFFFFF] placeholder-[#A8ADB7] transition-colors rounded-sm"
          />
          {errors.name && (
            <p className="text-xs text-[#D9534F]">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
            Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="pravin@patelinfra.in"
            className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none text-sm text-[#FFFFFF] placeholder-[#A8ADB7] transition-colors rounded-sm"
          />
          {errors.email && (
            <p className="text-xs text-[#D9534F]">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••••••••"
            className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none text-sm text-[#FFFFFF] placeholder-[#A8ADB7] transition-colors rounded-sm"
          />
          {errors.password && (
            <p className="text-xs text-[#D9534F]">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
            Confirm Password
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            placeholder="••••••••••••"
            className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none text-sm text-[#FFFFFF] placeholder-[#A8ADB7] transition-colors rounded-sm"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-[#D9534F]">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#C66A42] text-white hover:bg-[#B35A33] font-heading font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50 rounded-sm shadow-sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span>Create Procurement Account</span>
          )}
        </button>
      </form>
    </div>
  );
}
