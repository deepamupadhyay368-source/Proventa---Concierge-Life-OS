import { MCPTool, MCPToolContext, MCPToolResult } from './types';
import { mcpRegistry } from './registry';
import { db } from '@/lib/db';
import crypto from 'crypto';

export interface ExecuteOptions {
  userId: string;
  taskId?: string;
  idempotencyKey?: string;
  authToken?: string;
  isSandbox?: boolean;
  maxRetries?: number;
  backoffFactor?: number;
}

export class MCPExecutor {
  public static async executeTool<TInput = any, TOutput = any>(
    toolName: string,
    input: TInput,
    options: ExecuteOptions
  ): Promise<MCPToolResult<TOutput>> {
    const tool = mcpRegistry.getTool(toolName);
    if (!tool) {
      return {
        success: false,
        error: `MCP Tool "${toolName}" is not registered in the dynamic registry.`,
      };
    }

    const parseResult = tool.inputSchema.safeParse(input);
    if (!parseResult.success) {
      return {
        success: false,
        error: `Schema validation failed for tool "${toolName}": ${parseResult.error.message}`,
      };
    }

    const validatedInput = parseResult.data;
    const idempotencyKey = options.idempotencyKey || `mcp_idemp_${crypto.randomUUID()}`;
    const maxRetries = options.maxRetries ?? 2;
    const backoffFactor = options.backoffFactor ?? 500;

    const context: MCPToolContext = {
      userId: options.userId,
      taskId: options.taskId,
      idempotencyKey,
      authToken: options.authToken,
      isSandbox: options.isSandbox ?? false,
    };

    let attempt = 0;
    let lastError: string | undefined;

    while (attempt <= maxRetries) {
      attempt++;
      const startTime = Date.now();

      try {
        const timeoutPromise = new Promise<MCPToolResult<TOutput>>((_, reject) => {
          setTimeout(() => reject(new Error(`Execution timed out after ${tool.timeoutMs}ms`)), tool.timeoutMs);
        });

        const executionPromise = tool.execute(validatedInput, context);
        const result = await Promise.race([executionPromise, timeoutPromise]);

        if (options.taskId) {
          try {
            await db.agentExecutionTrace.create({
              data: {
                taskId: options.taskId,
                agentRole: tool.category,
                step: 'EXECUTION',
                intent: `Tool call: ${tool.name}`,
                inputData: validatedInput as any,
                outputData: (result.data || { error: result.error }) as any,
                latencyMs: Date.now() - startTime,
                isError: !result.success,
                errorMessage: result.error,
              },
            });
          } catch (logErr) {
            console.warn('[MCPExecutor] Failed to write trace log:', logErr);
          }
        }

        if (result.success) {
          return result;
        }

        lastError = result.error || 'Unknown tool failure';
      } catch (err: any) {
        lastError = err?.message || 'Execution exception thrown';
      }

      if (attempt <= maxRetries && tool.riskLevel === 'READ_ONLY') {
        const sleepMs = backoffFactor * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, sleepMs));
      } else {
        break;
      }
    }

    return {
      success: false,
      error: `Failed after ${attempt} attempt(s): ${lastError}`,
    };
  }
}
