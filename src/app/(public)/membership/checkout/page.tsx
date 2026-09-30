'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import {
  Check,
  ShieldCheck,
  Lock,
  ArrowRight,
  Info,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import {
  CANONICAL_MEMBERSHIP_PLANS,
  MEMBERSHIP_PLANS_LIST,
  MEMBERSHIP_PAYMENT_DISCLOSURE,
  getPlanById,
  MembershipPlan,
  MembershipTierSlug,
} from '@/lib/membership/plans';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function MembershipCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawPlanParam = searchParams.get('plan') || 'private';

  const [selectedPlanSlug, setSelectedPlanSlug] = useState<MembershipTierSlug>(
    (rawPlanParam.toLowerCase() as MembershipTierSlug) in CANONICAL_MEMBERSHIP_PLANS
      ? (rawPlanParam.toLowerCase() as MembershipTierSlug)
      : 'private'
  );

  const plan: MembershipPlan = CANONICAL_MEMBERSHIP_PLANS[selectedPlanSlug] || CANONICAL_MEMBERSHIP_PLANS.private;

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [checkoutState, setCheckoutState] = useState<'REVIEW' | 'PROCESSING' | 'FAILED' | 'SUCCESS'>('REVIEW');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activatedMembership, setActivatedMembership] = useState<any>(null);

  // Load authenticated user & customer profile
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/customer/profile');
        if (res.ok) {
          const data = await res.json();
          if (data?.profile) {
            setUser(data.profile);
            setProfile(data.profile.customerProfile);
          }
        }
      } catch (err) {
        console.error('[Membership Checkout] User load error', err);
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();
  }, []);

  const isAlreadyActive =
    profile?.membershipPlan === plan.name && profile?.membershipStatus === 'ACTIVE';

  const handleProceedToCheckout = async () => {
    if (!user) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(`/membership/checkout?plan=${plan.id}`)}`);
      return;
    }

    if (isAlreadyActive) {
      toast.info(`You already have an active ${plan.name} membership.`);
      router.push('/dashboard');
      return;
    }

    setCheckoutState('PROCESSING');
    setErrorMessage(null);

    try {
      // 1. Create server-side Razorpay order
      const orderRes = await fetch('/api/membership/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        if (orderData?.alreadyActive) {
          toast.info(orderData.message);
          router.push('/dashboard');
          return;
        }
        throw new Error(orderData.error || 'Failed to initialize membership checkout order');
      }

      // 2. Configure Razorpay Standard Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Proventa',
        description: `Proventa ${plan.name} Monthly Membership`,
        order_id: orderData.orderId,
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || '',
        },
        theme: {
          color: '#1F2933',
        },
        handler: async function (response: any) {
          try {
            setCheckoutState('PROCESSING');

            // 3. Server-side authoritative verification
            const verifyRes = await fetch('/api/membership/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                planId: plan.id,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.verified) {
              throw new Error(verifyData.error || 'Payment signature verification failed.');
            }

            setActivatedMembership(verifyData.membership);
            setCheckoutState('SUCCESS');
            toast.success(`Welcome to Proventa ${plan.name}! Membership activated.`);
          } catch (verifyErr: any) {
            console.error('[Membership Verification Error]', verifyErr);
            setErrorMessage(verifyErr.message || 'Payment verification failed.');
            setCheckoutState('FAILED');
          }
        },
        modal: {
          ondismiss: function () {
            // If user closed without finishing payment
            if (checkoutState !== 'SUCCESS') {
              setCheckoutState('FAILED');
              setErrorMessage('Payment was not completed. You can safely retry when you are ready.');
            }
          },
        },
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setCheckoutState('FAILED');
          setErrorMessage(resp?.error?.description || 'Payment was declined by payment gateway.');
        });
        rzp.open();
      } else {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }
    } catch (err: any) {
      console.error('[Checkout Error]', err);
      setErrorMessage(err.message || 'Unable to open checkout. Please try again.');
      setCheckoutState('FAILED');
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (checkoutState === 'SUCCESS') {
    const renewsFormatted = activatedMembership?.renewsAt
      ? new Date(activatedMembership.renewsAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

    return (
      <div className="min-h-screen bg-[#F7F8FA] pt-32 pb-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white border border-[#E1E5E8] rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-8 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <Check className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111820]">
              Welcome to Proventa.
            </h1>
            <p className="text-sm font-medium text-emerald-700 bg-emerald-50 py-1 px-3 rounded-full inline-block border border-emerald-200">
              Your membership is now active.
            </p>
          </div>

          {/* Membership Confirmation Card */}
          <div className="bg-[#F7F8FA] border border-[#E1E5E8] rounded-2xl p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-[#E1E5E8] pb-3">
              <span className="text-xs font-semibold text-[#66717C] uppercase tracking-wider">
                Membership
              </span>
              <span className="text-base font-bold text-[#111820]">
                {activatedMembership?.plan || plan.name}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-[#E1E5E8] pb-3">
              <span className="text-xs font-semibold text-[#66717C] uppercase tracking-wider">
                Monthly Membership
              </span>
              <span className="text-base font-bold text-[#111820]">
                {plan.formattedPrice}
                <span className="text-xs font-normal text-[#66717C]">/month</span>
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-[#E1E5E8] pb-3">
              <span className="text-xs font-semibold text-[#66717C] uppercase tracking-wider">
                Status
              </span>
              <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#66717C] uppercase tracking-wider">
                Next Renewal
              </span>
              <span className="text-xs font-semibold text-[#111820] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#66717C]" />
                {renewsFormatted}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] text-xs text-[#66717C] text-left flex items-start gap-2">
            <Info className="w-4 h-4 text-[#1F2933] shrink-0 mt-0.5" />
            <span>{MEMBERSHIP_PAYMENT_DISCLOSURE}</span>
          </div>

          {/* Primary CTA */}
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-[#1F2933] hover:bg-[#111820] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md"
            >
              <span>Go to Proventa</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // REVIEW & CHECKOUT SCREEN
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#1F2933] pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href="/membership"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#66717C] hover:text-[#111820] uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Plans</span>
        </Link>

        {/* Tier Selector Pills */}
        <div className="flex items-center p-1.5 bg-white border border-[#E1E5E8] rounded-2xl shadow-xs">
          {MEMBERSHIP_PLANS_LIST.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedPlanSlug(p.id);
                setErrorMessage(null);
                if (checkoutState === 'FAILED') setCheckoutState('REVIEW');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${
                selectedPlanSlug === p.id
                  ? 'bg-[#1F2933] text-white shadow-xs'
                  : 'text-[#66717C] hover:text-[#111820]'
              }`}
            >
              <span>{p.name}</span>
              <span className="hidden sm:inline text-[10px] opacity-80 ml-1">({p.formattedPrice})</span>
            </button>
          ))}
        </div>

        {/* Error / Payment Failed Notification */}
        {checkoutState === 'FAILED' && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-sm text-red-900">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Payment was not completed.</span>
            </div>
            <p className="text-red-700 pl-6">
              {errorMessage || 'Your transaction could not be processed. No charges were made to your account.'}
            </p>
          </div>
        )}

        {/* Duplicate Protection Banner */}
        {isAlreadyActive && (
          <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-blue-950">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>You already have an active Proventa membership.</span>
            </div>
            <p className="text-blue-800 pl-6">
              You are currently on the <strong className="uppercase">{plan.name}</strong> plan. You can submit concierge requests from your dashboard or manage your billing details.
            </p>
            <div className="pt-2 pl-6">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-950 underline underline-offset-4 uppercase tracking-wider"
              >
                Go to Dashboard →
              </Link>
            </div>
          </div>
        )}

        {/* Review Card */}
        <div className="bg-white border border-[#E1E5E8] rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
          {/* Header */}
          <div className="border-b border-[#E1E5E8] pb-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#66717C]">
                Membership Review
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8]">
                Monthly Billing
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111820]">
              PROVENTA {plan.name}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#66717C] italic">
              "{plan.positioning}"
            </p>
          </div>

          {/* Inclusions Checklist */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#111820]">
              Plan Inclusions
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#525F6C]">
              {plan.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                  <span className="font-medium text-[#1F2933]">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown Box */}
          <div className="bg-[#F7F8FA] border border-[#E1E5E8] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-[#66717C]">
              <span>Membership fee</span>
              <span className="font-semibold text-[#111820]">{plan.formattedPrice}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-[#66717C]">
              <span>Billing cadence</span>
              <span className="font-medium text-[#111820]">Monthly (Renews every 30 days)</span>
            </div>

            <div className="border-t border-[#E1E5E8] pt-3 flex items-center justify-between text-sm">
              <span className="font-bold text-[#111820]">Total today</span>
              <span className="text-2xl font-bold text-[#111820]">{plan.formattedPrice}</span>
            </div>
          </div>

          {/* Mandatory Payment & Third-Party Disclosure */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] flex items-start gap-3 text-xs text-[#66717C]">
            <Info className="w-4 h-4 text-[#1F2933] shrink-0 mt-0.5" />
            <span className="leading-relaxed">{MEMBERSHIP_PAYMENT_DISCLOSURE}</span>
          </div>

          {/* Checkout CTA */}
          <div className="pt-2 space-y-3">
            <button
              type="button"
              disabled={checkoutState === 'PROCESSING' || isAlreadyActive}
              onClick={handleProceedToCheckout}
              className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-[#1F2933] hover:bg-[#111820] text-white text-xs font-semibold tracking-wider uppercase disabled:opacity-50 transition-all shadow-md"
            >
              {checkoutState === 'PROCESSING' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Preparing Secure Checkout...</span>
                </>
              ) : !user ? (
                <>
                  <span>Sign in to Join {plan.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : checkoutState === 'FAILED' ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again — Continue to Secure Checkout</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-[#A7B0B8]" />
                  <span>Continue to Secure Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-[#66717C] font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                256-Bit SSL Encrypted
              </span>
              <span>·</span>
              <span>Razorpay Verified</span>
              <span>·</span>
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MembershipCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F8FA] pt-40 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-[#1F2933] mx-auto" />
          <p className="text-xs text-[#66717C] mt-2 font-mono">Loading membership checkout...</p>
        </div>
      }
    >
      <MembershipCheckoutContent />
    </Suspense>
  );
}
