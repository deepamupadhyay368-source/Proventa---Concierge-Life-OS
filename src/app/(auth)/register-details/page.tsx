'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  KeyRound,
  Check,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export default function RegisterDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Registration form inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('India');
  const [passKey, setPassKey] = useState('');
  const [confirmPassKey, setConfirmPassKey] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !name) {
        setName(session.user.name);
      }
      // If user already completed registration and established pass key, direct to sign in
      const needsReg = (session.user as unknown as { needsRegistration?: boolean }).needsRegistration;
      if (needsReg === false && !isSuccess) {
        router.replace('/sign-in');
      }
    }
  }, [session, router, name, isSuccess]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#090B10] flex items-center justify-center text-[#F4F6FA]">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-[#858D9B]">
          <Loader2 className="w-4 h-4 animate-spin text-[#2457FF]" />
          <span>Verifying sovereign credentials...</span>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' && !isSuccess) {
    router.replace('/sign-in');
    return null;
  }

  const verifiedEmail = session?.user?.email || '';

  const formatDigits = (raw: string): string => {
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 12);
    if (digits.length > 8) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
    } else if (digits.length > 4) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
    }
    return digits;
  };

  const handlePassKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassKey(formatDigits(e.target.value));
  };

  const handleConfirmPassKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassKey(formatDigits(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setError('Please provide a valid contact mobile number.');
      return;
    }

    const cleanPassKey = passKey.replace(/[^0-9]/g, '');
    const cleanConfirm = confirmPassKey.replace(/[^0-9]/g, '');

    if (cleanPassKey.length !== 12) {
      setError('Your chosen PROVENTA Pass Key must be exactly 12 numeric digits.');
      return;
    }

    if (cleanPassKey !== cleanConfirm) {
      setError('12-digit Pass Key confirmation does not match.');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the Terms of Service & DPDP Privacy Policy.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          country: country.trim(),
          passKey: cleanPassKey,
          confirmPassKey: cleanConfirm,
          termsAccepted: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to complete registration.');
        setSubmitting(false);
        return;
      }

      // Registration successful! Clear temporary OAuth registration session
      setIsSuccess(true);
      await signOut({ redirect: false });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171C26] border border-[#252C38] rounded-xs font-mono text-[10px] uppercase tracking-widest text-[#7595FF]">
            <ShieldCheck className="w-3 h-3 text-[#2457FF]" />
            <span>SOVEREIGN REGISTRATION PROTOCOL</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-[#F4F6FA] uppercase">
            {isSuccess ? 'Account Established' : 'Complete Registration'}
          </h1>
          <p className="font-mono text-xs text-[#858D9B]">
            {isSuccess
              ? 'Your 12-digit Pass Key has been encrypted and saved.'
              : 'Create your 12-digit private Pass Key to initialize your sovereign workspace.'}
          </p>
        </div>

        {/* Success Card */}
        {isSuccess ? (
          <div className="mt-8 bg-[#171C26] border border-[#252C38] rounded-xs p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="p-4 bg-[#2457FF]/10 border border-[#2457FF]/40 rounded-xs flex items-start gap-3">
              <Check className="w-5 h-5 text-[#2457FF] shrink-0 mt-0.5" />
              <div className="text-xs text-[#C5CAD3] space-y-1">
                <span className="font-bold text-[#F4F6FA] uppercase tracking-wider block">
                  Registration &amp; Key Creation Successful
                </span>
                <p>
                  Your PROVENTA customer account and private 12-digit numeric Pass Key have been established.
                  A confirmation email has been dispatched to your verified address.
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#090B10] border border-[#252C38] rounded-xs text-xs font-mono text-[#858D9B] space-y-2">
              <div className="flex items-center gap-2 text-[#7595FF]">
                <KeyRound className="w-4 h-4" />
                <span className="font-bold uppercase">Mandatory Sign-In Requirement</span>
              </div>
              <p>
                To enter your wealth cockpit, you must now sign in using your registered email and the 12-digit Pass Key you just created.
              </p>
            </div>

            <Link
              href="/sign-in?registered=true"
              className="w-full py-3.5 bg-[#2457FF] text-white hover:bg-[#1D4ED8] font-heading font-bold text-xs uppercase tracking-wider rounded-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#2457FF]/20"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* REGISTRATION DETAILS & PASS KEY CREATION FORM */
          <div className="mt-8 bg-[#171C26] border border-[#252C38] rounded-xs p-6 sm:p-8 space-y-6 shadow-2xl">
            {error && (
              <div
                role="alert"
                className="p-3.5 bg-[#FF7A70]/10 border border-[#FF7A70] rounded-xs text-xs text-[#FF7A70] font-medium"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Legal Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C5CAD3]">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikramaditya Singhania"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#090B10] border border-[#252C38] focus:border-[#2457FF] focus:outline-none rounded-xs text-sm text-[#F4F6FA] placeholder-[#858D9B]/50 transition-colors"
                />
              </div>

              {/* Verified Email */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C5CAD3]">
                    Verified Email Address
                  </label>
                  <span className="font-mono text-[10px] text-[#7595FF] flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-[#2457FF]" />
                    Google Verified
                  </span>
                </div>
                <input
                  type="email"
                  value={verifiedEmail}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-[#090B10]/60 border border-[#252C38] rounded-xs text-sm text-[#858D9B] cursor-not-allowed select-all"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C5CAD3]">
                  Mobile Contact Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#090B10] border border-[#252C38] focus:border-[#2457FF] focus:outline-none rounded-xs text-sm text-[#F4F6FA] placeholder-[#858D9B]/50 transition-colors"
                />
                <p className="text-[10px] font-mono text-[#858D9B]">
                  Required for DPDP security alerts and trustee mandates.
                </p>
              </div>

              {/* Country */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C5CAD3]">
                  Tax &amp; Legal Jurisdiction
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#090B10] border border-[#252C38] focus:border-[#2457FF] focus:outline-none rounded-xs text-sm text-[#F4F6FA] transition-colors"
                >
                  <option value="India">India (Income Tax Act &amp; Indian Trusts Act)</option>
                  <option value="United Arab Emirates">United Arab Emirates (DIFC / ADGM)</option>
                  <option value="Singapore">Singapore (MAS / VCC)</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Other">Other Global Jurisdiction</option>
                </select>
              </div>

              {/* SECTION: CUSTOMER CREATES THEIR OWN 12-DIGIT PASS KEY */}
              <div className="pt-3 border-t border-[#252C38] space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#2457FF]" />
                  <span className="font-heading text-xs uppercase font-bold tracking-wider text-[#F4F6FA]">
                    Create Your 12-Digit PROVENTA Pass Key
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#858D9B] leading-relaxed">
                  Choose 12 numeric digits to serve as your sovereign authentication key. You will enter this key alongside your email whenever you log in.
                </p>

                {/* Create 12-Digit Pass Key */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C5CAD3]">
                    Create 12-Digit Pass Key
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={passKey}
                    onChange={handlePassKeyChange}
                    placeholder="1234-5678-9012"
                    maxLength={14}
                    required
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2.5 bg-[#090B10] border border-[#252C38] focus:border-[#2457FF] focus:outline-none rounded-xs font-mono font-bold text-sm tracking-widest text-[#F4F6FA] placeholder-[#858D9B]/50 transition-colors"
                  />
                </div>

                {/* Confirm 12-Digit Pass Key */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C5CAD3]">
                    Confirm 12-Digit Pass Key
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={confirmPassKey}
                    onChange={handleConfirmPassKeyChange}
                    placeholder="1234-5678-9012"
                    maxLength={14}
                    required
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2.5 bg-[#090B10] border border-[#252C38] focus:border-[#2457FF] focus:outline-none rounded-xs font-mono font-bold text-sm tracking-widest text-[#F4F6FA] placeholder-[#858D9B]/50 transition-colors"
                  />
                  {passKey && confirmPassKey && passKey !== confirmPassKey && (
                    <p className="text-[10px] font-mono text-[#FF7A70]">
                      Keys do not match.
                    </p>
                  )}
                  {passKey && confirmPassKey && passKey === confirmPassKey && passKey.replace(/[^0-9]/g, '').length === 12 && (
                    <p className="text-[10px] font-mono text-[#7595FF] flex items-center gap-1">
                      <Check className="w-3 h-3" /> 12-Digit Pass Key verified and confirmed.
                    </p>
                  )}
                </div>
              </div>

              {/* Terms & Privacy Acceptance */}
              <div className="pt-2">
                <label className="flex items-start gap-3 p-3 bg-[#090B10] border border-[#252C38] rounded-xs cursor-pointer hover:border-[#7595FF] transition-colors">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded-xs border-[#252C38] bg-[#171C26] text-[#2457FF] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-[#858D9B] leading-snug">
                    I accept PROVENTA&apos;s{' '}
                    <Link href="/terms" target="_blank" className="text-[#7595FF] underline hover:text-white">
                      Terms of Service
                    </Link>{' '}
                    and acknowledge statutory data processing under{' '}
                    <Link href="/privacy" target="_blank" className="text-[#7595FF] underline hover:text-white">
                      DPDP Privacy Standards
                    </Link>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#2457FF] text-white hover:bg-[#1D4ED8] disabled:opacity-50 font-heading font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Establishing 12-Digit Pass Key...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account &amp; Pass Key</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}