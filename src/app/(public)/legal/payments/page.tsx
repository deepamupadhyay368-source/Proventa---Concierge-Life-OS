import type { Metadata } from 'next';
import Link from 'next/link';
import { CreditCard, ShieldCheck, Lock, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { LegalHeader, LegalNav } from '@/components/legal/legal-nav';
import { POLICY_VERSIONS, POLICY_EFFECTIVE_DATES } from '@/lib/legal/versions';

export const metadata: Metadata = {
  title: 'Payment Terms & Security | Proventa Legal & Trust Center',
  description:
    'Payment processing terms, Razorpay integration, non-custodial payment safety standards, and UPI Autopay authorizations for Proventa.',
};

export default function PaymentTermsPage() {
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
              title="Payment Terms &amp; Security"
              subtitle="Clear and factual standards governing concierge service payments, third-party provider disbursements, Razorpay checkout, and our non-custodial financial policy."
              version={POLICY_VERSIONS.payments}
              effectiveDate={POLICY_EFFECTIVE_DATES.payments}
            />

            <div className="space-y-10 text-sm text-[#3b3834] leading-relaxed">
              {/* Section 1: Non-Custodial Standard */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  1. Non-Custodial Financial Safety Standard
                </h2>
                <p>
                  Proventa maintains a strict non-custodial payment security architecture. At no point does Proventa collect, handle, or store sensitive banking or cardholder data on its own servers.
                </p>
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ded7cc] space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#141312]">
                    <ShieldCheck className="w-4 h-4 text-[#8a7053]" />
                    <span>Protected Financial Boundaries:</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-[#6e6b65] space-y-1 pl-1">
                    <li>We never store credit card or debit card numbers, CVVs, expiry dates, or PINs.</li>
                    <li>We never store UPI PINs, netbanking user IDs, or transaction passwords.</li>
                    <li>Payment processing is routed directly through PCI-DSS Level 1 certified gateways.</li>
                  </ul>
                </div>
              </section>

              {/* Section 2: Razorpay Integration */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  2. Authorized Payment Gateway &amp; Processing
                </h2>
                <p>
                  All digital payment transactions across Proventa (including membership fees, concierge retainer charges, and customer-approved provider bookings) are processed securely via <strong>Razorpay Software Private Limited</strong>.
                </p>
                <p>
                  Supported payment methods provided through Razorpay include:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#524e48] pl-2">
                  <li><strong>Unified Payments Interface (UPI):</strong> Instant QR, collect requests, and UPI Intent across Google Pay, PhonePe, Paytm, and BHIM.</li>
                  <li><strong>Credit &amp; Debit Cards:</strong> Visa, Mastercard, RuPay, and American Express with mandatory multi-factor authentication (OTP / 3D Secure).</li>
                  <li><strong>Netbanking:</strong> 50+ major Indian scheduled commercial banks.</li>
                  <li><strong>Standing Instructions / UPI Autopay:</strong> For recurring concierge membership cycles when explicitly authorized by the member.</li>
                </ul>
              </section>

              {/* Section 3: Dual Transaction Model */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  3. Concierge Fees vs. Third-Party Provider Charges
                </h2>
                <p>
                  Proventa operates under two distinct transaction models depending on the service category:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                    <strong className="text-neutral-900 block font-semibold">A. Proventa Platform &amp; Concierge Fees</strong>
                    <p className="text-neutral-600">
                      Fees charged by Proventa for task research, itinerary planning, concierge curation, and priority management. Invoiced with applicable Goods and Services Tax (GST) under Indian tax laws.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                    <strong className="text-neutral-900 block font-semibold">B. Third-Party Provider Charges</strong>
                    <p className="text-neutral-600">
                      Disbursements for airfare, hotel accommodations, dining deposits, or event passes. These are charges set directly by verified third-party merchants. Proventa facilitates payment authorization strictly upon explicit customer approval.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 4: Explicit Approval Gate */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  4. Explicit Approval Gate Before Financial Commitment
                </h2>
                <p>
                  Proventa will NEVER charge or disburse funds for any non-recurring booking without prior, unambiguous customer authorization. Every recommendation cycle requires:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#524e48] pl-2">
                  <li>Presentation of a structured proposal card indicating itemized costs, merchant identity, and applicable cancellation terms.</li>
                  <li>Customer selection of the preferred option.</li>
                  <li>Customer click on <em>&quot;Approve &amp; Reserve&quot;</em> or entry of the personal security key before checkout execution.</li>
                </ol>
              </section>

              {/* Section 5: Invoicing, Receipts & Disputed Charges */}
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  5. Invoicing, Receipts &amp; Billing Inquiries
                </h2>
                <p>
                  Itemized digital receipts and payment confirmations are generated immediately upon successful transaction completion and delivered via in-app timeline cards and transactional email.
                </p>
                <p>
                  If you notice any unexpected charge or discrepancies in your billing statements, contact our finance team immediately at <a href="mailto:concierge@proventa.in" className="text-[#8a7053] underline font-medium">concierge@proventa.in</a> or reference our <Link href="/legal/refunds" className="text-[#8a7053] underline font-medium">Cancellation &amp; Refund Policy</Link>.
                </p>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
