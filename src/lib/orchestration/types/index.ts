import type { TaskStatus, TaskPriority, TaskExecutionMethod, ApprovalStatus } from '@prisma/client';

export type { TaskStatus, TaskPriority, TaskExecutionMethod, ApprovalStatus };

export interface ExtractedEntities {
  category?: string;
  subcategory?: string;
  intent: string;
  location?: string;
  dateTime?: string;
  timeframe?: string;
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
  isMock?: boolean;
}

export interface ExecutionOutput {
  success: boolean;
  externalReferenceId?: string;
  providerName: string;
  status?: string;
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
  search(query: {
    category: string;
    intent?: string;
    rawInput: string;
    constraints?: Record<string, any>;
  }): Promise<OptionProposal[]>;
  execute(proposal: OptionProposal, bookingDetails: Record<string, any>): Promise<ExecutionOutput>;
  verify(externalReferenceId: string): Promise<VerificationResult>;
}
