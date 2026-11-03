'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  KeyRound,
  Lock,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

export default function RegisterDetailsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // Registration form inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('India');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pass key presentation phase
  const [passKey, setPassKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmedSaved, setConfirmedSaved] = useState(false);

  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !name) {
        setName(session.user.name);
      }
      // If the user already has completed registration, redirect directly to dashboard
      const needsReg = (session.user as unknown as { needsRegistration?: boolean }).needsRegistration;
      if (needsReg === false && !passKey) {
        router.replace('/dashboard');
      }
    }
  }, [session, router, name, passKey]);

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

  if (status === 'unauthenticated') {
    router.replace('/sign-in');
    return null;
  }

  const verifiedEmail = session?.user?.email || '';

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
          termsAccepted: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to complete registration.');
        setSubmitting(false);
        return;
      }

      // Pass key received successfully
      setPassKey(data.passKey);
      // Trigger session update so needsRegistration flag is cleared
      if (update) {
        void update();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyPassKey = async () => {
    if (!passKey) return;
    try {
      await navigator.clipboard.writeText(passKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleEnterCockpit = () => {
    if (!confirmedSaved) return;
    router.push('/dashboard');
    router.refresh();
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
            {passKey ? 'Your 12-Digit Pass Key' : 'Complete Registration'}
          </h1>
          <p className="font-mono text-xs text-[#858D9B]">
            {passKey
              ? 'Save your 12-digit private credential. Displayed once only.'
              : 'Configure your verified identity to initialize your financial intelligence workspace.'}
          </p>
        </div>

        {/* Phase 2: PASS KEY DISPLAY */}
        {passKey ? (
          <div className="mt-8 bg-[#171C26] border border-[#252C38] rounded-xs p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="p-4 bg-[#2457FF]/10 border border-[#2457FF]/30 rounded-xs flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-[#7595FF] shrink-0 mt-0.5" />
              <div className="text-xs text-[#C5CAD3] space-y-1">
                <span className="font-bold text-[#F4F6FA] uppercase tracking-wider block">
                  12-Digit Numeric Sovereign Pass Key
                </span>
                <p>
                  This unique 12-digit key is your permanent credential for PROVENTA. We only store its salted cryptographic hash. 
                  On every subsequent visit, enter your registered email and this 12-digit key to sign in directly without a password.
                </p>
              </div>
            </div>

            {/* Pass Key Display Box */}
            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#858D9B]">
                Your 12-Digit PROVENTA Pass Key
              </label>
              <div className="p-4 bg-[#090B10] border border-[#2457FF] rounded-xs flex items-center justify-between gap-2">
                <span className="font-mono font-black text-lg sm:text-2xl text-[#7595FF] tracking-[0.15em] select-all break-all">
                  {passKey}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPassKey}
                  className="px-3.5 py-2 bg-[#2457FF] text-white hover:bg-[#1D4ED8] font-mono text-xs uppercase font-bold rounded-xs flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-[#090B10] border border-[#252C38] rounded-xs flex items-center gap-2.5 text-xs text-[#858D9B]">
              <AlertTriangle className="w-4 h-4 text-[#FF7A70] shrink-0" />
              <span>Make sure to copy and store this 12-digit key safely before entering your cockpit.</span>
            </div>

            {/* Mandatory Confirmation Checkbox */}
            <label className="flex items-start gap-3 p-3 bg-[#090B10] border border-[#252C38] rounded-xs cursor-pointer hover:border-[#7595FF] transition-colors">
              <input
                type="checkbox"
                checked={confirmedSaved}
                onChange={(e) => setConfirmedSaved(e.target.checked)}
                className="mt-1 h-4 w-4 rounded-xs border-[#252C38] bg-[#171C26] text-[#2457FF] focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-[#C5CAD3] leading-snug">
                I have securely copied and saved my <strong className="text-white">12-Digit PROVENTA Pass Key</strong>. I understand it will not be displayed again.
              </span>
            </label>

            {/* Enter Cockpit Button */}
            <button
              type="button"
              onClick={handleEnterCockpit}
              disabled={!confirmedSaved}
              className="w-full py-3.5 bg-[#2457FF] text-white hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed font-heading font-bold text-xs uppercase tracking-wider rounded-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#2457FF]/20"
            >
              <span>Enter Wealth Cockpit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Phase 1: REGISTRATION DETAILS FORM */
          <div className="mt-8 bg-[#171C26] border border-[#252C38] rounded-xs p-6 sm:p-8 space-y-6 shadow-2xl">
            {error && (
              <div className="p-3.5 bg-[#FF7A70]/10 border border-[#FF7A70] rounded-xs text-xs text-[#FF7A70] font-medium">
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
                  Required for critical two-factor security alerts and trustee mandates.
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
                    <span>Generating Cryptographic Pass Key...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Pass Key &amp; Initialize Workspace</span>
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
