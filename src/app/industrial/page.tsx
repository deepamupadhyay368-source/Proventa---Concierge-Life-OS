'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Truck,
  Check,
  Layers,
  Network,
  ClipboardList,
  GitCompare,
  FileText,
  AlertCircle,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Search,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  FileSpreadsheet,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { HeroSection } from '@/components/marketing/hero';

// Four-Stage Architectural Procurement Workflow
const FOUR_STAGE_WORKFLOW = [
  {
    step: '01',
    name: 'Submit Requirement',
    icon: ClipboardList,
    description: 'Publish multi-item RFQs with technical BIS specifications, required delivery schedules, site access parameters, and attached BOQ documents.',
    action: 'Create RFQ',
    href: '/rfq/new',
  },
  {
    step: '02',
    name: 'Match Suppliers',
    icon: Search,
    description: 'Broadcast specifications directly to verified regional stockists, primary rolling mills, and authorized distributors with matching inventory.',
    action: 'Explore Network',
    href: '/suppliers',
  },
  {
    step: '03',
    name: 'Compare Quotations',
    icon: GitCompare,
    description: 'Evaluate side-by-side landed cost matrices comparing ex-factory rates, applicable GST, freight logistics, and commercial payment terms.',
    action: 'Compare Offers',
    href: '/how-it-works#comparison',
  },
  {
    step: '04',
    name: 'Award Purchase Order',
    icon: Truck,
    description: 'Issue binding digital Purchase Orders, coordinate dispatches with weighbridge verification, and maintain transparent payment obligations.',
    action: 'Track Orders',
    href: '/buyer/orders',
  },
];

