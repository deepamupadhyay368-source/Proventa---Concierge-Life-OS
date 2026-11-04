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
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans">
      {/* Header Banner */}
      <section className="border-b border-[#414957] bg-[#252B38] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#191B20] border border-[#414957] text-xs font-mono text-[#C66A42] uppercase tracking-wider font-semibold rounded-sm">
            <span>OPERATIONAL BLUEPRINT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#FFFFFF] max-w-4xl font-heading leading-tight">
            HOW INDUSTRIAL PROCUREMENT WORKS ON PROVENTA
          </h1>
          <p className="text-sm sm:text-base text-[#A8ADB7] max-w-3xl leading-relaxed">
            A structured six-step workflow engineered to eliminate broker markups, inaccurate material grades, and uncoordinated site deliveries across India&apos;s construction industry.
          </p>
        </div>
      </section>

      {/* Six Steps Breakdown */}
      <section className="py-20 bg-[#292F3D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
          {DETAILED_STEPS.map((step) => {
            return (
              <div
                key={step.step}
                className="bg-[#303746] border border-[#414957] p-8 lg:p-10 rounded-sm shadow-sm hover:border-[#536B88] transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left: Step Info */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#414957] pb-3">
                      <span className="font-mono text-xs uppercase tracking-widest text-[#C66A42] font-bold">
                        {step.code}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#252B38] border border-[#414957] text-[#F1F2F4] rounded-sm">
                        {step.badge}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-4 pt-1">
                      <span className="font-mono text-3xl font-black text-[#536B88]">{step.step}</span>
                      <h2 className="font-heading font-black text-xl uppercase tracking-wide text-[#FFFFFF]">
                        {step.title}
                      </h2>
                    </div>

                    <div className="text-xs font-mono text-[#A8ADB7] uppercase tracking-wider font-medium">
                      {step.subtitle}
                    </div>

                    <p className="text-xs sm:text-sm text-[#A8ADB7] leading-relaxed pt-1">
                      {step.overview}
                    </p>
                  </div>

                  {/* Right: Deliverables List */}
                  <div className="lg:col-span-7 bg-[#252B38] border border-[#414957] p-6 lg:p-8 space-y-4 rounded-sm">
                    <div className="font-mono text-xs uppercase tracking-wider text-[#F1F2F4] font-bold pb-2 border-b border-[#414957]">
                      OPERATIONAL PROTOCOLS & OUTPUTS
                    </div>
                    <ul className="space-y-3 text-xs sm:text-sm text-[#F1F2F4]">
                      {step.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-[#536B88] shrink-0 mt-0.5" />
                          <span className="leading-relaxed text-[#A8ADB7]">{item}</span>
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
      <section id="about" className="py-20 lg:py-28 bg-[#252B38] border-t border-[#414957]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="pb-8 border-b border-[#414957]">
            <div className="font-mono text-xs uppercase tracking-widest text-[#C66A42] mb-2 font-bold">
              ABOUT PROVENTA
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              ENTERPRISE PROCUREMENT INFRASTRUCTURE
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-6 text-sm text-[#A8ADB7] leading-relaxed">
              <p>
                PROVENTA is an industrial procurement platform built to establish operational transparency, competitive bidding, and reliable site logistics for India&apos;s construction and infrastructure sector.
              </p>
              <p>
                Founded to solve chronic issues in commercial procurement—speculative dealer markups, unverified product origins, uncoordinated site delivery, and opaque billing—PROVENTA provides builders, developers, contractors, and institutional buyers with a direct, digitized conduit to verified material distributors and manufacturers.
              </p>
              <p>
                Operating with primary density across Ahmedabad, Gandhinagar, Vadodara, Surat, and the broader Gujarat industrial belt, PROVENTA maintains strict supplier vetting protocols including physical stockyard audits, active GST registration checks, and authorized dealer certificate validations.
              </p>
            </div>

            <div className="lg:col-span-5 bg-[#303746] border border-[#414957] p-8 space-y-6 font-mono text-xs rounded-sm">
              <div className="border-b border-[#414957] pb-3 font-bold text-xs text-[#FFFFFF] uppercase">
                OPERATIONAL COMMITMENTS
              </div>
              <div className="space-y-4 text-[#F1F2F4]">
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#C66A42] mt-1 shrink-0" />
                  <div>
                    <strong className="text-[#FFFFFF] block">Direct Commercial Pricing:</strong>
                    <span className="text-[#A8ADB7]">Quotations reflect genuine wholesale mill and distributor prices without intermediary brokerage.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#536B88] mt-1 shrink-0" />
                  <div>
                    <strong className="text-[#FFFFFF] block">Independent Buyer Authority:</strong>
                    <span className="text-[#A8ADB7]">The buyer maintains complete discretion over vendor selection. No automated algorithmic lock-in.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#C66A42] mt-1 shrink-0" />
                  <div>
                    <strong className="text-[#FFFFFF] block">Auditable Logistics Trail:</strong>
                    <span className="text-[#A8ADB7]">Designated vehicle numbers, driver phone contacts, and formal E-Way bills recorded on every dispatch.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#191B20] border-t border-[#414957]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-[#303746] border border-[#414957] p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 rounded-sm">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#FFFFFF] font-heading">
                COMMENCE YOUR REQUIREMENT
              </h2>
              <p className="text-xs sm:text-sm text-[#A8ADB7]">
                Submit your project specifications or Bill of Quantities to receive itemized commercial bids from verified distributors.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 font-mono text-xs shrink-0">
              <Link
                href="/rfq/new"
                className="px-8 py-4 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold uppercase tracking-wider text-center transition-colors rounded-sm shadow-sm"
              >
                POST A REQUIREMENT
              </Link>
              <Link
                href="/supplier/register"
                className="px-6 py-4 bg-[#252B38] border border-[#414957] hover:bg-[#191B20] text-[#F1F2F4] font-bold uppercase tracking-wider text-center transition-colors rounded-sm"
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
