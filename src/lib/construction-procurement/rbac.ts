/**
 * PROVENTA — Server-Side Role-Based & Organisation-Based Access Control (RBAC)
 * Enforces the 11-role procurement permission matrix, strict tenant isolation,
 * and separation of duties for purchase approvals & awards.
 */

export type ProcurementRole =
  | 'ORG_OWNER'
  | 'PROCUREMENT_HEAD'
  | 'PROCUREMENT_MANAGER'
  | 'PROCUREMENT_EXECUTIVE'
  | 'PROJECT_MANAGER'
  | 'FINANCE_MANAGER'
  | 'APPROVER'
  | 'SUPPLIER_OWNER'
  | 'SUPPLIER_SALES_MANAGER'
  | 'SUPPLIER_OPS_MANAGER'
  | 'PLATFORM_ADMIN';

export type ProcurementPermission =
  | 'project:create'
  | 'project:read'
  | 'requirement:create'
  | 'requirement:approve'
  | 'rfq:create'
  | 'rfq:publish'
  | 'rfq:read_buyer'
  | 'rfq:read_supplier_invited'
  | 'quotation:submit'
  | 'quotation:read_own'
  | 'quotation:read_buyer'
  | 'comparison:view'
  | 'approval:decide'
  | 'award:execute'
  | 'po:read'
  | 'po:confirm_supplier'
  | 'delivery:dispatch'
  | 'delivery:receive_grn'
  | 'invoice:upload_supplier'
  | 'invoice:reconcile_buyer'
  | 'dispute:raise'
  | 'dispute:resolve'
  | 'analytics:view'
  | 'admin:verify_org'
  | 'admin:manage_categories'
  | 'admin:audit_logs';

const ROLE_PERMISSIONS: Record<ProcurementRole, readonly ProcurementPermission[]> = {
  ORG_OWNER: [
    'project:create', 'project:read', 'requirement:create', 'requirement:approve',
    'rfq:create', 'rfq:publish', 'rfq:read_buyer', 'quotation:read_buyer',
    'comparison:view', 'approval:decide', 'award:execute', 'po:read',
    'delivery:receive_grn', 'invoice:reconcile_buyer', 'dispute:raise',
    'dispute:resolve', 'analytics:view',
  ],
  PROCUREMENT_HEAD: [
    'project:create', 'project:read', 'requirement:create', 'requirement:approve',
    'rfq:create', 'rfq:publish', 'rfq:read_buyer', 'quotation:read_buyer',
    'comparison:view', 'approval:decide', 'award:execute', 'po:read',
    'delivery:receive_grn', 'invoice:reconcile_buyer', 'dispute:raise',
    'dispute:resolve', 'analytics:view',
  ],
  PROCUREMENT_MANAGER: [
    'project:read', 'requirement:create', 'requirement:approve',
    'rfq:create', 'rfq:publish', 'rfq:read_buyer', 'quotation:read_buyer',
    'comparison:view', 'approval:decide', 'award:execute', 'po:read',
    'delivery:receive_grn', 'dispute:raise', 'analytics:view',
  ],
  PROCUREMENT_EXECUTIVE: [
    'project:read', 'requirement:create', 'rfq:create', 'rfq:publish',
    'rfq:read_buyer', 'quotation:read_buyer', 'comparison:view', 'po:read',
    'delivery:receive_grn', 'dispute:raise', 'analytics:view',
  ],
  PROJECT_MANAGER: [
    'project:create', 'project:read', 'requirement:create', 'requirement:approve',
    'rfq:read_buyer', 'comparison:view', 'approval:decide', 'po:read',
    'delivery:receive_grn', 'dispute:raise', 'analytics:view',
  ],
  FINANCE_MANAGER: [
    'project:read', 'rfq:read_buyer', 'quotation:read_buyer', 'comparison:view',
    'approval:decide', 'po:read', 'invoice:reconcile_buyer', 'dispute:raise',
    'analytics:view',
  ],
  APPROVER: [
    'project:read', 'rfq:read_buyer', 'quotation:read_buyer', 'comparison:view',
    'approval:decide', 'po:read', 'analytics:view',
  ],
  SUPPLIER_OWNER: [
    'rfq:read_supplier_invited', 'quotation:submit', 'quotation:read_own',
    'po:read', 'po:confirm_supplier', 'delivery:dispatch',
    'invoice:upload_supplier', 'dispute:raise', 'analytics:view',
  ],
  SUPPLIER_SALES_MANAGER: [
    'rfq:read_supplier_invited', 'quotation:submit', 'quotation:read_own',
    'po:read', 'po:confirm_supplier', 'dispute:raise',
  ],
  SUPPLIER_OPS_MANAGER: [
    'po:read', 'po:confirm_supplier', 'delivery:dispatch',
    'invoice:upload_supplier', 'dispute:raise',
  ],
  PLATFORM_ADMIN: [
    'project:read', 'rfq:read_buyer', 'quotation:read_buyer', 'comparison:view',
    'po:read', 'dispute:resolve', 'analytics:view',
    'admin:verify_org', 'admin:manage_categories', 'admin:audit_logs',
  ],
};

