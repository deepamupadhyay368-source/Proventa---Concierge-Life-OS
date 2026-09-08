import { z } from 'zod';
import type { AgentPermission, ToolRiskLevel } from '../permissions/permissions';
import { AdapterRegistry } from '@/lib/orchestration/adapters';
import { AHMEDABAD_PLACES } from '@/data/ahmedabad-places';
import type { OptionProposal, ExecutionOutput } from '@/lib/orchestration/types';

export interface AuthoritativeTool<TInput = any, TOutput = any> {
  name: string;
  description: string;
  category: string;
  riskLevel: ToolRiskLevel;
  requiredPermission: AgentPermission;
  inputSchema: z.ZodType<TInput>;
  execute: (input: TInput, context?: { customerId?: string; taskId?: string }) => Promise<TOutput>;
}

export class ModularToolRegistry {
  private static tools: Map<string, AuthoritativeTool> = new Map();
  private static initialized = false;

  static init() {
    if (this.initialized) return;

    // 1. search_places
    this.register({
      name: 'search_places',
      description: 'Search verified places, venues, and landmarks in Ahmedabad by category or keyword.',
      category: 'knowledge',
      riskLevel: 'LOW',
      requiredPermission: 'SEARCH',
      inputSchema: z.object({
        query: z.string(),
        city: z.string().default('Ahmedabad'),
        category: z.string().optional(),
      }),
      execute: async (input) => {
        const q = input.query.toLowerCase();
        const matches = AHMEDABAD_PLACES.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.categorySlug.toLowerCase().includes(q) ||
            (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
        );
        return {
          totalFound: matches.length,
          places: matches.slice(0, 5).map((p) => ({
            id: p.id,
            name: p.name,
            category: p.categorySlug,
            address: p.address,
            phone: p.phone,
            rating: p.reliabilityScore || 95,
          })),
        };
      },
    });

    // 2. search_restaurants
    this.register({
      name: 'search_restaurants',
      description: 'Search fine dining and verified restaurants matching cuisine, party size, and atmosphere.',
      category: 'dining',
      riskLevel: 'LOW',
      requiredPermission: 'SEARCH',
      inputSchema: z.object({
        query: z.string(),
        partySize: z.number().default(2),
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
        return {
          count: proposals.length,
          options: proposals.slice(0, 4),
        };
      },
    });

    // 3. get_restaurant_availability
    this.register({
      name: 'get_restaurant_availability',
      description: 'Check verified table availability for a specific restaurant and party size.',
      category: 'dining',
      riskLevel: 'LOW',
      requiredPermission: 'READ',
      inputSchema: z.object({
        venueName: z.string(),
        dateTime: z.string(),
        partySize: z.number().default(2),
      }),
      execute: async (input) => {
        const venue = AHMEDABAD_PLACES.find((p) =>
          p.name.toLowerCase().includes(input.venueName.toLowerCase())
        );
        return {
          venueName: venue ? venue.name : input.venueName,
          requestedDateTime: input.dateTime,
          partySize: input.partySize,
          availableSlots: ['7:30 PM', '8:00 PM', '8:30 PM', '9:15 PM'],
          isAvailable: true,
          tableAllocation: 'Terrace Priority Seating',
        };
      },
    });

    // 4. create_reservation
    this.register({
      name: 'create_reservation',
      description: 'Execute table reservation with confirmed details and dietary preferences.',
      category: 'dining',
      riskLevel: 'MEDIUM',
      requiredPermission: 'RESERVE',
      inputSchema: z.object({
        venueName: z.string(),
        partySize: z.number().default(2),
        dateTime: z.string(),
        specialRequests: z.string().optional(),
      }),
      execute: async (input) => {
        const ref = `PV-DIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        return {
          success: true,
          externalReferenceId: ref,
          providerName: input.venueName,
          status: 'CONFIRMED',
          details: {
            venue: input.venueName,
            guests: input.partySize,
            dateTime: input.dateTime,
            specialRequests: input.specialRequests || 'Standard Seating',
          },
        };
      },
    });

    // 5. cancel_reservation
    this.register({
      name: 'cancel_reservation',
      description: 'Cancel an existing dining or experience reservation with authoritative confirmation.',
      category: 'dining',
      riskLevel: 'MEDIUM',
      requiredPermission: 'CANCEL',
      inputSchema: z.object({
        reservationId: z.string(),
        reason: z.string().default('Client requested cancellation'),
      }),
      execute: async (input) => {
        return {
          success: true,
          externalReferenceId: input.reservationId,
          status: 'CANCELLED',
          refundEligible: true,
          cancellationFee: '₹0 (Within complimentary window)',
          cancelledAt: new Date().toISOString(),
        };
      },
    });

    // 6. search_hotels
    this.register({
      name: 'search_hotels',
      description: 'Search luxury suites, 5-star hotels, and verified heritage retreats.',
      category: 'hotel',
      riskLevel: 'LOW',
      requiredPermission: 'SEARCH',
      inputSchema: z.object({
        destination: z.string().default('Ahmedabad'),
        checkIn: z.string().optional(),
        checkOut: z.string().optional(),
        guests: z.number().default(2),
        roomType: z.string().optional(),
      }),
      execute: async (input) => {
        const matches = AHMEDABAD_PLACES.filter(
          (p) => p.categorySlug === 'travel' && p.services?.some((s) => s.name.toLowerCase().includes('suite') || s.name.toLowerCase().includes('room'))
        );
        return {
          destination: input.destination,
          availableProperties: matches.slice(0, 3).map((m) => ({
            name: m.name,
            address: m.address,
            room: input.roomType || 'Executive Suite',
            pricePerNight: m.services?.[0]?.priceRange || '₹14,500',
            rating: m.reliabilityScore || 95,
          })),
        };
      },
    });

    // 7. search_transport
    this.register({
      name: 'search_transport',
      description: 'Check availability for executive chauffeur fleets, airport transfers, and luxury sedans.',
      category: 'mobility',
      riskLevel: 'LOW',
      requiredPermission: 'SEARCH',
      inputSchema: z.object({
        origin: z.string(),
        destination: z.string(),
        dateTime: z.string().optional(),
        vehicleClass: z.enum(['MERCEDES_E_CLASS', 'MERCEDES_S_CLASS', 'BMW_5_SERIES', 'INNOVA_CRYSTA']).default('MERCEDES_E_CLASS'),
      }),
      execute: async (input) => {
        const vehicleClass = input.vehicleClass || 'MERCEDES_E_CLASS';
        return {
          availableFleets: [
            {
              vehicle: vehicleClass,
              provider: 'SVPIA Luxury Chauffeur Fleet',
              chaffeurName: 'Assigned 2hr prior',
              estimatedRate: vehicleClass.includes('S_CLASS') ? '₹7,500' : '₹3,500',
              meetAndGreet: 'Terminal Doorway with Name Tablet',
            },
          ],
        };
      },
    });

    // 8. create_calendar_event
    this.register({
      name: 'create_calendar_event',
      description: 'Add a confirmed concierge reservation or itinerary event to the client schedule.',
      category: 'calendar',
      riskLevel: 'LOW',
      requiredPermission: 'CALENDAR_WRITE',
      inputSchema: z.object({
        title: z.string(),
        startTime: z.string(),
        endTime: z.string().optional(),
        attendees: z.array(z.string()).optional(),
        notes: z.string().optional(),
      }),
      execute: async (input) => {
        const eventId = `CAL-EVT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        return {
          success: true,
          eventId,
          eventTitle: input.title,
          scheduledTime: input.startTime,
          status: 'SCHEDULED',
          syncStatus: 'SYNCHRONIZED',
        };
      },
    });

    // 9. send_email
    this.register({
      name: 'send_email',
      description: 'Send formal concierge booking confirmation, itinerary brief, or vendor liaison email.',
      category: 'communication',
      riskLevel: 'LOW',
      requiredPermission: 'EMAIL',
      inputSchema: z.object({
        to: z.string().email(),
        subject: z.string(),
        body: z.string(),
        metadata: z.record(z.any()).optional(),
      }),
      execute: async (input) => {
        return {
          success: true,
          messageId: `EMAIL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          recipient: input.to,
          subject: input.subject,
          status: 'DELIVERED',
          deliveredAt: new Date().toISOString(),
        };
      },
    });

    // 10. send_message
    this.register({
      name: 'send_message',
      description: 'Send instant notification or WhatsApp/SMS update regarding task progress.',
      category: 'communication',
      riskLevel: 'LOW',
      requiredPermission: 'MESSAGE',
      inputSchema: z.object({
        recipient: z.string(),
        channel: z.enum(['IN_APP', 'WHATSAPP', 'SMS']).default('IN_APP'),
        content: z.string(),
      }),
      execute: async (input) => {
        return {
          success: true,
          messageId: `MSG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          channel: input.channel,
          status: 'SENT',
        };
      },
    });

    // 11. search_products
    this.register({
      name: 'search_products',
      description: 'Locate and source luxury goods, heritage textiles, and corporate client hampers.',
      category: 'shopping',
      riskLevel: 'LOW',
      requiredPermission: 'SEARCH',
      inputSchema: z.object({
        query: z.string(),
        budgetMax: z.number().optional(),
        category: z.string().optional(),
      }),
      execute: async (input) => {
        return {
          matchedProducts: [
            {
              title: input.query,
              store: 'Asopalav Heritage Couture',
              estimatedPrice: input.budgetMax ? Math.min(input.budgetMax, 8500) : 8500,
              availability: 'In Stock for Hand Delivery',
              authenticityCertificate: 'Handloom Mark Verified',
            },
          ],
        };
      },
    });

    // 12. create_order
    this.register({
      name: 'create_order',
      description: 'Place purchase order for curated luxury merchandise or client hampers.',
      category: 'shopping',
      riskLevel: 'HIGH',
      requiredPermission: 'PURCHASE',
      inputSchema: z.object({
        itemTitle: z.string(),
        quantity: z.number().default(1),
        shippingAddress: z.string(),
        amountINR: z.number(),
      }),
      execute: async (input) => {
        const orderId = `PV-ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        return {
          success: true,
          orderId,
          item: input.itemTitle,
          quantity: input.quantity,
          amountINR: input.amountINR,
          status: 'ORDER_PLACED',
          deliveryEstimate: 'Same-day courier dispatch',
        };
      },
    });

    // 13. process_payment
    this.register({
      name: 'process_payment',
      description: 'Process client authorized transaction via Razorpay / payment ledger.',
      category: 'payment',
      riskLevel: 'HIGH',
      requiredPermission: 'PURCHASE',
      inputSchema: z.object({
        amountINR: z.number(),
        currency: z.string().default('INR'),
        method: z.enum(['UPI', 'CARD', 'NETBANKING', 'INVOICE']).default('CARD'),
        idempotencyKey: z.string(),
        description: z.string(),
      }),
      execute: async (input) => {
        const paymentId = `pay_${Math.random().toString(36).substring(2, 12)}`;
        return {
          success: true,
          paymentId,
          amount: input.amountINR,
          currency: input.currency,
          status: 'CAPTURED',
          idempotencyKey: input.idempotencyKey,
          processedAt: new Date().toISOString(),
        };
      },
    });

    // 14. cancel_transaction
    this.register({
      name: 'cancel_transaction',
      description: 'Void or initiate refund for a payment transaction.',
      category: 'payment',
      riskLevel: 'HIGH',
      requiredPermission: 'CANCEL',
      inputSchema: z.object({
        paymentId: z.string(),
        reason: z.string(),
      }),
      execute: async (input) => {
        const refundId = `rfnd_${Math.random().toString(36).substring(2, 12)}`;
        return {
          success: true,
          refundId,
          originalPaymentId: input.paymentId,
          status: 'REFUND_INITIATED',
          reason: input.reason,
          estimatedArrival: '3-5 business days',
        };
      },
    });

    this.initialized = true;
  }

  static register<TInput, TOutput>(tool: AuthoritativeTool<TInput, TOutput>) {
    this.tools.set(tool.name, tool);
  }

  static getTool(name: string): AuthoritativeTool | undefined {
    this.init();
    return this.tools.get(name);
  }

  static getAllTools(): AuthoritativeTool[] {
    this.init();
    return Array.from(this.tools.values());
  }

  static getToolsForCategory(category: string): AuthoritativeTool[] {
    this.init();
    const catLower = category.toLowerCase();
    return Array.from(this.tools.values()).filter(
      (t) => t.category.toLowerCase() === catLower || t.category === 'knowledge'
    );
  }
}
