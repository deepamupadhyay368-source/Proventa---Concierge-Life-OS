/**
 * PROVENTA — Construction Procurement Platform
 * Repository & Persistence Engine
 * Complete reactive and thread-safe data access for RFQs, Quotes, POs and Delivery Tracking
 */

import { generateId } from '@/lib/utils';
import type {
  ConstructionRfq,
  ConstructionRfqItem,
  ConstructionQuotation,
  ItemizedQuotationBreakdown,
  PurchaseOrder,
  ConstructionSupplierProfile,
  DeliveryTrackingStage,
  DispatchDetails,
  DeliveryReceiptConfirmation,
  DeliveryTimelineEvent,
  SiteDeliveryDetails,
} from './types';
import { DELIVERY_STAGES_SEQUENCE } from './types';

interface ProcurementDataStore {
  rfqs: Map<string, ConstructionRfq>;
  quotations: Map<string, ConstructionQuotation>;
  orders: Map<string, PurchaseOrder>;
  suppliers: Map<string, ConstructionSupplierProfile>;
  initialized: boolean;
}

const globalForProcurement = globalThis as unknown as {
  __proventaProcurementStore?: ProcurementDataStore;
};

function getStore(): ProcurementDataStore {
  if (!globalForProcurement.__proventaProcurementStore) {
    globalForProcurement.__proventaProcurementStore = {
      rfqs: new Map(),
      quotations: new Map(),
      orders: new Map(),
      suppliers: new Map(),
      initialized: false,
    };
  }

  const store = globalForProcurement.__proventaProcurementStore;
  if (!store.initialized) {
    seedProcurementData(store);
    store.initialized = true;
  }
  return store;
}

// ============================================================
// SEEDING AHMEDABAD CONSTRUCTION SUPPLIERS & INITIAL MISSIONS
// ============================================================

