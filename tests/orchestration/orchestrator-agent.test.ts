import { describe, it, expect } from 'vitest';
import { ProventaOrchestratorAgent } from '@/lib/orchestration/orchestrator-agent';

describe('Proventa Orchestrator Agent: Plan Decomposition & Gating', () => {
  it('should autonomously decompose a Swiggy food order request into a multi-step DAG plan', async () => {
    const plan = await ProventaOrchestratorAgent.decomposeRequestToPlan({
      taskId: 'test_task_biryani_01',
      userId: 'user_test_01',
      category: 'food',
      intent: 'Order veg biryani under ₹400',
      rawInput: 'Order me a veg biryani from a highly rated restaurant near me under ₹400',
      entities: {
        cuisine: 'Veg Biryani',
        budgetAmount: 400,
        address: 'Bodakdev, Ahmedabad',
      },
    });

    expect(plan.length).toBe(3);
    expect(plan[0].toolName).toBe('swiggy_search_restaurants');
    expect(plan[1].toolName).toBe('swiggy_get_restaurant_menu');
    expect(plan[2].toolName).toBe('swiggy_create_food_order');
    expect(plan[2].requiresApproval).toBe(true);
    expect(plan[2].estimatedCostPaise).toBe(34000);
  });

  it('should decompose flight booking with Amadeus GDS and Calendar sync steps', async () => {
    const plan = await ProventaOrchestratorAgent.decomposeRequestToPlan({
      taskId: 'test_task_flight_01',
      userId: 'user_test_01',
      category: 'flights',
      intent: 'Book flight from Ahmedabad to Mumbai',
      rawInput: 'Book me a morning flight from Ahmedabad to Mumbai next Monday',
      entities: {
        originAirport: 'AMD',
        destinationAirport: 'BOM',
        departureDate: '2026-09-21',
      },
    });

    expect(plan.length).toBe(3);
    expect(plan[0].toolName).toBe('amadeus_search_flights');
    expect(plan[1].toolName).toBe('amadeus_book_flight');
    expect(plan[2].toolName).toBe('calendar_create_event');
    expect(plan[1].estimatedCostPaise).toBe(1850000);
  });
});
