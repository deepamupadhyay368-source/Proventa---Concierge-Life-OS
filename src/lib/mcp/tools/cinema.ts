import { z } from 'zod';
import { MCPTool } from '../types';
import { CinemaAdapter } from '@/lib/orchestration/adapters/cinema.adapter';

const cinemaAdapter = new CinemaAdapter();

export const cinemaSearchTool: MCPTool = {
  name: 'pvr_inox_search_movies',
  description: 'Search multiplex showtimes, luxury recliners, IMAX laser screenings, and ticket availability across PVR INOX.',
  category: 'entertainment',
  riskLevel: 'READ_ONLY',
  requiredScopes: ['entertainment:read'],
  requiresApproval: false,
  timeoutMs: 8000,
  inputSchema: z.object({
    query: z.string().min(1, 'Movie name or cinema query required'),
    city: z.string().default('Ahmedabad'),
    screenFormat: z.enum(['STANDARD', 'IMAX', '4DX', 'LUXE', 'INSIGNIA']).default('IMAX'),
  }),
  execute: async (input: any) => {
    const options = await cinemaAdapter.search({
      category: 'cinema',
      rawInput: input.query,
      constraints: {
        city: input.city,
        screenFormat: input.screenFormat,
      },
    });

    return {
      success: true,
      data: {
        showtimes: options,
        count: options.length,
      },
      isSandbox: true,
    };
  },
};

export const cinemaBookTicketTool: MCPTool = {
  name: 'pvr_inox_book_tickets',
  description: 'Execute instant seat booking and digital pass issuance for PVR INOX luxury cinemas.',
  category: 'entertainment',
  riskLevel: 'LOW_FINANCIAL',
  requiredScopes: ['entertainment:booking:create'],
  requiresApproval: true,
  timeoutMs: 12000,
  inputSchema: z.object({
    showtimeId: z.string(),
    movieTitle: z.string(),
    seats: z.array(z.string()).min(1),
    priceINR: z.number(),
  }),
  execute: async (input: any, context: any) => {
    const bookingRef = `PVR-${Date.now().toString().slice(-6)}`;
    return {
      success: true,
      data: {
        bookingRef,
        cinema: 'PVR INOX Palladium, Ahmedabad',
        movie: input.movieTitle,
        seats: input.seats,
        status: 'CONFIRMED',
        ticketPassIssued: true,
      },
      providerReference: bookingRef,
      costPaise: input.priceINR * 100,
      isSandbox: true,
      metadata: {
        idempotencyKey: context.idempotencyKey,
      },
    };
  },
};

export const cinemaMCPTools: MCPTool[] = [cinemaSearchTool, cinemaBookTicketTool];
