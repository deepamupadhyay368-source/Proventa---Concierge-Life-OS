/**
 * Proventa Provider Gateway - Core Types & Standard Interfaces
 * All 3rd-party connectors and mock/sandbox implementations must strictly adhere to these interfaces.
 */

export type IntegrationStatus =
  | 'NOT_CONNECTED'
  | 'SANDBOX'
  | 'TESTING'
  | 'PRODUCTION_PENDING'
  | 'PRODUCTION_ACTIVE'
  | 'DISABLED'
  | 'ERROR';

export type ProviderServiceCategory =
  | 'FLIGHTS'
  | 'HOTELS'
  | 'RESTAURANTS'
  | 'FOOD'
  | 'CABS'
  | 'MOVIES'
  | 'GIFTS'
  | 'EXPERIENCES'
  | 'PAYMENTS'
  | 'COMMUNICATION'
  | 'CALENDAR';

export interface ProviderResult<T = any> {
  success: boolean;
  providerKey: string;
  providerName: string;
  isSandbox: boolean;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'RETRYABLE_ERROR';
  data?: T;
  referenceId?: string;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
    rawDetails?: any;
  };
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface ProviderConfig {
  providerKey: string;
  name: string;
  category: ProviderServiceCategory;
  apiEndpoint: string;
  authMethod: 'API_KEY' | 'OAUTH2' | 'BEARER' | 'BASIC';
  credentials: Record<string, string>;
  isSandbox: boolean;
  rateLimitPerMin: number;
  commissionPercent: number;
  priority: number;
  status: IntegrationStatus;
  supportedOperations: string[];
}

export interface BaseProviderInterface {
  readonly providerKey: string;
  readonly name: string;
  readonly category: ProviderServiceCategory;
  readonly isSandbox: boolean;
  getStatus(): Promise<IntegrationStatus>;
  checkHealth(): Promise<{ healthy: boolean; latencyMs: number; message?: string }>;
}
