'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { wave1RegisterSchema } from '@/lib/validation/schemas';
import type { z } from 'zod';
import {
  Crown,
  Users,
  ShieldCheck,
  Sparkles,
  Plane,
  Utensils,
  Gift,
  Home,
  Briefcase,
  Check,
} from 'lucide-react';

type FormData = z.infer<typeof wave1RegisterSchema>;

const MEMBERSHIP_TIERS = [
  {
    id: 'PRIVATE_INDIVIDUAL',
    title: 'Private Individual',
    tag: 'FOUNDING PRINCIPAL',
    icon: Crown,
    description: 'Dedicated single-principal lifestyle management, priority fine dining reservations, bespoke travel itineraries, and personal concierge access.',
    perks: [
      '24/7 Dedicated Concierge Desk',
      'Priority Table & Stay Allocations',
      'Zero Subscription Surcharge in Cohort 1',
      'Discreet Airport & Transport Protocols',
    ],
  },
  {
    id: 'FOUNDING_FAMILY',
    title: 'Founding Family & Estate',
    tag: 'MULTI-MEMBER & ESTATE',
    icon: Users,
    description: 'Comprehensive household coverage across family members, multi-passenger luxury travel planning, estate maintenance, and domestic logistics.',
    perks: [
      'Up to 5 Family Member Profiles',
      'Dedicated Estate & Home Care Coordination',
      'Family Holiday Itinerary Planning',
      'Direct WhatsApp Desk for All Members',
    ],
  },
];

const INTEREST_OPTIONS = [
  { id: 'fine_dining', label: 'Fine Dining & Private Tables', icon: Utensils },
  { id: 'luxury_travel', label: 'Bespoke Travel & Flights', icon: Plane },
  { id: 'curated_gifting', label: 'Luxury Gifting & Sourcing', icon: Gift },
  { id: 'estate_care', label: 'Estate & Home Care Services', icon: Home },
  { id: 'executive_errands', label: 'Executive Errands & Appointments', icon: Briefcase },
  { id: 'art_culture', label: 'Art, Heritage & Exclusive Events', icon: Sparkles },
];

