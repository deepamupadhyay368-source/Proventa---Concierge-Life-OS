import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Sparkles, UserCheck, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { LegalHeader, LegalNav } from '@/components/legal/legal-nav';
import { POLICY_VERSIONS, POLICY_EFFECTIVE_DATES } from '@/lib/legal/versions';

export const metadata: Metadata = {
  title: 'Private Beta Terms | Proventa Legal & Trust Center',
  description:
    'Terms and operational guidelines governing early access participation in Proventa Private Beta and Wave 1 cohort.',
};

export default function PrivateBetaTermsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#141312] pt-24 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <aside className="hidden lg:block lg:col-span-1 space-y-4">
            <div className="sticky top-28 p-4 bg-white rounded-2xl border border-[#ded7cc] shadow-xs space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a7053]">
                Legal &amp; Trust Index
              </p>
              <LegalNav />
            </div>
          </aside>

          <main className="lg:col-span-3 bg-white p-8 sm:p-12 rounded-3xl border border-[#ded7cc] shadow-sm space-y-10">
            <LegalHeader
              title="Private Beta Terms"
              subtitle="Private Beta provides selected customers with early access to Proventa's Concierge Life OS and its evolving service capabilities."
              version={POLICY_VERSIONS.privateBeta}
              effectiveDate={POLICY_EFFECTIVE_DATES.privateBeta}
            />

            <div className="space-y-10 text-sm text-[#3b3834] leading-relaxed">
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  1. Early Access Program Scope
                </h2>
                <p>
                  Proventa is operating a controlled Private Beta (commencing with Wave 1 Cohort) to deliver tailored concierge coordination to founding members while continuously refining our technology platform, agent platform, and verified partner network.
                </p>
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ded7cc] space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-[#141312] text-xs">
                    <Sparkles className="w-4 h-4 text-[#8a7053]" />
                    <span>Founding Member Principles:</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-[#6e6b65] space-y-1 pl-1">
                    <li>Access to Private Beta is by personalized cryptographic invitation or early-access approval.</li>
                    <li>Members experience direct, high-touch support from our Senior Concierge Desk.</li>
                    <li>Feature capabilities, UI workflows, and service integrations evolve proactively.</li>
                    <li>Member feedback directly shapes subsequent cohort releases and platform capabilities.</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  2. Hybrid AI &amp; Senior Concierge Support
                </h2>
                <p>
                  During the Private Beta, certain complex travel, fine dining, or bespoke lifestyle requests may be routed directly to Proventa Senior Concierge personnel for human coordination.
                </p>
                <p>
                  Where automated provider integrations are unconfigured or pending onboarding, our human concierge team ensures direct, high-touch execution without compromise to member service standards.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  3. Real-World Execution &amp; Provider Availability
                </h2>
                <p>
                  All bookings, reservations, and purchases initiated in the Private Beta are real-world transactions. Proventa strictly enforces a <strong>zero-fabrication policy</strong>: no mock, synthetic, or simulated booking references are ever issued in production.
                </p>
                <p>
                  Availability, seat allocations, table reservations, and pricing are subject to the independent operating policies and real-time inventory of third-party partner providers.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  4. Feedback &amp; Confidentiality
                </h2>
                <p>
                  Founding members are encouraged to provide feedback regarding option quality, concierge speed, and overall experience. Proventa maintains strict confidentiality regarding member identities, requests, and personal preferences throughout the beta program.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  5. Cohort Inquiries &amp; Support
                </h2>
                <p>
                  For assistance regarding Wave 1 access or Private Beta membership, reach our Concierge Desk at <a href="mailto:concierge@proventa.in" className="text-[#8a7053] underline font-medium">concierge@proventa.in</a> or visit <Link href="/wave1" className="text-[#8a7053] underline font-medium">Wave 1 Membership</Link>.
                </p>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
