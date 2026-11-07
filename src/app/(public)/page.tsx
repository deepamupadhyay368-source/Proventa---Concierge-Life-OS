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
    slug: 'steel-metals',
    name: 'Steel & Metals',
    subtitle: 'Primary Fe 500D / 550D TMT Rebars, Structural Beams & Plates',
    image: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=1200&q=80',
    description: 'Bulk mill dispatch of primary TMT steel bars, structural sections, MS plates, and binding wire.',
    standards: 'IS 1786:2008 · IS 2062:2011 · IS 280:2006',
    unit: 'Metric tonnes (MT)',
  },
  {
    slug: 'cement-concrete',
    name: 'Cement & Concrete',
    subtitle: 'OPC 43/53, PPC Cement, Bulk Bulkers & Transit RMC',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=1200&q=80',
    description: 'Fresh factory direct 50kg bags, bulk tankers, and computerized transit-mixer ready-mix concrete.',
    standards: 'IS 269:2015 · IS 1489:2015 · IS 4926:2003',
    unit: 'Bags / Metric tonnes (MT)',
  },
  {
    slug: 'building-materials',
    name: 'Building Materials',
    subtitle: 'AAC Lightweight Blocks, Bricks, Sand & Basalt Aggregates',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
    description: 'Precision AAC masonry blocks, fly-ash bricks, washed river sand, and crushed blue metal aggregates.',
    standards: 'IS 2185 Part 3 · IS 1077 · IS 383:2016',
    unit: 'Cubic metres (Cu.m) / MT',
  },
  {
    slug: 'pipes-plumbing',
    name: 'Pipes & Plumbing',
    subtitle: 'CPVC, UPVC, HDPE, SWR & Heavy MS Piping Systems',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    description: 'Pressure-rated piping networks, commercial valves, drainage systems, and water storage solutions.',
    standards: 'IS 15778 · IS 4984 · IS 4985 · ASTM D2846',
    unit: 'Running metres / Pieces',
  },
  {
    slug: 'electrical-materials',
    name: 'Electrical Materials',
    subtitle: 'FRLSH Copper Wires, LT/HT Armoured Cables & Switchgear',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    description: 'Commercial wiring, underground armoured cables, distribution boards, and modular accessories.',
    standards: 'IS 694:2010 · IS 7098 · IEC 60947 · IS 3854',
    unit: 'Running metres / Units',
  },
  {
    slug: 'finishing-materials',
    name: 'Finishing Materials',
    subtitle: 'Vitrified Tiles, Natural Marble, Granite & Weathercoat Paint',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    description: 'Double-charge floor tiles, Italian marble, polished granite countertops, and architectural paint.',
    standards: 'IS 15622:2017 · ISO 13006 · IS 15489',
    unit: 'Square feet / Boxes',
  },
  {
    slug: 'sanitary-bathroom',
    name: 'Sanitary & Bathroom',
    subtitle: 'Vitreous China Sanitaryware, Brass Faucets & CP Fittings',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    description: 'Commercial wall-hung closets, basin mixers, showers, sensor taps, and plumbing brassware.',
    standards: 'IS 2556 · IS 8931 · EN 997',
    unit: 'Pieces (Nos) / Sets',
  },
  {
    slug: 'construction-chemicals',
    name: 'Construction Chemicals',
    subtitle: 'Polymer Waterproofing, Tile Adhesives & Joint Sealants',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    description: 'Elastomeric waterproofing membranes, polymer tile adhesives, admixtures, and structural sealants.',
    standards: 'ASTM C836 · IS 2645 · IS 15477 · ASTM C920',
    unit: 'Litres (L) / Bags',
  },
  {
    slug: 'equipment-formwork',
    name: 'Equipment & Formwork',
    subtitle: 'Modular Cuplock Scaffolding, Steel Props & Shuttering Ply',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    description: 'Tubular scaffolding, telescopic props, film-faced shuttering plywood, and formwork accessories.',
    standards: 'IS 2750 · IS 4990:2011 · EN 12810',
    unit: 'Pieces (Nos) / Sq.ft',
  },
  {
    slug: 'infrastructure-materials',
    name: 'Infrastructure Materials',
    subtitle: 'Paving Bitumen, Precast Concrete Drains & DI Pipes',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
    description: 'VG-30/VG-40 road bitumen, precast stormwater drain channels, DI K9 pipes, and crash barriers.',
    standards: 'IRC:SP:84 · IS 73:2013 · IS 8329 · IS 458',
    unit: 'Metric tonnes (MT) / Rm',
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
            src="/images/hero-arch-cityscape.jpg"
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
            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-[#FFFFFF] leading-[1.02]">
                Where Construction Meets Procurement.
              </h1>
              <p className="text-base sm:text-lg text-[#A8ADB7] max-w-2xl leading-relaxed">
                Source construction materials, discover relevant suppliers, compare competitive quotations and manage procurement through one connected platform.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/buyer/discovery"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm shadow-sm"
              >
                <span>Explore Suppliers</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/rfq/new"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#303746] hover:bg-[#252B38] border border-[#414957] text-[#F1F2F4] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm"
              >
                <span>Submit Your Requirement</span>
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
            <span>CONSTRUCTION & INFRASTRUCTURE PROCUREMENT</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#FFFFFF] leading-tight">
            ONE PLATFORM TO SOURCE, COMPARE & PROCURE.
          </h2>
          <div className="w-16 h-0.5 bg-[#414957] mx-auto" />
          <p className="text-base sm:text-lg text-[#A8ADB7] max-w-2xl mx-auto leading-relaxed">
            Connecting builders, contractors, developers, infrastructure companies and construction material suppliers through a connected digital procurement platform.
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
              A Smarter Way to Source
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
              Your Business. Your Network.<br />
              <span className="text-[#C66A42]">One Platform.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#A8ADB7] max-w-xl mx-auto leading-relaxed">
              Join leading construction firms, civil contractors, and verified material stockists sourcing on PROVENTA.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/buyer/discovery"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm shadow-sm"
            >
              <span>Explore Suppliers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/rfq/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#303746] hover:bg-[#252B38] border border-[#414957] text-[#F1F2F4] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm"
            >
              <span>Submit Your Requirement</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
