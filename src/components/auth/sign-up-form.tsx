'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { registerSchema } from '@/lib/validation/schemas';
import type { z } from 'zod';

type FormData = z.infer<typeof registerSchema>;

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{error}</div>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1.5">Full name</label>
        <input id="name" type="text" autoComplete="name"
          className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
          {...register('name')} />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
        <input id="email" type="email" autoComplete="email"
          className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
          {...register('email')} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
        <input id="password" type="password" autoComplete="new-password"
          className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
          {...register('password')} />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        <p className="text-xs text-neutral-400 mt-1">At least 8 characters, with uppercase, lowercase, and a number.</p>
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1.5">Confirm password</label>
        <input id="confirmPassword" type="password" autoComplete="new-password"
          className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
          {...register('confirmPassword')} />
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
        {loading ? 'Creating account...' : 'Create account'}
      </button>
      <p className="text-xs text-neutral-400 text-center">
        By creating an account, you agree to our{' '}
        <a href="/terms" className="underline">Terms</a> and{' '}
        <a href="/privacy" className="underline">Privacy Policy</a>.
      </p>
    </form>
  );
}
