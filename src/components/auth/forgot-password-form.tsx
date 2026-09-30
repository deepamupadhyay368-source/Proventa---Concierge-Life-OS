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
    return <p className="text-sm text-[#66717C]">If that email is registered, a reset link has been sent. Check your inbox.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#1F2933] mb-1.5">Email</label>
        <input id="email" type="email" autoComplete="email"
          className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-xl text-sm text-[#1F2933] focus:outline-none focus:border-[#1F2933] transition-colors"
          {...register('email')} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-2.5 px-4 bg-[#1F2933] hover:bg-[#111820] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 shadow-xs">
        {loading ? 'Sending...' : 'Send reset link'}
      </button>
    </form>
  );
}

