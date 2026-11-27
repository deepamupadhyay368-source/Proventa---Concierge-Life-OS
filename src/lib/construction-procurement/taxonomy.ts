/**
 * PROVENTA — Structured Construction Material Taxonomy & Specification Equivalence Engine
 * Ensures products with materially different specifications are never compared as equivalent.
 */

export interface MaterialSpecAttribute {
  key: string;
  label: string;
  required: boolean;
  materiallyCritical: boolean; // If different between RFQ and Quote, triggers specification mismatch flag
  exampleValues: string[];
}

export interface MaterialCategoryDefinition {
  slug: string;
  name: string;
  division: 'CIVIL_STRUCTURAL' | 'ELECTRICAL' | 'PLUMBING' | 'FINISHING' | 'SITE_EQUIPMENT';
  defaultUnit: string;
  gstRatePercent: number;
  standardReference: string;
  specAttributes: MaterialSpecAttribute[];
}

export const CONSTRUCTION_MATERIAL_TAXONOMY: MaterialCategoryDefinition[] = [
  {
    slug: 'tmt-steel',
    name: 'TMT Steel Reinforcement Bars',
    division: 'CIVIL_STRUCTURAL',
    defaultUnit: 'MT',
    gstRatePercent: 18,
    standardReference: 'IS 1786:2008',
    specAttributes: [
      { key: 'brand', label: 'Manufacturer / Brand', required: true, materiallyCritical: true, exampleValues: ['Tata Tiscon', 'JSW Neosteel', 'Jindal Panther', 'SAIL'] },
      { key: 'grade', label: 'Steel Grade', required: true, materiallyCritical: true, exampleValues: ['Fe-500D', 'Fe-550D', 'Fe-600'] },
      { key: 'diameterMm', label: 'Bar Diameter (mm)', required: true, materiallyCritical: true, exampleValues: ['8mm', '10mm', '12mm', '16mm', '20mm', '25mm'] },
      { key: 'standard', label: 'BIS Standard', required: true, materiallyCritical: true, exampleValues: ['IS 1786:2008'] },
      { key: 'certification', label: 'Mill Test Certificate', required: false, materiallyCritical: false, exampleValues: ['BIS + MTC Mandatory'] },
    ],
  },
  {
    slug: 'structural-steel',
    name: 'Structural Steel (Angles, Channels, Beams)',
    division: 'CIVIL_STRUCTURAL',
    defaultUnit: 'MT',
    gstRatePercent: 18,
    standardReference: 'IS 2062:2011',
    specAttributes: [
      { key: 'brand', label: 'Manufacturer / Mill', required: true, materiallyCritical: true, exampleValues: ['SAIL', 'JSPL', 'Tata Structura'] },
      { key: 'grade', label: 'Steel Grade', required: true, materiallyCritical: true, exampleValues: ['E250', 'E350'] },
      { key: 'section', label: 'Section Profile', required: true, materiallyCritical: true, exampleValues: ['ISMB 250', 'ISMC 150', 'ISA 75x75x8'] },
    ],
  },
  {
    slug: 'cement',
    name: 'Portland Cement (OPC / PPC / PSC)',
    division: 'CIVIL_STRUCTURAL',
    defaultUnit: 'BAG',
    gstRatePercent: 28,
    standardReference: 'IS 269:2015 / IS 1489',
    specAttributes: [
      { key: 'brand', label: 'Brand', required: true, materiallyCritical: true, exampleValues: ['UltraTech', 'Ambuja', 'ACC', 'JK Lakshmi', 'Sanghi'] },
      { key: 'cementType', label: 'Cement Type', required: true, materiallyCritical: true, exampleValues: ['OPC', 'PPC', 'PSC'] },
      { key: 'grade', label: 'Grade', required: true, materiallyCritical: true, exampleValues: ['43 Grade', '53 Grade'] },
      { key: 'packaging', label: 'Packaging', required: true, materiallyCritical: true, exampleValues: ['50 kg HDPE Bag', '50 kg Paper Bag', 'Bulk Silo'] },
    ],
  },
  {
    slug: 'ready-mix-concrete',
    name: 'Ready-Mix Concrete (RMC)',
    division: 'CIVIL_STRUCTURAL',
    defaultUnit: 'CUM',
    gstRatePercent: 18,
    standardReference: 'IS 456:2000 / IS 4926',
    specAttributes: [
      { key: 'grade', label: 'Concrete Mix Grade', required: true, materiallyCritical: true, exampleValues: ['M20', 'M25', 'M30', 'M35', 'M40', 'M50'] },
      { key: 'slumpMm', label: 'Workability Slump', required: true, materiallyCritical: true, exampleValues: ['100-125 mm', '125-150 mm (Pumpable)'] },
      { key: 'pumpingIncluded', label: 'Boom / Line Pump', required: true, materiallyCritical: true, exampleValues: ['Included', 'Excluded'] },
    ],
  },
  {
    slug: 'sand-aggregates',
    name: 'River Sand, M-Sand & Crushed Aggregates',
    division: 'CIVIL_STRUCTURAL',
    defaultUnit: 'MT',
    gstRatePercent: 5,
    standardReference: 'IS 383:2016',
    specAttributes: [
      { key: 'materialType', label: 'Material Type', required: true, materiallyCritical: true, exampleValues: ['Washed M-Sand (Zone II)', 'River Sand', '20mm Aggregate', '10mm Grit'] },
      { key: 'zoneOrSize', label: 'Gradation / Size', required: true, materiallyCritical: true, exampleValues: ['Zone II', '10mm', '20mm'] },
    ],
  },
  {
    slug: 'aac-blocks-bricks',
    name: 'AAC Blocks & Clay / Fly-Ash Bricks',
    division: 'CIVIL_STRUCTURAL',
    defaultUnit: 'CUM',
    gstRatePercent: 12,
    standardReference: 'IS 2185 Part 3',
    specAttributes: [
      { key: 'blockType', label: 'Block / Brick Type', required: true, materiallyCritical: true, exampleValues: ['AAC Block', 'Fly-Ash Brick', 'Red Clay Brick'] },
      { key: 'dimensionsMm', label: 'Dimensions (mm)', required: true, materiallyCritical: true, exampleValues: ['600x200x200', '600x200x150', '600x200x100'] },
      { key: 'compressiveStrength', label: 'Compressive Strength', required: true, materiallyCritical: true, exampleValues: ['Grade 1 (>= 4 N/mm²)', 'Grade 2 (>= 3 N/mm²)'] },
    ],
  },
  {
    slug: 'waterproofing',
    name: 'Waterproofing Chemicals & Membranes',
    division: 'CIVIL_STRUCTURAL',
    defaultUnit: 'LTR',
    gstRatePercent: 18,
    standardReference: 'IS 2645 / ASTM',
    specAttributes: [
      { key: 'brand', label: 'Brand', required: true, materiallyCritical: true, exampleValues: ['Dr. Fixit', 'FOSROC', 'Sika', 'MYK Arment'] },
      { key: 'chemistry', label: 'System Type', required: true, materiallyCritical: true, exampleValues: ['Integral Liquid', 'APP Membrane 4mm', '2K Elastomeric'] },
    ],
  },
  {
    slug: 'electrical-cables',
    name: 'Electrical Cables, Wires & Switchgear',
    division: 'ELECTRICAL',
    defaultUnit: 'MTR',
    gstRatePercent: 18,
    standardReference: 'IS 694 / IS 7098',
    specAttributes: [
      { key: 'brand', label: 'Brand', required: true, materiallyCritical: true, exampleValues: ['Polycab', 'Havells', 'Finolex', 'KEI'] },
      { key: 'conductor', label: 'Conductor & Insulation', required: true, materiallyCritical: true, exampleValues: ['Copper FRLS', 'Aluminium Armoured XLPE'] },
      { key: 'coreCrossSection', label: 'Core & Cross Section', required: true, materiallyCritical: true, exampleValues: ['1C x 2.5 sqmm', '3.5C x 185 sqmm'] },
    ],
  },
  {
    slug: 'plumbing-pipes',
    name: 'CPVC, UPVC, SWR Pipes, Fittings & Valves',
    division: 'PLUMBING',
    defaultUnit: 'MTR',
    gstRatePercent: 18,
    standardReference: 'IS 15778 / ASTM D2846',
    specAttributes: [
      { key: 'brand', label: 'Brand', required: true, materiallyCritical: true, exampleValues: ['Astral', 'Ashirvad', 'Supreme', 'Finolex'] },
      { key: 'pipeType', label: 'Pipe Class / SDR', required: true, materiallyCritical: true, exampleValues: ['CPVC SDR 11', 'UPVC SCH 40', 'SWR Type B'] },
      { key: 'diameter', label: 'Nominal Diameter', required: true, materiallyCritical: true, exampleValues: ['20mm', '25mm', '32mm', '110mm'] },
    ],
  },
  {
    slug: 'finishing-tiles-paint',
    name: 'Tiles, Stone, Architectural Paints & Hardware',
    division: 'FINISHING',
    defaultUnit: 'SQFT',
    gstRatePercent: 18,
    standardReference: 'IS 15622',
    specAttributes: [
      { key: 'brand', label: 'Brand', required: true, materiallyCritical: true, exampleValues: ['Kajaria', 'Somany', 'Asian Paints', 'Berger'] },
      { key: 'finishAndSize', label: 'Finish & Dimensions', required: true, materiallyCritical: true, exampleValues: ['GVT 600x1200mm Matte', 'Exterior Weathercoat 20L'] },
    ],
  },
  {
    slug: 'safety-site-equipment',
    name: 'Site Safety Equipment & Construction Tools',
    division: 'SITE_EQUIPMENT',
    defaultUnit: 'NOS',
    gstRatePercent: 18,
    standardReference: 'IS 2925 / IS 3521',
    specAttributes: [
      { key: 'equipmentType', label: 'Equipment Type', required: true, materiallyCritical: true, exampleValues: ['Safety Helmet IS 2925', 'Full Body Harness', 'Safety Net 10x5m'] },
      { key: 'certification', label: 'Certification', required: true, materiallyCritical: true, exampleValues: ['ISI Marked', 'EN 361'] },
    ],
  },
];

