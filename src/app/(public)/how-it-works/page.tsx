import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const PROTOCOL_STEPS = [
  {
    num: '01',
    code: 'PHASE // REGISTRY & TAXONOMY',
    title: 'BUSINESSES PUBLISH STRUCTURED STOREFRONTS & CATALOGS',
    body: 'Enterprises across 18 commercial sectors register their storefront dossier, specify operating cities, and publish product or service offerings with transparent pricing models.',
  },
  {
    num: '02',
    code: 'PHASE // DISCOVERY & RFQ DISPATCH',
    title: 'BUYERS QUERY THE INDEX OR SUBMIT STRUCTURED ENQUIRIES',
    body: 'Procurement teams and consumers search by keyword, sector code, and city—then dispatch either a direct enquiry to a chosen vendor or an open sector requirement.',
  },
  {
    num: '03',
    code: 'PHASE // QUOTATION LEDGER & AWARD',
    title: 'VENDORS ISSUE FORMAL QUOTATIONS FOR SIDE-BY-SIDE ACCEPTANCE',
    body: 'Matching businesses respond with structured quotations containing price, scope inclusions, and delivery timelines. Buyers compare proposals and accept the winning quote.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#0D0E11]">
      <section className="border-b-2 border-[#0D0E11] bg-[#FAF8F3] py-16 lg:py-24">
        <div className="container-wide">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="index-code-lime">PROTOCOL SPECIFICATION // 05</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#52514E]">
              END-TO-END COMMERCIAL EXCHANGE
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold uppercase tracking-[-0.04em] text-[#0D0E11] leading-[0.94] max-w-4xl">
            THE PROVENTA TRADE &amp; QUOTATION PROTOCOL.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#52514E] max-w-2xl leading-relaxed">
            Built to eliminate opaque directories and middlemen. A unified three-stage workflow
            connecting verified businesses and qualified buyers.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-wide space-y-6">
          {PROTOCOL_STEPS.map((step) => (
            <div
              key={step.num}
              className="grid grid-cols-1 lg:grid-cols-12 border-2 border-[#0D0E11] bg-[#FAF8F3]"
            >
              <div className="lg:col-span-3 p-8 bg-[#0D0E11] text-[#F4F1EA] flex flex-col justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#C8F904]">
                  {step.code}
                </span>
                <span className="font-display text-6xl font-bold tracking-tighter text-[#F4F1EA] mt-4">
                  {step.num}
                </span>
              </div>
              <div className="lg:col-span-9 p-8 sm:p-10 flex flex-col justify-center">
                <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase text-[#0D0E11]">
                  {step.title}
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[#52514E] leading-relaxed max-w-3xl">
                  {step.body}
                </p>
              </div>
            </div>
          ))}

          <div className="pt-8 flex flex-wrap gap-3">
            <Link href="/businesses" className="btn-primary">
              <span>EXPLORE BUSINESS DIRECTORY</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/enquiries/new" className="btn-accent">
              <span>POST BUYER ENQUIRY</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/business/register" className="btn-secondary">
              <span>PUBLISH BUSINESS STOREFRONT</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
