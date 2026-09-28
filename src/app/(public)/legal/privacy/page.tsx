import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, ArrowLeft, Shield, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { LegalHeader, LegalNav } from '@/components/legal/legal-nav';
import { POLICY_VERSIONS, POLICY_EFFECTIVE_DATES } from '@/lib/legal/versions';

export const metadata: Metadata = {
  title: 'Privacy Policy | Proventa Legal & Trust Center',
  description:
    'Factual disclosures regarding personal data collection, sovereign processing, lifestyle preference handling, and customer rights for Proventa Concierge Life OS.',
};

export default function PrivacyPolicyPage() {
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
              title="Privacy Policy"
              subtitle="This Privacy Policy explains factually and transparently how Proventa collects, processes, protects, and handles personal data across our Concierge Life OS."
              version={POLICY_VERSIONS.privacy}
              effectiveDate={POLICY_EFFECTIVE_DATES.privacy}
            />

            {/* Content Body */}
            <div className="space-y-10 text-sm text-[#3b3834] leading-relaxed">
              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  1. Introduction &amp; Venture Scope
                </h2>
                <p>
                  Proventa is an exclusive, private Concierge Life OS developed and operated as a founder-led venture in Ahmedabad, Gujarat, India. Our service enables members to delegate lifestyle, dining, travel, and personal coordination mandates through intelligent technology paired with verified human concierge execution.
                </p>
                <p>
                  This policy applies to all interactions with Proventa websites, mobile web applications, customer dashboards, Concierge communication channels, and early-access programs.
                </p>
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e2d8] space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-[#141312] text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#8a7053]" />
                    <span>Our Sovereign Privacy Principles:</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-[#6e6b65] space-y-1 pl-1">
                    <li>We do NOT sell, lease, or monetize customer personal data to third-party data brokers.</li>
                    <li>We do NOT embed behavioral advertising networks or third-party ad tracking scripts.</li>
                    <li>We collect only information strictly necessary to understand and fulfill concierge mandates.</li>
                    <li>Customer requests and private communications are NEVER used to train external public foundation models.</li>
                  </ul>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  2. Information We Collect
                </h2>
                <p>
                  Depending on how you interact with Proventa and the specific mandates you delegate, we may collect the following categories of data:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <strong className="text-neutral-900 block mb-1">Account &amp; Authentication Credentials</strong>
                    Full name, verified email address, phone number, cryptographically hashed passwords (via bcrypt), and one-way hashed Proventa Authentication Keys (never stored in plaintext or accessible to staff).
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <strong className="text-neutral-900 block mb-1">Lifestyle &amp; Member Preferences</strong>
                    Dietary requirements, seating preferences, preferred cabin classes, hotel tiers, loyalty affiliations, and primary city location explicitly provided.
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <strong className="text-neutral-900 block mb-1">Concierge Requests &amp; Approval History</strong>
                    Task descriptions submitted, travel itineraries, reservation dates/times, guest counts, option selections, approval/rejection timestamps, and feedback.
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <strong className="text-neutral-900 block mb-1">Technical, Session &amp; Security Logs</strong>
                    Session tokens, IP address, browser user-agent, rate-limiting counters, and microsecond immutable audit trail events.
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  3. How Information Is Used
                </h2>
                <p>
                  Proventa processes personal information strictly for genuine operational, service delivery, and safety purposes:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-[#524e48] pl-2">
                  <li><strong>Request Understanding &amp; Research:</strong> Analyzing task constraints to identify matching verified venues, airlines, and hospitality options.</li>
                  <li><strong>Option Curation:</strong> Preparing structured 5-option recommendation batches for member review.</li>
                  <li><strong>Approved Task Execution:</strong> Transmitting necessary reservation details to authorized providers upon explicit member approval.</li>
                  <li><strong>Member Communication:</strong> Sending transactional updates, proposal ready notifications, booking confirmation cards, and security alerts.</li>
                  <li><strong>Fraud Prevention &amp; Security:</strong> Enforcing rate limiting, role-based customer isolation, session integrity, and immutable audit trails.</li>
                  <li><strong>Legal &amp; Regulatory Compliance:</strong> Fulfilling applicable statutory recordkeeping and tax requirements under Indian law.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  4. Artificial Intelligence &amp; Autonomous Processing
                </h2>
                <p>
                  Proventa utilizes specialized artificial intelligence models to assist with natural language intent understanding, category classification, initial option research, and proposal formatting.
                </p>
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span>Authoritative Verification Standard:</span>
                  </div>
                  <p>
                    AI-generated outputs are research and curation proposals. They do not constitute guaranteed vendor availability or confirmed provider bookings. Genuine booking confirmation is established only upon provider confirmation or authorized Proventa Concierge execution.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  5. Human Concierge Access
                </h2>
                <p>
                  Authorized Proventa concierge personnel access customer task data on a strict least-privilege principle:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#524e48] pl-2">
                  <li>To execute customer-approved bookings with offline or bespoke partner providers.</li>
                  <li>To coordinate high-touch arrangements requiring direct venue negotiation.</li>
                  <li>To resolve operational escalations or customer support inquiries.</li>
                </ul>
              </section>

              {/* Section 6 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  6. Third-Party Service Providers
                </h2>
                <p>
                  When necessary to fulfill an approved request, relevant details (e.g. guest name, date, party size, flight requirements) may be shared with verified providers, including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#524e48] pl-2">
                  <li><strong>Hospitality &amp; Travel:</strong> Airlines, aviation GDS partners, hotel properties, fine dining venues, and chauffeur services.</li>
                  <li><strong>Payment Infrastructure:</strong> Razorpay Software Private Limited for secure payment processing and checkout.</li>
                  <li><strong>Communications &amp; Cloud:</strong> Resend (transactional email), AWS/Cloudflare (sovereign cloud infrastructure).</li>
                </ul>
              </section>

              {/* Section 7 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  7. Non-Custodial Payment Standards
                </h2>
                <p>
                  Proventa enforces a zero-custodial payment security standard. We do NOT collect, store, or process:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#524e48] pl-2">
                  <li>UPI PINs or banking passwords.</li>
                  <li>Credit or debit card CVV / CVC numbers.</li>
                  <li>Raw debit/credit card numbers or netbanking credentials.</li>
                </ul>
                <p className="text-xs text-[#6e6b65] pt-1">
                  All payment transactions are tokenized and processed directly via PCI-DSS compliant infrastructure provided by Razorpay.
                </p>
              </section>

              {/* Section 8 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  8. Data Retention &amp; Security Safeguards
                </h2>
                <p>
                  Personal data is retained only as long as reasonably necessary to provide concierge services, maintain member preferences, and satisfy statutory tax or dispute resolution obligations.
                </p>
                <p>
                  Security safeguards include: bcrypt password hashing (12 rounds), personal security key validation on logins, role-based access control (RBAC), multi-tenant customer data isolation, TLS 1.3 encryption in transit, and immutable audit logs.
                </p>
              </section>

              {/* Section 9 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  9. Your Data Rights &amp; Privacy Requests
                </h2>
                <p>
                  Proventa is designed to support applicable Indian data-protection requirements. Members have direct access to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#524e48] pl-2">
                  <li><strong>Access &amp; Export:</strong> Instant JSON export of your complete account, preferences, and task records via <Link href="/legal/privacy-requests" className="text-[#8a7053] underline font-medium">Data Rights &amp; Privacy Requests</Link>.</li>
                  <li><strong>Correction:</strong> Update personal details and lifestyle preferences directly from your member profile.</li>
                  <li><strong>Erasure &amp; Consent Withdrawal:</strong> Submit account erasure or consent withdrawal requests via our privacy desk.</li>
                </ul>
              </section>

              {/* Section 10 */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  10. Eligibility &amp; Grievance Redressal
                </h2>
                <p>
                  Proventa Concierge Life OS is intended exclusively for individuals aged 18 years or older. We do not knowingly collect personal data from minors.
                </p>
                <p>
                  For any questions, concerns, or privacy redressal, please contact our designated privacy desk at <a href="mailto:privacy@proventa.in" className="text-[#8a7053] underline font-medium">privacy@proventa.in</a> or visit our <Link href="/legal/grievance" className="text-[#8a7053] underline font-medium">Grievance Desk</Link>.
                </p>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
