'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Truck,
  FileText,
  Scale,
  Check,
} from 'lucide-react';

export default function ForBuyersPage() {
  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans">
      {/* Hero */}
      <section className="border-b border-[#252C38] bg-[#090B10] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171C26] border border-[#252C38] text-[11px] font-mono text-[#F25C05] uppercase tracking-wider font-semibold">
                <span>PROCUREMENT FOR CONTRACTORS, BUILDERS & DEVELOPERS</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#FFFFFF] leading-tight font-sans">
                COMMERCIAL PROCUREMENT. DIRECT WHOLESALE BIDDING.
              </h1>
              <p className="text-sm sm:text-base text-[#C5CAD3] max-w-xl leading-relaxed font-normal">
                Eliminate unverified brokers and inconsistent material deliveries. Source TMT steel, bulk cement, electrical, plumbing, and architectural finishes from verified Gujarat distributors with transparent freight.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 font-mono text-xs">
                <Link
                  href="/rfq/new"
                  className="px-8 py-4 bg-[#F25C05] hover:bg-[#D94E00] text-[#090B10] font-black uppercase tracking-widest text-center transition-colors flex items-center justify-center gap-2"
                >
                  <span>POST MATERIAL REQUIREMENT</span>
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
                <Link
                  href="/buyer/dashboard"
                  className="px-6 py-4 bg-[#171C26] border border-[#252C38] hover:border-[#858D9B] text-[#F4F6FA] font-bold uppercase tracking-widest text-center transition-colors"
                >
                  <span>BUYER PORTAL</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative w-full h-[340px] bg-[#171C26] border border-[#252C38] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1541888946425-d0fbb186156f?q=80&w=800&auto=format&fit=crop"
                  alt="Contractors and site engineers inspecting structural steel fabrication on site"
                  fill
                  className="object-cover object-center filter grayscale contrast-125"
                />
                <div className="absolute bottom-0 inset-x-0 p-4 bg-[#090B10]/95 border-t border-[#252C38] font-mono text-xs">
                  <div className="text-[10px] text-[#858D9B] uppercase">COMMERCIAL CONTRACTOR SPECIFICATION</div>
                  <div className="text-xs text-[#F4F6FA] font-bold mt-0.5">Primary producer Fe 550D TMT rebar packages with batch test certificates.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Buyer Profiles */}
      <section className="py-20 border-b border-[#252C38] bg-[#171C26]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="pb-8 border-b border-[#252C38]">
            <span className="font-mono text-xs uppercase tracking-widest text-[#F25C05] font-semibold">
              SCALABLE CAPABILITY
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] mt-1 font-sans">
              STRUCTURED SOURCING FOR EVERY COMMERCIAL SCALE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#090B10] border border-[#252C38] p-8 space-y-4">
              <div className="font-mono text-xs uppercase tracking-wider text-[#F25C05] font-bold">PROFILE 01</div>
              <h3 className="font-sans font-black text-lg uppercase text-[#FFFFFF]">General Contractors & Civil Engineers</h3>
              <p className="text-xs sm:text-sm text-[#C5CAD3] leading-relaxed">
                Source heavy structural packages—TMT rebars, bulk 53/43 Grade OPC cement, ready-mix concrete, and aggregate fill—scheduled across multi-phase casting dates.
              </p>
              <ul className="space-y-2 text-xs font-mono text-[#C5CAD3] pt-3 border-t border-[#252C38]">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#F25C05]" /> Staggered multi-axle trailer dispatch</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#F25C05]" /> Mill test certificates provided</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#F25C05]" /> GST input tax credit compliance</li>
              </ul>
            </div>

            <div className="bg-[#090B10] border border-[#252C38] p-8 space-y-4">
              <div className="font-mono text-xs uppercase tracking-wider text-[#F25C05] font-bold">PROFILE 02</div>
              <h3 className="font-sans font-black text-lg uppercase text-[#FFFFFF]">Commercial Builders & Developers</h3>
              <p className="text-xs sm:text-sm text-[#C5CAD3] leading-relaxed">
                Consolidate procurement for high-rise residential towers and commercial parks: FRLS electrical cables, CPVC water distribution, and vitrified tiles directly from factory stockists.
              </p>
              <ul className="space-y-2 text-xs font-mono text-[#C5CAD3] pt-3 border-t border-[#252C38]">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#F25C05]" /> Direct brand authorized dealership pricing</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#F25C05]" /> Single BOQ upload for multi-item RFQs</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#F25C05]" /> Auditable purchase order repository</li>
              </ul>
            </div>

            <div className="bg-[#090B10] border border-[#252C38] p-8 space-y-4">
              <div className="font-mono text-xs uppercase tracking-wider text-[#F25C05] font-bold">PROFILE 03</div>
              <h3 className="font-sans font-black text-lg uppercase text-[#FFFFFF]">Individual Home Builders & Villa Owners</h3>
              <p className="text-xs sm:text-sm text-[#C5CAD3] leading-relaxed">
                Procure architectural finish materials, plumbing fixtures, and waterproofing with wholesale clarity. Access the exact prices institutional contractors pay.
              </p>
              <ul className="space-y-2 text-xs font-mono text-[#C5CAD3] pt-3 border-t border-[#252C38]">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#F25C05]" /> Transparent landed delivery quotes</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#F25C05]" /> Direct truck unloading coordination</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#F25C05]" /> Digital verification upon site arrival</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Commercial Safeguards */}
      <section className="py-20 border-b border-[#252C38] bg-[#090B10]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="pb-8 border-b border-[#252C38]">
            <span className="font-mono text-xs uppercase tracking-widest text-[#F25C05] font-semibold">
              COMMERCIAL SAFEGUARDS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] mt-1 font-sans">
              HOW PROVENTA PROTECTS YOUR PROJECT
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#171C26] border border-[#252C38] p-6 space-y-3 font-mono text-xs">
              <div className="text-[#F25C05] font-bold">01 · BINDING QUOTATIONS</div>
              <div className="text-sm font-bold text-[#F4F6FA]">No Price Creep</div>
              <p className="text-xs text-[#C5CAD3] font-sans">
                Once a supplier submits a quotation with defined validity, the unit rates are locked. No on-site upward revisions.
              </p>
            </div>

            <div className="bg-[#171C26] border border-[#252C38] p-6 space-y-3 font-mono text-xs">
              <div className="text-[#F25C05] font-bold">02 · E-WAY BILL ENFORCEMENT</div>
              <div className="text-sm font-bold text-[#F4F6FA]">Valid Transit Documents</div>
              <p className="text-xs text-[#C5CAD3] font-sans">
                Commercial vehicles carry valid government E-Way bills and mill delivery challans, preventing seizure or GST disputes.
              </p>
            </div>

            <div className="bg-[#171C26] border border-[#252C38] p-6 space-y-3 font-mono text-xs">
              <div className="text-[#F25C05] font-bold">03 · SHORTAGE LOGGING</div>
              <div className="text-sm font-bold text-[#F4F6FA]">Digital Proof of Delivery</div>
              <p className="text-xs text-[#C5CAD3] font-sans">
                Site engineers sign off physical bag or rebar counts. Shortages or transit damages are logged digitally with photo proofs.
              </p>
            </div>

            <div className="bg-[#171C26] border border-[#252C38] p-6 space-y-3 font-mono text-xs">
              <div className="text-[#F25C05] font-bold">04 · DIRECT DISPATCH DETAILS</div>
              <div className="text-sm font-bold text-[#F4F6FA]">Driver & Truck Tracking</div>
              <p className="text-xs text-[#C5CAD3] font-sans">
                Vehicle registration number and assigned driver phone number are communicated directly to site supervisors before departure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Action Banner */}
      <section className="py-16 bg-[#171C26]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-[#090B10] border border-[#252C38] p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#FFFFFF]">
                SUBMIT YOUR MATERIAL REQUIREMENTS
              </h2>
              <p className="text-xs sm:text-sm text-[#C5CAD3]">
                Receive itemized commercial bids from verified distributors in your project zone within 24 hours.
              </p>
            </div>

            <Link
              href="/rfq/new"
              className="px-8 py-4 bg-[#F25C05] hover:bg-[#D94E00] text-[#090B10] font-black text-xs font-mono uppercase tracking-widest text-center transition-colors shrink-0"
            >
              POST REQUIREMENT (RFQ)
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
