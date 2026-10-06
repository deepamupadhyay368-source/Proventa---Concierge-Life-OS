import type { Metadata } from 'next';
import Link from 'next/link';
import { RefreshCw, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { LegalHeader, LegalNav } from '@/components/legal/legal-nav';
import { POLICY_VERSIONS, POLICY_EFFECTIVE_DATES } from '@/lib/legal/versions';

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy | Proventa Legal & Trust Center',
  description:
    'Clear terms distinguishing Proventa concierge coordination services from third-party airline, hotel, and merchant cancellation terms.',
};

export default function RefundsPolicyPage() {
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
              title="Cancellation &amp; Refund Policy"
              subtitle="This policy outlines the cancellation procedures and refund eligibility for Proventa concierge coordination, founding memberships, and third-party provider bookings."
              version={POLICY_VERSIONS.refunds}
              effectiveDate={POLICY_EFFECTIVE_DATES.refunds}
            />

            <div className="space-y-10 text-sm text-[#3b3834] leading-relaxed">
              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  1. Fundamental Structure of Charges
                </h2>
                <p>
                  To provide absolute financial clarity, Proventa categorizes all concierge transactions into two distinct components:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <strong className="text-neutral-900 block mb-1">A. Proventa Concierge Fees</strong>
                    Covers research, option curation, recommendation cycles, and concierge execution coordination.
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <strong className="text-neutral-900 block mb-1">B. Third-Party Provider Charges</strong>
                    Direct costs for airline tickets, hotel reservations, dining deposits, transport fares, or vendor purchases.
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  2. Third-Party Provider Cancellation Rules
                </h2>
                <p>
                  Third-party vendor bookings (such as scheduled flight tickets, hotel rooms, event admissions, or restaurant deposit holds) are strictly subject to the specific cancellation and refund policies established by that airline, hotel, or merchant.
                </p>
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1">
                  <strong className="block font-semibold">Merchant Terms Pass-Through:</strong>
                  <span>Where a provider offers a full or partial refund for a cancellation, Proventa will process that refund back to your original payment method via Razorpay once confirmed by the provider. Where a ticket or reservation is non-refundable per provider terms, Proventa cannot alter that policy.</span>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  3. Cancellation Prior to Provider Execution
                </h2>
                <p>
                  If you choose to cancel a request while it is in <strong>Requested</strong>, <strong>Recommended</strong>, or <strong>Customer Approved (Pre-Execution)</strong> status before our concierge desk has finalized payment or confirmed booking with the provider, you will not incur third-party booking charges.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  4. Refund Processing &amp; Settlement
                </h2>
                <p>
                  Approved refunds are credited directly to the original payment source (UPI, netbanking, or payment card) through Razorpay. Processing times depend on banking settlement networks (typically 5 to 7 business days per standard Indian banking cycles).
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
                  5. Cancellation Inquiries
                </h2>
                <p>
                  To request cancellation of an active task, contact your Proventa Concierge directly via the task chat or email <a href="mailto:concierge@proventa.in" className="text-[#8a7053] underline font-medium">concierge@proventa.in</a>.
                </p>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
