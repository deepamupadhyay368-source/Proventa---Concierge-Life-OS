'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { registerSchema } from '@/lib/validation/schemas';
import { Loader2 } from 'lucide-react';
import type { z } from 'zod';

type FormData = z.infer<typeof registerSchema>;

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

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
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push('/verify');
      } else {
        const json = await res.json();
        setError(json.error ?? 'Registration failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      {error && <div className="p-3.5 bg-red-50/90 border border-red-200 rounded-xl text-xs text-red-700 font-sans">{error}</div>}

      {/* Social options */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => handleOAuth('google')}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#e8e2d8] rounded-xl bg-white hover:bg-[#fbf9f6] text-xs font-semibold text-[#141312] transition-all shadow-xs disabled:opacity-50"
        >
          {oauthLoading === 'google' ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#8a7053]" />
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

        <button
          type="button"
          onClick={() => handleOAuth('apple')}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#141312] rounded-xl bg-[#141312] hover:bg-[#24201a] text-xs font-semibold text-white transition-all shadow-xs disabled:opacity-50"
        >
          {oauthLoading === 'apple' ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <svg className="h-4 w-4 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.8-12-14.28-5.87-8.7-10.45-18.49-13.75-29.35-3.3-10.86-4.95-21.36-4.95-31.5 0-14.34 3.75-26.08 11.26-35.2 7.51-9.13 16.73-13.82 27.67-14.07 4.58 0 9.87 1.25 15.89 3.76 6.01 2.5 9.77 3.76 11.26 3.76 1.12 0 5.08-1.34 11.89-4.02 6.81-2.68 12.35-3.88 16.63-3.6 12.39.63 22.37 5.12 29.93 13.48-10.87 6.54-16.19 15.65-15.96 27.34.23 9.4 3.86 17.27 10.9 23.6 7.04 6.33 15.42 10.02 25.13 11.08-2.23 6.96-5.02 14.54-8.37 22.75zm-33.84-118.73c0 6.54-2.39 12.71-7.17 18.52-4.78 5.8-10.59 9.5-17.43 11.08-.23-.87-.34-1.63-.34-2.28 0-6.33 2.54-12.63 7.62-18.9 5.08-6.28 11.13-10.02 18.15-11.23-.83 1.05-.83 1.98-.83 2.81z" />
            </svg>
          )}
          <span>Sign up with Apple</span>
        </button>

        <button
          type="button"
          onClick={() => handleOAuth('microsoft-entra-id')}
          disabled={!!oauthLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#e8e2d8] rounded-xl bg-white hover:bg-[#fbf9f6] text-xs font-semibold text-[#141312] transition-all shadow-xs disabled:opacity-50"
        >
          {oauthLoading === 'microsoft-entra-id' ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#8a7053]" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z"/>
              <path fill="#81bc06" d="M12 1h10v10H12z"/>
              <path fill="#05a6f0" d="M1 12h10v10H1z"/>
              <path fill="#ffba08" d="M12 12h10v10H12z"/>
            </svg>
          )}
          <span>Sign up with Microsoft</span>
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#e8e2d8] w-full" />
        <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-[#8a8680] font-medium absolute">
          Or register with email
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-[#141312] uppercase tracking-wider mb-1.5 font-sans">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="w-full px-3.5 py-3 bg-[#faf8f5] border border-[#ded7cc] rounded-xl text-sm text-[#141312] focus:outline-none focus:border-[#6d5941] focus:ring-1 focus:ring-[#6d5941] transition-all font-sans"
            {...register('name')}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600 font-sans">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-[#141312] uppercase tracking-wider mb-1.5 font-sans">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full px-3.5 py-3 bg-[#faf8f5] border border-[#ded7cc] rounded-xl text-sm text-[#141312] focus:outline-none focus:border-[#6d5941] focus:ring-1 focus:ring-[#6d5941] transition-all font-sans"
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600 font-sans">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-[#141312] uppercase tracking-wider mb-1.5 font-sans">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="w-full px-3.5 py-3 bg-[#faf8f5] border border-[#ded7cc] rounded-xl text-sm text-[#141312] focus:outline-none focus:border-[#6d5941] focus:ring-1 focus:ring-[#6d5941] transition-all font-sans"
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600 font-sans">{errors.password.message}</p>}
          <p className="text-[11px] text-[#8a8680] mt-1 font-sans">Minimum 8 characters with letters &amp; numbers.</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#141312] uppercase tracking-wider mb-1.5 font-sans">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="w-full px-3.5 py-3 bg-[#faf8f5] border border-[#ded7cc] rounded-xl text-sm text-[#141312] focus:outline-none focus:border-[#6d5941] focus:ring-1 focus:ring-[#6d5941] transition-all font-sans"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600 font-sans">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-[#1f1b16] hover:bg-[#332d26] text-[#faf8f5] rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 font-sans flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin text-[#ddc8a9]" />}
          <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
        </button>

        <p className="text-[11px] text-[#8a8680] text-center font-sans">
          By registering, you agree to our{' '}
          <a href="/terms" className="underline text-[#141312]">Terms</a> and{' '}
          <a href="/privacy" className="underline text-[#141312]">Privacy Policy</a>.
        </p>
      </form>
    </div>
  );
}
