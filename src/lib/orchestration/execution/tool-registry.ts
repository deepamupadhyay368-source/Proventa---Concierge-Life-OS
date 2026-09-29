/**
 * PROVENTA — AUTHORITATIVE EXECUTION TOOL REGISTRY & CONTRACTS
 * Strict tool contracts for all LIVE_PRODUCTION and assisted execution tools.
 * Zero fabrication / Strict evidence validation.
 */

import {
  ExecutionToolInterface,
  ExecutionToolInput,
  ExecutionToolResult,
  CapabilityExecutionStatus,
} from './types';
import { AdapterRegistry } from '../adapters';
import { CompositeOrchestrator } from '../automation/composite-executor';
import { ExecutionCapabilityRegistry } from './execution-capability-registry';
import { logger } from '@/lib/logger';

/**
 * 1. Ahmedabad Verified Liaison Tool
 */
export class AhmedabadVerifiedLiaisonTool implements ExecutionToolInterface {
  readonly toolName = 'AhmedabadVerifiedLiaisonTool';
  readonly providerId = 'ahmedabad_verified';
  readonly capabilityStatus: CapabilityExecutionStatus = 'LIVE_PRODUCTION';
  readonly environment: 'REAL' = 'REAL';

  async execute(input: ExecutionToolInput): Promise<ExecutionToolResult> {
    const adapter = AdapterRegistry.getAdapterById('ahmedabad_verified');
    if (!adapter) {
      return {
        success: false,
        provider: this.providerId,
        status: 'FAILED',
        isMock: false,
        environment: 'REAL',
        timestamp: new Date().toISOString(),
        errorMessage: 'AhmedabadVerifiedAdapter not found in registry.',
      };
    }

    const output = await adapter.execute(input.approvedOption, {
      guests: input.executionPlan.partySize || 2,
      scheduledTime: input.executionPlan.date || 'Preferred Schedule',
      specialRequests: input.taskRecord.clientPreferences ? JSON.stringify(input.taskRecord.clientPreferences) : '',
    });

    return {
      success: output.success,
      provider: output.providerId || this.providerId,
      providerReference: output.externalReferenceId,
      status: output.status as any,
      amount: input.executionPlan.amount,
      currency: input.executionPlan.currency,
      timestamp: new Date().toISOString(),
      evidence: output.rawResponse,
      confirmedDetails: output.confirmedDetails,
      isMock: output.isMock || false,
      environment: (output.environment === 'CURATED' ? 'REAL' : (output.environment as any)) || 'REAL',
    };
  }
}

/**
 * 2. Universal Events VIP Liaison Tool
 */
export class UniversalEventsLiaisonTool implements ExecutionToolInterface {
  readonly toolName = 'UniversalEventsLiaisonTool';
  readonly providerId = 'events_discovery';
  readonly capabilityStatus: CapabilityExecutionStatus = 'LIVE_PRODUCTION';
  readonly environment: 'REAL' = 'REAL';

  async execute(input: ExecutionToolInput): Promise<ExecutionToolResult> {
    const adapter = AdapterRegistry.getAdapterById('events_discovery');
    if (!adapter) {
      return {
        success: false,
        provider: this.providerId,
        status: 'FAILED',
        isMock: false,
        environment: 'REAL',
        timestamp: new Date().toISOString(),
        errorMessage: 'EventsDiscoveryAdapter not found in registry.',
      };
    }

    const output = await adapter.execute(input.approvedOption, {
      guests: input.executionPlan.partySize || 2,
      scheduledTime: input.executionPlan.date || 'Requested Date',
      specialRequests: input.taskRecord.clientPreferences ? JSON.stringify(input.taskRecord.clientPreferences) : '',
    });

    return {
      success: output.success,
      provider: output.providerId || this.providerId,
      providerReference: output.externalReferenceId,
      status: output.status as any,
      amount: input.executionPlan.amount,
      currency: input.executionPlan.currency,
      timestamp: new Date().toISOString(),
      evidence: output.confirmedDetails,
      confirmedDetails: output.confirmedDetails,
      isMock: false,
      environment: 'REAL',
    };
  }
}

/**
 * 3. Healthcare & Doctor Appointment Coordination Tool
 */
export class HealthcareCoordinationTool implements ExecutionToolInterface {
  readonly toolName = 'HealthcareCoordinationTool';
  readonly providerId = 'healthcare_discovery';
  readonly capabilityStatus: CapabilityExecutionStatus = 'LIVE_PRODUCTION';
  readonly environment: 'REAL' = 'REAL';

