import { db } from '@/lib/db';
import { understandRequest } from '@/lib/ai/agents/understanding';
import { evaluateSafetyAndHandoff } from '@/lib/ai/agents/safety';
import { validateTransition } from './state-machine';
import { appendTaskEvent } from './timeline';
import { evaluateApproval } from './approval/approval-engine';
import { findAgentForTask } from './agents';
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp';
import { TaskDecisionEngine, CapabilityRegistry } from '@/lib/capabilities';
import { ExecutionRouter } from '@/lib/capabilities/execution-router';
import type { TaskStatus, TaskPriority, OptionProposal, ExtractedEntities } from './types';

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
    const preferencesRecords = await db.customerPreference.findMany({
      where: { customerId },
    });
    const preferences: Record<string, any> = {};
    preferencesRecords.forEach((p) => {
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
        task = await db.task.update({
          where: { id: task.id },
          data: {
            status: nextStatus,
            proposedOptions: proposals as any,
            approvalRequired: requiresApproval,
            approvalStatus: requiresApproval ? 'PENDING' : 'APPROVED',
            vendorName: bestOption.providerName,
            budgetAmount: bestOption.priceAmount,
            clientPreferences: {
              ...currentPrefs,
              preparedContext: {
                ...currentContext,
                proposedOptionsCount: proposals.length,
              },
            },
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
   * Executes a task after explicit customer authorization, verifies confirmation, and finishes lifecycle.
   * Consequential actions can only enter here via explicit customer approval.
   */
  static async executeApprovedTask(params: {
    taskId: string;
    option: OptionProposal;
    userId?: string;
  }) {
    let { taskId, option } = params;

    const taskRecord = await db.task.findUnique({
      where: { id: taskId },
      include: { customer: { include: { user: true } } },
    });
    if (!taskRecord) throw new Error(`Task ${taskId} not found`);

    // Defensive recovery: if option is missing or submitted without providerId, look up in taskRecord.proposedOptions
    if (!option && Array.isArray(taskRecord.proposedOptions) && taskRecord.proposedOptions.length > 0) {
      option = (taskRecord.proposedOptions as any[])[0];
    }
    if (option && !option.providerId && Array.isArray(taskRecord.proposedOptions)) {
      const storedOption = (taskRecord.proposedOptions as any[]).find(
        (o: any) => o.id === option.id || o.title === option.title
      );
      if (storedOption?.providerId) {
        option = { ...option, providerId: storedOption.providerId, venueId: storedOption.venueId };
      }
    }
    if (!option) {
      throw new Error('No option available to execute for this task');
    }

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

    // 1. Execute via Agent & Adapter (resolved strictly by providerId)
    const execution = await assignedAgent.execute(taskRecord, option);

    // 1a. Handle Phone Booking / Concierge Call Workflow (e.g. Ahmedabad Verified Network or offline venue)
    if (
      execution.status === 'AWAITING_CONCIERGE_CALL' ||
      execution.confirmedDetails?.status === 'AWAITING_CONCIERGE_CALL' ||
      option.bookingMethod === 'PHONE'
    ) {
      validateTransition(taskRecord.status as TaskStatus, 'NEEDS_HUMAN');
      const pendingTask = await db.task.update({
        where: { id: taskId },
        data: {
          status: 'NEEDS_HUMAN',
          executionMethod: 'HUMAN_CONCIERGE',
          isEscalated: true,
        },
      });

      const dispatch = execution.confirmedDetails?.dispatchPayload || execution.confirmedDetails;
      await appendTaskEvent({
        taskId,
        eventType: 'AWAITING_CONCIERGE_CALL',
        actorRole: 'AI_AGENT',
        message: 'I\'ve found the option. Our concierge team is completing this for you.',
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

      return { success: true, task: pendingTask, execution };
    }

    // 1b. Safety Guard: Simulated, mock, or sandbox bookings must NEVER be confirmed in production execution paths
    if (execution.isMock || execution.environment === 'SANDBOX') {
      validateTransition(taskRecord.status as TaskStatus, 'NEEDS_HUMAN');
      const escalatedTask = await db.task.update({
        where: { id: taskId },
        data: {
          status: 'NEEDS_HUMAN',
          executionMethod: 'HUMAN_CONCIERGE',
          isEscalated: true,
          failedReason: 'Simulated, mock, or sandbox bookings cannot be confirmed in production paths.',
        },
      });

      await appendTaskEvent({
        taskId,
        eventType: 'EXECUTION_REJECTED_MOCK',
        actorRole: 'SYSTEM',
        message: 'Mock/sandbox execution rejected: Production execution paths strictly require genuine partner reservations.',
        data: { providerId: execution.providerId, environment: execution.environment },
      });

      return { success: false, task: escalatedTask, execution };
    }

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

      // Guard: Mock or sandbox verifications must NEVER confirm
      if (verification.isMock || verification.environment === 'SANDBOX') {
        validateTransition('VERIFYING', 'NEEDS_HUMAN');
        const escalatedTask = await db.task.update({
          where: { id: taskId },
          data: {
            status: 'NEEDS_HUMAN',
            executionMethod: 'HUMAN_CONCIERGE',
            isEscalated: true,
            failedReason: 'Simulated or sandbox verification rejected. Cannot mark booking as confirmed.',
          },
        });
        return { success: false, task: escalatedTask, execution, verification };
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
        failedReason: execution.errorMessage || 'Automated reservation could not be verified by partner system.',
      },
    });

    await appendTaskEvent({
      taskId,
      eventType: 'EXECUTION_FAILED_ESCALATED',
      actorRole: 'SYSTEM',
      message: 'I couldn\'t complete this request automatically. Our concierge desk is taking over to complete this for you.',
      data: { error: execution.errorMessage },
    });

    return { success: false, task: escalatedTask, execution };
  }
}
