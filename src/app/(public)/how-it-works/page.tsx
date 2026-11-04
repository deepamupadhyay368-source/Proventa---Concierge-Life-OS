import Link from 'next/link';
import {
  FileSpreadsheet,
  Users,
  Scale,
  CheckCircle2,
  Truck,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Clock,
  Layers,
  MapPin,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

const DETAILED_STEPS = [
  {
    step: '01',
    title: 'Create Requirement (RFQ)',
    subtitle: 'Standardized Multi-Item Procurement',
    code: 'STEP 1 · REQUIRE',
    badge: 'RFQ-XXXXX',
    icon: FileSpreadsheet,
    overview:
      'Buyers, contractors, or developers post a structured requirement specifying material grades, quantities, standard units of measurement, delivery location, and required dates.',
    deliverables: [
      'Multi-material item schedule (e.g. 50 MT TMT Steel + 1,200 bags Cement in one RFQ)',
      'Standardized units: Bags, MT, Kilograms, Cu.ft, Cu.m, Sq.ft, Pieces (Nos), Boxes, Litres',
      'BOQ & technical specification PDF / Excel document attachments',
      'Site delivery address with vehicle access specifications (10-wheeler, Tata Ace, Transit Mixer)',
      'Unique auto-generated RFQ ID (e.g., RFQ-74102) with privacy-protected buyer contact',
    ],
  },
  {
    step: '02',
    title: 'Invite Verified Suppliers',
    subtitle: 'Automated Category & Geographic Matching',
    code: 'STEP 2 · INVITE',
    badge: '100% Verified',
    icon: Users,
    overview:
      'The PROVENTA matching engine immediately notifies relevant verified distributors, stockists, and manufacturers located within the delivery zone across Ahmedabad and Gujarat.',
    deliverables: [
      'Matching by primary category (Building Materials, Electrical, Plumbing, Tiles, Finishing, Doors/Windows)',
      'Geographic filtering matching active stockyards in Odhav, Changodar, Sanand, Sola, Bopal, etc.',
      'Manual admin invitation override facility for specialized or high-tonnage institutional tenders',
      'Buyer contact privacy: Supplier sees project site zone, not raw phone numbers until order confirmation',
    ],
  },
  {
    step: '03',
    title: 'Receive Itemized Quotations',
    subtitle: 'Transparent Unit Pricing & Commercial Terms',
    code: 'STEP 3 · QUOTE',
    badge: 'Full Line Items',
    icon: Scale,
    overview:
      'Suppliers submit formal, binding quotations detailing item-level rates, applicable GST percentages, transportation freight, validity windows, and payment milestones.',
    deliverables: [
      'Itemized unit price and line-item totals (no hidden surprises)',
      'GST break-up (18% for steel/hardware, 28% for cement/chemicals)',
      'Explicit delivery / freight charges and bulk order discounts',
      'Guaranteed delivery timeline and quotation validity period (e.g., valid for 7 days)',
      'Mill test certificates, batch reports, and manufacturer warranty documentation',
      'Supplier revision capability before buyer selection',
    ],
  },
  {
    step: '04',
    title: 'Compare & Select Supplier',
    subtitle: 'Side-by-Side Decision Matrix',
    code: 'STEP 4 · COMPARE',
    badge: 'Buyer Confirms',
    icon: CheckCircle2,
    overview:
      'Buyers view all received quotes in an apples-to-apples comparison matrix. PROVENTA enforces explicit buyer confirmation—no supplier is ever chosen automatically.',
    deliverables: [
      'Total landed cost comparison highlighting lowest prices and freight terms',
      'Lead time and promised delivery date comparison',
      'Supplier credibility profile: GST verification badge, completed deliveries count, and star rating',
      'Explicit selection confirmation dialog preventing accidental order placement',
      'Automatic polite notification to non-selected bidders upon award',
    ],
  },
  {
    step: '05',
    title: 'Coordinate Delivery & Transit',
    subtitle: 'Purchase Order & 7-Stage Milestone Tracking',
    code: 'STEP 5 · DELIVER',
    badge: 'PO-XXXXX',
    icon: Truck,
    overview:
      'Upon quotation selection, an official Purchase Order is generated. The supplier enters dispatch and transporter details, and tracking updates progress through 7 distinct delivery stages.',
    deliverables: [
      'Official Purchase Order generation (e.g., PO-58219) with contractual terms',
      'Dispatch payload: Vehicle registration number, vehicle type, driver name & direct phone number',
      'Transporter company name and government E-Way Bill number',
      '7 Sequential Delivery Stages: ORDER_CONFIRMED → PROCESSING → READY_FOR_DISPATCH → DISPATCHED → IN_TRANSIT → DELIVERED → COMPLETED',
      'Real-time status notes and automated SMS/WhatsApp alerts to the site supervisor',
    ],
  },
  {
    step: '06',
    title: 'Confirm Physical Receipt & Complete',
    subtitle: 'Physical Verification, Sign-Off & Ratings',
    code: 'STEP 6 · COMPLETE',
    badge: 'Closed PO',
    icon: ShieldCheck,
    overview:
      'The buyer or site engineer physically inspects the delivered materials upon truck arrival, records delivered quantities, logs any damages or shortages, submits proof photos, and closes the transaction.',
    deliverables: [
      'Delivered quantity verification against ordered BOQ count',
      'Shortage and transit damage incident logging with photo uploads',
      'Actual physical delivery timestamp recording',
      '1 to 5 star rating and verified commercial review for the supplier',
      'Permanent encrypted transaction ledger and accounting audit trail for corporate tax records',
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans selection:bg-[#F25C05] selection:text-white">
      {/* Header Banner */}
      <section className="border-b border-[#252C38] bg-gradient-to-b from-[#171C26] to-[#090B10] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#090B10] border border-[#252C38] rounded-full text-xs font-mono text-[#F25C05]">
            <span className="w-2 h-2 rounded-full bg-[#F25C05]" />
            <span>OPERATIONAL BLUEPRINT</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading leading-tight max-w-4xl">
            How Construction Procurement Works on <span className="text-[#F25C05]">PROVENTA</span>
          </h1>
          <p className="text-base sm:text-lg text-[#C5CAD3] max-w-3xl leading-relaxed">
            The end-to-end 6-step workflow engineered to eliminate material delays, speculative price inflations, and unverified broker networks in India&apos;s construction ecosystem.
          </p>
        </div>
      </section>

      {/* Steps Breakdown */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          {DETAILED_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="bg-[#171C26] border border-[#252C38] rounded-xs p-8 lg:p-10 hover:border-[#F25C05]/60 transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left: Step Info */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs uppercase tracking-widest text-[#F25C05] font-bold">
                        {step.code}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-0.5 bg-[#090B10] border border-[#252C38] text-[#858D9B] rounded-xs">
                        {step.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#090B10] border border-[#252C38] flex items-center justify-center text-[#F25C05]">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-mono text-2xl font-black text-[#F25C05]">{step.step}</div>
                        <h2 className="font-heading font-black text-xl uppercase tracking-tight text-[#FFFFFF]">
                          {step.title}
                        </h2>
                      </div>
                    </div>

                    <p className="text-sm font-mono text-[#C5CAD3] font-medium">
                      {step.subtitle}
                    </p>

                    <p className="text-sm text-[#C5CAD3] leading-relaxed">
                      {step.overview}
                    </p>
                  </div>

                  {/* Right: Deliverables List */}
                  <div className="lg:col-span-7 bg-[#090B10] border border-[#252C38] p-6 lg:p-8 rounded-xs space-y-4">
                    <div className="font-mono text-xs uppercase tracking-wider text-[#858D9B]">
                      Key Specifications & Platform Outputs
                    </div>
                    <ul className="space-y-3 text-sm text-[#C5CAD3]">
                      {step.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[#F25C05] shrink-0 mt-0.5" />
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

      {/* CTA Section */}
      <section className="py-20 bg-[#171C26] border-t border-[#252C38] text-center">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
            Experience the Streamlined Procurement Flow
          </h2>
          <p className="text-sm sm:text-base text-[#C5CAD3] max-w-2xl mx-auto">
            Ready to post your construction bill of quantities or bid on active commercial requirements in Ahmedabad?
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/rfq/new"
              className="w-full sm:w-auto px-8 py-4 bg-[#F25C05] hover:bg-[#D94E00] text-white font-bold text-sm tracking-wider uppercase rounded-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Post Requirement (RFQ)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/supplier/register"
              className="w-full sm:w-auto px-8 py-4 bg-[#090B10] hover:bg-[#1E2430] border border-[#252C38] text-[#F4F6FA] font-bold text-sm tracking-wider uppercase rounded-xs transition-colors"
            >
              <span>Register as Verified Supplier</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
