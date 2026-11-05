/**
 * PROVENTA — Industrial Procurement Platform
 * Supplier Intelligence & Discovery Engine — Core Types & DTOs
 */

export interface PublicSupplierStorefront {
  id: string; // Business ID
  supplierProfileId: string;
  name: string;
  legalName?: string | null;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  yearEstablished?: number | null;
  city: string;
  state: string;
  postalCode?: string | null;
  supplierType: string; // Manufacturer, Distributor, Dealer, Wholesaler, Trader, Importer
  gstVerificationStatus: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
  proventaVerificationStatus: 'VERIFIED' | 'PREMIUM_VERIFIED' | 'UNDER_REVIEW' | 'DRAFT';
  operatingCategories: string[];
  subcategories: string[];
  brandsOffered: string[];
  manufacturingCapacity?: string | null;
  monthlySupplyCapacity?: string | null;
  minimumOrderValue?: number | null;
  standardLeadTimeDays: number;
  panIndiaDelivery: boolean;
  serviceableDistricts: string[];
  serviceableStates: string[];
  warehouses: SupplierWarehouseDto[];
  products: ProductCatalogueDto[];
  performance: SupplierPerformanceDto;
  isSaved?: boolean;
}

export interface SupplierWarehouseDto {
  id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  capacitySqFt?: number | null;
  operatingZones: string[];
  railSidingAccess: boolean;
  weighbridgeAvailable: boolean;
}

export interface ProductCatalogueDto {
  id: string;
  supplierProfileId: string;
  name: string;
  category: string;
  subcategory?: string | null;
  description?: string | null;
  brand?: string | null;
  grade?: string | null;
  standards?: string | null; // IS / BIS standards, e.g. "IS 1786:2008"
  specifications?: Record<string, any> | null;
  unit: string;
  indicativePrice?: number | null;
  moq?: number | null;
  availableQuantity?: number | null;
  hsnCode?: string | null;
  gstRate?: number | null;
  images: string[];
  warehouses?: Array<{ name: string; district: string; state: string; stockAvailable?: number }> | null;
  deliveryLocations?: string[] | null;
  isActive: boolean;
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierPerformanceDto {
  rfqsReceived: number;
  rfqsResponded: number;
  responseRatePercent: number;
  avgResponseTimeHours: number;
  quotationsAwarded: number;
  ordersCompleted: number;
  onTimeDeliveryRate: number;
  cancellationRate: number;
  rating: number; // 0 to 5.0
  reviewCount: number;
  totalDeliveredTonnage: number;
  sampleThresholdMet: boolean; // true if ordersCompleted >= 3
  metricsNotice?: string;
}

export interface SupplierSearchParams {
  query?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  grade?: string;
  specification?: string;
  supplierType?: string;
  gstVerifiedOnly?: boolean;
  proventaVerifiedOnly?: boolean;
  state?: string;
  district?: string;
  pincode?: string;
  minCapacity?: number;
  verificationStatus?: string;
  panIndiaOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface SupplierDiscoveryCard {
  id: string; // Business ID
  supplierProfileId: string;
  name: string;
  slug: string;
  tagline?: string | null;
  city: string;
  state: string;
  supplierType: string;
  verificationBadge: 'PREMIUM_VERIFIED' | 'GST_VERIFIED' | 'VERIFIED' | 'SELF_REPORTED';
  isGstVerified: boolean;
  categories: string[];
  brands: string[];
  monthlyCapacity?: string | null;
  warehousesCount: number;
  serviceableDistrictsCount: number;
  panIndiaDelivery: boolean;
  rating: number;
  reviewCount: number;
  sampleThresholdMet: boolean;
  matchedProductsCount: number;
  totalAvailableCapacity?: number;
  topProducts: Array<{ id: string; name: string; category: string; brand?: string | null; grade?: string | null; unit: string; indicativePrice?: number | null }>;
  isSaved?: boolean;
}

export interface SupplierRfqMatchResult {
  supplierBusinessId: string;
  supplierName: string;
  slug: string;
  city: string;
  state: string;
  matchScore: number; // 0 - 100
  matchingReasons: string[];
  matchedProducts: Array<{ id: string; name: string; category: string; brand?: string | null }>;
  verificationBadge: string;
  rating: number;
  panIndiaDelivery: boolean;
}
