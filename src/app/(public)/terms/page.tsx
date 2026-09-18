import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Membership & Service | Proventa',
  description: 'Terms governing membership, task delegation, explicit approval gating, and intermediary liability at Proventa.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#141312] pt-24 pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/legal"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8a7053] hover:text-[#5a4733] mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Legal &amp; Compliance Center
        </Link>

        <div className="border-b border-[#e8e2d8] pb-8 mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#f5ede0] text-[#8a7053]">
              Membership Agreement
            </span>
            <span className="text-xs text-[#8a8680]">Effective Date: September 18, 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141312] tracking-tight">
            Terms of Membership &amp; Service
          </h1>
          <p className="mt-2 text-sm text-[#6e6b65]">
            These Terms govern your membership, access, and use of the Proventa Concierge Life OS provided by Proventa Technologies Private Limited.
          </p>
        </div>

        <div className="space-y-10 text-sm text-[#3b3834] leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              1. The Nature of the Proventa Service
            </h2>
            <p>
              Proventa is a private Concierge Life OS designed to eliminate operational friction from high-standard living. We assist members in researching, curating, organizing, and executing tasks across dining, private travel, premium mobility, bespoke shopping, and residential logistics.
            </p>
            <p>
              Proventa combines autonomous intelligence (for rapid option formulation and multi-source synthesis) with senior human concierge execution (for offline phone verification, relationship bookings, and sensitive negotiations).
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              2. Explicit Customer Approval Gating
            </h2>
            <div className="p-5 bg-white rounded-2xl border border-[#ded7cc] space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#141312]">
                <CheckCircle2 className="w-4 h-4 text-[#8a7053]" />
                <span>The Proventa Sovereignty Pledge:</span>
              </div>
              <p className="text-xs text-[#524e48]">
                Proventa will <strong>never</strong> finalize a financial commitment, charge your payment method, or issue a binding reservation on your behalf without your explicit prior approval in the member dashboard or verified communication channel.
              </p>
              <ul className="list-disc list-inside text-xs text-[#6e6b65] space-y-1 pl-1">
                <li>Every task with financial or contractual consequences generates clear, itemized proposal options.</li>
                <li>You maintain complete authority to accept, modify, or reject any option presented.</li>
                <li>Once an option is approved, Proventa concierge operators execute the mandate strictly within the approved specifications.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              3. Independent Intermediary Status &amp; Third-Party Providers
            </h2>
            <p>
              Proventa operates as an authorized intermediary and facilitator on behalf of the member:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#524e48] pl-2">
              <li>
                <strong>Independent Vendors:</strong> Third-party service providers (including fine dining establishments, global airlines, hotels and private villas, licensed chauffeur fleets, and ticketing platforms) are independent commercial entities. Proventa does not own, manage, or operate these third-party businesses.
              </li>
              <li>
                <strong>Third-Party Terms:</strong> When Proventa secures a booking on your behalf, the contract for the underlying service is directly between you and the respective third-party provider, subject to their terms of carriage, cancellation deadlines, and venue policies.
              </li>
              <li>
                <strong>Genuine Confirmations:</strong> Proventa enforces a strict zero-fabrication policy. All reservation reference codes provided to you are genuine external vendor references obtained directly from the provider or authorized distribution networks.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              4. Membership &amp; Fair Usage (Cohort 1)
            </h2>
            <p>
              During Wave 1 Early Access (Cohort 1, Ahmedabad &amp; National), membership is curated to maintain an exceptional member-to-concierge ratio:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-[#524e48] pl-2">
              <li>Members must provide accurate and verifiable identity details.</li>
              <li>Accounts are strictly non-transferable and intended for personal/family office use.</li>
              <li>Proventa reserves the right to decline requests that are unlawful, violate third-party terms of service, or endanger the safety of concierge staff or vendors.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              5. Fees, Billing &amp; Payment
            </h2>
            <p className="text-xs text-[#524e48]">
              Proventa charges transparent concierge service fees for task execution and coordination as itemized in the proposal. Third-party vendor expenses (such as dining checks, airline tickets, or hotel room charges) are passed through at actuals or paid directly to the vendor with your authorization.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              6. Limitation of Liability
            </h2>
            <p className="text-xs text-[#524e48]">
              To the maximum extent permitted by Indian law, Proventa shall not be liable for any indirect, incidental, or consequential damages arising from: (a) acts, omissions, schedule changes, delays, or cancellations by independent third-party providers; (b) force majeure events including adverse weather, airspace closures, or government restrictions; or (c) inaccurate instructions provided by the member. In all events, Proventa&rsquo;s aggregate liability is limited to the concierge service fee paid for the specific affected task.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              7. Governing Law &amp; Dispute Resolution
            </h2>
            <p className="text-xs text-[#524e48]">
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms or the service shall be subject to the exclusive jurisdiction of the competent courts in Ahmedabad, Gujarat, India.
            </p>
          </section>

          {/* Contact */}
          <div className="pt-6 border-t border-[#e8e2d8] text-xs text-[#8a8680]">
            For questions regarding these Terms, contact our legal desk at{' '}
            <a href="mailto:hello@proventa.in" className="text-[#8a7053] underline">hello@proventa.in</a> (copy to <a href="mailto:proventa.in@gmail.com" className="text-[#8a7053] underline">proventa.in@gmail.com</a>).
          </div>
        </div>
      </div>
    </div>
  );
}
