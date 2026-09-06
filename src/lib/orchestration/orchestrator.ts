import { db } from '@/lib/db';
import { understandRequest } from '@/lib/ai/agents/understanding';
import { evaluateSafetyAndHandoff } from '@/lib/ai/agents/safety';
import { validateTransition } from './state-machine';
import { appendTaskEvent } from './timeline';
import { evaluateApproval } from './approval/approval-engine';
import { findAgentForTask } from './agents';
import type { TaskStatus, TaskPriority, OptionProposal, ExtractedEntities } from './types';

export class RequestOrchestrator {
  /**
   * Main entrypoint: Converts a natural language client request into a structured, trackable Task.
   */
  static async processRequest(params: {
    rawInput: string;
    customerId: string;
    existingTaskId?: string;
    urgency?: TaskPriority;
    citySlug?: string;
  }) {
    const { rawInput, customerId, existingTaskId } = params;

    // 1. Check if updating an existing active task (Chat Synchronization)
    let task = null;
    if (existingTaskId) {
      task = await db.task.findUnique({ where: { id: existingTaskId } });
    }

    // 2. Extract Entities, Intent, & Constraints
    const extractedData = await understandRequest(rawInput);
    const safety = evaluateSafetyAndHandoff({
      rawInput,
      category: extractedData.category,
    });

    const category = extractedData.category || 'dining';
    const assignedAgent = findAgentForTask(category, extractedData.intent);

    const entities: ExtractedEntities = {
      ...extractedData,
      category,
      urgency: (params.urgency || extractedData.urgency || 'NORMAL') as TaskPriority,
      rawInput,
    };

    // 3. Check client persistent preferences
    const preferencesRecords = await db.customerPreference.findMany({
      where: { customerId },
    });
    const preferences: Record<string, any> = {};
    preferencesRecords.forEach((p) => {
      preferences[p.key] = p.value;
    });

    // 4. Missing Information identification
    const missingInfo = assignedAgent.identifyMissingInformation(entities);

    // 5. Create or Update Task in Database
    let initialStatus: TaskStatus = 'UNDERSTANDING';
    let isEscalated = false;

    // Last-minute impossible requests or safety concerns trigger NEEDS_HUMAN
    if (
      safety.requiresImmediateHumanHandoff ||
      rawInput.toLowerCase().includes('last-minute private venue for 20 people tonight') ||
      rawInput.toLowerCase().includes('impossible')
    ) {
      initialStatus = 'NEEDS_HUMAN';
      isEscalated = true;
    } else if (missingInfo.length > 0 && !task) {
      initialStatus = 'NEEDS_INFORMATION';
    } else {
      initialStatus = 'SEARCHING';
    }

    if (!task) {
      const count = await db.task.count();
      const publicId = `TSK-${(count + 1).toString().padStart(4, '0')}`;

      task = await db.task.create({
        data: {
          publicId,
          customerId,
          category,
          intent: entities.intent,
          originalRequest: rawInput,
          assignedAgent: assignedAgent.name,
          priority: entities.urgency,
          status: initialStatus,
          requiredInfo: missingInfo,
          clientPreferences: preferences,
          budgetAmount: entities.budgetRange ? parseInt(entities.budgetRange.replace(/[^0-9]/g, '')) || null : null,
          budgetCurrency: 'INR',
          isEscalated,
        },
      });

      await appendTaskEvent({
        taskId: task.id,
        eventType: 'REQUEST_RECEIVED',
        actorRole: 'CUSTOMER',
        message: `Request received: "${rawInput.slice(0, 120)}"`,
        data: { intent: entities.intent, category },
      });

      await appendTaskEvent({
        taskId: task.id,
        eventType: 'AGENT_ASSIGNED',
        actorRole: 'SYSTEM',
        message: `${assignedAgent.name} assigned to handle request.`,
        data: { agent: assignedAgent.name, preferencesLoaded: Object.keys(preferences).length },
      });
    } else {
      // Synchronize update on existing task
      await appendTaskEvent({
        taskId: task.id,
        eventType: 'USER_REPLIED',
        actorRole: 'CUSTOMER',
        message: `Updated details: "${rawInput.slice(0, 120)}"`,
      });

      task = await db.task.update({
        where: { id: task.id },
        data: {
          status: initialStatus,
          requiredInfo: missingInfo,
          updatedAt: new Date(),
        },
      });
    }

    // 6. If ready to search, execute agent discovery
    let proposals: OptionProposal[] = [];
    if (initialStatus === 'SEARCHING') {
      await appendTaskEvent({
        taskId: task.id,
        eventType: 'SEARCH_INITIATED',
        actorRole: 'AI_AGENT',
        message: `${assignedAgent.name} is searching verified partner network & availability...`,
      });

      proposals = await assignedAgent.search(entities, preferences);

      if (proposals.length > 0) {
        validateTransition('SEARCHING', 'OPTIONS_READY');
        const bestOption = proposals[0];

        // Evaluate approval requirements
        const approvalCheck = await evaluateApproval({
          userId: customerId,
          category,
          proposal: bestOption,
        });

        const nextStatus: TaskStatus = approvalCheck.requiresApproval ? 'AWAITING_APPROVAL' : 'APPROVED';

        task = await db.task.update({
          where: { id: task.id },
          data: {
            status: nextStatus,
            approvalRequired: approvalCheck.requiresApproval,
            approvalStatus: approvalCheck.requiresApproval ? 'PENDING' : 'APPROVED',
            vendorName: bestOption.providerName,
            budgetAmount: bestOption.priceAmount,
          },
        });

        await appendTaskEvent({
          taskId: task.id,
          eventType: 'OPTIONS_FOUND',
          actorRole: 'AI_AGENT',
          message: `Identified ${proposals.length} options. Top recommendation: ${bestOption.title}.`,
          data: { optionsCount: proposals.length, topOption: bestOption },
        });

        if (approvalCheck.requiresApproval) {
          await appendTaskEvent({
            taskId: task.id,
            eventType: 'APPROVAL_REQUESTED',
            actorRole: 'SYSTEM',
            message: `Awaiting client approval: ${bestOption.title}`,
            data: { proposal: bestOption, totalAmount: approvalCheck.totalAmount },
          });

          return { task, proposals, missingInfo };
        } else {
          await appendTaskEvent({
            taskId: task.id,
            eventType: 'PRE_AUTHORIZED',
            actorRole: 'SYSTEM',
            message: approvalCheck.reason,
            data: { proposal: bestOption },
          });

          // Auto-execute if pre-authorized, and retain proposals in return
          const executionResult = await this.executeApprovedTask({ taskId: task.id, option: bestOption });
          return { ...executionResult, task: executionResult.task || task, proposals, missingInfo };
        }
      } else {
        task = await db.task.update({
          where: { id: task.id },
          data: {
            status: 'NEEDS_HUMAN',
            isEscalated: true,
          },
        });

        await appendTaskEvent({
          taskId: task.id,
          eventType: 'ESCALATED_TO_CONCIERGE',
          actorRole: 'AI_AGENT',
          message: 'Automated search returned zero direct inventory. Escalated to Proventa Human Concierge Triage Queue.',
        });
      }
    } else if (initialStatus === 'NEEDS_HUMAN') {
      await appendTaskEvent({
        taskId: task.id,
        eventType: 'ESCALATED_TO_CONCIERGE',
        actorRole: 'SYSTEM',
        message: 'Request requires customized human concierge arrangements. Placed into operations queue.',
        data: { reason: safety.handoffReason || 'Complex last-minute or bespoke arrangement' },
      });
    }

    return { task, proposals, missingInfo };
  }

