/**
 * PROVENTA — Construction & Infrastructure Procurement Platform
 * Taxonomy Definition: 10 Core & Extended Categories
 * Tagline: ONE PLATFORM TO SOURCE, COMPARE & PROCURE.
 */

export interface ConstructionSubcategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  standardUnits: string[];
  commonSpecs?: string[];
}

export interface ConstructionCategory {
  id: string;
  name: string;
  slug: string;
  division: 'CORE' | 'EXTENDED';
  description: string;
  standards: string;
  defaultUnit: string;
  supportedUnits: string[];
  subcategories: ConstructionSubcategory[];
  aliases?: string[];
}

export const CONSTRUCTION_CATEGORIES: ConstructionCategory[] = [
  // 1. Steel & Metals (Core)
  {
    id: 'cat-steel-metals',
    name: 'Steel & Metals',
    slug: 'steel-metals',
    division: 'CORE',
    description: 'Primary producer Fe 500D / 550D TMT bars, structural beams, MS plates, angles, channels, and binding wire with mill test certificates.',
    standards: 'IS 1786:2008 · IS 2062:2011 · IS 280:2006',
    defaultUnit: 'Metric tonnes (MT)',
    supportedUnits: ['Metric tonnes (MT)', 'Kilograms (KG)', 'Pieces (Nos)', 'Running metres'],
    aliases: ['steel', 'structural-steel', 'tmt-steel', 'metals'],
    subcategories: [
      { id: 'sub-tmt-bars', name: 'TMT Bars', slug: 'tmt-bars', description: 'Fe 500D / 550D / 550D CRS primary rebars (8mm - 32mm)', standardUnits: ['Metric tonnes (MT)', 'Kilograms (KG)'], commonSpecs: ['Fe 550D', 'Fe 500D', 'IS 1786:2008'] },
      { id: 'sub-ms-plates', name: 'MS Plates and Sheets', slug: 'ms-plates-sheets', description: 'Hot-rolled mild steel plates, chequered plates, and sheets (2mm - 50mm)', standardUnits: ['Metric tonnes (MT)', 'Kilograms (KG)', 'Pieces (Nos)'], commonSpecs: ['IS 2062 E250 / E350'] },
      { id: 'sub-structural-steel', name: 'Structural Steel', slug: 'structural-steel', description: 'Beams, columns, heavy hollow sections, and fabricated trusses', standardUnits: ['Metric tonnes (MT)', 'Running metres'], commonSpecs: ['IS 808', 'IS 4923'] },
      { id: 'sub-angles-channels', name: 'Angles, Channels and Beams', slug: 'angles-channels-beams', description: 'Equal/unequal MS angles, ISA/ISMC channels, and ISMB universal beams', standardUnits: ['Metric tonnes (MT)', 'Kilograms (KG)', 'Running metres'], commonSpecs: ['IS 808:1989', 'IS 2062'] },
      { id: 'sub-binding-wire', name: 'Binding Wire', slug: 'binding-wire', description: '18 to 20 gauge annealed mild steel binding wire for reinforcement tying', standardUnits: ['Kilograms (KG)', 'Metric tonnes (MT)'], commonSpecs: ['IS 280:2006'] },
    ],
  },

  // 2. Cement & Concrete (Core)
  {
    id: 'cat-cement-concrete',
    name: 'Cement & Concrete',
    slug: 'cement-concrete',
    division: 'CORE',
    description: 'Wholesale dispatches of OPC 43/53, PPC cement, bulk tanker cement, computerized ready-mix concrete (M20-M50), and specialty admixtures.',
    standards: 'IS 269:2015 · IS 1489:2015 · IS 4926:2003',
    defaultUnit: 'Bags',
    supportedUnits: ['Bags', 'Metric tonnes (MT)', 'Cubic metres (Cu.m)'],
    aliases: ['cement', 'concrete', 'rmc'],
    subcategories: [
      { id: 'sub-opc-cement', name: 'OPC Cement', slug: 'opc-cement', description: '53 Grade and 43 Grade Ordinary Portland Cement in fresh 50kg bags', standardUnits: ['Bags', 'Metric tonnes (MT)'], commonSpecs: ['53 Grade IS 269:2015', '43 Grade IS 269:2015'] },
      { id: 'sub-ppc-cement', name: 'PPC Cement', slug: 'ppc-cement', description: 'Portland Pozzolana Cement for structural mass concrete and plastering', standardUnits: ['Bags', 'Metric tonnes (MT)'], commonSpecs: ['IS 1489 Part 1 Fly-Ash Based'] },
      { id: 'sub-bulk-cement', name: 'Bulk Cement', slug: 'bulk-cement', description: 'Bulker tanker deliveries direct from manufacturing plants to batching plants', standardUnits: ['Metric tonnes (MT)'], commonSpecs: ['53 Grade Bulk Tanker'] },
      { id: 'sub-rmc', name: 'Ready-Mix Concrete', slug: 'ready-mix-concrete', description: 'Automated computerized transit-mixer batch delivery (M20, M25, M30, M40)', standardUnits: ['Cubic metres (Cu.m)'], commonSpecs: ['IS 4926:2003 Computerized Batch'] },
      { id: 'sub-concrete-additives', name: 'Concrete Additives', slug: 'concrete-additives', description: 'Plasticizers, retarders, silica fume, and accelerators for high-performance concrete', standardUnits: ['Litres (L)', 'Kilograms (KG)'], commonSpecs: ['IS 9103 Admixtures'] },
    ],
  },

  // 3. Building Materials (Core)
  {
    id: 'cat-building-materials',
    name: 'Building Materials',
    slug: 'building-materials',
    division: 'CORE',
    description: 'Precision autoclaved aerated concrete (AAC) blocks, red clay bricks, fly-ash bricks, river/manufactured sand, and hard basalt aggregates.',
    standards: 'IS 2185 Part 3 · IS 1077 · IS 383:2016',
    defaultUnit: 'Cubic metres (Cu.m)',
    supportedUnits: ['Cubic metres (Cu.m)', 'Pieces (Nos)', 'Cubic feet (Cu.ft)', 'Metric tonnes (MT)'],
    aliases: ['aggregates', 'sand-aggregates', 'masonry', 'bricks-blocks'],
    subcategories: [
      { id: 'sub-aac-blocks', name: 'AAC Blocks', slug: 'aac-blocks', description: 'Autoclaved aerated concrete lightweight masonry blocks (600x200x100/150/200mm)', standardUnits: ['Cubic metres (Cu.m)', 'Pieces (Nos)'], commonSpecs: ['IS 2185 Part 3 Grade 1'] },
      { id: 'sub-bricks', name: 'Bricks', slug: 'bricks', description: 'Kiln-fired red clay construction bricks (Class 7.5 to 10)', standardUnits: ['Pieces (Nos)'], commonSpecs: ['IS 1077 Standard Red Clay'] },
      { id: 'sub-fly-ash-bricks', name: 'Fly Ash Bricks', slug: 'fly-ash-bricks', description: 'High compressive strength machine-pressed fly-ash lime-gypsum bricks', standardUnits: ['Pieces (Nos)'], commonSpecs: ['IS 12894:2002'] },
      { id: 'sub-sand', name: 'Sand', slug: 'sand', description: 'Washed Zone II river sand and manufactured sand (M-Sand/P-Sand)', standardUnits: ['Cubic feet (Cu.ft)', 'Metric tonnes (MT)'], commonSpecs: ['IS 383 Zone II Silt Under 3%'] },
      { id: 'sub-aggregates', name: 'Aggregates', slug: 'aggregates', description: 'Crushed hard basalt blue metal aggregates (10mm, 20mm, 40mm, Kapchi)', standardUnits: ['Metric tonnes (MT)', 'Cubic feet (Cu.ft)'], commonSpecs: ['IS 383:2016 Angular Hard Basalt'] },
      { id: 'sub-construction-stone', name: 'Construction Stone', slug: 'construction-stone', description: 'Rubble stone, soling stone, and quarry spalls for foundation pitching', standardUnits: ['Metric tonnes (MT)', 'Cubic feet (Cu.ft)'], commonSpecs: ['Foundation Hard Stone'] },
    ],
  },

  // 4. Pipes & Plumbing (Core)
  {
    id: 'cat-pipes-plumbing',
    name: 'Pipes & Plumbing',
    slug: 'pipes-plumbing',
    division: 'CORE',
    description: 'Pressure-rated PVC, HDPE, CPVC, and MS piping systems with engineered valves and industrial pipe fittings.',
    standards: 'IS 15778 · IS 4984 · IS 4985 · ASTM D2846 · IS 1239',
    defaultUnit: 'Running metres',
    supportedUnits: ['Running metres', 'Running metres (R.m)', 'Pieces (Nos)', 'Boxes'],
    aliases: ['plumbing', 'pipes', 'water-supply', 'drainage'],
    subcategories: [
      { id: 'sub-pvc-pipes', name: 'PVC Pipes', slug: 'pvc-pipes', description: 'Rigid PVC pipes for agricultural, drainage, and plumbing potable water networks', standardUnits: ['Running metres', 'Pieces (Nos)'], commonSpecs: ['IS 4985 Class 1 to 4'] },
      { id: 'sub-hdpe-pipes', name: 'HDPE Pipes', slug: 'hdpe-pipes', description: 'High-density polyethylene coils and pipes for infrastructure water transmission', standardUnits: ['Running metres', 'Metric tonnes (MT)'], commonSpecs: ['IS 4984 PE 80 / PE 100 PN 6 to PN 16'] },
      { id: 'sub-cpvc-pipes', name: 'CPVC Pipes', slug: 'cpvc-pipes', description: 'Chlorinated polyvinyl chloride SDR 11/13.5 pipes for hot and cold domestic plumbing', standardUnits: ['Running metres', 'Pieces (Nos)'], commonSpecs: ['IS 15778 / ASTM D2846 Class 1'] },
      { id: 'sub-ms-pipes', name: 'MS Pipes', slug: 'ms-pipes', description: 'Medium and heavy grade ERW mild steel galvanized and black pipes', standardUnits: ['Running metres', 'Metric tonnes (MT)', 'Pieces (Nos)'], commonSpecs: ['IS 1239 Part 1 Class B / Class C'] },
      { id: 'sub-fittings-valves', name: 'Pipe Fittings and Valves', slug: 'pipe-fittings-valves', description: 'Elbows, tees, couplers, brass insert fittings, ball valves, and non-return check valves', standardUnits: ['Pieces (Nos)', 'Boxes'], commonSpecs: ['PN 16 / PN 25 Pressure Rated'] },
    ],
  },

  // 5. Electrical Materials (Core)
  {
    id: 'cat-electrical-materials',
    name: 'Electrical Materials',
    slug: 'electrical-materials',
    division: 'CORE',
    description: 'Electrolytic copper wires, LT/HT armoured aluminium power cables, modular switchgear, distribution DBs, and electrical fittings.',
    standards: 'IS 694:2010 · IS 7098 · IS 1554 · IEC 60947 · IS 3854',
    defaultUnit: 'Running metres',
    supportedUnits: ['Running metres', 'Running metres (R.m)', 'Pieces (Nos)', 'Boxes'],
    aliases: ['electrical', 'cables', 'switchgear', 'wiring'],
    subcategories: [
      { id: 'sub-cables', name: 'Cables', slug: 'cables', description: 'LT/HT XLPE insulated PVC sheathed armoured aluminium and copper power cables', standardUnits: ['Running metres'], commonSpecs: ['IS 7098 Part 1 1.1kV Grade'] },
      { id: 'sub-wires', name: 'Wires', slug: 'wires', description: 'FR-LSH single core multi-strand copper building wires (0.75 sq mm to 16 sq mm)', standardUnits: ['Running metres', 'Boxes'], commonSpecs: ['IS 694:2010 1100V FRLS Copper'] },
      { id: 'sub-switchgear', name: 'Switchgear', slug: 'switchgear', description: 'MCBs, RCCBs, MCCBs, changeover switches, and industrial contactors', standardUnits: ['Pieces (Nos)'], commonSpecs: ['IEC 60898-1 / IS 12640 10kA'] },
      { id: 'sub-distribution-panels', name: 'Distribution Panels', slug: 'distribution-panels', description: 'Single and three phase distribution boards, VTPN DBs, and custom feeder pillars', standardUnits: ['Pieces (Nos)'], commonSpecs: ['IP43 / IP54 Sheet Steel Enclosures'] },
      { id: 'sub-electrical-fittings', name: 'Electrical Fittings', slug: 'electrical-fittings', description: 'Modular switches, sockets, cover plates, heavy PVC conduit pipes, and junction boxes', standardUnits: ['Pieces (Nos)', 'Boxes'], commonSpecs: ['IS 3854:1997 / IS 9537 Part 3'] },
    ],
  },

  // 6. Finishing Materials (Extended)
  {
    id: 'cat-finishing-materials',
    name: 'Finishing Materials',
    slug: 'finishing-materials',
    division: 'EXTENDED',
    description: 'Double-charge and glazed vitrified tiles, Italian marble, polished granite slabs, commercial flooring, and exterior weather-coat paint.',
    standards: 'IS 15622:2017 · ISO 13006 · IS 5410 · IS 15489',
    defaultUnit: 'Square feet (Sq.ft)',
    supportedUnits: ['Square feet (Sq.ft)', 'Boxes', 'Litres (L)', 'Pieces (Nos)'],
    aliases: ['tiles', 'tiles-flooring', 'finishing', 'flooring', 'paint', 'doors-windows'],
    subcategories: [
      { id: 'sub-tiles', name: 'Tiles', slug: 'tiles', description: 'GVT, PGVT, double-charge vitrified floor tiles and decorative ceramic wall claddings', standardUnits: ['Square feet (Sq.ft)', 'Boxes'], commonSpecs: ['600x1200mm', '800x1600mm', 'ISO 13006 Group BIa'] },
      { id: 'sub-marble', name: 'Marble', slug: 'marble', description: 'Natural imported and Indian marble slabs (Italian Botticino, Makrana, Flawless White)', standardUnits: ['Square feet (Sq.ft)'], commonSpecs: ['18mm - 20mm Gangsaw Polished'] },
      { id: 'sub-granite', name: 'Granite', slug: 'granite', description: 'High-density Black Galaxy, Tan Brown, and Indian polished granite slabs for steps and counters', standardUnits: ['Square feet (Sq.ft)'], commonSpecs: ['18mm High Gloss Mirror Finish'] },
      { id: 'sub-flooring', name: 'Flooring', slug: 'flooring', description: 'Kota stone, heavy industrial epoxy screeds, and interlocking outdoor paver blocks', standardUnits: ['Square feet (Sq.ft)', 'Boxes'], commonSpecs: ['Commercial Traffic Grade'] },
      { id: 'sub-paint', name: 'Paint', slug: 'paint', description: 'Interior acrylic luxury emulsions, exterior anti-fungal silicone weathercoat paints, and primers', standardUnits: ['Litres (L)', 'Bags'], commonSpecs: ['IS 15489 Weatherproof Acrylic'] },
    ],
  },

  // 7. Sanitary & Bathroom (Extended)
  {
    id: 'cat-sanitary-bathroom',
    name: 'Sanitary & Bathroom',
    slug: 'sanitary-bathroom',
    division: 'EXTENDED',
    description: 'Commercial vitreous china sanitaryware, brass chrome-plated CP faucets, concealed cisterns, and plumbing brassware.',
    standards: 'IS 2556 · IS 8931 · EN 997',
    defaultUnit: 'Pieces (Nos)',
    supportedUnits: ['Pieces (Nos)', 'Sets', 'Boxes'],
    aliases: ['sanitary', 'bathroom', 'sanitaryware', 'faucets'],
    subcategories: [
      { id: 'sub-sanitaryware', name: 'Sanitaryware', slug: 'sanitaryware', description: 'Wall-hung closets, one-piece floor water closets, washbasins, and commercial urinals', standardUnits: ['Pieces (Nos)', 'Sets'], commonSpecs: ['IS 2556 Vitreous China Class A'] },
      { id: 'sub-faucets', name: 'Faucets', slug: 'faucets', description: 'Single lever basin mixers, wall mixers, bib taps, sensor taps, and health faucets', standardUnits: ['Pieces (Nos)', 'Boxes'], commonSpecs: ['IS 8931 Chrome Plated Forged Brass'] },
      { id: 'sub-plumbing-fittings', name: 'Plumbing Fittings', slug: 'plumbing-fittings-sanitary', description: 'Concealed flush tanks, angle cocks, waste couplings, bottle traps, and SS floor drains', standardUnits: ['Pieces (Nos)', 'Boxes'], commonSpecs: ['SS 304 / Lead-Free Brass'] },
    ],
  },

  // 8. Construction Chemicals (Extended)
  {
    id: 'cat-construction-chemicals',
    name: 'Construction Chemicals',
    slug: 'construction-chemicals',
    division: 'EXTENDED',
    description: 'Elastomeric waterproofing membranes, polymer-modified tile adhesives, epoxy grouts, structural admixtures, and polysulphide joint sealants.',
    standards: 'ASTM C836 · IS 2645:2003 · IS 15477 · ASTM C920',
    defaultUnit: 'Litres (L)',
    supportedUnits: ['Litres (L)', 'Bags', 'Kilograms (KG)', 'Pieces (Nos)'],
    aliases: ['chemicals', 'waterproofing', 'adhesives', 'sealants'],
    subcategories: [
      { id: 'sub-waterproofing', name: 'Waterproofing', slug: 'waterproofing', description: 'Two-component acrylic polymer coatings, crystalline water repellents, and SBS bituminous membranes', standardUnits: ['Litres (L)', 'Bags', 'Kilograms (KG)'], commonSpecs: ['ASTM C836 / IS 2645 Positive & Negative Pressure'] },
      { id: 'sub-adhesives', name: 'Adhesives', slug: 'adhesives', description: 'Polymer-modified cementitious tile and stone adhesives (Type 1 to Type 4 for vitrified and marble)', standardUnits: ['Bags', 'Kilograms (KG)'], commonSpecs: ['IS 15477:2019 Type 2 & Type 3'] },
      { id: 'sub-admixtures', name: 'Admixtures', slug: 'admixtures', description: 'Superplasticizers, waterproof integral compounds, curing compounds, and bonding agents', standardUnits: ['Litres (L)', 'Kilograms (KG)'], commonSpecs: ['IS 9103 / ASTM C494 Type F'] },
      { id: 'sub-sealants', name: 'Sealants', slug: 'sealants', description: 'Two-part polysulphide sealants, polyurethane expansion joint sealants, and hybrid silicone mastics', standardUnits: ['Kilograms (KG)', 'Pieces (Nos)'], commonSpecs: ['ASTM C920 High Movement Grade'] },
    ],
  },

  // 9. Construction Equipment & Formwork (Extended)
  {
    id: 'cat-equipment-formwork',
    name: 'Construction Equipment & Formwork',
    slug: 'equipment-formwork',
    division: 'EXTENDED',
    description: 'Modular cuplock scaffolding systems, steel props, shuttering ply, aluminium formwork (Mivan), and construction safety apparatus.',
    standards: 'IS 2750 · IS 4990:2011 · EN 12810',
    defaultUnit: 'Pieces (Nos)',
    supportedUnits: ['Pieces (Nos)', 'Square feet (Sq.ft)', 'Metric tonnes (MT)', 'Sets'],
    aliases: ['formwork', 'scaffolding', 'shuttering', 'equipment'],
    subcategories: [
      { id: 'sub-scaffolding', name: 'Scaffolding', slug: 'scaffolding', description: 'Cuplock standards, ledgers, base jacks, swivel clamps, and heavy MS walking boards', standardUnits: ['Pieces (Nos)', 'Metric tonnes (MT)'], commonSpecs: ['IS 2750 Heavy Duty Tubular Steel'] },
      { id: 'sub-shuttering', name: 'Shuttering', slug: 'shuttering', description: 'BWP/BWR grade film-faced shuttering plywood (12mm, 18mm) and adjustable telescopic steel props', standardUnits: ['Pieces (Nos)', 'Square feet (Sq.ft)'], commonSpecs: ['IS 4990:2011 30kg Density 18mm'] },
      { id: 'sub-formwork', name: 'Formwork', slug: 'formwork', description: 'Aluminium monolithic formwork panels, tie rods, wing nuts, and column boxes', standardUnits: ['Square feet (Sq.ft)', 'Pieces (Nos)', 'Sets'], commonSpecs: ['High-Strength 6061 T6 Aluminium System'] },
    ],
  },

  // 10. Infrastructure Materials (Extended)
  {
    id: 'cat-infrastructure-materials',
    name: 'Infrastructure Materials',
    slug: 'infrastructure-materials',
    division: 'EXTENDED',
    description: 'Certified road construction bitumen, precast concrete stormwater drains, DI water transmission pipes, precast culverts, and highway safety barriers.',
    standards: 'IRC:SP:84 · IS 73:2013 · IS 458 · IS 8329',
    defaultUnit: 'Metric tonnes (MT)',
    supportedUnits: ['Metric tonnes (MT)', 'Running metres', 'Pieces (Nos)', 'Cubic metres (Cu.m)'],
    aliases: ['infrastructure', 'road-materials', 'drainage', 'precast', 'civil-infra'],
    subcategories: [
      { id: 'sub-road-materials', name: 'Road Construction Materials', slug: 'road-materials', description: 'VG-30 / VG-40 paving bitumen, asphalt emulsions, geotextiles, and dense bituminous macadam', standardUnits: ['Metric tonnes (MT)'], commonSpecs: ['IS 73:2013 / MoRTH Section 500'] },
      { id: 'sub-drainage-systems', name: 'Drainage Systems', slug: 'drainage-systems', description: 'Precast U-shaped stormwater drain channels, perforated subsurface pipes, and cast iron manhole covers', standardUnits: ['Running metres', 'Pieces (Nos)'], commonSpecs: ['Heavy Load Class D400'] },
      { id: 'sub-water-supply-materials', name: 'Water Supply Materials', slug: 'water-supply-materials', description: 'Ductile iron (DI) K9 pipes, sluice valves, air release valves, and surge protection vessels', standardUnits: ['Running metres', 'Pieces (Nos)'], commonSpecs: ['IS 8329 Class K9 Cement Mortar Lined'] },
      { id: 'sub-precast-concrete', name: 'Precast Concrete', slug: 'precast-concrete', description: 'Precast box culverts, boundary wall panels, utility trenches, and concrete kerb stones', standardUnits: ['Pieces (Nos)', 'Running metres'], commonSpecs: ['M35 / M40 Grade Precast Steam Cured'] },
      { id: 'sub-road-safety-products', name: 'Road Safety Products', slug: 'road-safety-products', description: 'W-beam metal crash barriers, retro-reflective signage, thermo-plastic road marking paint, and delineators', standardUnits: ['Running metres', 'Pieces (Nos)'], commonSpecs: ['MoRTH Specification Clause 811'] },
    ],
  },
];

