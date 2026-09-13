import { describe, it, expect, beforeEach } from 'vitest';
import { mcpRegistry } from '@/lib/mcp/registry';
import { registerAllDefaultMCPTools } from '@/lib/mcp';
import { MCPExecutor } from '@/lib/mcp/executor';

describe('MCP Dynamic Tool Registry & Execution Suite', () => {
  beforeEach(() => {
    registerAllDefaultMCPTools();
  });

  it('should discover all registered MCP tools across categories', () => {
    const tools = mcpRegistry.getAllTools();
    expect(tools.length).toBeGreaterThanOrEqual(10);

    const foodTools = mcpRegistry.getToolsByCategory('food');
    expect(foodTools.map((t) => t.name)).toContain('swiggy_search_restaurants');
    expect(foodTools.map((t) => t.name)).toContain('swiggy_create_food_order');

    const travelTools = mcpRegistry.getToolsByCategory('travel');
    expect(travelTools.map((t) => t.name)).toContain('amadeus_search_flights');
    expect(travelTools.map((t) => t.name)).toContain('amadeus_book_flight');
  });

  it('should validate inputs and execute swiggy_search_restaurants', async () => {
    const result = await MCPExecutor.executeTool(
      'swiggy_search_restaurants',
      { query: 'Veg Biryani', city: 'Ahmedabad', maxPriceINR: 500 },
      { userId: 'test_user_01', isSandbox: true }
    );

    expect(result.success).toBe(true);
    expect(result.data.restaurants).toBeDefined();
    expect(result.data.restaurants.length).toBeGreaterThan(0);
    expect(result.isSandbox).toBe(true);
  });

  it('should reject swiggy_create_food_order when exceeding max total amount', async () => {
    const result = await MCPExecutor.executeTool(
      'swiggy_create_food_order',
      {
        restaurantId: 'rest_01',
        restaurantName: 'Biryani Central',
        items: [{ itemId: 'item_01', name: 'Biryani Platter', quantity: 2, priceINR: 400 }],
        deliveryAddress: 'Bodakdev, Ahmedabad',
        maxTotalINR: 500,
      },
      { userId: 'test_user_01', isSandbox: true }
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('exceeds client constraint');
  });

  it('should successfully execute amadeus_book_flight and generate valid PNR', async () => {
    const result = await MCPExecutor.executeTool(
      'amadeus_book_flight',
      {
        flightNumber: 'AI-618',
        origin: 'AMD',
        destination: 'BOM',
        departureTime: '07:30',
        passengerName: 'Deepam Upadhyay',
        passengerEmail: 'deepam@proventa.in',
        priceINR: 18500,
      },
      { userId: 'test_user_01', isSandbox: true }
    );

    expect(result.success).toBe(true);
    expect(result.data.pnr).toMatch(/^AI-\d+/);
    expect(result.providerReference).toBe(result.data.pnr);
    expect(result.costPaise).toBe(1850000);
  });
});
