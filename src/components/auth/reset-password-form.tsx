'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { passwordResetSchema } from '@/lib/validation/schemas';
import type { z } from 'zod';

type FormData = z.infer<typeof passwordResetSchema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push('/sign-in?reset=true');
      } else {
        const json = await res.json();
        setError(json.error ?? 'Failed to reset password.');
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{error}</div>}
      <input type="hidden" {...register('token')} />
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">New password</label>
        <input type="password" autoComplete="new-password"
          className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
          {...register('password')} />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Confirm new password</label>
        <input type="password" autoComplete="new-password"
          className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
          {...register('confirmPassword')} />
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
        {loading ? 'Saving...' : 'Set new password'}
      </button>
    </form>
  );
}