export function hasProcurementPermission(
  roles: readonly string[],
  permission: ProcurementPermission
): boolean {
  for (const role of roles) {
    const normalized = normalizePlatformRole(role);
    if (normalized && ROLE_PERMISSIONS[normalized]?.includes(permission)) {
      return true;
    }
  }
  return false;
}

export function normalizePlatformRole(role: string): ProcurementRole | null {
  const upper = role.toUpperCase();
  if (upper in ROLE_PERMISSIONS) return upper as ProcurementRole;
  if (upper === 'SUPER_ADMIN' || upper === 'ADMIN' || upper === 'FOUNDER') return 'PLATFORM_ADMIN';
  if (upper === 'OWNER') return 'ORG_OWNER';
  if (upper === 'BUYER') return 'PROCUREMENT_MANAGER';
  if (upper === 'SUPPLIER') return 'SUPPLIER_OWNER';
  return null;
}

export function assertOrganisationIsolation(
  actorOrganisationIds: readonly string[],
  targetOrganisationId: string,
  isPlatformAdmin = false
): { allowed: boolean; reason?: string } {
  if (isPlatformAdmin) return { allowed: true };
  if (!targetOrganisationId) {
    return { allowed: false, reason: 'TENANT_ISOLATION_ERROR: Missing target organisation scope' };
  }
  if (!actorOrganisationIds.includes(targetOrganisationId)) {
    return {
      allowed: false,
      reason: 'FORBIDDEN_CROSS_TENANT_ACCESS: You are not authorised to access another organisation’s procurement records.',
    };
  }
  return { allowed: true };
}

/**
 * Enforces Separation of Duties:
 * The user who created an RFQ cannot unilaterally self-approve or self-award above the configured threshold.
 */
export function evaluateSeparationOfDuties(params: {
  rfqCreatorUserId: string;
  actorUserId: string;
  actorRoles: readonly string[];
  amountPaise: bigint;
  selfApprovalLimitPaise?: bigint;
}): { allowed: boolean; reason?: string } {
  const limit = params.selfApprovalLimitPaise ?? BigInt(50_000_00); // ₹50,000 default self-approval cap

  if (!hasProcurementPermission(params.actorRoles, 'approval:decide') &&
      !hasProcurementPermission(params.actorRoles, 'award:execute')) {
    return {
      allowed: false,
      reason: 'FORBIDDEN_ROLE: Your role does not hold approval or purchase award authority.',
    };
  }

  if (params.rfqCreatorUserId === params.actorUserId && params.amountPaise > limit) {
    return {
      allowed: false,
      reason:
        'SEPARATION_OF_DUTIES_VIOLATION: The user who created this RFQ cannot self-approve or award purchases exceeding the dual-control threshold. An independent authorised approver is required.',
    };
  }

  return { allowed: true };
}
