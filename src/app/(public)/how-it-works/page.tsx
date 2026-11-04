'use client';

import Link from 'next/link';
import {
  FileText,
  Users,
  Scale,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Building2,
  Check,
  ArrowRight,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

const DETAILED_STEPS = [
  {
    step: '01',
    title: 'SUBMIT REQUIREMENTS',
    subtitle: 'Standardized Multi-Item Schedule',
    code: 'STAGE 01 · SPECIFICATION',
    badge: 'RFQ Schedule',
    icon: FileText,
    overview:
      'Contractors, builders, and developers submit structured procurement schedules specifying material grades, quantities in standard industrial units, project site location, and preferred delivery dates.',
    deliverables: [
      'Multi-material item schedule (e.g. 50 MT TMT Steel + 1,200 bags Cement in one RFQ)',
      'Standardized units: Metric Tonnes (MT), Bags (50kg), Cu.ft, Cu.m, Sq.ft, Pieces (Nos), Litres',
      'BOQ & technical specification PDF or Excel document attachments',
      'Site delivery address with vehicle access specifications (10-wheeler, Tata Ace, Transit Mixer)',
      'Unique auto-generated RFQ ID with privacy-protected buyer contact',
    ],
  },
  {
    step: '02',
    title: 'INVITE SUPPLIERS',
    subtitle: 'Zone & Category Routing',
    code: 'STAGE 02 · BROADCAST',
    badge: 'Verified Stockists',
    icon: Users,
    overview:
      'The requirement is routed to authorized stockists and manufacturers with active physical stockyards in the project delivery zone.',
    deliverables: [
      'Matching by primary category (Building Materials, Electrical, Plumbing, Tiles, Finishing, Doors/Windows)',
      'Geographic filtering matching active stockyards across Ahmedabad, Sanand, Changodar, and Gujarat',
      'Manual admin invitation override facility for specialized or high-tonnage institutional tenders',
      'Buyer contact privacy: Supplier sees project site zone, not raw phone numbers until order confirmation',
    ],
  },
  {
    step: '03',
    title: 'RECEIVE QUOTATIONS',
    subtitle: 'Itemized Commercial Bids',
    code: 'STAGE 03 · BIDDING',
    badge: 'Itemized Pricing',
    icon: Scale,
    overview:
      'Suppliers submit formal, binding quotations detailing item-level rates, applicable GST percentages, transportation freight, validity windows, and payment terms.',
    deliverables: [
      'Itemized unit price and line-item totals (no hidden markups)',
      'GST break-up (18% for steel/hardware/cables, 28% for cement/chemicals)',
      'Explicit delivery freight charges and volume discounts',
      'Guaranteed delivery timeframe and quotation validity period (e.g., valid for 7 days)',
      'Mill test certificates, batch test reports, and manufacturer warranty documentation',
    ],
  },
  {
    step: '04',
    title: 'COMPARE OFFERS',
    subtitle: 'Side-by-Side Evaluation Matrix',
    code: 'STAGE 04 · SELECTION',
    badge: 'Explicit Approval',
    icon: CheckCircle2,
    overview:
      'Buyers view all received quotes in an objective comparison matrix comparing landed cost, brand, lead time, and verification. No supplier is ever selected automatically.',
    deliverables: [
      'Total landed cost comparison highlighting basic material rates and freight terms',
      'Lead time and promised delivery date comparison',
      'Supplier credibility profile: GST verification status, operating yard address, and completed orders',
      'Explicit selection confirmation dialog preventing accidental order placement',
      'Automatic status notification to non-selected bidders upon award',
    ],
  },
  {
    step: '05',
    title: 'SELECT SUPPLIER & GENERATE PO',
    subtitle: 'Official Purchase Order',
    code: 'STAGE 05 · CONTRACT',
    badge: 'PO Generation',
    icon: Truck,
    overview:
      'Upon quotation selection, a formal Purchase Order is issued. The supplier inputs vehicle details, driver credentials, and government E-Way Bill for site coordination.',
    deliverables: [
      'Official Purchase Order generation with binding commercial terms',
      'Dispatch payload: Vehicle registration number, vehicle type, driver name & direct phone number',
      'Transporter company name and government E-Way Bill number',
      '7-stage milestone dispatch tracking from stockyard to construction site',
      'Real-time status updates and direct site supervisor alerts',
    ],
  },
  {
    step: '06',
    title: 'COORDINATE DELIVERY & SIGN-OFF',
    subtitle: 'Physical Inspection & Digital POD',
    code: 'STAGE 06 · DELIVERY',
    badge: 'Proof of Delivery',
    icon: ShieldCheck,
    overview:
      'Site engineers physically inspect the delivered consignment upon arrival, record delivered quantities against challan, log any shortages or damages, and confirm receipt.',
    deliverables: [
      'Delivered quantity verification against ordered BOQ count',
      'Shortage and transit damage incident logging with photo uploads',
      'Actual physical delivery timestamp recording and gate-pass receipt',
      '1 to 5 star rating and verified commercial review for the supplier',
      'Permanent auditable transaction record for company accounting and tax filings',
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#F2F0E9] text-[#171A17] font-sans">
      {/* Header Banner */}
      <section className="border-b border-[#D9D8CF] bg-[#FFFFFF] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E7E5DC] border border-[#D9D8CF] text-xs font-mono text-[#53634A] uppercase tracking-wider font-semibold">
            <span>OPERATIONAL BLUEPRINT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#171A17] max-w-4xl font-heading leading-tight">
            HOW CONSTRUCTION PROCUREMENT WORKS ON PROVENTA
          </h1>
          <p className="text-sm sm:text-base text-[#777970] max-w-3xl leading-relaxed">
            A structured six-step workflow engineered to eliminate broker markups, inaccurate material grades, and uncoordinated site deliveries across India&apos;s construction industry.
          </p>
        </div>
      </section>

      {/* Six Steps Breakdown */}
      <section className="py-20 bg-[#F2F0E9]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
          {DETAILED_STEPS.map((step) => {
            return (
              <div
                key={step.step}
                className="bg-[#FFFFFF] border border-[#D9D8CF] p-8 lg:p-10 shadow-sm"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left: Step Info */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#D9D8CF] pb-3">
                      <span className="font-mono text-xs uppercase tracking-widest text-[#53634A] font-bold">
                        {step.code}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#E7E5DC] text-[#171A17]">
                        {step.badge}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-4 pt-1">
                      <span className="font-mono text-3xl font-black text-[#53634A]">{step.step}</span>
                      <h2 className="font-heading font-black text-xl uppercase tracking-wide text-[#171A17]">
                        {step.title}
                      </h2>
                    </div>

                    <div className="text-xs font-mono text-[#777970] uppercase tracking-wider font-medium">
                      {step.subtitle}
                    </div>

                    <p className="text-xs sm:text-sm text-[#777970] leading-relaxed pt-1">
                      {step.overview}
                    </p>
                  </div>

                  {/* Right: Deliverables List */}
                  <div className="lg:col-span-7 bg-[#F2F0E9] border border-[#D9D8CF] p-6 lg:p-8 space-y-4">
                    <div className="font-mono text-xs uppercase tracking-wider text-[#171A17] font-bold pb-2 border-b border-[#D9D8CF]">
                      OPERATIONAL PROTOCOLS & OUTPUTS
                    </div>
                    <ul className="space-y-3 text-xs sm:text-sm text-[#171A17]">
                      {step.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-[#53634A] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ABOUT US SECTION — Authority, Infrastructure & Corporate Verification */}
      <section id="about" className="py-20 lg:py-28 bg-[#FFFFFF] border-t border-[#D9D8CF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="pb-8 border-b border-[#D9D8CF]">
            <div className="font-mono text-xs uppercase tracking-widest text-[#53634A] mb-2 font-bold">
              ABOUT PROVENTA
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#171A17] font-heading">
              ENTERPRISE PROCUREMENT INFRASTRUCTURE
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-6 text-sm text-[#777970] leading-relaxed">
              <p>
                PROVENTA is a dedicated construction procurement platform built to establish operational transparency, competitive bidding, and reliable site logistics for India&apos;s construction and infrastructure sector.
              </p>
              <p>
                Founded to solve chronic issues in commercial procurement—speculative dealer markups, unverified product origins, uncoordinated site delivery, and opaque billing—PROVENTA provides builders, developers, contractors, and institutional buyers with a direct, digitized conduit to verified material distributors and manufacturers.
              </p>
              <p>
                Operating with primary density across Ahmedabad, Gandhinagar, Vadodara, Surat, and the broader Gujarat industrial belt, PROVENTA maintains strict supplier vetting protocols including physical stockyard audits, active GST registration checks, and authorized dealer certificate validations.
              </p>
            </div>

            <div className="lg:col-span-5 bg-[#F2F0E9] border border-[#D9D8CF] p-8 space-y-6 font-mono text-xs">
              <div className="border-b border-[#D9D8CF] pb-3 font-bold text-xs text-[#171A17] uppercase">
                OPERATIONAL COMMITMENTS
              </div>
              <div className="space-y-4 text-[#171A17]">
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#53634A] mt-1 shrink-0" />
                  <div>
                    <strong className="text-[#171A17] block">Direct Commercial Pricing:</strong>
                    Quotations reflect genuine wholesale mill and distributor prices without intermediary brokerage.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#53634A] mt-1 shrink-0" />
                  <div>
                    <strong className="text-[#171A17] block">Independent Buyer Authority:</strong>
                    The buyer maintains complete discretion over vendor selection. No automated algorithmic lock-in.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#53634A] mt-1 shrink-0" />
                  <div>
                    <strong className="text-[#171A17] block">Auditable Logistics Trail:</strong>
                    Designated vehicle numbers, driver phone contacts, and formal E-Way bills recorded on every dispatch.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#E7E5DC] border-t border-[#D9D8CF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#171A17] font-heading">
                COMMENCE YOUR REQUIREMENT
              </h2>
              <p className="text-xs sm:text-sm text-[#777970]">
                Submit your project specifications or Bill of Quantities to receive itemized commercial bids from verified distributors.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 font-mono text-xs shrink-0">
              <Link
                href="/rfq/new"
                className="px-8 py-4 bg-[#53634A] hover:bg-[#43503B] text-[#FFFFFF] font-bold uppercase tracking-wider text-center transition-colors"
              >
                POST A REQUIREMENT
              </Link>
              <Link
                href="/supplier/register"
                className="px-6 py-4 bg-[#FFFFFF] border border-[#D9D8CF] hover:bg-[#F2F0E9] text-[#171A17] font-bold uppercase tracking-wider text-center transition-colors"
              >
                BECOME A SUPPLIER
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
