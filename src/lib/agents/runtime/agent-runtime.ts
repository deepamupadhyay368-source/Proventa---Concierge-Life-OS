import { db } from '@/lib/db';
import type { ProventaBaseAgent, AgentObservation, AgentExecutionPlan } from './base-agent';
import { AgentMemoryManager } from '../memory/agent-memory';
import { appendTaskEvent } from '@/lib/orchestration/timeline';
import { validateTransition } from '@/lib/orchestration/state-machine';
import type { ExtractedEntities, TaskStatus, VerificationResult } from '@/lib/orchestration/types';

export interface RuntimeExecutionResult {
  success: boolean;
  step: 'OBSERVE' | 'UNDERSTAND' | 'PLAN' | 'CHECK_PERMISSIONS' | 'SELECT_TOOL' | 'EXECUTE' | 'VERIFY' | 'UPDATE_TASK' | 'COMPLETED';
  taskStatus: TaskStatus;
  plan?: AgentExecutionPlan;
  output?: any;
  verification?: VerificationResult;
  error?: string;
  isEscalated?: boolean;
}

export class AgentRuntime {
  /**
   * Executes the strict 9-step deterministic agent loop for a given task and assigned agent.
   */
  static async runAgentLoop(params: {
    taskId: string;
    agent: ProventaBaseAgent;
    entities: ExtractedEntities;
    originalRequest: string;
    customerId: string;
    autoExecuteIfApproved?: boolean;
  }): Promise<RuntimeExecutionResult> {
    const { taskId, agent, entities, originalRequest, customerId, autoExecuteIfApproved } = params;
    const startTime = Date.now();

    try {
      // 1. OBSERVE
      const clientMemory = await AgentMemoryManager.getClientContext(customerId);
      const observation = agent.observe({
        taskId,
        category: agent.category,
        originalRequest,
        entities,
        clientMemory,
      });

      // 2. UNDERSTAND: Check for missing information
      const missingInfo = agent.identifyMissingInformation(entities);
      if (missingInfo.length > 0) {
        await db.task.update({
          where: { id: taskId },
          data: {
            status: 'NEEDS_INFORMATION',
            requiredInfo: missingInfo,
          },
        });
        await appendTaskEvent({
          taskId,
          eventType: 'CLARIFICATION_REQUESTED',
          actorRole: 'AI_AGENT',
          message: `Missing required details: ${missingInfo.join(', ')}`,
          data: { missingInfo },
        });

        return {
          success: false,
          step: 'UNDERSTAND',
          taskStatus: 'NEEDS_INFORMATION',
          error: `Missing parameters: ${missingInfo.join(', ')}`,
        };
      }

      // 3. PLAN
      const plan = await agent.formulatePlan(observation);
      await appendTaskEvent({
        taskId,
        eventType: 'AGENT_ASSIGNED',
        actorRole: 'AI_AGENT',
        message: `Plan formulated: ${plan.rationale}`,
        data: { tool: plan.selectedTool, riskLevel: plan.riskLevel },
      });

      // 4. CHECK PERMISSIONS
      const permCheck = agent.checkPermissions(plan);
      if (!permCheck.allowed) {
        // Unpermitted tool -> escalate to human concierge
        await db.task.update({
          where: { id: taskId },
          data: { status: 'NEEDS_HUMAN', isEscalated: true },
        });
        await appendTaskEvent({
          taskId,
          eventType: 'STATUS_CHANGED',
          actorRole: 'SYSTEM',
          message: `Permission blocked: ${permCheck.reason}. Escalated to human concierge triage.`,
        });
        return {
          success: false,
          step: 'CHECK_PERMISSIONS',
          taskStatus: 'NEEDS_HUMAN',
          isEscalated: true,
          error: permCheck.reason,
        };
      }

      // 5. SELECT TOOL & PREPARE
      if (plan.needsApproval && !autoExecuteIfApproved) {
        // Needs client approval before execution
        await db.task.update({
          where: { id: taskId },
          data: {
            status: 'AWAITING_APPROVAL',
            approvalRequired: true,
          },
        });
        await appendTaskEvent({
          taskId,
          eventType: 'APPROVAL_REQUESTED',
          actorRole: 'AI_AGENT',
          message: `Authorization requested for ${plan.selectedTool} (${plan.riskLevel} risk).`,
          data: { tool: plan.selectedTool, input: plan.toolInput },
        });

        return {
          success: true,
          step: 'SELECT_TOOL',
          taskStatus: 'AWAITING_APPROVAL',
          plan,
        };
      }

      // 6. EXECUTE
      await db.task.update({
        where: { id: taskId },
        data: { status: 'EXECUTING' },
      });
      await appendTaskEvent({
        taskId,
        eventType: 'STATUS_CHANGED',
        actorRole: 'AI_AGENT',
        message: `Executing tool ${plan.selectedTool}...`,
      });

      const rawExecution = await agent.executeTool(plan, { customerId, taskId });

      // 7. VERIFY
      const verification = await agent.verifyResult(rawExecution);

      // 8. UPDATE TASK & RECORD TELEMETRY
      const latencyMs = Date.now() - startTime;
      await db.agentRunRecord.create({
        data: {
          taskId,
          agentName: agent.name,
          toolsCalled: [plan.selectedTool],
          inputState: plan.toolInput,
          outputState: rawExecution,
          latencyMs,
          success: verification.verified,
        },
      });

      if (!verification.verified) {
        // Escalation on failed verification
        await db.task.update({
          where: { id: taskId },
          data: { status: 'NEEDS_HUMAN', isEscalated: true },
        });
        await appendTaskEvent({
          taskId,
          eventType: 'FAILED',
          actorRole: 'SYSTEM',
          message: `Verification failed: ${verification.auditTrail}. Escalated to concierge desk.`,
        });
        return {
          success: false,
          step: 'VERIFY',
          taskStatus: 'NEEDS_HUMAN',
          verification,
          isEscalated: true,
        };
      }

      // 9. COMPLETE
      await db.task.update({
        where: { id: taskId },
        data: {
          status: 'CONFIRMED',
          externalReferenceId: verification.confirmationReference,
          vendorName: rawExecution.providerName || agent.name,
          completedAt: new Date(),
        },
      });

      await appendTaskEvent({
        taskId,
        eventType: 'BOOKING_CONFIRMED',
        actorRole: 'AI_AGENT',
        message: `Task confirmed via ${rawExecution.providerName || agent.name} [Ref: ${verification.confirmationReference}]`,
        data: {
          reference: verification.confirmationReference,
          isMock: verification.isMock,
          details: verification.details,
        },
      });

      return {
        success: true,
        step: 'COMPLETED',
        taskStatus: 'CONFIRMED',
        plan,
        output: rawExecution,
        verification,
      };
    } catch (err: any) {
      // Catch-all escalation
      await db.task.update({
        where: { id: taskId },
        data: { status: 'NEEDS_HUMAN', isEscalated: true, failedReason: err.message },
      });
      await appendTaskEvent({
        taskId,
        eventType: 'FAILED',
        actorRole: 'SYSTEM',
        message: `Execution error: ${err.message}. Safely escalated to concierge desk.`,
      });

      return {
        success: false,
        step: 'EXECUTE',
        taskStatus: 'NEEDS_HUMAN',
        isEscalated: true,
        error: err.message,
      };
    }
  }
}