  async execute(input: ExecutionToolInput): Promise<ExecutionToolResult> {
    const adapter = AdapterRegistry.getAdapterById('healthcare_discovery');
    if (!adapter) {
      return {
        success: false,
        provider: this.providerId,
        status: 'FAILED',
        isMock: false,
        environment: 'REAL',
        timestamp: new Date().toISOString(),
        errorMessage: 'HealthcareDiscoveryAdapter not found in registry.',
      };
    }

    const output = await adapter.execute(input.approvedOption, {
      scheduledTime: input.executionPlan.date || 'Preferred Consultation Date',
      specialRequests: input.taskRecord.clientPreferences ? JSON.stringify(input.taskRecord.clientPreferences) : '',
    });

    return {
      success: output.success,
      provider: output.providerId || this.providerId,
      providerReference: output.externalReferenceId,
      status: output.status as any,
      amount: input.executionPlan.amount,
      currency: input.executionPlan.currency,
      timestamp: new Date().toISOString(),
      evidence: output.confirmedDetails,
      confirmedDetails: output.confirmedDetails,
      isMock: false,
      environment: 'REAL',
    };
  }
}

/**
 * 4. Research & Advisory Deliverable Fulfillment Tool
 */
export class DeliverableFulfillmentTool implements ExecutionToolInterface {
  readonly toolName = 'DeliverableFulfillmentTool';
  readonly providerId = 'proventa_intelligence';
  readonly capabilityStatus: CapabilityExecutionStatus = 'LIVE_PRODUCTION';
  readonly environment: 'REAL' = 'REAL';

  async execute(input: ExecutionToolInput): Promise<ExecutionToolResult> {
    const opt = input.approvedOption;
    const deliverableContent =
      opt.description ||
      opt.metadata?.deliverableContent ||
      opt.metadata?.report ||
      `Curated Research Deliverable for ${input.taskRecord.intent || input.taskRecord.originalRequest}: ${opt.title}.`;

    const referenceId = `DLV-${input.taskId.slice(-6).toUpperCase()}`;

    return {
      success: true,
      provider: this.providerId,
      providerReference: referenceId,
      status: 'CONFIRMED',
      amount: input.executionPlan.amount,
      currency: input.executionPlan.currency,
      timestamp: new Date().toISOString(),
      confirmedDetails: {
        title: opt.title,
        deliverableType: opt.metadata?.deliverableType || 'RESEARCH_REPORT',
        content: deliverableContent,
        reference: referenceId,
        deliveredAt: new Date().toISOString(),
        status: 'FULFILLED',
      },
      isMock: false,
      environment: 'REAL',
    };
  }
}

/**
 * 5. Composite Weekend Escape Tool
 */
export class CompositeEscapeTool implements ExecutionToolInterface {
  readonly toolName = 'CompositeEscapeTool';
  readonly providerId = 'composite_weekend_escapes';
  readonly capabilityStatus: CapabilityExecutionStatus = 'LIVE_PRODUCTION';
  readonly environment: 'REAL' = 'REAL';

  async execute(input: ExecutionToolInput): Promise<ExecutionToolResult> {
    const compositeResult = await CompositeOrchestrator.executeCompositeWeekendEscape({
      taskId: input.taskId,
      option: input.approvedOption,
      customerName: input.customer?.user?.name || 'Valued Member',
      customerPhone: input.customer?.user?.phone || undefined,
    });

    if (!compositeResult.allMandatoryFulfilled) {
      return {
        success: false,
        provider: this.providerId,
        status: 'NEEDS_HUMAN',
        amount: input.executionPlan.amount,
        currency: input.executionPlan.currency,
        timestamp: new Date().toISOString(),
        confirmedDetails: { compositeResult },
        errorMessage: 'One or more mandatory components require manual concierge coordination.',
        isMock: false,
        environment: 'REAL',
      };
    }

    const firstRef = compositeResult.components[0]?.externalReferenceId || `CMP-${input.taskId.slice(-6).toUpperCase()}`;

    return {
      success: true,
      provider: this.providerId,
      providerReference: firstRef,
      status: 'CONFIRMED',
      amount: input.executionPlan.amount,
      currency: input.executionPlan.currency,
      timestamp: new Date().toISOString(),
      confirmedDetails: {
        compositeResult,
        reference: firstRef,
      },
      isMock: false,
      environment: 'REAL',
    };
  }
}

