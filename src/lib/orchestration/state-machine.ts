import type { TaskStatus } from './types';

export const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  REQUESTED: ['UNDERSTANDING', 'CANCELLED'],
  UNDERSTANDING: ['SEARCHING', 'NEEDS_INFORMATION', 'NEEDS_HUMAN', 'CANCELLED'],
  NEEDS_INFORMATION: ['SEARCHING', 'NEEDS_HUMAN', 'CANCELLED'],
  QUEUED: ['EXECUTING', 'CANCELLED'],
  SEARCHING: ['OPTIONS_READY', 'NEEDS_HUMAN', 'FAILED', 'CANCELLED'],
  OPTIONS_READY: ['AWAITING_APPROVAL', 'APPROVED', 'NEEDS_HUMAN', 'CANCELLED'],
  AWAITING_APPROVAL: ['APPROVED', 'EXECUTING', 'SEARCHING', 'NEEDS_HUMAN', 'EXPIRED', 'CANCELLED'],
  APPROVED: ['QUEUED', 'EXECUTING', 'CANCELLED'],
  EXECUTING: ['VERIFYING', 'CONFIRMED', 'NEEDS_HUMAN', 'FAILED', 'CANCELLED'],
  VERIFYING: ['CONFIRMED', 'NEEDS_HUMAN', 'FAILED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  FAILED: ['NEEDS_HUMAN', 'CANCELLED'],
  CANCELLED: [],
  EXPIRED: ['SEARCHING', 'CANCELLED'],
  NEEDS_HUMAN: ['QUEUED', 'EXECUTING', 'CONFIRMED', 'COMPLETED', 'FAILED', 'CANCELLED'],
};

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) return true;
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function validateTransition(from: TaskStatus, to: TaskStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`[State Machine] Invalid task transition from ${from} to ${to}`);
  }
}