export function Wave1Form({ prefilledIntent }: { prefilledIntent?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(wave1RegisterSchema),
    defaultValues: {
      membershipTier: 'PRIVATE_INDIVIDUAL',
      city: 'Ahmedabad',
      annualLifestyleSpend: '25L_50L',
      primaryInterests: ['fine_dining', 'luxury_travel'],
      householdMembers: 1,
      communicationPref: 'WHATSAPP',
      intendedUse: prefilledIntent ?? '',
    },
  });

  const selectedTier = watch('membershipTier');
  const selectedInterests = watch('primaryInterests') || [];

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setValue('primaryInterests', selectedInterests.filter((i) => i !== id));
    } else {
      setValue('primaryInterests', [...selectedInterests, id]);
    }
  };

  const validateStep1 = async () => {
    const valid = await trigger(['name', 'email', 'phone', 'city']);
    if (valid) setStep(2);
  };

  const validateStep2 = async () => {
    const valid = await trigger(['membershipTier', 'annualLifestyleSpend', 'primaryInterests']);
    if (valid) setStep(3);
  };

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
      <div className="text-center py-8">
        <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-700">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F8FA] border border-[#E1E5E8] text-[11px] font-semibold text-[#1F2933] mb-3">
          <span>APPLICATION #PV-C1-{Math.floor(1000 + Math.random() * 9000)}</span>
        </div>
        <h2 className="text-2xl font-semibold text-[#1F2933] mb-2">Cohort 1 Application Received</h2>
        <p className="text-sm text-[#66717C] leading-relaxed max-w-md mx-auto mb-6">
          Your details have been placed directly with our Managing Concierge. A private member representative will reach out via WhatsApp / phone within 24 hours.
        </p>
        <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] text-xs text-[#66717C] max-w-sm mx-auto space-y-1">
          <p className="font-semibold text-[#1F2933]">Membership Tier: <span className="text-[#1F2933] font-normal">{selectedTier.replace(/_/g, ' ')}</span></p>
          <p>Location: {watch('city')} · Preferred Channel: {watch('communicationPref')}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Progress Tabs Header */}
      <div className="flex items-center justify-between border-b border-[#E1E5E8] pb-4">
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 1 ? 'bg-[#1F2933] text-white' : 'bg-[#E1E5E8] text-[#66717C]'}`}>1</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1F2933]">Principal Info</span>
        </div>
        <div className="h-0.5 w-6 sm:w-12 bg-[#E1E5E8]" />
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 2 ? 'bg-[#1F2933] text-white' : 'bg-[#E1E5E8] text-[#66717C]'}`}>2</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1F2933]">Membership Tier</span>
        </div>
        <div className="h-0.5 w-6 sm:w-12 bg-[#E1E5E8]" />
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 3 ? 'bg-[#1F2933] text-white' : 'bg-[#E1E5E8] text-[#66717C]'}`}>3</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1F2933]">Lifestyle Profile</span>
        </div>
      </div>

      {/* STEP 1: PRINCIPAL DETAILS */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="text-sm font-semibold text-[#1F2933] mb-0.5">Principal Identification</h3>
            <p className="text-xs text-[#66717C]">Your personal details are held with strict confidentiality under DPDP Act 2023.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1.5">Full Legal Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g. Yash Patel"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-lg text-sm text-[#1F2933] placeholder:text-[#A7B0B8] focus:outline-none focus:border-[#1F2933] transition-all"
                {...register('name')}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1.5">Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                placeholder="yash@example.com"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-lg text-sm text-[#1F2933] placeholder:text-[#A7B0B8] focus:outline-none focus:border-[#1F2933] transition-all"
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1.5">Direct Mobile (WhatsApp Preferred) <span className="text-red-500">*</span></label>
              <input
                type="tel"
                placeholder="+91 98250 12345"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-lg text-sm text-[#1F2933] placeholder:text-[#A7B0B8] focus:outline-none focus:border-[#1F2933] transition-all"
                {...register('phone')}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1.5">Primary Residence / City <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Ahmedabad (or Mumbai, Bangalore, Delhi)"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-lg text-sm text-[#1F2933] placeholder:text-[#A7B0B8] focus:outline-none focus:border-[#1F2933] transition-all"
                {...register('city')}
              />
              {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1.5">Profession / Role</label>
              <input
                type="text"
                placeholder="Founder, Managing Director, Executive"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-lg text-sm text-[#1F2933] placeholder:text-[#A7B0B8] focus:outline-none focus:border-[#1F2933] transition-all"
                {...register('profession')}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1.5">Company / Family Office / Entity</label>
              <input
                type="text"
                placeholder="e.g. Patel Capital / Self"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-lg text-sm text-[#1F2933] placeholder:text-[#A7B0B8] focus:outline-none focus:border-[#1F2933] transition-all"
                {...register('company')}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={validateStep1}
              className="px-6 py-3 bg-[#1F2933] text-white hover:bg-[#111820] rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
            >
              Continue to Membership Tier &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: MEMBERSHIP TIER & SPEND */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="text-sm font-semibold text-[#1F2933] mb-0.5">Select Cohort 1 Membership Tier</h3>
            <p className="text-xs text-[#66717C]">During Cohort 1, founding members receive full concierge access without onboarding subscription fees.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {MEMBERSHIP_TIERS.map((tier) => {
              const Icon = tier.icon;
              const isSelected = selectedTier === tier.id;

              return (
                <div
                  key={tier.id}
                  onClick={() => setValue('membershipTier', tier.id as any)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#F7F8FA] border-[#1F2933] shadow-xs'
                      : 'bg-white border-[#E1E5E8] hover:border-[#A7B0B8]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#1F2933] text-white' : 'bg-[#F1F3F5] text-[#1F2933]'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-[#1F2933]">{tier.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#E1E5E8] text-[#66717C] font-mono font-medium">
                            {tier.tag}
                          </span>
                        </div>
                        <p className="text-xs text-[#66717C] mt-1 leading-relaxed">{tier.description}</p>

                        <div className="flex flex-wrap gap-2 mt-2">
                          {tier.perks.map((p, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 text-[10px] text-[#303942]">
                              <Check className="h-3 w-3 text-emerald-600" />
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#1F2933] bg-[#1F2933]' : 'border-[#E1E5E8]'}`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1.5">Estimated Annual Lifestyle Budget</label>
              <select
                className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-lg text-xs text-[#1F2933] focus:outline-none focus:border-[#1F2933]"
                {...register('annualLifestyleSpend')}
              >
                <option value="UNDER_10L">Under ₹10 Lakhs / year</option>
                <option value="10L_25L">₹10 Lakhs – ₹25 Lakhs / year</option>
                <option value="25L_50L">₹25 Lakhs – ₹50 Lakhs / year</option>
                <option value="50L_PLUS">₹50 Lakhs+ / year (High Priority)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1.5">Household Members Covered</label>
              <input
                type="number"
                min={1}
                max={15}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-lg text-xs text-[#1F2933] focus:outline-none focus:border-[#1F2933]"
                {...register('householdMembers')}
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 text-xs text-[#66717C] hover:text-[#1F2933] font-semibold"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={validateStep2}
              className="px-6 py-3 bg-[#1F2933] text-white hover:bg-[#111820] rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
            >
              Continue to Lifestyle Profile &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: LIFESTYLE PROFILE & URGENT REQUIREMENTS */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="text-sm font-semibold text-[#1F2933] mb-0.5">Lifestyle Profile & Immediate Priorities</h3>
            <p className="text-xs text-[#66717C]">Allows your dedicated Concierge Agent to tailor availability and recommendations immediately.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-2">Primary Concierge Priorities</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INTEREST_OPTIONS.map((item) => {
                const Icon = item.icon;
                const isChecked = selectedInterests.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleInterest(item.id)}
                    className={`p-3 rounded-lg border flex items-center gap-2.5 cursor-pointer text-xs transition-all ${
                      isChecked
                        ? 'bg-[#F7F8FA] border-[#1F2933] text-[#1F2933] font-semibold'
                        : 'bg-white border-[#E1E5E8] text-[#66717C] hover:border-[#A7B0B8]'
                    }`}
                  >
                    <Icon className="h-4 w-4 text-[#1F2933] shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {isChecked && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1.5">Dietary / Culinary Preferences</label>
              <input
                type="text"
                placeholder="e.g. Jain, Pure Vegetarian, Vegan, Gluten-free"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-lg text-xs text-[#1F2933] placeholder:text-[#A7B0B8] focus:outline-none focus:border-[#1F2933]"
                {...register('dietaryPreferences')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1.5">Frequent Travel Destinations</label>
              <input
                type="text"
                placeholder="e.g. Mumbai, Dubai, London, Goa, Udaipur"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-lg text-xs text-[#1F2933] placeholder:text-[#A7B0B8] focus:outline-none focus:border-[#1F2933]"
                {...register('frequentDestinations')}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1.5">What should Proventa handle for you first?</label>
            <textarea
              rows={2}
              placeholder="e.g. Weekend retreat coordination, flight booking, dining reservations, corporate gifting..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-lg text-xs text-[#1F2933] placeholder:text-[#A7B0B8] focus:outline-none focus:border-[#1F2933] resize-none"
              {...register('intendedUse')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1.5">Preferred Direct Communication</label>
              <select
                className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-lg text-xs text-[#1F2933] focus:outline-none focus:border-[#1F2933]"
                {...register('communicationPref')}
              >
                <option value="WHATSAPP">WhatsApp Private Chat (Direct &amp; Fast)</option>
                <option value="EMAIL">Encrypted Email Dispatch</option>
                <option value="IN_APP">Proventa Web Concierge Life OS</option>
                <option value="SMS">SMS Alerts Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1.5">Referral / Invitation Code</label>
              <input
                type="text"
                placeholder="Advisor name, member referral, or code"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E1E5E8] rounded-lg text-xs text-[#1F2933] placeholder:text-[#A7B0B8] focus:outline-none focus:border-[#1F2933]"
                {...register('referralSource')}
              />
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="p-3.5 rounded-lg bg-[#F7F8FA] border border-[#E1E5E8] flex items-start gap-3">
            <input
              type="checkbox"
              id="cohort-consent"
              className="mt-0.5 h-4 w-4 rounded border-[#E1E5E8] text-[#1F2933] focus:ring-[#1F2933]"
              {...register('consentGiven')}
            />
            <label htmlFor="cohort-consent" className="text-xs text-[#66717C] leading-relaxed">
              I apply for Founding Access to Proventa Cohort 1. I consent to confidential processing under the DPDP Act 2023 and agree to the <a href="/terms" className="underline text-[#1F2933]">Terms</a> &amp; <a href="/privacy" className="underline text-[#1F2933]">Privacy Policy</a>.
            </label>
          </div>
          {errors.consentGiven && <p className="text-xs text-red-600">{errors.consentGiven.message}</p>}

          <div className="pt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2.5 text-xs text-[#66717C] hover:text-[#1F2933] font-semibold"
            >
              &larr; Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-[#1F2933] text-white hover:bg-[#111820] rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-xs disabled:opacity-50"
            >
              {loading ? 'Submitting Application...' : 'Submit Cohort 1 Application'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
