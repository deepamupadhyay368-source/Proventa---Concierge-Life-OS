'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Building2,
  Truck,
  ArrowUpRight,
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
  Send,
  Scale,
  Search,
} from 'lucide-react';

const PAIN_POINTS = [
  {
    icon: AlertCircle,
    title: 'No audit trail',
    desc: 'Quotations via WhatsApp and phone calls leave no comparable record. Purchase decisions lack internal transparency and verification.',
  },
  {
    icon: BarChart3,
    title: 'Manual price comparisons',
    desc: 'Spreadsheet-based comparison introduces calculation errors and delays. Landed cost formulas frequently omit freight or unloading charges.',
  },
  {
    icon: Building2,
    title: 'Supplier reliability is unknown',
    desc: 'No objective visibility into a supplier’s historical fulfilment track record, delivery punctuality, or invoice dispute rate before ordering.',
  },
  {
    icon: Truck,
    title: 'Informal delivery tracking',
    desc: 'Dispatch tracking relies on unverified verbal updates. Material shortages and damages at site weighbridges trigger disputed settlements.',
  },
];

const FOUR_STAGE_WORKFLOW = [
  {
    step: '01',
    name: 'Raise Requirement',
    icon: ClipboardList,
    description: 'Create multi-item RFQs with technical grades, required delivery dates, site accessibility parameters, and attached BOQ documents.',
    action: 'Create RFQ',
    href: '/rfq/new',
  },
  {
    step: '02',
    name: 'Discover Suppliers',
    icon: Search,
    description: 'Broadcast requirements to verified regional stockists, primary producers, and authorized dealers, or invite your existing vendor network.',
    action: 'Explore Network',
    href: '/buyer/discovery',
  },
  {
    step: '03',
    name: 'Compare Quotations',
    icon: GitCompare,
    description: 'Analyze side-by-side landed cost matrices comparing base unit prices, applicable GST rates, freight, payment terms, and delivery schedules.',
    action: 'Compare Offers',
    href: '/buyer/dashboard',
  },
  {
    step: '04',
    name: 'Manage Procurement',
    icon: Truck,
    description: 'Generate binding digital Purchase Orders, coordinate dispatches with driver details, track deliveries, and maintain payment ledgers.',
    action: 'Track Orders',
    href: '/buyer/orders',
  },
];

const MATERIAL_CATEGORIES = [
  {
    slug: 'steel-metals',
    name: 'Steel & TMT',
    spec: 'IS 1786:2008 · Fe 500D / 550D / 550D CRS',
    image: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=1200&q=80',
    description: 'Primary producer TMT rebars (8mm to 36mm), structural MS angles, channels, beams, plates, and wire.',
    unit: 'Metric Tonnes (MT)',
  },
  {
    slug: 'cement-concrete',
    name: 'Cement',
    spec: 'IS 269:2015 · IS 1489:2015 · OPC 43/53 & PPC',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=1200&q=80',
    description: 'Factory-direct 50kg bags, bulk tanker bulker supply, and computerized transit-mixer ready-mix concrete (RMC).',
    unit: 'Bags (50kg) / MT',
  },
  {
    slug: 'building-materials',
    name: 'Aggregates',
    spec: 'IS 383:2016 · 10mm, 20mm & Crushed Sand',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
    description: 'Crushed basalt aggregates (10mm, 20mm, 40mm), manufactured sand (M-Sand), washed river sand, and GSB/WMM road base.',
    unit: 'Metric Tonnes (MT) / Brass',
  },
  {
    slug: 'pipes-plumbing',
    name: 'Pipes & Plumbing',
    spec: 'IS 15778 · IS 4984 · CPVC, UPVC, HDPE & DI',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    description: 'SDR 11/13.5 CPVC pressure piping, SWR drainage systems, underground HDPE coils, and DI K7/K9 infrastructure lines.',
    unit: 'Running Metres (Rm) / Nos',
  },
  {
    slug: 'electrical-materials',
    name: 'Electrical Materials',
    spec: 'IS 694:2010 · IS 7098 · FRLSH & XLPE',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    description: 'Commercial wiring, copper busbars, LT/HT armoured underground cables, distribution boards, and modular switchgear.',
    unit: 'Running Metres / Units',
  },
  {
    slug: 'construction-chemicals',
    name: 'Construction Chemicals',
    spec: 'ASTM C836 · IS 2645 · Admixtures & Membranes',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    description: 'High-range water-reducing plasticizers, elastomeric waterproofing, polymer tile adhesives, and structural grouts.',
    unit: 'Litres (L) / Bags (25kg)',
  },
  {
    slug: 'building-blocks',
    name: 'Building Materials',
    spec: 'IS 2185 Part 3 · AAC Blocks & Fly Ash Bricks',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    description: 'Precision autoclaved aerated concrete (AAC) blocks, structural masonry mortars, and fly ash construction bricks.',
    unit: 'Cubic Metres (Cu.m) / Units',
  },
];

