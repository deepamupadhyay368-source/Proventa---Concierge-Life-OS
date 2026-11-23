/**
 * PROVENTA HOME — Household Maintenance Membership & Property Care Platform
 * Core Domain Type Definitions
 * 
 * Commercial launch ready for Indian urban markets (Starting Ahmedabad, Gujarat)
 */

export type HomeUserRole = 
  | 'CUSTOMER' 
  | 'TECHNICIAN' 
  | 'SOCIETY_ADMIN' 
  | 'OPERATIONS_ADMIN' 
  | 'SUPPORT_ADMIN' 
  | 'SUPER_ADMIN';

// --- SERVICE CATALOGUE TYPES ---
export type HomeServiceCategoryKey =
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'CARPENTRY'
  | 'APPLIANCE'
  | 'CLEANING'
  | 'PREVENTIVE'
  | 'ADDITIONAL';

export type ServicePlanEligibility = 'INCLUDED' | 'DISCOUNTED' | 'SEPARATE_CHARGE' | 'EXCLUDED';

export interface HomeServiceItem {
  id: string;
  categoryKey: HomeServiceCategoryKey;
  name: string;
  code: string;
  description: string;
  estimatedDurationMin: number;
  requiredSkill: string;
  standardPrice: number; // Customer standard charge if not covered
  technicianPayout: number; // Agreed partner payout for this job
  materialPolicy: 'CUSTOMER_PROVIDED' | 'TECHNICIAN_REIMBURSED' | 'PLATFORM_PROCURED' | 'NOT_APPLICABLE';
  inclusions: string[];
  exclusions: string[];
  safetyRequirements: string[];
  isActive: boolean;
  essentialPlanEligibility: ServicePlanEligibility;
  familyPlanEligibility: ServicePlanEligibility;
  premiumPlanEligibility: ServicePlanEligibility;
}

export interface HomeServiceCategory {
  key: HomeServiceCategoryKey;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  displayOrder: number;
  services: HomeServiceItem[];
}

// --- LOCALITY & SERVICE AREAS ---
export interface HomeLocality {
  id: string;
  city: string; // 'Ahmedabad'
  name: string; // 'Bopal', 'South Bopal', 'Gota', 'Science City', etc.
  zone: 'WEST' | 'NORTH_WEST' | 'CENTRAL' | 'SOUTH_WEST';
  pincodes: string[];
  isOperational: boolean;
  activeTechniciansCount: number;
  coveredHouseholdsCount: number;
  averageResponseTimeMin: number;
}

// --- SUBSCRIPTION & MEMBERSHIP ENGINE ---
export type SubscriptionPlanTier = 'ESSENTIAL' | 'FAMILY' | 'PREMIUM';
export type BillingFrequency = 'MONTHLY' | 'ANNUAL';
export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'CANCELLED' | 'PAYMENT_PENDING';

export interface HomeSubscriptionPlan {
  id: string;
  tier: SubscriptionPlanTier;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number; // discounted rate
  includedVisitsPerBillingMonth: number;
  visitDurationCapHours: number; // Max hours per visit covered (e.g. 1.5 hrs)
  allowedCategories: HomeServiceCategoryKey[];
  visitRolloverAllowed: boolean;
  maxRolloverVisits: number;
  priorityDispatch: boolean;
  homeInspectionIncluded: boolean;
  preventiveRemindersIncluded: boolean;
  additionalVisitDiscountPercent: number;
  features: string[];
  isPopular?: boolean;
}

