/**
 * PROVENTA — Industrial Procurement Platform
 * Core Domain Types & DTOs
 * Tagline: Require. Compare. Select. Deliver.
 */

import { CONSTRUCTION_UNITS, type ConstructionUnit } from '@/lib/brand';

export { CONSTRUCTION_UNITS };
export type { ConstructionUnit };

export type ConstructionRfqStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'SUPPLIERS_INVITED'
  | 'QUOTATIONS_RECEIVED'
  | 'PO_ISSUED'
  | 'FULFILLED'
  | 'CANCELLED';

export type QuotationStatus =
  | 'SUBMITTED'
  | 'REVISED'
  | 'SHORTLISTED'
  | 'ACCEPTED'
  | 'REJECTED';

export type DeliveryTrackingStage =
  | 'ORDER_CONFIRMED'
  | 'PROCESSING'
  | 'READY_FOR_DISPATCH'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED';

export const DELIVERY_STAGES_SEQUENCE: DeliveryTrackingStage[] = [
  'ORDER_CONFIRMED',
  'PROCESSING',
  'READY_FOR_DISPATCH',
  'DISPATCHED',
  'IN_TRANSIT',
  'DELIVERED',
  'COMPLETED',
];

export interface ConstructionRfqItem {
  id: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug?: string;
  subcategoryName?: string;
  materialName: string;
  gradeOrSpec?: string;
  dimensions?: string;
  thickness?: string;
  technicalSpecifications?: string;
  qualityStandards?: string;
  brandPreference?: string;
  quantity: number;
  unit: ConstructionUnit;
  itemNotes?: string;
}

export interface SiteDeliveryDetails {
  siteName: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  siteContactPerson: string;
  siteContactPhone: string;
  siteAccessNotes?: string;
  vehicleAccessibility: '10-Wheeler Truck' | 'Tata Ace / Small Truck' | 'Transit Mixer (RMC)' | 'Trailer Accessible' | 'Standard Access';
  deliverySchedule?: string;
  unloadingRequirements?: string;
}

export interface ConstructionRfq {
  id: string;
  referenceCode: string; // e.g. RFQ-98214
  buyerId: string;
  buyerBusinessId?: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  buyerRole: 'CONTRACTOR' | 'BUILDER' | 'INDIVIDUAL_BUYER' | 'CONSTRUCTION_COMPANY' | 'REAL_ESTATE_DEVELOPER' | 'CIVIL_CONTRACTOR' | 'INFRASTRUCTURE_CONTRACTOR' | 'INDUSTRIAL_PROJECT_COMPANY';
  title: string;
  projectType: 'RESIDENTIAL' | 'COMMERCIAL' | 'INFRASTRUCTURE' | 'INDUSTRIAL' | 'RENOVATION';
  items: ConstructionRfqItem[];
  delivery: SiteDeliveryDetails;
  requiredDeliveryDate: string; // ISO date string
  urgency: 'STANDARD' | 'URGENT' | 'FLEXIBLE';
  status: ConstructionRfqStatus;
  invitedSupplierIds: string[];
  quotationIds: string[];
  selectedQuotationId?: string;
  purchaseOrderId?: string;
  boqAttachments: Array<{
    fileName: string;
    fileUrl: string;
    fileSizeMb?: number;
  }>;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemizedQuotationBreakdown {
  itemId: string;
  materialName: string;
  quantity: number;
  unit: ConstructionUnit;
  unitPrice: number; // In INR before GST
  itemSubtotal: number; // quantity * unitPrice
  gstRatePercent: number; // e.g. 18 or 28
  gstAmount: number;
  lineTotal: number; // itemSubtotal + gstAmount
  brandSupplied: string;
  technicalNotes?: string;
  specCompatibilityStatus?: 'COMPATIBLE_EXACT' | 'COMPATIBLE_CONVERTED' | 'INCOMPATIBLE';
  normalizedUnitPrice?: number;
  compatibilityNotes?: string;
}

export interface ConstructionQuotation {
  id: string;
  referenceCode: string; // e.g. QUO-84729
  rfqId: string;
  rfqReferenceCode: string;
  supplierId: string;
  supplierBusinessId?: string;
  supplierName: string;
  supplierGstin: string;
  supplierCity: string;
  supplierVerificationBadge: 'PREMIUM_VERIFIED' | 'GST_VERIFIED' | 'BASIC_VERIFIED';
  supplierRating: number; // 1-5
  totalCompletedDeliveries: number;
  items: ItemizedQuotationBreakdown[];
  subtotal: number;
  totalGst: number;
  deliveryCharges: number;
  discountAmount: number;
  grandTotal: number;
  promisedDeliveryDate: string;
  validityDays: number;
  validUntil: string;
  paymentTerms: string; // e.g. "50% Advance, 50% on Site Delivery"
  status: QuotationStatus;
  revisionNumber: number;
  supplierNotes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DispatchDetails {
  vehicleType: string; // e.g. "10-Wheeler Tipper", "Tata Ace", "Transit Mixer"
  vehicleNumber: string; // e.g. "GJ-01-AB-4921"
  driverName: string;
  driverPhone: string;
  transporterName: string;
  eWayBillNumber?: string;
  dispatchDateTime: string;
  estimatedDeliveryTime: string;
  trackingNotes?: string;
}

export interface DeliveryReceiptConfirmation {
  confirmedReceivedQuantity: string; // "100% Full Order" or partial details
  receivedAt: string;
  receivedBy: string;
  receiverPhone: string;
  hasDamageOrShortage: boolean;
  shortageDamageNotes?: string;
  proofPhotos: string[];
  supplierRating: number; // 1 to 5
  buyerFeedback: string;
  completedAt: string;
}

export interface DeliveryTimelineEvent {
  stage: DeliveryTrackingStage;
  timestamp: string;
  title: string;
  description: string;
  updatedBy: string;
  actorRole: 'SUPPLIER' | 'TRANSPORTER' | 'BUYER' | 'ADMIN';
}

export interface QuotationComparisonMatrix {
  rfq: ConstructionRfq;
  quotations: ConstructionQuotation[];
  lowestTotalPrice: number;
  fastestDeliveryDate: string;
  highestRatedSupplierId: string;
}

export interface PurchaseOrder {
  id: string;
  referenceCode: string; // e.g. PO-74912
  rfqId: string;
  rfqReferenceCode: string;
  quotationId: string;
  quotationReferenceCode: string;
  buyerId: string;
  buyerName: string;
  buyerPhone?: string;
  buyerBusinessId?: string;
  supplierBusinessId?: string;
  supplierId: string;
  supplierName: string;
  supplierGstin: string;
  items: ItemizedQuotationBreakdown[];
  subtotal: number;
  totalGst: number;
  deliveryCharges: number;
  discountAmount: number;
  grandTotal: number;
  delivery: SiteDeliveryDetails;
  deliveryStatus: DeliveryTrackingStage;
  dispatchDetails?: DispatchDetails;
  receiptConfirmation?: DeliveryReceiptConfirmation;
  timeline: DeliveryTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ConstructionSupplierProfile {
  id: string;
  businessName: string;
  slug: string;
  gstin: string;
  panNumber?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  operatingZones: string[]; // e.g. ["SG Highway", "Sanand", "Bopal", "Gota", "Ahmedabad City", "Gandhinagar"]
  primaryCategories: string[]; // slugs
  brandsOffered: string[];
  verificationBadge: 'PREMIUM_VERIFIED' | 'GST_VERIFIED' | 'BASIC_VERIFIED';
  rating: number;
  reviewCount: number;
  completedDeliveries: number;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    upiId?: string;
  };
  isActive: boolean;
}
