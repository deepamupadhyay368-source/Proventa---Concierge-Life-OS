'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  ShieldCheck,
  Check,
  Package,
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'building-materials',
    name: 'Building Materials',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?q=80&w=800&auto=format&fit=crop',
    description: 'Foundation, framing and structural materials essential for all commercial and civil construction phases.',
    subcategories: [
      { name: 'Cement (OPC 43/53, PPC, White)', specs: '50kg HDPE laminated moisture-proof bags, IS 269:2015', unit: 'Bags (50kg)' },
      { name: 'TMT Steel Rebars (Fe 500D / 550D)', specs: '8mm to 32mm mixed diameter bundles, IS 1786 primary mill certified', unit: 'Metric Tonnes (MT)' },
      { name: 'Sand & Crushed Aggregates', specs: 'Washed river sand, M-sand, Kapchi (10mm, 20mm crushed blue metal)', unit: 'Cubic Feet (Cu.ft)' },
      { name: 'Bricks & AAC Lightweight Blocks', specs: 'Kiln clay bricks, fly-ash bricks, high-strength AAC autoclaved blocks', unit: 'Pieces (Nos)' },
      { name: 'Ready-Mix Concrete (RMC M20 - M40)', specs: 'Transit-mixer delivery with automated batch plant quality slips', unit: 'Cubic Metres (Cu.m)' },
    ],
    brands: ['UltraTech', 'Ambuja', 'Tata Tiscon', 'Jindal Panther', 'Kamdhenu', 'ACC', 'Siporex'],
  },
  {
    id: 'electrical',
    name: 'Electrical Supplies',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
    description: 'Industrial cables, building wire, circuit protection switchgear, and architectural distribution systems.',
    subcategories: [
      { name: 'FRLS Copper Wires & Armoured Cables', specs: '1.5 sq mm to 16 sq mm building wire, 1100V LT/HT armoured cables', unit: '100m Coils / Metres' },
      { name: 'Modular Switches, Plates & Sockets', specs: '6A to 32A polycarbonate flame-retardant accessories with child safety', unit: 'Pieces (Nos)' },
      { name: 'Distribution Boards & MCBs', specs: 'SPN, TPN, 4-Pole isolators, 30mA RCCB protection with IP43 enclosures', unit: 'Pieces (Nos)' },
      { name: 'Commercial & Architectural Lighting', specs: 'Recessed LED panels, high-bay factory lights, floodlights', unit: 'Pieces (Nos)' },
      { name: 'PVC Conduits & Cable Trays', specs: 'Heavy mechanical strength 20mm/25mm conduit pipes & perforated GI trays', unit: 'Metres / Pieces' },
    ],
    brands: ['Polycab', 'Havells', 'RR Kabel', 'Schneider Electric', 'Legrand', 'Philips'],
  },
  {
    id: 'plumbing',
    name: 'Plumbing & Water Systems',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=800&auto=format&fit=crop',
    description: 'Internal water distribution, drainage pipelines, heavy pressure fittings, and sanitary fixtures.',
    subcategories: [
      { name: 'CPVC & UPVC Pressure Pipes & Fittings', specs: 'SDR 11, Schedule 40/80 hot and cold water certified pipelines', unit: 'Pieces (3m/5m Lengths)' },
      { name: 'Submersible Pumps & Pressure Boosters', specs: 'Single-phase & 3-phase open-well, borewell, and hydrostatic boosters', unit: 'Pieces (Nos)' },
      { name: 'Overhead Anti-Bacterial Storage Tanks', specs: '3-layer and 4-layer virgin food-grade polymer (500L to 5000L)', unit: 'Capacity (Litres)' },
      { name: 'Commercial Sanitaryware & Brass Faucets', specs: 'Vitreous china water closets, sensor urinals, and chrome brass fittings', unit: 'Pieces (Nos)' },
    ],
    brands: ['Astral', 'Ashirvad', 'Supreme', 'Sintex', 'Jaquar', 'Cera', 'Kohler'],
  },
  {
    id: 'tiles-flooring',
    name: 'Tiles & Flooring',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
    description: 'High-traffic vitrified floor tiles, ceramic wall decor, natural marble slabs, and granite.',
    subcategories: [
      { name: 'Vitrified Tiles (GVT / PGVT / Double Charge)', specs: '600x1200mm, 800x1600mm, high breaking strength and abrasion resistance', unit: 'Square Feet (Sq.ft)' },
      { name: 'Natural Italian & Indian Marble Slabs', specs: 'Direct gangsaw polished slabs with consistent veining and hardness', unit: 'Square Feet (Sq.ft)' },
      { name: 'Granite Countertops & Step Slabs', specs: 'Flamed, leather-finish, and mirror polished Black Galaxy and Rajasthan stone', unit: 'Square Feet (Sq.ft)' },
      { name: 'Exterior Paver Blocks & Interlocking Stone', specs: '60mm / 80mm industrial heavy-traffic pavers with M35 grade concrete', unit: 'Square Feet (Sq.ft)' },
    ],
    brands: ['Kajaria', 'Somany', 'Simpolo', 'Qutone', 'Natural Morbi Stone'],
  },
  {
    id: 'finishing-materials',
    name: 'Finishing Materials',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop',
    description: 'Exterior weatherproof coatings, waterproof membranes, polymer putty, and tile adhesives.',
    subcategories: [
      { name: 'Interior & Exterior Emulsion Paint', specs: 'UV-resistant exterior silicon coatings, low VOC anti-fungal emulsions', unit: 'Litres (20L Buckets)' },
      { name: 'Waterproofing Membranes & Chemicals', specs: 'Polyurethane coatings, elastomeric cementitious systems, SBR bond agents', unit: 'Bags / Kilograms' },
      { name: 'Polymer Tile Adhesives & Epoxy Grouts', specs: 'Type 1, Type 2, Type 3 high shear-bond adhesives for large slabs', unit: 'Bags (20kg/40kg)' },
      { name: 'Polymer Wall Putty & Base Plaster', specs: 'White cement based water-resistant smooth leveling skim coats', unit: 'Bags (40kg)' },
    ],
    brands: ['Asian Paints', 'Berger', 'Dr. Fixit', 'Pidilite Roff', 'Birla White', 'Fosroc'],
  },
  {
    id: 'doors-windows',
    name: 'Doors, Windows & Hardware',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    description: 'Aluminium architectural framing, UPVC soundproof systems, flush doors, and architectural locks.',
    subcategories: [
      { name: 'Aluminium Section Sliding Systems', specs: '27mm, 35mm Domal series, Euro groove powder coated and anodized', unit: 'Square Feet (Sq.ft)' },
      { name: 'UPVC Acoustic Casement & Sliding Windows', specs: 'Multi-chamber galvanized steel reinforced UPVC, DGU acoustic glass', unit: 'Square Feet (Sq.ft)' },
      { name: 'Flush Doors & Waterproof BWP Plywood', specs: 'IS 2202 solid core hardwood flush doors, IS 710 marine grade plywood', unit: 'Pieces (Nos)' },
      { name: 'Architectural Hardware & Mortise Locks', specs: 'SS 304 architectural mortise handles, heavy-duty concealed hinges', unit: 'Sets / Pieces' },
    ],
    brands: ['Jindal Aluminium', 'Fenesta', 'Century Plywood', 'Godrej', 'Dorset', 'Yale'],
  },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans">
      {/* Header */}
      <section className="border-b border-[#252C38] bg-[#090B10] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171C26] border border-[#252C38] text-[11px] font-mono text-[#F25C05] uppercase tracking-wider font-semibold">
            <span>MATERIAL TAXONOMY & STANDARDIZED UNITS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#FFFFFF] max-w-4xl font-sans">
            COMMERCIAL MATERIAL CATALOGUE
          </h1>
          <p className="text-sm sm:text-base text-[#C5CAD3] max-w-3xl leading-relaxed font-normal">
            Standard industrial specifications, units of measurement, authorized brands, and verified supplier networks covering Ahmedabad, Gandhinagar, and Gujarat.
          </p>
        </div>
      </section>

      {/* Categories Detailed List */}
      <section className="py-20 bg-[#090B10]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              id={cat.id}
              className="bg-[#171C26] border border-[#252C38] p-8 lg:p-10 space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-6 border-b border-[#252C38]">
                <div className="lg:col-span-8 space-y-2">
                  <h2 className="font-sans font-black text-2xl uppercase tracking-tight text-[#FFFFFF]">
                    {cat.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#C5CAD3] font-normal leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="lg:col-span-4 flex lg:justify-end">
                  <Link
                    href={`/rfq/new?category=${cat.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#F25C05] hover:bg-[#D94E00] text-[#090B10] font-black text-xs font-mono uppercase tracking-widest transition-colors"
                  >
                    <span>POST {cat.name.toUpperCase()} RFQ</span>
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                </div>
              </div>

              {/* Subcategories Data Table */}
              <div className="overflow-x-auto border border-[#252C38] bg-[#090B10]">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#171C26] text-[#858D9B] border-b border-[#252C38] text-[11px] uppercase tracking-wider">
                      <th className="p-4 border-r border-[#252C38]">MATERIAL CLASSIFICATION</th>
                      <th className="p-4 border-r border-[#252C38]">TECHNICAL SPECIFICATION / STANDARDS</th>
                      <th className="p-4 border-r border-[#252C38]">STANDARD ORDER UNIT</th>
                      <th className="p-4 text-center">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252C38] text-[#C5CAD3]">
                    {cat.subcategories.map((sub, i) => (
                      <tr key={i} className="hover:bg-[#171C26]/60 transition-colors">
                        <td className="p-4 border-r border-[#252C38] font-bold text-[#F4F6FA]">
                          {sub.name}
                        </td>
                        <td className="p-4 border-r border-[#252C38] text-xs font-sans text-[#C5CAD3]">
                          {sub.specs}
                        </td>
                        <td className="p-4 border-r border-[#252C38] text-xs font-mono text-[#F25C05] font-semibold">
                          {sub.unit}
                        </td>
                        <td className="p-4 text-center">
                          <Link
                            href={`/rfq/new?category=${cat.id}&item=${encodeURIComponent(sub.name)}`}
                            className="px-3 py-1 bg-[#171C26] hover:bg-[#F25C05] hover:text-[#090B10] text-[#F4F6FA] text-[10px] font-mono uppercase tracking-wider border border-[#252C38] transition-colors"
                          >
                            QUOTE
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Brand Distribution Network */}
              <div className="pt-4 flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-[#858D9B]">
                  AUTHORIZED BRANDS SOURCED:
                </span>
                {cat.brands.map((b) => (
                  <span
                    key={b}
                    className="px-2.5 py-1 bg-[#090B10] border border-[#252C38] text-xs font-mono text-[#F4F6FA]"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
