export type ServiceCategory =
  | 'DINING'
  | 'TRAVEL'
  | 'HOTELS'
  | 'TRANSPORT'
  | 'FOOD_DELIVERY'
  | 'MOVIES_ENTERTAINMENT'
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

export interface TaskCapability {
  capabilityId: string;
  category: ServiceCategory;
  name: string;
  description: string;
  specialistAgent: string;
  researchSupported: boolean;
  executionMode: ExecutionMode;
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
  researchSupported: boolean;
  automaticExecution: boolean;
  humanConcierge: boolean;
  approvalRequired: boolean;
  verificationMethod: string;
  productionStatus: ProductionStatus;
}