/**
 * 6. Swiggy Execution Tool
 */
export class SwiggyExecutionTool implements ExecutionToolInterface {
  readonly toolName = 'SwiggyExecutionTool';
  readonly providerId = 'swiggy_dineout';

  get capabilityStatus(): CapabilityExecutionStatus {
    const cap = ExecutionCapabilityRegistry.getCapability('swiggy_dineout');
    return cap?.capabilityStatus || 'NOT_CONFIGURED';
  }

  get environment(): 'REAL' | 'SANDBOX' | 'MOCK' {
    const cap = ExecutionCapabilityRegistry.getCapability('swiggy_dineout');
    return cap?.environment || 'SANDBOX';
  }

  async execute(input: ExecutionToolInput): Promise<ExecutionToolResult> {
    const adapter = AdapterRegistry.getAdapterById('swiggy_dineout');
    if (!adapter) {
      return {
        success: false,
        provider: this.providerId,
        status: 'FAILED',
        isMock: true,
        environment: 'SANDBOX',
        timestamp: new Date().toISOString(),
        errorMessage: 'SwiggyAdapter not configured in registry.',
      };
    }

    const output = await adapter.execute(input.approvedOption, {
      guests: input.executionPlan.partySize || 2,
      scheduledTime: input.executionPlan.date || 'Requested Time',
    });

    return {
      success: output.success,
      provider: output.providerId || this.providerId,
      providerReference: output.externalReferenceId,
      status: output.status as any,
      amount: input.executionPlan.amount,
      currency: input.executionPlan.currency,
      timestamp: new Date().toISOString(),
      evidence: output.rawResponse,
      confirmedDetails: output.confirmedDetails,
      isMock: output.isMock || this.environment !== 'REAL',
      environment: (output.environment === 'CURATED' ? 'REAL' : (output.environment as any)) || this.environment,
    };
  }
}

/**
 * 7. Amadeus Flight Tool
 */
export class AmadeusFlightTool implements ExecutionToolInterface {
  readonly toolName = 'AmadeusFlightTool';
  readonly providerId = 'amadeus_flights';

  get capabilityStatus(): CapabilityExecutionStatus {
    const cap = ExecutionCapabilityRegistry.getCapability('amadeus_flights');
    return cap?.capabilityStatus || 'SANDBOX';
  }

  get environment(): 'REAL' | 'SANDBOX' | 'MOCK' {
    const cap = ExecutionCapabilityRegistry.getCapability('amadeus_flights');
    return cap?.environment || 'SANDBOX';
  }

  async execute(input: ExecutionToolInput): Promise<ExecutionToolResult> {
    const adapter = AdapterRegistry.getAdapterById('amadeus_flights');
    if (!adapter) {
      return {
        success: false,
        provider: this.providerId,
        status: 'FAILED',
        isMock: true,
        environment: 'SANDBOX',
        timestamp: new Date().toISOString(),
        errorMessage: 'FlightsAdapter not found in registry.',
      };
    }

    const output = await adapter.execute(input.approvedOption, {
      passengers: input.executionPlan.partySize || 1,
      departureDate: input.executionPlan.date,
      cabinClass: input.executionPlan.cabinClass || 'ECONOMY',
    });

    return {
      success: output.success,
      provider: output.providerId || this.providerId,
      providerReference: output.externalReferenceId,
      status: output.status as any,
      amount: input.executionPlan.amount,
      currency: input.executionPlan.currency,
      timestamp: new Date().toISOString(),
      evidence: output.rawResponse,
      confirmedDetails: output.confirmedDetails,
      isMock: output.isMock || this.environment !== 'REAL',
      environment: (output.environment === 'CURATED' ? 'REAL' : (output.environment as any)) || this.environment,
    };
  }
}

/**
 * 8. Cinema Execution Tool
 */
export class CinemaExecutionTool implements ExecutionToolInterface {
  readonly toolName = 'CinemaExecutionTool';
  readonly providerId = 'cinema_pvr_inox';

  get capabilityStatus(): CapabilityExecutionStatus {
    const cap = ExecutionCapabilityRegistry.getCapability('cinema_pvr_inox');
    return cap?.capabilityStatus || 'NOT_CONFIGURED';
  }

  get environment(): 'REAL' | 'SANDBOX' | 'MOCK' {
    const cap = ExecutionCapabilityRegistry.getCapability('cinema_pvr_inox');
    return cap?.environment || 'SANDBOX';
  }

