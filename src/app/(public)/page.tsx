'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  ShieldCheck,
  Truck,
  Building2,
  CheckCircle2,
  FileText,
  Scale,
  MapPin,
  ChevronRight,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';

const CORE_CATEGORIES = [
  {
    id: 'building-materials',
    name: 'Building Materials',
    spec: 'IS 1786 Fe 550D Rebars, IS 269:2015 53/43 Grade OPC & PPC, River Sand & Aggregates',
    unit: 'Metric Tonnes (MT) / Bags (50kg) / Cu.ft',
    brands: ['UltraTech', 'Ambuja', 'Tata Tiscon', 'Jindal Panther', 'Kamdhenu'],
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?q=80&w=800&auto=format&fit=crop',
    alt: 'TMT steel reinforcement bars and structural concrete construction yard',
  },
  {
    id: 'electrical',
    name: 'Electrical Supplies',
    spec: 'FRLS-H Multi-Strand Copper Wires, Armoured HT/LT Power Cables, MCBs, Industrial DBs',
    unit: 'Metres (m) / 100m Coils / Pieces',
    brands: ['Polycab', 'Havells', 'RR Kabel', 'Schneider Electric', 'Legrand'],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
    alt: 'Heavy industrial power distribution cables and electrical switchgear assembly',
  },
  {
    id: 'plumbing',
    name: 'Plumbing & Water Systems',
    spec: 'CPVC Pro SDR 11 & Schedule 40/80 Pipes, Heavy Pressure Fittings, Overhead Storage Tanks',
    unit: 'Pieces (3m/5m Lengths) / Capacity (Litres)',
    brands: ['Astral', 'Ashirvad', 'Supreme', 'Sintex', 'Jaquar'],
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=800&auto=format&fit=crop',
    alt: 'Industrial plumbing valves, water supply lines and pressure pipe distribution',
  },
  {
    id: 'tiles-flooring',
    name: 'Tiles & Flooring',
    spec: 'Double Charge & Glazed Vitrified Tiles (GVT/PGVT), Natural Italian Marble, Polished Granite',
    unit: 'Square Feet (Sq.ft) / Boxes',
    brands: ['Kajaria', 'Somany', 'Simpolo', 'Qutone', 'Morbi Natural Granite'],
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
    alt: 'Polished architectural stone slabs and large-format vitrified porcelain tiles',
  },
  {
    id: 'finishing-materials',
    name: 'Finishing Materials',
    spec: 'Exterior Weatherproof Emulsions, Polyurethane Waterproofing, Polymer Tile Adhesives',
    unit: 'Litres (20L Buckets) / Bags (20kg/40kg)',
    brands: ['Asian Paints', 'Berger', 'Dr. Fixit', 'Pidilite Roff', 'Birla White'],
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop',
    alt: 'Commercial coating application and industrial surface waterproofing systems',
  },
  {
    id: 'doors-windows',
    name: 'Doors, Windows & Hardware',
    spec: 'Architectural Aluminium Sections, UPVC Acoustic Multi-Chamber Profiles, Mortise Locks',
    unit: 'Square Feet (Sq.ft) / Sets / Pieces',
    brands: ['Jindal Aluminium', 'Fenesta', 'Century Plywood', 'Godrej', 'Dorset'],
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    alt: 'Heavy duty aluminium architectural glazing frames and industrial hardware',
  },
];

