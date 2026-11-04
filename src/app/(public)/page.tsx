'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Building2,
  CheckCircle2,
  Layers,
  FileSpreadsheet,
  Clock,
  Sparkles,
  TrendingDown,
  Scale,
  MapPin,
  ChevronRight,
  Hammer,
  Zap,
  Droplets,
  Grid,
  Paintbrush,
  DoorClosed,
  PhoneCall,
  Star,
  Users,
} from 'lucide-react';
import { BRAND_CONFIG, CONSTRUCTION_UNITS } from '@/lib/brand';

const CORE_CATEGORIES = [
  {
    id: 'building-materials',
    name: 'Building Materials',
    icon: Hammer,
    description: 'Cement, TMT Steel, Sand, Aggregates, Bricks, AAC Blocks & Ready-Mix Concrete',
    units: ['Bags', 'Metric tonnes (MT)', 'Cu.ft', 'Cu.m', 'Pieces (Nos)'],
    brands: ['UltraTech', 'Ambuja', 'Tata Tiscon', 'Jindal Panther', 'Kamdhenu'],
    badge: 'High Volume Demand',
  },
  {
    id: 'electrical',
    name: 'Electrical Supplies',
    icon: Zap,
    description: 'FRLS Copper Wires, Industrial Cables, Modular Switches, DB Panels & Conduits',
    units: ['Metres', 'Pieces (Nos)', 'Boxes'],
    brands: ['Polycab', 'Havells', 'RR Kabel', 'Schneider Electric', 'Legrand'],
    badge: 'IS Certified',
  },
  {
    id: 'plumbing',
    name: 'Plumbing & Water Systems',
    icon: Droplets,
    description: 'CPVC & UPVC Pipes, Pressure Fittings, Storage Tanks, Pumps & Sanitaryware',
    units: ['Pieces (Nos)', 'Metres', 'Litres (L)'],
    brands: ['Astral', 'Ashirvad', 'Supreme', 'Sintex', 'Jaquar'],
    badge: 'Heavy Duty',
  },
  {
    id: 'tiles-flooring',
    name: 'Tiles & Flooring',
    icon: Grid,
    description: 'Vitrified GVT/PGVT Tiles, Ceramic Walls, Natural Marble Slabs & Granite',
    units: ['Square feet (Sq.ft)', 'Boxes', 'Pieces (Nos)'],
    brands: ['Kajaria', 'Somany', 'Simpolo', 'Italian Marble', 'Black Granite'],
    badge: 'Direct Sourcing',
  },
  {
    id: 'finishing-materials',
    name: 'Finishing & Waterproofing',
    icon: Paintbrush,
    description: 'Interior/Exterior Paint, Waterproofing Membranes, Tile Adhesives & Wall Putty',
    units: ['Litres (L)', 'Bags', 'Kilograms (KG)'],
    brands: ['Asian Paints', 'Berger', 'Dr. Fixit', 'Pidilite Roff', 'Birla White'],
    badge: 'Weather Proof',
  },
  {
    id: 'doors-windows',
    name: 'Doors, Windows & Hardware',
    icon: DoorClosed,
    description: 'Aluminium Window Sections, UPVC Acoustic Frames, Flush Doors & Architectural Locks',
    units: ['Pieces (Nos)', 'Square feet (Sq.ft)', 'Sets'],
    brands: ['Jindal Aluminium', 'Domal Series', 'Century Plywood', 'Godrej', 'Dorset'],
    badge: 'Precision Fit',
  },
];

