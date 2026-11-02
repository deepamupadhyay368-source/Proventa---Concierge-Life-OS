/**
 * PROVENTA — Family Goals & Scenario Simulation Module
 * 
 * Target tracking and deterministic scenario modeling.
 * Strictly computational; does not provide securities investment advice.
 */

import {
  FinancialGoalDTO,
  GoalCategory,
  ScenarioSimulationInput,
  ScenarioSimulationResult,
} from './types';
import { formatInr, runScenarioSimulation } from './engine';

interface GoalsStore {
  goals: Map<string, FinancialGoalDTO>;
}

declare global {
  // eslint-disable-next-line no-var
  var __proventaGoalsStore: GoalsStore | undefined;
}

function getGoalsStore(): GoalsStore {
  if (!globalThis.__proventaGoalsStore) {
    const store: GoalsStore = {
      goals: new Map(),
    };

    if (process.env.NODE_ENV !== 'test') {
      globalThis.__proventaGoalsStore = store;
      return store;
    }

    const demoFamilyId = 'fam_sharma_heritage';

    const demoGoals: FinancialGoalDTO[] = [
      {
        id: 'goal_us_masters',
        workspaceId: demoFamilyId,
        familyId: demoFamilyId,
        title: 'Aarav Stanford / Ivy League Masters Fund',
        category: 'CHILDREN_EDUCATION',
        targetAmountPaise: 1500000000, // ₹1.5 Crore
        formattedTargetAmount: '₹1,50,00,000',
        currentAmountPaise: 1100000000, // ₹1.1 Crore
        formattedCurrentAmount: '₹1,10,00,000',
        progressPercentage: 73.3,
        targetDate: '2027-08-01',
        contributors: [
          { memberId: 'usr_rajesh_sharma', memberName: 'Rajesh Sharma', contributedPaise: 800000000, formattedContributed: '₹80,00,000' },
          { memberId: 'usr_sunita_sharma', memberName: 'Sunita Sharma', contributedPaise: 300000000, formattedContributed: '₹30,00,000' },
        ],
        status: 'ON_TRACK',
        notes: 'Targeting foreign university tuition, living and travel buffer.',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-01-15T00:00:00.000Z',
      },
      {
        id: 'goal_alibaug_villa',
        workspaceId: demoFamilyId,
        familyId: demoFamilyId,
        title: 'Alibaug Holiday Villa Acquisition',
        category: 'PROPERTY_PURCHASE',
        targetAmountPaise: 5000000000, // ₹5.0 Crore
        formattedTargetAmount: '₹5,00,00,000',
        currentAmountPaise: 2750000000, // ₹2.75 Crore
        formattedCurrentAmount: '₹2,75,00,000',
        progressPercentage: 55.0,
        targetDate: '2028-12-31',
        contributors: [
          { memberId: 'usr_rajesh_sharma', memberName: 'Rajesh Sharma', contributedPaise: 2750000000, formattedContributed: '₹2,75,00,000' },
        ],
        status: 'ON_TRACK',
        notes: 'Co-investing with family trust for multi-generational retreat.',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2026-01-15T00:00:00.000Z',
      },
    ];

    for (const g of demoGoals) {
      store.goals.set(g.id, g);
    }
    globalThis.__proventaGoalsStore = store;
  }
  return globalThis.__proventaGoalsStore;
}

export function listGoals(workspaceId: string): FinancialGoalDTO[] {
  const store = getGoalsStore();
  const results: FinancialGoalDTO[] = [];
  for (const g of store.goals.values()) {
    if (g.workspaceId === workspaceId) {
      results.push(g);
    }
  }
  return results.sort((a, b) => b.progressPercentage - a.progressPercentage);
}

export function createGoal(
  params: Omit<FinancialGoalDTO, 'id' | 'formattedTargetAmount' | 'formattedCurrentAmount' | 'progressPercentage' | 'createdAt' | 'updatedAt'>,
): FinancialGoalDTO {
  const store = getGoalsStore();
  const id = `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const progress = params.targetAmountPaise > 0
    ? Number(((params.currentAmountPaise / params.targetAmountPaise) * 100).toFixed(1))
    : 0;

  const newGoal: FinancialGoalDTO = {
    ...params,
    id,
    formattedTargetAmount: formatInr(params.targetAmountPaise),
    formattedCurrentAmount: formatInr(params.currentAmountPaise),
    progressPercentage: Math.min(100, progress),
    createdAt: now,
    updatedAt: now,
  };

  store.goals.set(id, newGoal);
  return newGoal;
}

export function simulateScenario(input: ScenarioSimulationInput): ScenarioSimulationResult {
  return runScenarioSimulation(input);
}
