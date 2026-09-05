'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordResetRequestSchema } from '@/lib/validation/schemas';
import type { z } from 'zod';

type FormData = z.infer<typeof passwordResetRequestSchema>;

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(passwordResetRequestSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return <p className="text-sm text-neutral-600">If that email is registered, a reset link has been sent. Check your inbox.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
        <input id="email" type="email" autoComplete="email"
          className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
          {...register('email')} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
        {loading ? 'Sending...' : 'Send reset link'}
      </button>
    </form>
  );
}