const PROCUREMENT_STEPS = [
  {
    num: '01',
    title: 'CREATE REQUIREMENT',
    subtitle: 'Define Materials & Site Schedule',
    desc: 'Submit exact quantities, standard industrial units (MT, Bags, Cu.ft), delivery schedule, and optional BOQ documents for multi-item packages.',
  },
  {
    num: '02',
    title: 'INVITE SUPPLIERS',
    subtitle: 'Direct Routing to Verified Dealers',
    desc: 'The requirement is routed directly to authorised stockists and manufacturers in the designated operating zone who carry verified inventory.',
  },
  {
    num: '03',
    title: 'RECEIVE QUOTATIONS',
    subtitle: 'Itemized Commercial Bids',
    desc: 'Suppliers provide itemized unit rates, applicable GST rates, freight transportation charges, payment terms, and delivery timeframes.',
  },
  {
    num: '04',
    title: 'COMPARE & SELECT',
    subtitle: 'Transparent Side-by-Side Matrix',
    desc: 'Review quotations side-by-side on total landed cost. The buyer selects the preferred supplier with zero automatic commitment.',
  },
  {
    num: '05',
    title: 'COORDINATE DELIVERY',
    subtitle: 'Vehicle Dispatch & E-Way Bill',
    desc: 'Purchase order is issued directly. Track loading, vehicle number, assigned driver, E-Way bill generation, and transit progress.',
  },
  {
    num: '06',
    title: 'CONFIRM & COMPLETE',
    subtitle: 'Site Inspection & Digital POD',
    desc: 'Site supervisor inspects materials upon physical arrival, validates challan counts, records any discrepancies, and signs off delivery.',
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
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans">
      {/* 1. HERO SECTION — Powerful Corporate Editorial Layout */}
      <section className="relative border-b border-[#252C38] bg-[#090B10]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-stretch">
            {/* Left Column: Industrial Typography & Action */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171C26] border border-[#252C38] text-[11px] font-mono tracking-wider uppercase text-[#C5CAD3]">
                  <span className="w-2 h-2 bg-[#F25C05]" />
                  <span>COMMERCIAL PROCUREMENT PLATFORM · INDIA</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#FFFFFF] leading-[1.05] font-sans">
                  CONSTRUCTION PROCUREMENT. <br />
                  <span className="text-[#F25C05]">MADE MORE EFFICIENT.</span>
                </h1>

                <p className="text-base sm:text-lg text-[#C5CAD3] max-w-xl leading-relaxed font-normal">
                  Connect with verified construction material suppliers, compare competitive quotations and coordinate delivery directly to your project site.
                </p>

                {/* Primary & Secondary CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Link
                    href="/rfq/new"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#F25C05] hover:bg-[#D94E00] text-[#090B10] font-black text-xs uppercase tracking-widest transition-colors font-mono"
                  >
                    <span>POST YOUR REQUIREMENT</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                  <Link
                    href="/supplier/register"
                    className="inline-flex items-center justify-center gap-3 px-7 py-4 bg-[#171C26] hover:bg-[#202735] border border-[#252C38] text-[#F4F6FA] font-bold text-xs uppercase tracking-widest transition-colors font-mono"
                  >
                    <span>BECOME A SUPPLIER</span>
                  </Link>
                </div>
              </div>

              {/* Verified Operational Facts */}
              <div className="pt-8 border-t border-[#252C38] grid grid-cols-3 gap-6 font-mono text-xs">
                <div>
                  <div className="text-[10px] text-[#858D9B] uppercase tracking-wider">SUPPLIER VERIFICATION</div>
                  <div className="text-sm font-bold text-[#F4F6FA] mt-1">100% GST & Yard Verified</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#858D9B] uppercase tracking-wider">QUOTATION MODEL</div>
                  <div className="text-sm font-bold text-[#F4F6FA] mt-1">Direct Wholesale Bids</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#858D9B] uppercase tracking-wider">DISPATCH DISCLOSURE</div>
                  <div className="text-sm font-bold text-[#F4F6FA] mt-1">E-Way Bill & Driver Log</div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Quality Realistic Industrial Photography */}
            <div className="lg:col-span-5 relative flex flex-col">
              <div className="relative w-full h-[360px] sm:h-[460px] lg:h-full min-h-[380px] bg-[#171C26] border border-[#252C38] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop"
                  alt="Commercial reinforced concrete construction structure and heavy material staging"
                  fill
                  priority
                  className="object-cover object-center filter grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-transparent to-transparent opacity-80" />
                
                {/* Real Operational Caption Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#252C38]/80 bg-[#090B10]/90 font-mono text-xs text-[#C5CAD3]">
                  <div className="flex items-center justify-between text-[11px] text-[#858D9B] pb-1 border-b border-[#252C38] mb-2">
                    <span>SECTOR INFRASTRUCTURE</span>
                    <span className="text-[#F25C05]">GUJARAT NETWORK</span>
                  </div>
                  <div className="text-xs text-[#F4F6FA] font-semibold">
                    Direct bulk delivery coordination for TMT steel, ready-mix concrete, cement, and MEP packages.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK SPECIFICATION / REQUIREMENT BAR */}
      <section className="bg-[#171C26] border-b border-[#252C38] py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-3">
              <label htmlFor="quick-category" className="sr-only">Material Category</label>
              <select
                id="quick-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-12 bg-[#090B10] border border-[#252C38] px-3.5 text-xs font-mono uppercase tracking-wider text-[#F4F6FA] focus:border-[#F25C05] focus:outline-none"
              >
                <option value="building-materials">Building Materials (Steel, Cement, Sand)</option>
                <option value="electrical">Electrical Supplies & Cables</option>
                <option value="plumbing">Plumbing & Water Systems</option>
                <option value="tiles-flooring">Tiles, Marble & Granite</option>
                <option value="finishing-materials">Finishing & Waterproofing</option>
                <option value="doors-windows">Doors, Windows & Hardware</option>
              </select>
            </div>
            <div className="md:col-span-6">
              <label htmlFor="quick-specs" className="sr-only">Material Requirement Specifications</label>
              <input
                id="quick-specs"
                type="text"
                placeholder="E.g. 50 MT Tata Tiscon Fe 550D TMT Rebars (16mm, 20mm, 25mm) to Changodar site..."
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                className="w-full h-12 bg-[#090B10] border border-[#252C38] px-4 text-xs font-sans text-[#F4F6FA] placeholder-[#858D9B] focus:border-[#F25C05] focus:outline-none"
              />
            </div>
            <div className="md:col-span-3">
              <button
                type="submit"
                className="w-full h-12 bg-[#F25C05] hover:bg-[#D94E00] text-[#090B10] font-black text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
              >
                <span>REQUEST QUOTATIONS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. SIX-STEP PROCUREMENT PROCESS — Clean, Numbered Editorial Architecture */}
      <section className="py-20 lg:py-28 border-b border-[#252C38] bg-[#090B10]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#252C38]">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-[#F25C05] mb-2 font-semibold">
                OPERATIONAL ARCHITECTURE
              </div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF]">
                SIX-STEP PROCUREMENT PROCESS
              </h2>
            </div>
            <div className="text-xs font-mono text-[#858D9B] max-w-md">
              From specification drafting to verified on-site material inspection. Every step is transparent, tracked, and verifiable.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#252C38] border border-[#252C38] mt-10">
            {PROCUREMENT_STEPS.map((s) => (
              <div
                key={s.num}
                className="bg-[#090B10] p-8 flex flex-col justify-between space-y-6 hover:bg-[#171C26] transition-colors"
              >
                <div className="space-y-4">
                  <div className="font-mono text-3xl font-black text-[#F25C05] tracking-tighter">
                    {s.num}
                  </div>
                  <h3 className="font-sans text-lg font-black uppercase tracking-wide text-[#FFFFFF]">
                    {s.title}
                  </h3>
                  <div className="font-mono text-xs text-[#858D9B] uppercase tracking-wider">
                    {s.subtitle}
                  </div>
                  <p className="text-xs text-[#C5CAD3] leading-relaxed font-normal pt-2">
                    {s.desc}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#252C38]/60 flex items-center justify-between text-[11px] font-mono text-[#858D9B]">
                  <span>STAGE STATUS</span>
                  <span className="text-[#F4F6FA] font-semibold">VERIFIED PROTOCOL</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MATERIAL CATEGORY CATALOGUE — Authentic Product Photography & Specifications */}
      <section className="py-20 lg:py-28 border-b border-[#252C38] bg-[#171C26]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#252C38]">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-[#F25C05] mb-2 font-semibold">
                PRODUCT & MATERIAL CATALOGUE
              </div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF]">
                PRIMARY PROCUREMENT CATEGORIES
              </h2>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F25C05] hover:text-[#FFFFFF] transition-colors"
            >
              <span>View Complete Material Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {CORE_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="bg-[#090B10] border border-[#252C38] flex flex-col justify-between overflow-hidden group hover:border-[#858D9B] transition-colors"
              >
                {/* Realistic Product Image */}
                <div className="relative h-48 w-full bg-[#171C26] overflow-hidden border-b border-[#252C38]">
                  <Image
                    src={cat.image}
                    alt={cat.alt}
                    fill
                    className="object-cover object-center filter grayscale group-hover:grayscale-0 contrast-110 transition-all duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#090B10] border border-[#252C38] px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[#F4F6FA]">
                    {cat.name}
                  </div>
                </div>

                {/* Details & Technical Specifications */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="font-sans text-base font-black uppercase tracking-wide text-[#FFFFFF]">
                      {cat.name}
                    </h3>
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="text-[11px] text-[#858D9B] uppercase">SPECIFICATIONS:</div>
                      <div className="text-xs text-[#C5CAD3] leading-relaxed font-sans">{cat.spec}</div>
                    </div>
                    <div className="space-y-1 text-xs font-mono">
                      <div className="text-[11px] text-[#858D9B] uppercase">STANDARD UNITS:</div>
                      <div className="text-xs text-[#F25C05] font-semibold">{cat.unit}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#252C38] space-y-3">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#858D9B]">
                      AVAILABLE BRANDS:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.brands.map((b) => (
                        <span
                          key={b}
                          className="px-2 py-0.5 bg-[#171C26] border border-[#252C38] text-[11px] font-mono text-[#C5CAD3]"
                        >
                          {b}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/rfq/new?category=${cat.id}`}
                      className="mt-3 w-full py-2.5 bg-[#171C26] hover:bg-[#F25C05] hover:text-[#090B10] text-[#F4F6FA] text-xs font-mono uppercase tracking-widest font-bold flex items-center justify-center gap-2 border border-[#252C38] transition-colors"
                    >
                      <span>REQUEST QUOTATION</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. QUOTATION COMPARISON SAMPLE — Real Procurement Tool Experience */}
      <section className="py-20 lg:py-28 border-b border-[#252C38] bg-[#090B10]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#252C38]">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-[#F25C05] mb-2 font-semibold">
                DECISION ARCHITECTURE
              </div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF]">
                TRANSPARENT QUOTATION COMPARISON
              </h2>
            </div>
            <div className="text-xs font-mono text-[#858D9B] max-w-md">
              Every quotation shows itemized unit rates, GST percentage, freight, and net landed cost. Zero hidden fees.
            </div>
          </div>

          {/* Structured Procurement Comparison Table */}
          <div className="mt-10 overflow-x-auto border border-[#252C38] bg-[#171C26]">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#090B10] text-[#858D9B] border-b border-[#252C38] text-[11px] uppercase tracking-wider">
                  <th className="p-4 border-r border-[#252C38]">SUPPLIER</th>
                  <th className="p-4 border-r border-[#252C38]">SPECIFICATION / BRAND</th>
                  <th className="p-4 border-r border-[#252C38] text-right">QUANTITY</th>
                  <th className="p-4 border-r border-[#252C38] text-right">UNIT RATE</th>
                  <th className="p-4 border-r border-[#252C38] text-right">GST %</th>
                  <th className="p-4 border-r border-[#252C38] text-right">FREIGHT</th>
                  <th className="p-4 border-r border-[#252C38] text-right text-[#FFFFFF]">LANDED COST</th>
                  <th className="p-4 border-r border-[#252C38]">LEAD TIME</th>
                  <th className="p-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252C38] text-[#C5CAD3]">
                <tr className="hover:bg-[#090B10]/70 transition-colors">
                  <td className="p-4 border-r border-[#252C38]">
                    <div className="font-bold text-[#F4F6FA]">Gujarat Building Materials Syndicate</div>
                    <div className="text-[10px] text-[#858D9B]">GSTIN: 24AAACG1928K1Z5 · Odhav Yard</div>
                  </td>
                  <td className="p-4 border-r border-[#252C38]">
                    <div className="text-[#F4F6FA]">Tata Tiscon Fe 550D Rebars</div>
                    <div className="text-[10px] text-[#858D9B]">IS 1786 primary mill certified</div>
                  </td>
                  <td className="p-4 border-r border-[#252C38] text-right font-bold text-[#F4F6FA]">50 MT</td>
                  <td className="p-4 border-r border-[#252C38] text-right">₹54,200/MT</td>
                  <td className="p-4 border-r border-[#252C38] text-right">18%</td>
                  <td className="p-4 border-r border-[#252C38] text-right">₹18,000</td>
                  <td className="p-4 border-r border-[#252C38] text-right font-bold text-[#F25C05] text-sm">
                    ₹32,20,840
                  </td>
                  <td className="p-4 border-r border-[#252C38]">2 Days (Direct)</td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 bg-[#F25C05] text-[#090B10] text-[10px] font-black uppercase tracking-wider">
                      SELECTABLE
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#090B10]/70 transition-colors">
                  <td className="p-4 border-r border-[#252C38]">
                    <div className="font-bold text-[#F4F6FA]">Sabarmati Steel & Concrete Solutions</div>
                    <div className="text-[10px] text-[#858D9B]">GSTIN: 24BBECS7712M1Z2 · Changodar</div>
                  </td>
                  <td className="p-4 border-r border-[#252C38]">
                    <div className="text-[#F4F6FA]">Jindal Panther Fe 550D Rebars</div>
                    <div className="text-[10px] text-[#858D9B]">Factory test certificate attached</div>
                  </td>
                  <td className="p-4 border-r border-[#252C38] text-right font-bold text-[#F4F6FA]">50 MT</td>
                  <td className="p-4 border-r border-[#252C38] text-right">₹54,800/MT</td>
                  <td className="p-4 border-r border-[#252C38] text-right">18%</td>
                  <td className="p-4 border-r border-[#252C38] text-right">₹14,500</td>
                  <td className="p-4 border-r border-[#252C38] text-right font-bold text-[#F25C05] text-sm">
                    ₹32,47,700
                  </td>
                  <td className="p-4 border-r border-[#252C38]">3 Days</td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 bg-[#171C26] border border-[#252C38] text-[#C5CAD3] text-[10px] uppercase tracking-wider">
                      REVIEW
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#858D9B]">
            <div>* Landed cost includes (Quantity × Unit Rate) + GST + Designated Site Freight.</div>
            <Link
              href="/buyer/rfqs/rfq-demo-ahmedabad-001/compare"
              className="text-[#F25C05] hover:underline flex items-center gap-1.5"
            >
              <span>Explore live interactive quotation comparison interface</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. TRUST, CREDIBILITY & GOVERNANCE */}
      <section className="py-20 lg:py-28 border-b border-[#252C38] bg-[#171C26]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="pb-12 border-b border-[#252C38]">
            <div className="font-mono text-xs uppercase tracking-widest text-[#F25C05] mb-2 font-semibold">
              TRUST & GOVERNANCE PROTOCOLS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFFFF]">
              HOW PROVENTA OPERATES IN THE REAL INDUSTRY
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <div className="space-y-3 bg-[#090B10] p-6 border border-[#252C38]">
              <div className="font-mono text-xs text-[#F25C05] font-bold">01 · SUPPLIER VERIFICATION</div>
              <h3 className="text-base font-bold text-[#FFFFFF]">Physical Yard & GST Checks</h3>
              <p className="text-xs text-[#C5CAD3] leading-relaxed">
                Suppliers undergo GSTIN active status check, verified trade references, physical stockyard address validation, and authorized manufacturer dealership certificates.
              </p>
            </div>

            <div className="space-y-3 bg-[#090B10] p-6 border border-[#252C38]">
              <div className="font-mono text-xs text-[#F25C05] font-bold">02 · ITEMISED PRICING</div>
              <h3 className="text-base font-bold text-[#FFFFFF]">Transparent Commercial Bids</h3>
              <p className="text-xs text-[#C5CAD3] leading-relaxed">
                Quotation structures require separate disclosures for basic material unit price, GST percentages, transport/unloading freight, and payment credit terms.
              </p>
            </div>

            <div className="space-y-3 bg-[#090B10] p-6 border border-[#252C38]">
              <div className="font-mono text-xs text-[#F25C05] font-bold">03 · INDEPENDENT SELECTION</div>
              <h3 className="text-base font-bold text-[#FFFFFF]">Zero Automated Lock-In</h3>
              <p className="text-xs text-[#C5CAD3] leading-relaxed">
                The platform never automatically locks buyers to a supplier. Contractors and builders retain full commercial discretion to accept or negotiate any offer.
              </p>
            </div>

            <div className="space-y-3 bg-[#090B10] p-6 border border-[#252C38]">
              <div className="font-mono text-xs text-[#F25C05] font-bold">04 · DISPATCH GOVERNANCE</div>
              <h3 className="text-base font-bold text-[#FFFFFF]">Transport & Driver Logs</h3>
              <p className="text-xs text-[#C5CAD3] leading-relaxed">
                Suppliers must declare the assigned commercial vehicle number (e.g. 10-Wheeler, Tata Ace), driver name, phone number, and mandatory E-Way bill prior to dispatch.
              </p>
            </div>

            <div className="space-y-3 bg-[#090B10] p-6 border border-[#252C38]">
              <div className="font-mono text-xs text-[#F25C05] font-bold">05 · SHORTAGE & DAMAGE LOG</div>
              <h3 className="text-base font-bold text-[#FFFFFF]">Site Receipt Verification</h3>
              <p className="text-xs text-[#C5CAD3] leading-relaxed">
                Site supervisors inspect incoming material bags, rebar bundles, or tiles. Damaged or short-delivered quantities are logged digitally with photo proofs before sign-off.
              </p>
            </div>

            <div className="space-y-3 bg-[#090B10] p-6 border border-[#252C38]">
              <div className="font-mono text-xs text-[#F25C05] font-bold">06 · CONTRACTOR DISCRETION</div>
              <h3 className="text-base font-bold text-[#FFFFFF]">Auditable Purchase Orders</h3>
              <p className="text-xs text-[#C5CAD3] leading-relaxed">
                Every confirmed order generates an immutable, sequentially numbered Purchase Order (PO-XXXXX) archived permanently for company audits and tax filings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM ACTION BANNER */}
      <section className="py-16 bg-[#090B10] border-t border-[#252C38]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-[#171C26] border border-[#252C38] p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <div className="font-mono text-xs text-[#F25C05] font-bold uppercase tracking-wider">
                GET STARTED ON YOUR NEXT PROJECT
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#FFFFFF]">
                READY TO STREAMLINE YOUR CONSTRUCTION PROCUREMENT?
              </h2>
              <p className="text-xs sm:text-sm text-[#C5CAD3]">
                Post your material requirement or Bill of Quantities today to receive itemized quotations from verified Gujarat distributors.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 font-mono text-xs">
              <Link
                href="/rfq/new"
                className="px-8 py-4 bg-[#F25C05] hover:bg-[#D94E00] text-[#090B10] font-black uppercase tracking-widest text-center transition-colors"
              >
                POST REQUIREMENT
              </Link>
              <Link
                href="/for-buyers"
                className="px-6 py-4 bg-[#090B10] border border-[#252C38] hover:border-[#858D9B] text-[#F4F6FA] font-bold uppercase tracking-widest text-center transition-colors"
              >
                BUYER INFORMATION
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
