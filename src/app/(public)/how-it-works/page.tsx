'use client';

import Link from 'next/link';
import {
  FileText,
  Users,
  Scale,
  CheckCircle2,
  Truck,
  ShieldCheck,
  ArrowUpRight,
  Building2,
  MapPin,
  Check,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

const DETAILED_STEPS = [
  {
    step: '01',
    title: 'CREATE REQUIREMENT',
    subtitle: 'Standardized Multi-Item Schedule',
    code: 'STAGE 01 · SPECIFICATION',
    badge: 'RFQ-XXXXX',
    icon: FileText,
    overview:
      'Contractors, builders, and developers submit structured procurement schedules specifying material grades, quantities in standard industrial units, project site location, and preferred delivery dates.',
    deliverables: [
      'Multi-material item schedule (e.g. 50 MT TMT Steel + 1,200 bags Cement in one RFQ)',
      'Standardized units: Metric Tonnes (MT), Bags (50kg), Cu.ft, Cu.m, Sq.ft, Pieces (Nos), Litres',
      'BOQ & technical specification PDF or Excel document attachments',
      'Site delivery address with vehicle access specifications (10-wheeler, Tata Ace, Transit Mixer)',
      'Unique auto-generated RFQ ID (e.g., RFQ-74102) with privacy-protected buyer contact',
    ],
  },
  {
    step: '02',
    title: 'INVITE SUPPLIERS',
    subtitle: 'Zone & Category Routing',
    code: 'STAGE 02 · DISPATCH',
    badge: '100% Verified',
    icon: Users,
    overview:
      'The requirement is routed to authorised stockists and manufacturers with active physical yards in the delivery zone across Ahmedabad and Gujarat.',
    deliverables: [
      'Matching by primary category (Building Materials, Electrical, Plumbing, Tiles, Finishing, Doors/Windows)',
      'Geographic filtering matching active stockyards in Odhav, Changodar, Sanand, Sola, Bopal, etc.',
      'Manual admin invitation override facility for specialized or high-tonnage institutional tenders',
      'Buyer contact privacy: Supplier sees project site zone, not raw phone numbers until order confirmation',
    ],
  },
  {
    step: '03',
    title: 'RECEIVE QUOTATIONS',
    subtitle: 'Itemized Commercial Bids',
    code: 'STAGE 03 · BIDDING',
    badge: 'Full Line Items',
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
    title: 'COMPARE & SELECT',
    subtitle: 'Apples-to-Apples Decision Matrix',
    code: 'STAGE 04 · SELECTION',
    badge: 'Buyer Confirms',
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
    title: 'COORDINATE DELIVERY',
    subtitle: 'Assigned Vehicle & E-Way Bill',
    code: 'STAGE 05 · LOGISTICS',
    badge: 'PO-XXXXX',
    icon: Truck,
    overview:
      'Upon quotation selection, a formal Purchase Order is issued. The supplier inputs vehicle details, driver credentials, and government E-Way Bill for site coordination.',
    deliverables: [
      'Official Purchase Order generation (e.g., PO-58219) with contractual terms',
      'Dispatch payload: Vehicle registration number, vehicle type, driver name & direct phone number',
      'Transporter company name and government E-Way Bill number',
      '6 Sequential Delivery Stages: ORDER_CONFIRMED → PROCESSING → READY_FOR_DISPATCH → DISPATCHED → IN_TRANSIT → DELIVERED',
      'Real-time status updates and direct site supervisor alerts',
    ],
  },
  {
    step: '06',
    title: 'CONFIRM & COMPLETE',
    subtitle: 'Physical Inspection & Digital POD',
    code: 'STAGE 06 · CLOSEOUT',
    badge: 'Closed PO',
    icon: ShieldCheck,
    overview:
      'Site engineers physically inspect the delivered consignment upon arrival, record delivered quantities against challan, record any damages or shortages with photo logs, and confirm receipt.',
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
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans">
      {/* Header Banner */}
      <section className="border-b border-[#252C38] bg-[#090B10] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171C26] border border-[#252C38] text-[11px] font-mono text-[#F25C05] uppercase tracking-wider">
            <span>OPERATIONAL BLUEPRINT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#FFFFFF] max-w-4xl font-sans">
            HOW CONSTRUCTION PROCUREMENT WORKS ON PROVENTA
          </h1>
          <p className="text-sm sm:text-base text-[#C5CAD3] max-w-3xl leading-relaxed font-normal">
            A structured six-step workflow engineered to eliminate broker markups, inaccurate material grades, and uncoordinated site deliveries across India&apos;s construction industry.
          </p>
        </div>
      </section>

      {/* Six Steps Breakdown */}
      <section className="py-20 bg-[#090B10]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
          {DETAILED_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="bg-[#171C26] border border-[#252C38] p-8 lg:p-10"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left: Step Info */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#252C38] pb-3">
                      <span className="font-mono text-xs uppercase tracking-widest text-[#F25C05] font-bold">
                        {step.code}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#090B10] border border-[#252C38] text-[#858D9B]">
                        {step.badge}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-4 pt-1">
                      <span className="font-mono text-3xl font-black text-[#F25C05]">{step.step}</span>
                      <h2 className="font-sans font-black text-xl uppercase tracking-wide text-[#FFFFFF]">
                        {step.title}
                      </h2>
                    </div>

                    <div className="text-xs font-mono text-[#858D9B] uppercase tracking-wider">
                      {step.subtitle}
                    </div>

                    <p className="text-xs sm:text-sm text-[#C5CAD3] leading-relaxed pt-1 font-normal">
                      {step.overview}
                    </p>
                  </div>

                  {/* Right: Deliverables List */}
                  <div className="lg:col-span-7 bg-[#090B10] border border-[#252C38] p-6 lg:p-8 space-y-4">
                    <div className="font-mono text-[11px] uppercase tracking-wider text-[#858D9B] pb-2 border-b border-[#252C38]">
                      OPERATIONAL PROTOCOLS & SYSTEM OUTPUTS
                    </div>
                    <ul className="space-y-3 text-xs sm:text-sm text-[#C5CAD3]">
                      {step.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-[#F25C05] shrink-0 mt-0.5" />
                          <span>{item}</span>
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
      <section id="about" className="py-20 lg:py-28 bg-[#171C26] border-t border-[#252C38]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="pb-8 border-b border-[#252C38]">
            <div className="font-mono text-xs uppercase tracking-widest text-[#F25C05] mb-2 font-semibold">
              ABOUT PROVENTA
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF]">
              ENTERPRISE PROCUREMENT INFRASTRUCTURE
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-6 text-sm text-[#C5CAD3] leading-relaxed">
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

            <div className="lg:col-span-5 bg-[#090B10] border border-[#252C38] p-8 space-y-6 font-mono text-xs">
              <div className="border-b border-[#252C38] pb-3 font-bold text-sm text-[#F4F6FA] uppercase">
                OPERATIONAL COMMITMENTS
              </div>
              <div className="space-y-4 text-[#C5CAD3]">
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#F25C05] mt-1 shrink-0" />
                  <div>
                    <strong className="text-[#F4F6FA] block">Direct Commercial Pricing:</strong>
                    Quotations reflect genuine wholesale mill and distributor prices without intermediary brokerage.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#F25C05] mt-1 shrink-0" />
                  <div>
                    <strong className="text-[#F4F6FA] block">Independent Buyer Authority:</strong>
                    The buyer maintains complete discretion over vendor selection. No automated algorithmic lock-in.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#F25C05] mt-1 shrink-0" />
                  <div>
                    <strong className="text-[#F4F6FA] block">Auditable Logistics Trail:</strong>
                    Designated vehicle numbers, driver phone contacts, and formal E-Way bills recorded on every dispatch.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#090B10] border-t border-[#252C38]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-[#171C26] border border-[#252C38] p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#FFFFFF]">
                COMMENCE YOUR REQUIREMENT
              </h2>
              <p className="text-xs sm:text-sm text-[#C5CAD3]">
                Submit your project specifications or Bill of Quantities to receive itemized commercial bids from verified Gujarat distributors.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 font-mono text-xs shrink-0">
              <Link
                href="/rfq/new"
                className="px-8 py-4 bg-[#F25C05] hover:bg-[#D94E00] text-[#090B10] font-black uppercase tracking-widest text-center transition-colors"
              >
                POST REQUIREMENT
              </Link>
              <Link
                href="/supplier/register"
                className="px-6 py-4 bg-[#090B10] border border-[#252C38] hover:border-[#858D9B] text-[#F4F6FA] font-bold uppercase tracking-widest text-center transition-colors"
              >
                SUPPLIER REGISTRATION
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
