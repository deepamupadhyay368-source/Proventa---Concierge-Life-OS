import { db } from '@/lib/db';
import { understandRequest } from '@/lib/ai/agents/understanding';
import { evaluateSafetyAndHandoff } from '@/lib/ai/agents/safety';
import { validateTransition } from './state-machine';
import { appendTaskEvent } from './timeline';
import { evaluateApproval } from './approval/approval-engine';
import { findAgentForTask } from './agents';
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp';
import { sendBookingConfirmationEmail } from '@/lib/email/sender';
import { TaskDecisionEngine, CapabilityRegistry } from '@/lib/capabilities';
import { ExecutionRouter } from '@/lib/capabilities/execution-router';
import { EntityIntegrityValidator } from '@/lib/validation/entity-integrity';
import type { TaskStatus, TaskPriority, OptionProposal, ExtractedEntities, ProposalBatch } from './types';

export class RequestOrchestrator {
  /**
   * Fast persistence entrypoint: Creates the task in the database immediately (<150ms).
   * Ensures zero dropped requests, zero frozen buttons, and instant task ID return to the client.
   */
  static async createInitialTask(params: {
    rawInput: string;
    customerId: string;
    urgency?: TaskPriority;
  }) {
    const { rawInput, customerId, urgency } = params;
    const count = await db.task.count();
    const baseCandidate = `TSK-${(count + 1).toString().padStart(4, '0')}`;
    const existing = await db.task.findUnique({ where: { publicId: baseCandidate } });
    const publicId = existing
      ? `TSK-${(count + 1).toString().padStart(4, '0')}-${Date.now().toString(36).slice(-4).toUpperCase()}`
      : baseCandidate;

    const lower = rawInput.toLowerCase();
    let category = 'bespoke_requests';
    if (lower.includes('flight') || lower.includes('fly') || lower.includes('airline') || lower.includes('airport')) category = 'travel';
    else if (lower.includes('dine') || lower.includes('dinner') || lower.includes('lunch') || lower.includes('restaurant') || lower.includes('table')) category = 'dining';
    else if (lower.includes('hotel') || lower.includes('stay') || lower.includes('resort') || lower.includes('villa') || lower.includes('suite')) category = 'hotels_accommodation';
    else if (lower.includes('cab') || lower.includes('chauffeur') || lower.includes('car') || lower.includes('transfer')) category = 'mobility_transport';
    else if (lower.includes('gift') || lower.includes('flower') || lower.includes('present')) category = 'gifts_shopping';
    else if (lower.includes('event') || lower.includes('concert') || lower.includes('ticket') || lower.includes('show')) category = 'events_experiences';
    else if (lower.includes('spa') || lower.includes('salon') || lower.includes('massage') || lower.includes('wellness') || lower.includes('doctor')) category = 'health_wellness';

    const executionResolution = ExecutionRouter.resolveExecutionMode({
      rawInput,
      category,
    });

    const task = await db.task.create({
      data: {
        publicId,
        customerId,
        category,
        intent: rawInput.length > 80 ? `${rawInput.slice(0, 77)}...` : rawInput,
        originalRequest: rawInput,
        assignedAgent: 'Senior Concierge Desk',
        priority: (urgency || 'NORMAL') as TaskPriority,
        status: 'UNDERSTANDING',
        executionMethod: executionResolution.executionMethod,
        clientPreferences: {
          executionTier: executionResolution.tier,
          executionReason: executionResolution.reason,
          providerStatus: executionResolution.providerStatus,
          providerConsidered: executionResolution.providerConsidered,
          customerStatusMessage: executionResolution.customerStatusMessage,
          preparedContext: executionResolution.preparedContext,
        },
      },
    });

    await appendTaskEvent({
      taskId: task.id,
      eventType: 'REQUEST_RECEIVED',
      actorRole: 'CUSTOMER',
      message: 'Request received. Your concierge is reviewing it.',
      data: { originalRequest: rawInput },
    });

    await appendTaskEvent({
      taskId: task.id,
      eventType: 'EXECUTION_MODE_RESOLVED',
      actorRole: 'SYSTEM',
      message: `Execution tier resolved: ${executionResolution.tier} — ${executionResolution.reason}`,
      data: {
        tier: executionResolution.tier,
        executionMethod: executionResolution.executionMethod,
        providerStatus: executionResolution.providerStatus,
        providerConsidered: executionResolution.providerConsidered,
      },
    });

    return task;
  }

