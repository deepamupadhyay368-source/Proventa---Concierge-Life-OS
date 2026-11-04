import Link from 'next/link';
import {
  Hammer,
  Zap,
  Droplets,
  Grid,
  Paintbrush,
  DoorClosed,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { CONSTRUCTION_UNITS } from '@/lib/brand';

const CATEGORIES = [
  {
    id: 'building-materials',
    name: 'Building Materials',
    icon: Hammer,
    description: 'Foundation and structural elements essential for all construction phases.',
    subcategories: [
      { name: 'Cement (OPC 43/53, PPC, White)', specs: '50kg HDPE laminated bags, IS 269:2015', unit: 'Bags' },
      { name: 'TMT Steel Rebars (Fe 500D / 550D)', specs: '8mm, 10mm, 12mm, 16mm, 20mm, 25mm, 32mm, IS 1786', unit: 'Metric tonnes (MT)' },
      { name: 'Sand & Aggregates (10mm, 20mm, Kapchi)', specs: 'River sand, M-sand, crushed stone aggregate', unit: 'Cubic feet (Cu.ft)' },
      { name: 'Bricks & AAC Lightweight Blocks', specs: 'Clay bricks, fly ash bricks, autoclave aerated blocks', unit: 'Pieces (Nos)' },
      { name: 'Ready-Mix Concrete (RMC M20 - M40)', specs: 'Computerized transit-mixer batch delivery', unit: 'Cubic metres (Cu.m)' },
    ],
    brands: ['UltraTech', 'Ambuja', 'ACC', 'Tata Tiscon', 'Jindal Panther', 'Kamdhenu', 'Siporex'],
  },
  {
    id: 'electrical',
    name: 'Electrical Supplies',
    icon: Zap,
    description: 'High-safety electrical wiring, distribution switchgear, and architectural fixtures.',
    subcategories: [
      { name: 'FRLS Copper Wires & Armoured Cables', specs: '1.5 sq mm to 16 sq mm, 1100V grade', unit: 'Pieces (Nos) / Metres' },
      { name: 'Modular Switches, Plates & Sockets', specs: '6A to 32A modular accessories, polycarbonate', unit: 'Pieces (Nos)' },
      { name: 'Distribution Boards & MCBs', specs: 'SPN, TPN, 4-Pole isolators, RCCB protection', unit: 'Pieces (Nos)' },
      { name: 'Commercial & Architectural Lighting', specs: 'LED panels, flood lights, high-bay lights', unit: 'Pieces (Nos)' },
      { name: 'PVC Conduits & Cable Trays', specs: 'Heavy-duty 20mm, 25mm conduit pipes & GI trays', unit: 'Pieces (Nos) / Metres' },
    ],
    brands: ['Polycab', 'Havells', 'RR Kabel', 'Schneider Electric', 'Legrand', 'Philips'],
  },
  {
    id: 'plumbing',
    name: 'Plumbing & Water Systems',
    icon: Droplets,
    description: 'Concealed water distribution, drainage pipelines, overhead storage, and sanitary fixtures.',
    subcategories: [
      { name: 'CPVC & UPVC Pipes & Fittings', specs: 'SDR 11, Schedule 40/80 hot and cold pressure pipelines', unit: 'Pieces (Nos)' },
      { name: 'Submersible Pumps & Booster Systems', specs: 'Monobloc, open-well, pressure booster motors', unit: 'Pieces (Nos)' },
      { name: 'Overhead Anti-Bacterial Storage Tanks', specs: '3-layer, 4-layer 500L, 1000L, 2000L, 5000L', unit: 'Pieces (Nos)' },
      { name: 'Sanitaryware, Closets & CP Faucets', specs: 'Wall-hung closets, basins, brass chrome faucets', unit: 'Pieces (Nos)' },
    ],
    brands: ['Astral', 'Ashirvad', 'Supreme', 'Finolex', 'Sintex', 'Jaquar', 'Cera', 'Kohler'],
  },
  {
    id: 'tiles-flooring',
    name: 'Tiles & Flooring',
    icon: Grid,
    description: 'High-traffic vitrified floor tiles, ceramic wall decor, natural marble slabs, and granite.',
    subcategories: [
      { name: 'Vitrified Tiles (GVT / PGVT / Double Charge)', specs: '600x1200mm, 800x1600mm, 1200x1800mm', unit: 'Square feet (Sq.ft)' },
      { name: 'Natural Italian & Indian Marble Slabs', specs: 'Botticino, Makrana, Statuario, composite marble', unit: 'Square feet (Sq.ft)' },
      { name: 'Granite Countertops & Step Slabs', specs: 'Black Galaxy, Rajasthan Black, Tan Brown', unit: 'Square feet (Sq.ft)' },
      { name: 'Exterior Paver Blocks & Interlocking Stone', specs: '60mm, 80mm industrial heavy-traffic pavers', unit: 'Square feet (Sq.ft)' },
    ],
    brands: ['Kajaria', 'Somany', 'Simpolo', 'Qutone', 'Nitco', 'Natural Stone Hubs'],
  },
  {
    id: 'finishing-materials',
    name: 'Finishing & Chemicals',
    icon: Paintbrush,
    description: 'Exterior weatherproof coatings, waterproof membranes, polymer putty, and tile adhesives.',
    subcategories: [
      { name: 'Interior & Exterior Emulsion Paint', specs: 'Anti-fungal, weather-coat, washable emulsions', unit: 'Litres (L)' },
      { name: 'Waterproofing Membranes & Chemicals', specs: 'Acrylic, SBR latex, epoxy, crystalline membranes', unit: 'Litres (L) / Kilograms' },
      { name: 'Polymer Tile Adhesives & Epoxy Grouts', specs: 'Type 1, Type 2, Type 3 high-bond adhesives', unit: 'Bags / Kilograms' },
      { name: 'Polymer Wall Putty & Base Plaster', specs: 'White cement based water-resistant putty', unit: 'Bags' },
    ],
    brands: ['Asian Paints', 'Berger', 'Nerolac', 'Dr. Fixit', 'Pidilite Roff', 'Birla White', 'Fosroc'],
  },
  {
    id: 'doors-windows',
    name: 'Doors, Windows & Hardware',
    icon: DoorClosed,
    description: 'Aluminium architectural framing, UPVC soundproof systems, flush doors, and locks.',
    subcategories: [
      { name: 'Aluminium Section Sliding Systems', specs: '27mm, 35mm Domal, Euro groove powder coated', unit: 'Square feet (Sq.ft)' },
      { name: 'UPVC Acoustic Casement & Tilt Windows', specs: 'Multi-chamber reinforced UPVC, DGU soundproof', unit: 'Square feet (Sq.ft)' },
      { name: 'Flush Doors & Waterproof BWP Plywood', specs: 'Solid core, boiling waterproof 710 grade', unit: 'Pieces (Nos)' },
      { name: 'Mortise Locks, Handles & Hardware', specs: 'SS 304 architectural locks, concealed hinges', unit: 'Sets / Pieces (Nos)' },
    ],
    brands: ['Jindal Aluminium', 'Fenesta', 'Century Plywood', 'Greenply', 'Godrej', 'Dorset', 'Yale'],
  },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans selection:bg-[#F25C05] selection:text-white">
      {/* Header */}
      <section className="border-b border-[#252C38] bg-gradient-to-b from-[#171C26] to-[#090B10] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#090B10] border border-[#252C38] rounded-full text-xs font-mono text-[#F25C05]">
            <span>MATERIAL TAXONOMY & SPECIFICATIONS</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading leading-tight max-w-4xl">
            6 Core <span className="text-[#F25C05]">Construction Categories</span>
          </h1>
          <p className="text-base sm:text-lg text-[#C5CAD3] max-w-3xl leading-relaxed">
            Standardized units of measurement, brand specs, and direct distributor networks covering Ahmedabad, Gandhinagar, and Gujarat.
          </p>
        </div>
      </section>

      {/* Categories Detailed List */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                id={cat.id}
                className="bg-[#171C26] border border-[#252C38] p-8 lg:p-10 rounded-xs space-y-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#252C38]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#090B10] border border-[#252C38] flex items-center justify-center text-[#F25C05]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-heading font-black text-2xl uppercase tracking-tight text-[#FFFFFF]">
                        {cat.name}
                      </h2>
                      <p className="text-xs text-[#C5CAD3] mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/rfq/new?category=${cat.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F25C05] hover:bg-[#D94E00] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors self-start sm:self-center"
                  >
                    <span>Post {cat.name} RFQ</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Subcategories Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#252C38] font-mono text-xs uppercase tracking-wider text-[#858D9B]">
                        <th className="py-3 pr-4">Subcategory & Material</th>
                        <th className="py-3 px-4">Standard Specifications</th>
                        <th className="py-3 pl-4">Standard Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#252C38]">
                      {cat.subcategories.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-[#090B10]/40 transition-colors">
                          <td className="py-3.5 pr-4 font-semibold text-[#FFFFFF]">
                            {sub.name}
                          </td>
                          <td className="py-3.5 px-4 text-[#C5CAD3] font-mono text-xs">
                            {sub.specs}
                          </td>
                          <td className="py-3.5 pl-4 font-mono text-xs text-[#F25C05]">
                            <span className="px-2 py-0.5 bg-[#090B10] border border-[#252C38] rounded-xs">
                              {sub.unit}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Brands List */}
                <div className="pt-4 border-t border-[#252C38] flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-[#858D9B]">Leading Gujarat Brands:</span>
                  {cat.brands.map((b) => (
                    <span
                      key={b}
                      className="px-2.5 py-1 bg-[#090B10] border border-[#252C38] text-xs text-[#F4F6FA] rounded-xs"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