const PROCUREMENT_STEPS = [
  {
    step: '01',
    title: 'Create Requirement',
    subtitle: 'Multi-Material RFQ',
    description: 'Specify materials, quantities, standard units (MT, Bags, Cu.ft), site address, and upload BOQ documents.',
    icon: FileSpreadsheet,
    badge: 'RFQ-XXXXX',
  },
  {
    step: '02',
    title: 'Invite Suppliers',
    subtitle: 'Verified Matching',
    description: 'Platform automatically routes requirement to verified distributors and dealers in Ahmedabad & Gujarat.',
    icon: Users,
    badge: 'GST-Checked',
  },
  {
    step: '03',
    title: 'Receive Quotations',
    subtitle: 'Itemized Breakdown',
    description: 'Suppliers provide transparent item unit rates, GST %, delivery freight, discounts, and promised lead times.',
    icon: Scale,
    badge: 'Itemized Quotes',
  },
  {
    step: '04',
    title: 'Compare & Select',
    subtitle: 'Decision Matrix',
    description: 'Review side-by-side matrix comparing price, speed, ratings, and warranty. Explicit buyer confirmation to select.',
    icon: CheckCircle2,
    badge: 'Buyer Confirms',
  },
  {
    step: '05',
    title: 'Coordinate Delivery',
    subtitle: '7-Stage Dispatch',
    description: 'Instant PO generation (PO-XXXXX), vehicle number, driver contact, e-way bill, and real-time tracking notes.',
    icon: Truck,
    badge: 'Tracked Transit',
  },
  {
    step: '06',
    title: 'Confirm & Complete',
    subtitle: 'Site Sign-Off',
    description: 'Site engineer verifies delivered quantity, logs any damage/shortage with photos, rates supplier, and completes order.',
    icon: ShieldCheck,
    badge: '100% Verified',
  },
];

const FAQS = [
  {
    q: 'How does PROVENTA ensure competitive pricing on construction materials?',
    a: 'When you submit an RFQ, verified manufacturers, distributors, and bulk stockists across Ahmedabad compete directly for your order. By receiving multiple transparent, itemized quotes with clear GST and freight breakdowns, you eliminate middleman markups and secure wholesale project pricing.',
  },
  {
    q: 'Can I upload a complete Bill of Quantities (BOQ) or material schedule?',
    a: 'Yes. You can upload PDF or Excel BOQ sheets when creating your requirement, or type in your raw material list. Our system automatically parses the specifications, quantities, and units into itemized procurement schedules.',
  },
  {
    q: 'Does the buyer automatically get committed to a supplier?',
    a: 'No. PROVENTA enforces explicit buyer confirmation. No supplier is selected automatically. You review all quotes side-by-side, inspect their verification level and rating, and click "Select Quotation" only when you are completely satisfied with the commercial terms.',
  },
  {
    q: 'How does delivery tracking and physical site receipt work?',
    a: 'Once a Purchase Order is issued, the supplier provides dispatch details including vehicle type (Tata Ace, 10-Wheeler, Transit Mixer), vehicle registration number, driver name, mobile number, and e-way bill. Delivery progresses through 7 transparent stages. Upon arrival, your site representative verifies quantities, logs any shortages, and confirms receipt.',
  },
  {
    q: 'Which locations in Gujarat are currently covered?',
    a: 'PROVENTA currently operates high-density verified supplier networks across Ahmedabad (SG Highway, Changodar, Odhav, Naroda, Sanand, Bopal, Gota, Science City), Gandhinagar, GIFT City, Vadodara, Surat, and Rajkot, with transit support across Gujarat.',
  },
];