export interface HomeSubscription {
  id: string;
  customerId: string;
  planId: string;
  planTier: SubscriptionPlanTier;
  billingFrequency: BillingFrequency;
  status: SubscriptionStatus;
  startDate: string; // ISO
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  autoRenew: boolean;
  visitsEntitlementTotal: number;
  visitsUsedCurrentPeriod: number;
  visitsRolloverCount: number;
  visitsRemainingCurrentPeriod: number;
  lastPaymentId?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

// --- CUSTOMER PROFILE & HOUSEHOLD ---
export interface HomeCustomerProfile {
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  email: string;
  alternatePhone?: string;
  addressLine1: string;
  apartmentOrSociety: string;
  flatOrHouseNumber: string;
  locality: string;
  city: string;
  pincode: string;
  landmark?: string;
  activeSubscriptionId?: string;
  preferredTechnicianId?: string;
  registeredAt: string;
  totalRequestsCount: number;
  totalCompletedJobs: number;
  accountStatus: 'ACTIVE' | 'SUSPENDED';
}

// --- TECHNICIAN PARTNER NETWORK ---
export type TechnicianKycStatus = 
  | 'APPLICATION_SUBMITTED' 
  | 'DOCUMENTS_PENDING' 
  | 'VERIFICATION_IN_PROGRESS' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'SUSPENDED';

export interface HomeTechnicianDocument {
  id: string;
  technicianId: string;
  docType: 'AADHAAR' | 'PAN' | 'POLICE_VERIFICATION' | 'TRADE_CERTIFICATE' | 'EXPERIENCE_LETTER';
  docNumber: string;
  fileUrl: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedAt?: string;
  notes?: string;
}

export interface HomeTechnicianProfile {
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  email?: string;
  operatingLocality: string;
  serviceRadiusKm: number;
  serviceCategories: HomeServiceCategoryKey[];
  primarySkills: string[];
  experienceYears: number;
  kycStatus: TechnicianKycStatus;
  isAvailableForDispatch: boolean;
  ratingAverage: number;
  ratingCount: number;
  completedJobsCount: number;
  activeJobId?: string;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    beneficiaryName: string;
    bankName: string;
    upiId?: string;
  };
  documents: HomeTechnicianDocument[];
  safetyBriefingCompleted: boolean;
  joinedAt: string;
}

// --- SERVICE REQUEST & DISPATCH LIFECYCLE ---
export type ServiceRequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'TECHNICIAN_ASSIGNED'
  | 'APPOINTMENT_CONFIRMED'
  | 'TECHNICIAN_EN_ROUTE'
  | 'WORK_STARTED'
  | 'AWAITING_CUSTOMER_APPROVAL'
  | 'WORK_COMPLETED'
  | 'PAYMENT_PENDING'
  | 'CLOSED'
  | 'CANCELLED'
  | 'DISPUTED';

export interface HomeAdditionalCharge {
  id: string;
  requestId: string;
  description: string; // e.g. "Replacement 16A anchor socket + 2.5mm wire 5m"
  materialCost: number;
  labourExtraCost: number;
  totalAmount: number;
  requestedAt: string;
  status: 'PENDING_APPROVAL' | 'APPROVED_BY_CUSTOMER' | 'REJECTED_BY_CUSTOMER';
  approvedAt?: string;
}

export interface HomeServiceRequest {
  id: string;
  requestCode: string; // e.g. 'PH-REQ-2026-0842'
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: {
    fullAddress: string;
    apartmentOrSociety: string;
    flatNumber: string;
    locality: string;
    city: string;
    pincode: string;
    landmark?: string;
  };
  categoryKey: HomeServiceCategoryKey;
  serviceCode: string;
  serviceName: string;
  issueDescription: string;
  preferredDate: string; // YYYY-MM-DD
  preferredTimeSlot: string; // e.g. "10:00 AM - 12:00 PM"
  urgency: 'STANDARD' | 'PRIORITY' | 'EMERGENCY';
  photoUrls: string[];
  
  // Commercial coverage
  isSubscriptionCovered: boolean;
  subscriptionId?: string;
  baseServiceCharge: number; // 0 if covered
  additionalCharges: HomeAdditionalCharge[];
  totalCustomerPayable: number;
  paymentStatus: 'NOT_REQUIRED' | 'PENDING' | 'PAID' | 'REFUNDED';
  
  // Technician dispatch details
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  assignedTechnicianPhone?: string;
  assignedAt?: string;
  scheduledDateTime: string;
  
  // Job execution evidence
  workStartedAt?: string;
  workCompletedAt?: string;
  beforePhotos: string[];
  afterPhotos: string[];
  technicianWorkNotes?: string;
  customerSignOffReceived: boolean;
  
