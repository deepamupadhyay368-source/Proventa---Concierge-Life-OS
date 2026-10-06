export type ServiceCategory =
  | 'DINING'
  | 'FOOD_DELIVERY'
  | 'MOVIES_ENTERTAINMENT'
  | 'EVENTS_EXPERIENCES'
  | 'TRAVEL'
  | 'HOTELS_ACCOMMODATION'
  | 'MOBILITY_TRANSPORT'
  | 'GIFTS_SHOPPING'
  | 'HOME_LIFESTYLE'
  | 'HEALTH_WELLNESS'
  | 'BUSINESS_COURIER'
  | 'FINANCIAL_CONCIERGE'
  | 'LEGAL_DOCUMENTATION'
  | 'BESPOKE_REQUESTS'
  // Backward-compatibility aliases
  | 'HOTELS'
  | 'TRANSPORT'
  | 'GIFTS'
  | 'SHOPPING'
  | 'SALON_WELLNESS'
  | 'APPOINTMENTS'
  | 'EVENTS'
  | 'WEEKEND_ESCAPES'
  | 'RESEARCH_PLANNING'
  | 'OTHER_CONCIERGE';

export type ExecutionMode =
  | 'AI_RESEARCH'
  | 'PROVIDER_API'
  | 'HUMAN_CONCIERGE'
  | 'CUSTOMER_ACTION_REQUIRED'
  | 'UNSUPPORTED';

export type TaskExecutionModeType =
  | 'AUTOMATED_INTERNAL_EXECUTION'
  | 'TRUE_AUTONOMOUS_EXTERNAL_EXECUTION'
  | 'CUSTOMER_AUTHORIZED_CHECKOUT'
  | 'ASSISTED_EXECUTION'
  | 'HUMAN_CONCIERGE_EXECUTION';

export type ProductionStatus =
  | 'PRODUCTION_LIVE'
  | 'HUMAN_CONCIERGE'
  | 'RESEARCH_ONLY'
  | 'REQUIRES_PROVIDER'
  | 'DISABLED'
  | 'UNSUPPORTED';

export type TaskObjective =
  | 'BOOK'
  | 'SEARCH'
  | 'RECOMMEND'
  | 'RESEARCH'
  | 'COMPARE'
  | 'CANCEL'
  | 'INQUIRE'
  | 'ARRANGE';

export type DiscoveryStatus = 'AVAILABLE' | 'UNAVAILABLE';
export type ExecutionCategoryType = 'AUTONOMOUS' | 'ASSISTED' | 'HUMAN';
export type PaymentSupportType = 'supported' | 'unsupported';
export type ConfirmationType = 'required' | 'optional';

export interface AuthoritativeCapabilityRow {
  category: ServiceCategory;
  name: string;
  discovery: DiscoveryStatus;
  execution: ExecutionCategoryType;
  provider: string;
  booking: boolean;
  payment: PaymentSupportType;
  confirmation: ConfirmationType;
  specialistAgent: string;
  verificationMethod: string;
  notes?: string;
}

export interface TaskCapability {
  capabilityId: string;
  category: ServiceCategory;
  name: string;
  description: string;
  specialistAgent: string;
  discoveryStatus: DiscoveryStatus;
  researchSupported: boolean;
  executionCategory: ExecutionCategoryType;
  executionMode: ExecutionMode;
  providerName: string;
  bookingSupported: boolean;
  paymentSupport: PaymentSupportType;
  confirmationRequirement: ConfirmationType;
  liveProviderAvailable: boolean;
  humanConciergeAvailable: boolean;
  customerApprovalRequired: boolean;
  paymentRequired: boolean;
  verificationMethod: string;
  productionStatus: ProductionStatus;
  supportedProviders: string[];
}

export interface TaskDecision {
  category: ServiceCategory;
  objective: TaskObjective;
  capability: TaskCapability;
  executionMode: ExecutionMode;
  specialistAgent: string;
  approvalRequired: boolean;
  requiresHumanHandoff: boolean;
  explanation: string;
  suggestedAction?: string;
  missingRequirements?: string[];
  isProhibited?: boolean;
}

export interface CapabilityMatrixRow {
  category: ServiceCategory;
  name: string;
  specialistAgent: string;
  discovery: DiscoveryStatus;
  execution: ExecutionCategoryType;
  provider: string;
  booking: boolean;
  payment: PaymentSupportType;
  confirmation: ConfirmationType;
  researchSupported: boolean;
  automaticExecution: boolean;
  humanConcierge: boolean;
  approvalRequired: boolean;
  verificationMethod: string;
  productionStatus: ProductionStatus;
}
