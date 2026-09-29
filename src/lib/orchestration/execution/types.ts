/**
 * PROVENTA — AI AUTONOMOUS TASK EXECUTION ENGINE TYPES
 * Authoritative types for execution capability matrix, execution planning, tool contracts,
 * deterministic gates, verification, and audit traces.
 */

import type { OptionProposal, TaskStatus } from '../types';

export type CapabilityExecutionStatus =
  | 'LIVE_PRODUCTION'
  | 'SANDBOX'
  | 'MOCK'
  | 'CONFIGURED_BUT_UNVERIFIED'
  | 'NOT_CONFIGURED';

export type ExecutionMethod =
  | 'API'
  | 'ASSISTED_CONCIERGE'
  | 'HUMAN_CONCIERGE'
  | 'DELIVERABLE_COMPLETION'
  | 'COMPOSITE_ORCHESTRATION';

export type ExecutionFailureCategory =
  | 'TRANSIENT_FAILURE'
  | 'CUSTOMER_ACTION_REQUIRED'
  | 'PAYMENT_FAILURE'
  | 'PROVIDER_UNAVAILABLE'
  | 'CONSTRAINT_MISMATCH'
  | 'UNSUPPORTED_EXECUTION'
  | 'VERIFICATION_FAILURE'
  | 'SYNTHETIC_EVIDENCE_REJECTED';

export interface ExecutionCapability {
  capabilityId: string;
  service: string;
  provider: string;
  providerId: string;
  toolName: string;
  executionMethod: ExecutionMethod;
  environment: 'REAL' | 'SANDBOX' | 'MOCK';
  capabilityStatus: CapabilityExecutionStatus;
  credentialsConfigured: boolean;
  credentialsVerified: boolean;
  actuallyExecutableInProduction: boolean;
  requiresPayment: boolean;
  requiresCustomerApproval: boolean;
  supportsAutomatedExecution: boolean;
  supportsAssistedExecution: boolean;
  supportsHumanExecution: boolean;
  verificationMethod: string;
  fallbackMethod: string;
  risksOrBlockers?: string;
}

export interface ExecutionPlan {
  planId: string;
  taskId: string;
  serviceCategory: string;
  providerId: string;
  providerName: string;
  approvedOptionId: string;
  approvedOptionTitle: string;
  origin?: string;
  destination?: string;
  date?: string;
  time?: string;
  partySize?: number;
  cabinClass?: string;
  venue?: string;
  city?: string;
  amount: number;
  currency: string;
  paymentRequired: boolean;
  executionMethod: ExecutionMethod;
  toolName: string;
  idempotencyKey: string;
  lockedAt: string;
}

export interface ExecutionToolInput {
  taskId: string;
  taskRecord: any;
  approvedOption: OptionProposal;
  customer?: any;
  paymentRecord?: any;
  executionPlan: ExecutionPlan;
  bookingDetails?: Record<string, any>;
}

export interface ExecutionToolResult {
  success: boolean;
  provider: string;
  providerReference?: string;
  status: 'CONFIRMED' | 'AWAITING_CONCIERGE_CALL' | 'FAILED' | 'NEEDS_HUMAN';
  amount?: number;
  currency?: string;
  timestamp: string;
  evidence?: Record<string, any>;
  confirmedDetails?: Record<string, any>;
  errorCode?: string;
  errorMessage?: string;
  isMock: boolean;
  environment: 'REAL' | 'SANDBOX' | 'MOCK';
}

export interface ExecutionToolInterface {
  readonly toolName: string;
  readonly providerId: string;
  readonly capabilityStatus: CapabilityExecutionStatus;
  readonly environment: 'REAL' | 'SANDBOX' | 'MOCK';
  execute(input: ExecutionToolInput): Promise<ExecutionToolResult>;
  verify?(reference: string): Promise<{ verified: boolean; status: string; auditTrail?: string }>;
}

export interface ExecutionGateResult {
  passed: boolean;
  gateName: string;
  reason?: string;
  errorCode?: string;
  details?: Record<string, any>;
}

export interface ExecutionAgentOutput {
  success: boolean;
  status: TaskStatus;
  executionPlan?: ExecutionPlan;
  toolSelected?: string;
  toolResult?: ExecutionToolResult;
  verificationPassed?: boolean;
  confirmationReference?: string;
  handedToConcierge: boolean;
  paymentRequired?: boolean;
  paymentOrder?: any;
  failureCategory?: ExecutionFailureCategory;
  message: string;
  task?: any;
}
