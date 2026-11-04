import Link from 'next/link';
import {
  Store,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  ShieldCheck,
  Truck,
  Users,
} from 'lucide-react';

export default function ForSuppliersPage() {
  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans selection:bg-[#F25C05] selection:text-white">
      {/* Hero */}
      <section className="border-b border-[#252C38] bg-gradient-to-b from-[#171C26] to-[#090B10] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#090B10] border border-[#252C38] rounded-full text-xs font-mono text-[#F25C05]">
            <Store className="w-3.5 h-3.5" />
            <span>FOR DISTRIBUTORS, STOCKISTS & MANUFACTURERS</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading leading-tight max-w-4xl">
            Grow Your Wholesale Sourcing Volumes on <span className="text-[#F25C05]">PROVENTA</span>
          </h1>
          <p className="text-base sm:text-lg text-[#C5CAD3] max-w-3xl leading-relaxed">
            Gain direct access to qualified, verified contractors, builders, and developers with active material requirements across Ahmedabad & Gujarat.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              href="/supplier/register"
              className="px-7 py-3.5 bg-[#F25C05] hover:bg-[#D94E00] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center gap-2 shadow-lg"
            >
              <span>Register as Verified Supplier</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/supplier/dashboard"
              className="px-7 py-3.5 bg-[#171C26] hover:bg-[#1E2430] border border-[#252C38] text-[#F4F6FA] font-bold text-xs uppercase tracking-wider rounded-xs transition-colors"
            >
              <span>Supplier Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Supplier Value Props */}
      <section className="py-20 border-b border-[#252C38]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#F25C05] font-bold">
              Business Expansion
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              Why Material Suppliers Partner with PROVENTA
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#171C26] border border-[#252C38] p-8 rounded-xs space-y-4">
              <div className="w-12 h-12 bg-[#090B10] border border-[#252C38] flex items-center justify-center text-[#F25C05]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-xl uppercase text-[#FFFFFF]">Qualified Inbound RFQs</h3>
              <p className="text-sm text-[#C5CAD3] leading-relaxed">
                Zero cold-calling. Receive pre-screened material requirements with exact specifications, site addresses, and delivery dates from builders ready to buy.
              </p>
            </div>

            <div className="bg-[#171C26] border border-[#252C38] p-8 rounded-xs space-y-4">
              <div className="w-12 h-12 bg-[#090B10] border border-[#252C38] flex items-center justify-center text-[#F25C05]">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-xl uppercase text-[#FFFFFF]">Instant Purchase Orders</h3>
              <p className="text-sm text-[#C5CAD3] leading-relaxed">
                When a buyer selects your quotation, the platform automatically issues a formal, legally binding Purchase Order (PO-XXXXX) with locked commercial terms.
              </p>
            </div>

            <div className="bg-[#171C26] border border-[#252C38] p-8 rounded-xs space-y-4">
              <div className="w-12 h-12 bg-[#090B10] border border-[#252C38] flex items-center justify-center text-[#F25C05]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-xl uppercase text-[#FFFFFF]">Premium Verification Badge</h3>
              <p className="text-sm text-[#C5CAD3] leading-relaxed">
                Build authority in Gujarat&apos;s construction market. Verified dealers earn badges, customer ratings, and top placement in quotation matrixes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supplier Onboarding Steps */}
      <section className="py-20 bg-[#171C26] border-b border-[#252C38]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#F25C05] font-bold">
              Fast Onboarding
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              How to Become a Verified Supplier in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#090B10] border border-[#252C38] p-6 rounded-xs space-y-3">
              <span className="font-mono text-2xl font-black text-[#F25C05]">01</span>
              <h3 className="font-heading font-bold text-lg text-white">Submit Business & GST Details</h3>
              <p className="text-sm text-[#C5CAD3] leading-relaxed">
                Provide your trading name, registered 15-digit GSTIN, warehouse address, and primary product categories.
              </p>
            </div>

            <div className="bg-[#090B10] border border-[#252C38] p-6 rounded-xs space-y-3">
              <span className="font-mono text-2xl font-black text-[#F25C05]">02</span>
              <h3 className="font-heading font-bold text-lg text-white">Define Operating Zones & Brands</h3>
              <p className="text-sm text-[#C5CAD3] leading-relaxed">
                Select your delivery radius across Ahmedabad & Gujarat and list authorized brands you distribute (e.g. UltraTech, Tata Tiscon, Astral).
              </p>
            </div>

            <div className="bg-[#090B10] border border-[#252C38] p-6 rounded-xs space-y-3">
              <span className="font-mono text-2xl font-black text-[#F25C05]">03</span>
              <h3 className="font-heading font-bold text-lg text-white">Receive Matching RFQs & Submit Quotes</h3>
              <p className="text-sm text-[#C5CAD3] leading-relaxed">
                Get alerted the moment a contractor requests materials in your zones. Submit itemized unit quotes and close orders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-heading">
            Join Ahmedabad&apos;s Digital Procurement Network
          </h2>
          <p className="text-sm sm:text-base text-[#C5CAD3] max-w-xl mx-auto">
            Free onboarding for qualified material dealers, stockists, and transport partners.
          </p>
          <div className="pt-4">
            <Link
              href="/supplier/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#F25C05] hover:bg-[#D94E00] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors shadow-lg"
            >
              <span>Register Your Dealership Today</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
