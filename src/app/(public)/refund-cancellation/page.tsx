import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertCircle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Proventa',
  description: 'Transparent policies governing task cancellations, Proventa concierge fees, third-party vendor policies, and dispute resolution.',
};

export default function RefundCancellationPage() {
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
              Financial Terms
            </span>
            <span className="text-xs text-[#8a8680]">Effective Date: September 18, 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#141312] tracking-tight">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="mt-2 text-sm text-[#6e6b65]">
            Clear, transparent standards distinguishing between Proventa Concierge Service Fees and independent third-party vendor charges.
          </p>
        </div>

        <div className="space-y-10 text-sm text-[#3b3834] leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              1. Two Distinct Cost Categories
            </h2>
            <p>
              When delegating tasks through Proventa, transactions typically consist of two distinct elements:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white rounded-xl border border-[#ded7cc]">
                <strong className="text-[#141312] block mb-1">A. Proventa Concierge Fees</strong>
                Fees billed for the research, coordination, phone dispatch, and management provided by the Proventa desk.
              </div>
              <div className="p-4 bg-white rounded-xl border border-[#ded7cc]">
                <strong className="text-[#141312] block mb-1">B. Third-Party Vendor Costs</strong>
                Direct disbursements paid to third-party suppliers (e.g. airline tickets, hotel rooms, dining deposits, transport fares, event access).
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              2. Cancellation of Proventa Requests
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-white rounded-xl border border-[#ded7cc]">
                <strong className="text-[#141312] block mb-1">Before Member Approval (Proposal Stage)</strong>
                You may withdraw or cancel any request in your dashboard at any time prior to approving a proposal. No concierge fulfillment fee is incurred.
              </div>
              <div className="p-4 bg-white rounded-xl border border-[#ded7cc]">
                <strong className="text-[#141312] block mb-1">After Approval, Prior to Fulfillment</strong>
                If you request cancellation after approving a proposal but before our concierge desk has dispatched payments or finalized commitments with third-party providers, Proventa fees may be credited or refunded minus any direct administrative costs incurred.
              </div>
              <div className="p-4 bg-white rounded-xl border border-[#ded7cc]">
                <strong className="text-[#141312] block mb-1">After Booking Confirmation</strong>
                Once a booking has been confirmed with a genuine provider reference, Proventa concierge fees are considered earned for fulfillment work completed.
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              3. Third-Party Vendor Refunds &amp; Cancellations
            </h2>
            <div className="p-4 bg-white rounded-xl border border-[#ded7cc] space-y-2 text-xs text-[#524e48]">
              <div className="flex items-center gap-2 font-semibold text-[#141312]">
                <AlertCircle className="w-4 h-4 text-[#8a7053]" />
                <span>Subject to Independent Provider Terms:</span>
              </div>
              <p>
                Refunds for third-party charges are governed strictly by the respective vendor&rsquo;s terms (such as airline fare cancellation tariffs, hotel non-refundable booking deadlines, restaurant cancellation fee windows, and non-refundable event ticketing terms).
              </p>
              <p>
                <strong>The Proventa Concierge Advocacy:</strong> When a cancellation is requested, your concierge desk will actively advocate on your behalf with the vendor to secure refunds, waivers, or credits permitted under vendor policies. Any funds recovered from the vendor are returned directly to you.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              4. Proventa Service Guarantee &amp; Error Remedy
            </h2>
            <p className="text-xs text-[#524e48]">
              If Proventa fails to deliver an approved service due to platform technical error or concierge staff oversight (e.g. failing to place an approved reservation within agreed deadlines), Proventa will promptly refund 100% of the Proventa concierge fee charged for that task and assist in finding alternate arrangements.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-semibold text-[#141312] tracking-tight">
              5. Refund Processing Timelines
            </h2>
            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-[#ded7cc] text-xs">
              <Clock className="w-4 h-4 text-[#8a7053] mt-0.5 shrink-0" />
              <div>
                <strong className="text-[#141312] block mb-1">Standard Processing Window</strong>
                Approved refunds are initiated within 48 business hours and typically reflect back to the member&rsquo;s original payment method within 5 to 7 banking days, depending on bank and gateway processing cycles.
              </div>
            </div>
          </section>

          {/* Contact */}
          <div className="pt-6 border-t border-[#e8e2d8] text-xs text-[#8a8680]">
            To request a cancellation or inquire about a refund, message your concierge desk directly in the member dashboard or email{' '}
            <a href="mailto:concierge@proventa.in" className="text-[#8a7053] underline">concierge@proventa.in</a> (copy to <a href="mailto:proventa.in@gmail.com" className="text-[#8a7053] underline">proventa.in@gmail.com</a>).
          </div>
        </div>
      </div>
    </div>
  );
}
