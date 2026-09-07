import { z } from 'zod';
import type { AgentPermission, ToolRiskLevel } from '../permissions/permissions';
import { AdapterRegistry } from '@/lib/orchestration/adapters';
import type { OptionProposal, ExecutionOutput } from '@/lib/orchestration/types';

export interface AgentTool<TInput = any, TOutput = any> {
  name: string;
  description: string;
  category: string;
  riskLevel: ToolRiskLevel;
  requiredPermission: AgentPermission;
  inputSchema: z.ZodType<TInput>;
  execute: (input: TInput, context?: { customerId?: string; taskId?: string }) => Promise<TOutput>;
}

export class ToolRegistry {
  private static tools: Map<string, AgentTool> = new Map();
  private static initialized = false;

  private static init() {
    if (this.initialized) return;

    // 1. Dining Search Tool
    this.register({
      name: 'searchRestaurants',
      description: 'Search fine dining and verified restaurants matching cuisine, party size, and atmosphere.',
      category: 'dining',
      riskLevel: 'LOW',
      requiredPermission: 'SEARCH',
      inputSchema: z.object({
        query: z.string(),
        partySize: z.number().optional().default(2),
        dateTime: z.string().optional(),
        cuisine: z.string().optional(),
      }),
      execute: async (input) => {
        const adapters = AdapterRegistry.getAdaptersForCategory('dining');
        const proposals: OptionProposal[] = [];
        for (const adapter of adapters) {
          const res = await adapter.search({
            category: 'dining',
            rawInput: `${input.query} ${input.cuisine || ''}`,
            constraints: { partySize: input.partySize, dateTime: input.dateTime },
          });
          proposals.push(...res);
        }
        return proposals;
      },
    });

    // 2. Dining Reservation Tool
    this.register({
      name: 'reserveDining',
      description: 'Execute table reservation with confirmed details.',
      category: 'dining',
      riskLevel: 'MEDIUM',
      requiredPermission: 'RESERVE',
      inputSchema: z.object({
        proposal: z.any(),
        partySize: z.number().default(2),
        dateTime: z.string(),
        specialRequests: z.string().optional(),
      }),
      execute: async (input) => {
        const primaryAdapter = AdapterRegistry.getPrimaryAdapter('dining');
        return primaryAdapter.execute(input.proposal, {
          guests: input.partySize,
          scheduledTime: input.dateTime,
          specialRequests: input.specialRequests,
        });
      },
    });

    // 3. Travel & Hotel Search Tool
    this.register({
      name: 'searchHotels',
      description: 'Search luxury suites, 5-star hotels, and verified properties.',
      category: 'travel',
      riskLevel: 'LOW',
      requiredPermission: 'SEARCH',
      inputSchema: z.object({
        destination: z.string(),
        checkIn: z.string().optional(),
        checkOut: z.string().optional(),
        guests: z.number().optional().default(2),
      }),
      execute: async (input) => {
        const adapters = AdapterRegistry.getAdaptersForCategory('travel');
        const proposals: OptionProposal[] = [];
        for (const adapter of adapters) {
          const res = await adapter.search({
            category: 'travel',
            rawInput: `Hotel in ${input.destination}`,
            constraints: input,
          });
          proposals.push(...res);
        }
        return proposals;
      },
    });

    // 4. Hotel Reservation Tool
    this.register({
      name: 'reserveHotel',
      description: 'Book luxury hotel room or suite.',
      category: 'travel',
      riskLevel: 'HIGH',
      requiredPermission: 'RESERVE',
      inputSchema: z.object({
        proposal: z.any(),
        guestName: z.string().optional(),
        dates: z.string().optional(),
      }),
      execute: async (input) => {
        const adapter = AdapterRegistry.getPrimaryAdapter('travel');
        return adapter.execute(input.proposal, input);
      },
    });

    // 5. Mobility / Chauffeur Dispatch Tool
    this.register({
      name: 'quoteMobility',
      description: 'Search and quote luxury chauffeur and airport transfer services.',
      category: 'mobility',
      riskLevel: 'LOW',
      requiredPermission: 'QUOTE',
      inputSchema: z.object({
        pickupLocation: z.string(),
        dropoffLocation: z.string(),
        pickupTime: z.string().optional(),
        vehicleClass: z.string().optional(),
      }),
      execute: async (input) => {
        const adapters = AdapterRegistry.getAdaptersForCategory('mobility');
        const proposals: OptionProposal[] = [];
        for (const adapter of adapters) {
          const res = await adapter.search({
            category: 'mobility',
            rawInput: `Chauffeur from ${input.pickupLocation} to ${input.dropoffLocation}`,
            constraints: input,
          });
          proposals.push(...res);
        }
        return proposals;
      },
    });

    this.register({
      name: 'dispatchChauffeur',
      description: 'Confirm and dispatch verified executive chauffeur vehicle.',
      category: 'mobility',
      riskLevel: 'MEDIUM',
      requiredPermission: 'RESERVE',
      inputSchema: z.object({
        proposal: z.any(),
        pickupLocation: z.string(),
        dropoffLocation: z.string(),
        pickupTime: z.string(),
      }),
      execute: async (input) => {
        const adapter = AdapterRegistry.getPrimaryAdapter('mobility');
        return adapter.execute(input.proposal, input);
      },
    });

    // 6. Shopping & Luxury Products Tool
    this.register({
      name: 'searchProducts',
      description: 'Locate and verify luxury items, bespoke gifts, and artisan goods.',
      category: 'shopping',
      riskLevel: 'LOW',
      requiredPermission: 'SEARCH',
      inputSchema: z.object({
        query: z.string(),
        category: z.string().optional(),
        budgetMax: z.number().optional(),
      }),
      execute: async (input) => {
        const adapters = AdapterRegistry.getAdaptersForCategory('shopping');
        const proposals: OptionProposal[] = [];
        for (const adapter of adapters) {
          const res = await adapter.search({
            category: 'shopping',
            rawInput: input.query,
            constraints: input,
          });
          proposals.push(...res);
        }
        return proposals;
      },
    });

    this.register({
      name: 'purchaseProduct',
      description: 'Execute purchasing order for verified product.',
      category: 'shopping',
      riskLevel: 'HIGH',
      requiredPermission: 'PURCHASE',
      inputSchema: z.object({
        proposal: z.any(),
        deliveryAddress: z.string().optional(),
        recipientName: z.string().optional(),
      }),
      execute: async (input) => {
        const adapter = AdapterRegistry.getPrimaryAdapter('shopping');
        return adapter.execute(input.proposal, input);
      },
    });

    // 7. Entertainment & Experience Search Tool
    this.register({
      name: 'searchExperiences',
      description: 'Discover VIP passes, cultural tours, and private events.',
      category: 'experiences',
      riskLevel: 'LOW',
      requiredPermission: 'SEARCH',
      inputSchema: z.object({
        experienceType: z.string(),
        date: z.string().optional(),
        attendees: z.number().optional().default(2),
      }),
      execute: async (input) => {
        const adapters = AdapterRegistry.getAdaptersForCategory('experiences');
        const proposals: OptionProposal[] = [];
        for (const adapter of adapters) {
          const res = await adapter.search({
            category: 'experiences',
            rawInput: input.experienceType,
            constraints: input,
          });
          proposals.push(...res);
        }
        return proposals;
      },
    });

    // 8. Home & Estate Services Tool
    this.register({
      name: 'dispatchHomeService',
      description: 'Dispatch verified private estate technicians, electrical, HVAC, or plumbing experts.',
      category: 'home',
      riskLevel: 'MEDIUM',
      requiredPermission: 'RESERVE',
      inputSchema: z.object({
        serviceType: z.string(),
        address: z.string().optional(),
        scheduledSlot: z.string().optional(),
      }),
      execute: async (input) => {
        const adapters = AdapterRegistry.getAdaptersForCategory('home');
        const adapter = adapters[0] || AdapterRegistry.getPrimaryAdapter('home');
        const proposals = await adapter.search({
          category: 'home',
          rawInput: input.serviceType,
          constraints: input,
        });
        const selected = proposals[0] || {
          id: 'prop-home-def',
          providerName: 'Proventa Estate Management Desk',
          title: `Estate Dispatch: ${input.serviceType}`,
          description: 'Emergency verified maintenance technician dispatch',
          priceCurrency: 'INR',
          priceFormatted: '₹1,500',
        };
        return adapter.execute(selected, input);
      },
    });

    // 9. Calendar / Appointment Coordination Tool
    this.register({
      name: 'scheduleAppointment',
      description: 'Coordinate calendar slot and reserve wellness or meeting appointment.',
      category: 'appointments',
      riskLevel: 'LOW',
      requiredPermission: 'CALENDAR_WRITE',
      inputSchema: z.object({
        title: z.string(),
        preferredSlot: z.string(),
        notes: z.string().optional(),
      }),
      execute: async (input) => {
        return {
          success: true,
          providerName: 'Proventa Calendar Coordinator',
          status: 'CONFIRMED',
          externalReferenceId: `CAL-${Date.now().toString(36).toUpperCase()}`,
          confirmedDetails: {
            title: input.title,
            slot: input.preferredSlot,
            notes: input.notes,
          },
        };
      },
    });

    // 10. Concierge Outbound Communication Tool
    this.register({
      name: 'composeConciergeMessage',
      description: 'Draft bespoke communications to clients, vendors, or partner desks.',
      category: 'communication',
      riskLevel: 'LOW',
      requiredPermission: 'MESSAGE',
      inputSchema: z.object({
        recipientType: z.enum(['CUSTOMER', 'VENDOR', 'INTERNAL']),
        subject: z.string(),
        body: z.string(),
      }),
      execute: async (input) => {
        return {
          success: true,
          providerName: 'Proventa Concierge Dispatch Desk',
          status: 'SENT',
          externalReferenceId: `MSG-${Date.now().toString(36).toUpperCase()}`,
          confirmedDetails: input,
        };
      },
    });

    this.initialized = true;
  }

  static register<TInput, TOutput>(tool: AgentTool<TInput, TOutput>) {
    this.tools.set(tool.name, tool);
  }

  static getTool(name: string): AgentTool | undefined {
    this.init();
    return this.tools.get(name);
  }

  static getAllTools(): AgentTool[] {
    this.init();
    return Array.from(this.tools.values());
  }

  static getToolsForCategory(category: string): AgentTool[] {
    this.init();
    const catLower = category.toLowerCase();
    return Array.from(this.tools.values()).filter(
      (t) => t.category.toLowerCase() === catLower || t.category === 'all'
    );
  }
}