export default function HomePage() {
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    company: '',
    role: 'BUYER',
    email: '',
    phone: '',
    requirement: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#292F3D] text-[#F1F2F4] font-sans">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center border-b border-[#414957] overflow-hidden bg-[#191B20]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-arch-cityscape.jpg"
            alt="Large Infrastructure Engineering & Construction"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#191B20]/95 via-[#292F3D]/90 to-[#292F3D]/75" />
          <div className="absolute inset-0 bg-[#191B20]/40 backdrop-brightness-75" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28 w-full">
          <div className="max-w-3xl space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#303746]/80 border border-[#414957] rounded-sm text-xs font-mono text-[#C66A42] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-[#C66A42] rounded-full" />
                <span>PROVENTA &bull; CONSTRUCTION PROCUREMENT PLATFORM</span>
              </div>
              <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-[#FFFFFF] leading-[1.02]">
                Procurement, Connected from Requirement to Delivery.
              </h1>
              <p className="text-base sm:text-lg text-[#A8ADB7] max-w-2xl leading-relaxed">
                One connected platform to organise material sourcing, discover suppliers, compare quotations and manage construction procurement workflows.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/sign-up?role=buyer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm shadow-sm"
              >
                <span>I&apos;m a Buyer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sign-up?role=supplier"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#303746] hover:bg-[#252B38] border border-[#536B88] text-[#F1F2F4] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm"
              >
                <span>I&apos;m a Supplier</span>
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-[#414957] text-[#A8ADB7] hover:text-[#F1F2F4] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm"
              >
                <span>Explore PROVENTA</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROCUREMENT CHALLENGES */}
      <section className="py-20 lg:py-24 bg-[#191B20] border-b border-[#414957]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-mono font-medium text-[#C66A42] uppercase tracking-wider">
              <span>Market Friction</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF]">
              Why construction procurement fails.
            </h2>
            <p className="text-sm text-[#A8ADB7]">
              Commercial construction procurement continues to suffer from fragmented communication, opaque pricing, and administrative overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PAIN_POINTS.map((p) => {
              const IconComp = p.icon;
              return (
                <div
                  key={p.title}
                  className="bg-[#303746] border border-[#414957] p-6 space-y-4 rounded-sm hover:border-[#536B88] transition-colors"
                >
                  <IconComp className="w-6 h-6 text-[#C66A42]" />
                  <h3 className="font-heading text-base font-bold uppercase text-[#FFFFFF] tracking-tight">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#A8ADB7] leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. PROVENTA'S SOLUTION */}
      <section className="py-20 lg:py-24 bg-[#252B38] border-b border-[#414957] text-center">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[#C66A42] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-[#C66A42]" />
            <span>CONSTRUCTION &amp; INFRASTRUCTURE PROCUREMENT</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#FFFFFF] leading-tight">
            ONE PLATFORM TO SOURCE, COMPARE &amp; PROCURE.
          </h2>
          <div className="w-16 h-0.5 bg-[#414957] mx-auto" />
          <p className="text-base sm:text-lg text-[#A8ADB7] max-w-2xl mx-auto leading-relaxed">
            Connecting builders, contractors, developers, infrastructure companies and construction material suppliers through a connected digital procurement platform.
          </p>
        </div>
      </section>

      {/* 4. FOUR-STAGE PROCUREMENT WORKFLOW */}
      <section className="py-20 lg:py-28 bg-[#292F3D] border-b border-[#414957]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-14">
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-mono font-medium text-[#536B88] uppercase tracking-wider">
              <span>Structured Lifecycle</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF]">
              Four-Stage Procurement Workflow
            </h2>
            <p className="text-sm text-[#A8ADB7]">
              Every transaction progresses systematically with verified records, counterparty confirmations, and full commercial accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FOUR_STAGE_WORKFLOW.map((wf) => {
              const IconComp = wf.icon;
              return (
                <div
                  key={wf.step}
                  className="bg-[#303746] border border-[#414957] p-6 space-y-4 rounded-sm flex flex-col justify-between hover:border-[#536B88] transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-black text-[#C66A42]">
                        {wf.step}
                      </span>
                      <IconComp className="w-5 h-5 text-[#536B88]" />
                    </div>
                    <h3 className="font-heading text-lg font-bold uppercase text-[#FFFFFF] tracking-tight">
                      {wf.name}
                    </h3>
                    <p className="text-xs text-[#A8ADB7] leading-relaxed">
                      {wf.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#414957]/60">
                    <Link
                      href={wf.href}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-[#536B88] hover:text-[#FFFFFF] transition-colors"
                    >
                      <span>{wf.action}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. BUYER & 6. SUPPLIER CAPABILITIES */}
      <section className="py-20 lg:py-24 bg-[#252B38] border-b border-[#414957]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-mono font-medium text-[#C66A42] uppercase tracking-wider">
              <span>Role-Specific Portals</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF]">
              Engineered for Buyers &amp; Suppliers
            </h2>
            <p className="text-sm text-[#A8ADB7]">
              Purpose-built desks tailored to contractor procurement officers and material stockist sales coordinators.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Buyer Capabilities */}
            <div className="p-8 sm:p-10 bg-[#303746] border border-[#414957] space-y-6 rounded-sm">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#536B88] font-bold">
                  Buyer Capabilities
                </span>
                <h3 className="font-heading text-2xl font-black uppercase text-[#FFFFFF]">
                  For Builders &amp; Contractors
                </h3>
              </div>

              <ul className="space-y-4">
                {[
                  'Multi-item RFQ creation with grade, unit, and vehicle accessibility specs',
                  'Direct invitation of existing vendors alongside verified PROVENTA network',
                  'Side-by-side quotation comparison with landed cost breakdowns',
                  'Legally binding digital Purchase Orders with payment term milestones',
                  '7-stage delivery tracking with weighbridge slip uploads',
                  'Invoice ledger with contractual countdown and payment intelligence',
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
                  href="/sign-up?role=buyer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#536B88] hover:bg-[#435770] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider transition-colors rounded-sm"
                >
                  <span>Register as Buyer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Supplier Capabilities */}
            <div className="p-8 sm:p-10 bg-[#303746] border border-[#414957] space-y-6 rounded-sm">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#C66A42] font-bold">
                  Supplier Capabilities
                </span>
                <h3 className="font-heading text-2xl font-black uppercase text-[#FFFFFF]">
                  For Stockists &amp; Manufacturers
                </h3>
              </div>

              <ul className="space-y-4">
                {[
                  'Targeted RFQ invitations filtered by category and serviceable locations',
                  'Itemized quotation submission with basic rates, GST %, and freight',
                  'Quote revision tracking with competitor quotation confidentiality',
                  'Official digital Purchase Order confirmations and dispatch notices',
                  'Direct delivery coordination with vehicle number and driver details',
                  'Commercial invoice generation linked to PO with counterparty verification',
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
                  href="/sign-up?role=supplier"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#191B20] hover:bg-[#252B38] border border-[#414957] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider transition-colors rounded-sm"
                >
                  <span>Register as Supplier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MATERIAL CATEGORIES */}
      <section className="py-20 lg:py-28 bg-[#191B20] border-b border-[#414957]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="text-xs font-mono font-medium text-[#C66A42] uppercase tracking-wider">
                <span>Material Sourcing Taxonomy</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF]">
                Material Categories
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {MATERIAL_CATEGORIES.map((cat) => (
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
                  <div className="p-5 space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#C66A42] font-semibold truncate">
                      {cat.spec}
                    </div>
                    <h3 className="font-heading text-lg font-bold uppercase text-[#FFFFFF]">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#A8ADB7] leading-relaxed line-clamp-3">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-[#414957]/60 mt-3 flex items-center justify-between font-mono text-xs">
                  <span className="text-[#A8ADB7] text-[11px]">{cat.unit}</span>
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

      {/* 8. SUPPLIER NETWORK EXPLANATION */}
      <section className="py-20 lg:py-24 bg-[#252B38] border-b border-[#414957]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <div className="text-xs font-mono font-medium text-[#536B88] uppercase tracking-wider">
              <span>Trusted Commercial Network</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF]">
              Supplier Network &amp; Bring Your Own Vendors
            </h2>
            <p className="text-sm text-[#A8ADB7] leading-relaxed">
              PROVENTA bridges buyers with an audited network of regional distributors and manufacturers, while allowing buyers to maintain private supplier rosters with complete data privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#303746] border border-[#414957] p-6 space-y-4 rounded-sm">
              <ShieldCheck className="w-6 h-6 text-[#4A7C59]" />
              <h3 className="font-heading text-base font-bold uppercase text-[#FFFFFF]">
                Verified Business Credentials
              </h3>
              <p className="text-xs text-[#A8ADB7] leading-relaxed">
                Suppliers submit statutory GSTIN certificates, PAN records, and physical yard addresses for operational compliance review. No supplier is marked verified without evidence.
              </p>
            </div>

            <div className="bg-[#303746] border border-[#414957] p-6 space-y-4 rounded-sm">
              <Network className="w-6 h-6 text-[#536B88]" />
              <h3 className="font-heading text-base font-bold uppercase text-[#FFFFFF]">
                Bring Your Own Suppliers (BYOS)
              </h3>
              <p className="text-xs text-[#A8ADB7] leading-relaxed">
                Invite existing trade suppliers to quote on your RFQs through a private link. Your private vendor relationships and negotiated rates remain strictly confidential to your account.
              </p>
            </div>

            <div className="bg-[#303746] border border-[#414957] p-6 space-y-4 rounded-sm">
              <Scale className="w-6 h-6 text-[#C66A42]" />
              <h3 className="font-heading text-base font-bold uppercase text-[#FFFFFF]">
                Confidential Bidding Architecture
              </h3>
              <p className="text-xs text-[#A8ADB7] leading-relaxed">
                Suppliers never see competitor bids. Buyers control supplier selection without automated lowest-cost forcing, preserving commercial judgment and quality standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PROCUREMENT INTELLIGENCE */}
      <section className="py-20 lg:py-24 bg-[#191B20] border-b border-[#414957]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <div className="text-xs font-mono font-medium text-[#C66A42] uppercase tracking-wider">
              <span>Financial &amp; Operational Analytics</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF]">
              PROVENTA Payment &amp; Fulfilment Intelligence
            </h2>
            <p className="text-sm text-[#A8ADB7] leading-relaxed">
              Payment behaviour made visible. Maintain accurate financial obligations, contractual payment countdowns, and dual Buyer-Supplier payment integrity scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#303746] border border-[#414957] p-6 space-y-3 rounded-sm">
              <div className="text-xs font-mono text-[#536B88] uppercase">Contractual Countdown</div>
              <div className="text-xl font-heading font-black text-[#FFFFFF]">Precision Due Dates</div>
              <p className="text-xs text-[#A8ADB7] leading-relaxed">
                Automated calculation based on agreed payment terms (NET 7 to NET 60). Live indicators for due dates, overdue intervals, and partial settlements.
              </p>
            </div>

            <div className="bg-[#303746] border border-[#414957] p-6 space-y-3 rounded-sm">
              <div className="text-xs font-mono text-[#C66A42] uppercase">Payment Ledger</div>
              <div className="text-xl font-heading font-black text-[#FFFFFF]">Partial Payment Tracking</div>
              <p className="text-xs text-[#A8ADB7] leading-relaxed">
                Record exact UTR reference numbers, bank confirmations, and partial settlements with BigInt precision arithmetic without floating-point errors.
              </p>
            </div>

            <div className="bg-[#303746] border border-[#414957] p-6 space-y-3 rounded-sm">
              <div className="text-xs font-mono text-[#4A7C59] uppercase">Behaviour Scoring</div>
              <div className="text-xl font-heading font-black text-[#FFFFFF]">1000-Point Metric</div>
              <p className="text-xs text-[#A8ADB7] leading-relaxed">
                Deterministic proprietary scoring based on value-weighted on-time payments, delay penalties, and verified commercial transaction depth.
              </p>
            </div>

            <div className="bg-[#303746] border border-[#414957] p-6 space-y-3 rounded-sm">
              <div className="text-xs font-mono text-[#A8ADB7] uppercase">Dispute Management</div>
              <div className="text-xl font-heading font-black text-[#FFFFFF]">Fair Dispute Protection</div>
              <p className="text-xs text-[#A8ADB7] leading-relaxed">
                Disputed invoices are segregated and never counted as defaults during scoring, safeguarding commercial partners against unfair penalties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. ENQUIRY FORM & CALL TO ACTION */}
      <section className="py-20 lg:py-24 bg-[#252B38] border-b border-[#414957]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[#C66A42] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-[#C66A42]" />
                <span>COMMERCIAL ENQUIRY</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#FFFFFF] leading-tight">
                Connect With Our Procurement Desk.
              </h2>
              <p className="text-sm sm:text-base text-[#A8ADB7] leading-relaxed">
                Whether you are a general contractor sourcing 200 MT of TMT steel or a primary manufacturer seeking direct project access in Gujarat and western India, our desk is available.
              </p>

              <div className="space-y-3 font-mono text-xs text-[#A8ADB7]">
                <div className="flex items-center gap-2">
                  <span className="text-[#C66A42]">&bull;</span>
                  <span>Headquarters: Ahmedabad, Gujarat, India</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#C66A42]">&bull;</span>
                  <span>Support: support@proventa.in</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#C66A42]">&bull;</span>
                  <span>Platform: https://proventa.in</span>
                </div>
              </div>
            </div>

            <div className="bg-[#303746] border border-[#414957] p-8 rounded-sm shadow-xl">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-[#4A7C59] mx-auto" />
                  <h3 className="font-heading font-black text-xl uppercase text-[#FFFFFF]">
                    Enquiry Received
                  </h3>
                  <p className="text-xs text-[#A8ADB7] max-w-sm mx-auto">
                    Thank you. Our procurement operations desk will review your requirement and reach out within 4 business hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  <h3 className="font-heading font-black text-lg uppercase text-[#FFFFFF] border-b border-[#414957] pb-3">
                    Submit Platform Enquiry
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[#A8ADB7] uppercase">Full Name</label>
                      <input
                        type="text"
                        required
                        value={enquiryForm.name}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                        className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm"
                        placeholder="e.g. Rajesh Patel"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[#A8ADB7] uppercase">Company</label>
                      <input
                        type="text"
                        required
                        value={enquiryForm.company}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, company: e.target.value })}
                        className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm"
                        placeholder="e.g. Apex Infra Pvt Ltd"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[#A8ADB7] uppercase">Email</label>
                      <input
                        type="email"
                        required
                        value={enquiryForm.email}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                        className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm"
                        placeholder="procurement@company.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[#A8ADB7] uppercase">Phone</label>
                      <input
                        type="tel"
                        required
                        value={enquiryForm.phone}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                        className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[#A8ADB7] uppercase">Account Role</label>
                    <select
                      value={enquiryForm.role}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, role: e.target.value })}
                      className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm"
                    >
                      <option value="BUYER">Buyer (Builder, Contractor, Infrastructure Company)</option>
                      <option value="SUPPLIER">Supplier (Manufacturer, Stockist, Distributor)</option>
                      <option value="BOTH">Both Buyer &amp; Supplier</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[#A8ADB7] uppercase">Requirement / Products</label>
                    <textarea
                      rows={3}
                      required
                      value={enquiryForm.requirement}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, requirement: e.target.value })}
                      className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm resize-none"
                      placeholder="Describe your material requirements or products you supply..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Submit Enquiry</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 11. FINAL BANNER CTA */}
      <section className="py-24 bg-[#191B20] border-b border-[#414957] text-center">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-8">
          <div className="space-y-4">
            <h2 className="font-heading text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#FFFFFF] leading-tight">
              SOURCE. PROCURE. DELIVER. SETTLE.
            </h2>
            <p className="text-sm sm:text-base text-[#A8ADB7] max-w-xl mx-auto leading-relaxed">
              One platform for the complete construction procurement lifecycle.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up?role=buyer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm shadow-sm"
            >
              <span>Register as a Buyer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-up?role=supplier"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#303746] hover:bg-[#252B38] border border-[#414957] text-[#F1F2F4] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm"
            >
              <span>Register as a Supplier</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
