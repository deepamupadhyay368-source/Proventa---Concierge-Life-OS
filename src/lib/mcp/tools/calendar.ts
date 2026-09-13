import { z } from 'zod';
import { MCPTool } from '../types';

export const calendarCheckConflictsTool: MCPTool = {
  name: 'calendar_check_conflicts',
  description: 'Check user primary calendar for scheduling conflicts before creating dinner or flight bookings.',
  category: 'calendar',
  riskLevel: 'READ_ONLY',
  requiredScopes: ['calendar:events:read'],
  requiresApproval: false,
  timeoutMs: 5000,
  inputSchema: z.object({
    startTime: z.string(),
    endTime: z.string(),
    summary: z.string().optional(),
  }),
  execute: async (input: any) => {
    return {
      success: true,
      data: {
        hasConflict: false,
        conflictingEvents: [],
        slotAvailable: true,
      },
      isSandbox: true,
    };
  },
};

export const calendarCreateEventTool: MCPTool = {
  name: 'calendar_create_event',
  description: 'Sync confirmed concierge booking details (flights, dinners, chauffeur) into user calendar.',
  category: 'calendar',
  riskLevel: 'READ_ONLY',
  requiredScopes: ['calendar:events:write'],
  requiresApproval: false,
  timeoutMs: 6000,
  inputSchema: z.object({
    title: z.string(),
    location: z.string().optional(),
    startTime: z.string(),
    endTime: z.string(),
    description: z.string().optional(),
  }),
  execute: async (input: any, context: any) => {
    const eventId = `CAL-${Date.now().toString().slice(-6)}`;
    return {
      success: true,
      data: {
        eventId,
        title: input.title,
        startTime: input.startTime,
        endTime: input.endTime,
        status: 'CONFIRMED',
      },
      providerReference: eventId,
      isSandbox: true,
      metadata: {
        idempotencyKey: context.idempotencyKey,
      },
    };
  },
};

export const calendarMCPTools: MCPTool[] = [calendarCheckConflictsTool, calendarCreateEventTool];
