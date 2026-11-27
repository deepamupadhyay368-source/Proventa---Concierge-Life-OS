import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  FileSpreadsheet,
  Scale,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ClipboardCheck,
  BarChart3,
  Layers,
  Lock,
} from 'lucide-react';

const LIFECYCLE_STAGES = [
  '01. Requirement',
  '02. Planning',
  '03. RFQ Creation',
  '04. Supplier Discovery',
  '05. Invitations',
  '06. Quotations',
  '07. Landed-Cost Comparison',
  '08. Technical Evaluation',
  '09. Multi-Level Approval',
  '10. Protected Award',
  '11. Purchase Order',
  '12. Order Confirmation',
  '13. Dispatch',
  '14. Delivery & GRN',
  '15. Quality Inspection',
  '16. Invoice Upload',
  '17. 3-Way Reconciliation',
  '18. Procurement Analytics',
];

const MATERIAL_DIVISIONS = [
  {
    division: 'Civil & Structural',
    items: ['TMT Steel (Fe-500D / Fe-550D)', 'Structural Steel', 'OPC / PPC Cement', 'Ready-Mix Concrete (RMC)', 'River & M-Sand', 'Aggregates, AAC Blocks & Waterproofing'],
  },
  {
    division: 'Electrical Systems',
    items: ['Armoured & FRLS Cables', 'Building Wires', 'LT / HT Switchgear', 'Distribution Panels', 'PVC & GI Conduits', 'Commercial Lighting'],
  },
  {
    division: 'Plumbing & MEP',
    items: ['CPVC, UPVC & SWR Pipes', 'Industrial Fittings & Valves', 'Submersible & Booster Pumps', 'Sanitaryware & Fixtures'],
  },
  {
    division: 'Finishing & Site Ops',
    items: ['Vitrified Tiles & Natural Stone', 'Architectural Paints & Coatings', 'Doors, Windows & Hardware', 'Site Safety & Construction Equipment'],
  },
];

