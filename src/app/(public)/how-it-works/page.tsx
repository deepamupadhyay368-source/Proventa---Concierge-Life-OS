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
  ClipboardList,
  GitCompare,
  Package,
  CreditCard,
  CheckCheck,
} from 'lucide-react';

const THIRTEEN_LIFECYCLE_STAGES = [
  {
    step: '01',
    name: 'Requirement Created',
    party: 'Buyer',
    partyBadge: 'bg-[#536B88] text-[#FFFFFF]',
    icon: ClipboardList,
    description: 'Contractor creates multi-item material requisition with IS specifications, quantities, units, preferred delivery window, and site address.',
    audit: 'Recorded with timestamp, creator userId, draft status, and optional BOQ PDF attachment.',
  },
  {
    step: '02',
    name: 'RFQ Published',
    party: 'Buyer',
    partyBadge: 'bg-[#536B88] text-[#FFFFFF]',
    icon: FileText,
    description: 'Procurement schedule goes live with auto-generated unique reference code (e.g. RFQ-89214). Commercial delivery constraints locked.',
    audit: 'Status transitions to OPEN. Broadcast queue initialized.',
  },
  {
    step: '03',
    name: 'Suppliers Invited',
    party: 'System / Buyer',
    partyBadge: 'bg-[#252B38] text-[#C66A42] border border-[#C66A42]/40',
    icon: Users,
    description: 'Automated category and geographic matching notifies verified regional stockists, or buyer manually invites existing trade vendors.',
    audit: 'Eligible supplier IDs recorded in RFQ ledger. Confidential buyer contact details shielded.',
  },
  {
    step: '04',
    name: 'Quotations Received',
    party: 'Suppliers',
    partyBadge: 'bg-[#C66A42] text-[#FFFFFF]',
    icon: Scale,
    description: 'Suppliers submit itemized rates, applicable GST percentages, transportation freight, validity windows, and payment terms.',
    audit: 'Strict quotation confidentiality enforced. Competitor bids invisible to other suppliers.',
  },
  {
    step: '05',
    name: 'Quotations Evaluated',
    party: 'Buyer',
    partyBadge: 'bg-[#536B88] text-[#FFFFFF]',
    icon: GitCompare,
    description: 'Buyer reviews side-by-side landed cost matrix, price variance, delivery lead times, supplier ratings, and payment term indicators.',
    audit: 'Zero algorithmic forced selection. Buyer retains complete commercial discretion.',
  },
  {
    step: '06',
    name: 'Supplier Selected',
    party: 'Buyer',
    partyBadge: 'bg-[#536B88] text-[#FFFFFF]',
    icon: CheckCircle2,
    description: 'Buyer confirms winning quotation. Atomic database lock prevents duplicate awards or multiple PO generation on the same RFQ.',
    audit: 'HTTP 409 conflict protection against race conditions. Unselected quotations marked rejected.',
  },
  {
    step: '07',
    name: 'Purchase Order Generated',
    party: 'System / Buyer',
    partyBadge: 'bg-[#252B38] text-[#4A7C59] border border-[#4A7C59]/40',
    icon: Package,
    description: 'Legally binding digital Purchase Order (e.g. PO-74912) generated with locked quantities, agreed landed rates, and payment schedule milestones.',
    audit: 'Immutable PO reference linked bidirectionally to parent RFQ and winning quotation.',
  },
  {
    step: '08',
    name: 'Order Confirmed',
    party: 'Supplier',
    partyBadge: 'bg-[#C66A42] text-[#FFFFFF]',
    icon: ShieldCheck,
    description: 'Awarded supplier formally acknowledges order commitments, allocates inventory at stockyard, and schedules vehicle loading.',
    audit: 'Order deliveryStatus transitions from ORDER_CONFIRMED to PROCESSING.',
  },
  {
    step: '09',
    name: 'Material Dispatched',
    party: 'Supplier',
    partyBadge: 'bg-[#C66A42] text-[#FFFFFF]',
    icon: Truck,
    description: 'Consignment leaves yard. Supplier enters assigned vehicle registration number, driver name, phone number, and E-Way bill reference.',
    audit: 'Delivery status updated to DISPATCHED / IN_TRANSIT. GPS milestones and dispatch timestamp logged.',
  },
  {
    step: '10',
    name: 'Material Delivered',
    party: 'Both Parties',
    partyBadge: 'bg-[#191B20] text-[#FFFFFF] border border-[#414957]',
    icon: CheckCheck,
    description: 'Vehicle arrives at site. Weighbridge slip uploaded, physical quantity verified against PO item schedule, and site gate-pass signed.',
    audit: 'Status transitions to DELIVERED. Shortage/damage exception reporting enabled if variances exist.',
  },
  {
    step: '11',
    name: 'Invoice Recorded',
    party: 'Supplier',
    partyBadge: 'bg-[#C66A42] text-[#FFFFFF]',
    icon: FileText,
    description: 'Supplier issues formal commercial tax invoice linked to PO. Automated contractual payment countdown engine calculates due date.',
    audit: 'Prisma CommercialInvoice entry generated with BigInt precision monetary ledger arithmetic.',
  },
  {
    step: '12',
    name: 'Payment Status Updated',
    party: 'Buyer',
    partyBadge: 'bg-[#536B88] text-[#FFFFFF]',
    icon: CreditCard,
    description: 'Buyer records RTGS/NEFT payment with bank UTR number. Dual counterparty verification required before clearing balance.',
    audit: 'Full audit trail with actor ID, timestamp, previous balance, and new outstanding exposure recorded.',
  },
  {
    step: '13',
    name: 'Transaction Completed',
    party: 'Both Parties',
    partyBadge: 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40',
    icon: CheckCircle2,
    description: 'Commercial invoice fully settled, counterparty confirmed, and delivery confirmed. Verified transaction feeds into dual Payment Integrity Score.',
    audit: 'Transaction archived. Verified transaction depth and on-time score metrics recalculated.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans">
      {/* Banner */}
      <section className="bg-[#191B20] border-b border-[#414957] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#303746] border border-[#414957] text-xs font-mono text-[#C66A42] uppercase tracking-wider font-semibold rounded-sm">
            <span>OPERATIONAL BLUEPRINT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading max-w-4xl">
            13-Stage End-to-End Procurement Lifecycle
          </h1>
          <p className="text-sm sm:text-base text-[#A8ADB7] max-w-3xl leading-relaxed">
            From technical requirement creation to final bank settlement, every transaction in PROVENTA maintains complete audit trails, counterparty verification, and strict commercial confidentiality.
          </p>
        </div>
      </section>

      {/* Main 13-Stage Timeline */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
          <div className="space-y-4">
            {THIRTEEN_LIFECYCLE_STAGES.map((st) => {
              const IconComp = st.icon;
              return (
                <div
                  key={st.step}
                  className="bg-[#303746] border border-[#414957] hover:border-[#536B88] p-6 rounded-sm transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 bg-[#191B20] border border-[#414957] text-[#C66A42] font-mono font-black text-sm flex items-center justify-center shrink-0 rounded-sm">
                      {st.step}
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-heading font-black text-lg uppercase text-[#FFFFFF]">
                          {st.name}
                        </h3>
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${st.partyBadge}`}>
                          {st.party}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#F1F2F4] leading-relaxed">
                        {st.description}
                      </p>

                      <div className="text-[11px] font-mono text-[#A8ADB7] pt-1">
                        <strong className="text-[#536B88]">Audit &amp; System Record:</strong> {st.audit}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 lg:pl-6 lg:border-l lg:border-[#414957]/60">
                    <IconComp className="w-6 h-6 text-[#536B88]" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Row */}
          <div className="p-8 sm:p-12 bg-[#191B20] border border-[#414957] rounded-sm text-center space-y-6">
            <h2 className="font-heading text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF]">
              Ready to Streamline Your Construction Procurement?
            </h2>
            <p className="text-xs sm:text-sm text-[#A8ADB7] max-w-xl mx-auto">
              Create your account in under 2 minutes. Free onboarding for contractors and certified building material stockists.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up?role=buyer"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm shadow-sm"
              >
                <span>Register as a Buyer</span>
              </Link>
              <Link
                href="/sign-up?role=supplier"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#303746] hover:bg-[#252B38] border border-[#536B88] text-[#F1F2F4] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm"
              >
                <span>Register as a Supplier</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
