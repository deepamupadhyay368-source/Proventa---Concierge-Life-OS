'use client';

import Link from 'next/link';
import {
  ShieldCheck,
  FileSpreadsheet,
  Scale,
  Truck,
  CheckCircle2,
  Building2,
  Check,
  ArrowRight,
} from 'lucide-react';

const BUYER_PROFILES = [
  {
    title: 'CIVIL CONTRACTORS',
    focus: 'Commercial & Infrastructure Execution',
    metrics: 'TMT Steel, Bulk Cement & Aggregates',
    description:
      'Direct mill test certificates, guaranteed vehicle dispatch windows, and consistent batch pricing for large-scale structural works.',
    highlights: [
      'Multi-tonnage direct mill pricing (Tata Tiscon, Jindal Panther, AM/NS)',
      'Bulk 53-grade OPC and PPC cement dispatch in dedicated trailers',
      'Mill test certificates uploaded to your digital vault per batch',
      'Weighbridge slip verification and driver dispatch tracking',
    ],
  },
  {
    title: 'COMMERCIAL BUILDERS & DEVELOPERS',
    focus: 'Multi-Story Residential & Corporate Projects',
    metrics: 'Full BOQ Sourcing & Technical Delivery',
    description:
      'Manage multi-phase procurement across architectural, electrical, plumbing, and finishing trades with transparent side-by-side supplier bidding.',
    highlights: [
      'Single BOQ uploads parsed across multiple trades in one RFQ',
      'Transparent landed cost breakdown: basic rate + GST + delivery freight',
      'Independent supplier selection without algorithmic lock-in',
      'Formal digital Purchase Orders generated with binding payment terms',
    ],
  },
  {
    title: 'INDIVIDUAL HOME BUILDERS',
    focus: 'Bungalow & Villa Construction',
    metrics: 'Standard Retail Packages with Wholesale Pricing',
    description:
      'Avoid retail distributor markups. Source directly from primary stockyards with verified GSTIN invoices and tracked site delivery.',
    highlights: [
      'Wholesale rates for standard residential batches (15-50 MT steel, 500-1500 bags cement)',
      'Vehicle accessibility coordination for narrow residential access roads',
      'On-site delivery sign-off and physical material count verification',
      'Direct supplier support and technical product documentation',
    ],
  },
];

export default function ForBuyersPage() {
  return (
    <div className="min-h-screen bg-[#F2F0E9] text-[#171A17] font-sans">
      {/* Header Banner */}
      <section className="border-b border-[#D9D8CF] bg-[#FFFFFF] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E7E5DC] border border-[#D9D8CF] text-xs font-mono text-[#53634A] uppercase tracking-wider font-semibold">
            <span>FOR BUYERS & BUILDERS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#171A17] max-w-4xl font-heading leading-tight">
            COMMERCIAL PROCUREMENT. DIRECT WHOLESALE BIDDING.
          </h1>
          <p className="text-sm sm:text-base text-[#777970] max-w-3xl leading-relaxed">
            Eliminate intermediary broker fees and opaque dealer markups. Receive itemized quotations from verified material stockists across Gujarat in 2 to 4 hours.
          </p>
        </div>
      </section>

      {/* Buyer Profiles Grid */}
      <section className="py-20 bg-[#F2F0E9]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BUYER_PROFILES.map((profile) => (
              <div
                key={profile.title}
                className="bg-[#FFFFFF] border border-[#D9D8CF] p-8 flex flex-col justify-between space-y-6 shadow-sm"
              >
                <div className="space-y-4">
                  <div className="border-b border-[#D9D8CF] pb-3">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#53634A] font-bold">
                      {profile.focus}
                    </span>
                    <h2 className="font-heading font-black text-xl uppercase tracking-wide text-[#171A17] mt-1">
                      {profile.title}
                    </h2>
                  </div>

                  <div className="text-xs font-mono text-[#B87948] font-bold">
                    Primary Materials: {profile.metrics}
                  </div>

                  <p className="text-xs text-[#777970] leading-relaxed">
                    {profile.description}
                  </p>

                  <div className="pt-2 border-t border-[#D9D8CF]">
                    <div className="font-mono text-[11px] uppercase tracking-wider text-[#171A17] font-bold mb-3">
                      Procurement Capabilities
                    </div>
                    <ul className="space-y-2.5 text-xs text-[#171A17]">
                      {profile.highlights.map((h, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#53634A] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#D9D8CF]">
                  <Link
                    href="/rfq/new"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#53634A] hover:bg-[#43503B] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    <span>Post Requirement</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial Safeguards Section */}
      <section className="py-20 bg-[#FFFFFF] border-t border-[#D9D8CF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <div className="font-mono text-xs uppercase tracking-widest text-[#53634A] font-bold">
              COMMERCIAL SAFEGUARDS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#171A17] font-heading">
              How PROVENTA Protects Buyers
            </h2>
            <p className="text-sm text-[#777970]">
              Built with enterprise-grade governance to guarantee material authenticity, accurate weight slips, and auditable invoicing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-[#F2F0E9] border border-[#D9D8CF] space-y-3">
              <ShieldCheck className="w-6 h-6 text-[#53634A]" />
              <h3 className="font-heading font-bold text-base uppercase text-[#171A17]">100% GST Verified</h3>
              <p className="text-xs text-[#777970] leading-relaxed">
                Every supplier is verified against government GSTIN portals with matching corporate banking details.
              </p>
            </div>

            <div className="p-6 bg-[#F2F0E9] border border-[#D9D8CF] space-y-3">
              <Scale className="w-6 h-6 text-[#53634A]" />
              <h3 className="font-heading font-bold text-base uppercase text-[#171A17]">Transparent Landed Cost</h3>
              <p className="text-xs text-[#777970] leading-relaxed">
                Quotations strictly separate basic rate, GST percentage, and transport freight. Zero hidden markups.
              </p>
            </div>

            <div className="p-6 bg-[#F2F0E9] border border-[#D9D8CF] space-y-3">
              <Truck className="w-6 h-6 text-[#53634A]" />
              <h3 className="font-heading font-bold text-base uppercase text-[#171A17]">Vehicle & Driver Tracking</h3>
              <p className="text-xs text-[#777970] leading-relaxed">
                Assigned registration numbers, vehicle capacity, driver contact, and E-Way bills recorded per dispatch.
              </p>
            </div>

            <div className="p-6 bg-[#F2F0E9] border border-[#D9D8CF] space-y-3">
              <CheckCircle2 className="w-6 h-6 text-[#53634A]" />
              <h3 className="font-heading font-bold text-base uppercase text-[#171A17]">Physical Sign-Off</h3>
              <p className="text-xs text-[#777970] leading-relaxed">
                Transactions close only after site engineers verify physical delivery count and report any shortages.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
