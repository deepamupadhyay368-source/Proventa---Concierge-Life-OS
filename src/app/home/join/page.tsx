'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, ArrowRight, Lock, Building } from 'lucide-react';
import { HOME_SUBSCRIPTION_PLANS, AHMEDABAD_LOCALITIES } from '@/lib/home/constants';

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPlan = searchParams.get('plan')?.toUpperCase() || 'FAMILY';
  const initialFrequency = searchParams.get('frequency')?.toUpperCase() || 'ANNUAL';

  const [selectedPlanTier, setSelectedPlanTier] = useState<string>(initialPlan);
  const [billingFrequency, setBillingFrequency] = useState<'MONTHLY' | 'ANNUAL'>(
    initialFrequency === 'MONTHLY' ? 'MONTHLY' : 'ANNUAL'
  );

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    apartmentOrSociety: '',
    flatNumber: '',
    locality: 'South Bopal',
    pincode: '380058'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activePlan = HOME_SUBSCRIPTION_PLANS.find(p => p.tier === selectedPlanTier) || HOME_SUBSCRIPTION_PLANS[1];

  const basePrice = billingFrequency === 'ANNUAL' ? activePlan.annualPrice : activePlan.monthlyPrice;
  const gstAmount = Math.round(basePrice * 0.18);
  const grandTotal = basePrice + gstAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock API subscription creation
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(`Welcome to PROVENTA Home! Your ${activePlan.name} membership is active with ${activePlan.includedVisitsPerBillingMonth} visits.`);
      setTimeout(() => {
        router.push('/home/customer/dashboard');
      }, 1500);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 space-y-10">
      
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#53634A] bg-[#53634A]/10 px-3 py-1 rounded-full border border-[#53634A]/20">
          Member Onboarding
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#171A17]">Complete Your Household Membership</h1>
        <p className="text-stone-600 text-sm">
          Join hundreds of Ahmedabad households enjoying seamless property care and verified technician access.
        </p>
      </div>

      {successMessage ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-emerald-900">{successMessage}</h2>
          <p className="text-xs text-emerald-700">Redirecting you to your Member Dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-6">
            <h3 className="font-bold text-lg text-[#171A17] pb-3 border-b border-stone-100">
              1. Household Details
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Primary Member Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh & Meera Patel"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Mobile Phone (for OTP & Dispatch) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98250 11223"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="rajesh.patel@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Flat / Unit / Villa Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B-702"
                    value={formData.flatNumber}
                    onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
                    className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Apartment / Society Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Orchid Harmony"
                    value={formData.apartmentOrSociety}
                    onChange={(e) => setFormData({ ...formData, apartmentOrSociety: e.target.value })}
                    className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Locality (Ahmedabad) *</label>
                  <select
                    value={formData.locality}
                    onChange={(e) => {
                      const loc = AHMEDABAD_LOCALITIES.find(l => l.name === e.target.value);
                      setFormData({ 
                        ...formData, 
                        locality: e.target.value,
                        pincode: loc?.pincodes[0] || formData.pincode
                      });
                    }}
                    className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                  >
                    {AHMEDABAD_LOCALITIES.map(l => (
                      <option key={l.id} value={l.name}>{l.name} ({l.zone})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500">
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span>Your address is strictly protected and shared only with assigned technicians during active visits.</span>
            </div>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-6">
            <h3 className="font-bold text-lg text-[#171A17] pb-3 border-b border-stone-100">
              2. Plan Selection & Total
            </h3>

            {/* Plan Tier Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700">Membership Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {HOME_SUBSCRIPTION_PLANS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanTier(p.tier)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition ${
                      selectedPlanTier === p.tier
                        ? 'bg-[#53634A] text-white border-[#53634A]'
                        : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-[#E3DFD5]'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Billing Frequency Toggle */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700">Billing Frequency</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setBillingFrequency('MONTHLY')}
                  className={`py-2 px-2 text-center rounded-xl font-semibold border transition ${
                    billingFrequency === 'MONTHLY'
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-[#E3DFD5]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingFrequency('ANNUAL')}
                  className={`py-2 px-2 text-center rounded-xl font-semibold border transition ${
                    billingFrequency === 'ANNUAL'
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-[#E3DFD5]'
                  }`}
                >
                  Annual (Save 20%)
                </button>
              </div>
            </div>

            {/* Inclusions summary */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
              <div className="font-semibold text-stone-900">{activePlan.name} Membership Entitlement:</div>
              <div className="text-[#53634A] font-bold">
                {activePlan.includedVisitsPerBillingMonth} Included Visits per {billingFrequency === 'ANNUAL' ? 'month (total 24/yr)' : 'month'}
              </div>
              <div className="text-stone-500 text-[11px]">
                Covers Electrical, Plumbing, Carpentry, AC Diagnostics with zero labour callout charge.
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 text-xs border-t border-stone-100 pt-3">
              <div className="flex justify-between text-stone-600">
                <span>Base Membership ({billingFrequency.toLowerCase()}):</span>
                <span>₹{basePrice}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Applicable GST (18%):</span>
                <span>₹{gstAmount}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#171A17] pt-2 border-t border-stone-200">
                <span>Total Amount:</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#53634A] hover:bg-[#43523B] text-white font-semibold text-xs py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Activating Membership...' : 'Activate Membership & Proceed'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </form>
      )}

    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-stone-500">Loading checkout...</div>}>
      <JoinContent />
    </Suspense>
  );
}
