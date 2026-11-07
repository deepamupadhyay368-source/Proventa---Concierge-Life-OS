import { normalizeCategorySlug } from '@/lib/procurement/categories';
/**
 * PROVENTA — Industrial Procurement Platform
 * Supplier Intelligence & Discovery Engine Service Layer
 * Structured, discoverable commercial profiles, catalogue management, location intelligence, and automated RFQ matching.
 */

import { db } from '@/lib/db';
import { createBusinessAuditLog } from '@/lib/business/service';
import { procurementNotificationService } from '@/lib/business/notifications';
import { getConstructionRfqById } from '@/lib/procurement/repository';
import type {
  PublicSupplierStorefront,
  SupplierWarehouseDto,
  ProductCatalogueDto,
  SupplierPerformanceDto,
  SupplierSearchParams,
  SupplierDiscoveryCard,
  SupplierRfqMatchResult,
} from './types';

// ============================================================
// SEED FALLBACK DATA FOR HIGH RESILIENCE & OFFLINE VERIFICATION
// ============================================================

const SEED_SUPPLIER_CATALOGUE: Record<string, {
  business: any;
  supplierProfile: any;
  warehouses: SupplierWarehouseDto[];
  products: ProductCatalogueDto[];
  performance: SupplierPerformanceDto;
}> = {
  'supp-gujarat-steel-cement': {
    business: {
      id: 'biz-gujarat-steel-cement',
      name: 'Gujarat Building Materials Syndicate',
      legalName: 'Gujarat Building Materials Syndicate Pvt Ltd',
      slug: 'gujarat-building-materials-syndicate',
      tagline: 'Premier Industrial Steel & Infrastructure Cement Distributors',
      description: 'Authorized primary distributor for Tata Tiscon, Jindal Panther Fe 550D and UltraTech OPC 53 Grade cement. Maintaining 50,000 MT warehousing facility in GIDC Odhav with dedicated fleet.',
      yearEstablished: 2008,
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '382415',
      verificationStatus: 'VERIFIED',
      verificationLevel: 'PROVENTA_VERIFIED',
      gstNumber: '24AAACG1928K1Z5',
    },
    supplierProfile: {
      id: 'sp-gujarat-steel-cement',
      supplierType: 'Distributor',
      operatingCategories: ['building-materials', 'structural-steel', 'cement'],
      subcategories: ['tmt-steel', 'cement', 'structural-sections'],
      brandsOffered: ['Tata Tiscon', 'Jindal Panther', 'UltraTech', 'Ambuja'],
      manufacturingCapacity: 'N/A (Stockist/Distributor)',
      monthlySupplyCapacity: '15,000 MT',
      minimumOrderValue: 100000,
      standardLeadTimeDays: 2,
      panIndiaDelivery: false,
      serviceableDistricts: ['Ahmedabad', 'Gandhinagar', 'Kheda', 'Mehsana', 'Sanand', 'Surendranagar'],
      serviceableStates: ['Gujarat', 'Rajasthan'],
    },
    warehouses: [
      {
        id: 'wh-odhav-01',
        name: 'GIDC Odhav Central Logistics Stockyard',
        address: 'Plot 42-45, Phase 2, GIDC Odhav',
        district: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '382415',
        capacitySqFt: 55000,
        operatingZones: ['Odhav', 'Naroda', 'Nikol', 'Vastral', 'Ahmedabad East', 'Gandhinagar'],
        railSidingAccess: true,
        weighbridgeAvailable: true,
      },
    ],
    products: [
      {
        id: 'prod-tata-tiscon-550d',
        supplierProfileId: 'sp-gujarat-steel-cement',
        name: 'Tata Tiscon Fe 550D High-Ductility TMT Rebars',
        category: 'building-materials',
        subcategory: 'tmt-steel',
        description: 'Primary producer virgin iron ore Fe 550D TMT bars with superior seismic resistance and high ductility.',
        brand: 'Tata Tiscon',
        grade: 'Fe 550D',
        standards: 'IS 1786:2008',
        specifications: { yieldStrength: '550 MPa min', elongation: '14.5% min', carbonEquivalent: '0.42% max' },
        unit: 'Metric tonnes (MT)',
        indicativePrice: 53200,
        moq: 10,
        availableQuantity: 3500,
        hsnCode: '72142090',
        gstRate: 18,
        images: ['/images/products/tata_tiscon_bundle.jpg'],
        warehouses: [{ name: 'GIDC Odhav Central Stockyard', district: 'Ahmedabad', state: 'Gujarat', stockAvailable: 3500 }],
        deliveryLocations: ['Ahmedabad', 'Gandhinagar', 'Sanand'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-ultratech-53-grade',
        supplierProfileId: 'sp-gujarat-steel-cement',
        name: 'UltraTech Ordinary Portland Cement (OPC) 53 Grade',
        category: 'building-materials',
        subcategory: 'cement',
        description: 'Fresh stock within 10 days of packing in 50kg moisture-resistant HDPE laminated bags.',
        brand: 'UltraTech',
        grade: 'OPC 53 Grade',
        standards: 'IS 269:2015',
        specifications: { compressiveStrength28Days: '53 MPa min', initialSettingTime: '30 mins min' },
        unit: 'Bags',
        indicativePrice: 340,
        moq: 200,
        availableQuantity: 25000,
        hsnCode: '25232910',
        gstRate: 28,
        images: ['/images/products/ultratech_opc_53.jpg'],
        warehouses: [{ name: 'GIDC Odhav Central Stockyard', district: 'Ahmedabad', state: 'Gujarat', stockAvailable: 25000 }],
        deliveryLocations: ['Ahmedabad', 'Gandhinagar', 'Kheda'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    performance: {
      rfqsReceived: 184,
      rfqsResponded: 176,
      responseRatePercent: 95.6,
      avgResponseTimeHours: 2.4,
      quotationsAwarded: 58,
      ordersCompleted: 520,
      onTimeDeliveryRate: 98.4,
      cancellationRate: 0.6,
      rating: 4.9,
      reviewCount: 142,
      totalDeliveredTonnage: 18400,
      sampleThresholdMet: true,
    },
  },
  'supp-sabarmati-tmt-rmc': {
    business: {
      id: 'biz-sabarmati-steel-concrete',
      name: 'Sabarmati Steel & Concrete Solutions',
      legalName: 'Sabarmati Infra Products LLP',
      slug: 'sabarmati-steel-concrete',
      tagline: 'Leading RMC Batching & Jindal Panther Authorized Stockist',
      description: 'Operating two computerized 60 cum/hr Schwing Stetter RMC batching plants in Changodar with a fleet of 18 transit mixers and 4 concrete boom pumps.',
      yearEstablished: 2014,
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '382213',
      verificationStatus: 'VERIFIED',
      verificationLevel: 'GST_VERIFIED',
      gstNumber: '24BBECS7712M1Z2',
    },
    supplierProfile: {
      id: 'sp-sabarmati-tmt-rmc',
      supplierType: 'Manufacturer',
      operatingCategories: ['building-materials', 'concrete-rmc', 'tmt-steel'],
      subcategories: ['rmc-concrete', 'tmt-steel', 'aggregates'],
      brandsOffered: ['Jindal Panther', 'Kamdhenu Fe 550D', 'Sabarmati RMC M25-M60'],
      manufacturingCapacity: '1,200 cum/day RMC',
      monthlySupplyCapacity: '10,000 MT Steel / 30,000 cum RMC',
      minimumOrderValue: 50000,
      standardLeadTimeDays: 1,
      panIndiaDelivery: false,
      serviceableDistricts: ['Ahmedabad', 'Sanand', 'Bavla', 'Dholera SIR', 'Gandhinagar'],
      serviceableStates: ['Gujarat'],
    },
    warehouses: [
      {
        id: 'wh-changodar-01',
        name: 'Changodar Automated Batching & Steel Stockyard',
        address: 'Survey 108, Sarkhej-Bavla Highway, Changodar',
        district: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '382213',
        capacitySqFt: 85000,
        operatingZones: ['Changodar', 'Sanand', 'Bavla', 'SG Highway', 'Bopal', 'Prahlad Nagar'],
        railSidingAccess: false,
        weighbridgeAvailable: true,
      },
    ],
    products: [
      {
        id: 'prod-jindal-panther-550d',
        supplierProfileId: 'sp-sabarmati-tmt-rmc',
        name: 'Jindal Panther Fe 550D Rebars',
        category: 'building-materials',
        subcategory: 'tmt-steel',
        description: 'Manufactured through blast furnace route, low sulphur and phosphorus, IS 1786 Fe 550D standard.',
        brand: 'Jindal Panther',
        grade: 'Fe 550D',
        standards: 'IS 1786:2008',
        specifications: { yieldStrength: '550 MPa', utsYsRatio: '1.15 min' },
        unit: 'Metric tonnes (MT)',
        indicativePrice: 52800,
        moq: 15,
        availableQuantity: 2800,
        hsnCode: '72142090',
        gstRate: 18,
        images: ['/images/products/jindal_panther_rebars.jpg'],
        warehouses: [{ name: 'Changodar Stockyard', district: 'Ahmedabad', state: 'Gujarat', stockAvailable: 2800 }],
        deliveryLocations: ['Ahmedabad', 'Sanand', 'Bavla'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-rmc-m40',
        supplierProfileId: 'sp-sabarmati-tmt-rmc',
        name: 'Ready-Mix Concrete M40 Grade High-Performance Mix',
        category: 'building-materials',
        subcategory: 'concrete-rmc',
        description: 'Design mix M40 concrete using 53 grade cement and fly ash with PCE superplasticizers. Direct site delivery in transit mixers.',
        brand: 'Sabarmati RMC',
        grade: 'M40',
        standards: 'IS 456 / IS 4926',
        specifications: { characteristicStrength: '40 N/mm2 at 28 days', slumpRetention: '2.5 hours' },
        unit: 'Cubic metres (cum)',
        indicativePrice: 4750,
        moq: 30,
        availableQuantity: 15000,
        hsnCode: '38245010',
        gstRate: 18,
        images: ['/images/products/rmc_transit_mixer.jpg'],
        warehouses: [{ name: 'Changodar Automated Batching Plant', district: 'Ahmedabad', state: 'Gujarat', stockAvailable: 15000 }],
        deliveryLocations: ['Ahmedabad', 'Sanand', 'Bopal', 'SG Highway'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    performance: {
      rfqsReceived: 142,
      rfqsResponded: 135,
      responseRatePercent: 95.1,
      avgResponseTimeHours: 1.8,
      quotationsAwarded: 42,
      ordersCompleted: 380,
      onTimeDeliveryRate: 97.2,
      cancellationRate: 0.8,
      rating: 4.8,
      reviewCount: 96,
      totalDeliveredTonnage: 12500,
      sampleThresholdMet: true,
    },
  },
  'supp-patel-electrical-cables': {
    business: {
      id: 'biz-patel-electrical',
      name: 'Patel Electrical & Power Systems',
      legalName: 'Patel Electrical Distributors LLP',
      slug: 'patel-electrical-power-systems',
      tagline: 'Authorized Polycab & Schneider Electric Industrial Infrastructure Depot',
      description: 'Distributor of HT/LT armored power cables, switchgear, distribution boards, transformers and industrial conduit systems.',
      yearEstablished: 2011,
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '380001',
      verificationStatus: 'VERIFIED',
      verificationLevel: 'PROVENTA_VERIFIED',
      gstNumber: '24AAGCP5519L1ZP',
    },
    supplierProfile: {
      id: 'sp-patel-electrical',
      supplierType: 'Distributor',
      operatingCategories: ['electrical', 'cables-wiring', 'switchgear'],
      subcategories: ['ht-lt-cables', 'switchgear', 'transformers', 'industrial-lighting'],
      brandsOffered: ['Polycab', 'Havells', 'RR Kabel', 'Schneider Electric', 'Legrand', 'Philips'],
      manufacturingCapacity: 'N/A',
      monthlySupplyCapacity: '500 km Cables / 2,000 DBs',
      minimumOrderValue: 25000,
      standardLeadTimeDays: 2,
      panIndiaDelivery: true,
      serviceableDistricts: ['All Gujarat', 'Mumbai Suburban', 'Pune', 'Indore'],
      serviceableStates: ['Gujarat', 'Maharashtra', 'Madhya Pradesh', 'Rajasthan'],
    },
    warehouses: [
      {
        id: 'wh-relief-road-01',
        name: 'Relief Road Central Electrical Depo',
        address: 'Shop 14-16, Relief Road Electrical Market',
        district: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380001',
        capacitySqFt: 30000,
        operatingZones: ['Relief Road', 'Ashram Road', 'Navrangpura', 'Satellite', 'SG Highway', 'All Ahmedabad'],
        railSidingAccess: false,
        weighbridgeAvailable: false,
      },
    ],
    products: [
      {
        id: 'prod-polycab-3.5c-cable',
        supplierProfileId: 'sp-patel-electrical',
        name: 'Polycab 3.5 Core Aluminium Armoured XLPE Power Cable (185 sq.mm)',
        category: 'electrical',
        subcategory: 'ht-lt-cables',
        description: '1100V heavy-duty underground power cable with galvanized steel strip armoring and PVC outer sheath.',
        brand: 'Polycab',
        grade: '1100V XLPE Grade',
        standards: 'IS 7098 (Part 1)',
        specifications: { conductor: 'Stranded Aluminium', insulation: 'Cross-linked Polyethylene (XLPE)', voltageRating: '1.1 kV' },
        unit: 'Metres (m)',
        indicativePrice: 1250,
        moq: 100,
        availableQuantity: 12000,
        hsnCode: '85444990',
        gstRate: 18,
        images: ['/images/products/polycab_cable_drum.jpg'],
        warehouses: [{ name: 'Relief Road Central Depo', district: 'Ahmedabad', state: 'Gujarat', stockAvailable: 12000 }],
        deliveryLocations: ['All Gujarat', 'Mumbai', 'Pune'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    performance: {
      rfqsReceived: 128,
      rfqsResponded: 124,
      responseRatePercent: 96.8,
      avgResponseTimeHours: 1.5,
      quotationsAwarded: 48,
      ordersCompleted: 410,
      onTimeDeliveryRate: 99.1,
      cancellationRate: 0.2,
      rating: 4.9,
      reviewCount: 118,
      totalDeliveredTonnage: 450,
      sampleThresholdMet: true,
    },
  },
};

// Global in-memory saved suppliers store
const globalForSavedSuppliers = globalThis as unknown as {
  __proventaSavedSuppliers?: Map<string, Set<string>>;
  __proventaProductsStore?: Map<string, ProductCatalogueDto>;
  __proventaWarehousesStore?: Map<string, SupplierWarehouseDto>;
  __proventaServiceAreasStore?: Map<string, any>;
};

function getSavedStore() {
  if (!globalForSavedSuppliers.__proventaSavedSuppliers) {
    globalForSavedSuppliers.__proventaSavedSuppliers = new Map();
  }
  return globalForSavedSuppliers.__proventaSavedSuppliers;
}

function getProductsStore() {
  if (!globalForSavedSuppliers.__proventaProductsStore) {
    globalForSavedSuppliers.__proventaProductsStore = new Map();
    // Pre-populate with seed supplier products
    for (const sup of Object.values(SEED_SUPPLIER_CATALOGUE)) {
      for (const p of sup.products) {
        globalForSavedSuppliers.__proventaProductsStore.set(p.id, p);
      }
    }
  }
  return globalForSavedSuppliers.__proventaProductsStore;
}

// ============================================================
// 1. SUPPLIER STOREFRONT SERVICE
// ============================================================

/**
 * Fetch a public/buyer-facing supplier storefront.
 * Strictly NEVER exposes PAN, confidential documents, bank details, or private owner contacts.
 */
export async function getPublicSupplierStorefront(
  slugOrId: string,
  viewerBuyerBusinessId?: string
): Promise<PublicSupplierStorefront | null> {
  // 1. Try DB lookup first
  try {
    const dbBusiness = await db.business.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
      include: {
        supplierProfile: {
          include: {
            products: { where: { isActive: true } },
            warehouses: true,
            serviceAreas: true,
            performance: true,
          },
        },
      },
    });

    if (dbBusiness && dbBusiness.supplierProfile) {
      const sp = dbBusiness.supplierProfile;

      // Check if buyer has saved this supplier
      let isSaved = false;
      if (viewerBuyerBusinessId) {
        try {
          const savedRecord = await db.savedSupplier.findUnique({
            where: {
              buyerBusinessId_supplierBusinessId: {
                buyerBusinessId: viewerBuyerBusinessId,
                supplierBusinessId: dbBusiness.id,
              },
            },
          });
          isSaved = Boolean(savedRecord);
        } catch (e) {
          // Non-blocking
        }
      }

      // Format warehouses
      const warehouses: SupplierWarehouseDto[] = (sp.warehouses || []).map((w) => ({
        id: w.id,
        name: w.name,
        address: w.address,
        district: w.district,
        state: w.state,
        pincode: w.pincode,
        capacitySqFt: w.capacitySqFt,
        operatingZones: w.operatingZones,
        railSidingAccess: w.railSidingAccess,
        weighbridgeAvailable: w.weighbridgeAvailable,
      }));

      // Format products
      const products: ProductCatalogueDto[] = (sp.products || []).map((p) => ({
        id: p.id,
        supplierProfileId: p.supplierProfileId,
        name: p.name,
        category: p.category,
        subcategory: p.subcategory,
        description: p.description,
        brand: p.brand,
        grade: p.grade,
        standards: p.standards,
        specifications: p.specifications as any,
        unit: p.unit,
        indicativePrice: p.indicativePrice,
        moq: p.moq,
        availableQuantity: p.availableQuantity,
        hsnCode: p.hsnCode,
        gstRate: p.gstRate,
        images: p.images,
        warehouses: p.warehouses as any,
        deliveryLocations: p.deliveryLocations as any,
        isActive: p.isActive,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));

      // Format performance
      const perf = sp.performance;
      const performance: SupplierPerformanceDto = {
        rfqsReceived: perf?.rfqsReceived || 0,
        rfqsResponded: perf?.rfqsResponded || 0,
        responseRatePercent: perf?.responseRatePercent || 0,
        avgResponseTimeHours: perf?.avgResponseTimeHours || 0,
        quotationsAwarded: perf?.quotationsAwarded || 0,
        ordersCompleted: perf?.ordersCompleted || 0,
        onTimeDeliveryRate: perf?.onTimeDeliveryRate || 0,
        cancellationRate: perf?.cancellationRate || 0,
        rating: perf?.rating || dbBusiness.averageRating || 0,
        reviewCount: perf?.reviewCount || dbBusiness.reviewCount || 0,
        totalDeliveredTonnage: perf?.totalDeliveredTonnage || 0,
        sampleThresholdMet: (perf?.ordersCompleted || 0) >= 3,
        metricsNotice:
          (perf?.ordersCompleted || 0) < 3
            ? 'Minimum 3 completed transactions required for verified platform badge'
            : undefined,
      };

      // Sanitize: Exclude PAN, CIN, private contacts, internal notes
      return {
        id: dbBusiness.id,
        supplierProfileId: sp.id,
        name: dbBusiness.name,
        legalName: dbBusiness.legalName,
        slug: dbBusiness.slug,
        tagline: dbBusiness.tagline,
        description: dbBusiness.description,
        logoUrl: dbBusiness.logoUrl,
        yearEstablished: dbBusiness.yearEstablished,
        city: dbBusiness.city || 'Ahmedabad',
        state: dbBusiness.state || 'Gujarat',
        postalCode: dbBusiness.postalCode,
        supplierType: sp.supplierType || 'Distributor',
        gstVerificationStatus: dbBusiness.gstNumber ? 'VERIFIED' : 'PENDING',
        proventaVerificationStatus:
          dbBusiness.verificationStatus === 'VERIFIED'
            ? 'VERIFIED'
            : dbBusiness.verificationStatus === 'SUBMITTED'
            ? 'UNDER_REVIEW'
            : 'DRAFT',
        operatingCategories: sp.operatingCategories,
        subcategories: sp.subcategories,
        brandsOffered: sp.brandsOffered,
        manufacturingCapacity: sp.manufacturingCapacity,
        monthlySupplyCapacity: sp.monthlySupplyCapacity,
        minimumOrderValue: sp.minimumOrderValue,
        standardLeadTimeDays: sp.standardLeadTimeDays || 3,
        panIndiaDelivery: sp.panIndiaDelivery,
        serviceableDistricts: sp.serviceableDistricts,
        serviceableStates: sp.serviceableStates,
        warehouses,
        products,
        performance,
        isSaved,
      };
    }
  } catch (err: any) {
    // Non-blocking fallback
  }

  // 2. Fallback to registered seed inventory
  for (const [key, data] of Object.entries(SEED_SUPPLIER_CATALOGUE)) {
    if (key === slugOrId || data.business.id === slugOrId || data.business.slug === slugOrId) {
      const savedStore = getSavedStore();
      const isSaved = viewerBuyerBusinessId
        ? savedStore.get(viewerBuyerBusinessId)?.has(data.business.id) || false
        : false;

      return {
        id: data.business.id,
        supplierProfileId: data.supplierProfile.id,
        name: data.business.name,
        legalName: data.business.legalName,
        slug: data.business.slug,
        tagline: data.business.tagline,
        description: data.business.description,
        logoUrl: data.business.logoUrl || null,
        yearEstablished: data.business.yearEstablished,
        city: data.business.city,
        state: data.business.state,
        postalCode: data.business.postalCode,
        supplierType: data.supplierProfile.supplierType,
        gstVerificationStatus: 'VERIFIED',
        proventaVerificationStatus: 'VERIFIED',
        operatingCategories: data.supplierProfile.operatingCategories,
        subcategories: data.supplierProfile.subcategories,
        brandsOffered: data.supplierProfile.brandsOffered,
        manufacturingCapacity: data.supplierProfile.manufacturingCapacity,
        monthlySupplyCapacity: data.supplierProfile.monthlySupplyCapacity,
        minimumOrderValue: data.supplierProfile.minimumOrderValue,
        standardLeadTimeDays: data.supplierProfile.standardLeadTimeDays,
        panIndiaDelivery: data.supplierProfile.panIndiaDelivery,
        serviceableDistricts: data.supplierProfile.serviceableDistricts,
        serviceableStates: data.supplierProfile.serviceableStates,
        warehouses: data.warehouses,
        products: data.products,
        performance: data.performance,
        isSaved,
      };
    }
  }

  return null;
}

// ============================================================
// 2. PRODUCT CATALOGUE MANAGEMENT (CRUD & BULK UPLOAD)
// ============================================================

export async function addSupplierProduct(
  supplierProfileId: string,
  input: {
    name: string;
    category: string;
    subcategory?: string;
    description?: string;
    brand?: string;
    grade?: string;
    standards?: string;
    specifications?: Record<string, any>;
    unit: string;
    indicativePrice?: number;
    moq?: number;
    availableQuantity?: number;
    hsnCode?: string;
    gstRate?: number;
    images?: string[];
    warehouses?: Array<{ name: string; district: string; state: string; stockAvailable?: number }>;
    deliveryLocations?: string[];
  },
  userId?: string
): Promise<ProductCatalogueDto> {
  if (!input.name?.trim() || !input.category?.trim() || !input.unit?.trim()) {
    throw new Error('Product name, category, and unit are required');
  }

  const pStore = getProductsStore();
  const id = `prod_${Math.random().toString(36).substring(2, 10)}`;

  const newProduct: ProductCatalogueDto = {
    id,
    supplierProfileId,
    name: input.name,
    category: input.category,
    subcategory: input.subcategory || null,
    description: input.description || null,
    brand: input.brand || null,
    grade: input.grade || null,
    standards: input.standards || null,
    specifications: input.specifications || null,
    unit: input.unit,
    indicativePrice: input.indicativePrice || null,
    moq: input.moq || 1,
    availableQuantity: input.availableQuantity || null,
    hsnCode: input.hsnCode || null,
    gstRate: input.gstRate || 18,
    images: input.images || [],
    warehouses: input.warehouses || null,
    deliveryLocations: input.deliveryLocations || null,
    isActive: true,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  pStore.set(id, newProduct);

  // Async DB persistence
  try {
    await db.supplierProduct.create({
      data: {
        id,
        supplierProfileId,
        name: input.name,
        category: input.category,
        subcategory: input.subcategory,
        description: input.description,
        brand: input.brand,
        grade: input.grade,
        standards: input.standards,
        specifications: input.specifications as any,
        unit: input.unit,
        indicativePrice: input.indicativePrice,
        moq: input.moq,
        availableQuantity: input.availableQuantity,
        hsnCode: input.hsnCode,
        gstRate: input.gstRate,
        images: input.images || [],
        warehouses: input.warehouses as any,
        deliveryLocations: input.deliveryLocations as any,
        isActive: true,
      },
    });

    const sp = await db.supplierProfile.findUnique({
      where: { id: supplierProfileId },
      select: { businessId: true },
    });
    if (sp?.businessId) {
      await createBusinessAuditLog({
        businessId: sp.businessId,
        userId,
        action: 'SUPPLIER_PRODUCT_ADDED',
        details: `Added new catalogue product: "${input.name}" (${input.brand || 'Standard'})`,
        metadata: { productId: id, name: input.name },
      });
    }
  } catch (err) {
    // Non-blocking offline fallback
  }

  return newProduct;
}

export async function updateSupplierProduct(
  productId: string,
  supplierProfileId: string,
  input: Partial<ProductCatalogueDto>,
  userId?: string
): Promise<ProductCatalogueDto> {
  const pStore = getProductsStore();
  const existing = pStore.get(productId);

  if (!existing) {
    throw new Error(`Product not found with ID ${productId}`);
  }

  const updated: ProductCatalogueDto = {
    ...(existing || ({} as any)),
    ...input,
    id: productId,
    supplierProfileId,
    updatedAt: new Date().toISOString(),
  };
  pStore.set(productId, updated);

  try {
    await db.supplierProduct.update({
      where: { id: productId },
      data: {
        name: input.name,
        category: input.category,
        subcategory: input.subcategory,
        description: input.description,
        brand: input.brand,
        grade: input.grade,
        standards: input.standards,
        specifications: input.specifications as any,
        unit: input.unit,
        indicativePrice: input.indicativePrice,
        moq: input.moq,
        availableQuantity: input.availableQuantity,
        hsnCode: input.hsnCode,
        gstRate: input.gstRate,
        images: input.images,
        warehouses: input.warehouses as any,
        deliveryLocations: input.deliveryLocations as any,
        isActive: input.isActive,
      },
    });
  } catch (err) {
    // Non-blocking
  }

  return updated;
}

export async function deleteSupplierProduct(
  productId: string,
  supplierProfileId: string,
  userId?: string
): Promise<boolean> {
  const pStore = getProductsStore();
  pStore.delete(productId);

  try {
    await db.supplierProduct.delete({
      where: { id: productId },
    });
    return true;
  } catch (err) {
    return true;
  }
}

export async function bulkUploadSupplierProducts(
  supplierProfileId: string,
  products: Array<{
    name: string;
    category: string;
    subcategory?: string;
    brand?: string;
    grade?: string;
    standards?: string;
    unit: string;
    indicativePrice?: number;
    moq?: number;
    availableQuantity?: number;
    hsnCode?: string;
    gstRate?: number;
  }>,
  userId?: string
): Promise<{ addedCount: number; products: ProductCatalogueDto[] }> {
  const added: ProductCatalogueDto[] = [];
  for (const p of products) {
    if (!p.name || !p.category || !p.unit) continue;
    const item = await addSupplierProduct(supplierProfileId, p, userId);
    added.push(item);
  }
  return { addedCount: added.length, products: added };
}

// ============================================================
// 3. BUYER SUPPLIER DISCOVERY & FILTERING ENGINE
// ============================================================

export async function searchSuppliers(
  params: SupplierSearchParams,
  viewerBuyerBusinessId?: string
): Promise<{
  suppliers: SupplierDiscoveryCard[];
  total: number;
  totalCount?: number;
  facets: {
    categories: Array<{ name: string; count: number }>;
    brands: Array<{ name: string; count: number }>;
    districts: Array<{ name: string; count: number }>;
    supplierTypes: Array<{ name: string; count: number }>;
  };
}> {
  // Collect all searchable suppliers from seed and DB
  const rawList: PublicSupplierStorefront[] = [];

  // Seed inventory
  for (const s of Object.values(SEED_SUPPLIER_CATALOGUE)) {
    const storefront = await getPublicSupplierStorefront(s.business.id, viewerBuyerBusinessId);
    if (storefront) rawList.push(storefront);
  }

  // Also query DB for newly registered suppliers
  try {
    const dbSuppliers = await db.business.findMany({
      where: {
        platformRole: { in: ['SUPPLIER', 'BOTH'] },
        supplierProfile: { isNot: null },
      },
      include: {
        supplierProfile: {
          include: {
            products: true,
            warehouses: true,
            serviceAreas: true,
            performance: true,
          },
        },
      },
      take: 50,
    });

    for (const b of dbSuppliers) {
      if (!rawList.some((existing) => existing.id === b.id || existing.slug === b.slug)) {
        const sf = await getPublicSupplierStorefront(b.id, viewerBuyerBusinessId);
        if (sf) rawList.push(sf);
      }
    }
  } catch (e) {
    // Non-blocking
  }

  // Multi-faceted filtering
  let filtered = rawList;

  if (params.query) {
    const q = params.query.toLowerCase().trim();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.tagline && s.tagline.toLowerCase().includes(q)) ||
        s.brandsOffered.some((b) => b.toLowerCase().includes(q)) ||
        s.operatingCategories.some((c) => c.toLowerCase().includes(q)) ||
        s.products.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.brand && p.brand.toLowerCase().includes(q)) ||
            (p.grade && p.grade.toLowerCase().includes(q))
        )
    );
  }

  if (params.category) {
    const cat = params.category.toLowerCase().replace(/[^a-z0-9]/g, '');
    filtered = filtered.filter(
      (s) =>
        s.operatingCategories.some((c) => {
          const cClean = c.toLowerCase().replace(/[^a-z0-9]/g, '');
          return cClean.includes(cat) || cat.includes(cClean);
        }) ||
        s.products.some((p) => {
          const pClean = p.category.toLowerCase().replace(/[^a-z0-9]/g, '');
          return pClean.includes(cat) || cat.includes(pClean);
        })
    );
  }

  if (params.brand) {
    const bTerm = params.brand.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.brandsOffered.some((b) => b.toLowerCase().includes(bTerm)) ||
        s.products.some((p) => p.brand?.toLowerCase().includes(bTerm))
    );
  }

  if (params.grade) {
    const gTerm = params.grade.toLowerCase();
    filtered = filtered.filter((s) =>
      s.products.some((p) => p.grade?.toLowerCase().includes(gTerm))
    );
  }

  if (params.supplierType) {
    filtered = filtered.filter(
      (s) => s.supplierType.toLowerCase() === params.supplierType!.toLowerCase()
    );
  }

  if (params.district) {
    const dTerm = params.district.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.city.toLowerCase().includes(dTerm) ||
        s.serviceableDistricts.some((d) => d.toLowerCase().includes(dTerm)) ||
        s.warehouses.some((w) => w.district.toLowerCase().includes(dTerm))
    );
  }

  if (params.state) {
    const sTerm = params.state.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.state.toLowerCase().includes(sTerm) ||
        s.serviceableStates.some((st) => st.toLowerCase().includes(sTerm)) ||
        s.panIndiaDelivery
    );
  }

  if (params.gstVerifiedOnly || params.verificationStatus === 'GST_VERIFIED') {
    filtered = filtered.filter((s) => s.gstVerificationStatus === 'VERIFIED');
  }

  if (params.proventaVerifiedOnly || params.verificationStatus === 'VERIFIED') {
    filtered = filtered.filter(
      (s) => s.proventaVerificationStatus === 'VERIFIED' || s.gstVerificationStatus === 'VERIFIED'
    );
  }

  if (params.minCapacity) {
    filtered = filtered.filter((s) => {
      const totalAvailable = s.products.reduce((acc, p) => acc + (p.availableQuantity || 0), 0);
      return totalAvailable >= params.minCapacity!;
    });
  }

  if (params.panIndiaOnly) {
    filtered = filtered.filter((s) => s.panIndiaDelivery);
  }

  // Calculate facets from the full rawList
  const categoryCounts = new Map<string, number>();
  const brandCounts = new Map<string, number>();
  const districtCounts = new Map<string, number>();
  const typeCounts = new Map<string, number>();

  for (const s of rawList) {
    for (const c of s.operatingCategories) {
      categoryCounts.set(c, (categoryCounts.get(c) || 0) + 1);
    }
    for (const b of s.brandsOffered) {
      brandCounts.set(b, (brandCounts.get(b) || 0) + 1);
    }
    if (s.city) districtCounts.set(s.city, (districtCounts.get(s.city) || 0) + 1);
    if (s.supplierType) typeCounts.set(s.supplierType, (typeCounts.get(s.supplierType) || 0) + 1);
  }

  const facets = {
    categories: Array.from(categoryCounts.entries()).map(([name, count]) => ({ name, count })),
    brands: Array.from(brandCounts.entries()).map(([name, count]) => ({ name, count })),
    districts: Array.from(districtCounts.entries()).map(([name, count]) => ({ name, count })),
    supplierTypes: Array.from(typeCounts.entries()).map(([name, count]) => ({ name, count })),
  };

  // Convert to Discovery Cards
  const cards: SupplierDiscoveryCard[] = filtered.map((s) => ({
    id: s.id,
    supplierProfileId: s.supplierProfileId,
    name: s.name,
    slug: s.slug,
    tagline: s.tagline,
    city: s.city,
    state: s.state,
    supplierType: s.supplierType,
    verificationBadge:
      s.proventaVerificationStatus === 'VERIFIED'
        ? 'PREMIUM_VERIFIED'
        : s.gstVerificationStatus === 'VERIFIED'
        ? 'GST_VERIFIED'
        : 'VERIFIED',
    isGstVerified: s.gstVerificationStatus === 'VERIFIED',
    categories: s.operatingCategories,
    brands: s.brandsOffered,
    monthlyCapacity: s.monthlySupplyCapacity,
    warehousesCount: s.warehouses.length,
    serviceableDistrictsCount: s.serviceableDistricts.length,
    panIndiaDelivery: s.panIndiaDelivery,
    rating: s.performance.rating,
    reviewCount: s.performance.reviewCount,
    sampleThresholdMet: s.performance.sampleThresholdMet,
    matchedProductsCount: s.products.length,
    totalAvailableCapacity: s.products.reduce((acc, p) => acc + (p.availableQuantity || 0), 0),
    topProducts: s.products.slice(0, 3).map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      brand: p.brand,
      grade: p.grade,
      unit: p.unit,
      indicativePrice: p.indicativePrice,
    })),
    isSaved: s.isSaved,
  }));

  const page = params.page || 1;
  const limit = params.limit || 20;
  const paginated = cards.slice((page - 1) * limit, page * limit);

  return {
    suppliers: paginated,
    total: cards.length,
    totalCount: cards.length,
    facets,
  };
}

// ============================================================
// 4. AUTOMATED RFQ MATCHING ENGINE
// ============================================================

/**
 * Intelligent RFQ Matching Algorithm:
 * 1. Analyzes required products & technical specifications from the RFQ line items.
 * 2. Cross-references supplier product catalogues (grade, IS standards, brand, MOQ).
 * 3. Evaluates location intelligence (registered warehouse proximity vs serviceable districts).
 * 4. Checks verification credentials and capacity.
 * 5. Generates ranked eligible suppliers with structured matching reasons and match scores (0-100).
 */
export async function matchSuppliersForRfq(rfqId: string): Promise<SupplierRfqMatchResult[]> {
  const rfq = getConstructionRfqById(rfqId);
  if (!rfq) return [];

  // Get all candidate suppliers
  const candidates: PublicSupplierStorefront[] = [];
  for (const s of Object.values(SEED_SUPPLIER_CATALOGUE)) {
    const storefront = await getPublicSupplierStorefront(s.business.id);
    if (storefront) candidates.push(storefront);
  }

  // Also query DB
  try {
    const dbSuppliers = await db.business.findMany({
      where: {
        platformRole: { in: ['SUPPLIER', 'BOTH'] },
        supplierProfile: { isNot: null },
      },
      select: { id: true },
    });
    for (const b of dbSuppliers) {
      if (!candidates.some((c) => c.id === b.id)) {
        const sf = await getPublicSupplierStorefront(b.id);
        if (sf) candidates.push(sf);
      }
    }
  } catch (e) {
    // Non-blocking
  }

  const results: SupplierRfqMatchResult[] = [];
  const rfqDeliveryCity = rfq.delivery.city?.toLowerCase() || 'ahmedabad';
  const rfqDeliveryState = rfq.delivery.state?.toLowerCase() || 'gujarat';

  for (const candidate of candidates) {
    let score = 0;
    const reasons: string[] = [];
    const matchedProducts: Array<{ id: string; name: string; category: string; brand?: string | null }> = [];

    // Criteria A: Category & Item Matching (+35 points max)
    const matchingRfqItems = rfq.items.filter((item) => {
      const itemCat = item.categorySlug.toLowerCase();
      const hasCat = candidate.operatingCategories.some((c) => c.toLowerCase().includes(itemCat));
      return hasCat;
    });

    if (matchingRfqItems.length > 0) {
      score += 30;
      reasons.push(`Core Category Match: ${matchingRfqItems.map((i) => i.materialName).join(', ')}`);
    }

    // Criteria B: Specific Product Catalogue, Brand & Grade Match (+30 points max)
    for (const rfqItem of rfq.items) {
      const matchingProduct = candidate.products.find((p) => {
        const nameMatch = p.name.toLowerCase().includes(rfqItem.materialName.toLowerCase()) ||
          rfqItem.materialName.toLowerCase().includes(p.name.toLowerCase());
        const brandMatch = rfqItem.brandPreference && p.brand &&
          p.brand.toLowerCase().includes(rfqItem.brandPreference.toLowerCase());
        const gradeMatch = rfqItem.gradeOrSpec && p.grade &&
          rfqItem.gradeOrSpec.toLowerCase().includes(p.grade.toLowerCase());
        return nameMatch || brandMatch || gradeMatch;
      });

      if (matchingProduct) {
        score += 25;
        matchedProducts.push({
          id: matchingProduct.id,
          name: matchingProduct.name,
          category: matchingProduct.category,
          brand: matchingProduct.brand,
        });
        reasons.push(
          `Catalogue Specification Match: "${matchingProduct.name}" (${matchingProduct.brand || 'IS Certified'}, ${matchingProduct.grade || 'Standard'})`
        );
        break;
      }
    }

    // Criteria C: Location Intelligence & Warehouse Proximity (+25 points max)
    const hasLocalWarehouse = candidate.warehouses.some(
      (w) => w.district.toLowerCase() === rfqDeliveryCity
    );
    const servesDistrict = candidate.serviceableDistricts.some(
      (d) => d.toLowerCase().includes(rfqDeliveryCity) || d.toLowerCase().includes('all')
    );
    const servesState = candidate.serviceableStates.some(
      (st) => st.toLowerCase() === rfqDeliveryState
    );

    if (hasLocalWarehouse) {
      score += 25;
      const wh = candidate.warehouses.find((w) => w.district.toLowerCase() === rfqDeliveryCity);
      reasons.push(`Local Stockyard in ${wh?.district || rfqDeliveryCity}: Immediate dispatch capability from ${wh?.name || 'hub'}`);
    } else if (servesDistrict) {
      score += 20;
      reasons.push(`Direct Serviceable District: Registered operational delivery coverage in ${rfqDeliveryCity}`);
    } else if (servesState || candidate.panIndiaDelivery) {
      score += 10;
      reasons.push(candidate.panIndiaDelivery ? 'Pan-India Certified Logistics Network' : `State Corridor Coverage: ${rfqDeliveryState}`);
    }

    // Criteria D: Business Verification & Performance Credentials (+15 points max)
    if (candidate.gstVerificationStatus === 'VERIFIED') {
      score += 5;
      reasons.push('Government GSTIN Active & Verified');
    }
    if (candidate.proventaVerificationStatus === 'VERIFIED') {
      score += 5;
      reasons.push('PROVENTA Verified Industrial Enterprise');
    }
    if (candidate.performance.sampleThresholdMet && candidate.performance.rating >= 4.5) {
      score += 5;
      reasons.push(`High Performance Rating: ${candidate.performance.rating} / 5.0 (${candidate.performance.ordersCompleted}+ deliveries)`);
    }

    // Threshold: Score >= 40 indicates qualified match
    if (score >= 40) {
      results.push({
        supplierBusinessId: candidate.id,
        supplierName: candidate.name,
        slug: candidate.slug,
        city: candidate.city,
        state: candidate.state,
        matchScore: Math.min(score, 100),
        matchingReasons: reasons,
        matchedProducts,
        verificationBadge: candidate.proventaVerificationStatus,
        rating: candidate.performance.rating,
        panIndiaDelivery: candidate.panIndiaDelivery,
      });
    }
  }

  // Sort by match score descending
  results.sort((a, b) => b.matchScore - a.matchScore);

  // Persist matches in DB & dispatch notifications
  void (async () => {
    try {
      for (const res of results) {
        await db.supplierRFQMatch.upsert({
          where: {
            rfqId_supplierBusinessId: {
              rfqId: rfq.id,
              supplierBusinessId: res.supplierBusinessId,
            },
          },
          update: {
            matchScore: res.matchScore,
            matchingReasons: res.matchingReasons as any,
            matchedProductIds: res.matchedProducts.map((p) => p.id),
          },
          create: {
            rfqId: rfq.id,
            supplierBusinessId: res.supplierBusinessId,
            matchScore: res.matchScore,
            matchingReasons: res.matchingReasons as any,
            matchedProductIds: res.matchedProducts.map((p) => p.id),
            matchType: 'AUTOMATIC',
          },
        });

        // Notify matching supplier
        await procurementNotificationService.notifyRfqMatched(
          res.supplierBusinessId,
          rfq.title,
          rfq.id
        );
      }
    } catch (e) {
      // Non-blocking
    }
  })();

  return results;
}

// ============================================================
// 5. SAVED SUPPLIERS (FAVORITES / BOOKMARKS)
// ============================================================

export async function toggleSaveSupplier(
  buyerBusinessId: string,
  supplierBusinessId: string,
  notes?: string,
  tags?: string[]
): Promise<{ isSaved: boolean; saved: boolean }> {
  const savedStore = getSavedStore();
  if (!savedStore.has(buyerBusinessId)) {
    savedStore.set(buyerBusinessId, new Set());
  }
  const set = savedStore.get(buyerBusinessId)!;

  let isSaved = false;

  if (set.has(supplierBusinessId)) {
    set.delete(supplierBusinessId);
    isSaved = false;
  } else {
    set.add(supplierBusinessId);
    isSaved = true;
  }

  try {
    if (isSaved) {
      await db.savedSupplier.upsert({
        where: {
          buyerBusinessId_supplierBusinessId: {
            buyerBusinessId,
            supplierBusinessId,
          },
        },
        update: {
          notes: notes || undefined,
          tags: tags || [],
        },
        create: {
          buyerBusinessId,
          supplierBusinessId,
          notes,
          tags: tags || [],
        },
      });
    } else {
      await db.savedSupplier.delete({
        where: {
          buyerBusinessId_supplierBusinessId: {
            buyerBusinessId,
            supplierBusinessId,
          },
        },
      });
    }
  } catch (err) {
    // Non-blocking
  }

  return { isSaved, saved: isSaved };
}

export async function listSavedSuppliers(
  buyerBusinessId: string
): Promise<SupplierDiscoveryCard[]> {
  const savedStore = getSavedStore();
  const set = savedStore.get(buyerBusinessId) || new Set();

  const results: SupplierDiscoveryCard[] = [];

  for (const suppId of set) {
    const storefront = await getPublicSupplierStorefront(suppId, buyerBusinessId);
    if (storefront) {
      results.push({
        id: storefront.id,
        supplierProfileId: storefront.supplierProfileId,
        name: storefront.name,
        slug: storefront.slug,
        tagline: storefront.tagline,
        city: storefront.city,
        state: storefront.state,
        supplierType: storefront.supplierType,
        verificationBadge:
          storefront.proventaVerificationStatus === 'VERIFIED'
            ? 'PREMIUM_VERIFIED'
            : 'GST_VERIFIED',
        isGstVerified: storefront.gstVerificationStatus === 'VERIFIED',
        categories: storefront.operatingCategories,
        brands: storefront.brandsOffered,
        monthlyCapacity: storefront.monthlySupplyCapacity,
        warehousesCount: storefront.warehouses.length,
        serviceableDistrictsCount: storefront.serviceableDistricts.length,
        panIndiaDelivery: storefront.panIndiaDelivery,
        rating: storefront.performance.rating,
        reviewCount: storefront.performance.reviewCount,
        sampleThresholdMet: storefront.performance.sampleThresholdMet,
        matchedProductsCount: storefront.products.length,
        topProducts: storefront.products.slice(0, 3).map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          brand: p.brand,
          grade: p.grade,
          unit: p.unit,
          indicativePrice: p.indicativePrice,
        })),
        isSaved: true,
      });
    }
  }

  return results;
}

