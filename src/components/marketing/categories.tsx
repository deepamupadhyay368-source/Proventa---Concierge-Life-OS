import { Layers, HardHat, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  {
    slug: 'steel-metals',
    name: 'Steel & TMT Rebars',
    spec: 'IS 1786:2008 · Fe 500D / 550D / 550D CRS',
    description: 'Primary producer TMT rebars (8mm to 36mm), structural MS angles, channels, beams, plates, and wire.',
    unit: 'Metric Tonnes (MT)',
    href: '/rfq/new?category=steel-metals',
  },
  {
    slug: 'cement-concrete',
    name: 'Cement & Ready-Mix Concrete',
    spec: 'IS 269:2015 · IS 1489:2015 · OPC 43/53 & PPC',
    description: 'Factory-direct 50kg bags, bulk tanker bulker supply, and computerized transit-mixer ready-mix concrete (RMC).',
    unit: 'Bags (50kg) / MT',
    href: '/rfq/new?category=cement-concrete',
  },
  {
    slug: 'building-materials',
    name: 'Aggregates & Sand',
    spec: 'IS 383:2016 · 10mm, 20mm & Crushed Sand',
    description: 'Crushed basalt aggregates (10mm, 20mm, 40mm), manufactured sand (M-Sand), washed river sand, and road base.',
    unit: 'Metric Tonnes (MT) / Brass',
    href: '/rfq/new?category=building-materials',
  },
  {
    slug: 'pipes-plumbing',
    name: 'Pipes & Drainage Systems',
    spec: 'IS 15778 · IS 4984 · CPVC, UPVC, HDPE & DI',
    description: 'SDR 11/13.5 CPVC pressure piping, SWR drainage systems, underground HDPE coils, and DI K7/K9 infrastructure lines.',
    unit: 'Running Metres (Rm) / Nos',
    href: '/rfq/new?category=pipes-plumbing',
  },
  {
    slug: 'electrical-materials',
    name: 'Electrical Materials & Switchgear',
    spec: 'IS 694:2010 · IS 7098 · FRLSH & XLPE',
    description: 'Commercial wiring, copper busbars, LT/HT armoured underground cables, distribution boards, and modular switchgear.',
    unit: 'Running Metres / Units',
    href: '/rfq/new?category=electrical-materials',
  },
  {
    slug: 'construction-chemicals',
    name: 'Construction Chemicals',
    spec: 'ASTM C836 · IS 2645 · Admixtures & Membranes',
    description: 'High-range water-reducing plasticizers, elastomeric waterproofing, polymer tile adhesives, and structural grouts.',
    unit: 'Litres (L) / Bags (25kg)',
    href: '/rfq/new?category=construction-chemicals',
  },
  {
    slug: 'building-blocks',
    name: 'Building Blocks & Masonry',
    spec: 'IS 2185 Part 3 · AAC Blocks & Fly Ash Bricks',
    description: 'Precision autoclaved aerated concrete (AAC) blocks, structural masonry mortars, and fly ash construction bricks.',
    unit: 'Cubic Metres (Cu.m) / Units',
    href: '/rfq/new?category=building-blocks',
  },
];

export function CategoriesSection() {
  return (
    <section className="py-24 bg-[#FFFFFF] relative overflow-hidden border-t border-b border-[#E2E8EF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4F7FA] border border-[#E2E8EF] text-[11px] font-mono font-semibold tracking-wider text-[#315F91] uppercase shadow-xs">
            <span className="w-1.5 h-1.5 bg-[#315F91]"></span>
            <span>MATERIAL TAXONOMY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-[#243447]">
            Commercial Industrial Materials.
          </h2>
          <p className="text-base sm:text-lg text-[#6B7785] leading-relaxed">
            Direct procurement across seven core commercial categories with standardized technical specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.slug}
              className="p-6 bg-white border border-[#E2E8EF] hover:border-[#AEBBC6] transition-all rounded-xs flex flex-col justify-between shadow-2xs group"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-semibold text-[#315F91] block">
                  {cat.spec}
                </span>
                <h3 className="font-heading text-lg font-bold text-[#243447] group-hover:text-[#315F91] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#6B7785] leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-6 border-t border-[#E2E8EF] mt-6 flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#6B7785] uppercase">
                  {cat.unit}
                </span>
                <Link
                  href={cat.href}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#315F91] hover:text-[#264B74]"
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
  );
}
