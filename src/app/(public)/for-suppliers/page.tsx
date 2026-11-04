'use client';

import Link from 'next/link';
import {
  Store,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  Check,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const SUPPLIER_CRITERIA = [
  {
    title: 'ACTIVE REGISTRATION & GSTIN',
    requirement: 'Mandatory Active GSTIN Registration',
    description: 'Suppliers must provide valid GSTIN numbers in Gujarat matching the company business name and registered address.',
  },
  {
    title: 'PHYSICAL STOCKYARDS & DEPOTS',
    requirement: 'Audited Warehousing Facility',
    description: 'Physical yards across Changodar, Odhav, Sanand, Sola, Naroda or GIDC areas with verified handling equipment.',
  },
  {
    title: 'AUTHORIZED DISTRIBUTOR STATUS',
    requirement: 'Primary Producer Dealerships',
    description: 'Authorized distributorship certificates for primary producers (Tata Tiscon, Jindal Panther, UltraTech, Ambuja, Astral, Polycab).',
  },
  {
    title: 'OFFICIAL E-WAY BILLING',
    requirement: 'Full Invoicing Compliance',
    description: 'Capability to generate statutory government E-Way bills and valid tax invoices against every dispatched consignment.',
  },
];

export default function ForSuppliersPage() {
  return (
    <div className="min-h-screen bg-[#F2F0E9] text-[#171A17] font-sans">
      {/* Header Banner */}
      <section className="border-b border-[#D9D8CF] bg-[#FFFFFF] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E7E5DC] border border-[#D9D8CF] text-xs font-mono text-[#53634A] uppercase tracking-wider font-semibold">
            <span>FOR SUPPLIERS & STOCKISTS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#171A17] max-w-4xl font-heading leading-tight">
            EXPAND YOUR WHOLESALE CONSTRUCTION SOURCING
          </h1>
          <p className="text-sm sm:text-base text-[#777970] max-w-3xl leading-relaxed">
            Connect directly with verified civil contractors, builders, and developers actively procuring construction materials across Gujarat. Receive structured RFQs and submit competitive bids.
          </p>
        </div>
      </section>

      {/* Supplier Value Proposition */}
      <section className="py-20 bg-[#F2F0E9]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <div className="font-mono text-xs uppercase tracking-widest text-[#53634A] font-bold">
              PLATFORM ADVANTAGES
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#171A17] font-heading">
              Why Stockists Bid on PROVENTA
            </h2>
            <p className="text-sm text-[#777970]">
              Built to simplify wholesale commercial sales and expand regional reach without cold calling or delayed payment terms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#FFFFFF] border border-[#D9D8CF] space-y-4 shadow-sm">
              <FileSpreadsheet className="w-8 h-8 text-[#53634A]" />
              <h3 className="font-heading text-lg font-bold uppercase text-[#171A17]">
                Structured Technical RFQs
              </h3>
              <p className="text-xs text-[#777970] leading-relaxed">
                Receive organized bills of quantities with exact technical grades, standard units, site delivery locations, and vehicle accessibility requirements.
              </p>
            </div>

            <div className="p-8 bg-[#FFFFFF] border border-[#D9D8CF] space-y-4 shadow-sm">
              <TrendingUp className="w-8 h-8 text-[#53634A]" />
              <h3 className="font-heading text-lg font-bold uppercase text-[#171A17]">
                Direct Commercial Bidding
              </h3>
              <p className="text-xs text-[#777970] leading-relaxed">
                Submit itemized unit rates, GST percentages, and freight charges directly to buyers with zero broker intermediation or commission clipping.
              </p>
            </div>

            <div className="p-8 bg-[#FFFFFF] border border-[#D9D8CF] space-y-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-[#53634A]" />
              <h3 className="font-heading text-lg font-bold uppercase text-[#171A17]">
                Binding Purchase Orders
              </h3>
              <p className="text-xs text-[#777970] leading-relaxed">
                When a buyer selects your quotation, an official Purchase Order is issued with agreed payment terms, promised delivery dates, and designated contact details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supplier Vetting Standards */}
      <section className="py-20 bg-[#FFFFFF] border-t border-[#D9D8CF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <div className="font-mono text-xs uppercase tracking-widest text-[#53634A] font-bold">
              QUALIFICATION PROTOCOLS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#171A17] font-heading">
              Supplier Onboarding Criteria
            </h2>
            <p className="text-sm text-[#777970]">
              To maintain high credibility for buyers, all suppliers must meet rigorous operational standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SUPPLIER_CRITERIA.map((crit, idx) => (
              <div key={idx} className="p-6 bg-[#F2F0E9] border border-[#D9D8CF] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#53634A] font-bold">
                    {crit.title}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-[#53634A]" />
                </div>
                <div className="font-bold text-sm text-[#171A17]">{crit.requirement}</div>
                <p className="text-xs text-[#777970] leading-relaxed">{crit.description}</p>
              </div>
            ))}
          </div>

          <div className="p-8 bg-[#E7E5DC] border border-[#D9D8CF] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="font-heading text-xl font-bold uppercase text-[#171A17]">
                Ready to Join the Supplier Network?
              </h3>
              <p className="text-xs text-[#777970]">
                Register your business, submit GSTIN credentials, and begin receiving active buyer requirements.
              </p>
            </div>
            <Link
              href="/supplier/register"
              className="px-8 py-3.5 bg-[#53634A] hover:bg-[#43503B] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
            >
              Start Supplier Onboarding
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
