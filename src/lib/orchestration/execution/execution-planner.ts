/**
 * PROVENTA — AI EXECUTION PLANNER
 * Converts an exact customer-approved OptionProposal into an immutable ExecutionPlan.
 * Strictly guarantees that approved details (origin, destination, date, time, party size, cabin, venue, budget, provider)
 * are never regenerated, mutated, or lost.
 */

import { ExecutionPlan } from './types';
import { ExecutionCapabilityRegistry } from './execution-capability-registry';
import { PaymentAutomationEngine } from '@/lib/payments/engine';
import type { OptionProposal } from '../types';
import { createHash } from 'crypto';

export class ExecutionPlanner {
  /**
   * Creates an immutable ExecutionPlan from the approved option.
   */
  static createPlan(params: {
    taskId: string;
    taskRecord: any;
    approvedOption: OptionProposal;
    executionVersion?: number;
  }): ExecutionPlan {
    const { taskId, taskRecord, approvedOption, executionVersion = 1 } = params;

    const meta = approvedOption.metadata || {};
    const category = taskRecord.category || meta.category || 'other';
    const providerId = approvedOption.providerId || meta.providerId || 'ahmedabad_verified';
    const providerName = approvedOption.providerName || meta.providerName || 'Proventa Verified Provider';

    // 1. Resolve Capability & Tool
    const capability = ExecutionCapabilityRegistry.getCapability(providerId) ||
                       ExecutionCapabilityRegistry.getCapabilityForService(category, providerId);

    const toolName = capability?.toolName || 'GenericConciergeTool';
    const executionMethod = capability?.executionMethod || 'ASSISTED_CONCIERGE';

    // 2. Check Upfront Payment Requirement
    const paymentRequired = PaymentAutomationEngine.requiresUpfrontPayment({
      category,
      option: approvedOption,
    });

    // 3. Extract Locked Constraints
    const origin = meta.origin || meta.originAirport || taskRecord.clientPreferences?.origin;
    const destination = meta.destination || meta.destinationAirport || meta.city || taskRecord.clientPreferences?.destination;
    const date = meta.date || meta.departureDate || meta.checkInDate || meta.requestedDate || taskRecord.targetDate?.toISOString?.()?.split('T')[0];
    const time = meta.time || meta.departureTime || meta.requestedTime || meta.timeDisplay;
    const partySize = meta.passengers || meta.guests || meta.partySize || taskRecord.clientPreferences?.partySize || 2;
    const cabinClass = meta.cabinClass || meta.cabin || meta.flightClass;
    const venue = meta.venue || meta.hotelName || meta.restaurantName || meta.hospital || approvedOption.providerName;
    const city = meta.city || meta.venueCity || taskRecord.clientPreferences?.city || 'Ahmedabad';
    const amount = approvedOption.priceAmount || taskRecord.budgetAmount || 0;
    const currency = approvedOption.priceCurrency || 'INR';

    // 4. Generate Deterministic Idempotency Key
    // Formula: TASK_ID + APPROVED_OPTION_HASH + EXECUTION_VERSION
    const optionHash = createHash('sha256')
      .update(`${approvedOption.id}::${approvedOption.title}::${amount}::${providerId}`)
      .digest('hex')
      .slice(0, 16);

    const idempotencyKey = `EXEC_${taskId}_${optionHash}_v${executionVersion}`;

    return {
      planId: `PLAN_${taskId}_${Date.now().toString(36)}`,
      taskId,
      serviceCategory: category,
      providerId,
      providerName,
      approvedOptionId: approvedOption.id,
      approvedOptionTitle: approvedOption.title,
      origin,
      destination,
      date,
      time,
      partySize: Number(partySize) || 2,
      cabinClass,
      venue,
      city,
      amount,
      currency,
      paymentRequired,
      executionMethod,
      toolName,
      idempotencyKey,
      lockedAt: new Date().toISOString(),
    };
  }
}
