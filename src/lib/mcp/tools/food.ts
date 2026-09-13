import { z } from 'zod';
import { MCPTool } from '../types';
import { SwiggyAdapter } from '@/lib/orchestration/adapters/swiggy.adapter';

const swiggyAdapter = new SwiggyAdapter();

export const swiggySearchRestaurantsTool: MCPTool = {
  name: 'swiggy_search_restaurants',
  description: 'Search for active restaurants, ratings, delivery times, and price bands on Swiggy by query and location.',
  category: 'food',
  riskLevel: 'READ_ONLY',
  requiredScopes: ['food:read'],
  requiresApproval: false,
  timeoutMs: 8000,
  inputSchema: z.object({
    query: z.string().min(1, 'Query is required'),
    city: z.string().default('Ahmedabad'),
    maxPriceINR: z.number().optional(),
    dietary: z.enum(['VEG', 'NON_VEG', 'ANY']).optional().default('ANY'),
    minRating: z.number().optional().default(4.0),
  }),
  outputSchema: z.object({
    restaurants: z.array(z.any()),
    count: z.number(),
  }),
  execute: async (input: any) => {
    const venues = await swiggyAdapter.search({
      category: 'food',
      rawInput: input.query,
      constraints: {
        city: input.city,
        maxPrice: input.maxPriceINR,
      },
    });

    const filtered = venues
      .filter((v: any) => (input.minRating ? (v.rating || 4.2) >= input.minRating : true))
      .map((v: any) => ({
        id: v.id,
        name: v.title || v.providerName,
        area: 'Bodakdev / SG Highway',
        rating: 4.5,
        priceForTwo: v.priceAmount || 700,
        cuisine: input.query,
        isPureVeg: true,
        estimatedDeliveryMin: 32,
      }));

    return {
      success: true,
      data: {
        restaurants: filtered,
        count: filtered.length,
      },
      isSandbox: true,
    };
  },
};

export const swiggyGetMenuTool: MCPTool = {
  name: 'swiggy_get_restaurant_menu',
  description: 'Fetch the real-time menu, pricing, item descriptions, and veg/non-veg flags for a specific restaurant.',
  category: 'food',
  riskLevel: 'READ_ONLY',
  requiredScopes: ['food:read'],
  requiresApproval: false,
  timeoutMs: 6000,
  inputSchema: z.object({
    restaurantId: z.string(),
    filterCategory: z.string().optional(),
  }),
  outputSchema: z.object({
    restaurantId: z.string(),
    items: z.array(z.any()),
  }),
  execute: async (input) => {
    const items = [
      { id: 'item_veg_biryani_01', name: 'Special Subz Dum Biryani', priceINR: 340, isVeg: true, inStock: true, description: 'Slow cooked fragrant basmati rice with farm vegetables and saffron.' },
      { id: 'item_veg_biryani_02', name: 'Hyderabadi Paneer Biryani', priceINR: 380, isVeg: true, inStock: true, description: 'Char-grilled cottage cheese cubes cooked in rich aromatic biryani gravy.' },
      { id: 'item_raita_01', name: 'Burani Garlic Raita', priceINR: 80, isVeg: true, inStock: true, description: 'Whisked hung curd tempered with roasted garlic and cumin.' },
      { id: 'item_gulab_jamun_01', name: 'Gulab Jamun (2 Pcs)', priceINR: 110, isVeg: true, inStock: true, description: 'Hot khoya dumplings soaked in rose sugar syrup.' }
    ];

    return {
      success: true,
      data: {
        restaurantId: input.restaurantId,
        items,
      },
      isSandbox: true,
    };
  },
};

export const swiggyCreateFoodOrderTool: MCPTool = {
  name: 'swiggy_create_food_order',
  description: 'Execute an authorized food delivery order on Swiggy with specified items and delivery address.',
  category: 'food',
  riskLevel: 'LOW_FINANCIAL',
  requiredScopes: ['food:order:create'],
  requiresApproval: true,
  timeoutMs: 12000,
  inputSchema: z.object({
    restaurantId: z.string(),
    restaurantName: z.string(),
    items: z.array(
      z.object({
        itemId: z.string(),
        name: z.string(),
        quantity: z.number().min(1),
        priceINR: z.number(),
      })
    ),
    deliveryAddress: z.string(),
    specialInstructions: z.string().optional(),
    maxTotalINR: z.number(),
  }),
  outputSchema: z.object({
    orderId: z.string(),
    restaurant: z.string(),
    totalAmountINR: z.number(),
    estimatedDeliveryTime: z.string(),
    status: z.string(),
  }),
  execute: async (input: any, context: any) => {
    const totalAmountINR = input.items.reduce((sum: number, item: any) => sum + item.priceINR * item.quantity, 0);

    if (totalAmountINR > input.maxTotalINR) {
      return {
        success: false,
        error: `Total amount ₹${totalAmountINR} exceeds client constraint ₹${input.maxTotalINR}.`,
      };
    }

    const orderId = `SWIGGY-ORD-${Date.now().toString().slice(-6)}`;

    return {
      success: true,
      data: {
        orderId,
        restaurant: input.restaurantName,
        totalAmountINR,
        estimatedDeliveryTime: '35 mins',
        status: 'CONFIRMED_PREPARING',
      },
      providerReference: orderId,
      costPaise: totalAmountINR * 100,
      isSandbox: true,
      metadata: {
        idempotencyKey: context.idempotencyKey,
        deliveryAddress: input.deliveryAddress,
      },
    };
  },
};

export const swiggyTrackOrderTool: MCPTool = {
  name: 'swiggy_track_order',
  description: 'Check real-time live status, rider position, and delivery ETA for an active food order.',
  category: 'food',
  riskLevel: 'READ_ONLY',
  requiredScopes: ['food:read'],
  requiresApproval: false,
  timeoutMs: 5000,
  inputSchema: z.object({
    orderId: z.string(),
  }),
  execute: async (input) => {
    return {
      success: true,
      data: {
        orderId: input.orderId,
        status: 'OUT_FOR_DELIVERY',
        deliveryPartnerName: 'Ramesh Patel',
        deliveryPartnerPhone: '+91 98765 43210',
        etaMinutes: 14,
      },
      isSandbox: true,
    };
  },
};

export const foodMCPTools: MCPTool[] = [
  swiggySearchRestaurantsTool,
  swiggyGetMenuTool,
  swiggyCreateFoodOrderTool,
  swiggyTrackOrderTool,
];