// Curated authentic industrial photography for material categories
const MATERIAL_CATEGORIES = [
  {
    slug: 'steel-metals',
    name: 'Steel & TMT',
    spec: 'IS 1786:2008 · Fe 500D / 550D / 550D CRS',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    description: 'Primary producer TMT rebars (8mm to 36mm), structural MS angles, channels, beams, plates, and binding wire.',
    unit: 'Metric Tonnes (MT)',
  },
  {
    slug: 'cement-concrete',
    name: 'Cement & Concrete',
    spec: 'IS 269:2015 · IS 1489:2015 · OPC 43/53 & PPC',
    image: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80',
    description: 'Factory-direct 50kg bags, bulk tanker bulker supply, and computerized transit-mixer ready-mix concrete (RMC).',
    unit: 'Bags (50kg) / MT',
  },
  {
    slug: 'building-materials',
    name: 'Aggregates & Sand',
    spec: 'IS 383:2016 · 10mm, 20mm & Crushed Sand',
    image: 'https://images.unsplash.com/photo-1617791160505-6f008e1e6703?auto=format&fit=crop&w=800&q=80',
    description: 'Crushed basalt aggregates (10mm, 20mm, 40mm), manufactured sand (M-Sand), washed river sand, and road base.',
    unit: 'Metric Tonnes (MT) / Brass',
  },
  {
    slug: 'pipes-plumbing',
    name: 'Pipes & Drainage',
    spec: 'IS 15778 · IS 4984 · CPVC, UPVC, HDPE & DI',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
    description: 'SDR 11/13.5 CPVC pressure piping, SWR drainage systems, underground HDPE coils, and DI K7/K9 infrastructure lines.',
    unit: 'Running Metres (Rm) / Nos',
  },
  {
    slug: 'electrical-materials',
    name: 'Electrical Materials',
    spec: 'IS 694:2010 · IS 7098 · FRLSH & XLPE',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80',
    description: 'Commercial wiring, copper busbars, LT/HT armoured underground cables, distribution boards, and industrial switchgear.',
    unit: 'Running Metres / Units',
  },
  {
    slug: 'construction-chemicals',
    name: 'Construction Chemicals',
    spec: 'ASTM C836 · IS 2645 · Admixtures & Membranes',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    description: 'High-range water-reducing plasticizers, elastomeric waterproofing, polymer tile adhesives, and structural repair grouts.',
    unit: 'Litres (L) / Bags (25kg)',
  },
  {
    slug: 'building-blocks',
    name: 'Building Blocks & Masonry',
    spec: 'IS 2185 Part 3 · AAC Blocks & Fly Ash Bricks',
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
    description: 'Precision autoclaved aerated concrete (AAC) blocks, structural thin-bed masonry mortars, and fly ash construction bricks.',
    unit: 'Cubic Metres (Cu.m) / Units',
  },
];

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion();
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState(0);

  return (
    <div className="bg-[#FFFFFF] text-[#243447] font-sans">
      {/* SECTION A: HERO WITH 3D ARCHITECTURAL BACKGROUND */}
      <HeroSection />

      {/* SECTION B: PROCUREMENT ECOSYSTEM */}
      <section id="platform" className="py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E2E8EF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl space-y-3 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4F7FA] border border-[#E2E8EF] text-[11px] font-mono text-[#315F91] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-[#315F91]" />
              <span>THE INDUSTRIAL PROCUREMENT ECOSYSTEM</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#243447]">
              Engineered for Industrial Transactions.
            </h2>
            <p className="text-base sm:text-lg text-[#6B7785] leading-relaxed">
              PROVENTA brings clarity, compliance, and structure to complex infrastructure material sourcing across buyers, stockyards, and manufacturers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Buyer Side */}
            <div className="p-8 bg-[#F4F7FA] border border-[#E2E8EF] rounded-xs space-y-6">
              <div className="w-10 h-10 bg-[#315F91] text-white flex items-center justify-center rounded-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-xl font-bold text-[#243447]">For Buyers &amp; Developers</h3>
                <p className="text-sm text-[#6B7785] leading-relaxed">
                  Eliminate manual phone calls, scattered PDFs, and unverified WhatsApp quotations with a structured procurement desk.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-[#243447] pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#315F91]" /> Standardized multi-item BOQs &amp; RFQs
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#315F91]" /> Side-by-side landed cost comparison
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#315F91]" /> Audit-ready digital purchase orders
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#315F91]" /> Site weighbridge &amp; delivery verification
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/sign-up?role=buyer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#315F91] hover:text-[#264B74]"
                >
                  <span>Register as Buyer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Platform Core */}
            <div className="p-8 bg-[#FFFFFF] border-2 border-[#315F91] rounded-xs space-y-6 relative shadow-xs">
              <div className="w-10 h-10 bg-[#315F91] text-white flex items-center justify-center rounded-xs">
                <Network className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <div className="inline-block px-2 py-0.5 bg-[#F4F7FA] text-[#315F91] font-mono text-[10px] font-bold uppercase tracking-wider">
                  Platform Core
                </div>
                <h3 className="font-heading text-xl font-bold text-[#243447]">Unified Procurement Desk</h3>
                <p className="text-sm text-[#6B7785] leading-relaxed">
                  The central bridge connecting commercial requirements with real-time stockyard availability and delivery schedules.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-[#243447] pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#315F91]" /> 100% GST &amp; BIS compliance checks
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#315F91]" /> Strict quotation confidentiality before award
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#315F91]" /> Dynamic landed cost calculation engine
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#315F91]" /> Immutable payment intelligence &amp; scores
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#315F91] hover:text-[#264B74]"
                >
                  <span>Explore Architecture</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Supplier Side */}
            <div className="p-8 bg-[#F4F7FA] border border-[#E2E8EF] rounded-xs space-y-6">
              <div className="w-10 h-10 bg-[#315F91] text-white flex items-center justify-center rounded-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-xl font-bold text-[#243447]">For Suppliers &amp; Mills</h3>
                <p className="text-sm text-[#6B7785] leading-relaxed">
                  Direct access to high-volume commercial RFQs from vetted developers, builders, and infrastructure contractors.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-[#243447] pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#315F91]" /> Direct commercial RFQ invitations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#315F91]" /> Confidential pricing submission tools
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#315F91]" /> Binding digital purchase order tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#315F91]" /> Transparent milestone payment countdowns
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/supplier/register"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#315F91] hover:text-[#264B74]"
                >
                  <span>Register as Supplier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION C: HOW IT WORKS (FOUR ANIMATED STEPS) */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-[#F4F7FA] border-b border-[#E2E8EF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E2E8EF] text-[11px] font-mono text-[#315F91] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-[#315F91]" />
                <span>PROCUREMENT METHODOLOGY</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#243447]">
                How PROVENTA Works.
              </h2>
              <p className="text-base text-[#6B7785] leading-relaxed">
                Four connected milestones transforming material procurement from an informal hassle into an auditable corporate workflow.
              </p>
            </div>
            <Link
              href="/rfq/new"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#315F91] hover:bg-[#264B74] text-white text-xs font-semibold uppercase tracking-wider transition-colors rounded-xs shrink-0 self-start md:self-auto"
            >
              <span>Raise Requirement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FOUR_STAGE_WORKFLOW.map((wf, idx) => {
              const Icon = wf.icon;
              const isSelected = selectedWorkflowStep === idx;
              return (
                <div
                  key={wf.step}
                  onClick={() => setSelectedWorkflowStep(idx)}
                  className={`p-6 sm:p-7 bg-white border transition-all duration-200 cursor-pointer rounded-xs flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#315F91] shadow-sm ring-1 ring-[#315F91]/20'
                      : 'border-[#E2E8EF] hover:border-[#AEBBC6]'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-black text-[#315F91] tracking-tight">
                        {wf.step}
                      </span>
                      <div className="w-8 h-8 rounded-xs bg-[#F4F7FA] text-[#315F91] flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-[#243447]">
                      {wf.name}
                    </h3>
                    <p className="text-xs text-[#6B7785] leading-relaxed">
                      {wf.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-[#E2E8EF] mt-6 flex items-center justify-between text-xs font-semibold text-[#315F91]">
                    <span>{wf.action}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION D: SUPPLIER DISCOVERY & MATERIAL TAXONOMY */}
      <section id="suppliers" className="py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E2E8EF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4F7FA] border border-[#E2E8EF] text-[11px] font-mono text-[#315F91] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-[#315F91]" />
                <span>MATERIAL SOURCING TAXONOMY</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#243447]">
                Commercial Material Categories.
              </h2>
              <p className="text-base text-[#6B7785] leading-relaxed">
                Direct procurement across 7 commercial material domains from primary steel rolling mills, integrated cement plants, and certified regional stockyards.
              </p>
            </div>
            <Link
              href="/suppliers"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-[#E2E8EF] hover:border-[#AEBBC6] text-[#243447] hover:text-[#315F91] text-xs font-semibold uppercase tracking-wider transition-colors rounded-xs shrink-0 self-start md:self-auto"
            >
              <span>Explore Verified Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MATERIAL_CATEGORIES.map((cat) => (
              <div
                key={cat.slug}
                className="group bg-white border border-[#E2E8EF] hover:border-[#AEBBC6] transition-all rounded-xs overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-[#F4F7FA] overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-3 left-4 text-[10px] font-mono font-semibold text-white tracking-widest uppercase bg-black/60 px-2 py-0.5 backdrop-blur-xs">
                      {cat.unit}
                    </span>
                  </div>

                  <div className="p-6 space-y-2">
                    <span className="text-[11px] font-mono text-[#315F91] font-semibold block">
                      {cat.spec}
                    </span>
                    <h3 className="font-heading text-lg font-bold text-[#243447]">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#6B7785] leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <Link
                    href={`/rfq/new?category=${cat.slug}`}
                    className="w-full inline-flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#315F91] group-hover:text-[#264B74] pt-3 border-t border-[#E2E8EF]"
                  >
                    <span>Request Quotation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION E: PROCUREMENT INTELLIGENCE & LANDED COST MATRIX */}
      <section className="py-20 lg:py-28 bg-[#F4F7FA] border-b border-[#E2E8EF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E2E8EF] text-[11px] font-mono text-[#315F91] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-[#315F91]" />
              <span>COMMERCIAL INTELLIGENCE</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#243447]">
              Landed-Cost Quotation Comparison.
            </h2>
            <p className="text-base text-[#6B7785] leading-relaxed">
              Opaque broker markups and hidden freight charges are eliminated through side-by-side landed cost matrices comparing base unit prices, applicable GST rates, freight, payment terms, and delivery schedules.
            </p>
          </div>

          {/* Interactive Illustrated Comparison Matrix Card */}
          <div className="bg-white border border-[#E2E8EF] rounded-xs shadow-xs overflow-hidden">
            <div className="p-6 bg-[#FFFFFF] border-b border-[#E2E8EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-[#6B7785] uppercase tracking-widest">
                  LIVE RFQ COMPARISON PREVIEW • RFQ-2026-AHM-041
                </span>
                <h3 className="font-heading text-lg font-bold text-[#243447]">
                  50 MT Fe 550D TMT Rebars (Sanand Industrial Site)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-1 bg-[#F4F7FA] text-[#315F91] border border-[#E2E8EF] font-semibold">
                  3 Verified Quotations
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F7FA] border-b border-[#E2E8EF] text-[#6B7785] font-mono uppercase text-[11px]">
                    <th className="py-3.5 px-6">Cost Breakdown Parameter</th>
                    <th className="py-3.5 px-6 font-bold text-[#243447]">Supplier A (Ahmedabad Stockyard)</th>
                    <th className="py-3.5 px-6 bg-[#315F91]/5 font-bold text-[#315F91]">
                      Supplier B (Sanand Direct Mill) ★ Best Offer
                    </th>
                    <th className="py-3.5 px-6 font-bold text-[#243447]">Supplier C (Changodar Hub)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8EF]">
                  <tr>
                    <td className="py-3 px-6 font-medium text-[#243447]">Base Unit Rate (per MT)</td>
                    <td className="py-3 px-6 font-mono text-[#243447]">₹52,400</td>
                    <td className="py-3 px-6 font-mono text-[#315F91] font-semibold bg-[#315F91]/5">₹51,800</td>
                    <td className="py-3 px-6 font-mono text-[#243447]">₹52,100</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-6 font-medium text-[#243447]">GST Rate (18%)</td>
                    <td className="py-3 px-6 font-mono text-[#6B7785]">₹9,432 / MT</td>
                    <td className="py-3 px-6 font-mono text-[#315F91] bg-[#315F91]/5">₹9,324 / MT</td>
                    <td className="py-3 px-6 font-mono text-[#6B7785]">₹9,378 / MT</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-6 font-medium text-[#243447]">Freight &amp; Unloading</td>
                    <td className="py-3 px-6 font-mono text-[#6B7785]">₹1,200 / MT</td>
                    <td className="py-3 px-6 font-mono text-[#315F91] font-semibold bg-[#315F91]/5">₹650 / MT (Proximity)</td>
                    <td className="py-3 px-6 font-mono text-[#6B7785]">₹950 / MT</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-6 font-medium text-[#243447]">Commercial Payment Terms</td>
                    <td className="py-3 px-6 text-[#6B7785]">30 Days Credit (PDC)</td>
                    <td className="py-3 px-6 font-medium text-[#315F91] bg-[#315F91]/5">100% Against Weighbridge</td>
                    <td className="py-3 px-6 text-[#6B7785]">50% Advance / 50% Dispatch</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-6 font-medium text-[#243447]">Delivery Lead Time</td>
                    <td className="py-3 px-6 text-[#6B7785]">48 Hours</td>
                    <td className="py-3 px-6 font-medium text-[#315F91] bg-[#315F91]/5">Same Day Dispatch</td>
                    <td className="py-3 px-6 text-[#6B7785]">24 Hours</td>
                  </tr>
                  <tr className="bg-[#F4F7FA] font-bold text-sm">
                    <td className="py-4 px-6 text-[#243447]">Total Landed Cost (50 MT)</td>
                    <td className="py-4 px-6 font-mono text-[#243447]">₹31,51,600</td>
                    <td className="py-4 px-6 font-mono text-[#315F91] text-base bg-[#315F91]/10">
                      ₹30,88,700 <span className="text-[10px] text-[#315F91] block font-normal">Save ₹62,900</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[#243447]">₹31,21,400</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#F4F7FA] border-t border-[#E2E8EF] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7785] gap-3">
              <span>All quotations are cryptographically sealed until buyer deadline expiration.</span>
              <Link
                href="/rfq/new"
                className="inline-flex items-center gap-1.5 font-semibold text-[#315F91] hover:text-[#264B74]"
              >
                <span>Create an RFQ to Compare</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION F: PAYMENT INTELLIGENCE */}
      <section className="py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E2E8EF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl space-y-3 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4F7FA] border border-[#E2E8EF] text-[11px] font-mono text-[#315F91] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-[#315F91]" />
              <span>FINANCIAL GOVERNANCE &amp; TRUST</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#243447]">
              PROVENTA Payment Intelligence.
            </h2>
            <p className="text-base text-[#6B7785] leading-relaxed">
              Payment behaviour made visible. Dual payment behaviour assessments for buyers and suppliers, verified commercial invoice ledgers, and overdue settlement countdowns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Dual Payment Scores */}
            <div className="p-8 bg-[#F4F7FA] border border-[#E2E8EF] rounded-xs space-y-4">
              <div className="w-10 h-10 bg-[#315F91] text-white flex items-center justify-center rounded-xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#243447]">
                Buyer &amp; Supplier Scores (300–900)
              </h3>
              <p className="text-xs text-[#6B7785] leading-relaxed">
                Objective financial reputation scoring based on on-time invoice settlements, partial payment punctuality, and dispute resolution history.
              </p>
              <div className="pt-3 border-t border-[#E2E8EF] font-mono text-xs flex items-center justify-between text-[#243447]">
                <span className="text-[#6B7785]">Prime Commercial Band:</span>
                <span className="font-bold text-[#315F91]">750+ EXCELLENT</span>
              </div>
            </div>

            {/* Feature 2: Central Invoice Ledger */}
            <div className="p-8 bg-[#F4F7FA] border border-[#E2E8EF] rounded-xs space-y-4">
              <div className="w-10 h-10 bg-[#315F91] text-white flex items-center justify-center rounded-xs">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#243447]">
                Live Commercial Invoice Ledger
              </h3>
              <p className="text-xs text-[#6B7785] leading-relaxed">
                Track invoice obligations, milestone schedules, partial payments, and overdue interest automatically calculated per commercial agreement terms.
              </p>
              <div className="pt-3 border-t border-[#E2E8EF] font-mono text-xs flex items-center justify-between text-[#243447]">
                <span className="text-[#6B7785]">Ledger Audit Trail:</span>
                <span className="font-bold text-[#315F91]">IMMUTABLE DUAL-ENTRY</span>
              </div>
            </div>

            {/* Feature 3: Payment Countdowns */}
            <div className="p-8 bg-[#F4F7FA] border border-[#E2E8EF] rounded-xs space-y-4">
              <div className="w-10 h-10 bg-[#315F91] text-white flex items-center justify-center rounded-xs">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#243447]">
                Payment Due Countdowns
              </h3>
              <p className="text-xs text-[#6B7785] leading-relaxed">
                Real-time milestone countdowns prevent accidental defaults. Buyers receive automated reminders before credit terms expire, protecting their score.
              </p>
              <div className="pt-3 border-t border-[#E2E8EF] font-mono text-xs flex items-center justify-between text-[#243447]">
                <span className="text-[#6B7785]">Credit Protection:</span>
                <span className="font-bold text-[#315F91]">ZERO SURPRISE DEFAULTS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION G: FINAL CTA */}
      <section className="py-24 bg-[#F4F7FA] border-b border-[#E2E8EF] relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#E2E8EF] text-xs font-mono text-[#315F91] uppercase tracking-wider shadow-xs">
            <span>GET STARTED WITH PROVENTA</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-[#243447] tracking-tight leading-tight">
            Build better procurement relationships.
          </h2>

          <p className="text-base sm:text-lg text-[#6B7785] max-w-2xl mx-auto leading-relaxed">
            Join leading infrastructure developers, contractors, and verified material suppliers streamlining procurement on PROVENTA.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/rfq/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#315F91] hover:bg-[#264B74] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-xs"
            >
              <span>Start Procuring</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-[#FFFFFF] border border-[#E2E8EF] hover:border-[#AEBBC6] text-[#243447] font-semibold text-xs uppercase tracking-wider transition-all shadow-xs"
            >
              <span>Join PROVENTA</span>
            </Link>
          </div>

          <div className="pt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[#6B7785]">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#315F91]" />
              <span>Direct Verified Suppliers</span>
            </div>
            <span className="text-[#AEBBC6]">•</span>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#315F91]" />
              <span>Transparent Landed Costs</span>
            </div>
            <span className="text-[#AEBBC6]">•</span>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#315F91]" />
              <span>Tracked Delivery Logistics</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
