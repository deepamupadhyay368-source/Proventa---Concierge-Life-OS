import { z } from 'zod';
import { MCPTool } from '../types';
import { FlightsAdapter } from '@/lib/orchestration/adapters/flights.adapter';

const flightAdapter = new FlightsAdapter();

export const flightSearchTool: MCPTool = {
  name: 'amadeus_search_flights',
  description: 'Search aviation GDS for scheduled airline flights, cabin classes, departure times, and live pricing.',
  category: 'travel',
  riskLevel: 'READ_ONLY',
  requiredScopes: ['travel:read'],
  requiresApproval: false,
  timeoutMs: 10000,
  inputSchema: z.object({
    origin: z.string().length(3, 'Origin must be 3-letter IATA code'),
    destination: z.string().length(3, 'Destination must be 3-letter IATA code'),
    departureDate: z.string(),
    travelClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).default('ECONOMY'),
    passengers: z.number().default(1),
  }),
  execute: async (input: any) => {
    const flights = await flightAdapter.search({
      category: 'flights',
      rawInput: `Flight from ${input.origin} to ${input.destination} on ${input.departureDate}`,
      constraints: {
        originAirport: input.origin,
        destinationAirport: input.destination,
        departureDate: input.departureDate,
        cabinClass: input.travelClass,
        passengers: input.passengers,
      },
    });

    return {
      success: true,
      data: {
        flights,
        count: flights.length,
      },
      isSandbox: true,
    };
  },
};

export const flightBookTicketTool: MCPTool = {
  name: 'amadeus_book_flight',
  description: 'Create an official airline PNR and ticket booking via Amadeus GDS connection.',
  category: 'travel',
  riskLevel: 'CONSEQUENTIAL_FINANCIAL',
  requiredScopes: ['travel:booking:create'],
  requiresApproval: true,
  timeoutMs: 15000,
  inputSchema: z.object({
    flightNumber: z.string(),
    origin: z.string(),
    destination: z.string(),
    departureTime: z.string(),
    passengerName: z.string(),
    passengerEmail: z.string().email(),
    priceINR: z.number(),
  }),
  execute: async (input, context) => {
    const pnr = `AI-${Date.now().toString().slice(-6)}`;
    return {
      success: true,
      data: {
        pnr,
        airline: 'Air India',
        flightNumber: input.flightNumber,
        passenger: input.passengerName,
        status: 'CONFIRMED',
        ticketIssued: true,
      },
      providerReference: pnr,
      costPaise: input.priceINR * 100,
      isSandbox: true,
      metadata: {
        idempotencyKey: context.idempotencyKey,
      },
    };
  },
};

export const travelMCPTools: MCPTool[] = [flightSearchTool, flightBookTicketTool];
