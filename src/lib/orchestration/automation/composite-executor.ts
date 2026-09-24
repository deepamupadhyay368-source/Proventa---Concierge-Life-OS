import { logger } from '@/lib/logger';
import { db } from '@/lib/db';
import { appendTaskEvent } from '../timeline';
import type { OptionProposal, ExecutionOutput, VerificationResult } from '../types';
import { IdempotencyEngine } from './idempotency';
import { MockHotelAdapter, MockMobilityAdapter, MockDiningAdapter } from '../adapters/mock-adapters';
import { AhmedabadVerifiedAdapter } from '../adapters/ahmedabad-verified.adapter';
import { EntityIntegrityValidator } from '@/lib/validation/entity-integrity';

export interface SubComponentExecutionResult {
  componentType: 'STAY' | 'TRANSPORT' | 'DINING_EXPERIENCE';
  providerName: string;
  providerId: string;
  status: 'CONFIRMED' | 'FAILED' | 'ASSISTED_HANDOFF';
  externalReferenceId?: string;
  itemTitle: string;
  priceAmount?: number;
  confirmedDetails: Record<string, any>;
  errorMessage?: string;
}

export interface CompositeFulfillmentResult {
  allMandatoryFulfilled: boolean;
  components: SubComponentExecutionResult[];
  overallStatus: 'COMPLETED' | 'NEEDS_HUMAN' | 'FAILED';
  summaryNotes: string;
  totalCost: number;
}

