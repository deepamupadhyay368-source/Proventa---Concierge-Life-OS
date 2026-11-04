'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  {
    slug: 'building-materials',
    title: 'BUILDING MATERIALS (CEMENT & STEEL)',
    subtitle: 'Primary Producer Fe 550D TMT Rebars, OPC/PPC Cement & Structural Aggregates',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=1200&q=80',
    description:
      'Direct mill dispatch of TMT steel reinforcement bars, bulk 53-grade ordinary Portland cement, PPC, fly-ash bricks, sand, and blue metal aggregates.',
    materials: [
      { name: 'Fe 550D TMT Steel Rebars (8mm - 32mm)', unit: 'Metric tonnes (MT)', spec: 'IS 1786:2008 Primary Producers (Tata Tiscon, Jindal Panther)' },
      { name: '53 Grade Ordinary Portland Cement (OPC)', unit: '50kg Bags / Bulk Tankers', spec: 'IS 269:2015 Fresh Factory Dispatches (UltraTech, Ambuja)' },
      { name: 'Portland Pozzolana Cement (PPC)', unit: '50kg Bags', spec: 'IS 1489:2015 Fly-Ash Based High Durability' },
      { name: 'AAC Autoclaved Aerated Concrete Blocks', unit: 'Cubic metres (Cu.m)', spec: 'IS 2185 Part 3 Precision Tongue & Groove' },
      { name: 'Coarse Sand & Crushed River Sand', unit: 'Cubic feet (Cu.ft)', spec: 'Zone II Silt Content Under 3%' },
      { name: 'Blue Metal Aggregates (10mm & 20mm)', unit: 'Metric tonnes (MT)', spec: 'IS 383:2016 Angular Hard Basalt Crushed' },
    ],
  },
  {
    slug: 'electrical',
    title: 'ELECTRICAL SUPPLIES & DISTRIBUTION',
    subtitle: 'FRLSH Copper Wires, Armoured Power Cables & Heavy Switchgear',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    description:
      'Commercial electrical infrastructure materials from authorized dealers including multi-strand house wires, industrial cables, distribution boards, and conduit pipes.',
    materials: [
      { name: 'FR-LSH Multi-Strand Single Core Copper Wires', unit: '90m Coils / Metres', spec: 'IS 694:2010 Electrolytic Pure Copper (Polycab, Havells)' },
      { name: 'LT / HT XLPE Armoured Aluminium Cables', unit: 'Metres', spec: 'IS 7098 Part 1 & 2 Underground Grade' },
      { name: 'Heavy Duty PVC Conduit Pipes & Fittings (20mm - 32mm)', unit: 'Lengths (3m)', spec: 'IS 9537 Part 3 Flame Retardant' },
      { name: 'Distribution Boards & MCBs (10kA Breaking)', unit: 'Pieces (Nos)', spec: 'IEC 60898-1 C-Curve Protection' },
      { name: 'Modular Switches & Commercial Wall Plates', unit: 'Boxes', spec: 'IS 3854:1997 Silver Inlay Contacts' },
    ],
  },
  {
    slug: 'plumbing',
    title: 'PLUMBING & WATER SUPPLY SYSTEMS',
    subtitle: 'CPVC, UPVC, SWR Piping & Heavy Booster Pumps',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    description:
      'Complete water supply and drainage infrastructure for commercial and residential developments with hot/cold potable pressure ratings.',
    materials: [
      { name: 'SDR 11 / SDR 13.5 CPVC Pipes & Fittings', unit: 'Lengths (3m/5m)', spec: 'IS 15778 / ASTM D2846 Class 1 Hot Water (Astral, Ashirvad)' },
      { name: 'SCH 40 / SCH 80 Lead-Free UPVC Pipes', unit: 'Lengths (3m/6m)', spec: 'ASTM D1785 Potable Cold Water Distribution' },
      { name: 'Ring-Fit SWR Drainage & Soil Waste Pipes', unit: 'Lengths (3m)', spec: 'IS 13592 Type B Rubber Ring Seal' },
      { name: 'Multi-Stage Commercial Hydro-Pneumatic Booster Pumps', unit: 'Units', spec: 'Stainless Steel Impeller High Head' },
      { name: 'Triple-Layer Anti-Bacterial Overhead Water Tanks', unit: 'Litres (L)', spec: '1,000L - 10,000L Virgin Food Grade Polyethylene' },
    ],
  },
  {
    slug: 'tiles-flooring',
    title: 'TILES, MARBLE & COMMERCIAL FLOORING',
    subtitle: 'Double-Charge Vitrified Tiles, Granite Slabs & Pavers',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    description:
      'High-traffic flooring systems sourced directly from Morbi ceramic manufacturing hubs and Rajasthan quarry stockyards.',
    materials: [
      { name: 'Full-Body Double Charge Vitrified Floor Tiles (800x1600mm)', unit: 'Boxes / Sq.ft', spec: 'ISO 13006 Group BIa High Abrasion Resistance' },
      { name: 'Glazed Vitrified Architectural Wall Claddings', unit: 'Boxes / Sq.ft', spec: 'Stain Proof Nanotech Surface Finish' },
      { name: 'Black Galaxy & Premium Polished Granite Slabs', unit: 'Square feet (Sq.ft)', spec: '18mm Uniform Thickness High Gloss' },
      { name: 'Precast Heavy-Duty Concrete Interlocking Pavers (80mm)', unit: 'Square feet (Sq.ft)', spec: 'M40 Grade Industrial Vehicle Load' },
    ],
  },
  {
    slug: 'finishing-materials',
    title: 'FINISHING, PAINT & CONSTRUCTION CHEMICALS',
    subtitle: 'Elastomeric Waterproofing, Putty & Industrial Epoxies',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
    description:
      'Authorized distribution channels for professional building protection, waterproofing membranes, structural bonding, and exterior paints.',
    materials: [
      { name: 'Two-Component Acrylic Polymer Waterproofing Coating', unit: 'Pails (20kg)', spec: 'ASTM C836 Elastomeric Positive & Negative Pressure' },
      { name: 'White Cement Based Water-Resistant Wall Putty', unit: '40kg Bags', spec: 'Silicone Enriched High Adhesion' },
      { name: 'Heavy Commercial Epoxy Floor Coating System', unit: 'Litres (L)', spec: 'Solvent-Free High Impact Anti-Skid' },
      { name: 'Exterior Anti-Fungal Weatherproof Acrylic Emulsion', unit: 'Buckets (20L)', spec: '10-Year Comprehensive Warranty Performance' },
    ],
  },
  {
    slug: 'doors-windows',
    title: 'DOORS, WINDOWS & HARDWARE',
    subtitle: 'Aluminium Glazing, UPVC Profiles & Fire-Rated Doors',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    description:
      'Factory fabricated structural windows, commercial entryways, fire-rated shaft doors, and stainless steel hardware collections.',
    materials: [
      { name: 'Thermal-Break Architectural Aluminium Sliding Windows', unit: 'Square Metres (Sq.m)', spec: '6063 T6 Alloy Powder Coated Toughened Glass' },
      { name: 'Multi-Chamber UPVC Casement Windows & Doors', unit: 'Square Metres (Sq.m)', spec: 'EPDM Gaskets High Wind Load Compliant' },
      { name: '2-Hour Fire-Rated Galvanized Steel Emergency Doors', unit: 'Units / Sets', spec: 'BS 476 Part 22 & IS 3614 Panic Hardware' },
      { name: 'SS 304 Grade Heavy-Duty Ball Bearing Mortise Locks & Hinges', unit: 'Sets (Nos)', spec: 'EN 12209 Cycle Tested Heavy Duty' },
    ],
  },
];

