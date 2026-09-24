import type { TaskPriority, TaskStatus, UserRole } from '@prisma/client';

export type SLAStatus = 'NORMAL' | 'DUE_SOON' | 'URGENT' | 'OVERDUE';

export interface ConciergeBrief {
  customerName: string;
  customerPhone?: string;
  customerEmail: string;
  category: string;
  originalRequest: string;
  approvedOptionTitle?: string;
  approvedOptionProvider?: string;
  approvedOptionPrice?: string | number;
  partySize?: number;
  targetDateTime?: string;
  targetLocation?: string;
  budgetFormatted?: string;
  customerPreferences?: Record<string, any>;
  specialRequirements?: string[];
  automationAttemptStatus: string;
  handoffReason: string;
  recommendedNextAction: string;
  callScriptDraft?: string;
  missingInformation?: string[];
}

export interface ProviderContactDetails {
  providerId: string;
  name: string;
  venueName?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  bookingMethod: 'PHONE' | 'EMAIL' | 'API' | 'WEBSITE' | 'DIRECT_DESK';
  reliabilityScore?: number;
  notes?: string;
}

export interface HumanExecutionLogEntry {
  id: string;
  contactMethod: 'PHONE' | 'EMAIL' | 'PORTAL' | 'DIRECT_VISIT' | 'WHATSAPP';
  employeeName: string;
  employeeEmail: string;
  contactedAt: string;
  personContacted?: string;
  actionRequested: string;
  providerResponse: string;
  amountQuoted?: number;
  confirmationReference?: string;
  notes?: string;
}

export interface TaskWorkspaceData {
  id: string;
  publicId: string;
  category: string;
  subcategory?: string;
  intent: string;
  originalRequest: string;
  priority: TaskPriority;
  status: TaskStatus;
  isEscalated: boolean;
  assignedAgent: string;
  assignedOperator: string | null;
  claimedAt?: string | null;
  slaStatus: SLAStatus;
  waitingMinutes: number;
  budgetAmount: number | null;
  budgetCurrency: string;
  externalReferenceId: string | null;
  failedReason: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  deadline?: string | null;
  
  customer: {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone?: string | null;
    city?: string | null;
    membershipTier?: string;
    preferences?: Record<string, any>;
    activeTasksCount?: number;
    completedTasksCount?: number;
  };

  brief: ConciergeBrief;
  providerContact?: ProviderContactDetails | null;
  
  approvalHistory: {
    batches: Array<{
      batchId: string;
      batchNumber: number;
      generatedAt: string;
      status: string;
      options: any[];
      rejectedOptionIds?: string[];
      feedback?: string;
    }>;
    approvedOption: any | null;
  };

  events: Array<{
    id: string;
    eventType: string;
    actorRole: string;
    message: string;
    data?: any;
    createdAt: string;
  }>;

  internalNotes: Array<{
    id: string;
    authorName: string;
    authorEmail: string;
    content: string;
    createdAt: string;
  }>;

  communications: Array<{
    id: string;
    direction: 'OUTBOUND' | 'INBOUND';
    channel: 'IN_APP' | 'EMAIL' | 'WHATSAPP';
    sender: string;
    message: string;
    createdAt: string;
    deliveryStatus?: string;
  }>;
}

export interface TeamWorkloadMetric {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  activeTasks: number;
  claimedToday: number;
  completedToday: number;
  avgResolutionMinutes: number;
  isOnline: boolean;
}
