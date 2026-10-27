import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { getCategories } from '@/lib/marketplace/repository';

export default function ForBusinessesPage() {
  const categories = getCategories({ onlyTopLevel: true });

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#0D0E11]">
      <section className="border-b-2 border-[#0D0E11] bg-[#0D0E11] text-[#F4F1EA] py-16 lg:py-24">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 mb-5">
                <span className="index-code-lime">COMMERCIAL ONBOARDING // 04</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#CFCAC0]">
                  FOR MANUFACTURERS, SUPPLIERS &amp; SERVICE ENTERPRISES
                </span>
              </div>
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-[-0.04em] leading-[0.92]">
                YOUR PERMANENT DOSSIER IN{' '}
                <span className="text-[#C8F904]">THE BUSINESS INDEX.</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-[#CFCAC0] max-w-2xl leading-relaxed">
                Replace fragmented social links and static PDF brochures with an indexed,
                structured storefront on PROVENTA. Publish your product and service catalog across{' '}
                {categories.length} standardized industry sectors and receive direct buyer RFQs.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-3">
              <Link href="/business/register" className="btn-accent w-full justify-between">
                <span>PUBLISH BUSINESS STOREFRONT</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/business/dashboard"
                className="inline-flex items-center justify-between border border-[#3A3D45] bg-[#16181E] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[#F4F1EA] hover:border-[#C8F904] hover:text-[#C8F904]"
              >
                <span>OPEN VENDOR CONSOLE</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 border-b-2 border-[#0D0E11]">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 border border-[#0D0E11] bg-[#FAF8F3] divide-y lg:divide-y-0 lg:divide-x divide-[#0D0E11]">
            <div className="p-8 lg:p-10">
              <span className="index-code-lime mb-4">SPEC // 01</span>
              <h2 className="font-display text-2xl font-bold uppercase text-[#0D0E11]">
                ARCHITECTURAL STOREFRONT DOSSIER
              </h2>
              <p className="mt-3 text-sm text-[#52514E] leading-relaxed">
                Every business receives a clean, typography-led publication page with verified
                trust badges, operating jurisdictions, and search-indexed capability tags.
              </p>
            </div>
            <div className="p-8 lg:p-10">
              <span className="index-code mb-4">SPEC // 02</span>
              <h2 className="font-display text-2xl font-bold uppercase text-[#0D0E11]">
                STRUCTURED OFFERINGS LEDGER
              </h2>
              <p className="mt-3 text-sm text-[#52514E] leading-relaxed">
                List physical products, professional services, or turnkey packages with clear
                pricing classifications (Fixed Price, Starting From, Price Range, or Custom Quote).
              </p>
            </div>
            <div className="p-8 lg:p-10">
              <span className="index-code-lime mb-4">SPEC // 03</span>
              <h2 className="font-display text-2xl font-bold uppercase text-[#0D0E11]">
                DIRECT QUOTATION DESK
              </h2>
              <p className="mt-3 text-sm text-[#52514E] leading-relaxed">
                Respond to targeted and sector-wide buyer enquiries with formal quotations,
                delivery timelines, and commercial terms—with 0% platform commission.
              </p>
            </div>
          </div>

          <div className="mt-12 border-2 border-[#0D0E11] bg-[#EAE5DA] p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase text-[#0D0E11]">
                READY TO INDEX YOUR ENTERPRISE?
              </h3>
              <div className="mt-2 flex flex-wrap gap-4 font-mono text-xs text-[#0D0E11]">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> INSTANT PUBLICATION
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> 18 INDUSTRY SECTORS
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> DIRECT B2B &amp; B2C LEADS
                </span>
              </div>
            </div>
            <Link href="/business/register" className="btn-primary shrink-0">
              <span>REGISTER BUSINESS NOW</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
