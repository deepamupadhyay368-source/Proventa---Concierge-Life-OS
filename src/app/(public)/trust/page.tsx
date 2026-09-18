import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, CheckCircle2, UserCheck, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trust & Verification | Proventa',
  description: 'Our security architecture, operational integrity, and verification standards.',
};

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#141312] pt-24 pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#e8e2d8] pb-8 mb-10">
          <span className="text-xs uppercase tracking-widest text-[#8a7053] font-semibold mb-2 block">
            Security &amp; Integrity
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141312] tracking-tight">
            Trust &amp; Verification Architecture
          </h1>
          <p className="mt-2 text-sm text-[#6e6b65]">
            Delegating essential parts of your life requires uncompromised operational transparency, cryptographic security, and human accountability.
          </p>
          <div className="mt-4 text-xs text-[#8a8680]">
            Last verified and effective: September 18, 2026
          </div>
        </div>

        <div className="space-y-8 text-sm text-[#3b3834] leading-relaxed">
          <div className="p-6 bg-white rounded-2xl border border-[#ded7cc] space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#f5ede0] rounded-xl text-[#8a7053]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-[#141312]">1. Sovereign Consent &amp; Explicit Approval</h2>
            </div>
            <p className="text-xs text-[#6e6b65]">
              No booking, reservation, or payment is ever executed without your explicit in-app confirmation. You maintain 100% control over which options are selected and when funds are released.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#ded7cc] space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#f5ede0] rounded-xl text-[#8a7053]">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-[#141312]">2. Verified Human Execution</h2>
            </div>
            <p className="text-xs text-[#6e6b65]">
              While our AI engine accelerates market research and proposal preparation, all phone bookings, sensitive reservations, and high-value logistics are verified by our senior human concierge team.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#ded7cc] space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#f5ede0] rounded-xl text-[#8a7053]">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-[#141312]">3. Zero Fabrication Policy</h2>
            </div>
            <p className="text-xs text-[#6e6b65]">
              Every reservation confirmation code, itinerary reference, and flight PNR delivered to you is a genuine provider reference verified directly with the issuing vendor. Proventa strictly prohibits synthetic or simulated confirmations.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#ded7cc] space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#f5ede0] rounded-xl text-[#8a7053]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-[#141312]">4. Enterprise Cloud &amp; DPDP Compliance</h2>
            </div>
            <p className="text-xs text-[#6e6b65]">
              Hosted on secure cloud infrastructure in AWS Singapore with AES-256 encryption at rest, TLS 1.3 in transit, bcrypt hashed credentials, and comprehensive adherence to the Digital Personal Data Protection Act, 2023.
            </p>
          </div>

          <div className="pt-6 border-t border-[#e8e2d8] flex items-center justify-between text-xs">
            <Link href="/legal" className="text-[#8a7053] font-semibold hover:text-[#5a4733] inline-flex items-center gap-1.5">
              Explore Legal &amp; Compliance Center <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/data-rights" className="text-[#6e6b65] hover:text-[#141312]">
              Manage Your Data Rights
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