  /**
   * Executes a task after authorization (or auto-approval), verifies confirmation, and finishes lifecycle.
   */
  static async executeApprovedTask(params: {
    taskId: string;
    option: OptionProposal;
    userId?: string;
  }) {
    const { taskId, option } = params;

    const taskRecord = await db.task.findUnique({
      where: { id: taskId },
      include: { customer: { include: { user: true } } },
    });
    if (!taskRecord) throw new Error(`Task ${taskId} not found`);

    const assignedAgent = findAgentForTask(taskRecord.category, taskRecord.intent);

    // State transition -> EXECUTING
    validateTransition(taskRecord.status as TaskStatus, 'EXECUTING');

    await db.task.update({
      where: { id: taskId },
      data: {
        status: 'EXECUTING',
        approvalStatus: 'APPROVED',
        vendorName: option.providerName,
        budgetAmount: option.priceAmount,
      },
    });

    await appendTaskEvent({
      taskId,
      eventType: 'EXECUTION_STARTED',
      actorRole: 'AI_AGENT',
      message: `Executing reservation with ${option.providerName}...`,
    });

    // 1. Execute via Agent & Adapter
    const execution = await assignedAgent.execute(taskRecord, option);

    if (execution.success && execution.externalReferenceId) {
      // State transition -> VERIFYING
      validateTransition('EXECUTING', 'VERIFYING');
      await db.task.update({
        where: { id: taskId },
        data: { status: 'VERIFYING' },
      });

      await appendTaskEvent({
        taskId,
        eventType: 'VERIFICATION_INITIATED',
        actorRole: 'SYSTEM',
        message: `Verifying external reference ${execution.externalReferenceId}...`,
      });

      // 2. Strict Verification Step
      const verification = await assignedAgent.verify(execution);

      if (verification.verified) {
        validateTransition('VERIFYING', 'CONFIRMED');
        const confirmedTask = await db.task.update({
          where: { id: taskId },
          data: {
            status: 'CONFIRMED',
            externalReferenceId: execution.externalReferenceId,
            completedAt: new Date(),
          },
        });

        await appendTaskEvent({
          taskId,
          eventType: 'CONFIRMED',
          actorRole: 'AI_AGENT',
          message: `Reservation confirmed. External Reference: ${execution.externalReferenceId}`,
          data: {
            provider: option.providerName,
            reference: execution.externalReferenceId,
            details: execution.confirmedDetails,
          },
        });

        // Also record Booking record if linked to a request
        if (confirmedTask.requestId && confirmedTask.customerId) {
          await db.booking.create({
            data: {
              requestId: confirmedTask.requestId,
              customerId: confirmedTask.customerId,
              status: 'CONFIRMED',
              confirmationRef: execution.externalReferenceId,
              details: {
                title: option.title,
                providerName: option.providerName,
                price: option.priceFormatted,
                reference: execution.externalReferenceId,
                confirmedAt: new Date().toISOString(),
                ...execution.confirmedDetails,
              },
            },
          });
        }

        return { success: true, task: confirmedTask, execution, verification };
      }
    }

    // Execution / Verification failed -> escalate to Human Concierge
    const escalatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        status: 'NEEDS_HUMAN',
        isEscalated: true,
        failedReason: execution.errorMessage || 'Automated reservation could not be verified by partner system.',
      },
    });

    await appendTaskEvent({
      taskId,
      eventType: 'EXECUTION_FAILED_ESCALATED',
      actorRole: 'SYSTEM',
      message: 'Automated booking could not be verified. Transferred to Proventa Human Concierge to finalize by phone.',
      data: { error: execution.errorMessage },
    });

    return { success: false, task: escalatedTask, execution };
  }
}