export default function ConstructionHomePage() {
  const router = useRouter();
  const [quickInput, setQuickInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('building-materials');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) {
      router.push('/rfq/new');
      return;
    }
    const encoded = encodeURIComponent(quickInput.trim());
    router.push(`/rfq/new?prompt=${encoded}&category=${selectedCategory}`);
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans selection:bg-[#F25C05] selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden border-b border-[#252C38]">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#F25C05]/10 via-[#F25C05]/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Positioning */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#171C26] border border-[#252C38] text-xs font-mono text-[#F4F6FA]">
                <span className="w-2 h-2 rounded-full bg-[#F25C05] animate-pulse" />
                <span className="font-semibold text-[#F25C05] tracking-wide uppercase">
                  Ahmedabad & Gujarat Network Active
                </span>
                <span className="text-[#858D9B]">•</span>
                <span className="text-[#C5CAD3]">Verified Material Suppliers</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#FFFFFF] leading-[1.08] font-heading">
                Construction <br />
                Procurement. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F25C05] via-[#FF7A29] to-[#F25C05]">
                  Simplified.
                </span>
              </h1>

              <div className="flex items-center gap-3 font-mono text-sm uppercase tracking-widest text-[#F25C05] font-bold">
                <span>Require</span>
                <span className="text-[#858D9B]">•</span>
                <span>Compare</span>
                <span className="text-[#858D9B]">•</span>
                <span>Select</span>
                <span className="text-[#858D9B]">•</span>
                <span>Deliver</span>
              </div>

              <p className="text-lg text-[#C5CAD3] max-w-2xl leading-relaxed">
                Connect with verified construction material suppliers, compare competitive itemized quotations, and coordinate timely site delivery across Ahmedabad & Gujarat through one unified platform.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/rfq/new"
                  className="inline-flex items-center justify-center gap-3 px-7 py-4 bg-[#F25C05] hover:bg-[#D94E00] text-white font-bold text-sm tracking-wider uppercase rounded-xs transition-all shadow-lg shadow-[#F25C05]/20 group"
                >
                  <span>Post Your Requirement</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/supplier/register"
                  className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-[#171C26] hover:bg-[#1E2430] border border-[#252C38] hover:border-[#858D9B] text-[#F4F6FA] font-bold text-sm tracking-wider uppercase rounded-xs transition-colors"
                >
                  <span>Register as Supplier</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-[#252C38] text-xs text-[#C5CAD3]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#F25C05] shrink-0" />
                  <span>100% GST-Verified Dealers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F25C05] shrink-0" />
                  <span>No Auto-Selection Control</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <Truck className="w-4 h-4 text-[#F25C05] shrink-0" />
                  <span>GPS Tracked Site Transit</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Quick RFQ Launcher Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 sm:p-8 shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 border-b border-[#252C38]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#F25C05]" />
                    <span className="font-heading font-bold text-sm uppercase tracking-wider text-[#FFFFFF]">
                      Instant RFQ Launcher
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#252C38] text-[#C5CAD3] rounded-xs">
                    Ahmedabad Live
                  </span>
                </div>

                <form onSubmit={handleQuickSubmit} className="mt-5 space-y-4">
                  {/* Category Picker */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                      1. Select Material Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-[#090B10] border border-[#252C38] text-[#F4F6FA] px-3.5 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                    >
                      {CORE_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Freeform Prompt / Specs */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                      2. What Materials Do You Need?
                    </label>
                    <textarea
                      rows={3}
                      value={quickInput}
                      onChange={(e) => setQuickInput(e.target.value)}
                      placeholder="e.g. 1,000 bags UltraTech 53 Grade Cement and 25 MT Tata Tiscon 16mm TMT Steel delivered to Sola, Ahmedabad"
                      className="w-full bg-[#090B10] border border-[#252C38] text-[#F4F6FA] px-3.5 py-2.5 text-sm rounded-xs placeholder:text-[#858D9B]/50 focus:outline-none focus:border-[#F25C05]"
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono text-[#858D9B]">Quick Templates:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        '50 MT Fe 550D TMT Steel',
                        '1,200 Bags 53G Cement',
                        'Astral CPVC SDR-11 Pipes',
                        'Kajaria 600x1200 PGVT Tiles',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setQuickInput(preset)}
                          className="text-[11px] px-2 py-1 bg-[#090B10] hover:bg-[#252C38] border border-[#252C38] text-[#C5CAD3] rounded-xs transition-colors"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#F25C05] hover:bg-[#D94E00] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>Get Competitive Quotations</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-4 pt-4 border-t border-[#252C38] text-center">
                  <Link
                    href="/rfq/new"
                    className="text-xs text-[#858D9B] hover:text-[#F25C05] transition-colors"
                  >
                    Have a detailed BOQ or Excel schedule? <span className="underline">Use Full RFQ Builder →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 6-STEP PROCUREMENT ENGINE */}
      <section className="py-20 bg-[#090B10] border-b border-[#252C38]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#F25C05] font-bold">
              <span>Standardized Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              The 6-Step Procurement Journey
            </h2>
            <p className="text-sm sm:text-base text-[#C5CAD3] leading-relaxed">
              From site requirement to verified physical sign-off, PROVENTA eliminates opaque trading, delay risks, and billing discrepancies.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROCUREMENT_STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="bg-[#171C26] border border-[#252C38] p-7 rounded-xs hover:border-[#F25C05]/60 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-black text-[#F25C05]">
                        {s.step}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#090B10] border border-[#252C38] text-[#858D9B] rounded-xs">
                        {s.badge}
                      </span>
                    </div>

                    <div className="w-10 h-10 bg-[#090B10] border border-[#252C38] flex items-center justify-center text-[#F25C05] group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <h3 className="font-heading font-black text-lg uppercase tracking-tight text-[#FFFFFF]">
                        {s.title}
                      </h3>
                      <p className="font-mono text-xs uppercase text-[#F25C05] font-medium mt-0.5">
                        {s.subtitle}
                      </p>
                    </div>

                    <p className="text-sm text-[#C5CAD3] leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#F25C05] hover:text-[#FF7A29] transition-colors"
            >
              <span>Explore Detailed Step-by-Step Architecture</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. CORE MATERIAL CATEGORIES */}
      <section className="py-20 bg-[#171C26] border-b border-[#252C38]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#252C38]">
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#F25C05] font-bold">
                Material Taxonomy
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
                6 Core Construction Categories
              </h2>
              <p className="text-sm text-[#C5CAD3] max-w-xl">
                Standardized units of measurement, brand preferences, and direct stockist pricing across Gujarat.
              </p>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F4F6FA] hover:text-[#F25C05] border border-[#252C38] px-4 py-2.5 rounded-xs transition-colors self-start md:self-end"
            >
              <span>View Full Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="bg-[#090B10] border border-[#252C38] p-6 rounded-xs hover:border-[#858D9B] transition-colors space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-[#171C26] border border-[#252C38] flex items-center justify-center text-[#F25C05]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#171C26] text-[#C5CAD3] rounded-xs border border-[#252C38]">
                        {cat.badge}
                      </span>
                    </div>

                    <h3 className="font-heading font-black text-lg uppercase tracking-tight text-[#FFFFFF]">
                      {cat.name}
                    </h3>

                    <p className="text-xs text-[#C5CAD3] leading-relaxed">
                      {cat.description}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-[#252C38]">
                      <div className="text-[11px] font-mono text-[#858D9B]">Standard Units:</div>
                      <div className="flex flex-wrap gap-1 text-[11px] font-mono text-[#F4F6FA]">
                        {cat.units.map((u) => (
                          <span key={u} className="px-1.5 py-0.5 bg-[#171C26] border border-[#252C38] rounded-xs">
                            {u}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="text-[11px] font-mono text-[#858D9B]">Leading Brands:</div>
                      <div className="text-xs text-[#C5CAD3]">
                        {cat.brands.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#252C38]">
                    <Link
                      href={`/rfq/new?category=${cat.id}`}
                      className="w-full py-2 bg-[#171C26] hover:bg-[#F25C05] hover:text-white border border-[#252C38] text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-1.5 text-[#F4F6FA]"
                    >
                      <span>Quote {cat.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. DUAL VALUE PROPOSITIONS: FOR BUYERS & FOR SUPPLIERS */}
      <section className="py-20 bg-[#090B10] border-b border-[#252C38]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* For Buyers */}
            <div className="bg-[#171C26] border border-[#252C38] p-8 lg:p-10 rounded-xs space-y-6">
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#F25C05] font-bold">
                <span>Contractors • Builders • Home Owners</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
                For Procurement Teams & Builders
              </h2>
              <ul className="space-y-3.5 text-sm text-[#C5CAD3]">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#F25C05] shrink-0 mt-0.5" />
                  <span><strong>Direct Supplier Sourcing:</strong> Bypass brokers and unverified intermediaries. Transact directly with verified stockists.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#F25C05] shrink-0 mt-0.5" />
                  <span><strong>Side-by-Side Quotation Matrix:</strong> Compare line-item rates, GST components, freight fees, and lead times in one grid.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#F25C05] shrink-0 mt-0.5" />
                  <span><strong>Strict Delivery Sign-Off:</strong> Release milestone payments only after physical site weight verification and damage sign-off.</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/for-buyers"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F25C05] hover:text-[#FF7A29]"
                >
                  <span>Learn More for Construction Buyers →</span>
                </Link>
              </div>
            </div>

            {/* For Suppliers */}
            <div className="bg-[#171C26] border border-[#252C38] p-8 lg:p-10 rounded-xs space-y-6">
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#F25C05] font-bold">
                <span>Distributors • Stockists • Manufacturers</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
                For Material Suppliers & Dealers
              </h2>
              <ul className="space-y-3.5 text-sm text-[#C5CAD3]">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#F25C05] shrink-0 mt-0.5" />
                  <span><strong>Qualified Commercial RFQs:</strong> Receive filtered requirements matching your inventory, warehouse zones, and delivery capacity.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#F25C05] shrink-0 mt-0.5" />
                  <span><strong>Fast PO Generation:</strong> When a buyer accepts your quotation, an official Purchase Order (PO-XXXXX) is generated instantly.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#F25C05] shrink-0 mt-0.5" />
                  <span><strong>Fleet & Dispatch Integration:</strong> Log your vehicle numbers, assign drivers, and share automated tracking notes with site in-charges.</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/for-suppliers"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F25C05] hover:text-[#FF7A29]"
                >
                  <span>Learn More for Material Suppliers →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AHMEDABAD & GUJARAT COVERAGE MAP */}
      <section className="py-20 bg-[#171C26] border-b border-[#252C38]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-[#090B10] border border-[#252C38] p-8 lg:p-12 rounded-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#F25C05] font-bold">
                  <MapPin className="w-4 h-4" />
                  <span>High-Density Delivery Radius</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
                  Active Delivery Across Ahmedabad & Gujarat
                </h2>
                <p className="text-sm text-[#C5CAD3] leading-relaxed">
                  Our vetted supplier depots and transport partners cover primary industrial stockyards and high-growth construction belts with guaranteed delivery windows.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
                  {[
                    'SG Highway Belt',
                    'Sanand GIDC',
                    'Changodar & Bavla',
                    'Odhav & Naroda Industrial',
                    'Science City & Sola',
                    'South Bopal & Shela',
                    'GIFT City & Gandhinagar',
                    'Vatva & Narol',
                    'Vadodara Highway',
                  ].map((zone) => (
                    <span
                      key={zone}
                      className="px-2.5 py-1 bg-[#171C26] border border-[#252C38] text-[#F4F6FA] rounded-xs"
                    >
                      ✓ {zone}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#171C26] border border-[#252C38] p-6 rounded-xs space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider text-[#858D9B]">
                  Platform Procurement Volume
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#090B10] border border-[#252C38] rounded-xs">
                    <div className="font-mono text-2xl font-black text-[#F25C05]">₹4.2 Cr+</div>
                    <div className="text-[11px] text-[#858D9B]">Materials Quoted</div>
                  </div>
                  <div className="p-3 bg-[#090B10] border border-[#252C38] rounded-xs">
                    <div className="font-mono text-2xl font-black text-[#FFFFFF]">1,850+</div>
                    <div className="text-[11px] text-[#858D9B]">MT Steel & Cement</div>
                  </div>
                  <div className="p-3 bg-[#090B10] border border-[#252C38] rounded-xs">
                    <div className="font-mono text-2xl font-black text-[#FFFFFF]">99.2%</div>
                    <div className="text-[11px] text-[#858D9B]">On-Time Dispatch</div>
                  </div>
                  <div className="p-3 bg-[#090B10] border border-[#252C38] rounded-xs">
                    <div className="font-mono text-2xl font-black text-[#F25C05]">4.9 / 5</div>
                    <div className="text-[11px] text-[#858D9B]">Supplier Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-20 bg-[#090B10] border-b border-[#252C38]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#F25C05] font-bold">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              Construction Procurement Clarity
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#171C26] border border-[#252C38] p-6 rounded-xs space-y-2"
              >
                <h3 className="font-heading font-bold text-base text-[#FFFFFF]">
                  {faq.q}
                </h3>
                <p className="text-sm text-[#C5CAD3] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FINAL HIGH-IMPACT CTA */}
      <section className="py-20 bg-gradient-to-b from-[#171C26] to-[#090B10]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
            Require. Compare. Select. Deliver.
          </h2>
          <p className="text-base text-[#C5CAD3] max-w-2xl mx-auto leading-relaxed">
            Stop losing days negotiating over phone calls. Post your construction requirement now and receive itemized competitive quotations from verified suppliers.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/rfq/new"
              className="w-full sm:w-auto px-8 py-4 bg-[#F25C05] hover:bg-[#D94E00] text-white font-bold text-sm tracking-wider uppercase rounded-xs transition-all shadow-xl shadow-[#F25C05]/20 flex items-center justify-center gap-2"
            >
              <span>Post Requirement (RFQ)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/supplier/register"
              className="w-full sm:w-auto px-8 py-4 bg-[#090B10] hover:bg-[#1E2430] border border-[#252C38] text-[#F4F6FA] font-bold text-sm tracking-wider uppercase rounded-xs transition-colors flex items-center justify-center"
            >
              <span>Register as Supplier</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