// ============================================================
// 6. INVITE SUPPLIER TO RFQ DIRECTLY FROM DISCOVERY
// ============================================================

export async function inviteSupplierToRfq(
  rfqId: string,
  supplierBusinessId: string,
  buyerUserId: string
): Promise<{ success: boolean; matchRecord: SupplierRfqMatchResult | null }> {
  const rfq = getConstructionRfqById(rfqId);
  if (!rfq) throw new Error(`RFQ not found with ID ${rfqId}`);

  const storefront = await getPublicSupplierStorefront(supplierBusinessId);
  if (!storefront) throw new Error(`Supplier not found with ID ${supplierBusinessId}`);

  // Link to RFQ invitedSupplierIds
  if (!rfq.invitedSupplierIds.includes(supplierBusinessId)) {
    rfq.invitedSupplierIds.push(supplierBusinessId);
  }

  // Create match record with matchType MANUAL_INVITATION
  const reasons = [
    'Direct Buyer Invitation from Supplier Discovery Engine',
    `Verified Material Provider: ${storefront.supplierType}`,
    storefront.gstVerificationStatus === 'VERIFIED' ? 'GSTIN Verified' : 'Registered Business',
  ];

  try {
    await db.supplierRFQMatch.upsert({
      where: {
        rfqId_supplierBusinessId: {
          rfqId: rfq.id,
          supplierBusinessId,
        },
      },
      update: {
        matchType: 'MANUAL_INVITATION',
        matchingReasons: reasons as any,
      },
      create: {
        rfqId: rfq.id,
        supplierBusinessId,
        matchScore: 90,
        matchingReasons: reasons as any,
        matchedProductIds: [],
        matchType: 'MANUAL_INVITATION',
      },
    });
  } catch (e) {
    // Non-blocking
  }

  // Dispatch alert to supplier
  await procurementNotificationService.notifyRfqMatched(
    supplierBusinessId,
    rfq.title,
    rfq.id
  );

  return {
    success: true,
    matchRecord: {
      supplierBusinessId,
      supplierName: storefront.name,
      slug: storefront.slug,
      city: storefront.city,
      state: storefront.state,
      matchScore: 90,
      matchingReasons: reasons,
      matchedProducts: [],
      verificationBadge: storefront.proventaVerificationStatus,
      rating: storefront.performance.rating,
      panIndiaDelivery: storefront.panIndiaDelivery,
    },
  };
}
