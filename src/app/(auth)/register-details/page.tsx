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
    }
  }, [session, name]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#292F3D] flex items-center justify-center text-[#F1F2F4]">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-[#A8ADB7]">
          <Loader2 className="w-4 h-4 animate-spin text-[#536B88]" />
          <span>Verifying credentials...</span>
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
      setError('You must accept the Terms of Service & Privacy Policy.');
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

      setIsSuccess(true);
      await signOut({ redirect: false });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#191B20] border border-[#414957] font-mono text-[10px] uppercase tracking-widest text-[#536B88] font-bold rounded-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-[#536B88]" />
            <span>REGISTRATION PROTOCOL</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-[#FFFFFF] uppercase">
            {isSuccess ? 'Account Established' : 'Complete Registration'}
          </h1>
          <p className="font-mono text-xs text-[#A8ADB7]">
            {isSuccess
              ? 'Your 12-digit Pass Key has been encrypted and saved.'
              : 'Create your 12-digit private Pass Key to initialize your procurement workspace.'}
          </p>
        </div>

        {/* Success Card */}
        {isSuccess ? (
          <div className="mt-8 bg-[#303746] border border-[#414957] p-6 sm:p-8 space-y-6 shadow-sm rounded-sm">
            <div className="p-4 bg-[#252B38] border border-[#4A7C59] flex items-start gap-3 rounded-sm">
              <Check className="w-5 h-5 text-[#4A7C59] shrink-0 mt-0.5" />
              <div className="text-xs text-[#F1F2F4] space-y-1">
                <span className="font-bold uppercase tracking-wider block text-[#FFFFFF]">
                  Registration &amp; Key Creation Successful
                </span>
                <p className="text-[#A8ADB7]">
                  Your PROVENTA account and private 12-digit numeric Pass Key have been established.
                  A confirmation email has been dispatched to your verified address.
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#252B38] border border-[#414957] text-xs font-mono text-[#A8ADB7] space-y-2 rounded-sm">
              <div className="flex items-center gap-2 text-[#536B88] font-bold">
                <KeyRound className="w-4 h-4" />
                <span className="uppercase text-[#FFFFFF]">Mandatory Sign-In Requirement</span>
              </div>
              <p>
                To enter your procurement portal, you must now sign in using your registered email and the 12-digit Pass Key you just created.
              </p>
            </div>

            <Link
              href="/sign-in?registered=true"
              className="w-full py-3.5 bg-[#C66A42] text-white hover:bg-[#B35A33] font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm rounded-sm"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* REGISTRATION DETAILS & PASS KEY CREATION FORM */
          <div className="mt-8 bg-[#303746] border border-[#414957] p-6 sm:p-8 space-y-6 shadow-sm rounded-sm">
            {error && (
              <div
                role="alert"
                className="p-3.5 bg-[#252B38] border border-[#D9534F] text-xs text-[#D9534F] font-medium rounded-sm"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Legal Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikramaditya Singhania"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none text-sm text-[#FFFFFF] placeholder-[#A8ADB7] transition-colors rounded-sm"
                />
              </div>

              {/* Verified Email */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
                    Verified Email Address
                  </label>
                  <span className="font-mono text-[10px] text-[#536B88] flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3 h-3 text-[#536B88]" />
                    Google Verified
                  </span>
                </div>
                <input
                  type="email"
                  value={verifiedEmail}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] text-sm text-[#A8ADB7] cursor-not-allowed select-all font-mono rounded-sm"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
                  Mobile Contact Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none text-sm text-[#FFFFFF] placeholder-[#A8ADB7] transition-colors rounded-sm"
                />
              </div>

              {/* Country */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
                  State / Jurisdiction
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none text-sm text-[#FFFFFF] transition-colors rounded-sm"
                />
              </div>

              {/* SECTION: CUSTOMER CREATES THEIR OWN 12-DIGIT PASS KEY */}
              <div className="pt-3 border-t border-[#414957] space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#536B88]" />
                  <span className="font-heading text-xs uppercase font-bold tracking-wider text-[#FFFFFF]">
                    Create Your 12-Digit PROVENTA Pass Key
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#A8ADB7] leading-relaxed">
                  Choose 12 numeric digits to serve as your private authentication key. You will enter this key alongside your email whenever you log in.
                </p>

                {/* Create 12-Digit Pass Key */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
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
                    className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none font-mono font-bold text-sm tracking-widest text-[#FFFFFF] placeholder-[#A8ADB7] transition-colors rounded-sm"
                  />
                </div>

                {/* Confirm 12-Digit Pass Key */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFFFFF] font-bold">
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
                    className="w-full px-3.5 py-2.5 bg-[#191B20] border border-[#414957] focus:border-[#536B88] focus:outline-none font-mono font-bold text-sm tracking-widest text-[#FFFFFF] placeholder-[#A8ADB7] transition-colors rounded-sm"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#A8ADB7]">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#C66A42]"
                  />
                  <span>
                    I accept the PROVENTA Terms of Service and Privacy Policy.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#C66A42] text-white hover:bg-[#B35A33] disabled:opacity-50 font-heading font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm rounded-sm"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Complete Registration</span>
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
