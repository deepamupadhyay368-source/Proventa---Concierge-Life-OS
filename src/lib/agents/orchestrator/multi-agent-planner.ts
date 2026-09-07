import { db } from '@/lib/db';
import { getSpecialistAgent, type ProventaBaseAgent } from '../specialists/domain-agents';
import { AgentRuntime } from '../runtime/agent-runtime';
import { appendTaskEvent } from '@/lib/orchestration/timeline';
import type { ExtractedEntities } from '@/lib/orchestration/types';

export interface SubtaskPlan {
  subtaskId: string;
  category: string;
  agentName: string;
  actionDescription: string;
  dependencies: string[]; // subtaskIds that must complete first
  entities: ExtractedEntities;
}

export interface MultiAgentPlan {
  compositeIntent: string;
  subtasks: SubtaskPlan[];
}

export class MultiAgentOrchestrator {
  /**
   * Decomposes a composite multi-step prompt into discrete subtasks with sequential dependencies.
   * e.g., "Plan a birthday evening: dinner for 4 at Agashiye, heritage walk, and luxury chauffeur pickup."
   */
  static decomposeRequest(rawInput: string): MultiAgentPlan {
    const rawLower = rawInput.toLowerCase();
    const subtasks: SubtaskPlan[] = [];

    const hasDining = rawLower.includes('dinner') || rawLower.includes('dining') || rawLower.includes('restaurant') || rawLower.includes('eat');
    const hasMobility = rawLower.includes('chauffeur') || rawLower.includes('cab') || rawLower.includes('car') || rawLower.includes('pickup') || rawLower.includes('transfer');
    const hasEntertainment = rawLower.includes('entertainment') || rawLower.includes('walk') || rawLower.includes('event') || rawLower.includes('music') || rawLower.includes('tickets');
    const hasHotel = rawLower.includes('hotel') || rawLower.includes('stay') || rawLower.includes('suite');

    let subtaskIndex = 1;
    let diningSubtaskId: string | null = null;

    // 1. Dining subtask
    if (hasDining) {
      diningSubtaskId = `subtask-${subtaskIndex++}`;
      subtasks.push({
        subtaskId: diningSubtaskId,
        category: 'dining',
        agentName: 'Dining & Epicurean Specialist',
        actionDescription: 'Reserve prime dining table and customize dietary preferences',
        dependencies: [],
        entities: {
          intent: 'Reserve restaurant',
          category: 'dining',
          rawInput,
          partySize: rawLower.includes('4') ? 4 : 2,
          dateTime: 'Tonight 8:00 PM',
          urgency: 'NORMAL',
          requiresClarification: false,
        },
      });
    }

    // 2. Entertainment subtask
    if (hasEntertainment) {
      const entSubtaskId = `subtask-${subtaskIndex++}`;
      subtasks.push({
        subtaskId: entSubtaskId,
        category: 'experiences',
        agentName: 'Entertainment & Experiences Specialist',
        actionDescription: 'Curate VIP experience / private heritage walk',
        dependencies: diningSubtaskId ? [diningSubtaskId] : [],
        entities: {
          intent: 'Coordinate VIP experience',
          category: 'experiences',
          rawInput,
          partySize: 2,
          urgency: 'NORMAL',
          requiresClarification: false,
        },
      });
    }

    // 3. Mobility subtask
    if (hasMobility) {
      const mobSubtaskId = `subtask-${subtaskIndex++}`;
      subtasks.push({
        subtaskId: mobSubtaskId,
        category: 'mobility',
        agentName: 'Mobility & Chauffeur Specialist',
        actionDescription: 'Dispatch executive chauffeur synchronized to venue departure',
        dependencies: diningSubtaskId ? [diningSubtaskId] : [],
        entities: {
          intent: 'Chauffeur dispatch',
          category: 'mobility',
          rawInput,
          location: 'Client Residence',
          destination: 'Agashiye / Venue',
          urgency: 'NORMAL',
          requiresClarification: false,
        },
      });
    }

    // If single intent or general request
    if (subtasks.length === 0) {
      const cat = hasHotel ? 'travel' : 'other';
      subtasks.push({
        subtaskId: `subtask-${subtaskIndex++}`,
        category: cat,
        agentName: getSpecialistAgent(cat).name,
        actionDescription: 'Process client concierge request',
        dependencies: [],
        entities: {
          intent: 'General concierge request',
          category: cat,
          rawInput,
          urgency: 'NORMAL',
          requiresClarification: false,
        },
      });
    }

    return {
      compositeIntent: 'Multi-Agent Coordinated Itinerary',
      subtasks,
    };
  }

  /**
   * Executes a decomposed multi-agent plan sequentially, passing contextual output from
   * upstream tasks to downstream dependent tasks.
   */
  static async executeMultiAgentPlan(params: {
    parentTaskId: string;
    plan: MultiAgentPlan;
    customerId: string;
  }) {
    const { parentTaskId, plan, customerId } = params;
    const completedResults: Record<string, any> = {};

    await appendTaskEvent({
      taskId: parentTaskId,
      eventType: 'STATUS_CHANGED',
      actorRole: 'AI_AGENT',
      message: `Multi-Agent Plan Activated: Decomposed into ${plan.subtasks.length} specialized subtasks.`,
      data: { subtasks: plan.subtasks.map((s) => ({ id: s.subtaskId, agent: s.agentName })) },
    });

    for (const subtask of plan.subtasks) {
      // Ensure all dependencies are satisfied
      const depsReady = subtask.dependencies.every((depId) => completedResults[depId]?.success);
      if (!depsReady) {
        throw new Error(`Subtask ${subtask.subtaskId} dependencies not satisfied.`);
      }

      // Propagate context (e.g. restaurant address -> mobility destination)
      if (subtask.category === 'mobility' && completedResults['subtask-1']?.output?.providerName) {
        subtask.entities.destination = completedResults['subtask-1'].output.providerName;
      }

      const agent = getSpecialistAgent(subtask.category);

      // Create linked child task
      const childCount = await db.task.count();
      const childTask = await db.task.create({
        data: {
          publicId: `SUB-${(childCount + 1).toString().padStart(4, '0')}`,
          customerId,
          category: subtask.category,
          intent: subtask.entities.intent,
          originalRequest: subtask.actionDescription,
          assignedAgent: agent.name,
          priority: 'NORMAL',
          status: 'UNDERSTANDING',
        },
      });

      await appendTaskEvent({
        taskId: parentTaskId,
        eventType: 'AGENT_ASSIGNED',
        actorRole: 'AI_AGENT',
        message: `Dispatching [${agent.name}] for subtask: ${subtask.actionDescription}`,
      });

      const execResult = await AgentRuntime.runAgentLoop({
        taskId: childTask.id,
        agent,
        entities: subtask.entities,
        originalRequest: subtask.actionDescription,
        customerId,
        autoExecuteIfApproved: true,
      });

      completedResults[subtask.subtaskId] = execResult;
    }

    // Update parent task to CONFIRMED
    await db.task.update({
      where: { id: parentTaskId },
      data: {
        status: 'CONFIRMED',
        completedAt: new Date(),
        vendorName: 'Multi-Agent Orchestrated Itinerary',
        externalReferenceId: `MAO-${Date.now().toString(36).toUpperCase()}`,
      },
    });

    await appendTaskEvent({
      taskId: parentTaskId,
      eventType: 'BOOKING_CONFIRMED',
      actorRole: 'AI_AGENT',
      message: 'All multi-agent subtasks successfully coordinated and confirmed.',
      data: { subtasksCompleted: plan.subtasks.length },
    });

    return completedResults;
  }
}
