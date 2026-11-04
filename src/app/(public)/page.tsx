'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  Scale,
  Truck,
  CheckCircle2,
  ArrowUpRight,
  FileCheck,
  Check,
  Layers,
  Network,
  ClipboardList,
  GitCompare,
  FileText,
} from 'lucide-react';

const CAPABILITIES = [
  {
    num: '01',
    title: 'Material sourcing',
    desc: 'Direct mill and authorized dealer procurement across primary steel rebars, structural cement, aggregates and MEP materials.',
    icon: Layers,
  },
  {
    num: '02',
    title: 'Supplier network',
    desc: 'Audited regional network of verified stockists and primary manufacturers with verified active GSTIN and stockyard depots.',
    icon: Network,
  },
  {
    num: '03',
    title: 'Technical BOQ requirements',
    desc: 'Single structured procurement schedule parsing multi-item trade requirements with automated IS specification compliance.',
    icon: ClipboardList,
  },
  {
    num: '04',
    title: 'Quotation comparison',
    desc: 'Side-by-side landed cost matrices comparing basic unit price, applicable GST, freight transport, and supplier delivery lead times.',
    icon: GitCompare,
  },
  {
    num: '05',
    title: 'Purchase order management',
    desc: 'Legally binding digital Purchase Order generation with transparent commercial milestones and supplier confirmation.',
    icon: FileText,
  },
  {
    num: '06',
    title: 'Delivery coordination',
    desc: 'Milestone vehicle dispatch coordination with driver contacts, GPS visibility, weighbridge slips, and on-site digital POD receipt.',
    icon: Truck,
  },
];

const CATEGORIES = [
  {
    slug: 'building-materials',
    name: 'Building materials',
    subtitle: 'Cement, TMT Steel, Sand, Aggregates & AAC Blocks',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=1200&q=80',
    description: 'Bulk supply of OPC/PPC cement and Fe 550D primary steel rebars with mill test certificates.',
    standards: 'IS 1786:2008 · IS 269:2015 · IS 383:2016',
    unit: 'Metric tonnes (MT) / Bags',
  },
  {
    slug: 'electrical',
    name: 'Electrical',
    subtitle: 'Industrial Cables, Switchgear, Conduit & Panels',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    description: 'FR-LSH copper wires, armoured power cables, distribution boards, and modular accessories.',
    standards: 'IS 694:2010 · IS 1554:1988 · IEC 60947',
    unit: 'Metres / Units',
  },
  {
    slug: 'plumbing',
    name: 'Plumbing',
    subtitle: 'CPVC, UPVC, SWR Pipes, Fittings & Commercial Pumps',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    description: 'Pressure-rated piping networks, commercial booster pumps, overhead storage, and drainage fittings.',
    standards: 'IS 15778:2007 · IS 4985:2000 · ASTM D2846',
    unit: 'Running Metres / Pieces',
  },
  {
    slug: 'tiles-flooring',
    name: 'Tiles and flooring',
    subtitle: 'Full-Body Vitrified, Granite Slabs & Kota Stone',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    description: 'Double-charge vitrified floor tiles, commercial wall claddings, polished granite, and tactile pavers.',
    standards: 'IS 15622:2017 · ISO 13006 Group BIa',
    unit: 'Square feet / Boxes',
  },
  {
    slug: 'finishing-materials',
    name: 'Finishing and chemicals',
    subtitle: 'Commercial Waterproofing, Putty & Industrial Epoxy',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
    description: 'Elastomeric membranes, crystalline water repellents, wall putty, and high-traffic floor coatings.',
    standards: 'ASTM C836 · IS 2645:2003 · Green Pro',
    unit: 'Litres / 40kg Bags',
  },
  {
    slug: 'doors-windows',
    name: 'Doors, windows and hardware',
    subtitle: 'UPVC Profiles, Aluminium Systems & Grade 304 Locks',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    description: 'Double-glazed architectural aluminium windows, fire-rated flush doors, and architectural ironmongery.',
    standards: 'IS 1948:1961 · BS 476 Part 22 · EN 12209',
    unit: 'Square Metres / Sets',
  },
];

