import { z } from 'zod';

export type MCPRiskLevel = 'READ_ONLY' | 'LOW_FINANCIAL' | 'CONSEQUENTIAL_FINANCIAL' | 'IRREVERSIBLE';

export type MCPServiceCategory = 
  | 'food'
  | 'dining'
  | 'travel'
  | 'mobility'
  | 'entertainment'
  | 'shopping'
  | 'gifting'
  | 'local_services'
  | 'calendar';

export interface MCPToolContext {
  userId: string;
  taskId?: string;
  idempotencyKey: string;
  authToken?: string;
  isSandbox?: boolean;
  metadata?: Record<string, unknown>;
}

export interface MCPToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  isSandbox?: boolean;
  providerReference?: string;
  costPaise?: number;
  metadata?: Record<string, unknown>;
}

export interface MCPTool<TInput = any, TOutput = any> {
  name: string;
  description: string;
  category: MCPServiceCategory;
  riskLevel: MCPRiskLevel;
  requiredScopes: string[];
  requiresApproval: boolean;
  timeoutMs: number;
  inputSchema: z.ZodSchema<TInput>;
  outputSchema?: z.ZodSchema<TOutput>;
  execute: (input: TInput, context: MCPToolContext) => Promise<MCPToolResult<TOutput>>;
}