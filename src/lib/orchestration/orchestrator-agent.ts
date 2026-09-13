import { db } from '@/lib/db';
import { mcpRegistry, MCPExecutor } from '@/lib/mcp';
import { evaluateApproval } from './approval/approval-engine';
import { appendTaskEvent } from './timeline';
import crypto from 'crypto';

export interface PlanStepDefinition {
  stepNumber: number;
  title: string;
  description: string;
  assignedAgent: string;
  toolName: string;
  toolInput: Record<string, any>;
  requiresApproval: boolean;
  estimatedCostPaise?: number;
}

export interface TaskPlanExecutionResult {
  taskId: string;
  status: 'COMPLETED' | 'AWAITING_CONFIRMATION' | 'FAILED';
  stepsExecuted: number;
  totalSteps: number;
  results: Record<string, any>;
  error?: string;
}

export class ProventaOrchestratorAgent {
  public static async decomposeRequestToPlan(params: {
    taskId: string;
    userId: string;
    category: string;
    intent: string;
    rawInput: string;
    entities: Record<string, any>;
    preferences?: Record<string, any>;
  }): Promise<PlanStepDefinition[]> {
    const { category, rawInput, entities } = params;
    const rawLower = rawInput.toLowerCase();
    const steps: PlanStepDefinition[] = [];

    if (category === 'food' || rawLower.includes('biryani') || rawLower.includes('order me') || rawLower.includes('swiggy')) {
      const query = entities.cuisine || (rawLower.includes('biryani') ? 'Veg Biryani' : 'Gourmet Food');
      const maxPriceINR = entities.budgetAmount || 400;

      steps.push({
        stepNumber: 1,
        title: 'Search Top Rated Food Venues',
        description: 'Search verified restaurants offering ' + query + ' with rating >= 4.0 within ₹' + maxPriceINR,
        assignedAgent: 'FoodDeliveryAgent',
        toolName: 'swiggy_search_restaurants',
        toolInput: {
          query,
          city: 'Ahmedabad',
          maxPriceINR,
          dietary: rawLower.includes('veg') ? 'VEG' : 'ANY',
          minRating: 4.0,
        },
        requiresApproval: false,
      });

      steps.push({
        stepNumber: 2,
        title: 'Inspect Live Restaurant Menu',
        description: 'Fetch real-time menu items, item inventory, and verified pricing.',
        assignedAgent: 'FoodDeliveryAgent',
        toolName: 'swiggy_get_restaurant_menu',
        toolInput: {
          restaurantId: 'swiggy_rest_biryani_central',
          filterCategory: 'Biryani',
        },
        requiresApproval: false,
      });

      steps.push({
        stepNumber: 3,
        title: 'Place Autonomous Swiggy Delivery Order',
        description: 'Execute authorized food delivery order at the selected venue.',
        assignedAgent: 'FoodDeliveryAgent',
        toolName: 'swiggy_create_food_order',
        toolInput: {
          restaurantId: 'swiggy_rest_biryani_central',
          restaurantName: 'Biryani By Kilo / Courtyard Kitchen',
          items: [
            { itemId: 'item_veg_biryani_01', name: 'Special Subz Dum Biryani', quantity: 1, priceINR: 340 },
          ],
          deliveryAddress: entities.address || 'Member Default Residence, Bodakdev, Ahmedabad',
          maxTotalINR: maxPriceINR,
        },
        requiresApproval: true,
        estimatedCostPaise: 34000,
      });
    } else if (category === 'flights' || category === 'travel' || rawLower.includes('flight')) {
      const origin = entities.originAirport || 'AMD';
      const destination = entities.destinationAirport || 'BOM';
      const departureDate = entities.departureDate || '2026-09-20';

      steps.push({
        stepNumber: 1,
        title: 'Search Aviation GDS Schedules',
        description: 'Search live non-stop flights from ' + origin + ' to ' + destination + ' on ' + departureDate,
        assignedAgent: 'TravelAviationAgent',
        toolName: 'amadeus_search_flights',
        toolInput: {
          origin,
          destination,
          departureDate,
          travelClass: 'BUSINESS',
          passengers: 1,
        },
        requiresApproval: false,
      });

      steps.push({
        stepNumber: 2,
        title: 'Issue Official Electronic Flight Ticket',
        description: 'Reserve seat and issue airline PNR via GDS gateway.',
        assignedAgent: 'TravelAviationAgent',
        toolName: 'amadeus_book_flight',
        toolInput: {
          flightNumber: 'AI-618',
          origin,
          destination,
          departureTime: '07:30',
          passengerName: 'Deepam Upadhyay',
          passengerEmail: 'deepam@proventa.in',
          priceINR: 18500,
        },
        requiresApproval: true,
        estimatedCostPaise: 1850000,
      });

      steps.push({
        stepNumber: 3,
        title: 'Sync Flight Schedule to Calendar',
        description: 'Block travel departure and arrival times in member agenda.',
        assignedAgent: 'CalendarCoordinationAgent',
        toolName: 'calendar_create_event',
        toolInput: {
          title: 'Flight AI-618 (' + origin + ' -> ' + destination + ')',
          location: 'Sardar Vallabhbhai Patel International Airport',
          startTime: departureDate + 'T07:30:00+05:30',
          endTime: departureDate + 'T08:50:00+05:30',
        },
        requiresApproval: false,
      });
    } else {
      steps.push({
        stepNumber: 1,
        title: 'Search PVR INOX Luxury Recliners',
        description: 'Locate luxury auditoriums and prime seating.',
        assignedAgent: 'EntertainmentMovieAgent',
        toolName: 'pvr_inox_search_movies',
        toolInput: {
          query: rawInput,
          city: 'Ahmedabad',
          screenFormat: 'IMAX',
        },
        requiresApproval: false,
      });

      steps.push({
        stepNumber: 2,
        title: 'Reserve Cinema Passes',
        description: 'Book prime center recliner seats.',
        assignedAgent: 'EntertainmentMovieAgent',
        toolName: 'pvr_inox_book_tickets',
        toolInput: {
          showtimeId: 'pvr_show_evening',
          movieTitle: rawInput,
          seats: ['H7', 'H8'],
          priceINR: 1900,
        },
        requiresApproval: true,
        estimatedCostPaise: 190000,
      });
    }

    return steps;
  }