function seedProcurementData(store: ProcurementDataStore): void {
  const seedSuppliers: ConstructionSupplierProfile[] = [
    {
      id: 'supp-gujarat-steel-cement',
      businessName: 'Gujarat Building Materials Syndicate',
      slug: 'gujarat-building-materials-syndicate',
      gstin: '24AAACG1928K1Z5',
      contactPerson: 'Kiritbhai Patel',
      email: 'sales@gujaratbuildingmaterials.in',
      phone: '+91 98250 14829',
      address: 'Plot 42, GIDC Odhav Industrial Estate',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '382415',
      operatingZones: ['Odhav', 'Naroda', 'Nikol', 'Vastral', 'Ahmedabad East', 'Gandhinagar'],
      primaryCategories: ['building-materials'],
      brandsOffered: ['UltraTech', 'Ambuja', 'Tata Tiscon', 'Jindal Panther', 'JK Lakshmi'],
      verificationBadge: 'PREMIUM_VERIFIED',
      rating: 4.9,
      reviewCount: 142,
      completedDeliveries: 520,
      bankDetails: {
        accountNumber: '50200028192019',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank, Odhav Branch',
        upiId: 'gbmsyndicate@okhdfcbank',
      },
      isActive: true,
    },
    {
      id: 'supp-sabarmati-tmt-rmc',
      businessName: 'Sabarmati Steel & Concrete Solutions',
      slug: 'sabarmati-steel-concrete',
      gstin: '24BBECS7712M1Z2',
      contactPerson: 'Jayeshbhai Shah',
      email: 'orders@sabarmatisteel.com',
      phone: '+91 98795 33021',
      address: 'Survey 108, Sarkhej-Bavla Road, Changodar',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '382213',
      operatingZones: ['Changodar', 'Sanand', 'Bavla', 'SG Highway', 'Bopal', 'Prahlad Nagar'],
      primaryCategories: ['building-materials'],
      brandsOffered: ['Tata Tiscon', 'Kamdhenu Fe 550D', 'UltraTech RMC', 'Ambuja RMC'],
      verificationBadge: 'GST_VERIFIED',
      rating: 4.8,
      reviewCount: 96,
      completedDeliveries: 380,
      bankDetails: {
        accountNumber: '92102001928374',
        ifscCode: 'UTIB0000456',
        bankName: 'Axis Bank, Changodar',
      },
      isActive: true,
    },
    {
      id: 'supp-patel-electrical-cables',
      businessName: 'Patel Electrical & Power Systems',
      slug: 'patel-electrical-power-systems',
      gstin: '24AAGCP5519L1ZP',
      contactPerson: 'Mahesh Patel',
      email: 'procurement@patelelectricals.com',
      phone: '+91 98240 88219',
      address: 'Shop 14-16, Relief Road Electrical Market',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380001',
      operatingZones: ['Relief Road', 'Ashram Road', 'Navrangpura', 'Satellite', 'SG Highway', 'All Ahmedabad'],
      primaryCategories: ['electrical'],
      brandsOffered: ['Polycab', 'Havells', 'RR Kabel', 'Schneider Electric', 'Legrand', 'Philips'],
      verificationBadge: 'PREMIUM_VERIFIED',
      rating: 4.9,
      reviewCount: 118,
      completedDeliveries: 410,
      bankDetails: {
        accountNumber: '001205009182',
        ifscCode: 'ICIC0000012',
        bankName: 'ICICI Bank, Relief Road',
      },
      isActive: true,
    },
    {
      id: 'supp-astral-western-plumbing',
      businessName: 'Western Gujarat Plumbing & Sanitary Depo',
      slug: 'western-gujarat-plumbing',
      gstin: '24CCUPW9912K1Z8',
      contactPerson: 'Sanjay Vora',
      email: 'wholesale@westerngujaratpipes.in',
      phone: '+91 97243 11890',
      address: 'Near Sola Flyover, SG Highway',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380060',
      operatingZones: ['SG Highway', 'Sola', 'Gota', 'Science City', 'Thaltej', 'Bopal', 'Gandhinagar'],
      primaryCategories: ['plumbing'],
      brandsOffered: ['Astral', 'Ashirvad', 'Supreme', 'Sintex', 'Jaquar', 'Cera'],
      verificationBadge: 'PREMIUM_VERIFIED',
      rating: 4.85,
      reviewCount: 88,
      completedDeliveries: 340,
      bankDetails: {
        accountNumber: '312890192837',
        ifscCode: 'SBIN0005928',
        bankName: 'State Bank of India, Thaltej',
      },
      isActive: true,
    },
    {
      id: 'supp-royal-ceramics-marble',
      businessName: 'Royal Vitrified & Natural Stone Hub',
      slug: 'royal-vitrified-natural-stone',
      gstin: '24AAAFR8821N1ZM',
      contactPerson: 'Bhavik Prajapati',
      email: 'quotes@royalvitrified.com',
      phone: '+91 98980 44211',
      address: 'Morbi Ceramics Complex, Sanand Highway',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '382110',
      operatingZones: ['Sanand', 'Bopal', 'South Bopal', 'Shela', 'Satellite', 'Ambli', 'All Gujarat'],
      primaryCategories: ['tiles-flooring'],
      brandsOffered: ['Kajaria', 'Somany', 'Simpolo', 'Qutone', 'Natural Italian Marble', 'Black Galaxy Granite'],
      verificationBadge: 'PREMIUM_VERIFIED',
      rating: 4.95,
      reviewCount: 164,
      completedDeliveries: 610,
      bankDetails: {
        accountNumber: '201002918274',
        ifscCode: 'KKBK0002819',
        bankName: 'Kotak Mahindra Bank, Bopal',
      },
      isActive: true,
    },
    {
      id: 'supp-asian-coatings-chemicals',
      businessName: 'Gujarat Paints & Waterproofing Supply',
      slug: 'gujarat-paints-waterproofing',
      gstin: '24AAAGP4412B1ZX',
      contactPerson: 'Dharmesh Trivedi',
      email: 'sales@gujaratpaints.co.in',
      phone: '+91 98255 66710',
      address: 'Industrial Area Phase 2, Vatva',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '382445',
      operatingZones: ['Vatva', 'Maninagar', 'Narol', 'Isanpur', 'Ahmedabad City', 'Gandhinagar'],
      primaryCategories: ['finishing-materials'],
      brandsOffered: ['Asian Paints', 'Berger', 'Dr. Fixit', 'Pidilite Roff', 'Birla White Putty', 'Fosroc'],
      verificationBadge: 'GST_VERIFIED',
      rating: 4.75,
      reviewCount: 74,
      completedDeliveries: 290,
      bankDetails: {
        accountNumber: '028192837461',
        ifscCode: 'BARB0VATVAX',
        bankName: 'Bank of Baroda, Vatva',
      },
      isActive: true,
    },
    {
      id: 'supp-fenesta-aluminium-doors',
      businessName: 'AeroProfile Aluminium & UPVC Systems',
      slug: 'aeroprofile-aluminium-upvc',
      gstin: '24BBDPA3310J1ZQ',
      contactPerson: 'Rohan Mistry',
      email: 'projects@aeroprofile.in',
      phone: '+91 97129 55034',
      address: 'Sindhu Bhavan Road, Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380054',
      operatingZones: ['Bodakdev', 'Sindhu Bhavan', 'Ambli', 'Thaltej', 'Vastrapur', 'Ahmedabad West'],
      primaryCategories: ['doors-windows'],
      brandsOffered: ['Jindal Aluminium Sections', 'Domal Sliding Systems', 'Century Plywood', 'Godrej Hardware', 'Dorset'],
      verificationBadge: 'PREMIUM_VERIFIED',
      rating: 4.88,
      reviewCount: 92,
      completedDeliveries: 245,
      bankDetails: {
        accountNumber: '501003829102',
        ifscCode: 'HDFC0000048',
        bankName: 'HDFC Bank, Bodakdev',
      },
      isActive: true,
    },
  ];

  for (const s of seedSuppliers) {
    store.suppliers.set(s.id, s);
  }

  // Seed sample RFQ 1: TMT Steel & 53 Grade Cement for High-Rise Project in Science City, Ahmedabad
  const sampleRfq1: ConstructionRfq = {
    id: 'rfq-ahm-001',
    referenceCode: 'RFQ-74102',
    buyerId: 'user-buyer-sharma',
    buyerName: 'Sharma & Sons Infrastructure',
    buyerEmail: 'procurement@sharmainfra.in',
    buyerPhone: '+91 98251 90214',
    buyerRole: 'CONTRACTOR',
    title: '50 MT Fe 550D TMT Steel & 1,200 Bags 53 Grade OPC Cement',
    projectType: 'RESIDENTIAL',
    items: [
      {
        id: 'item-1-steel',
        categorySlug: 'building-materials',
        categoryName: 'Building Materials',
        subcategorySlug: 'tmt-steel',
        subcategoryName: 'TMT Steel & Rebars',
        materialName: 'TMT Rebars Fe 550D (12mm, 16mm, 20mm & 25mm mixed)',
        gradeOrSpec: 'Fe 550D Primary Producer Grade IS 1786',
        brandPreference: 'Tata Tiscon or Jindal Panther',
        quantity: 50,
        unit: 'Metric tonnes (MT)',
        itemNotes: 'Factory test certificates required with batch delivery',
      },
      {
        id: 'item-1-cement',
        categorySlug: 'building-materials',
        categoryName: 'Building Materials',
        subcategorySlug: 'cement',
        subcategoryName: 'Cement',
        materialName: '53 Grade Ordinary Portland Cement (OPC)',
        gradeOrSpec: 'IS 269:2015 fresh stock within 15 days of packing',
        brandPreference: 'UltraTech or Ambuja',
        quantity: 1200,
        unit: 'Bags',
        itemNotes: 'Standard 50kg moisture-proof HDPE laminated bags',
      },
    ],
    delivery: {
      siteName: 'Aura Sky Greens Residential Project Phase 2',
      addressLine: 'Near Science City Circle, Off S.P. Ring Road, Sola',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380060',
      siteContactPerson: 'Pravinbhai Site Engineer',
      siteContactPhone: '+91 98254 77120',
      siteAccessNotes: 'Wide double-road access suitable for 16-wheeler multi-axle trailers and heavy trucks',
      vehicleAccessibility: '10-Wheeler Truck',
    },
    requiredDeliveryDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    urgency: 'STANDARD',
    status: 'QUOTATIONS_RECEIVED',
    invitedSupplierIds: ['supp-gujarat-steel-cement', 'supp-sabarmati-tmt-rmc'],
    quotationIds: ['quo-74102-01', 'quo-74102-02'],
    boqAttachments: [
      {
        fileName: 'Aura_Sky_Greens_BOQ_Structural_Package_B.pdf',
        fileUrl: '/documents/boq/Aura_Sky_Greens_BOQ_Structural_Package_B.pdf',
        fileSizeMb: 2.4,
      },
    ],
    specialInstructions: 'Unloading team will be stationed at site. Staggered dispatch required: 25 MT steel + 600 bags cement on day 1, balance on day 3.',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  };

  store.rfqs.set(sampleRfq1.id, sampleRfq1);

  // Seed Quotation 1 for RFQ-74102 from Gujarat Building Materials Syndicate
  const sampleQuo1: ConstructionQuotation = {
    id: 'quo-74102-01',
    referenceCode: 'QUO-92014',
    rfqId: sampleRfq1.id,
    rfqReferenceCode: sampleRfq1.referenceCode,
    supplierId: 'supp-gujarat-steel-cement',
    supplierName: 'Gujarat Building Materials Syndicate',
    supplierGstin: '24AAACG1928K1Z5',
    supplierCity: 'Ahmedabad',
    supplierVerificationBadge: 'PREMIUM_VERIFIED',
    supplierRating: 4.9,
    totalCompletedDeliveries: 520,
    items: [
      {
        itemId: 'item-1-steel',
        materialName: 'TMT Rebars Fe 550D (12-25mm)',
        quantity: 50,
        unit: 'Metric tonnes (MT)',
        unitPrice: 53500,
        itemSubtotal: 2675000,
        gstRatePercent: 18,
        gstAmount: 481500,
        lineTotal: 3156500,
        brandSupplied: 'Tata Tiscon Fe 550D',
        technicalNotes: 'Direct dispatch from Tata authorized stockyard with test certificates',
      },
      {
        itemId: 'item-1-cement',
        materialName: '53 Grade OPC Cement (50kg)',
        quantity: 1200,
        unit: 'Bags',
        unitPrice: 340,
        itemSubtotal: 408000,
        gstRatePercent: 28,
        gstAmount: 114240,
        lineTotal: 522240,
        brandSupplied: 'UltraTech 53 Grade OPC',
        technicalNotes: 'Fresh batch manufactured within last 7 days',
      },
    ],
    subtotal: 3083000,
    totalGst: 595740,
    deliveryCharges: 18000,
    discountAmount: 25000,
    grandTotal: 3671740,
    promisedDeliveryDate: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
    validityDays: 5,
    validUntil: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    paymentTerms: '20% Token Advance on PO, 80% RTGS against Site Weightbridge Slip & Unloading',
    status: 'SUBMITTED',
    revisionNumber: 1,
    supplierNotes: 'Includes dedicated GPS tracked 16-wheeler transport. Free transit insurance included.',
    attachments: ['/documents/quotes/GBMS_TataTiscon_TestCert.pdf'],
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  };

  // Seed Quotation 2 for RFQ-74102 from Sabarmati Steel & Concrete
  const sampleQuo2: ConstructionQuotation = {
    id: 'quo-74102-02',
    referenceCode: 'QUO-92018',
    rfqId: sampleRfq1.id,
    rfqReferenceCode: sampleRfq1.referenceCode,
    supplierId: 'supp-sabarmati-tmt-rmc',
    supplierName: 'Sabarmati Steel & Concrete Solutions',
    supplierGstin: '24BBECS7712M1Z2',
    supplierCity: 'Ahmedabad',
    supplierVerificationBadge: 'GST_VERIFIED',
    supplierRating: 4.8,
    totalCompletedDeliveries: 380,
    items: [
      {
        itemId: 'item-1-steel',
        materialName: 'TMT Rebars Fe 550D (12-25mm)',
        quantity: 50,
        unit: 'Metric tonnes (MT)',
        unitPrice: 52800,
        itemSubtotal: 2640000,
        gstRatePercent: 18,
        gstAmount: 475200,
        lineTotal: 3115200,
        brandSupplied: 'Jindal Panther Fe 550D',
        technicalNotes: 'Jindal Panther mill test cert provided upon dispatch',
      },
      {
        itemId: 'item-1-cement',
        materialName: '53 Grade OPC Cement (50kg)',
        quantity: 1200,
        unit: 'Bags',
        unitPrice: 335,
        itemSubtotal: 402000,
        gstRatePercent: 28,
        gstAmount: 112560,
        lineTotal: 514560,
        brandSupplied: 'Ambuja OPC 53 Grade',
        technicalNotes: 'Direct rake supply from Ambuja siding',
      },
    ],
    subtotal: 3042000,
    totalGst: 587760,
    deliveryCharges: 22000,
    discountAmount: 15000,
    grandTotal: 3636760,
    promisedDeliveryDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    validityDays: 4,
    validUntil: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    paymentTerms: '30% Advance, 70% within 48 hours of site delivery receipt',
    status: 'SUBMITTED',
    revisionNumber: 1,
    supplierNotes: 'Changodar stock ready to load. Can deliver first 25 MT within 24 hours of PO.',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  };

  store.quotations.set(sampleQuo1.id, sampleQuo1);
  store.quotations.set(sampleQuo2.id, sampleQuo2);

  // Seed Sample PO 1 (In Transit delivery for Plumbing Supplies in Bopal)
  const samplePo: PurchaseOrder = {
    id: 'po-ahm-101',
    referenceCode: 'PO-58219',
    rfqId: 'rfq-sample-plumbing',
    rfqReferenceCode: 'RFQ-63910',
    quotationId: 'quo-sample-plumbing',
    quotationReferenceCode: 'QUO-71042',
    buyerId: 'user-buyer-sharma',
    buyerName: 'Sharma & Sons Infrastructure',
    buyerPhone: '+91 98251 90214',
    supplierId: 'supp-astral-western-plumbing',
    supplierName: 'Western Gujarat Plumbing & Sanitary Depo',
    supplierGstin: '24CCUPW9912K1Z8',
    items: [
      {
        itemId: 'item-cpvc-pipes',
        materialName: 'Astral CPVC Pro Pipes Class SDR 11 (1-inch & 1.5-inch)',
        quantity: 450,
        unit: 'Pieces (Nos)',
        unitPrice: 420,
        itemSubtotal: 189000,
        gstRatePercent: 18,
        gstAmount: 34020,
        lineTotal: 223020,
        brandSupplied: 'Astral CPVC Pro',
        technicalNotes: 'Heavy-duty SDR 11 hot/cold water certified',
      },
      {
        itemId: 'item-water-tanks',
        materialName: 'Sintex Multi-layer Overhead Anti-bacterial Tanks (1000 Litres)',
        quantity: 8,
        unit: 'Pieces (Nos)',
        unitPrice: 6500,
        itemSubtotal: 52000,
        gstRatePercent: 18,
        gstAmount: 9360,
        lineTotal: 61360,
        brandSupplied: 'Sintex Pure 4-Layer',
        technicalNotes: 'Includes threaded lids and 1.5-inch brass nipples',
      },
    ],
    subtotal: 241000,
    totalGst: 43380,
    deliveryCharges: 3500,
    discountAmount: 5000,
    grandTotal: 282880,
    delivery: {
      siteName: 'Vrindavan Enclave Commercial Tower',
      addressLine: 'South Bopal Ring Road Junction',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380058',
      siteContactPerson: 'Dhaval Makwana Site Supervisor',
      siteContactPhone: '+91 97241 88301',
      vehicleAccessibility: 'Tata Ace / Small Truck',
    },
    deliveryStatus: 'IN_TRANSIT',
    dispatchDetails: {
      vehicleType: 'Tata Ace Gold Extra Long',
      vehicleNumber: 'GJ-01-ET-8492',
      driverName: 'Rameshbhai Bharwad',
      driverPhone: '+91 99092 48190',
      transporterName: 'Gujarat Express Logistics',
      eWayBillNumber: '241829104829',
      dispatchDateTime: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      estimatedDeliveryTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      trackingNotes: 'Loaded from Sola stockyard at 09:30 AM. Crossed Iscon Cross Roads, currently heading towards South Bopal.',
    },
    timeline: [
      {
        stage: 'ORDER_CONFIRMED',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        title: 'Purchase Order Issued & Confirmed',
        description: 'Buyer accepted quotation QUO-71042. Purchase Order PO-58219 generated automatically.',
        updatedBy: 'Sharma & Sons Infrastructure',
        actorRole: 'BUYER',
      },
      {
        stage: 'PROCESSING',
        timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        title: 'Order Processing & Warehouse Allocation',
        description: 'Materials allocated at Sola depot. Batch verification and quality inspection passed.',
        updatedBy: 'Western Gujarat Plumbing & Sanitary Depo',
        actorRole: 'SUPPLIER',
      },
      {
        stage: 'READY_FOR_DISPATCH',
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        title: 'Packed & Loaded on Vehicle',
        description: 'Loaded on Tata Ace GJ-01-ET-8492. E-Way Bill 241829104829 generated.',
        updatedBy: 'Western Gujarat Plumbing & Sanitary Depo',
        actorRole: 'SUPPLIER',
      },
      {
        stage: 'DISPATCHED',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        title: 'Dispatched from Sola Depot',
        description: 'Vehicle departed warehouse. Driver Rameshbhai Bharwad (+91 99092 48190) assigned.',
        updatedBy: 'Gujarat Express Logistics',
        actorRole: 'TRANSPORTER',
      },
      {
        stage: 'IN_TRANSIT',
        timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        title: 'In Transit to South Bopal Site',
        description: 'Estimated delivery arrival: 12:45 PM today. Site supervisor alerted via SMS/WhatsApp.',
        updatedBy: 'Gujarat Express Logistics',
        actorRole: 'TRANSPORTER',
      },
    ],
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  };

  store.orders.set(samplePo.id, samplePo);
}