export interface SpecDeviation {
  attributeKey: string;
  label: string;
  requiredValue: string;
  quotedValue: string;
  materiallyCritical: boolean;
}

export interface SpecEquivalenceResult {
  isEquivalent: boolean;
  hasMaterialMismatch: boolean;
  deviations: SpecDeviation[];
  summary: string;
}

/**
 * Compares requested technical specifications against a supplier's quoted specifications.
 * Explicitly flags any materially critical deviation so non-equivalent products are never
 * compared as apples-to-apples.
 */
export function evaluateSpecificationEquivalence(
  categorySlug: string,
  requestedSpecs: Record<string, string | undefined>,
  quotedSpecs: Record<string, string | undefined>,
  acceptableAlternativeBrands: readonly string[] = []
): SpecEquivalenceResult {
  const category = CONSTRUCTION_MATERIAL_TAXONOMY.find((c) => c.slug === categorySlug);
  const deviations: SpecDeviation[] = [];

  const keysToCheck = new Set([
    ...Object.keys(requestedSpecs),
    ...(category?.specAttributes.map((a) => a.key) || []),
  ]);

  for (const key of keysToCheck) {
    const reqVal = (requestedSpecs[key] || '').trim();
    if (!reqVal) continue;
    const quotedVal = (quotedSpecs[key] || '').trim();
    const attrMeta = category?.specAttributes.find((a) => a.key === key);
    const label = attrMeta?.label || key;
    const materiallyCritical = attrMeta ? attrMeta.materiallyCritical : true;

    const reqNorm = reqVal.toLowerCase();
    const quotedNorm = quotedVal.toLowerCase();

    if (reqNorm === quotedNorm) continue;

    // Allow explicitly listed acceptable alternative brands
    if (
      key === 'brand' &&
      acceptableAlternativeBrands.some((alt) => alt.trim().toLowerCase() === quotedNorm)
    ) {
      continue;
    }

    deviations.push({
      attributeKey: key,
      label,
      requiredValue: reqVal,
      quotedValue: quotedVal || 'NOT SPECIFIED',
      materiallyCritical,
    });
  }

  const hasMaterialMismatch = deviations.some((d) => d.materiallyCritical);
  const isEquivalent = deviations.length === 0;

  let summary = 'Full technical specification match.';
  if (hasMaterialMismatch) {
    summary = `NON-EQUIVALENT SPECIFICATION: ${deviations.filter((d) => d.materiallyCritical).map((d) => `${d.label} (${d.requiredValue} vs ${d.quotedValue})`).join('; ')}. Do not compare on price alone.`;
  } else if (!isEquivalent) {
    summary = `Minor non-critical variance in ${deviations.map((d) => d.label).join(', ')}.`;
  }

  return {
    isEquivalent,
    hasMaterialMismatch,
    deviations,
    summary,
  };
}
