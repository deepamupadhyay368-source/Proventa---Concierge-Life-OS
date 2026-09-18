import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy (DPDP Act 2023) | Proventa',
  description: 'Proventa Privacy Policy in full compliance with the Digital Personal Data Protection Act (DPDP Act) 2023.',
};

export default function PrivacyPage() {
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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#e8f2ea] text-[#1e5e2e]">
              DPDP Act 2023 Compliant
            </span>
            <span className="text-xs text-[#8a8680]">Effective Date: September 18, 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141312] tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[#6e6b65]">
            Proventa Technologies Private Limited (&ldquo;Proventa&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is committed to the sovereign protection and lawful processing of your personal data.
          </p>
        </div>

        <div className="space-y-10 text-sm text-[#3b3834] leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              1. Fundamental Principles &amp; Zero-Monetization Mandate
            </h2>
            <p>
              Proventa operates as an exclusive, private Concierge Life OS. Our business model is founded strictly on subscription membership and concierge service fees.
            </p>
            <div className="p-4 rounded-xl bg-white border border-[#ded7cc] space-y-2">
              <div className="flex items-center gap-2 font-semibold text-[#141312]">
                <ShieldCheck className="w-4 h-4 text-[#8a7053]" />
                <span>Our Unconditional Sovereignty Guarantee:</span>
              </div>
              <ul className="list-disc list-inside text-xs text-[#6e6b65] space-y-1 pl-1">
                <li>We do NOT sell, license, lease, or monetize your personal information to third parties.</li>
                <li>We do NOT display third-party advertisements or integrate behavioral ad trackers.</li>
                <li>We do NOT share your request history or preferences with data brokers.</li>
                <li>Your private concierge requests and prompts are NEVER used to train foundational AI models.</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              2. Data We Collect
            </h2>
            <p>
              Under the Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo;), we only collect personal data that is strictly necessary for fulfilling your concierge mandates:
            </p>
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-white rounded-xl border border-[#ded7cc]">
                <strong className="text-[#141312] block mb-1">Identity &amp; Contact Information</strong>
                Full legal name, verified email address, phone number (used for SMS/WhatsApp verification and urgent concierge escalation), and optional residential delivery addresses.
              </div>
              <div className="p-4 bg-white rounded-xl border border-[#ded7cc]">
                <strong className="text-[#141312] block mb-1">Lifestyle &amp; Member Preferences</strong>
                Dietary requirements, seating preferences, preferred airlines/cabin class, hotel loyalty affiliations, and concierge service preferences explicitly provided during onboarding or chat.
              </div>
              <div className="p-4 bg-white rounded-xl border border-[#ded7cc]">
                <strong className="text-[#141312] block mb-1">Concierge Task Data &amp; Approval History</strong>
                Task descriptions submitted through &ldquo;Tell Proventa&rdquo;, uploaded documents/itineraries, proposal selections, explicit approval/rejection timestamps, and internal fulfillment notes.
              </div>
              <div className="p-4 bg-white rounded-xl border border-[#ded7cc]">
                <strong className="text-[#141312] block mb-1">Technical, Security &amp; Audit Telemetry</strong>
                Encrypted session authentication tokens, IP addresses, browser user-agent, rate-limiting counters, and immutable audit logs of system interactions.
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              3. Purpose &amp; Legal Grounds for Processing
            </h2>
            <p>
              We process your data based on your explicit consent given at registration and the contractual necessity of providing concierge services:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#524e48] pl-2">
              <li><strong>Concierge Task Execution:</strong> Synthesizing vendor options, arranging table bookings, flight research, and ground transport dispatch.</li>
              <li><strong>Member Communication:</strong> Providing real-time proposal updates, booking confirmation call sheets, and security notifications.</li>
              <li><strong>Audit &amp; Security:</strong> Maintaining immutable tamper-evident logs of approvals and payments to prevent unauthorized transactions.</li>
              <li><strong>Statutory Compliance:</strong> Maintaining accounting, tax, and invoicing records as required under Indian commercial law.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              4. Third-Party Sharing &amp; Intermediary Role
            </h2>
            <p>
              Proventa acts as an authorized intermediary. We only share specific data with external service providers when necessary to execute an approved task:
            </p>
            <div className="p-4 bg-white rounded-xl border border-[#ded7cc] text-xs space-y-2 text-[#524e48]">
              <p>
                <strong>Provider Integration Principle:</strong> When you approve an option (e.g. reserving a table at a dining venue or booking a flight via a global distribution system), Proventa shares only the minimal data required by the external provider (such as guest name, party size, dietary flags, or passenger passport details).
              </p>
              <p>
                Proventa does not disclose your full account history or other unrelated requests to any vendor. Third-party providers operate under their own independent privacy notices.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              5. Cloud Infrastructure &amp; Data Security
            </h2>
            <p>
              Proventa implements defense-in-depth technical safeguards to protect your personal data:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#524e48] pl-2">
              <li><strong>Database Sovereignty:</strong> Primary production PostgreSQL is hosted in AWS Asia Pacific (Singapore) via Neon, with automated SSL/TLS encryption in transit and AES-256 at rest.</li>
              <li><strong>Credential Security:</strong> All passwords are cryptographic hashes using bcrypt with high work factors. Plaintext passwords are never stored or logged.</li>
              <li><strong>Access Control:</strong> Administrative access to member profiles is strictly restricted server-side via role-based access control (SUPER_ADMIN / ADMIN) and logged to tamper-evident audit trails.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              6. Data Retention, Portability &amp; Erasure (DPDP Rights)
            </h2>
            <p>
              Under the DPDP Act 2023, you maintain complete sovereignty over your digital footprint on Proventa:
            </p>
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-white rounded-xl border border-[#ded7cc]">
                <strong className="text-[#141312] block mb-1">Right to Access &amp; Portability</strong>
                You can download a complete, machine-readable JSON export of all personal data, preferences, task history, and audit records at any time via <Link href="/data-rights" className="text-[#8a7053] underline font-medium">Data Rights Portal</Link> or the API endpoint <code className="bg-[#faf8f5] px-1 py-0.5 rounded text-[11px]">/api/customer/export</code>.
              </div>
              <div className="p-4 bg-white rounded-xl border border-[#ded7cc]">
                <strong className="text-[#141312] block mb-1">Right to Erasure (Right to be Forgotten)</strong>
                You can invoke complete account erasure via <code className="bg-[#faf8f5] px-1 py-0.5 rounded text-[11px]">/api/customer/delete</code> (requiring confirmation string <code className="bg-[#faf8f5] px-1 py-0.5 rounded text-[11px]">DELETE_MY_ACCOUNT</code>). Upon invocation:
                <ul className="list-disc list-inside mt-1 pl-2 space-y-0.5 text-[#6e6b65]">
                  <li>Your name, email, phone number, and preferences are scrubbed and anonymized.</li>
                  <li>All active authentication sessions are instantly revoked.</li>
                  <li>Historical financial invoices and audit event IDs are preserved strictly for statutory tax compliance.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              7. Grievance Officer &amp; Statutory Inquiries
            </h2>
            <p>
              In accordance with the Digital Personal Data Protection Act, 2023, you may address any inquiries, complaints, or grievance escalations to our designated Grievance Officer:
            </p>
            <div className="p-4 bg-white rounded-xl border border-[#ded7cc] text-xs space-y-2">
              <div>
                <span className="font-semibold text-[#141312]">Grievance Officer: </span>
                <span className="text-[#8a8680] italic">TODO [Founder Configuration: Grievance Officer Name]</span>
              </div>
              <div>
                <span className="font-semibold text-[#141312]">Designation: </span>
                <span className="text-[#6e6b65]">Data Protection &amp; Compliance Officer</span>
              </div>
              <div>
                <span className="font-semibold text-[#141312]">Email: </span>
                <a href="mailto:privacy@proventa.in" className="text-[#8a7053] underline">privacy@proventa.in</a> (copy to <a href="mailto:proventa.in@gmail.com" className="text-[#8a7053] underline">proventa.in@gmail.com</a>)
              </div>
              <div>
                <span className="font-semibold text-[#141312]">Registered Jurisdiction: </span>
                <span className="text-[#6e6b65]">Ahmedabad, Gujarat, India</span>
              </div>
              <p className="text-[11px] text-[#8a8680] pt-1">
                We acknowledge grievances within 24 hours and resolve inquiries within 30 days as prescribed by law.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
