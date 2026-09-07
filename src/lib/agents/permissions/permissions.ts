export type AgentPermission =
  | 'SEARCH'
  | 'READ'
  | 'RECOMMEND'
  | 'QUOTE'
  | 'RESERVE'
  | 'PURCHASE'
  | 'CANCEL'
  | 'MODIFY'
  | 'MESSAGE'
  | 'EMAIL'
  | 'CALENDAR_WRITE'
  | 'ADMIN';

export type ToolRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  requiresClientApproval?: boolean;
  requiresConciergeApproval?: boolean;
}

/**
 * Standard Permission Matrices for each Domain Agent Role.
 * Ensures agents strictly stay within their operational authority.
 */
export const AGENT_ROLE_PERMISSIONS: Record<string, AgentPermission[]> = {
  dining: ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'CANCEL', 'MODIFY'],
  travel: ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'CANCEL', 'MODIFY'],
  hotel: ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'CANCEL', 'MODIFY'],
  flights: ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'CANCEL', 'MODIFY'],
  mobility: ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'CANCEL', 'MODIFY'],
  transit: ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'CANCEL', 'MODIFY'],
  entertainment: ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'PURCHASE'],
  experiences: ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'PURCHASE'],
  shopping: ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'PURCHASE'],
  gift: ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'PURCHASE'],
  home: ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE', 'MODIFY'],
  events: ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE'],
  business: ['SEARCH', 'READ', 'RECOMMEND', 'QUOTE', 'RESERVE'],
  research: ['SEARCH', 'READ', 'RECOMMEND'],
  personal: ['SEARCH', 'READ', 'RECOMMEND'],
  calendar: ['READ', 'CALENDAR_WRITE', 'MODIFY'],
  appointments: ['READ', 'CALENDAR_WRITE', 'MODIFY'],
  communication: ['READ', 'MESSAGE', 'EMAIL'],
  other: [
    'SEARCH',
    'READ',
    'RECOMMEND',
    'QUOTE',
    'RESERVE',
    'PURCHASE',
    'CANCEL',
    'MODIFY',
    'MESSAGE',
    'EMAIL',
    'CALENDAR_WRITE',
    'ADMIN',
  ],
  concierge: [
    'SEARCH',
    'READ',
    'RECOMMEND',
    'QUOTE',
    'RESERVE',
    'PURCHASE',
    'CANCEL',
    'MODIFY',
    'MESSAGE',
    'EMAIL',
    'CALENDAR_WRITE',
    'ADMIN',
  ],
};

/**
 * Evaluates whether an agent with a given role possesses the required permission.
 */
export function checkAgentPermission(
  agentRole: string,
  requiredPermission: AgentPermission,
  toolRiskLevel: ToolRiskLevel = 'LOW'
): PermissionCheckResult {
  const role = agentRole.toLowerCase();
  const permissions = AGENT_ROLE_PERMISSIONS[role] || [];

  if (!permissions.includes(requiredPermission)) {
    return {
      allowed: false,
      reason: `Agent role '${agentRole}' does not possess required permission '${requiredPermission}'.`,
    };
  }

  // Risk-based gating
  if (toolRiskLevel === 'CRITICAL') {
    return {
      allowed: true,
      requiresConciergeApproval: true,
      requiresClientApproval: true,
      reason: 'CRITICAL actions require verified human concierge and client signoff.',
    };
  }

  if (toolRiskLevel === 'HIGH') {
    return {
      allowed: true,
      requiresClientApproval: true,
      reason: 'HIGH risk operations require client approval before final execution.',
    };
  }

  return { allowed: true };
}
