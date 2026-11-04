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
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans">
      {/* Header Banner */}
      <section className="border-b border-[#414957] bg-[#252B38] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#191B20] border border-[#414957] text-xs font-mono text-[#C66A42] uppercase tracking-wider font-semibold rounded-sm">
            <span>FOR SUPPLIERS & STOCKISTS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#FFFFFF] max-w-4xl font-heading leading-tight">
            EXPAND YOUR WHOLESALE CONSTRUCTION SOURCING
          </h1>
          <p className="text-sm sm:text-base text-[#A8ADB7] max-w-3xl leading-relaxed">
            Connect directly with verified civil contractors, builders, and developers actively procuring construction materials across Gujarat. Receive structured RFQs and submit competitive bids.
          </p>
        </div>
      </section>

      {/* Supplier Value Proposition */}
      <section className="py-20 bg-[#292F3D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <div className="font-mono text-xs uppercase tracking-widest text-[#536B88] font-bold">
              PLATFORM ADVANTAGES
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              Why Stockists Bid on PROVENTA
            </h2>
            <p className="text-sm text-[#A8ADB7]">
              Built to simplify wholesale commercial sales and expand regional reach without cold calling or delayed payment terms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#303746] border border-[#414957] space-y-4 shadow-sm rounded-sm hover:border-[#536B88] transition-colors">
              <FileSpreadsheet className="w-8 h-8 text-[#536B88]" />
              <h3 className="font-heading text-lg font-bold uppercase text-[#FFFFFF]">
                Structured Technical RFQs
              </h3>
              <p className="text-xs text-[#A8ADB7] leading-relaxed">
                Receive organized bills of quantities with exact technical grades, standard units, site delivery locations, and vehicle accessibility requirements.
              </p>
            </div>

            <div className="p-8 bg-[#303746] border border-[#414957] space-y-4 shadow-sm rounded-sm hover:border-[#536B88] transition-colors">
              <TrendingUp className="w-8 h-8 text-[#C66A42]" />
              <h3 className="font-heading text-lg font-bold uppercase text-[#FFFFFF]">
                Direct Commercial Bidding
              </h3>
              <p className="text-xs text-[#A8ADB7] leading-relaxed">
                Submit itemized unit rates, GST percentages, and freight charges directly to buyers with zero broker intermediation or commission clipping.
              </p>
            </div>

            <div className="p-8 bg-[#303746] border border-[#414957] space-y-4 shadow-sm rounded-sm hover:border-[#536B88] transition-colors">
              <CheckCircle2 className="w-8 h-8 text-[#536B88]" />
              <h3 className="font-heading text-lg font-bold uppercase text-[#FFFFFF]">
                Binding Purchase Orders
              </h3>
              <p className="text-xs text-[#A8ADB7] leading-relaxed">
                When a buyer selects your quotation, an official Purchase Order is issued with agreed payment terms, promised delivery dates, and designated contact details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supplier Vetting Standards */}
      <section className="py-20 bg-[#252B38] border-t border-[#414957]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <div className="font-mono text-xs uppercase tracking-widest text-[#C66A42] font-bold">
              QUALIFICATION PROTOCOLS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              Supplier Onboarding Criteria
            </h2>
            <p className="text-sm text-[#A8ADB7]">
              To maintain high credibility for buyers, all suppliers must meet rigorous operational standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SUPPLIER_CRITERIA.map((crit, idx) => (
              <div key={idx} className="p-6 bg-[#303746] border border-[#414957] space-y-2 rounded-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#536B88] font-bold">
                    {crit.title}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-[#536B88]" />
                </div>
                <div className="font-bold text-sm text-[#FFFFFF]">{crit.requirement}</div>
                <p className="text-xs text-[#A8ADB7] leading-relaxed">{crit.description}</p>
              </div>
            ))}
          </div>

          <div className="p-8 bg-[#191B20] border border-[#414957] flex flex-col sm:flex-row items-center justify-between gap-6 rounded-sm">
            <div className="space-y-1">
              <h3 className="font-heading text-xl font-bold uppercase text-[#FFFFFF]">
                Ready to Join the Supplier Network?
              </h3>
              <p className="text-xs text-[#A8ADB7]">
                Register your business, submit GSTIN credentials, and begin receiving active buyer requirements.
              </p>
            </div>
            <Link
              href="/supplier/register"
              className="px-8 py-3.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider transition-colors shrink-0 rounded-sm shadow-sm"
            >
              Start Supplier Onboarding
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
