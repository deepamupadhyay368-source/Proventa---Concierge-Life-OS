import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LegalHeader, LegalNav } from '@/components/legal/legal-nav';
import { POLICY_VERSIONS, POLICY_EFFECTIVE_DATES } from '@/lib/legal/versions';

export const metadata: Metadata = {
  title: 'Terms of Service | Proventa Legal & Trust Center',
  description:
    'Comprehensive terms governing membership access, request delegation, recommendation cycles, and service execution for Proventa Concierge Life OS.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#141312] pt-24 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-1 space-y-4">
            <div className="sticky top-28 p-4 bg-white rounded-2xl border border-[#ded7cc] shadow-xs space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a7053]">
                Legal &amp; Trust Index
              </p>
              <LegalNav />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3 bg-white p-8 sm:p-12 rounded-3xl border border-[#ded7cc] shadow-sm space-y-10">
            <LegalHeader
              title="Terms of Service"
              subtitle="These Terms of Service govern your access to and use of Proventa Concierge Life OS, our request orchestration platform, and human concierge coordination services."
              version={POLICY_VERSIONS.terms}
              effectiveDate={POLICY_EFFECTIVE_DATES.terms}
            />

            <div className="space-y-10 text-sm text-[#3b3834] leading-relaxed">
              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  1. Acceptance &amp; Agreement Structure
                </h2>
                <p>
                  By creating an account, accepting an early-access invitation, or submitting a concierge request through Proventa, you agree to be bound by these Terms of Service, our{' '}
                  <Link href="/legal/privacy" className="text-[#8a7053] underline font-medium">Privacy Policy</Link>, and our{' '}
                  <Link href="/legal/private-beta" className="text-[#8a7053] underline font-medium">Private Beta Terms</Link>. If you do not agree, do not access or use Proventa.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  2. Eligibility &amp; Account Security
                </h2>
                <p>
                  You must be at least 18 years of age and capable of entering into legally binding contracts under Indian law. You agree to provide accurate registration information and maintain the confidentiality of your credentials, password, and Personal Security Key / PIN.
                </p>
                <p>
                  You are solely responsible for all activities occurring under your account. If you suspect unauthorized access, notify Proventa immediately at{' '}
                  <a href="mailto:security@proventa.in" className="text-[#8a7053] underline font-medium">security@proventa.in</a>.
                </p>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  3. The Proventa Concierge Lifecycle
                </h2>
                <p>
                  Proventa operates under a strict multi-stage lifecycle designed to guarantee member transparency and prevent unauthorized bookings:
                </p>
                <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#ded7cc] space-y-3 font-mono text-xs text-[#141312]">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <span>REQUESTED</span>
                    <span>➔</span>
                    <span>RECOMMENDED</span>
                    <span>➔</span>
                    <span>CUSTOMER APPROVED</span>
                    <span>➔</span>
                    <span>EXECUTING</span>
                    <span>➔</span>
                    <span>PROVIDER CONFIRMED</span>
                    <span>➔</span>
                    <span>COMPLETED</span>
                  </div>
                  <div className="text-[11px] text-[#6e6b65] font-sans space-y-1 pt-1 border-t border-[#e8e2d8]">
                    <p><strong>• Requested:</strong> Member submits intent via natural language.</p>
                    <p><strong>• Recommended:</strong> System curates a 5-option recommendation batch for member review.</p>
                    <p><strong>• Customer Approved:</strong> Member explicitly locks a preferred proposal.</p>
                    <p><strong>• Executing:</strong> Automated integration or Senior Concierge Desk initiates reservation.</p>
                    <p><strong>• Provider Confirmed:</strong> Genuine partner reference or PNR authenticated.</p>
                    <p><strong>• Completed:</strong> Verified digital pass or deliverable issued to member.</p>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  4. AI Output &amp; Recommendation Standard
                </h2>
                <p>
                  Proventa uses artificial intelligence for intent parsing, category classification, and option synthesis. AI outputs represent curatorial proposals, not confirmed inventory or guaranteed seats.
                </p>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                  <strong className="block font-semibold">Important Transparency Notice:</strong>
                  <span>Customer approval does NOT automatically guarantee provider fulfillment if external vendor inventory changes before execution. All final reservations are subject to direct provider confirmation.</span>
                </div>
              </section>

              {/* Section 5 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  5. Intermediary Status &amp; Third-Party Services
                </h2>
                <p>
                  Proventa functions as a technology platform and concierge intermediary. When fulfilling travel, dining, transport, or hospitality mandates, contracts of service are established between the member and the independent third-party provider (e.g., airline, restaurant, hotel, transport operator).
                </p>
                <p>
                  Proventa is not an airline, hotelier, or restaurateur. While we perform rigorous quality curation, third-party service fulfillment is governed by the respective provider's terms and conditions.
                </p>
              </section>

              {/* Section 6 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  6. Payments, Billing &amp; Invoicing
                </h2>
                <p>
                  Payments for upfront concierge line items (e.g. flight tickets, prepaid deposits) are processed securely via Razorpay or authorized via direct concierge member invoicing. Prices displayed reflect verified estimates at the time of proposal and are finalized upon booking.
                </p>
                <p>
                  Proventa never stores raw card details, PINs, or netbanking passwords. Refer to our{' '}
                  <Link href="/legal/payments" className="text-[#8a7053] underline font-medium">Payment Terms</Link> for detailed settlement guidelines.
                </p>
              </section>

              {/* Section 7 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  7. Prohibited Mandates
                </h2>
                <p>
                  Members shall not use Proventa to delegate unlawful, dangerous, fraudulent, or harmful mandates. Proventa reserves the right to immediately decline and cancel any request involving illegal goods, unauthorized financial transactions, or activities that violate public policy.
                </p>
              </section>

              {/* Section 8 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  8. Limitation of Liability &amp; Disclaimers
                </h2>
                <p>
                  Proventa is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis during early access. To the maximum extent permitted by applicable Indian law, Proventa shall not be liable for indirect, incidental, or consequential damages resulting from third-party vendor delays, airline flight cancellations, venue closures, or force majeure events.
                </p>
              </section>

              {/* Section 9 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  9. Governing Law &amp; Jurisdiction
                </h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in Ahmedabad, Gujarat, India.
                </p>
              </section>

              {/* Section 10 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  10. Contact &amp; Legal Inquiries
                </h2>
                <p>
                  For questions regarding these Terms of Service, contact our legal desk at <a href="mailto:legal@proventa.in" className="text-[#8a7053] underline font-medium">legal@proventa.in</a> (copy to <a href="mailto:privacy@proventa.in" className="text-[#8a7053] underline font-medium">privacy@proventa.in</a>).
                </p>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
