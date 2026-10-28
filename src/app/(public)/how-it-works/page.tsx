import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const PROTOCOL_STEPS = [
  {
    num: '01',
    code: 'Phase 01 · Storefront & Catalog',
    title: 'Businesses publish verified profiles, products, and services',
    body: 'Companies, suppliers, manufacturers, and service providers register their storefront on PROVENTA, define their operating cities, and list offerings with transparent pricing models.',
  },
  {
    num: '02',
    code: 'Phase 02 · Discovery & Enquiry',
    title: 'Customers search the marketplace or post a requirement',
    body: 'Buyers explore businesses by keyword, industry category, and city—then contact a business directly or post a structured enquiry to receive multiple quotations.',
  },
  {
    num: '03',
    code: 'Phase 03 · Quotations & Selection',
    title: 'Matching businesses send quotations for side-by-side comparison',
    body: 'Relevant businesses respond with formal quotations detailing pricing, scope inclusions, and delivery timelines. Customers shortlist or accept the best proposal.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E5] text-[#181914]">
      <section className="border-b border-[#4C4A40]/70 bg-[#171A14] text-[#F6F0E4] py-16 lg:py-24">
        <div className="container-wide">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#B94E2D]">
              Platform Workflow
            </span>
            <span className="text-[#4C4A40]">·</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#A7A194]">
              Discover. Connect. Collaborate. Grow.
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-normal tracking-[-0.025em] text-[#F6F0E4] leading-[0.98] max-w-4xl">
            How <span className="text-[#B94E2D]">PROVENTA</span> connects buyers and businesses.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#A7A194] max-w-2xl leading-relaxed">
            A clear three-stage workflow connecting verified businesses, structured
            product and service catalogs, and qualified customer enquiries.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-wide space-y-6">
          {PROTOCOL_STEPS.map((step) => (
            <div
              key={step.num}
              className="grid grid-cols-1 lg:grid-cols-12 border border-[#D5CBB8] bg-[#FAF6EC]"
            >
              <div className="lg:col-span-3 p-8 bg-[#171A14] text-[#F6F0E4] flex flex-col justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#A98253]">
                  {step.code}
                </span>
                <span className="font-display text-6xl font-normal tracking-tight text-[#B94E2D] mt-4">
                  {step.num}
                </span>
              </div>
              <div className="lg:col-span-9 p-8 sm:p-10 flex flex-col justify-center">
                <h2 className="font-display text-2xl sm:text-4xl font-normal text-[#181914]">
                  {step.title}
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[#5C584F] leading-relaxed max-w-3xl">
                  {step.body}
                </p>
              </div>
            </div>
          ))}

          <div className="pt-8 flex flex-wrap gap-3">
            <Link href="/businesses" className="btn-primary">
              <span>Explore Businesses</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/enquiries/new" className="btn-terracotta">
              <span>Post an Enquiry</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/business/register" className="btn-secondary">
              <span>List Your Business</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
