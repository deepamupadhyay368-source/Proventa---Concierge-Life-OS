'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { registerSchema } from '@/lib/validation/schemas';
import { Loader2, KeyRound, Copy, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import type { z } from 'zod';

type FormData = z.infer<typeof registerSchema>;

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  // Key display success state
  const [generatedAuthKey, setGeneratedAuthKey] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [keyConfirmed, setKeyConfirmed] = useState(false);
  const [entering, setEntering] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
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
          setCredentials({ email: data.email.trim().toLowerCase(), password: data.password });
        } else {
          // Fallback if no auth key returned in json
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

  const handleOAuth = async (provider: 'google' | 'apple' | 'microsoft-entra-id') => {
    setOauthLoading(provider);
    setError(null);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (err: any) {
      setError(err?.message || `Failed to sign up with ${provider}.`);
      setOauthLoading(null);
    }
  };

  // ----------------------------------------------------------------
  // SUCCESS SCREEN: DISPLAY PROVENTA AUTHENTICATION KEY ONCE
  // ----------------------------------------------------------------
  if (generatedAuthKey) {
    return (
      <div className="space-y-6">
        <div className="p-5 bg-[#F7F8FA] border border-[#E1E5E8] rounded-xl text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-[#1F2933] text-white mx-auto shadow-sm">
            <KeyRound className="h-6 w-6 text-white" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xs font-bold tracking-[0.16em] uppercase text-[#1F2933]">
              YOUR PROVENTA AUTHENTICATION KEY
            </h2>
            <p className="text-xs text-[#66717C]">
              Your unique sovereign identity key has been generated.
            </p>
          </div>

          {/* Key Display Box */}
          <div className="p-4 bg-white border-2 border-dashed border-[#1F2933]/40 rounded-lg text-lg sm:text-xl font-mono font-bold tracking-[0.2em] text-[#1F2933] select-all break-all shadow-2xs">
            {generatedAuthKey}
          </div>

          <p className="text-xs text-[#66717C] leading-relaxed max-w-sm mx-auto">
            Save this key securely. You will need this key every time you sign in to Proventa.
            For your security, your full key will not be shown again.
          </p>

          <button
            type="button"
            onClick={handleCopyKey}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E1E5E8] rounded-lg bg-white hover:bg-[#F7F8FA] text-xs font-semibold text-[#1F2933] transition-all shadow-xs hover:border-[#1F2933]"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-[#66717C]" />
                <span>Copy Key</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-4 pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#1F2933] font-medium p-3 bg-white border border-[#E1E5E8] rounded-lg">
            <input
              type="checkbox"
              checked={keyConfirmed}
              onChange={(e) => setKeyConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-[#E1E5E8] text-[#1F2933] focus:ring-[#1F2933]"
            />
            <span className="leading-relaxed">
              I have safely copied and stored my Proventa Authentication Key in a secure place.
            </span>
          </label>

          <button
            type="button"
            disabled={!keyConfirmed || entering}
            onClick={handleProceedToProventa}
            className="w-full py-3.5 px-4 bg-[#1F2933] hover:bg-[#111820] text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {entering && <Loader2 className="h-4 w-4 animate-spin text-white" />}
            <span>{entering ? 'Entering Proventa...' : 'I Have Saved My Key'}</span>
            {!entering && <ArrowRight className="h-3.5 w-3.5 text-[#A7B0B8]" />}
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // INITIAL REGISTRATION FORM
  // ----------------------------------------------------------------
  return (
    <div className="space-y-6">
      {error && <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>}

      {/* Social options */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => handleOAuth('google')}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-[#E1E5E8] rounded-lg bg-white hover:bg-[#F7F8FA] text-xs font-semibold text-[#1F2933] transition-all shadow-xs disabled:opacity-50"
        >
          {oauthLoading === 'google' ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#1F2933]" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          )}
          <span>Sign up with Google</span>
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#E1E5E8] w-full" />
        <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-[#66717C] font-medium absolute">
          Or register with email
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-lg text-sm text-[#1F2933] placeholder:text-[#A7B0B8] focus:outline-none focus:border-[#1F2933] transition-all"
            placeholder="Your full name"
            {...register('name')}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-lg text-sm text-[#1F2933] placeholder:text-[#A7B0B8] focus:outline-none focus:border-[#1F2933] transition-all"
            placeholder="you@domain.com"
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-lg text-sm text-[#1F2933] placeholder:text-[#A7B0B8] focus:outline-none focus:border-[#1F2933] transition-all"
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          <p className="text-[11px] text-[#66717C] mt-1">Minimum 8 characters with uppercase, lowercase &amp; numbers.</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1.5">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-lg text-sm text-[#1F2933] placeholder:text-[#A7B0B8] focus:outline-none focus:border-[#1F2933] transition-all"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
        </div>

        {/* Legal Agreement Checkbox */}
        <div className="pt-2 border-t border-[#E1E5E8] space-y-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#66717C]">
            <input
              type="checkbox"
              required
              {...register('termsConsent', { required: 'You must agree to the Terms of Service, Privacy Policy, and Private Beta Terms to continue.' })}
              className="mt-0.5 rounded border-[#E1E5E8] text-[#1F2933] focus:ring-[#1F2933]"
            />
            <span className="leading-relaxed">
              I agree to the{' '}
              <a href="/legal/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1F2933] underline hover:text-[#111820]">
                Terms of Service
              </a>
              , acknowledge the{' '}
              <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1F2933] underline hover:text-[#111820]">
                Privacy Policy
              </a>
              , and accept the{' '}
              <a href="/legal/private-beta" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1F2933] underline hover:text-[#111820]">
                Private Beta Terms
              </a>
              .
            </span>
          </label>
          {errors.termsConsent && (
            <p className="text-xs text-red-600">{errors.termsConsent.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-[#1F2933] hover:bg-[#111820] text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin text-white" />}
          <span>{loading ? 'Creating Account & Generating Key...' : 'Create Account'}</span>
        </button>

        <p className="text-[11px] text-[#66717C] text-center">
          Proventa Private Beta · Sovereign Data Protection ·{' '}
          <a href="/legal" className="underline text-[#1F2933]">Legal &amp; Trust Hub</a>
        </p>
      </form>
    </div>
  );
}
