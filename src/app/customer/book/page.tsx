'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, 
  Droplet, 
  Hammer, 
  Wind, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { HOME_SERVICE_CATEGORIES, AHMEDABAD_TIME_SLOTS } from '@/lib/home/constants';
import { homeDataStore } from '@/lib/home/repository';

function BookServiceWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialServiceCode = searchParams.get('service');

  const customerId = 'cust-bopal-01'; // Mock active session customer
  const customer = homeDataStore.getCustomerById(customerId);
  const subscription = homeDataStore.getSubscriptionByCustomerId(customerId);

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('ELECTRICAL');
  const [selectedServiceCode, setSelectedServiceCode] = useState<string>(initialServiceCode || 'ELEC-MCB-01');
  const [customServiceName, setCustomServiceName] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('2026-11-25');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState(AHMEDABAD_TIME_SLOTS[0]);
  const [urgency, setUrgency] = useState<'STANDARD' | 'PRIORITY'>('STANDARD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCategory = HOME_SERVICE_CATEGORIES.find(c => c.key === selectedCategory) || HOME_SERVICE_CATEGORIES[0];
  const currentServiceItem = currentCategory.services.find(s => s.code === selectedServiceCode);

  const isCovered = Boolean(subscription && subscription.visitsRemainingCurrentPeriod > 0);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const serviceName = currentServiceItem ? currentServiceItem.name : (customServiceName || 'General Domestic Service');
      const serviceCode = currentServiceItem ? currentServiceItem.code : 'CUSTOM-SRV-01';

      const response = await fetch('/api/home/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          categoryKey: selectedCategory,
          serviceCode,
          serviceName,
          issueDescription,
          preferredDate,
          preferredTimeSlot,
          urgency,
          autoDispatch: true
        })
      });

      const res = await response.json();
      if (res.success && res.request) {
        router.push(`/customer/requests/${res.request.id}`);
      } else {
        alert(res.error || 'Failed to submit service booking');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      alert(err.message || 'Error creating booking');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      
      {/* Wizard Header */}
      <div className="flex items-center justify-between border-b border-[#E3DFD5] pb-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-[#53634A]">Step {step} of 3</span>
          <h1 className="text-2xl font-bold text-[#171A17]">Schedule a Household Maintenance Visit</h1>
        </div>
        <Link href="/customer/dashboard" className="text-xs text-stone-500 hover:text-stone-800">
          Cancel & Exit
        </Link>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
        <div className={`p-2.5 rounded-xl border text-center transition ${step >= 1 ? 'bg-[#53634A] text-white border-[#53634A]' : 'bg-white text-stone-400 border-stone-200'}`}>
          1. Select Trade & Issue
        </div>
        <div className={`p-2.5 rounded-xl border text-center transition ${step >= 2 ? 'bg-[#53634A] text-white border-[#53634A]' : 'bg-white text-stone-400 border-stone-200'}`}>
          2. Slot & Details
        </div>
        <div className={`p-2.5 rounded-xl border text-center transition ${step >= 3 ? 'bg-[#53634A] text-white border-[#53634A]' : 'bg-white text-stone-400 border-stone-200'}`}>
          3. Entitlement & Review
        </div>
      </div>

      {/* STEP 1: CATEGORY & SERVICE PICKER */}
      {step === 1 && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DFD5] shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-[#171A17]">Select Household Trade</h2>
            <p className="text-xs text-stone-500">What type of maintenance do you need assistance with?</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {HOME_SERVICE_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setSelectedServiceCode(cat.services[0]?.code || '');
                }}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                  selectedCategory === cat.key
                    ? 'bg-[#53634A]/10 border-[#53634A] text-[#171A17] ring-1 ring-[#53634A]'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="font-bold text-sm">{cat.name}</div>
                <div className="text-[11px] text-stone-500">{cat.services.length} services</div>
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-stone-100">
            <h3 className="text-sm font-bold text-[#171A17]">Standard Services in {currentCategory.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentCategory.services.map(s => (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => setSelectedServiceCode(s.code)}
                  className={`p-3.5 rounded-xl border text-left text-xs transition flex flex-col justify-between space-y-1.5 ${
                    selectedServiceCode === s.code
                      ? 'bg-white border-[#53634A] ring-2 ring-[#53634A]/20 shadow-xs'
                      : 'bg-stone-50 border-stone-200 hover:bg-white'
                  }`}
                >
                  <div className="font-semibold text-stone-900">{s.name}</div>
                  <div className="text-[11px] text-stone-500">Duration: ~{s.estimatedDurationMin} mins • Standard: ₹{s.standardPrice}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-6 py-3 rounded-xl shadow-xs transition"
            >
              <span>Continue to Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DATE, TIME & DESCRIPTION */}
      {step === 2 && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DFD5] shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-[#171A17]">Appointment Time & Issue Details</h2>
            <p className="text-xs text-stone-500">Technicians arrive within your confirmed 2-hour window.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">Preferred Date *</label>
              <input
                type="date"
                required
                value={preferredDate}
                onChange={e => setPreferredDate(e.target.value)}
                className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">2-Hour Arrival Window *</label>
              <select
                value={preferredTimeSlot}
                onChange={e => setPreferredTimeSlot(e.target.value)}
                className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
              >
                {AHMEDABAD_TIME_SLOTS.map((slot: string) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Issue Description & Notes *</label>
            <textarea
              required
              rows={3}
              placeholder="Please describe symptoms, e.g. 'Kitchen MCB trips whenever geyser and induction are both turned on'..."
              value={issueDescription}
              onChange={e => setIssueDescription(e.target.value)}
              className="w-full text-sm rounded-xl border border-[#E3DFD5] p-3.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Urgency Level</label>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setUrgency('STANDARD')}
                className={`p-3 rounded-xl border text-left transition ${
                  urgency === 'STANDARD' ? 'bg-[#53634A]/10 border-[#53634A] font-semibold text-[#171A17]' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="font-bold">Standard Appointment</div>
                <div className="text-[11px] text-stone-500">Scheduled in requested slot</div>
              </button>
              <button
                type="button"
                onClick={() => setUrgency('PRIORITY')}
                className={`p-3 rounded-xl border text-left transition ${
                  urgency === 'PRIORITY' ? 'bg-amber-50 border-amber-500 font-semibold text-amber-900' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="font-bold text-amber-800">Priority Dispatch</div>
                <div className="text-[11px] text-amber-700">&lt; 90 min emergency response</div>
              </button>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-stone-100">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              disabled={!issueDescription.trim()}
              onClick={handleNext}
              className="inline-flex items-center gap-2 bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-6 py-3 rounded-xl shadow-xs transition disabled:opacity-50"
            >
              <span>Review & Confirm</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ENTITLEMENT & CONFIRMATION */}
      {step === 3 && (
        <form onSubmit={handleSubmitBooking} className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DFD5] shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-[#171A17]">Review Booking & Membership Coverage</h2>
            <p className="text-xs text-stone-500">Confirm visit deduction and service location.</p>
          </div>

          {/* Entitlement Banner */}
          {isCovered ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Covered under your {subscription?.planTier} Membership</span>
              </div>
              <p className="text-emerald-800 pl-7 leading-relaxed">
                1 visit will be deducted from your {subscription?.visitsRemainingCurrentPeriod} remaining visits this billing cycle. Complete labour and diagnostics are ₹0.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span>Monthly Visit Limit Reached or Non-Member Callout</span>
              </div>
              <p className="text-amber-800 pl-7">
                This visit will be billed at preferential rate ₹399 upon completion.
              </p>
            </div>
          )}

          {/* Booking Summary Card */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500">Service:</span>
              <strong className="text-stone-900">{currentServiceItem?.name || customServiceName}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500">Category:</span>
              <span className="font-semibold text-stone-800">{selectedCategory}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500">Scheduled Window:</span>
              <strong className="text-stone-900">{preferredDate} ({preferredTimeSlot})</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500">Service Address:</span>
              <span className="text-stone-800 text-right max-w-xs">{customer?.apartmentOrSociety}, Flat {customer?.flatOrHouseNumber}, {customer?.locality}, Ahmedabad</span>
            </div>
            <div className="flex justify-between py-1 text-sm font-bold text-[#171A17]">
              <span>Customer Payable Now:</span>
              <span className="text-[#53634A]">{isCovered ? '₹0 (Included)' : '₹399'}</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-stone-100">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-7 py-3.5 rounded-xl shadow-md transition"
            >
              <span>{isSubmitting ? 'Booking & Allocating Technician...' : 'Confirm Booking'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

    </div>
  );
}

export default function BookServicePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-stone-500">Loading booking wizard...</div>}>
      <BookServiceWizard />
    </Suspense>
  );
}
