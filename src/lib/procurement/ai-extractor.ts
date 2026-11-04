/**
 * PROVENTA — Construction Procurement Platform
 * AI Requirement & BOQ Parser
 * Parses natural language requirements and BOQ text into structured procurement items
 */

import type { ConstructionRfqItem, SiteDeliveryDetails } from './types';
import type { ConstructionUnit } from '@/lib/brand';

export interface ParsedRequirementResult {
  title: string;
  projectType: 'RESIDENTIAL' | 'COMMERCIAL' | 'INFRASTRUCTURE' | 'INDUSTRIAL' | 'RENOVATION';
  items: Omit<ConstructionRfqItem, 'id'>[];
  delivery: Partial<SiteDeliveryDetails>;
  urgency: 'STANDARD' | 'URGENT' | 'FLEXIBLE';
  confidence: number;
}

export function parseNaturalLanguageRequirement(rawText: string): ParsedRequirementResult {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  const items: Omit<ConstructionRfqItem, 'id'>[] = [];

  // Cement parsing
  const cementMatch = lower.match(/(\d+[\d,]*)\s*(bags?|katta|bori)?\s*(of\s+)?(ultratech|ambuja|acc|jk lakshmi|birla|cement)/i) ||
    lower.match(/(ultratech|ambuja|acc|cement)[^\d]*(\d+[\d,]*)\s*(bags?|katta|bori)?/i);

  if (cementMatch || lower.includes('cement')) {
    const qty = cementMatch ? parseInt(cementMatch[1].replace(/,/g, ''), 10) || 500 : 500;
    const brand = lower.includes('ultratech') ? 'UltraTech' : lower.includes('ambuja') ? 'Ambuja' : lower.includes('acc') ? 'ACC' : 'UltraTech / Ambuja';
    items.push({
      categorySlug: 'building-materials',
      categoryName: 'Building Materials',
      subcategorySlug: 'cement',
      subcategoryName: 'Cement',
      materialName: '53 Grade Ordinary Portland Cement (OPC)',
      gradeOrSpec: '53 Grade OPC (IS 269:2015)',
      brandPreference: brand,
      quantity: qty,
      unit: 'Bags' as ConstructionUnit,
      itemNotes: 'Fresh stock within 15 days of packing in standard 50kg bags',
    });
  }

  // Steel / TMT parsing
  const steelMatch = lower.match(/(\d+[\d,.]*)\s*(mt|tonne?s?|metric tonne?s?|kg)\s*(of\s+)?(tata|jindal|kamdhenu|steel|tmt)/i) ||
    lower.match(/(tmt|steel|tata tiscon|jindal)[^\d]*(\d+[\d,.]*)\s*(mt|tonnes?)/i);

  if (steelMatch || lower.includes('tmt') || lower.includes('steel') || lower.includes('rebar')) {
    const rawQty = steelMatch ? parseFloat(steelMatch[1].replace(/,/g, '')) || 25 : 25;
    const brand = lower.includes('tiscon') || lower.includes('tata') ? 'Tata Tiscon' : lower.includes('jindal') ? 'Jindal Panther' : 'Tata Tiscon / Jindal Panther';
    items.push({
      categorySlug: 'building-materials',
      categoryName: 'Building Materials',
      subcategorySlug: 'tmt-steel',
      subcategoryName: 'TMT Steel & Rebars',
      materialName: 'TMT Steel Rebars Fe 550D',
      gradeOrSpec: 'Fe 550D High Ductility (IS 1786)',
      brandPreference: brand,
      quantity: rawQty,
      unit: 'Metric tonnes (MT)' as ConstructionUnit,
      itemNotes: 'Assorted 10mm, 12mm, 16mm, 20mm rebars with mill test certificate',
    });
  }

  // Electrical / Wires parsing
  if (lower.includes('wire') || lower.includes('cable') || lower.includes('switch') || lower.includes('electrical')) {
    const brand = lower.includes('polycab') ? 'Polycab' : lower.includes('havells') ? 'Havells' : lower.includes('rr') ? 'RR Kabel' : 'Polycab / Havells';
    items.push({
      categorySlug: 'electrical',
      categoryName: 'Electrical Supplies',
      subcategorySlug: 'wires-cables',
      subcategoryName: 'Wires & Armoured Cables',
      materialName: 'FRLS Copper Building Wires (1.5 sq mm, 2.5 sq mm & 4 sq mm)',
      gradeOrSpec: '1100V Grade Flame Retardant Low Smoke (FRLS)',
      brandPreference: brand,
      quantity: 50,
      unit: 'Pieces (Nos)' as ConstructionUnit,
      itemNotes: 'Standard 90m coils in Red, Yellow, Blue and Black',
    });
  }

  // Plumbing / Pipes parsing
  if (lower.includes('pipe') || lower.includes('plumbing') || lower.includes('cpvc') || lower.includes('tank')) {
    const brand = lower.includes('astral') ? 'Astral' : lower.includes('ashirvad') ? 'Ashirvad' : lower.includes('supreme') ? 'Supreme' : 'Astral / Ashirvad';
    items.push({
      categorySlug: 'plumbing',
      categoryName: 'Plumbing & Water Systems',
      subcategorySlug: 'pipes-fittings',
      subcategoryName: 'CPVC, UPVC & SWR Pipes & Fittings',
      materialName: 'CPVC Pro Hot & Cold Water Pipes (SDR 11, 1-inch & 1.5-inch)',
      gradeOrSpec: 'Class SDR 11 heavy-duty pressure pipes',
      brandPreference: brand,
      quantity: 150,
      unit: 'Pieces (Nos)' as ConstructionUnit,
      itemNotes: '3-metre standard lengths with matching socket fittings',
    });
  }

  // Tiles & Flooring
  if (lower.includes('tile') || lower.includes('vitrified') || lower.includes('granite') || lower.includes('marble')) {
    const brand = lower.includes('kajaria') ? 'Kajaria' : lower.includes('somany') ? 'Somany' : 'Kajaria / Somany';
    items.push({
      categorySlug: 'tiles-flooring',
      categoryName: 'Tiles & Flooring',
      subcategorySlug: 'vitrified-tiles',
      subcategoryName: 'Vitrified Tiles (GVT / PGVT)',
      materialName: 'Polished Glazed Vitrified Tiles (PGVT 600x1200mm)',
      gradeOrSpec: 'High Gloss / Satin Finish 9mm thickness',
      brandPreference: brand,
      quantity: 3500,
      unit: 'Square feet (Sq.ft)' as ConstructionUnit,
      itemNotes: 'Uniform shade lot with break-resistant carton packing',
    });
  }

  // Fallback item if none parsed
  if (items.length === 0) {
    items.push({
      categorySlug: 'building-materials',
      categoryName: 'Building Materials',
      subcategorySlug: 'cement',
      subcategoryName: 'Cement',
      materialName: text.length > 5 ? text.slice(0, 60) : 'Construction Material Supplies',
      gradeOrSpec: 'Standard Commercial Grade',
      brandPreference: 'Leading Verified Brand',
      quantity: 100,
      unit: 'Pieces (Nos)' as ConstructionUnit,
      itemNotes: text,
    });
  }

  // Delivery extraction
  let siteName = 'Construction Site';
  let addressLine = 'Ahmedabad, Gujarat';
  let city = 'Ahmedabad';
  let pincode = '380060';

  if (lower.includes('bopal') || lower.includes('south bopal')) {
    siteName = 'South Bopal Site';
    addressLine = 'Near SP Ring Road, South Bopal';
    pincode = '380058';
  } else if (lower.includes('science city') || lower.includes('sola')) {
    siteName = 'Science City Site';
    addressLine = 'Near Science City Road, Sola';
    pincode = '380060';
  } else if (lower.includes('sanand')) {
    siteName = 'Sanand Industrial Project';
    addressLine = 'Sanand GIDC Highway';
    pincode = '382110';
  } else if (lower.includes('gandhinagar') || lower.includes('gift city')) {
    siteName = 'GIFT City / Gandhinagar Site';
    addressLine = 'GIFT City SEZ Road';
    city = 'Gandhinagar';
    pincode = '382355';
  }

  return {
    title: `${items[0].materialName} Procurement Requirement`,
    projectType: lower.includes('commercial') ? 'COMMERCIAL' : lower.includes('infra') ? 'INFRASTRUCTURE' : 'RESIDENTIAL',
    items,
    delivery: {
      siteName,
      addressLine,
      city,
      state: 'Gujarat',
      pincode,
      siteContactPerson: 'Site In-charge',
      siteContactPhone: '+91 98250 00000',
      vehicleAccessibility: '10-Wheeler Truck',
    },
    urgency: lower.includes('urgent') || lower.includes('immediate') || lower.includes('today') ? 'URGENT' : 'STANDARD',
    confidence: items.length > 0 ? 0.92 : 0.75,
  };
}