const WORKFLOW_STEPS = [
  {
    num: '01',
    title: 'Submit requirement',
    desc: 'Specify material grades, quantities, delivery destination and technical schedule.',
  },
  {
    num: '02',
    title: 'Supplier matching',
    desc: 'Broadcast directly to verified regional stockists and primary manufacturers.',
  },
  {
    num: '03',
    title: 'Receive quotations',
    desc: 'Receive formal proposals with itemized rates, GST, freight, and validity.',
  },
  {
    num: '04',
    title: 'Compare offers',
    desc: 'Evaluate side by side on basic rates, landed cost, and promised delivery windows.',
  },
  {
    num: '05',
    title: 'Select supplier',
    desc: 'Confirm winning quotation and issue a legally binding Purchase Order.',
  },
  {
    num: '06',
    title: 'Coordinate delivery',
    desc: 'Track vehicle transit, verify weighbridge slips, and sign off site receipt.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [quickSpec, setQuickSpec] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSpec.trim()) return;
    router.push(`/rfq/new?prompt=${encodeURIComponent(quickSpec)}`);
  };

  return (
    <div className="bg-[#292F3D] text-[#F1F2F4] font-sans">
      {/* 1. CINEMATIC INFRASTRUCTURE HERO */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center border-b border-[#414957] overflow-hidden">
        {/* Full-width authentic infrastructure photograph background with dark navy/slate gradient overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=2400&q=85"
            alt="Large Infrastructure Engineering & Construction"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Authentic Dark Infrastructure Corporate Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#191B20]/95 via-[#292F3D]/90 to-[#292F3D]/75" />
          <div className="absolute inset-0 bg-[#191B20]/40 backdrop-brightness-75" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28 w-full">
          <div className="max-w-3xl space-y-8">
            {/* Small active badge */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-[#191B20]/90 border border-[#414957] text-xs font-mono font-medium text-[#F1F2F4] rounded-sm">
              <span className="w-2 h-2 bg-[#C66A42]" />
              <span>INFRASTRUCTURE PROCUREMENT NETWORK</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-[#FFFFFF] leading-[1.02]">
                CONSTRUCTION PROCUREMENT.<br />
                <span className="text-[#F1F2F4]">BUILT FOR SCALE.</span>
              </h1>
              <p className="text-base sm:text-lg text-[#A8ADB7] max-w-2xl leading-relaxed">
                A smarter procurement network connecting construction buyers, material suppliers and logistics operations through structured sourcing and transparent quotations.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/rfq/new"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm shadow-sm"
              >
                <span>POST A REQUIREMENT</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#303746] hover:bg-[#252B38] border border-[#414957] text-[#F1F2F4] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm"
              >
                <span>EXPLORE OUR PLATFORM</span>
              </Link>
            </div>

            {/* Quick Specification Box */}
            <div className="pt-6 border-t border-[#414957]/80 max-w-2xl">
              <form onSubmit={handleQuickSubmit} className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#A8ADB7]">
                  Quick Material Requirement
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={quickSpec}
                    onChange={(e) => setQuickSpec(e.target.value)}
                    placeholder="e.g. 50 MT Fe 550D TMT Steel, 1000 bags 53G Cement for Ahmedabad site"
                    className="flex-1 bg-[#303746]/90 border border-[#414957] px-4 py-3 text-xs text-[#F1F2F4] placeholder:text-[#A8ADB7] focus:outline-none focus:border-[#536B88] rounded-sm"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#536B88] hover:bg-[#435770] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider shrink-0 transition-colors rounded-sm"
                  >
                    Start RFQ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CENTERED CORPORATE STATEMENT */}
      <section className="py-20 lg:py-24 bg-[#252B38] border-b border-[#414957] text-center">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[#C66A42] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-[#C66A42]" />
            <span>CORPORATE CAPABILITY</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#FFFFFF] leading-tight">
            ENGINEERING BETTER PROCUREMENT.
          </h2>
          <div className="w-16 h-0.5 bg-[#414957] mx-auto" />
          <p className="text-base sm:text-lg text-[#A8ADB7] max-w-2xl mx-auto leading-relaxed">
            PROVENTA connects construction requirements with material suppliers through structured sourcing, transparent quotations and coordinated deliveries.
          </p>
        </div>
      </section>

      {/* 3. OUR PROCUREMENT CAPABILITIES */}
      <section className="py-20 lg:py-28 bg-[#292F3D] border-b border-[#414957]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-14">
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-mono font-medium text-[#536B88] uppercase tracking-wider">
              <span>Section 01 · Infrastructure Operations</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF]">
              Our procurement capabilities
            </h2>
            <p className="text-sm text-[#A8ADB7] leading-relaxed">
              Engineered end-to-end procurement processes built specifically for the rigor, volume, and specifications of industrial construction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#414957] border border-[#414957]">
            {CAPABILITIES.map((c) => {
              const IconComp = c.icon;
              return (
                <div
                  key={c.num}
                  className="bg-[#303746] p-8 sm:p-10 space-y-4 hover:bg-[#252B38] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#C66A42] tracking-wider">
                      {c.num}
                    </span>
                    <IconComp className="w-5 h-5 text-[#536B88]" />
                  </div>
                  <h3 className="font-heading text-lg font-bold uppercase text-[#FFFFFF] tracking-tight">
                    {c.title}
                  </h3>
                  <p className="text-xs text-[#A8ADB7] leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. MATERIAL CATEGORIES */}
      <section className="py-20 lg:py-28 bg-[#252B38] border-b border-[#414957]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="text-xs font-mono font-medium text-[#C66A42] uppercase tracking-wider">
                <span>Section 02 · Certified Materials</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF]">
                Material categories
              </h2>
              <p className="text-sm text-[#A8ADB7]">
                Commercial construction supplies sourced from verified manufacturers, primary producers, and regional stockists.
              </p>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#536B88] hover:text-[#FFFFFF] transition-colors shrink-0"
            >
              <span>View full material catalogue</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.slug}
                className="bg-[#303746] border border-[#414957] flex flex-col justify-between overflow-hidden group hover:border-[#536B88] transition-colors rounded-sm"
              >
                <div>
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#191B20]">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#303746] via-transparent to-transparent opacity-80" />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#C66A42] font-semibold">
                      {cat.standards}
                    </div>
                    <h3 className="font-heading text-xl font-bold uppercase text-[#FFFFFF]">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#A8ADB7] leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-[#414957]/60 mt-4 flex items-center justify-between font-mono text-xs">
                  <span className="text-[#A8ADB7]">{cat.unit}</span>
                  <Link
                    href={`/rfq/new?category=${cat.slug}`}
                    className="inline-flex items-center gap-1 font-bold text-[#536B88] group-hover:text-[#FFFFFF] uppercase text-[11px] transition-colors"
                  >
                    <span>Request Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (CLEAN HORIZONTAL TIMELINE ON DESKTOP) */}
      <section className="py-20 lg:py-28 bg-[#292F3D] border-b border-[#414957]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-mono font-medium text-[#536B88] uppercase tracking-wider">
              <span>Section 03 · Operational Blueprint</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF]">
              How it works
            </h2>
            <p className="text-sm text-[#A8ADB7]">
              Six sequential stages designed to ensure technical compliance, fair competitive rates, and reliable site logistics.
            </p>
          </div>

          {/* Desktop Horizontal Timeline */}
          <div className="hidden lg:grid grid-cols-6 gap-4 relative">
            {/* Timeline top connecting bar */}
            <div className="absolute top-4 left-6 right-6 h-[1px] bg-[#414957] -z-0" />

            {WORKFLOW_STEPS.map((step) => (
              <div key={step.num} className="relative z-10 space-y-4 pr-2">
                <div className="w-8 h-8 bg-[#303746] border border-[#414957] text-[#C66A42] flex items-center justify-center font-mono font-bold text-xs rounded-sm">
                  {step.num}
                </div>
                <h3 className="font-heading text-sm font-bold uppercase text-[#FFFFFF] tracking-tight">
                  {step.title}
                </h3>
                <p className="text-[11px] text-[#A8ADB7] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile / Tablet Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6">
            {WORKFLOW_STEPS.map((step) => (
              <div
                key={step.num}
                className="p-6 bg-[#303746] border border-[#414957] space-y-3 rounded-sm"
              >
                <div className="font-mono text-xl font-black text-[#C66A42]">
                  {step.num}
                </div>
                <h3 className="font-heading text-base font-bold uppercase text-[#FFFFFF] tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs text-[#A8ADB7] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BUILT FOR BOTH SIDES (BUYER & SUPPLIER CAPABILITIES) */}
      <section className="py-20 lg:py-24 bg-[#252B38] border-b border-[#414957]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-mono font-medium text-[#C66A42] uppercase tracking-wider">
              <span>Section 04 · Market Balance</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF]">
              Built for both sides
            </h2>
            <p className="text-sm text-[#A8ADB7]">
              A balanced procurement infrastructure connecting buyers with verified suppliers through clear commercial rules and zero ambiguity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Buyer Benefits */}
            <div className="p-8 sm:p-10 bg-[#303746] border border-[#414957] space-y-6 rounded-sm">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#536B88] font-bold">
                  For Buyers & Contractors
                </span>
                <h3 className="font-heading text-2xl font-black uppercase text-[#FFFFFF]">
                  Buyer Benefits
                </h3>
              </div>

              <ul className="space-y-4">
                {[
                  'One structured requirement across multiple materials and trades',
                  'Multiple competitive supplier quotations in 2 to 4 hours',
                  'Transparent side-by-side comparisons with landed cost breakdown',
                  'Automated purchase order generation with commercial terms',
                  '7-stage milestone delivery tracking from yard to site',
                ].map((b, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-[#F1F2F4]">
                    <div className="w-5 h-5 bg-[#252B38] border border-[#414957] text-[#536B88] flex items-center justify-center shrink-0 mt-0.5 font-bold rounded-sm">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-[#414957]">
                <Link
                  href="/rfq/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#536B88] hover:bg-[#435770] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider transition-colors rounded-sm"
                >
                  <span>Post Buyer Requirement</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Supplier Benefits */}
            <div className="p-8 sm:p-10 bg-[#303746] border border-[#414957] space-y-6 rounded-sm">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#C66A42] font-bold">
                  For Stockists & Dealers
                </span>
                <h3 className="font-heading text-2xl font-black uppercase text-[#FFFFFF]">
                  Supplier Benefits
                </h3>
              </div>

              <ul className="space-y-4">
                {[
                  'Direct access to active, verified contractor and builder requirements',
                  'Structured quotation submissions with itemized rate calculators',
                  'Better business visibility across commercial construction projects',
                  'Streamlined purchase orders and direct delivery coordination',
                ].map((b, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-[#F1F2F4]">
                    <div className="w-5 h-5 bg-[#252B38] border border-[#414957] text-[#C66A42] flex items-center justify-center shrink-0 mt-0.5 font-bold rounded-sm">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-[#414957]">
                <Link
                  href="/supplier/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#191B20] hover:bg-[#252B38] border border-[#414957] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider transition-colors rounded-sm"
                >
                  <span>Register as Verified Supplier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-24 bg-[#191B20] border-b border-[#414957] text-center">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-8">
          <div className="space-y-4">
            <h2 className="font-heading text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#FFFFFF] leading-tight">
              SOURCE BETTER.<br />
              <span className="text-[#C66A42]">BUILD BETTER.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#A8ADB7] max-w-xl mx-auto leading-relaxed">
              Join leading construction firms, civil contractors, and verified material stockists sourcing on PROVENTA.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/rfq/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm shadow-sm"
            >
              <span>Post a Requirement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/supplier/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#303746] hover:bg-[#252B38] border border-[#414957] text-[#F1F2F4] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm"
            >
              <span>Become a Supplier</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
