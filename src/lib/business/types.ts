/**
 * PROVENTA — Industrial Procurement Platform
 * Business Registration, Onboarding & Document Verification Types
 */

import type {
  PlatformRole,
  BusinessEntityType,
  BusinessVerificationStatus,
  BusinessDocumentType,
} from '@prisma/client';

export type {
  PlatformRole,
  BusinessEntityType,
  BusinessVerificationStatus,
  BusinessDocumentType,
};

export interface AuthorizedContact {
  id?: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  isPrimary: boolean;
  authorizedSignatory: boolean;
  department?: string;
}

export interface ProjectLocation {
  id?: string;
  name: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  siteEngineerContact?: string;
  active: boolean;
}

export interface AddressRecord {
  id?: string;
  label: string; // e.g., "Registered Office", "Central Warehouse", "Site Office"
  addressLine1: string;
  addressLine2?: string;
  area?: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultBilling?: boolean;
  isDefaultShipping?: boolean;
}

export interface WarehouseLocation {
  id?: string;
  name: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  capacitySqFt?: number;
  contactPerson?: string;
  phone?: string;
}

export interface InitialCatalogueItem {
  id?: string;
  name: string;
  category: string;
  brand?: string;
  unit: string;
  indicativePrice?: number;
  moq?: number;
  availableQuantity?: number;
  hsnCode?: string;
  gstRate?: number;
}

// Step 1 Payload
export interface Step1IdentityInput {
  name: string;
  legalName: string;
  entityType: BusinessEntityType;
  yearEstablished: number;
  shortDescription?: string;
  description?: string;
  industry?: string;
  website?: string;
  logoUrl?: string;
  registeredOffice: {
    addressLine1: string;
    addressLine2?: string;
    area?: string;
    city: string;
    district: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

// Step 2 Payload
export interface Step2TaxInput {
  gstNumber: string;
  pan: string;
  cin?: string;
  llpin?: string;
  udyamNumber?: string;
}

// Step 3 Payload
export interface Step3ContactsInput {
  contacts: AuthorizedContact[];
}

// Step 4 Payload
export interface Step4RoleInput {
  platformRole: PlatformRole; // BUYER | SUPPLIER | BOTH
}

// Step 5 Payload (Buyer)
export interface Step5BuyerInput {
  industrySegment: string;
  procurementCategories: string[];
  materialsOfInterest?: string[];
  annualBudget?: string;
  purchaseFrequency?: string;
  projectLocations?: ProjectLocation[];
  billingAddresses?: AddressRecord[];
  shippingAddresses?: AddressRecord[];
}

// Step 5 Payload (Supplier)
export interface Step5SupplierInput {
  supplierType: string; // Manufacturer, Distributor, Dealer, Wholesaler, Trader, Importer
  operatingCategories: string[];
  subcategories?: string[];
  brandsOffered: string[];
  manufacturingCapacity?: string;
  monthlySupplyCapacity?: string;
  minimumOrderValue?: number;
  warehouseLocations?: WarehouseLocation[];
  serviceableDistricts: string[];
  serviceableStates: string[];
  panIndiaDelivery?: boolean;
  standardLeadTimeDays?: number;
  fleetDetails?: string;
  initialProducts?: InitialCatalogueItem[];
}

// Document Upload Record
export interface UploadedDocumentRecord {
  id: string;
  documentType: BusinessDocumentType;
  documentNumber?: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes?: number;
  mimeType?: string;
  status: BusinessVerificationStatus;
  rejectionReason?: string;
  createdAt: string;
}

// Unified Full Registration Wizard State
export interface BusinessRegistrationWizardState {
  businessId?: string;
  onboardingStep: number;
  onboardingComplete: boolean;
  verificationStatus: BusinessVerificationStatus;
  platformRole: PlatformRole;
  identity: Partial<Step1IdentityInput>;
  tax: Partial<Step2TaxInput>;
  contacts: AuthorizedContact[];
  buyerProfile?: Partial<Step5BuyerInput>;
  supplierProfile?: Partial<Step5SupplierInput>;
  documents: UploadedDocumentRecord[];
}