/**
 * Backward compatibility alias mapping.
 * Maps legacy or partial slugs to the canonical category.
 */
export const CATEGORY_ALIAS_MAP: Record<string, string> = {
  'steel': 'steel-metals',
  'structural-steel': 'steel-metals',
  'tmt-steel': 'steel-metals',
  'metals': 'steel-metals',

  'cement': 'cement-concrete',
  'concrete': 'cement-concrete',
  'ready-mix-concrete': 'cement-concrete',
  'rmc': 'cement-concrete',

  'building-materials': 'building-materials',
  'masonry': 'building-materials',
  'sand-aggregates': 'building-materials',
  'bricks-blocks': 'building-materials',

  'plumbing': 'pipes-plumbing',
  'pipes': 'pipes-plumbing',
  'water-supply': 'pipes-plumbing',
  'pipes-fittings': 'pipes-plumbing',
  'pipes-plumbing': 'pipes-plumbing',

  'electrical': 'electrical-materials',
  'electrical-materials': 'electrical-materials',
  'cables': 'electrical-materials',
  'switchgear': 'electrical-materials',
  'wires-cables': 'electrical-materials',

  'tiles': 'finishing-materials',
  'tiles-flooring': 'finishing-materials',
  'flooring': 'finishing-materials',
  'marble-granite': 'finishing-materials',
  'finishing-materials': 'finishing-materials',
  'doors-windows': 'finishing-materials',

  'sanitary': 'sanitary-bathroom',
  'sanitary-bathroom': 'sanitary-bathroom',
  'bathroom': 'sanitary-bathroom',
  'sanitaryware': 'sanitary-bathroom',

  'chemicals': 'construction-chemicals',
  'construction-chemicals': 'construction-chemicals',
  'waterproofing': 'construction-chemicals',
  'tile-adhesives': 'construction-chemicals',

  'formwork': 'equipment-formwork',
  'equipment-formwork': 'equipment-formwork',
  'scaffolding': 'equipment-formwork',
  'shuttering': 'equipment-formwork',

  'infrastructure': 'infrastructure-materials',
  'infrastructure-materials': 'infrastructure-materials',
  'road-materials': 'infrastructure-materials',
  'precast': 'infrastructure-materials',
};

/**
 * Normalizes any category slug to its canonical 10-category slug.
 */
export function normalizeCategorySlug(rawSlug: string): string {
  if (!rawSlug) return 'building-materials';
  const clean = rawSlug.trim().toLowerCase();
  return CATEGORY_ALIAS_MAP[clean] || clean;
}

/**
 * Returns canonical category details by slug or alias.
 */
export function getCategoryBySlug(rawSlug: string): ConstructionCategory | undefined {
  const canonical = normalizeCategorySlug(rawSlug);
  return CONSTRUCTION_CATEGORIES.find((c) => c.slug === canonical);
}

/**
 * Lists all active categories for public selection and directory navigation.
 */
export function getAllCategories(): ConstructionCategory[] {
  return CONSTRUCTION_CATEGORIES;
}

/**
 * Dropdown options for RFQ creation and supplier profile selection.
 */
export const CATEGORY_SELECT_OPTIONS = CONSTRUCTION_CATEGORIES.map((c) => ({
  slug: c.slug,
  name: c.name,
  label: `${c.name} (${c.subcategories.slice(0, 3).map((s) => s.name).join(', ')})`,
  division: c.division,
  defaultUnit: c.defaultUnit,
}));
