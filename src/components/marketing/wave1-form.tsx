'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { wave1RegisterSchema } from '@/lib/validation/schemas';
import type { z } from 'zod';

type FormData = z.infer<typeof wave1RegisterSchema>;

export function Wave1Form({ prefilledIntent }: { prefilledIntent?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(wave1RegisterSchema),
    defaultValues: {
      city: 'Ahmedabad',
      communicationPref: 'EMAIL',
      intendedUse: prefilledIntent ?? '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/wave1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const json = await res.json();
        setError(json.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">You're on the list.</h2>
        <p className="text-sm text-neutral-500 leading-relaxed">We'll reach out with an invitation when Wave 1 is ready for you. Keep an eye on your inbox.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full name <span className="text-red-500">*</span></label>
          <input type="text" className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email <span className="text-red-500">*</span></label>
          <input type="email" className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Mobile number</label>
          <input type="tel" placeholder="+91 98765 43210" className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" {...register('phone')} />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">What would you use Proventa for?</label>
          <textarea rows={3} placeholder="Tell us a bit about what you'd like help with..." className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none" {...register('intendedUse')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">How did you hear about Proventa?</label>
          <input type="text" className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" {...register('referralSource')} />
        </div>
      </div>

      {/* Consent */}
      <div className="flex items-start gap-3 pt-2">
        <input type="checkbox" id="consent" className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-neutral-900" {...register('consentGiven')} />
        <label htmlFor="consent" className="text-xs text-neutral-500 leading-relaxed">
          I agree to the <a href="/terms" className="underline">Terms of Service</a> and <a href="/privacy" className="underline">Privacy Policy</a>. I understand that registering does not guarantee an invitation.
        </label>
      </div>
      {errors.consentGiven && <p className="text-xs text-red-600">{errors.consentGiven.message}</p>}

      <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
        {loading ? 'Registering...' : 'Join Wave 1'}
      </button>
    </form>
  );
}