export default function CategoriesCataloguePage() {
  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans">
      {/* Header Banner */}
      <section className="border-b border-[#414957] bg-[#252B38] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#191B20] border border-[#414957] text-xs font-mono text-[#C66A42] uppercase tracking-wider font-semibold rounded-sm">
            <span>TECHNICAL SPECIFICATIONS DIRECTORY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#FFFFFF] max-w-4xl font-heading leading-tight">
            COMMERCIAL MATERIAL CATALOGUE
          </h1>
          <p className="text-sm sm:text-base text-[#A8ADB7] max-w-3xl leading-relaxed">
            Standard construction materials available for wholesale procurement, competitive quotation bidding, and coordinated site delivery across Gujarat.
          </p>
        </div>
      </section>

      {/* Catalogue Sections */}
      <section className="py-20 bg-[#292F3D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.slug}
              id={cat.slug}
              className="bg-[#303746] border border-[#414957] shadow-sm scroll-mt-24 overflow-hidden rounded-sm"
            >
              {/* Category Top Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-[#414957]">
                <div className="lg:col-span-8 p-8 lg:p-10 space-y-4">
                  <div className="font-mono text-xs uppercase tracking-widest text-[#536B88] font-bold">
                    PRIMARY MATERIAL DIVISION
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF]">
                    {cat.title}
                  </h2>
                  <div className="text-xs font-mono text-[#C66A42] font-bold">
                    {cat.subtitle}
                  </div>
                  <p className="text-xs sm:text-sm text-[#A8ADB7] leading-relaxed max-w-3xl">
                    {cat.description}
                  </p>
                </div>

                <div className="lg:col-span-4 relative aspect-[16/9] lg:aspect-auto bg-[#191B20] border-t lg:border-t-0 lg:border-l border-[#414957]">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#303746]/80 via-transparent to-transparent" />
                </div>
              </div>

              {/* Items Table */}
              <div className="p-6 lg:p-8">
                <div className="font-mono text-xs uppercase tracking-wider text-[#FFFFFF] font-bold pb-3 mb-4 border-b border-[#414957]">
                  Standard Specification & Order Units
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-[#414957] font-mono uppercase text-[#A8ADB7]">
                        <th className="py-2.5 pr-4">Material Classification</th>
                        <th className="py-2.5 px-4">Standard Procurement Unit</th>
                        <th className="py-2.5 pl-4">Engineering Spec & Primary Brands</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#414957]">
                      {cat.materials.map((m, idx) => (
                        <tr key={idx} className="hover:bg-[#252B38] transition-colors">
                          <td className="py-3 pr-4 font-bold text-[#F1F2F4]">{m.name}</td>
                          <td className="py-3 px-4 font-mono text-[#536B88] font-bold">{m.unit}</td>
                          <td className="py-3 pl-4 text-[#A8ADB7] font-mono text-[11px]">{m.spec}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-6 mt-6 border-t border-[#414957] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-[#A8ADB7]">
                    Need custom volumes, non-standard lengths, or specific test certificates?
                  </div>
                  <Link
                    href={`/rfq/new?category=${cat.slug}`}
                    className="px-6 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 rounded-sm shadow-sm"
                  >
                    <span>Request Quotation for {cat.title.split(' (')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
