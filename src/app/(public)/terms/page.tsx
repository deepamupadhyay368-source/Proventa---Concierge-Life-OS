import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-10 pb-20">
      <div className="border-b border-[#C8C4BA] pb-6">
        <span className="text-xs font-mono font-bold text-[#547568] uppercase tracking-wider">
          Legal Agreement
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-[#202B3C] mt-1">
          Terms of Service & Usage Agreement
        </h1>
        <p className="text-xs text-[#69717B] font-mono mt-2">
          Effective Date: 01 October 2026 | Governing Law: State of Gujarat, India
        </p>
      </div>

      <div className="space-y-8 text-xs md:text-sm text-[#202B3C] leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[#202B3C]">1. Acceptance of Terms</h2>
          <p className="text-[#69717B]">
            By accessing or subscribing to PROVENTA Real Estate Intelligence (`proventa.in`), you agree to be bound by these Terms of Service. If you do not agree with any provision herein, you must immediately cease use of the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[#202B3C]">2. Nature of Intelligence & Explicit Valuation Disclaimer</h2>
          <div className="p-4 bg-white border border-[#202B3C] space-y-2">
            <p className="font-bold text-[#202B3C]">
              IMPORTANT STATUTORY NOTICE:
            </p>
            <p className="text-[#69717B]">
              PROVENTA provides analytical, informational, and mathematical market research estimates. We do NOT provide:
            </p>
            <ul className="list-disc pl-5 text-[#69717B] space-y-1">
              <li>Statutory valuation certificates registered under the Companies Act or IBBI.</li>
              <li>Bank solvency certificates or mortgage loan guarantees.</li>
              <li>Government revenue certificates or legal title opinions.</li>
              <li>Guaranteed property purchase, sale, or rental yields.</li>
            </ul>
            <p className="text-[#69717B]">
              All valuations represent automated mathematical models. Users must conduct independent physical inspections, advocate title searches, and engineer structural reviews prior to executing any legal transaction or financial commitment.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[#202B3C]">3. Membership Subscriptions & Billing</h2>
          <p className="text-[#69717B]">
            Paid subscriptions (Personal, Investor, Professional) are billed in advance on a recurring monthly or annual basis via authorized Indian payment gateways (such as Razorpay). Subscriptions renew automatically unless cancelled before the renewal date. Cancellations take effect at the conclusion of the active billing period; partial refunds are not provided for unused monthly periods.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[#202B3C]">4. Acceptable Use & Intellectual Property</h2>
          <p className="text-[#69717B]">
            All methodology algorithms, benchmark databases, quarterly research reports, UI designs, and analytical charts are the proprietary intellectual property of PROVENTA. Automated scraping, data extraction bots, bulk re-publishing, or commercial redistribution of PROVENTA benchmarks without written institutional agreement is strictly prohibited.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[#202B3C]">5. Jurisdiction</h2>
          <p className="text-[#69717B]">
            Any dispute arising out of or related to these terms shall be governed by the laws of India and subject to the exclusive jurisdiction of the competent courts in Ahmedabad, Gujarat, India.
          </p>
        </section>
      </div>
    </div>
  );
}
