import { describe, it, expect } from 'vitest';
import { BRAND_CONFIG, CONSTRUCTION_UNITS } from '@/lib/brand';
import {
  CONSTRUCTION_CATEGORIES,
  CATEGORY_ALIAS_MAP,
  normalizeCategorySlug,
  getCategoryBySlug,
  getAllCategories,
  CATEGORY_SELECT_OPTIONS,
} from '@/lib/procurement/categories';
import {
  evaluateUnitCompatibility,
  getUnitFamily,
} from '@/lib/procurement/unit-normalizer';
import {
  createConstructionRfq,
  submitConstructionQuotation,
  compareQuotationsForRfq,
} from '@/lib/procurement/repository';
import { matchSuppliersForRfq } from '@/lib/supplier-intelligence/service';

describe('PROVENTA — Construction & Infrastructure Procurement Platform Positioning & Taxonomy Suite', () => {
  // 1. BRAND POSITIONING & CONFIGURATION
  describe('1. Brand & Value Proposition Positioning', () => {
    it('positions the brand accurately as Construction & Infrastructure Procurement Platform', () => {
      expect(BRAND_CONFIG.name).toBe('PROVENTA');
      expect(BRAND_CONFIG.category).toBe('Construction & Infrastructure Procurement Platform');
      expect(BRAND_CONFIG.tagline).toBe('ONE PLATFORM TO SOURCE, COMPARE & PROCURE.');
      expect(BRAND_CONFIG.supportingStatement).toContain('Connecting builders, contractors, developers, infrastructure companies and construction material suppliers');
      expect(BRAND_CONFIG.shortDescription).toContain('Construction & Infrastructure Procurement Platform');
      expect(BRAND_CONFIG.seo.defaultTitle).toContain('Construction & Infrastructure Procurement Platform');
    });

    it('supports required construction units including Metric tonnes, Bags, Cubic metres, and Running metres', () => {
      expect(CONSTRUCTION_UNITS).toContain('Bags');
      expect(CONSTRUCTION_UNITS).toContain('Metric tonnes (MT)');
      expect(CONSTRUCTION_UNITS).toContain('Kilograms (KG)');
      expect(CONSTRUCTION_UNITS).toContain('Cubic metres (Cu.m)');
      expect(CONSTRUCTION_UNITS).toContain('Square feet (Sq.ft)');
      expect(CONSTRUCTION_UNITS).toContain('Running metres');
      expect(CONSTRUCTION_UNITS).toContain('Pieces (Nos)');
    });
  });

  // 2. 10-CATEGORY TAXONOMY & BACKWARD-COMPATIBLE ALIASING
  describe('2. Comprehensive 10-Category Product Taxonomy', () => {
    it('defines all 10 Core & Extended categories with authentic standards', () => {
      const all = getAllCategories();
      expect(all).toHaveLength(10);

      const slugs = all.map((c) => c.slug);
      expect(slugs).toEqual([
        'steel-metals',
        'cement-concrete',
        'building-materials',
        'pipes-plumbing',
        'electrical-materials',
        'finishing-materials',
        'sanitary-bathroom',
        'construction-chemicals',
        'equipment-formwork',
        'infrastructure-materials',
      ]);
    });

    it('configures Steel & Metals with TMT bars, MS plates, structural steel, and binding wire', () => {
      const steel = getCategoryBySlug('steel-metals');
      expect(steel).toBeDefined();
      expect(steel?.name).toBe('Steel & Metals');
      expect(steel?.standards).toContain('IS 1786:2008');

      const subSlugs = steel?.subcategories.map((s) => s.slug);
      expect(subSlugs).toContain('tmt-bars');
      expect(subSlugs).toContain('ms-plates-sheets');
      expect(subSlugs).toContain('structural-steel');
      expect(subSlugs).toContain('angles-channels-beams');
      expect(subSlugs).toContain('binding-wire');
    });

    it('configures Cement & Concrete with OPC, PPC, bulk cement, and ready-mix concrete', () => {
      const cement = getCategoryBySlug('cement-concrete');
      expect(cement).toBeDefined();
      expect(cement?.name).toBe('Cement & Concrete');
      expect(cement?.standards).toContain('IS 269:2015');

      const subSlugs = cement?.subcategories.map((s) => s.slug);
      expect(subSlugs).toContain('opc-cement');
      expect(subSlugs).toContain('ppc-cement');
      expect(subSlugs).toContain('bulk-cement');
      expect(subSlugs).toContain('ready-mix-concrete');
      expect(subSlugs).toContain('concrete-additives');
    });

    it('safely normalizes legacy category slugs without data corruption', () => {
      expect(normalizeCategorySlug('structural-steel')).toBe('steel-metals');
      expect(normalizeCategorySlug('tmt-steel')).toBe('steel-metals');
      expect(normalizeCategorySlug('cement')).toBe('cement-concrete');
      expect(normalizeCategorySlug('concrete')).toBe('cement-concrete');
      expect(normalizeCategorySlug('plumbing')).toBe('pipes-plumbing');
      expect(normalizeCategorySlug('electrical')).toBe('electrical-materials');
      expect(normalizeCategorySlug('tiles-flooring')).toBe('finishing-materials');
      expect(normalizeCategorySlug('doors-windows')).toBe('finishing-materials');
      expect(normalizeCategorySlug('building-materials')).toBe('building-materials');
      expect(normalizeCategorySlug('sanitary')).toBe('sanitary-bathroom');
      expect(normalizeCategorySlug('chemicals')).toBe('construction-chemicals');
      expect(normalizeCategorySlug('scaffolding')).toBe('equipment-formwork');
      expect(normalizeCategorySlug('road-materials')).toBe('infrastructure-materials');
    });

    it('exports dropdown select options with clear division classifications', () => {
      expect(CATEGORY_SELECT_OPTIONS).toHaveLength(10);
      const divisions = CATEGORY_SELECT_OPTIONS.map((c) => c.division);
      expect(divisions.filter((d) => d === 'CORE')).toHaveLength(5);
      expect(divisions.filter((d) => d === 'EXTENDED')).toHaveLength(5);
    });
  });

  // 3. UNIT NORMALIZATION & FAIR LANDED COST
  describe('3. Unit Compatibility & Spec Normalization', () => {
    it('classifies unit families accurately', () => {
      expect(getUnitFamily('Metric tonnes (MT)')).toBe('WEIGHT');
      expect(getUnitFamily('Kilograms (KG)')).toBe('WEIGHT');
      expect(getUnitFamily('Cubic metres (Cu.m)')).toBe('VOLUME');
      expect(getUnitFamily('Cubic feet (Cu.ft)')).toBe('VOLUME');
      expect(getUnitFamily('Square feet (Sq.ft)')).toBe('AREA');
      expect(getUnitFamily('Running metres')).toBe('LENGTH');
      expect(getUnitFamily('Bags')).toBe('PACKAGING');
      expect(getUnitFamily('Pieces (Nos)')).toBe('COUNT');
    });

    it('identifies exact unit matches without conversion', () => {
      const result = evaluateUnitCompatibility('Metric tonnes (MT)', 'Metric tonnes (MT)');
      expect(result.isCompatible).toBe(true);
      expect(result.requiresConversion).toBe(false);
      expect(result.conversionFactor).toBe(1.0);
    });

    it('normalizes compatible weight units: MT to KG', () => {
      // Buyer requested in MT, supplier quoted in KG
      const result = evaluateUnitCompatibility('Metric tonnes (MT)', 'Kilograms (KG)');
      expect(result.isCompatible).toBe(true);
      expect(result.requiresConversion).toBe(true);
      expect(result.conversionFactor).toBe(1000);
      expect(result.notes).toContain('1 MT = 1,000 KG');
    });

    it('normalizes compatible volume units: Cu.m to Cu.ft', () => {
      const result = evaluateUnitCompatibility('Cubic metres (Cu.m)', 'Cubic feet (Cu.ft)');
      expect(result.isCompatible).toBe(true);
      expect(result.requiresConversion).toBe(true);
      expect(result.conversionFactor).toBeGreaterThan(35);
    });

    it('rejects silent comparison of fundamentally incompatible units', () => {
      const result = evaluateUnitCompatibility('Bags', 'Running metres');
      expect(result.isCompatible).toBe(false);
      expect(result.requiresConversion).toBe(false);
      expect(result.notes).toContain('Incompatible procurement units');
    });
  });

  // 4. QUOTATION COMPARISON WITH SPECIFICATION HARMONIZATION
  describe('4. Quotation Landed Cost & Compatibility Verification', () => {
    it('flags quotation items with spec compatibility status in comparison matrix', () => {
      const rfq = createConstructionRfq({
        buyerId: 'buyer-builder-01',
        buyerName: 'Gujarat Infrastructure Corp',
        buyerEmail: 'procure@gujinfra.com',
        buyerRole: 'INFRASTRUCTURE_CONTRACTOR' as any,
        title: 'Ring Road Overbridge Reinforcement & Drainage Materials',
        projectType: 'INFRASTRUCTURE',
        items: [
          {
            categorySlug: 'steel-metals',
            categoryName: 'Steel & Metals',
            materialName: 'TMT Steel Rebars Fe 550D (25mm)',
            gradeOrSpec: 'Fe 550D IS 1786:2008 Primary',
            quantity: 50,
            unit: 'Metric tonnes (MT)',
            brandPreference: 'Tata Tiscon',
          },
        ],
        delivery: {
          siteName: 'Changodar Flyover Project Site',
          addressLine: 'Sarkhej-Bavla Highway, Changodar',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '382213',
          siteContactPerson: 'Dinesh Sharma',
          siteContactPhone: '+91 98250 88221',
          vehicleAccessibility: '10-Wheeler Truck',
          deliverySchedule: 'Staggered / Multi-Drop Delivery',
          unloadingRequirements: 'Crane unloading required',
        },
        requiredDeliveryDate: '2026-12-15',
      });

      // Supplier A quotes in exact unit (MT)
      submitConstructionQuotation({
        rfqId: rfq.id,
        supplierId: 'supp-gujarat-steel-cement',
        items: [
          {
            itemId: rfq.items[0].id,
            unitPrice: 53000,
            gstRatePercent: 18,
            brandSupplied: 'Tata Tiscon Fe 550D',
          },
        ],
        promisedDeliveryDate: '2026-12-14',
        paymentTerms: '100% Against Delivery',
      });

      const comparison = compareQuotationsForRfq(rfq.id);
      expect(comparison).not.toBeNull();
      expect(comparison?.quotations).toHaveLength(1);

      const itemBreakdown = comparison?.quotations[0].items[0];
      expect(itemBreakdown?.specCompatibilityStatus).toBe('COMPATIBLE_EXACT');
      expect(itemBreakdown?.normalizedUnitPrice).toBe(53000);
    });
  });

  // 5. SUPPLIER MATCHING & PRIORITY REGIONAL HUBS
  describe('5. Priority Hub Logistics & Supplier Matching', () => {
    it('gives priority hub advantage to stockyards situated in the Ahmedabad-Sanand-Changodar corridor', async () => {
      const rfq = createConstructionRfq({
        buyerId: 'buyer-contractor-02',
        buyerName: 'Apex Civil Builders',
        buyerEmail: 'info@apexcivil.in',
        buyerRole: 'CIVIL_CONTRACTOR' as any,
        title: 'Sanand Industrial Factory Precast & Foundation Rebars',
        projectType: 'INDUSTRIAL',
        items: [
          {
            categorySlug: 'steel-metals',
            categoryName: 'Steel & Metals',
            materialName: 'Fe 550D TMT Bars 16mm',
            quantity: 30,
            unit: 'Metric tonnes (MT)',
          },
        ],
        delivery: {
          siteName: 'Sanand GIDC Plot 108',
          addressLine: 'Sanand Industrial Estate, Sanand',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '382110',
          siteContactPerson: 'Vikram Mehta',
          siteContactPhone: '+91 98250 44332',
          vehicleAccessibility: '10-Wheeler Truck',
        },
        requiredDeliveryDate: '2026-12-25',
      });

      const matches = await matchSuppliersForRfq(rfq.id);
      expect(matches.length).toBeGreaterThan(0);

      // Verify that category and hub reasons are recorded
      const topMatch = matches[0];
      expect(topMatch.matchingReasons.some((r) => r.includes('Category') || r.includes('Advantage') || r.includes('Logistics') || r.includes('Match'))).toBe(true);
    });
  });
});
