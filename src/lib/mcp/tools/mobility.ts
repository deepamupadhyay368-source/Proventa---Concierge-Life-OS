import { z } from 'zod';
import { MCPTool } from '../types';
import { MockMobilityAdapter } from '@/lib/orchestration/adapters/mock-adapters';

const mobilityAdapter = new MockMobilityAdapter();

export const mobilitySearchTool: MCPTool = {
  name: 'chauffeur_search_rides',
  description: 'Search available chauffeured vehicles, airport transfer options, and luxury sedans.',
  category: 'mobility',
  riskLevel: 'READ_ONLY',
  requiredScopes: ['mobility:read'],
  requiresApproval: false,
  timeoutMs: 6000,
  inputSchema: z.object({
    pickupLocation: z.string(),
    dropoffLocation: z.string(),
    pickupTime: z.string().optional(),
    vehicleClass: z.enum(['SEDAN', 'EXECUTIVE_SEDAN', 'LUXURY_SUV']).default('EXECUTIVE_SEDAN'),
  }),
  execute: async (input: any) => {
    const rides = await mobilityAdapter.search({
      category: 'mobility',
      rawInput: `Ride from ${input.pickupLocation} to ${input.dropoffLocation}`,
      constraints: {
        pickup: input.pickupLocation,
        dropoff: input.dropoffLocation,
        vehicleClass: input.vehicleClass,
      },
    });

    return {
      success: true,
      data: {
        rides,
        count: rides.length,
      },
      isSandbox: true,
    };
  },
};

export const mobilityBookRideTool: MCPTool = {
  name: 'chauffeur_dispatch_ride',
  description: 'Dispatch an executive chauffeur for direct airport transit or point-to-point journey.',
  category: 'mobility',
  riskLevel: 'LOW_FINANCIAL',
  requiredScopes: ['mobility:dispatch:create'],
  requiresApproval: true,
  timeoutMs: 12000,
  inputSchema: z.object({
    pickupLocation: z.string(),
    dropoffLocation: z.string(),
    pickupTime: z.string(),
    passengerName: z.string(),
    passengerPhone: z.string(),
    vehicleClass: z.string().default('Executive Sedan'),
    priceINR: z.number(),
  }),
  execute: async (input: any, context: any) => {
    const tripId = `CHAUFF-${Date.now().toString().slice(-6)}`;
    return {
      success: true,
      data: {
        tripId,
        driverName: 'Ramesh Patel',
        vehicle: 'Mercedes-Benz E-Class (GJ-01-XX-9988)',
        status: 'DRIVER_DISPATCHED',
        pickupTime: input.pickupTime,
        pickupLocation: input.pickupLocation,
      },
      providerReference: tripId,
      costPaise: input.priceINR * 100,
      isSandbox: true,
      metadata: {
        idempotencyKey: context.idempotencyKey,
      },
    };
  },
};

export const mobilityMCPTools: MCPTool[] = [mobilitySearchTool, mobilityBookRideTool];
