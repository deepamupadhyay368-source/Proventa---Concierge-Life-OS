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
} from 'lucide-react';

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

const STEPS = [
  {
    step: '01',
    title: 'Submit requirements',
    description: 'Specify quantities, grades, brand preferences and delivery destination in a single structured RFQ.',
  },
  {
    step: '02',
    title: 'Invite suppliers',
    description: 'Requirements are broadcast directly to verified stockists and distributors operating in your project zone.',
  },
  {
    step: '03',
    title: 'Receive quotations',
    description: 'Receive itemized formal proposals with transparent unit rates, applicable GST, and freight terms.',
  },
  {
    step: '04',
    title: 'Compare offers',
    description: 'Evaluate bids side by side on basic rates, total landed cost, promised delivery timelines and stockist ratings.',
  },
  {
    step: '05',
    title: 'Select supplier',
    description: 'Confirm the winning quotation with explicit buyer approval and generate a binding digital Purchase Order.',
  },
  {
    step: '06',
    title: 'Coordinate delivery',
    description: 'Track truck dispatch with vehicle and driver contact details, weighbridge slips, and site delivery sign-off.',
  },
];

const BUYER_BENEFITS = [
  'One structured requirement across multiple materials and trades',
  'Multiple competitive supplier quotations in 2 to 4 hours',
  'Transparent side-by-side comparisons with landed cost breakdown',
  'Automated purchase order generation with commercial terms',
  '7-stage milestone delivery tracking from yard to site',
];