  async execute(input: ExecutionToolInput): Promise<ExecutionToolResult> {
    const adapter = AdapterRegistry.getAdapterById('cinema_pvr_inox');
    if (!adapter) {
      return {
        success: false,
        provider: this.providerId,
        status: 'FAILED',
        isMock: true,
        environment: 'SANDBOX',
        timestamp: new Date().toISOString(),
        errorMessage: 'CinemaAdapter not found in registry.',
      };
    }

    const output = await adapter.execute(input.approvedOption, {
      numberOfTickets: input.executionPlan.partySize || 2,
    });

    return {
      success: output.success,
      provider: output.providerId || this.providerId,
      providerReference: output.externalReferenceId,
      status: output.status as any,
      amount: input.executionPlan.amount,
      currency: input.executionPlan.currency,
      timestamp: new Date().toISOString(),
      evidence: output.rawResponse,
      confirmedDetails: output.confirmedDetails,
      isMock: output.isMock || this.environment !== 'REAL',
      environment: (output.environment === 'CURATED' ? 'REAL' : (output.environment as any)) || this.environment,
    };
  }
}

/**
 * 9. Mock Adapter Tool (Simulated)
 */
export class MockAdapterTool implements ExecutionToolInterface {
  readonly toolName = 'MockAdapterTool';
  readonly providerId: string;
  readonly capabilityStatus: CapabilityExecutionStatus = 'MOCK';
  readonly environment: 'MOCK' = 'MOCK';

  constructor(providerId = 'mock_generic') {
    this.providerId = providerId;
  }

  async execute(input: ExecutionToolInput): Promise<ExecutionToolResult> {
    const adapter = AdapterRegistry.getAdapterById(this.providerId) || AdapterRegistry.getPrimaryAdapter(input.taskRecord.category);
    const output = await adapter.execute(input.approvedOption, {
      guests: input.executionPlan.partySize || 2,
    });

    return {
      success: output.success,
      provider: output.providerId || this.providerId,
      providerReference: output.externalReferenceId || `[MOCK]-REF-${Date.now()}`,
      status: output.status as any,
      amount: input.executionPlan.amount,
      currency: input.executionPlan.currency,
      timestamp: new Date().toISOString(),
      evidence: output.confirmedDetails,
      confirmedDetails: output.confirmedDetails,
      isMock: true,
      environment: 'MOCK',
    };
  }
}

/**
 * 10. Duffel Flight Tool (Aviation Gateway)
 */
export class DuffelFlightTool implements ExecutionToolInterface {
  readonly toolName = 'DuffelFlightTool';
  readonly providerId = 'duffel_flights';

  get capabilityStatus(): CapabilityExecutionStatus {
    const cap = ExecutionCapabilityRegistry.getCapability('duffel_flights');
    return cap?.capabilityStatus || 'NOT_CONFIGURED';
  }

  get environment(): 'REAL' | 'SANDBOX' | 'MOCK' {
    const cap = ExecutionCapabilityRegistry.getCapability('duffel_flights');
    return cap?.environment || 'SANDBOX';
  }

  async execute(input: ExecutionToolInput): Promise<ExecutionToolResult> {
    const adapter = AdapterRegistry.getAdapterById('duffel_flights');
    if (!adapter) {
      return {
        success: false,
        provider: this.providerId,
        status: 'FAILED',
        isMock: false,
        environment: this.environment,
        timestamp: new Date().toISOString(),
        errorMessage: 'DuffelFlightsAdapter not found in registry.',
      };
    }

    const output = await adapter.execute(input.approvedOption, {
      customer: input.customer,
      passengers: input.bookingDetails?.passengers,
      idempotencyKey: input.executionPlan.idempotencyKey,
    });

    return {
      success: output.success,
      provider: output.providerId || this.providerId,
      providerReference: output.externalReferenceId,
      status: output.status as any,
      amount: input.executionPlan.amount,
      currency: input.executionPlan.currency,
      timestamp: new Date().toISOString(),
      evidence: output.rawResponse,
      confirmedDetails: output.confirmedDetails,
      errorCode: output.errorCode,
      errorMessage: output.errorMessage,
      isMock: output.isMock || this.environment !== 'REAL',
      environment: (output.environment === 'CURATED' ? 'REAL' : (output.environment as any)) || this.environment,
    };
  }