export default function ConstructionProcurementHomePage() {
  return (
    <div className="font-sans text-[#172B3A]">
      {/* 1. INDUSTRIAL CORPORATE HERO */}
      <section className="bg-[#172B3A] text-white border-b border-[#292F3D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 border border-[#C9A45B]/40 bg-[#292F3D] px-3 py-1.5 rounded-xs">
                <span className="w-2 h-2 bg-[#0F6B50]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#C9A45B]">
                  Ahmedabad &bull; Gandhinagar &bull; Gujarat Construction Markets
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-white">
                Source better. Compare smarter. Procure with confidence.
              </h1>

              <p className="text-base sm:text-lg text-[#C5CFD8] max-w-2xl leading-relaxed">
                PROVENTA is the construction procurement intelligence and execution infrastructure for real estate developers, EPC contractors, and authorised building material suppliers. Standardise RFQs, compare landed costs like-for-like, enforce approval controls, and reconcile deliveries with audit-ready precision.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/buyer/dashboard"
                  className="px-6 py-3 bg-[#0F6B50] hover:bg-[#0C5842] text-white text-xs font-semibold uppercase tracking-[0.1em] rounded-xs transition-colors inline-flex items-center gap-2"
                >
                  <span>Open Buyer Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/supplier/register"
                  className="px-6 py-3 bg-[#292F3D] hover:bg-[#343C4E] border border-[#C9A45B]/50 text-white text-xs font-semibold uppercase tracking-[0.1em] rounded-xs transition-colors"
                >
                  Register as Supplier
                </Link>
                <Link
                  href="/pilot/pacifica"
                  className="px-5 py-3 text-[#C9A45B] hover:text-white text-xs font-mono uppercase tracking-[0.12em] underline underline-offset-4 transition-colors"
                >
                  Institutional Pilot Mode &rarr;
                </Link>
              </div>

              <div className="pt-6 border-t border-[#292F3D] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#C9A45B] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Specification-Locked RFQs</div>
                    <div className="text-[#9AA7B4] mt-0.5">No apples-to-oranges price comparisons</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-[#C9A45B] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Tenant-Isolated Governance</div>
                    <div className="text-[#9AA7B4] mt-0.5">Private supplier pricing &amp; role approvals</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <ClipboardCheck className="w-4 h-4 text-[#C9A45B] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">3-Way Reconciliation</div>
                    <div className="text-[#9AA7B4] mt-0.5">PO + Goods Receipt + Supplier Invoice</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Realistic Industrial Construction Photography */}
            <div className="lg:col-span-5 space-y-2.5">
              <div className="relative aspect-[4/3] w-full border border-[#292F3D] bg-[#292F3D] overflow-hidden rounded-xs">
                <Image
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80"
                  alt="Structural steel and concrete construction site operations"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-3 left-3 bg-[#172B3A]/95 border border-[#C9A45B]/40 text-white px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.14em]">
                  Commercial Construction Supply Chain
                </div>
              </div>
              <p className="text-[11px] font-mono text-[#9AA7B4] text-right">
                Built for Real Estate Developers, EPC Contractors &amp; Authorised Material Distributors
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. END-TO-END 18-STAGE LIFECYCLE */}
      <section className="bg-white border-b border-[#D5DCE2] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E9ECEF] pb-5">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#0F6B50] font-semibold">
                Complete Commercial Lifecycle
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#172B3A] mt-1">
                One auditable workflow from site requirement to payment reconciliation
              </h2>
            </div>
            <Link
              href="/rfq/new"
              className="text-xs font-semibold uppercase tracking-[0.1em] text-[#172B3A] hover:text-[#0F6B50] inline-flex items-center gap-1.5"
            >
              <span>Launch New RFQ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {LIFECYCLE_STAGES.map((stage) => (
              <div
                key={stage}
                className="p-3 bg-[#F3F5F7] border border-[#D5DCE2] text-xs font-medium text-[#292F3D] rounded-xs"
              >
                {stage}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE PLATFORM CAPABILITIES */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-2xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#0F6B50] font-semibold">
            Enterprise Procurement Infrastructure
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#172B3A] mt-1">
            Engineered for procurement heads, project engineers, and finance controllers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-[#D5DCE2] p-6 space-y-3 rounded-xs">
            <FileSpreadsheet className="w-5 h-5 text-[#0F6B50]" />
            <h3 className="text-base font-bold text-[#172B3A]">Structured RFQ Engine</h3>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              Convert approved project requirements and BOQs into multi-line RFQs with locked technical specifications, delivery schedules, deadline policies, and full revision audit logs.
            </p>
            <Link href="/buyer/rfqs" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F6B50] pt-1">
              <span>Manage RFQs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-[#D5DCE2] p-6 space-y-3 rounded-xs">
            <Scale className="w-5 h-5 text-[#0F6B50]" />
            <h3 className="text-base font-bold text-[#172B3A]">Intelligent Comparison Centre</h3>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              Compare quotations strictly like-for-like across base rate, GST, freight, loading, unloading, insurance, and discounts using integer paise precision. Material specification deviations are flagged explicitly.
            </p>
            <Link href="/buyer/comparison" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F6B50] pt-1">
              <span>Open Comparison Centre</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-[#D5DCE2] p-6 space-y-3 rounded-xs">
            <CheckCircle2 className="w-5 h-5 text-[#0F6B50]" />
            <h3 className="text-base font-bold text-[#172B3A]">Approval &amp; Protected Award Control</h3>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              Enforce separation of duties across Procurement, Project Head, and Finance approvers. Awards execute inside atomic database transactions to eliminate duplicate POs or concurrent race conditions.
            </p>
            <Link href="/buyer/approvals" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F6B50] pt-1">
              <span>Review Approval Workflows</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-[#D5DCE2] p-6 space-y-3 rounded-xs">
            <Truck className="w-5 h-5 text-[#0F6B50]" />
            <h3 className="text-base font-bold text-[#172B3A]">Dispatch, GRN &amp; 3-Way Matching</h3>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              Track vehicle dispatches, e-way bills, partial site deliveries, and Goods Receipt Notes. Automatically flag quantity shortages or rate discrepancies across PO, GRN, and Supplier Invoice.
            </p>
            <Link href="/buyer/deliveries" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F6B50] pt-1">
              <span>Track Site Deliveries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-[#D5DCE2] p-6 space-y-3 rounded-xs">
            <BarChart3 className="w-5 h-5 text-[#0F6B50]" />
            <h3 className="text-base font-bold text-[#172B3A]">Procurement Savings Intelligence</h3>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              Track potential quotation savings separately from verified realised savings linked to approved purchase orders and delivered invoices, with full source and sample-size disclosures.
            </p>
            <Link href="/buyer/analytics" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F6B50] pt-1">
              <span>View Savings Intelligence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-[#D5DCE2] p-6 space-y-3 rounded-xs">
            <Building2 className="w-5 h-5 text-[#0F6B50]" />
            <h3 className="text-base font-bold text-[#172B3A]">Verified Supplier Network</h3>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              Discover manufacturers, authorised distributors, and regional dealers with transparent GSTIN verification status, brand authorisations, service corridors, and documented delivery history.
            </p>
            <Link href="/buyer/discovery" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F6B50] pt-1">
              <span>Explore Supplier Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. MATERIAL TAXONOMY OVERVIEW */}
      <section className="bg-white border-y border-[#D5DCE2] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#0F6B50] font-semibold">
                Structured Material Taxonomy
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#172B3A] mt-1">
                Technical specifications built for Indian construction standards
              </h2>
            </div>
            <Link
              href="/buyer/catalogue"
              className="text-xs font-semibold uppercase tracking-[0.1em] text-[#172B3A] hover:text-[#0F6B50] inline-flex items-center gap-1.5"
            >
              <span>Inspect Material Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {MATERIAL_DIVISIONS.map((div) => (
              <div key={div.division} className="border border-[#D5DCE2] bg-[#F3F5F7] p-5 space-y-3 rounded-xs">
                <div className="flex items-center gap-2 border-b border-[#D5DCE2] pb-2.5">
                  <Layers className="w-4 h-4 text-[#0F6B50]" />
                  <h3 className="text-sm font-bold text-[#172B3A]">{div.division}</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-[#292F3D]">
                  {div.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-[#C9A45B] font-bold">&bull;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. INSTITUTIONAL PILOT CALLOUT */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#172B3A] text-white border border-[#292F3D] p-8 sm:p-12 rounded-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#C9A45B] font-semibold">
              Enterprise Developer Onboarding
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Evaluate PROVENTA with a single-project institutional pilot
            </h2>
            <p className="text-sm text-[#C5CFD8] leading-relaxed">
              Run one active project and one material category — such as TMT Steel or Cement — through our full RFQ, landed-cost comparison, approval, PO, and delivery workflow, complete with a transparent Procurement Savings Assessment Report.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/pilot/pacifica"
              className="px-6 py-3 bg-[#C9A45B] hover:bg-[#B89248] text-[#172B3A] text-xs font-bold uppercase tracking-[0.1em] rounded-xs transition-colors"
            >
              View Institutional Pilot
            </Link>
            <Link
              href="/for-buyers"
              className="px-6 py-3 border border-[#C5CFD8]/40 hover:border-white text-white text-xs font-semibold uppercase tracking-[0.1em] rounded-xs transition-colors"
            >
              For Buyer Teams
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