const SUPPLIER_BENEFITS = [
  'Direct access to active, verified contractor and builder requirements',
  'Structured quotation submissions with itemized rate calculators',
  'Better business visibility across commercial construction projects',
  'Streamlined purchase orders and direct delivery coordination',
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
    <div className="bg-[#F2F0E9] text-[#171A17] font-sans">
      {/* 1. HERO SECTION */}
      <section className="relative border-b border-[#D9D8CF] overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-[#E7E5DC] border border-[#D9D8CF] text-xs font-mono font-medium text-[#171A17]">
                <span className="w-2 h-2 bg-[#53634A]" />
                <span>CONSTRUCTION PROCUREMENT NETWORK</span>
              </div>

              <div className="space-y-4">
                <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-[#171A17] leading-[0.98]">
                  PROCUREMENT<br />
                  BUILT FOR<br />
                  <span className="text-[#53634A]">CONSTRUCTION.</span>
                </h1>
                <p className="text-base sm:text-lg text-[#777970] max-w-xl leading-relaxed">
                  A smarter way to source construction materials, compare supplier quotations and coordinate deliveries.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/rfq/new"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#53634A] hover:bg-[#43503B] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <span>POST A REQUIREMENT</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/supplier/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FFFFFF] hover:bg-[#E7E5DC] border border-[#D9D8CF] text-[#171A17] font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  <span>BECOME A SUPPLIER</span>
                </Link>
              </div>

              {/* Quick Specification Box */}
              <div className="pt-4 border-t border-[#D9D8CF]">
                <form onSubmit={handleQuickSubmit} className="space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#777970]">
                    Quick Material Requirement
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={quickSpec}
                      onChange={(e) => setQuickSpec(e.target.value)}
                      placeholder="e.g. 50 MT Fe 550D TMT Steel, 1000 bags 53G Cement for Ahmedabad site"
                      className="flex-1 bg-[#FFFFFF] border border-[#D9D8CF] px-4 py-3 text-xs text-[#171A17] placeholder:text-[#777970] focus:outline-none focus:border-[#53634A]"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#53634A] hover:bg-[#43503B] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider shrink-0 transition-colors"
                    >
                      Start RFQ
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Architectural Hero Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative border border-[#D9D8CF] bg-[#FFFFFF] p-2">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#E7E5DC]">
                  <Image
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80"
                    alt="Engineered Commercial Construction Infrastructure"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="p-4 bg-[#FFFFFF] border-t border-[#D9D8CF] flex items-center justify-between text-xs font-mono text-[#777970]">
                  <div>
                    <span className="text-[#171A17] font-bold">COMMERCIAL SPECIFICATION</span>
                    <div className="text-[11px]">Primary Producer Steels & Concrete</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[#53634A] font-bold">100% VERIFIED</span>
                    <div className="text-[11px]">Mill Test Certificates</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION A: PROCUREMENT MADE SIMPLER (BUYER JOURNEY) */}
      <section className="py-20 border-b border-[#D9D8CF] bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[#53634A] uppercase tracking-wider">
              <span>Section 01 · Structured Process</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#171A17]">
              Procurement made simpler
            </h2>
            <p className="text-sm text-[#777970] leading-relaxed">
              Traditional construction purchasing suffers from opaque rates, fragmented phone calls, and uncoordinated deliveries. PROVENTA unifies the entire procurement journey onto a single disciplined platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#F2F0E9] border border-[#D9D8CF] space-y-4">
              <div className="w-10 h-10 bg-[#53634A] text-[#FFFFFF] flex items-center justify-center font-mono font-bold text-sm">
                01
              </div>
              <h3 className="font-heading text-lg font-bold uppercase text-[#171A17]">
                Single Technical RFQ
              </h3>
              <p className="text-xs text-[#777970] leading-relaxed">
                Post detailed bills of quantities, technical grades, and site access specifications. Avoid repeating specs across dozens of independent dealers.
              </p>
            </div>

            <div className="p-8 bg-[#F2F0E9] border border-[#D9D8CF] space-y-4">
              <div className="w-10 h-10 bg-[#53634A] text-[#FFFFFF] flex items-center justify-center font-mono font-bold text-sm">
                02
              </div>
              <h3 className="font-heading text-lg font-bold uppercase text-[#171A17]">
                Side-by-Side Comparison
              </h3>
              <p className="text-xs text-[#777970] leading-relaxed">
                Receive itemized supplier bids broken down into basic unit prices, GST rates, and transport freight. Total landed costs are directly comparable.
              </p>
            </div>

            <div className="p-8 bg-[#F2F0E9] border border-[#D9D8CF] space-y-4">
              <div className="w-10 h-10 bg-[#53634A] text-[#FFFFFF] flex items-center justify-center font-mono font-bold text-sm">
                03
              </div>
              <h3 className="font-heading text-lg font-bold uppercase text-[#171A17]">
                Tracked Site Dispatch
              </h3>
              <p className="text-xs text-[#777970] leading-relaxed">
                Monitor vehicles, assign driver phone contacts, inspect weighbridge records, and confirm site physical sign-off before closing transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION B: MATERIAL CATEGORIES */}
      <section className="py-20 border-b border-[#D9D8CF] bg-[#F2F0E9]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[#53634A] uppercase tracking-wider">
                <span>Section 02 · Catalogue</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#171A17]">
                Material categories
              </h2>
              <p className="text-sm text-[#777970]">
                Commercial construction supplies sourced from verified manufacturers, primary producers, and regional stockists.
              </p>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#53634A] hover:underline shrink-0"
            >
              <span>View full material catalogue</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.slug}
                className="bg-[#FFFFFF] border border-[#D9D8CF] flex flex-col justify-between overflow-hidden group hover:border-[#53634A] transition-colors"
              >
                <div>
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#E7E5DC]">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#B87948] font-bold">
                      {cat.standards}
                    </div>
                    <h3 className="font-heading text-xl font-bold uppercase text-[#171A17]">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#777970] leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-[#D9D8CF] mt-4 flex items-center justify-between font-mono text-xs">
                  <span className="text-[#777970]">{cat.unit}</span>
                  <Link
                    href={`/rfq/new?category=${cat.slug}`}
                    className="inline-flex items-center gap-1 font-bold text-[#53634A] hover:underline uppercase text-[11px]"
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

      {/* 4. SECTION C: HOW PROVENTA WORKS (01 TO 06) */}
      <section className="py-20 border-b border-[#D9D8CF] bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[#53634A] uppercase tracking-wider">
              <span>Section 03 · Operational Blueprint</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#171A17]">
              How PROVENTA works
            </h2>
            <p className="text-sm text-[#777970]">
              Six sequential stages designed to ensure technical compliance, fair competitive rates, and reliable site logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div
                key={s.step}
                className="p-8 bg-[#F2F0E9] border border-[#D9D8CF] space-y-4 hover:border-[#53634A] transition-colors"
              >
                <div className="font-mono text-2xl font-black text-[#53634A]">
                  {s.step}
                </div>
                <h3 className="font-heading text-base font-bold uppercase text-[#171A17] tracking-tight">
                  {s.title}
                </h3>
                <p className="text-xs text-[#777970] leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SECTION D: BUILT FOR BOTH SIDES */}
      <section className="py-20 border-b border-[#D9D8CF] bg-[#F2F0E9]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[#53634A] uppercase tracking-wider">
              <span>Section 04 · Market Balance</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#171A17]">
              Built for both sides
            </h2>
            <p className="text-sm text-[#777970]">
              A balanced procurement infrastructure connecting buyers with verified suppliers through clear commercial rules and zero ambiguity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Buyer Benefits */}
            <div className="p-8 sm:p-10 bg-[#FFFFFF] border border-[#D9D8CF] space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#53634A] font-bold">
                  For Buyers & Contractors
                </span>
                <h3 className="font-heading text-2xl font-black uppercase text-[#171A17]">
                  Buyer Benefits
                </h3>
              </div>

              <ul className="space-y-4">
                {BUYER_BENEFITS.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-[#171A17]">
                    <div className="w-5 h-5 bg-[#E7E5DC] text-[#53634A] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-[#D9D8CF]">
                <Link
                  href="/rfq/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#53634A] hover:bg-[#43503B] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <span>Post Buyer Requirement</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Supplier Benefits */}
            <div className="p-8 sm:p-10 bg-[#FFFFFF] border border-[#D9D8CF] space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#B87948] font-bold">
                  For Stockists & Dealers
                </span>
                <h3 className="font-heading text-2xl font-black uppercase text-[#171A17]">
                  Supplier Benefits
                </h3>
              </div>

              <ul className="space-y-4">
                {SUPPLIER_BENEFITS.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-[#171A17]">
                    <div className="w-5 h-5 bg-[#E7E5DC] text-[#B87948] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-[#D9D8CF]">
                <Link
                  href="/supplier/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#171A17] hover:bg-[#53634A] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <span>Register as Verified Supplier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION E: FINAL CTA */}
      <section className="py-24 border-b border-[#D9D8CF] bg-[#E7E5DC] text-center">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-8">
          <div className="space-y-4">
            <h2 className="font-heading text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#171A17] leading-tight">
              SOURCE BETTER.<br />
              <span className="text-[#53634A]">BUILD BETTER.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#777970] max-w-xl mx-auto leading-relaxed">
              Join leading construction firms, civil contractors, and verified material stockists sourcing on PROVENTA.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/rfq/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#53634A] hover:bg-[#43503B] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
            >
              <span>Post a Requirement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/supplier/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FFFFFF] hover:bg-[#F2F0E9] border border-[#D9D8CF] text-[#171A17] font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <span>Become a Supplier</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