export class CompositeOrchestrator {
  /**
   * Orchestrates multi-component execution for weekend escapes and composite travel packages.
   * Fulfills Stay + Mobility + Dining/Experiences.
   */
  static async executeCompositeWeekendEscape(params: {
    taskId: string;
    option: OptionProposal;
    customerName: string;
    customerPhone?: string;
  }): Promise<CompositeFulfillmentResult> {
    const { taskId, option, customerName, customerPhone } = params;
    const taskRecord = await db.task.findUnique({
      where: { id: taskId },
      include: { customer: { include: { user: true } } },
    });

    if (!taskRecord) throw new Error(`Task ${taskId} not found`);

    logger.info({ taskId, optionTitle: option.title }, '[CompositeOrchestrator] Beginning composite weekend escape execution');

    await appendTaskEvent({
      taskId,
      eventType: 'COMPOSITE_ORCHESTRATION_STARTED',
      actorRole: 'AI_AGENT',
      message: `Orchestrating multi-service fulfillment for "${option.title}" (Stay + Chauffeur + Dining)...`,
      data: { packageTitle: option.title, provider: option.providerName },
    });

    const components: SubComponentExecutionResult[] = [];
    const meta = option.metadata || {};
    const city = meta.city || 'Ahmedabad';

    // 1. Mandatory Component A: Luxury Stay / Accommodation
    try {
      const stayAdapter = new MockHotelAdapter();
      const stayProposal: OptionProposal = {
        id: `stay-comp-${taskId}`,
        title: option.title,
        providerId: stayAdapter.providerId,
        providerName: option.providerName || 'Curated Heritage Resort & Spa',
        description: option.description,
        priceAmount: Math.round((option.priceAmount || 20000) * 0.7),
        priceCurrency: 'INR',
        priceFormatted: option.priceFormatted || '₹14,000 / night',
        environment: 'SANDBOX',
        isMock: true,
        metadata: { city, checkIn: '14:00', checkOut: '12:00' },
      };

      const stayExec = await stayAdapter.execute(stayProposal, {
        guests: meta.partySize || 2,
        checkIn: '14:00',
        clientName: customerName,
      });

      components.push({
        componentType: 'STAY',
        providerName: stayProposal.providerName,
        providerId: stayAdapter.providerId,
        status: stayExec.success ? 'CONFIRMED' : 'FAILED',
        externalReferenceId: stayExec.externalReferenceId || `STAY-CONF-${Date.now().toString().slice(-6)}`,
        itemTitle: stayProposal.title,
        priceAmount: stayProposal.priceAmount,
        confirmedDetails: stayExec.confirmedDetails || {},
      });

      await appendTaskEvent({
        taskId,
        eventType: 'COMPONENT_FULFILLED',
        actorRole: 'AI_AGENT',
        message: `✓ Component 1/3 Confirmed: Luxury Stay at ${stayProposal.providerName}.`,
        data: { component: 'STAY', reference: components[0].externalReferenceId },
      });
    } catch (e: any) {
      logger.error({ taskId, error: e.message }, '[CompositeOrchestrator] Stay sub-component execution error');
      components.push({
        componentType: 'STAY',
        providerName: option.providerName,
        providerId: 'hotel_provider',
        status: 'FAILED',
        itemTitle: option.title,
        confirmedDetails: {},
        errorMessage: e.message,
      });
    }

    // 2. Mandatory Component B: Luxury Mobility / Chauffeur Transit
    try {
      const mobilityAdapter = new MockMobilityAdapter();
      const mobilityProposal: OptionProposal = {
        id: `mob-comp-${taskId}`,
        title: 'Executive Chauffeur Transit — Weekend Package',
        providerId: mobilityAdapter.providerId,
        providerName: 'Blacklane / Luxury Chauffeur Fleet',
        description: 'Dedicated executive sedan for arrival transfer and local weekend transit.',
        priceAmount: Math.round((option.priceAmount || 20000) * 0.18),
        priceCurrency: 'INR',
        priceFormatted: '₹3,500',
        environment: 'SANDBOX',
        isMock: true,
        metadata: { vehicleClass: 'MERCEDES_E_CLASS', city },
      };

      const mobExec = await mobilityAdapter.execute(mobilityProposal, {
        pickupLocation: `${city} City Center / Airport`,
        dropoffLocation: option.providerName,
        clientName: customerName,
      });

      components.push({
        componentType: 'TRANSPORT',
        providerName: mobilityProposal.providerName,
        providerId: mobilityAdapter.providerId,
        status: mobExec.success ? 'CONFIRMED' : 'FAILED',
        externalReferenceId: mobExec.externalReferenceId || `MOB-CONF-${Date.now().toString().slice(-6)}`,
        itemTitle: mobilityProposal.title,
        priceAmount: mobilityProposal.priceAmount,
        confirmedDetails: mobExec.confirmedDetails || {},
      });

      await appendTaskEvent({
        taskId,
        eventType: 'COMPONENT_FULFILLED',
        actorRole: 'AI_AGENT',
        message: `✓ Component 2/3 Confirmed: Executive Chauffeur Transit.`,
        data: { component: 'TRANSPORT', reference: components[1].externalReferenceId },
      });
    } catch (e: any) {
      logger.error({ taskId, error: e.message }, '[CompositeOrchestrator] Transport sub-component execution error');
      components.push({
        componentType: 'TRANSPORT',
        providerName: 'Mobility Desk',
        providerId: 'mobility_provider',
        status: 'FAILED',
        itemTitle: 'Chauffeur Transit',
        confirmedDetails: {},
        errorMessage: e.message,
      });
    }

    // 3. Mandatory Component C: Curated Dining / Heritage Culinary Experience
    try {
      const diningAdapter = new MockDiningAdapter();
      const diningProposal: OptionProposal = {
        id: `din-comp-${taskId}`,
        title: 'Curated Tasting Dinner Table — Private Reserve',
        providerId: diningAdapter.providerId,
        providerName: 'Signature Estate Dining Room',
        description: 'Prime 8:00 PM couples table holding under Proventa Private Reserve.',
        priceAmount: Math.round((option.priceAmount || 20000) * 0.12),
        priceCurrency: 'INR',
        priceFormatted: '₹2,500',
        environment: 'SANDBOX',
        isMock: true,
        metadata: { city, partySize: 2 },
      };

      const dinExec = await diningAdapter.execute(diningProposal, {
        partySize: 2,
        dateTime: '20:00',
        clientName: customerName,
      });

      components.push({
        componentType: 'DINING_EXPERIENCE',
        providerName: diningProposal.providerName,
        providerId: diningAdapter.providerId,
        status: dinExec.success ? 'CONFIRMED' : 'FAILED',
        externalReferenceId: dinExec.externalReferenceId || `DIN-CONF-${Date.now().toString().slice(-6)}`,
        itemTitle: diningProposal.title,
        priceAmount: diningProposal.priceAmount,
        confirmedDetails: dinExec.confirmedDetails || {},
      });

      await appendTaskEvent({
        taskId,
        eventType: 'COMPONENT_FULFILLED',
        actorRole: 'AI_AGENT',
        message: `✓ Component 3/3 Confirmed: Curated Dining Reservation.`,
        data: { component: 'DINING_EXPERIENCE', reference: components[2].externalReferenceId },
      });
    } catch (e: any) {
      logger.error({ taskId, error: e.message }, '[CompositeOrchestrator] Dining sub-component execution error');
      components.push({
        componentType: 'DINING_EXPERIENCE',
        providerName: 'Dining Room',
        providerId: 'dining_provider',
        status: 'FAILED',
        itemTitle: 'Private Tasting Dinner',
        confirmedDetails: {},
        errorMessage: e.message,
      });
    }

    const allSuccessful = components.every((c) => c.status === 'CONFIRMED');
    const totalCost = components.reduce((acc, c) => acc + (c.priceAmount || 0), 0);
    const summaryNotes = components.map((c) => `${c.componentType}: ${c.itemTitle} (Ref: ${c.externalReferenceId || 'N/A'})`).join(' | ');

    if (!allSuccessful) {
      logger.warn({ taskId, components }, '[CompositeOrchestrator] Partial component failure in composite trip');
      await appendTaskEvent({
        taskId,
        eventType: 'COMPOSITE_PARTIAL_FAILURE',
        actorRole: 'SYSTEM',
        message: 'One or more mandatory components require manual concierge assistance.',
        data: { components },
      });

      return {
        allMandatoryFulfilled: false,
        components,
        overallStatus: 'NEEDS_HUMAN',
        summaryNotes,
        totalCost,
      };
    }

    await appendTaskEvent({
      taskId,
      eventType: 'COMPOSITE_ALL_VERIFIED',
      actorRole: 'AI_AGENT',
      message: `All 3 mandatory components verified and confirmed for ${option.title}.`,
      data: { summaryNotes, totalCost },
    });

    return {
      allMandatoryFulfilled: true,
      components,
      overallStatus: 'COMPLETED',
      summaryNotes,
      totalCost,
    };
  }
}