// ============================================================
// RFQ OPERATIONS
// ============================================================

export function createConstructionRfq(params: {
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  buyerRole?: 'CONTRACTOR' | 'BUILDER' | 'INDIVIDUAL_BUYER' | 'CONSTRUCTION_COMPANY';
  title: string;
  projectType: 'RESIDENTIAL' | 'COMMERCIAL' | 'INFRASTRUCTURE' | 'INDUSTRIAL' | 'RENOVATION';
  items: Omit<ConstructionRfqItem, 'id'>[];
  delivery: SiteDeliveryDetails;
  requiredDeliveryDate: string;
  urgency?: 'STANDARD' | 'URGENT' | 'FLEXIBLE';
  boqAttachments?: Array<{ fileName: string; fileUrl: string; fileSizeMb?: number }>;
  specialInstructions?: string;
}): ConstructionRfq {
  const store = getStore();
  const id = `rfq_${generateId()}`;
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const referenceCode = `RFQ-${randomNum}`;

  const preparedItems: ConstructionRfqItem[] = params.items.map((it, idx) => ({
    ...it,
    id: `item_${id}_${idx + 1}`,
  }));

  // Auto-find matching suppliers based on category
  const itemCategorySlugs = new Set(params.items.map((i) => i.categorySlug));
  const matchedSuppliers = Array.from(store.suppliers.values()).filter((s) =>
    s.isActive && s.primaryCategories.some((c) => itemCategorySlugs.has(c))
  );

  const rfq: ConstructionRfq = {
    id,
    referenceCode,
    buyerId: params.buyerId,
    buyerName: params.buyerName,
    buyerEmail: params.buyerEmail,
    buyerPhone: params.buyerPhone,
    buyerRole: params.buyerRole || 'CONTRACTOR',
    title: params.title,
    projectType: params.projectType,
    items: preparedItems,
    delivery: params.delivery,
    requiredDeliveryDate: params.requiredDeliveryDate,
    urgency: params.urgency || 'STANDARD',
    status: matchedSuppliers.length > 0 ? 'SUPPLIERS_INVITED' : 'OPEN',
    invitedSupplierIds: matchedSuppliers.map((s) => s.id),
    quotationIds: [],
    boqAttachments: params.boqAttachments || [],
    specialInstructions: params.specialInstructions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.rfqs.set(id, rfq);
  return rfq;
}

export function getConstructionRfqById(idOrRef: string): ConstructionRfq | null {
  const store = getStore();
  const rfq = store.rfqs.get(idOrRef);
  if (rfq) return rfq;

  for (const item of store.rfqs.values()) {
    if (item.referenceCode === idOrRef || item.id === idOrRef) {
      return item;
    }
  }
  return null;
}

export function listBuyerRfqs(buyerId: string): ConstructionRfq[] {
  const store = getStore();
  return Array.from(store.rfqs.values())
    .filter((r) => r.buyerId === buyerId || buyerId === 'all')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function listSupplierMatchingRfqs(supplierId: string): ConstructionRfq[] {
  const store = getStore();
  const supplier = store.suppliers.get(supplierId);
  if (!supplier) {
    return Array.from(store.rfqs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return Array.from(store.rfqs.values())
    .filter((r) =>
      r.invitedSupplierIds.includes(supplierId) ||
      r.items.some((it) => supplier.primaryCategories.includes(it.categorySlug))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ============================================================
// QUOTATION OPERATIONS
// ============================================================

export function submitConstructionQuotation(params: {
  rfqId: string;
  supplierId: string;
  items: Array<{
    itemId: string;
    unitPrice: number;
    gstRatePercent: number;
    brandSupplied: string;
    technicalNotes?: string;
  }>;
  deliveryCharges?: number;
  discountAmount?: number;
  promisedDeliveryDate: string;
  validityDays?: number;
  paymentTerms: string;
  supplierNotes?: string;
  attachments?: string[];
}): ConstructionQuotation {
  const store = getStore();
  const rfq = store.rfqs.get(params.rfqId);
  if (!rfq) {
    throw new Error(`RFQ not found with ID ${params.rfqId}`);
  }

  const supplier = store.suppliers.get(params.supplierId);
  if (!supplier) {
    throw new Error(`Supplier not found with ID ${params.supplierId}`);
  }

  const id = `quo_${generateId()}`;
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const referenceCode = `QUO-${randomNum}`;

  let subtotal = 0;
  let totalGst = 0;

  const itemizedBreakdown: ItemizedQuotationBreakdown[] = params.items.map((inputItem) => {
    const originalRfqItem = rfq.items.find((i) => i.id === inputItem.itemId);
    const materialName = originalRfqItem?.materialName || 'Construction Material';
    const quantity = originalRfqItem?.quantity || 1;
    const unit = originalRfqItem?.unit || 'Pieces (Nos)';

    const itemSubtotal = quantity * inputItem.unitPrice;
    const gstAmount = Math.round((itemSubtotal * inputItem.gstRatePercent) / 100);
    const lineTotal = itemSubtotal + gstAmount;

    subtotal += itemSubtotal;
    totalGst += gstAmount;

    return {
      itemId: inputItem.itemId,
      materialName,
      quantity,
      unit,
      unitPrice: inputItem.unitPrice,
      itemSubtotal,
      gstRatePercent: inputItem.gstRatePercent,
      gstAmount,
      lineTotal,
      brandSupplied: inputItem.brandSupplied,
      technicalNotes: inputItem.technicalNotes,
    };
  });

  const deliveryCharges = params.deliveryCharges || 0;
  const discountAmount = params.discountAmount || 0;
  const grandTotal = subtotal + totalGst + deliveryCharges - discountAmount;
  const validityDays = params.validityDays || 7;
  const validUntil = new Date(Date.now() + validityDays * 24 * 3600 * 1000).toISOString();

  const quotation: ConstructionQuotation = {
    id,
    referenceCode,
    rfqId: rfq.id,
    rfqReferenceCode: rfq.referenceCode,
    supplierId: supplier.id,
    supplierName: supplier.businessName,
    supplierGstin: supplier.gstin,
    supplierCity: supplier.city,
    supplierVerificationBadge: supplier.verificationBadge,
    supplierRating: supplier.rating,
    totalCompletedDeliveries: supplier.completedDeliveries,
    items: itemizedBreakdown,
    subtotal,
    totalGst,
    deliveryCharges,
    discountAmount,
    grandTotal,
    promisedDeliveryDate: params.promisedDeliveryDate,
    validityDays,
    validUntil,
    paymentTerms: params.paymentTerms,
    status: 'SUBMITTED',
    revisionNumber: 1,
    supplierNotes: params.supplierNotes,
    attachments: params.attachments,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.quotations.set(id, quotation);

  // Link quotation to RFQ
  if (!rfq.quotationIds.includes(id)) {
    rfq.quotationIds.push(id);
  }
  if (rfq.status === 'OPEN' || rfq.status === 'SUPPLIERS_INVITED') {
    rfq.status = 'QUOTATIONS_RECEIVED';
  }
  rfq.updatedAt = new Date().toISOString();

  return quotation;
}

export function reviseConstructionQuotation(params: {
  quotationId: string;
  items: Array<{
    itemId: string;
    unitPrice: number;
    gstRatePercent: number;
    brandSupplied: string;
    technicalNotes?: string;
  }>;
  deliveryCharges?: number;
  discountAmount?: number;
  promisedDeliveryDate?: string;
  validityDays?: number;
  paymentTerms?: string;
  supplierNotes?: string;
}): ConstructionQuotation {
  const store = getStore();
  const existing = store.quotations.get(params.quotationId);
  if (!existing) {
    throw new Error(`Quotation not found with ID ${params.quotationId}`);
  }

  if (existing.status === 'ACCEPTED') {
    throw new Error('Cannot revise a quotation that has already been accepted and converted into a Purchase Order.');
  }

  let subtotal = 0;
  let totalGst = 0;

  const updatedBreakdown = params.items.map((inputItem) => {
    const prevItem = existing.items.find((i) => i.itemId === inputItem.itemId);
    const quantity = prevItem?.quantity || 1;
    const materialName = prevItem?.materialName || 'Material';
    const unit = prevItem?.unit || 'Pieces (Nos)';

    const itemSubtotal = quantity * inputItem.unitPrice;
    const gstAmount = Math.round((itemSubtotal * inputItem.gstRatePercent) / 100);
    const lineTotal = itemSubtotal + gstAmount;

    subtotal += itemSubtotal;
    totalGst += gstAmount;

    return {
      itemId: inputItem.itemId,
      materialName,
      quantity,
      unit,
      unitPrice: inputItem.unitPrice,
      itemSubtotal,
      gstRatePercent: inputItem.gstRatePercent,
      gstAmount,
      lineTotal,
      brandSupplied: inputItem.brandSupplied,
      technicalNotes: inputItem.technicalNotes,
    };
  });

  const deliveryCharges = params.deliveryCharges !== undefined ? params.deliveryCharges : existing.deliveryCharges;
  const discountAmount = params.discountAmount !== undefined ? params.discountAmount : existing.discountAmount;
  const grandTotal = subtotal + totalGst + deliveryCharges - discountAmount;

  existing.items = updatedBreakdown;
  existing.subtotal = subtotal;
  existing.totalGst = totalGst;
  existing.deliveryCharges = deliveryCharges;
  existing.discountAmount = discountAmount;
  existing.grandTotal = grandTotal;
  existing.status = 'REVISED';
  existing.revisionNumber += 1;
  if (params.promisedDeliveryDate) existing.promisedDeliveryDate = params.promisedDeliveryDate;
  if (params.paymentTerms) existing.paymentTerms = params.paymentTerms;
  if (params.supplierNotes) existing.supplierNotes = params.supplierNotes;
  existing.updatedAt = new Date().toISOString();

  return existing;
}

export function getQuotationById(idOrRef: string): ConstructionQuotation | null {
  const store = getStore();
  const quo = store.quotations.get(idOrRef);
  if (quo) return quo;

  for (const item of store.quotations.values()) {
    if (item.referenceCode === idOrRef || item.id === idOrRef) {
      return item;
    }
  }
  return null;
}

export function getQuotationsForRfq(rfqId: string): ConstructionQuotation[] {
  const store = getStore();
  return Array.from(store.quotations.values())
    .filter((q) => q.rfqId === rfqId)
    .sort((a, b) => a.grandTotal - b.grandTotal);
}

// ============================================================
// STEP 4: QUOTATION COMPARISON MATRIX & SELECTION
// ============================================================

export interface QuotationComparisonMatrix {
  rfq: ConstructionRfq;
  quotations: ConstructionQuotation[];
  lowestTotalPrice: number;
  fastestDeliveryDate: string;
  highestRatedSupplierId: string;
}

export function compareQuotationsForRfq(rfqId: string): QuotationComparisonMatrix | null {
  const store = getStore();
  const rfq = store.rfqs.get(rfqId);
  if (!rfq) return null;

  const quotations = getQuotationsForRfq(rfqId);
  if (quotations.length === 0) {
    return {
      rfq,
      quotations: [],
      lowestTotalPrice: 0,
      fastestDeliveryDate: '',
      highestRatedSupplierId: '',
    };
  }

  let lowestPrice = quotations[0].grandTotal;
  let fastestDate = quotations[0].promisedDeliveryDate;
  let highestRating = quotations[0].supplierRating;
  let highestRatedSupplierId = quotations[0].supplierId;

  for (const q of quotations) {
    if (q.grandTotal < lowestPrice) lowestPrice = q.grandTotal;
    if (q.promisedDeliveryDate < fastestDate) fastestDate = q.promisedDeliveryDate;
    if (q.supplierRating > highestRating) {
      highestRating = q.supplierRating;
      highestRatedSupplierId = q.supplierId;
    }
  }

  return {
    rfq,
    quotations,
    lowestTotalPrice: lowestPrice,
    fastestDeliveryDate: fastestDate,
    highestRatedSupplierId,
  };
}

// ============================================================
// STEP 5: PURCHASE ORDER CREATION & DISPATCH COORDINATION
// ============================================================

export function selectQuotationAndCreatePo(params: {
  rfqId: string;
  quotationId: string;
  buyerConfirmed: boolean;
}): PurchaseOrder {
  if (!params.buyerConfirmed) {
    throw new Error('Explicit buyer confirmation is mandatory to create a Purchase Order.');
  }

  const store = getStore();
  const rfq = store.rfqs.get(params.rfqId);
  if (!rfq) throw new Error(`RFQ not found with ID ${params.rfqId}`);

  const quotation = store.quotations.get(params.quotationId);
  if (!quotation) throw new Error(`Quotation not found with ID ${params.quotationId}`);

  // Mark quotation accepted, others rejected
  quotation.status = 'ACCEPTED';
  quotation.updatedAt = new Date().toISOString();

  for (const otherId of rfq.quotationIds) {
    if (otherId !== quotation.id) {
      const other = store.quotations.get(otherId);
      if (other && other.status !== 'REJECTED') {
        other.status = 'REJECTED';
        other.updatedAt = new Date().toISOString();
      }
    }
  }

  const id = `po_${generateId()}`;
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const referenceCode = `PO-${randomNum}`;

  const initialTimeline: DeliveryTimelineEvent[] = [
    {
      stage: 'ORDER_CONFIRMED',
      timestamp: new Date().toISOString(),
      title: 'Purchase Order Issued & Confirmed',
      description: `Buyer ${rfq.buyerName} confirmed selection of quotation ${quotation.referenceCode}. PO created.`,
      updatedBy: rfq.buyerName,
      actorRole: 'BUYER',
    },
  ];

  const po: PurchaseOrder = {
    id,
    referenceCode,
    rfqId: rfq.id,
    rfqReferenceCode: rfq.referenceCode,
    quotationId: quotation.id,
    quotationReferenceCode: quotation.referenceCode,
    buyerId: rfq.buyerId,
    buyerName: rfq.buyerName,
    buyerPhone: rfq.buyerPhone,
    supplierId: quotation.supplierId,
    supplierName: quotation.supplierName,
    supplierGstin: quotation.supplierGstin,
    items: quotation.items,
    subtotal: quotation.subtotal,
    totalGst: quotation.totalGst,
    deliveryCharges: quotation.deliveryCharges,
    discountAmount: quotation.discountAmount,
    grandTotal: quotation.grandTotal,
    delivery: rfq.delivery,
    deliveryStatus: 'ORDER_CONFIRMED',
    timeline: initialTimeline,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.orders.set(id, po);

  rfq.status = 'PO_ISSUED';
  rfq.selectedQuotationId = quotation.id;
  rfq.purchaseOrderId = po.id;
  rfq.updatedAt = new Date().toISOString();

  return po;
}

export function getPurchaseOrderById(idOrRef: string): PurchaseOrder | null {
  const store = getStore();
  const po = store.orders.get(idOrRef);
  if (po) return po;

  for (const item of store.orders.values()) {
    if (item.referenceCode === idOrRef || item.id === idOrRef) {
      return item;
    }
  }
  return null;
}

export function listBuyerOrders(buyerId: string): PurchaseOrder[] {
  const store = getStore();
  return Array.from(store.orders.values())
    .filter((o) => o.buyerId === buyerId || buyerId === 'all')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function listSupplierOrders(supplierId: string): PurchaseOrder[] {
  const store = getStore();
  return Array.from(store.orders.values())
    .filter((o) => o.supplierId === supplierId || supplierId === 'all')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updateOrderDispatchDetails(params: {
  orderId: string;
  dispatch: DispatchDetails;
  advanceToStatus?: DeliveryTrackingStage;
  updatedBy: string;
  actorRole: 'SUPPLIER' | 'TRANSPORTER' | 'ADMIN';
}): PurchaseOrder {
  const store = getStore();
  const order = store.orders.get(params.orderId);
  if (!order) throw new Error(`Purchase Order not found with ID ${params.orderId}`);

  order.dispatchDetails = params.dispatch;
  if (params.advanceToStatus) {
    order.deliveryStatus = params.advanceToStatus;
  } else if (order.deliveryStatus === 'ORDER_CONFIRMED' || order.deliveryStatus === 'PROCESSING') {
    order.deliveryStatus = 'READY_FOR_DISPATCH';
  }

  order.timeline.push({
    stage: order.deliveryStatus,
    timestamp: new Date().toISOString(),
    title: `Dispatch Update: Vehicle ${params.dispatch.vehicleNumber}`,
    description: `Vehicle: ${params.dispatch.vehicleType} (${params.dispatch.vehicleNumber}). Driver: ${params.dispatch.driverName} (${params.dispatch.driverPhone}). Transporter: ${params.dispatch.transporterName}. ${params.dispatch.trackingNotes || ''}`,
    updatedBy: params.updatedBy,
    actorRole: params.actorRole,
  });

  order.updatedAt = new Date().toISOString();
  return order;
}

export function advanceOrderDeliveryStage(params: {
  orderId: string;
  stage: DeliveryTrackingStage;
  note: string;
  updatedBy: string;
  actorRole: 'SUPPLIER' | 'TRANSPORTER' | 'BUYER' | 'ADMIN';
}): PurchaseOrder {
  const store = getStore();
  const order = store.orders.get(params.orderId);
  if (!order) throw new Error(`Purchase Order not found with ID ${params.orderId}`);

  order.deliveryStatus = params.stage;
  order.timeline.push({
    stage: params.stage,
    timestamp: new Date().toISOString(),
    title: `Delivery Stage: ${params.stage.replace(/_/g, ' ')}`,
    description: params.note,
    updatedBy: params.updatedBy,
    actorRole: params.actorRole,
  });

  order.updatedAt = new Date().toISOString();
  return order;
}

// ============================================================
// STEP 6: BUYER RECEIPT CONFIRMATION & ORDER COMPLETION
// ============================================================

export function confirmOrderDeliveryReceipt(params: {
  orderId: string;
  confirmation: Omit<DeliveryReceiptConfirmation, 'completedAt'>;
  buyerName: string;
}): PurchaseOrder {
  const store = getStore();
  const order = store.orders.get(params.orderId);
  if (!order) throw new Error(`Purchase Order not found with ID ${params.orderId}`);

  const completedAt = new Date().toISOString();
  const finalConfirmation: DeliveryReceiptConfirmation = {
    ...params.confirmation,
    completedAt,
  };

  order.receiptConfirmation = finalConfirmation;
  order.deliveryStatus = 'COMPLETED';

  order.timeline.push({
    stage: 'DELIVERED',
    timestamp: params.confirmation.receivedAt || completedAt,
    title: 'Site Delivery Confirmed by Buyer',
    description: `Received by ${params.confirmation.receivedBy} (${params.confirmation.receiverPhone}). Received quantity: ${params.confirmation.confirmedReceivedQuantity}. Shortage/Damage reported: ${params.confirmation.hasDamageOrShortage ? 'YES - ' + (params.confirmation.shortageDamageNotes || '') : 'None (Full order intact)'}.`,
    updatedBy: params.buyerName,
    actorRole: 'BUYER',
  });

  order.timeline.push({
    stage: 'COMPLETED',
    timestamp: completedAt,
    title: 'Order Successfully Completed & Closed',
    description: `Supplier rated ${params.confirmation.supplierRating} / 5 stars. Feedback: "${params.confirmation.buyerFeedback}". Complete audit trail recorded.`,
    updatedBy: params.buyerName,
    actorRole: 'BUYER',
  });

  order.updatedAt = completedAt;

  // Also close parent RFQ
  const rfq = store.rfqs.get(order.rfqId);
  if (rfq) {
    rfq.status = 'FULFILLED';
    rfq.updatedAt = completedAt;
  }

  // Update supplier rating and completed order stats
  const supplier = store.suppliers.get(order.supplierId);
  if (supplier) {
    const totalDeliveries = supplier.completedDeliveries + 1;
    const newRating = Number(
      ((supplier.rating * supplier.reviewCount + params.confirmation.supplierRating) /
        (supplier.reviewCount + 1)).toFixed(2)
    );
    supplier.completedDeliveries = totalDeliveries;
    supplier.rating = newRating;
    supplier.reviewCount += 1;
  }

  return order;
}

// ============================================================
// SUPPLIERS DIRECTORY & ONBOARDING
// ============================================================

export function listSuppliers(options?: {
  categorySlug?: string;
  city?: string;
  search?: string;
}): ConstructionSupplierProfile[] {
  const store = getStore();
  let list = Array.from(store.suppliers.values()).filter((s) => s.isActive);

  if (options?.categorySlug) {
    list = list.filter((s) => s.primaryCategories.includes(options.categorySlug!));
  }
  if (options?.city) {
    list = list.filter((s) => s.city.toLowerCase() === options.city!.toLowerCase());
  }
  if (options?.search) {
    const term = options.search.toLowerCase();
    list = list.filter(
      (s) =>
        s.businessName.toLowerCase().includes(term) ||
        s.brandsOffered.some((b) => b.toLowerCase().includes(term)) ||
        s.operatingZones.some((z) => z.toLowerCase().includes(term))
    );
  }

  return list;
}

export function registerSupplier(params: Omit<ConstructionSupplierProfile, 'id' | 'rating' | 'reviewCount' | 'completedDeliveries' | 'isActive'>): ConstructionSupplierProfile {
  const store = getStore();
  const id = `supp_${generateId()}`;

  const supplier: ConstructionSupplierProfile = {
    ...params,
    id,
    rating: 5.0,
    reviewCount: 0,
    completedDeliveries: 0,
    isActive: true,
  };

  store.suppliers.set(id, supplier);
  return supplier;
}

// ============================================================
// GLOBAL PROCUREMENT METRICS FOR ADMIN & DASHBOARDS
// ============================================================

export function getProcurementMetrics() {
  const store = getStore();
  const rfqs = Array.from(store.rfqs.values());
  const quotations = Array.from(store.quotations.values());
  const orders = Array.from(store.orders.values());
  const suppliers = Array.from(store.suppliers.values());

  const totalProcurementGmv = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const activeDeliveries = orders.filter((o) =>
    ['PROCESSING', 'READY_FOR_DISPATCH', 'DISPATCHED', 'IN_TRANSIT'].includes(o.deliveryStatus)
  ).length;
  const completedOrders = orders.filter((o) => o.deliveryStatus === 'COMPLETED').length;

  return {
    totalRfqs: rfqs.length,
    activeRfqs: rfqs.filter((r) => ['OPEN', 'SUPPLIERS_INVITED', 'QUOTATIONS_RECEIVED'].includes(r.status)).length,
    totalQuotations: quotations.length,
    totalOrders: orders.length,
    activeDeliveries,
    completedOrders,
    totalSuppliers: suppliers.length,
    verifiedSuppliers: suppliers.filter((s) => s.verificationBadge === 'PREMIUM_VERIFIED' || s.verificationBadge === 'GST_VERIFIED').length,
    totalProcurementGmv,
  };
}