  // Status & Feedback
  status: ServiceRequestStatus;
  customerRating?: number; // 1-5
  customerFeedback?: string;
  reopenedCount: number;
  createdAt: string;
  updatedAt: string;
}

// --- TECHNICIAN PAYOUT RECORD ---
export interface HomeTechnicianPayout {
  id: string;
  technicianId: string;
  requestId: string;
  requestCode: string;
  grossAmount: number;
  materialReimbursement: number;
  platformCommissionOrFee: number;
  netPayoutAmount: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'DISPUTED' | 'WITHHELD';
  payoutDate?: string;
  transactionReference?: string;
  calculatedAt: string;
}

// --- HOME MAINTENANCE PASSPORT & ASSET TRACKING ---
export type HouseholdAssetType = 
  | 'AIR_CONDITIONER'
  | 'WATER_PURIFIER_RO'
  | 'REFRIGERATOR'
  | 'WASHING_MACHINE'
  | 'GEYSER'
  | 'MAIN_ELECTRICAL_PANEL'
  | 'WATER_PUMP'
  | 'PLUMBING_PIPELINE'
  | 'INVERTER_UPS';

export interface HouseholdAsset {
  id: string;
  customerId: string;
  assetType: HouseholdAssetType;
  customName: string; // e.g. 'Living Room 1.5T Inverter AC'
  brand: string;
  modelNumber?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyExpiryDate?: string;
  installedLocation: string; // e.g. 'Master Bedroom'
  lastServicedDate?: string;
  nextRecommendedServiceDate?: string;
  notes?: string;
}

export interface MaintenancePassportEntry {
  id: string;
  customerId: string;
  assetId?: string;
  serviceRequestId?: string;
  serviceType: string;
  date: string;
  performedBy: string;
  findingsAndWork: string;
  partsReplaced?: string[];
  warrantyGrantedMonths?: number;
  nextActionRecommendation?: string;
}

// --- RESIDENTIAL SOCIETY PARTNERSHIPS ---
export interface ResidentialSociety {
  id: string;
  societyName: string;
  locality: string;
  city: string;
  pincode: string;
  totalFlatsOrUnits: number;
  secretaryName: string;
  secretaryPhone: string;
  secretaryEmail: string;
  partnershipModel: 'INDIVIDUAL_PREFERENTIAL' | 'BULK_COMMUNITY_CONTRACT';
  contractStatus: 'PROPOSAL' | 'ACTIVE' | 'RENEWAL_DUE' | 'EXPIRED';
  enrolledHouseholdsCount: number;
  negotiatedDiscountPercent: number;
  startDate?: string;
  endDate?: string;
}

// --- COMPLAINTS & QUALITY ASSURANCE ---
export interface HomeComplaint {
  id: string;
  complaintCode: string;
  requestId: string;
  customerId: string;
  technicianId?: string;
  category: 'POOR_WORKMANSHIP' | 'TECHNICIAN_DELAY' | 'UNAUTHORIZED_CHARGE' | 'DAMAGE_CLAIM' | 'UNPROFESSIONAL_BEHAVIOUR';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'SUBMITTED' | 'INVESTIGATING' | 'REWORK_SCHEDULED' | 'REFUNDED' | 'CLOSED';
  resolutionNotes?: string;
  assignedSupportAgent?: string;
  createdAt: string;
  resolvedAt?: string;
}

// --- UNIT ECONOMICS SIMULATION & FINANCIAL ANALYTICS ---
export interface UnitEconomicsSimulation {
  planTier: SubscriptionPlanTier;
  monthlySubscriptionPrice: number;
  projectedSubscribers: number;
  averageVisitsUsedPerMonth: number;
  technicianPayoutPerVisit: number;
  grossRevenue: number;
  gstTaxDeduction: number; // 18% GST
  paymentGatewayFee: number; // ~2%
  directTechnicianCost: number;
  customerSupportAndCoordinationCost: number;
  disputeAndReworkCostReserve: number;
  totalVariableCost: number;
  contributionMarginAmount: number;
  contributionMarginPercent: number;
  isProfitable: boolean;
  breakEvenVisitsPerMonth: number;
}