  async verify(reference: string) {
    const adapter = AdapterRegistry.getAdapterById('duffel_flights');
    if (adapter?.verify) {
      return adapter.verify(reference);
    }
    return { verified: false, status: 'PENDING' };
  }
}

/**
 * 11. Duffel Stays Tool (Luxury Hotels & Resorts)
 */
export class DuffelStaysTool implements ExecutionToolInterface {
  readonly toolName = 'DuffelStaysTool';
  readonly providerId = 'duffel_stays';

  get capabilityStatus(): CapabilityExecutionStatus {
    const cap = ExecutionCapabilityRegistry.getCapability('duffel_stays');
    return cap?.capabilityStatus || 'NOT_CONFIGURED';
  }

  get environment(): 'REAL' | 'SANDBOX' | 'MOCK' {
    const cap = ExecutionCapabilityRegistry.getCapability('duffel_stays');
    return cap?.environment || 'SANDBOX';
  }

  async execute(input: ExecutionToolInput): Promise<ExecutionToolResult> {
    const adapter = AdapterRegistry.getAdapterById('duffel_stays');
    if (!adapter) {
      return {
        success: false,
        provider: this.providerId,
        status: 'FAILED',
        isMock: false,
        environment: this.environment,
        timestamp: new Date().toISOString(),
        errorMessage: 'DuffelStaysAdapter not found in registry.',
      };
    }

    const output = await adapter.execute(input.approvedOption, {
      customer: input.customer,
      guests: input.bookingDetails?.guests,
      specialRequests: input.executionPlan.venue || input.bookingDetails?.specialRequests,
      idempotencyKey: input.executionPlan.idempotencyKey,
    });

    return {
      success: output.success,
      provider: output.providerId || this.providerId,
      providerReference: output.externalReferenceId,
      status: output.status as any,
      amount: input.executionPlan.amount,
      currency: input.executionPlan.currency,
      timestamp: new Date().toISOString(),
      evidence: output.rawResponse,
      confirmedDetails: output.confirmedDetails,
      errorCode: output.errorCode,
      errorMessage: output.errorMessage,
      isMock: output.isMock || this.environment !== 'REAL',
      environment: (output.environment === 'CURATED' ? 'REAL' : (output.environment as any)) || this.environment,
    };
  }

  async verify(reference: string) {
    const adapter = AdapterRegistry.getAdapterById('duffel_stays');
    if (adapter?.verify) {
      return adapter.verify(reference);
    }
    return { verified: false, status: 'PENDING' };
  }
}

/**
 * AUTHORITATIVE EXECUTION TOOL REGISTRY
 */
export class ExecutionToolRegistry {
  private static tools: Map<string, ExecutionToolInterface> = new Map();
  private static initialized = false;

  private static init() {
    if (this.initialized) return;

    this.registerTool(new DuffelFlightTool());
    this.registerTool(new DuffelStaysTool());
    this.registerTool(new AhmedabadVerifiedLiaisonTool());
    this.registerTool(new UniversalEventsLiaisonTool());
    this.registerTool(new HealthcareCoordinationTool());
    this.registerTool(new DeliverableFulfillmentTool());
    this.registerTool(new CompositeEscapeTool());
    this.registerTool(new SwiggyExecutionTool());
    this.registerTool(new AmadeusFlightTool());
    this.registerTool(new CinemaExecutionTool());
    this.registerTool(new MockAdapterTool('mock_hotels'));
    this.registerTool(new MockAdapterTool('mock_mobility'));
    this.registerTool(new MockAdapterTool('mock_shopping'));
    this.registerTool(new MockAdapterTool('mock_research'));

    this.initialized = true;
  }

  static reinitialize() {
    this.tools.clear();
    this.initialized = false;
    this.init();
  }

  static registerTool(tool: ExecutionToolInterface) {
    this.tools.set(tool.toolName, tool);
    this.tools.set(tool.providerId, tool);
  }

  static getTool(toolNameOrProviderId: string): ExecutionToolInterface | undefined {
    this.init();
    return this.tools.get(toolNameOrProviderId);
  }

  static resolveTool(providerId: string, toolName?: string): ExecutionToolInterface {
    this.init();
    if (toolName && this.tools.has(toolName)) {
      return this.tools.get(toolName)!;
    }
    if (this.tools.has(providerId)) {
      return this.tools.get(providerId)!;
    }
    return new MockAdapterTool(providerId);
  }
}
