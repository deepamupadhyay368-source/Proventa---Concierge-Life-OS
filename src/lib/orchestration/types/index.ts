import type { TaskStatus, TaskPriority, TaskExecutionMethod, ApprovalStatus } from '@prisma/client';

export type { TaskStatus, TaskPriority, TaskExecutionMethod, ApprovalStatus };

export interface ExtractedEntities {
  category?: string;
  subcategory?: string;
  intent: string;
  location?: string;
  dateTime?: string;
  timeframe?: string;
  origin?: string;
  destination?: string;
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
  missingInfo?: string[];
  requiresClarification: boolean;
  clarificationQuestion?: string;
  vendorName?: string;
  rawInput: string;
}

export type ExecutionEnvironment = 'REAL' | 'SANDBOX' | 'HUMAN_FALLBACK';

export interface OptionProposal {
  id: string;
  title: string;
  providerId?: string;
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

export interface ExecutionOutput {
  success: boolean;
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

export interface ProviderAdapterInterface {
  name: string;
  supportedCategories: string[];
  environment?: ExecutionEnvironment;
  search(query: {
    category: string;
    intent?: string;
    rawInput: string;
    constraints?: Record<string, any>;
  }): Promise<OptionProposal[]>;
  getDetails?(providerId: string): Promise<Record<string, any>>;
  checkAvailability?(query: Record<string, any>): Promise<{ available: boolean; slots?: string[]; price?: number }>;
  createBooking?(proposal: OptionProposal, bookingDetails: Record<string, any>): Promise<ExecutionOutput>;
  cancelBooking?(externalReferenceId: string, reason?: string): Promise<{ success: boolean; refundAmount?: number }>;
  modifyBooking?(externalReferenceId: string, modifications: Record<string, any>): Promise<ExecutionOutput>;
  getBooking?(externalReferenceId: string): Promise<Record<string, any>>;
  getStatus?(externalReferenceId: string): Promise<string>;
  execute(proposal: OptionProposal, bookingDetails: Record<string, any>): Promise<ExecutionOutput>;
  verify(externalReferenceId: string): Promise<VerificationResult>;
}
