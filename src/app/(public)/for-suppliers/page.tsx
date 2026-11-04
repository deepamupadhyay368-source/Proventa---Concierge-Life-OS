'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  Truck,
  Building,
  Check,
} from 'lucide-react';

export default function ForSuppliersPage() {
  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans">
      {/* Hero */}
      <section className="border-b border-[#252C38] bg-[#090B10] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171C26] border border-[#252C38] text-[11px] font-mono text-[#F25C05] uppercase tracking-wider font-semibold">
                <span>SUPPLIER & DISTRIBUTOR NETWORK · GUJARAT</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#FFFFFF] leading-tight font-sans">
                EXPAND YOUR WHOLESALE CONSTRUCTION SOURCING
              </h1>
              <p className="text-sm sm:text-base text-[#C5CAD3] max-w-xl leading-relaxed font-normal">
                Direct access to active commercial builders, civil engineering contractors, and institutional developers with verified requirements across Ahmedabad, Gandhinagar, and Gujarat.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 font-mono text-xs">
                <Link
                  href="/supplier/register"
                  className="px-8 py-4 bg-[#F25C05] hover:bg-[#D94E00] text-[#090B10] font-black uppercase tracking-widest text-center transition-colors flex items-center justify-center gap-2"
                >
                  <span>REGISTER AS SUPPLIER</span>
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
                <Link
                  href="/supplier/dashboard"
                  className="px-6 py-4 bg-[#171C26] border border-[#252C38] hover:border-[#858D9B] text-[#F4F6FA] font-bold uppercase tracking-widest text-center transition-colors"
                >
                  <span>SUPPLIER PORTAL</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative w-full h-[340px] bg-[#171C26] border border-[#252C38] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=800&auto=format&fit=crop"
                  alt="Industrial warehouse with heavy building materials, structural timber and steel distribution staging"
                  fill
                  className="object-cover object-center filter grayscale contrast-125"
                />
                <div className="absolute bottom-0 inset-x-0 p-4 bg-[#090B10]/95 border-t border-[#252C38] font-mono text-xs">
                  <div className="text-[10px] text-[#858D9B] uppercase">AUTHORIZED DISTRIBUTOR HUBS</div>
                  <div className="text-xs text-[#F4F6FA] font-bold mt-0.5">Heavy material yards in Changodar, Odhav, Naroda, and Sanand.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supplier Capabilities & Value */}
      <section className="py-20 border-b border-[#252C38] bg-[#171C26]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="pb-8 border-b border-[#252C38]">
            <span className="font-mono text-xs uppercase tracking-widest text-[#F25C05] font-semibold">
              COMMERCIAL ADVANTAGES
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] mt-1 font-sans">
              WHY DISTRIBUTORS OPERATE THROUGH PROVENTA
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#090B10] border border-[#252C38] p-8 space-y-4">
              <div className="font-mono text-xs text-[#F25C05] font-bold">01 · VERIFIED INBOUND DEMAND</div>
              <h3 className="font-sans font-black text-lg uppercase text-[#FFFFFF]">Structured Commercial RFQs</h3>
              <p className="text-xs sm:text-sm text-[#C5CAD3] leading-relaxed">
                Receive pre-qualified material schedules with explicit quantities, standard units, site addresses, and delivery dates from builders ready to issue purchase orders.
              </p>
            </div>

            <div className="bg-[#090B10] border border-[#252C38] p-8 space-y-4">
              <div className="font-mono text-xs text-[#F25C05] font-bold">02 · ITEMISED QUOTATION PORTAL</div>
              <h3 className="font-sans font-black text-lg uppercase text-[#FFFFFF]">Transparent Bid Submission</h3>
              <p className="text-xs sm:text-sm text-[#C5CAD3] leading-relaxed">
                Input your item-level rates, applicable GST rates, freight transportation, and validity windows. Eliminate endless telephone negotiations.
              </p>
            </div>

            <div className="bg-[#090B10] border border-[#252C38] p-8 space-y-4">
              <div className="font-mono text-xs text-[#F25C05] font-bold">03 · SECURE PURCHASE ORDERS</div>
              <h3 className="font-sans font-black text-lg uppercase text-[#FFFFFF]">Auditable Contracts</h3>
              <p className="text-xs sm:text-sm text-[#C5CAD3] leading-relaxed">
                Receive legally binding Purchase Orders (PO-XXXXX) with clear advance and delivery milestones before releasing trucks from your stockyard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supplier Vetting Standards */}
      <section className="py-20 border-b border-[#252C38] bg-[#090B10]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="pb-8 border-b border-[#252C38]">
            <span className="font-mono text-xs uppercase tracking-widest text-[#F25C05] font-semibold">
              ONBOARDING CRITERIA
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] mt-1 font-sans">
              SUPPLIER ELIGIBILITY & VERIFICATION AUDIT
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs">
            <div className="bg-[#171C26] border border-[#252C38] p-8 space-y-4">
              <div className="text-sm font-bold text-[#F4F6FA] uppercase border-b border-[#252C38] pb-3">
                REQUIRED DOCUMENTATION
              </div>
              <ul className="space-y-3 text-[#C5CAD3]">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#F25C05] shrink-0 mt-0.5" />
                  <span>Active GSTIN registration certificate in Gujarat (State Code 24)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#F25C05] shrink-0 mt-0.5" />
                  <span>Physical stockyard / warehouse commercial address proof</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#F25C05] shrink-0 mt-0.5" />
                  <span>Authorised manufacturer distributorship / dealership documentation</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#F25C05] shrink-0 mt-0.5" />
                  <span>Current bank account verification (cancelled cheque)</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#171C26] border border-[#252C38] p-8 space-y-4">
              <div className="text-sm font-bold text-[#F4F6FA] uppercase border-b border-[#252C38] pb-3">
                LOGISTICS & QUALITY COMPLIANCE
              </div>
              <ul className="space-y-3 text-[#C5CAD3]">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#F25C05] shrink-0 mt-0.5" />
                  <span>Capability to provide batch mill test certificates (MTC) on dispatch</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#F25C05] shrink-0 mt-0.5" />
                  <span>Commercial vehicle coordination (Tata Ace, 10-wheeler, multi-axle trailer)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#F25C05] shrink-0 mt-0.5" />
                  <span>Government E-Way bill generation prior to truck departure</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#F25C05] shrink-0 mt-0.5" />
                  <span>Commitment to transparent shortage resolution upon site receipt</span>
                </li>
              </ul>
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
                BECOME AN AUTHORISED PROVENTA SUPPLIER
              </h2>
              <p className="text-xs sm:text-sm text-[#C5CAD3]">
                Complete your business registration and receive notifications for active material tenders in your operating zone.
              </p>
            </div>

            <Link
              href="/supplier/register"
              className="px-8 py-4 bg-[#F25C05] hover:bg-[#D94E00] text-[#090B10] font-black text-xs font-mono uppercase tracking-widest text-center transition-colors shrink-0"
            >
              REGISTER YOUR BUSINESS
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