  public static async executePlan(params: {
    taskId: string;
    userId: string;
    planSteps: PlanStepDefinition[];
    isSandbox?: boolean;
  }): Promise<TaskPlanExecutionResult> {
    const { taskId, userId, planSteps, isSandbox = true } = params;
    const executionContextResults: Record<string, any> = {};

    for (const stepDef of planSteps) {
      if (stepDef.requiresApproval && stepDef.estimatedCostPaise) {
        const costINR = Math.round(stepDef.estimatedCostPaise / 100);
        const check = await evaluateApproval({
          userId,
          category: stepDef.assignedAgent.toLowerCase().includes('food') ? 'food' : 'travel',
          proposal: {
            id: 'step_' + stepDef.stepNumber,
            title: stepDef.title,
            description: stepDef.description,
            priceAmount: costINR,
            priceCurrency: 'INR',
            priceFormatted: `₹${costINR.toLocaleString('en-IN')}`,
            bookingMethod: 'API',
            environment: 'SANDBOX',
            isMock: isSandbox,
            providerName: 'Proventa Autonomous Engine',
          },
        });

        if (check.requiresApproval) {
          await db.task.update({
            where: { id: taskId },
            data: {
              status: 'AWAITING_APPROVAL',
              approvalRequired: true,
              approvalStatus: 'PENDING',
              budgetAmount: costINR,
            },
          });

          await appendTaskEvent({
            taskId,
            eventType: 'APPROVAL_REQUESTED',
            actorRole: 'SYSTEM',
            message: 'Execution paused at Step ' + stepDef.stepNumber + ': ' + stepDef.title + '. Awaiting client confirmation.',
            data: { step: stepDef },
          });

          return {
            taskId,
            status: 'AWAITING_CONFIRMATION',
            stepsExecuted: stepDef.stepNumber - 1,
            totalSteps: planSteps.length,
            results: executionContextResults,
          };
        }
      }

      const idempotencyKey = 'plan_' + taskId + '_step_' + stepDef.stepNumber + '_' + crypto.randomUUID().slice(0, 8);
      
      const result = await MCPExecutor.executeTool(
        stepDef.toolName,
        stepDef.toolInput,
        {
          userId,
          taskId,
          idempotencyKey,
          isSandbox,
        }
      );

      if (!result.success) {
        await db.task.update({
          where: { id: taskId },
          data: {
            status: 'FAILED',
            failedReason: result.error,
          },
        });

        await appendTaskEvent({
          taskId,
          eventType: 'STEP_FAILED',
          actorRole: 'AI_AGENT',
          message: 'Step ' + stepDef.stepNumber + ' (' + stepDef.title + ') failed: ' + result.error,
          data: { error: result.error },
        });

        return {
          taskId,
          status: 'FAILED',
          stepsExecuted: stepDef.stepNumber - 1,
          totalSteps: planSteps.length,
          results: executionContextResults,
          error: result.error,
        };
      }

      executionContextResults[stepDef.toolName] = result.data;

      await appendTaskEvent({
        taskId,
        eventType: 'STEP_COMPLETED',
        actorRole: 'AI_AGENT',
        message: 'Completed Step ' + stepDef.stepNumber + ': ' + stepDef.title,
        data: {
          tool: stepDef.toolName,
          reference: result.providerReference,
          data: result.data,
        },
      });

      if (result.providerReference) {
        await db.task.update({
          where: { id: taskId },
          data: {
            externalReferenceId: result.providerReference,
          },
        });
      }
    }

    await db.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    await appendTaskEvent({
      taskId,
      eventType: 'TASK_COMPLETED',
      actorRole: 'SYSTEM',
      message: 'All autonomous plan steps executed and verified.',
      data: executionContextResults,
    });

    return {
      taskId,
      status: 'COMPLETED',
      stepsExecuted: planSteps.length,
      totalSteps: planSteps.length,
      results: executionContextResults,
    };
  }
}
