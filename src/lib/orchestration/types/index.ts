import type { TaskStatus, TaskPriority, TaskExecutionMethod, ApprovalStatus } from '@prisma/client';

export type { TaskStatus, TaskPriority, TaskExecutionMethod, ApprovalStatus };

export interface ExtractedEntities {
  category?: string;
  subcategory?: string;
  objective?: string;
  action?: string;
  intent: string;
  location?: string;
  dateTime?: string;
  timeframe?: string;
  origin?: string;
  destination?: string;
  originAirport?: string;
  destinationAirport?: string;
  entityProvenance?: Record<string, string>;
  dates?: {
    exact?: string;
    start?: string;
    end?: string;
  };
  partySize?: number;
  occasion?: string;
  budgetRange?: string;
  budgetAmount?: number;
  budgetCurrency?: string;
  urgency: TaskPriority;
  preferences?: any;
  constraints?: string[];
  deadline?: string;
  customerProvidedDetails?: Record<string, any>;
  executionRequired?: boolean;
  approvalRequired?: boolean;
  missingInfo?: string[];
  requiresClarification: boolean;
  clarificationQuestion?: string;
  isProhibited?: boolean;
  vendorName?: string;
  rawInput: string;
}

export type ExecutionEnvironment = 'REAL' | 'SANDBOX' | 'MOCK' | 'CURATED' | 'PHONE' | 'HUMAN_FALLBACK';

export interface OptionProposal {
  id: string;
  title: string;
  providerId: string;
  venueId?: string;
  providerName: string;
  description: string;
  address?: string;
  priceAmount?: number;
  priceCurrency: string;
  priceFormatted: string;
  reliabilityScore?: number;
  availability?: string;
  availabilityDetails?: string;
  bookingMethod?: string;
  cancellationPolicy?: string;
  taxesAndFees?: string;
  metadata?: Record<string, any>;
  environment?: ExecutionEnvironment;
  isMock?: boolean;
}

export interface ProposalBatch {
  batchId: string;
  batchNumber: number;
  generatedAt: string;
  options: OptionProposal[];
  status: 'ACTIVE' | 'REJECTED' | 'APPROVED' | 'PARTIALLY_REJECTED' | 'SUPERSEDED_BY_MODIFICATION' | 'PRESENTED';
  feedback?: string;
  rejectedOptionIds?: string[];
  approvedOptionId?: string;
}

export interface ExecutionOutput {
  success: boolean;
  providerId?: string;
  externalReferenceId?: string;
  providerName: string;
  status?: string;
  environment?: ExecutionEnvironment;
  confirmedDetails: Record<string, any>;
  rawResponse?: Record<string, any>;
  isMock?: boolean;
  receiptUrl?: string;
  errorMessage?: string;
}

export interface VerificationResult {
  verified: boolean;
  status: 'CONFIRMED' | 'FAILED' | 'PENDING';
  confirmationReference?: string;
  environment?: ExecutionEnvironment;
  isMock?: boolean;
  verifiedAt: Date;
  auditTrail?: string;
  details?: Record<string, any>;
  notes?: string;
}

export interface TaskAgentInterface {
  name: string;
  category: string;
  canHandle(category: string, intent: string): boolean;
  identifyMissingInformation(entities: ExtractedEntities): string[];
  search(entities: ExtractedEntities, preferences?: Record<string, any>): Promise<OptionProposal[]>;
  rankOptions(options: OptionProposal[], preferences?: Record<string, any>): OptionProposal[];
  execute(task: any, approvedOption: OptionProposal): Promise<ExecutionOutput>;
  verify(execution: ExecutionOutput): Promise<VerificationResult>;
}

export type TaskAutomationLevel = 'AUTOMATED' | 'ASSISTED' | 'HUMAN_CONCIERGE';

export interface ProviderCapabilities {
  search: boolean;
  availability: boolean;
  quote: boolean;
  execute: boolean;
  book?: boolean;
  modify: boolean;
  cancel: boolean;
  getStatus: boolean;
  status?: boolean;
  refund?: boolean;
  environment?: ExecutionEnvironment;
  automationTier?: TaskAutomationLevel;
}

export interface CancellationResult {
  success: boolean;
  cancellationReference?: string;
  refundAmount?: number;
  refundCurrency?: string;
  status?: 'CANCELLED' | 'PENDING_OPERATOR' | 'FAILED';
  errorMessage?: string;
  details?: Record<string, any>;
}

export interface ModificationResult {
  success: boolean;
  modificationReference?: string;
  newExternalReferenceId?: string;
  modifiedDetails?: Record<string, any>;
  priceDifference?: number;
  status?: 'MODIFIED' | 'PENDING_OPERATOR' | 'FAILED';
  errorMessage?: string;
}

export interface ProviderAdapterInterface {
  providerId: string;
  name: string;
  supportedCategories: string[];
  environment?: ExecutionEnvironment;
  capabilities?: ProviderCapabilities;
  search(query: {
    category: string;
    intent?: string;
    rawInput: string;
    constraints?: Record<string, any>;
  }): Promise<OptionProposal[]>;
  getDetails?(providerId: string): Promise<Record<string, any>>;
  checkAvailability?(query: Record<string, any>): Promise<{ available: boolean; slots?: string[]; price?: number }>;
  getQuote?(query: Record<string, any>): Promise<{ quoteAmount: number; currency: string; validUntil?: string; quoteId?: string }>;
  createBooking?(proposal: OptionProposal, bookingDetails: Record<string, any>): Promise<ExecutionOutput>;
  cancelBooking?(externalReferenceId: string, reason?: string): Promise<CancellationResult | { success: boolean; refundAmount?: number; cancellationReference?: string }>;
  modifyBooking?(externalReferenceId: string, modifications: Record<string, any>): Promise<ExecutionOutput | ModificationResult>;
  getBooking?(externalReferenceId: string): Promise<Record<string, any>>;
  getStatus?(externalReferenceId: string): Promise<string>;
  execute(proposal: OptionProposal, bookingDetails: Record<string, any>): Promise<ExecutionOutput>;
  verify(externalReferenceId: string | ExecutionOutput): Promise<VerificationResult>;
}

