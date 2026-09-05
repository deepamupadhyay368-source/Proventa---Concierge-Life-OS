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
      city: 'Global',
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
        const json = await res.json().catch(() => ({}));
        setError(json.error || 'Registration could not be completed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network request failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 bg-[#f5f3ef] border border-[#ddc8a9] rounded-full flex items-center justify-center mx-auto mb-5 text-[#6d5941]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-serif font-medium text-[#141312] mb-2">Application Received</h2>
        <p className="text-xs sm:text-sm text-[#5a4937] leading-relaxed max-w-sm mx-auto font-sans">
          Your details have been routed to our private concierge desk. We review cohort capacity weekly and will contact you directly via your preferred channel.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-xl text-xs text-red-700 font-sans">{error}</div>}

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#141312] uppercase tracking-wider mb-1.5 font-sans">Full Name <span className="text-[#8a7053]">*</span></label>
          <input type="text" placeholder="e.g. Yash Patel" className="w-full px-3.5 py-3 bg-[#faf8f5] border border-[#ded7cc] rounded-xl text-sm text-[#141312] focus:outline-none focus:border-[#6d5941] focus:ring-1 focus:ring-[#6d5941] transition-all font-sans" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-red-600 font-sans">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#141312] uppercase tracking-wider mb-1.5 font-sans">Email Address <span className="text-[#8a7053]">*</span></label>
          <input type="email" placeholder="name@domain.com" className="w-full px-3.5 py-3 bg-[#faf8f5] border border-[#ded7cc] rounded-xl text-sm text-[#141312] focus:outline-none focus:border-[#6d5941] focus:ring-1 focus:ring-[#6d5941] transition-all font-sans" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-600 font-sans">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#141312] uppercase tracking-wider mb-1.5 font-sans">Mobile Number (WhatsApp Enabled)</label>
          <input type="tel" placeholder="+91 98765 43210" className="w-full px-3.5 py-3 bg-[#faf8f5] border border-[#ded7cc] rounded-xl text-sm text-[#141312] focus:outline-none focus:border-[#6d5941] focus:ring-1 focus:ring-[#6d5941] transition-all font-sans" {...register('phone')} />
          {errors.phone && <p className="mt-1 text-xs text-red-600 font-sans">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#141312] uppercase tracking-wider mb-1.5 font-sans">What should Proventa take off your plate?</label>
          <textarea rows={3} placeholder="e.g. Fine dining reservations, weekend haveli getaways, client gifting, estate care..." className="w-full px-3.5 py-3 bg-[#faf8f5] border border-[#ded7cc] rounded-xl text-sm text-[#141312] focus:outline-none focus:border-[#6d5941] focus:ring-1 focus:ring-[#6d5941] transition-all font-sans resize-none" {...register('intendedUse')} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#141312] uppercase tracking-wider mb-1.5 font-sans">Referral or Introduction</label>
          <input type="text" placeholder="Member name, advisor, or private invitation" className="w-full px-3.5 py-3 bg-[#faf8f5] border border-[#ded7cc] rounded-xl text-sm text-[#141312] focus:outline-none focus:border-[#6d5941] focus:ring-1 focus:ring-[#6d5941] transition-all font-sans" {...register('referralSource')} />
        </div>
      </div>

      {/* Consent */}
      <div className="flex items-start gap-3 pt-2">
        <input type="checkbox" id="consent" className="mt-1 h-4 w-4 rounded border-[#ded7cc] text-[#1f1b16] focus:ring-[#6d5941]" {...register('consentGiven')} />
        <label htmlFor="consent" className="text-xs text-[#6e6b65] leading-relaxed font-sans">
          I consent to processing under DPDP Act 2023 and agree to the <a href="/terms" className="underline text-[#141312] hover:text-[#8a7053]">Terms</a> and <a href="/privacy" className="underline text-[#141312] hover:text-[#8a7053]">Privacy Policy</a>.
        </label>
      </div>
      {errors.consentGiven && <p className="text-xs text-red-600 font-sans">{errors.consentGiven.message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 bg-[#1f1b16] hover:bg-[#332d26] text-[#faf8f5] rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-50 font-sans tracking-wide"
      >
        {loading ? 'Submitting Application...' : 'Request Cohort 1 Access'}
      </button>
    </form>
  );
}
