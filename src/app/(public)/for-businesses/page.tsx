import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { getCategories } from '@/lib/marketplace/repository';

export default function ForBusinessesPage() {
  const categories = getCategories({ onlyTopLevel: true });

  return (
    <div className="min-h-screen bg-[#F5F0E5] text-[#181914]">
      <section className="border-b border-[#4C4A40]/70 bg-[#171A14] text-[#F6F0E4] py-16 lg:py-24">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2.5 mb-5">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#B94E2D]">
                  PROVENTA For Businesses
                </span>
                <span className="text-[#4C4A40]">·</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#A7A194]">
                  Every Business. One Place.
                </span>
              </div>
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-normal tracking-[-0.025em] leading-[0.96]">
                Grow your business{' '}
                <span className="text-[#B94E2D]">without limits.</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-[#A7A194] max-w-2xl leading-relaxed">
                Build a credible digital storefront on PROVENTA, showcase your products
                and services across {categories.length} industry categories, and receive
                qualified customer enquiries ready for quotation.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-3">
              <Link
                href="/business/register"
                className="btn-terracotta w-full justify-between"
              >
                <span>List Your Business</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/business/dashboard"
                className="inline-flex items-center justify-between border border-[#4C4A40] bg-[#20211C] px-5 py-3.5 text-xs font-medium uppercase tracking-[0.14em] text-[#F6F0E4] hover:border-[#A98253] transition-colors"
              >
                <span>Open Business Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 border-b border-[#D5CBB8]">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 border border-[#D5CBB8] bg-[#FAF6EC] divide-y lg:divide-y-0 lg:divide-x divide-[#D5CBB8]">
            <div className="p-8 lg:p-10">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#B94E2D] block mb-4">
                01 — Digital Storefront
              </span>
              <h2 className="font-display text-3xl font-normal text-[#181914]">
                Architectural Business Profile
              </h2>
              <p className="mt-3 text-sm text-[#5C584F] leading-relaxed">
                Every business receives a dedicated public storefront URL with verified
                trust badges, service areas, operating credentials, and direct enquiry
                actions.
              </p>
            </div>
            <div className="p-8 lg:p-10">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#A98253] block mb-4">
                02 — Product &amp; Service Catalog
              </span>
              <h2 className="font-display text-3xl font-normal text-[#181914]">
                Structured Offerings &amp; Pricing
              </h2>
              <p className="mt-3 text-sm text-[#5C584F] leading-relaxed">
                Publish physical products, professional services, or custom packages with
                transparent pricing models—Fixed Price, Starting Price, Price on Request,
                or Custom Quotation.
              </p>
            </div>
            <div className="p-8 lg:p-10">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#B94E2D] block mb-4">
                03 — Lead &amp; Quotation Engine
              </span>
              <h2 className="font-display text-3xl font-normal text-[#181914]">
                Direct Customer Quotations
              </h2>
              <p className="mt-3 text-sm text-[#5C584F] leading-relaxed">
                Respond to direct and category-matched customer enquiries with structured
                proposals, delivery timelines, and pricing—with zero platform commission.
              </p>
            </div>
          </div>

          <div className="mt-12 border border-[#4C4A40] bg-[#171A14] text-[#F6F0E4] p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-3xl sm:text-4xl font-normal text-[#F6F0E4]">
                Ready to showcase your business on PROVENTA?
              </h3>
              <div className="mt-3 flex flex-wrap gap-5 font-mono text-xs text-[#A7A194]">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#B94E2D]" /> Instant Storefront Publication
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#B94E2D]" /> 18 Industry Categories
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#B94E2D]" /> Direct B2B &amp; B2C Enquiries
                </span>
              </div>
            </div>
            <Link href="/business/register" className="btn-terracotta shrink-0">
              <span>Register Your Business</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
