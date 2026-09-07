import type { AgentPermission, ToolRiskLevel } from '../permissions/permissions';
import { checkAgentPermission } from '../permissions/permissions';
import { ToolRegistry, type AgentTool } from '../registry/tool-registry';
import type { ClientMemoryContext } from '../memory/agent-memory';
import { AgentKnowledgeBase, type OperatingRule } from '../knowledge/knowledge-base';
import type { OptionProposal, ExecutionOutput, VerificationResult, ExtractedEntities } from '@/lib/orchestration/types';

export interface AgentObservation {
  taskId: string;
  publicId?: string;
  category: string;
  originalRequest: string;
  entities: ExtractedEntities;
  clientMemory: ClientMemoryContext;
  operatingPolicy?: OperatingRule;
}

export interface AgentExecutionPlan {
  rationale: string;
  selectedTool: string;
  toolInput: any;
  riskLevel: ToolRiskLevel;
  requiredPermission: AgentPermission;
  needsApproval: boolean;
}

export abstract class ProventaBaseAgent {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly role: string;
  abstract readonly category: string;
  abstract readonly systemInstructions: string;
  abstract readonly capabilities: string[];
  abstract readonly limitations: string[];
  abstract readonly allowedTools: string[];
  abstract readonly permissions: AgentPermission[];

  /**
   * Evaluates if this agent is suitable for the given category & intent.
   */
  canHandle(category: string, intent?: string): boolean {
    return category.toLowerCase() === this.category.toLowerCase();
  }

  /**
   * Identifies missing parameters required before execution.
   */
  identifyMissingInformation(entities: ExtractedEntities): string[] {
    return [];
  }

  /**
   * Phase 1: OBSERVE
   */
  observe(params: {
    taskId: string;
    publicId?: string;
    category: string;
    originalRequest: string;
    entities: ExtractedEntities;
    clientMemory: ClientMemoryContext;
  }): AgentObservation {
    const policy = AgentKnowledgeBase.getOperatingPolicy(this.category);
    return {
      taskId: params.taskId,
      publicId: params.publicId,
      category: params.category,
      originalRequest: params.originalRequest,
      entities: params.entities,
      clientMemory: params.clientMemory,
      operatingPolicy: policy,
    };
  }

  /**
   * Phase 2 & 3: UNDERSTAND & PLAN
   */
  abstract formulatePlan(observation: AgentObservation): Promise<AgentExecutionPlan>;

  /**
   * Phase 4: CHECK PERMISSIONS
   */
  checkPermissions(plan: AgentExecutionPlan): { allowed: boolean; reason?: string; requiresClientApproval?: boolean } {
    if (!this.allowedTools.includes(plan.selectedTool)) {
      return {
        allowed: false,
        reason: `Tool '${plan.selectedTool}' is not permitted for agent '${this.name}'. Allowed: ${this.allowedTools.join(', ')}`,
      };
    }

    return checkAgentPermission(this.category, plan.requiredPermission, plan.riskLevel);
  }

  /**
   * Phase 5 & 6: SELECT TOOL & EXECUTE
   */
  async executeTool(plan: AgentExecutionPlan, context?: { customerId?: string; taskId?: string }): Promise<any> {
    const tool = ToolRegistry.getTool(plan.selectedTool);
    if (!tool) {
      throw new Error(`Tool '${plan.selectedTool}' not found in ToolRegistry.`);
    }

    // Validate inputs against Zod schema
    const parsedInput = tool.inputSchema.parse(plan.toolInput);
    return tool.execute(parsedInput, context);
  }

  /**
   * Phase 7: VERIFY
   */
  async verifyResult(execution: any): Promise<VerificationResult> {
    if (!execution) {
      return {
        verified: false,
        status: 'FAILED',
        isMock: false,
        verifiedAt: new Date(),
        auditTrail: 'Empty execution response received.',
      };
    }

    const ref = execution.externalReferenceId || execution.confirmedDetails?.reference;
    const isMock = execution.isMock || (ref && ref.startsWith('[MOCK]'));

    if (!ref) {
      return {
        verified: false,
        status: 'PENDING',
        isMock: false,
        verifiedAt: new Date(),
        auditTrail: 'Awaiting provider reference verification.',
      };
    }

    return {
      verified: true,
      status: 'CONFIRMED',
      confirmationReference: ref,
      isMock: Boolean(isMock),
      verifiedAt: new Date(),
      auditTrail: `Confirmed via ${execution.providerName || 'Provider Desk'} [Ref: ${ref}]`,
      details: execution.confirmedDetails,
    };
  }
}