  /**
   * Main entrypoint: Converts a natural language client request into a structured, trackable Task.
   * Understands -> Classifies -> Researches -> Proposes -> Gates Behind Approval -> Executes/Handoffs.
   */
  static async processRequest(params: {
    rawInput: string;
    customerId: string;
    existingTaskId?: string;
    urgency?: TaskPriority;
    citySlug?: string;
  }) {
    const { rawInput, customerId, existingTaskId } = params;

    // 1. Check if updating an existing active task (Chat Synchronization or fast-persisted task)
    let task = null;
    if (existingTaskId) {
      task = await db.task.findUnique({ where: { id: existingTaskId } });
    }

    // 2. Extract Entities, Structured Intent, & Capabilities
    const extractedData = await understandRequest(rawInput);
    const decision = TaskDecisionEngine.evaluate({
      rawInput,
      category: extractedData.category,
      objective: extractedData.objective,
      destination: extractedData.destination,
      location: extractedData.location,
      partySize: extractedData.partySize,
      budgetRange: extractedData.budgetRange,
      executionRequired: extractedData.executionRequired,
    });

    const safety = evaluateSafetyAndHandoff({
      rawInput,
      category: decision.category.toLowerCase(),
    });

    const category = decision.category.toLowerCase();
    const assignedAgent = findAgentForTask(category, extractedData.intent);

    const entities: ExtractedEntities = {
      ...extractedData,
      category,
      urgency: (params.urgency || extractedData.urgency || 'NORMAL') as TaskPriority,
      rawInput,
    };

    // 3. Check client persistent preferences
    const preferencesRecords = (await db.customerPreference?.findMany?.({
      where: { customerId },
    })) || [];
    const preferences: Record<string, any> = {};
    preferencesRecords.forEach((p: any) => {
      preferences[p.key] = p.value;
    });

    // 4. Missing Information identification
    const missingInfo = assignedAgent.identifyMissingInformation(entities);

    // 5. Determine Initial Lifecycle Status based on Decision Engine & Safety
    let initialStatus: TaskStatus = 'UNDERSTANDING';
    let isEscalated = false;
    let failedReason: string | null = null;

    if (decision.isProhibited || decision.executionMode === 'UNSUPPORTED') {
      // Graceful rejection for unsupported or unlawful mandates
      initialStatus = 'CANCELLED';
      failedReason = decision.explanation;
    } else if (
      safety.requiresImmediateHumanHandoff ||
      rawInput.toLowerCase().includes('last-minute private venue for 20 people tonight') ||
      rawInput.toLowerCase().includes('impossible') ||
      (decision.executionMode === 'HUMAN_CONCIERGE' && (rawInput.toLowerCase().includes('call ') || rawInput.toLowerCase().includes('specific table')))
    ) {
      // Immediate human concierge escalation
      initialStatus = 'NEEDS_HUMAN';
      isEscalated = true;
    } else if (missingInfo.length > 0 && !task) {
      initialStatus = 'NEEDS_INFORMATION';
    } else {
      initialStatus = 'SEARCHING';
    }

    const executionResolution = ExecutionRouter.resolveExecutionMode({
      rawInput,
      category: decision.category,
      objective: decision.objective,
      extractedData,
      preferences,
      capability: decision.capability,
    });

    if (!task) {
      const count = await db.task.count();
      const baseCandidate = `TSK-${(count + 1).toString().padStart(4, '0')}`;
      const existing = await db.task.findUnique({ where: { publicId: baseCandidate } });
      const publicId = existing
        ? `TSK-${(count + 1).toString().padStart(4, '0')}-${Date.now().toString(36).slice(-4).toUpperCase()}`
        : baseCandidate;

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
          clientPreferences: {
            ...preferences,
            executionTier: executionResolution.tier,
            executionReason: executionResolution.reason,
            providerStatus: executionResolution.providerStatus,
            providerConsidered: executionResolution.providerConsidered,
            customerStatusMessage: executionResolution.customerStatusMessage,
            preparedContext: executionResolution.preparedContext,
          },
          budgetAmount: entities.budgetRange ? parseInt(entities.budgetRange.replace(/[^0-9]/g, '')) || null : null,
          budgetCurrency: 'INR',
          isEscalated,
          failedReason,
          executionMethod: executionResolution.executionMethod,
        },
      });

      await appendTaskEvent({
        taskId: task.id,
        eventType: 'REQUEST_RECEIVED',
        actorRole: 'CUSTOMER',
        message: 'Got it. I\'m understanding your request.',
        data: {
          intent: entities.intent,
          category: decision.category,
          objective: decision.objective,
          executionMode: decision.executionMode,
        },
      });

      await appendTaskEvent({
        taskId: task.id,
        eventType: 'EXECUTION_MODE_RESOLVED',
        actorRole: 'SYSTEM',
        message: `Execution tier resolved: ${executionResolution.tier} — ${executionResolution.reason}`,
        data: {
          tier: executionResolution.tier,
          executionMethod: executionResolution.executionMethod,
          providerStatus: executionResolution.providerStatus,
          providerConsidered: executionResolution.providerConsidered,
        },
      });

      await appendTaskEvent({
        taskId: task.id,
        eventType: 'AGENT_ASSIGNED',
        actorRole: 'SYSTEM',
        message: `${assignedAgent.name} assigned to handle request.`,
        data: {
          agent: assignedAgent.name,
          capabilityId: decision.capability.capabilityId,
          preferencesLoaded: Object.keys(preferences).length,
        },
      });
    } else {
      // Synchronize update on existing task
      await appendTaskEvent({
        taskId: task.id,
        eventType: 'USER_REPLIED',
        actorRole: 'CUSTOMER',
        message: `Updated details: "${rawInput.slice(0, 120)}"`,
      });

      const existingPrefs = (task.clientPreferences as Record<string, any>) || {};
      task = await db.task.update({
        where: { id: task.id },
        data: {
          category,
          intent: entities.intent || task.intent,
          status: initialStatus,
          requiredInfo: missingInfo,
          failedReason,
          budgetAmount: entities.budgetRange ? parseInt(entities.budgetRange.replace(/[^0-9]/g, '')) || task.budgetAmount : task.budgetAmount,
          executionMethod: executionResolution.executionMethod,
          clientPreferences: {
            ...existingPrefs,
            ...preferences,
            executionTier: executionResolution.tier,
            executionReason: executionResolution.reason,
            providerStatus: executionResolution.providerStatus,
            providerConsidered: executionResolution.providerConsidered,
            customerStatusMessage: executionResolution.customerStatusMessage,
            preparedContext: {
              ...(existingPrefs.preparedContext || {}),
              ...executionResolution.preparedContext,
            },
          },
          updatedAt: new Date(),
        },
      });

      await appendTaskEvent({
        taskId: task.id,
        eventType: 'EXECUTION_MODE_RESOLVED',
        actorRole: 'SYSTEM',
        message: `Execution tier resolved: ${executionResolution.tier} — ${executionResolution.reason}`,
        data: {
          tier: executionResolution.tier,
          executionMethod: executionResolution.executionMethod,
          providerStatus: executionResolution.providerStatus,
          providerConsidered: executionResolution.providerConsidered,
        },
      });
    }

    // 6. If request is unsupported or prohibited, record event and exit early
    if (initialStatus === 'CANCELLED') {
      await appendTaskEvent({
        taskId: task.id,
        eventType: 'REQUEST_UNSUPPORTED',
        actorRole: 'SYSTEM',
        message: decision.explanation,
        data: {
          suggestedAction: decision.suggestedAction,
          category: decision.category,
        },
      });
      return { task, proposals: [], missingInfo: [], decision };
    }

    // 7. If ready to search, execute agent discovery
    let proposals: OptionProposal[] = [];
    if (initialStatus === 'SEARCHING') {
      await appendTaskEvent({
        taskId: task.id,
        eventType: 'SEARCH_INITIATED',
        actorRole: 'AI_AGENT',
        message: 'I\'m finding verified options for you.',
        data: {
          executionMode: decision.executionMode,
          specialist: assignedAgent.name,
        },
      });

      proposals = await assignedAgent.search(entities, preferences);

      if (proposals.length > 0) {
        validateTransition('SEARCHING', 'OPTIONS_READY');
        const bestOption = proposals[0];

        // Evaluate approval requirements:
        // Any consequential action (booking, reservation, order, purchase) STRICTLY requires explicit approval.
        // Pure research/comparisons do not require booking approval.
        const isConsequential =
          decision.objective === 'BOOK' ||
          decision.objective === 'ARRANGE' ||
          entities.executionRequired === true;

        const approvalCheck = await evaluateApproval({
          userId: customerId,
          category,
          proposal: bestOption,
        });

        const requiresApproval = isConsequential || approvalCheck.requiresApproval || decision.approvalRequired;
        const nextStatus: TaskStatus = requiresApproval ? 'AWAITING_APPROVAL' : 'OPTIONS_READY';

        const currentPrefs = (task.clientPreferences as Record<string, any>) || {};
        const currentContext = currentPrefs.preparedContext || {};

        // Format exactly up to 5 options for Batch 1
        const batch1Options = proposals.slice(0, 5);
        const batchId = 'BATCH-001';
        const initialBatch: ProposalBatch = {
          batchId,
          batchNumber: 1,
          generatedAt: new Date().toISOString(),
          options: batch1Options,
          status: 'ACTIVE',
        };

        task = await db.task.update({
          where: { id: task.id },
          data: {
            status: nextStatus,
            proposedOptions: batch1Options as any,
            approvalRequired: requiresApproval,
            approvalStatus: requiresApproval ? 'PENDING' : 'APPROVED',
            vendorName: bestOption.providerName,
            budgetAmount: bestOption.priceAmount,
            clientPreferences: {
              ...currentPrefs,
              currentBatchId: batchId,
              batchHistory: [initialBatch],
              rejectedOptionIds: [],
              rejectedOptionKeys: [],
              preparedContext: {
                ...currentContext,
                proposedOptionsCount: batch1Options.length,
                batchId,
              },
            } as any,
          },
        });

        await appendTaskEvent({
          taskId: task.id,
          eventType: 'OPTIONS_FOUND',
          actorRole: 'AI_AGENT',
          message: 'I found these options for you.',
          data: {
            optionsCount: proposals.length,
            topOption: bestOption,
            executionMode: decision.executionMode,
          },
        });

        if (requiresApproval) {
          await appendTaskEvent({
            taskId: task.id,
            eventType: 'APPROVAL_REQUESTED',
            actorRole: 'SYSTEM',
            message: 'Choose an option to continue.',
            data: { proposal: bestOption, totalAmount: approvalCheck.totalAmount },
          });

          // Dispatch interactive mobile approval notification via WhatsApp
          try {
            const customer = await db.customerProfile.findUnique({
              where: { id: customerId },
              include: { user: true },
            });
            if (customer?.user?.phone) {
              await sendWhatsAppNotification({
                phone: customer.user.phone,
                template: 'INTERACTIVE_PROPOSAL',
                params: {
                  name: customer.user.name || 'Member',
                  details: bestOption.title,
                  actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tasks/${task.id}`,
                  options: proposals,
                },
              });
            }
          } catch (e) {
            console.error('[Orchestrator] WhatsApp dispatch notice failed:', e);
          }

          return { task, proposals, missingInfo, decision };
        } else {
          // Research-only completed advisory
          await appendTaskEvent({
            taskId: task.id,
            eventType: 'RESEARCH_COMPLETED',
            actorRole: 'AI_AGENT',
            message: 'Research and curation complete. Ready for member review.',
            data: { optionsCount: proposals.length },
          });

          return { task, proposals, missingInfo, decision };
        }
      } else {
        // No direct inventory found -> escalate to Human Concierge
        const currentPrefs = (task.clientPreferences as Record<string, any>) || {};
        task = await db.task.update({
          where: { id: task.id },
          data: {
            status: 'NEEDS_HUMAN',
            executionMethod: 'HUMAN_CONCIERGE',
            isEscalated: true,
            clientPreferences: {
              ...currentPrefs,
              executionTier: 'ASSISTED',
              executionReason: 'Direct automated inventory unavailable. Structured context prepared for Senior Concierge Desk.',
            },
          },
        });

        await appendTaskEvent({
          taskId: task.id,
          eventType: 'ESCALATED_TO_CONCIERGE',
          actorRole: 'AI_AGENT',
          message: 'I\'ve received your request. Our concierge team is completing this for you.',
        });
      }
    } else if (initialStatus === 'NEEDS_HUMAN') {
      await appendTaskEvent({
        taskId: task.id,
        eventType: 'ESCALATED_TO_CONCIERGE',
        actorRole: 'SYSTEM',
        message: 'I\'ve received your request. Our concierge team is completing this for you.',
        data: { reason: safety.handoffReason || decision.explanation || 'Bespoke human concierge arrangement' },
      });
    }

    return { task, proposals, missingInfo, decision };
  }

  /**
   * Convenience wrapper to process an existing task by ID.
   */
  static async processTask(taskId: string) {
    const task = await db.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error(`Task ${taskId} not found`);
    const res = await this.processRequest({
      rawInput: task.originalRequest || task.intent,
      customerId: task.customerId,
      existingTaskId: task.id,
      urgency: task.priority as any,
    });
    return {
      success: true,
      task: res.task,
      proposals: (Array.isArray(res.task?.proposedOptions) && (res.task.proposedOptions as any[]).length > 0)
        ? (res.task.proposedOptions as any[])
        : res.proposals.slice(0, 5),
      missingInfo: res.missingInfo,
      decision: res.decision,
    };
  }

  /**
   * Executes a task after explicit customer authorization, verifies confirmation, and finishes lifecycle.
   * Consequential actions can only enter here via explicit customer approval.
   */
  static async executeApprovedTask(params: {
    taskId: string;
    option?: OptionProposal;
    optionId?: string;
    userId?: string;
  }) {
    let { taskId, option, optionId } = params;

    const taskRecord = await db.task.findUnique({
      where: { id: taskId },
      include: { customer: { include: { user: true } } },
    });
    if (!taskRecord) throw new Error(`Task ${taskId} not found`);

    // Defensive recovery: if optionId provided or option is missing, look up in taskRecord.proposedOptions
    if (!option && optionId && Array.isArray(taskRecord.proposedOptions)) {
      option = (taskRecord.proposedOptions as any[]).find((o: any) => o.id === optionId);
    }
    if (!option && Array.isArray(taskRecord.proposedOptions) && taskRecord.proposedOptions.length > 0) {
      option = (taskRecord.proposedOptions as any[])[0];
    }
    const selectedOpt = option;
    if (selectedOpt && !selectedOpt.providerId && Array.isArray(taskRecord.proposedOptions)) {
      const storedOption = (taskRecord.proposedOptions as any[]).find(
        (o: any) => o.id === selectedOpt.id || o.title === selectedOpt.title
      );
      if (storedOption?.providerId) {
        option = { ...selectedOpt, providerId: storedOption.providerId, venueId: storedOption.venueId };
      }
    }
    if (!option) {
      throw new Error('No option available to execute for this task');
    }

    // Pre-Execution Constraint Gate: Verify approved option matches original customer constraints
    const constraintCheck = EntityIntegrityValidator.verifyPreExecutionConstraints(taskRecord, option);
    if (!constraintCheck.isValid) {
      await appendTaskEvent({
        taskId: taskRecord.id,
        eventType: 'INTENT_CONSTRAINT_MISMATCH',
        actorRole: 'SYSTEM',
        message: constraintCheck.violationReason || 'Pre-execution constraint check failed.',
        data: {
          originalRequest: taskRecord.originalRequest,
          category: taskRecord.category,
          proposalTitle: option.title,
          proposalMetadata: option.metadata,
        },
      });

      await db.task.update({
        where: { id: taskId },
        data: {
          status: 'NEEDS_HUMAN',
          isEscalated: true,
          executionMethod: 'HUMAN_CONCIERGE',
          failedReason: constraintCheck.violationReason,
        },
      });

      throw new Error(constraintCheck.violationReason);
    }

    const assignedAgent = findAgentForTask(taskRecord.category, taskRecord.intent);

    // State transition -> EXECUTING
    validateTransition(taskRecord.status as TaskStatus, 'EXECUTING');

    await appendTaskEvent({
      taskId,
      eventType: 'CUSTOMER_APPROVED',
      actorRole: 'CUSTOMER',
      message: `Client approved option: ${option.title} (${option.providerName})`,
      data: {
        optionId: option.id,
        title: option.title,
        providerName: option.providerName,
        priceFormatted: option.priceFormatted,
      },
    });

    const existingPrefs = (taskRecord.clientPreferences as Record<string, any>) || {};
    const batchHistory: ProposalBatch[] = Array.isArray(existingPrefs.batchHistory) ? [...existingPrefs.batchHistory] : [];
    const updatedHistory = batchHistory.map((b) => {
      if (b.status === 'ACTIVE' || b.options.some((o) => o.id === option.id)) {
        return { ...b, status: 'APPROVED' as const, approvedOptionId: option.id };
      }
      return b;
    });

    // Handle Non-Booking Deliverables (Research, Curation, Advisory, Planning)
    const nonBookingCategories = [
      'research',
      'curation',
      'advisory',
      'planning',
      'inquiry',
      'general',
      'education',
      'gift',
      'itinerary',
    ];
    const catLower = (taskRecord.category || '').toLowerCase();
    const isNonBooking =
      nonBookingCategories.includes(catLower) ||
      Boolean(option.metadata?.isDeliverable) ||
      Boolean(option.metadata?.deliverableType) ||
      option.bookingMethod === 'DELIVERABLE' ||
      option.bookingMethod === 'CURATION';

    if (isNonBooking) {
      validateTransition('EXECUTING', 'COMPLETED');
      const deliverableContent =
        option.description ||
        option.metadata?.deliverableContent ||
        option.metadata?.report ||
        option.metadata?.reportText ||
        option.metadata?.content ||
        `Curated Deliverable for ${taskRecord.intent || taskRecord.originalRequest}: ${option.title}.`;

      const deliverable = {
        title: option.title,
        category: taskRecord.category,
        providerName: option.providerName || 'Proventa Concierge',
        content: deliverableContent,
        metadata: option.metadata || {},
        deliveredAt: new Date().toISOString(),
        status: 'FULFILLED',
      };

      const completedTask = await db.task.update({
        where: { id: taskId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          approvalStatus: 'APPROVED',
          vendorName: option.providerName,
          budgetAmount: option.priceAmount,
          clientPreferences: {
            ...existingPrefs,
            approvedOption: option as any,
            approvedAt: new Date().toISOString(),
            batchHistory: updatedHistory,
            deliverable,
          } as any,
        },
      });

      await appendTaskEvent({
        taskId,
        eventType: 'DELIVERABLE_PREPARED',
        actorRole: 'AI_AGENT',
        message: `Deliverable prepared: "${option.title}".`,
        data: { deliverableTitle: option.title },
      });

      await appendTaskEvent({
        taskId,
        eventType: 'TASK_COMPLETED',
        actorRole: 'SYSTEM',
        message: `Task completed. Deliverable delivered to client.`,
        data: { deliverableTitle: option.title },
      });

      try {
        if (taskRecord.customer?.user?.email) {
          await sendBookingConfirmationEmail({
            email: taskRecord.customer.user.email,
            name: taskRecord.customer.user.name || 'Valued Member',
            title: option.title,
            reference: `DLV-${taskRecord.publicId || taskId.slice(-6).toUpperCase()}`,
            vendor: option.providerName || 'Proventa Concierge',
            notes: deliverableContent,
            actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in'}/tasks/${taskId}`,
          });
        }
      } catch (e) {
        console.error('[Orchestrator] Deliverable notification error:', e);
      }

      return {
        success: true,
        status: 'COMPLETED',
        task: completedTask,
        deliverable,
        message: 'Your deliverable has been curated and completed.',
      };
    }

    await db.task.update({
      where: { id: taskId },
      data: {
        status: 'EXECUTING',
        approvalStatus: 'APPROVED',
        vendorName: option.providerName,
        budgetAmount: option.priceAmount,
        clientPreferences: {
          ...existingPrefs,
          approvedOption: option as any,
          approvedAt: new Date().toISOString(),
          batchHistory: updatedHistory,
        } as any,
      },
    });

    await appendTaskEvent({
      taskId,
      eventType: 'EXECUTION_STARTED',
      actorRole: 'AI_AGENT',
      message: `Executing reservation with ${option.providerName}...`,
    });

    // 1. Execute via Agent & Adapter (resolved strictly by providerId)
    const execution = await assignedAgent.execute(taskRecord, option);

    // 1a. Handle Phone Booking / Concierge Call Workflow (e.g. Ahmedabad Verified Network or offline venue)
    if (
      execution.status === 'AWAITING_CONCIERGE_CALL' ||
      execution.confirmedDetails?.status === 'AWAITING_CONCIERGE_CALL' ||
      option.bookingMethod === 'PHONE'
    ) {
      validateTransition(taskRecord.status as TaskStatus, 'NEEDS_HUMAN');
      const existingPrefs = (taskRecord.clientPreferences as Record<string, any>) || {};
      const pendingTask = await db.task.update({
        where: { id: taskId },
        data: {
          status: 'NEEDS_HUMAN',
          executionMethod: 'HUMAN_CONCIERGE',
          isEscalated: true,
          approvalStatus: 'APPROVED',
          failedReason: null,
          vendorName: option.providerName || taskRecord.vendorName,
          budgetAmount: option.priceAmount || taskRecord.budgetAmount,
          clientPreferences: {
            ...existingPrefs,
            approvedOption: option as any,
            approvedAt: new Date().toISOString(),
            executionTier: 'ASSISTED',
            handoffMessage: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
          } as any,
        },
      });

      const dispatch = execution.confirmedDetails?.dispatchPayload || execution.confirmedDetails;
      await appendTaskEvent({
        taskId,
        eventType: 'AWAITING_CONCIERGE_CALL',
        actorRole: 'AI_AGENT',
        message: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
        data: {
          providerId: execution.providerId || option.providerId,
          dispatchPayload: dispatch,
        },
      });

      // Dispatch notification to customer informing them of personal concierge placement
      try {
        if (taskRecord.customer?.user?.phone) {
          await sendWhatsAppNotification({
            phone: taskRecord.customer.user.phone,
            template: 'AWAITING_CONCIERGE_CALL',
            params: {
              name: taskRecord.customer.user.name || 'Member',
              details: `${option.title} (${option.providerName})`,
              actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tasks/${taskId}`,
            },
          });
        }
      } catch (e) {
        console.error('[Orchestrator] Concierge dispatch notice failed:', e);
      }

      return {
        success: true,
        status: 'NEEDS_HUMAN',
        handedToConcierge: true,
        task: pendingTask,
        execution,
        message: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
      };
    }

    // 1b. Safety Guard: When automated execution is simulated, mock, or sandbox, seamlessly
    // transition to Human Concierge execution. Never generate synthetic references and never reject the customer's task.
    if (execution.isMock || execution.environment === 'SANDBOX') {
      validateTransition(taskRecord.status as TaskStatus, 'NEEDS_HUMAN');
      const existingPrefs = (taskRecord.clientPreferences as Record<string, any>) || {};
      const escalatedTask = await db.task.update({
        where: { id: taskId },
        data: {
          status: 'NEEDS_HUMAN',
          executionMethod: 'HUMAN_CONCIERGE',
          isEscalated: true,
          approvalStatus: 'APPROVED',
          failedReason: null,
          vendorName: option.providerName || taskRecord.vendorName,
          budgetAmount: option.priceAmount || taskRecord.budgetAmount,
          clientPreferences: {
            ...existingPrefs,
            approvedOption: option as any,
            approvedAt: new Date().toISOString(),
            executionTier: 'ASSISTED',
            handoffMessage: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
          } as any,
        },
      });

      await appendTaskEvent({
        taskId,
        eventType: 'AWAITING_CONCIERGE_EXECUTION',
        actorRole: 'CONCIERGE',
        message: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
        data: {
          providerId: execution.providerId,
          environment: execution.environment,
          optionTitle: option.title,
          optionProvider: option.providerName,
        },
      });

      try {
        if (taskRecord.customer?.user?.phone) {
          await sendWhatsAppNotification({
            phone: taskRecord.customer.user.phone,
            template: 'AWAITING_CONCIERGE_CALL',
            params: {
              name: taskRecord.customer.user.name || 'Member',
              details: `${option.title} (${option.providerName})`,
              actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tasks/${taskId}`,
            },
          });
        }
      } catch (e) {
        console.error('[Orchestrator] Concierge dispatch notice failed:', e);
      }

      return {
        success: true,
        status: 'NEEDS_HUMAN',
        handedToConcierge: true,
        task: escalatedTask,
        execution,
        message: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
      };
    }

    if (execution.success && execution.externalReferenceId) {
      // Validate externalReferenceId does not contain synthetic markers
      const upperRef = (execution.externalReferenceId || '').toUpperCase();
      if (
        upperRef.startsWith('PV-') ||
        upperRef.startsWith('MOCK-') ||
        upperRef.startsWith('TEST-') ||
        upperRef.startsWith('DEMO-') ||
        upperRef.startsWith('FAKE-') ||
        upperRef.includes('SANDBOX')
      ) {
        // Escalate to Human Concierge instead of accepting synthetic reference
        validateTransition(taskRecord.status as TaskStatus, 'NEEDS_HUMAN');
        const escalatedTask = await db.task.update({
          where: { id: taskId },
          data: {
            status: 'NEEDS_HUMAN',
            executionMethod: 'HUMAN_CONCIERGE',
            isEscalated: true,
            approvalStatus: 'APPROVED',
            failedReason: null,
          },
        });
        await appendTaskEvent({
          taskId,
          eventType: 'AWAITING_CONCIERGE_EXECUTION',
          actorRole: 'SYSTEM',
          message: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
          data: { reason: 'SYNTHETIC_REFERENCE_PREVENTED' },
        });
        return {
          success: true,
          status: 'NEEDS_HUMAN',
          handedToConcierge: true,
          task: escalatedTask,
          execution,
          message: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
        };
      }

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

      // Guard: Mock or sandbox verifications must NEVER confirm
      if (verification.isMock || verification.environment === 'SANDBOX') {
        validateTransition('VERIFYING', 'NEEDS_HUMAN');
        const escalatedTask = await db.task.update({
          where: { id: taskId },
          data: {
            status: 'NEEDS_HUMAN',
            executionMethod: 'HUMAN_CONCIERGE',
            isEscalated: true,
            approvalStatus: 'APPROVED',
            failedReason: null,
          },
        });
        await appendTaskEvent({
          taskId,
          eventType: 'AWAITING_CONCIERGE_EXECUTION',
          actorRole: 'SYSTEM',
          message: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
          data: { providerId: execution.providerId },
        });
        return {
          success: true,
          handedToConcierge: true,
          task: escalatedTask,
          execution,
          verification,
          message: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
        };
      }

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
          message: `Done. Here's your confirmed booking. Reference: ${execution.externalReferenceId}`,
          data: {
            provider: option.providerName,
            reference: execution.externalReferenceId,
            details: execution.confirmedDetails,
          },
        });

        await appendTaskEvent({
          taskId,
          eventType: 'PROVIDER_CONFIRMED',
          actorRole: 'AI_AGENT',
          message: `Genuine provider confirmed booking with ${option.providerName}. Reference: ${execution.externalReferenceId}`,
          data: {
            provider: option.providerName,
            reference: execution.externalReferenceId,
            details: execution.confirmedDetails,
          },
        });

        // Record authoritative Booking record
        if (confirmedTask.customerId) {
          await db.booking.create({
            data: {
              requestId: confirmedTask.requestId || confirmedTask.id,
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

        // Dispatch confirmed pass to member's WhatsApp
        try {
          if (taskRecord.customer?.user?.phone) {
            await sendWhatsAppNotification({
              phone: taskRecord.customer.user.phone,
              template: 'BOOKING_CONFIRMED',
              params: {
                name: taskRecord.customer.user.name || 'Member',
                details: `${option.title} (${option.providerName}) · Ref: ${execution.externalReferenceId}`,
                actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tasks/${taskId}`,
              },
            });
          }
        } catch (e) {
          console.error('[Orchestrator] Confirmation notification error:', e);
        }

        // Dispatch confirmed pass to member's Email
        try {
          if (taskRecord.customer?.user?.email) {
            await sendBookingConfirmationEmail({
              email: taskRecord.customer.user.email,
              name: taskRecord.customer.user.name || 'Valued Member',
              title: option.title,
              reference: execution.externalReferenceId,
              vendor: option.providerName || 'Verified Partner Desk',
              notes: 'Your reservation has been confirmed with genuine partner confirmation reference.',
              actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in'}/tasks/${taskId}`,
            });
          }
        } catch (e) {
          console.error('[Orchestrator] Confirmation email error:', e);
        }

        return { success: true, task: confirmedTask, execution, verification };
      }
    }

    // Execution / Verification failed -> escalate to Human Concierge
    const escalatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        status: 'NEEDS_HUMAN',
        executionMethod: 'HUMAN_CONCIERGE',
        isEscalated: true,
        approvalStatus: 'APPROVED',
        failedReason: null,
      },
    });

    await appendTaskEvent({
      taskId,
      eventType: 'CONCIERGE_TAKEOVER',
      actorRole: 'SYSTEM',
      message: 'Your request is approved and has been handed to your Proventa Concierge for direct execution with the provider.',
      data: { error: execution.errorMessage },
    });

    return {
      success: true,
      status: 'NEEDS_HUMAN',
      handedToConcierge: true,
      task: escalatedTask,
      execution,
      message: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
    };
  }

  /**
   * Generates a stable deduplication and rejection key for an option.
   */
  static getOptionStableKey(opt: OptionProposal): string {
    const flightNo = opt.metadata?.flightNumber;
    const placeId = opt.metadata?.placeId || opt.venueId;
    const title = (opt.title || '').toLowerCase().trim();
    return `${opt.providerId || 'prov'}:${flightNo || placeId || title}`.toLowerCase().trim();
  }

  /**
   * Evaluates candidate options against historical exclusions, deduplicates,
   * validates entity integrity, hard constraints, and ranks using customer feedback cues.
   */
  static filterAndRankCandidates(params: {
    candidates: OptionProposal[];
    rejectedOptionIds: string[];
    rejectedOptionKeys: string[];
    constraints: {
      category?: string;
      destination?: string;
      destinationAirport?: string;
      origin?: string;
      originAirport?: string;
      location?: string;
      budget?: number | string;
      budgetAmount?: number;
      partySize?: number;
      dateTime?: string;
    };
    feedback?: string;
    preferences?: Record<string, any>;
  }): OptionProposal[] {
    const { candidates, rejectedOptionIds, rejectedOptionKeys, constraints, feedback, preferences } = params;

    const rejectedIdSet = new Set(rejectedOptionIds);
    const rejectedKeySet = new Set(rejectedOptionKeys.map((k) => k.toLowerCase().trim()));

    // 1. Remove previously rejected options across ALL historical batches
    const unrejected = candidates.filter((c) => {
      if (rejectedIdSet.has(c.id)) return false;
      const key = RequestOrchestrator.getOptionStableKey(c);
      if (rejectedKeySet.has(key)) return false;
      return true;
    });

    // 2. Remove duplicate options within the current candidate pool
    const seenKeys = new Set<string>();
    const deduplicated: OptionProposal[] = [];
    for (const c of unrejected) {
      const key = RequestOrchestrator.getOptionStableKey(c);
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        deduplicated.push(c);
      }
    }

    // 3. Entity Integrity Validation (origin, destination, airports, cities)
    const entityValid = EntityIntegrityValidator.filterProposalsByConstraints(deduplicated, constraints);

    // 4. Hard Constraints (Budget & Party Size)
    const hardConstraintValid = entityValid.filter((c) => {
      if (constraints.budgetAmount && constraints.budgetAmount > 0 && c.priceAmount) {
        if (c.priceAmount > constraints.budgetAmount * 1.35) return false;
      }
      return true;
    });

    const candidatePool = hardConstraintValid.length > 0 ? hardConstraintValid : entityValid;

    // 5. Rank with feedback refinement
    const ranked = [...candidatePool].sort((a, b) => {
      const fb = (feedback || '').toLowerCase();

      // Real provider over mock preference
      if (a.isMock === false && b.isMock === true) return -1;
      if (a.isMock === true && b.isMock === false) return 1;

      // Price-based feedback
      if (fb.includes('expensive') || fb.includes('budget') || fb.includes('cheap') || fb.includes('cost') || fb.includes('price')) {
        return (a.priceAmount || 0) - (b.priceAmount || 0);
      }

      // Luxury / Premium feedback
      if (fb.includes('luxury') || fb.includes('luxurious') || fb.includes('premium') || fb.includes('5-star') || fb.includes('five star')) {
        const aScore = a.metadata?.luxuryScore || (a.priceAmount || 0);
        const bScore = b.metadata?.luxuryScore || (b.priceAmount || 0);
        return bScore - aScore;
      }

      // Privacy / Seclusion / Boutique feedback
      if (fb.includes('private') || fb.includes('secluded') || fb.includes('boutique') || fb.includes('quiet') || fb.includes('discreet')) {
        const aPrivate = (a.metadata?.private || a.metadata?.secluded || a.metadata?.boutique) ? 1 : 0;
        const bPrivate = (b.metadata?.private || b.metadata?.secluded || b.metadata?.boutique) ? 1 : 0;
        if (aPrivate !== bPrivate) return bPrivate - aPrivate;
      }

      // Early timing feedback for flights / appointments
      if (fb.includes('early') || fb.includes('morning') || fb.includes('dawn')) {
        const aTime = a.metadata?.departureTime || '';
        const bTime = b.metadata?.departureTime || '';
        if (aTime && bTime) return aTime.localeCompare(bTime);
      }

      // Specific airline preferences
      if (fb.includes('vistara') || fb.includes('air india') || fb.includes('indigo') || fb.includes('akasa')) {
        const airlineKeyword = fb.includes('vistara') ? 'vistara' : fb.includes('indigo') ? 'indigo' : fb.includes('akasa') ? 'akasa' : 'air india';
        const aMatch = (a.providerName || a.title).toLowerCase().includes(airlineKeyword) ? 1 : 0;
        const bMatch = (b.providerName || b.title).toLowerCase().includes(airlineKeyword) ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
      }

      return 0;
    });

    return ranked;
  }

  /**
   * Perpetual Iterative 5-Option Recommendation Cycle:
   * Enables customers to reject full batches, replace individual options, partially reject,
   * or modify constraints across unlimited cycles with zero fabrication and complete audit history.
   */
  static async cycleOptionBatch(params: {
    taskId: string;
    userId?: string;
    action?: 'REJECT_ALL' | 'REPLACE_OPTION' | 'PARTIAL_REJECT' | 'MODIFY_REQUEST' | 'ASK_CONCIERGE';
    feedback?: string;
    replaceOptionId?: string;
    keptOptionIds?: string[];
    newRawInput?: string;
    newConstraints?: Record<string, any>;
  }): Promise<{
    success: boolean;
    status?: string;
    batch?: ProposalBatch;
    task: any;
    message: string;
    escalatedToConcierge?: boolean;
  }> {
    const { taskId, action = 'REJECT_ALL' } = params;

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: { customer: { include: { user: true } } },
    });

    if (!task) throw new Error('Task not found');

    const userId = params.userId || task.customer?.userId || task.customerId || 'system';

    const currentPrefs = (task.clientPreferences as Record<string, any>) || {};
    let batchHistory: ProposalBatch[] = Array.isArray(currentPrefs.batchHistory) ? [...currentPrefs.batchHistory] : [];
    let rejectedOptionIds: string[] = Array.isArray(currentPrefs.rejectedOptionIds) ? [...currentPrefs.rejectedOptionIds] : [];
    let rejectedOptionKeys: string[] = Array.isArray(currentPrefs.rejectedOptionKeys) ? [...currentPrefs.rejectedOptionKeys] : [];
    let currentOptions: OptionProposal[] = Array.isArray(task.proposedOptions) ? [...(task.proposedOptions as any[])] : [];
    const preparedContext = currentPrefs.preparedContext || {};
    const category = task.category;

    // Retroactive Batch 1 setup if legacy task
    if (batchHistory.length === 0 && currentOptions.length > 0) {
      batchHistory.push({
        batchId: 'BATCH-001',
        batchNumber: 1,
        generatedAt: task.createdAt.toISOString(),
        options: currentOptions,
        status: 'ACTIVE',
      });
    }

    const activeBatch = batchHistory.find((b) => b.status === 'ACTIVE') || batchHistory[batchHistory.length - 1];

    // Build context entities
    const entities: ExtractedEntities = {
      intent: task.intent,
      category,
      rawInput: params.newRawInput || task.originalRequest,
      origin: params.newConstraints?.origin || preparedContext.origin,
      originAirport: params.newConstraints?.originAirport || preparedContext.originAirport,
      destination: params.newConstraints?.destination || preparedContext.destination,
      destinationAirport: params.newConstraints?.destinationAirport || preparedContext.destinationAirport,
      location: params.newConstraints?.location || preparedContext.location || preparedContext.destination,
      partySize: params.newConstraints?.partySize || preparedContext.partySize,
      budgetAmount: params.newConstraints?.budgetAmount || task.budgetAmount || undefined,
      budgetRange: params.newConstraints?.budgetRange || undefined,
      urgency: task.priority,
      requiresClarification: false,
    };

    // ----------------------------------------------------
    // Action 0: ASK CONCIERGE (Escalate to Senior Concierge Desk)
    // ----------------------------------------------------
    if (action === 'ASK_CONCIERGE') {
      const escalatedTask = await db.task.update({
        where: { id: task.id },
        data: {
          status: 'NEEDS_HUMAN',
          isEscalated: true,
          failedReason: params.feedback || 'Client requested Senior Concierge assistance for bespoke sourcing.',
          clientPreferences: {
            ...currentPrefs,
            batchHistory,
            rejectedOptionIds,
            rejectedOptionKeys,
            lastFeedback: params.feedback || 'Client requested Senior Concierge assistance.',
          } as any,
        },
      });

      await appendTaskEvent({
        taskId: task.id,
        eventType: 'CONCIERGE_ESCALATED',
        actorRole: 'CUSTOMER',
        message: 'Client requested direct Senior Concierge assistance.',
        data: { feedback: params.feedback },
      });

      return {
        success: true,
        status: 'NEEDS_HUMAN',
        task: escalatedTask,
        batch: activeBatch,
        escalatedToConcierge: true,
        message: 'Your request has been routed to your Senior Concierge for bespoke assistance.',
      };
    }

    // ----------------------------------------------------
    // Action 1: REPLACE A SINGLE OPTION
    // ----------------------------------------------------
    if (action === 'REPLACE_OPTION') {
      const targetId = params.replaceOptionId;
      const targetIndex = currentOptions.findIndex((o) => o.id === targetId);
      const replacedOption = targetIndex >= 0 ? currentOptions[targetIndex] : null;

      if (replacedOption) {
        if (!rejectedOptionIds.includes(replacedOption.id)) rejectedOptionIds.push(replacedOption.id);
        const key = RequestOrchestrator.getOptionStableKey(replacedOption);
        if (!rejectedOptionKeys.includes(key)) rejectedOptionKeys.push(key);
      }

      const keptOptions = currentOptions.filter((o) => o.id !== targetId);
      const assignedAgent = findAgentForTask(category, entities.intent);
      const rawCandidates = await assignedAgent.search(entities, currentPrefs);

      const keptOptionIds = keptOptions.map((o) => o.id);
      const keptOptionKeys = keptOptions.map(RequestOrchestrator.getOptionStableKey);

      const validCandidates = RequestOrchestrator.filterAndRankCandidates({
        candidates: rawCandidates,
        rejectedOptionIds: [...rejectedOptionIds, ...keptOptionIds],
        rejectedOptionKeys: [...rejectedOptionKeys, ...keptOptionKeys],
        constraints: {
          category,
          destination: entities.destination,
          destinationAirport: entities.destinationAirport,
          origin: entities.origin,
          originAirport: entities.originAirport,
          location: entities.location,
          budgetAmount: entities.budgetAmount,
          partySize: entities.partySize,
        },
        feedback: params.feedback,
        preferences: currentPrefs,
      });

      if (validCandidates.length === 0) {
        const escalatedTask = await db.task.update({
          where: { id: task.id },
          data: {
            status: 'NEEDS_HUMAN',
            isEscalated: true,
            failedReason: 'Customer has rejected previous recommendation batches and requires additional alternatives.',
            clientPreferences: {
              ...currentPrefs,
              batchHistory,
              rejectedOptionIds,
              rejectedOptionKeys,
              lastFeedback: params.feedback,
            } as any,
          },
        });
        return {
          success: true,
          task: escalatedTask,
          escalatedToConcierge: true,
          message: 'Your Proventa Concierge is actively sourcing additional verified alternatives.',
        };
      }

      const replacement = validCandidates[0];
      const newOptions = [...keptOptions];
      if (targetIndex >= 0 && targetIndex <= newOptions.length) {
        newOptions.splice(targetIndex, 0, replacement);
      } else {
        newOptions.push(replacement);
      }

      if (activeBatch) {
        activeBatch.options = newOptions;
        activeBatch.status = 'PARTIALLY_REJECTED';
        if (!activeBatch.rejectedOptionIds) activeBatch.rejectedOptionIds = [];
        if (replacedOption && !activeBatch.rejectedOptionIds.includes(replacedOption.id)) {
          activeBatch.rejectedOptionIds.push(replacedOption.id);
        }
      }

      const updatedTask = await db.task.update({
        where: { id: task.id },
        data: {
          proposedOptions: newOptions as any,
          clientPreferences: {
            ...currentPrefs,
            batchHistory,
            rejectedOptionIds,
            rejectedOptionKeys,
          } as any,
        },
      });

      await appendTaskEvent({
        taskId: task.id,
        eventType: 'OPTION_REPLACED',
        actorRole: 'CUSTOMER',
        message: `Replaced option: ${replacedOption?.title || targetId}. New proposal: ${replacement.title}`,
        data: { replacedId: targetId, newId: replacement.id },
      });

      return {
        success: true,
        batch: activeBatch,
        task: updatedTask,
        message: 'Option replaced with a new verified alternative.',
      };
    }

    // ----------------------------------------------------
    // Action 2: PARTIAL REJECTION (Keep Selected, Replace Others)
    // ----------------------------------------------------
    if (action === 'PARTIAL_REJECT') {
      const keptIds = new Set(params.keptOptionIds || []);
      const keptOptions = currentOptions.filter((o) => keptIds.has(o.id));
      const rejectedOptions = currentOptions.filter((o) => !keptIds.has(o.id));

      for (const rej of rejectedOptions) {
        if (!rejectedOptionIds.includes(rej.id)) rejectedOptionIds.push(rej.id);
        const key = RequestOrchestrator.getOptionStableKey(rej);
        if (!rejectedOptionKeys.includes(key)) rejectedOptionKeys.push(key);
      }

      const neededCount = Math.max(0, 5 - keptOptions.length);
      const assignedAgent = findAgentForTask(category, entities.intent);
      const rawCandidates = await assignedAgent.search(entities, currentPrefs);

      const keptOptionKeys = keptOptions.map(RequestOrchestrator.getOptionStableKey);

      const validCandidates = RequestOrchestrator.filterAndRankCandidates({
        candidates: rawCandidates,
        rejectedOptionIds: [...rejectedOptionIds, ...Array.from(keptIds)],
        rejectedOptionKeys: [...rejectedOptionKeys, ...keptOptionKeys],
        constraints: {
          category,
          destination: entities.destination,
          destinationAirport: entities.destinationAirport,
          origin: entities.origin,
          originAirport: entities.originAirport,
          location: entities.location,
          budgetAmount: entities.budgetAmount,
          partySize: entities.partySize,
        },
        feedback: params.feedback,
        preferences: currentPrefs,
      });

      const replacements = validCandidates.slice(0, neededCount);
      const newOptions = [...keptOptions, ...replacements];

      const nextBatchNumber = batchHistory.length + 1;
      const nextBatchId = `BATCH-${nextBatchNumber.toString().padStart(3, '0')}`;

      const newBatch: ProposalBatch = {
        batchId: nextBatchId,
        batchNumber: nextBatchNumber,
        generatedAt: new Date().toISOString(),
        options: newOptions,
        status: 'ACTIVE',
        feedback: params.feedback,
        rejectedOptionIds: rejectedOptions.map((o) => o.id),
      };

      if (activeBatch) {
        activeBatch.status = 'PARTIALLY_REJECTED';
        activeBatch.feedback = params.feedback;
      }
      batchHistory.push(newBatch);

      const updatedTask = await db.task.update({
        where: { id: task.id },
        data: {
          status: 'AWAITING_APPROVAL',
          approvalStatus: 'PENDING',
          proposedOptions: newOptions as any,
          clientPreferences: {
            ...currentPrefs,
            currentBatchId: nextBatchId,
            batchHistory,
            rejectedOptionIds,
            rejectedOptionKeys,
            lastFeedback: params.feedback,
          } as any,
        },
      });

      await appendTaskEvent({
        taskId: task.id,
        eventType: 'CUSTOMER_PARTIAL_REJECTION',
        actorRole: 'CUSTOMER',
        message: `Kept ${keptOptions.length} option(s), requested replacements for ${rejectedOptions.length} option(s).`,
        data: { keptCount: keptOptions.length, replacedCount: replacements.length },
      });

      return {
        success: true,
        batch: newBatch,
        task: updatedTask,
        message: 'Updated options preserving your selected preferences.',
      };
    }

    // ----------------------------------------------------
    // Action 3: MODIFY REQUEST CONSTRAINTS
    // ----------------------------------------------------
    if (action === 'MODIFY_REQUEST') {
      const newRaw = params.newRawInput || task.originalRequest;
      const parsed = EntityIntegrityValidator.extractTravelEntities(newRaw);

      // For non-flight categories (hotel, dining, etc.), only use an explicitly stated origin —
      // never an inferred default (e.g. 'Ahmedabad' inferred when only destination found in text).
      const isFlightCategory = category.includes('flight') || category.includes('travel') || category.includes('airline');
      const parsedOriginExplicit = parsed.provenance?.origin === 'EXPLICIT';
      const useInferredOrigin = isFlightCategory; // Only allow inferred origin for flight searches

      const newOrigin = params.newConstraints?.origin ||
        ((parsedOriginExplicit || useInferredOrigin) && parsed.originCity ? parsed.originCity : undefined) ||
        entities.origin;
      const newOriginAirport = params.newConstraints?.originAirport ||
        ((parsedOriginExplicit || useInferredOrigin) && parsed.originAirportCode ? parsed.originAirportCode : undefined) ||
        entities.originAirport;
      const newDest = params.newConstraints?.destination || (parsed.destinationCity ? parsed.destinationCity : undefined) || entities.destination;
      const newDestAirport = params.newConstraints?.destinationAirport || (parsed.destinationAirportCode ? parsed.destinationAirportCode : undefined) || entities.destinationAirport;
      const newLoc = params.newConstraints?.location || newDest || entities.location;
      const newBudget = params.newConstraints?.budgetAmount || (parsed.budget?.value ? Number(parsed.budget.value) : undefined) || entities.budgetAmount;

      const updatedEntities: ExtractedEntities = {
        ...entities,
        rawInput: newRaw,
        origin: newOrigin,
        originAirport: newOriginAirport,
        destination: newDest,
        destinationAirport: newDestAirport,
        location: newLoc,
        budgetAmount: newBudget,
      };

      if (activeBatch) {
        activeBatch.status = 'SUPERSEDED_BY_MODIFICATION';
        activeBatch.feedback = params.feedback;
        activeBatch.rejectedOptionIds = currentOptions.map((o) => o.id);
      }

      for (const opt of currentOptions) {
        if (!rejectedOptionIds.includes(opt.id)) rejectedOptionIds.push(opt.id);
        const key = RequestOrchestrator.getOptionStableKey(opt);
        if (!rejectedOptionKeys.includes(key)) rejectedOptionKeys.push(key);
      }

      const assignedAgent = findAgentForTask(category, updatedEntities.intent);
      const rawCandidates = await assignedAgent.search(updatedEntities, currentPrefs);

      const validCandidates = RequestOrchestrator.filterAndRankCandidates({
        candidates: rawCandidates,
        rejectedOptionIds,
        rejectedOptionKeys,
        constraints: {
          category,
          destination: updatedEntities.destination,
          destinationAirport: updatedEntities.destinationAirport,
          origin: updatedEntities.origin,
          originAirport: updatedEntities.originAirport,
          location: updatedEntities.location,
          budgetAmount: updatedEntities.budgetAmount,
          partySize: updatedEntities.partySize,
        },
        feedback: params.feedback,
        preferences: currentPrefs,
      });

      const selectedOptions = validCandidates.slice(0, 5);
      const nextBatchNumber = batchHistory.length + 1;
      const nextBatchId = `BATCH-${nextBatchNumber.toString().padStart(3, '0')}`;

      const newBatch: ProposalBatch = {
        batchId: nextBatchId,
        batchNumber: nextBatchNumber,
        generatedAt: new Date().toISOString(),
        options: selectedOptions,
        status: 'ACTIVE',
        feedback: params.feedback,
        rejectedOptionIds: currentOptions.map((o) => o.id),
      };
      batchHistory.push(newBatch);

      const updatedTask = await db.task.update({
        where: { id: task.id },
        data: {
          status: 'AWAITING_APPROVAL',
          approvalStatus: 'PENDING',
          originalRequest: newRaw,
          intent: newRaw.length > 80 ? `${newRaw.slice(0, 77)}...` : newRaw,
          budgetAmount: newBudget || task.budgetAmount,
          proposedOptions: selectedOptions as any,
          clientPreferences: {
            ...currentPrefs,
            currentBatchId: nextBatchId,
            batchHistory,
            rejectedOptionIds,
            rejectedOptionKeys,
            lastFeedback: params.feedback,
            preparedContext: {
              ...preparedContext,
              destination: newDest,
              destinationAirport: newDestAirport,
              origin: newOrigin,
              originAirport: newOriginAirport,
              location: newLoc,
              budgetAmount: newBudget,
            },
          } as any,
        },
      });

      await appendTaskEvent({
        taskId: task.id,
        eventType: 'REQUEST_MODIFIED',
        actorRole: 'CUSTOMER',
        message: `Customer modified request: "${newRaw.slice(0, 80)}"`,
        data: { newDestination: newDest, newBudget },
      });

      return {
        success: true,
        batch: newBatch,
        task: updatedTask,
        message: 'Updated search criteria and prepared 5 new options.',
      };
    }

    // ----------------------------------------------------
    // Action 4: REJECT ALL & GENERATE COMPLETE NEW BATCH
    // ----------------------------------------------------
    if (activeBatch) {
      activeBatch.status = 'REJECTED';
      activeBatch.feedback = params.feedback || 'Client requested 5 alternate options.';
      activeBatch.rejectedOptionIds = currentOptions.map((o) => o.id);
    }

    for (const opt of currentOptions) {
      if (!rejectedOptionIds.includes(opt.id)) rejectedOptionIds.push(opt.id);
      const key = RequestOrchestrator.getOptionStableKey(opt);
      if (!rejectedOptionKeys.includes(key)) rejectedOptionKeys.push(key);
    }

    const assignedAgent = findAgentForTask(category, entities.intent);
    const rawCandidates = await assignedAgent.search(entities, currentPrefs);

    const validCandidates = RequestOrchestrator.filterAndRankCandidates({
      candidates: rawCandidates,
      rejectedOptionIds,
      rejectedOptionKeys,
      constraints: {
        category,
        destination: entities.destination,
        destinationAirport: entities.destinationAirport,
        origin: entities.origin,
        originAirport: entities.originAirport,
        location: entities.location,
        budgetAmount: entities.budgetAmount,
        partySize: entities.partySize,
      },
      feedback: params.feedback,
      preferences: currentPrefs,
    });

    if (validCandidates.length === 0) {
      const escalatedTask = await db.task.update({
        where: { id: task.id },
        data: {
          status: 'NEEDS_HUMAN',
          isEscalated: true,
          failedReason: 'Customer has rejected previous recommendation batches and requires additional alternatives.',
          clientPreferences: {
            ...currentPrefs,
            batchHistory,
            rejectedOptionIds,
            rejectedOptionKeys,
            lastFeedback: params.feedback,
          } as any,
        },
      });

      await appendTaskEvent({
        taskId: task.id,
        eventType: 'CONCIERGE_ESCALATED',
        actorRole: 'SYSTEM',
        message: 'Customer has rejected previous recommendation batches and requires additional alternatives.',
        data: {
          previousBatchesCount: batchHistory.length,
          rejectedOptionsCount: rejectedOptionIds.length,
          feedback: params.feedback,
        },
      });

      return {
        success: true,
        task: escalatedTask,
        escalatedToConcierge: true,
        message: 'Your Proventa Concierge is actively sourcing additional verified alternatives.',
      };
    }

    const nextOptions = validCandidates.slice(0, 5);
    const nextBatchNumber = batchHistory.length + 1;
    const nextBatchId = `BATCH-${nextBatchNumber.toString().padStart(3, '0')}`;

    const newBatch: ProposalBatch = {
      batchId: nextBatchId,
      batchNumber: nextBatchNumber,
      generatedAt: new Date().toISOString(),
      options: nextOptions,
      status: 'ACTIVE',
    };
    batchHistory.push(newBatch);

    const updatedTask = await db.task.update({
      where: { id: task.id },
      data: {
        status: 'AWAITING_APPROVAL',
        approvalStatus: 'PENDING',
        proposedOptions: nextOptions as any,
        failedReason: null,
        clientPreferences: {
          ...currentPrefs,
          currentBatchId: nextBatchId,
          batchHistory,
          rejectedOptionIds,
          rejectedOptionKeys,
          lastFeedback: params.feedback,
        } as any,
      },
    });

    await appendTaskEvent({
      taskId: task.id,
      eventType: 'CUSTOMER_REJECTED_BATCH',
      actorRole: 'CUSTOMER',
      message: params.feedback ? `Client rejected batch: ${params.feedback}` : 'Client requested 5 alternate options.',
      data: { batchId: activeBatch?.batchId, feedback: params.feedback },
    });

    await appendTaskEvent({
      taskId: task.id,
      eventType: 'OPTIONS_FOUND',
      actorRole: 'AI_AGENT',
      message: 'I found 5 new options for you.',
      data: { batchId: nextBatchId, optionsCount: nextOptions.length },
    });

    const customerMessage =
      batchHistory.length <= 2
        ? "No problem. I'll find you 5 different options."
        : "Understood. I'm refining the search based on your preferences.";

    return {
      success: true,
      batch: newBatch,
      task: updatedTask,
      message: customerMessage,
    };
  }

  /**
   * Authoritative task completion method.
   * Transitions task to COMPLETED, persists final deliverables/notes,
   * logs TASK_COMPLETED timeline event, and notifies customer if appropriate.
   */
  static async completeTask(params: {
    taskId: string;
    operatorId?: string;
    notes?: string;
    deliverable?: Record<string, any>;
  }) {
    const taskRecord = await db.task.findUnique({
      where: { id: params.taskId },
      include: {
        customer: {
          include: { user: true },
        },
      },
    });

    if (!taskRecord) {
      throw new Error(`Task not found: ${params.taskId}`);
    }

    validateTransition(taskRecord.status as TaskStatus, 'COMPLETED');

    const existingPrefs = (taskRecord.clientPreferences as Record<string, any>) || {};
    const updatedPrefs = {
      ...existingPrefs,
      completedAt: new Date().toISOString(),
      completionNotes: params.notes,
      deliverable: params.deliverable || existingPrefs.deliverable,
    };

    const completedTask = await db.task.update({
      where: { id: params.taskId },
      data: {
        status: 'COMPLETED',
        clientPreferences: updatedPrefs as any,
        updatedAt: new Date(),
      },
    });

    await appendTaskEvent({
      taskId: params.taskId,
      eventType: 'TASK_COMPLETED',
      actorRole: params.operatorId ? 'CONCIERGE' : 'SYSTEM',
      actorId: params.operatorId,
      message: params.notes || 'Task successfully completed and fulfilled.',
      data: {
        notes: params.notes,
        deliverable: params.deliverable || existingPrefs.deliverable,
      },
    });

    // Send confirmation notification if not already sent
    if (taskRecord.customer?.user?.email && !taskRecord.externalReferenceId) {
      try {
        await sendBookingConfirmationEmail({
          email: taskRecord.customer.user.email,
          name: taskRecord.customer.user.name || 'Valued Member',
          title: taskRecord.intent || taskRecord.originalRequest,
          reference: `COMPLETED-${taskRecord.publicId || taskRecord.id.slice(-6).toUpperCase()}`,
          vendor: taskRecord.vendorName || 'Proventa Concierge',
          notes: params.notes || 'Your request has been successfully fulfilled.',
          actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://proventa.in'}/tasks/${params.taskId}`,
        });
      } catch (e) {
        console.error('[Orchestrator.completeTask] Email notification error:', e);
      }
    }

    return completedTask;
  }
}

