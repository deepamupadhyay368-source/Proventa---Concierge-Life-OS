import type { ExtractedEntities, TaskStatus } from '@/lib/orchestration/types';
import type { ToolRiskLevel, AgentPermission } from '../permissions/permissions';

export type SubtaskExecutionType = 'SEQUENTIAL' | 'PARALLEL' | 'CONDITIONAL';

export interface TaskNode {
  id: string;
  category: string;
  assignedAgent: string;
  objective: string;
  dependencies: string[]; // Node IDs that must complete first
  executionType: SubtaskExecutionType;
  condition?: (parentResults: Record<string, any>) => boolean;
  requiredTools: string[];
  requiredPermissions: AgentPermission[];
  riskLevel: ToolRiskLevel;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  result?: any;
  error?: string;
  verificationReference?: string;
  entities: ExtractedEntities;
}

export interface TaskGraph {
  taskId: string;
  rootObjective: string;
  nodes: Map<string, TaskNode>;
  executionOrder: string[][]; // Batches of node IDs that can run concurrently
}

export class DAGTaskPlanner {
  /**
   * Decomposes a user request into an executable Directed Acyclic Graph (DAG).
   */
  static buildTaskGraph(taskId: string, rawInput: string, customerId: string): TaskGraph {
    const rawLower = rawInput.toLowerCase();
    const nodes = new Map<string, TaskNode>();

    const hasDining = rawLower.includes('dinner') || rawLower.includes('dining') || rawLower.includes('restaurant') || rawLower.includes('table');
    const hasHotel = rawLower.includes('hotel') || rawLower.includes('stay') || rawLower.includes('suite') || rawLower.includes('room');
    const hasMobility = rawLower.includes('chauffeur') || rawLower.includes('cab') || rawLower.includes('car') || rawLower.includes('pickup') || rawLower.includes('transfer');
    const hasShopping = rawLower.includes('gift') || rawLower.includes('buy') || rawLower.includes('order') || rawLower.includes('source') || rawLower.includes('hamper');
    const hasCalendar = rawLower.includes('calendar') || rawLower.includes('schedule') || rawLower.includes('appointment');

    let nodeIdCounter = 1;
    let diningNodeId: string | null = null;
    let hotelNodeId: string | null = null;
    let mobilityNodeId: string | null = null;

    // 1. Hotel Node
    if (hasHotel) {
      hotelNodeId = `node-${nodeIdCounter++}`;
      nodes.set(hotelNodeId, {
        id: hotelNodeId,
        category: 'hotel',
        assignedAgent: 'Hotel & Stay Specialist Agent',
        objective: 'Locate and book luxury hotel suite',
        dependencies: [],
        executionType: 'PARALLEL',
        requiredTools: ['search_hotels', 'send_email'],
        requiredPermissions: ['SEARCH', 'RESERVE'],
        riskLevel: 'HIGH',
        status: 'PENDING',
        entities: {
          intent: 'Reserve luxury suite',
          category: 'hotel',
          rawInput,
          urgency: 'NORMAL',
          requiresClarification: false,
        },
      });
    }

    // 2. Dining Node
    if (hasDining) {
      diningNodeId = `node-${nodeIdCounter++}`;
      nodes.set(diningNodeId, {
        id: diningNodeId,
        category: 'dining',
        assignedAgent: 'Dining Specialist Agent',
        objective: 'Reserve confirmed table with dietary curation',
        dependencies: [],
        executionType: 'PARALLEL',
        requiredTools: ['search_restaurants', 'create_reservation'],
        requiredPermissions: ['SEARCH', 'RESERVE'],
        riskLevel: 'MEDIUM',
        status: 'PENDING',
        entities: {
          intent: 'Reserve restaurant table',
          category: 'dining',
          rawInput,
          partySize: rawLower.includes('4') ? 4 : 2,
          urgency: 'NORMAL',
          requiresClarification: false,
        },
      });
    }

    // 3. Mobility Node (Depends on Dining or Hotel arrival)
    if (hasMobility) {
      mobilityNodeId = `node-${nodeIdCounter++}`;
      const deps: string[] = [];
      if (diningNodeId) deps.push(diningNodeId);
      if (hotelNodeId) deps.push(hotelNodeId);

      nodes.set(mobilityNodeId, {
        id: mobilityNodeId,
        category: 'mobility',
        assignedAgent: 'Mobility & Chauffeur Agent',
        objective: 'Dispatch executive chauffeur synchronized to reservation time',
        dependencies: deps,
        executionType: 'SEQUENTIAL',
        requiredTools: ['search_transport', 'create_calendar_event'],
        requiredPermissions: ['SEARCH', 'RESERVE'],
        riskLevel: 'MEDIUM',
        status: 'PENDING',
        entities: {
          intent: 'Dispatch chauffeur',
          category: 'mobility',
          rawInput,
          urgency: 'NORMAL',
          requiresClarification: false,
        },
      });
    }

    // 4. Shopping Node
    if (hasShopping) {
      const shoppingNodeId = `node-${nodeIdCounter++}`;
      nodes.set(shoppingNodeId, {
        id: shoppingNodeId,
        category: 'shopping',
        assignedAgent: 'Shopping & Luxury Sourcing Agent',
        objective: 'Source and procure luxury merchandise or gift',
        dependencies: [],
        executionType: 'PARALLEL',
        requiredTools: ['search_products', 'create_order'],
        requiredPermissions: ['SEARCH', 'PURCHASE'],
        riskLevel: 'HIGH',
        status: 'PENDING',
        entities: {
          intent: 'Source luxury goods',
          category: 'shopping',
          rawInput,
          urgency: 'NORMAL',
          requiresClarification: false,
        },
      });
    }

    // 5. Calendar Sync Node (Conditional on successful reservations)
    if (hasCalendar || diningNodeId || hotelNodeId || mobilityNodeId) {
      const calNodeId = `node-${nodeIdCounter++}`;
      const parentDeps = Array.from(nodes.keys());
      nodes.set(calNodeId, {
        id: calNodeId,
        category: 'appointments',
        assignedAgent: 'Calendar & Appointments Agent',
        objective: 'Add confirmed reservations to client schedule',
        dependencies: parentDeps,
        executionType: 'CONDITIONAL',
        condition: (results) => Object.values(results).some((r: any) => r && r.status === 'CONFIRMED'),
        requiredTools: ['create_calendar_event'],
        requiredPermissions: ['CALENDAR_WRITE'],
        riskLevel: 'LOW',
        status: 'PENDING',
        entities: {
          intent: 'Synchronize schedule',
          category: 'appointments',
          rawInput,
          urgency: 'NORMAL',
          requiresClarification: false,
        },
      });
    }

    // If no specific intent found, default to Root Concierge Node
    if (nodes.size === 0) {
      const defaultNodeId = `node-${nodeIdCounter++}`;
      nodes.set(defaultNodeId, {
        id: defaultNodeId,
        category: 'concierge',
        assignedAgent: 'Proventa Concierge Agent',
        objective: 'Analyze and handle custom lifestyle request',
        dependencies: [],
        executionType: 'SEQUENTIAL',
        requiredTools: ['search_places', 'send_message'],
        requiredPermissions: ['SEARCH', 'MESSAGE'],
        riskLevel: 'LOW',
        status: 'PENDING',
        entities: {
          intent: 'General concierge request',
          category: 'concierge',
          rawInput,
          urgency: 'NORMAL',
          requiresClarification: false,
        },
      });
    }

    // Compute topological batches for parallel execution
    const executionOrder = this.computeExecutionBatches(nodes);

    return {
      taskId,
      rootObjective: rawInput,
      nodes,
      executionOrder,
    };
  }

  /**
   * Topological sorting into parallel execution stages (batches).
   */
  private static computeExecutionBatches(nodes: Map<string, TaskNode>): string[][] {
    const batches: string[][] = [];
    const resolvedNodes = new Set<string>();
    const remainingNodes = new Set(nodes.keys());

    while (remainingNodes.size > 0) {
      const currentBatch: string[] = [];

      for (const nodeId of remainingNodes) {
        const node = nodes.get(nodeId)!;
        const allDepsResolved = node.dependencies.every((dep) => resolvedNodes.has(dep));
        if (allDepsResolved) {
          currentBatch.push(nodeId);
        }
      }

      if (currentBatch.length === 0) {
        // Cyclic dependency detected fallback: push remaining as sequential
        batches.push(Array.from(remainingNodes));
        break;
      }

      for (const id of currentBatch) {
        resolvedNodes.add(id);
        remainingNodes.delete(id);
      }
      batches.push(currentBatch);
    }

    return batches;
  }
}
