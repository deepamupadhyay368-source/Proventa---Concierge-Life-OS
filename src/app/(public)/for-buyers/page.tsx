import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Clock,
  FileSpreadsheet,
  Truck,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function ForBuyersPage() {
  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans selection:bg-[#F25C05] selection:text-white">
      {/* Hero */}
      <section className="border-b border-[#252C38] bg-gradient-to-b from-[#171C26] to-[#090B10] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#090B10] border border-[#252C38] rounded-full text-xs font-mono text-[#F25C05]">
            <Building2 className="w-3.5 h-3.5" />
            <span>FOR CONTRACTORS, BUILDERS & HOME OWNERS</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading leading-tight max-w-4xl">
            Smarter Material Sourcing for <span className="text-[#F25C05]">Construction Buyers</span>
          </h1>
          <p className="text-base sm:text-lg text-[#C5CAD3] max-w-3xl leading-relaxed">
            Eliminate phone-based price haggling and unreliable material dispatches. Get transparent, competitive quotations from verified suppliers with tracked site delivery.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              href="/rfq/new"
              className="px-7 py-3.5 bg-[#F25C05] hover:bg-[#D94E00] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center gap-2"
            >
              <span>Post Material Requirement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/buyer/dashboard"
              className="px-7 py-3.5 bg-[#171C26] hover:bg-[#1E2430] border border-[#252C38] text-[#F4F6FA] font-bold text-xs uppercase tracking-wider rounded-xs transition-colors"
            >
              <span>Buyer Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Target Buyer Profiles */}
      <section className="py-20 border-b border-[#252C38]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#F25C05] font-bold">
              Tailored Capabilities
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              Built for Every Scale of Construction
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#171C26] border border-[#252C38] p-8 rounded-xs space-y-4">
              <div className="font-mono text-xs uppercase tracking-wider text-[#F25C05]">Scale 01</div>
              <h3 className="font-heading font-black text-xl uppercase text-[#FFFFFF]">Contractors & Civil Engineers</h3>
              <p className="text-sm text-[#C5CAD3] leading-relaxed">
                Source high-tonnage structural steel, bulk cement bags, and ready-mix concrete batch schedules with guaranteed site delivery timelines and mill test certificates.
              </p>
              <ul className="space-y-2 text-xs text-[#C5CAD3] pt-2 border-t border-[#252C38]">
                <li>✓ Staggered trailer dispatch support</li>
                <li>✓ Multi-brand price matching</li>
                <li>✓ Weighbridge verification slips</li>
              </ul>
            </div>

            <div className="bg-[#171C26] border border-[#252C38] p-8 rounded-xs space-y-4">
              <div className="font-mono text-xs uppercase tracking-wider text-[#F25C05]">Scale 02</div>
              <h3 className="font-heading font-black text-xl uppercase text-[#FFFFFF]">Builders & Real Estate Developers</h3>
              <p className="text-sm text-[#C5CAD3] leading-relaxed">
                Centralize procurement across multiple ongoing residential and commercial schemes in Ahmedabad, Sanand, Bopal, and Gandhinagar under one audited account.
              </p>
              <ul className="space-y-2 text-xs text-[#C5CAD3] pt-2 border-t border-[#252C38]">
                <li>✓ Bulk project BOQ schedules</li>
                <li>✓ Direct distributor credit & terms</li>
                <li>✓ Centralized GST compliance</li>
              </ul>
            </div>

            <div className="bg-[#171C26] border border-[#252C38] p-8 rounded-xs space-y-4">
              <div className="font-mono text-xs uppercase tracking-wider text-[#F25C05]">Scale 03</div>
              <h3 className="font-heading font-black text-xl uppercase text-[#FFFFFF]">Individual Home Builders & Renovators</h3>
              <p className="text-sm text-[#C5CAD3] leading-relaxed">
                Building your dream bungalow or renovating? Access the exact same wholesale rates, verified brands, and genuine factory materials that major commercial builders get.
              </p>
              <ul className="space-y-2 text-xs text-[#C5CAD3] pt-2 border-t border-[#252C38]">
                <li>✓ Zero hidden commission markups</li>
                <li>✓ Free quotation comparison tool</li>
                <li>✓ Pay only after physical delivery check</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose PROVENTA */}
      <section className="py-20 bg-[#171C26] border-b border-[#252C38]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#F25C05] font-bold">
              Core Advantages
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              Why Construction Buyers Choose PROVENTA
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#090B10] border border-[#252C38] p-6 rounded-xs flex items-start gap-4">
              <TrendingDown className="w-6 h-6 text-[#F25C05] shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-lg text-white">5% to 14% Average Cost Savings</h3>
                <p className="text-sm text-[#C5CAD3] leading-relaxed">
                  Transparent competition between multiple stockists ensures you receive the lowest competitive unit rate for TMT steel, cement, vitrified tiles, and plumbing pipes.
                </p>
              </div>
            </div>

            <div className="bg-[#090B10] border border-[#252C38] p-6 rounded-xs flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-[#F25C05] shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-lg text-white">100% Verified GST Suppliers</h3>
                <p className="text-sm text-[#C5CAD3] leading-relaxed">
                  Every supplier on PROVENTA is vetted for active GSTIN registration, physical warehouse address in Gujarat, and genuine authorized manufacturer distributorships.
                </p>
              </div>
            </div>

            <div className="bg-[#090B10] border border-[#252C38] p-6 rounded-xs flex items-start gap-4">
              <Clock className="w-6 h-6 text-[#F25C05] shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-lg text-white">Fast 4-Hour Quotation Turnaround</h3>
                <p className="text-sm text-[#C5CAD3] leading-relaxed">
                  Active stockists receive automated alerts and submit itemized quotations within hours, preventing project site stalling and idle labor costs.
                </p>
              </div>
            </div>

            <div className="bg-[#090B10] border border-[#252C38] p-6 rounded-xs flex items-start gap-4">
              <Truck className="w-6 h-6 text-[#F25C05] shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-lg text-white">7-Stage Dispatch & Driver Tracking</h3>
                <p className="text-sm text-[#C5CAD3] leading-relaxed">
                  Know exact vehicle registration numbers, driver direct phone numbers, and transit milestones before the truck arrives at your site gate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-heading">
            Post Your Construction Requirement Now
          </h2>
          <p className="text-sm sm:text-base text-[#C5CAD3] max-w-xl mx-auto">
            Takes under 2 minutes. Receive itemized quotes from verified Ahmedabad distributors today.
          </p>
          <div className="pt-4">
            <Link
              href="/rfq/new"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#F25C05] hover:bg-[#D94E00] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors shadow-lg"
            >
              <span>Create Requirement (RFQ)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
